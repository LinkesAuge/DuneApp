// @deno-types="npm:@supabase/supabase-js@2.43.4"
import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2.43.4';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Update user function booting up...')

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are not set.');
      return new Response(JSON.stringify({ error: 'Server configuration error: Missing Supabase credentials.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.warn('Authorization header is missing.');
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
      console.error('Error fetching requesting user:', requestingUserError);
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
      console.error('Error fetching requesting user profile:', requestingProfileError);
      return new Response(JSON.stringify({ error: 'Failed to fetch requesting user profile: ' + (requestingProfileError?.message || 'Profile not found') }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500, // Internal error if profile can't be fetched for an authenticated user
      });
    }

    if (requestingUserProfile.role !== 'admin') {
      console.warn(`User ${requestingUser.id} with role ${requestingUserProfile.role} attempted to update user details.`);
      return new Response(JSON.stringify({ error: 'User not allowed to perform this action.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403, // Forbidden
      });
    }
    // End Security Check

    const { userIdToUpdate, newUsername, newEmail } = await req.json()

    if (!userIdToUpdate || !newUsername || !newEmail) {
      return new Response(JSON.stringify({ error: 'Missing required fields: userIdToUpdate, newUsername, newEmail' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    console.log(`Admin user ${requestingUser.id} attempting to update user ${userIdToUpdate}: new username '${newUsername}', new email '${newEmail}'`);

    // Step 1: Update email in auth.users if it has changed
    const { data: { user: currentAuthUser }, error: getCurrentUserError } = await supabaseAdmin.auth.admin.getUserById(userIdToUpdate);

    if (getCurrentUserError) {
      console.error('Error fetching current auth user to be updated:', getCurrentUserError);
      throw new Error(`Failed to fetch current auth data for user ${userIdToUpdate}: ${getCurrentUserError.message}`);
    }

    if (!currentAuthUser) {
        throw new Error(`Auth user with ID ${userIdToUpdate} not found for update.`);
    }

    if (currentAuthUser.email !== newEmail) {
      console.log(`Email for user ${userIdToUpdate} is changing from ${currentAuthUser.email} to ${newEmail}. Updating in auth.users.`);
      const { error: updateAuthEmailError } = await supabaseAdmin.auth.admin.updateUserById(
        userIdToUpdate,
        { email: newEmail }
      )
      if (updateAuthEmailError) {
        console.error('Error updating email in auth.users:', updateAuthEmailError);
        if (updateAuthEmailError.message.includes('Email address already registered')) {
            throw new Error('The new email address is already registered by another user.');
        }
        throw new Error(`Failed to update email in authentication: ${updateAuthEmailError.message}`)
      }
      console.log(`Email updated in auth.users for ${userIdToUpdate}.`);
    }

    // Step 2: Update username and email in public.profiles
    console.log(`Updating profile for user ${userIdToUpdate}.`);
    const { error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .update({ username: newUsername, email: newEmail })
      .eq('id', userIdToUpdate)

    if (updateProfileError) {
      console.error('Error updating profile:', updateProfileError);
      if (updateProfileError.message.includes('duplicate key value violates unique constraint') && updateProfileError.message.includes('profiles_username_key')) {
        throw new Error('This username is already taken. Please choose a different one.');
      }
      throw new Error(`Failed to update profile: ${updateProfileError.message}`)
    }
    console.log(`Profile updated for user ${userIdToUpdate}.`);

    return new Response(JSON.stringify({ message: 'User updated successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Unhandled error in update-user function:', error.message, error.stack ? { stack: error.stack } : {})
    return new Response(JSON.stringify({ error: error.message || 'An unexpected error occurred' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: error.status || 500,
    })
  }
}) 