import React, { useState, useEffect } from 'react';
import { Package, FileText, Eye, Edit, Trash, PanelLeftOpen, PanelLeftClose, PanelRightOpen, PanelRightClose, CheckSquare, Square, Edit2, Link2, Cube, DocumentText, Search, Grid3X3, List, TreePine, SortAsc, SortDesc, Filter, ArrowUp, ArrowDown, MapPin, Image as ImageIcon } from 'lucide-react';
import { useActiveViewData } from '../../hooks/useItemsSchematicsData';
import { useItemsSchematics } from '../../hooks/useItemsSchematics';
import { useTiers } from '../../hooks/useTiers';
import { useUnifiedImages } from '../../hooks/useUnifiedImages';
import CreateEditItemSchematicModal from './CreateEditItemSchematicModal';
import BulkOperationsModal from './BulkOperationsModal';


import LinkPoisButton from './LinkPoisButton';
import LinkingButton from './LinkingButton';
import PoiLinkCounter from './PoiLinkCounter';
import { getItemWithLocations, getSchematicWithLocations } from '../../lib/api/poiEntityLinks';
import { supabase } from '../../lib/supabase';
import type { ItemWithLocations, SchematicWithLocations, PoiLocationInfo, Poi, PoiType } from '../../types';
import type { EntityWithRelations, EntityFilters, Category, Type, Tier } from '../../types/unified-entities';

// Import types
type ViewMode = 'tree' | 'grid' | 'list';
type ActiveView = 'all' | 'items' | 'schematics';
type SortField = 'name' | 'category' | 'type' | 'tier' | 'created_at' | 'updated_at';
type SortDirection = 'asc' | 'desc';

// Use centralized types instead of local interfaces

interface ItemsSchematicsContentProps {
  activeView: 'all' | 'items' | 'schematics';
  viewMode: ViewMode;
  selectedCategory: Category | null;
  searchTerm: string;
  filters: EntityFilters;
  onItemSelect: (item: EntityWithRelations | null) => void;
  leftSidebarCollapsed: boolean;
  onToggleLeftSidebar: () => void;
  rightSidebarCollapsed: boolean;
  onToggleRightSidebar: () => void;
  onEntityUpdated?: (entity: EntityWithRelations) => void; // Callback for when entity is updated
  onEntityDeleted?: (entityId: string) => void; // Callback for when entity is deleted
  refreshTrigger?: number; // Trigger data refresh when this changes
  // Bulk operations
  selectedEntities?: string[]; // IDs of selected entities
  onSelectionChange?: (selectedIds: string[]) => void;
  onBulkOperationTriggered?: (operation: 'edit' | 'delete', selectedEntities: EntityWithRelations[]) => void;
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

const EntityImagePreview: React.FC<{ entity: EntityWithRelations }> = ({ entity }) => {
  // Determine the entity type for image fetching
  const displayType = entity.entityType || 'items';
  const imageType = displayType === 'items' ? 'item_screenshot' : 'schematic_screenshot';
  
  // Get images for this entity
  const { images, loading } = useUnifiedImages(entity.id, imageType);
  
  // Don't show anything if no images
  if (loading || !images || images.length === 0) {
    return null;
  }

  // Show first 3 images
  const displayImages = images.slice(0, 3);
  const hasMore = images.length > 3;

  return (
    <div className="mb-3">
      <div className="flex items-center space-x-1 mb-2">
        <ImageIcon className="w-3 h-3 text-amber-400/70" />
        <span className="text-xs text-amber-400/70 font-light"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
          {images.length} image{images.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex space-x-1">
        {displayImages.map((image, index) => (
          <div key={image.id} className="w-12 h-12 rounded overflow-hidden border border-slate-600">
            <img
              src={image.processed_url || image.original_url}
              alt={`${entity.name} screenshot ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        {hasMore && (
          <div className="w-12 h-12 rounded bg-slate-700 border border-slate-600 flex items-center justify-center">
            <span className="text-xs text-amber-400/70 font-light">+{images.length - 3}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const EntityCard: React.FC<{
  entity: EntityWithRelations;
  type: ActiveView;
  onClick: (entity: EntityWithRelations) => void;
  onEdit?: (entity: EntityWithRelations) => void;
  onDelete?: (entity: EntityWithRelations) => void;
  onPoiLink?: (entity: EntityWithRelations) => void;
  onLinksUpdated?: () => void;
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
  onLinksUpdated,
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
  
  // Get images for this entity
  const imageType = displayType === 'items' ? 'item_screenshot' : 'schematic_screenshot';
  const { images, loading: imagesLoading } = useUnifiedImages(entity.id, imageType);
  const hasImages = images && images.length > 0;

  return (
    <div 
      className={`group relative bg-slate-900 border border-slate-700 rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl ${
        isSelected ? 'ring-2 ring-amber-400/50 border-amber-400/60' : 'hover:border-slate-600'
      }`}
      onClick={(e) => {
        e.stopPropagation(); // Prevent closing details panel when clicking on card
        onClick(entity);
      }}
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
                  displayType === 'items' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                }`}>
                  {displayType === 'items' ? 'Item' : 'Schematic'}
                </span>
              )}
              {entity.category && (
                <span className="px-2 py-0.5 bg-slate-700 text-amber-300 rounded">
                  {entity.category.name}
                </span>
              )}
              {entity.type && (
                <span className="px-2 py-0.5 bg-blue-600/70 text-blue-200 rounded">
                  {entity.type.name}
                </span>
              )}
              {entity.tier_number !== undefined && (
                <span className="px-2 py-0.5 bg-amber-600/70 text-amber-200 rounded">
                  {useTiers().getTierName(entity.tier_number)}
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

        {/* Image Preview - Simple hook usage for now */}
        <EntityImagePreview entity={entity} displayType={displayType} />

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
              <LinkingButton
                direction="manage_links"
                onClick={(e) => {
                  e.stopPropagation();
                  onPoiLink(entity);
                }}
              />
            )}
            <div className="flex items-center space-x-1">
              <LinkPoisButton
                entity={entity}
                entityType={entity.entityType === 'schematics' ? 'schematic' : 'item'}
                onLinksUpdated={onLinksUpdated}
              />
              <PoiLinkCounter
                entityId={entity.id}
                entityType={entity.entityType === 'schematics' ? 'schematic' : 'item'}
              />
            </div>
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
  entities: EntityWithRelations[];
  activeView: ActiveView;
  onItemSelect: (item: EntityWithRelations) => void;
  onEdit?: (entity: EntityWithRelations) => void;
  onDelete?: (entity: EntityWithRelations) => void;
  onPoiLink?: (entity: EntityWithRelations) => void;
  onLinksUpdated?: () => void;
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
  onLinksUpdated,
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
            onLinksUpdated={onLinksUpdated}
            isSelected={selectedEntities.includes(entity.id)}
            onSelectionToggle={onSelectionToggle}
            selectionMode={selectionMode}
          />
        ))}
      </div>
    </div>
  );
};

const ListView: React.FC<{
  entities: EntityWithRelations[];
  activeView: ActiveView;
  onItemSelect: (item: EntityWithRelations) => void;
  onEdit?: (entity: EntityWithRelations) => void;
  onDelete?: (entity: EntityWithRelations) => void;
  onPoiLink?: (entity: EntityWithRelations) => void;
  onLinksUpdated?: () => void;
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
  onLinksUpdated,
  selectedEntities = [], 
  onSelectionToggle, 
  selectionMode = false 
}) => {
  if (entities.length === 0) {
    return <EmptyState activeView={activeView} />;
  }

  return (
    <div className="space-y-2">
      {entities.map(entity => {
        const displayType = entity.entityType || (activeView === 'all' ? 'items' : activeView);
        const isSelected = selectedEntities.includes(entity.id);
        
        return (
          <div
            key={entity.id}
            className={`group relative bg-slate-900 border border-slate-700 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl ${
              isSelected ? 'ring-2 ring-amber-400/50 border-amber-400/60' : 'hover:border-slate-600'
            }`}
            onClick={(e) => {
              e.stopPropagation(); // Prevent closing details panel when clicking on card
              onItemSelect(entity);
            }}
          >
            {/* Selection Checkbox */}
            {selectionMode && onSelectionToggle && (
              <div className="absolute top-3 right-3 z-10">
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

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                {/* Icon */}
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-slate-700 border border-slate-600 flex-shrink-0">
                  {entity.icon_url ? (
                    <img 
                      src={entity.icon_url} 
                      alt={entity.name}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    displayType === 'items' ? (
                      <Package className="w-6 h-6 text-amber-400" />
                    ) : (
                      <FileText className="w-6 h-6 text-amber-400" />
                    )
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-bold text-amber-200 truncate"
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      {entity.name}
                    </h3>
                    {/* Entity type badge when in 'all' view */}
                    {activeView === 'all' && (
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        displayType === 'items' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        {displayType === 'items' ? 'Item' : 'Schematic'}
                      </span>
                    )}
                  </div>
                  
                  {/* Tags */}
                  <div className="flex items-center space-x-2 mb-2">
                    {entity.category && (
                      <span className="px-2 py-0.5 text-xs bg-slate-700 text-amber-300 rounded">
                        {entity.category.name}
                      </span>
                    )}
                    {entity.type && (
                      <span className="px-2 py-0.5 text-xs bg-blue-600/70 text-blue-200 rounded">
                        {entity.type.name}
                      </span>
                    )}
                    {entity.tier_number !== undefined && (
                      <span className="px-2 py-0.5 text-xs bg-amber-600/70 text-amber-200 rounded">
                        {useTiers().getTierName(entity.tier_number)}
                      </span>
                    )}
                  </div>
                  
                  {/* Description */}
                  {entity.description && (
                    <p className="text-sm text-slate-300 line-clamp-1"
                       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      {entity.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onItemSelect(entity);
                  }}
                  className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-700/50 rounded transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                {onPoiLink && (
                  <LinkingButton
                    direction="manage_links"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPoiLink(entity);
                    }}
                  />
                )}
                <div className="flex items-center space-x-1">
                  <LinkPoisButton
                    entity={entity}
                    entityType={entity.entityType === 'schematics' ? 'schematic' : 'item'}
                    onLinksUpdated={onLinksUpdated}
                  />
                  <PoiLinkCounter
                    entityId={entity.id}
                    entityType={entity.entityType === 'schematics' ? 'schematic' : 'item'}
                  />
                </div>
                {onEdit && (
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
                {onDelete && (
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
        );
      })}
    </div>
  );
};

const TreeView: React.FC<{
  entities: EntityWithRelations[];
  activeView: ActiveView;
  selectedCategory: Category | null;
  onItemSelect: (item: EntityWithRelations) => void;
  onEdit?: (entity: EntityWithRelations) => void;
  onDelete?: (entity: EntityWithRelations) => void;
  onPoiLink?: (entity: EntityWithRelations) => void;
  onLinksUpdated?: () => void;
  // Bulk selection props
  selectedEntities?: string[];
  onSelectionToggle?: (entityId: string) => void;
  selectionMode?: boolean;
}> = ({ 
  entities, 
  activeView, 
  selectedCategory, 
  onItemSelect, 
  onEdit, 
  onDelete, 
  onPoiLink, 
  onLinksUpdated,
  selectedEntities = [], 
  onSelectionToggle, 
  selectionMode = false 
}) => {
  if (entities.length === 0) {
    return <EmptyState activeView={activeView} />;
  }

  // Group entities by category for tree view
  const groupedEntities = entities.reduce((acc, entity) => {
    const categoryId = entity.category?.id || 'uncategorized';
    const categoryName = entity.category?.name || 'Uncategorized';
    
    if (!acc[categoryId]) {
      acc[categoryId] = {
        category: { id: categoryId, name: categoryName },
        entities: []
      };
    }
    acc[categoryId].entities.push(entity);
    return acc;
  }, {} as Record<string, { category: { id: string; name: string }; entities: EntityWithRelations[] }>);

  return (
    <div className="space-y-4">
      {Object.values(groupedEntities).map(group => (
        <div key={group.category.id} className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
          
          <div className="relative bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
            {/* Category Header */}
            <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-amber-200"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  {group.category.name}
                </h3>
                <span className="px-2 py-1 bg-amber-600/70 text-amber-200 text-xs rounded"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  {group.entities.length} {group.entities.length === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            {/* Entities List */}
            <div className="divide-y divide-slate-700">
              {group.entities.map(entity => {
                const displayType = entity.entityType || (activeView === 'all' ? 'items' : activeView);
                const isSelected = selectedEntities.includes(entity.id);
                
                return (
                  <div
                    key={entity.id}
                    className={`relative p-3 cursor-pointer transition-all duration-200 hover:bg-slate-700/30 ${
                      isSelected ? 'bg-amber-500/10 border-r-2 border-amber-400' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent closing details panel when clicking on card
                      onItemSelect(entity);
                    }}
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

                    <div className="flex items-center space-x-3">
                      {/* Icon */}
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
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-bold text-amber-200 truncate"
                              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                            {entity.name}
                          </h4>
                          {/* Entity type badge when in 'all' view */}
                          {activeView === 'all' && (
                            <span className={`px-2 py-0.5 text-xs rounded ${
                              displayType === 'items' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}>
                              {displayType === 'items' ? 'Item' : 'Schematic'}
                            </span>
                          )}
                        </div>
                        
                        {/* Tags */}
                        <div className="flex items-center space-x-2 mb-1">
                          {entity.type && (
                            <span className="px-2 py-0.5 text-xs bg-blue-600/70 text-blue-200 rounded">
                              {entity.type.name}
                            </span>
                          )}
                          {entity.tier_number !== undefined && (
                            <span className="px-2 py-0.5 text-xs bg-amber-600/70 text-amber-200 rounded">
                              {useTiers().getTierName(entity.tier_number)}
                            </span>
                          )}
                        </div>
                        
                        {/* Description */}
                        {entity.description && (
                          <p className="text-sm text-slate-300 line-clamp-1"
                             style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                            {entity.description}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onItemSelect(entity);
                          }}
                          className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-700/50 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {onPoiLink && (
                          <LinkingButton
                            direction="manage_links"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPoiLink(entity);
                            }}
                          />
                        )}
                        <div className="flex items-center space-x-1">
                          <LinkPoisButton
                            entity={entity}
                            entityType={entity.entityType === 'schematics' ? 'schematic' : 'item'}
                            onLinksUpdated={onLinksUpdated}
                          />
                          <PoiLinkCounter
                            entityId={entity.id}
                            entityType={entity.entityType === 'schematics' ? 'schematic' : 'item'}
                          />
                        </div>
                        {onEdit && (
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
                        {onDelete && (
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
                );
              })}
            </div>
          </div>
        </div>
      ))}
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
  const [editingEntity, setEditingEntity] = useState<EntityWithRelations | null>(null);
  const [deletingEntity, setDeletingEntity] = useState<EntityWithRelations | null>(null);

  // Handle refresh trigger from parent
  useEffect(() => {
    if (refreshTrigger > 0) {
  
      refetchItems();
      refetchSchematics();
    }
  }, [refreshTrigger, refetchItems, refetchSchematics]);

  // Helper functions removed - now using resolved relationship data directly

  // Action handlers
  const handleEdit = (entity: EntityWithRelations) => {
    // Get the latest version from local state to ensure we have fresh data
    const latestEntity = entity.entityType === 'items' 
      ? getItemById(entity.id)
      : getSchematicById(entity.id);
    
    if (latestEntity) {
      setEditingEntity({ ...latestEntity, entityType: entity.entityType });
    } else {
      setEditingEntity(entity);
    }
  };

  const handleDelete = (entity: EntityWithRelations) => {
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



  const handleEntitySaved = (savedEntity: EntityWithRelations) => {
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

  const handleLinksUpdated = () => {
    // Refresh data to show updated link information
    // Small delay to ensure database changes are committed
    setTimeout(() => {
      refetchItems();
      refetchSchematics();
    }, 100);
  };

  // Simple, clean filtering logic
  const getFilteredEntities = () => {

    let entities: EntityWithRelations[] = [];

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



    // Step 2: Apply hierarchical filters (categories, types, tiers)
    if (filters) {
      // Category filtering - always apply, handle empty array as "hide all"
      if (filters.category_id) {
        if (Array.isArray(filters.category_id)) {
          if (filters.category_id.length === 0) {
            // Empty array means "Hide All" - filter out everything
            entities = [];
          } else {
            // Some categories selected - filter to show only those
            entities = entities.filter(entity => 
              entity.category_id && filters.category_id.includes(entity.category_id)
            );
          }
        } else {
          // Single category ID
          entities = entities.filter(entity => 
            entity.category_id === filters.category_id
          );
        }
      }

      // Type filtering
      if (filters.type_id) {
        if (Array.isArray(filters.type_id)) {
          if (filters.type_id.length > 0) {
            entities = entities.filter(entity => 
              entity.type_id && filters.type_id.includes(entity.type_id)
            );
          }
        } else {
          entities = entities.filter(entity => 
            entity.type_id === filters.type_id
          );
        }
      }

      // Tier filtering
      if (filters.tier_number) {
        if (Array.isArray(filters.tier_number)) {
          if (filters.tier_number.length === 0) {
            // Empty array means "Hide All" - filter out everything
            entities = [];
          } else {
            // Some tiers selected - filter to show only those
            entities = entities.filter(entity => 
              entity.tier_number !== undefined && filters.tier_number.includes(entity.tier_number)
            );
          }
        } else {
          entities = entities.filter(entity => 
            entity.tier_number === filters.tier_number
          );
        }
      }

      // Search filtering
      if (filters.search && filters.search.trim()) {
        const searchLower = filters.search.toLowerCase();
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
        const categoryA = a.category?.name || '';
        const categoryB = b.category?.name || '';
        comparison = categoryA.localeCompare(categoryB);
        break;
      case 'tier':
        const tierA = a.tier_number ?? -1;
        const tierB = b.tier_number ?? -1;
        comparison = tierA - tierB;
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
          <div 
            className="p-4"
            onClick={(e) => e.stopPropagation()} // Prevent closing details panel when clicking on content
          >
            {/* Render based on view mode */}
            {localViewMode === 'grid' && (
              <GridView 
                entities={sortedEntities}
                activeView={activeView}
                onItemSelect={onItemSelect}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onLinksUpdated={handleLinksUpdated}
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
              />
            )}
            {localViewMode === 'list' && (
              <ListView 
                entities={sortedEntities}
                activeView={activeView}
                onItemSelect={onItemSelect}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onLinksUpdated={handleLinksUpdated}
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
              />
            )}
            {localViewMode === 'tree' && (
              <TreeView 
                entities={sortedEntities}
                activeView={activeView}
                selectedCategory={selectedCategory}
                onItemSelect={onItemSelect}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onLinksUpdated={handleLinksUpdated}
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


    </div>
  );
};

export default ItemsSchematicsContent; 