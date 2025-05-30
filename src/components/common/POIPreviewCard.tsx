import React from 'react';
import { Poi, PoiType, CustomIcon } from '../../types';
import { formatDateWithPreposition } from '../../lib/dateUtils';

interface POIPreviewCardProps {
  poi: Poi;
  poiType: PoiType;
  customIcons: CustomIcon[];
  userInfo?: { [key: string]: { username: string } };
  layout?: 'grid' | 'list';
  onClick: () => void;
  className?: string;
}

const POIPreviewCard: React.FC<POIPreviewCardProps> = ({
  poi,
  poiType,
  customIcons,
  userInfo = {},
  layout = 'grid',
  onClick,
  className = ''
}) => {
  const creator = userInfo[poi.created_by];
  const customIcon = customIcons.find(ci => ci.id === poi.custom_icon_id);
  
  // Get the display icon (custom icon takes precedence)
  const displayIcon = customIcon ? customIcon.url : poiType.icon;
  const isIconUrl = displayIcon.startsWith('http') || displayIcon.startsWith('/') || displayIcon.includes('.');

  // Format the date with proper grammar
  const dateInfo = formatDateWithPreposition(poi.created_at);
  const formattedDate = dateInfo.useOn ? `on ${dateInfo.date}` : dateInfo.date;

  // Get map type display info
  const getMapDisplayInfo = (mapType: string) => {
    switch (mapType) {
      case 'deep_desert':
        return {
          label: 'Deep Desert',
          bgColor: 'bg-amber-700',
          textColor: 'text-amber-100'
        };
      case 'hagga_basin':
        return {
          label: 'Hagga Basin',
          bgColor: 'bg-blue-700',
          textColor: 'text-blue-100'
        };
      default:
        return {
          label: 'Unknown',
          bgColor: 'bg-gray-700',
          textColor: 'text-gray-100'
        };
    }
  };

  const mapInfo = getMapDisplayInfo(poi.map_type || 'unknown');

  if (layout === 'list') {
    return (
      <div
        className={`bg-night-800 border border-slate-700 rounded-lg p-4 cursor-pointer hover:border-gold-500 transition-colors ${className}`}
        onClick={onClick}
      >
        <div className="flex items-start space-x-4">
          {/* POI Type Icon */}
          <div 
            className="w-12 h-12 rounded-full border-2 border-gold-400 flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: poiType.icon_has_transparent_background && isIconUrl 
                ? 'transparent' 
                : poiType.color || '#666666'
            }}
          >
            {isIconUrl ? (
              <img src={displayIcon} alt={poiType.name} className="w-7 h-7 object-contain" />
            ) : (
              <span className="text-xl">{displayIcon}</span>
            )}
          </div>

          {/* POI Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-gold-300 font-semibold text-lg truncate">{poi.title}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gold-900 text-gold-300 border border-gold-700">
                    {poiType.name}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${mapInfo.bgColor} ${mapInfo.textColor}`}>
                    {mapInfo.label}
                  </span>
                  {poi.screenshots && poi.screenshots.length > 0 && (
                    <span className="text-xs text-gold-400 font-medium">
                      📷 {poi.screenshots.length}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {poi.description && (
              <p className="text-slate-300 text-sm mt-2 line-clamp-2">{poi.description}</p>
            )}
            
            <div className="flex justify-between items-center text-xs text-slate-400 mt-3">
              <span>Created by {creator?.username || 'Unknown'}</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid layout
  return (
    <div
      className={`bg-night-800 border border-slate-700 rounded-lg p-4 cursor-pointer hover:border-gold-500 transition-colors ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        {/* POI Type Icon */}
        <div 
          className="w-10 h-10 rounded-full border-2 border-gold-400 flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: poiType.icon_has_transparent_background && isIconUrl 
              ? 'transparent' 
              : poiType.color || '#666666'
          }}
        >
          {isIconUrl ? (
            <img src={displayIcon} alt={poiType.name} className="w-6 h-6 object-contain" />
          ) : (
            <span className="text-lg">{displayIcon}</span>
          )}
        </div>

        {/* POI Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-gold-300 font-semibold truncate">{poi.title}</h4>
          <div className="flex items-center space-x-2 text-sm text-slate-400 mt-1">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gold-900 text-gold-300 border border-gold-700">
              {poiType.name}
            </span>
            {poi.screenshots && poi.screenshots.length > 0 && (
              <span className="text-xs text-gold-400">📷 {poi.screenshots.length}</span>
            )}
          </div>
          {poi.description && (
            <p className="text-sm text-slate-300 mt-2 line-clamp-2">{poi.description}</p>
          )}
          <div className="text-xs text-slate-400 mt-2">
            Created by {creator?.username || 'Unknown'} {formattedDate}
          </div>
        </div>
      </div>
    </div>
  );
};

export default POIPreviewCard; 