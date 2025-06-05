import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { MessageSquare, Send, Paperclip, X, AlertTriangle } from 'lucide-react';
import EmojiTextArea from '../common/EmojiTextArea';
import ImageCropModal from '../grid/ImageCropModal';
import { PixelCrop } from 'react-image-crop';
import { v4 as uuidv4 } from 'uuid';
import { uploadCommentScreenshotOriginal, uploadCommentScreenshotCropped } from '../../lib/imageUpload';
import { formatConversionStats } from '../../lib/imageUtils';

interface CommentFormProps {
  poiId?: string;
  gridSquareId?: string;
  onCommentAdded: () => void;
  placeholder?: string;
  showImageUpload?: boolean;
}

// Simple screenshot file interface (based on POI pattern)
interface ScreenshotFile {
  id: string;
  originalFile: File; // The original uploaded file (always preserved)
  displayFile: File; // The file to be shown (cropped or same as original)
  cropDetails: PixelCrop | null;
  previewUrl: string; // Preview URL for the display file
}

const CommentForm: React.FC<CommentFormProps> = ({
  poiId,
  gridSquareId,
  onCommentAdded,
  placeholder = "Share your thoughts...",
  showImageUpload = true
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversionStats, setConversionStats] = useState<string | null>(null);
  const [screenshots, setScreenshots] = useState<ScreenshotFile[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop modal state (simple)
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setError(null);

    // Check total limit
    if (screenshots.length + pendingFiles.length + files.length > 5) {
      setError(`Cannot add ${files.length} file(s). Maximum 5 screenshots total. Currently have ${screenshots.length + pendingFiles.length}.`);
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
      setShowCropModal(true);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processNextFile = () => {
    if (pendingFiles.length === 0) return;
    
    const nextFile = pendingFiles[0];
    setTempImageFile(nextFile);
    setTempImageUrl(URL.createObjectURL(nextFile));
    setShowCropModal(true);
  };

  const handleCropComplete = async (croppedImageBlob: Blob, cropData: PixelCrop, isFullImage: boolean) => {
    if (!tempImageFile) return;

    const processedFile = new File([croppedImageBlob], tempImageFile.name, {
      type: tempImageFile.type,
      lastModified: Date.now(),
    });

    const newScreenshot: ScreenshotFile = {
      id: uuidv4(),
      originalFile: tempImageFile, // Keep the original file
      displayFile: processedFile, // Use the cropped file for display
      cropDetails: isFullImage ? null : cropData,
      previewUrl: URL.createObjectURL(processedFile),
    };

    setScreenshots(prev => [...prev, newScreenshot]);
    
    // Remove processed file from pending queue
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
  };

  const handleCloseCropModal = () => {
    if (tempImageUrl) URL.revokeObjectURL(tempImageUrl);
    setTempImageFile(null);
    setTempImageUrl(null);
    setShowCropModal(false);
  };

  const removeScreenshot = (idToRemove: string) => {
    setScreenshots(prev => prev.filter(s => {
      if (s.id === idToRemove) {
        URL.revokeObjectURL(s.previewUrl);
        return false;
      }
      return true;
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!content.trim() && screenshots.length === 0) {
      setError('Comment cannot be empty and must have content or at least one screenshot.');
      return;
    }
    
    // Additional check to prevent submission while files are being processed
    if (pendingFiles.length > 0) {
      setError('Please wait for all screenshots to be processed before submitting.');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);

    try {
      // 1. First create the comment (without screenshots)
      const { data: commentData, error: insertError } = await supabase
        .from('comments')
        .insert({ 
          content: content.trim(), 
          created_by: user.id, 
          ...(poiId ? { poi_id: poiId } : { grid_square_id: gridSquareId })
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 2. Then upload screenshots and create screenshot records
      for (let i = 0; i < screenshots.length; i++) {
        const screenshot = screenshots[i];
        const screenshotId = uuidv4();
        
        // Upload original file
        const originalFileName = `${user.id}/${screenshotId}_original.webp`;
        const originalUploadResult = await uploadCommentScreenshotOriginal(screenshot.originalFile, originalFileName);
        
        // Upload display file (cropped or same as original)
        const displayFileName = `${user.id}/${screenshotId}_display.webp`;
        const displayUploadResult = await uploadCommentScreenshotCropped(screenshot.displayFile, displayFileName);

        // Show conversion feedback for first upload
        if (i === 0 && displayUploadResult.compressionRatio) {
          const stats = formatConversionStats(displayUploadResult);
          setConversionStats(stats);
          
          // Clear stats after 5 seconds
          setTimeout(() => setConversionStats(null), 5000);
        }

        // Create screenshot record in comment_screenshots table
        const { error: screenshotError } = await supabase
          .from('comment_screenshots')
          .insert({
            comment_id: commentData.id,
            url: displayUploadResult.url, // Display URL (cropped or original)
            original_url: originalUploadResult.url, // Original URL
            crop_details: screenshot.cropDetails, // Store the crop data
            uploaded_by: user.id,
            file_size: screenshot.displayFile.size,
            file_name: screenshot.displayFile.name,
            upload_date: new Date().toISOString()
          });

        if (screenshotError) throw screenshotError;
      }

      // Clean up preview URLs
      screenshots.forEach(screenshot => {
        URL.revokeObjectURL(screenshot.previewUrl);
      });

      // Reset form
      setContent('');
      setScreenshots([]);
      setPendingFiles([]);
      
      // Notify parent component
      onCommentAdded();
      
    } catch (err: any) {
      console.error('Error adding comment:', err);
      setError(err.message || 'Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalFiles = screenshots.length + pendingFiles.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <EmojiTextArea
        value={content}
        onChange={setContent}
        placeholder={placeholder}
        className="w-full p-2 text-sm bg-slate-800 text-slate-100 border border-slate-600 focus:ring-amber-400 focus:border-amber-400 min-h-[70px]"
        maxLength={1000}
      />
      <div className="text-xs text-slate-400 text-right">
        {content.length} / 1000
      </div>

      {showImageUpload && (
        <div className="space-y-2 p-3 border border-slate-700 bg-night-800/30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting || totalFiles >= 5}
              className="flex items-center gap-2 text-xs px-3 py-2 border-2 border-dashed border-slate-600 hover:border-amber-500 text-slate-300 hover:text-amber-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Paperclip size={14} /> 
              {totalFiles >= 5 ? 'Max Screenshots Reached' : `Add Screenshot${totalFiles > 0 ? 's' : ''}`}
            </button>
            <p className="text-xs text-slate-400">
              {totalFiles}/5 • Max 2MB each (JPEG, PNG, WebP) 
              {pendingFiles.length > 0 && ` • ${pendingFiles.length} pending crop`}
            </p>
          </div>

          {screenshots.length > 0 && (
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-700">
              {screenshots.map((screenshot) => (
                <div key={screenshot.id} className="relative group aspect-square">
                  <img 
                    src={screenshot.previewUrl} 
                    alt="Screenshot preview" 
                    className="w-full h-full object-cover rounded" 
                  />
                  <button
                    type="button"
                    onClick={() => removeScreenshot(screenshot.id)}
                    disabled={isSubmitting}
                    className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 opacity-80 group-hover:opacity-100 hover:bg-red-500 transition-all disabled:opacity-50"
                    title="Remove screenshot"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
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

      {error && (
        <div className="flex items-start gap-2 p-2.5 text-sm text-red-300 bg-red-900/30 border border-red-700/50 rounded">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5"/> 
          <span>{error}</span>
        </div>
      )}

      {/* Conversion Stats Display */}
      {conversionStats && (
        <div className="p-2.5 text-sm text-green-300 bg-green-900/30 border border-green-700/50 rounded">
          ✓ {conversionStats}
        </div>
      )}

      <div className="flex justify-center">
        <button 
          type="submit"
          disabled={isSubmitting || (!content.trim() && screenshots.length === 0) || pendingFiles.length > 0}
          className="px-6 py-2.5 text-sm font-medium text-amber-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-night-800 focus:ring-amber-400 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-150 border border-slate-900 shadow-md hover:shadow-lg focus:shadow-xl hover:brightness-125 rounded"
          style={{ backgroundColor: '#2b1f37' }}
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
          {!isSubmitting && <Send size={14} className="inline ml-2 -mr-1"/>}
        </button>
      </div>

      {showCropModal && tempImageUrl && tempImageFile && (
        <ImageCropModal
          imageUrl={tempImageUrl}
          onCropComplete={handleCropComplete}
          onClose={handleCloseCropModal}
          title={`Crop Screenshot (${screenshots.length + 1}/${totalFiles})`}
          defaultToSquare={false}
        />
      )}
    </form>
  );
};

export default CommentForm; 