import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { MessageSquare, Send, Upload, X, Image } from 'lucide-react';
import EmojiTextArea from '../common/EmojiTextArea';
import { uploadImage } from '../../lib/imageUpload';

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
    const remainingSlots = 5 - screenshots.length;
    
    if (files.length > remainingSlots) {
      setError(`You can only add ${remainingSlots} more screenshot${remainingSlots !== 1 ? 's' : ''}. Maximum 5 per comment.`);
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

    setScreenshots(prev => [...prev, ...files]);
    setError(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && screenshots.length === 0) return;

    setIsSubmitting(true);
    setIsUploading(screenshots.length > 0);
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

      // Upload screenshots if any
      if (screenshots.length > 0) {
        const uploadPromises = screenshots.map(async (file) => {
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
          {screenshots.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {screenshots.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg border border-sand-300"
                  />
                  <button
                    type="button"
                    onClick={() => removeScreenshot(index)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  >
                    <X size={12} />
                  </button>
                  <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                    {(file.size / (1024 * 1024)).toFixed(1)}MB
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          {screenshots.length < 5 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="btn btn-outline text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Upload size={16} />
                Add Screenshots ({screenshots.length}/5)
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
  );
};

export default CommentForm; 