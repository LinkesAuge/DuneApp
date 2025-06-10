import { supabase } from '../supabase';
import { Poi } from '../../types';

/**
 * Create a new POI
 */
export const createPOI = async (poiData: any): Promise<Poi> => {
  const { data, error } = await supabase
    .from('pois')
    .insert([poiData])
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create POI: ${error.message}`);
  }

  return data;
};

/**
 * Update an existing POI
 */
export const updatePOI = async (updatedPoi: Poi): Promise<Poi> => {
  const { data, error } = await supabase
    .from('pois')
    .update(updatedPoi)
    .eq('id', updatedPoi.id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update POI: ${error.message}`);
  }

  return data;
};

/**
 * Unified POI API with complete cleanup for screenshot system
 * Replaces legacy pois.ts with proper unified system integration
 */

/**
 * Delete POI with complete cleanup for unified screenshot system
 * Handles: POI record, screenshots (storage + database), comments, entity links
 */
export const deletePOIWithCleanup = async (poiId: string) => {
  const errors: string[] = [];
  
  try {
    // Step 1: Get POI basic data
    const { data: poi, error: poiError } = await supabase
      .from('pois')
      .select('*')
      .eq('id', poiId)
      .single();

    if (poiError) {
      throw new Error(`Failed to fetch POI data: ${poiError.message}`);
    }

    // Step 2: Get POI screenshots from unified system
    const { data: imageLinks, error: imageLinksError } = await supabase
      .from('poi_image_links')
      .select(`
        managed_images!inner(
          id,
          original_url,
          processed_url,
          crop_details
        )
      `)
      .eq('poi_id', poiId);

    if (imageLinksError) {
      errors.push(`Failed to fetch POI image links: ${imageLinksError.message}`);
    }

    const unifiedScreenshots = imageLinks?.map(link => link.managed_images).filter(Boolean) || [];

    // Step 3: Delete screenshot files from storage
    if (unifiedScreenshots.length > 0) {
      const filesToDelete: string[] = [];
      
      for (const screenshot of unifiedScreenshots) {
        if (screenshot.original_url) {
          // Extract path from original_url and add to deletion list
          const originalPath = extractStorageFilePath(screenshot.original_url);
          if (originalPath) {
            filesToDelete.push(originalPath);
          }
          
          // Also check for processed version if crop_details exists
          if (screenshot.crop_details && screenshot.processed_url) {
            const processedPath = extractStorageFilePath(screenshot.processed_url);
            if (processedPath) {
              filesToDelete.push(processedPath);
            }
          }
        }
      }

      // Delete files from storage
      if (filesToDelete.length > 0) {
        const { data: deleteResult, error: storageError } = await supabase.storage
          .from('screenshots')
          .remove(filesToDelete);
        
        if (storageError) {
          console.error('[deletePOIWithCleanup] ❌ Error deleting files from storage:', storageError);
          errors.push(`Failed to delete some screenshot files: ${storageError.message}`);
        }
      }
    }

    // Step 4: Delete POI image links
    const { error: linksError } = await supabase
      .from('poi_image_links')
      .delete()
      .eq('poi_id', poiId);

    if (linksError) {
      console.error('[deletePOIWithCleanup] ❌ Error deleting POI image links:', linksError);
      errors.push(`Failed to delete POI image links: ${linksError.message}`);
    }

    // Step 5: Delete managed_images records (if they're not used elsewhere)
    if (unifiedScreenshots.length > 0) {
      const imageIds = unifiedScreenshots.map(s => s.id);
      
      const { error: managedImagesError } = await supabase
        .from('managed_images')
        .delete()
        .in('id', imageIds);

      if (managedImagesError) {
        console.error('[deletePOIWithCleanup] ❌ Error deleting managed_images records:', managedImagesError);
        errors.push(`Failed to delete managed_images records: ${managedImagesError.message}`);
      }
    }

    // Step 6: Delete comments and their screenshots
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('id')
      .eq('poi_id', poiId);

    if (commentsError) {
      console.error('[deletePOIWithCleanup] ❌ Error fetching comments:', commentsError);
      errors.push(`Failed to fetch comments: ${commentsError.message}`);
    } else if (comments && comments.length > 0) {
      // For each comment, clean up its screenshots first
      for (const comment of comments) {
        // Get comment screenshots from comment_image_links table
        const { data: commentImageLinks, error: commentImageLinksError } = await supabase
          .from('comment_image_links')
          .select(`
            managed_images!inner(
              id,
              original_url,
              processed_url
            )
          `)
          .eq('comment_id', comment.id);

        if (commentImageLinksError) {
          console.error('[deletePOIWithCleanup] ❌ Error fetching comment image links for comment', comment.id, ':', commentImageLinksError);
          errors.push(`Failed to fetch comment image links for comment ${comment.id}: ${commentImageLinksError.message}`);
          continue;
        }

        const commentScreenshots = commentImageLinks?.map(link => link.managed_images).filter(Boolean) || [];

        // Delete comment screenshot files from storage
        if (commentScreenshots.length > 0) {
          const commentFilesToDelete: string[] = [];
          
          for (const screenshot of commentScreenshots) {
            if (screenshot.original_url) {
              const originalPath = extractStorageFilePath(screenshot.original_url);
              if (originalPath) {
                commentFilesToDelete.push(originalPath);
              }
            }
            
            if (screenshot.processed_url) {
              const processedPath = extractStorageFilePath(screenshot.processed_url);
              if (processedPath) {
                commentFilesToDelete.push(processedPath);
              }
            }
          }

          // Delete comment screenshot files from storage
          if (commentFilesToDelete.length > 0) {
            const { data: deleteResult, error: storageError } = await supabase.storage
              .from('screenshots')
              .remove(commentFilesToDelete);
            
            if (storageError) {
              console.error('[deletePOIWithCleanup] ❌ Error deleting comment screenshot files from storage:', storageError);
              errors.push(`Failed to delete comment screenshot files for comment ${comment.id}: ${storageError.message}`);
            }
          }

          // Delete comment image links
          const { error: commentLinksError } = await supabase
            .from('comment_image_links')
            .delete()
            .eq('comment_id', comment.id);

          if (commentLinksError) {
            console.error('[deletePOIWithCleanup] ❌ Error deleting comment image links for comment', comment.id, ':', commentLinksError);
            errors.push(`Failed to delete comment image links for comment ${comment.id}: ${commentLinksError.message}`);
          }

          // Delete managed_images records (if they're not used elsewhere)
          const imageIds = commentScreenshots.map(s => s.id);
          const { error: managedImagesError } = await supabase
            .from('managed_images')
            .delete()
            .in('id', imageIds);

          if (managedImagesError) {
            console.error('[deletePOIWithCleanup] ❌ Error deleting managed_images records for comment', comment.id, ':', managedImagesError);
            errors.push(`Failed to delete managed_images records for comment ${comment.id}: ${managedImagesError.message}`);
          }
        }
      }

      // Now delete the comment records themselves
      const { error: deleteCommentsError } = await supabase
        .from('comments')
        .delete()
        .eq('poi_id', poiId);

      if (deleteCommentsError) {
        console.error('[deletePOIWithCleanup] ❌ Error deleting comments:', deleteCommentsError);
        errors.push(`Failed to delete comments: ${deleteCommentsError.message}`);
      }
    }

    // Step 7: Delete entity links
    const { error: entityLinksError } = await supabase
      .from('poi_entity_links')
      .delete()
      .eq('poi_id', poiId);

    if (entityLinksError) {
      console.error('[deletePOIWithCleanup] ❌ Error deleting entity links:', entityLinksError);
      errors.push(`Failed to delete entity links: ${entityLinksError.message}`);
    }

    // Step 8: Delete the POI itself
    const { error: poiDeleteError } = await supabase
      .from('pois')
      .delete()
      .eq('id', poiId);

    if (poiDeleteError) {
      throw new Error(`Failed to delete POI: ${poiDeleteError.message}`);
    }

    return {
      success: true,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error: any) {
    console.error('[deletePOIWithCleanup] ❌ Critical error:', error);
    throw error;
  }
};

/**
 * Extract storage file path from a Supabase storage URL
 * Updated to handle multiple folder structures:
 * - poi_screenshots_original/
 * - poi_screenshots_cropped/
 * - comment_screenshots_original/
 * - comment_screenshots_cropped/
 * - Legacy: poi_originals/, poi_screenshots/, comment-screenshots/
 */
const extractStorageFilePath = (url: string): string | null => {
  try {
    // Handle both full URLs and relative paths
    const patterns = [
      // New simplified structure (current)
      '/storage/v1/object/public/screenshots/poi_screenshots/',
      '/storage/v1/object/public/screenshots/poi_cropped/',
      // Comment screenshots (all variations)
      '/storage/v1/object/public/screenshots/comment_screenshots/',
      '/storage/v1/object/public/screenshots/comment_cropped/',
      '/storage/v1/object/public/screenshots/comment-screenshots/',
      // Legacy structures (for backward compatibility)
      '/storage/v1/object/public/screenshots/poi_screenshots_original/',
      '/storage/v1/object/public/screenshots/poi_screenshots_cropped/',
      '/storage/v1/object/public/screenshots/poi_originals/',
      '/storage/v1/object/public/screenshots/comment_screenshots_original/',
      '/storage/v1/object/public/screenshots/comment_screenshots_cropped/',
      // Generic screenshots
      '/storage/v1/object/public/screenshots/'
    ];

        for (const pattern of patterns) {
      if (url.includes(pattern)) {
        const parts = url.split(pattern);
        if (parts.length > 1) {
          // For poi_screenshots and other subdirectories, keep the full path after /screenshots/
          if (pattern.includes('/screenshots/')) {
            const afterScreenshots = pattern.split('/screenshots/')[1];
            const result = afterScreenshots ? `${afterScreenshots}${parts[1]}` : parts[1];
            return result;
          } else {
            // Fallback for other patterns
            const folderName = pattern.split('/').pop() || '';
            const result = folderName ? `${folderName}${parts[1]}` : parts[1];
            return result;
          }
        }
      }
    }

    // Handle relative paths
    const relativePatterns = [
      // New simplified structure (current)
      '/screenshots/poi_screenshots/',
      '/screenshots/poi_cropped/',
      // Comment screenshots (all variations)
      '/screenshots/comment_screenshots/',
      '/screenshots/comment_cropped/',
      '/screenshots/comment-screenshots/',
      // Legacy structures (for backward compatibility)
      '/screenshots/poi_screenshots_original/',
      '/screenshots/poi_screenshots_cropped/',
      '/screenshots/poi_originals/',
      '/screenshots/comment_screenshots_original/',
      '/screenshots/comment_screenshots_cropped/',
      '/screenshots/'
    ];

    for (const pattern of relativePatterns) {
      if (url.includes(pattern)) {
        const parts = url.split(pattern);
        if (parts.length > 1) {
          const folderName = pattern.split('/').filter(p => p).pop() || '';
          const result = folderName ? `${folderName}/${parts[1]}` : parts[1];
          return result;
        }
      }
    }

    // Just filename
    if (!url.includes('/') && !url.includes('http')) {
      return url;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting storage file path:', error);
    return null;
  }
}; 