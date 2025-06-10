import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BackupData {
  timestamp: string;
  mapType: 'deep_desert' | 'hagga_basin' | 'combined';
  database: {
    grid_squares: any[];
    pois: any[];
    comments: any[];
    poi_entity_links: any[];
    managed_images: any[];
    poi_image_links: any[];
    comment_image_links: any[];
  };
  files: {
    originalPaths: string[];
    backupFolder: string;
    copiedFiles: string[];
  };
}

async function collectData(supabase: any, mapType: string) {
  const data: any = {
    grid_squares: [],
    pois: [],
    comments: [],
    poi_entity_links: [],
    managed_images: [],
    poi_image_links: [],
    comment_image_links: [],
  };

  // Collect POIs
  if (mapType === 'combined') {
    const { data: pois } = await supabase.from('pois').select('*');
    data.pois = pois || [];
  } else {
    const { data: pois } = await supabase.from('pois').select('*').eq('map_type', mapType);
    data.pois = pois || [];
  }

  // Collect grid squares (only for deep_desert)
  if (mapType === 'deep_desert' || mapType === 'combined') {
    const { data: squares } = await supabase.from('grid_squares').select('*');
    if (mapType === 'deep_desert') {
      // Filter to Deep Desert pattern (A1-I9)
      data.grid_squares = (squares || []).filter((s: any) => /^[A-I][1-9]$/.test(s.coordinate));
    } else {
      data.grid_squares = squares || [];
    }
  }

  // Collect comments for these POIs
  if (data.pois.length > 0) {
    const poiIds = data.pois.map((p: any) => p.id);
    const { data: comments } = await supabase
      .from('comments')
      .select('*')
      .in('poi_id', poiIds);
    data.comments = comments || [];
  }

  // For deep_desert, also get grid square comments
  if (mapType === 'deep_desert' || mapType === 'combined') {
    const { data: gridComments } = await supabase
      .from('comments')
      .select('*')
      .not('grid_square_id', 'is', null);
    data.comments = [...data.comments, ...(gridComments || [])];
  }

  // Collect POI entity links
  if (data.pois.length > 0) {
    const poiIds = data.pois.map((p: any) => p.id);
    const { data: links } = await supabase
      .from('poi_entity_links')
      .select('*')
      .in('poi_id', poiIds);
    data.poi_entity_links = links || [];
  }

  // Collect managed images
  const imageIds: string[] = [];
  
  // Get POI image links
  if (data.pois.length > 0) {
    const poiIds = data.pois.map((p: any) => p.id);
    const { data: poiImageLinks } = await supabase
      .from('poi_image_links')
      .select('*')
      .in('poi_id', poiIds);
    data.poi_image_links = poiImageLinks || [];
    imageIds.push(...(poiImageLinks || []).map((l: any) => l.image_id));
  }

  // Get comment image links
  if (data.comments.length > 0) {
    const commentIds = data.comments.map((c: any) => c.id);
    const { data: commentImageLinks } = await supabase
      .from('comment_image_links')
      .select('*')
      .in('comment_id', commentIds);
    data.comment_image_links = commentImageLinks || [];
    imageIds.push(...(commentImageLinks || []).map((l: any) => l.image_id));
  }

  // Get managed images
  if (imageIds.length > 0) {
    const { data: managedImages } = await supabase
      .from('managed_images')
      .select('*')
      .in('id', imageIds);
    data.managed_images = managedImages || [];
  }

  return data;
}

async function copyFilesToBackup(supabase: any, data: any, backupFolder: string) {
  const originalPaths: string[] = [];
  const copiedFiles: string[] = [];

  // Collect all file URLs
  const urls: string[] = [];

  // Grid square screenshots
  for (const square of data.grid_squares) {
    if (square.screenshot_url) urls.push(square.screenshot_url);
    if (square.original_screenshot_url) urls.push(square.original_screenshot_url);
  }

  // Managed images
  for (const image of data.managed_images) {
    if (image.original_url) urls.push(image.original_url);
    if (image.processed_url) urls.push(image.processed_url);
  }

  // Deduplicate URLs to avoid copying the same file multiple times
  const uniqueUrls = [...new Set(urls)];
  
  console.log(`Starting backup of ${uniqueUrls.length} unique files`);

  // Process files in batches to avoid timeout
  const BATCH_SIZE = 10;
  const batches = [];
  for (let i = 0; i < uniqueUrls.length; i += BATCH_SIZE) {
    batches.push(uniqueUrls.slice(i, i + BATCH_SIZE));
  }

  let batchIndex = 0;
  for (const batch of batches) {
    batchIndex++;
    console.log(`Processing batch ${batchIndex}/${batches.length} (${batch.length} files)`);
    
    // Process files in current batch concurrently
    const batchPromises = batch.map(async (url) => {
      try {
        const originalPath = url.split('/screenshots/')[1];
        if (!originalPath) return;

        originalPaths.push(originalPath);

        // Create backup path maintaining folder structure
        const backupPath = `${backupFolder}/files/${originalPath}`;

        // Copy file within storage (skip existence check for performance)
        const { error } = await supabase.storage
          .from('screenshots')
          .copy(originalPath, backupPath);

        if (error) {
          // If error is "already exists", treat as success
          if (error.message && error.message.includes('already exists')) {
            copiedFiles.push(backupPath);
          } else {
            console.error(`Failed to copy ${originalPath}:`, error.message || error);
          }
        } else {
          copiedFiles.push(backupPath);
        }
      } catch (error) {
        console.error(`Failed to copy ${url}:`, error);
      }
    });

    // Wait for current batch to complete
    await Promise.all(batchPromises);
    
    // Small delay between batches to prevent overwhelming the API
    if (batchIndex < batches.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`Backup completed: ${copiedFiles.length}/${originalPaths.length} files copied`);
  return { originalPaths, copiedFiles };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { mapType = 'combined' } = await req.json();
    
    // Handle test health check
    if (mapType === 'test_health_check') {
      return new Response(JSON.stringify({
        success: true,
        message: 'Health check passed - function is responsive'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate mapType
    const validMapTypes = ['deep_desert', 'hagga_basin', 'combined'];
    if (!validMapTypes.includes(mapType)) {
      return new Response(JSON.stringify({
        success: false,
        error: `Invalid map type: ${mapType}. Valid types: ${validMapTypes.join(', ')}`
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create timestamped backup folder name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFolder = `backups/backup_${mapType}_${timestamp}`;

    console.log(`Starting backup for ${mapType} -> ${backupFolder}`);

    // Collect database data
    const database = await collectData(supabase, mapType);
    
    console.log(`Database collected: ${database.pois.length} POIs, ${database.grid_squares.length} grid squares, ${database.comments.length} comments`);
    
    // Copy files to backup folder with timeout protection
    const startTime = Date.now();
    const { originalPaths, copiedFiles } = await copyFilesToBackup(supabase, database, backupFolder);
    const copyDuration = Date.now() - startTime;
    
    console.log(`File copying completed in ${copyDuration}ms`);

    // Create backup metadata
    const backup: BackupData = {
      timestamp: new Date().toISOString(),
      mapType: mapType as any,
      database,
      files: {
        originalPaths,
        backupFolder,
        copiedFiles,
      },
    };

    // Save backup metadata
    const metadataFileName = `${backupFolder}/backup_metadata.json`;
    
    await supabase.storage
      .from('screenshots')
      .upload(metadataFileName, JSON.stringify(backup, null, 2), {
        contentType: 'application/json',
        upsert: false,
      });

    console.log(`Metadata saved to ${metadataFileName}`);

    // Clean old backups (keep last 5) - only check backup folders at root level
    try {
      const { data: existingFolders } = await supabase.storage
        .from('screenshots')
        .list('backups', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

      if (existingFolders) {
        const backupFolders = existingFolders.filter(f => 
          f.name.startsWith(`backup_${mapType}_`) && f.id !== null
        );

        if (backupFolders.length > 5) {
          console.log(`Cleaning ${backupFolders.length - 5} old backup folders`);
          const foldersToDelete = backupFolders.slice(5);
          for (const folder of foldersToDelete) {
            try {
              // List all files in the old backup folder
              const { data: files } = await supabase.storage
                .from('screenshots')
                .list(`backups/${folder.name}`, { limit: 1000 });

              if (files && files.length > 0) {
                // Delete all files in the folder recursively
                const filePaths = await getAllFilePathsRecursive(supabase, `backups/${folder.name}`);
                if (filePaths.length > 0) {
                  await supabase.storage.from('screenshots').remove(filePaths);
                }
              }
            } catch (error) {
              console.error(`Failed to clean old backup ${folder.name}:`, error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to clean old backups (non-critical):', error);
    }

    const totalDuration = Date.now() - startTime;
    const stats = {
      totalFiles: copiedFiles.length,
      failedFiles: originalPaths.length - copiedFiles.length,
      backupFolder,
      duration: `${totalDuration}ms`,
      database: {
        grid_squares: database.grid_squares.length,
        pois: database.pois.length,
        comments: database.comments.length,
        poi_entity_links: database.poi_entity_links.length,
        managed_images: database.managed_images.length,
        poi_image_links: database.poi_image_links.length,
        comment_image_links: database.comment_image_links.length,
      },
    };

    console.log(`Backup completed successfully in ${totalDuration}ms`);

    return new Response(JSON.stringify({
      success: true,
      message: `Backup completed for ${mapType}`,
      backupFolder,
      stats,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Backup failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error occurred',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to recursively get all file paths in a folder
async function getAllFilePathsRecursive(supabase: any, folderPath: string): Promise<string[]> {
  const allPaths: string[] = [];
  
  const { data: items } = await supabase.storage
    .from('screenshots')
    .list(folderPath, { limit: 1000 });

  if (items) {
    for (const item of items) {
      const itemPath = `${folderPath}/${item.name}`;
      if (item.id === null) {
        // It's a folder, recurse into it
        const subPaths = await getAllFilePathsRecursive(supabase, itemPath);
        allPaths.push(...subPaths);
      } else {
        // It's a file
        allPaths.push(itemPath);
      }
    }
  }
  
  return allPaths;
} 