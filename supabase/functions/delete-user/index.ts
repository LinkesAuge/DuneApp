// @deno-types="npm:@supabase/supabase-js@2.43.4"
import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2.43.4';
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

console.log("Delete User function booting up!");

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
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

    // Client for checking the calling user's permissions (scoped to their JWT)
    const supabaseUserClient: SupabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } },
    });

    // Admin client for performing privileged operations (uses service_role_key)
    const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Security Check: Ensure the requesting user is an admin
    const { data: { user: requestingUser }, error: requestingUserError } = await supabaseUserClient.auth.getUser();
    
    if (requestingUserError || !requestingUser) {
      console.error('Error fetching requesting user for admin check:', requestingUserError);
      return new Response(JSON.stringify({ error: 'Failed to verify requesting user: ' + (requestingUserError?.message || 'User not identifiable from token') }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { data: requestingUserProfile, error: requestingProfileError } = await supabaseAdmin // Use admin client to read any profile
      .from('profiles')
      .select('role')
      .eq('id', requestingUser.id)
      .single();

    if (requestingProfileError || !requestingUserProfile) {
      console.error('Error fetching requesting user profile for admin check:', requestingProfileError);
      return new Response(JSON.stringify({ error: 'Failed to fetch requesting user profile: ' + (requestingProfileError?.message || 'Profile not found') }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500, 
      });
    }

    if (requestingUserProfile.role !== 'admin') {
      console.warn(`User ${requestingUser.id} with role ${requestingUserProfile.role} attempted to delete a user.`);
      return new Response(JSON.stringify({ error: 'User not allowed to perform this action.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403, // Forbidden
      });
    }
    // End Security Check

    const { userIdToDelete } = await req.json();

    if (!userIdToDelete) {
      return new Response(
        JSON.stringify({ error: 'Missing userIdToDelete in request body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (requestingUser.id === userIdToDelete) {
        console.warn(`Admin user ${requestingUser.id} attempted to delete themselves.`);
        return new Response(JSON.stringify({ error: 'Admins cannot delete their own account through this function.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400, // Bad Request or 403 Forbidden
        });
    }

    console.log(`Admin user ${requestingUser.id} attempting to delete user ${userIdToDelete}`);

    // 1. Delete from auth.users
    // Note: Supabase automatically handles cascading deletes to profiles if foreign key is set to CASCADE
    const { data: deletedAuthUser, error: deleteAuthUserError } = await supabaseAdmin.auth.admin.deleteUser(userIdToDelete);
    
    if (deleteAuthUserError) {
      console.error(`Error deleting user ${userIdToDelete} from authentication:`, deleteAuthUserError);
      if (deleteAuthUserError.message.includes('User not found')) {
        console.warn(`User ${userIdToDelete} not found in auth. Assuming already deleted or never existed in auth.`);
        // Proceed to ensure profile is also cleaned up if it exists
      } else {
        // For other errors, rethrow
        throw new Error(`Failed to delete user from authentication: ${deleteAuthUserError.message}`);
      }
    }
    
    if (deletedAuthUser) {
        console.log(`User ${userIdToDelete} successfully deleted from auth.users.`);
    }

    // 2. Delete from public.profiles (as a fallback or if CASCADE isn't fully trusted/implemented)
    // If your profiles_id_fkey has ON DELETE CASCADE, this step might be redundant but ensures cleanup.
    const { error: deleteProfileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .match({ id: userIdToDelete }); // Use match for safety, eq also works

    if (deleteProfileError) {
      // It's not necessarily an error if the profile doesn't exist, especially if auth user was also not found.
      console.warn(`Warning/Error trying to delete profile for user ${userIdToDelete}:`, deleteProfileError.message);
      // Don't throw an error here if the main goal (auth user deletion) was achieved or user wasn't in auth.
      // The user might have been in an inconsistent state.
    }
     else {
        console.log(`Profile for user ${userIdToDelete} deleted from public.profiles (or was not found).`);
    }

    return new Response(
      JSON.stringify({ message: `User ${userIdToDelete} deletion process completed.` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error in delete-user function:', error.message, error.stack ? { stack: error.stack } : {});
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: error.status || 500 }
    );
  }
}); 