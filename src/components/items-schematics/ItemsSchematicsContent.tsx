import React, { useState, useEffect } from 'react';
import { Package, FileText, Eye, Edit, Trash, PanelLeftOpen, PanelLeftClose, PanelRightOpen, PanelRightClose, CheckSquare, Square, Edit2, Link2, Cube, DocumentText, Search, Grid3X3, List, TreePine, SortAsc, SortDesc, Filter } from 'lucide-react';
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
  // Content controls state
  const [localViewMode, setLocalViewMode] = useState<ViewMode>(viewMode);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  
  // Bulk operations state
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkOperation, setBulkOperation] = useState<'edit' | 'delete'>('edit');
  
  // Selection mode (for bulk operations)
  const selectionMode = selectedEntities.length > 0;

  // POI Integration state
  const [poiLinkModal, setPoiLinkModal] = useState<{
    isOpen: boolean;
    item?: ItemWithLocations;
    schematic?: SchematicWithLocations;
  }>({
    isOpen: false
  });

  // Data for POI integration
  const [availablePois, setAvailablePois] = useState<Poi[]>([]);
  const [poiTypes, setPoiTypes] = useState<PoiType[]>([]);
  const { items: allItems, schematics: allSchematics, deleteItem, deleteSchematic, categories, types, tiers } = useItemsSchematics();

  // Helper functions to resolve names from IDs
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || categoryId;
  };

  const getTypeName = (typeId: string) => {
    const type = types.find(t => t.id === typeId);
    return type?.name || typeId;
  };

  const getTierName = (tierId: string) => {
    const tier = tiers.find(t => t.id === tierId);
    return tier?.name || tierId;
  };

  // Fetch POIs and POI types for the modal
  useEffect(() => {
    const fetchPoiData = async () => {
      try {
        // Fetch POIs
        const { data: pois, error: poisError } = await supabase
          .from('pois')
          .select('*')
          .order('title');
        
        if (!poisError && pois) {
          setAvailablePois(pois);
        }

        // Fetch POI types
        const { data: types, error: typesError } = await supabase
          .from('poi_types')
          .select('*')
          .order('name');
        
        if (!typesError && types) {
          setPoiTypes(types);
        }
      } catch (error) {
        console.error('Failed to fetch POI data:', error);
      }
    };

    fetchPoiData();
  }, []);

  // Handlers for CRUD operations
  const handleEdit = (entity: Entity) => {
    setSelectedEntity(entity);
    setEditModalOpen(true);
  };

  const handleDelete = (entity: Entity) => {
    setSelectedEntity(entity);
    setDeleteConfirmOpen(true);
  };

  const handleEditSuccess = (updatedEntity: Entity) => {
    setEditModalOpen(false);
    setSelectedEntity(null);
    // TODO: Refresh data when API is available
    if (onEntityUpdated) {
      onEntityUpdated(updatedEntity);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEntity) return;
    
    try {
      console.log('Deleting entity:', selectedEntity.id);
      
      // Call the appropriate delete function based on entityType (for 'all' view) or activeView
      let deleteSuccess = false;
      const entityTypeToDelete = selectedEntity.entityType || activeView;
      
      if (entityTypeToDelete === 'items') {
        deleteSuccess = await deleteItem(selectedEntity.id);
      } else if (entityTypeToDelete === 'schematics') {
        deleteSuccess = await deleteSchematic(selectedEntity.id);
      }
      
      if (deleteSuccess) {
        console.log('Entity deleted successfully');
        setDeleteConfirmOpen(false);
        setSelectedEntity(null);
        
        // Notify parent component and trigger refresh
        if (onEntityDeleted) {
          onEntityDeleted(selectedEntity.id);
        }
      } else {
        throw new Error('Delete operation failed');
      }
    } catch (error) {
      console.error('Failed to delete entity:', error);
      // TODO: Show error toast notification
      const entityTypeToDelete = selectedEntity.entityType || activeView;
      alert(`Failed to delete ${entityTypeToDelete === 'items' ? 'item' : 'schematic'}. Please try again.`);
    }
  };

  // Bulk operation handlers
  const handleSelectionToggle = (entityId: string) => {
    if (!onSelectionChange) return;
    
    const newSelection = selectedEntities.includes(entityId)
      ? selectedEntities.filter(id => id !== entityId)
      : [...selectedEntities, entityId];
    
    onSelectionChange(newSelection);
  };

  const handleBulkEdit = () => {
    if (selectedEntities.length === 0) return;
    
    const selectedEntityData = filteredEntities.filter(entity => selectedEntities.includes(entity.id));
    if (onBulkOperationTriggered) {
      onBulkOperationTriggered('edit', selectedEntityData);
    } else {
      setBulkOperation('edit');
      setBulkModalOpen(true);
    }
  };

  const handleBulkDelete = () => {
    if (selectedEntities.length === 0) return;
    
    const selectedEntityData = filteredEntities.filter(entity => selectedEntities.includes(entity.id));
    if (onBulkOperationTriggered) {
      onBulkOperationTriggered('delete', selectedEntityData);
    } else {
      setBulkOperation('delete');
      setBulkModalOpen(true);
    }
  };

  const handleBulkOperationSuccess = (operation: string, count: number) => {
    setBulkModalOpen(false);
    // Clear selection after successful operation
    if (onSelectionChange) {
      onSelectionChange([]);
    }
    
    // TODO: Show success toast and refresh data
    console.log(`Bulk ${operation} completed for ${count} entities`);
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    
    if (selectedEntities.length === filteredEntities.length) {
      // Deselect all
      onSelectionChange([]);
    } else {
      // Select all
      onSelectionChange(filteredEntities.map(entity => entity.id));
    }
  };

  // POI link handlers
  const handleOpenPoiLinkModal = async (entity: Entity) => {
    try {
      // Determine the entity type (use entityType when available, fallback to activeView)
      const entityType = entity.entityType || activeView;
      
      if (entityType === 'items') {
        // Fetch item with location data
        const itemWithLocations = await getItemWithLocations(entity.id);
        if (itemWithLocations) {
          setPoiLinkModal({
            isOpen: true,
            item: itemWithLocations
          });
        }
      } else if (entityType === 'schematics') {
        // Fetch schematic with location data
        const schematicWithLocations = await getSchematicWithLocations(entity.id);
        if (schematicWithLocations) {
          setPoiLinkModal({
            isOpen: true,
            schematic: schematicWithLocations
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch entity with locations:', error);
      // Fallback: open modal with basic entity data
      const entityType = entity.entityType || activeView;
      if (entityType === 'items') {
        setPoiLinkModal({
          isOpen: true,
          item: entity as ItemWithLocations
        });
      } else {
        setPoiLinkModal({
          isOpen: true,
          schematic: entity as SchematicWithLocations
        });
      }
    }
  };

  const handleClosePoisLinkModal = () => {
    setPoiLinkModal({ isOpen: false });
  };

  const handlePoiLinkSuccess = () => {
    // Refresh data to show updated POI links
    // This could be optimized to only refresh the specific entity
    window.location.reload(); // Simple approach for now
  };

  // Get the appropriate data based on activeView
  const getEntitiesForView = () => {
    if (activeView === 'all') {
      // Combine items and schematics, but add a 'type' field to distinguish them
      const itemsWithType = allItems.map(item => ({ ...item, entityType: 'items' as const }));
      const schematicsWithType = allSchematics.map(schematic => ({ ...schematic, entityType: 'schematics' as const }));
      return [...itemsWithType, ...schematicsWithType];
    } else if (activeView === 'items') {
      return allItems.map(item => ({ ...item, entityType: 'items' as const }));
    } else {
      return allSchematics.map(schematic => ({ ...schematic, entityType: 'schematics' as const }));
    }
  };

  const entities = getEntitiesForView();
  const loading = false; // Since we're using the pre-loaded data
  const error = null;

  // Refresh data when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      // Force component re-render by updating a local state if needed
      // The useItemsSchematics hook should handle data refresh automatically
    }
  }, [refreshTrigger]);

  // Apply additional client-side filters and search
  const filteredEntities = entities.filter(entity => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = entity.name.toLowerCase().includes(searchLower);
      const descMatch = entity.description?.toLowerCase().includes(searchLower);
      const categoryMatch = getCategoryName(entity.category_id).toLowerCase().includes(searchLower);
      const typeMatch = entity.type_id ? getTypeName(entity.type_id).toLowerCase().includes(searchLower) : false;
      
      if (!nameMatch && !descMatch && !categoryMatch && !typeMatch) {
        return false;
      }
    }

    // Category filtering - if categories are specified, entity must be in one of them
    if (filters.categories?.length) {
      if (!entity.category_id || !filters.categories.includes(entity.category_id)) {
        return false;
      }
    }

    // Type filtering - if types are specified, entity must be one of them
    if (filters.types?.length) {
      if (!entity.type_id || !filters.types.includes(entity.type_id)) {
        return false;
      }
    }

    // Tier filtering - if tiers are specified, entity must be one of them
    if (filters.tiers?.length) {
      if (!entity.tier_id || !filters.tiers.includes(entity.tier_id)) {
        return false;
      }
    }

    // Additional date range filtering
    if (filters.dateRange?.start) {
      const entityDate = new Date(entity.created_at);
      const startDate = new Date(filters.dateRange.start);
      if (entityDate < startDate) return false;
    }
    
    if (filters.dateRange?.end) {
      const entityDate = new Date(entity.created_at);
      const endDate = new Date(filters.dateRange.end);
      if (entityDate > endDate) return false;
    }

    // Creator filtering
    if (filters.creators?.length && !filters.creators.includes(entity.created_by || '')) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    // Apply sorting
    let comparison = 0;
    
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'category':
        comparison = getCategoryName(a.category_id || '').localeCompare(getCategoryName(b.category_id || ''));
        break;
      case 'type':
        comparison = (a.type_id ? getTypeName(a.type_id) : '').localeCompare(b.type_id ? getTypeName(b.type_id) : '');
        break;
      case 'tier':
        comparison = (a.tier_id ? getTierName(a.tier_id) : '').localeCompare(b.tier_id ? getTierName(b.tier_id) : '');
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'updated_at':
        comparison = new Date(a.updated_at || a.created_at).getTime() - new Date(b.updated_at || b.created_at).getTime();
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  const renderContent = () => {
    switch (localViewMode) {
      case 'tree':
        return (
          <TreeView
            entities={filteredEntities}
            activeView={activeView}
            selectedCategory={selectedCategory}
            onItemSelect={onItemSelect}
            getCategoryName={getCategoryName}
            getTypeName={getTypeName}
            getTierName={getTierName}
          />
        );
      case 'grid':
        return (
          <GridView
            entities={filteredEntities}
            activeView={activeView}
            onItemSelect={onItemSelect}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPoiLink={handleOpenPoiLinkModal}
            getCategoryName={getCategoryName}
            getTypeName={getTypeName}
            getTierName={getTierName}
            selectedEntities={selectedEntities}
            onSelectionToggle={handleSelectionToggle}
            selectionMode={selectionMode}
          />
        );
      case 'list':
        return (
          <ListView
            entities={filteredEntities}
            activeView={activeView}
            onItemSelect={onItemSelect}
            getCategoryName={getCategoryName}
            getTypeName={getTypeName}
            getTierName={getTierName}
          />
        );
      default:
        return (
          <GridView 
            entities={filteredEntities} 
            activeView={activeView} 
            onItemSelect={onItemSelect}
            getCategoryName={getCategoryName}
            getTypeName={getTypeName}
            getTierName={getTierName}
          />
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Bulk Operations Toolbar - Only show when in selection mode */}
      {selectionMode && (
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-amber-600/10 via-amber-500/5 to-transparent" />
          
          <div className="relative border-b border-amber-400/20 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-amber-200/70 font-light"
                   style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                {selectedEntities.length} selected
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-amber-300 hover:text-amber-200 transition-colors duration-200 font-light tracking-wide"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                >
                  {selectedEntities.length === filteredEntities.length ? 'Deselect All' : 'Select All'}
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBulkEdit}
                    className="group relative px-3 py-1.5 text-sm text-amber-300 hover:text-amber-200 border border-amber-300/40 
                             hover:bg-amber-300/10 rounded transition-all duration-200 flex items-center gap-1 font-light"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                  >
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded" />
                    <span className="relative flex items-center gap-1">
                      <Edit2 className="w-4 h-4" />
                      Edit {selectedEntities.length}
                    </span>
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="group relative px-3 py-1.5 text-sm text-red-300 hover:text-red-200 border border-red-400/40 
                             hover:bg-red-400/20 rounded transition-all duration-200 flex items-center gap-1 font-light"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                  >
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded" />
                    <span className="relative flex items-center gap-1">
                      <Trash className="w-4 h-4" />
                      Delete {selectedEntities.length}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area with Top Controls */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Right Controls */}
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-amber-200/70 font-light tracking-wide"
                 style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              {filteredEntities.length} {activeView} found
            </div>
            
            <div className="flex items-center gap-4">
              {/* Sorting Controls */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-amber-200/70 whitespace-nowrap font-light tracking-wide"
                       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  Sort by:
                </label>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-amber-100 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                >
                  {[
                    { value: 'name', label: 'Name' },
                    { value: 'category', label: 'Category' },
                    { value: 'type', label: 'Type' },
                    { value: 'tier', label: 'Tier' },
                    { value: 'created_at', label: 'Created Date' },
                    { value: 'updated_at', label: 'Updated Date' },
                  ].map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  className="p-2 bg-slate-800 text-amber-200/70 hover:bg-slate-700 hover:text-amber-300 border border-slate-600 rounded transition-colors duration-150"
                  title={`Sort direction: ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
                >
                  {sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex border border-slate-600 rounded">
                <button
                  onClick={() => setLocalViewMode('tree')}
                  className={`p-2 transition-colors duration-150 ${
                    localViewMode === 'tree' 
                      ? 'bg-slate-700 text-amber-300' 
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-200/70 hover:text-amber-200'
                  }`}
                  title="Tree View"
                >
                  <TreePine className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLocalViewMode('grid')}
                  className={`p-2 transition-colors duration-150 ${
                    localViewMode === 'grid' 
                      ? 'bg-slate-700 text-amber-300' 
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-200/70 hover:text-amber-200'
                  }`}
                  title="Grid View"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLocalViewMode('list')}
                  className={`p-2 transition-colors duration-150 ${
                    localViewMode === 'list' 
                      ? 'bg-slate-700 text-amber-300' 
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-200/70 hover:text-amber-200'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>

      {/* Edit Modal */}
      {editModalOpen && selectedEntity && (
        <CreateEditItemSchematicModal
          mode="edit"
          entityType={activeView}
          entity={selectedEntity}
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedEntity(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && selectedEntity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="group relative max-w-md w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
            <div className="absolute inset-0 bg-gradient-to-b from-red-600/10 via-red-500/5 to-transparent rounded-lg" />
            
            <div className="relative p-6 rounded-lg border border-red-400/40">
              <h3 className="text-lg font-medium text-red-300 mb-4 tracking-wide"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                Delete {(() => {
                  const entityType = selectedEntity.entityType || activeView;
                  return entityType === 'items' ? 'Item' : 'Schematic';
                })()}
              </h3>
              <p className="text-amber-200/70 mb-6 font-light"
                 style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                Are you sure you want to delete "{selectedEntity.name}"? This action cannot be undone.
              </p>
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={() => {
                    setDeleteConfirmOpen(false);
                    setSelectedEntity(null);
                  }}
                  className="group relative px-4 py-2 text-amber-200 border border-amber-400/40 
                           hover:bg-amber-400/10 rounded-lg transition-all duration-200 font-light"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                >
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-lg" />
                  <span className="relative">Cancel</span>
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="group relative px-4 py-2 text-red-200 border border-red-400/40 
                           hover:bg-red-400/20 rounded-lg transition-all duration-200 font-light"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                >
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-lg" />
                  <span className="relative">Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Operations Modal */}
      {bulkModalOpen && (
        <BulkOperationsModal
          isOpen={bulkModalOpen}
          onClose={() => setBulkModalOpen(false)}
          selectedEntities={filteredEntities.filter(entity => selectedEntities.includes(entity.id))}
          entityType={activeView}
          operation={bulkOperation}
          onSuccess={handleBulkOperationSuccess}
        />
      )}

      {/* POI Link Modal */}
      <PoiItemLinkModal
        isOpen={poiLinkModal.isOpen}
        onClose={handleClosePoisLinkModal}
        onSuccess={handlePoiLinkSuccess}
        item={poiLinkModal.item}
        schematic={poiLinkModal.schematic}
        availablePois={availablePois}
        availableItems={allItems}
        availableSchematics={allSchematics}
        poiTypes={poiTypes}
      />
    </div>
  );
};

export default ItemsSchematicsContent; 