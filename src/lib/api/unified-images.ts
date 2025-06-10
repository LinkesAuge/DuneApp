// Minimal unified images API for compilation
import { supabase } from '../supabase';
import type { PixelCrop } from 'react-image-crop';

// =====================================================
// Types
// =====================================================

export type ImageType = 'poi_screenshot' | 'comment_image' | 'profile_avatar' | 'custom_icon' | 'item_screenshot' | 'schematic_screenshot';

export interface ManagedImage {
  id: string;
  original_url: string;
  processed_url: string | null;
  crop_details: PixelCrop | null;
  image_type: ImageType;
  file_size: number | null;
  dimensions: { width: number; height: number } | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImageUploadResult {
  success: boolean;
  managedImage?: ManagedImage;
  originalUrl?: string;
  processedUrl?: string | null;
  error?: string;
}

export interface ImageLinkRequest {
  imageId: string;
  entityId: string;
  displayOrder?: number;
}

export interface ImageEditRequest {
  imageId: string;
  cropDetails?: PixelCrop | null;
  removeProcessed?: boolean;
}

// =====================================================
// Core Image Management Functions
// =====================================================

/**
 * Upload a file and create a managed image record
 */
export async function createManagedImage(
  file: File,
  imageType: ImageType,
  cropDetails?: PixelCrop | null
): Promise<ImageUploadResult> {
  try {
    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
    
    // Determine storage path based on image type
    const storagePath = getStoragePath(imageType, fileName);
    
    // Upload original file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('screenshots')
      .upload(storagePath, file, { 
        upsert: false 
        // Let Supabase auto-detect MIME type
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return { 
        success: false, 
        error: `Failed to upload file: ${uploadError.message}` 
      };
    }

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('screenshots')
      .getPublicUrl(storagePath);

    // Get file dimensions if it's an image
    const dimensions = await getImageDimensions(file);

    // Create managed image record
    const imageRecord = {
      original_url: publicUrl,
      processed_url: null, // Will be set later if cropping is applied
      crop_details: cropDetails || null,
      image_type: imageType,
      file_size: file.size,
      dimensions: dimensions,
      mime_type: file.type,
      uploaded_by: (await supabase.auth.getUser()).data.user?.id || null
    };

    const { data: managedImage, error: dbError } = await supabase
      .from('managed_images')
      .insert([imageRecord])
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('screenshots').remove([storagePath]);
      return { 
        success: false, 
        error: `Failed to create image record: ${dbError.message}` 
      };
    }

    return {
      success: true,
      managedImage: managedImage as ManagedImage,
      originalUrl: publicUrl,
      processedUrl: null
    };

  } catch (error) {
    console.error('Unexpected error in createManagedImage:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unexpected error occurred' 
    };
  }
}

/**
 * Get images linked to a specific entity
 */
export async function getImagesForEntity(
  entityId: string,
  entityType: 'poi' | 'comment' | 'item' | 'schematic'
): Promise<ManagedImage[]> {
  try {
    let query;
    
    switch (entityType) {
      case 'poi':
        query = supabase
          .from('poi_image_links')
          .select(`
            managed_images (*)
          `)
          .eq('poi_id', entityId)
          .order('display_order', { ascending: true });
        break;
      
      case 'comment':
        query = supabase
          .from('comment_image_links')
          .select(`
            managed_images (*)
          `)
          .eq('comment_id', entityId);
        break;
      
      case 'item':
        query = supabase
          .from('item_image_links')
          .select(`
            managed_images (*)
          `)
          .eq('entity_id', entityId)
          .order('display_order', { ascending: true });
        break;
      
      case 'schematic':
        query = supabase
          .from('schematic_image_links')
          .select(`
            managed_images (*)
          `)
          .eq('entity_id', entityId)
          .order('display_order', { ascending: true });
        break;
      
      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Error fetching images for ${entityType}:`, error);
      return [];
    }

    // Extract managed_images from the joined results
    return (data || [])
      .map((item: any) => item.managed_images)
      .filter(Boolean) as ManagedImage[];

  } catch (error) {
    console.error('Error in getImagesForEntity:', error);
    return [];
  }
}

/**
 * Link an image to a POI
 */
export async function linkImageToPOI(request: ImageLinkRequest): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('poi_image_links')
      .insert([{
        poi_id: request.entityId,
        image_id: request.imageId,
        display_order: request.displayOrder || 0
      }]);

    if (error) {
      console.error('Error linking image to POI:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in linkImageToPOI:', error);
    return false;
  }
}

/**
 * Link an image to a comment
 */
export async function linkImageToComment(request: ImageLinkRequest): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('comment_image_links')
      .insert([{
        comment_id: request.entityId,
        image_id: request.imageId
      }]);

    if (error) {
      console.error('Error linking image to comment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in linkImageToComment:', error);
    return false;
  }
}

/**
 * Link an image to an item
 */
export async function linkImageToItem(request: ImageLinkRequest): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('item_image_links')
      .insert([{
        entity_id: request.entityId,
        image_id: request.imageId,
        display_order: request.displayOrder || 0
      }]);

    if (error) {
      console.error('Error linking image to item:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in linkImageToItem:', error);
    return false;
  }
}

/**
 * Link an image to a schematic
 */
export async function linkImageToSchematic(request: ImageLinkRequest): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('schematic_image_links')
      .insert([{
        entity_id: request.entityId,
        image_id: request.imageId,
        display_order: request.displayOrder || 0
      }]);

    if (error) {
      console.error('Error linking image to schematic:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in linkImageToSchematic:', error);
    return false;
  }
}

/**
 * Unlink an image from an entity
 */
export async function unlinkImage(imageId: string, entityId: string, entityType: 'poi' | 'comment' | 'item' | 'schematic'): Promise<boolean> {
  try {
    let tableName: string;
    let whereCondition: any;

    switch (entityType) {
      case 'poi':
        tableName = 'poi_image_links';
        whereCondition = { poi_id: entityId, image_id: imageId };
        break;
      case 'comment':
        tableName = 'comment_image_links';
        whereCondition = { comment_id: entityId, image_id: imageId };
        break;
      case 'item':
        tableName = 'item_image_links';
        whereCondition = { entity_id: entityId, image_id: imageId };
        break;
      case 'schematic':
        tableName = 'schematic_image_links';
        whereCondition = { entity_id: entityId, image_id: imageId };
        break;
      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }

    const { error } = await supabase
      .from(tableName)
      .delete()
      .match(whereCondition);

    if (error) {
      console.error(`Error unlinking image from ${entityType}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in unlinkImage:', error);
    return false;
  }
}

/**
 * Get a single managed image by ID
 */
export async function getManagedImage(imageId: string, includeLinks?: boolean): Promise<ManagedImage | null> {
  try {
    const { data, error } = await supabase
      .from('managed_images')
      .select('*')
      .eq('id', imageId)
      .single();

    if (error) {
      console.error('Error fetching managed image:', error);
      return null;
    }

    return data as ManagedImage;
  } catch (error) {
    console.error('Unexpected error in getManagedImage:', error);
    return null;
  }
}

/**
 * Update a managed image (e.g., crop details)
 */
export async function updateManagedImage(imageId: string, updates: Partial<ManagedImage>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('managed_images')
      .update(updates)
      .eq('id', imageId);

    if (error) {
      console.error('Error updating managed image:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in updateManagedImage:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unexpected error' };
  }
}

/**
 * Delete a managed image and its storage files
 */
export async function deleteManagedImage(imageId: string): Promise<boolean> {
  try {
    // First get the image to know what files to delete
    const image = await getManagedImage(imageId);
    if (!image) {
      console.error('Image not found for deletion:', imageId);
      return false;
    }

    // Extract storage paths
    const pathsToDelete: string[] = [];
    
    if (image.original_url) {
      const originalPath = extractStoragePath(image.original_url);
      if (originalPath) pathsToDelete.push(originalPath);
    }
    
    if (image.processed_url) {
      const processedPath = extractStoragePath(image.processed_url);
      if (processedPath) pathsToDelete.push(processedPath);
    }

    // Delete from database first
    const { error: dbError } = await supabase
      .from('managed_images')
      .delete()
      .eq('id', imageId);

    if (dbError) {
      console.error('Error deleting managed image from database:', dbError);
      return false;
    }

    // Delete storage files
    if (pathsToDelete.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('screenshots')
        .remove(pathsToDelete);

      if (storageError) {
        console.warn('Error deleting storage files (image already deleted from DB):', storageError);
        // Don't return false here since the DB deletion succeeded
      }
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in deleteManagedImage:', error);
    return false;
  }
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * Generate storage path based on image type
 */
function getStoragePath(imageType: ImageType, fileName: string): string {
  // Use the same path structure that's been working in the existing system
  switch (imageType) {
    case 'poi_screenshot':
      return `poi_screenshots/${fileName}`;
    case 'comment_image':
      return `comment_screenshots/${fileName}`;
    case 'item_screenshot':
      return `item_screenshots/${fileName}`;
    case 'schematic_screenshot':
      return `schematic_screenshots/${fileName}`;
    case 'profile_avatar':
      return `profile_avatars/${fileName}`;
    case 'custom_icon':
      return `icons/${fileName}`;
    default:
      return `misc/${fileName}`;
  }
}

/**
 * Extract storage path from public URL
 */
function extractStoragePath(publicUrl: string): string | null {
  try {
    // URLs are typically: https://xxxxx.supabase.co/storage/v1/object/public/screenshots/path/to/file.jpg
    const parts = publicUrl.split('/screenshots/');
    return parts.length > 1 ? parts[1] : null;
  } catch (error) {
    console.error('Error extracting storage path:', error);
    return null;
  }
}

/**
 * Get image dimensions from file
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(null);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    
    img.src = url;
  });
}

// =====================================================
// Generic Link Function (for flexibility)
// =====================================================

/**
 * Generic function to link an image to any entity type
 */
export async function linkImageToEntity(
  imageId: string,
  entityId: string,
  entityType: 'poi' | 'comment' | 'item' | 'schematic',
  displayOrder: number = 0
): Promise<boolean> {
  const request: ImageLinkRequest = { imageId, entityId, displayOrder };
  
  switch (entityType) {
    case 'poi':
      return linkImageToPOI(request);
    case 'comment':
      return linkImageToComment(request);
    case 'item':
      return linkImageToItem(request);
    case 'schematic':
      return linkImageToSchematic(request);
    default:
      console.error('Unsupported entity type:', entityType);
      return false;
  }
}
