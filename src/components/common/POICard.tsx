import React, { useState, useEffect } from 'react';
import { X, Edit, Trash2, Share, MapPin, Clock, Users, Lock, Eye, User, Image as ImageIcon } from 'lucide-react';
import { Poi, PoiType, CustomIcon } from '../../types';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../../lib/supabase';
import { formatCompactDateTime, wasUpdated, formatDateWithPreposition } from '../../lib/dateUtils';
import CommentsList from '../comments/CommentsList';
import DiamondIcon from '../common/DiamondIcon';

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
  
  const imageUrl = getDisplayImageUrl(poi, poiType, customIcons);
  const PrivacyIcon = privacyIcons[poi.privacy_level];
  const privacyColor = privacyColors[poi.privacy_level];
  const privacyLabel = privacyLabels[poi.privacy_level];
  
  // Check if POI was edited
  const isEdited = wasUpdated(poi.created_at, poi.updated_at);
  
  // Fetch user information for creator and editor
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoadingUserInfo(true);
        const userIds = [poi.created_by];
        if (poi.updated_by && poi.updated_by !== poi.created_by) {
          userIds.push(poi.updated_by);
        }
        
        const { data: userData, error } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);
        
        if (error) throw error;
        
        const creatorData = userData?.find(u => u.id === poi.created_by);
        const editorData = userData?.find(u => u.id === poi.updated_by);
        
        setCreatorInfo(creatorData ? { username: creatorData.username } : null);
        setEditorInfo(editorData ? { username: editorData.username } : null);
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setLoadingUserInfo(false);
      }
    };
    
    if (isOpen && poi) {
      fetchUserInfo();
    }
  }, [isOpen, poi.created_by, poi.updated_by]);

  if (!isOpen) return null;

  // Create icon for DiamondIcon header
  let poiTypeRenderIcon: React.ReactNode;
  if (imageUrl) {
    poiTypeRenderIcon = <img src={imageUrl} alt={poiType.name} className="w-6 h-6 object-contain" />;
  } else {
    poiTypeRenderIcon = <span className="text-2xl">{poiType.icon}</span>;
  }

  const poiTypeHeaderIcon = (
    <DiamondIcon 
      icon={poiTypeRenderIcon} 
      size="md"
      bgColor="bg-void-950"
      actualBorderColor="bg-gold-400"
      borderThickness={2}
    />
  );

  // Format metadata text
  let metaText = `Created by ${creatorInfo?.username || 'Loading...'} ${(() => {
    const { date, useOn } = formatDateWithPreposition(poi.created_at);
    return useOn ? `on ${date}` : date;
  })()}`;
  
  if (poi.updated_at && new Date(poi.updated_at).getTime() !== new Date(poi.created_at).getTime()) {
    const { date: updatedDate, useOn: updatedUseOn } = formatDateWithPreposition(poi.updated_at);
    metaText += ` (Updated: ${updatedUseOn ? `on ${updatedDate}` : updatedDate})`;
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
      <div 
        className="bg-slate-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-gold-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 border-b border-gold-500 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            {poiTypeHeaderIcon}
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold text-gold-300 mb-2">{poi.title}</h2>
              <div className="flex items-center space-x-3 flex-wrap">
                <span className="badge badge-primary">{poiType.name}</span>
                <div className="flex items-center text-sm">
                  <PrivacyIcon className={`w-4 h-4 mr-1 ${privacyColor}`} />
                  <span className={privacyColor}>{privacyLabel}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Action Buttons */}
            {poi.screenshots && poi.screenshots.length > 0 && onImageClick && (
              <button
                onClick={onImageClick}
                className="p-2 text-amber-300 hover:text-amber-100 hover:bg-slate-700 rounded-lg transition-colors"
                title="View Gallery"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
            )}

            {canModify && (
              <>
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="p-2 text-blue-300 hover:text-blue-100 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Edit POI"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                )}
                
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="p-2 text-red-300 hover:text-red-100 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Delete POI"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </>
            )}

            {onShare && (
              <button
                onClick={onShare}
                className="p-2 text-green-300 hover:text-green-100 hover:bg-slate-700 rounded-lg transition-colors"
                title="Share POI"
              >
                <Share className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* POI Images */}
          {poi.screenshots && poi.screenshots.length > 0 && (
            <div className="mb-6">
              <div className="grid gap-3" style={{ 
                gridTemplateColumns: poi.screenshots.length === 1 
                  ? '1fr' 
                  : poi.screenshots.length === 2 
                    ? 'repeat(2, 1fr)' 
                    : 'repeat(3, 1fr)'
              }}>
                {poi.screenshots.slice(0, 6).map((screenshot, index) => (
                  <div key={screenshot.id || index} className="relative group aspect-video">
                    <img
                      src={screenshot.url}
                      alt={`POI screenshot ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg cursor-pointer transition-opacity group-hover:opacity-90"
                      onClick={() => onImageClick && onImageClick()}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Eye className="w-6 h-6 text-white drop-shadow-lg" />
                    </div>
                  </div>
                ))}
              </div>
              
              {poi.screenshots.length > 6 && (
                <div className="mt-3 text-sm text-slate-400 text-center">
                  +{poi.screenshots.length - 6} more screenshots
                </div>
              )}
            </div>
          )}

          {/* POI Description */}
          {poi.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gold-300 mb-3">Description</h3>
              <div className="prose prose-sm prose-invert max-w-none">
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{poi.description}</p>
              </div>
            </div>
          )}

          {/* POI Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gold-300 mb-3">Details</h3>
            <div className="bg-slate-800/60 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-400">Category:</span>
                  <span className="text-slate-200 ml-2">{poiType.category}</span>
                </div>
                <div>
                  <span className="text-slate-400">Type:</span>
                  <span className="text-slate-200 ml-2">{poiType.name}</span>
                </div>
                {poi.grid_square?.coordinate && (
                  <div>
                    <span className="text-slate-400">Grid:</span>
                    <span className="text-slate-200 ml-2">{poi.grid_square.coordinate}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400">Map:</span>
                  <span className="text-slate-200 ml-2 capitalize">
                    {poi.map_type?.replace('_', ' ') || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="mb-6 text-sm text-slate-400 text-center border-t border-slate-700 pt-4">
            {metaText}
          </div>

          {/* Comments Section */}
          <div>
            <CommentsList 
              poiId={poi.id} 
              showLikeButton={true}
              likeTargetType="poi"
              likeTargetId={poi.id}
              initiallyExpanded={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default POICard; 