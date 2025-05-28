import React from 'react';
import { Poi, PoiType, CustomIcon } from '../../types';
import { MapPin, Edit, Trash2, Clock, User } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import CommentsList from '../comments/CommentsList';
import LikeButton from '../common/LikeButton';
import { formatCompactDateTime, wasUpdated, formatDateWithPreposition } from '../../lib/dateUtils';

interface PoiCardProps {
  poi: Poi;
  poiType?: PoiType;
  customIcons: CustomIcon[];
  gridSquareCoordinate?: string;
  creator?: { username: string };
  onEdit?: () => void;
  onDelete?: () => void;
  onImageClick?: () => void;
  onClick?: () => void;
}

// Helper function to determine if an icon is a URL or emoji
const isIconUrl = (icon: string): boolean => {
  return icon.startsWith('http') || icon.startsWith('/') || icon.includes('.');
};

// Helper function to get display image URL for POI icons
const getDisplayImageUrl = (poi: Poi, poiType: PoiType, customIcons: CustomIcon[]): string | null => {
  // First priority: Check if POI has a custom icon reference
  if (poi.custom_icon_id) {
    const customIcon = customIcons.find(ci => ci.id === poi.custom_icon_id);
    if (customIcon) {
      return customIcon.image_url;
    }
  }
  
  // Second priority: Check if POI type icon is a custom icon reference
  const customIconByPoiType = customIcons.find(ci => ci.id === poiType.icon || ci.name === poiType.icon);
  if (customIconByPoiType) {
    return customIconByPoiType.image_url;
  }
  
  // Third priority: Check if POI type icon is already a URL
  if (isIconUrl(poiType.icon)) {
    return poiType.icon;
  }
  
  return null;
};

const PoiCard: React.FC<PoiCardProps> = ({
  poi,
  poiType,
  customIcons,
  gridSquareCoordinate,
  creator,
  onEdit,
  onDelete,
  onImageClick,
  onClick,
}) => {
  const { user } = useAuth();
  const canModify = user && (user.id === poi.created_by || user.role === 'admin' || user.role === 'editor');
  
  const imageUrl = poiType ? getDisplayImageUrl(poi, poiType, customIcons) : null;

  // Map type styling
  const getMapTypeInfo = (mapType: string) => {
    switch (mapType) {
      case 'deep_desert':
        return {
          label: 'Deep Desert',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800',
          icon: '🏜️'
        };
      case 'hagga_basin':
        return {
          label: 'Hagga Basin',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          icon: '🏔️'
        };
      default:
        return {
          label: 'Unknown',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: '❓'
        };
    }
  };

  const mapTypeInfo = getMapTypeInfo(poi.map_type);

  return (
    <div 
      className="bg-sand-200 rounded-lg border border-sand-300 hover:border-sand-400 transition-all duration-200 overflow-hidden"
      onClick={onClick}
    >
      {/* Header */}
      <div className="p-4 bg-sand-300/50 border-b border-sand-300 flex items-center justify-between">
        <div 
          className="flex items-center flex-1 min-w-0 cursor-pointer" 
          onClick={(e) => {
            // Ensure this click doesn't propagate if it's meant to be distinct
            // but in this case, we want it to behave like the main card click.
            // If onClick is defined, call it. Otherwise, do nothing (or let it bubble).
            if (onClick) {
              // We might not want to stop propagation if the main card div handles the primary onClick.
              // e.stopPropagation(); // Only if this click should NOT trigger the outer div's onClick too.
              onClick(); 
            }
          }}
        >
          {poiType && (
            <div 
              className="w-8 h-8 rounded-full mr-3 flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{
                backgroundColor: (imageUrl && poiType.icon_has_transparent_background) 
                                 ? 'transparent' 
                                 : poiType.color
              }}
            >
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={`${poiType.name} icon`} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-white text-lg">{poiType.icon}</span>
              )}
            </div>
          )}
          <div className="min-w-0">
            <h4 className="font-semibold text-night-800 truncate">{poi.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              {poiType && (
                <span className="badge badge-primary">
                  {poiType.name}
                </span>
              )}
              {/* Map Type Badge */}
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${mapTypeInfo.bgColor} ${mapTypeInfo.textColor}`}>
                <span className="mr-1">{mapTypeInfo.icon}</span>
                {mapTypeInfo.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-4">
          {/* Grid Coordinate for Deep Desert POIs only */}
          {poi.map_type === 'deep_desert' && gridSquareCoordinate && (
            <div className="flex items-center text-sm text-night-600">
              <MapPin size={16} className="mr-1" />
              <span>{gridSquareCoordinate}</span>
            </div>
          )}

          {/* Edit/Delete buttons */}
          {canModify && (
            <div className="flex space-x-2 ml-4">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="text-night-500 hover:text-night-700"
                >
                  <Edit size={16} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex gap-4">
        {/* Description */}
        <div className="flex-1">
          {poi.description && (
            <p className="text-sm text-night-700">
              {poi.description}
            </p>
          )}
        </div>

        {/* Screenshot thumbnail */}
        {poi.screenshots && poi.screenshots.length > 0 && (
          <div 
            className="w-64 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onImageClick?.();
            }}
          >
            <div className="relative aspect-video rounded-md overflow-hidden cursor-zoom-in border border-sand-300">
              <img 
                src={poi.screenshots[0].url} 
                alt={`Screenshot of ${poi.title}`}
                className="w-full h-full object-cover"
              />
              {poi.screenshots.length > 1 && (
                <div className="absolute bottom-1 right-1 bg-night-900/75 text-white text-xs px-1.5 py-0.5 rounded">
                  +{poi.screenshots.length - 1}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="border-t border-sand-300">
        <CommentsList 
          poiId={poi.id} 
          showLikeButton={true}
          likeTargetType="poi"
          likeTargetId={poi.id}
        />
      </div>

      {/* Footer - Creator and Edit Information */}
      <div className="px-4 py-2 bg-sand-300/30 border-t border-sand-300">
        {/* Creator and Editor Information - Compact single line */}
        <div className="flex items-center justify-between text-xs text-sand-600">
          <div className="flex items-center">
            <User className="w-3 h-3 mr-1.5" />
            <span>
              Created by {creator?.username || 'Unknown'} {(() => {
                const { date, useOn } = formatDateWithPreposition(poi.created_at);
                return useOn ? `on ${date}` : date;
              })()}
            </span>
          </div>
          
          {/* Edit Information - Only show if POI was edited */}
          {wasUpdated(poi.created_at, poi.updated_at) && (
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1.5" />
              <span>
                Edited {(() => {
                  const { date, useOn } = formatDateWithPreposition(poi.updated_at);
                  return useOn ? `on ${date}` : date;
                })()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PoiCard;