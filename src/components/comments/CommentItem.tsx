import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CommentWithUser } from '../../types';
import { useAuth } from '../auth/AuthProvider';
import { Clock, Edit2, Trash2, Check, X, ZoomIn, Upload, Image, Edit, User } from 'lucide-react';
import LikeButton from '../common/LikeButton';
import EmojiTextArea from '../common/EmojiTextArea';
import { uploadImage, deleteImage, extractPathFromUrl } from '../../lib/imageUpload';
import ImageCropModal from '../grid/ImageCropModal';
import { PixelCrop } from 'react-image-crop';
import { formatCompactDateTime, wasUpdated } from '../../lib/dateUtils';

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

  // Screenshot cropping state
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [pendingCroppedFiles, setPendingCroppedFiles] = useState<File[]>([]);
  const [editingScreenshotId, setEditingScreenshotId] = useState<string | null>(null);

  // User information state
  const [creatorInfo, setCreatorInfo] = useState<{ username: string } | null>(null);
  const [editorInfo, setEditorInfo] = useState<{ username: string } | null>(null);
  const [loadingUserInfo, setLoadingUserInfo] = useState(true);

  const canEdit = user && (user.id === comment.created_by || user.role === 'admin' || user.role === 'editor');
  const canDelete = user && (user.id === comment.created_by || user.role === 'admin');

  // Check if comment was edited
  const isEdited = wasUpdated(comment.created_at, comment.updated_at);

  // Fetch user information for creator and editor
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
          .select('id, username')
          .in('id', userIds);
        
        if (error) throw error;
        
        const creatorData = userData?.find(u => u.id === comment.created_by);
        const editorData = userData?.find(u => u.id === comment.updated_by);
        
        setCreatorInfo(creatorData ? { username: creatorData.username } : null);
        setEditorInfo(editorData ? { username: editorData.username } : null);
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setLoadingUserInfo(false);
      }
    };
    
    fetchUserInfo();
  }, [comment.created_by, comment.updated_by]);

  const existingScreenshots = comment.screenshots || [];
  const remainingExistingScreenshots = existingScreenshots.filter(s => !screenshotsToDelete.includes(s.id));
  const totalScreenshots = remainingExistingScreenshots.length + newScreenshots.length + pendingCroppedFiles.length;
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

    // Process files one by one through cropping
    processFilesForCropping(files);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Process files through cropping workflow
  const processFilesForCropping = (files: File[]) => {
    if (files.length === 0) return;
    
    const [firstFile, ...remainingFiles] = files;
    
    // Set up for cropping the first file
    setTempImageFile(firstFile);
    setTempImageUrl(URL.createObjectURL(firstFile));
    setShowCropModal(true);
    
    // Store remaining files to process after current crop is complete
    if (remainingFiles.length > 0) {
      // We'll handle remaining files after crop completion
      setTempImageFile(prev => {
        // Store remaining files in a way we can access them
        (firstFile as any).remainingFiles = remainingFiles;
        return firstFile;
      });
    }
  };

  // Handle crop completion
  const handleCropComplete = async (croppedImageBlob: Blob) => {
    if (!tempImageFile) return;

    try {
      // Convert blob to File
      const croppedFile = new File([croppedImageBlob], tempImageFile.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      // Add to pending cropped files
      setPendingCroppedFiles(prev => [...prev, croppedFile]);

      // Check if there are remaining files to process
      const remainingFiles = (tempImageFile as any).remainingFiles as File[] || [];
      
      // Clean up current temp state
      setShowCropModal(false);
      setTempImageFile(null);
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
        setTempImageUrl(null);
      }

      // Process remaining files if any
      if (remainingFiles.length > 0) {
        setTimeout(() => processFilesForCropping(remainingFiles), 100);
      }
    } catch (error) {
      console.error('Error processing cropped image:', error);
      setError('Failed to process cropped image. Please try again.');
    }
  };

  // Handle skipping crop for a file (use original)
  const handleSkipCrop = () => {
    if (!tempImageFile) return;

    // Add original file to newScreenshots instead of pending cropped files
    setNewScreenshots(prev => [...prev, tempImageFile]);

    // Check if there are remaining files to process
    const remainingFiles = (tempImageFile as any).remainingFiles as File[] || [];
    
    // Clean up current temp state
    setShowCropModal(false);
    setTempImageFile(null);
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl(null);
    }

    // Process remaining files if any
    if (remainingFiles.length > 0) {
      setTimeout(() => processFilesForCropping(remainingFiles), 100);
    }
  };

  // Handle closing crop modal
  const handleCloseCropModal = () => {
    setShowCropModal(false);
    setTempImageFile(null);
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl(null);
    }
    setEditingScreenshotId(null);
  };

  // Handle editing existing screenshot
  const handleEditExistingScreenshot = (screenshotId: string, screenshotUrl: string) => {
    setEditingScreenshotId(screenshotId);
    
    // Create a cache-busted URL to avoid CORS issues
    const url = new URL(screenshotUrl);
    url.searchParams.set('t', Date.now().toString());
    
    setTempImageUrl(url.toString());
    setShowCropModal(true);
  };

  // Handle crop completion for existing screenshot
  const handleEditCropComplete = async (croppedImageBlob: Blob) => {
    if (!editingScreenshotId || !user) return;

    try {
      // Convert blob to File
      const croppedFile = new File([croppedImageBlob], 'cropped-comment-screenshot.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      // Add to pending cropped files
      setPendingCroppedFiles(prev => [...prev, croppedFile]);

      // Remove the original screenshot from existing screenshots
      setScreenshotsToDelete(prev => [...prev, editingScreenshotId]);

      // Close modal
      setShowCropModal(false);
      setTempImageFile(null);
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
        setTempImageUrl(null);
      }
      setEditingScreenshotId(null);
    } catch (error) {
      console.error('Error processing cropped image:', error);
      setError('Failed to process cropped image. Please try again.');
    }
  };

  const removeNewScreenshot = (index: number) => {
    setNewScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  // Remove cropped screenshot
  const removeCroppedScreenshot = (index: number) => {
    setPendingCroppedFiles(prev => prev.filter((_, i) => i !== index));
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
        .update({ 
          content: editContent.trim(),
          updated_by: user!.id
        })
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

      // 3. Upload new screenshots (both original and cropped)
      const allNewFiles = [...newScreenshots, ...pendingCroppedFiles];
      if (allNewFiles.length > 0) {
        const uploadPromises = allNewFiles.map(async (file) => {
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
      setPendingCroppedFiles([]);
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
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-night-800 text-sm">
              {creatorInfo?.username || 'Unknown User'}
            </span>
          </div>
          
          {/* Creator and Editor Information - Compact single line */}
          <div className="flex items-center justify-between text-xs text-sand-600">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>
                Posted by {loadingUserInfo ? '...' : (creatorInfo?.username || 'Unknown')} on {formatCompactDateTime(comment.created_at)}
              </span>
            </div>
            
            {/* Edit information - Only show if comment was edited */}
            {isEdited && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>
                  Edited {loadingUserInfo ? '...' : (
                    comment.updated_by && editorInfo?.username 
                      ? `by ${editorInfo.username} `
                      : ''
                  )}on {formatCompactDateTime(comment.updated_at)}
                </span>
              </div>
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
                        <div className="absolute top-0 right-0 flex">
                          <button
                            type="button"
                            onClick={() => handleEditExistingScreenshot(screenshot.id, screenshot.url)}
                            className="bg-blue-600 text-white w-5 h-5 flex items-center justify-center rounded-bl-md hover:bg-blue-700 transition-colors"
                            title="Edit screenshot"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (isMarkedForDeletion) {
                                unmarkExistingScreenshotForDeletion(screenshot.id);
                              } else {
                                markExistingScreenshotForDeletion(screenshot.id);
                              }
                            }}
                            className={`w-5 h-5 flex items-center justify-center transition-colors ${
                              isMarkedForDeletion
                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                          >
                            {isMarkedForDeletion ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                          </button>
                        </div>
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

            {/* New original screenshots */}
            {newScreenshots.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-night-700">New Original Screenshots:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {newScreenshots.map((file, index) => (
                    <div key={`original-${index}`} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New original screenshot ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border border-blue-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewScreenshot(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                        Original
                      </div>
                      <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1 rounded">
                        {(file.size / (1024 * 1024)).toFixed(1)}MB
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New cropped screenshots */}
            {pendingCroppedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-night-700">New Cropped Screenshots:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {pendingCroppedFiles.map((file, index) => (
                    <div key={`cropped-${index}`} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New cropped screenshot ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border border-green-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeCroppedScreenshot(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                        Cropped
                      </div>
                      <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1 rounded">
                        {(file.size / (1024 * 1024)).toFixed(1)}MB
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
            {(screenshotsToDelete.length > 0 || newScreenshots.length > 0 || pendingCroppedFiles.length > 0) && (
              <div className="text-xs text-sand-600 bg-sand-50 p-2 rounded">
                {screenshotsToDelete.length > 0 && (
                  <div className="text-red-600">
                    • {screenshotsToDelete.length} screenshot{screenshotsToDelete.length !== 1 ? 's' : ''} will be deleted
                  </div>
                )}
                {newScreenshots.length > 0 && (
                  <div className="text-blue-600">
                    • {newScreenshots.length} new original screenshot{newScreenshots.length !== 1 ? 's' : ''} will be added
                  </div>
                )}
                {pendingCroppedFiles.length > 0 && (
                  <div className="text-green-600">
                    • {pendingCroppedFiles.length} new cropped screenshot{pendingCroppedFiles.length !== 1 ? 's' : ''} will be added
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(comment.content);
                setScreenshotsToDelete([]);
                setNewScreenshots([]);
                setPendingCroppedFiles([]);
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

      {/* Image Crop Modal */}
      {showCropModal && tempImageUrl && (
        <ImageCropModal
          imageUrl={tempImageUrl}
          onCropComplete={editingScreenshotId ? 
            (croppedImageBlob: Blob) => handleEditCropComplete(croppedImageBlob) :
            (croppedImageBlob: Blob) => handleCropComplete(croppedImageBlob)
          }
          onClose={handleCloseCropModal}
          onSkip={editingScreenshotId ? undefined : handleSkipCrop}
          title={editingScreenshotId ? "Edit Comment Screenshot" : "Crop Comment Screenshot"}
          defaultToSquare={false}
        />
      )}
    </div>
  );
};

export default CommentItem; 