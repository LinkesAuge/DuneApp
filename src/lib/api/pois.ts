import { supabase } from '../supabase';

// Admin client for operations that need to bypass RLS
const supabaseAdmin = supabase;

// Supabase URL for direct URL verification
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
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
 * Comprehensive POI deletion with cleanup of all related data
 * This function handles:
 * 1. POI screenshots deletion from storage (both original and cropped versions)
 * 2. Comments and their screenshots deletion (both original and cropped versions)
 * 3. Entity links deletion
 * 4. POI deletion from database
 */
export const deletePOIWithCleanup = async (poiId: string) => {
  const errors: string[] = [];
  
  try {
    // Check current user and permissions
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('[deletePOIWithCleanup] 👤 Current user:', { 
      id: user?.id, 
      email: user?.email,
      role: user?.role,
      user_metadata: user?.user_metadata 
    });
    
    // Step 1: Fetch POI data to get screenshots
    console.log('[deletePOIWithCleanup] 🔍 Fetching POI data for ID:', poiId);
    
    const { data: poi, error: poiError } = await supabase
      .from('pois')
      .select('*, screenshots')
      .eq('id', poiId)
      .single();

    if (poiError) {
      throw new Error(`Failed to fetch POI data: ${poiError.message}`);
    }
    
    console.log('[deletePOIWithCleanup] 📄 Fetched POI data:', poi);
    console.log('[deletePOIWithCleanup] 📸 Screenshots found:', poi.screenshots);

    // Step 2: Delete POI screenshots from storage (both original and cropped)
    console.log('[deletePOIWithCleanup] 🗂️ Processing POI screenshots for deletion...');
    
    if (poi.screenshots && Array.isArray(poi.screenshots)) {
      console.log('[deletePOIWithCleanup] 📸 Found', poi.screenshots.length, 'screenshots to process');
      
      const originalFilesToDelete: string[] = [];
      const croppedFilesToDelete: string[] = [];
      
      for (const screenshot of poi.screenshots) {
        console.log('[deletePOIWithCleanup] 🔍 Processing screenshot:', screenshot);
        
        // Delete cropped/display version
        if (screenshot.url) {
          const croppedPath = extractStorageFilePath(screenshot.url);
          console.log('[deletePOIWithCleanup] 📷 Cropped URL:', screenshot.url, '→ Path:', croppedPath);
          if (croppedPath) {
            croppedFilesToDelete.push(croppedPath);
          }
        }
        
        // Delete original version
        if (screenshot.original_url) {
          const originalPath = extractStorageFilePath(screenshot.original_url);
          console.log('[deletePOIWithCleanup] 📸 Original URL:', screenshot.original_url, '→ Path:', originalPath);
          if (originalPath) {
            originalFilesToDelete.push(originalPath);
          }
        }
      }
      
      console.log('[deletePOIWithCleanup] 📋 Files to delete:', {
        cropped: croppedFilesToDelete,
        original: originalFilesToDelete
      });

      // Delete cropped files
      if (croppedFilesToDelete.length > 0) {
        console.log('[deletePOIWithCleanup] 🗑️ Attempting to delete', croppedFilesToDelete.length, 'cropped files...');
        
        console.log('[deletePOIWithCleanup] 📤 Sending deletion request for paths:', croppedFilesToDelete);
        console.log('[deletePOIWithCleanup] 🔑 Current user is POI owner, should have delete permissions...');
        
        // Try deletion with detailed error logging
        const { data: croppedDeleteResult, error: croppedStorageError } = await supabase.storage
          .from('screenshots')
          .remove(croppedFilesToDelete);
          
        console.log('[deletePOIWithCleanup] 📋 Raw deletion response:', {
          data: croppedDeleteResult,
          error: croppedStorageError,
          requestedPaths: croppedFilesToDelete
        });
        
        console.log('[deletePOIWithCleanup] 📋 Cropped deletion result:', { data: croppedDeleteResult, error: croppedStorageError });
        
        // REAL VERIFICATION: Check if files are actually gone via public URL
        if (!croppedStorageError && croppedFilesToDelete.length > 0) {
          console.log('[deletePOIWithCleanup] 🔍 REAL VERIFICATION: Checking if files still exist via public URLs...');
          
          for (const path of croppedFilesToDelete) {
            try {
              // Reconstruct the public URL to test if file still exists
              const publicUrl = `${supabaseUrl}/storage/v1/object/public/screenshots/${path}`;
              console.log(`[deletePOIWithCleanup] 🌐 Testing public URL: ${publicUrl}`);
              
              const response = await fetch(publicUrl, { method: 'HEAD' });
              
              if (response.ok) {
                console.log(`[deletePOIWithCleanup] ❌ FILE STILL EXISTS: ${path} (Status: ${response.status})`);
                errors.push(`File still accessible after deletion: ${path}`);
              } else {
                console.log(`[deletePOIWithCleanup] ✅ File successfully deleted: ${path} (Status: ${response.status})`);
              }
            } catch (fetchErr) {
              console.log(`[deletePOIWithCleanup] ✅ File successfully deleted (network error expected): ${path}`, fetchErr);
            }
          }
        }
        
        if (croppedStorageError) {
          console.error('[deletePOIWithCleanup] ❌ Error deleting POI cropped screenshots from storage:', croppedStorageError);
          errors.push(`Failed to delete some POI cropped screenshots: ${croppedStorageError.message}`);
        } else {
          console.log('[deletePOIWithCleanup] ✅ Successfully deleted', croppedFilesToDelete.length, 'cropped files');
        }
      } else {
        console.log('[deletePOIWithCleanup] ℹ️ No cropped files to delete');
      }

      // Delete original files
      if (originalFilesToDelete.length > 0) {
        console.log('[deletePOIWithCleanup] 🗑️ Attempting to delete', originalFilesToDelete.length, 'original files...');
        
        const { data: originalDeleteResult, error: originalStorageError } = await supabase.storage
          .from('screenshots')
          .remove(originalFilesToDelete);
        
        console.log('[deletePOIWithCleanup] 📋 Original deletion result:', { data: originalDeleteResult, error: originalStorageError });
        
        if (originalStorageError) {
          console.error('[deletePOIWithCleanup] ❌ Error deleting POI original screenshots from storage:', originalStorageError);
          errors.push(`Failed to delete some POI original screenshots: ${originalStorageError.message}`);
        } else {
          console.log('[deletePOIWithCleanup] ✅ Successfully deleted', originalFilesToDelete.length, 'original files');
        }
      } else {
        console.log('[deletePOIWithCleanup] ℹ️ No original files to delete');
      }
    } else {
      console.log('[deletePOIWithCleanup] ⚠️ No screenshots array found for POI');
    }

    // Step 3: Fetch and delete comment screenshots (both original and cropped)
    // Try to fetch with original_url first, fallback if column doesn't exist
    let comments: any = null;
    let commentsError: any = null;
    
    try {
      const result = await supabase
        .from('comments')
        .select(`
          id,
          screenshots:comment_screenshots(url, original_url)
        `)
        .eq('poi_id', poiId);
      
      comments = result.data;
      commentsError = result.error;
    } catch (error: any) {
      // If original_url column doesn't exist, fallback to basic query
      if (error.message?.includes('original_url') || error.message?.includes('column')) {
        const fallbackResult = await supabase
          .from('comments')
          .select(`
            id,
            screenshots:comment_screenshots(url)
          `)
          .eq('poi_id', poiId);
        
        comments = fallbackResult.data;
        commentsError = fallbackResult.error;
      } else {
        commentsError = error;
      }
    }

    if (commentsError) {
      console.error('Error fetching comments for cleanup:', commentsError);
      errors.push(`Failed to fetch comments for cleanup: ${commentsError.message}`);
    } else if (comments && comments.length > 0) {
      // Collect all comment screenshot files (both original and cropped)
      const commentCroppedFilesToDelete: string[] = [];
      const commentOriginalFilesToDelete: string[] = [];
      
      for (const comment of comments) {
        if (comment.screenshots && Array.isArray(comment.screenshots)) {
          for (const screenshot of comment.screenshots) {
            // Delete cropped/display version
            if (screenshot.url) {
              const croppedPath = extractStorageFilePath(screenshot.url);
              if (croppedPath) {
                commentCroppedFilesToDelete.push(croppedPath);
              }
            }
            
            // Delete original version
            if (screenshot.original_url) {
              const originalPath = extractStorageFilePath(screenshot.original_url);
              if (originalPath) {
                commentOriginalFilesToDelete.push(originalPath);
              }
            }
          }
        }
      }

      // Delete comment cropped screenshot files from storage
      if (commentCroppedFilesToDelete.length > 0) {
        const { error: commentCroppedStorageError } = await supabase.storage
          .from('screenshots')
          .remove(commentCroppedFilesToDelete);
        
        if (commentCroppedStorageError) {
          console.error('Error deleting comment cropped screenshots from storage:', commentCroppedStorageError);
          errors.push(`Failed to delete some comment cropped screenshots: ${commentCroppedStorageError.message}`);
        }
      }

      // Delete comment original screenshot files from storage
      if (commentOriginalFilesToDelete.length > 0) {
        const { error: commentOriginalStorageError } = await supabase.storage
          .from('screenshots')
          .remove(commentOriginalFilesToDelete);
        
        if (commentOriginalStorageError) {
          console.error('Error deleting comment original screenshots from storage:', commentOriginalStorageError);
          errors.push(`Failed to delete some comment original screenshots: ${commentOriginalStorageError.message}`);
        }
      }

      // Delete comment screenshots from database
      const { error: commentScreenshotsDbError } = await supabase
        .from('comment_screenshots')
        .delete()
        .in('comment_id', comments.map(c => c.id));

      if (commentScreenshotsDbError) {
        console.error('Error deleting comment screenshots from database:', commentScreenshotsDbError);
        errors.push(`Failed to delete comment screenshots from database: ${commentScreenshotsDbError.message}`);
      }
    }

    // Step 4: Delete comments from database
    const { error: deleteCommentsError } = await supabase
      .from('comments')
      .delete()
      .eq('poi_id', poiId);

    if (deleteCommentsError) {
      console.error('Error deleting comments:', deleteCommentsError);
      errors.push(`Failed to delete comments: ${deleteCommentsError.message}`);
    }

    // Step 5: Delete entity links
    const { error: deleteLinksError } = await supabase
      .from('poi_entity_links')
      .delete()
      .eq('poi_id', poiId);

    if (deleteLinksError) {
      console.error('Error deleting entity links:', deleteLinksError);
      errors.push(`Failed to delete entity links: ${deleteLinksError.message}`);
    }

    // Step 6: Delete the POI itself
    const { error: deletePoiError } = await supabase
      .from('pois')
      .delete()
      .eq('id', poiId);

    if (deletePoiError) {
      throw new Error(`Failed to delete POI: ${deletePoiError.message}`);
    }

    // Return success with any non-critical errors
    return {
      success: true,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error: any) {
    console.error('Critical error in POI deletion:', error);
    return {
      success: false,
      error: error.message,
      errors: errors.length > 0 ? errors : undefined
    };
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
      // New structure
      '/storage/v1/object/public/screenshots/poi_screenshots_original/',
      '/storage/v1/object/public/screenshots/poi_screenshots_cropped/',
      '/storage/v1/object/public/screenshots/comment_screenshots_original/',
      '/storage/v1/object/public/screenshots/comment_screenshots_cropped/',
      // Legacy structure
      '/storage/v1/object/public/screenshots/poi_originals/',
      '/storage/v1/object/public/screenshots/poi_screenshots/',
      '/storage/v1/object/public/screenshots/comment-screenshots/',
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
            console.log(`[extractStorageFilePath] 🎯 Pattern matched: ${pattern} → After screenshots: ${afterScreenshots} → Result: ${result}`);
            return result;
          } else {
            // Fallback for other patterns
            const folderName = pattern.split('/').pop() || '';
            const result = folderName ? `${folderName}${parts[1]}` : parts[1];
            console.log(`[extractStorageFilePath] 🎯 Pattern matched: ${pattern} → Folder: ${folderName} → Result: ${result}`);
            return result;
          }
        }
      }
    }

    // Handle relative paths
    const relativePatterns = [
      '/screenshots/poi_screenshots_original/',
      '/screenshots/poi_screenshots_cropped/',
      '/screenshots/comment_screenshots_original/',
      '/screenshots/comment_screenshots_cropped/',
      '/screenshots/poi_originals/',
      '/screenshots/poi_screenshots/',
      '/screenshots/comment-screenshots/',
      '/screenshots/'
    ];

    for (const pattern of relativePatterns) {
      if (url.includes(pattern)) {
        const parts = url.split(pattern);
        if (parts.length > 1) {
          const folderName = pattern.split('/').filter(p => p).pop() || '';
          const result = folderName ? `${folderName}/${parts[1]}` : parts[1];
          console.log(`[extractStorageFilePath] 🎯 Relative pattern matched: ${pattern} → Folder: ${folderName} → Result: ${result}`);
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