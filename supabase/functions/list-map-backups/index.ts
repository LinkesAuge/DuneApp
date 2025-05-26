import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log("List Map Backups function booting up!");

// Configuration to match user's preferred Option B
const BACKUP_BUCKET = 'screenshots';
const BACKUPS_FOLDER = 'map-backups/scheduled/'; // Path within the screenshots bucket
const SIGNED_URL_EXPIRY = 60 * 5; // 5 minutes

interface StoredBackupFile {
  name: string;
  id: string; // File object ID from storage
  created_at: string;
  size: number; // Size in bytes
  mime_type?: string;
  downloadUrl?: string; // Will be populated with a signed URL
  fullPath: string; // For internal use if needed
}

serve(async (req: Request) => {
  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
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

    console.log(`Listing files from bucket: ${BACKUP_BUCKET}, folder: ${BACKUPS_FOLDER}`);

    const { data: files, error: listError } = await supabaseAdmin.storage
      .from(BACKUP_BUCKET)
      .list(BACKUPS_FOLDER, {
        limit: 10, // Get the 10 most recent, assuming they are sorted by creation or name
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }, // Ensure we get the latest backups
      });

    if (listError) {
      console.error('Error listing backup files:', listError);
      throw new Error(`Failed to list backup files: ${listError.message}`);
    }

    if (!files || files.length === 0) {
      console.log('No backup files found in specified location.');
      return new Response(JSON.stringify({ backups: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log(`Found ${files.length} backup files. Generating signed URLs...`);

    const backupsWithUrls = await Promise.all(
      files
        .filter(file => file.name !== '.emptyFolderPlaceholder') // Filter out placeholder
        .map(async (file) => {
          const filePath = `${BACKUPS_FOLDER}${file.name}`;
          const { data: urlData, error: urlError } = await supabaseAdmin.storage
            .from(BACKUP_BUCKET)
            .createSignedUrl(filePath, SIGNED_URL_EXPIRY, {
              download: file.name, // Ensure download behavior
            });

          if (urlError) {
            console.error(`Error creating signed URL for ${filePath}:`, urlError);
            return { ...file, fullPath: filePath, downloadUrl: null, error: urlError.message }; 
          }
          return { ...file, fullPath: filePath, downloadUrl: urlData?.signedUrl, size: (file as any).metadata?.size || 0 }; 
        })
    );
    
    // Enrich with actual size from metadata if not directly available
    const enrichedBackups = backupsWithUrls.map(b => ({
        ...b,
        size: (b as any).metadata?.size || b.size || 0, // Prefer metadata.size if available
        // created_at is already part of the file object from .list()
    }));

    console.log('Returning enriched backups with signed URLs.');

    return new Response(JSON.stringify({ backups: enrichedBackups }), {
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