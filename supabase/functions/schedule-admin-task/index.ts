import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts'; // Import shared CORS headers
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

console.log("Schedule Admin Task function booting up!");

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
    const { taskType, time, startDate, frequency, backupBeforeReset, timezone } = await req.json();

    // Validate inputs
    if (!taskType || !time || !startDate || !frequency || !timezone) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: taskType, time, startDate, frequency, timezone" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    if (taskType === 'reset' && typeof backupBeforeReset !== 'boolean') {
      return new Response(
        JSON.stringify({ error: "Missing backupBeforeReset for reset task" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Scheduling task: ${taskType}, Time: ${time}, Start: ${startDate}, Freq: ${frequency}, TZ: ${timezone}`);

    // Use the existing SQL function `convert_to_utc_components`
    const { data: utcData, error: rpcError } = await supabaseAdmin.rpc('convert_to_utc_components', {
      local_dt_str: `${startDate} ${time}:00`, // Append seconds for SQL timestamp compatibility
      tz: timezone,
    });

    if (rpcError || !utcData || utcData.length === 0) {
      console.error('Error converting to UTC components:', rpcError);
      throw new Error('Failed to convert schedule time to UTC components: ' + (rpcError?.message || 'No data returned from RPC'));
    }

    const { utc_hour, utc_minute, utc_day_of_week } = utcData[0];
    console.log(`Converted UTC components: Hour=${utc_hour}, Minute=${utc_minute}, DayOfWeek=${utc_day_of_week}`);

    let cronExpression = '';
    if (frequency === 'daily') {
      cronExpression = `${utc_minute} ${utc_hour} * * *`;
    } else if (frequency === 'weekly') {
      cronExpression = `${utc_minute} ${utc_hour} * * ${utc_day_of_week}`;
    } else {
      throw new Error('Invalid frequency specified.');
    }

    const jobName = `scheduled_${taskType}_${new Date(startDate).toISOString().split('T')[0]}_${time.replace(':','')}` + (taskType === 'reset' && backupBeforeReset ? '_with_backup' : '');
    const functionToCall = taskType === 'backup' ? 'perform-map-backup' : (taskType === 'reset' ? 'perform-map-reset' : null);

    if (!functionToCall) {
      throw new Error('Invalid task type specified for scheduling.');
    }

    const command = `SELECT net.http_post(
      url:='${supabaseUrl}/functions/v1/${functionToCall}',
      headers:='{\"Authorization\": \"Bearer ${supabaseServiceRoleKey}\", \"Content-Type\": \"application/json\"}'::jsonb,
      body:='${taskType === 'reset' ? `{"backupBeforeReset": ${backupBeforeReset}}` : '{}'}'::jsonb
    );`;
    
    console.log(`Scheduling job: ${jobName} with CRON: ${cronExpression}`);
    console.log(`Command: ${command}`);

    // Use the existing SQL function `schedule_cron_job`
    const { error: scheduleError, data: scheduleData } = await supabaseAdmin.rpc('schedule_cron_job', {
      job_name: jobName,
      cron_expression: cronExpression,
      command: command,
    })

    if (scheduleError) {
      console.error('Error scheduling cron job via SQL function:', scheduleError)
      throw new Error(`Database error scheduling job: ${scheduleError.message}`)
    }

    console.log('Cron job scheduled successfully via SQL function:', scheduleData);

    return new Response(JSON.stringify({ 
        message: 'Task scheduled successfully', 
        details: { jobName, cronExpression, scheduledUtcHour: utc_hour, scheduledUtcMinute: utc_minute, scheduledUtcDayOfWeek: utc_day_of_week }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('Error in schedule-admin-task function:', error)
    return new Response(JSON.stringify({ error: error.message || 'An unexpected error occurred' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: error.status || 500, 
    })
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