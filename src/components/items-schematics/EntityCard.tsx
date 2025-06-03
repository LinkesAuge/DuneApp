// EntityCard Component for Unified Entities System
import React from 'react';
import { Package, FileText, Edit, Trash, MapPin, CheckSquare, Square } from 'lucide-react';
import type { Entity } from '../../types/unified-entities';
import { TIER_NAMES } from '../../types/unified-entities';
import { ImagePreview } from '../shared/ImagePreview';

interface EntityCardProps {
  entity: Entity;
  onClick: (entity: Entity) => void;
  onEdit?: (entity: Entity) => void;
  onDelete?: (entity: Entity) => void;
  onPoiLink?: (entity: Entity) => void;
  // Bulk selection props
  isSelected?: boolean;
  onSelectionToggle?: (entityId: string) => void;
  selectionMode?: boolean;
  // Display options
  showActions?: boolean;
  compact?: boolean;
}

const EntityCard: React.FC<EntityCardProps> = ({
  entity,
  onClick,
  onEdit,
  onDelete,
  onPoiLink,
  isSelected = false,
  onSelectionToggle,
  selectionMode = false,
  showActions = true,
  compact = false
}) => {
  const tierName = TIER_NAMES[entity.tier_number] || `Tier ${entity.tier_number}`;
  const isSchematic = entity.is_schematic;

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(entity);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(entity);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(entity);
  };

  const handlePoiLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPoiLink?.(entity);
  };

  const handleSelectionToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionToggle?.(entity.id);
  };

  return (
    <div 
      className={`group relative bg-slate-900 border border-slate-700 rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl ${
        isSelected ? 'ring-2 ring-amber-400/50 border-amber-400/60' : 'hover:border-slate-600'
      } ${compact ? 'p-3' : 'p-4'}`}
      onClick={handleCardClick}
    >
      {/* Selection Checkbox */}
      {selectionMode && onSelectionToggle && (
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={handleSelectionToggle}
            className="p-1 hover:bg-amber-500/20 rounded transition-colors"
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
      <div className={`${compact ? 'mb-2' : 'mb-3'}`}>
        <div className="flex items-center space-x-3">
          {/* Entity Type Icon */}
          <div className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} flex items-center justify-center rounded-lg bg-slate-700 border border-slate-600 flex-shrink-0`}>
            <ImagePreview
              iconImageId={entity.icon_image_id}
              iconFallback={entity.icon_fallback || (isSchematic ? '📋' : '📦')}
              size={compact ? 'sm' : 'md'}
              className="w-full h-full"
            />
          </div>

          {/* Name and Type */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium text-amber-100 truncate ${compact ? 'text-sm' : 'text-base'}`}
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              {entity.name}
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                isSchematic 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {isSchematic ? 'Schematic' : 'Item'}
              </span>
              {entity.tier_number > 0 && (
                <span className="px-2 py-1 bg-slate-700 text-amber-300 rounded text-xs font-medium border border-slate-600">
                  T{entity.tier_number}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {!compact && (
        <>
          {/* Category and Type */}
          <div className="mb-3 space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-amber-200/60 font-light">Category:</span>
              <span className="text-amber-200 font-medium">{entity.category}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-amber-200/60 font-light">Type:</span>
              <span className="text-amber-200 font-medium">{entity.type}</span>
            </div>
            {entity.subtype && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-amber-200/60 font-light">Subtype:</span>
                <span className="text-amber-200 font-medium">{entity.subtype}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-amber-200/60 font-light">Tier:</span>
              <span className="text-amber-300 font-medium">{tierName}</span>
            </div>
          </div>

          {/* Description */}
          {entity.description && (
            <div className="mb-3">
              <p className="text-amber-200/80 text-sm line-clamp-2 font-light"
                 style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                {entity.description}
              </p>
            </div>
          )}
        </>
      )}

      {/* Actions */}
      {showActions && !selectionMode && (
        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onPoiLink && (
            <button
              onClick={handlePoiLink}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Link to POIs"
            >
              <MapPin className="w-4 h-4 text-blue-400" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={handleEdit}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4 text-amber-400" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash className="w-4 h-4 text-red-400" />
            </button>
          )}
        </div>
      )}

      {/* Global indicator */}
      {entity.is_global && (
        <div className="absolute top-2 left-2">
          <div className="w-2 h-2 bg-green-400 rounded-full" title="Global item" />
        </div>
      )}
    </div>
  );
};

export default EntityCard; 