import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log("Perform Map Backup function booting up!");

// Configuration to match user's preferred Option B (screenshots bucket, map-backups/scheduled/ folder)
const BACKUP_BUCKET = 'screenshots'; 
const BACKUPS_FOLDER = 'map-backups/scheduled/'; 
const MAX_STORED_BACKUPS = 10;

interface BackupData {
  timestamp: string;
  grid_squares: any[];
  pois: any[];
  // Add other tables as needed
}

async function fetchAllTableData(supabaseClient: SupabaseClient, tableName: string) {
  let allData: any[] = [];
  // Simplified fetching, assuming tables are not excessively large.
  // For very large tables, implement robust pagination (keyset or offset).
  const { data, error } = await supabaseClient.from(tableName).select('*');
  if (error) {
    console.error(`Error fetching data from ${tableName}:`, error);
    throw error;
  }
  if (data) {
    allData = data;
  }
  return allData;
}

async function pruneOldBackups(supabaseClient: SupabaseClient) {
  console.log(`Pruning old backups from ${BACKUP_BUCKET}/${BACKUPS_FOLDER}, retaining last ${MAX_STORED_BACKUPS}...`);
  try {
    const { data: files, error: listError } = await supabaseClient
      .storage
      .from(BACKUP_BUCKET) // Ensure this uses the correct constant
      .list(BACKUPS_FOLDER, { // Ensure this uses the correct constant
        limit: 100, 
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }, 
      });

    if (listError) {
      console.error("Error listing backup files for pruning:", listError);
      return; // Don't let pruning failure stop the main backup process
    }

    if (files && files.length > MAX_STORED_BACKUPS) {
      const filesToDelete = files
        .slice(MAX_STORED_BACKUPS) 
        .map(file => `${BACKUPS_FOLDER}${file.name}`); 

      if (filesToDelete.length > 0) {
        console.log("Attempting to delete old backup files:", filesToDelete);
        const { data: deleteData, error: deleteError } = await supabaseClient
          .storage
          .from(BACKUP_BUCKET) // Ensure this uses the correct constant
          .remove(filesToDelete);

        if (deleteError) {
          console.error("Error deleting old backup files:", deleteError);
        } else {
          console.log("Successfully deleted old backup files:", deleteData);
        }
      }
    } else {
      console.log("No old backups to prune or within limit.");
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
    // For functions called by pg_cron, the Authorization header might be set by pg_cron itself
    // using the service_role_key. If this function can also be called by users, 
    // ensure the authHeader logic is robust.
    const authHeader = req.headers.get('Authorization') || `Bearer ${supabaseServiceRoleKey}`; 
    
    const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
        global: { headers: { Authorization: authHeader } }, // Use service key for auth via header
    });

    console.log("Starting map data backup process (fetch, store, prune)...");

    const gridSquaresData = await fetchAllTableData(supabaseAdmin, 'grid_squares');
    const poisData = await fetchAllTableData(supabaseAdmin, 'pois');

    const backupJson: BackupData = {
      timestamp: new Date().toISOString(),
      grid_squares: gridSquaresData,
      pois: poisData,
    };
    
    const backupTimestamp = backupJson.timestamp.replace(/:/g, '-').replace(/\.\d{3}Z$/, 'Z');
    const backupFileName = `backup-${backupTimestamp}.json`;
    const fullBackupPath = `${BACKUPS_FOLDER}${backupFileName}`;

    console.log(`Preparing to upload backup file: ${fullBackupPath} to bucket ${BACKUP_BUCKET}`);

    const backupBlob = new Blob([JSON.stringify(backupJson, null, 2)], { type: 'application/json' });

    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from(BACKUP_BUCKET) // Ensure this uses the correct constant
      .upload(fullBackupPath, backupBlob, {
        contentType: 'application/json',
        upsert: false // Don't overwrite if somehow a file with the exact same millisecond timestamp exists
      });

    if (uploadError) {
      console.error("Error uploading backup to Supabase Storage:", uploadError);
      throw new Error(`Failed to upload backup file: ${uploadError.message}`);
    }

    console.log("Backup file successfully uploaded:", uploadData?.path);

    // After successful backup, prune old ones
    await pruneOldBackups(supabaseAdmin);

    console.log("Backup and pruning process completed. Backup size (grid_squares):", gridSquaresData.length, "Backup size (pois):", poisData.length);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Backup created, stored in Supabase Storage, and old backups pruned successfully.", 
        backupPath: uploadData?.path 
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