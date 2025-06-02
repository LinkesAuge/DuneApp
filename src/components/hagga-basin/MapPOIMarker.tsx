import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Lock, Users, Eye, Share, Award } from 'lucide-react';
import type { Poi, PoiType } from '../../types';
import type { MapSettings } from '../../lib/useMapSettings';
import { Rank } from '../../types/profile';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../../lib/supabase';

interface MapPOIMarkerProps {
  poi: Poi;
  poiType: PoiType;

  zoom?: number;
  mapSettings?: MapSettings | null;
  onEdit?: (poi: Poi) => void;
  onDelete?: (poiId: string) => void;
  onShare?: (poi: Poi) => void;
  onImageClick?: () => void;
  isHighlighted?: boolean;
  // Selection mode props
  selectionMode?: boolean;
  isSelected?: boolean;
  user?: { id: string };
}

// Helper function to determine if an icon is a URL or emoji
const isIconUrl = (icon: string): boolean => {
  return icon.startsWith('http') || icon.startsWith('/') || icon.includes('.');
};

// Helper function to get display image URL for POI icons
const getDisplayImageUrl = (poi: Poi, poiType: PoiType): string | null => {
  // Check if POI type icon is already a URL
  if (isIconUrl(poiType.icon)) {
    return poiType.icon;
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
 
  zoom = 1, 
  mapSettings,
  onEdit,
  onDelete,
  onShare,
  onImageClick,
  isHighlighted,
  selectionMode = false,
  isSelected = false,
  user
}) => {
  const { user: authUser } = useAuth();
  const [showCard, setShowCard] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [userInfo, setUserInfo] = useState<{ 
    username: string; 
    display_name?: string | null; 
    discord_username?: string | null; 
    custom_avatar_url?: string | null; 
    discord_avatar_url?: string | null; 
    use_discord_avatar?: boolean;
    rank?: Rank | null;
  } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  
  const imageUrl = getDisplayImageUrl(poi, poiType);
  const PrivacyIcon = privacyIcons[poi.privacy_level];
  const privacyColor = privacyColors[poi.privacy_level];

  // Fetch user information for POI creator
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!poi.created_by) return;
      
        try {
        const { data: userData, error } = await supabase
            .from('profiles')
          .select('username, display_name, discord_username, custom_avatar_url, discord_avatar_url, use_discord_avatar, rank:ranks(*)')
            .eq('id', poi.created_by)
            .single();
          
        if (error) {
          console.error('Error fetching user info:', error);
          return;
        }

        setUserInfo(userData);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, [poi.created_by]);

  // Note: Removed debug highlighting logs to reduce console noise

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

  // Handle hover with delay and position calculation
  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    const timeout = setTimeout(() => {
      // Calculate tooltip position relative to viewport
      if (markerRef.current) {
        const rect = markerRef.current.getBoundingClientRect();
        setTooltipPosition({
          x: rect.left + rect.width / 2,
          y: rect.top
        });
      }
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
    setTooltipPosition(null);
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
    <>
      <div 
        ref={markerRef}
        className="relative group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
      {/* Main POI Marker */}
      <div className="relative">
        {/* POI Icon */}
        <div 
          className={`flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 ${
            selectionMode 
              ? isSelected 
                ? 'ring-2 ring-amber-400/50' 
                : 'hover:ring-1 hover:ring-amber-300/50'
              : isHighlighted 
                ? 'ring-2 ring-amber-400/50' 
                : ''
          }`}
          style={{
            width: `${iconSize}px`,
            height: `${iconSize}px`,
            backgroundColor: 'transparent'
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
                filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.8)) drop-shadow(0 0 8px rgba(0,0,0,0.5)) drop-shadow(0 0 12px rgba(0,0,0,0.3)) drop-shadow(0 0 18px rgba(0,0,0,0.2))'
              }}
            />
          ) : (
            <span 
              className="leading-none font-medium"
              style={{ 
                fontSize: `${innerIconSize * 0.6}px`,
                color: poiType.color,
                textShadow: '0 2px 6px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5), 0 0 12px rgba(0,0,0,0.3), 0 0 18px rgba(0,0,0,0.2)'
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
              className="absolute animate-ping border-4 border-green-500 opacity-75"
              style={{
                width: `${iconSize * 1.8}px`,
                height: `${iconSize * 1.8}px`,
                top: `${iconSize * -0.4}px`,
                left: `${iconSize * -0.4}px`
              }}
            />
            {/* Middle ring - pulse animation */}
            <div 
              className="absolute animate-pulse border-3 border-green-400 opacity-60"
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
              className="absolute bg-green-500/20"
              style={{
                width: `${iconSize}px`,
                height: `${iconSize}px`,
                top: '0',
                left: '0'
              }}
            />
          </div>
        )}

        {/* Selection Indicator */}
        {selectionMode && isSelected && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Privacy Indicator */}
        {poi.privacy_level !== 'global' && (
          <div className={`absolute -top-1 w-4 h-4 bg-white rounded-full border border-sand-200 flex items-center justify-center ${
            selectionMode && isSelected ? '-right-8' : '-right-1'
          }`}>
            <PrivacyIcon className={`w-2.5 h-2.5 ${privacyColor}`} />
          </div>
        )}




      </div>
      </div>

      {/* Rich POI Tooltip on Hover - Rendered via Portal for guaranteed top z-index */}
      {mapSettings?.showTooltips && showCard && tooltipPosition && createPortal(
        <div 
          className="fixed pointer-events-auto z-[999999]"
          style={{ 
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y - 8}px`,
            transform: 'translateX(-50%) translateY(-100%)',
            transformOrigin: 'center bottom'
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Enhanced Modal-like Tooltip */}
          <div className="relative group w-80">
            {/* Multi-layer background system matching modals */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg border border-amber-400/40 shadow-2xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 via-slate-800/90 to-slate-900/95 rounded-lg" />
            <div className="absolute inset-0 bg-gradient-to-b from-amber-600/8 via-amber-500/4 to-transparent rounded-lg" />
            
            {/* Interactive purple overlay */}
            <div className="absolute inset-0 rounded-lg opacity-60 bg-gradient-to-b from-violet-600/12 via-violet-700/6 to-transparent" />
            
            {/* Enhanced Content */}
            <div className="relative p-5 space-y-4">
              {/* Header with POI Type and Title */}
              <div className="border-b border-amber-400/20 pb-3">
                <div className="flex items-start gap-3 mb-2">
                  {/* Enhanced POI Icon */}
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border border-amber-400/30 flex-shrink-0 shadow-lg">
                    {imageUrl ? (
                      <img src={imageUrl} alt={poiType.name} className="w-6 h-6 object-contain" />
                    ) : (
                      <span className="text-lg" style={{ color: poiType.color }}>{poiType.icon}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-amber-200 mb-1 truncate tracking-wide"
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      {poi.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-amber-300/80 font-light tracking-wide">{poiType.name}</span>
                      <span className="text-xs text-amber-400/60">•</span>
                      <span className="text-xs text-amber-300/70 font-light">{poiType.category}</span>
                    </div>
                  </div>
                </div>

                {/* Privacy indicator */}
                {poi.privacy_level !== 'global' && (
                  <div className="flex items-center gap-1">
                    <PrivacyIcon className={`w-3 h-3 ${privacyColor}`} />
                    <span className="text-xs text-amber-300/70 capitalize font-light">
                      {poi.privacy_level === 'shared' ? 'Shared POI' : 'Private POI'}
                    </span>
                  </div>
                )}
              </div>

              {/* Screenshots Section - Enhanced with modal-like preview */}
              {poi.screenshots && poi.screenshots.length > 0 && (
                <div>
                  <h4 className="text-xs font-light text-amber-200/90 mb-2 tracking-wide flex items-center gap-2">
                    📸 Screenshots
                    <span className="bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded text-xs border border-amber-400/30">
                      {poi.screenshots.length} {poi.screenshots.length === 1 ? 'image' : 'images'}
                    </span>
                  </h4>
                  
                  {/* Primary screenshot preview */}
                  <div className="relative mb-3">
                    <img
                      src={poi.screenshots[0].url}
                      alt="POI Screenshot"
                      className="w-full h-32 object-cover rounded border border-amber-400/20 shadow-lg"
                    />
                    {poi.screenshots.length > 1 && (
                      <div className="absolute bottom-1 right-1 bg-slate-900/80 text-amber-200 px-2 py-1 rounded text-xs border border-amber-400/30 backdrop-blur-sm">
                        1 of {poi.screenshots.length}
                      </div>
                    )}
                  </div>

                  {/* Additional screenshots indicator */}
                  {poi.screenshots.length > 1 && (
                    <div className="text-xs text-amber-300/70 font-light text-center">
                      + {poi.screenshots.length - 1} more screenshot{poi.screenshots.length - 1 !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              {poi.description && (
                <div>
                  <h4 className="text-xs font-light text-amber-200/90 mb-2 tracking-wide">Description</h4>
                  <p className="text-sm text-amber-300/85 leading-relaxed line-clamp-3 font-light">{poi.description}</p>
                </div>
              )}

              {/* Coordinates */}
              {poi.coordinates_x && poi.coordinates_y && (
                <div>
                  <h4 className="text-xs font-light text-amber-200/90 mb-1 tracking-wide">Coordinates</h4>
                  <div className="text-xs text-amber-300/75 font-mono bg-slate-800/40 px-2 py-1 rounded border border-amber-400/20">
                    {poi.coordinates_x}, {poi.coordinates_y}
                  </div>
                </div>
              )}

              {/* Creator info - Enhanced with rank */}
              {userInfo && (
                <div>
                  <h4 className="text-xs font-light text-amber-200/90 mb-1 tracking-wide">Creator</h4>
                  <div className="flex items-center gap-2 text-xs text-amber-300/90 flex-wrap">
                    <div className="flex items-center gap-1">
                      {userInfo && (userInfo.custom_avatar_url || userInfo.discord_avatar_url) ? (
                        <img
                          src={
                            userInfo.use_discord_avatar && userInfo.discord_avatar_url
                              ? userInfo.discord_avatar_url
                              : userInfo.custom_avatar_url || '/default-avatar.png'
                          }
                          alt="Creator"
                          className="w-4 h-4 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <span className="text-xs text-amber-300">
                            {(userInfo?.display_name || userInfo?.username || 'Unknown').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="font-medium text-amber-200">
                        {userInfo?.display_name || userInfo?.username || 'Unknown User'}
                      </span>
                    </div>
                    {userInfo?.rank && (
                      <span 
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border"
                        style={{ 
                          backgroundColor: `${userInfo.rank.color}20`,
                          borderColor: `${userInfo.rank.color}40`, 
                          color: userInfo.rank.text_color,
                          fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif"
                        }}
                      >
                        <Award className="w-2.5 h-2.5 mr-1" style={{ color: userInfo.rank.text_color }} />
                        {userInfo.rank.name}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Only show share button for private/shared POIs that the user owns */}
              {onShare && user && poi.created_by === user.id && poi.privacy_level !== 'global' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(poi);
                  }}
                  className="p-1 text-green-300 hover:text-green-100 hover:bg-slate-700/50 rounded transition-colors"
                  title="Share POI"
                >
                  <Share className="w-3 h-3" />
                </button>
              )}

              {/* Action hint */}
              <div className="text-xs text-amber-300/60 italic border-t border-amber-400/15 pt-3 font-light tracking-wide text-center">
                Click marker for full details and actions
              </div>
            </div>

            {/* Enhanced Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="w-4 h-4 bg-slate-900 border-r border-b border-amber-400/40 transform rotate-45 shadow-lg"></div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default MapPOIMarker; 