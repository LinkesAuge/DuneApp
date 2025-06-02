import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Mountain, Pyramid, Map, Grid, Search, X, CheckSquare, Square, Filter, Users, Eye, Lock, Calendar, User, Bookmark, MoreHorizontal } from 'lucide-react';
import { Poi, PoiType, GridSquare, HaggaBasinBaseMap } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { useLocation, useNavigate } from 'react-router-dom';
import InteractiveMap from '../hagga-basin/InteractiveMap';
import DeepDesertSelectionMode from './DeepDesertSelectionMode';
import { usePagination } from '../../hooks/usePagination';
import { VirtualizedList, PaginationControls } from '../shared';

interface PoiSelectionPanelProps {
  selectedPoiIds: Set<string>;
  onPoiToggle: (poiId: string) => void;
  onSelectAll: (poiIds: string[]) => void;
  onClearSelection: () => void;
  className?: string;
}

type MapType = 'hagga_basin' | 'deep_desert';
type ViewMode = 'map' | 'list';
type PrivacyFilter = 'all' | 'public' | 'private' | 'shared';
type SortBy = 'created_at' | 'title' | 'updated_at';
type SortOrder = 'asc' | 'desc';

interface FilterState {
  searchTerm: string;
  selectedCategories: Set<string>;
  selectedPoiTypes: Set<string>;
  privacyFilter: PrivacyFilter;
  creatorFilter: string; // User ID or 'all' or 'mine'
  dateFilter: 'all' | 'today' | 'week' | 'month';
  gridFilter: string; // For Deep Desert: 'all' or specific grid like 'A1'
  sortBy: SortBy;
  sortOrder: SortOrder;
}

interface FilterPreset {
  id: string;
  name: string;
  filters: Partial<FilterState>;
  mapType: MapType;
}

const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'my-recent',
    name: 'My Recent POIs',
    filters: {
      creatorFilter: 'mine',
      dateFilter: 'week',
      sortBy: 'created_at',
      sortOrder: 'desc'
    },
    mapType: 'hagga_basin'
  },
  {
    id: 'public-resources',
    name: 'Public Resources',
    filters: {
      privacyFilter: 'public',
      selectedCategories: new Set(['Resources', 'Gathering']),
      sortBy: 'title',
      sortOrder: 'asc'
    },
    mapType: 'hagga_basin'
  },
  {
    id: 'exploration-targets',
    name: 'Exploration Targets',
    filters: {
      selectedCategories: new Set(['Points of Interest', 'Exploration']),
      sortBy: 'created_at',
      sortOrder: 'desc'
    },
    mapType: 'deep_desert'
  }
];

const PoiSelectionPanel: React.FC<PoiSelectionPanelProps> = ({
  selectedPoiIds,
  onPoiToggle,
  onSelectAll,
  onClearSelection,
  className = ''
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // View state
  const [mapType, setMapType] = useState<MapType>('hagga_basin');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showFilters, setShowFilters] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  
  // Data state
  const [pois, setPois] = useState<Poi[]>([]);
  const [poiTypes, setPoiTypes] = useState<PoiType[]>([]);
  const [creators, setCreators] = useState<Array<{ id: string; username: string; display_name?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state with enhanced options
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    selectedCategories: new Set(),
    selectedPoiTypes: new Set(),
    privacyFilter: 'all',
    creatorFilter: 'all',
    dateFilter: 'all',
    gridFilter: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  // Load filters from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filtersFromUrl: Partial<FilterState> = {};
    
    if (params.get('search')) filtersFromUrl.searchTerm = params.get('search')!;
    if (params.get('privacy')) filtersFromUrl.privacyFilter = params.get('privacy')! as PrivacyFilter;
    if (params.get('creator')) filtersFromUrl.creatorFilter = params.get('creator')!;
    if (params.get('date')) filtersFromUrl.dateFilter = params.get('date')! as FilterState['dateFilter'];
    if (params.get('sort')) filtersFromUrl.sortBy = params.get('sort')! as SortBy;
    if (params.get('order')) filtersFromUrl.sortOrder = params.get('order')! as SortOrder;
    if (params.get('map_type')) setMapType(params.get('map_type')! as MapType);
    
    if (Object.keys(filtersFromUrl).length > 0) {
      setFilters(prev => ({ ...prev, ...filtersFromUrl }));
    }
  }, [location.search]);

  // Update URL when filters change
  const updateUrlParams = () => {
    const params = new URLSearchParams(location.search);
    
    // Only add non-default filter values to URL
    if (filters.searchTerm) params.set('search', filters.searchTerm);
    else params.delete('search');
    
    if (filters.privacyFilter !== 'all') params.set('privacy', filters.privacyFilter);
    else params.delete('privacy');
    
    if (filters.creatorFilter !== 'all') params.set('creator', filters.creatorFilter);
    else params.delete('creator');
    
    if (filters.dateFilter !== 'all') params.set('date', filters.dateFilter);
    else params.delete('date');
    
    if (filters.sortBy !== 'created_at') params.set('sort', filters.sortBy);
    else params.delete('sort');
    
    if (filters.sortOrder !== 'desc') params.set('order', filters.sortOrder);
    else params.delete('order');
    
    if (mapType !== 'hagga_basin') params.set('map_type', mapType);
    else params.delete('map_type');
    
    const newSearch = params.toString();
    if (newSearch !== location.search.substring(1)) {
      navigate(`${location.pathname}?${newSearch}`, { replace: true });
    }
  };

  // Update URL when filters or mapType change
  useEffect(() => {
    updateUrlParams();
  }, [filters, mapType]);

  // Fetch POI data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch POIs for current map type
        const { data: poisData, error: poisError } = await supabase
          .from('pois')
          .select(`
            *,
            poi_types(*),
            profiles(id, username, display_name),
            grid_squares(coordinate)
          `)
          .eq('map_type', mapType)
          .order('created_at', { ascending: false });

        if (poisError) throw poisError;

        // Fetch POI types for filtering
        const { data: typesData, error: typesError } = await supabase
          .from('poi_types')
          .select('*')
          .order('category', { ascending: true });

        if (typesError) throw typesError;

        // Fetch unique creators for creator filter
        const { data: creatorsData, error: creatorsError } = await supabase
          .from('profiles')
          .select('id, username, display_name')
          .in('id', [...new Set(poisData?.map(poi => poi.created_by) || [])]);

        if (creatorsError) throw creatorsError;

        setPois(poisData || []);
        setPoiTypes(typesData || []);
        setCreators(creatorsData || []);
        
        // Initialize filter selections to show all POI types
        if (typesData && filters.selectedPoiTypes.size === 0) {
          setFilters(prev => ({
            ...prev,
            selectedPoiTypes: new Set(typesData.map(type => type.id))
          }));
        }
      } catch (err) {
        console.error('Error fetching POI data:', err);
        setError('Failed to load POI data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mapType]);

  // Helper function to check if icon is URL
  const isIconUrl = (icon: string): boolean => {
    return icon.startsWith('http') || icon.startsWith('/') || icon.includes('.');
  };

  // Get display image URL for POI types
  const getDisplayImageUrl = (icon: string): string => {
    return isIconUrl(icon) ? icon : '';
  };

  // Enhanced filter POIs based on current filters
  const filteredPois = useMemo(() => {
    let filtered = pois.filter(poi => {
      // Search filter - enhanced to include more fields
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const searchFields = [
          poi.title,
          poi.description || '',
          poi.poi_types?.name || '',
          poi.poi_types?.category || '',
          poi.profiles?.username || '',
          poi.profiles?.display_name || '',
          poi.grid_squares?.coordinate || ''
        ];
        
        if (!searchFields.some(field => field.toLowerCase().includes(searchLower))) {
          return false;
        }
      }

      // POI type filter
      if (filters.selectedPoiTypes.size > 0 && !filters.selectedPoiTypes.has(poi.poi_type_id)) {
        return false;
      }

      // Privacy filter
      if (filters.privacyFilter !== 'all') {
        if (filters.privacyFilter === 'public' && poi.privacy_level !== 'global') return false;
        if (filters.privacyFilter === 'private' && poi.privacy_level !== 'private') return false;
        if (filters.privacyFilter === 'shared' && poi.privacy_level !== 'shared') return false;
      }

      // Creator filter
      if (filters.creatorFilter !== 'all') {
        if (filters.creatorFilter === 'mine' && poi.created_by !== user?.id) return false;
        if (filters.creatorFilter !== 'mine' && filters.creatorFilter !== 'all' && poi.created_by !== filters.creatorFilter) return false;
      }

      // Date filter
      if (filters.dateFilter !== 'all') {
        const now = new Date();
        const poiDate = new Date(poi.created_at);
        let cutoffDate: Date;

        switch (filters.dateFilter) {
          case 'today':
            cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            cutoffDate = new Date(0);
        }

        if (poiDate < cutoffDate) return false;
      }

      // Grid filter for Deep Desert
      if (mapType === 'deep_desert' && filters.gridFilter !== 'all') {
        if (poi.grid_squares?.coordinate !== filters.gridFilter) return false;
      }

      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (filters.sortBy) {
        case 'title':
          compareValue = a.title.localeCompare(b.title);
          break;
        case 'created_at':
          compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'updated_at':
          compareValue = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
      }
      
      return filters.sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [pois, filters, mapType, user?.id]);

  // Group POI types by category
  const categorizedPoiTypes = useMemo(() => {
    const categories: { [key: string]: PoiType[] } = {};
    poiTypes.forEach(type => {
      const category = type.category || 'Other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(type);
    });
    return categories;
  }, [poiTypes]);

  // Get unique grid coordinates for Deep Desert filtering
  const gridCoordinates = useMemo(() => {
    if (mapType !== 'deep_desert') return [];
    return [...new Set(pois.map(poi => poi.grid_squares?.coordinate).filter(Boolean))].sort();
  }, [pois, mapType]);

  // Handle filter changes
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const togglePoiType = (typeId: string) => {
    setFilters(prev => {
      const newSelected = new Set(prev.selectedPoiTypes);
      if (newSelected.has(typeId)) {
        newSelected.delete(typeId);
      } else {
        newSelected.add(typeId);
      }
      return { ...prev, selectedPoiTypes: newSelected };
    });
  };

  const toggleCategory = (category: string) => {
    const categoryTypes = categorizedPoiTypes[category] || [];
    const categoryTypeIds = categoryTypes.map(type => type.id);
    const allSelected = categoryTypeIds.every(id => filters.selectedPoiTypes.has(id));
    
    setFilters(prev => {
      const newSelected = new Set(prev.selectedPoiTypes);
      if (allSelected) {
        categoryTypeIds.forEach(id => newSelected.delete(id));
      } else {
        categoryTypeIds.forEach(id => newSelected.add(id));
      }
      return { ...prev, selectedPoiTypes: newSelected };
    });
  };

  const selectAllFiltered = () => {
    const filteredPoiIds = filteredPois.map(poi => poi.id);
    onSelectAll(filteredPoiIds);
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      selectedCategories: new Set(),
      selectedPoiTypes: new Set(poiTypes.map(type => type.id)),
      privacyFilter: 'all',
      creatorFilter: 'all',
      dateFilter: 'all',
      gridFilter: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  const applyPreset = (preset: FilterPreset) => {
    setMapType(preset.mapType);
    setFilters(prev => ({
      ...prev,
      ...preset.filters
    }));
    setShowPresets(false);
  };

  // Get counts for display
  const selectedCount = selectedPoiIds.size;
  const filteredCount = filteredPois.length;
  const totalCount = pois.length;

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading POIs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <p className="text-red-400 mb-2">Error loading POIs</p>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header with Map Type Toggle */}
      <div className="bg-slate-800/50 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-amber-200">Select POIs</h3>
          <div className="flex items-center space-x-2">
            {/* Filter Presets Button */}
            <div className="relative">
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="flex items-center space-x-1 px-2 py-1.5 text-xs text-slate-300 hover:text-slate-100 hover:bg-slate-700/50 rounded transition-colors"
                title="Filter Presets"
              >
                <Bookmark className="w-3 h-3" />
                <span>Presets</span>
              </button>
              
              {showPresets && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowPresets(false)} />
                  <div className="absolute top-full right-0 mt-1 w-56 bg-slate-900 border border-slate-600 rounded-lg shadow-xl z-50">
                    <div className="p-2">
                      <div className="text-xs text-slate-400 font-medium mb-2 px-2">Quick Filters</div>
                      {DEFAULT_PRESETS.map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => applyPreset(preset)}
                          className="w-full text-left px-2 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-700/50 rounded transition-colors"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Map Type Toggle */}
            <div className="flex bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setMapType('hagga_basin')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md transition-colors ${
                  mapType === 'hagga_basin'
                    ? 'bg-blue-600 text-blue-100'
                    : 'text-slate-300 hover:text-slate-100'
                }`}
              >
                <Mountain className="w-4 h-4" />
                <span className="text-sm">Hagga Basin</span>
              </button>
              <button
                onClick={() => setMapType('deep_desert')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md transition-colors ${
                  mapType === 'deep_desert'
                    ? 'bg-orange-600 text-orange-100'
                    : 'text-slate-300 hover:text-slate-100'
                }`}
              >
                <Pyramid className="w-4 h-4" />
                <span className="text-sm">Deep Desert</span>
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-slate-600 text-slate-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="List View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'map'
                    ? 'bg-slate-600 text-slate-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Map View"
              >
                <Map className="w-4 h-4" />
              </button>
            </div>

            {/* Toggle Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded transition-colors ${
                showFilters
                  ? 'bg-amber-600 text-amber-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Filters"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selection Summary */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-slate-400">
              Showing <span className="text-amber-300 font-medium">{filteredCount}</span> of{' '}
              <span className="text-slate-300">{totalCount}</span> POIs
            </span>
            {selectedCount > 0 && (
              <span className="text-amber-400">
                <span className="font-medium">{selectedCount}</span> selected
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {filteredCount > 0 && (
              <button
                onClick={selectAllFiltered}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-green-300 hover:text-green-100 hover:bg-slate-700/50 rounded transition-colors"
              >
                <CheckSquare className="w-3 h-3" />
                <span>Select All Filtered</span>
              </button>
            )}
            
            {selectedCount > 0 && (
              <button
                onClick={onClearSelection}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-red-300 hover:text-red-100 hover:bg-slate-700/50 rounded transition-colors"
              >
                <X className="w-3 h-3" />
                <span>Clear Selection</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Filters Panel */}
      {showFilters && (
        <div className="bg-slate-800/30 border-b border-slate-700 p-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search POIs, creators, coordinates..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500 text-sm"
            />
          </div>

          {/* Quick Filters Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Privacy Filter */}
              <div className="flex items-center space-x-1">
                <span className="text-xs text-slate-400 font-medium">Privacy:</span>
                <div className="flex space-x-1">
                  {[
                    { key: 'all' as const, label: 'All', icon: Filter },
                    { key: 'public' as const, label: 'Public', icon: Eye },
                    { key: 'private' as const, label: 'Private', icon: Lock },
                    { key: 'shared' as const, label: 'Shared', icon: Users }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => updateFilter('privacyFilter', key)}
                      className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                        filters.privacyFilter === key
                          ? 'bg-amber-600 text-amber-100'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                <MoreHorizontal className="w-3 h-3" />
                <span>Advanced</span>
              </button>
              <button
                onClick={clearFilters}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="space-y-3 pt-2 border-t border-slate-700">
              <div className="grid grid-cols-2 gap-3">
                {/* Creator Filter */}
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">Creator:</label>
                  <select
                    value={filters.creatorFilter}
                    onChange={(e) => updateFilter('creatorFilter', e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-slate-100 text-sm"
                  >
                    <option value="all">All Creators</option>
                    {user && <option value="mine">My POIs</option>}
                    {creators.map(creator => (
                      <option key={creator.id} value={creator.id}>
                        {creator.display_name || creator.username}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">Created:</label>
                  <select
                    value={filters.dateFilter}
                    onChange={(e) => updateFilter('dateFilter', e.target.value as FilterState['dateFilter'])}
                    className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-slate-100 text-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>

                {/* Grid Filter for Deep Desert */}
                {mapType === 'deep_desert' && (
                  <div>
                    <label className="block text-xs text-slate-400 font-medium mb-1">Grid:</label>
                    <select
                      value={filters.gridFilter}
                      onChange={(e) => updateFilter('gridFilter', e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-slate-100 text-sm"
                    >
                      <option value="all">All Grids</option>
                      {gridCoordinates.map(coord => (
                        <option key={coord} value={coord}>Grid {coord}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sort Options */}
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">Sort by:</label>
                  <div className="flex space-x-1">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => updateFilter('sortBy', e.target.value as SortBy)}
                      className="flex-1 px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-slate-100 text-sm"
                    >
                      <option value="created_at">Created Date</option>
                      <option value="updated_at">Updated Date</option>
                      <option value="title">Title</option>
                    </select>
                    <button
                      onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-slate-300 hover:text-slate-100 text-sm"
                      title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    >
                      {filters.sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* POI Type Filters */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">POI Types:</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {Object.entries(categorizedPoiTypes).map(([category, types]) => (
                <div key={category} className="space-y-1">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full text-left text-xs font-medium text-amber-300 hover:text-amber-100 transition-colors px-2 py-1 rounded hover:bg-slate-700/50"
                  >
                    {category}
                  </button>
                  
                  <div className="space-y-0.5 pl-2">
                    {types.map(type => {
                      const isSelected = filters.selectedPoiTypes.has(type.id);
                      const imageUrl = getDisplayImageUrl(type.icon);
                      
                      return (
                        <button
                          key={type.id}
                          onClick={() => togglePoiType(type.id)}
                          className={`w-full flex items-center space-x-2 px-2 py-1 rounded text-xs transition-colors ${
                            isSelected
                              ? 'bg-amber-600/20 text-amber-100'
                              : 'text-slate-300 hover:bg-slate-700/50 hover:text-slate-100'
                          }`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-3 h-3 text-amber-400 flex-shrink-0" />
                          ) : (
                            <Square className="w-3 h-3 text-slate-500 flex-shrink-0" />
                          )}
                          
                          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                            {imageUrl ? (
                              <img src={imageUrl} alt={type.name} className="w-3 h-3 object-contain" />
                            ) : (
                              <span className="text-xs">{type.icon}</span>
                            )}
                          </div>
                          
                          <span className="truncate">{type.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'list' ? (
          <PoiListView
            pois={filteredPois}
            poiTypes={poiTypes}
            selectedPoiIds={selectedPoiIds}
            onPoiToggle={onPoiToggle}
          />
        ) : (
          <PoiMapView
            mapType={mapType}
            pois={filteredPois}
            poiTypes={poiTypes}
            selectedPoiIds={selectedPoiIds}
            onPoiToggle={onPoiToggle}
          />
        )}
      </div>
    </div>
  );
};

// POI List View Component
interface PoiListViewProps {
  pois: Poi[];
  poiTypes: PoiType[];
  selectedPoiIds: Set<string>;
  onPoiToggle: (poiId: string) => void;
}

const PoiListView: React.FC<PoiListViewProps> = ({
  pois,
  poiTypes,
  selectedPoiIds,
  onPoiToggle
}) => {
  const getPoiType = (poiTypeId: string) => {
    return poiTypes.find(type => type.id === poiTypeId);
  };

  const isIconUrl = (icon: string): boolean => {
    return icon.startsWith('http') || icon.startsWith('/') || icon.includes('.');
  };

  const getDisplayImageUrl = (icon: string): string => {
    return isIconUrl(icon) ? icon : '';
  };

  // Use pagination hook with 50 items per page
  const pagination = usePagination(pois, {
    itemsPerPage: 50,
    urlParamPrefix: 'poi_',
    persistInUrl: true
  });

  // Get paginated data
  const paginatedPois = pagination.paginatedData(pois);

  // Render individual POI item
  const renderPoiItem = useCallback(({ item: poi, style }: { item: Poi; style: React.CSSProperties }) => {
    const poiType = getPoiType(poi.poi_type_id);
    const isSelected = selectedPoiIds.has(poi.id);
    const imageUrl = poiType ? getDisplayImageUrl(poiType.icon) : '';

    return (
      <div
        style={style}
        className={`flex items-center space-x-3 p-3 mx-4 rounded-lg border transition-all duration-200 cursor-pointer ${
          isSelected
            ? 'bg-amber-900/20 border-amber-600/50 shadow-lg'
            : 'bg-slate-800/50 border-slate-600 hover:border-slate-500 hover:bg-slate-800/70'
        }`}
        onClick={() => onPoiToggle(poi.id)}
      >
        {/* Selection Checkbox */}
        <div className="flex-shrink-0">
          {isSelected ? (
            <CheckSquare className="w-5 h-5 text-amber-400" />
          ) : (
            <Square className="w-5 h-5 text-slate-400" />
          )}
        </div>

        {/* POI Icon */}
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-700 border border-slate-600 flex-shrink-0">
          {imageUrl ? (
            <img src={imageUrl} alt={poiType?.name} className="w-6 h-6 object-contain" />
          ) : (
            <span className="text-lg">{poiType?.icon || '📍'}</span>
          )}
        </div>

        {/* POI Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-slate-100 truncate">{poi.title}</h4>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
            <span className="px-2 py-0.5 bg-slate-700 text-amber-300 rounded">
              {poiType?.category || 'Unknown'}
            </span>
            <span>{poiType?.name || 'Unknown Type'}</span>
            {poi.grid_squares?.coordinate && (
              <span className="text-green-400">({poi.grid_squares.coordinate})</span>
            )}
          </div>
          {poi.description && (
            <p className="text-xs text-slate-400 mt-1 truncate">{poi.description}</p>
          )}
        </div>

        {/* Privacy Indicator */}
        <div className="flex-shrink-0">
          {poi.privacy_level === 'global' && <Eye className="w-4 h-4 text-green-400" />}
          {poi.privacy_level === 'private' && <Lock className="w-4 h-4 text-red-400" />}
          {poi.privacy_level === 'shared' && <Users className="w-4 h-4 text-blue-400" />}
        </div>
      </div>
    );
  }, [poiTypes, selectedPoiIds, onPoiToggle, getPoiType, getDisplayImageUrl]);

  if (pois.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-400">No POIs match current filters</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Pagination Controls */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-slate-700">
        <PaginationControls
          pagination={pagination}
          compact={true}
          showTotalItems={true}
          showPageInfo={true}
          itemsPerPageOptions={[25, 50, 100]}
        />
      </div>

      {/* Virtualized List */}
      <div className="flex-1">
        <VirtualizedList
          items={paginatedPois}
          height={600} // Will be constrained by parent
          itemHeight={80} // Height for each POI item
          renderItem={renderPoiItem}
          getItemKey={(index, poi) => poi.id}
          threshold={20} // Enable virtualization with 20+ items
          className="h-full"
        />
      </div>
    </div>
  );
};

// POI Map View Component
interface PoiMapViewProps {
  mapType: MapType;
  pois: Poi[];
  poiTypes: PoiType[];
  selectedPoiIds: Set<string>;
  onPoiToggle: (poiId: string) => void;
}

const PoiMapView: React.FC<PoiMapViewProps> = ({
  mapType,
  pois,
  poiTypes,
  selectedPoiIds,
  onPoiToggle
}) => {
  // State for map data
  const [baseMaps, setBaseMaps] = useState<HaggaBasinBaseMap[]>([]);
  const [gridSquares, setGridSquares] = useState<GridSquare[]>([]);
  const [currentGridId, setCurrentGridId] = useState('A1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load map-specific data
  useEffect(() => {
    const loadMapData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (mapType === 'hagga_basin') {
          // Load Hagga Basin base maps
          const { data: baseMapsData, error: baseMapsError } = await supabase
            .from('hagga_basin_base_maps')
            .select('*')
            .order('created_at', { ascending: false });

          if (baseMapsError) throw baseMapsError;
          setBaseMaps(baseMapsData || []);
        } else {
          // Load Deep Desert grid squares
          const { data: gridData, error: gridError } = await supabase
            .from('grid_squares')
            .select('*')
            .order('coordinate');

          if (gridError) throw gridError;
          setGridSquares(gridData || []);
        }
      } catch (err: any) {
        console.error('Error loading map data:', err);
        setError(err.message || 'Failed to load map data');
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, [mapType]);

  // Filter POIs based on map type
  const mapPois = useMemo(() => {
    return pois.filter(poi => {
      if (mapType === 'hagga_basin') {
        return poi.map_type === 'hagga_basin';
      } else {
        return poi.map_type === 'deep_desert';
      }
    });
  }, [pois, mapType]);

  // Handle POI selection
  const handlePoiSelect = (poi: Poi) => {
    onPoiToggle(poi.id);
  };

  // Get active base map for Hagga Basin
  const activeBaseMap = useMemo(() => {
    return baseMaps.find(map => map.is_active) || baseMaps[0];
  }, [baseMaps]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900/30">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading {mapType === 'hagga_basin' ? 'Hagga Basin' : 'Deep Desert'} map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900/30">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">Error Loading Map</h3>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (mapType === 'hagga_basin') {
    if (!activeBaseMap) {
      return (
        <div className="h-full flex items-center justify-center bg-slate-900/30">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mountain className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">No Base Map Available</h3>
            <p className="text-slate-500">Please upload a base map in the admin panel.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full relative">
        {/* Selection indicator */}
        <div className="absolute top-4 right-4 z-30 bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-lg px-3 py-2 shadow-lg">
          <div className="text-center">
            <div className="text-blue-300 text-lg font-bold">
              {selectedPoiIds.size}
            </div>
            <div className="text-slate-400 text-xs">Selected</div>
          </div>
        </div>

        <InteractiveMap
          baseMap={activeBaseMap}
          overlays={[]}
          pois={mapPois}
          poiTypes={poiTypes}
          selectionMode={true}
          selectedPoiIds={selectedPoiIds}
          onPoiClick={handlePoiSelect}
          mapType="hagga_basin"
        />
      </div>
    );
  } else {
    return (
      <div className="h-full relative">
        {/* Selection indicator */}
        <div className="absolute top-4 right-4 z-30 bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-lg px-3 py-2 shadow-lg">
          <div className="text-center">
            <div className="text-orange-300 text-lg font-bold">
              {selectedPoiIds.size}
            </div>
            <div className="text-slate-400 text-xs">Selected</div>
          </div>
        </div>

        <DeepDesertSelectionMode
          currentGridId={currentGridId}
          allGridSquares={gridSquares}
          pois={pois}
          poiTypes={poiTypes}
          selectedPoiIds={selectedPoiIds}
          onPoiSelect={(poiId) => onPoiToggle(poiId)}
          onPoiDeselect={(poiId) => onPoiToggle(poiId)}
          onGridNavigate={setCurrentGridId}
          filteredPois={mapPois}
        />
      </div>
    );
  }
};

export default PoiSelectionPanel; 