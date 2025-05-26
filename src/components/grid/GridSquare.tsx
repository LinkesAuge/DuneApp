import React, { useState } from 'react';
import { GridSquare as GridSquareType, Poi, PoiType } from '../../types';
import { CheckCircle, ImageOff } from 'lucide-react';

interface GridSquareProps {
  square: GridSquareType;
  poisToDisplay?: Poi[];
  poiTypes?: PoiType[];
  isHighlighted?: boolean;
  onClick: () => void;
  onImageClick: () => void;
}

// Helper function to check if the icon is a URL
const isIconUrl = (iconValue: string | null | undefined): iconValue is string => 
  typeof iconValue === 'string' && (iconValue.startsWith('http://') || iconValue.startsWith('https://'));

// Helper function to get the display URL
const getDisplayImageUrl = (url: string | null): string | undefined => {
  if (!url || !isIconUrl(url)) return undefined;
  if (!url.includes('/')) return undefined; 
  try {
    return new URL(url).toString();
  } catch (e) {
    console.warn("Invalid URL for POI grid icon:", url, e);
    return url; 
  }
};

const GridSquare: React.FC<GridSquareProps> = ({ square, poisToDisplay = [], poiTypes = [], isHighlighted = false, onClick, onImageClick }) => {
  const [hoveredPoiType, setHoveredPoiType] = useState<PoiType | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'img') {
      e.stopPropagation();
      onImageClick();
    } else if (!target.closest('.poi-icons')) {
      onClick();
    }
  };

  // Get unique POI types for this grid square based on poisToDisplay
  const uniquePoiTypes = poisToDisplay.reduce((acc: Set<string>, poi: Poi) => {
    acc.add(poi.poi_type_id);
    return acc;
  }, new Set<string>());

  // Convert to array and get POI type details
  const poiTypeDetails = Array.from(uniquePoiTypes)
    .map(typeId => poiTypes.find(t => t.id === typeId))
    .filter((t): t is PoiType => t !== undefined);

  // Get POIs for hovered type from poisToDisplay
  const poisForType = hoveredPoiType 
    ? poisToDisplay.filter(poi => poi.poi_type_id === hoveredPoiType.id)
    : [];

  return (
    <div 
      className={`aspect-square flex-1 border relative group cursor-pointer transition-all duration-200 hover:shadow-md ${
        square.is_explored ? 'bg-white' : 'bg-sand-200'
      } ${
        isHighlighted ? 'border-2 border-spice-700 shadow-spice-700/20 shadow-inner animate-pulse-highlight' : 'border-sand-400'
      }`}
      onClick={handleClick}
    >
      {/* Highlight Overlay - subtle version, border does most of the work */}
      {isHighlighted && (
        <div className="absolute inset-0 bg-spice-700/20 pointer-events-none z-[5]"></div>
      )}

      {/* POI Count Badge - based on poisToDisplay */}
      {poisToDisplay.length > 0 && (
        <div className="absolute top-2 left-2 bg-spice-600/90 text-white px-2 py-0.5 rounded-full text-xs font-medium z-10 backdrop-blur-sm">
          {poisToDisplay.length}
        </div>
      )}

      {square.screenshot_url ? (
        <>
          <img 
            src={square.screenshot_url} 
            alt={`Grid ${square.coordinate}`}
            className="w-full h-full object-cover cursor-zoom-in"
          />
          {/* Thumbnail Overlay for highlight pulse */}
          {isHighlighted && (
            <div className="absolute inset-0 w-full h-full animate-pulse-thumbnail-overlay pointer-events-none z-[6]"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-night-950/50 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 bg-night-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          
          {/* Coordinate overlay for squares with screenshots */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-white text-lg font-medium bg-night-950/40 px-2 py-1 rounded backdrop-blur-sm">
              {square.coordinate}
            </span>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <ImageOff className="text-sand-500 mb-2" size={24} />
          <span className="text-sm text-sand-700 font-medium">{square.coordinate}</span>
        </div>
      )}
      
      {/* Exploration indicator */}
      {square.is_explored && (
        <div className="absolute top-2 right-2 z-10">
          <CheckCircle size={20} className="text-green-500 drop-shadow-md" />
        </div>
      )}

      {/* POI Type Icons */}
      {poiTypeDetails.length > 0 && (
        <div className="poi-icons absolute bottom-2 left-2 flex flex-wrap gap-1 max-w-[80%] z-20">
          {poiTypeDetails.map((type) => (
            <div
              key={type.id}
              className="text-white w-6 h-6 rounded flex items-center justify-center backdrop-blur-sm hover:bg-night-900/70 transition-colors relative group/icon shadow-md"
              style={{
                backgroundColor: 
                  (isIconUrl(type.icon) && type.icon_has_transparent_background) 
                  ? 'transparent' 
                  : (type.color || 'rgba(0,0,0,0.7)') // Fallback color if type.color is not set
              }}
              onMouseEnter={() => setHoveredPoiType(type)}
              onMouseLeave={() => setHoveredPoiType(null)}
            >
              {isIconUrl(type.icon) ? (
                <img 
                  src={getDisplayImageUrl(type.icon)} 
                  alt={type.name} 
                  className="w-5 h-5 object-contain"
                />
              ) : (
                <span className="text-base">{type.icon}</span>
              )}

              {/* Tooltip */}
              {hoveredPoiType?.id === type.id && poisForType.length > 0 && (
                <div 
                  className="fixed z-[100] w-48 bg-night-950/95 text-white rounded-lg shadow-lg p-2 text-sm backdrop-blur-sm"
                  style={{
                    bottom: '2.5rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    pointerEvents: 'none'
                  }}
                >
                  <div className="font-semibold mb-1">{type.name}</div>
                  <div className="text-xs text-sand-300">{type.category}</div>
                  <div className="mt-2 space-y-1">
                    {poisForType.map(poi => (
                      <div key={poi.id} className="text-xs truncate">
                        • {poi.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GridSquare;