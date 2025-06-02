import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { CommentWithUser } from '../../types';
import { Rank } from '../../types/profile';
import { useAuth } from '../auth/AuthProvider';
import { Clock, Edit2, Trash2, User, Eye, Paperclip, X, AlertTriangle, Edit } from 'lucide-react';
import RankBadge from '../common/RankBadge';
import LikeButton from '../common/LikeButton';
import EmojiTextArea from '../common/EmojiTextArea';
import ImageCropModal from '../grid/ImageCropModal';
import { formatDateWithPreposition, wasUpdated } from '../../lib/dateUtils';
import { getScreenshotLabel } from '../../lib/cropUtils';
import { PixelCrop } from 'react-image-crop';
import { v4 as uuidv4 } from 'uuid';
import { uploadCommentScreenshot } from '../../lib/imageUpload';
import { formatConversionStats } from '../../lib/imageUtils';

interface CommentItemProps {
  comment: CommentWithUser;
  onCommentUpdated: () => void;
  onCommentDeleted: () => void;
  onImageClick?: (imageUrl: string, allImages: string[]) => void;
  onShouldNavigate?: (path: string) => void;
}

// Screenshot file interface for editing
interface ScreenshotFile {
  id: string;
  url?: string; // existing screenshots have URLs
  file?: File; // new screenshots have files
  cropDetails?: PixelCrop | null;
  previewUrl: string;
  isNew?: boolean;
  markedForDeletion?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onCommentUpdated,
  onCommentDeleted,
  onImageClick,
  onShouldNavigate
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversionStats, setConversionStats] = useState<string | null>(null);
  const [editScreenshots, setEditScreenshots] = useState<ScreenshotFile[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop modal state
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);

  const [creatorInfo, setCreatorInfo] = useState<{ username: string; rank?: Rank | null } | null>(null);
  const [editorInfo, setEditorInfo] = useState<{ username: string; rank?: Rank | null } | null>(null);
  const [loadingUserInfo, setLoadingUserInfo] = useState(true);

  const [editingScreenshot, setEditingScreenshot] = useState<ScreenshotFile | null>(null);

  const canEdit = user && (user.id === comment.created_by || user.role === 'admin' || user.role === 'editor');
  const canDelete = user && (user.id === comment.created_by || user.role === 'admin');
  const isEdited = wasUpdated(comment.created_at, comment.updated_at);

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
          .select('id, username, rank:ranks(*)')
          .in('id', userIds);
        
        if (error) throw error;
        
        const creatorData = userData?.find(u => u.id === comment.created_by);
        const editorData = userData?.find(u => u.id === comment.updated_by);
        
        setCreatorInfo(creatorData ? { username: creatorData.username, rank: creatorData.rank } : null);
        setEditorInfo(editorData ? { username: editorData.username, rank: editorData.rank } : null);
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setLoadingUserInfo(false);
      }
    };
    
    fetchUserInfo();
  }, [comment.created_by, comment.updated_by]);

  // Initialize edit screenshots when entering edit mode
  useEffect(() => {
    if (isEditing) {
      const initialScreenshots = comment.screenshots?.map(s => ({
        id: s.id || uuidv4(),
        url: s.url,
        cropDetails: null,
        previewUrl: s.url,
        isNew: false,
        markedForDeletion: false
      })) || [];
      setEditScreenshots(initialScreenshots);
    }
  }, [isEditing, comment.screenshots]);

  // Handle editing an existing screenshot
  const handleEditScreenshot = async (screenshot: ScreenshotFile) => {
    if (!screenshot.url) return;
    
    try {
      setEditingScreenshot(screenshot);
      setTempImageUrl(screenshot.url);
      setShowCropModal(true);
    } catch (error) {
      console.error('Error preparing screenshot for editing:', error);
      setError('Failed to prepare screenshot for editing');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setError(null);
    const activeScreenshots = editScreenshots.filter(s => !s.markedForDeletion);

    // Check total limit
    if (activeScreenshots.length + pendingFiles.length + files.length > 5) {
      setError(`Cannot add ${files.length} file(s). Maximum 5 screenshots total. Currently have ${activeScreenshots.length + pendingFiles.length}.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate all files first
    for (const file of files) {
      if (file.size > 2 * 1024 * 1024) {
        setError(`File "${file.name}" is too large. Maximum 2MB allowed.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError(`File "${file.name}" has invalid type. Please select JPEG, PNG, or WebP images.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
    }

    // Add files to pending queue
    const newPendingFiles = [...pendingFiles, ...files];
    setPendingFiles(newPendingFiles);
    
    // Start processing the first file if not already processing
    if (pendingFiles.length === 0 && !showCropModal) {
      const firstFile = newPendingFiles[0];
      setTempImageFile(firstFile);
      setTempImageUrl(URL.createObjectURL(firstFile));
      setEditingScreenshot(null); // New upload, not editing existing
      setShowCropModal(true);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCropComplete = async (croppedImageBlob: Blob, cropData: PixelCrop, isFullImage: boolean) => {
    if (editingScreenshot) {
      // Editing existing screenshot
      const processedFile = new File([croppedImageBlob], `edited_${editingScreenshot.id}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      const newScreenshot: ScreenshotFile = {
        id: editingScreenshot.id, // Keep same ID for replacement
        file: processedFile,
        cropDetails: isFullImage ? null : cropData,
        previewUrl: URL.createObjectURL(processedFile),
        isNew: true, // Mark as new for upload processing
        markedForDeletion: false
      };

      // Replace the existing screenshot
      setEditScreenshots(prev => prev.map(s => 
        s.id === editingScreenshot.id ? newScreenshot : s
      ));
    } else if (tempImageFile) {
      // New screenshot upload
      const processedFile = new File([croppedImageBlob], tempImageFile.name, {
        type: tempImageFile.type,
        lastModified: Date.now(),
      });

      const newScreenshot: ScreenshotFile = {
        id: uuidv4(),
        file: processedFile,
        cropDetails: isFullImage ? null : cropData,
        previewUrl: URL.createObjectURL(processedFile),
        isNew: true,
        markedForDeletion: false
      };

      setEditScreenshots(prev => [...prev, newScreenshot]);
      
      // Remove processed file from pending queue and process next
      setPendingFiles(prevPending => {
        const remainingFiles = prevPending.slice(1);
        
        // Close current modal
        handleCloseCropModal();
        
        // Process next file if any (with slight delay to ensure state is updated)
        if (remainingFiles.length > 0) {
          setTimeout(() => {
            const nextFile = remainingFiles[0];
            setTempImageFile(nextFile);
            setTempImageUrl(URL.createObjectURL(nextFile));
            setShowCropModal(true);
          }, 100);
        }
        
        return remainingFiles;
      });
      return; // Early return to prevent calling handleCloseCropModal again
    }

    handleCloseCropModal();
  };

  const handleCloseCropModal = () => {
    if (tempImageUrl && editingScreenshot) {
      // Don't revoke URL for existing screenshots
    } else if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
    }
    setTempImageFile(null);
    setTempImageUrl(null);
    setEditingScreenshot(null);
    setShowCropModal(false);
  };

  const removeScreenshot = (idToRemove: string) => {
    setEditScreenshots(prev => prev.map(s => {
      if (s.id === idToRemove) {
        if (s.isNew) {
          // Remove new screenshots immediately and clean up
          if (s.previewUrl && s.previewUrl !== s.url) {
            URL.revokeObjectURL(s.previewUrl);
          }
          return null; // Filter this out
        } else {
          // Mark existing screenshots for deletion
          return { ...s, markedForDeletion: true };
        }
      }
      return s;
    }).filter(Boolean) as ScreenshotFile[]);
  };

  const restoreScreenshot = (idToRestore: string) => {
    setEditScreenshots(prev => prev.map(s => 
      s.id === idToRestore ? { ...s, markedForDeletion: false } : s
    ));
  };

  const activeScreenshots = editScreenshots.filter(s => !s.markedForDeletion);
  const canAddMore = activeScreenshots.length + pendingFiles.length < 5;

  const handleSaveEdit = async () => {
    if (!editContent.trim() && activeScreenshots.length === 0) {
      setError('Comment cannot be empty and must have content or at least one screenshot.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      // 1. Update comment content
      const { error: updateError } = await supabase
        .from('comments')
        .update({
          content: editContent,
          updated_at: new Date().toISOString(),
          updated_by: user!.id,
        })
        .eq('id', comment.id);

      if (updateError) throw updateError;

      // 2. Handle screenshot deletions (marked for deletion)
      const screenshotsToDelete = editScreenshots.filter(s => s.markedForDeletion && !s.isNew);
      for (const screenshot of screenshotsToDelete) {
        if (screenshot.url) {
          // Delete from storage
          const url = new URL(screenshot.url);
          const pathParts = url.pathname.split('/');
          const fileName = pathParts[pathParts.length - 1];
          if (fileName) {
            await supabase.storage
              .from('screenshots')
              .remove([`comment-screenshots/${fileName}`]);
          }

          // Delete from database
          await supabase
            .from('comment_screenshots')
            .delete()
            .eq('id', screenshot.id);
        }
      }

      // 3. Handle new screenshots and edited screenshots
      const newAndEditedScreenshots = editScreenshots.filter(s => s.isNew && !s.markedForDeletion);
      for (let i = 0; i < newAndEditedScreenshots.length; i++) {
        const screenshot = newAndEditedScreenshots[i];
        if (screenshot.file) {
          const fileName = `${user.id}/${uuidv4()}-${screenshot.file.name.replace(/\.[^/.]+$/, '.webp')}`;
          
          const uploadResult = await uploadCommentScreenshot(screenshot.file, fileName);
          
          // Show conversion feedback for first upload
          if (i === 0 && uploadResult.compressionRatio) {
            const stats = formatConversionStats(uploadResult);
            setConversionStats(stats);

            // Clear stats after 5 seconds
            setTimeout(() => setConversionStats(null), 5000);
          }

          // Check if this is editing an existing screenshot (has existing ID from original)
          const existingScreenshot = comment.screenshots?.find(s => s.id === screenshot.id);
          
          if (existingScreenshot) {
            // Update existing screenshot record
            const { error: screenshotError } = await supabase
              .from('comment_screenshots')
              .update({
                url: uploadResult.url,
                file_size: screenshot.file.size,
                file_name: screenshot.file.name,
                upload_date: new Date().toISOString()
              })
              .eq('id', screenshot.id);

            if (screenshotError) throw screenshotError;

            // Delete old file from storage if URL is different
            if (existingScreenshot.url !== uploadResult.url) {
              try {
                const oldUrl = new URL(existingScreenshot.url);
                const oldPathParts = oldUrl.pathname.split('/');
                const oldFileName = oldPathParts[oldPathParts.length - 1];
                if (oldFileName) {
                  await supabase.storage
                    .from('screenshots')
                    .remove([`comment-screenshots/${oldFileName}`]);
                }
              } catch (cleanupError) {
                console.warn('Failed to cleanup old screenshot file:', cleanupError);
              }
            }
          } else {
            // Create new screenshot record
            const { error: screenshotError } = await supabase
              .from('comment_screenshots')
              .insert({
                comment_id: comment.id,
                url: uploadResult.url,
                uploaded_by: user.id,
                file_size: screenshot.file.size,
                file_name: screenshot.file.name
              });

            if (screenshotError) throw screenshotError;
          }
        }
      }

      // Clean up preview URLs for new screenshots
      newAndEditedScreenshots.forEach(screenshot => {
        if (screenshot.previewUrl && screenshot.previewUrl !== screenshot.url) {
          URL.revokeObjectURL(screenshot.previewUrl);
        }
      });

      setIsEditing(false);
      onCommentUpdated();
      setError(null);
      
    } catch (err: any) {
      console.error('Error updating comment:', err);
      setError(err.message || 'Failed to update comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment and its screenshots?')) return;
    setIsSubmitting(true);
    
    try {
      // Delete screenshots from storage if any
      if (comment.screenshots && comment.screenshots.length > 0) {
        for (const screenshot of comment.screenshots) {
          if (screenshot.url) {
            // Extract path from URL and delete from storage
            const url = new URL(screenshot.url);
            const pathParts = url.pathname.split('/');
            const fileName = pathParts[pathParts.length - 1];
            if (fileName) {
              await supabase.storage
                .from('screenshots')
                .remove([`comment-screenshots/${fileName}`]);
            }
          }
        }
      }

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
    if (onImageClick) {
      onImageClick(imageUrl, comment.screenshots?.map(s => s.url) || []);
    }
  };

  if (!isEditing) {
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
        
        {/* Screenshots Display */}
        {comment.screenshots && comment.screenshots.length > 0 && (
          <div className="mt-3">
            <div className="grid gap-2" style={{ 
              gridTemplateColumns: comment.screenshots.length === 1 
                ? '1fr' 
                : comment.screenshots.length === 2 
                  ? 'repeat(2, 1fr)' 
                  : 'repeat(3, 1fr)'
            }}>
              {comment.screenshots.slice(0, 6).map((screenshot, index) => (
                <div key={screenshot.id || index} className="relative group">
                  <img
                    src={screenshot.url}
                    alt={`Comment screenshot ${index + 1}`}
                    className="w-full h-24 object-cover rounded cursor-pointer transition-opacity group-hover:opacity-90"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageClick(screenshot.url);
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                    <Eye className="w-5 h-5 text-white drop-shadow-lg" />
                  </div>
                </div>
              ))}
            </div>
            
            {comment.screenshots.length > 6 && (
              <div className="mt-2 text-xs text-slate-400 text-center">
                +{comment.screenshots.length - 6} more screenshots
              </div>
            )}
          </div>
        )}
        
        <div className="mt-2 pl-11 flex items-center">
          <LikeButton targetType="comment" targetId={comment.id} size="sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-night-800/60 border border-slate-700 text-sm">
      <h3 className="text-md font-semibold text-amber-300 mb-2">Edit Comment</h3>
      {error && (
        <div className="flex items-start gap-2 p-2.5 text-sm text-red-300 bg-red-900/30 border border-red-700/50 rounded mb-3">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5"/> 
          <span>{error}</span>
        </div>
      )}
      
      <EmojiTextArea
        value={editContent}
        onChange={setEditContent}
        placeholder="Edit your comment..."
        className="w-full p-2 text-sm bg-slate-800 text-slate-100 border border-slate-600 focus:ring-amber-400 focus:border-amber-400 min-h-[80px]"
        maxLength={1000}
      />
      <div className="text-xs text-slate-400 mt-1 mb-3 text-right">
        {editContent.length} / 1000
      </div>

      {/* Screenshot Management in Edit Mode */}
      {isEditing && (
        <div className="space-y-3 p-3 border border-slate-700 bg-night-800/30">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-slate-300">Manage Screenshots (Max 5 total):</label>
            <span className="text-xs text-slate-400">
              {activeScreenshots.length + pendingFiles.length}/5
              {pendingFiles.length > 0 && ` • ${pendingFiles.length} pending crop`}
            </span>
          </div>

          {/* Existing + New Screenshots Display */}
          {activeScreenshots.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {activeScreenshots.map((screenshot) => (
                <div key={screenshot.id} className="relative group aspect-square border border-slate-600">
                  <img 
                    src={screenshot.previewUrl} 
                    alt={`Screenshot ${screenshot.id}`} 
                    className="w-full h-full object-cover rounded" 
                  />
                  
                  {/* Action buttons for existing screenshots */}
                  <div className="absolute top-1 right-1 flex space-x-1">
                    {/* Edit button for existing screenshots */}
                    {!screenshot.isNew && (
                      <button
                        type="button"
                        onClick={() => handleEditScreenshot(screenshot)}
                        disabled={isSubmitting}
                        className="bg-blue-600 text-white rounded p-1 opacity-80 group-hover:opacity-100 hover:bg-blue-500 transition-all disabled:opacity-50"
                        title="Edit screenshot"
                      >
                        <Edit size={10} />
                      </button>
                    )}
                    
                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => removeScreenshot(screenshot.id)}
                      disabled={isSubmitting}
                      className="bg-red-600 text-white rounded p-1 opacity-80 group-hover:opacity-100 hover:bg-red-500 transition-all disabled:opacity-50"
                      title="Remove screenshot"
                    >
                      <X size={10} />
                    </button>
                  </div>

                  {/* Screenshot type indicator */}
                  <div className="absolute bottom-1 left-1">
                    {(() => {
                      const label = getScreenshotLabel(screenshot.isNew, screenshot.cropDetails);
                      return (
                        <span className={label.className}>{label.text}</span>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Screenshot Button */}
          {canAddMore && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="flex items-center gap-2 text-xs px-3 py-2 border-2 border-dashed border-slate-600 hover:border-amber-500 text-slate-300 hover:text-amber-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Paperclip size={14} /> 
                Add Screenshot{activeScreenshots.length > 0 ? 's' : ''}
              </button>
              <p className="text-xs text-slate-400">
                Max 2MB each (JPEG, PNG, WebP)
              </p>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/jpeg, image/png, image/webp"
            multiple
          />
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <button 
          onClick={() => {
            setIsEditing(false);
            setEditContent(comment.content);
            setError(null);
            // Clean up any new screenshot preview URLs
            editScreenshots.forEach(screenshot => {
              if (screenshot.isNew && screenshot.previewUrl && screenshot.previewUrl !== screenshot.url) {
                URL.revokeObjectURL(screenshot.previewUrl);
              }
            });
            setEditScreenshots([]);
          }}
          disabled={isSubmitting}
          className="px-3 py-1.5 text-xs text-slate-300 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={handleSaveEdit}
          disabled={isSubmitting || !editContent.trim()}
          className="px-3 py-1.5 text-xs text-night-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:bg-amber-400/50 transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Image Crop Modal for Screenshot Editing */}
      {showCropModal && tempImageUrl && (
        <ImageCropModal
          imageUrl={tempImageUrl}
          onCropComplete={handleCropComplete}
          onClose={handleCloseCropModal}
          title={editingScreenshot ? "Edit Comment Screenshot" : `Crop Comment Screenshot (${activeScreenshots.length + 1}/${activeScreenshots.length + pendingFiles.length + 1})`}
          defaultToSquare={false}
        />
      )}
    </div>
  );
};

export default CommentItem; 