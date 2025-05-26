import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    // Use imported corsHeaders for the OPTIONS response
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Verify authentication and admin status
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Extract the JWT token and remove 'Bearer ' prefix if present
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    // Verify the user is an admin
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError) {
      console.error('User verification error:', userError);
      throw new Error('Invalid authentication token');
    }

    if (!user) {
      throw new Error('User not found');
    }

    // Get the user's profile and verify admin role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      throw new Error('Failed to verify user role');
    }

    if (!profile || profile.role !== 'admin') {
      throw new Error('Only administrators can perform this action');
    }

    // Get operation type from request
    const { operation, data: backupData } = await req.json();

    if (operation === 'backup') {
      // Fetch all data
      const [gridSquares, pois] = await Promise.all([
        supabaseAdmin.from('grid_squares').select('*'),
        supabaseAdmin.from('pois').select('*'),
      ]);

      if (gridSquares.error) throw gridSquares.error;
      if (pois.error) throw pois.error;

      const backup = {
        timestamp: new Date().toISOString(),
        grid_squares: gridSquares.data,
        pois: pois.data,
      };

      return new Response(
        JSON.stringify({ success: true, data: backup }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } 
    else if (operation === 'restore') {
      if (!backupData || !backupData.grid_squares || !backupData.pois) {
        throw new Error('Invalid backup data format');
      }

      // Delete existing data first
      const { error: poisDeleteError } = await supabaseAdmin
        .from('pois')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (poisDeleteError) throw poisDeleteError;

      const { error: gridDeleteError } = await supabaseAdmin
        .from('grid_squares')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (gridDeleteError) throw gridDeleteError;

      // Insert backup data
      // Fetch all current profile IDs to validate against
      const { data: existingProfiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('id');

      if (profilesError) {
        console.error('Error fetching existing profiles:', profilesError);
        throw new Error('Failed to fetch existing user profiles during restore.');
      }

      const existingProfileIds = new Set(existingProfiles.map(p => p.id));
      
      const validGridSquares = backupData.grid_squares.map(gs => {
        if (gs.uploaded_by && !existingProfileIds.has(gs.uploaded_by)) {
          console.warn(`User ID ${gs.uploaded_by} not found for grid_square ${gs.id}. Setting uploaded_by to null.`);
          return { ...gs, uploaded_by: null };
        }
        return gs;
      }).filter(gs => gs !== null); // In case we decide to filter out instead of nullifying

      const { error: gridInsertError } = await supabaseAdmin
        .from('grid_squares')
        .insert(validGridSquares);

      if (gridInsertError) throw gridInsertError;

      const { error: poisInsertError } = await supabaseAdmin
        .from('pois')
        .insert(backupData.pois);

      if (poisInsertError) throw poisInsertError;

      return new Response(
        JSON.stringify({ success: true, message: 'Backup restored successfully' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
    else if (operation === 'reset') {
      // Delete all POIs first (due to foreign key constraints)
      const { error: poisError } = await supabaseAdmin
        .from('pois')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (poisError) throw poisError;

      // Delete all grid squares
      const { error: gridError } = await supabaseAdmin
        .from('grid_squares')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (gridError) throw gridError;

      return new Response(
        JSON.stringify({ success: true, message: 'Map reset successfully' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Ensure this case also has CORS headers on its error response
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid operation' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});