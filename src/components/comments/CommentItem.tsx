import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CommentWithUser } from '../../types';
import { useAuth } from '../auth/AuthProvider';
import { Clock, Edit2, Trash2, Check, X, ZoomIn, Upload, Image as ImageIconLucide, Edit, User, Paperclip, RotateCcw } from 'lucide-react';
import LikeButton from '../common/LikeButton';
import EmojiTextArea from '../common/EmojiTextArea';
import { uploadImage, deleteImage, extractPathFromUrl } from '../../lib/imageUpload';
import ImageCropModal from '../grid/ImageCropModal';
import { PixelCrop } from 'react-image-crop';
import { formatCompactDateTime, wasUpdated, formatDateWithPreposition } from '../../lib/dateUtils';

interface CommentItemProps {
  comment: CommentWithUser;
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
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenshotsToDelete, setScreenshotsToDelete] = useState<string[]>([]);
  const [newScreenshots, setNewScreenshots] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [pendingCroppedFiles, setPendingCroppedFiles] = useState<File[]>([]);
  const [editingScreenshotId, setEditingScreenshotId] = useState<string | null>(null);

  const [creatorInfo, setCreatorInfo] = useState<{ username: string } | null>(null);
  const [editorInfo, setEditorInfo] = useState<{ username: string } | null>(null);
  const [loadingUserInfo, setLoadingUserInfo] = useState(true);

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
    if (files.length === 0) return;
    setError(null);

    const currentTotalAfterNewFiles = totalScreenshots + files.length - pendingCroppedFiles.length;

    if (files.length > (5 - (remainingExistingScreenshots.length + newScreenshots.length))) {
      setError(`You can only add ${Math.max(0, 5 - (remainingExistingScreenshots.length + newScreenshots.length))} more screenshot(s). Maximum 5 per comment.`);
      return;
    }

    for (const file of files) {
      if (file.size > 2 * 1024 * 1024) {
        setError(`File "${file.name}" is too large. Max 2MB.`);
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError(`File "${file.name}" is not a supported image type (JPEG, PNG, WebP).`);
        return;
      }
    }
    processFilesForCropping(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFilesForCropping = (files: File[]) => {
    if (files.length === 0) return;
    const [firstFile, ...remainingFilesToProcessLater] = files;
    setTempImageFile(firstFile);
    (firstFile as any).remainingFiles = remainingFilesToProcessLater;
    setTempImageUrl(URL.createObjectURL(firstFile));
    setShowCropModal(true);
    setEditingScreenshotId(null);
  };

  const handleCropComplete = async (croppedImageBlob: Blob, forExistingId?: string) => {
    const sourceFile = tempImageFile;
    const originalName = sourceFile?.name || (forExistingId ? `edited_${forExistingId}.jpg` : 'cropped_comment_image.jpg');
    
    if (!sourceFile && !forExistingId) {
      setError('Source file for cropping is missing.');
      handleCloseCropModal();
      return;
    }

    try {
      const croppedFile = new File([croppedImageBlob], originalName, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      if (forExistingId) {
        setScreenshotsToDelete(prev => [...prev, forExistingId]);
        setPendingCroppedFiles(prev => [...prev, croppedFile]);
      } else {
        setPendingCroppedFiles(prev => [...prev, croppedFile]);
      }

      const remainingFiles = (sourceFile as any)?.remainingFiles as File[] || [];
      handleCloseCropModal();

      if (remainingFiles.length > 0) {
        setTimeout(() => processFilesForCropping(remainingFiles), 100);
      }
    } catch (error) {
      console.error('Error processing cropped image:', error);
      setError('Failed to process cropped image.');
      handleCloseCropModal();
    }
  };

  const handleSkipCrop = () => {
    if (!tempImageFile) return;

    if (editingScreenshotId) {
    } else {
      setNewScreenshots(prev => [...prev, tempImageFile]);
    }
    
    const remainingFiles = (tempImageFile as any).remainingFiles as File[] || [];
    handleCloseCropModal();

    if (remainingFiles.length > 0) {
      setTimeout(() => processFilesForCropping(remainingFiles), 100);
    }
  };

  const handleCloseCropModal = () => {
    if (tempImageUrl) URL.revokeObjectURL(tempImageUrl);
    setShowCropModal(false);
    setTempImageFile(null);
    setTempImageUrl(null);
    setEditingScreenshotId(null);
  };
  
  const handleEditExistingScreenshot = async (screenshotId: string, screenshotUrl: string) => {
    setError(null);
    setEditingScreenshotId(screenshotId);
    try {
      const response = await fetch(screenshotUrl);
      if (!response.ok) throw new Error(`Failed to fetch image for editing: ${response.statusText}`);
      const blob = await response.blob();
      const file = new File([blob], screenshotUrl.substring(screenshotUrl.lastIndexOf('/') + 1), { type: blob.type });
      
      setTempImageFile(file);
      setTempImageUrl(URL.createObjectURL(file));
      setShowCropModal(true);
    } catch (fetchError) {
      console.error('Error fetching existing screenshot for crop:', fetchError);
      setError(`Could not load image for editing. Please try again or re-upload. Error: ${(fetchError as Error).message}`);
      setEditingScreenshotId(null);
    }
  };

  const removeNewScreenshot = (index: number) => {
    setNewScreenshots(prev => prev.filter((_, i) => i !== index));
  };
  const removeCroppedScreenshot = (index: number) => {
    setPendingCroppedFiles(prev => prev.filter((_, i) => i !== index));
  };
  const markExistingScreenshotForDeletion = (screenshotId: string) => {
    if (!screenshotsToDelete.includes(screenshotId)) {
      setScreenshotsToDelete(prev => [...prev, screenshotId]);
    }
  };
  const unmarkExistingScreenshotForDeletion = (screenshotId: string) => {
    setScreenshotsToDelete(prev => prev.filter(id => id !== screenshotId));
  };

  const handleEdit = async () => {
    if (!editContent.trim() && existingScreenshots.length === 0 && newScreenshots.length === 0 && pendingCroppedFiles.length === 0) {
      setError('Comment cannot be empty and must have content or at least one screenshot.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const uploadedScreenshotUrls: { url: string, file_name: string | null, file_size: number | null }[] = [];
      const combinedNewFiles = [...newScreenshots, ...pendingCroppedFiles];

      for (const file of combinedNewFiles) {
        const filePath = `comment_screenshots/${user!.id}/${comment.id}/${Date.now()}_${file.name}`;
        const uploadedUrl = await uploadImage(file, filePath);
        if (uploadedUrl) {
          uploadedScreenshotUrls.push({ url: uploadedUrl, file_name: file.name, file_size: file.size });
        }
      }
      
      const screenshotsActuallyDeletedFromStorage: string[] = [];
      for (const screenshotIdToDelete of screenshotsToDelete) {
        const screenshot = existingScreenshots.find(s => s.id === screenshotIdToDelete);
        if (screenshot?.url) {
          const path = extractPathFromUrl(screenshot.url, `comment_screenshots/${user!.id}/${comment.id}/`);
          if (path) {
            await deleteImage(path);
            screenshotsActuallyDeletedFromStorage.push(screenshotIdToDelete);
          }
        }
      }

      const { error: updateError } = await supabase
        .from('comments')
        .update({
          content: editContent,
          updated_at: new Date().toISOString(),
          updated_by: user!.id,
        })
        .eq('id', comment.id);

      if (updateError) throw updateError;

      if (screenshotsActuallyDeletedFromStorage.length > 0) {
        const { error: deleteScreenshotAssociationsError } = await supabase
          .from('comment_screenshots')
          .delete()
          .in('id', screenshotsActuallyDeletedFromStorage);
        if (deleteScreenshotAssociationsError) console.error('Error deleting old screenshot associations:', deleteScreenshotAssociationsError.message);
      }

      if (uploadedScreenshotUrls.length > 0) {
        const newScreenshotRecords = uploadedScreenshotUrls.map(s_url => ({
          comment_id: comment.id,
          url: s_url.url,
          uploaded_by: user!.id,
          file_name: s_url.file_name,
          file_size: s_url.file_size,
        }));
        const { error: insertScreenshotsError } = await supabase
          .from('comment_screenshots')
          .insert(newScreenshotRecords);
        if (insertScreenshotsError) console.error('Error inserting new screenshot associations:', insertScreenshotsError.message);
      }

      setIsEditing(false);
      onCommentUpdated();
      setNewScreenshots([]);
      setPendingCroppedFiles([]);
      setScreenshotsToDelete([]);
      setError(null);
    } catch (err: any) {
      console.error('Error updating comment:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment and its screenshots?')) return;
    setIsSubmitting(true);
    try {
      for (const screenshot of existingScreenshots) {
        if (screenshot.url) {
          const path = extractPathFromUrl(screenshot.url, `comment_screenshots/${comment.created_by}/${comment.id}/`);
          if (path) {
            await deleteImage(path);
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

  if (!isEditing) {
    return (
      <div className="p-3 bg-night-800/60 border border-slate-700 text-sm">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 border-2 border-slate-600 flex-shrink-0">
            <User size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span 
                className="font-semibold text-amber-300 hover:underline cursor-pointer truncate"
                onClick={() => onShouldNavigate && onShouldNavigate(`/profile/${comment.created_by}`)}
                title={loadingUserInfo ? 'Loading...' : creatorInfo?.username || 'Unknown User'}
              >
                {loadingUserInfo ? 'Loading...' : creatorInfo?.username || 'Unknown User'}
              </span>
              <div className="flex items-center space-x-2 flex-shrink-0">
                {canEdit && (
                  <button onClick={() => setIsEditing(true)} className="p-1 text-slate-400 hover:text-amber-200">
                    <Edit2 size={14} />
                  </button>
                )}
                {canDelete && (
                  <button onClick={handleDelete} className="p-1 text-slate-400 hover:text-red-400" disabled={isSubmitting}>
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
        {existingScreenshots.length > 0 && (
          <div className="mt-3 pl-11">
            <p className="text-xs text-slate-400 mb-1">Attached screenshots:</p>
            <div className="flex flex-wrap gap-2">
              {existingScreenshots.map(s => (
                <div key={s.id} className="relative group w-20 h-20 border border-slate-600">
                  <img 
                    src={s.url} 
                    alt={`Comment screenshot ${s.id}`} 
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => onImageClick && onImageClick(s.url, existingScreenshots.map(es => es.url))}
                  />
                  <div 
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => onImageClick && onImageClick(s.url, existingScreenshots.map(es => es.url))}
                  >
                    <ZoomIn size={24} className="text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-2 pl-11 flex items-center">
            <LikeButton targetType="comment" targetId={comment.id} size="sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-night-800 border border-amber-500/50 text-sm">
      <h3 className="text-md font-semibold text-amber-300 mb-2">Edit Comment</h3>
      {error && (
        <div className="mb-3 p-2 text-red-300 bg-red-900/40 border border-red-700/60 text-xs">
          {error}
        </div>
      )}
      <EmojiTextArea
        value={editContent}
        onChange={setEditContent}
        placeholder="Edit your comment..."
        className="w-full p-2 text-sm bg-night-700 text-slate-100 border border-slate-600 focus:ring-amber-400 focus:border-amber-400 min-h-[80px]"
        maxLength={1000}
      />
      <div className="text-xs text-slate-400 mt-1 mb-3 text-right">
        {editContent.length} / 1000
      </div>

      <div className="space-y-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Manage Screenshots (Max 5 total):</label>
          {existingScreenshots.length > 0 && (
            <div className="mb-2 p-2 border border-slate-700 bg-night-900/30">
                <p className="text-xs text-slate-400 mb-1.5">Current screenshots:</p>
                <div className="flex flex-wrap gap-2">
                {existingScreenshots.map(s => (
                    <div key={s.id} className={`relative group w-16 h-16 border ${screenshotsToDelete.includes(s.id) ? 'border-red-500 opacity-50' : 'border-slate-600'}`}>
                    <img src={s.url} alt={`Screenshot ${s.id}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {!screenshotsToDelete.includes(s.id) ? (
                        <>
                            <button 
                                onClick={() => handleEditExistingScreenshot(s.id, s.url)} 
                                className="text-xs text-sky-300 hover:text-sky-200 p-0.5 mb-0.5"
                                title="Crop/Edit Screenshot"
                            >
                                <Edit size={14}/>
                            </button>
                            <button 
                                onClick={() => markExistingScreenshotForDeletion(s.id)} 
                                className="text-xs text-red-400 hover:text-red-300 p-0.5"
                                title="Delete Screenshot"
                            >
                                <Trash2 size={14}/>
                            </button>
                        </>
                        ) : (
                        <button 
                            onClick={() => unmarkExistingScreenshotForDeletion(s.id)} 
                            className="text-xs text-slate-300 hover:text-white p-0.5"
                            title="Undo Delete"
                        >
                            <RotateCcw size={14}/>
                        </button>
                        )}
                    </div>
                    </div>
                ))}
                </div>
            </div>
          )}
          {(newScreenshots.length > 0 || pendingCroppedFiles.length > 0) && (
            <div className="mb-2 p-2 border border-slate-700 bg-night-900/30">
                <p className="text-xs text-slate-400 mb-1.5">New/edited screenshots to upload:</p>
                <div className="flex flex-wrap gap-2">
                {[...newScreenshots, ...pendingCroppedFiles].map((file, index) => (
                    <div key={index} className="relative group w-16 h-16 border border-sky-500">
                    <img src={URL.createObjectURL(file)} alt={`New screenshot ${index}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                        onClick={() => {
                            if (index < newScreenshots.length) removeNewScreenshot(index);
                            else removeCroppedScreenshot(index - newScreenshots.length);
                        }} 
                        className="text-xs text-red-400 hover:text-red-300 p-1"
                        title="Remove this new screenshot"
                        >
                        <Trash2 size={16}/>
                        </button>
                    </div>
                    </div>
                ))}
                </div>
            </div>
          )}
          {availableSlots > 0 ? (
            <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 text-sm p-2 border-2 border-dashed border-slate-600 hover:border-amber-500 text-slate-400 hover:text-amber-300 transition-colors"
            >
                <Paperclip size={16} /> Add Screenshots ({availableSlots} remaining)
            </button>
          ) : (
            <p className="text-xs text-slate-500 text-center">Maximum 5 screenshots reached.</p>
          )}
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            ref={fileInputRef}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 mt-3">
        <button 
          onClick={() => {
            setIsEditing(false);
            setEditContent(comment.content);
            setError(null);
            setNewScreenshots([]);
            setPendingCroppedFiles([]);
            setScreenshotsToDelete([]);
          }}
          disabled={isSubmitting}
          className="px-3 py-1.5 text-xs text-slate-300 bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
        >
          Cancel
        </button>
        <button 
          onClick={handleEdit}
          disabled={isSubmitting || (!editContent.trim() && totalScreenshots === 0)}
          className="px-3 py-1.5 text-xs text-night-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:bg-amber-400/50"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {showCropModal && tempImageUrl && (
        <ImageCropModal
          imageUrl={tempImageUrl}
          onCropComplete={(blob) => handleCropComplete(blob, editingScreenshotId || undefined)}
          onClose={handleCloseCropModal}
          onSkipCrop={handleSkipCrop}
          imageFile={tempImageFile} 
        />
      )}
    </div>
  );
};

export default CommentItem; 