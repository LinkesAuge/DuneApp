// Entity Icon Storage - Supabase Storage Utilities
// Handles entity icon upload, retrieval, and management

import { supabase } from './supabase';

// Storage configuration for entity icons
export const ENTITY_ICON_CONFIG = {
  BUCKET: 'screenshots',           // Using existing bucket
  FOLDER: 'entity-icons',          // Dedicated subfolder for entity icons
  MAX_FILE_SIZE: 1024 * 1024,     // 1MB max file size
  ALLOWED_TYPES: ['image/webp', 'image/png', 'image/jpeg', 'image/jpg'],
  QUALITY: 0.8,                    // Compression quality for processing
  MAX_DIMENSION: 256,              // Maximum width/height for optimization
} as const;

// Entity icon storage utilities
export class EntityIconStorage {
  
  /**
   * Generate storage path for entity icon
   */
  static getStoragePath(entityId: string, filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase() || 'webp';
    return `${ENTITY_ICON_CONFIG.FOLDER}/${entityId}.${extension}`;
  }

  /**
   * Generate public URL for entity icon
   */
  static getPublicUrl(entityId: string, filename: string): string {
    const path = this.getStoragePath(entityId, filename);
    const { data } = supabase.storage
      .from(ENTITY_ICON_CONFIG.BUCKET)
      .getPublicUrl(path);
    return data.publicUrl;
  }

  /**
   * Upload entity icon to storage
   */
  static async uploadIcon(
    entityId: string,
    file: File,
    options: {
      replace?: boolean;
      onProgress?: (progress: number) => void;
    } = {}
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Generate storage path
      const storagePath = this.getStoragePath(entityId, file.name);
      
      // Check if file already exists and handle replacement
      if (!options.replace) {
        const { data: existingFile } = await supabase.storage
          .from(ENTITY_ICON_CONFIG.BUCKET)
          .list(ENTITY_ICON_CONFIG.FOLDER, {
            search: `${entityId}.`
          });
          
        if (existingFile && existingFile.length > 0) {
          return { success: false, error: 'Icon already exists. Set replace: true to overwrite.' };
        }
      }

      // Process and upload file
      const processedFile = await this.processFile(file);
      
      const { error: uploadError } = await supabase.storage
        .from(ENTITY_ICON_CONFIG.BUCKET)
        .upload(storagePath, processedFile, {
          cacheControl: '3600',
          upsert: options.replace
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return { success: false, error: uploadError.message };
      }

      // Generate public URL
      const publicUrl = this.getPublicUrl(entityId, file.name);
      
      return { success: true, url: publicUrl };
      
    } catch (error) {
      console.error('Entity icon upload error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown upload error' 
      };
    }
  }

  /**
   * Delete entity icon from storage
   */
  static async deleteIcon(entityId: string, filename: string): Promise<{ success: boolean; error?: string }> {
    try {
      const storagePath = this.getStoragePath(entityId, filename);
      
      const { error } = await supabase.storage
        .from(ENTITY_ICON_CONFIG.BUCKET)
        .remove([storagePath]);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
      
    } catch (error) {
      console.error('Entity icon delete error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown delete error' 
      };
    }
  }

  /**
   * List all entity icons in storage
   */
  static async listIcons(): Promise<{ success: boolean; icons?: Array<{ name: string; size: number; url: string }>; error?: string }> {
    try {
      const { data: files, error } = await supabase.storage
        .from(ENTITY_ICON_CONFIG.BUCKET)
        .list(ENTITY_ICON_CONFIG.FOLDER);

      if (error) {
        return { success: false, error: error.message };
      }

      const icons = files?.map(file => ({
        name: file.name,
        size: file.metadata?.size || 0,
        url: this.getPublicUrl(file.name.split('.')[0], file.name)
      })) || [];

      return { success: true, icons };
      
    } catch (error) {
      console.error('List entity icons error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown list error' 
      };
    }
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > ENTITY_ICON_CONFIG.MAX_FILE_SIZE) {
      return { 
        valid: false, 
        error: `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds limit of ${ENTITY_ICON_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB` 
      };
    }

    // Check file type
    if (!ENTITY_ICON_CONFIG.ALLOWED_TYPES.includes(file.type)) {
      return { 
        valid: false, 
        error: `File type ${file.type} not allowed. Allowed types: ${ENTITY_ICON_CONFIG.ALLOWED_TYPES.join(', ')}` 
      };
    }

    return { valid: true };
  }

  /**
   * Process file for optimization (resize, compress)
   */
  static async processFile(file: File): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate dimensions maintaining aspect ratio
        const maxDim = ENTITY_ICON_CONFIG.MAX_DIMENSION;
        let { width, height } = img;
        
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = (height * maxDim) / width;
            width = maxDim;
          } else {
            width = (width * maxDim) / height;
            height = maxDim;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const processedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(processedFile);
            } else {
              resolve(file); // Fallback to original file
            }
          },
          file.type,
          ENTITY_ICON_CONFIG.QUALITY
        );
      };

      img.onerror = () => resolve(file); // Fallback to original file
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Get icon URL with fallback handling
   */
  static getIconUrl(entity: { id: string; icon?: string | null }): string | null {
    if (!entity.icon) return null;
    
    // If icon already looks like a URL, return as-is
    if (entity.icon.startsWith('http') || entity.icon.startsWith('/')) {
      return entity.icon;
    }
    
    // Generate Supabase storage URL
    return this.getPublicUrl(entity.id, entity.icon);
  }

  /**
   * Check if entity has custom icon
   */
  static hasCustomIcon(entity: { icon?: string | null }): boolean {
    return !!(entity.icon && entity.icon.trim().length > 0);
  }
}

// Export utilities for convenient usage
export const {
  uploadIcon,
  deleteIcon,
  listIcons,
  getIconUrl,
  hasCustomIcon,
  getPublicUrl,
  getStoragePath
} = EntityIconStorage; 