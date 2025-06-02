import React, { useState, useEffect, useMemo } from 'react';
import { Package, FileText, Search, X, CheckSquare, Square, Grid, List, Filter, Users, Calendar, User, Bookmark, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useItems, useSchematics, useCategories, useTypes, useTiers } from '../../hooks/useItemsSchematicsData';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Item, Schematic, Category, Type, Tier } from '../../types';

interface ItemSchematicSelectionPanelProps {
  selectedItemIds: Set<string>;
  selectedSchematicIds: Set<string>;
  onItemToggle: (itemId: string) => void;
  onSchematicToggle: (schematicId: string) => void;
  onSelectAllItems: (itemIds: string[]) => void;
  onSelectAllSchematics: (schematicIds: string[]) => void;
  onClearItemSelection: () => void;
  onClearSchematicSelection: () => void;
  className?: string;
}

type ActiveTab = 'items' | 'schematics';
type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'created_at' | 'updated_at';
type SortOrder = 'asc' | 'desc';

interface FilterState {
  searchTerm: string;
  selectedCategories: Set<string>;
  selectedTypes: Set<string>;
  selectedTiers: Set<string>;
  creatorFilter: string; // User ID or 'all' or 'mine'
  dateFilter: 'all' | 'today' | 'week' | 'month';
  sortBy: SortBy;
  sortOrder: SortOrder;
}

interface FilterPreset {
  id: string;
  name: string;
  filters: Partial<FilterState>;
  tab: ActiveTab;
}

const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'my-recent-items',
    name: 'My Recent Items',
    filters: {
      creatorFilter: 'mine',
      dateFilter: 'week',
      sortBy: 'created_at',
      sortOrder: 'desc'
    },
    tab: 'items'
  },
  {
    id: 'high-tier-items',
    name: 'High Tier Items',
    filters: {
      selectedTiers: new Set(['T5', 'T6', 'T7']),
      sortBy: 'name',
      sortOrder: 'asc'
    },
    tab: 'items'
  },
  {
    id: 'recent-schematics',
    name: 'Recent Schematics',
    filters: {
      dateFilter: 'week',
      sortBy: 'created_at',
      sortOrder: 'desc'
    },
    tab: 'schematics'
  },
  {
    id: 'crafting-materials',
    name: 'Crafting Materials',
    filters: {
      selectedCategories: new Set(['Materials', 'Resources']),
      sortBy: 'name',
      sortOrder: 'asc'
    },
    tab: 'items'
  }
];

const ItemSchematicSelectionPanel: React.FC<ItemSchematicSelectionPanelProps> = ({
  selectedItemIds,
  selectedSchematicIds,
  onItemToggle,
  onSchematicToggle,
  onSelectAllItems,
  onSelectAllSchematics,
  onClearItemSelection,
  onClearSchematicSelection,
  className = ''
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // View state
  const [activeTab, setActiveTab] = useState<ActiveTab>('items');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  // Data state
  const [creators, setCreators] = useState<Array<{ id: string; username: string; display_name?: string }>>([]);

  // Enhanced filter state
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    selectedCategories: new Set(),
    selectedTypes: new Set(),
    selectedTiers: new Set(),
    creatorFilter: 'all',
    dateFilter: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Data hooks
  const itemCategories = useCategories('items');
  const schematicCategories = useCategories('schematics');
  const tiers = useTiers();

  // Get current categories based on active tab
  const currentCategories = useMemo(() => {
    return activeTab === 'items' ? itemCategories.categories : schematicCategories.categories;
  }, [activeTab, itemCategories.categories, schematicCategories.categories]);

  // Get types for selected categories
  const selectedCategoryIds = Array.from(filters.selectedCategories);
  const typesData = useTypes(selectedCategoryIds[0]); // For simplicity, use first selected category

  // Load filters from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filtersFromUrl: Partial<FilterState> = {};
    
    if (params.get('is_search')) filtersFromUrl.searchTerm = params.get('is_search')!;
    if (params.get('is_creator')) filtersFromUrl.creatorFilter = params.get('is_creator')!;
    if (params.get('is_date')) filtersFromUrl.dateFilter = params.get('is_date')! as FilterState['dateFilter'];
    if (params.get('is_sort')) filtersFromUrl.sortBy = params.get('is_sort')! as SortBy;
    if (params.get('is_order')) filtersFromUrl.sortOrder = params.get('is_order')! as SortOrder;
    if (params.get('is_tab')) setActiveTab(params.get('is_tab')! as ActiveTab);
    
    if (Object.keys(filtersFromUrl).length > 0) {
      setFilters(prev => ({ ...prev, ...filtersFromUrl }));
    }
  }, [location.search]);

  // Update URL when filters change
  const updateUrlParams = () => {
    const params = new URLSearchParams(location.search);
    
    // Only add non-default filter values to URL (using 'is_' prefix to avoid conflicts)
    if (filters.searchTerm) params.set('is_search', filters.searchTerm);
    else params.delete('is_search');
    
    if (filters.creatorFilter !== 'all') params.set('is_creator', filters.creatorFilter);
    else params.delete('is_creator');
    
    if (filters.dateFilter !== 'all') params.set('is_date', filters.dateFilter);
    else params.delete('is_date');
    
    if (filters.sortBy !== 'name') params.set('is_sort', filters.sortBy);
    else params.delete('is_sort');
    
    if (filters.sortOrder !== 'asc') params.set('is_order', filters.sortOrder);
    else params.delete('is_order');
    
    if (activeTab !== 'items') params.set('is_tab', activeTab);
    else params.delete('is_tab');
    
    const newSearch = params.toString();
    if (newSearch !== location.search.substring(1)) {
      navigate(`${location.pathname}?${newSearch}`, { replace: true });
    }
  };

  // Update URL when filters or activeTab change
  useEffect(() => {
    updateUrlParams();
  }, [filters, activeTab]);

  // Fetch items and schematics data
  const itemFilters = {
    searchTerm: filters.searchTerm,
    category_id: filters.selectedCategories.size > 0 ? Array.from(filters.selectedCategories)[0] : undefined,
    type_id: filters.selectedTypes.size > 0 ? Array.from(filters.selectedTypes)[0] : undefined,
    tier_id: filters.selectedTiers.size > 0 ? Array.from(filters.selectedTiers)[0] : undefined
  };

  const schematicFilters = {
    searchTerm: filters.searchTerm,
    category_id: filters.selectedCategories.size > 0 ? Array.from(filters.selectedCategories)[0] : undefined,
    type_id: filters.selectedTypes.size > 0 ? Array.from(filters.selectedTypes)[0] : undefined,
    tier_id: filters.selectedTiers.size > 0 ? Array.from(filters.selectedTiers)[0] : undefined
  };

  const itemsData = useItems(itemFilters);
  const schematicsData = useSchematics(schematicFilters);

  // Fetch unique creators for creator filter
  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const allData = [...(itemsData.allItems || []), ...(schematicsData.allSchematics || [])];
        const creatorIds = [...new Set(allData.map(item => item.created_by).filter(Boolean))];
        
        if (creatorIds.length > 0) {
          const { data: creatorsData, error } = await supabase
            .from('profiles')
            .select('id, username, display_name')
            .in('id', creatorIds);

          if (error) throw error;
          setCreators(creatorsData || []);
        }
      } catch (err) {
        console.error('Error fetching creators:', err);
      }
    };

    fetchCreators();
  }, [itemsData.allItems, schematicsData.allSchematics]);

  // Enhanced filter data based on current tab with all advanced filters
  const filteredData = useMemo(() => {
    let data = activeTab === 'items' ? itemsData.items : schematicsData.schematics;
    
    // Apply additional filters not handled by the hooks
    data = data.filter(item => {
      // Enhanced search filter - search across multiple fields
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const searchFields = [
          item.name,
          item.description || '',
          item.category?.name || '',
          item.type?.name || '',
          item.tier?.name || ''
        ];
        
        if (!searchFields.some(field => field.toLowerCase().includes(searchLower))) {
          return false;
        }
      }

      // Creator filter
      if (filters.creatorFilter !== 'all') {
        if (filters.creatorFilter === 'mine' && item.created_by !== user?.id) return false;
        if (filters.creatorFilter !== 'mine' && filters.creatorFilter !== 'all' && item.created_by !== filters.creatorFilter) return false;
      }

      // Date filter
      if (filters.dateFilter !== 'all') {
        const now = new Date();
        const itemDate = new Date(item.created_at);
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

        if (itemDate < cutoffDate) return false;
      }

      return true;
    });

    // Apply sorting
    data.sort((a, b) => {
      let compareValue = 0;
      
      switch (filters.sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
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

    return data;
  }, [activeTab, itemsData.items, schematicsData.schematics, filters, user?.id]);

  // Loading and error states
  const isLoading = activeTab === 'items' 
    ? itemsData.loading || itemCategories.loading || tiers.loading
    : schematicsData.loading || schematicCategories.loading || tiers.loading;

  const error = activeTab === 'items'
    ? itemsData.error || itemCategories.error || tiers.error
    : schematicsData.error || schematicCategories.error || tiers.error;

  // Handle filter changes
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleCategory = (categoryId: string) => {
    setFilters(prev => {
      const newSelected = new Set(prev.selectedCategories);
      if (newSelected.has(categoryId)) {
        newSelected.delete(categoryId);
      } else {
        newSelected.add(categoryId);
      }
      // Clear types when categories change
      return { 
        ...prev, 
        selectedCategories: newSelected,
        selectedTypes: new Set()
      };
    });
  };

  const toggleType = (typeId: string) => {
    setFilters(prev => {
      const newSelected = new Set(prev.selectedTypes);
      if (newSelected.has(typeId)) {
        newSelected.delete(typeId);
      } else {
        newSelected.add(typeId);
      }
      return { ...prev, selectedTypes: newSelected };
    });
  };

  const toggleTier = (tierId: string) => {
    setFilters(prev => {
      const newSelected = new Set(prev.selectedTiers);
      if (newSelected.has(tierId)) {
        newSelected.delete(tierId);
      } else {
        newSelected.add(tierId);
      }
      return { ...prev, selectedTiers: newSelected };
    });
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      selectedCategories: new Set(),
      selectedTypes: new Set(),
      selectedTiers: new Set(),
      creatorFilter: 'all',
      dateFilter: 'all',
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  const applyPreset = (preset: FilterPreset) => {
    setActiveTab(preset.tab);
    setFilters(prev => ({
      ...prev,
      ...preset.filters
    }));
    setShowPresets(false);
  };

  // Selection functions
  const selectAllFiltered = () => {
    const filteredIds = filteredData.map(item => item.id);
    if (activeTab === 'items') {
      onSelectAllItems(filteredIds);
    } else {
      onSelectAllSchematics(filteredIds);
    }
  };

  const clearSelection = () => {
    if (activeTab === 'items') {
      onClearItemSelection();
    } else {
      onClearSchematicSelection();
    }
  };

  const toggleItemSelection = (id: string) => {
    if (activeTab === 'items') {
      onItemToggle(id);
    } else {
      onSchematicToggle(id);
    }
  };

  // Get current selection info
  const currentSelectedIds = activeTab === 'items' ? selectedItemIds : selectedSchematicIds;
  const selectedCount = currentSelectedIds.size;
  const filteredCount = filteredData.length;
  const totalCount = activeTab === 'items' ? itemsData.allItems.length : schematicsData.allSchematics.length;

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading {activeTab}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <p className="text-red-400 mb-2">Error loading {activeTab}</p>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header with Tab Toggle */}
      <div className="bg-slate-800/50 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-blue-200">Select Items & Schematics</h3>
          
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

            {/* View Mode Toggle */}
            <div className="flex bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-slate-600 text-slate-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-slate-600 text-slate-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Toggle Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded transition-colors ${
                showFilters
                  ? 'bg-blue-600 text-blue-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Filters"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center space-x-2 mb-3">
          <button
            onClick={() => setActiveTab('items')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'items'
                ? 'bg-blue-600 text-blue-100'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Items ({itemsData.allItems.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('schematics')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'schematics'
                ? 'bg-purple-600 text-purple-100'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Schematics ({schematicsData.allSchematics.length})</span>
          </button>
        </div>

        {/* Selection Summary */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-slate-400">
              Showing <span className="text-blue-300 font-medium">{filteredCount}</span> of{' '}
              <span className="text-slate-300">{totalCount}</span> {activeTab}
            </span>
            {selectedCount > 0 && (
              <span className="text-blue-400">
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
                onClick={clearSelection}
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
              placeholder="Search items, schematics, categories, types..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          {/* Quick Filters Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-medium">Quick Filters:</span>
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
                    {user && <option value="mine">My {activeTab}</option>}
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

                {/* Sort Options */}
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 font-medium mb-1">Sort by:</label>
                  <div className="flex space-x-1">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => updateFilter('sortBy', e.target.value as SortBy)}
                      className="flex-1 px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-slate-100 text-sm"
                    >
                      <option value="name">Name</option>
                      <option value="created_at">Created Date</option>
                      <option value="updated_at">Updated Date</option>
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

          {/* Category/Type/Tier Filters */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Categories & Types:</span>
            </div>
            
            {/* Categories */}
            <div className="space-y-2">
              <div className="text-xs text-blue-300 font-medium">Categories:</div>
              <div className="grid grid-cols-3 gap-1">
                {currentCategories.map(category => {
                  const isSelected = filters.selectedCategories.has(category.id);
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={`flex items-center space-x-2 px-2 py-1 rounded text-xs transition-colors ${
                        isSelected
                          ? 'bg-blue-600/20 text-blue-100'
                          : 'text-slate-300 hover:bg-slate-700/50 hover:text-slate-100'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-3 h-3 text-blue-400 flex-shrink-0" />
                      ) : (
                        <Square className="w-3 h-3 text-slate-500 flex-shrink-0" />
                      )}
                      <span className="truncate">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Types (if categories selected) */}
            {filters.selectedCategories.size > 0 && typesData.types.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-blue-300 font-medium">Types:</div>
                <div className="grid grid-cols-2 gap-1">
                  {typesData.types.map(type => {
                    const isSelected = filters.selectedTypes.has(type.id);
                    
                    return (
                      <button
                        key={type.id}
                        onClick={() => toggleType(type.id)}
                        className={`flex items-center space-x-2 px-2 py-1 rounded text-xs transition-colors ${
                          isSelected
                            ? 'bg-blue-600/20 text-blue-100'
                            : 'text-slate-300 hover:bg-slate-700/50 hover:text-slate-100'
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-3 h-3 text-blue-400 flex-shrink-0" />
                        ) : (
                          <Square className="w-3 h-3 text-slate-500 flex-shrink-0" />
                        )}
                        <span className="truncate">{type.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tiers */}
            <div className="space-y-2">
              <div className="text-xs text-blue-300 font-medium">Tiers:</div>
              <div className="flex flex-wrap gap-1">
                {tiers.tiers.map(tier => {
                  const isSelected = filters.selectedTiers.has(tier.id);
                  
                  return (
                    <button
                      key={tier.id}
                      onClick={() => toggleTier(tier.id)}
                      className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                        isSelected
                          ? 'bg-blue-600/20 text-blue-100'
                          : 'text-slate-300 hover:bg-slate-700/50 hover:text-slate-100'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-2 h-2 text-blue-400 flex-shrink-0" />
                      ) : (
                        <Square className="w-2 h-2 text-slate-500 flex-shrink-0" />
                      )}
                      <span className="truncate">T{tier.level}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'grid' ? (
          <ItemSchematicGridView
            data={filteredData}
            selectedIds={currentSelectedIds}
            onToggleSelection={toggleItemSelection}
            activeTab={activeTab}
          />
        ) : (
          <ItemSchematicListView
            data={filteredData}
            selectedIds={currentSelectedIds}
            onToggleSelection={toggleItemSelection}
            activeTab={activeTab}
          />
        )}
      </div>
    </div>
  );
};

// Grid View Component
interface ItemSchematicGridViewProps {
  data: (Item | Schematic)[];
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  activeTab: ActiveTab;
}

const ItemSchematicGridView: React.FC<ItemSchematicGridViewProps> = ({
  data,
  selectedIds,
  onToggleSelection,
  activeTab
}) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-slate-400">No {activeTab} match current filters</p>
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.map(item => {
          const isSelected = selectedIds.has(item.id);
          
          return (
            <div
              key={item.id}
              className={`relative p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-blue-900/20 border-blue-600/50 shadow-lg'
                  : 'bg-slate-800/50 border-slate-600 hover:border-slate-500 hover:bg-slate-800/70'
              }`}
              onClick={() => onToggleSelection(item.id)}
            >
              {/* Selection Checkbox */}
              <div className="absolute top-2 right-2">
                {isSelected ? (
                  <CheckSquare className="w-4 h-4 text-blue-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {/* Content */}
              <div className="pr-6">
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className="w-8 h-8 flex items-center justify-center rounded bg-slate-700 border border-slate-600 flex-shrink-0">
                    {item.icon_url ? (
                      <img src={item.icon_url} alt={item.name} className="w-5 h-5 object-contain" />
                    ) : (
                      activeTab === 'items' ? (
                        <Package className="w-4 h-4 text-blue-400" />
                      ) : (
                        <FileText className="w-4 h-4 text-purple-400" />
                      )
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-100 text-sm truncate">{item.name}</h4>
                    <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                      {item.category && (
                        <span className="px-1.5 py-0.5 bg-slate-700 text-blue-300 rounded text-xs">
                          {item.category.name}
                        </span>
                      )}
                      {item.type && (
                        <span className="text-slate-400">{item.type.name}</span>
                      )}
                      {item.tier && (
                        <span className="text-slate-400">T{item.tier.level}</span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// List View Component
interface ItemSchematicListViewProps {
  data: (Item | Schematic)[];
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  activeTab: ActiveTab;
}

const ItemSchematicListView: React.FC<ItemSchematicListViewProps> = ({
  data,
  selectedIds,
  onToggleSelection,
  activeTab
}) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-slate-400">No {activeTab} match current filters</p>
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="space-y-2">
        {data.map(item => {
          const isSelected = selectedIds.has(item.id);
          
          return (
            <div
              key={item.id}
              className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-blue-900/20 border-blue-600/50 shadow-lg'
                  : 'bg-slate-800/50 border-slate-600 hover:border-slate-500 hover:bg-slate-800/70'
              }`}
              onClick={() => onToggleSelection(item.id)}
            >
              {/* Selection Checkbox */}
              <div className="flex-shrink-0">
                {isSelected ? (
                  <CheckSquare className="w-4 h-4 text-blue-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {/* Icon */}
              <div className="w-8 h-8 flex items-center justify-center rounded bg-slate-700 border border-slate-600 flex-shrink-0">
                {item.icon_url ? (
                  <img src={item.icon_url} alt={item.name} className="w-5 h-5 object-contain" />
                ) : (
                  activeTab === 'items' ? (
                    <Package className="w-4 h-4 text-blue-400" />
                  ) : (
                    <FileText className="w-4 h-4 text-purple-400" />
                  )
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-100 truncate">{item.name}</h4>
                <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                  {item.category && (
                    <span className="px-2 py-0.5 bg-slate-700 text-blue-300 rounded">
                      {item.category.name}
                    </span>
                  )}
                  {item.type && (
                    <span>{item.type.name}</span>
                  )}
                  {item.tier && (
                    <span className="text-amber-400">Tier {item.tier.level}</span>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-slate-400 mt-1 truncate">{item.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ItemSchematicSelectionPanel; 