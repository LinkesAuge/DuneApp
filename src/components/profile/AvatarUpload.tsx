import React, { useState, useRef } from 'react';
import { Upload, X, Check, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { uploadAvatar, UploadResult } from '../../lib/imageUpload';
import { formatConversionStats } from '../../lib/imageUtils';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onAvatarChange: (avatarUrl: string | null) => void;
  isUploading?: boolean;
  onUploadStart?: () => void;
  onUploadComplete?: () => void;
  onError?: (error: string) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  onAvatarChange,
  isUploading = false,
  onUploadStart,
  onUploadComplete,
  onError
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [conversionStats, setConversionStats] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, or WebP)';
    }

    // Check file size (max 5MB - will be compressed to WebP)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return 'File size must be less than 5MB (will be optimized)';
    }

    return null;
  };

  const uploadAvatarFile = async (file: File): Promise<UploadResult> => {
    // Generate unique filename (extension will be .webp after conversion)
    const fileName = `avatar_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Upload with WebP conversion and high quality settings
    return uploadAvatar(file, fileName);
  };

  const handleFileSelect = async (file: File) => {
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      onError?.(validationError);
      return;
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      onUploadStart?.();
      
      // Upload to storage with WebP conversion
      const uploadResult = await uploadAvatarFile(file);
      
      // Show compression stats if available
      if (uploadResult.compressionRatio) {
        const stats = formatConversionStats(uploadResult);
        setConversionStats(stats);
      }
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (!user) throw new Error('No authenticated user');
        
        return supabase
          .from('profiles')
          .update({ custom_avatar_url: uploadResult.url })
          .eq('id', user.id);
      });

      if (updateError) {
        throw new Error(`Profile update failed: ${updateError.message}`);
      }

      onAvatarChange(uploadResult.url);
      onUploadComplete?.();
      
      // Clean up object URL and show stats briefly
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
        setPreviewUrl(null);
        setConversionStats(null);
      }, 3000);
      
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      onError?.(error.message);
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeAvatar = async () => {
    try {
      onUploadStart?.();
      
      // Update profile to remove custom avatar
      const { error: updateError } = await supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (!user) throw new Error('No authenticated user');
        
        return supabase
          .from('profiles')
          .update({ custom_avatar_url: null })
          .eq('id', user.id);
      });

      if (updateError) {
        throw new Error(`Profile update failed: ${updateError.message}`);
      }

      onAvatarChange(null);
      onUploadComplete?.();
      
    } catch (error: any) {
      console.error('Avatar removal error:', error);
      onError?.(error.message);
    }
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className="space-y-4">
      {/* Current Avatar Display */}
      <div className="flex items-center gap-4">
        <div className="relative">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Current Avatar"
              className="w-16 h-16 rounded-full border-2 border-gold-300/50 object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-void-950 border-2 border-gold-300/50 flex items-center justify-center">
              <ImageIcon size={24} className="text-gold-300/70" />
            </div>
          )}
          
          {isUploading && (
            <div className="absolute inset-0 bg-void-950/80 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold-300"></div>
            </div>
          )}
        </div>
        
        <div>
          <p className="text-amber-200 text-sm font-light">Custom Avatar</p>
          <p className="text-amber-300/60 text-xs">
            {currentAvatarUrl ? 'Custom avatar active' : 'No custom avatar set'}
          </p>
          {conversionStats && (
            <p className="text-green-400 text-xs mt-1">
              ✓ Optimized: {conversionStats}
            </p>
          )}
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-300 cursor-pointer
          ${dragOver 
            ? 'border-gold-300 bg-gold-300/10' 
            : 'border-gold-300/30 hover:border-gold-300/50'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <div className="text-center">
          <Upload size={24} className="text-gold-300/70 mx-auto mb-2" />
          <p className="text-amber-200 text-sm font-light mb-1">
            {dragOver ? 'Drop image here' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-amber-300/60 text-xs">
            JPEG, PNG, WebP • Max 1MB • Recommended: 256x256px
          </p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {/* Remove Avatar Button */}
      {currentAvatarUrl && !isUploading && (
        <button
          onClick={removeAvatar}
          className="flex items-center gap-2 px-4 py-2 bg-red-900/20 border border-red-500/30 
                   text-red-300 text-sm rounded-lg hover:bg-red-900/30 transition-all duration-300"
          style={{ fontFamily: "'Trebuchet MS', sans-serif" }}
        >
          <X size={14} />
          Remove Custom Avatar
        </button>
      )}
    </div>
  );
};

export default AvatarUpload; 