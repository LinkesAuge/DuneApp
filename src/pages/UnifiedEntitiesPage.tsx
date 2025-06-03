// Unified Entities Page - Simplified Implementation
import React, { useState } from 'react';
import { Package, FileText, Grid3X3, List, Plus, Filter, Search } from 'lucide-react';
import { useAuth } from '../components/auth/AuthProvider';
import EntityList from '../components/items-schematics/EntityList';
import type { Entity, EntityFilters } from '../types/unified-entities';

const UnifiedEntitiesPage: React.FC = () => {
  const { user } = useAuth();
  
  // State management
  const [activeView, setActiveView] = useState<'all' | 'items' | 'schematics'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<EntityFilters>({});
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Bulk operations state
  const [selectedEntityIds, setSelectedEntityIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  // Create effective filters based on active view
  const getEffectiveFilters = (): EntityFilters => {
    const baseFilters = { ...filters };
    
    if (activeView === 'items') {
      baseFilters.is_schematic = false;
    } else if (activeView === 'schematics') {
      baseFilters.is_schematic = true;
    }
    
    return baseFilters;
  };

  // Event handlers
  const handleViewChange = (view: 'all' | 'items' | 'schematics') => {
    setActiveView(view);
    setSelectedEntityIds([]); // Clear selection when switching views
  };

  const handleEntitySelect = (entity: Entity) => {
    setSelectedEntity(entity);
    // TODO: Open details panel or modal
  };

  const handleEntityEdit = (entity: Entity) => {
    // TODO: Open edit modal
    console.log('Edit entity:', entity);
  };

  const handleEntityDelete = (entity: Entity) => {
    // TODO: Open delete confirmation modal
    console.log('Delete entity:', entity);
  };

  const handleEntityPoiLink = (entity: Entity) => {
    // TODO: Open POI linking modal
    console.log('Link entity to POI:', entity);
  };

  const handleCreateNew = () => {
    // TODO: Open create modal
    console.log('Create new entity');
  };

  const handleBulkDelete = () => {
    if (selectedEntityIds.length === 0) return;
    // TODO: Implement bulk delete
    console.log('Bulk delete entities:', selectedEntityIds);
  };

  const handleSelectionModeToggle = () => {
    setSelectionMode(!selectionMode);
    if (!selectionMode) {
      setSelectedEntityIds([]); // Clear selection when entering selection mode
    }
  };

  return (
    <div className="min-h-screen">
      {/* Main background image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(/images/main-bg.webp)` }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="group relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
            <div className="absolute inset-0 bg-gradient-to-b from-amber-600/10 via-amber-500/5 to-transparent rounded-lg" />
            
            <div className="relative p-6 rounded-lg border border-amber-400/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-bold text-amber-100 tracking-wide"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    Items & Schematics
                  </h1>
                  
                  {/* View Toggle Buttons */}
                  <div className="flex items-center space-x-1 bg-slate-800/50 rounded-lg p-1 border border-slate-600">
                    <button
                      onClick={() => handleViewChange('all')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeView === 'all'
                          ? 'bg-amber-600 text-white shadow-lg'
                          : 'text-amber-200 hover:text-amber-100 hover:bg-slate-700'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => handleViewChange('items')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                        activeView === 'items'
                          ? 'bg-amber-600 text-white shadow-lg'
                          : 'text-amber-200 hover:text-amber-100 hover:bg-slate-700'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      <span>Items</span>
                    </button>
                    <button
                      onClick={() => handleViewChange('schematics')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                        activeView === 'schematics'
                          ? 'bg-amber-600 text-white shadow-lg'
                          : 'text-amber-200 hover:text-amber-100 hover:bg-slate-700'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Schematics</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* View Mode Toggle */}
                  <div className="flex items-center space-x-1 bg-slate-800/50 rounded-lg p-1 border border-slate-600">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-all duration-200 ${
                        viewMode === 'grid'
                          ? 'bg-amber-600 text-white'
                          : 'text-amber-200 hover:text-amber-100 hover:bg-slate-700'
                      }`}
                      title="Grid View"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-all duration-200 ${
                        viewMode === 'list'
                          ? 'bg-amber-600 text-white'
                          : 'text-amber-200 hover:text-amber-100 hover:bg-slate-700'
                      }`}
                      title="List View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Selection Mode Toggle */}
                  <button
                    onClick={handleSelectionModeToggle}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                      selectionMode
                        ? 'bg-amber-600/20 text-amber-300 border-amber-500/40 hover:bg-amber-600/30'
                        : 'bg-slate-800/50 text-amber-200 border-slate-600 hover:bg-slate-700 hover:text-amber-100'
                    }`}
                  >
                    {selectionMode ? 'Exit Selection' : 'Select'}
                  </button>

                  {/* Bulk Actions */}
                  {selectionMode && selectedEntityIds.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="px-3 py-2 bg-red-600/20 text-red-300 border border-red-500/40 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
                    >
                      Delete ({selectedEntityIds.length})
                    </button>
                  )}

                  {/* Create Button */}
                  <button
                    onClick={handleCreateNew}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Entity</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="group relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
            
            <div className="relative p-4 rounded-lg border border-amber-400/20">
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-400" />
                  <input
                    type="text"
                    placeholder={`Search ${activeView}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-amber-100 placeholder-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                  />
                </div>

                {/* Filter Button */}
                <button
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-amber-200 hover:text-amber-100 hover:bg-slate-700 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>
            </div>
          </div>

          {/* Entity List */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
            
            <div className="relative p-6 rounded-lg border border-amber-400/20 min-h-[600px]">
              <EntityList
                filters={getEffectiveFilters()}
                searchTerm={searchTerm}
                viewMode={viewMode}
                showSearch={false} // We have our own search bar
                onEntitySelect={handleEntitySelect}
                onEntityEdit={handleEntityEdit}
                onEntityDelete={handleEntityDelete}
                onEntityPoiLink={handleEntityPoiLink}
                selectedEntityIds={selectedEntityIds}
                onSelectionChange={setSelectedEntityIds}
                selectionMode={selectionMode}
                refreshTrigger={refreshTrigger}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedEntitiesPage; 