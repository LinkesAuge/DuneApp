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
      if (square.screenshot_url) gridScreenshots.push(square.screenshot_url);
      if (square.original_screenshot_url && square.original_screenshot_url !== square.screenshot_url) {
        gridScreenshots.push(square.original_screenshot_url);
      }
    }
  }

  // Collect POI screenshot URLs
  if (data.pois) {
    for (const poi of data.pois) {
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

  // Collect comment screenshot URLs
  if (data.comments) {
    for (const comment of data.comments) {
      // Get comment screenshots from comment_screenshots table
      const { data: commentScreenshotsData, error } = await supabaseClient
        .from('comment_screenshots')
        .select('url')
        .eq('comment_id', comment.id);
      
      if (!error && commentScreenshotsData) {
        for (const screenshot of commentScreenshotsData) {
          if (screenshot.url) commentScreenshots.push(screenshot.url);
        }
      }
    }
  }

  // Collect custom icons (only for this user's icons or system icons used by backed up POIs)
  if (data.pois) {
    // Get custom icon IDs from POIs
    const customIconIds = data.pois
      .filter((poi: any) => poi.custom_icon_id)
      .map((poi: any) => poi.custom_icon_id);
    
    if (customIconIds.length > 0) {
      const { data: customIconsData, error } = await supabaseClient
        .from('custom_icons')
        .select('image_url')
        .in('id', customIconIds);
      
      if (!error && customIconsData) {
        for (const icon of customIconsData) {
          if (icon.image_url) customIcons.push(icon.image_url);
        }
      }
    }
  }

  return {
    gridScreenshots: [...new Set(gridScreenshots)], // Remove duplicates
    poiScreenshots: [...new Set(poiScreenshots)],
    commentScreenshots: [...new Set(commentScreenshots)],
    customIcons: [...new Set(customIcons)]
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
    // Filter POIs by map_type
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
        console.error(`Error fetching data from ${tableName} for map type ${mapType}:`, error);
        throw error;
      }
      allData = data || [];
    }
  } else if (tableName === 'grid_squares') {
    if (mapType === 'hagga_basin') {
      // Hagga Basin doesn't use grid squares, return empty array
      allData = [];
    } else {
      // Deep Desert grid squares (A1-I9 pattern) or all grid squares
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
      let commentFilter = '';
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
        const { data, error } = await supabaseClient
          .from(tableName)
          .select('*')
          .or(`poi_id.in.(${poiIds.join(',')}),grid_square_id.not.is.null`);
          
        if (error) {
          console.error(`Error fetching comments for ${mapType}:`, error);
          throw error;
        }
        allData = data || [];
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

    const authHeader = req.headers.get('Authorization') || `Bearer ${supabaseServiceRoleKey}`; 
    
    const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
        global: { headers: { Authorization: authHeader } },
    });

    const gridSquaresData = await fetchTableDataByMapType(supabaseAdmin, 'grid_squares', mapType);
    const poisData = await fetchTableDataByMapType(supabaseAdmin, 'pois', mapType);
    const commentsData = await fetchTableDataByMapType(supabaseAdmin, 'comments', mapType);

    // Collect all storage file URLs from the data
    const databaseData = {
      grid_squares: gridSquaresData,
      pois: poisData,
      comments: commentsData
    };
    
    const fileUrls = await collectFileUrls(supabaseAdmin, databaseData, mapType);
    
    // Download all storage files
    const downloadedFiles = await downloadAllFiles(supabaseAdmin, fileUrls);


    const backupJson: BackupData = {
      timestamp: new Date().toISOString(),
      mapType: mapType,
      database: databaseData,
      files: downloadedFiles,
    };
    
    const backupTimestamp = backupJson.timestamp.replace(/:/g, '-').replace(/\.\d{3}Z$/, 'Z');
    const mapTypeSuffix = mapType === 'both' ? 'all-maps' : mapType;
    const backupFileName = `backup-${mapTypeSuffix}-${backupTimestamp}.json`;
    
    // Choose backup folder based on map type
    let backupFolder: string;
    if (mapType === 'deep_desert') {
      backupFolder = DEEP_DESERT_BACKUPS_FOLDER;
    } else if (mapType === 'hagga_basin') {
      backupFolder = HAGGA_BASIN_BACKUPS_FOLDER;
    } else {
      // For 'both', use combined folder
      backupFolder = COMBINED_BACKUPS_FOLDER;
    }
    
    const fullBackupPath = `${backupFolder}${backupFileName}`;

    const backupBlob = new Blob([JSON.stringify(backupJson, null, 2)], { type: 'application/json' });

    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from(BACKUP_BUCKET)
      .upload(fullBackupPath, backupBlob, {
        contentType: 'application/json',
        upsert: false
      });

    if (uploadError) {
      console.error("Error uploading backup to Supabase Storage:", uploadError);
      throw new Error(`Failed to upload backup file: ${uploadError.message}`);
    }

    // After successful backup, prune old ones from the same folder
    await pruneOldBackups(supabaseAdmin, backupFolder);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Backup created for ${mapType} maps with ${gridSquaresData.length + poisData.length + commentsData.length} database records and ${downloadedFiles.grid_screenshots.length + downloadedFiles.poi_screenshots.length + downloadedFiles.comment_screenshots.length + downloadedFiles.custom_icons.length} storage files.`, 
        backupPath: uploadData?.path,
        mapType: mapType,
        stats: {
          database: {
            grid_squares: gridSquaresData.length,
            pois: poisData.length,
            comments: commentsData.length
          },
          files: {
            grid_screenshots: downloadedFiles.grid_screenshots.length,
            poi_screenshots: downloadedFiles.poi_screenshots.length,
            comment_screenshots: downloadedFiles.comment_screenshots.length,
            custom_icons: downloadedFiles.custom_icons.length
          }
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Error in perform-map-backup function:", (error as Error).message);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "An unexpected error occurred during backup processing" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}); 