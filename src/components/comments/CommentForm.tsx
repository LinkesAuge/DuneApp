import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { MessageSquare, Send, Paperclip, X, Image as ImageIconLucide, AlertTriangle } from 'lucide-react';
import EmojiTextArea from '../common/EmojiTextArea';
import { uploadImage } from '../../lib/imageUpload';
import ImageCropModal from '../grid/ImageCropModal';
import { PixelCrop } from 'react-image-crop';

interface CommentFormProps {
  poiId?: string;
  gridSquareId?: string;
  onCommentAdded: () => void;
  placeholder?: string;
}

const CommentForm: React.FC<CommentFormProps> = ({
  poiId,
  gridSquareId,
  onCommentAdded,
  placeholder = "Share your thoughts..."
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [pendingCroppedFiles, setPendingCroppedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="text-center py-4 text-slate-400">
        <MessageSquare className="mx-auto mb-2" size={24} />
        <p className="text-sm">Please sign in to leave a comment.</p>
      </div>
    );
  }

  const currentTotalFiles = screenshots.length + pendingCroppedFiles.length;
  const availableSlots = 5 - currentTotalFiles;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError(null);

    if (files.length > availableSlots) {
      setError(`You can only add ${availableSlots} more screenshot(s). Maximum 5 per comment.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    for (const file of files) {
      if (file.size > 2 * 1024 * 1024) {
        setError(`File "${file.name}" is too large. Max 2MB.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError(`File "${file.name}" is not a supported image type (JPEG, PNG, WebP).`);
        if (fileInputRef.current) fileInputRef.current.value = '';
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
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    if (!tempImageFile) return;
    try {
      const croppedFile = new File([croppedImageBlob], tempImageFile.name, { type: 'image/jpeg', lastModified: Date.now() });
      setPendingCroppedFiles(prev => [...prev, croppedFile]);
      const remainingFiles = (tempImageFile as any)?.remainingFiles as File[] || [];
      handleCloseCropModal();
      if (remainingFiles.length > 0) setTimeout(() => processFilesForCropping(remainingFiles), 100);
    } catch (err) {
      console.error('Error processing cropped image:', err);
      setError('Failed to process cropped image.');
      handleCloseCropModal();
    }
  };

  const handleSkipCrop = () => {
    if (!tempImageFile) return;
    setScreenshots(prev => [...prev, tempImageFile]);
    const remainingFiles = (tempImageFile as any)?.remainingFiles as File[] || [];
    handleCloseCropModal();
    if (remainingFiles.length > 0) setTimeout(() => processFilesForCropping(remainingFiles), 100);
  };

  const handleCloseCropModal = () => {
    if (tempImageUrl) URL.revokeObjectURL(tempImageUrl);
    setShowCropModal(false);
    setTempImageFile(null);
    setTempImageUrl(null);
  };

  const removeScreenshot = (index: number, type: 'original' | 'cropped') => {
    if (type === 'original') {
      setScreenshots(prev => prev.filter((_, i) => i !== index));
    } else {
      setPendingCroppedFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allFilesToUpload = [...screenshots, ...pendingCroppedFiles];
    if (!content.trim() && allFilesToUpload.length === 0) {
        setError('Comment cannot be empty and must have content or at least one screenshot.');
        return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const { data: commentData, error: insertError } = await supabase
        .from('comments')
        .insert({ content: content.trim(), created_by: user.id, ...(poiId ? { poi_id: poiId } : { grid_square_id: gridSquareId })})
        .select()
        .single();

      if (insertError) throw insertError;

      if (allFilesToUpload.length > 0) {
        const uploadPromises = allFilesToUpload.map(async (file) => {
          const filePath = `comment_screenshots/${user.id}/${commentData.id}/${Date.now()}_${file.name}`;
          const uploadedUrl = await uploadImage(file, filePath);
          if (uploadedUrl) {
            return supabase.from('comment_screenshots').insert({
              comment_id: commentData.id, url: uploadedUrl, uploaded_by: user.id, file_size: file.size, file_name: file.name
            });
          }
          return Promise.resolve({ error: new Error('Upload failed silently') });
        });
        const uploadResults = await Promise.all(uploadPromises);
        for (const result of uploadResults) if (result?.error) throw result.error;
      }

      setContent('');
      setScreenshots([]);
      setPendingCroppedFiles([]);
      onCommentAdded();
    } catch (err: any) {
      console.error('Error adding comment:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedScreenshots = [
    ...screenshots.map((file, index) => ({ file, type: 'original' as const, id: `orig-${index}-${file.name}`})),
    ...pendingCroppedFiles.map((file, index) => ({ file, type: 'cropped' as const, id: `cropped-${index}-${file.name}`}))
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <EmojiTextArea
        value={content}
        onChange={setContent}
        placeholder={placeholder}
        className="w-full p-2 text-sm bg-slate-800 text-slate-100 border border-slate-600 focus:ring-amber-400 focus:border-amber-400 min-h-[70px]"
        maxLength={1000}
      />
      <div className="text-xs text-slate-400 text-right -mt-2 mb-2">
        {content.length} / 1000
      </div>

      <div className="space-y-2 p-3 border border-slate-700 bg-night-800/30">
        <div className="flex flex-wrap items-center gap-3">
            {availableSlots > 0 && (
                <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 text-xs p-2 border-2 border-dashed border-slate-600 hover:border-amber-500 text-slate-300 hover:text-amber-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                >
                    <Paperclip size={14} /> Add Screenshots
                </button>
            )}
            <p className="text-xs text-slate-400 flex-grow whitespace-nowrap">
                {availableSlots > 0 ? `${availableSlots} slot(s) available.` : "Maximum 5 screenshots."}
                Max 2MB each (JPEG, PNG, WebP).
            </p>
        </div>

        {displayedScreenshots.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2 pt-2 border-t border-slate-700">
            {displayedScreenshots.map(({ file, type, id }, index) => (
              <div key={id} className="relative group w-16 h-16 border border-slate-600">
                <img src={URL.createObjectURL(file)} alt={`Screenshot preview ${index + 1}`} className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => removeScreenshot(index, type)}
                  disabled={isSubmitting}
                  className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 opacity-80 group-hover:opacity-100 hover:bg-red-500 transition-all disabled:opacity-50"
                  title="Remove screenshot"
                >
                  <X size={12} />
                </button>
                 <div className="absolute bottom-0 left-0 bg-black/60 text-white text-[10px] px-1 py-0.5">
                   {(file.size / (1024*1024)).toFixed(1)}MB
                </div>
                 {type === 'cropped' && <div className="absolute top-0 left-0 bg-sky-600/80 text-white text-[10px] px-1 py-0.5">CROP</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-2.5 text-sm text-red-300 bg-red-900/30 border border-red-700/50">
          <AlertTriangle size={18} className="flex-shrink-0 -ml-0.5 mt-0.5"/> 
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-center">
        <button 
          type="submit"
          disabled={isSubmitting || (!content.trim() && displayedScreenshots.length === 0)}
          className="px-6 py-2.5 text-sm font-medium text-amber-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-night-800 focus:ring-amber-400 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap transition-all duration-150 border border-slate-900 shadow-md hover:shadow-lg focus:shadow-xl hover:brightness-125"
          style={{ backgroundColor: '#2b1f37' }}
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
          {!isSubmitting && <Send size={14} className="inline ml-2 -mr-1"/>}
        </button>
      </div>

      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />

      {showCropModal && tempImageUrl && (
        <ImageCropModal
          imageUrl={tempImageUrl}
          onCropComplete={handleCropComplete}
          onClose={handleCloseCropModal}
          onSkipCrop={handleSkipCrop} 
          imageFile={tempImageFile}
        />
      )}
    </form>
  );
};

export default CommentForm; 