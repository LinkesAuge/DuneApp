import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Poi, PoiType, GridSquare, PoiWithGridSquare } from '../types';
import { Search, Compass, LayoutGrid, List, Edit2, Trash2, ArrowDownUp, SortAsc, SortDesc } from 'lucide-react';
import GridSquareModal from '../components/grid/GridSquareModal';
import GridGallery from '../components/grid/GridGallery';
import PoiCard from '../components/poi/PoiCard';
import PoiEditForm from '../components/poi/PoiEditForm';
import PoiListItem from '../components/poi/PoiListItem';

const PoisPage: React.FC = () => {
  const [pois, setPois] = useState<PoiWithGridSquare[]>([]);
  const [poiTypes, setPoiTypes] = useState<PoiType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedGridSquare, setSelectedGridSquare] = useState<GridSquare | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [selectedPoi, setSelectedPoi] = useState<PoiWithGridSquare | null>(null);
  const [editingPoiId, setEditingPoiId] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ [key: string]: { username: string } }>({});

  // New state for tag-based filtering
  const [selectedTagCategories, setSelectedTagCategories] = useState<Set<string>>(new Set());
  const [selectedTagPoiTypes, setSelectedTagPoiTypes] = useState<Set<string>>(new Set());
  const [selectedTagGrids, setSelectedTagGrids] = useState<Set<string>>(new Set());
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false);

  // New state for enhanced search bar
  const [searchGridCoordinate, setSearchGridCoordinate] = useState<string>('');
  const [searchUser, setSearchUser] = useState<string>('');
  const [searchDateStart, setSearchDateStart] = useState<string>('');
  const [searchDateEnd, setSearchDateEnd] = useState<string>('');

  // State for search bar visibility
  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false); // Collapsed by default

  // State for display mode
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');

  // State for sorting
  type SortField = 'title' | 'categoryName' | 'typeName' | 'createdAt' | 'gridCoordinate' | 'userName' | '';
  const [sortField, setSortField] = useState<SortField>('createdAt'); // Default sort
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc'); // Default sort

  const initialSortOptions: { value: SortField; label: string }[] = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'title', label: 'Title' },
    { value: 'categoryName', label: 'Category' },
    { value: 'typeName', label: 'Type' },
    { value: 'gridCoordinate', label: 'Grid' },
    { value: 'userName', label: 'User' },
  ];
  const sortOptions = [...initialSortOptions].sort((a, b) => a.label.localeCompare(b.label));

  /*useEffect(() => {
    console.log('[PoisPage] State check:', {
      showGallery,
      selectedPoiId: selectedPoi?.id || null,
      selectedPoiTitle: selectedPoi?.title || null,
      selectedGridSquareId: selectedGridSquare?.id || null,
      selectedGridSquareCoordinate: selectedGridSquare?.coordinate || null,
    });
  }, [showGallery, selectedPoi, selectedGridSquare]);*/

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all POIs
        const { data: poisData, error: poisError } = await supabase
          .from('pois')
          .select('*');

        if (poisError) throw poisError;

        // Fetch grid squares for POIs that have grid_square_id
        const gridSquareIds = poisData
          ?.map(poi => poi.grid_square_id)
          .filter(id => id) || [];

        const { data: gridSquaresData, error: gridSquaresError } = await supabase
          .from('grid_squares')
          .select('*')
          .in('id', gridSquareIds);

        if (gridSquaresError) throw gridSquaresError;

        // Create a map of grid squares by ID for easy lookup
        const gridSquaresMap = gridSquaresData?.reduce((acc, square) => {
          acc[square.id] = square;
          return acc;
        }, {} as { [key: string]: GridSquare });

        // Combine POIs with their grid squares
        const poisWithGridSquares: PoiWithGridSquare[] = poisData?.map(poi => ({
          ...poi,
          grid_square: gridSquaresMap?.[poi.grid_square_id]
        })) || [];

        setPois(poisWithGridSquares);

        // Fetch POI types
        const { data: typesData, error: typesError } = await supabase
          .from('poi_types')
          .select('*');

        if (typesError) throw typesError;
        setPoiTypes(typesData || []);

        // Fetch user info
        if (poisData) {
          const userIds = [...new Set(poisData.map(poi => poi.created_by))];
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id, username')
            .in('id', userIds);

          if (userError) throw userError;

          const userInfoMap = userData.reduce((acc, user) => {
            acc[user.id] = { username: user.username };
            return acc;
          }, {} as { [key: string]: { username: string } });

          setUserInfo(userInfoMap);
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group POI types by category
  const typesByCategory = poiTypes.reduce((acc: Record<string, PoiType[]>, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {});

  // Get unique categories
  const categories = Object.keys(typesByCategory).sort();

  const uniqueGridCoordinates = useMemo(() => {
    const grids = new Set<string>();
    pois.forEach(poi => {
      if (poi.grid_square?.coordinate) {
        grids.add(poi.grid_square.coordinate);
      }
    });
    return Array.from(grids).sort((a, b) => a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'}));
  }, [pois]);



  // Filter POIs based on search term and selected filters
  const filteredPois = useMemo(() => {
    let processedPois = pois.filter(poi => {
      const poiType = poiTypes.find(type => type.id === poi.poi_type_id);

      // Text Search (title, description)
      const matchesSearchTerm = 
        searchTerm === '' || 
        poi.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (poi.description && poi.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // Search Bar Grid Coordinate Filter
      const matchesSearchGrid = 
        searchGridCoordinate === '' || 
        poi.grid_square?.coordinate === searchGridCoordinate;

      // Search Bar User Filter
      const creatorUsername = userInfo[poi.created_by]?.username || '';
      const matchesSearchUser = 
        searchUser === '' || 
        creatorUsername.toLowerCase().includes(searchUser.toLowerCase());

      // Search Bar Date Filter
      let matchesSearchDate = true;
      if (searchDateStart || searchDateEnd) {
        try {
          const poiDate = new Date(poi.created_at);
          poiDate.setHours(0,0,0,0); // Normalize to start of day for date-only comparison

          if (searchDateStart) {
            const startDate = new Date(searchDateStart + 'T00:00:00'); // Ensure local timezone for date input
            if (poiDate < startDate) matchesSearchDate = false;
          }
          if (searchDateEnd && matchesSearchDate) {
            const endDate = new Date(searchDateEnd + 'T00:00:00'); // Ensure local timezone for date input
            if (poiDate > endDate) matchesSearchDate = false;
          }
        } catch (e) {
          console.warn("Error parsing date for filtering:", e); 
          // Potentially treat as no match or ignore date filter for this item
        }
      }
      
      // Tag Filters
      const matchesTagGrid = 
        selectedTagGrids.size === 0 || 
        (poi.grid_square?.coordinate && selectedTagGrids.has(poi.grid_square.coordinate));
      
      const matchesTagCategory = 
        selectedTagCategories.size === 0 || 
        (poiType && selectedTagCategories.has(poiType.category));

      const matchesTagPoiType = 
        selectedTagPoiTypes.size === 0 || 
        selectedTagPoiTypes.has(poi.poi_type_id);

      return (
        matchesSearchTerm &&
        matchesSearchGrid &&
        matchesSearchUser &&
        matchesSearchDate &&
        matchesTagGrid &&
        matchesTagCategory &&
        matchesTagPoiType
      );
    });

    // Sorting logic
    if (sortField) {
      processedPois.sort((a, b) => {
        let valA: string | number | null | undefined = null;
        let valB: string | number | null | undefined = null;

        const poiTypeA = poiTypes.find(type => type.id === a.poi_type_id);
        const poiTypeB = poiTypes.find(type => type.id === b.poi_type_id);

        switch (sortField) {
          case 'title':
            valA = a.title.toLowerCase();
            valB = b.title.toLowerCase();
            break;
          case 'categoryName':
            valA = poiTypeA?.category?.toLowerCase();
            valB = poiTypeB?.category?.toLowerCase();
            break;
          case 'typeName':
            valA = poiTypeA?.name?.toLowerCase();
            valB = poiTypeB?.name?.toLowerCase();
            break;
          case 'createdAt':
            valA = new Date(a.created_at).getTime();
            valB = new Date(b.created_at).getTime();
            break;
          case 'gridCoordinate':
            valA = a.grid_square?.coordinate;
            valB = b.grid_square?.coordinate;
            break;
          case 'userName':
            valA = userInfo[a.created_by]?.username?.toLowerCase();
            valB = userInfo[b.created_by]?.username?.toLowerCase();
            break;
        }

        // Handle null or undefined values by pushing them to the end or beginning
        if (valA == null && valB == null) return 0;
        if (valA == null) return sortDirection === 'asc' ? 1 : -1; // nulls last for asc, first for desc for this example
        if (valB == null) return sortDirection === 'asc' ? -1 : 1; // nulls first for asc, last for desc for this example

        if (typeof valA === 'string' && typeof valB === 'string') {
          const comparison = valA.localeCompare(valB, undefined, { numeric: sortField === 'gridCoordinate', sensitivity: 'base' });
          return sortDirection === 'asc' ? comparison : -comparison;
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        return 0;
      });
    }
    return processedPois;
  }, [pois, poiTypes, userInfo, searchTerm, searchGridCoordinate, searchUser, searchDateStart, searchDateEnd, selectedTagGrids, selectedTagCategories, selectedTagPoiTypes, sortField, sortDirection]);

  const getPoiType = (poiTypeId: string) => {
    return poiTypes.find(type => type.id === poiTypeId);
  };

  const handleCardClick = (poi: PoiWithGridSquare) => {
    if (poi.grid_square) {
      setSelectedPoi(poi);
      setSelectedGridSquare(poi.grid_square);
    }
  };

  const handleGalleryOpen = (poi: PoiWithGridSquare) => {
    if (poi.screenshots?.length) {
      setSelectedPoi(poi);
      setGalleryIndex(0);
      setShowGallery(true);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // setSelectedCategory(e.target.value); // This state is no longer primary for filtering
    // setSelectedType(''); 
  };

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setSearchGridCoordinate('');
    setSearchUser('');
    setSearchDateStart('');
    setSearchDateEnd('');
    setSelectedTagCategories(new Set());
    setSelectedTagPoiTypes(new Set());
    setSelectedTagGrids(new Set());
    // Clear legacy category/type state if they were still used elsewhere, though they should be removed
    setSelectedCategory(''); 
    setSelectedType('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this POI?')) return;
    
    try {
      const { error } = await supabase
        .from('pois')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPois(prev => prev.filter(poi => poi.id !== id));
    } catch (err: any) {
      console.error('Error deleting POI:', err);
      setError(err.message);
    }
  };

  const handleUpdate = (updatedPoi: Poi) => {
    setPois(prev => prev.map(poi => poi.id === updatedPoi.id ? {
      ...updatedPoi,
      grid_square: prev.find(p => p.id === updatedPoi.id)?.grid_square
    } : poi));
    setEditingPoiId(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-4">Points of Interest</h1>
        <p className="text-night-700">
          Browse and filter all discovered points of interest in the deep desert.
        </p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 text-red-300 rounded-lg border border-red-700/30">
          {error}
        </div>
      )}
      
      {/* Container for top-left buttons */}
      <div className="flex justify-start items-center gap-3 mb-4 md:mb-6">
        <button
          onClick={() => setIsSearchBarOpen(!isSearchBarOpen)}
          className="btn btn-outline whitespace-nowrap"
        >
          {isSearchBarOpen ? 'Hide' : 'Show'} Search
        </button>
        <button 
          onClick={() => setIsTagFilterOpen(!isTagFilterOpen)}
          className="btn btn-outline whitespace-nowrap"
        >
          {isTagFilterOpen ? 'Hide' : 'Show'} Filters
        </button>

        {/* Sorting Controls */}
        <div className="flex items-center gap-2 ml-auto">
          <label htmlFor="sort-select" className="text-sm text-night-700 whitespace-nowrap">Sort by:</label>
          <select 
            id="sort-select"
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="select select-sm py-1.5"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button 
            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="btn btn-outline btn-sm p-1.5"
            title={`Sort direction: ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            {sortDirection === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
          </button>
        </div>

        {/* Display Mode Toggle */}
        <div className="flex border border-sand-300 rounded-md">
          <button
            onClick={() => setDisplayMode('grid')}
            className={`p-2 transition-colors duration-150 ${displayMode === 'grid' ? 'bg-spice-600 text-white' : 'bg-sand-100 hover:bg-sand-200 text-night-700'}`}
            title="Grid View"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setDisplayMode('list')}
            className={`p-2 transition-colors duration-150 ${displayMode === 'list' ? 'bg-spice-600 text-white' : 'bg-sand-100 hover:bg-sand-200 text-night-700'}`}
            title="List View"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Search and Filters Section - now conditionally rendered without its own button wrapper*/}
      {isSearchBarOpen && (
          <div className="bg-sand-200 rounded-lg shadow-md p-4 border border-sand-300 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Search Term */}
              <div className="lg:col-span-1">
                <label className="label" htmlFor="search">
                  Search Text
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-sand-500" />
                  </div>
                  <input
                    id="search"
                    type="text"
                    placeholder="By title or description"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>

              {/* Search by Grid Coordinate */}
              <div>
                <label className="label" htmlFor="search-grid">
                  Search by Grid
                </label>
                <select
                  id="search-grid"
                  value={searchGridCoordinate}
                  onChange={(e) => setSearchGridCoordinate(e.target.value)}
                  className="select"
                >
                  <option value="">All Grids</option>
                  {uniqueGridCoordinates.map(grid => (
                    <option key={grid} value={grid}>
                      {grid}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search by User */}
              <div>
                <label className="label" htmlFor="search-user">
                  Search by Creator
                </label>
                <input
                  id="search-user"
                  type="text"
                  placeholder="Username"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="input"
                />
              </div>
            </div>
            
            {/* Date Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="search-date-start">
                  Created Date From
                </label>
                <input
                  id="search-date-start"
                  type="date"
                  value={searchDateStart}
                  onChange={(e) => setSearchDateStart(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label" htmlFor="search-date-end">
                  Created Date To
                </label>
                <input
                  id="search-date-end"
                  type="date"
                  value={searchDateEnd}
                  onChange={(e) => setSearchDateEnd(e.target.value)}
                  className="input"
                  min={searchDateStart || undefined} // Prevent end date before start date
                />
              </div>
            </div>
          </div>
      )}

      {/* Collapsible Tag Filters Section - now conditionally rendered without its own button wrapper*/}
      {isTagFilterOpen && (
          <div className="bg-sand-50 p-4 rounded-lg border border-sand-300 shadow-sm mb-6">
            {/* Grid Coordinate Tags */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-sand-800 mb-2">Filter by Grid Tags</h3>
              <div className="flex flex-wrap gap-2">
                {uniqueGridCoordinates.map(grid => (
                  <button
                    key={grid}
                    onClick={() => {
                      const newSet = new Set(selectedTagGrids);
                      if (newSet.has(grid)) newSet.delete(grid);
                      else newSet.add(grid);
                      setSelectedTagGrids(newSet);
                    }}
                    className={`btn text-xs px-2 py-1 ${selectedTagGrids.has(grid) ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {grid}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Tags */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-sand-800 mb-2">Filter by Category Tags</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => {
                      const newSet = new Set(selectedTagCategories);
                      if (newSet.has(category)) newSet.delete(category);
                      else newSet.add(category);
                      setSelectedTagCategories(newSet);
                      // Optional: Clear selected types if their category is deselected (could be complex with multi-select cats)
                    }}
                    className={`btn text-xs px-2 py-1 ${selectedTagCategories.has(category) ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* POI Type Tags (grouped by category) */}
            <div>
              <h3 className="text-sm font-semibold text-sand-800 mb-2">Filter by Type Tags</h3>
              {categories.map(category => {
                const typesInCategory = poiTypes
                  .filter(pt => pt.category === category)
                  .sort((a, b) => a.name.localeCompare(b.name));
                if (typesInCategory.length === 0) return null;
                return (
                  <div key={category} className="mb-3">
                    <h4 className="text-xs font-medium text-sand-600 mb-1">{category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {typesInCategory.map(type => (
                        <button
                          key={type.id}
                          onClick={() => {
                            const newSet = new Set(selectedTagPoiTypes);
                            if (newSet.has(type.id)) newSet.delete(type.id);
                            else newSet.add(type.id);
                            setSelectedTagPoiTypes(newSet);
                          }}
                          className={`btn text-xs px-2 py-1 ${selectedTagPoiTypes.has(type.id) ? 'btn-primary' : 'btn-outline'}`}
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
                    <h4 className="text-xs font-medium text-sand-600 mb-1">Uncategorized</h4>
                    <div className="flex flex-wrap gap-2">
                      {uncategorizedTypes.map(type => (
                        <button
                          key={type.id}
                          onClick={() => {
                            const newSet = new Set(selectedTagPoiTypes);
                            if (newSet.has(type.id)) newSet.delete(type.id);
                            else newSet.add(type.id);
                            setSelectedTagPoiTypes(newSet);
                          }}
                          className={`btn text-xs px-2 py-1 ${selectedTagPoiTypes.has(type.id) ? 'btn-primary' : 'btn-outline'}`}
                        >
                          {type.name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()} 
            </div>
            
            <div className="mt-4 border-t border-sand-300 pt-4">
              <button 
                onClick={handleClearAllFilters}
                className="btn btn-danger text-xs w-full md:w-auto"
              >
                Clear All Filters
              </button>
            </div>
          </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spice-600"></div>
        </div>
      ) : filteredPois.length === 0 ? (
        <div className="text-center py-16 text-sand-600">
          <Compass className="mx-auto text-sand-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold mb-2">No Points of Interest Found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className={`gap-6 ${displayMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col'}`}>
          {filteredPois.map(poi => {
            if (editingPoiId === poi.id) {
              return (
                <PoiEditForm
                  key={poi.id}
                  poi={poi}
                  poiTypes={poiTypes}
                  onCancel={() => setEditingPoiId(null)}
                  onUpdate={handleUpdate}
                />
              );
            }

            if (displayMode === 'list') {
              return (
                <PoiListItem
                  key={poi.id}
                  poi={poi}
                  poiType={getPoiType(poi.poi_type_id)}
                  gridSquareCoordinate={poi.grid_square?.coordinate}
                  creator={userInfo[poi.created_by]}
                  onClick={() => handleCardClick(poi)}
                  onImageClick={() => handleGalleryOpen(poi)}
                  onEdit={() => setEditingPoiId(poi.id)}
                  onDelete={() => handleDelete(poi.id)}
                />
              );
            }
            
            return (
              <PoiCard
                key={poi.id}
                poi={poi}
                poiType={getPoiType(poi.poi_type_id)}
                gridSquareCoordinate={poi.grid_square?.coordinate}
                creator={userInfo[poi.created_by]}
                onClick={() => handleCardClick(poi)}
                onImageClick={() => handleGalleryOpen(poi)}
                onEdit={() => setEditingPoiId(poi.id)}
                onDelete={() => handleDelete(poi.id)}
              />
            );
          })}
        </div>
      )}

      {/* Grid Square Modal */}
      {selectedGridSquare && (
        <GridSquareModal
          square={selectedGridSquare}
          onClose={() => setSelectedGridSquare(null)}
          onUpdate={(updatedSquare) => {
            setSelectedGridSquare(updatedSquare);
            if (selectedPoi && selectedPoi.grid_square_id === updatedSquare.id) {
              setSelectedPoi(prevPoi => prevPoi ? { ...prevPoi, grid_square: updatedSquare } : null);
            }
          }}
          onImageClick={(gridSquare) => {
            // When clicking the grid square's screenshot in the modal,
            // we should open a gallery for the grid square's screenshot, not the POI's screenshots
            if (gridSquare.screenshot_url) {
              console.log('[PoisPage] GridSquareModal onImageClick: Opening gallery for grid square screenshot.', {
                gridSquareCoordinate: gridSquare.coordinate,
                screenshotUrl: gridSquare.screenshot_url
              });
              
              // Create a temporary POI-like structure for the gallery to show the grid square screenshot
              const tempPoi = {
                id: `grid-${gridSquare.id}`,
                title: `Grid Square ${gridSquare.coordinate}`,
                description: `Screenshot of grid square ${gridSquare.coordinate}`,
                created_at: gridSquare.upload_date,
                created_by: gridSquare.uploaded_by || '',
                grid_square: gridSquare,
                screenshots: [{
                  id: gridSquare.id,
                  url: gridSquare.screenshot_url,
                  uploaded_by: gridSquare.uploaded_by || '',
                  upload_date: gridSquare.upload_date
                }]
              };
              
              setSelectedPoi(tempPoi as any); // Cast to satisfy TypeScript
              setShowGallery(true);
              setGalleryIndex(0);
            } else {
              console.warn('[PoisPage] GridSquareModal onImageClick: No screenshot available for grid square.', {
                gridSquareCoordinate: gridSquare.coordinate
              });
            }
          }}
          onPoiGalleryOpen={handleGalleryOpen}
        />
      )}

      {/* Screenshot Gallery Modal */}
      {showGallery && selectedPoi?.screenshots && (
        <GridGallery
          squares={selectedPoi.screenshots.map(s => ({
            id: s.id,
            coordinate: selectedPoi.grid_square?.coordinate || 'N/A',
            screenshot_url: s.url,
            is_explored: false,
            uploaded_by: s.uploaded_by,
            upload_date: s.upload_date,
          }))}
          initialIndex={galleryIndex}
          onClose={() => setShowGallery(false)}
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

export default PoisPage;