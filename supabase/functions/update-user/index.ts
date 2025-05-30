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

    // Parse request body - handle both old and new field names for compatibility
    const requestBody = await req.json();
    console.log('Request body received:', requestBody);

    // Support both old format (userIdToUpdate, newUsername, newEmail) and new format (userId, username, email, role)
    const userId = requestBody.userId || requestBody.userIdToUpdate;
    const username = requestBody.username || requestBody.newUsername;
    const email = requestBody.email || requestBody.newEmail;
    const role = requestBody.role; // New field for role updates
    const rankId = requestBody.rankId; // New field for rank assignments

    if (!userId) {
      return new Response(JSON.stringify({ 
        error: 'Missing required field: userId'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Check if this is a targeted update (rank-only, role-only, or partial update)
    const isRankOnlyUpdate = rankId !== undefined && !username && !email && !role;
    const isRoleOnlyUpdate = role && !username && !email && rankId === undefined;
    const isPartialUpdate = isRankOnlyUpdate || isRoleOnlyUpdate;
    
    // Only require username and email for full profile updates
    if (!isPartialUpdate && (!username || !email)) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: username, email (unless updating rank or role only)',
        received: { userId: !!userId, username: !!username, email: !!email, role: !!role, rankId: rankId !== undefined }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    console.log(`Admin user ${requestingUser.id} attempting to update user ${userId}:`, {
      username: username || '(unchanged)',
      email: email || '(unchanged)', 
      role: role || '(unchanged)',
      rankId: rankId !== undefined ? rankId : '(unchanged)',
      isRankOnlyUpdate,
      isRoleOnlyUpdate,
      isPartialUpdate
    });

    // For Discord OAuth users, we should be careful about updating email in auth.users
    // Discord OAuth users have their email managed by Discord, not Supabase directly
    const { data: { user: currentAuthUser }, error: getCurrentUserError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (getCurrentUserError) {
      console.error('Error fetching current auth user to be updated:', getCurrentUserError);
      throw new Error(`Failed to fetch current auth data for user ${userId}: ${getCurrentUserError.message}`);
    }

    if (!currentAuthUser) {
        throw new Error(`Auth user with ID ${userId} not found for update.`);
    }

    // Check if this is a Discord OAuth user
    const isDiscordUser = currentAuthUser.app_metadata?.provider === 'discord';
    console.log(`User ${userId} is Discord OAuth user: ${isDiscordUser}`);

    // Only update email in auth.users for non-Discord users
    if (!isPartialUpdate && !isDiscordUser && email && currentAuthUser.email !== email) {
      console.log(`Email for user ${userId} is changing from ${currentAuthUser.email} to ${email}. Updating in auth.users.`);
      const { error: updateAuthEmailError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { email: email }
      )
      if (updateAuthEmailError) {
        console.error('Error updating email in auth.users:', updateAuthEmailError);
        if (updateAuthEmailError.message.includes('Email address already registered')) {
            throw new Error('The new email address is already registered by another user.');
        }
        throw new Error(`Failed to update email in authentication: ${updateAuthEmailError.message}`)
      }
      console.log(`Email updated in auth.users for ${userId}.`);
    } else if (!isPartialUpdate && isDiscordUser && email && currentAuthUser.email !== email) {
      console.log(`User ${userId} is Discord OAuth user - skipping auth.users email update, updating only in profiles`);
    }

    // Update profile data - build update object based on what fields are provided
    console.log(`Updating profile for user ${userId}.`);
    const updateData: any = {};
    
    // Add fields to update based on what's provided
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (rankId !== undefined) {
      updateData.rank_id = rankId; // Handle null for rank removal
    }

    // Validate that there's something to update
    if (Object.keys(updateData).length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No fields provided to update'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const { error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', userId)

    if (updateProfileError) {
      console.error('Error updating profile:', updateProfileError);
      if (updateProfileError.message.includes('duplicate key value violates unique constraint') && updateProfileError.message.includes('profiles_username_key')) {
        throw new Error('This username is already taken. Please choose a different one.');
      }
      throw new Error(`Failed to update profile: ${updateProfileError.message}`)
    }
    console.log(`Profile updated for user ${userId}.`);

    return new Response(JSON.stringify({ 
      success: true,
      message: isRankOnlyUpdate ? 'User rank updated successfully' : isRoleOnlyUpdate ? 'User role updated successfully' : 'User updated successfully',
      updated: updateData,
      isDiscordUser: isDiscordUser,
      isRankOnlyUpdate: isRankOnlyUpdate,
      isRoleOnlyUpdate: isRoleOnlyUpdate
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Unhandled error in update-user function:', error.message, error.stack ? { stack: error.stack } : {})
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'An unexpected error occurred' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: error.status || 500,
    })
  }
}) 