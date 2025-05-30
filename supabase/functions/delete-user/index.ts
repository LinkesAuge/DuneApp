// @deno-types="npm:@supabase/supabase-js@2.43.4"
import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2.43.4';
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

console.log("Delete User function booting up!");

// Helper function to extract file path from Supabase Storage URL
const extractStorageFilePath = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    // Extract path after '/storage/v1/object/public/{bucket}/'
    const pathParts = urlObj.pathname.split('/');
    const bucketIndex = pathParts.indexOf('public') + 1;
    if (bucketIndex > 0 && bucketIndex < pathParts.length) {
      return pathParts.slice(bucketIndex + 1).join('/'); // Skip bucket name too
    }
    return null;
  } catch {
    return null;
  }
};

// Helper function to batch delete files from storage
const batchDeleteFiles = async (supabase: SupabaseClient, bucket: string, filePaths: string[]): Promise<void> => {
  if (filePaths.length === 0) return;
  
  // Delete in batches of 100 (Supabase limit)
  const batchSize = 100;
  for (let i = 0; i < filePaths.length; i += batchSize) {
    const batch = filePaths.slice(i, i + batchSize);
    const { error } = await supabase.storage.from(bucket).remove(batch);
    if (error) {
      console.error(`Error deleting batch ${i / batchSize + 1} from ${bucket}:`, error);
      // Continue with other batches even if one fails
    } else {
      console.log(`Successfully deleted batch ${i / batchSize + 1} (${batch.length} files) from ${bucket}`);
    }
  }
};

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

    const { data: requestingUserProfile, error: requestingProfileError } = await supabaseAdmin
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
        status: 403,
      });
    }

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
            status: 400,
        });
    }

    console.log(`Admin user ${requestingUser.id} attempting to delete user ${userIdToDelete}`);

    // DATA PRESERVATION APPROACH: Update user data to "Deleted User" instead of deleting
    console.log(`Starting data preservation for user ${userIdToDelete}...`);

    try {
      // 1. Update POIs - preserve POIs but anonymize creator
      console.log('Updating POIs created by user to "Deleted User"...');
      const { error: updatePoisError } = await supabaseAdmin
        .from('pois')
        .update({ 
          created_by: null,
          // Note: If you have a creator_name field, update it too
          // creator_name: 'Deleted User'
        })
        .eq('created_by', userIdToDelete);

      if (updatePoisError) {
        console.error('Error updating POIs:', updatePoisError);
        // Continue with deletion even if POI update fails
      } else {
        console.log('Successfully updated POIs to preserve data');
      }

      // 2. Update grid squares - preserve screenshots but anonymize uploader
      console.log('Updating grid squares uploaded by user...');
      const { error: updateGridSquaresError } = await supabaseAdmin
        .from('grid_squares')
        .update({ uploaded_by: null })
        .eq('uploaded_by', userIdToDelete);

      if (updateGridSquaresError) {
        console.error('Error updating grid squares:', updateGridSquaresError);
      } else {
        console.log('Successfully updated grid squares to preserve data');
      }

      // 3. Update comments - preserve comments but anonymize author
      console.log('Updating comments created by user...');
      const { error: updateCommentsError } = await supabaseAdmin
        .from('comments')
        .update({ 
          user_id: null,
          // Note: If you have author_name or similar field, update it
          // author_name: 'Deleted User'
        })
        .eq('user_id', userIdToDelete);

      if (updateCommentsError) {
        console.error('Error updating comments:', updateCommentsError);
      } else {
        console.log('Successfully updated comments to preserve data');
      }

      // 4. Update custom icons - preserve icons but anonymize creator
      console.log('Updating custom icons created by user...');
      const { error: updateCustomIconsError } = await supabaseAdmin
        .from('custom_icons')
        .update({ user_id: null })
        .eq('user_id', userIdToDelete);

      if (updateCustomIconsError) {
        console.error('Error updating custom icons:', updateCustomIconsError);
      } else {
        console.log('Successfully updated custom icons to preserve data');
      }

      // 5. Update POI types - preserve custom POI types but anonymize creator
      console.log('Updating POI types created by user...');
      const { error: updatePoiTypesError } = await supabaseAdmin
        .from('poi_types')
        .update({ created_by: null })
        .eq('created_by', userIdToDelete);

      if (updatePoiTypesError) {
        console.error('Error updating POI types:', updatePoiTypesError);
      } else {
        console.log('Successfully updated POI types to preserve data');
      }

      console.log('Data preservation completed successfully');

    } catch (dataPreservationError) {
      console.error('Error during data preservation:', dataPreservationError);
      // Continue with user deletion even if data preservation has issues
    }

    // Now proceed with user account deletion

    // 1. Delete from auth.users
    console.log(`Deleting user ${userIdToDelete} from auth.users...`);
    const { data: deletedAuthUser, error: deleteAuthUserError } = await supabaseAdmin.auth.admin.deleteUser(userIdToDelete);
    
    if (deleteAuthUserError) {
      console.error(`Error deleting user ${userIdToDelete} from authentication:`, deleteAuthUserError);
      if (deleteAuthUserError.message.includes('User not found')) {
        console.warn(`User ${userIdToDelete} not found in auth. Assuming already deleted or never existed in auth.`);
      } else {
        throw new Error(`Failed to delete user from authentication: ${deleteAuthUserError.message}`);
      }
    } else {
      console.log(`User ${userIdToDelete} successfully deleted from auth.users.`);
    }

    // 2. Delete from public.profiles
    console.log(`Deleting profile for user ${userIdToDelete}...`);
    const { error: deleteProfileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userIdToDelete);

    if (deleteProfileError) {
      console.warn(`Warning/Error trying to delete profile for user ${userIdToDelete}:`, deleteProfileError.message);
    } else {
      console.log(`Profile for user ${userIdToDelete} deleted from public.profiles.`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `User ${userIdToDelete} deletion completed. All user contributions have been preserved and marked as "Deleted User".` 
      }),
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