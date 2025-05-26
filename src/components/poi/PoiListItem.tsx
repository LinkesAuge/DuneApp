import React from 'react';
import { Poi, PoiType } from '../../types';
import { Edit2, Trash2, Image as ImageIcon, MapPin } from 'lucide-react'; // Assuming Image is for a placeholder/thumbnail click

interface PoiListItemProps {
  poi: Poi;
  poiType?: PoiType;
  gridSquareCoordinate?: string;
  creator?: { username: string };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (poi: Poi) => void; // For potentially opening a detail view or modal
  onImageClick?: (poi: Poi) => void; // For opening gallery if screenshots exist
}

// Helper function to check if the icon is a URL (can be moved to a utility file)
const isPoiTypeIconUrl = (iconValue: string | null | undefined): iconValue is string => 
  typeof iconValue === 'string' && (iconValue.startsWith('http://') || iconValue.startsWith('https://'));

const PoiListItem: React.FC<PoiListItemProps> = ({
  poi,
  poiType,
  gridSquareCoordinate,
  creator,
  onEdit,
  onDelete,
  onClick,
  onImageClick
}) => {
  const formattedDate = new Date(poi.created_at).toLocaleDateString();
  const hasScreenshots = poi.screenshots && poi.screenshots.length > 0;

  return (
    <div className="bg-white shadow-sm rounded-lg p-3 hover:shadow-md transition-shadow duration-150 flex items-center gap-3 border border-sand-200">
      {/* POI Type Icon */}
      <div 
        className="w-10 h-10 flex-shrink-0 rounded flex items-center justify-center text-white text-lg"
        style={{
          backgroundColor: 
            (isPoiTypeIconUrl(poiType?.icon) && poiType?.icon_has_transparent_background) 
            ? 'transparent' 
            : (poiType?.color || 'rgba(0,0,0,0.7)')
        }}
        title={poiType?.name || 'POI Type'}
      >
        {poiType?.icon ? (
          isPoiTypeIconUrl(poiType.icon) ? (
            <img src={poiType.icon} alt={poiType.name} className="w-7 h-7 object-contain" />
          ) : (
            <span>{poiType.icon}</span>
          )
        ) : (
          <MapPin size={20} /> // Fallback icon if no poiType icon
        )}
      </div>

      {/* Main Info */}
      <div className="flex-grow cursor-pointer min-w-0" onClick={() => onClick(poi)}>
        <h3 className="text-md font-semibold text-night-900 hover:text-spice-700 transition-colors truncate" title={poi.title}>{poi.title}</h3>
        <div className="text-xs text-night-600 mt-1 space-y-0.5">
          <p><span className="font-medium">Type:</span> {poiType?.name || 'N/A'} ({poiType?.category || 'Uncategorized'})</p>
          {gridSquareCoordinate && <p><span className="font-medium">Grid:</span> {gridSquareCoordinate}</p>}
        </div>
      </div>

      {/* Meta Info, Thumbnail & Actions */}
      <div className="flex-shrink-0 flex items-center gap-3 sm:gap-4">
        {/* Optional: Small thumbnail */}
        {onImageClick && hasScreenshots && (
          <div 
            className="w-12 h-12 flex-shrink-0 bg-sand-100 rounded flex items-center justify-center cursor-pointer hover:bg-sand-200 order-first sm:order-none"
            onClick={(e) => {e.stopPropagation(); onImageClick(poi);}}
            title="View Screenshots"
          >
            {poi.screenshots?.[0]?.url ? (
                <img src={poi.screenshots[0].url} alt={poi.title} className="w-full h-full object-cover rounded" />
            ) : (
              <ImageIcon size={20} className="text-sand-500" />
            )}
          </div>
        )}
        {!onImageClick && !hasScreenshots && (
           <div className="w-12 h-12 flex-shrink-0 bg-sand-100 rounded flex items-center justify-center order-first sm:order-none" title="No screenshots">
              <ImageIcon size={20} className="text-sand-400" />
          </div>
        )} 
        {/* For spacing if no image click handler but screenshots exist - might remove if not needed */}
        {/* {!onImageClick && hasScreenshots && <div className="w-12 h-12 flex-shrink-0"></div>}  */}

        <div className="sm:text-right space-y-0.5">
          <p className="text-xs text-sand-700 truncate" title={creator?.username || 'Unknown'}>By: {creator?.username || 'Unknown'}</p>
          <p className="text-xs text-sand-600">On: {formattedDate}</p>
          <div className="mt-1 flex gap-2 justify-start sm:justify-end">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(poi.id); }}
              className="btn btn-outline btn-xs p-1.5 text-xs"
              title="Edit POI"
            >
              <Edit2 size={14} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(poi.id); }}
              className="btn btn-danger btn-xs p-1.5 text-xs"
              title="Delete POI"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoiListItem; 