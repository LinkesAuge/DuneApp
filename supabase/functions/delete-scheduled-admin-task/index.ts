// @deno-types="npm:@supabase/supabase-js@2.43.4"
import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2.43.4'; // Specify version
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts'; // Import shared CORS headers

console.log("Delete Scheduled Admin Task function booting up!");

serve(async (req: Request) => {
  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Server configuration error: Missing Supabase credentials.');
      return new Response(JSON.stringify({ error: 'Server configuration error.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Corrected Supabase Admin Client Initialization
    // Use only URL and Service Role Key, do not pass client's Authorization header.
    const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { jobName } = await req.json();

    if (!jobName) {
      return new Response(JSON.stringify({ error: 'Missing jobName parameter' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log(`Attempting to delete scheduled task: ${jobName} using Supabase client initialized with service role.`);

    const { error: rpcError, data: rpcData } = await supabaseAdmin.rpc('unschedule_cron_job', {
      job_name_to_delete: jobName,
    });

    if (rpcError) {
      console.error(`Error unscheduling job ${jobName} via RPC:`, JSON.stringify(rpcError, null, 2)); // Log full error
      // Provide a more specific error message if possible
      let detailedErrorMessage = rpcError.message;
      if (rpcError.details) detailedErrorMessage += ` Details: ${rpcError.details}`;
      if (rpcError.hint) detailedErrorMessage += ` Hint: ${rpcError.hint}`;
      throw new Error(`Database error unscheduling job: ${detailedErrorMessage}`);
    }

    console.log(`Job ${jobName} unscheduled successfully via RPC. Response:`, rpcData);

    let successMessage = `Scheduled task '${jobName}' processed.`;
    if (typeof rpcData === 'boolean') {
      if (rpcData === true) {
        successMessage = `Scheduled task '${jobName}' was successfully unscheduled (or was not found).`;
      } else {
        // This case implies the SQL function returned false, meaning it encountered an issue
        // or could not confirm the job was unscheduled, even if no explicit rpcError occurred.
        successMessage = `Attempted to process task '${jobName}'. The database function reported an issue or could not confirm the task is unscheduled. Please verify. (Result: false)`;
      }
    } else {
      // Fallback for unexpected rpcData types
      successMessage = `Scheduled task '${jobName}' processed with an unexpected result: ${rpcData}.`;
    }

    return new Response(JSON.stringify({ 
        message: successMessage,
        details: rpcData // Keep details for debugging if needed
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Error in delete-scheduled-admin-task function:', error.message, error.stack ? { stack: error.stack } : {});
    return new Response(JSON.stringify({ error: error.message || 'An unexpected error occurred' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: error.status || 500,
    });
  }
}); 