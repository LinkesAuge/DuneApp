import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface CronJob {
  jobid: number;
  schedule: string; // e.g., '0 2 * * *' (minute hour day_of_month month day_of_week)
  command: string;
  nodename: string;
  nodeport: number;
  database: string;
  username: string;
  active: boolean;
  jobname: string;
}

interface ScheduledTaskResponse {
  jobId: number;
  jobName: string;
  scheduleRaw: string;
  taskType: 'backup' | 'reset' | 'unknown';
  frequency: 'daily' | 'weekly' | 'custom';
  time?: string; // HH:MM (Local time, needs to be derived/approximated)
  dayOfWeek?: number; // 0-6 (Sun-Sat) if weekly
  isActive: boolean;
  originalScheduledTimeUTC?: string; // Store the original UTC time from CRON if possible
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

    const { data: cronJobs, error: fetchError } = await supabaseAdmin.rpc('get_all_cron_jobs');

    if (fetchError) {
      console.error('Error fetching cron jobs via RPC:', fetchError);
      throw new Error(`Database error fetching scheduled tasks via RPC: ${fetchError.message}`);
    }

    if (!cronJobs) {
        return new Response(JSON.stringify({ tasks: [] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }

    const tasks: ScheduledTaskResponse[] = (cronJobs as CronJob[]).map(job => {
      let taskType: 'backup' | 'reset' | 'unknown' = 'unknown';
      if (job.jobname.includes('reset')) taskType = 'reset';
      else if (job.jobname.includes('backup')) taskType = 'backup';

      const scheduleParts = job.schedule.split(' ');
      let frequency: 'daily' | 'weekly' | 'custom' = 'custom';
      let time: string | undefined = undefined;
      let dayOfWeek: number | undefined = undefined;
      let originalScheduledTimeUTC: string | undefined = undefined;

      if (scheduleParts.length === 5) {
        const minute = scheduleParts[0];
        const hour = scheduleParts[1];
        const dayOfMonth = scheduleParts[2];
        const month = scheduleParts[3];
        const cronDayOfWeek = scheduleParts[4];

        if (minute !== '*' && hour !== '*') {
          time = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
          const now = new Date();
          try {
            const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), parseInt(hour), parseInt(minute)));
            if (!isNaN(utcDate.getTime())) {
                originalScheduledTimeUTC = utcDate.toISOString();
            } else {
                originalScheduledTimeUTC = "INVALID_UTC_TIME";
            }
          } catch(e) {
            console.warn("Could not form UTC date from cron parts:", e);
            originalScheduledTimeUTC = "INVALID_UTC_TIME";
          }
        }

        if (dayOfMonth === '*' && month === '*' && cronDayOfWeek !== '*') {
          frequency = 'weekly';
          dayOfWeek = parseInt(cronDayOfWeek);
        } else if (dayOfMonth === '*' && month === '*' && cronDayOfWeek === '*') {
          frequency = 'daily';
        }
      }
      
      return {
        jobId: job.jobid,
        jobName: job.jobname,
        scheduleRaw: job.schedule,
        taskType,
        frequency,
        time,
        dayOfWeek,
        isActive: job.active,
        originalScheduledTimeUTC,
      };
    });

    return new Response(JSON.stringify({ tasks }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Error in get-scheduled-admin-tasks function:', error);
    return new Response(JSON.stringify({ error: error.message || 'An unexpected error occurred' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: error.status || 500,
    });
  }
});

/*
If direct querying of `cron.job` is problematic due to permissions, create a SQL function like this:

CREATE OR REPLACE FUNCTION get_all_cron_jobs()
RETURNS SETOF cron.job
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM cron.job;
$$;

Then, in the Edge Function, call this RPC instead of the direct table select:
const { data: cronJobs, error: fetchError } = await supabaseAdmin.rpc('get_all_cron_jobs');

*/ 