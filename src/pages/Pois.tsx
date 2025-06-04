import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { fetchPrivacyFilteredPois } from '../lib/poiPrivacy';
import { Poi, PoiType, GridSquare, PoiWithGridSquare, MapType } from '../types';
import { Search, Compass, LayoutGrid, List, Edit2, Trash2, ArrowDownUp, SortAsc, SortDesc, Image as ImageIconLucide, Share2, Bookmark, MessageSquare, MapPin, Tag } from 'lucide-react';
import GridGallery from '../components/grid/GridGallery';
import POIEditModal from '../components/hagga-basin/POIEditModal';
import POICard from '../components/common/POICard';
import POIPreviewCard from '../components/common/POIPreviewCard';
import DiamondIcon from '../components/common/DiamondIcon';
import { useAuth } from '../components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import POIFilters from '../components/filters/POIFilters';
import { ConfirmationModal } from '../components/shared/ConfirmationModal';

const isPoiTypeIconUrl = (iconValue: string | null | undefined): iconValue is string => 
  typeof iconValue === 'string' && (iconValue.startsWith('http://') || iconValue.startsWith('https://'));

const PoisPage: React.FC = () => {
  const { user } = useAuth();
  const [pois, setPois] = useState<PoiWithGridSquare[]>([]);
  const [poiTypes, setPoiTypes] = useState<PoiType[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedMapType, setSelectedMapType] = useState<MapType | 'all'>('all');
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);
  const [selectedPoi, setSelectedPoi] = useState<PoiWithGridSquare | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [editingPoiId, setEditingPoiId] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ [key: string]: { username: string; display_name?: string | null; custom_avatar_url?: string | null; discord_avatar_url?: string | null; use_discord_avatar?: boolean } }>({});

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

  const navigate = useNavigate();

  // Confirmation modal state for POI deletion
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [poiToDelete, setPoiToDelete] = useState<PoiWithGridSquare | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch POIs with proper privacy filtering
        const poisResult = await fetchPrivacyFilteredPois(user);
        const poisData = poisResult.items; // Extract the items array

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

        // Fetch custom icons
    

        // Extract user info from POI data (profiles are now included in the query)
        if (poisData) {
          const userInfoMap = poisData.reduce((acc, poi) => {
            if (poi.created_by && poi.profiles) {
              acc[poi.created_by] = {
                username: poi.profiles.username,
                display_name: poi.profiles.display_name,
                custom_avatar_url: poi.profiles.custom_avatar_url,
                discord_avatar_url: poi.profiles.discord_avatar_url,
                use_discord_avatar: poi.profiles.use_discord_avatar
              };
            }
              return acc;
          }, {} as { [key: string]: { username: string; display_name?: string | null; custom_avatar_url?: string | null; discord_avatar_url?: string | null; use_discord_avatar?: boolean } });

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
  }, [user]);



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

      // Map Type Filter
      const matchesMapType = 
        selectedMapType === 'all' || 
        poi.map_type === selectedMapType;

      return (
        matchesSearchTerm &&
        matchesSearchGrid &&
        matchesSearchUser &&
        matchesSearchDate &&
        matchesTagGrid &&
        matchesTagCategory &&
        matchesTagPoiType &&
        matchesMapType
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
  }, [pois, poiTypes, userInfo, searchTerm, searchGridCoordinate, searchUser, searchDateStart, searchDateEnd, selectedTagGrids, selectedTagCategories, selectedTagPoiTypes, selectedMapType, sortField, sortDirection]);

  const getPoiType = (poiTypeId: string) => {
    return poiTypes.find(type => type.id === poiTypeId);
  };

  const handleCardClick = (poi: PoiWithGridSquare) => {
    setSelectedPoiId(poi.id);
  };

  const handleGalleryOpen = (poi: PoiWithGridSquare, index?: number) => {
    if (poi.screenshots?.length) {
      setSelectedPoi(poi);
      setGalleryIndex(index !== undefined && index < poi.screenshots.length ? index : 0); // Use provided index or default to 0
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
    setSelectedMapType('all');
    setSelectedTagCategories(new Set());
    setSelectedTagPoiTypes(new Set());
    setSelectedTagGrids(new Set());
    // Clear legacy category/type state if they were still used elsewhere, though they should be removed
    setSelectedCategory(''); 
    setSelectedType('');
  };

  // Handle POI deletion request - shows confirmation first
  const handleDelete = async (id: string) => {
    const poi = pois.find(p => p.id === id);
    if (!poi) {
      setError('POI not found');
      return;
    }
    
    setPoiToDelete(poi);
    setShowDeleteConfirmation(true);
  };

  // Perform actual POI deletion after confirmation
  const performPoiDeletion = async () => {
    if (!poiToDelete) return;
    
    try {
      const { error } = await supabase
        .from('pois')
        .delete()
        .eq('id', poiToDelete.id);

      if (error) throw error;
      setPois(prev => prev.filter(poi => poi.id !== poiToDelete.id));

      // Close confirmation modal
      setShowDeleteConfirmation(false);
      setPoiToDelete(null);
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
          Browse and filter all discovered points of interest across Deep Desert and Hagga Basin regions.
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
            className="p-2 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-amber-300 border border-slate-700 transition-colors duration-150"
            title={`Sort direction: ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            {sortDirection === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
          </button>
        </div>

        {/* Display Mode Toggle */}
        <div className="flex border border-slate-700">
          <button
            onClick={() => setDisplayMode('grid')}
            className={`p-2 transition-colors duration-150 ${
              displayMode === 'grid' 
                ? 'bg-slate-700 text-amber-300' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-200'
            }`}
            title="Grid View"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setDisplayMode('list')}
            className={`p-2 transition-colors duration-150 ${
              displayMode === 'list' 
                ? 'bg-slate-700 text-amber-300' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-200'
            }`}
            title="List View"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Search and Filters Section - now conditionally rendered without its own button wrapper*/}
      {isSearchBarOpen && (
          <div className="bg-night-900 p-4 md:p-6 border border-slate-700 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search Term */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-sand-300 mb-1" htmlFor="search">
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
                    className="px-3 py-2 border border-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-400 bg-slate-800 text-sand-100 placeholder-sand-500 w-full pl-10"
                  />
                </div>
              </div>

              {/* Search by Map Type */}
              <div>
                <label className="block text-sm font-medium text-sand-300 mb-1" htmlFor="search-map-type">
                  Map Region
                </label>
                <select
                  id="search-map-type"
                  value={selectedMapType}
                  onChange={(e) => setSelectedMapType(e.target.value as MapType | 'all')}
                  className="px-3 py-2 border border-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-400 bg-slate-800 text-sand-100 placeholder-sand-500 w-full [&>option]:bg-slate-800 [&>option]:text-sand-100"
                >
                  <option value="all">All Regions</option>
                  <option value="deep_desert">Deep Desert</option>
                  <option value="hagga_basin">Hagga Basin</option>
                </select>
              </div>

              {/* Search by Grid Coordinate */}
              <div>
                <label className="block text-sm font-medium text-sand-300 mb-1" htmlFor="search-grid">
                  Search by Grid
                </label>
                <select
                  id="search-grid"
                  value={searchGridCoordinate}
                  onChange={(e) => setSearchGridCoordinate(e.target.value)}
                  className="px-3 py-2 border border-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-400 bg-slate-800 text-sand-100 placeholder-sand-500 w-full [&>option]:bg-slate-800 [&>option]:text-sand-100"
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
                <label className="block text-sm font-medium text-sand-300 mb-1" htmlFor="search-user">
                  Search by Creator
                </label>
                <input
                  id="search-user"
                  type="text"
                  placeholder="Username"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="px-3 py-2 border border-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-400 bg-slate-800 text-sand-100 placeholder-sand-500 w-full"
                />
              </div>
            </div>
            
            {/* Date Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-sand-300 mb-1" htmlFor="search-date-start">
                  Created Date From
                </label>
                <input
                  id="search-date-start"
                  type="date"
                  value={searchDateStart}
                  onChange={(e) => setSearchDateStart(e.target.value)}
                  className="px-3 py-2 border border-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-400 bg-slate-800 text-sand-100 placeholder-sand-500 w-full"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sand-300 mb-1" htmlFor="search-date-end">
                  Created Date To
                </label>
                <input
                  id="search-date-end"
                  type="date"
                  value={searchDateEnd}
                  onChange={(e) => setSearchDateEnd(e.target.value)}
                  className="px-3 py-2 border border-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-400 bg-slate-800 text-sand-100 placeholder-sand-500 w-full"
                  min={searchDateStart || undefined} // Prevent end date before start date
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>
          </div>
      )}

      {/* Collapsible Tag Filters Section - now conditionally rendered without its own button wrapper*/}
      {isTagFilterOpen && (
          <div className="bg-night-900 p-4 md:p-6 border border-slate-700 mb-6">
            {/* Map Type Filter Buttons */}
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gold-300 mb-2">Filter by Map Region</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedMapType('all')}
                  className={`btn text-xs px-3 py-1 ${selectedMapType === 'all' ? 'btn-primary' : 'btn-outline'}`}
                >
                  🌍 All Regions
                </button>
                <button
                  onClick={() => setSelectedMapType('deep_desert')}
                  className={`btn text-xs px-3 py-1 ${selectedMapType === 'deep_desert' ? 'btn-primary' : 'btn-outline'}`}
                >
                  🏜️ Deep Desert
                </button>
                <button
                  onClick={() => setSelectedMapType('hagga_basin')}
                  className={`btn text-xs px-3 py-1 ${selectedMapType === 'hagga_basin' ? 'btn-primary' : 'btn-outline'}`}
                >
                  🏔️ Hagga Basin
                </button>
              </div>
            </div>

            {/* Grid Coordinate Tags */}
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gold-300 mb-2">Filter by Grid Tags</h3>
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
              <h3 className="text-base font-semibold text-gold-300 mb-2">Filter by Category Tags</h3>
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
              <h3 className="text-base font-semibold text-gold-300 mb-2">Filter by Type Tags</h3>
              {categories.map(category => {
                const typesInCategory = poiTypes
                  .filter(pt => pt.category === category)
                  .sort((a, b) => a.name.localeCompare(b.name));
                if (typesInCategory.length === 0) return null;
                return (
                  <div key={category} className="mb-3">
                    <h4 className="text-sm font-medium text-sand-300 mb-1">{category}</h4>
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
                    <h4 className="text-sm font-medium text-sand-300 mb-1">Uncategorized</h4>
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
            
            <div className="mt-4 border-t border-slate-700 pt-4">
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
            const poiType = getPoiType(poi.poi_type_id);
            if (!poiType) return null;

            return (
                                    <POIPreviewCard
                        key={poi.id}
                        poi={poi}
                        poiTypes={poiTypes}
        
                        userInfo={userInfo}
                        layout={displayMode}
                        onClick={() => setSelectedPoiId(poi.id)}
                        onImageClick={() => handleGalleryOpen(poi)}
                        onEdit={() => setEditingPoiId(poi.id)}
                        onDelete={() => handleDelete(poi.id)}
                        onShare={() => {
                          // Copy POI link to clipboard
                          const poiUrl = poi.map_type === 'hagga_basin' 
                            ? `${window.location.origin}/hagga-basin?highlight=${poi.id}`
                            : poi.grid_square?.coordinate 
                              ? `${window.location.origin}/deep-desert/grid/${poi.grid_square.coordinate}?highlight=${poi.id}`
                              : `${window.location.origin}/deep-desert`;
                          
                          navigator.clipboard.writeText(poiUrl).then(() => {
                            // You could add a toast notification here
                      
                          }).catch(err => {
                            console.error('Failed to copy POI link:', err);
                          });
                        }}
                      />
            );
          })}
        </div>
      )}

      {/* Screenshot Gallery Modal */}
      {showGallery && selectedPoi?.screenshots && (
        <GridGallery
          initialImageUrl={selectedPoi.screenshots[galleryIndex]?.url || selectedPoi.screenshots[0]?.url}
          allImages={selectedPoi.screenshots.map(s => ({
            url: s.url,
            source: 'poi' as const,
            poi: selectedPoi
          }))}
          onClose={() => setShowGallery(false)}
        />
      )}

      {/* POI Card Modal */}
      {selectedPoiId && (() => {
        const selectedPoi = filteredPois.find(poi => poi.id === selectedPoiId);
        const selectedPoiType = selectedPoi ? poiTypes.find(type => type.id === selectedPoi.poi_type_id) : null;
        if (!selectedPoi || !selectedPoiType) return null;
        
        return (
          <POICard
            poi={selectedPoi}
            poiType={selectedPoiType}
            isOpen={true}
            onClose={() => setSelectedPoiId(null)}
            onEdit={() => {
              setEditingPoiId(selectedPoi.id);
              setSelectedPoiId(null);
            }}
            onDelete={() => {
              handleDelete(selectedPoi.id);
              setSelectedPoiId(null);
            }}
            onImageClick={() => {
              handleGalleryOpen(selectedPoi);
              setSelectedPoiId(null);
            }}
          />
        );
      })()}

      {/* POI Edit Modal */}
      {editingPoiId && (
        <POIEditModal
          poi={filteredPois.find(poi => poi.id === editingPoiId)!}
          poiTypes={poiTypes}
          onClose={() => setEditingPoiId(null)}
          onPoiUpdated={handleUpdate}
        />
      )}

      {/* POI Deletion Confirmation Modal */}
      {showDeleteConfirmation && poiToDelete && (
        <ConfirmationModal
          isOpen={showDeleteConfirmation}
          onClose={() => {
            setShowDeleteConfirmation(false);
            setPoiToDelete(null);
          }}
          onConfirm={performPoiDeletion}
          title="Delete POI"
          message={`Are you sure you want to delete "${poiToDelete.title}"? This action cannot be undone and will also delete all associated screenshots.`}
          confirmButtonText="Delete POI"
          cancelButtonText="Cancel"
          variant="danger"
        />
      )}
    </div>
  );
};

export default PoisPage;