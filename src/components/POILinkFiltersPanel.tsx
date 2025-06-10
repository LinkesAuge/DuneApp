import React, { useRef } from 'react';
import { Database, Search, X, Eye, ChevronRight, Lock, Users } from 'lucide-react';
import { isIconUrl } from '../lib/helpers';

interface POILinkFiltersPanelProps {
  onTogglePanel: () => void;
  filterState: {
    filters: any;
    setFilters: (filters: any) => void;
  };
  filterOptions?: {
    poiTypes: any[];
    entityCategories: string[];
    entityTypes: string[];
    tiers: Array<{ id: number; name: string }>;
  };
}

const POILinkFiltersPanel: React.FC<POILinkFiltersPanelProps> = ({ 
  onTogglePanel, 
  filterState,
  filterOptions = { poiTypes: [], entityCategories: [], entityTypes: [], tiers: [] }
}) => {
  const { filters, setFilters } = filterState;
  const [activeTab, setActiveTab] = React.useState<'poi' | 'entity'>('poi');
  const [collapsedPOICategories, setCollapsedPOICategories] = React.useState<Set<string>>(new Set());
  const [collapsedEntityCategories, setCollapsedEntityCategories] = React.useState<Set<string>>(new Set());
  const searchRef = useRef<HTMLInputElement>(null);

  // Helper functions for category management
  const togglePOICategoryCollapse = (category: string) => {
    setCollapsedPOICategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const toggleEntityCategoryCollapse = (category: string) => {
    setCollapsedEntityCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Filter update handlers
  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, search: value });
  };

  const handleMapTypeChange = (mapType: 'both' | 'hagga_basin' | 'deep_desert') => {
    setFilters({ ...filters, mapType });
  };

  const togglePrivacyLevel = (privacyLevel: string) => {
    const currentLevels = filters.privacyLevels || [];
    const newLevels = currentLevels.includes(privacyLevel)
      ? currentLevels.filter((l: string) => l !== privacyLevel)
      : [...currentLevels, privacyLevel];
    setFilters({ ...filters, privacyLevels: newLevels });
  };

  const showAllPrivacyLevels = () => {
    setFilters({ ...filters, privacyLevels: ['global', 'private', 'shared'] });
  };

  const hideAllPrivacyLevels = () => {
    setFilters({ ...filters, privacyLevels: [] });
  };

  const togglePOICategory = (category: string) => {
    const currentCategories = filters.poiCategories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c: string) => c !== category)
      : [...currentCategories, category];
    setFilters({ ...filters, poiCategories: newCategories });
  };

  const toggleEntityCategory = (category: string) => {
    const currentCategories = filters.entityCategories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c: string) => c !== category)
      : [...currentCategories, category];
    setFilters({ ...filters, entityCategories: newCategories });
  };

  const toggleEntityType = (type: string) => {
    const currentTypes = filters.entityTypes || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t: string) => t !== type)
      : [...currentTypes, type];
    setFilters({ ...filters, entityTypes: newTypes });
  };

  const toggleEntityTier = (tierId: string) => {
    const currentTiers = filters.entityTiers || [];
    const newTiers = currentTiers.includes(tierId)
      ? currentTiers.filter((t: string) => t !== tierId)
      : [...currentTiers, tierId];
    setFilters({ ...filters, entityTiers: newTiers });
  };

  const showAllPOICategories = () => {
    const allCategories = [...new Set(filterOptions.poiTypes.map(pt => pt.category))];
    setFilters({ ...filters, poiCategories: allCategories });
  };

  const hideAllPOICategories = () => {
    setFilters({ ...filters, poiCategories: [] });
  };

  const showAllEntityCategories = () => {
    setFilters({ ...filters, entityCategories: [...filterOptions.entityCategories] });
  };

  const hideAllEntityCategories = () => {
    setFilters({ ...filters, entityCategories: [] });
  };

  const showAllEntityTypes = () => {
    setFilters({ ...filters, entityTypes: [...filterOptions.entityTypes] });
  };

  const hideAllEntityTypes = () => {
    setFilters({ ...filters, entityTypes: [] });
  };

  const showAllEntityTiers = () => {
    setFilters({ ...filters, entityTiers: filterOptions.tiers.map(t => t.id.toString()) });
  };

  const hideAllEntityTiers = () => {
    setFilters({ ...filters, entityTiers: [] });
  };

  // Get POI categories from POI types
  const poiCategories = [...new Set(filterOptions.poiTypes.map(pt => pt.category))].sort();

  const renderPOICategorySection = (category: string) => {
    const isCollapsed = collapsedPOICategories.has(category);
    const isSelected = filters.poiCategories?.includes(category);
    const typesInCategory = filterOptions.poiTypes.filter(pt => pt.category === category);
    
    return (
      <div key={`poi-${category}`} className="mb-4">
        {/* Category Header */}
        <div className="flex items-center justify-between mb-2 px-3 py-2 rounded-lg bg-gradient-to-r from-slate-800/40 via-slate-700/30 to-slate-800/40 border border-amber-400/20">
          <button
            onClick={() => togglePOICategory(category)}
            className={`text-sm font-medium tracking-wide flex-1 text-left transition-colors ${
              isSelected ? 'text-amber-200' : 'text-amber-200/60'
            }`}
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
          >
            {category} ({typesInCategory.length})
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => togglePOICategory(category)}
              className={`p-1 rounded transition-all duration-200 ${
                isSelected
                  ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                  : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
              }`}
              title={isSelected ? 'Hide category' : 'Show category'}
            >
              <Eye className="w-3 h-3" />
            </button>
            <button
              onClick={() => togglePOICategoryCollapse(category)}
              className="p-1 text-amber-400/70 hover:text-amber-300 hover:bg-amber-500/10 rounded transition-all duration-200"
              title={isCollapsed ? 'Expand category' : 'Collapse category'}
            >
              <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`} />
            </button>
          </div>
        </div>

        {/* Category Content */}
        {!isCollapsed && (
          <div className="space-y-1 ml-2">
            {typesInCategory.map(poiType => (
              <div key={poiType.id} className="text-xs text-amber-200/70 p-2 bg-slate-800/20 rounded flex items-center gap-2">
                {isIconUrl(poiType.icon) ? (
                  <img
                    src={poiType.icon}
                    alt={poiType.name}
                    className="w-4 h-4 object-contain"
                  />
                ) : (
                  <span className="text-sm">{poiType.icon}</span>
                )}
                <span>{poiType.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderEntityCategorySection = (category: string) => {
    const isCollapsed = collapsedEntityCategories.has(category);
    const isSelected = filters.entityCategories?.includes(category);
    
    return (
      <div key={`entity-${category}`} className="mb-4">
        {/* Category Header */}
        <div className="flex items-center justify-between mb-2 px-3 py-2 rounded-lg bg-gradient-to-r from-slate-800/40 via-slate-700/30 to-slate-800/40 border border-amber-400/20">
          <button
            onClick={() => toggleEntityCategory(category)}
            className={`text-sm font-medium tracking-wide flex-1 text-left transition-colors ${
              isSelected ? 'text-amber-200' : 'text-amber-200/60'
            }`}
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
          >
            {category}
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleEntityCategory(category)}
              className={`p-1 rounded transition-all duration-200 ${
                isSelected
                  ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                  : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
              }`}
              title={isSelected ? 'Hide category' : 'Show category'}
            >
              <Eye className="w-3 h-3" />
            </button>
            <button
              onClick={() => toggleEntityCategoryCollapse(category)}
              className="p-1 text-amber-400/70 hover:text-amber-300 hover:bg-amber-500/10 rounded transition-all duration-200"
              title={isCollapsed ? 'Expand category' : 'Collapse category'}
            >
              <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`} />
            </button>
          </div>
        </div>

        {/* Category Content */}
        {!isCollapsed && (
          <div className="space-y-1 ml-2">
            {filterOptions.entityTypes
              .filter(type => {
                // This is simplified - in real implementation you'd need to know which types belong to which categories
                return true; // For now show all types under each category
              })
              .map(type => {
                const isTypeSelected = filters.entityTypes?.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => toggleEntityType(type)}
                    className={`w-full text-left text-xs p-2 rounded transition-colors ${
                      isTypeSelected
                        ? 'text-amber-200 bg-slate-800/40 border border-amber-400/30'
                        : 'text-amber-200/60 bg-slate-800/20 hover:bg-slate-800/30'
                    }`}
                  >
                    📦 {type}
                  </button>
                );
              })}
          </div>
        )}
      </div>
    );
  };

  const POIFiltersTab = () => (
    <div className="space-y-4">
      {/* Show/Hide All Toggle */}
      <div className="flex justify-between items-center mb-4">
        <label className="block text-sm font-light text-amber-200 tracking-wide" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
          Points of Interest
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const currentCategories = filters.poiCategories || [];
              if (currentCategories.length > 0) {
                // If any categories are selected, hide all
                setFilters({ ...filters, poiCategories: [] });
              } else {
                // If no categories are selected, show all
                const allCategories = [...new Set(filterOptions.poiTypes.map(pt => pt.category))];
                setFilters({ ...filters, poiCategories: allCategories });
              }
            }}
            className="text-xs text-amber-300 hover:text-amber-100 font-light transition-all duration-300 px-2 py-1 rounded border border-amber-400/20 hover:border-amber-400/40 hover:bg-amber-400/10"
            title="Toggle All POIs"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
          >
            {(filters.poiCategories || []).length > 0 ? 'Hide All' : 'Show All'}
          </button>
        </div>
      </div>

      {/* POI Categories in Two Columns */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Left Column */}
        <div className="space-y-1">
          {poiCategories
            .filter((_, index) => index % 2 === 0)
            .map(category => renderPOICategorySection(category))}
        </div>
        
        {/* Right Column */}
        <div className="space-y-1">
          {poiCategories
            .filter((_, index) => index % 2 === 1)
            .map(category => renderPOICategorySection(category))}
        </div>
      </div>

      {/* Privacy Level - moved to bottom */}
      <div className="border-t border-slate-700/50 pt-4">
        <h4 className="text-sm font-medium text-amber-200 mb-3">Additional Filters</h4>
        
        {/* Privacy Level Quick Filters */}
        <div>
          <label className="block text-sm font-medium text-amber-200/80 mb-2">
            Quick Visibility Filters
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setFilters({ ...filters, privacyLevels: ['global'] })}
              className={`px-3 py-2 text-xs rounded border flex items-center justify-center gap-1 transition-all ${
                filters.privacyLevels?.length === 1 && filters.privacyLevels.includes('global')
                  ? 'bg-amber-600/20 border-amber-500/50 text-amber-200'
                  : 'bg-slate-800/50 border-slate-600/50 text-amber-300/70 hover:bg-slate-700/50 hover:text-amber-200'
              }`}
            >
              <Eye className="w-3 h-3 text-green-400" />
              Public Only
            </button>
            <button
              onClick={() => setFilters({ ...filters, privacyLevels: ['private'] })}
              className={`px-3 py-2 text-xs rounded border flex items-center justify-center gap-1 transition-all ${
                filters.privacyLevels?.length === 1 && filters.privacyLevels.includes('private')
                  ? 'bg-amber-600/20 border-amber-500/50 text-amber-200'
                  : 'bg-slate-800/50 border-slate-600/50 text-amber-300/70 hover:bg-slate-700/50 hover:text-amber-200'
              }`}
            >
              <Lock className="w-3 h-3 text-red-400" />
              Private Only
            </button>
            <button
              onClick={() => setFilters({ ...filters, privacyLevels: ['shared'] })}
              className={`px-3 py-2 text-xs rounded border flex items-center justify-center gap-1 transition-all ${
                filters.privacyLevels?.length === 1 && filters.privacyLevels.includes('shared')
                  ? 'bg-amber-600/20 border-amber-500/50 text-amber-200'
                  : 'bg-slate-800/50 border-slate-600/50 text-amber-300/70 hover:bg-slate-700/50 hover:text-amber-200'
              }`}
            >
              <Users className="w-3 h-3 text-blue-400" />
              Shared Only
            </button>
            <button
              onClick={() => setFilters({ ...filters, privacyLevels: ['global', 'private', 'shared'] })}
              className={`px-3 py-2 text-xs rounded border flex items-center justify-center gap-1 transition-all ${
                filters.privacyLevels?.length === 3
                  ? 'bg-amber-600/20 border-amber-500/50 text-amber-200'
                  : 'bg-slate-800/50 border-slate-600/50 text-amber-300/70 hover:bg-slate-700/50 hover:text-amber-200'
              }`}
            >
              <Eye className="w-3 h-3 text-amber-300" />
              Show All
            </button>
          </div>
          <div className="mt-2 text-xs text-amber-300/70">
            Icons show privacy levels on map POIs: <Eye className="w-3 h-3 inline text-green-400" /> Public, <Lock className="w-3 h-3 inline text-red-400" /> Private, <Users className="w-3 h-3 inline text-blue-400" /> Shared
          </div>
        </div>
      </div>
    </div>
  );

  const EntityFiltersTab = () => (
    <div className="space-y-4">
      {/* Show All / Hide All Button for Entities */}
      <div className="flex justify-between items-center mb-4">
        <label className="block text-sm font-light text-amber-200 tracking-wide" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
          Items & Schematics
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const currentCategories = filters.entityCategories || [];
              const currentTypes = filters.entityTypes || [];
              const currentTiers = filters.entityTiers || [];
              
              // If any entity filters are selected, hide all
              if (currentCategories.length > 0 || currentTypes.length > 0 || currentTiers.length > 0) {
                setFilters({ 
                  ...filters,
                  entityCategories: [], 
                  entityTypes: [], 
                  entityTiers: [] 
                });
              } else {
                // If no entity filters are selected, show all
                const allCategories = filterOptions.entityCategories;
                const allTypes = filterOptions.entityTypes;
                const allTiers = filterOptions.tiers.map(t => t.id.toString());
                
                setFilters({ 
                  ...filters,
                  entityCategories: [...allCategories], 
                  entityTypes: [...allTypes], 
                  entityTiers: [...allTiers] 
                });
              }
            }}
            className="text-xs text-amber-300 hover:text-amber-100 font-light transition-all duration-300 px-2 py-1 rounded border border-amber-400/20 hover:border-amber-400/40 hover:bg-amber-400/10"
            title="Toggle All Entities"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
          >
            {(() => {
              const currentCategories = filters.entityCategories || [];
              const currentTypes = filters.entityTypes || [];
              const currentTiers = filters.entityTiers || [];
              
              return (currentCategories.length > 0 || currentTypes.length > 0 || currentTiers.length > 0) ? 'Hide All' : 'Show All';
            })()}
          </button>
        </div>
      </div>

      {/* Entity Categories in Two Columns */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Left Column */}
        <div className="space-y-1">
          {filterOptions.entityCategories
            .filter((_, index) => index % 2 === 0)
            .map((category) => renderEntityCategorySection(category))}
        </div>
        
        {/* Right Column */}
        <div className="space-y-1">
          {filterOptions.entityCategories
            .filter((_, index) => index % 2 === 1)
            .map((category) => renderEntityCategorySection(category))}
        </div>
      </div>

      {/* Additional Filters */}
      <div className="border-t border-slate-700/50 pt-4">
        <h4 className="text-sm font-medium text-amber-200 mb-3">Additional Filters</h4>
        
        {/* Entity Tiers Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-amber-200/80 mb-2">
            Entity Tiers
          </label>
          <div className="grid grid-cols-2 gap-2">
            {filterOptions.tiers.slice(0, 6).map(tier => {
              const tierKey = tier.id.toString();
              const isSelected = filters.entityTiers?.includes(tierKey);
              
              return (
                <button
                  key={tier.id}
                  onClick={() => toggleEntityTier(tierKey)}
                  className={`px-3 py-2 text-xs rounded border flex items-center justify-center gap-1 transition-all ${
                    isSelected
                      ? 'bg-amber-600/20 border-amber-500/50 text-amber-200'
                      : 'bg-slate-800/50 border-slate-600/50 text-amber-300/70 hover:bg-slate-700/50 hover:text-amber-200'
                  }`}
                >
                  {tier.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Entity Types Section */}
        <div>
          <label className="block text-sm font-medium text-amber-200/80 mb-2">
            Entity Types
          </label>
          <div className="grid grid-cols-2 gap-2">
            {filterOptions.entityTypes.slice(0, 4).map(type => {
              const isSelected = filters.entityTypes?.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleEntityType(type)}
                  className={`px-3 py-2 text-xs rounded border flex items-center justify-center gap-1 transition-all ${
                    isSelected
                      ? 'bg-amber-600/20 border-amber-500/50 text-amber-200'
                      : 'bg-slate-800/50 border-slate-600/50 text-amber-300/70 hover:bg-slate-700/50 hover:text-amber-200'
                  }`}
                >
                  📦 {type}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const clearAllFilters = () => {
    setFilters({
      search: '',
      mapType: 'both',
      privacyLevels: ['global', 'private', 'shared'],
      poiCategories: [...new Set(filterOptions.poiTypes.map(pt => pt.category))],
      entityCategories: [...filterOptions.entityCategories],
      entityTypes: [...filterOptions.entityTypes],
      entityTiers: filterOptions.tiers.map(t => t.id.toString()),
      dateRange: null,
      createdBy: []
    });
  };

  return (
    <div className="w-[30rem] dune-panel border-r overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-600">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-amber-200 flex items-center" 
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            <Database size={16} className="mr-2" />
            Filters
          </h3>
          <button 
            className="dune-button-secondary py-1 px-2 text-xs rounded"
            onClick={onTogglePanel}
          >
            ⬅️
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Search */}
        <div className="p-4 border-b border-slate-600">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400/70 w-4 h-4" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search POI links..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-amber-200 placeholder-amber-200/40 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all duration-200"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
            />
            {filters.search && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400/70 hover:text-amber-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Map Type Filter */}
        <div className="p-4 border-b border-slate-600">
          <h3 className="text-sm font-medium text-amber-300 mb-3"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            Map Type
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'both', label: 'Both' },
              { value: 'hagga_basin', label: 'Hagga Basin' },
              { value: 'deep_desert', label: 'Deep Desert' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => handleMapTypeChange(option.value as any)}
                className={`p-2 rounded-lg text-xs transition-all duration-200 ${
                  filters.mapType === option.value
                    ? 'bg-amber-500/20 border border-amber-400/50 text-amber-200'
                    : 'bg-slate-800/40 border border-slate-600/50 text-amber-200/70 hover:border-amber-400/30'
                }`}
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="p-4">
          {/* Tab Navigation */}
          <div className="flex mb-4 bg-slate-800/30 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('poi')}
              className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-all duration-200 ${
                activeTab === 'poi'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-400/30'
                  : 'text-amber-200/70 hover:text-amber-200 hover:bg-slate-700/50'
              }`}
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
            >
              POI Filters
            </button>
            <button
              onClick={() => setActiveTab('entity')}
              className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-all duration-200 ${
                activeTab === 'entity'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-400/30'
                  : 'text-amber-200/70 hover:text-amber-200 hover:bg-slate-700/50'
              }`}
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
            >
              Entity Filters
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'poi' ? <POIFiltersTab /> : <EntityFiltersTab />}
        </div>

        {/* Clear All Filters */}
        <div className="p-4 border-t border-slate-600">
          <button 
            className="w-full dune-button-secondary text-sm py-2"
            onClick={clearAllFilters}
          >
            Reset All Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default POILinkFiltersPanel; 