import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Configuration
const BACKUP_BUCKET = 'screenshots';
const DEEP_DESERT_BACKUPS_FOLDER = 'map-backups/deep-desert/';
const HAGGA_BASIN_BACKUPS_FOLDER = 'map-backups/hagga-basin/';

type MapType = 'deep_desert' | 'hagga_basin';

// Helper function to extract file path from Supabase Storage URL
const extractStorageFilePath = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    // Extract path after '/storage/v1/object/public/{bucket}/'
    const pathParts = urlObj.pathname.split('/');
    const bucketIndex = pathParts.indexOf('public') + 1;
    if (bucketIndex > 0 && bucketIndex < pathParts.length) {
      return pathParts.slice(bucketIndex + 1).join('/'); // Skip bucket name too
    }
    return null;
  } catch {
    return null;
  }
};

// Helper function to batch delete files from storage
const batchDeleteFiles = async (supabase: SupabaseClient, bucket: string, filePaths: string[]): Promise<void> => {
  if (filePaths.length === 0) return;
  
  // Delete in batches of 100 (Supabase limit)
  const batchSize = 100;
  for (let i = 0; i < filePaths.length; i += batchSize) {
    const batch = filePaths.slice(i, i + batchSize);
    const { error } = await supabase.storage.from(bucket).remove(batch);
    if (error) {
      console.error(`Error deleting batch ${i / batchSize + 1} from ${bucket}:`, error);
      // Continue with other batches even if one fails
    }
  }
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { backupBeforeReset = false, mapType = 'deep_desert' }: { backupBeforeReset?: boolean; mapType?: MapType } = await req.json().catch(() => ({}));

    // Create Supabase admin client directly
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Server configuration error: Missing Supabase credentials.');
      return new Response(JSON.stringify({ error: 'Server configuration error.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    const authHeader = req.headers.get('Authorization') || `Bearer ${supabaseServiceRoleKey}`; 
    
    const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
        global: { headers: { Authorization: authHeader } }, 
    });

    if (backupBeforeReset) {
      // Call the perform-map-backup function with map type
      const backupResponse = await fetch(`${supabaseUrl}/functions/v1/perform-map-backup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceRoleKey}`,
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
        body: JSON.stringify({ mapType: mapType }),
      });

      if (!backupResponse.ok) {
        const errorBody = await backupResponse.text();
        console.error(`Backup function call failed with status ${backupResponse.status}:`, errorBody);
        throw new Error(`Failed to perform backup before reset. Status: ${backupResponse.status}, Message: ${errorBody}`);
      }
      
      try {
        const backupResult = await backupResponse.json();
      } catch (jsonError) {
        const textResult = await backupResponse.text();
        console.warn('Failed to parse backup response as JSON. Text response:', textResult);
        // Continue with reset even if backup response parsing fails
      }
    }

    // Storage cleanup: Collect all files that need to be deleted before removing database records
    const filesToDelete: string[] = [];

    // 1. Collect POI screenshot files from unified image system
    const { data: poisData, error: poisQueryError } = await supabaseAdmin
      .from('pois')
      .select(`
        id,
        poi_image_links (
          managed_images (
            original_url,
            processed_url
          )
        )
      `)
      .eq('map_type', mapType);

    if (poisQueryError) {
      console.error(`Error querying ${mapType} POIs for storage cleanup:`, poisQueryError);
      // Continue without POI storage cleanup rather than failing entirely
    } else if (poisData) {
      for (const poi of poisData) {
        const imageLinks = (poi as any).poi_image_links || [];
        for (const link of imageLinks) {
          const image = link.managed_images;
          if (image?.original_url) {
            const filePath = extractStorageFilePath(image.original_url);
            if (filePath) filesToDelete.push(filePath);
          }
          if (image?.processed_url && image.processed_url !== image.original_url) {
            const filePath = extractStorageFilePath(image.processed_url);
            if (filePath) filesToDelete.push(filePath);
          }
        }
      }
    }

    // 2. Collect grid square screenshot files (only for Deep Desert)
    if (mapType === 'deep_desert') {
      const { data: gridSquaresData, error: gridSquaresQueryError } = await supabaseAdmin
        .from('grid_squares')
        .select('screenshot_url, original_screenshot_url');

      if (gridSquaresQueryError) {
        console.error('Error querying grid squares for storage cleanup:', gridSquaresQueryError);
        // Continue without grid square storage cleanup rather than failing entirely
      } else if (gridSquaresData) {
        const initialPoiFiles = filesToDelete.length;
        for (const gridSquare of gridSquaresData) {
          // Add main screenshot
          if (gridSquare.screenshot_url) {
            const filePath = extractStorageFilePath(gridSquare.screenshot_url);
            if (filePath && !filesToDelete.includes(filePath)) {
              filesToDelete.push(filePath);
            }
          }
          // Add original screenshot if different
          if (gridSquare.original_screenshot_url && 
              gridSquare.original_screenshot_url !== gridSquare.screenshot_url) {
            const filePath = extractStorageFilePath(gridSquare.original_screenshot_url);
            if (filePath && !filesToDelete.includes(filePath)) {
              filesToDelete.push(filePath);
            }
          }
        }
      }
    }

    // 3. Collect comment screenshot files from unified image system
    if (mapType === 'deep_desert') {
      // Comments for Deep Desert POIs or grid squares
      const { data: deepDesertPois, error: poisError } = await supabaseAdmin
        .from('pois')
        .select('id')
        .eq('map_type', 'deep_desert');
      
      if (poisError) {
        console.error('Error fetching Deep Desert POI IDs for comment cleanup:', poisError);
      } else {
        const poiIds = (deepDesertPois || []).map((poi: any) => poi.id);
        
        // Get comment images for these POIs or any grid square
        const { data: commentImages, error } = await supabaseAdmin
          .from('comment_image_links')
          .select(`
            managed_images (
              original_url,
              processed_url
            ),
            comments!inner (
              poi_id,
              grid_square_id
            )
          `)
          .or(`comments.poi_id.in.(${poiIds.join(',')}),comments.grid_square_id.not.is.null`);
          
        if (!error && commentImages) {
          for (const link of commentImages) {
            const image = (link as any).managed_images;
            if (image?.original_url) {
              const filePath = extractStorageFilePath(image.original_url);
              if (filePath && !filesToDelete.includes(filePath)) filesToDelete.push(filePath);
            }
            if (image?.processed_url && image.processed_url !== image.original_url) {
              const filePath = extractStorageFilePath(image.processed_url);
              if (filePath && !filesToDelete.includes(filePath)) filesToDelete.push(filePath);
            }
          }
        }
      }
    } else if (mapType === 'hagga_basin') {
      // Comments for Hagga Basin POIs only
      const { data: haggaBasinPois, error: poisError } = await supabaseAdmin
        .from('pois')
        .select('id')
        .eq('map_type', 'hagga_basin');
      
      if (poisError) {
        console.error('Error fetching Hagga Basin POI IDs for comment cleanup:', poisError);
      } else {
        const poiIds = (haggaBasinPois || []).map((poi: any) => poi.id);
        
        if (poiIds.length > 0) {
          const { data: commentImages, error } = await supabaseAdmin
            .from('comment_image_links')
            .select(`
              managed_images (
                original_url,
                processed_url
              ),
              comments!inner (
                poi_id
              )
            `)
            .in('comments.poi_id', poiIds);
            
          if (!error && commentImages) {
            for (const link of commentImages) {
              const image = (link as any).managed_images;
              if (image?.original_url) {
                const filePath = extractStorageFilePath(image.original_url);
                if (filePath && !filesToDelete.includes(filePath)) filesToDelete.push(filePath);
              }
              if (image?.processed_url && image.processed_url !== image.original_url) {
                const filePath = extractStorageFilePath(image.processed_url);
                if (filePath && !filesToDelete.includes(filePath)) filesToDelete.push(filePath);
              }
            }
          }
        }
      }
    }

    // 4. Delete all collected files from storage
    try {
      await batchDeleteFiles(supabaseAdmin, 'screenshots', filesToDelete);
    } catch (storageError) {
      console.error(`Error during storage cleanup for ${mapType}:`, storageError);
      // Continue with database deletion even if storage cleanup fails
    }

    // 5. Clean up linking tables and managed images before deleting main records
    
    // Delete POI entity links for the specific map type
    const { data: targetPois, error: targetPoisError } = await supabaseAdmin
      .from('pois')
      .select('id')
      .eq('map_type', mapType);
    
    if (!targetPoisError && targetPois) {
      const targetPoiIds = targetPois.map((poi: any) => poi.id);
      
      if (targetPoiIds.length > 0) {
        // Delete POI entity links
        const { error: deletePoiEntityLinksError } = await supabaseAdmin
          .from('poi_entity_links')
          .delete()
          .in('poi_id', targetPoiIds);
        
        if (deletePoiEntityLinksError) {
          console.error(`Error deleting POI entity links for ${mapType}:`, deletePoiEntityLinksError);
        }
        
        // Delete POI image links and associated managed images
        const { data: poiImageLinks, error: poiImageLinksError } = await supabaseAdmin
          .from('poi_image_links')
          .select('image_id')
          .in('poi_id', targetPoiIds);
        
        if (!poiImageLinksError && poiImageLinks) {
          const imageIds = poiImageLinks.map((link: any) => link.image_id);
          
          // Delete poi_image_links first
          await supabaseAdmin
            .from('poi_image_links')
            .delete()
            .in('poi_id', targetPoiIds);
          
          // Delete associated managed_images (if not referenced elsewhere)
          if (imageIds.length > 0) {
            await supabaseAdmin
              .from('managed_images')
              .delete()
              .in('id', imageIds);
          }
        }
      }
    }

    // 6. Delete comments for the specific map type
    if (mapType === 'deep_desert') {
      // Delete comments for Deep Desert POIs and grid squares
      const { data: deepDesertPois, error: poisError } = await supabaseAdmin
        .from('pois')
        .select('id')
        .eq('map_type', 'deep_desert');
      
      if (poisError) {
        console.error('Error fetching Deep Desert POI IDs for comment deletion:', poisError);
      } else {
        const poiIds = (deepDesertPois || []).map((poi: any) => poi.id);
        
        // Delete comments for these POIs or any grid square
        const { error: deleteCommentsError } = await supabaseAdmin
          .from('comments')
          .delete()
          .or(`poi_id.in.(${poiIds.join(',')}),grid_square_id.not.is.null`);
          
        if (deleteCommentsError) {
          console.error(`Error deleting comments for ${mapType}:`, deleteCommentsError);
          throw new Error(`Failed to delete comments for ${mapType}: ${deleteCommentsError.message}`);
        }
      }
    } else if (mapType === 'hagga_basin') {
      // Delete comments for Hagga Basin POIs only
      const { data: haggaBasinPois, error: poisError } = await supabaseAdmin
        .from('pois')
        .select('id')
        .eq('map_type', 'hagga_basin');
      
      if (poisError) {
        console.error('Error fetching Hagga Basin POI IDs for comment deletion:', poisError);
      } else {
        const poiIds = (haggaBasinPois || []).map((poi: any) => poi.id);
        
        if (poiIds.length > 0) {
          const { error: deleteCommentsError } = await supabaseAdmin
            .from('comments')
            .delete()
            .in('poi_id', poiIds);
            
          if (deleteCommentsError) {
            console.error(`Error deleting comments for ${mapType}:`, deleteCommentsError);
            throw new Error(`Failed to delete comments for ${mapType}: ${deleteCommentsError.message}`);
          }
        }
      }
    }

    // Clean up comment image links before deleting comments
    if (mapType === 'deep_desert') {
      const { data: deepDesertPois, error: poisError } = await supabaseAdmin
        .from('pois')
        .select('id')
        .eq('map_type', 'deep_desert');
      
      if (!poisError && deepDesertPois) {
        const poiIds = deepDesertPois.map((poi: any) => poi.id);
        
        // Get comment IDs and their image links
        const { data: commentsToDelete, error: commentsError } = await supabaseAdmin
          .from('comments')
          .select('id')
          .or(`poi_id.in.(${poiIds.join(',')}),grid_square_id.not.is.null`);
        
        if (!commentsError && commentsToDelete) {
          const commentIds = commentsToDelete.map((comment: any) => comment.id);
          
          if (commentIds.length > 0) {
            // Get and delete comment image links
            const { data: commentImageLinks } = await supabaseAdmin
              .from('comment_image_links')
              .select('image_id')
              .in('comment_id', commentIds);
            
            if (commentImageLinks) {
              const imageIds = commentImageLinks.map((link: any) => link.image_id);
              
              // Delete comment_image_links first
              await supabaseAdmin
                .from('comment_image_links')
                .delete()
                .in('comment_id', commentIds);
              
              // Delete associated managed_images
              if (imageIds.length > 0) {
                await supabaseAdmin
                  .from('managed_images')
                  .delete()
                  .in('id', imageIds);
              }
            }
          }
        }
      }
    } else if (mapType === 'hagga_basin') {
      const { data: haggaBasinPois, error: poisError } = await supabaseAdmin
        .from('pois')
        .select('id')
        .eq('map_type', 'hagga_basin');
      
      if (!poisError && haggaBasinPois) {
        const poiIds = haggaBasinPois.map((poi: any) => poi.id);
        
        if (poiIds.length > 0) {
          // Get comment IDs and their image links
          const { data: commentsToDelete, error: commentsError } = await supabaseAdmin
            .from('comments')
            .select('id')
            .in('poi_id', poiIds);
          
          if (!commentsError && commentsToDelete) {
            const commentIds = commentsToDelete.map((comment: any) => comment.id);
            
            // Get and delete comment image links
            const { data: commentImageLinks } = await supabaseAdmin
              .from('comment_image_links')
              .select('image_id')
              .in('comment_id', commentIds);
            
            if (commentImageLinks) {
              const imageIds = commentImageLinks.map((link: any) => link.image_id);
              
              // Delete comment_image_links first
              await supabaseAdmin
                .from('comment_image_links')
                .delete()
                .in('comment_id', commentIds);
              
              // Delete associated managed_images
              if (imageIds.length > 0) {
                await supabaseAdmin
                  .from('managed_images')
                  .delete()
                  .in('id', imageIds);
              }
            }
          }
        }
      }
    }

    // 7. Delete POIs for the specific map type
    const { error: deletePoisError } = await supabaseAdmin
      .from('pois')
      .delete()
      .eq('map_type', mapType);
      
    if (deletePoisError) {
      console.error(`Error deleting ${mapType} POIs:`, deletePoisError);
      throw new Error(`Failed to delete ${mapType} POIs: ${deletePoisError.message}`);
    }
    // 8. Delete grid squares (only for Deep Desert)
    if (mapType === 'deep_desert') {
      const { error: deleteGridSquaresError } = await supabaseAdmin.from('grid_squares').delete().not('id', 'is', null);
      if (deleteGridSquaresError) {
        console.error('Error deleting grid squares:', deleteGridSquaresError);
        throw new Error(`Failed to delete grid squares: ${deleteGridSquaresError.message}`);
      }
    }

    return new Response(JSON.stringify({ 
      message: `${mapType.charAt(0).toUpperCase() + mapType.slice(1)} map data reset completed successfully.`,
      mapType: mapType,
      filesDeleted: filesToDelete.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in perform-map-reset function:', (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message || 'An unexpected error occurred during map reset.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 