import React, { useState } from 'react';
import { Package, List, Grid, CheckSquare, Square, Filter } from 'lucide-react';
import { useTiers } from '../../../hooks/useTiers';
import { ImagePreview } from '../../shared/ImagePreview';
import PaginationControls from '../../shared/PaginationControls';

interface EntitiesPanelProps {
  onTogglePanel: () => void;
  filterState: any; // Will be properly typed when we import the hook
}

const EntitiesPanel: React.FC<EntitiesPanelProps> = ({ onTogglePanel, filterState }) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  
  // Use the tiers hook to get tier names
  const { getTierName } = useTiers();
  
  const {
    entities,
    filterCounts,
    selectedEntityIds,
    toggleEntitySelection,
    clearAllSelections,
    loading,
    pagination,
    changePage,
    changeItemsPerPage
  } = filterState;

  // Bulk selection handlers
  const selectAllFiltered = () => {
    entities.forEach((entity: any) => {
      if (!selectedEntityIds.has(entity.id)) {
        toggleEntitySelection(entity.id);
      }
    });
  };

  const clearEntitySelection = () => {
    selectedEntityIds.forEach((entityId: string) => {
      toggleEntitySelection(entityId);
    });
  };

  // Get entity type information
  const getEntityTypeInfo = (entity: any) => {
    const isSchematic = Boolean(entity.is_schematic);
    return {
      icon: isSchematic ? '📋' : '🔧',
      label: isSchematic ? 'Schematic' : 'Item',
      color: isSchematic ? 'text-blue-400' : 'text-green-400'
    };
  };

  // Get tier information with color coding
  const getTierInfo = (tierNumber: number | null | undefined) => {
    if (!tierNumber || tierNumber === 69) return null; // T69 is undefined tier
    
    const tierColors: { [key: number]: string } = {
      1: 'bg-gray-600',
      2: 'bg-blue-600', 
      3: 'bg-green-600',
      4: 'bg-purple-600',
      5: 'bg-orange-600',
      6: 'bg-red-600'
    };
    
    // Get tier name from database using the useTiers hook
    const tierName = getTierName(tierNumber);
    
    return {
      label: tierName || `T${tierNumber}`,
      color: tierColors[tierNumber] || 'bg-gray-600'
    };
  };

  // Get category icon
  const getCategoryIcon = (category: string | null | undefined) => {
    if (!category || typeof category !== 'string') return '📦';
    
    const categoryMap: { [key: string]: string } = {
      'Weapons': '⚔️',
      'Armor': '🛡️',
      'Resources': '🔩',
      'Buildings': '🏗️',
      'Tools': '🔧',
      'Consumables': '🧪',
      'Materials': '🔨',
      'Equipment': '⚙️'
    };
    
    return categoryMap[category] || '📦';
  };

  // Render individual Entity card
  const EntityCard: React.FC<{ entity: any }> = ({ entity }) => {
    const isSelected = selectedEntityIds.has(entity.id);
    const typeInfo = getEntityTypeInfo(entity);
    const tierInfo = getTierInfo(entity.tier_number);
    const categoryIcon = getCategoryIcon(entity.category?.name);

    return (
      <div 
        className={`entity-card rounded-lg p-3 cursor-pointer transition-all duration-200 ${
          isSelected ? 'selected border-purple-500 bg-purple-900/20' : 'border-slate-600 hover:border-amber-400'
        }`}
        onClick={() => toggleEntitySelection(entity.id)}
      >
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleEntitySelection(entity.id)}
            className="mt-1 rounded text-purple-500"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-slate-600 rounded flex items-center justify-center">
                  <ImagePreview
                    iconImageId={entity.icon_image_id}
                    iconFallback={entity.icon_fallback || (entity.is_schematic ? '📋' : '📦')}
                    size="xs"
                    className="w-full h-full"
                  />
                </div>
                <h5 className="font-medium text-amber-200 text-sm truncate">
                  {typeof entity.name === 'string' ? entity.name : 'Unknown Entity'}
                </h5>
              </div>
              {tierInfo && (
                <span className={`text-xs ${tierInfo.color} text-white px-1 rounded`}>
                  {tierInfo.label}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-slate-400">
                {categoryIcon} {entity.type?.name || 'Unknown Type'}
              </span>
              {entity.category?.name && (
                <>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs text-slate-400 capitalize">
                    {entity.category.name}
                  </span>
                </>
              )}

            </div>
            {entity.description && typeof entity.description === 'string' && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {entity.description}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 dune-panel border-r overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-amber-200 flex items-center">
              <Package size={16} className="mr-2" />
              Entities
              <span className="ml-2 text-sm text-slate-400">(Loading...)</span>
            </h3>
            <button 
              className="dune-button-secondary py-1 px-2 text-xs rounded"
              onClick={onTogglePanel}
            >
              ➡️
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-amber-300">Loading entities...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 dune-panel border-r overflow-hidden flex flex-col">
      {/* Entity Panel Header */}
      <div className="p-4 border-b border-slate-600">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-amber-200 flex items-center">
            <Package size={16} className="mr-2" />
            Entities
            <span className="ml-2 text-sm text-slate-400">
              ({filterCounts.availableEntities} available • {filterCounts.selectedEntities} selected)
            </span>
          </h3>
          
          <div className="flex items-center space-x-2">
            {/* View Mode Toggle - Changed order: grid first */}
            <div className="flex bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`py-1 px-2 text-xs rounded ${
                  viewMode === 'grid' ? 'dune-button-primary' : 'dune-button-secondary'
                }`}
              >
                <Grid size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`py-1 px-2 text-xs rounded ${
                  viewMode === 'list' ? 'dune-button-primary' : 'dune-button-secondary'
                }`}
              >
                <List size={14} />
              </button>
            </div>
            {/* Collapse Button */}
            <button 
              className="dune-button-secondary py-1 px-2 text-xs rounded"
              onClick={onTogglePanel}
            >
              ➡️
            </button>
          </div>
        </div>
        
        {/* Entity Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={selectAllFiltered}
            className="dune-button-secondary py-1 px-3 text-xs rounded-lg flex items-center space-x-1"
            disabled={entities.length === 0}
          >
            <CheckSquare size={12} />
            <span>Select All Filtered</span>
          </button>
          <button
            onClick={clearEntitySelection}
            className="dune-button-secondary py-1 px-3 text-xs rounded-lg flex items-center space-x-1"
            disabled={filterCounts.selectedEntities === 0}
          >
            <Square size={12} />
            <span>Clear Selection</span>
          </button>
          <button 
            className="text-xs text-amber-400 hover:text-amber-300 ml-auto flex items-center space-x-1"
            disabled
            title="Filter by Tier coming in Phase 6"
          >
            <Filter size={12} />
            <span>Filter by Tier</span>
          </button>
        </div>
      </div>
      
      {/* Entity Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3">
            {entities.map((entity: any) => (
              <EntityCard key={entity.id} entity={entity} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {entities.map((entity: any) => (
              <EntityCard key={entity.id} entity={entity} />
            ))}
          </div>
        )}
        
        {entities.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            No entities match the current filters
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <PaginationControls
        currentPage={pagination.entities.currentPage}
        totalPages={pagination.entities.totalPages}
        totalItems={pagination.entities.totalItems}
        itemsPerPage={pagination.entities.itemsPerPage}
        onPageChange={(page) => changePage('entities', page)}
        onItemsPerPageChange={(itemsPerPage) => changeItemsPerPage('entities', itemsPerPage)}
        loading={loading}
      />
    </div>
  );
};

export default EntitiesPanel; 