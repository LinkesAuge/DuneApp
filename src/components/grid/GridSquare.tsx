import React, { useState, useMemo } from 'react';
import { GridSquare as GridSquareType, Poi, PoiType } from '../../types';
import { ImageOff } from 'lucide-react';

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

  // Force re-render when POI data changes by creating a dependency key
  const poiDataKey = useMemo(() => {
    return poisToDisplay.map(poi => `${poi.id}-${poi.poi_type_id}`).join(',');
  }, [poisToDisplay]);

  const handleClick = (e: React.MouseEvent) => {
    // Always navigate to the grid page when clicking anywhere on the square
    onClick();
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
      className={`w-full h-full border relative group cursor-pointer transition-all duration-300 hover:shadow-xl overflow-hidden ${
        square.is_explored 
          ? 'bg-slate-800' 
          : 'bg-slate-700/60'
      } ${
        isHighlighted 
          ? 'border-2 border-amber-400/60 shadow-amber-400/30 shadow-lg animate-pulse-highlight' 
          : 'border border-amber-400/30'
      }`}
      onClick={handleClick}
    >
      {/* Enhanced Highlight Overlay */}
      {isHighlighted && (
        <div className="absolute inset-0 bg-amber-500/20 pointer-events-none z-[5] animate-pulse"></div>
      )}

      {/* Enhanced POI Count Badge */}
      {poisToDisplay.length > 0 && (
        <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 px-2 py-0.5 rounded-full text-xs font-medium z-10 backdrop-blur-sm shadow-lg">
          {poisToDisplay.length}
        </div>
      )}

      {square.screenshot_url ? (
        <>
          <img 
            src={square.screenshot_url} 
            alt={`Grid ${square.coordinate}`}
            className="w-full h-full object-cover cursor-pointer"
          />
          {/* Enhanced Thumbnail Overlay for highlight pulse */}
          {isHighlighted && (
            <div className="absolute inset-0 w-full h-full animate-pulse-thumbnail-overlay pointer-events-none z-[6] bg-amber-500/10"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Enhanced Coordinate overlay for squares with screenshots */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-amber-200 text-lg font-light tracking-wider bg-slate-950/60 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-amber-400/20"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              {square.coordinate}
            </span>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-700/40 border border-amber-400/20 group-hover:border-amber-400/40 transition-all duration-300">
          <ImageOff className="text-amber-300/70 mb-2 group-hover:text-amber-300 transition-colors duration-300" size={24} />
          <span className="text-sm text-amber-200 font-light tracking-wide"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            {square.coordinate}
          </span>
        </div>
      )}

      {/* Enhanced POI Type Icons - Click-through disabled */}
      {poiTypeDetails.length > 0 && (
        <div className="poi-icons absolute bottom-2 left-2 flex flex-wrap gap-1 max-w-[80%] z-20 pointer-events-none">
          {poiTypeDetails.map((type) => (
            <div
              key={type.id}
              className="text-white w-6 h-6 flex items-center justify-center transition-all duration-300 relative"
              style={{
                backgroundColor: 'transparent'
              }}
              onMouseEnter={() => setHoveredPoiType(type)}
              onMouseLeave={() => setHoveredPoiType(null)}
            >
              {isIconUrl(type.icon) ? (
                <img 
                  src={getDisplayImageUrl(type.icon)} 
                  alt={type.name} 
                  className="w-5 h-5 object-contain"
                  style={{
                    filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.9)) drop-shadow(0 0 10px rgba(0,0,0,0.7)) drop-shadow(0 0 16px rgba(0,0,0,0.5)) drop-shadow(0 0 24px rgba(0,0,0,0.3))'
                  }}
                />
              ) : (
                <span 
                  className="text-base leading-none font-medium"
                  style={{ 
                    color: type.color,
                    textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.7), 0 0 16px rgba(0,0,0,0.5), 0 0 24px rgba(0,0,0,0.3)'
                  }}
                >
                  {type.icon}
                </span>
              )}

              {/* Enhanced Tooltip */}
              {hoveredPoiType?.id === type.id && poisForType.length > 0 && (
                <div 
                  className="fixed z-[100] w-48 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-amber-200 rounded-lg shadow-xl border border-amber-400/30 p-3 text-sm backdrop-blur-sm"
                  style={{
                    bottom: '2.5rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    pointerEvents: 'none',
                    fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif"
                  }}
                >
                  <div className="font-light text-amber-200 mb-1 tracking-wide">{type.name}</div>
                  <div className="text-xs text-amber-300/70 font-light tracking-wide">{type.category}</div>
                  <div className="mt-2 space-y-1">
                    {poisForType.map(poi => (
                      <div key={poi.id} className="text-xs truncate text-amber-300/80 font-light">
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