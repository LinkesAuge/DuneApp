import React, { useState, useEffect } from 'react';
import { Package, FileText, Eye, Edit, Trash, PanelLeftOpen, PanelLeftClose, PanelRightOpen, PanelRightClose, CheckSquare, Square, Edit2, Link2, Cube, DocumentText, Search, Grid3X3, List, TreePine, SortAsc, SortDesc, Filter, ArrowUp, ArrowDown } from 'lucide-react';
import { useActiveViewData } from '../../hooks/useItemsSchematicsData';
import { useItemsSchematics } from '../../hooks/useItemsSchematics';
import CreateEditItemSchematicModal from './CreateEditItemSchematicModal';
import BulkOperationsModal from './BulkOperationsModal';

import PoiItemLinkModal from './PoiItemLinkModal';
import { getItemWithLocations, getSchematicWithLocations } from '../../lib/api/poiItemLinks';
import { supabase } from '../../lib/supabase';
import type { ItemWithLocations, SchematicWithLocations, PoiLocationInfo, Poi, PoiType } from '../../types';

// Import types
type ViewMode = 'tree' | 'grid' | 'list';
type ActiveView = 'all' | 'items' | 'schematics';
type SortField = 'name' | 'category' | 'type' | 'tier' | 'created_at' | 'updated_at';
type SortDirection = 'asc' | 'desc';

interface Category {
  id: string;
  name: string;
  icon?: string;
  icon_image_id?: string;
  icon_fallback?: string;
}

interface ItemSchematicFilters {
  categories?: string[];
  types?: string[];
  tiers?: string[];
  creators?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  dynamicFields?: Record<string, any>;
}

interface Entity {
  id: string;
  name: string;
  description?: string;
  category_id: string;
  type_id?: string | null;
  tier_id?: string | null;
  icon_url?: string;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  entityType?: 'items' | 'schematics'; // Added to distinguish between items and schematics in 'all' view
}

interface ItemsSchematicsContentProps {
  activeView: 'all' | 'items' | 'schematics';
  viewMode: ViewMode;
  selectedCategory: Category | null;
  searchTerm: string;
  filters: ItemSchematicFilters;
  onItemSelect: (item: Entity | null) => void;
  leftSidebarCollapsed: boolean;
  onToggleLeftSidebar: () => void;
  rightSidebarCollapsed: boolean;
  onToggleRightSidebar: () => void;
  onEntityUpdated?: (entity: Entity) => void; // Callback for when entity is updated
  onEntityDeleted?: (entityId: string) => void; // Callback for when entity is deleted
  refreshTrigger?: number; // Trigger data refresh when this changes
  // Bulk operations
  selectedEntities?: string[]; // IDs of selected entities
  onSelectionChange?: (selectedIds: string[]) => void;
  onBulkOperationTriggered?: (operation: 'edit' | 'delete', selectedEntities: Entity[]) => void;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
      <p className="text-amber-200 font-light tracking-wide"
         style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
        Loading...
      </p>
    </div>
  </div>
);

const ErrorMessage: React.FC<{ error: string }> = ({ error }) => (
  <div className="group relative">
    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
    <div className="absolute inset-0 bg-gradient-to-b from-red-600/10 via-red-500/5 to-transparent rounded-lg" />
    
    <div className="relative p-4 rounded-lg border border-red-400/40">
      <p className="text-red-300 font-light"
         style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
        Error: {error}
      </p>
    </div>
  </div>
);

const EmptyState: React.FC<{ activeView: ActiveView }> = ({ activeView }) => (
  <div className="text-center py-12">
    <div className="inline-block p-4 rounded-full border border-amber-400/20 mb-6 bg-slate-800/60">
      {activeView === 'items' ? (
        <Package className="w-8 h-8 text-amber-400" />
      ) : (
        <FileText className="w-8 h-8 text-amber-400" />
      )}
    </div>
    <p className="text-amber-200 text-lg mb-2 font-light tracking-wide"
       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
      No {activeView} found
    </p>
    <p className="text-amber-200/60 font-light"
       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
      {activeView === 'items' ? 'Items' : 'Schematics'} will appear here once they are added to the database.
    </p>
  </div>
);

const EntityCard: React.FC<{
  entity: Entity;
  type: ActiveView;
  onClick: (entity: Entity) => void;
  onEdit?: (entity: Entity) => void;
  onDelete?: (entity: Entity) => void;
  onPoiLink?: (entity: Entity) => void;
  // Helper functions
  getCategoryName: (categoryId: string) => string;
  getTypeName: (typeId: string) => string;
  getTierName: (tierId: string) => string;
  // Bulk selection props
  isSelected?: boolean;
  onSelectionToggle?: (entityId: string) => void;
  selectionMode?: boolean;
}> = ({ 
  entity, 
  type, 
  onClick, 
  onEdit, 
  onDelete, 
  onPoiLink, 
  getCategoryName,
  getTypeName,
  getTierName,
  isSelected = false, 
  onSelectionToggle, 
  selectionMode = false 
}) => {
  const permissions = {
    canEdit: true, // TODO: Implement real permissions
    canDelete: true, // TODO: Implement real permissions
  };

  // Determine the entity type for display (use entityType when available, fallback to type prop)
  const displayType = entity.entityType || (type === 'all' ? 'items' : type);

  return (
    <div 
      className={`group relative bg-slate-900 border border-slate-700 rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl ${
        isSelected ? 'ring-2 ring-amber-400/50 border-amber-400/60' : 'hover:border-slate-600'
      }`}
      onClick={() => onClick(entity)}
    >
      {/* Selection Checkbox */}
      {selectionMode && onSelectionToggle && (
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectionToggle(entity.id);
            }}
            className="p-1 hover:bg-amber-500/20 rounded"
          >
            {isSelected ? (
              <CheckSquare className="w-4 h-4 text-amber-400" />
            ) : (
              <Square className="w-4 h-4 text-amber-200/60" />
            )}
          </button>
        </div>
      )}

      {/* Header with Icon and Name */}
      <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          {/* Entity Icon */}
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-700 border border-slate-600 flex-shrink-0">
            {entity.icon_url ? (
              <img 
                src={entity.icon_url} 
                alt={entity.name}
                className="w-6 h-6 object-contain"
              />
            ) : (
              displayType === 'items' ? (
                <Package className="w-5 h-5 text-amber-400" />
              ) : (
                <FileText className="w-5 h-5 text-amber-400" />
              )
            )}
          </div>
          
          {/* Entity Info */}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-amber-200 truncate"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              {entity.name}
            </h3>
            <div className="flex items-center space-x-2 text-xs">
              {/* Show entity type badge when in 'all' view */}
              {type === 'all' && (
                <span className={`px-2 py-0.5 rounded ${
                  displayType === 'items' ? 'bg-amber-600/70 text-amber-200' : 'bg-blue-600/70 text-blue-200'
                }`}>
                  {displayType === 'items' ? 'Item' : 'Schematic'}
                </span>
              )}
              {entity.category_id && (
                <span className="px-2 py-0.5 bg-slate-700 text-amber-300 rounded">
                  {getCategoryName(entity.category_id)}
                </span>
              )}
              {entity.type_id && (
                <span className="px-2 py-0.5 bg-blue-600/70 text-blue-200 rounded">
                  {getTypeName(entity.type_id)}
                </span>
              )}
              {entity.tier_id && (
                <span className="px-2 py-0.5 bg-amber-600/70 text-amber-200 rounded">
                  {getTierName(entity.tier_id)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {entity.description && (
          <p className="text-sm text-slate-300 line-clamp-2 mb-3"
             style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            {entity.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick(entity);
              }}
              className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-700/50 rounded transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            {onPoiLink && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPoiLink(entity);
                }}
                className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-slate-700/50 rounded transition-colors"
                title="Manage POI Links"
              >
                <Link2 className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {permissions.canEdit && onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(entity);
                }}
                className="p-1.5 text-slate-400 hover:text-blue-300 hover:bg-slate-700/50 rounded transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {permissions.canDelete && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(entity);
                }}
                className="p-1.5 text-slate-400 hover:text-red-300 hover:bg-slate-700/50 rounded transition-colors"
                title="Delete"
              >
                <Trash className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const GridView: React.FC<{
  entities: Entity[];
  activeView: ActiveView;
  onItemSelect: (item: Entity) => void;
  onEdit?: (entity: Entity) => void;
  onDelete?: (entity: Entity) => void;
  onPoiLink?: (entity: Entity) => void;
  // Helper functions
  getCategoryName: (categoryId: string) => string;
  getTypeName: (typeId: string) => string;
  getTierName: (tierId: string) => string;
  // Bulk selection props
  selectedEntities?: string[];
  onSelectionToggle?: (entityId: string) => void;
  selectionMode?: boolean;
}> = ({ 
  entities, 
  activeView, 
  onItemSelect, 
  onEdit, 
  onDelete, 
  onPoiLink, 
  getCategoryName,
  getTypeName,
  getTierName,
  selectedEntities = [], 
  onSelectionToggle, 
  selectionMode = false 
}) => {
  if (entities.length === 0) {
    return <EmptyState activeView={activeView} />;
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {entities.map((entity) => (
          <EntityCard
            key={entity.id}
            entity={entity}
            type={activeView}
            onClick={onItemSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            onPoiLink={onPoiLink}
            isSelected={selectedEntities.includes(entity.id)}
            onSelectionToggle={onSelectionToggle}
            selectionMode={selectionMode}
            getCategoryName={getCategoryName}
            getTypeName={getTypeName}
            getTierName={getTierName}
          />
        ))}
      </div>
    </div>
  );
};

const ListView: React.FC<{
  entities: Entity[];
  activeView: ActiveView;
  onItemSelect: (item: Entity) => void;
  // Helper functions
  getCategoryName: (categoryId: string) => string;
  getTypeName: (typeId: string) => string;
  getTierName: (tierId: string) => string;
}> = ({ entities, activeView, onItemSelect, getCategoryName, getTypeName, getTierName }) => {
  if (entities.length === 0) {
    return <EmptyState activeView={activeView} />;
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-200">
          {entities.map(entity => (
            <div
              key={entity.id}
              className="p-4 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
              onClick={() => onItemSelect(entity)}
            >
              <div className="flex items-center space-x-4">
                {/* Icon */}
                <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
                  {entity.icon_url ? (
                    <img 
                      src={entity.icon_url} 
                      alt={entity.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                  ) : (
                    activeView === 'items' ? (
                      <Package className="w-5 h-5 text-slate-400" />
                    ) : (
                      <FileText className="w-5 h-5 text-slate-400" />
                    )
                  )}
                </div>

                {/* Info */}
                <div>
                  <h3 className="font-medium text-slate-900">{entity.name}</h3>
                  <p className="text-sm text-slate-500">
                    {getCategoryName(entity.category_id)} {entity.type_id ? `• ${getTypeName(entity.type_id)}` : ''}
                    {entity.tier_id ? ` • ${getTierName(entity.tier_id)}` : ''}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onItemSelect(entity);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TreeView: React.FC<{
  entities: Entity[];
  activeView: ActiveView;
  selectedCategory: Category | null;
  onItemSelect: (item: Entity) => void;
  // Helper functions
  getCategoryName: (categoryId: string) => string;
  getTypeName: (typeId: string) => string;
  getTierName: (tierId: string) => string;
}> = ({ entities, activeView, selectedCategory, onItemSelect, getCategoryName, getTypeName, getTierName }) => {
  if (entities.length === 0) {
    return <EmptyState activeView={activeView} />;
  }

  // Group entities by category for tree view
  const groupedEntities = entities.reduce((acc, entity) => {
    const categoryId = entity.category_id || 'uncategorized';
    const categoryName = getCategoryName(entity.category_id) || 'Uncategorized';
    
    if (!acc[categoryId]) {
      acc[categoryId] = {
        category: { id: categoryId, name: categoryName },
        entities: []
      };
    }
    acc[categoryId].entities.push(entity);
    return acc;
  }, {} as Record<string, { category: { id: string; name: string }; entities: Entity[] }>);

  return (
    <div className="p-6">
      <div className="space-y-6">
        {Object.values(groupedEntities).map(group => (
          <div key={group.category.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
              <h3 className="font-medium text-slate-900">{group.category.name}</h3>
              <p className="text-sm text-slate-500">{group.entities.length} {activeView}</p>
            </div>
            <div className="divide-y divide-slate-200">
              {group.entities.map(entity => (
                <div
                  key={entity.id}
                  className="p-3 hover:bg-slate-50 cursor-pointer flex items-center space-x-3"
                  onClick={() => onItemSelect(entity)}
                >
                  <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                    {entity.icon_url ? (
                      <img 
                        src={entity.icon_url} 
                        alt={entity.name}
                        className="w-6 h-6 object-cover rounded"
                      />
                    ) : (
                      activeView === 'items' ? (
                        <Package className="w-4 h-4 text-slate-400" />
                      ) : (
                        <FileText className="w-4 h-4 text-slate-400" />
                      )
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{entity.name}</h4>
                    {entity.description && (
                      <p className="text-sm text-slate-500 truncate">{entity.description}</p>
                    )}
                  </div>
                  {entity.tier_id && (
                    <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                      {getTierName(entity.tier_id)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ItemsSchematicsContent: React.FC<ItemsSchematicsContentProps> = ({
  activeView,
  viewMode,
  selectedCategory,
  searchTerm,
  filters,
  onItemSelect,
  leftSidebarCollapsed,
  onToggleLeftSidebar,
  rightSidebarCollapsed,
  onToggleRightSidebar,
  onEntityUpdated,
  onEntityDeleted,
  refreshTrigger,
  selectedEntities = [],
  onSelectionChange,
  onBulkOperationTriggered
}) => {
  const { 
    items, 
    schematics, 
    categories, 
    types, 
    tiers, 
    loading, 
    createItem, 
    createSchematic, 
    updateItem, 
    updateSchematic, 
    deleteItem, 
    deleteSchematic,
    getItemById,
    getSchematicById,
    refetchItems,
    refetchSchematics
  } = useItemsSchematics();

  // Content controls state
  const [localViewMode, setLocalViewMode] = useState<ViewMode>(viewMode);
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'updated_at' | 'category' | 'tier'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal states
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [deletingEntity, setDeletingEntity] = useState<Entity | null>(null);
  const [poiLinkEntity, setPoiLinkEntity] = useState<Entity | null>(null);

  // Helper functions to get display names
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  const getTypeName = (typeId: string): string => {
    const type = types.find(t => t.id === typeId);
    return type ? type.name : 'Unknown Type';
  };

  const getTierName = (tierId: string): string => {
    const tier = tiers.find(t => t.id === tierId);
    return tier ? tier.name : 'Unknown Tier';
  };

  // Action handlers
  const handleEdit = (entity: Entity) => {
    console.log('🔧 Edit button clicked, entity:', entity);
    console.log('🔧 Entity field_values:', entity.field_values);
    
    // Get the latest version from local state to ensure we have fresh data
    const latestEntity = entity.entityType === 'items' 
      ? getItemById(entity.id)
      : getSchematicById(entity.id);
    
    if (latestEntity) {
      console.log('🔧 Using latest entity from state:', latestEntity);
      console.log('🔧 Latest field_values:', latestEntity.field_values);
      setEditingEntity({ ...latestEntity, entityType: entity.entityType });
    } else {
      console.log('🔧 Latest entity not found in state, using passed entity');
      setEditingEntity(entity);
    }
  };

  const handleDelete = (entity: Entity) => {
    setDeletingEntity(entity);
  };

  const handleConfirmDelete = async () => {
    if (!deletingEntity) return;

    try {
      const isItem = deletingEntity.entityType === 'items';
      if (isItem) {
        await deleteItem(deletingEntity.id);
      } else {
        await deleteSchematic(deletingEntity.id);
      }
      
      // Call parent callback if provided
      if (onEntityDeleted) {
        onEntityDeleted(deletingEntity.id);
      }
      
      setDeletingEntity(null);
    } catch (error) {
      console.error('Error deleting entity:', error);
      // TODO: Show error toast
    }
  };

  const handlePoiLink = (entity: Entity) => {
    setPoiLinkEntity(entity);
  };

  const handleEntitySaved = (savedEntity: Entity) => {
    console.log('✅ Entity saved successfully:', savedEntity);
    
    // Ensure entityType is preserved from the original editing entity
    const updatedEntity = {
      ...savedEntity,
      entityType: editingEntity?.entityType
    };
    
    setEditingEntity(null);
    
    // Force refresh of data to ensure UI shows latest state
    if (updatedEntity.entityType === 'items') {
      refetchItems();
    } else {
      refetchSchematics();
    }
    
    // Call parent callback if provided
    if (onEntityUpdated) {
      onEntityUpdated(updatedEntity);
    }
  };

  // Simple, clean filtering logic
  const getFilteredEntities = () => {
    console.log('Filtering entities...');
    console.log('Active view:', activeView);
    console.log('Filters:', filters);
    console.log('Items count:', items.length);
    console.log('Schematics count:', schematics.length);

    let entities: Entity[] = [];

    // Step 1: Determine which entity types to include based on view
    const viewFromFilters = filters?.view || activeView;
    
    if (viewFromFilters === 'all') {
      // Include both items and schematics, marked with entityType
      entities = [
        ...items.map(item => ({ ...item, entityType: 'items' as const })),
        ...schematics.map(schematic => ({ ...schematic, entityType: 'schematics' as const }))
      ];
    } else if (viewFromFilters === 'items') {
      entities = items.map(item => ({ ...item, entityType: 'items' as const }));
    } else if (viewFromFilters === 'schematics') {
      entities = schematics.map(schematic => ({ ...schematic, entityType: 'schematics' as const }));
    }

    console.log('After view filtering:', entities.length, 'entities');

    // Step 2: Apply hierarchical filters (categories, types, tiers)
    if (filters) {
      // Category filtering - only show entities whose categories are selected
      if (filters.categories) {
        if (filters.categories.length > 0) {
          entities = entities.filter(entity => 
            filters.categories.includes(entity.category_id)
          );
        } else {
          // Empty array means hide all
          entities = [];
        }
      }

      // Type filtering - only show entities whose types are selected (or have no type)
      if (filters.types && filters.types.length > 0) {
        entities = entities.filter(entity => 
          !entity.type_id || filters.types.includes(entity.type_id)
        );
      }

      // Tier filtering - only show entities whose tiers are selected (or have no tier)
      if (filters.tiers) {
        if (filters.tiers.length > 0) {
          entities = entities.filter(entity => 
            !entity.tier_id || filters.tiers.includes(entity.tier_id)
          );
        } else {
          // Empty array means hide all - filter out all entities
          entities = [];
        }
      }

      // Search filtering
      if (filters.searchTerm && filters.searchTerm.trim()) {
        const searchLower = filters.searchTerm.toLowerCase();
        entities = entities.filter(entity =>
          entity.name.toLowerCase().includes(searchLower) ||
          (entity.description && entity.description.toLowerCase().includes(searchLower))
        );
      }

      // Advanced filters
      if (filters.createdBy && filters.createdBy.trim()) {
        entities = entities.filter(entity =>
          entity.created_by && entity.created_by.toLowerCase().includes(filters.createdBy.toLowerCase())
        );
      }

      if (filters.hasDescription) {
        entities = entities.filter(entity => entity.description && entity.description.trim() !== '');
      }

      // Date range filtering
      if (filters.dateFrom) {
        entities = entities.filter(entity => 
          entity.created_at && entity.created_at >= filters.dateFrom
        );
      }

      if (filters.dateTo) {
        entities = entities.filter(entity => 
          entity.created_at && entity.created_at <= filters.dateTo
        );
      }
    }

    console.log('After all filtering:', entities.length, 'entities');
    return entities;
  };

  const filteredEntities = getFilteredEntities();

  // Apply sorting to filtered entities
  const sortedEntities = filteredEntities.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'category':
        comparison = getCategoryName(a.category_id).localeCompare(getCategoryName(b.category_id));
        break;
      case 'tier':
        const tierA = a.tier_id ? getTierName(a.tier_id) : '';
        const tierB = b.tier_id ? getTierName(b.tier_id) : '';
        comparison = tierA.localeCompare(tierB);
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'updated_at':
        const updatedA = a.updated_at || a.created_at;
        const updatedB = b.updated_at || b.created_at;
        comparison = new Date(updatedA).getTime() - new Date(updatedB).getTime();
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="h-full overflow-hidden">
      {/* Content Controls Bar */}
      <div className="flex items-center justify-end gap-3 p-4 border-b border-amber-400/20">
        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'created_at' | 'updated_at' | 'category' | 'tier')}
            className="px-3 py-1.5 bg-slate-800 border border-slate-600 rounded text-amber-100 text-sm
                     focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
          >
            <option value="name">Name</option>
            <option value="created_at">Created</option>
            <option value="updated_at">Modified</option>
            <option value="category">Category</option>
            <option value="tier">Tier</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1.5 text-amber-200/70 hover:text-amber-300 hover:bg-amber-500/20 rounded transition-colors"
            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          </button>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center border border-slate-600 rounded-lg overflow-hidden">
          <button
            onClick={() => setLocalViewMode('grid')}
            className={`p-2 transition-colors ${
              localViewMode === 'grid' 
                ? 'bg-amber-500/20 text-amber-200' 
                : 'text-amber-200/70 hover:text-amber-200 hover:bg-amber-500/10'
            }`}
            title="Grid View"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLocalViewMode('list')}
            className={`p-2 transition-colors ${
              localViewMode === 'list' 
                ? 'bg-amber-500/20 text-amber-200' 
                : 'text-amber-200/70 hover:text-amber-200 hover:bg-amber-500/10'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLocalViewMode('tree')}
            className={`p-2 transition-colors ${
              localViewMode === 'tree' 
                ? 'bg-amber-500/20 text-amber-200' 
                : 'text-amber-200/70 hover:text-amber-200 hover:bg-amber-500/10'
            }`}
            title="Tree View"
          >
            <TreePine className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {loading.items || loading.schematics ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
            <span className="ml-3 text-amber-200/70 font-light tracking-wide"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Loading {activeView}...
            </span>
          </div>
        ) : filteredEntities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Package className="w-16 h-16 text-amber-200/30 mb-4" />
            <p className="text-lg font-light text-amber-200/70 tracking-wide mb-2"
               style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              No {activeView === 'all' ? 'items or schematics' : activeView} found
            </p>
            <p className="text-sm text-amber-200/50 font-light"
               style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
                     <div className="p-4">
             {/* Render based on view mode */}
             {localViewMode === 'grid' && (
               <GridView 
                 entities={sortedEntities}
                 activeView={activeView}
                 onItemSelect={onItemSelect}
                 onEdit={handleEdit}
                 onDelete={handleDelete}
                 onPoiLink={handlePoiLink}
                 selectedEntities={selectedEntities}
                 onSelectionToggle={(entityId) => {
                   if (onSelectionChange) {
                     const newSelection = selectedEntities.includes(entityId)
                       ? selectedEntities.filter(id => id !== entityId)
                       : [...selectedEntities, entityId];
                     onSelectionChange(newSelection);
                   }
                 }}
                 selectionMode={selectedEntities.length > 0}
                 getCategoryName={getCategoryName}
                 getTypeName={getTypeName}
                 getTierName={getTierName}
               />
             )}
             {localViewMode === 'list' && (
               <ListView 
                 entities={sortedEntities}
                 activeView={activeView}
                 onItemSelect={onItemSelect}
                 getCategoryName={getCategoryName}
                 getTypeName={getTypeName}
                 getTierName={getTierName}
               />
             )}
             {localViewMode === 'tree' && (
               <TreeView 
                 entities={sortedEntities}
                 activeView={activeView}
                 selectedCategory={selectedCategory}
                 onItemSelect={onItemSelect}
                 getCategoryName={getCategoryName}
                 getTypeName={getTypeName}
                 getTierName={getTierName}
               />
             )}
           </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingEntity && (
        <CreateEditItemSchematicModal
          isOpen={true}
          onClose={() => setEditingEntity(null)}
          mode="edit"
          entityType={editingEntity.entityType}
          entity={editingEntity}
          onSuccess={(updatedEntity) => {
            handleEntitySaved(updatedEntity);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingEntity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 border border-slate-600">
            <h3 className="text-lg font-bold text-amber-200 mb-4"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Confirm Delete
            </h3>
            <p className="text-amber-200/80 mb-6"
               style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Are you sure you want to delete "{deletingEntity.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingEntity(null)}
                className="px-4 py-2 text-amber-200 border border-slate-600 rounded hover:bg-slate-700 transition-colors"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POI Link Modal */}
      {poiLinkEntity && (
        <PoiItemLinkModal
          isOpen={true}
          onClose={() => setPoiLinkEntity(null)}
          entity={{
            id: poiLinkEntity.id,
            name: poiLinkEntity.name,
            type: poiLinkEntity.entityType === 'items' ? 'item' : 'schematic'
          }}
          onLinksUpdated={() => {
            // Refresh data if needed
            console.log('POI links updated for:', poiLinkEntity.name);
          }}
        />
      )}
    </div>
  );
};

export default ItemsSchematicsContent; 