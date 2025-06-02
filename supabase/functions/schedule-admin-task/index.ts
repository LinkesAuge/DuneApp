import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts'; // Import shared CORS headers
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// TODO: Securely manage environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Ensure you have run this SQL in your Supabase SQL editor to create the helper function:
/*
CREATE OR REPLACE FUNCTION schedule_cron_job(job_name TEXT, cron_expression TEXT, command TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM cron.schedule(job_name, cron_expression, command);
  RETURN 'Job ' || job_name || ' scheduled.';
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error scheduling job %: % ', job_name, SQLERRM;
    RETURN 'Failed to schedule job ' || job_name || ': ' || SQLERRM;
END;
$$;
*/

serve(async (req: Request) => {
  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

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

  // Create a Supabase client with the service role key
  const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    global: { headers: { Authorization: authHeader } },
  });

  try {
    const { taskName, edgeFunction, cronExpression, mapType } = await req.json();

    // Validate inputs
    if (!taskName || !edgeFunction || !cronExpression) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: taskName, edgeFunction, cronExpression" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate edge function
    const allowedFunctions = ['perform-map-backup', 'perform-map-reset'];
    if (!allowedFunctions.includes(edgeFunction)) {
      return new Response(
        JSON.stringify({ error: `Invalid edge function. Allowed: ${allowedFunctions.join(', ')}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate map type if provided
    if (mapType && !['deep-desert', 'hagga-basin'].includes(mapType)) {
      return new Response(
        JSON.stringify({ error: "Invalid mapType. Must be 'deep-desert' or 'hagga-basin'" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Prevent reset operations on Hagga Basin
    if (mapType === 'hagga-basin' && edgeFunction === 'perform-map-reset') {
      return new Response(
        JSON.stringify({ error: "Reset operations are not allowed on Hagga Basin" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create unique job name
    const jobName = `scheduled_${edgeFunction}_${Date.now()}`;
    
    // Build the HTTP POST command for pg_cron
    const functionPayload = mapType ? JSON.stringify({ mapType }) : '{}';
    const command = `SELECT net.http_post(
      url:='${supabaseUrl}/functions/v1/${edgeFunction}',
      headers:='{"Authorization": "Bearer ${supabaseServiceRoleKey}", "Content-Type": "application/json"}'::jsonb,
      body:='${functionPayload}'::jsonb
    );`;

    // Schedule the cron job using the schedule_cron_job RPC function
    const { error: scheduleError, data: scheduleData } = await supabaseAdmin.rpc('schedule_cron_job', {
      job_name: jobName,
      cron_expression: cronExpression,
      command: command,
    });

    if (scheduleError) {
      console.error('Error scheduling cron job:', scheduleError);
      throw new Error(`Database error scheduling job: ${scheduleError.message}`);
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Task scheduled successfully', 
      details: { 
        jobName, 
        cronExpression, 
        edgeFunction,
        mapType: mapType || 'all',
        taskName 
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error in schedule-admin-task function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'An unexpected error occurred' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: error.status || 500, 
    });
  }
});

/*
To make this work, you'd likely need a PostgreSQL function wrapper if you can't directly execute `cron.schedule` via `supabaseAdmin.sql` from an edge function due to permissions or API limitations.

Example SQL function (run this in your Supabase SQL editor once):

CREATE OR REPLACE FUNCTION schedule_cron_job(job_name TEXT, cron_expression TEXT, command TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM cron.schedule(job_name, cron_expression, command);
  RETURN 'Job ' || job_name || ' scheduled.';
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error scheduling job %: %', job_name, SQLERRM;
    RETURN 'Failed to schedule job ' || job_name || ': ' || SQLERRM;
END;
$$;

Then, in the Edge Function, you would call this RPC:
const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('schedule_cron_job', {
  job_name: jobName,
  cron_expression: cronExpression,
  command: `SELECT net.http_post(url:='${targetFunctionUrl}', headers:='{"Authorization": "Bearer ${supabaseServiceRoleKey}"}'::jsonb, body:='${JSON.stringify(functionPayload)}'::jsonb)`
});

*/ 