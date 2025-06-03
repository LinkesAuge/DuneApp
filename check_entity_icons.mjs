import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use the same configuration as the frontend
const SUPABASE_URL = "https://urgmimdahjhaecwepsov.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZ21pbWRhaGpoYWVjd2Vwc282Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0MTI1NjQsImV4cCI6MjA1MDk4ODU2NH0.r-c-pEFo9xNKO6rnl8LhQYJAH7YTvZxXKJreCMbAV3M";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkEntityIcons() {
  console.log('🔍 Checking entity icons setup...\n');
  
  try {
    // 1. Check how many entities have icons
    console.log('1️⃣ Checking entities with icon references...');
    const { data: entitiesWithIcons, error: entitiesError } = await supabase
      .from('entities')
      .select('id, name, icon, icon_image_id, icon_fallback')
      .neq('icon', null)
      .limit(10);

    if (entitiesError) {
      console.error('❌ Error fetching entities:', entitiesError);
      return;
    }

    console.log(`📊 Found ${entitiesWithIcons.length} entities with icon references (showing first 10):`);
    entitiesWithIcons.forEach(entity => {
      console.log(`   📦 ${entity.name}`);
      console.log(`      Icon file: ${entity.icon}`);
      console.log(`      Icon ID: ${entity.icon_image_id || 'null'}`);
      console.log(`      Fallback: ${entity.icon_fallback || 'null'}`);
      console.log('');
    });

    // 2. Check local icons
    console.log('2️⃣ Checking local icon files...');
    const iconsDir = path.join(__dirname, 'public', 'assets', 'entity-icons');
    
    if (!fs.existsSync(iconsDir)) {
      console.log('❌ Icons directory not found:', iconsDir);
      return;
    }
    
    const localIcons = fs.readdirSync(iconsDir).filter(file => file.endsWith('.webp'));
    console.log(`📁 Found ${localIcons.length} local icon files`);
    
    // 3. Check which entities have local icons available
    console.log('3️⃣ Checking icon availability...');
    let hasLocalIcon = 0;
    let missingLocalIcon = 0;
    
    entitiesWithIcons.forEach(entity => {
      if (localIcons.includes(entity.icon)) {
        hasLocalIcon++;
      } else {
        missingLocalIcon++;
        console.log(`   ⚠️  Missing local icon: ${entity.icon} (${entity.name})`);
      }
    });
    
    console.log(`✅ Entities with local icons available: ${hasLocalIcon}`);
    console.log(`⚠️  Entities missing local icons: ${missingLocalIcon}`);
    
    // 4. Check existing shared images for entities
    console.log('\n4️⃣ Checking existing shared images...');
    const { data: sharedImages, error: sharedError } = await supabase
      .from('shared_images')
      .select('id, filename, image_type, tags')
      .eq('image_type', 'entity-icon')
      .eq('is_active', true);
      
    if (sharedError) {
      console.error('❌ Error fetching shared images:', sharedError);
    } else {
      console.log(`🖼️  Found ${sharedImages.length} existing entity-icon shared images`);
    }
    
    // 5. Sample icons to process
    console.log('\n5️⃣ Sample entities ready for icon upload:');
    const sampleEntities = entitiesWithIcons
      .filter(entity => localIcons.includes(entity.icon) && !entity.icon_image_id)
      .slice(0, 5);
      
    if (sampleEntities.length === 0) {
      console.log('🎉 All entities already have icon_image_id or no local icons available!');
    } else {
      console.log(`📋 ${sampleEntities.length} entities ready for processing:`);
      sampleEntities.forEach(entity => {
        console.log(`   📦 ${entity.name} → ${entity.icon}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkEntityIcons(); 