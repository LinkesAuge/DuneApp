import React from 'react';
import { Lock, Users, Eye } from 'lucide-react';
import type { Poi, PoiType, CustomIcon } from '../../types';

interface MapPOIMarkerProps {
  poi: Poi;
  poiType: PoiType;
  customIcons: CustomIcon[];
  zoom?: number;
  onMouseDown?: (poi: Poi, event: React.MouseEvent) => void;
  isDragging?: boolean;
}

// Helper function to determine if an icon is a URL or emoji
const isIconUrl = (icon: string): boolean => {
  return icon.startsWith('http') || icon.startsWith('/') || icon.includes('.');
};

// Helper function to get display image URL for POI icons
const getDisplayImageUrl = (icon: string, customIcons: CustomIcon[]): string | null => {
  // Check if it's a custom icon reference
  const customIcon = customIcons.find(ci => ci.id === icon || ci.name === icon);
  if (customIcon) {
    return customIcon.image_url;
  }
  
  // Check if it's already a URL
  if (isIconUrl(icon)) {
    return icon;
  }
  
  return null;
};

// Privacy level icon mapping
const privacyIcons = {
  global: Eye,
  private: Lock,
  shared: Users
} as const;

// Privacy level colors
const privacyColors = {
  global: 'text-green-500',
  private: 'text-red-500',
  shared: 'text-blue-500'
} as const;

const MapPOIMarker: React.FC<MapPOIMarkerProps> = ({ 
  poi, 
  poiType, 
  customIcons, 
  zoom = 1, 
  onMouseDown,
  isDragging = false 
}) => {
  const imageUrl = getDisplayImageUrl(poiType.icon, customIcons);
  const PrivacyIcon = privacyIcons[poi.privacy_level];
  const privacyColor = privacyColors[poi.privacy_level];

  // Calculate icon size with constraints (64px min, 128px max)
  // TODO: Make these configurable from admin settings
  const baseSize = 64; // Base size in pixels
  const maxSize = 128;
  const minSize = 64;
  
  // Scale with zoom but constrain to min/max
  const scaledSize = Math.max(minSize, Math.min(maxSize, baseSize * zoom));
  const iconSize = scaledSize;
  const innerIconSize = iconSize * 0.75; // Icon content is 75% of container

  return (
    <div className="relative group">
      {/* Main POI Marker */}
      <div className="relative">
        {/* POI Icon */}
        <div 
          className={`rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all duration-200 ${
            isDragging 
              ? 'cursor-grabbing scale-110 z-50' 
              : 'cursor-grab hover:scale-110'
          }`}
          style={{
            width: `${iconSize}px`,
            height: `${iconSize}px`,
            backgroundColor: poiType.icon_has_transparent_background && imageUrl 
              ? 'transparent' 
              : poiType.color,
            opacity: isDragging ? 0.8 : 1
          }}
          onMouseDown={(e) => onMouseDown?.(poi, e)}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={poiType.name}
              className="object-contain"
              style={{
                width: `${innerIconSize}px`,
                height: `${innerIconSize}px`,
                filter: poiType.icon_has_transparent_background ? 'none' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
              }}
            />
          ) : (
            <span 
              className="leading-none font-medium"
              style={{ 
                fontSize: `${innerIconSize * 0.5}px`,
                color: poiType.icon_has_transparent_background ? poiType.color : 'white',
                textShadow: poiType.icon_has_transparent_background ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
              }}
            >
              {poiType.icon}
            </span>
          )}
        </div>

        {/* Privacy Indicator */}
        {poi.privacy_level !== 'global' && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full border border-sand-200 flex items-center justify-center">
            <PrivacyIcon className={`w-2.5 h-2.5 ${privacyColor}`} />
          </div>
        )}

        {/* Shared POI Indicator - Special highlighting for shared POIs */}
        {poi.privacy_level === 'shared' && (
          <div className="absolute inset-0 rounded-full animate-pulse">
            <div className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-60"></div>
            <div className="absolute inset-0 rounded-full border border-blue-300 opacity-40 scale-110"></div>
          </div>
        )}
      </div>

      {/* Hover Tooltip - Fixed size, doesn't scale with zoom */}
      <div 
        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[100]"
        style={{ 
          transform: `translateX(-50%) translateY(-${iconSize/2 + 8}px) scale(${1/zoom})`,
          transformOrigin: 'center bottom'
        }}
      >
        <div className="bg-night-900 text-white px-3 py-2 rounded-lg shadow-xl whitespace-nowrap max-w-xs">
          {/* POI Title */}
          <div className="font-medium text-sm">{poi.title}</div>
          
          {/* POI Type */}
          <div className="text-xs text-sand-300">{poiType.name}</div>
          
          {/* Privacy Level */}
          <div className="flex items-center mt-1 text-xs">
            <PrivacyIcon className={`w-3 h-3 mr-1 ${privacyColor}`} />
            <span className="capitalize">{poi.privacy_level}</span>
          </div>
          
          {/* Description preview if available */}
          {poi.description && (
            <div className="text-xs text-sand-400 mt-1 truncate max-w-48">
              {poi.description}
            </div>
          )}
          
          {/* Click hint */}
          <div className="text-xs text-sand-500 mt-2 italic border-t border-sand-700 pt-2">
            (click for more info)
          </div>
          
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-night-900"></div>
        </div>
      </div>

      {/* POI Label (shown on hover) */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm">
          <div className="text-xs font-medium text-sand-800 whitespace-nowrap">
            {poi.title}
          </div>
        </div>
      </div>

      {/* Screenshot indicator */}
      {poi.screenshots && poi.screenshots.length > 0 && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-spice-500 rounded-full border border-white flex items-center justify-center">
          <span className="text-white text-xs font-bold leading-none">
            {poi.screenshots.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default MapPOIMarker; 