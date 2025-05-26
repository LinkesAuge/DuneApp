import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log('Perform Map Reset function booting up...');

// Configuration (should match perform-map-backup if backup is involved)
const BACKUP_BUCKET = 'map-backups';
const BACKUPS_FOLDER = 'scheduled/';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { backupBeforeReset } = await req.json().catch(() => ({ backupBeforeReset: false }));
    console.log(`Perform map reset invoked. Backup before reset: ${backupBeforeReset}`);

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
      console.log('Backup before reset is requested. Invoking perform-map-backup function...');
      // Call the perform-map-backup function
      // Note: Direct function-to-function invocation within Supabase Edge Functions is typically done via HTTP request.
      const backupResponse = await fetch(`${supabaseUrl}/functions/v1/perform-map-backup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceRoleKey}`, // Use service key for internal call
          'Content-Type': 'application/json',
          ...corsHeaders, // Include CORS headers if the target function expects them, though less critical for internal calls
        },
        body: JSON.stringify({}), // Empty body as perform-map-backup doesn't require one from this context
      });

      console.log(`Backup function call completed. Status: ${backupResponse.status}`);

      if (!backupResponse.ok) {
        const errorBody = await backupResponse.text();
        console.error(`Backup function call failed with status ${backupResponse.status}:`, errorBody);
        throw new Error(`Failed to perform backup before reset. Status: ${backupResponse.status}, Message: ${errorBody}`);
      }
      
      // Try to parse JSON, but handle cases where it might not be JSON
      let backupResult;
      try {
        backupResult = await backupResponse.json();
        console.log('Backup performed successfully before reset. Result:', JSON.stringify(backupResult, null, 2));
      } catch (jsonError) {
        const textResult = await backupResponse.text(); // Re-read as text if JSON parsing fails
        console.warn('Failed to parse backup response as JSON. Text response:', textResult);
        // Depending on requirements, you might want to throw an error here if JSON is expected
        // For now, we'll log and proceed, assuming "ok" status was the main check
        backupResult = { warning: 'Response was not valid JSON', text: textResult }; 
      }

    } else {
      console.log('Backup before reset was not requested.');
    }

    console.log('Proceeding to delete data from pois and grid_squares tables...');

    // 1. Delete all POIs
    const { error: deletePoisError } = await supabaseAdmin.from('pois').delete().not('id', 'is', null);
    if (deletePoisError) {
      console.error('Error deleting POIs:', deletePoisError);
      throw new Error(`Failed to delete POIs: ${deletePoisError.message}`);
    }
    console.log('All POIs deleted successfully.');

    // 2. Delete all Grid Squares
    const { error: deleteGridSquaresError } = await supabaseAdmin.from('grid_squares').delete().not('id', 'is', null);
    if (deleteGridSquaresError) {
      console.error('Error deleting grid squares:', deleteGridSquaresError);
      throw new Error(`Failed to delete grid squares: ${deleteGridSquaresError.message}`);
    }
    console.log('All grid squares deleted successfully.');

    // Optionally, reset sequences or perform other cleanup if needed

    return new Response(JSON.stringify({ message: 'Map data reset completed successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error in perform-map-reset function:', error);
    return new Response(JSON.stringify({ error: error.message || 'An unexpected error occurred' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: error.status || 500,
    });
  }
}); 