import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { GridSquare as GridSquareType, Poi, PoiType } from '../../types';
import GridSquare from './GridSquare';
import GridSquareModal from './GridSquareModal';
import GridGallery from './GridGallery';
import { Map, ChevronDown, ChevronUp, FilterX, ExternalLink } from 'lucide-react';

const GRID_SIZE = 9;

const GridContainer: React.FC = () => {
  const navigate = useNavigate();
  const [gridSquares, setGridSquares] = useState<GridSquareType[]>([]);
  const [selectedSquare, setSelectedSquare] = useState<GridSquareType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [pois, setPois] = useState<Poi[]>([]);
  const [poiTypes, setPoiTypes] = useState<PoiType[]>([]);

  // Updated state for multi-select filters
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedPoiTypeIds, setSelectedPoiTypeIds] = useState<Set<string>>(new Set());
  const [isHighlightFilterOpen, setIsHighlightFilterOpen] = useState<boolean>(false);

  const fetchInitialData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch grid squares, POIs, and POI types in parallel
      const [gridSquaresResult, poisResult, poiTypesResult] = await Promise.all([
        supabase
          .from('grid_squares')
          .select('*')
          .order('coordinate', { ascending: true }),
        supabase
          .from('pois')
          .select('*'),
        supabase
          .from('poi_types')
          .select('*')
      ]);

      if (gridSquaresResult.error) throw gridSquaresResult.error;
      if (poisResult.error) throw poisResult.error;
      if (poiTypesResult.error) throw poiTypesResult.error;

      const currentSquares = gridSquaresResult.data || [];
      setGridSquares(currentSquares);
      setPois(poisResult.data || []);
      setPoiTypes(poiTypesResult.data || []);

      // Calculate missing squares
      const existingCoordinates = new Set(currentSquares.map(square => square.coordinate));
      const missingSquares: Partial<GridSquareType>[] = [];

      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const letter = String.fromCharCode(65 + (GRID_SIZE - 1 - y));
          const number = x + 1;
          const coordinate = `${letter}${number}`;

          if (!existingCoordinates.has(coordinate)) {
            missingSquares.push({
              coordinate,
              is_explored: false,
              screenshot_url: null,
            });
          }
        }
      }

      // Insert missing squares if needed
      if (missingSquares.length > 0) {
        const { data: newSquares, error: upsertError } = await supabase
          .from('grid_squares')
          .upsert(
            missingSquares,
            {
              onConflict: 'coordinate',
              ignoreDuplicates: true,
            }
          )
          .select('id, coordinate, screenshot_url, is_explored, uploaded_by, upload_date');

        if (upsertError) {
          console.warn('Error upserting grid squares:', upsertError);
        } else if (newSquares) {
          setGridSquares(prev => {
            const updatedSquares = [...prev];
            newSquares.forEach(newSquare => {
              const existingIndex = updatedSquares.findIndex(s => s.coordinate === newSquare.coordinate);
              if (existingIndex === -1) {
                updatedSquares.push(newSquare);
              }
            });
            return updatedSquares.sort((a, b) => a.coordinate.localeCompare(b.coordinate));
          });
        }
      }
    } catch (err: any) {
      console.error('Error fetching initial data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchPoisOnly = async () => {
    try {
      // Add a small delay to ensure database transaction is committed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('[GridContainer] Refetching POIs after add...');
      const { data: poisData, error: poisError } = await supabase
        .from('pois')
        .select('*');
      if (poisError) throw poisError;
      
      console.log('[GridContainer] Fetched POIs:', poisData?.length || 0);
      setPois(poisData || []);
      
      // Force a re-render by updating a refresh key
      setError(null); // This will trigger a state update and force re-render
    } catch (err: any) {
      console.error('Error fetching POIs after add:', err);
      setError('Failed to update POI list');
    }
  };

  const handleSquareClick = (square: GridSquareType) => {
    // Navigate directly to the individual grid page
    navigate(`/deep-desert/grid/${square.coordinate}`);
  };

  const handleSquareModalOpen = (square: GridSquareType) => {
    // For cases where we still want to open the modal (e.g., right-click context menu)
    setSelectedSquare(square);
  };

  const handleGalleryOpen = (square: GridSquareType) => {
    if (square.screenshot_url) {
      // Create a temporary POI-like structure for the gallery
      const tempPoi = {
        id: `grid-${square.id}`,
        title: `Grid Square ${square.coordinate}`,
        description: `Screenshot of grid square ${square.coordinate}`,
        created_at: square.upload_date || new Date().toISOString(),
        created_by: square.uploaded_by || '',
        screenshots: [{
          id: square.id,
          url: square.screenshot_url,
          uploaded_by: square.uploaded_by || '',
          upload_date: square.upload_date || new Date().toISOString()
        }]
      };
      
      setSelectedPoi(tempPoi as any);
      setGalleryIndex(0); // Always start at index 0 for single screenshot
      setShowGallery(true);
    }
  };

  const handlePoiGalleryOpen = (poi: Poi) => {
    if (poi.screenshots?.length) {
      setSelectedPoi(poi);
      setGalleryIndex(0);
      setShowGallery(true);
    }
  };

  // Calculate exploration progress
  const exploredSquares = gridSquares.filter(square => square.is_explored).length;
  const totalSquares = GRID_SIZE * GRID_SIZE;
  const explorationProgress = totalSquares > 0 ? (exploredSquares / totalSquares) * 100 : 0;

  // Get all squares with screenshots for the gallery
  const squaresWithScreenshots = gridSquares.filter(square => square.screenshot_url);

  // Derive POIs to display based on filters and the grid squares to highlight
  const { poisToDisplayOnMap, highlightedGridSquareIds } = useMemo(() => {
    if (selectedCategories.size === 0 && selectedPoiTypeIds.size === 0) {
      return { poisToDisplayOnMap: pois, highlightedGridSquareIds: new Set<string>() };
    }

    let candidatePois = pois;

    if (selectedCategories.size > 0) {
      const typesInCategory = new Set<string>();
      poiTypes.forEach(pt => {
        if (selectedCategories.has(pt.category)) {
          typesInCategory.add(pt.id);
        }
      });
      candidatePois = candidatePois.filter(p => typesInCategory.has(p.poi_type_id));
    }

    if (selectedPoiTypeIds.size > 0) {
      candidatePois = candidatePois.filter(p => selectedPoiTypeIds.has(p.poi_type_id));
    }

    const currentHighlightedGridSquareIds = new Set<string>();
    candidatePois.forEach(p => currentHighlightedGridSquareIds.add(p.grid_square_id));

    return { poisToDisplayOnMap: candidatePois, highlightedGridSquareIds: currentHighlightedGridSquareIds };
  }, [pois, poiTypes, selectedCategories, selectedPoiTypeIds]);

  const uniqueCategories = Array.from(new Set(poiTypes.map(pt => pt.category))).sort();

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
    // When a category is toggled, it might be good to clear POI type selections 
    // if the selected types are no longer relevant, or leave them as is.
    // For now, let's clear them to ensure relevance.
    setSelectedPoiTypeIds(new Set()); 
  };

  const togglePoiType = (typeId: string) => {
    setSelectedPoiTypeIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(typeId)) {
        newSet.delete(typeId);
      } else {
        newSet.add(typeId);
      }
      return newSet;
    });
  };

  const clearAllFilters = () => {
    setSelectedCategories(new Set());
    setSelectedPoiTypeIds(new Set());
    // Optionally close the filter section when clearing
    // setIsHighlightFilterOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Deep Desert Grid Map</h1>
            <div className="flex items-center">
              <Map className="text-spice-600 mr-2" size={20} />
              <p className="text-night-700">
                Exploration progress: {exploredSquares} of {totalSquares} squares ({Math.round(explorationProgress)}%)
              </p>
            </div>
          </div>
          <div className="text-right text-sm text-sand-600">
            <div className="mb-1">💡 <strong>Tip:</strong> Click any grid square to view details</div>
            <div className="flex items-center justify-end gap-2">
              <ExternalLink className="w-4 h-4" />
              <span>Individual grid pages now available</span>
            </div>
          </div>
        </div>
        
        <div className="w-full bg-sand-200 rounded-full h-2.5 mb-6">
          <div 
            className="bg-spice-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${explorationProgress}%` }}
          ></div>
        </div>

        {/* Collapsible Highlight and Filter UI */}
        <div className="mb-6 bg-sand-100 rounded-lg shadow">
          <button 
            onClick={() => setIsHighlightFilterOpen(!isHighlightFilterOpen)}
            className="w-full flex justify-between items-center p-4 text-left text-night-700 hover:bg-sand-200 rounded-t-lg focus:outline-none"
            aria-expanded={isHighlightFilterOpen}
            aria-controls="highlight-filter-section"
          >
            <span className="font-semibold">Highlight and filter Options</span>
            {isHighlightFilterOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {isHighlightFilterOpen && (
            <div id="highlight-filter-section" className="bg-sand-50 p-4 border-t border-sand-300 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-sand-800 mb-2">Highlight and filter by Category:</h3>
                <div className="flex flex-wrap gap-2">
                  {uniqueCategories.map(category => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`btn text-xs px-2 py-1 ${selectedCategories.has(category) ? 'btn-primary' : 'btn-outline'}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-sand-800 mb-2">Highlight and filter by POI Type:</h3>
                {uniqueCategories.map(category => {
                  const typesInCategory = poiTypes
                    .filter(pt => pt.category === category)
                    .sort((a, b) => a.name.localeCompare(b.name));
                  if (typesInCategory.length === 0) return null;
                  return (
                    <div key={category} className="mb-3">
                      <h4 className="text-xs font-medium text-sand-600 mb-1 pl-1">{category}</h4>
                      <div className="flex flex-wrap gap-2">
                        {typesInCategory.map(type => (
                          <button
                            key={type.id}
                            onClick={() => togglePoiType(type.id)}
                            className={`btn text-xs px-2 py-1 ${selectedPoiTypeIds.has(type.id) ? 'btn-primary' : 'btn-outline'}`}
                          >
                            {type.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {/* Section for Uncategorized POI Types */}
                {(() => {
                  const uncategorizedTypes = poiTypes
                    .filter(pt => !pt.category || pt.category.trim() === '')
                    .sort((a,b) => a.name.localeCompare(b.name));
                  if (uncategorizedTypes.length === 0) return null;
                  return (
                    <div key="uncategorized-types" className="mb-3">
                      <h4 className="text-xs font-medium text-sand-600 mb-1 pl-1">Uncategorized</h4>
                      <div className="flex flex-wrap gap-2">
                        {uncategorizedTypes.map(type => (
                          <button
                            key={type.id}
                            onClick={() => togglePoiType(type.id)}
                            className={`btn text-xs px-2 py-1 ${selectedPoiTypeIds.has(type.id) ? 'btn-primary' : 'btn-outline'}`}
                          >
                            {type.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()} 
              </div>
              
              {(selectedCategories.size > 0 || selectedPoiTypeIds.size > 0) && (
                <div className="mt-4 border-t border-sand-200 pt-4">
                    <button 
                        onClick={clearAllFilters}
                        className="btn btn-danger text-xs w-full md:w-auto"
                    >
                        <FilterX size={14} /> Clear Highlights & Filters
                    </button>
                </div>
              )}
            </div>
          )}
        </div>


      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          Error: {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spice-600"></div>
        </div>
      ) : (
        <div className="relative bg-sand-300 rounded-lg overflow-visible shadow-lg">
          {/* Grid coordinates - top (numbers) */}
          <div className="flex border-b border-dotted border-orange-700">
            <div className="w-10 h-10 bg-sand-400 flex items-center justify-center font-bold text-night-700 border-r border-dotted border-orange-700"></div>
            {Array.from({ length: GRID_SIZE }, (_, i) => (
              <div 
                key={`top-${i + 1}`} 
                className="w-full h-10 flex-1 flex items-center justify-center font-bold text-night-700 border-l border-dotted border-orange-700"
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Grid with side coordinates (letters) */}
          <div className="grid-container">
            {Array.from({ length: GRID_SIZE }, (_, y) => (
              <div key={`row-${y}`} className="flex">
                {/* Side coordinate (letter) */}
                <div className="w-10 flex-shrink-0 bg-sand-400 flex items-center justify-center font-bold text-night-700 border-t border-dotted border-orange-700 border-r border-dotted border-orange-700 aspect-square">
                  {String.fromCharCode(65 + (GRID_SIZE - 1 - y))}
                </div>

                {/* Grid squares for this row */}
                {Array.from({ length: GRID_SIZE }, (_, x) => {
                  const letter = String.fromCharCode(65 + (GRID_SIZE - 1 - y));
                  const number = x + 1;
                  const coordinate = `${letter}${number}`;
                  const square = gridSquares.find(s => s.coordinate === coordinate);
                  // const squarePois = square ? pois.filter(p => p.grid_square_id === square.id) : [];
                  // Filter pois for this specific square based on the global filter
                  const poisForThisSquare = square 
                    ? poisToDisplayOnMap.filter(p => p.grid_square_id === square.id) 
                    : [];

                  return square ? (
                    <div 
                      key={`square-${coordinate}-${poisForThisSquare.length}`}
                      className="relative group flex-1 aspect-square"
                    >
                      <GridSquare 
                        square={square}
                        poisToDisplay={poisForThisSquare} // Updated prop
                        poiTypes={poiTypes} // Pass all poiTypes for lookup within GridSquare
                        isHighlighted={highlightedGridSquareIds.has(square.id)} // New prop
                        onClick={() => handleSquareClick(square)}
                        onImageClick={() => square.screenshot_url && handleGalleryOpen(square)}
                      />
                      
                      {/* Hover overlay with "View Details" button */}
                      <div className="absolute inset-0 bg-night-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none z-30">
                        <div className="bg-white text-night-800 px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 font-medium">
                          <ExternalLink className="w-4 h-4" />
                          View Details
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div 
                      key={`square-${coordinate}`}
                      className="border border-dotted border-orange-700 bg-sand-200 flex items-center justify-center text-sand-600 cursor-pointer hover:bg-sand-300 transition-colors group relative flex-1 aspect-square overflow-hidden"
                      onClick={() => navigate(`/deep-desert/grid/${coordinate}`)}
                    >
                      <span className="font-medium">{coordinate}</span>
                      
                      {/* Hover overlay for empty squares */}
                      <div className="absolute inset-0 bg-night-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <div className="bg-white text-night-800 px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 font-medium text-sm">
                          <ExternalLink className="w-4 h-4" />
                          Explore Square
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedSquare && (
        <GridSquareModal 
          square={selectedSquare} 
          onClose={() => setSelectedSquare(null)} 
          onUpdate={(updatedSquare) => {
            setGridSquares(prev => 
              prev.map(s => s.id === updatedSquare.id ? updatedSquare : s)
            );
            // Fetch POIs if the updated square affects the POI list (e.g. explored status reveals new ones)
            // For a new POI added within the modal, onPoiSuccessfullyAdded handles it directly.
            // However, if onUpdate *could* change POI visibility, consider calling fetchPois() here too.
          }}
          onImageClick={(square) => handleGalleryOpen(square)}
          onPoiGalleryOpen={handlePoiGalleryOpen}
          onPoiSuccessfullyAdded={fetchPoisOnly} // Pass the new callback
        />
      )}

      {showGallery && selectedPoi?.screenshots && (
        <GridGallery
          squares={selectedPoi.screenshots.map(s => ({
            id: s.id,
            screenshot_url: s.url,
            uploaded_by: s.uploaded_by,
            upload_date: s.upload_date,
            coordinate: selectedPoi.id.startsWith('grid-') ? selectedPoi.title.replace('Grid Square ', '') : selectedSquare?.coordinate || '',
            is_explored: false,
          }))}
          initialIndex={galleryIndex}
          onClose={() => {
            setShowGallery(false);
            setSelectedPoi(null);
          }}
          poiInfo={{
            title: selectedPoi.title,
            description: selectedPoi.description,
            created_at: selectedPoi.created_at,
            created_by: selectedPoi.created_by,
          }}
        />
      )}
    </div>
  );
};

export default GridContainer;