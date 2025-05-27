import React, { useState, useEffect } from 'react';
import { X, Edit, Trash2, Share, MapPin, Clock, Users, Lock, Eye, User } from 'lucide-react';
import { Poi, PoiType, CustomIcon } from '../../types';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../../lib/supabase';
import { formatCompactDateTime, wasUpdated, formatDateWithPreposition } from '../../lib/dateUtils';
import CommentsList from '../comments/CommentsList';

interface HaggaBasinPoiCardProps {
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
  global: 'text-green-600',
  private: 'text-red-600',
  shared: 'text-blue-600'
} as const;

// Privacy level labels
const privacyLabels = {
  global: 'Public',
  private: 'Private',
  shared: 'Shared'
} as const;

const HaggaBasinPoiCard: React.FC<HaggaBasinPoiCardProps> = ({
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

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div 
        className="bg-sand-50 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-sand-200 px-6 py-4 border-b border-sand-300 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* POI Type Icon */}
            <div 
              className="w-12 h-12 rounded-full border-2 border-white shadow-md flex items-center justify-center"
              style={{
                backgroundColor: poiType.icon_has_transparent_background && imageUrl 
                  ? 'transparent' 
                  : poiType.color
              }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={poiType.name}
                  className="w-8 h-8 object-contain"
                  style={{
                    filter: poiType.icon_has_transparent_background ? 'none' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                  }}
                />
              ) : (
                <span 
                  className="text-lg leading-none"
                  style={{ 
                    color: poiType.icon_has_transparent_background ? poiType.color : 'white',
                    textShadow: poiType.icon_has_transparent_background ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                  }}
                >
                  {poiType.icon}
                </span>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-sand-900">{poi.title}</h2>
              <div className="flex items-center space-x-3 mt-1">
                <span className="badge badge-primary text-xs">{poiType.name}</span>
                <div className="flex items-center text-sm text-sand-600">
                  <PrivacyIcon className={`w-4 h-4 mr-1 ${privacyColor}`} />
                  <span>{privacyLabel}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Action Buttons */}
            {canModify && (
              <>
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="p-2 text-sand-600 hover:text-sand-800 hover:bg-sand-300/50 rounded-lg transition-colors"
                    title="Edit POI"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                )}
                
                {onShare && (
                  <button
                    onClick={onShare}
                    className="p-2 text-sand-600 hover:text-sand-800 hover:bg-sand-300/50 rounded-lg transition-colors"
                    title="Share POI"
                  >
                    <Share className="w-5 h-5" />
                  </button>
                )}
                
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete POI"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </>
            )}

            <button
              onClick={onClose}
              className="p-2 text-sand-600 hover:text-sand-800 hover:bg-sand-300/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* POI Details */}
          <div className="space-y-6">
            {/* Description */}
            {poi.description && (
              <div>
                <h3 className="text-sm font-semibold text-sand-800 mb-2">Description</h3>
                <p className="text-sand-700 leading-relaxed">{poi.description}</p>
              </div>
            )}

            {/* Screenshots */}
            {poi.screenshots && poi.screenshots.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-sand-800 mb-3">Screenshots</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {poi.screenshots.map((screenshot, index) => (
                    <div
                      key={index}
                      className="relative aspect-video rounded-lg overflow-hidden cursor-zoom-in border border-sand-300 hover:border-sand-400 transition-colors"
                      onClick={() => onImageClick?.()}
                    >
                      <img 
                        src={screenshot.url} 
                        alt={`Screenshot ${index + 1} of ${poi.title}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                      {poi.screenshots!.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-night-900/75 text-white text-xs px-2 py-1 rounded">
                          {index + 1} / {poi.screenshots!.length}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* POI Metadata */}
            <div className="border-t border-sand-300 pt-4">
              <h3 className="text-sm font-semibold text-sand-800 mb-3">Details</h3>
              <div className="space-y-2 text-xs text-sand-600">
                {/* Coordinates */}
                <div className="flex items-center">
                  <MapPin className="w-3 h-3 mr-2" />
                  <span>
                    Coordinates: {poi.coordinates_x?.toFixed(0)}, {poi.coordinates_y?.toFixed(0)}
                  </span>
                </div>
                
                {/* Creator and Editor Information - Compact single line */}
                <div className="flex items-center justify-between text-xs text-sand-600">
                  <div className="flex items-center">
                    <User className="w-3 h-3 mr-1.5" />
                    <span>
                      Created by {loadingUserInfo ? '...' : (creatorInfo?.username || 'Unknown')} {(() => {
                        const { date, useOn } = formatDateWithPreposition(poi.created_at);
                        return useOn ? `on ${date}` : date;
                      })()}
                    </span>
                  </div>
                  
                  {/* Edit Information - Only show if POI was edited */}
                  {isEdited && (
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1.5" />
                      <span>
                        Edited {loadingUserInfo ? '...' : (
                          poi.updated_by && editorInfo?.username 
                            ? `by ${editorInfo.username} `
                            : ''
                        )}{(() => {
                          const { date, useOn } = formatDateWithPreposition(poi.updated_at);
                          return useOn ? `on ${date}` : date;
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="border-t border-sand-300 pt-4">
              <CommentsList 
                poiId={poi.id} 
                showLikeButton={true}
                likeTargetType="poi"
                likeTargetId={poi.id}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HaggaBasinPoiCard; 