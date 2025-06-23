import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CommentWithImages } from '../../types/unified-images';
import { Rank } from '../../types/profile';
import { useAuth } from '../auth/AuthProvider';
import { Clock, Edit2, Trash2, User, Eye, Upload, X } from 'lucide-react';
import RankBadge from '../common/RankBadge';
import GuildTag from '../common/GuildTag';
import EmojiTextArea from '../common/EmojiTextArea';
import { formatDateWithPreposition, wasUpdated } from '../../lib/dateUtils';
import { useUnifiedImages } from '../../hooks/useUnifiedImages';
import { useScreenshotManager } from '../../hooks/useScreenshotManager';
import CropProcessor from '../shared/CropProcessor';

interface CommentItemProps {
  comment: CommentWithImages;
  onCommentUpdated: () => void;
  onCommentDeleted: () => void;
  onImageClick?: (imageUrl: string, allImages: string[]) => void;
  onShouldNavigate?: (path: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onCommentUpdated,
  onCommentDeleted,
  onImageClick,
  onShouldNavigate
}) => {
  const { user } = useAuth();
  const { deleteImage } = useUnifiedImages();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track existing screenshots that should be removed
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  
  // Unified screenshot system for new screenshot uploads during edit
  const screenshotManager = useScreenshotManager({
    context: 'comment',
    entityId: comment.id,
    maxFileSize: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    enableCropping: true
  });

  const [creatorInfo, setCreatorInfo] = useState<{ 
    username: string; 
    rank?: Rank | null;
    guild?: { name: string; tag_color: string; tag_text_color: string; } | null;
  } | null>(null);
  const [editorInfo, setEditorInfo] = useState<{ 
    username: string; 
    rank?: Rank | null;
    guild?: { name: string; tag_color: string; tag_text_color: string; } | null;
  } | null>(null);
  const [loadingUserInfo, setLoadingUserInfo] = useState(true);

  const canEdit = user && (user.id === comment.created_by || user.role === 'admin' || user.role === 'editor');
  const canDelete = user && (user.id === comment.created_by || user.role === 'admin');
  const isEdited = wasUpdated(comment.created_at, comment.updated_at);
  
  // Helper functions for existing screenshots
  const getDisplayableExistingImages = () => {
    return comment.images?.filter(imageLink => 
      !removedImageIds.includes(imageLink.managed_images.id)
    ) || [];
  };
  
  const handleRemoveExistingImage = (imageId: string) => {
    setRemovedImageIds(prev => [...prev, imageId]);
  };
  
  const handleEditExistingImage = async (imageLink: any) => {
    try {
      // Fetch the original image to enable re-cropping
      const originalUrl = imageLink.managed_images.original_url;
      
      if (!originalUrl) {
        console.error('[CommentItem] ❌ No original URL found for image');
        setError('Cannot edit this image: original file not found');
        return;
      }
      
      // Convert the existing image to a File object for the screenshot manager
      const response = await fetch(originalUrl);
      const blob = await response.blob();
      const fileName = `existing_image_${Date.now()}.${blob.type.split('/')[1] || 'jpg'}`;
      const file = new File([blob], fileName, { type: blob.type });
      
      // Add to screenshot manager for editing
      screenshotManager.uploadFiles([file]);
      
      // Remove the original from display (it will be replaced by the edited version)
      handleRemoveExistingImage(imageLink.managed_images.id);
    } catch (error) {
      console.error('[CommentItem] ❌ Error loading image for editing:', error);
      setError('Failed to load image for editing');
    }
  };
  
  const getTotalImageCount = () => {
    const existingCount = getDisplayableExistingImages().length;
    const newCount = screenshotManager.filesToProcess.filter(f => f.isProcessed).length;
    return existingCount + newCount;
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoadingUserInfo(true);
        const userIds = [comment.created_by];
        if (comment.updated_by && comment.updated_by !== comment.created_by) {
          userIds.push(comment.updated_by);
        }
        
        const { data: userData, error } = await supabase
          .from('profiles')
          .select('id, username, rank:ranks(*), guild:guilds(*)')
          .in('id', userIds);
        
        if (error) throw error;
        
        const creatorData = userData?.find(u => u.id === comment.created_by);
        const editorData = userData?.find(u => u.id === comment.updated_by);
        
        setCreatorInfo(creatorData ? { 
          username: creatorData.username, 
          rank: creatorData.rank,
          guild: creatorData.guild
        } : null);
        setEditorInfo(editorData ? { 
          username: editorData.username, 
          rank: editorData.rank,
          guild: editorData.guild
        } : null);
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setLoadingUserInfo(false);
      }
    };
    
    fetchUserInfo();
  }, [comment.created_by, comment.updated_by]);

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      setError('Comment cannot be empty.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      // Step 1: Update comment content
      const { error: updateError } = await supabase
        .from('comments')
        .update({
          content: editContent,
          updated_at: new Date().toISOString(),
          updated_by: user!.id,
        })
        .eq('id', comment.id);

      if (updateError) throw updateError;
      // Step 2: Remove marked images
      if (removedImageIds.length > 0) {
        for (const imageId of removedImageIds) {
          const success = await deleteImage(imageId);
          if (success) {
          } else {
          }
        }
      }

      // Step 3: Upload new screenshots if any
      const processedFiles = screenshotManager.filesToProcess.filter(f => f.isProcessed);
      if (processedFiles.length > 0) {
        await uploadProcessedScreenshots(comment.id);
      }

      // Step 4: Reset editing state
      setIsEditing(false);
      setRemovedImageIds([]);
      screenshotManager.clearProcessingQueue();
      onCommentUpdated();
      setError(null);
      
    } catch (err: any) {
      console.error('Error updating comment:', err);
      setError(err.message || 'Failed to update comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Upload processed screenshots for the comment (copied from CommentForm)
  const uploadProcessedScreenshots = async (commentId: string): Promise<void> => {
    const processedFiles = screenshotManager.filesToProcess.filter(f => f.isProcessed);
    for (const file of processedFiles) {
      try {
        // Generate unique filename
        const baseFilename = `comment_${commentId}_${Date.now()}`;
        
        // Step 1: Upload original file
        const { uploadPoiScreenshotOriginal } = await import('../../lib/imageUpload');
        const originalUpload = await uploadPoiScreenshotOriginal(file.originalFile, `${baseFilename}.${file.originalFile.name.split('.').pop()}`);
        let croppedUpload = null;
        
        // Step 2: Upload cropped version if needed
        if (file.wasActuallyCropped && file.displayFile !== file.originalFile) {
          const { uploadPoiScreenshotCropped } = await import('../../lib/imageUpload');
          
          // Use the displayFile which contains the cropped version
          croppedUpload = await uploadPoiScreenshotCropped(file.displayFile, `${baseFilename}_cropped.webp`);
        }
        
        // Step 3: Save to unified system database
        const imageData = {
          original_url: originalUpload.url,
          processed_url: croppedUpload?.url || null,
          crop_details: file.wasActuallyCropped ? file.cropData : null,
          image_type: 'comment_image',
          uploaded_by: user!.id
        };
        const { data: managedImage, error: insertError } = await supabase
          .from('managed_images')
          .insert(imageData)
          .select()
          .single();

        if (insertError) throw insertError;
        // Step 4: Link image to comment
        const linkData = {
          comment_id: commentId,
          image_id: managedImage.id
        };
        
        const { error: linkError } = await supabase
          .from('comment_image_links')
          .insert(linkData);

        if (linkError) throw linkError;
      } catch (error) {
        console.error(`[CommentItem] ❌ Error processing file ${file.originalFile.name}:`, error);
        throw error;
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment and its images?')) return;
    setIsSubmitting(true);
    
    try {
      // Step 1: Delete associated images from storage and database
      if (comment.images && comment.images.length > 0) {
        for (const imageLink of comment.images) {
          const imageId = imageLink.managed_images.id;
          const success = await deleteImage(imageId);
          if (success) {
          } else {
          }
        }
      }
      
      // Step 2: Delete the comment (this will cascade delete comment_image_links)
      const { error: deleteError } = await supabase
        .from('comments')
        .delete()
        .eq('id', comment.id);

      if (deleteError) throw deleteError;
      onCommentDeleted();
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    if (onImageClick && comment.images) {
      const allImageUrls = comment.images.map(imageLink => 
        imageLink.managed_images.processed_url || imageLink.managed_images.original_url
      );
      onImageClick(imageUrl, allImageUrls);
    }
  };

  if (isEditing) {
    const existingImages = getDisplayableExistingImages();
    const totalImages = getTotalImageCount();
    
    return (
      <div className="p-3 bg-night-800/60 border border-slate-700 text-sm">
        <div className="space-y-3">
          <EmojiTextArea
            value={editContent}
            onChange={setEditContent}
            className="w-full p-3 bg-night-900 border border-slate-600 text-slate-200 placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
            rows={3}
          />
          
          {/* Screenshots Management */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Screenshots ({totalImages}/5)
            </label>
            
            <div className="space-y-3">
              {/* Screenshots Grid */}
              <div className="flex flex-wrap gap-2">
                {/* Existing Screenshots */}
                {existingImages.map((imageLink) => {
                  const imageUrl = imageLink.managed_images.processed_url || imageLink.managed_images.original_url;
                  const wasCropped = !!imageLink.managed_images.processed_url;
                  return (
                    <div 
                      key={imageLink.managed_images.id}
                      className="w-20 h-20 relative rounded overflow-hidden border border-blue-300"
                    >
                      <img 
                        src={imageUrl} 
                        alt="Existing screenshot" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(imageLink.managed_images.id)}
                        className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-bl-md hover:bg-red-700 transition-colors"
                        title="Remove screenshot"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {/* Edit button for re-cropping */}
                      <button
                        type="button"
                        onClick={() => handleEditExistingImage(imageLink)}
                        className="absolute top-0 left-0 bg-blue-600 text-white w-5 h-5 flex items-center justify-center rounded-br-md hover:bg-blue-700 transition-colors"
                        title="Edit screenshot"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-1 left-1">
                        <span className={`text-white text-xs px-1 rounded ${wasCropped ? 'bg-green-600' : 'bg-blue-600'}`}>
                          {wasCropped ? 'Cropped' : 'Full Size'}
                        </span>
                      </div>
                    </div>
                  );
                })}
                
                {/* New Screenshots from Unified System */}
                {screenshotManager.filesToProcess.map((file) => (
                  <div 
                    key={file.id}
                    className={`w-20 h-20 relative rounded overflow-hidden border ${
                      file.isProcessed ? 'border-green-300' : 'border-slate-600'
                    }`}
                  >
                    <img 
                      src={file.preview} 
                      alt="New screenshot" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => screenshotManager.removeFileFromQueue(file.id)}
                      className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-bl-md hover:bg-red-700 transition-colors"
                      title="Remove screenshot"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-1 left-1">
                      <span className={`text-white text-xs px-1 rounded ${
                        file.isProcessed 
                          ? file.wasActuallyCropped 
                            ? 'bg-green-600' 
                            : 'bg-blue-600'
                          : 'bg-orange-600'
                      }`}>
                        {(() => {
                          if (!file.isProcessed) {
                            return 'Processing...';
                          }
                          return file.wasActuallyCropped ? 'Cropped' : 'Full Size';
                        })()}
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* Upload Button */}
                {totalImages < 5 && (
                  <label className="w-20 h-20 border-2 border-dashed border-slate-600 rounded flex flex-col items-center justify-center text-slate-400 hover:text-slate-300 hover:border-slate-500 cursor-pointer transition-colors">
                    <Upload className="w-5 h-5" />
                    <span className="text-xs mt-1">Add</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          screenshotManager.uploadFiles(e.target.files);
                          // Clear the input so same files can be selected again
                          e.target.value = '';
                        }
                      }}
                      multiple
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <p className="text-xs text-slate-400">
                Upload up to 5 screenshots total. Each image must be under 5MB. PNG, JPG formats supported.
              </p>
            </div>
          </div>
          
          {error && (
            <div className="text-red-300 text-xs p-2 bg-red-900/30 border border-red-700/50">
              {error}
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-400">
              {removedImageIds.length > 0 && (
                <span className="text-red-400">
                  {removedImageIds.length} image{removedImageIds.length !== 1 ? 's' : ''} will be removed
                </span>
              )}
              {screenshotManager.filesToProcess.filter(f => f.isProcessed).length > 0 && (
                <span className="ml-2">
                  {screenshotManager.filesToProcess.filter(f => f.isProcessed).length} new image{screenshotManager.filesToProcess.filter(f => f.isProcessed).length !== 1 ? 's' : ''} ready
                </span>
              )}
            </div>
            
            <div className="flex space-x-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(comment.content);
                  setRemovedImageIds([]);
                  screenshotManager.clearProcessingQueue();
                setError(null);
              }}
              className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-3 py-1 text-xs bg-amber-600 hover:bg-amber-700 text-white transition-colors disabled:bg-slate-600"
              disabled={isSubmitting || !editContent.trim()}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
        </div>
        
        {/* Unified Crop Processor */}
        <CropProcessor
          screenshotManager={screenshotManager}
        />
      </div>
    );
  }

  return (
    <div className="p-3 bg-night-800/60 border border-slate-700 text-sm">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 border-2 border-slate-600 flex-shrink-0">
          <User size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span 
                className="font-semibold text-amber-300 hover:underline cursor-pointer truncate"
                onClick={() => onShouldNavigate && onShouldNavigate(`/profile/${comment.created_by}`)}
                title={loadingUserInfo ? 'Loading...' : creatorInfo?.username || 'Unknown User'}
              >
                {loadingUserInfo ? 'Loading...' : creatorInfo?.username || 'Unknown User'}
              </span>
              {creatorInfo?.rank && (
                <RankBadge rank={creatorInfo.rank} size="xxs" />
              )}
              {creatorInfo?.guild && creatorInfo.guild.name !== 'Unassigned' && (
                <GuildTag 
                  guildName={creatorInfo.guild.name}
                  tagColor={creatorInfo.guild.tag_color}
                  tagTextColor={creatorInfo.guild.tag_text_color}
                  size="sm"
                  showIcon={false}
                />
              )}
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              {canEdit && (
                <button onClick={() => setIsEditing(true)} className="p-1 text-slate-400 hover:text-amber-200 transition-colors">
                  <Edit2 size={14} />
                </button>
              )}
              {canDelete && (
                <button onClick={handleDelete} className="p-1 text-slate-400 hover:text-red-400 transition-colors" disabled={isSubmitting}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
          <p className="text-slate-400 text-xs mt-0.5 mb-1.5">
            {(() => {
              const created = formatDateWithPreposition(comment.created_at);
              return `${created.useOn ? 'on ' : ''}${created.date}`;
            })()}
            {isEdited && (
              <span title={`Edited by ${editorInfo?.username || 'Unknown'} ${formatDateWithPreposition(comment.updated_at).useOn ? 'on ' : ''}${formatDateWithPreposition(comment.updated_at).date}`}>
                {' '}(edited <Clock size={10} className="inline -mt-0.5" />)
              </span>
            )}
          </p>
          <div className="prose prose-sm prose-invert max-w-none text-slate-200 whitespace-pre-wrap break-words">
            {comment.content}
          </div>
        </div>
      </div>
      
      {/* Images Display */}
      {comment.images && comment.images.length > 0 && (
        <div className="mt-3">
          <div className="grid gap-2" style={{ 
            gridTemplateColumns: comment.images.length === 1 
              ? '1fr' 
              : comment.images.length === 2 
                ? 'repeat(2, 1fr)' 
                : 'repeat(3, 1fr)'
          }}>
            {comment.images.slice(0, 6).map((imageLink, index) => {
              const imageUrl = imageLink.managed_images.processed_url || imageLink.managed_images.original_url;
              return (
                <div key={imageLink.managed_images.id || index} className="relative group">
                  <img
                    src={imageUrl}
                    alt={`Comment image ${index + 1}`}
                    className="w-full h-24 object-cover rounded cursor-pointer transition-opacity group-hover:opacity-90"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageClick(imageUrl);
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                    <Eye className="w-5 h-5 text-white drop-shadow-lg" />
                  </div>
                </div>
              );
            })}
          </div>
          
          {comment.images.length > 6 && (
            <div className="mt-2 text-xs text-slate-400 text-center">
              +{comment.images.length - 6} more images
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-2 text-red-300 text-xs p-2 bg-red-900/30 border border-red-700/50">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default CommentItem; 