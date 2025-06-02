import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configuration - separate backup folders for each map type
const BACKUP_BUCKET = 'screenshots';
const DEEP_DESERT_BACKUPS_FOLDER = 'map-backups/deep-desert/';
const HAGGA_BASIN_BACKUPS_FOLDER = 'map-backups/hagga-basin/';
const COMBINED_BACKUPS_FOLDER = 'map-backups/combined/'; // For "both" map type backups
const SIGNED_URL_EXPIRY = 60 * 5; // 5 minutes

interface BackupMetadata {
  database?: {
    grid_squares: number;
    pois: number;
    comments: number;
  };
  files?: {
    grid_screenshots: number;
    poi_screenshots: number;
    comment_screenshots: number;
    custom_icons: number;
  };
  mapType?: string;
  timestamp?: string;
  formatVersion?: 'v1' | 'v2'; // v1 = legacy format, v2 = enhanced format
}

interface StoredBackupFile {
  name: string;
  id: string; 
  created_at: string;
  size: number; 
  mime_type?: string;
  downloadUrl?: string; 
  fullPath: string; 
  mapType: 'deep_desert' | 'hagga_basin' | 'combined';
  metadata?: BackupMetadata;
}

interface BackupsByType {
  deep_desert: StoredBackupFile[];
  hagga_basin: StoredBackupFile[];
  combined: StoredBackupFile[];
}

// Extract metadata from backup file content
async function extractBackupMetadata(supabaseAdmin: SupabaseClient, filePath: string): Promise<BackupMetadata | null> {
  try {
    // Download the backup file content
    const { data, error } = await supabaseAdmin.storage
      .from(BACKUP_BUCKET)
      .download(filePath);

    if (error) {
      console.warn(`Failed to download backup for metadata extraction: ${filePath}`, error);
      return null;
    }

    if (!data) {
      console.warn(`No data received for backup file: ${filePath}`);
      return null;
    }

    // Parse JSON content
    const content = await data.text();
    const backupData = JSON.parse(content);
    
    // Determine format version and extract metadata
    const metadata: BackupMetadata = {
      timestamp: backupData.timestamp,
      mapType: backupData.mapType
    };

    if (backupData.database && backupData.files) {
      // Enhanced format (v2)
      metadata.formatVersion = 'v2';
      metadata.database = {
        grid_squares: backupData.database.grid_squares?.length || 0,
        pois: backupData.database.pois?.length || 0,
        comments: backupData.database.comments?.length || 0
      };
      metadata.files = {
        grid_screenshots: backupData.files.grid_screenshots?.length || 0,
        poi_screenshots: backupData.files.poi_screenshots?.length || 0,
        comment_screenshots: backupData.files.comment_screenshots?.length || 0,
        custom_icons: backupData.files.custom_icons?.length || 0
      };
    } else {
      // Legacy format (v1)
      metadata.formatVersion = 'v1';
      metadata.database = {
        grid_squares: backupData.grid_squares?.length || 0,
        pois: backupData.pois?.length || 0,
        comments: 0 // Legacy format didn't include comments
      };
      metadata.files = {
        grid_screenshots: 0,
        poi_screenshots: 0,
        comment_screenshots: 0,
        custom_icons: 0
      };
    }

    return metadata;

  } catch (err) {
    console.warn(`Error extracting metadata from ${filePath}:`, err);
    return null;
  }
}

async function listBackupsFromFolder(
  supabaseAdmin: SupabaseClient, 
  folder: string, 
  mapType: 'deep_desert' | 'hagga_basin' | 'combined'
): Promise<StoredBackupFile[]> {

  const { data: files, error: listError } = await supabaseAdmin.storage
    .from(BACKUP_BUCKET)
    .list(folder, {
      limit: 10, // Get the 10 most recent per folder
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (listError) {
    console.error(`Error listing backup files from ${folder}:`, listError);
    return []; // Return empty array instead of throwing, so other folders can still be processed
  }

  if (!files || files.length === 0) {
    return [];
  }

  const backupsWithUrls = await Promise.all(
    files
      .filter(file => file.name !== '.emptyFolderPlaceholder')
      .map(async (file) => {
        const filePath = `${folder}${file.name}`;
        
        // Generate signed URL
        const { data: urlData, error: urlError } = await supabaseAdmin.storage
          .from(BACKUP_BUCKET)
          .createSignedUrl(filePath, SIGNED_URL_EXPIRY, {
            download: file.name,
          });

        // Extract backup metadata
        const metadata = await extractBackupMetadata(supabaseAdmin, filePath);

        const result = { 
          ...file, 
          fullPath: filePath, 
          downloadUrl: urlError ? null : urlData?.signedUrl, 
          mapType,
          size: (file as any).metadata?.size || file.size || 0,
          metadata
        };

        if (urlError) {
          console.error(`Error creating signed URL for ${filePath}:`, urlError);
        }
        
        return result;
      })
  );

  return backupsWithUrls as StoredBackupFile[];
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Server configuration error: Missing Supabase credentials.');
      return new Response(JSON.stringify({ error: 'Server configuration error.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header is missing.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }
    
    const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // List backups from all three folders
    const [deepDesertBackups, haggaBasinBackups, combinedBackups] = await Promise.all([
      listBackupsFromFolder(supabaseAdmin, DEEP_DESERT_BACKUPS_FOLDER, 'deep_desert'),
      listBackupsFromFolder(supabaseAdmin, HAGGA_BASIN_BACKUPS_FOLDER, 'hagga_basin'),
      listBackupsFromFolder(supabaseAdmin, COMBINED_BACKUPS_FOLDER, 'combined')
    ]);

    const backupsByType: BackupsByType = {
      deep_desert: deepDesertBackups,
      hagga_basin: haggaBasinBackups,
      combined: combinedBackups
    };

    return new Response(JSON.stringify({ backupsByType }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error in list-map-backups function:', error);
    return new Response(JSON.stringify({ error: error.message || 'An unexpected error occurred' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: error.status || 500,
    });
  }
}); 