// Database Migration Script - Integrate Entities with Shared Images System
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://urgmimdahjhaecwepsov.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZ21pbWRhaGpoYWVjd2Vwc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI1NjU3OTUsImV4cCI6MjAxODE0MTc5NX0.GORv4K1J3i4Ny5-bkCNTL90VFGQ0i8Dzy4rJHTCYhYo'
);

async function migrateEntitiesToSharedImages() {
  console.log('🔄 Starting entities table migration to shared images system...');
  
  try {
    // Step 1: Check current entities table structure
    console.log('\n📋 Step 1: Checking current entities table structure...');
    const { data: entities, error: entitiesError } = await supabase
      .from('entities')
      .select('id, name, icon')
      .limit(5);
      
    if (entitiesError) {
      console.error('❌ Error checking entities:', entitiesError);
      return;
    }
    
    console.log(`✅ Found ${entities.length} sample entities`);
    console.log('Sample entities:', entities.map(e => ({ name: e.name, icon: e.icon })));
    
    // Step 2: Check if shared_images table exists and has data
    console.log('\n📋 Step 2: Checking shared_images system...');
    const { data: sharedImages, error: sharedImagesError } = await supabase
      .from('shared_images')
      .select('id, name, type')
      .limit(3);
      
    if (sharedImagesError) {
      console.error('❌ Error checking shared_images:', sharedImagesError);
      console.log('🔧 This migration requires the shared_images system to be installed first.');
      return;
    }
    
    console.log(`✅ Shared images system operational with ${sharedImages.length} sample images`);
    
    // Step 3: Execute migration SQL manually (since we can't execute DDL with standard client)
    console.log('\n📋 Step 3: Database migration required...');
    console.log('⚠️  Please execute the following SQL in your Supabase SQL Editor:');
    console.log('\n' + '='.repeat(60));
    console.log(`
-- Add shared images fields to entities table
ALTER TABLE entities 
  ADD COLUMN IF NOT EXISTS icon_image_id UUID REFERENCES shared_images(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS icon_fallback VARCHAR(50);

-- Migrate existing icon data to fallback field
UPDATE entities 
SET icon_fallback = icon 
WHERE icon IS NOT NULL AND icon != '';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_entities_icon_image_id ON entities(icon_image_id);

-- Add column comments for documentation
COMMENT ON COLUMN entities.icon_image_id IS 'Reference to shared image for entity icon';
COMMENT ON COLUMN entities.icon_fallback IS 'Fallback text/emoji icon when no image is selected';
`);
    console.log('='.repeat(60));
    
    // Step 4: Try to verify if migration was already done
    console.log('\n📋 Step 4: Checking if migration already applied...');
    const { data: testQuery, error: testError } = await supabase
      .from('entities')
      .select('icon_image_id, icon_fallback')
      .limit(1);
      
    if (!testError) {
      console.log('✅ Migration appears to be already applied!');
      console.log('📊 Verifying migration results...');
      
      // Get migration stats
      const { data: stats, error: statsError } = await supabase
        .from('entities')
        .select('icon_fallback, icon_image_id')
        .limit(1000);
        
      if (!statsError && stats) {
        const totalEntities = stats.length;
        const withFallback = stats.filter(e => e.icon_fallback).length;
        const withSharedImage = stats.filter(e => e.icon_image_id).length;
        
        console.log(`📈 Migration Results:`);
        console.log(`   - Total entities: ${totalEntities}`);
        console.log(`   - With fallback icons: ${withFallback}`);
        console.log(`   - With shared images: ${withSharedImage}`);
        console.log(`   - Ready for shared images: ${totalEntities}`);
      }
    } else {
      console.log('⏳ Migration has not been applied yet.');
      console.log('Please run the SQL above in Supabase SQL Editor and then run this script again.');
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  }
}

migrateEntitiesToSharedImages().catch(console.error); 