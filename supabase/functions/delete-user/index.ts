// @deno-types="npm:@supabase/supabase-js@2.43.4"
import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2.43.4';
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

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

    // DATA PRESERVATION APPROACH: Update user data to "Deleted User" instead of deleting

    try {
      // 1. Update POIs - preserve POIs but anonymize creator
      const { error: updatePoisError } = await supabaseAdmin
        .from('pois')
        .update({ 
          created_by: null,
          updated_by: null  // Also preserve who last updated the POI
        })
        .eq('created_by', userIdToDelete);

      if (updatePoisError) {
        console.error('Error updating POIs:', updatePoisError);
      }

      // Also update POIs where user was the last updater but not original creator
      const { error: updatePoisUpdatedError } = await supabaseAdmin
        .from('pois')
        .update({ updated_by: null })
        .eq('updated_by', userIdToDelete);

      if (updatePoisUpdatedError) {
        console.error('Error updating POIs updated_by:', updatePoisUpdatedError);
      }

      // 2. Update grid squares - preserve screenshots but anonymize uploader
      const { error: updateGridSquaresError } = await supabaseAdmin
        .from('grid_squares')
        .update({ 
          uploaded_by: null,
          updated_by: null  // Also preserve who last updated the grid square
        })
        .eq('uploaded_by', userIdToDelete);

      if (updateGridSquaresError) {
        console.error('Error updating grid squares:', updateGridSquaresError);
      }

      // Also update grid squares where user was the last updater but not original uploader
      const { error: updateGridSquaresUpdatedError } = await supabaseAdmin
        .from('grid_squares')
        .update({ updated_by: null })
        .eq('updated_by', userIdToDelete);

      if (updateGridSquaresUpdatedError) {
        console.error('Error updating grid squares updated_by:', updateGridSquaresUpdatedError);
      }

      // 3. Update comments - preserve comments but anonymize author
      const { error: updateCommentsError } = await supabaseAdmin
        .from('comments')
        .update({ 
          user_id: null,
          updated_by: null  // Also preserve who last updated the comment
        })
        .eq('user_id', userIdToDelete);

      if (updateCommentsError) {
        console.error('Error updating comments:', updateCommentsError);
      }

      // Also update comments where user was the last updater but not original author
      const { error: updateCommentsUpdatedError } = await supabaseAdmin
        .from('comments')
        .update({ updated_by: null })
        .eq('updated_by', userIdToDelete);

      if (updateCommentsUpdatedError) {
        console.error('Error updating comments updated_by:', updateCommentsUpdatedError);
      }

      // 4. Update custom icons - preserve icons but anonymize creator
      const { error: updateCustomIconsError } = await supabaseAdmin
        .from('custom_icons')
        .update({ user_id: null })
        .eq('user_id', userIdToDelete);

      if (updateCustomIconsError) {
        console.error('Error updating custom icons:', updateCustomIconsError);
      }

      // 5. Update POI types - preserve custom POI types but anonymize creator
      const { error: updatePoiTypesError } = await supabaseAdmin
        .from('poi_types')
        .update({ created_by: null })
        .eq('created_by', userIdToDelete);

      if (updatePoiTypesError) {
        console.error('Error updating POI types:', updatePoiTypesError);
      }

      // 6. Update POI collections - preserve collections but anonymize creator
      const { error: updateCollectionsError } = await supabaseAdmin
        .from('poi_collections')
        .update({ 
          created_by: null,
          updated_by: null  // Also preserve who last updated the collection
        })
        .eq('created_by', userIdToDelete);

      if (updateCollectionsError) {
        console.error('Error updating POI collections:', updateCollectionsError);
      }

      // Also update collections where user was the last updater but not original creator
      const { error: updateCollectionsUpdatedError } = await supabaseAdmin
        .from('poi_collections')
        .update({ updated_by: null })
        .eq('updated_by', userIdToDelete);

      if (updateCollectionsUpdatedError) {
        console.error('Error updating POI collections updated_by:', updateCollectionsUpdatedError);
      }

      // 7. Delete POI shares involving the user (these don't need preservation)
      const { error: deleteSharesError1 } = await supabaseAdmin
        .from('poi_shares')
        .delete()
        .eq('shared_by_user_id', userIdToDelete);

      const { error: deleteSharesError2 } = await supabaseAdmin
        .from('poi_shares')
        .delete()
        .eq('shared_with_user_id', userIdToDelete);

      if (deleteSharesError1 || deleteSharesError2) {
        console.error('Error deleting POI shares:', deleteSharesError1 || deleteSharesError2);
      }

    } catch (dataPreservationError) {
      console.error('Error during data preservation:', dataPreservationError);
      // Continue with user deletion even if data preservation has issues
    }

    // Now proceed with user account deletion

    // 1. Delete from auth.users
    const { data: deletedAuthUser, error: deleteAuthUserError } = await supabaseAdmin.auth.admin.deleteUser(userIdToDelete);
    
    if (deleteAuthUserError) {
      console.error(`Error deleting user ${userIdToDelete} from authentication:`, deleteAuthUserError);
      if (deleteAuthUserError.message.includes('User not found')) {
        console.warn(`User ${userIdToDelete} not found in auth. Assuming already deleted or never existed in auth.`);
      } else {
        throw new Error(`Failed to delete user from authentication: ${deleteAuthUserError.message}`);
      }
    }

    // 2. Delete from public.profiles
    const { error: deleteProfileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userIdToDelete);

    if (deleteProfileError) {
      console.warn(`Warning/Error trying to delete profile for user ${userIdToDelete}:`, deleteProfileError.message);
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