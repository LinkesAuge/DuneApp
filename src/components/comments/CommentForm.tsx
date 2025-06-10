import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { MessageSquare, Send, AlertTriangle, Upload, X } from 'lucide-react';
import EmojiTextArea from '../common/EmojiTextArea';
import { useScreenshotManager } from '../../hooks/useScreenshotManager';
import CropProcessor from '../shared/CropProcessor';

interface CommentFormProps {
  poiId?: string;
  gridSquareId?: string;
  onCommentAdded: () => void;
  placeholder?: string;
  showImageUpload?: boolean;
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

  // Unified screenshot system for comment images
  const screenshotManager = useScreenshotManager({
    context: 'comment',
    entityId: undefined, // Will be set after comment creation
    maxFileSize: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    enableCropping: true
  });

  if (!user) {
    return (
      <div className="text-center py-4 text-slate-400">
        <MessageSquare className="mx-auto mb-2" size={24} />
        <p className="text-sm">Please sign in to leave a comment.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!content.trim() && screenshotManager.filesToProcess.filter(f => f.isProcessed).length === 0) {
      setError('Comment cannot be empty and must have content or at least one image.');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);

    try {
      // 1. Create the comment
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
      // 2. Upload and link processed screenshots to the comment
      const processedFiles = screenshotManager.filesToProcess.filter(f => f.isProcessed);
      if (processedFiles.length > 0) {
        await uploadProcessedScreenshots(commentData.id);
      }

      // Reset form
      setContent('');
      screenshotManager.clearProcessingQueue();
      onCommentAdded();
      
    } catch (err: any) {
      console.error('Error creating comment:', err);
      setError(err.message || 'Failed to create comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Upload processed screenshots for the comment
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
          uploaded_by: user.id
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
        console.error(`[CommentForm] ❌ Error processing file ${file.originalFile.name}:`, error);
        throw error;
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-700/50 text-red-300 text-sm">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <div className="space-y-3">
        <EmojiTextArea
          value={content}
          onChange={setContent}
          placeholder={placeholder}
          className="w-full p-3 bg-night-800 border border-slate-600 text-slate-200 placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
          rows={3}
        />

        {showImageUpload && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Screenshots ({screenshotManager.filesToProcess.filter(f => f.isProcessed).length}/5)
            </label>
            
            <div className="space-y-3">
              {/* Screenshots Grid */}
              <div className="flex flex-wrap gap-2">
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
                      alt="Screenshot" 
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
                {screenshotManager.filesToProcess.length < 5 && (
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
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="text-xs text-slate-400">
          {screenshotManager.filesToProcess.filter(f => f.isProcessed).length > 0 && (
            <span>
              {screenshotManager.filesToProcess.filter(f => f.isProcessed).length} screenshot{screenshotManager.filesToProcess.filter(f => f.isProcessed).length !== 1 ? 's' : ''} ready to upload
            </span>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || (!content.trim() && screenshotManager.filesToProcess.filter(f => f.isProcessed).length === 0)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Posting...
            </>
          ) : (
            <>
              <Send size={16} />
              Post Comment
            </>
          )}
        </button>
      </div>

      {/* Unified Crop Processor */}
      <CropProcessor
        screenshotManager={screenshotManager}
      />
    </form>
  );
};

export default CommentForm; 