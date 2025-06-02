// @deno-types="npm:@supabase/supabase-js@2.43.4"
import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2.43.4';
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

// Corrected Configuration to match list-map-backups and perform-map-backup (Option B)
const BACKUP_BUCKET = 'screenshots';
const BACKUP_FOLDER = 'map-backups/scheduled';

serve(async (req: Request) => {
  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { fileName } = await req.json();
    if (!fileName) {
      console.warn('fileName parameter is missing from request body');
      return new Response(JSON.stringify({ error: 'Missing fileName parameter' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Initialize Supabase client for admin operations
    // Do NOT pass the client's Authorization header when using the service role key
    const supabaseAdmin: SupabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const filePath = `${BACKUP_FOLDER}/${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from(BACKUP_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting backup:', error);
      return new Response(JSON.stringify({ error: error.message || 'Failed to delete backup' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // If error is null, but data is empty or does not contain the file,
    // it means the file path did not match any existing files in the storage.
    // The actual fileName passed from the client is in the `fileName` variable.
    // The full path used for deletion is in the `filePath` variable.
    const wasFileActuallyDeleted = data && data.length > 0 && data.some(d => d.name === filePath);

    if (!wasFileActuallyDeleted) {
      console.warn(`File not found or not confirmed deleted from storage: ${filePath}.`);
      if (data && data.length > 0) {
        console.warn(`Supabase storage.remove returned data, but the expected file '${fileName}' was not listed in the response objects:`, JSON.stringify(data, null, 2));
      } else {
        console.warn(`Supabase storage.remove returned no data items (data was ${JSON.stringify(data)}), indicating no files were matched by the path(s) provided.`);
      }
      return new Response(JSON.stringify({ error: `File not found in storage or could not be deleted: ${fileName}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404, // Not Found
      });
    }
    

    return new Response(JSON.stringify({ message: 'Backup deletion processed successfully', details: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (e: any) { // Explicitly type e as any or unknown
    console.error('Unexpected error in delete-map-backup function:', e.message, e.stack ? { stack: e.stack } : {});
    return new Response(JSON.stringify({ error: e.message || 'An unexpected error occurred' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: e.status || 500, // Use error status if available
    });
  }
}); 