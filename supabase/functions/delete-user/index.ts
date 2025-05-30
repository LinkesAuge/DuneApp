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

    // Storage cleanup: Collect all files uploaded by the user before deletion
    console.log(`Starting storage cleanup for user ${userIdToDelete}...`);
    const filesToDelete: string[] = [];

    try {
      // 1. Collect POI screenshots created by the user
      console.log('Collecting POI screenshots created by user...');
      const { data: userPoisData, error: userPoisError } = await supabaseAdmin
        .from('pois')
        .select('screenshots')
        .eq('created_by', userIdToDelete);

      if (userPoisError) {
        console.error('Error querying user POIs for storage cleanup:', userPoisError);
      } else if (userPoisData) {
        for (const poi of userPoisData) {
          if (poi.screenshots && Array.isArray(poi.screenshots)) {
            for (const screenshot of poi.screenshots) {
              if (screenshot.url) {
                const filePath = extractStorageFilePath(screenshot.url);
                if (filePath) {
                  filesToDelete.push(filePath);
                }
              }
            }
          }
        }
        console.log(`Found ${filesToDelete.length} POI screenshot files from user`);
      }

      // 2. Collect grid square screenshots uploaded by the user
      console.log('Collecting grid square screenshots uploaded by user...');
      const { data: userGridSquaresData, error: userGridSquaresError } = await supabaseAdmin
        .from('grid_squares')
        .select('screenshot_url, original_screenshot_url')
        .eq('uploaded_by', userIdToDelete);

      if (userGridSquaresError) {
        console.error('Error querying user grid squares for storage cleanup:', userGridSquaresError);
      } else if (userGridSquaresData) {
        const initialCount = filesToDelete.length;
        for (const gridSquare of userGridSquaresData) {
          // Add main screenshot
          if (gridSquare.screenshot_url) {
            const filePath = extractStorageFilePath(gridSquare.screenshot_url);
            if (filePath && !filesToDelete.includes(filePath)) {
              filesToDelete.push(filePath);
            }
          }
          // Add original screenshot if different
          if (gridSquare.original_screenshot_url && 
              gridSquare.original_screenshot_url !== gridSquare.screenshot_url) {
            const filePath = extractStorageFilePath(gridSquare.original_screenshot_url);
            if (filePath && !filesToDelete.includes(filePath)) {
              filesToDelete.push(filePath);
            }
          }
        }
        console.log(`Found ${filesToDelete.length - initialCount} additional grid square screenshot files from user`);
      }

      // 3. Collect custom icons created by the user
      console.log('Collecting custom icons created by user...');
      const { data: userCustomIconsData, error: userCustomIconsError } = await supabaseAdmin
        .from('custom_icons')
        .select('image_url')
        .eq('user_id', userIdToDelete);

      if (userCustomIconsError) {
        console.error('Error querying user custom icons for storage cleanup:', userCustomIconsError);
      } else if (userCustomIconsData) {
        const initialCount = filesToDelete.length;
        for (const customIcon of userCustomIconsData) {
          if (customIcon.image_url) {
            const filePath = extractStorageFilePath(customIcon.image_url);
            if (filePath && !filesToDelete.includes(filePath)) {
              filesToDelete.push(filePath);
            }
          }
        }
        console.log(`Found ${filesToDelete.length - initialCount} custom icon files from user`);
      }

      // 4. Delete all collected files from storage
      console.log(`Deleting ${filesToDelete.length} total files from storage for user ${userIdToDelete}...`);
      if (filesToDelete.length > 0) {
        await batchDeleteFiles(supabaseAdmin, 'screenshots', filesToDelete);
        console.log('User storage cleanup completed successfully');
      } else {
        console.log('No files found to delete for user');
      }

    } catch (storageCleanupError) {
      console.error('Error during user storage cleanup:', storageCleanupError);
      // Continue with user deletion even if storage cleanup fails
    }

    // Proceed with user deletion from auth and database

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