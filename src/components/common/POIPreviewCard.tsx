import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Share, Lock, Eye, Users, Image as ImageIcon, MessageCircle, Mountain, Pyramid, MapPin } from 'lucide-react';
import { Poi, PoiType } from '../../types';
import { Rank } from '../../types/profile';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../../lib/supabase';
import { formatDateWithPreposition, wasUpdated } from '../../lib/dateUtils';
import { getDisplayNameFromProfile } from '../../lib/utils';
import UserAvatar from './UserAvatar';
import RankBadge from './RankBadge';
import CommentsList from '../comments/CommentsList';
import { useNavigate, useLocation } from 'react-router-dom';

interface POIPreviewCardProps {
  poi: Poi;
  poiTypes: PoiType[];

  userInfo?: { [key: string]: { username: string; display_name?: string | null; custom_avatar_url?: string | null; discord_avatar_url?: string | null; use_discord_avatar?: boolean } };
  layout?: 'grid' | 'list';
  onClick: () => void;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onImageClick?: () => void;
  onHighlight?: () => void;
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
  poiTypes,
  userInfo = {},
  layout = 'grid',
  onClick,
  className = '',
  onEdit,
  onDelete,
  onShare,
  onImageClick,
  onHighlight
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle case where poiTypes is undefined or empty
  if (!poiTypes || !Array.isArray(poiTypes)) {
    console.error('poiTypes is undefined or not an array in POIPreviewCard');
    return (
      <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-3">
        <p className="text-red-300 text-sm">POI types data missing</p>
        <p className="text-red-400/70 text-xs">POI: {poi.title}</p>
      </div>
    );
  }
  
  // Find the POI type for this POI
  const poiType = poiTypes.find(type => type.id === poi.poi_type_id);
  
  // If no POI type found, render error state or skip
  if (!poiType) {
    console.error('POI type not found for POI:', poi.id, 'poi_type_id:', poi.poi_type_id);
    return (
      <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-3">
        <p className="text-red-300 text-sm">POI type not found</p>
        <p className="text-red-400/70 text-xs">POI: {poi.title}</p>
      </div>
    );
  }
  
  // Check if current user can modify this POI
  const canModify = user && (user.id === poi.created_by || user.role === 'admin' || user.role === 'editor');
  
  // State for user information and comments with rank
  const [creatorInfo, setCreatorInfo] = useState<{ username: string; display_name?: string | null; custom_avatar_url?: string | null; discord_avatar_url?: string | null; use_discord_avatar?: boolean; rank?: Rank | null } | null>(null);
  const [editorInfo, setEditorInfo] = useState<{ username: string; display_name?: string | null; custom_avatar_url?: string | null; discord_avatar_url?: string | null; use_discord_avatar?: boolean; rank?: Rank | null } | null>(null);
  const [loadingUserInfo, setLoadingUserInfo] = useState(true);
  const [commentCount, setCommentCount] = useState(0);

  const [expanded, setExpanded] = useState(false);
  
  const imageUrl = getDisplayImageUrl(poi, poiType);
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
        
        // Fetch user information with rank data - Filter out null values to avoid UUID errors
        const userIds = [poi.created_by, poi.updated_by].filter(id => id !== null && id !== undefined);
        
        if (userIds.length > 0) {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id, username, display_name, custom_avatar_url, discord_avatar_url, use_discord_avatar, rank:ranks(*)')
            .in('id', userIds);
          
          if (userError) throw userError;
          
          const creatorData = userData?.find(u => u.id === poi.created_by);
          const editorData = userData?.find(u => u.id === poi.updated_by);
          
          setCreatorInfo(creatorData ? { 
            username: creatorData.username, 
            display_name: creatorData.display_name, 
            custom_avatar_url: creatorData.custom_avatar_url, 
            discord_avatar_url: creatorData.discord_avatar_url,
            use_discord_avatar: creatorData.use_discord_avatar,
            rank: creatorData.rank
          } : null);
          setEditorInfo(editorData ? { 
            username: editorData.username, 
            display_name: editorData.display_name, 
            custom_avatar_url: editorData.custom_avatar_url, 
            discord_avatar_url: editorData.discord_avatar_url,
            use_discord_avatar: editorData.use_discord_avatar,
            rank: editorData.rank
          } : null);
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
    
    fetchData();
  }, [poi.created_by, poi.updated_by, poi.id, poi.updated_at]); // Add updated_at to trigger refresh on edits

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
    e.preventDefault();
    if (onImageClick) {
      onImageClick();
    }
  };

  const handleToggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  // Handle Go To button navigation
  const handleGoTo = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const currentPath = location.pathname;
    const targetPath = poi.map_type === 'hagga_basin' 
      ? `/hagga-basin`
      : poi.grid_square?.coordinate 
        ? `/deep-desert/grid/${poi.grid_square.coordinate}`
        : '/deep-desert';
    
    // If we're already on the target page, just add/update the highlight parameter
    if (currentPath === targetPath) {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('highlight', poi.id);
      navigate(`${targetPath}?${searchParams.toString()}`, { replace: true });
    } else {
      // Navigate to the target page with highlight
      navigate(`${targetPath}?highlight=${poi.id}`);
    }
  };

  if (layout === 'list') {
    return (
      <div className={`bg-slate-900 border border-slate-700 rounded-xl shadow-lg overflow-hidden ${className}`}>
        {/* Header - Identical to POI Modal Style */}
        <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-800/70 transition-colors"
          onClick={expanded ? undefined : onClick}
        >
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            {/* POI Icon - Identical to Modal */}
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
                
                {/* Map Type with Icons - Identical to Modal */}
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

          {/* Action Buttons - Identical to Modal */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            <button
              onClick={handleGoTo}
              className="p-1.5 text-purple-300 hover:text-purple-100 hover:bg-slate-700/50 rounded transition-colors"
              title="Go to POI on Map"
            >
              <MapPin className="w-4 h-4" />
            </button>

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

            {/* Only show share button for private/shared POIs that the user owns */}
            {onShare && user && poi.created_by === user.id && poi.privacy_level !== 'global' && (
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

        {/* Expanded Content - Identical to Modal Structure */}
        {expanded && (
          <div className="overflow-y-auto max-h-[500px]">
            {/* Screenshot Preview - Identical to Modal */}
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
                          onClick={handleImageClick}
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

            {/* Description - Identical to Modal */}
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

            {/* Details - Identical to Modal */}
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

            {/* Metadata - Enhanced with Avatars and Ranks */}
            <div className="p-3 border-b border-slate-700">
              <div className="space-y-2">
                {/* Creator Information */}
                <div className="flex items-center gap-2 text-xs">
                  <UserAvatar 
                    user={{ 
                      custom_avatar_url: creatorInfo?.custom_avatar_url, 
                      discord_avatar_url: creatorInfo?.discord_avatar_url,
                      use_discord_avatar: creatorInfo?.use_discord_avatar
                    }} 
                    size="xs" 
                  />
                  <span className="text-slate-400">Created by</span>
                  <span className="text-amber-300 font-medium">
                    {getDisplayNameFromProfile(creatorInfo) || (poi.created_by ? 'Loading...' : 'Deleted User')}
                  </span>
                  {creatorInfo?.rank && (
                    <RankBadge rank={creatorInfo.rank} size="xxs" />
                  )}
                  <span className="text-slate-400">
                    {(() => {
                      const { date, useOn } = formatDateWithPreposition(poi.created_at);
                      return useOn ? `on ${date}` : date;
                    })()}
                  </span>
                </div>
                
                {/* Editor Information */}
                {isEdited && (
                  <div className="flex items-center gap-2 text-xs">
                    <UserAvatar 
                      user={{ 
                        custom_avatar_url: editorInfo?.custom_avatar_url, 
                        discord_avatar_url: editorInfo?.discord_avatar_url,
                        use_discord_avatar: editorInfo?.use_discord_avatar
                      }} 
                      size="xs" 
                    />
                    <span className="text-slate-400">Edited by</span>
                    <span className="text-amber-300 font-medium">
                      {editorInfo ? getDisplayNameFromProfile(editorInfo) : 'Deleted User'}
                    </span>
                                          {editorInfo?.rank && (
                        <RankBadge rank={editorInfo.rank} size="xxs" />
                      )}
                    <span className="text-slate-400">
                      {(() => {
                        const { date: editDate, useOn: editUseOn } = formatDateWithPreposition(poi.updated_at);
                        return editUseOn ? `on ${editDate}` : editDate;
                      })()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section - Identical to Modal */}
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
        )}
      </div>
    );
  }

  // Grid layout - Compact version of modal
  return (
    <div
      className={`bg-slate-900 border border-slate-700 rounded-xl shadow-lg overflow-hidden cursor-pointer hover:border-amber-500 transition-all duration-300 hover:shadow-xl ${className}`}
      onClick={onClick}
    >
      {/* Header - Compact POI Modal Style */}
      <div className="bg-slate-800/50 px-3 py-2 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          {/* POI Icon - Compact */}
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 border border-slate-600 flex-shrink-0">
            {imageUrl ? (
              <img src={imageUrl} alt={poiType.name} className="w-5 h-5 object-contain" />
            ) : (
              <span className="text-sm">{poiType.icon}</span>
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-amber-200 truncate" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              {poi.title}
            </h3>
            <div className="flex items-center space-x-1 text-xs">
              <span className="px-1.5 py-0.5 bg-slate-700 text-amber-300 rounded text-xs">{poiType.category}</span>
              
              {/* Map Type - Compact */}
              <span className={`px-1.5 py-0.5 rounded flex items-center space-x-1 text-xs ${
                poi.map_type === 'deep_desert' 
                  ? 'bg-orange-200 text-orange-900' 
                  : 'bg-blue-600/70 text-blue-200'
              }`}>
                {poi.map_type === 'hagga_basin' ? (
                  <Mountain className="w-2.5 h-2.5" />
                ) : (
                  <Pyramid className="w-2.5 h-2.5" />
                )}
                <span className="capitalize">
                  {poi.map_type?.replace('_', ' ') || 'Unknown'}
                  {poi.map_type === 'deep_desert' && poi.grid_square?.coordinate && (
                    <span className="ml-1">({poi.grid_square.coordinate})</span>
                  )}
                </span>
              </span>
              
              <div className="flex items-center">
                <PrivacyIcon className={`w-2.5 h-2.5 mr-0.5 ${privacyColor}`} />
                <span className={`${privacyColor} text-xs`}>{privacyLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Compact */}
        <div className="flex items-center space-x-0.5 flex-shrink-0">
          <button
            onClick={handleGoTo}
            className="p-1 text-purple-300 hover:text-purple-100 hover:bg-slate-700/50 rounded transition-colors"
            title="Go to POI on Map"
          >
            <MapPin className="w-3.5 h-3.5" />
          </button>

          {poi.screenshots && poi.screenshots.length > 0 && onImageClick && (
            <button
              onClick={handleImageClick}
              className="p-1 text-amber-300 hover:text-amber-100 hover:bg-slate-700/50 rounded transition-colors"
              title="View Gallery"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </button>
          )}

          {canModify && onEdit && (
            <button
              onClick={handleEdit}
              className="p-1 text-blue-300 hover:text-blue-100 hover:bg-slate-700/50 rounded transition-colors"
              title="Edit POI"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}
          
          {canModify && onDelete && (
            <button
              onClick={handleDelete}
              className="p-1 text-red-300 hover:text-red-100 hover:bg-slate-700/50 rounded transition-colors"
              title="Delete POI"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Only show share button for private/shared POIs that the user owns */}
          {onShare && user && poi.created_by === user.id && poi.privacy_level !== 'global' && (
            <button
              onClick={handleShare}
              className="p-1 text-green-300 hover:text-green-100 hover:bg-slate-700/50 rounded transition-colors"
              title="Share POI"
            >
              <Share className="w-3.5 h-3.5" />
            </button>
          )}


        </div>
      </div>
      
      {/* Content - Compact */}
      <div className="p-3">
        {/* Screenshot Preview - Compact */}
        {poi.screenshots && poi.screenshots.length > 0 && (
          <div className="mb-3">
            <div className="grid gap-1" style={{ 
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
                      onClick={handleImageClick}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                      <Eye className="w-3 h-3 text-white drop-shadow-lg" />
                    </div>
                  </div>
                );
              })}
            </div>
            
            {poi.screenshots.length > 3 && (
              <div className="mt-1 text-xs text-slate-400 text-center">
                +{poi.screenshots.length - 3} more
              </div>
            )}
          </div>
        )}
        
        {/* Description - Compact */}
        {poi.description && (
          <div className="mb-3">
            <p className="text-xs text-slate-300 leading-relaxed overflow-hidden" style={{ 
              display: '-webkit-box', 
              WebkitLineClamp: 2, 
              WebkitBoxOrient: 'vertical' 
            }}>
              {poi.description}
            </p>
          </div>
        )}
        
        {/* Metadata - Compact with Avatars and Ranks */}
        <div className="border-t border-slate-700/50 pt-2">
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <UserAvatar 
              user={{ 
                custom_avatar_url: creatorInfo?.custom_avatar_url, 
                discord_avatar_url: creatorInfo?.discord_avatar_url,
                use_discord_avatar: creatorInfo?.use_discord_avatar
              }} 
              size="xs" 
            />
            <span className="text-slate-400">By</span>
            <span className="text-amber-300 font-medium">
              {getDisplayNameFromProfile(creatorInfo) || (poi.created_by ? 'Loading...' : 'Deleted User')}
            </span>
            {creatorInfo?.rank && (
              <RankBadge rank={creatorInfo.rank} size="xxs" />
            )}
            <span className="text-slate-400">
              {(() => {
                const { date, useOn } = formatDateWithPreposition(poi.created_at);
                return useOn ? `on ${date}` : date;
              })()}
            </span>
            {isEdited && (
              <span className="text-amber-400 px-1 py-0.5 bg-amber-400/10 rounded text-xs">
                Edited
              </span>
            )}
          </div>
        </div>
        
        {/* Comments Section for Grid View - Always Visible, Collapsed by Default */}
        <div className="mt-3 pt-3 border-t border-slate-700/50">
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
  );
};

export default POIPreviewCard; 