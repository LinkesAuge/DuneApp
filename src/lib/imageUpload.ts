import { supabase } from './supabase';
import { 
  convertToWebP, 
  createWebPFile, 
  isConvertibleImage, 
  getQualityPresets,
  supportsWebP,
  ConversionResult
} from './imageUtils';

export interface UploadResult {
  url: string;
  path: string;
  originalSize?: number;
  convertedSize?: number;
  compressionRatio?: number;
}

export interface UploadOptions {
  quality?: 'high' | 'standard' | 'compressed' | 'icon';
  bucket?: string;
  folder?: string;
  maxWidth?: number;
  maxHeight?: number;
  forceWebP?: boolean; // Force conversion even if already WebP
}

/**
 * Upload an image with automatic WebP conversion
 */
export const uploadImageWithConversion = async (
  file: File,
  fileName: string,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  const {
    quality = 'standard',
    bucket = 'screenshots',
    folder = '',
    forceWebP = false
  } = options;

  try {
    let fileToUpload = file;
    let conversionStats: ConversionResult | null = null;

    // Check if we should convert the image
    const shouldConvert = forceWebP || (
      isConvertibleImage(file) && 
      file.type !== 'image/webp' &&
      await supportsWebP()
    );

    if (shouldConvert) {
      console.log(`Converting ${file.name} to WebP...`);
      
      const preset = getQualityPresets()[quality];
      conversionStats = await convertToWebP(file, {
        ...preset,
        ...options // Allow custom overrides
      });
      
      fileToUpload = createWebPFile(conversionStats.blob, fileName);
      
      console.log(`WebP conversion complete: ${(conversionStats.compressionRatio).toFixed(1)}% smaller`);
    }

    // Upload the file
    const filePath = folder ? `${folder}/${fileToUpload.name}` : fileToUpload.name;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileToUpload, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      throw error;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath,
      originalSize: conversionStats?.originalSize,
      convertedSize: conversionStats?.convertedSize,
      compressionRatio: conversionStats?.compressionRatio
    };

  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Upload multiple images with WebP conversion and progress tracking
 */
export const uploadMultipleImagesWithConversion = async (
  files: File[],
  options: UploadOptions = {},
  onProgress?: (progress: number, currentFile: string, stats?: string) => void
): Promise<UploadResult[]> => {
  const results: UploadResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (onProgress) {
      onProgress((i / files.length) * 100, file.name);
    }
    
    try {
      const result = await uploadImageWithConversion(file, file.name, options);
      results.push(result);
      
      if (onProgress && result.compressionRatio) {
        const stats = `${result.compressionRatio.toFixed(1)}% smaller`;
        onProgress(((i + 1) / files.length) * 100, file.name, stats);
      }
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      // Continue with other files
    }
  }
  
  return results;
};

// Legacy function for backward compatibility - now with WebP conversion
export const uploadImageToSupabase = async (
  file: File,
  bucket: string = 'screenshots',
  folder: string = ''
): Promise<string> => {
  const result = await uploadImageWithConversion(file, file.name, {
    bucket,
    folder,
    quality: 'standard'
  });
  
  return result.url;
};

/**
 * Upload POI screenshot with optimized settings
 */
export const uploadPoiScreenshot = async (
  file: File,
  fileName: string,
  folder: string = 'poi_screenshots'
): Promise<UploadResult> => {
  return uploadImageWithConversion(file, fileName, {
    bucket: 'screenshots',
    folder,
    quality: 'standard',
    maxWidth: 1920,
    maxHeight: 1920
  });
};



/**
 * Upload avatar with high quality settings
 */
export const uploadAvatar = async (
  file: File,
  fileName: string
): Promise<UploadResult> => {
  return uploadImageWithConversion(file, fileName, {
    bucket: 'avatars',
    folder: '',
    quality: 'high',
    maxWidth: 1024,
    maxHeight: 1024
  });
};

/**
 * Upload comment screenshot with standard quality settings
 */
export const uploadCommentScreenshot = async (
  file: File,
  fileName: string
): Promise<UploadResult> => {
  return uploadImageWithConversion(file, fileName, {
    bucket: 'screenshots',
    folder: 'comment-screenshots',
    quality: 'standard',
    maxWidth: 1920,
    maxHeight: 1920
  });
};

export const deleteImage = async (bucket: string, path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    throw new Error('Failed to delete image');
  }
};

export const extractPathFromUrl = (url: string, bucket: string): string => {
  // Extract path from Supabase storage URL
  // URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
  const urlParts = url.split(`/storage/v1/object/public/${bucket}/`);
  if (urlParts.length < 2) {
    throw new Error('Invalid storage URL format');
  }
  return urlParts[1];
}; 