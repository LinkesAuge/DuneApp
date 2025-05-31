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
      
              // GridContainer: Refetching POIs after add
      const { data: poisData, error: poisError } = await supabase
        .from('pois')
        .select('*');
      if (poisError) throw poisError;
      
              // GridContainer: Fetched POIs
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
    <div className="min-h-screen relative">
      {/* Main background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(/images/main-bg.jpg)`
        }}
      />
      
      {/* Dark overlay for better contrast */}
      {/* <div className="absolute inset-0 bg-slate-950/70" /> */}

      <div className="relative container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 group relative">
          {/* Multi-layer background system */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
          <div className="absolute inset-0 bg-gradient-to-b from-amber-600/10 via-amber-500/5 to-transparent rounded-lg" />
          
          {/* Interactive purple overlay */}
          <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out bg-gradient-to-b from-violet-600/10 via-violet-700/5 to-transparent" />
          
          <div className="relative p-6 rounded-lg border border-amber-400/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-light tracking-wider text-amber-200 mb-2"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  Deep Desert Grid Map
                </h1>
                <div className="flex items-center gap-2">
                  <Map className="text-amber-400" size={20} />
                  <p className="text-amber-300/80 font-light tracking-wide">
                    Exploration progress: {exploredSquares} of {totalSquares} squares ({(explorationProgress).toFixed(1)}%)
                  </p>
                </div>
              </div>
              <div className="text-right text-sm text-amber-300/70">
                <div className="mb-1 font-light tracking-wide">💡 <strong className="text-amber-300">Tip:</strong> Click any grid square to view details</div>
                <div className="flex items-center justify-end gap-2">
                  <ExternalLink className="w-4 h-4 text-amber-400" />
                  <span className="font-light tracking-wide">Individual grid pages now available</span>
                </div>
              </div>
            </div>
            
            {/* Enhanced Exploration Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-amber-300/80 font-light tracking-wide">Grid Coverage</span>
                <span className="font-light text-amber-200 tracking-wide">
                  {(explorationProgress).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-800/60 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500 ease-out shadow-lg" 
                  style={{ width: `${explorationProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Collapsible Highlight and Filter UI */}
        <div className="mb-6 group relative">
          {/* Multi-layer background system */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
          
          {/* Interactive purple overlay */}
          <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out bg-gradient-to-b from-violet-600/10 via-violet-700/5 to-transparent" />
          
          <div className="relative rounded-lg border border-amber-400/20 overflow-hidden">
            <button 
              onClick={() => setIsHighlightFilterOpen(!isHighlightFilterOpen)}
              className="w-full flex justify-between items-center p-4 text-left text-amber-200 hover:bg-slate-800/50 transition-all duration-300 focus:outline-none"
              aria-expanded={isHighlightFilterOpen}
              aria-controls="highlight-filter-section"
            >
              <span className="font-light tracking-wide text-amber-200"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                Highlight and Filter Options
              </span>
              {isHighlightFilterOpen ? 
                <ChevronUp size={20} className="text-amber-400" /> : 
                <ChevronDown size={20} className="text-amber-400" />
              }
            </button>

            {isHighlightFilterOpen && (
              <div id="highlight-filter-section" className="border-t border-amber-400/20 p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-light text-amber-200 mb-3 tracking-wide"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    Highlight and Filter by Category:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {uniqueCategories.map(category => (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`px-3 py-1.5 text-xs font-light tracking-wide rounded-lg border transition-all duration-300 ${
                          selectedCategories.has(category) 
                            ? 'bg-amber-500/20 text-amber-200 border-amber-400/40 shadow-lg' 
                            : 'bg-slate-800/40 text-amber-300/70 border-slate-600/50 hover:bg-slate-700/50 hover:border-amber-400/30'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-light text-amber-200 mb-3 tracking-wide"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    Highlight and Filter by POI Type:
                  </h3>
                  {uniqueCategories.map(category => {
                    const typesInCategory = poiTypes
                      .filter(pt => pt.category === category)
                      .sort((a, b) => a.name.localeCompare(b.name));
                    if (typesInCategory.length === 0) return null;
                    return (
                      <div key={category} className="mb-4">
                        <h4 className="text-xs font-light text-amber-300/70 mb-2 pl-1 tracking-wide">{category}</h4>
                        <div className="flex flex-wrap gap-2">
                          {typesInCategory.map(type => (
                            <button
                              key={type.id}
                              onClick={() => togglePoiType(type.id)}
                              className={`px-3 py-1.5 text-xs font-light tracking-wide rounded-lg border transition-all duration-300 ${
                                selectedPoiTypeIds.has(type.id) 
                                  ? 'bg-amber-500/20 text-amber-200 border-amber-400/40 shadow-lg' 
                                  : 'bg-slate-800/40 text-amber-300/70 border-slate-600/50 hover:bg-slate-700/50 hover:border-amber-400/30'
                              }`}
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
                      <div key="uncategorized-types" className="mb-4">
                        <h4 className="text-xs font-light text-amber-300/70 mb-2 pl-1 tracking-wide">Uncategorized</h4>
                        <div className="flex flex-wrap gap-2">
                          {uncategorizedTypes.map(type => (
                            <button
                              key={type.id}
                              onClick={() => togglePoiType(type.id)}
                              className={`px-3 py-1.5 text-xs font-light tracking-wide rounded-lg border transition-all duration-300 ${
                                selectedPoiTypeIds.has(type.id) 
                                  ? 'bg-amber-500/20 text-amber-200 border-amber-400/40 shadow-lg' 
                                  : 'bg-slate-800/40 text-amber-300/70 border-slate-600/50 hover:bg-slate-700/50 hover:border-amber-400/30'
                              }`}
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
                  <div className="mt-6 pt-4 border-t border-amber-400/20">
                      <button 
                          onClick={clearAllFilters}
                          className="w-full md:w-auto bg-red-600/20 hover:bg-red-500/30 text-red-300 border border-red-400/40 hover:border-red-300/60 px-4 py-2 rounded-lg text-sm font-light tracking-wide transition-all duration-300 flex items-center justify-center gap-2"
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <div className="group relative">
            {/* Multi-layer background system for grid map */}
            {/* <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
            <div className="absolute inset-0 bg-gradient-to-b from-amber-600/10 via-amber-500/5 to-transparent rounded-lg" /> */}
            
            {/* Interactive purple overlay */}
            {/* <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out bg-gradient-to-b from-violet-600/10 via-violet-700/5 to-transparent" /> */}
            
            <div className="relative rounded-lg border border-amber-400/20 overflow-hidden p-2">
              {/* Grid coordinates - top (numbers) */}
              <div className="flex border-b border-amber-400/30">
                <div className="w-10 h-10 bg-slate-800/50 flex items-center justify-center font-light text-amber-200 border-r border-amber-400/30"></div>
                {Array.from({ length: GRID_SIZE }, (_, i) => (
                  <div 
                    key={`top-${i + 1}`} 
                    className="w-full h-10 flex-1 flex items-center justify-center font-light text-amber-200 border-l border-amber-400/30"
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
                    <div className="w-10 flex-shrink-0 bg-slate-800/50 flex items-center justify-center font-light text-amber-200 border-t border-amber-400/30 border-r border-amber-400/30 aspect-square">
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
                          className="relative flex-1 aspect-square group/square"
                        >
                          <GridSquare 
                            square={square}
                            poisToDisplay={poisForThisSquare} // Updated prop
                            poiTypes={poiTypes} // Pass all poiTypes for lookup within GridSquare
                            isHighlighted={highlightedGridSquareIds.has(square.id)} // New prop
                            onClick={() => handleSquareClick(square)}
                            onImageClick={() => {}} // Disabled - no gallery functionality
                          />
                          
                          {/* Enhanced Hover overlay with "View Details" button - properly scoped */}
                          <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover/square:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none z-30">
                            <div className="bg-amber-400 text-slate-900 px-3 py-2 rounded-lg shadow-xl flex items-center gap-2 font-medium tracking-wide"
                                 style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                              <ExternalLink className="w-4 h-4" />
                              View Details
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div 
                          key={`square-${coordinate}`}
                          className="border border-amber-400/30 bg-slate-800/30 flex items-center justify-center text-amber-300/70 cursor-pointer hover:bg-slate-700/50 hover:text-amber-200 transition-all duration-300 relative flex-1 aspect-square overflow-hidden group/empty"
                          onClick={() => navigate(`/deep-desert/grid/${coordinate}`)}
                        >
                          <span className="font-light tracking-wide">{coordinate}</span>
                          
                          {/* Enhanced Hover overlay for empty squares - properly scoped */}
                          <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover/empty:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="bg-amber-400 text-slate-900 px-3 py-2 rounded-lg shadow-xl flex items-center gap-2 font-medium text-sm tracking-wide"
                                 style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
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
            onExplorationStatusChanged={() => {
              // Trigger a re-fetch of grid squares to update exploration status
              fetchInitialData();
            }}
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
    </div>
  );
};

export default GridContainer;