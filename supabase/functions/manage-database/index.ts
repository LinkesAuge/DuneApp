import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

interface StorageFile {
  path: string;
  data: string; // base64 encoded
  contentType: string;
  originalUrl: string;
}

interface EnhancedBackupData {
  timestamp: string;
  mapType?: string;
  // Old format support
  grid_squares?: any[];
  pois?: any[];
  // New format support
  database?: {
    grid_squares: any[];
    pois: any[];
    comments: any[];
  };
  files?: {
    grid_screenshots: StorageFile[];
    poi_screenshots: StorageFile[];
    comment_screenshots: StorageFile[];
    custom_icons: StorageFile[];
  };
}

// Upload files from backup to storage
async function uploadBackupFiles(supabaseAdmin: any, files: {
  grid_screenshots: StorageFile[];
  poi_screenshots: StorageFile[];
  comment_screenshots: StorageFile[];
  custom_icons: StorageFile[];
}): Promise<{[originalUrl: string]: string}> {
  const urlMapping: {[originalUrl: string]: string} = {};
  
  console.log('Starting file restoration...');
  
  // Helper function to upload a single file
  const uploadFile = async (file: StorageFile): Promise<void> => {
    try {
      // Convert base64 back to blob
      const binaryString = atob(file.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: file.contentType });

      // Upload to storage
      const { data, error } = await supabaseAdmin.storage
        .from('screenshots')
        .upload(file.path, blob, {
          contentType: file.contentType,
          upsert: true // Overwrite if exists
        });

      if (error) {
        console.warn(`Failed to upload ${file.path}:`, error);
        return;
      }

      // Get new public URL
      const { data: urlData } = supabaseAdmin.storage
        .from('screenshots')
        .getPublicUrl(file.path);

      // Map old URL to new URL
      urlMapping[file.originalUrl] = urlData.publicUrl;
      console.log(`Restored file: ${file.path} -> ${urlData.publicUrl}`);
    } catch (err) {
      console.warn(`Error uploading file ${file.path}:`, err);
    }
  };

  // Upload all file categories
  const allFiles = [
    ...files.grid_screenshots,
    ...files.poi_screenshots,
    ...files.comment_screenshots,
    ...files.custom_icons
  ];

  console.log(`Uploading ${allFiles.length} files...`);
  
  // Upload files in batches to avoid overwhelming the system
  const batchSize = 10;
  for (let i = 0; i < allFiles.length; i += batchSize) {
    const batch = allFiles.slice(i, i + batchSize);
    await Promise.all(batch.map(uploadFile));
    console.log(`Uploaded batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(allFiles.length/batchSize)}`);
  }

  console.log(`File restoration complete. ${Object.keys(urlMapping).length} files uploaded successfully.`);
  return urlMapping;
}

// Update URLs in database records
function updateUrlsInData(data: any[], urlMapping: {[originalUrl: string]: string}): any[] {
  return data.map(record => {
    const updatedRecord = { ...record };
    
    // Update screenshot URLs in grid squares
    if (updatedRecord.screenshot_url && urlMapping[updatedRecord.screenshot_url]) {
      updatedRecord.screenshot_url = urlMapping[updatedRecord.screenshot_url];
    }
    if (updatedRecord.original_screenshot_url && urlMapping[updatedRecord.original_screenshot_url]) {
      updatedRecord.original_screenshot_url = urlMapping[updatedRecord.original_screenshot_url];
    }
    
    // Update screenshot URLs in POIs
    if (updatedRecord.screenshots && Array.isArray(updatedRecord.screenshots)) {
      updatedRecord.screenshots = updatedRecord.screenshots.map(screenshot => {
        const updatedScreenshot = { ...screenshot };
        if (updatedScreenshot.url && urlMapping[updatedScreenshot.url]) {
          updatedScreenshot.url = urlMapping[updatedScreenshot.url];
        }
        if (updatedScreenshot.original_url && urlMapping[updatedScreenshot.original_url]) {
          updatedScreenshot.original_url = urlMapping[updatedScreenshot.original_url];
        }
        return updatedScreenshot;
      });
    }
    
    return updatedRecord;
  });
}

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
      const enhancedBackupData: EnhancedBackupData = backupData;
      
      // Support both old and new backup formats
      let gridSquares: any[], pois: any[], comments: any[] = [];
      
      if (enhancedBackupData.database) {
        // New enhanced format
        gridSquares = enhancedBackupData.database.grid_squares || [];
        pois = enhancedBackupData.database.pois || [];
        comments = enhancedBackupData.database.comments || [];
      } else {
        // Old format (backward compatibility)
        gridSquares = enhancedBackupData.grid_squares || [];
        pois = enhancedBackupData.pois || [];
      }

      if (!gridSquares && !pois) {
        throw new Error('Invalid backup data format - no data found');
      }

      console.log(`Starting restore process. Database records: ${gridSquares.length} grid squares, ${pois.length} POIs, ${comments.length} comments`);

      // Restore files first if they exist
      let urlMapping: {[originalUrl: string]: string} = {};
      if (enhancedBackupData.files) {
        console.log('Restoring storage files...');
        urlMapping = await uploadBackupFiles(supabaseAdmin, enhancedBackupData.files);
        console.log(`File restoration complete. ${Object.keys(urlMapping).length} URL mappings created.`);
      }

      // Delete existing data first
      console.log('Clearing existing data...');

      // Delete comments first (due to foreign key constraints)
      const { error: commentsDeleteError } = await supabaseAdmin
        .from('comments')
        .delete()
        .not('id', 'is', null);

      if (commentsDeleteError) {
        console.error('Failed to delete comments:', commentsDeleteError);
        throw commentsDeleteError;
      }

      // Delete POIs (due to foreign key constraints)
      const { error: poisDeleteError } = await supabaseAdmin
        .from('pois')
        .delete()
        .not('id', 'is', null);

      if (poisDeleteError) {
        console.error('Failed to delete POIs:', poisDeleteError);
        throw poisDeleteError;
      }

      // Delete grid squares
      const { error: gridDeleteError } = await supabaseAdmin
        .from('grid_squares')
        .delete()
        .not('id', 'is', null);

      if (gridDeleteError) {
        console.error('Failed to delete grid squares:', gridDeleteError);
        throw gridDeleteError;
      }

      console.log('Existing data cleared successfully.');

      // Insert backup data with updated URLs
      
      // Fetch all current profile IDs to validate against
      const { data: existingProfiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('id');

      if (profilesError) {
        console.error('Error fetching existing profiles:', profilesError);
        throw new Error('Failed to fetch existing user profiles during restore.');
      }

      const existingProfileIds = new Set(existingProfiles.map(p => p.id));
      
      // Update URLs in grid squares data and handle missing user references
      const validGridSquares = updateUrlsInData(gridSquares, urlMapping).map(gs => {
        if (gs.uploaded_by && !existingProfileIds.has(gs.uploaded_by)) {
          console.warn(`User ID ${gs.uploaded_by} not found for grid_square ${gs.id}. Setting uploaded_by to null.`);
          return { ...gs, uploaded_by: null };
        }
        return gs;
      });

      // Update URLs in POI data
      const validPois = updateUrlsInData(pois, urlMapping);

      // Insert restored data
      if (validGridSquares.length > 0) {
        const { error: gridInsertError } = await supabaseAdmin
          .from('grid_squares')
          .insert(validGridSquares);

        if (gridInsertError) {
          console.error('Failed to insert grid squares:', gridInsertError);
          throw gridInsertError;
        }
        console.log(`Inserted ${validGridSquares.length} grid squares`);
      }

      if (validPois.length > 0) {
        const { error: poisInsertError } = await supabaseAdmin
          .from('pois')
          .insert(validPois);

        if (poisInsertError) {
          console.error('Failed to insert POIs:', poisInsertError);
          throw poisInsertError;
        }
        console.log(`Inserted ${validPois.length} POIs`);
      }

      if (comments.length > 0) {
        // Update URLs in comments data (for comment screenshots)
        const validComments = updateUrlsInData(comments, urlMapping);
        
        const { error: commentsInsertError } = await supabaseAdmin
          .from('comments')
          .insert(validComments);

        if (commentsInsertError) {
          console.error('Failed to insert comments:', commentsInsertError);
          throw commentsInsertError;
        }
        console.log(`Inserted ${validComments.length} comments`);
      }

      const totalFiles = Object.keys(urlMapping).length;
      const message = totalFiles > 0 
        ? `Backup restored successfully with ${validGridSquares.length + validPois.length + comments.length} database records and ${totalFiles} storage files.`
        : `Backup restored successfully with ${validGridSquares.length + validPois.length + comments.length} database records.`;

      return new Response(
        JSON.stringify({ 
          success: true, 
          message,
          stats: {
            database: {
              grid_squares: validGridSquares.length,
              pois: validPois.length,
              comments: comments.length
            },
            files: totalFiles
          }
        }),
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