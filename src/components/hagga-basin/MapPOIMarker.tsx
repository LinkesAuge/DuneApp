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
  isHighlighted?: boolean;
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
  
  // Default: Use emoji icon (return null so component uses emoji)
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
  onImageClick,
  isHighlighted
}) => {
  const [showCard, setShowCard] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const imageUrl = getDisplayImageUrl(poi, poiType, customIcons);
  const PrivacyIcon = privacyIcons[poi.privacy_level];
  const privacyColor = privacyColors[poi.privacy_level];

  // Debug highlighting changes
  useEffect(() => {
    if (isHighlighted) {
      console.log('MapPOIMarker: POI', poi.title, 'is now highlighted!');
    } else {
      console.log('MapPOIMarker: POI', poi.title, 'highlighting removed');
    }
  }, [isHighlighted, poi.title]);

  // Calculate icon size with subtle scaling from admin settings
  const baseSize = mapSettings?.iconBaseSize || 72;
  const maxSize = mapSettings?.iconMaxSize || 144;
  const minSize = mapSettings?.iconMinSize || 72;
  
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

        {/* Highlight Effect - Complete Overlay */}
        {isHighlighted && (
          <div 
            className="absolute pointer-events-none"
            style={{
              top: 0,
              left: 0,
              width: `${iconSize}px`,
              height: `${iconSize}px`,
            }}
          >
            {/* Red glowing exclamation mark */}
            <div 
              className="absolute bg-red-500 text-white text-lg font-bold px-2 py-1 rounded-full shadow-lg"
              style={{
                top: `${iconSize * -0.7}px`,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 999,
                animation: 'pulse 1s infinite',
                boxShadow: '0 0 10px rgba(239, 68, 68, 0.8), 0 0 20px rgba(239, 68, 68, 0.6), 0 0 30px rgba(239, 68, 68, 0.4)'
              }}
            >
              !
            </div>
            
            {/* Outer ring - ping animation */}
            <div 
              className="absolute animate-ping rounded-full border-4 border-green-500 opacity-75"
              style={{
                width: `${iconSize * 1.8}px`,
                height: `${iconSize * 1.8}px`,
                top: `${iconSize * -0.4}px`,
                left: `${iconSize * -0.4}px`
              }}
            />
            {/* Middle ring - pulse animation */}
            <div 
              className="absolute animate-pulse rounded-full border-3 border-green-400 opacity-60"
              style={{
                width: `${iconSize * 1.4}px`,
                height: `${iconSize * 1.4}px`,
                top: `${iconSize * -0.2}px`,
                left: `${iconSize * -0.2}px`,
                animationDelay: '0.5s'
              }}
            />
            {/* Inner glow */}
            <div 
              className="absolute rounded-full bg-green-500/20"
              style={{
                width: `${iconSize}px`,
                height: `${iconSize}px`,
                top: '0',
                left: '0'
              }}
            />
          </div>
        )}

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
          className="absolute bottom-full left-1/2 mb-2 z-[99999] pointer-events-auto"
          style={{ 
            transform: `translateX(-50%) translateY(-${iconSize/2 + 8}px)`,
            transformOrigin: 'center bottom'
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Multi-layer background system */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-800/80 to-slate-900/90 rounded-lg" />
            <div className="absolute inset-0 bg-gradient-to-b from-amber-600/10 via-amber-500/5 to-transparent rounded-lg" />
            
            {/* Interactive purple overlay */}
            <div className="absolute inset-0 rounded-lg opacity-60 bg-gradient-to-b from-violet-600/10 via-violet-700/5 to-transparent" />
            
            <div className="relative max-w-sm w-80 overflow-hidden rounded-lg border border-amber-400/30 shadow-xl">
              {/* Header */}
              <div className="px-4 py-3 border-b border-amber-400/20">
                <div className="flex items-center space-x-3">
                  {/* POI Type Icon */}
                  <div 
                    className="w-8 h-8 rounded-full border border-amber-400/40 shadow-sm flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: poiType.icon_has_transparent_background && imageUrl 
                        ? 'rgba(30, 41, 59, 0.8)' 
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
                    <h3 className="font-light text-amber-200 truncate tracking-wide"
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      {poi.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">{poiType.name}</span>
                      <div className="flex items-center text-xs text-amber-300/70">
                        <PrivacyIcon className={`w-3 h-3 mr-1 ${privacyColor === 'text-green-500' ? 'text-green-400' : privacyColor === 'text-red-500' ? 'text-red-400' : 'text-blue-400'}`} />
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
                    <h4 className="text-xs font-light text-amber-200/80 mb-1 tracking-wide">Description</h4>
                    <p className="text-sm text-amber-300/80 leading-relaxed line-clamp-3">{poi.description}</p>
                  </div>
                )}

                {/* Coordinates */}
                {poi.coordinates_x && poi.coordinates_y && (
                  <div>
                    <h4 className="text-xs font-light text-amber-200/80 mb-1 tracking-wide">Coordinates</h4>
                    <div className="text-sm text-amber-300/70 font-mono">
                      {poi.coordinates_x}, {poi.coordinates_y}
                    </div>
                  </div>
                )}

                {/* Screenshots indicator */}
                {poi.screenshots && poi.screenshots.length > 0 && (
                  <div className="flex items-center text-xs text-amber-300/70">
                    <span className="bg-amber-500/20 text-amber-200 px-2 py-1 rounded border border-amber-400/30">
                      📸 {poi.screenshots.length} screenshot{poi.screenshots.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                {/* Actions hint */}
                <div className="text-xs text-amber-300/60 italic border-t border-amber-400/20 pt-2 font-light tracking-wide">
                  Click icon for full details and actions
                </div>
              </div>

              {/* Tooltip arrow with high z-index */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 z-[99999]">
                <div className="w-3 h-3 bg-slate-900 border-r border-b border-amber-400/30 transform rotate-45"></div>
              </div>
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