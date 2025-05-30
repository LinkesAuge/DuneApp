import React, { useState, useEffect } from 'react';
import { X, Edit, Trash2, Share, MapPin, Clock, Users, Lock, Eye, User, Image as ImageIcon, Heart, Mountain, Pyramid } from 'lucide-react';
import { Poi, PoiType, CustomIcon } from '../../types';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../../lib/supabase';
import { formatCompactDateTime, wasUpdated, formatDateWithPreposition } from '../../lib/dateUtils';
import CommentsList from '../comments/CommentsList';

interface POICardProps {
  poi: Poi;
  poiType: PoiType;
  customIcons: CustomIcon[];
  isOpen: boolean;
  onClose: () => void;
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

const POICard: React.FC<POICardProps> = ({
  poi,
  poiType,
  customIcons,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onShare,
  onImageClick
}) => {
  const { user } = useAuth();
  const canModify = user && (user.id === poi.created_by || user.role === 'admin' || user.role === 'editor');
  
  // State for user information
  const [creatorInfo, setCreatorInfo] = useState<{ username: string } | null>(null);
  const [editorInfo, setEditorInfo] = useState<{ username: string } | null>(null);
  const [loadingUserInfo, setLoadingUserInfo] = useState(true);
  const [commentCount, setCommentCount] = useState(0);
  
  const imageUrl = getDisplayImageUrl(poi, poiType, customIcons);
  const PrivacyIcon = privacyIcons[poi.privacy_level];
  const privacyColor = privacyColors[poi.privacy_level];
  const privacyLabel = privacyLabels[poi.privacy_level];
  
  // Check if POI was edited
  const isEdited = wasUpdated(poi.created_at, poi.updated_at);
  
  // Fetch user information and comment count
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingUserInfo(true);
        
        // Fetch user information - Filter out null values to avoid UUID errors
        const userIds = [poi.created_by, poi.updated_by].filter(id => id !== null && id !== undefined);
        
        if (userIds.length > 0) {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id, username')
            .in('id', userIds);
          
          if (userError) throw userError;
          
          const creatorData = userData?.find(u => u.id === poi.created_by);
          const editorData = userData?.find(u => u.id === poi.updated_by);
          
          setCreatorInfo(creatorData ? { username: creatorData.username } : null);
          setEditorInfo(editorData ? { username: editorData.username } : null);
        } else {
          // No valid user IDs, set to null
          setCreatorInfo(null);
          setEditorInfo(null);
        }
        
        // Fetch comment count
        const { count, error: commentError } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('poi_id', poi.id);
        
        if (!commentError) {
          setCommentCount(count || 0);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingUserInfo(false);
      }
    };
    
    if (isOpen && poi) {
      fetchData();
    }
  }, [isOpen, poi.created_by, poi.updated_by, poi.id]);

  if (!isOpen) return null;

  // Format metadata text
  let metaText = `Created by ${creatorInfo?.username || (poi.created_by ? 'Loading...' : 'Deleted User')} ${(() => {
    const { date, useOn } = formatDateWithPreposition(poi.created_at);
    return useOn ? `on ${date}` : date;
  })()}`;
  
  if (isEdited && editorInfo) {
    const { date: editDate, useOn: editUseOn } = formatDateWithPreposition(poi.updated_at);
    metaText += ` • Edited by ${editorInfo.username} ${editUseOn ? `on ${editDate}` : editDate}`;
  } else if (isEdited && poi.updated_by && !editorInfo && !loadingUserInfo) {
    const { date: editDate, useOn: editUseOn } = formatDateWithPreposition(poi.updated_at);
    metaText += ` • Edited by ${poi.updated_by ? 'Loading...' : 'Deleted User'} ${editUseOn ? `on ${editDate}` : editDate}`;
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[55] flex items-center justify-center p-4">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Compact POI Modal Style */}
        <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
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
              <h2 className="text-lg font-bold text-amber-200 truncate" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                {poi.title}
              </h2>
              <div className="flex items-center space-x-2 text-xs">
                <span className="px-2 py-0.5 bg-slate-700 text-amber-300 rounded">{poiType.category}</span>
                
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
              </div>
            </div>
          </div>

          {/* Action Buttons - Compact */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            {poi.screenshots && poi.screenshots.length > 0 && onImageClick && (
              <button
                onClick={onImageClick}
                className="p-1.5 text-amber-300 hover:text-amber-100 hover:bg-slate-700/50 rounded transition-colors"
                title="View Gallery"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            )}

            {canModify && onEdit && (
              <button
                onClick={onEdit}
                className="p-1.5 text-blue-300 hover:text-blue-100 hover:bg-slate-700/50 rounded transition-colors"
                title="Edit POI"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            
            {canModify && onDelete && (
              <button
                onClick={onDelete}
                className="p-1.5 text-red-300 hover:text-red-100 hover:bg-slate-700/50 rounded transition-colors"
                title="Delete POI"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {onShare && (
              <button
                onClick={onShare}
                className="p-1.5 text-green-300 hover:text-green-100 hover:bg-slate-700/50 rounded transition-colors"
                title="Share POI"
              >
                <Share className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-700/50 rounded transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content - Compact */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
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
                {poi.screenshots.slice(0, 3).map((screenshot, index) => {
                  return (
                    <div 
                      key={screenshot.id || index} 
                      className="relative group aspect-video"
                    >
                      <img
                        src={screenshot.url}
                        alt={`POI screenshot ${index + 1}`}
                        className="w-full h-full object-cover rounded cursor-pointer transition-opacity group-hover:opacity-90"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log(`Image clicked for screenshot ${index + 1}`);
                          if (onImageClick) {
                            console.log('Calling onImageClick function');
                            onImageClick();
                          } else {
                            console.log('No onImageClick function provided');
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                        <Eye className="w-4 h-4 text-white drop-shadow-lg" />
                      </div>
                    </div>
                  );
                })}
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
              <h3 className="text-sm font-medium text-amber-200 mb-2">Description</h3>
              <p className="text-sm text-slate-300 leading-relaxed overflow-hidden" style={{ 
                display: '-webkit-box', 
                WebkitLineClamp: 3, 
                WebkitBoxOrient: 'vertical' 
              }}>
                {poi.description}
              </p>
            </div>
          )}

          {/* Details - Compact */}
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-sm font-medium text-amber-200 mb-2">Details</h3>
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
                <div>
                  <span className="text-slate-400">Coordinates:</span>
                  <span className="text-slate-200 ml-1">
                    {poi.coordinates_x && poi.coordinates_y 
                      ? `${poi.coordinates_x.toFixed(0)}, ${poi.coordinates_y.toFixed(0)}`
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata - Compact */}
          <div className="p-3 border-b border-slate-700 text-xs text-slate-400 text-center">
            {metaText}
          </div>

          {/* Comments Section - Direct CommentsList */}
          <div className="p-3">
            <CommentsList 
              poiId={poi.id} 
              showLikeButton={true}
              likeTargetType="poi"
              likeTargetId={poi.id}
              initiallyExpanded={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default POICard; 