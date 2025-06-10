import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function deleteFiles(supabase: any, fileUrls: string[]) {
  const deletedFiles: string[] = [];
  const failedFiles: string[] = [];

  for (const url of fileUrls) {
    try {
      const path = url.split('/screenshots/')[1];
      if (!path) continue;

      const { error } = await supabase.storage.from('screenshots').remove([path]);
      
      if (error) {
        failedFiles.push(url);
      } else {
        deletedFiles.push(url);
      }
    } catch (error) {
      failedFiles.push(url);
    }
  }

  return { deletedFiles, failedFiles };
}

async function collectFileUrls(supabase: any, mapType: string) {
  const urls: string[] = [];

  // Get POI images
  let pois: any[] = [];
  if (mapType === 'combined') {
    const { data } = await supabase.from('pois').select('*');
    pois = data || [];
  } else {
    const { data } = await supabase.from('pois').select('*').eq('map_type', mapType);
    pois = data || [];
  }

  if (pois.length > 0) {
    const poiIds = pois.map(p => p.id);
    
    // Get POI image links and managed images
    const { data: poiImageLinks } = await supabase
      .from('poi_image_links')
      .select('image_id, managed_images(original_url, processed_url)')
      .in('poi_id', poiIds);

    for (const link of poiImageLinks || []) {
      const image = link.managed_images;
      if (image?.original_url) urls.push(image.original_url);
      if (image?.processed_url) urls.push(image.processed_url);
    }
  }

  // Get grid square images (Deep Desert only)
  if (mapType === 'deep_desert' || mapType === 'combined') {
    const { data: squares } = await supabase.from('grid_squares').select('screenshot_url, original_screenshot_url');
    
    for (const square of squares || []) {
      if (mapType === 'deep_desert' && !/^[A-I][1-9]$/.test(square.coordinate)) {
        continue; // Skip non-Deep Desert squares
      }
      
      if (square.screenshot_url) urls.push(square.screenshot_url);
      if (square.original_screenshot_url) urls.push(square.original_screenshot_url);
    }
  }

  // Get comment images
  let comments: any[] = [];
  if (pois.length > 0) {
    const poiIds = pois.map(p => p.id);
    const { data } = await supabase.from('comments').select('*').in('poi_id', poiIds);
    comments = [...comments, ...(data || [])];
  }

  // For deep_desert, also get grid square comments
  if (mapType === 'deep_desert' || mapType === 'combined') {
    const { data: gridComments } = await supabase
      .from('comments')
      .select('*')
      .not('grid_square_id', 'is', null);
    comments = [...comments, ...(gridComments || [])];
  }

  if (comments.length > 0) {
    const commentIds = comments.map(c => c.id);
    
    // Get comment image links and managed images
    const { data: commentImageLinks } = await supabase
      .from('comment_image_links')
      .select('image_id, managed_images(original_url, processed_url)')
      .in('comment_id', commentIds);

    for (const link of commentImageLinks || []) {
      const image = link.managed_images;
      if (image?.original_url) urls.push(image.original_url);
      if (image?.processed_url) urls.push(image.processed_url);
    }
  }

  return Array.from(new Set(urls)); // Remove duplicates
}

async function deleteData(supabase: any, mapType: string) {
  const deletedCounts = {
    comment_image_links: 0,
    poi_image_links: 0,
    managed_images: 0,
    poi_entity_links: 0,
    comments: 0,
    pois: 0,
    grid_squares: 0,
  };

  // Get POIs to delete
  let poisToDelete: any[] = [];
  if (mapType === 'combined') {
    const { data } = await supabase.from('pois').select('id');
    poisToDelete = data || [];
  } else {
    const { data } = await supabase.from('pois').select('id').eq('map_type', mapType);
    poisToDelete = data || [];
  }

  const poiIds = poisToDelete.map(p => p.id);

  // Get grid squares to delete (Deep Desert only)
  let gridSquaresToDelete: any[] = [];
  if (mapType === 'deep_desert' || mapType === 'combined') {
    const { data: squares } = await supabase.from('grid_squares').select('id, coordinate');
    if (mapType === 'deep_desert') {
      gridSquaresToDelete = (squares || []).filter(s => /^[A-I][1-9]$/.test(s.coordinate));
    } else {
      gridSquaresToDelete = squares || [];
    }
  }

  const gridSquareIds = gridSquaresToDelete.map(s => s.id);

  // Get comments to delete
  let commentsToDelete: any[] = [];
  if (poiIds.length > 0) {
    const { data } = await supabase.from('comments').select('id').in('poi_id', poiIds);
    commentsToDelete = [...commentsToDelete, ...(data || [])];
  }
  if (gridSquareIds.length > 0) {
    const { data } = await supabase.from('comments').select('id').in('grid_square_id', gridSquareIds);
    commentsToDelete = [...commentsToDelete, ...(data || [])];
  }

  const commentIds = commentsToDelete.map(c => c.id);

  // Delete in proper order (respect foreign keys)

  // 1. Delete comment image links
  if (commentIds.length > 0) {
    const { error } = await supabase.from('comment_image_links').delete().in('comment_id', commentIds);
    if (!error) {
      deletedCounts.comment_image_links = commentIds.length;
    }
  }

  // 2. Delete POI image links
  if (poiIds.length > 0) {
    const { error } = await supabase.from('poi_image_links').delete().in('poi_id', poiIds);
    if (!error) {
      deletedCounts.poi_image_links = poiIds.length;
    }
  }

  // 3. Delete managed images (orphaned ones)
  const { data: orphanedImages } = await supabase
    .from('managed_images')
    .select('id')
    .not('id', 'in', `(SELECT image_id FROM poi_image_links UNION SELECT image_id FROM comment_image_links)`);
  
  if (orphanedImages && orphanedImages.length > 0) {
    const orphanedIds = orphanedImages.map(i => i.id);
    const { error } = await supabase.from('managed_images').delete().in('id', orphanedIds);
    if (!error) {
      deletedCounts.managed_images = orphanedIds.length;
    }
  }

  // 4. Delete POI entity links
  if (poiIds.length > 0) {
    const { error } = await supabase.from('poi_entity_links').delete().in('poi_id', poiIds);
    if (!error) {
      deletedCounts.poi_entity_links = poiIds.length;
    }
  }

  // 5. Delete comments
  if (commentIds.length > 0) {
    const { error } = await supabase.from('comments').delete().in('id', commentIds);
    if (!error) {
      deletedCounts.comments = commentIds.length;
    }
  }

  // 6. Delete POIs
  if (poiIds.length > 0) {
    if (mapType === 'combined') {
      const { error } = await supabase.from('pois').delete().not('id', 'is', null);
      if (!error) {
        deletedCounts.pois = poiIds.length;
      }
    } else {
      const { error } = await supabase.from('pois').delete().eq('map_type', mapType);
      if (!error) {
        deletedCounts.pois = poiIds.length;
      }
    }
  }

  // 7. Delete grid squares (Deep Desert only)
  if (gridSquareIds.length > 0) {
    if (mapType === 'deep_desert') {
      // Delete only Deep Desert squares
      const coordinates = gridSquaresToDelete.map(s => s.coordinate);
      const { error } = await supabase.from('grid_squares').delete().in('coordinate', coordinates);
      if (!error) {
        deletedCounts.grid_squares = coordinates.length;
      }
    } else if (mapType === 'combined') {
      const { error } = await supabase.from('grid_squares').delete().not('id', 'is', null);
      if (!error) {
        deletedCounts.grid_squares = gridSquareIds.length;
      }
    }
  }

  return deletedCounts;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { mapType, confirmText } = await req.json();
    
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
    const validMapTypes = ['deep_desert', 'hagga_basin'];
    if (!validMapTypes.includes(mapType)) {
      return new Response(JSON.stringify({
        success: false,
        error: `Invalid map type: ${mapType}. Valid types: ${validMapTypes.join(', ')}`
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate confirmation text
    const expectedText = `DELETE ${mapType.toUpperCase().replace('_', ' ')}`;
    if (confirmText !== expectedText) {
      return new Response(JSON.stringify({
        success: false,
        error: `Confirmation text must be exactly: "${expectedText}"`
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Collect files to delete first
    const fileUrls: string[] = [];

    // Get grid square files (for deep_desert)
    if (mapType === 'deep_desert') {
      const { data: squares } = await supabase
        .from('grid_squares')
        .select('screenshot_url, original_screenshot_url')
        .not('screenshot_url', 'is', null);
      
      for (const square of squares || []) {
        if (square.screenshot_url) fileUrls.push(square.screenshot_url);
        if (square.original_screenshot_url) fileUrls.push(square.original_screenshot_url);
      }
    }

    // Get POI managed images
    const { data: pois } = await supabase
      .from('pois')
      .select('id')
      .eq('map_type', mapType);

    if (pois && pois.length > 0) {
      const poiIds = pois.map(p => p.id);
      
      // Get POI image links
      const { data: poiImageLinks } = await supabase
        .from('poi_image_links')
        .select('image_id')
        .in('poi_id', poiIds);

      if (poiImageLinks && poiImageLinks.length > 0) {
        const imageIds = poiImageLinks.map(l => l.image_id);
        
        // Get managed images
        const { data: managedImages } = await supabase
          .from('managed_images')
          .select('original_url, processed_url')
          .in('id', imageIds);

        for (const image of managedImages || []) {
          if (image.original_url) fileUrls.push(image.original_url);
          if (image.processed_url) fileUrls.push(image.processed_url);
        }
      }
    }

    // Delete files
    const { deletedFiles, failedFiles } = await deleteFiles(supabase, fileUrls);

    // Delete database records in proper order
    let deletedRecords = 0;

    // Count and delete POI entity links
    if (pois && pois.length > 0) {
      const poiIds = pois.map(p => p.id);
      
      // Count first
      const { count: entityLinksCount } = await supabase
        .from('poi_entity_links')
        .select('*', { count: 'exact', head: true })
        .in('poi_id', poiIds);
      
      // Then delete
      await supabase
        .from('poi_entity_links')
        .delete()
        .in('poi_id', poiIds);
      
      deletedRecords += entityLinksCount || 0;
    }

    // Count and delete POI image links
    if (pois && pois.length > 0) {
      const poiIds = pois.map(p => p.id);
      
      // Count first
      const { count: imageLinksCount } = await supabase
        .from('poi_image_links')
        .select('*', { count: 'exact', head: true })
        .in('poi_id', poiIds);
      
      // Then delete
      await supabase
        .from('poi_image_links')
        .delete()
        .in('poi_id', poiIds);
      
      deletedRecords += imageLinksCount || 0;
    }

    // Count and delete POI comments
    if (pois && pois.length > 0) {
      const poiIds = pois.map(p => p.id);
      
      // Count first
      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .in('poi_id', poiIds);
      
      // Then delete
      await supabase
        .from('comments')
        .delete()
        .in('poi_id', poiIds);
      
      deletedRecords += commentsCount || 0;
    }

    // Count and delete grid square comments (for deep_desert)
    if (mapType === 'deep_desert') {
      // Count first
      const { count: gridCommentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .not('grid_square_id', 'is', null);
      
      // Then delete
      await supabase
        .from('comments')
        .delete()
        .not('grid_square_id', 'is', null);
      
      deletedRecords += gridCommentsCount || 0;
    }

    // Count and delete comment image links (for all comments being deleted)
    let commentImageLinksCount = 0;
    if (pois && pois.length > 0) {
      const poiIds = pois.map(p => p.id);
      
      // Get comments for POIs
      const { data: poiComments } = await supabase
        .from('comments')
        .select('id')
        .in('poi_id', poiIds);
      
      if (poiComments && poiComments.length > 0) {
        const commentIds = poiComments.map(c => c.id);
        
        // Count comment image links
        const { count: poiCommentImageLinksCount } = await supabase
          .from('comment_image_links')
          .select('*', { count: 'exact', head: true })
          .in('comment_id', commentIds);
        
        // Delete comment image links
        await supabase
          .from('comment_image_links')
          .delete()
          .in('comment_id', commentIds);
        
        commentImageLinksCount += poiCommentImageLinksCount || 0;
      }
    }

    // For deep_desert, also handle grid square comment image links
    if (mapType === 'deep_desert') {
      // Get grid square comments
      const { data: gridComments } = await supabase
        .from('comments')
        .select('id')
        .not('grid_square_id', 'is', null);
      
      if (gridComments && gridComments.length > 0) {
        const commentIds = gridComments.map(c => c.id);
        
        // Count comment image links
        const { count: gridCommentImageLinksCount } = await supabase
          .from('comment_image_links')
          .select('*', { count: 'exact', head: true })
          .in('comment_id', commentIds);
        
        // Delete comment image links
        await supabase
          .from('comment_image_links')
          .delete()
          .in('comment_id', commentIds);
        
        commentImageLinksCount += gridCommentImageLinksCount || 0;
      }
    }

    deletedRecords += commentImageLinksCount;

    // Delete orphaned managed_images (after all link tables are cleaned up)
    const { data: orphanedImages } = await supabase
      .from('managed_images')
      .select('id')
      .not('id', 'in', `(
        SELECT image_id FROM poi_image_links 
        UNION 
        SELECT image_id FROM comment_image_links
      )`);
    
    let orphanedImagesCount = 0;
    if (orphanedImages && orphanedImages.length > 0) {
      const orphanedIds = orphanedImages.map(i => i.id);
      
      await supabase
        .from('managed_images')
        .delete()
        .in('id', orphanedIds);
      
      orphanedImagesCount = orphanedIds.length;
    }

    deletedRecords += orphanedImagesCount;

    // Count and delete POIs
    const poiCount = pois ? pois.length : 0;
    if (poiCount > 0) {
      await supabase
        .from('pois')
        .delete()
        .eq('map_type', mapType);
      
      deletedRecords += poiCount;
    }

    // Count and delete grid squares (for deep_desert)
    if (mapType === 'deep_desert') {
      // Count first
      const { count: gridSquaresCount } = await supabase
        .from('grid_squares')
        .select('*', { count: 'exact', head: true });
      
      // Then delete
      await supabase
        .from('grid_squares')
        .delete()
        .not('id', 'is', null); // Delete all
      
      deletedRecords += gridSquaresCount || 0;
    }

    const stats = {
      deletedRecords,
      deletedFiles: deletedFiles.length,
      failedFiles: failedFiles.length,
      breakdown: {
        poiEntityLinks: deletedRecords > 0 ? 'included' : 0,
        poiImageLinks: deletedRecords > 0 ? 'included' : 0,
        commentImageLinks: commentImageLinksCount,
        orphanedManagedImages: orphanedImagesCount,
        comments: deletedRecords > 0 ? 'included' : 0,
        pois: poiCount,
        gridSquares: mapType === 'deep_desert' ? 'included' : 0,
      },
    };

    const warnings: string[] = [];
    if (failedFiles.length > 0) {
      warnings.push(`Failed to delete ${failedFiles.length} files`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Reset completed for ${mapType}`,
      stats,
      warnings: warnings.length > 0 ? warnings : undefined,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Reset failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}); 