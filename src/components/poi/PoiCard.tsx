import React from 'react';
import { Poi, PoiType } from '../../types';
import { MapPin, Edit, Trash2, Clock } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

interface PoiCardProps {
  poi: Poi;
  poiType?: PoiType;
  gridSquareCoordinate?: string;
  creator?: { username: string };
  onEdit?: () => void;
  onDelete?: () => void;
  onImageClick?: () => void;
  onClick?: () => void;
}

// Helper function to check if the icon is a URL
const isIconUrl = (iconValue: string | null | undefined): iconValue is string => 
  typeof iconValue === 'string' && (iconValue.startsWith('http://') || iconValue.startsWith('https://'));

// Helper function to get the display URL (can be expanded later if needed)
const getDisplayImageUrl = (url: string | null): string | undefined => {
  if (!url || !isIconUrl(url)) return undefined;
  // Basic check to avoid trying to parse non-URL-like strings as URLs
  if (!url.includes('/')) return undefined; 
  try {
    // Simple return for now, can add cache busting like in PoiTypeManager if needed
    return new URL(url).toString();
  } catch (e) {
    console.warn("Invalid URL for POI card icon:", url, e);
    return url; // Fallback to original url if parsing fails
  }
};

const PoiCard: React.FC<PoiCardProps> = ({
  poi,
  poiType,
  gridSquareCoordinate,
  creator,
  onEdit,
  onDelete,
  onImageClick,
  onClick,
}) => {
  const { user } = useAuth();
  const canModify = user && (user.id === poi.created_by || user.role === 'admin' || user.role === 'editor');

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
                backgroundColor: (isIconUrl(poiType.icon) && poiType.icon_has_transparent_background) 
                                 ? 'transparent' 
                                 : poiType.color
              }}
            >
              {isIconUrl(poiType.icon) ? (
                <img 
                  src={getDisplayImageUrl(poiType.icon)} 
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
            {poiType && (
              <span className="badge badge-primary mt-1">
                {poiType.name}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 ml-4">
          {/* Grid Square Location */}
          {gridSquareCoordinate && (
            <div className="flex items-center text-sm text-night-600">
              <MapPin size={16} className="mr-1" />
              {gridSquareCoordinate}
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

      {/* Footer */}
      {creator && (
        <div className="px-4 py-2 bg-sand-300/30 border-t border-sand-300 text-xs text-sand-700 flex items-center">
          <Clock size={12} className="mr-1" />
          <span>
            Added by {creator.username} on{' '}
            {new Date(poi.created_at).toLocaleDateString()} at{' '}
            {new Date(poi.created_at).toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default PoiCard;