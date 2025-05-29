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
          bgColor: 'bg-slate-700', // Dark theme
          textColor: 'text-amber-300', // Dark theme
          icon: '🏜️'
        };
      case 'hagga_basin':
        return {
          label: 'Hagga Basin',
          bgColor: 'bg-slate-700', // Dark theme
          textColor: 'text-sky-300',   // Dark theme
          icon: '🏔️'
        };
      default:
        return {
          label: 'Unknown',
          bgColor: 'bg-slate-600', // Dark theme
          textColor: 'text-sand-300', // Dark theme
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
    <div className="bg-night-900 p-3 flex items-center gap-3 border border-slate-700/50 hover:border-slate-600 transition-colors duration-150">
      {/* POI Type Icon */}
      <div 
        className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-sand-100 text-lg"
        style={{
          backgroundColor: 
            (isPoiTypeIconUrl(poiType?.icon) && poiType?.icon_has_transparent_background) 
            ? 'transparent' 
            : (poiType?.color || '#374151'), // Default to a dark gray if no color
          borderRadius: '0' // Sharp edges
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
        <h3 className="text-md font-semibold text-sand-100 hover:text-gold-300 transition-colors truncate" title={poi.title}>{poi.title}</h3>
        <div className="text-xs text-sand-300 mt-1 space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span><span className="font-medium">Type:</span> {poiType?.name || 'N/A'} ({poiType?.category || 'Uncategorized'})</span>
            {/* Map Type Badge */}
            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${mapTypeInfo.bgColor} ${mapTypeInfo.textColor}`}>
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
              <MessageSquare size={12} className="text-sky-400" />
              <span className="text-sky-400 font-medium">{commentCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart size={12} className="text-rose-400" />
              <span className="text-rose-400 font-medium">{likeCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Meta Info, Thumbnail & Actions */}
      <div className="flex-shrink-0 flex items-center gap-3 sm:gap-4">
        {/* Optional: Small thumbnail */}
        {onImageClick && hasScreenshots && (
          <div 
            className="w-12 h-12 flex-shrink-0 bg-slate-800 flex items-center justify-center cursor-pointer hover:bg-slate-700 order-first sm:order-none border border-slate-700"
            onClick={(e) => {e.stopPropagation(); onImageClick(poi);}}
            title="View Screenshots"
          >
            {poi.screenshots?.[0]?.url ? (
                <img src={poi.screenshots[0].url} alt={poi.title} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon size={20} className="text-sand-500" />
            )}
          </div>
        )}
        {!onImageClick && !hasScreenshots && (
           <div className="w-12 h-12 flex-shrink-0 bg-slate-800 flex items-center justify-center order-first sm:order-none border border-slate-700" title="No screenshots">
              <ImageIcon size={20} className="text-sand-400" />
          </div>
        )} 

        <div className="sm:text-right space-y-0.5">
          <div className="flex items-center justify-between text-xs text-sand-400">
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
              className="p-1.5 text-sand-300 hover:bg-slate-700/50 focus:outline-none focus:ring-1 focus:ring-gold-400"
              title="Edit POI"
            >
              <Edit2 size={14} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(poi.id); }}
              className="p-1.5 text-red-500 hover:bg-slate-700/50 focus:outline-none focus:ring-1 focus:ring-gold-400"
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