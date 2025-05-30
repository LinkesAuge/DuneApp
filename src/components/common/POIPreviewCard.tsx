import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Share, Lock, Eye, Users, Image as ImageIcon, MessageCircle, Mountain, Pyramid, MapPin } from 'lucide-react';
import { Poi, PoiType, CustomIcon } from '../../types';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../../lib/supabase';
import { formatDateWithPreposition, wasUpdated } from '../../lib/dateUtils';
import { getDisplayNameFromProfile } from '../../lib/utils';
import CommentsList from '../comments/CommentsList';

interface POIPreviewCardProps {
  poi: Poi;
  poiType: PoiType;
  customIcons: CustomIcon[];
  userInfo?: { [key: string]: { username: string; display_name?: string | null } };
  layout?: 'grid' | 'list';
  onClick: () => void;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onImageClick?: () => void;
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
  global: 'text-green-400',
  private: 'text-red-400',
  shared: 'text-blue-400'
} as const;

// Privacy level labels
const privacyLabels = {
  global: 'Public',
  private: 'Private',
  shared: 'Shared'
} as const;

const POIPreviewCard: React.FC<POIPreviewCardProps> = ({
  poi,
  poiType,
  customIcons,
  userInfo = {},
  layout = 'grid',
  onClick,
  className = '',
  onEdit,
  onDelete,
  onShare,
  onImageClick
}) => {
  const { user } = useAuth();
  const canModify = user && (user.id === poi.created_by || user.role === 'admin' || user.role === 'editor');
  
  // State for additional data
  const [commentCount, setCommentCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  const creator = userInfo[poi.created_by] || (poi.created_by ? undefined : { username: 'Deleted User' });
  const imageUrl = getDisplayImageUrl(poi, poiType, customIcons);
  const PrivacyIcon = privacyIcons[poi.privacy_level];
  const privacyColor = privacyColors[poi.privacy_level];
  const privacyLabel = privacyLabels[poi.privacy_level];
  
  // Format the date with proper grammar
  const { date, useOn } = formatDateWithPreposition(poi.created_at);
  const formattedDate = useOn ? `on ${date}` : date;
  
  // Check if POI was edited
  const isEdited = wasUpdated(poi.created_at, poi.updated_at);
  
  // Fetch comment count
  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const { count, error } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('poi_id', poi.id);
        
        if (!error) {
          setCommentCount(count || 0);
        }
      } catch (error) {
        console.error('Error fetching comment count:', error);
      }
    };
    
    fetchCommentCount();
  }, [poi.id]);

  // Format metadata text
  let metaText = `Created by ${getDisplayNameFromProfile(creator) || 'Unknown'} ${formattedDate}`;
  if (isEdited && poi.updated_at) {
    const { date: updatedDate, useOn: updatedUseOn } = formatDateWithPreposition(poi.updated_at);
    metaText += ` • Updated ${updatedUseOn ? `on ${updatedDate}` : updatedDate}`;
  }

  // Handle actions
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) onShare();
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onImageClick) onImageClick();
  };

  const handleToggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleToggleComments = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowComments(!showComments);
  };

  if (layout === 'list') {
    return (
      <div className={`bg-slate-900 border border-slate-700 rounded-lg overflow-hidden ${className}`}>
        {/* Header - Compact POI Modal Style */}
        <div 
          className="bg-slate-800/50 px-4 py-3 border-b border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-800/70 transition-colors"
          onClick={expanded ? undefined : onClick}
        >
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            {/* POI Icon */}
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-700 border border-slate-600 flex-shrink-0">
              {imageUrl ? (
                <img src={imageUrl} alt={poiType.name} className="w-6 h-6 object-contain" />
              ) : (
                <span className="text-lg">{poiType.icon}</span>
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-amber-200 truncate" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                {poi.title}
              </h3>
              <div className="flex items-center space-x-2 text-xs">
                <span className="px-2 py-0.5 bg-slate-700 text-amber-300 rounded">{poiType.name}</span>
                
                {/* Map Type with Icons */}
                <span className={`px-2 py-0.5 rounded flex items-center space-x-1 ${
                  poi.map_type === 'deep_desert' 
                    ? 'bg-orange-200 text-orange-900' 
                    : 'bg-blue-600/70 text-blue-200'
                }`}>
                  {poi.map_type === 'hagga_basin' ? (
                    <Mountain className="w-3 h-3" />
                  ) : (
                    <Pyramid className="w-3 h-3" />
                  )}
                  <span className="capitalize">
                    {poi.map_type?.replace('_', ' ') || 'Unknown'}
                    {poi.map_type === 'deep_desert' && poi.grid_square?.coordinate && (
                      <span className="ml-1">({poi.grid_square.coordinate})</span>
                    )}
                  </span>
                </span>
                
                <div className="flex items-center">
                  <PrivacyIcon className={`w-3 h-3 mr-1 ${privacyColor}`} />
                  <span className={`${privacyColor} text-xs`}>{privacyLabel}</span>
                </div>
                {poi.screenshots && poi.screenshots.length > 0 && (
                  <span className="text-xs text-amber-400">📷 {poi.screenshots.length}</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons - Compact */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            <button
              onClick={handleToggleExpanded}
              className="p-1.5 text-amber-300 hover:text-amber-100 hover:bg-slate-700/50 rounded transition-colors"
              title={expanded ? "Collapse" : "Expand"}
            >
              <Eye className="w-4 h-4" />
            </button>

            {poi.screenshots && poi.screenshots.length > 0 && onImageClick && (
              <button
                onClick={handleImageClick}
                className="p-1.5 text-amber-300 hover:text-amber-100 hover:bg-slate-700/50 rounded transition-colors"
                title="View Gallery"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            )}

            {canModify && onEdit && (
              <button
                onClick={handleEdit}
                className="p-1.5 text-blue-300 hover:text-blue-100 hover:bg-slate-700/50 rounded transition-colors"
                title="Edit POI"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            
            {canModify && onDelete && (
              <button
                onClick={handleDelete}
                className="p-1.5 text-red-300 hover:text-red-100 hover:bg-slate-700/50 rounded transition-colors"
                title="Delete POI"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {onShare && (
              <button
                onClick={handleShare}
                className="p-1.5 text-green-300 hover:text-green-100 hover:bg-slate-700/50 rounded transition-colors"
                title="Share POI"
              >
                <Share className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="overflow-y-auto max-h-[400px]">
            {/* Screenshot Preview - Compact */}
            {poi.screenshots && poi.screenshots.length > 0 && (
              <div className="p-4 border-b border-slate-700">
                <div className="grid gap-2" style={{ 
                  gridTemplateColumns: poi.screenshots.length === 1 
                    ? '1fr' 
                    : poi.screenshots.length === 2 
                      ? 'repeat(2, 1fr)' 
                      : 'repeat(3, 1fr)'
                }}>
                  {poi.screenshots.slice(0, 3).map((screenshot, index) => (
                    <div key={screenshot.id || index} className="relative group aspect-video">
                      <img
                        src={screenshot.url}
                        alt={`POI screenshot ${index + 1}`}
                        className="w-full h-full object-cover rounded cursor-pointer transition-opacity group-hover:opacity-90"
                        onClick={handleImageClick}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Eye className="w-4 h-4 text-white drop-shadow-lg" />
                      </div>
                    </div>
                  ))}
                </div>
                
                {poi.screenshots.length > 3 && (
                  <div className="mt-2 text-xs text-slate-400 text-center">
                    +{poi.screenshots.length - 3} more screenshots • Click to view all
                  </div>
                )}
              </div>
            )}

            {/* Description - Compact */}
            {poi.description && (
              <div className="p-4 border-b border-slate-700">
                <h4 className="text-sm font-medium text-amber-200 mb-2">Description</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {poi.description}
                </p>
              </div>
            )}

            {/* Details - Compact */}
            <div className="p-4 border-b border-slate-700">
              <h4 className="text-sm font-medium text-amber-200 mb-2">Details</h4>
              <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Category:</span>
                    <span className="text-slate-200 ml-1">{poiType.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Type:</span>
                    <span className="text-slate-200 ml-1">{poiType.name}</span>
                  </div>
                  {poi.map_type === 'deep_desert' && poi.grid_square?.coordinate && (
                    <div>
                      <span className="text-slate-400">Grid:</span>
                      <span className="text-slate-200 ml-1">{poi.grid_square.coordinate}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400">Map:</span>
                    <span className="text-slate-200 ml-1 flex items-center space-x-1">
                      {poi.map_type === 'hagga_basin' ? (
                        <Mountain className="w-3 h-3 text-blue-400" />
                      ) : (
                        <Pyramid className="w-3 h-3 text-orange-400" />
                      )}
                      <span className="capitalize">
                        {poi.map_type?.replace('_', ' ') || 'Unknown'}
                        {poi.map_type === 'deep_desert' && poi.grid_square?.coordinate && (
                          <span className="text-green-400 ml-1">({poi.grid_square.coordinate})</span>
                        )}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata - Compact */}
            <div className="p-3 border-b border-slate-700 text-xs text-slate-400 text-center">
              <div className="flex items-center justify-between text-xs text-sand-600">
                <span>Created by {getDisplayNameFromProfile(creator) || 'Loading...'} {formattedDate}</span>
                <div className="flex items-center space-x-2">
                  <PrivacyIcon size={12} className={privacyColor} />
                  <span className={privacyColor}>{privacyLabel}</span>
                </div>
              </div>
            </div>

            {/* Comments Toggle - Compact */}
            <div className="p-3">
              <button
                onClick={handleToggleComments}
                className="w-full flex items-center justify-between text-sm text-amber-200 hover:text-amber-100 transition-colors bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-3 py-2"
              >
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Comments</span>
                  {commentCount > 0 && (
                    <span className="bg-amber-600 text-slate-900 text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                      {commentCount}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  {showComments ? 'Hide' : 'Show'}
                </span>
              </button>
              
              {/* Comments Section - Collapsible */}
              {showComments && (
                <div className="mt-3">
                  <CommentsList 
                    poiId={poi.id} 
                    showLikeButton={true}
                    likeTargetType="poi"
                    likeTargetId={poi.id}
                    initiallyExpanded={true}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Grid layout - Compact card
  return (
    <div
      className={`bg-slate-900 border border-slate-700 rounded-lg p-4 cursor-pointer hover:border-amber-500 transition-colors ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        {/* POI Type Icon */}
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-700 border border-slate-600 flex-shrink-0">
          {imageUrl ? (
            <img src={imageUrl} alt={poiType.name} className="w-6 h-6 object-contain" />
          ) : (
            <span className="text-lg">{poiType.icon}</span>
          )}
        </div>

        {/* POI Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-amber-200 font-semibold truncate" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            {poi.title}
          </h4>
          <div className="flex items-center space-x-2 text-xs mt-1">
            <span className="px-2 py-0.5 bg-slate-700 text-amber-300 rounded">{poiType.name}</span>
            
            {/* Map Type with Icons */}
            <span className={`px-2 py-0.5 rounded flex items-center space-x-1 ${
              poi.map_type === 'deep_desert' 
                ? 'bg-orange-200 text-orange-900' 
                : 'bg-blue-600/70 text-blue-200'
            }`}>
              {poi.map_type === 'hagga_basin' ? (
                <Mountain className="w-3 h-3" />
              ) : (
                <Pyramid className="w-3 h-3" />
              )}
              <span className="capitalize">
                {poi.map_type?.replace('_', ' ') || 'Unknown'}
                {poi.map_type === 'deep_desert' && poi.grid_square?.coordinate && (
                  <span className="ml-1">({poi.grid_square.coordinate})</span>
                )}
              </span>
            </span>
            
            <div className="flex items-center">
              <PrivacyIcon className={`w-3 h-3 mr-1 ${privacyColor}`} />
              <span className={`${privacyColor}`}>{privacyLabel}</span>
            </div>
            {poi.screenshots && poi.screenshots.length > 0 && (
              <span className="text-xs text-amber-400 mt-1">📷 {poi.screenshots.length} screenshots</span>
            )}
          </div>
          
          {poi.description && (
            <p className="text-sm text-slate-300 mt-2 overflow-hidden" style={{ 
              display: '-webkit-box', 
              WebkitLineClamp: 2, 
              WebkitBoxOrient: 'vertical' 
            }}>
              {poi.description}
            </p>
          )}
          
          <div className="flex justify-between items-center text-xs text-slate-400 mt-2">
            <span>Created by {getDisplayNameFromProfile(creator) || 'Unknown'}</span>
            <span>{formattedDate}</span>
          </div>
          
          {commentCount > 0 && (
            <div className="text-xs text-amber-400 mt-1">💬 {commentCount} comments</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default POIPreviewCard; 