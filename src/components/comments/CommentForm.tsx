import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { MessageSquare, Send, Upload, X, Image } from 'lucide-react';
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
  placeholder = "Add a comment..."
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Screenshot cropping state
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [pendingCroppedFiles, setPendingCroppedFiles] = useState<File[]>([]);

  if (!user) {
    return (
      <div className="text-center py-4 text-sand-600">
        <MessageSquare className="mx-auto mb-2" size={24} />
        <p className="text-sm">Please sign in to leave a comment</p>
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalFiles = screenshots.length + pendingCroppedFiles.length + files.length;
    
    if (totalFiles > 5) {
      setError(`You can only add ${5 - (screenshots.length + pendingCroppedFiles.length)} more screenshot${5 - (screenshots.length + pendingCroppedFiles.length) !== 1 ? 's' : ''}. Maximum 5 per comment.`);
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

    // Add original file to screenshots instead of pending cropped files
    setScreenshots(prev => [...prev, tempImageFile]);

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
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  // Remove cropped screenshot
  const removeCroppedScreenshot = (index: number) => {
    setPendingCroppedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalScreenshots = screenshots.length + pendingCroppedFiles.length;
    if (!content.trim() && totalScreenshots === 0) return;

    setIsSubmitting(true);
    setIsUploading(totalScreenshots > 0);
    setError(null);

    try {
      // Insert comment first
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

      // Upload screenshots if any (both original and cropped)
      const allFiles = [...screenshots, ...pendingCroppedFiles];
      if (allFiles.length > 0) {
        const uploadPromises = allFiles.map(async (file) => {
          const { url } = await uploadImage(file, {
            bucket: 'screenshots',
            folder: 'comments'
          });

          return supabase
            .from('comment_screenshots')
            .insert({
              comment_id: commentData.id,
              url,
              uploaded_by: user.id,
              file_size: file.size,
              file_name: file.name
            });
        });

        const uploadResults = await Promise.all(uploadPromises);
        
        for (const result of uploadResults) {
          if (result.error) throw result.error;
        }
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
      setIsUploading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
            {error}
          </div>
        )}
        
        <div className="flex flex-col gap-3">
          <EmojiTextArea
            value={content}
            onChange={setContent}
            placeholder={placeholder}
            disabled={isSubmitting}
            minHeight="80px"
          />

          {/* Screenshot upload section */}
          <div className="space-y-3">
            {/* Screenshot previews */}
            {(screenshots.length > 0 || pendingCroppedFiles.length > 0) && (
              <div className="space-y-3">
                {/* Original Screenshots */}
                {screenshots.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-sand-700 mb-2">Original Screenshots</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                      {screenshots.map((file, index) => (
                        <div key={`original-${index}`} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Original Screenshot ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-sand-300"
                          />
                          <button
                            type="button"
                            onClick={() => removeScreenshot(index)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                          >
                            <X size={12} />
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

                {/* Cropped Screenshots */}
                {pendingCroppedFiles.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-sand-700 mb-2">Cropped Screenshots</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                      {pendingCroppedFiles.map((file, index) => (
                        <div key={`cropped-${index}`} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Cropped Screenshot ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-sand-300"
                          />
                          <button
                            type="button"
                            onClick={() => removeCroppedScreenshot(index)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                          >
                            <X size={12} />
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
              </div>
            )}

            {/* Upload button */}
            {(screenshots.length + pendingCroppedFiles.length) < 5 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="btn btn-outline text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <Upload size={16} />
                  Add Screenshots ({screenshots.length + pendingCroppedFiles.length}/5)
                </button>
                <span className="text-xs text-sand-600">
                  Max 2MB each, JPEG/PNG/WebP
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
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-xs text-sand-600">
            {screenshots.length > 0 && (
              <span className="flex items-center gap-1">
                <Image size={12} />
                {screenshots.length} screenshot{screenshots.length !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={(!content.trim() && screenshots.length === 0) || isSubmitting}
            className="btn btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {isUploading ? 'Uploading...' : 'Posting...'}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send size={16} />
                Post Comment
              </div>
            )}
          </button>
        </div>
      </form>

      {/* Image Crop Modal */}
      {showCropModal && tempImageFile && tempImageUrl && (
        <ImageCropModal
          imageUrl={tempImageUrl}
          onCropComplete={(croppedImageBlob: Blob) => handleCropComplete(croppedImageBlob)}
          onClose={handleCloseCropModal}
          onSkip={handleSkipCrop}
          title="Crop Comment Screenshot"
          defaultToSquare={false}
        />
      )}
    </div>
  );
};

export default CommentForm; 