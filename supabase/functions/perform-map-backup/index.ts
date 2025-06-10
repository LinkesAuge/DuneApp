import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configuration - separate backup folders for each map type
const BACKUP_BUCKET = 'screenshots'; 
const DEEP_DESERT_BACKUPS_FOLDER = 'map-backups/deep-desert/'; 
const HAGGA_BASIN_BACKUPS_FOLDER = 'map-backups/hagga-basin/';
const COMBINED_BACKUPS_FOLDER = 'map-backups/combined/'; // For "both" map type backups
const MAX_STORED_BACKUPS = 10;

type MapType = 'deep_desert' | 'hagga_basin' | 'both';

interface StorageFile {
  path: string;
  data: string; // base64 encoded
  contentType: string;
  originalUrl: string;
}

interface BackupData {
  timestamp: string;
  mapType: MapType;
  database: {
    grid_squares: any[];
    pois: any[];
    comments: any[];
    poi_entity_links: any[];
  };
  files: {
    grid_screenshots: StorageFile[];
    poi_screenshots: StorageFile[];
    comment_screenshots: StorageFile[];
    custom_icons: StorageFile[];
  };
}

// Extract storage path from Supabase URL
function extractStoragePath(url: string): string | null {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/storage/v1/object/public/screenshots/');
    return pathParts.length > 1 ? pathParts[1] : null;
  } catch {
    return null;
  }
}

// Download file from storage and convert to base64
async function downloadFileAsBase64(supabaseClient: SupabaseClient, filePath: string, originalUrl: string): Promise<StorageFile | null> {
  try {
    const { data, error } = await supabaseClient.storage
      .from('screenshots')
      .download(filePath);

    if (error) {
      console.warn(`Failed to download ${filePath}:`, error.message);
      return null;
    }

    if (!data) {
      console.warn(`No data received for ${filePath}`);
      return null;
    }

    // Convert blob to base64
    const arrayBuffer = await data.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    // Determine content type
    const contentType = data.type || 'application/octet-stream';
    
    return {
      path: filePath,
      data: base64,
      contentType,
      originalUrl
    };
  } catch (err) {
    console.warn(`Error downloading file ${filePath}:`, err);
    return null;
  }
}

// Collect all file URLs from database records
async function collectFileUrls(supabaseClient: SupabaseClient, data: any, mapType: MapType): Promise<{
  gridScreenshots: string[];
  poiScreenshots: string[];
  commentScreenshots: string[];
  customIcons: string[];
}> {
  const gridScreenshots: string[] = [];
  const poiScreenshots: string[] = [];
  const commentScreenshots: string[] = [];
  const customIcons: string[] = [];

  // Collect grid screenshot URLs
  if (data.grid_squares) {
    for (const square of data.grid_squares) {
      if (square.screenshot_url) {
        gridScreenshots.push(square.screenshot_url);
      }
      if (square.original_screenshot_url && square.original_screenshot_url !== square.screenshot_url) {
        gridScreenshots.push(square.original_screenshot_url);
      }
    }
  }

  // Collect POI screenshot URLs - try unified system first, fallback to legacy
  if (data.pois && data.pois.length > 0) {
    // Try unified image system first
    try {
      const poiIds = data.pois.map((poi: any) => poi.id);
      const { data: poiImageLinks, error } = await supabaseClient
        .from('poi_image_links')
        .select('poi_id, managed_images!inner(original_url, processed_url)')
        .in('poi_id', poiIds);

      if (!error && poiImageLinks && poiImageLinks.length > 0) {
        for (const link of poiImageLinks) {
          const managedImage = (link as any).managed_images;
          if (managedImage.original_url) poiScreenshots.push(managedImage.original_url);
          if (managedImage.processed_url && managedImage.processed_url !== managedImage.original_url) {
            poiScreenshots.push(managedImage.processed_url);
          }
        }
      } else {
        // Fallback to legacy system - check for direct POI image fields
        for (const poi of data.pois) {
          // Try various possible field names for POI images
          const imageFields = ['image_url', 'screenshot_url', 'original_image_url', 'cropped_image_url'];
          for (const field of imageFields) {
            if (poi[field]) {
              poiScreenshots.push(poi[field]);
            }
          }
          
          // Check for screenshots array (legacy)
          if (poi.screenshots && Array.isArray(poi.screenshots)) {
            for (const screenshot of poi.screenshots) {
              if (screenshot.url) poiScreenshots.push(screenshot.url);
              if (screenshot.original_url && screenshot.original_url !== screenshot.url) {
                poiScreenshots.push(screenshot.original_url);
              }
            }
          }
        }
      }
    } catch (unifiedError) {
      // Fallback to legacy system
      for (const poi of data.pois) {
        const imageFields = ['image_url', 'screenshot_url', 'original_image_url', 'cropped_image_url'];
        for (const field of imageFields) {
          if (poi[field]) {
            poiScreenshots.push(poi[field]);
          }
        }
      }
    }
  }

  // Collect comment screenshot URLs - try unified system first, fallback to legacy
  if (data.comments && data.comments.length > 0) {
    try {
      const commentIds = data.comments.map((comment: any) => comment.id);
      const { data: commentImageLinks, error } = await supabaseClient
        .from('comment_image_links')
        .select('comment_id, managed_images!inner(original_url, processed_url)')
        .in('comment_id', commentIds);

      if (!error && commentImageLinks && commentImageLinks.length > 0) {
        for (const link of commentImageLinks) {
          const managedImage = (link as any).managed_images;
          if (managedImage.original_url) commentScreenshots.push(managedImage.original_url);
          if (managedImage.processed_url && managedImage.processed_url !== managedImage.original_url) {
            commentScreenshots.push(managedImage.processed_url);
          }
        }
      } else {
        // Fallback to legacy system
        for (const comment of data.comments) {
          if (comment.image_url) commentScreenshots.push(comment.image_url);
          if (comment.screenshot_url) commentScreenshots.push(comment.screenshot_url);
        }
      }
    } catch (unifiedError) {
      // Fallback to legacy system
      for (const comment of data.comments) {
        if (comment.image_url) commentScreenshots.push(comment.image_url);
        if (comment.screenshot_url) commentScreenshots.push(comment.screenshot_url);
      }
    }
  }

  // Collect custom icon URLs from managed_images table
  try {
    const { data: customIconData, error } = await supabaseClient
      .from('managed_images')
      .select('original_url, processed_url')
      .eq('image_type', 'custom_icon');

    if (!error && customIconData) {
      for (const icon of customIconData) {
        if (icon.original_url) customIcons.push(icon.original_url);
        if (icon.processed_url && icon.processed_url !== icon.original_url) {
          customIcons.push(icon.processed_url);
        }
      }
    }
  } catch (customIconError) {
    // Silently handle custom icons error
  }

  return {
    gridScreenshots,
    poiScreenshots,
    commentScreenshots,
    customIcons,
  };
}

// Download files and organize by category
async function downloadAllFiles(supabaseClient: SupabaseClient, fileUrls: any): Promise<{
  grid_screenshots: StorageFile[];
  poi_screenshots: StorageFile[];
  comment_screenshots: StorageFile[];
  custom_icons: StorageFile[];
}> {
  const results = {
    grid_screenshots: [] as StorageFile[],
    poi_screenshots: [] as StorageFile[],
    comment_screenshots: [] as StorageFile[],
    custom_icons: [] as StorageFile[]
  };

  // Download grid screenshots
  for (const url of fileUrls.gridScreenshots) {
    const path = extractStoragePath(url);
    if (path) {
      const file = await downloadFileAsBase64(supabaseClient, path, url);
      if (file) results.grid_screenshots.push(file);
    }
  }

  // Download POI screenshots
  for (const url of fileUrls.poiScreenshots) {
    const path = extractStoragePath(url);
    if (path) {
      const file = await downloadFileAsBase64(supabaseClient, path, url);
      if (file) results.poi_screenshots.push(file);
    }
  }

  // Download comment screenshots
  for (const url of fileUrls.commentScreenshots) {
    const path = extractStoragePath(url);
    if (path) {
      const file = await downloadFileAsBase64(supabaseClient, path, url);
      if (file) results.comment_screenshots.push(file);
    }
  }

  // Download custom icons
  for (const url of fileUrls.customIcons) {
    const path = extractStoragePath(url);
    if (path) {
      const file = await downloadFileAsBase64(supabaseClient, path, url);
      if (file) results.custom_icons.push(file);
    }
  }

  return results;
}

async function fetchTableDataByMapType(supabaseClient: SupabaseClient, tableName: string, mapType: MapType) {
  let allData: any[] = [];

  if (tableName === 'pois') {
    if (mapType === 'both') {
      const { data, error } = await supabaseClient.from(tableName).select('*');
      if (error) {
        console.error(`Error fetching data from ${tableName}:`, error);
        throw error;
      }
      allData = data || [];
    } else {
      const { data, error } = await supabaseClient.from(tableName).select('*').eq('map_type', mapType);
      if (error) {
        console.error(`Error fetching data from ${tableName}:`, error);
        throw error;
      }
      allData = data || [];
    }
  } else if (tableName === 'grid_squares') {
    if (mapType === 'hagga_basin') {
      allData = [];
    } else {
      const { data, error } = await supabaseClient.from(tableName).select('*');
      if (error) {
        console.error(`Error fetching data from ${tableName}:`, error);
        throw error;
      }
      
      if (mapType === 'deep_desert') {
        // Filter to only Deep Desert grid coordinates (A1-I9 pattern)
        const deepDesertPattern = /^[A-I][1-9]$/;
        allData = (data || []).filter((square: any) => deepDesertPattern.test(square.coordinate));
      } else {
        allData = data || [];
      }
    }
  } else if (tableName === 'comments') {
    // Get comments related to the specific map type
    if (mapType === 'both') {
      const { data, error } = await supabaseClient.from(tableName).select('*');
      if (error) {
        console.error(`Error fetching data from ${tableName}:`, error);
        throw error;
      }
      allData = data || [];
    } else {
      // Get comments for POIs of this map type and grid squares (for deep_desert)
      if (mapType === 'deep_desert') {
        // Comments for Deep Desert POIs or grid squares
        const { data: deepDesertPois, error: poisError } = await supabaseClient
          .from('pois')
          .select('id')
          .eq('map_type', 'deep_desert');
        
        if (poisError) {
          console.error('Error fetching Deep Desert POI IDs:', poisError);
          throw poisError;
        }
        
        const poiIds = (deepDesertPois || []).map((poi: any) => poi.id);
        
        // Get comments for these POIs or any grid square
        if (poiIds.length > 0) {
          const { data, error } = await supabaseClient
            .from(tableName)
            .select('*')
            .or(`poi_id.in.(${poiIds.join(',')}),grid_square_id.not.is.null`);
            
          if (error) {
            console.error(`Error fetching comments for ${mapType}:`, error);
            throw error;
          }
          allData = data || [];
        } else {
          // No POIs, just get grid square comments
          const { data, error } = await supabaseClient
            .from(tableName)
            .select('*')
            .not('grid_square_id', 'is', null);
            
          if (error) {
            console.error(`Error fetching grid comments for ${mapType}:`, error);
            throw error;
          }
          allData = data || [];
        }
      } else if (mapType === 'hagga_basin') {
        // Comments for Hagga Basin POIs only
        const { data: haggaBasinPois, error: poisError } = await supabaseClient
          .from('pois')
          .select('id')
          .eq('map_type', 'hagga_basin');
        
        if (poisError) {
          console.error('Error fetching Hagga Basin POI IDs:', poisError);
          throw poisError;
        }
        
        const poiIds = (haggaBasinPois || []).map((poi: any) => poi.id);
        
        if (poiIds.length > 0) {
          const { data, error } = await supabaseClient
            .from(tableName)
            .select('*')
            .in('poi_id', poiIds);
            
          if (error) {
            console.error(`Error fetching comments for ${mapType}:`, error);
            throw error;
          }
          allData = data || [];
        } else {
          allData = [];
        }
      }
    }
  } else {
    // For other tables, fetch all data
    const { data, error } = await supabaseClient.from(tableName).select('*');
    if (error) {
      console.error(`Error fetching data from ${tableName}:`, error);
      throw error;
    }
    allData = data || [];
  }
  
  return allData;
}

async function pruneOldBackups(supabaseClient: SupabaseClient, folder: string) {
  try {
    const { data: files, error: listError } = await supabaseClient
      .storage
      .from(BACKUP_BUCKET)
      .list(folder, {
        limit: 100, 
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }, 
      });

    if (listError) {
      console.error("Error listing backup files for pruning:", listError);
      return;
    }

    if (files && files.length > MAX_STORED_BACKUPS) {
      const filesToDelete = files
        .slice(MAX_STORED_BACKUPS) 
        .map(file => `${folder}${file.name}`); 

      if (filesToDelete.length > 0) {
        const { data: deleteData, error: deleteError } = await supabaseClient
          .storage
          .from(BACKUP_BUCKET)
          .remove(filesToDelete);

        if (deleteError) {
          console.error("Error deleting old backup files:", deleteError);
        }
      }
    }
  } catch (err) {
    console.error("Unexpected error during backup pruning:", err);
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Server configuration error: Missing Supabase credentials.');
    return new Response(JSON.stringify({ error: 'Server configuration error.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  try {
    // Get mapType from request body, default to 'both' for backward compatibility
    const { mapType = 'both' }: { mapType?: MapType } = await req.json().catch(() => ({}));

    // For backup operations, we must use ONLY the service role key to bypass RLS policies
    // Do NOT use the user's Authorization header as that would subject queries to RLS
    const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    const gridSquaresData = await fetchTableDataByMapType(supabaseAdmin, 'grid_squares', mapType);
    const poisData = await fetchTableDataByMapType(supabaseAdmin, 'pois', mapType);
    const commentsData = await fetchTableDataByMapType(supabaseAdmin, 'comments', mapType);
    
    // Fetch POI entity links for backed up POIs
    let poiEntityLinksData: any[] = [];
    if (poisData.length > 0) {
      const poiIds = poisData.map((poi: any) => poi.id);
      
      const { data: links, error: linksError } = await supabaseAdmin
        .from('poi_entity_links')
        .select('*')
        .in('poi_id', poiIds);
      
      if (linksError) {
        console.error('Error fetching POI entity links:', linksError);
        throw linksError;
      }
      poiEntityLinksData = links || [];
    }

    // Collect all storage file URLs from the data
    const databaseData = {
      grid_squares: gridSquaresData,
      pois: poisData,
      comments: commentsData,
      poi_entity_links: poiEntityLinksData,
    };

    const fileUrls = await collectFileUrls(supabaseAdmin, databaseData, mapType);
    const downloadedFiles = await downloadAllFiles(supabaseAdmin, fileUrls);

    const backupData: BackupData = {
      timestamp: new Date().toISOString(),
      mapType,
      database: databaseData,
      files: downloadedFiles,
    };

    const fileName = `backup_${mapType}_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    
    // Use proper folder constants based on map type
    let folder: string;
    if (mapType === 'both') {
      folder = COMBINED_BACKUPS_FOLDER;
    } else if (mapType === 'deep_desert') {
      folder = DEEP_DESERT_BACKUPS_FOLDER;
    } else if (mapType === 'hagga_basin') {
      folder = HAGGA_BASIN_BACKUPS_FOLDER;
    } else {
      folder = COMBINED_BACKUPS_FOLDER; // fallback
    }
    
    const filePath = `${folder}${fileName}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(BACKUP_BUCKET)
      .upload(filePath, JSON.stringify(backupData, null, 2), {
        contentType: 'application/json',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    await pruneOldBackups(supabaseAdmin, folder);

    const totalFiles = Object.values(downloadedFiles).reduce((sum, files) => sum + files.length, 0);
    const totalRecords = Object.values(databaseData).reduce((sum, records) => sum + records.length, 0);

    const response = {
      success: true,
      message: `Backup completed successfully for ${mapType}`,
      backupFile: filePath,
      statistics: {
        totalRecords,
        totalFiles,
        breakdown: {
          database: {
            grid_squares: databaseData.grid_squares.length,
            pois: databaseData.pois.length,
            comments: databaseData.comments.length,
            poi_entity_links: databaseData.poi_entity_links.length,
          },
          files: {
            grid_screenshots: downloadedFiles.grid_screenshots.length,
            poi_screenshots: downloadedFiles.poi_screenshots.length,
            comment_screenshots: downloadedFiles.comment_screenshots.length,
            custom_icons: downloadedFiles.custom_icons.length,
          },
        },
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('BACKUP FUNCTION ERROR:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Backup failed', 
      details: error.message,
      type: error.name 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 