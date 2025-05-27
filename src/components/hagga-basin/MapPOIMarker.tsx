import React, { useState, useEffect } from 'react';
import { Lock, Users, Eye } from 'lucide-react';
import type { Poi, PoiType, CustomIcon } from '../../types';
import type { MapSettings } from '../../lib/useMapSettings';

interface MapPOIMarkerProps {
  poi: Poi;
  poiType: PoiType;
  customIcons: CustomIcon[];
  zoom?: number;
  mapSettings?: MapSettings;
  onEdit?: (poi: Poi) => void;
  onDelete?: (poiId: string) => void;
  onShare?: (poi: Poi) => void;
  onImageClick?: (poi: Poi) => void;
}

// Helper function to determine if an icon is a URL or emoji
const isIconUrl = (icon: string): boolean => {
  return icon.startsWith('http') || icon.startsWith('/') || icon.includes('.');
};

// Helper function to get display image URL for POI icons
const getDisplayImageUrl = (poi: Poi, poiType: PoiType, customIcons: CustomIcon[]): string | null => {
  console.log('🔧 [MapPOIMarker] getDisplayImageUrl called with:', { 
    poiCustomIconId: poi.custom_icon_id, 
    poiTypeIcon: poiType.icon, 
    customIconsCount: customIcons.length 
  });
  
  // First priority: Check if POI has a custom icon reference
  if (poi.custom_icon_id) {
    const customIcon = customIcons.find(ci => ci.id === poi.custom_icon_id);
    if (customIcon) {
      console.log('🔧 [MapPOIMarker] Using POI custom icon:', customIcon);
      return customIcon.image_url;
    } else {
      console.log('🔧 [MapPOIMarker] POI custom icon not found, falling back to POI type icon');
    }
  }
  
  // Second priority: Check if POI type icon is a custom icon reference
  const customIconByPoiType = customIcons.find(ci => ci.id === poiType.icon || ci.name === poiType.icon);
  if (customIconByPoiType) {
    console.log('🔧 [MapPOIMarker] Using POI type custom icon:', customIconByPoiType);
    return customIconByPoiType.image_url;
  }
  
  // Third priority: Check if POI type icon is already a URL
  if (isIconUrl(poiType.icon)) {
    console.log('🔧 [MapPOIMarker] POI type icon is URL:', poiType.icon);
    return poiType.icon;
  }
  
  console.log('🔧 [MapPOIMarker] No image URL found, using emoji icon:', poiType.icon);
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
  mapSettings,
  onEdit,
  onDelete,
  onShare,
  onImageClick
}) => {
  const [showCard, setShowCard] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const imageUrl = getDisplayImageUrl(poi, poiType, customIcons);
  const PrivacyIcon = privacyIcons[poi.privacy_level];
  const privacyColor = privacyColors[poi.privacy_level];

  // Calculate icon size with subtle scaling from admin settings
  const baseSize = mapSettings?.iconBaseSize || 64;
  const maxSize = mapSettings?.iconMaxSize || 128;
  const minSize = mapSettings?.iconMinSize || 64;
  
  // Use logarithmic scaling for more subtle effect - icons scale much less dramatically
  // This creates a gentler scaling curve: at zoom 0.5 → ~0.85x, at zoom 2.0 → ~1.15x
  const scaleFactor = 1 + (Math.log(zoom) * 0.3);
  const unclamped = baseSize * scaleFactor;
  const scaledSize = Math.max(minSize, Math.min(maxSize, unclamped));
  const iconSize = scaledSize;


  const innerIconSize = iconSize * 0.75; // Icon content is 75% of container

  // Handle hover with delay
  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    const timeout = setTimeout(() => {
      setShowCard(true);
    }, 500); // 500ms delay
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setShowCard(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  return (
    <div 
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main POI Marker */}
      <div className="relative">
        {/* POI Icon */}
        <div 
          className="rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110"
          style={{
            width: `${iconSize}px`,
            height: `${iconSize}px`,
            backgroundColor: poiType.icon_has_transparent_background && imageUrl 
              ? 'transparent' 
              : poiType.color
          }}
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
        {poi.privacy_level === 'shared' && mapSettings?.showSharedIndicators && (
          <div className="absolute inset-0 rounded-full animate-pulse">
            <div className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-60"></div>
            <div className="absolute inset-0 rounded-full border border-blue-300 opacity-40 scale-110"></div>
          </div>
        )}
      </div>

      {/* Rich POI Tooltip on Hover */}
      {mapSettings?.showTooltips && showCard && (
        <div 
          className="absolute bottom-full left-1/2 mb-2 z-[100] pointer-events-auto"
          style={{ 
            transform: `translateX(-50%) translateY(-${iconSize/2 + 8}px)`,
            transformOrigin: 'center bottom'
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="bg-sand-50 rounded-lg shadow-xl border border-sand-200 max-w-sm w-80 overflow-hidden">
            {/* Header */}
            <div className="bg-sand-200 px-4 py-3 border-b border-sand-300">
              <div className="flex items-center space-x-3">
                {/* POI Type Icon */}
                <div 
                  className="w-8 h-8 rounded-full border border-white shadow-sm flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: poiType.icon_has_transparent_background && imageUrl 
                      ? 'transparent' 
                      : poiType.color
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={poiType.name}
                      className="w-5 h-5 object-contain"
                      style={{
                        filter: poiType.icon_has_transparent_background ? 'none' : 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))'
                      }}
                    />
                  ) : (
                    <span 
                      className="text-sm leading-none"
                      style={{ 
                        color: poiType.icon_has_transparent_background ? poiType.color : 'white',
                        textShadow: poiType.icon_has_transparent_background ? '0 1px 1px rgba(0,0,0,0.3)' : 'none'
                      }}
                    >
                      {poiType.icon}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sand-900 truncate">{poi.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs bg-sand-100 text-sand-700 px-2 py-0.5 rounded">{poiType.name}</span>
                    <div className="flex items-center text-xs text-sand-600">
                      <PrivacyIcon className={`w-3 h-3 mr-1 ${privacyColor}`} />
                      <span className="capitalize">{poi.privacy_level}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Description */}
              {poi.description && (
                <div>
                  <h4 className="text-xs font-medium text-sand-800 mb-1">Description</h4>
                  <p className="text-sm text-sand-700 leading-relaxed line-clamp-3">{poi.description}</p>
                </div>
              )}

              {/* Coordinates */}
              {poi.coordinates_x && poi.coordinates_y && (
                <div>
                  <h4 className="text-xs font-medium text-sand-800 mb-1">Coordinates</h4>
                  <div className="text-sm text-sand-600 font-mono">
                    {poi.coordinates_x}, {poi.coordinates_y}
                  </div>
                </div>
              )}

              {/* Screenshots indicator */}
              {poi.screenshots && poi.screenshots.length > 0 && (
                <div className="flex items-center text-xs text-sand-600">
                  <span className="bg-spice-100 text-spice-700 px-2 py-1 rounded">
                    📸 {poi.screenshots.length} screenshot{poi.screenshots.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* Actions hint */}
              <div className="text-xs text-sand-500 italic border-t border-sand-200 pt-2">
                Click icon for full details and actions
              </div>
            </div>

            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="w-3 h-3 bg-sand-50 border-r border-b border-sand-200 transform rotate-45"></div>
            </div>
          </div>
        </div>
      )}



      {/* Screenshot indicator */}
      {poi.screenshots && poi.screenshots.length > 0 && (
        <div 
          className="absolute bg-spice-500 rounded-full border border-white flex items-center justify-center"
          style={{
            width: `12px`,
            height: `12px`,
            bottom: `-4px`,
            right: `-4px`,
            fontSize: `10px`
          }}
        >
          <span className="text-white font-bold leading-none">
            {poi.screenshots.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default MapPOIMarker; 