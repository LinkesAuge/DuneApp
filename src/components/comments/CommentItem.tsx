import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { CommentWithUser } from '../../types';
import { useAuth } from '../auth/AuthProvider';
import { Clock, Edit2, Trash2, Check, X, ZoomIn, Upload, Image } from 'lucide-react';
import LikeButton from '../common/LikeButton';
import EmojiTextArea from '../common/EmojiTextArea';
import { uploadImage, deleteImage, extractPathFromUrl } from '../../lib/imageUpload';

interface CommentItemProps {
  comment: CommentWithUser;
  onCommentUpdated: () => void;
  onCommentDeleted: () => void;
  onImageClick?: (imageUrl: string, allImages: string[]) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onCommentUpdated,
  onCommentDeleted,
  onImageClick
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenshotsToDelete, setScreenshotsToDelete] = useState<string[]>([]);
  const [newScreenshots, setNewScreenshots] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canEdit = user && (user.id === comment.created_by || user.role === 'admin');
  const canDelete = user && (user.id === comment.created_by || user.role === 'admin');

  const existingScreenshots = comment.screenshots || [];
  const remainingExistingScreenshots = existingScreenshots.filter(s => !screenshotsToDelete.includes(s.id));
  const totalScreenshots = remainingExistingScreenshots.length + newScreenshots.length;
  const availableSlots = 5 - totalScreenshots;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length > availableSlots) {
      setError(`You can only add ${availableSlots} more screenshot${availableSlots !== 1 ? 's' : ''}. Maximum 5 per comment.`);
      return;
    }

    // Validate each file
    for (const file of files) {
      if (file.size > 2 * 1024 * 1024) {
        setError(`File "${file.name}" is too large. Maximum size is 2MB.`);
        return;
      }
      
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError(`File "${file.name}" is not a supported image type. Only JPEG, PNG, and WebP are allowed.`);
        return;
      }
    }

    setNewScreenshots(prev => [...prev, ...files]);
    setError(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeNewScreenshot = (index: number) => {
    setNewScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const markExistingScreenshotForDeletion = (screenshotId: string) => {
    setScreenshotsToDelete(prev => [...prev, screenshotId]);
  };

  const unmarkExistingScreenshotForDeletion = (screenshotId: string) => {
    setScreenshotsToDelete(prev => prev.filter(id => id !== screenshotId));
  };

  const handleEdit = async () => {
    if (!editContent.trim() && totalScreenshots === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Update comment content
      const { error: updateError } = await supabase
        .from('comments')
        .update({ content: editContent.trim() })
        .eq('id', comment.id);

      if (updateError) throw updateError;

      // 2. Delete marked screenshots
      if (screenshotsToDelete.length > 0) {
        for (const screenshotId of screenshotsToDelete) {
          const screenshot = existingScreenshots.find(s => s.id === screenshotId);
          if (screenshot) {
            try {
              // Delete from storage
              const path = extractPathFromUrl(screenshot.url, 'screenshots');
              await deleteImage('screenshots', path);
            } catch (storageError) {
              console.warn('Failed to delete from storage:', storageError);
              // Continue with database deletion even if storage deletion fails
            }

            // Delete from database
            const { error: deleteError } = await supabase
              .from('comment_screenshots')
              .delete()
              .eq('id', screenshotId);

            if (deleteError) throw deleteError;
          }
        }
      }

      // 3. Upload new screenshots
      if (newScreenshots.length > 0) {
        const uploadPromises = newScreenshots.map(async (file) => {
          const { url } = await uploadImage(file, {
            bucket: 'screenshots',
            folder: 'comments'
          });

          return supabase
            .from('comment_screenshots')
            .insert({
              comment_id: comment.id,
              url,
              uploaded_by: user!.id,
              file_size: file.size,
              file_name: file.name
            });
        });

        const uploadResults = await Promise.all(uploadPromises);
        
        for (const result of uploadResults) {
          if (result.error) throw result.error;
        }
      }

      setIsEditing(false);
      setScreenshotsToDelete([]);
      setNewScreenshots([]);
      onCommentUpdated();
    } catch (err: any) {
      console.error('Error updating comment:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    setIsSubmitting(true);
    setError(null);

    try {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-sand-50 rounded-lg p-4 border border-sand-200">
      {error && (
        <div className="text-red-600 text-sm p-2 bg-red-50 rounded mb-3">
          {error}
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-night-800">
            {comment.user?.username || 'Unknown User'}
          </span>
          <div className="flex items-center gap-1 text-xs text-sand-600">
            <Clock size={12} />
            <span>{formatDate(comment.created_at)}</span>
            {comment.updated_at !== comment.created_at && (
              <span className="italic">(edited)</span>
            )}
          </div>
        </div>

        {(canEdit || canDelete) && !isEditing && (
          <div className="flex gap-1">
            {canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-sand-600 hover:text-night-700 transition-colors"
                title="Edit comment"
              >
                <Edit2 size={14} />
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="p-1 text-sand-600 hover:text-red-600 transition-colors disabled:opacity-50"
                title="Delete comment"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <EmojiTextArea
            value={editContent}
            onChange={setEditContent}
            disabled={isSubmitting}
            minHeight="80px"
            placeholder="Edit your comment..."
          />

          {/* Screenshot management during editing */}
          <div className="space-y-3">
            {/* Existing screenshots */}
            {existingScreenshots.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-night-700">Current Screenshots:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {existingScreenshots.map((screenshot) => {
                    const isMarkedForDeletion = screenshotsToDelete.includes(screenshot.id);
                    return (
                      <div key={screenshot.id} className="relative group">
                        <img
                          src={screenshot.url}
                          alt="Existing screenshot"
                          className={`w-full h-20 object-cover rounded-lg border transition-all ${
                            isMarkedForDeletion 
                              ? 'border-red-500 opacity-50 grayscale' 
                              : 'border-sand-300'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (isMarkedForDeletion) {
                              unmarkExistingScreenshotForDeletion(screenshot.id);
                            } else {
                              markExistingScreenshotForDeletion(screenshot.id);
                            }
                          }}
                          className={`absolute -top-2 -right-2 rounded-full p-1 transition-colors ${
                            isMarkedForDeletion
                              ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                              : 'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                        >
                          {isMarkedForDeletion ? (
                            <Check size={12} />
                          ) : (
                            <X size={12} />
                          )}
                        </button>
                        {isMarkedForDeletion && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-lg">
                            <span className="text-xs text-red-700 font-medium bg-white/90 px-2 py-1 rounded">
                              Will Delete
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* New screenshots */}
            {newScreenshots.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-night-700">New Screenshots:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {newScreenshots.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New screenshot ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border border-blue-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewScreenshot(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      >
                        <X size={12} />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                        {(file.size / (1024 * 1024)).toFixed(1)}MB
                      </div>
                      <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1 rounded">
                        NEW
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add new screenshots button */}
            {availableSlots > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="btn btn-outline text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <Upload size={16} />
                  Add Screenshots ({totalScreenshots}/5)
                </button>
                <span className="text-xs text-sand-600">
                  {availableSlots} slot{availableSlots !== 1 ? 's' : ''} available
                </span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Screenshot summary */}
            {(screenshotsToDelete.length > 0 || newScreenshots.length > 0) && (
              <div className="text-xs text-sand-600 bg-sand-50 p-2 rounded">
                {screenshotsToDelete.length > 0 && (
                  <div className="text-red-600">
                    • {screenshotsToDelete.length} screenshot{screenshotsToDelete.length !== 1 ? 's' : ''} will be deleted
                  </div>
                )}
                {newScreenshots.length > 0 && (
                  <div className="text-blue-600">
                    • {newScreenshots.length} new screenshot{newScreenshots.length !== 1 ? 's' : ''} will be added
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(comment.content);
                setScreenshotsToDelete([]);
                setNewScreenshots([]);
                setError(null);
              }}
              disabled={isSubmitting}
              className="btn btn-outline text-xs"
            >
              <X size={14} />
              Cancel
            </button>
            <button
              onClick={handleEdit}
              disabled={(!editContent.trim() && totalScreenshots === 0) || isSubmitting}
              className="btn btn-primary text-xs disabled:opacity-50"
            >
              <Check size={14} />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-night-700 whitespace-pre-wrap">
            {comment.content}
          </div>

          {/* Screenshots */}
          {comment.screenshots && comment.screenshots.length > 0 && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {comment.screenshots.map((screenshot, index) => (
                  <div 
                    key={screenshot.id} 
                    className="relative group cursor-pointer"
                    onClick={() => {
                      if (onImageClick) {
                        const allUrls = comment.screenshots?.map(s => s.url) || [];
                        onImageClick(screenshot.url, allUrls);
                      }
                    }}
                  >
                    <img
                      src={screenshot.url}
                      alt={`Comment screenshot ${index + 1}`}
                      className="w-full h-20 sm:h-24 object-cover rounded-lg border border-sand-300 hover:border-spice-600 transition-colors"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                      <ZoomIn 
                        size={20} 
                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
                      />
                    </div>
                    {screenshot.file_size && (
                      <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                        {(screenshot.file_size / (1024 * 1024)).toFixed(1)}MB
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-xs text-sand-600">
                {comment.screenshots.length} screenshot{comment.screenshots.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
          
          {/* Like button */}
          <div className="flex items-center justify-between">
            <LikeButton 
              targetType="comment" 
              targetId={comment.id}
              size="sm"
            />
            <div className="flex-1" />
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentItem; 