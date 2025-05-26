const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Local Supabase configuration
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadBaseMap() {
  const imagePath = './hagga_basin_map.png';
  
  // Check if image file exists
  if (!fs.existsSync(imagePath)) {
    console.error('❌ Image file not found at:', imagePath);
    console.log('Please save your Hagga Basin map image as "hagga_basin_map.png" in the project root.');
    return;
  }

  try {
    console.log('📷 Uploading Hagga Basin base map...');
    
    // Read the image file
    const imageFile = fs.readFileSync(imagePath);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('screenshots')
      .upload('hagga-basin-base-map.png', imageFile, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/png'
      });

    if (error) {
      console.error('❌ Upload error:', error.message);
      return;
    }

    console.log('✅ Image uploaded successfully!');
    console.log('📍 Storage path:', data.path);
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('screenshots')
      .getPublicUrl('hagga-basin-base-map.png');
    
    console.log('🌐 Public URL:', urlData.publicUrl);
    console.log('');
    console.log('✨ Now run the migration to create the base map record:');
    console.log('   npx supabase db reset');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

uploadBaseMap(); 