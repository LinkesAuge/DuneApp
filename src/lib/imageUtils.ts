/**
 * Image processing utilities for the Dune Awakening Tracker
 * Handles WebP conversion, resizing, and optimization
 */

export interface ImageConversionOptions {
  quality?: number; // 0.0 to 1.0, default 0.8
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio?: boolean;
}

export interface ConversionResult {
  blob: Blob;
  originalSize: number;
  convertedSize: number;
  compressionRatio: number;
  format: string;
}

/**
 * Check if the browser supports WebP encoding
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    canvas.toBlob((blob) => {
      resolve(blob !== null);
    }, 'image/webp');
  });
};

/**
 * Convert an image file to WebP format with optional resizing
 */
export const convertToWebP = async (
  file: File,
  options: ImageConversionOptions = {}
): Promise<ConversionResult> => {
  const {
    quality = 0.85, // High quality by default
    maxWidth,
    maxHeight,
    maintainAspectRatio = true
  } = options;

  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Calculate dimensions
      let { width, height } = img;
      
      if (maxWidth || maxHeight) {
        const scale = Math.min(
          maxWidth ? maxWidth / width : 1,
          maxHeight ? maxHeight / height : 1
        );
        
        if (scale < 1) {
          width *= scale;
          height *= scale;
        }
      }

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Draw and convert
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to convert image to WebP'));
            return;
          }

          const convertedSize = blob.size;
          const compressionRatio = ((originalSize - convertedSize) / originalSize) * 100;

          resolve({
            blob,
            originalSize,
            convertedSize,
            compressionRatio,
            format: 'webp'
          });
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Convert multiple files to WebP with progress tracking
 */
export const convertMultipleToWebP = async (
  files: File[],
  options: ImageConversionOptions = {},
  onProgress?: (progress: number, currentFile: string) => void
): Promise<ConversionResult[]> => {
  const results: ConversionResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (onProgress) {
      onProgress((i / files.length) * 100, file.name);
    }
    
    try {
      const result = await convertToWebP(file, options);
      results.push(result);
    } catch (error) {
      console.error(`Failed to convert ${file.name}:`, error);
      // Continue with other files, don't fail the entire batch
    }
  }
  
  if (onProgress) {
    onProgress(100, 'Complete');
  }
  
  return results;
};

/**
 * Get optimal quality settings for different use cases
 */
export const getQualityPresets = () => ({
  // High quality for avatars and important images
  high: { quality: 0.9, maxWidth: 2048, maxHeight: 2048 },
  
  // Standard quality for POI screenshots
  standard: { quality: 0.85, maxWidth: 1920, maxHeight: 1920 },
  
  // Compressed for thumbnails and previews
  compressed: { quality: 0.75, maxWidth: 800, maxHeight: 800 },
  
  // Maximum compression for icons
  icon: { quality: 0.8, maxWidth: 512, maxHeight: 512 }
});

/**
 * Create a WebP-compatible File object from a Blob
 */
export const createWebPFile = (blob: Blob, originalFileName: string): File => {
  const nameWithoutExt = originalFileName.replace(/\.[^/.]+$/, '');
  const webpFileName = `${nameWithoutExt}.webp`;
  
  return new File([blob], webpFileName, {
    type: 'image/webp',
    lastModified: Date.now()
  });
};

/**
 * Validate if a file is an image that can be converted
 */
export const isConvertibleImage = (file: File): boolean => {
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/gif'];
  return supportedTypes.includes(file.type);
};

/**
 * Get conversion statistics for display
 */
export const formatConversionStats = (result: ConversionResult): string => {
  const originalMB = (result.originalSize / (1024 * 1024)).toFixed(2);
  const convertedMB = (result.convertedSize / (1024 * 1024)).toFixed(2);
  const ratio = result.compressionRatio.toFixed(1);
  
  return `${originalMB}MB → ${convertedMB}MB (${ratio}% smaller)`;
}; 