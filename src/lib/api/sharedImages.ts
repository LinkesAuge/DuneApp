// API functions for Shared Images System
// All images are available for all uses - no type restrictions

import { supabase } from '../supabase';
import type { 
  SharedImage, 
  SharedImageWithStats, 
  SharedImageUpload, 
  ImageSearchFilters, 
  ImageSearchResponse,
  ImageDisplayInfo
} from '../../types/sharedImages';

// Get all shared images with optional filtering (ALL IMAGES AVAILABLE)
export async function getSharedImages(filters: ImageSearchFilters = {}): Promise<ImageSearchResponse> {
  try {
    let query = supabase
      .from('shared_images_with_stats')
      .select('*')
      .eq('is_active', true);

    // Apply filters
    if (filters.search_query) {
      query = query.or(`filename.ilike.%${filters.search_query}%,description.ilike.%${filters.search_query}%`);
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    // Image type filter is organizational only - does not restrict availability
    if (filters.image_type && filters.image_type !== 'all') {
      query = query.eq('image_type', filters.image_type);
    }

    if (filters.uploaded_by) {
      query = query.eq('uploaded_by', filters.uploaded_by);
    }

    // Sorting
    const sortBy = filters.sort_by || 'created_at';
    const sortDirection = filters.sort_direction || 'desc';
    query = query.order(sortBy, { ascending: sortDirection === 'asc' });

    // Pagination
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      images: data || [],
      total_count: count || 0,
      has_more: (count || 0) > offset + limit
    };
  } catch (error) {
    console.error('Error fetching shared images:', error);
    throw error;
  }
}

// Get a specific shared image by ID
export async function getSharedImageById(id: string): Promise<SharedImage | null> {
  try {
    const { data, error } = await supabase
      .from('shared_images')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching shared image:', error);
    return null;
  }
}

// Upload a new shared image (available for ALL uses)
export async function uploadSharedImage(upload: SharedImageUpload): Promise<SharedImage> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const fileExt = upload.file.name.split('.').pop();
    const filename = `${timestamp}-${randomSuffix}.${fileExt}`;
    const storagePath = `shared-images/${filename}`;

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('screenshots')
      .upload(storagePath, upload.file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('screenshots')
      .getPublicUrl(storagePath);

    // Get image dimensions
    const { width, height } = await getImageDimensions(upload.file);

    // Create database record
    const { data, error } = await supabase
      .from('shared_images')
      .insert({
        filename: upload.file.name,
        storage_path: storagePath,
        image_url: urlData.publicUrl,
        image_type: upload.image_type || 'general',
        file_size: upload.file.size,
        mime_type: upload.file.type as any,
        width,
        height,
        tags: upload.tags || [],
        description: upload.description
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error uploading shared image:', error);
    throw error;
  }
}

// Update a shared image (only owner or admin)
export async function updateSharedImage(
  id: string, 
  updates: Partial<Pick<SharedImage, 'tags' | 'description' | 'is_active'>>
): Promise<SharedImage> {
  try {
    const { data, error } = await supabase
      .from('shared_images')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating shared image:', error);
    throw error;
  }
}

// Delete a shared image (only owner or admin)
export async function deleteSharedImage(id: string): Promise<void> {
  try {
    // Get image info first
    const image = await getSharedImageById(id);
    if (!image) throw new Error('Image not found');

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('screenshots')
      .remove([image.storage_path]);

    if (storageError) throw storageError;

    // Delete from database
    const { error } = await supabase
      .from('shared_images')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting shared image:', error);
    throw error;
  }
}

// Increment usage count when image is used
export async function incrementImageUsage(imageId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('increment_image_usage', {
      image_id: imageId
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error incrementing image usage:', error);
    // Don't throw - usage tracking is not critical
  }
}

// Get image display info (URL + fallback handling)
export async function getImageDisplayInfo(
  iconImageId?: string | null,
  iconFallback?: string | null
): Promise<ImageDisplayInfo> {
  try {
    if (iconImageId) {
      const { data, error } = await supabase.rpc('get_image_display_info', {
        p_icon_image_id: iconImageId,
        p_icon_fallback: iconFallback
      });

      if (error) throw error;
      
      if (data && data.length > 0) {
        return data[0];
      }
    }

    // Fallback to text icon
    return {
      image_url: undefined,
      is_image: false,
      display_value: iconFallback || ''
    };
  } catch (error) {
    console.error('Error getting image display info:', error);
    return {
      image_url: undefined,
      is_image: false,
      display_value: iconFallback || ''
    };
  }
}

// Get popular/recommended images for quick selection
export async function getPopularImages(limit: number = 20): Promise<SharedImageWithStats[]> {
  try {
    const { data, error } = await supabase
      .from('shared_images_with_stats')
      .select('*')
      .eq('is_active', true)
      .order('usage_count', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching popular images:', error);
    return [];
  }
}

// Get recent images for quick selection
export async function getRecentImages(limit: number = 20): Promise<SharedImageWithStats[]> {
  try {
    const { data, error } = await supabase
      .from('shared_images_with_stats')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching recent images:', error);
    return [];
  }
}

// Search images by tags (helper function)
export async function searchImagesByTags(tags: string[], limit: number = 50): Promise<SharedImageWithStats[]> {
  try {
    const { data, error } = await supabase
      .from('shared_images_with_stats')
      .select('*')
      .eq('is_active', true)
      .overlaps('tags', tags)
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching images by tags:', error);
    return [];
  }
}

// Utility function to get image dimensions
async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Validate image file
export function validateImageFile(file: File): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('File must be JPEG, PNG, WebP, or GIF');
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push('File size must be less than 5MB');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
} 