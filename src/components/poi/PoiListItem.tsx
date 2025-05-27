import React, { useState, useEffect } from 'react';
import { Poi, PoiType } from '../../types';
import { Edit2, Trash2, Image as ImageIcon, MapPin, MessageSquare, Heart } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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
  const [commentCount, setCommentCount] = useState<number>(0);
  const [likeCount, setLikeCount] = useState<number>(0);
  
  const formattedDate = new Date(poi.created_at).toLocaleDateString();
  const hasScreenshots = poi.screenshots && poi.screenshots.length > 0;

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

  // Fetch comment and like counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch comment count
        const { count: commentsCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('poi_id', poi.id);

        // Fetch like count
        const { count: likesCount } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('target_type', 'poi')
          .eq('target_id', poi.id);

        setCommentCount(commentsCount || 0);
        setLikeCount(likesCount || 0);
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
  }, [poi.id]);

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
          <div className="flex items-center gap-2 flex-wrap">
            <span><span className="font-medium">Type:</span> {poiType?.name || 'N/A'} ({poiType?.category || 'Uncategorized'})</span>
            {/* Map Type Badge */}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${mapTypeInfo.bgColor} ${mapTypeInfo.textColor}`}>
              <span className="mr-1">{mapTypeInfo.icon}</span>
              {mapTypeInfo.label}
            </span>
          </div>
          {poi.map_type === 'deep_desert' && gridSquareCoordinate && (
            <p><span className="font-medium">Grid:</span> {gridSquareCoordinate}</p>
          )}
          {/* Engagement Stats */}
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <MessageSquare size={12} className="text-blue-500" />
              <span className="text-blue-600 font-medium">{commentCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart size={12} className="text-red-500" />
              <span className="text-red-600 font-medium">{likeCount}</span>
            </div>
          </div>
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

        <div className="sm:text-right space-y-0.5">
          <div className="flex items-center justify-between text-xs text-sand-600">
            <span className="truncate" title={creator?.username || 'Unknown'}>
              By {creator?.username || 'Unknown'}
            </span>
            <span>
              {formattedDate}
            </span>
          </div>
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