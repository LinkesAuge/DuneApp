const { createClient } = require('@supabase/supabase-js');

// Use the environment variables that the main app uses
const supabaseUrl = 'https://urgmimdahjhaecwepsov.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZ21pbWRhaGpoYWVjd2Vwc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NzU2MzYsImV4cCI6MjA1MTE1MTYzNn0.YeaYs7w3lE2z5xeXJaLwEf_-lK_7D-8t4DLy_n69qRY';

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('Debugging poi_entity_links JOIN issue...\n');
  
  // Test the problematic IDs from the error
  const testPoiId = "4bcac589-f8eb-4b64-9c48-3a069202dfaf";
  const testEntityId = "a5112739-5dd8-48d7-9e45-69de92edecab";
  
  // Check if POI exists
  console.log('1. Checking if POI exists...');
  const { data: poiData, error: poiError } = await supabase
    .from('pois')
    .select('id, title, map_type')
    .eq('id', testPoiId)
    .single();
  
  if (poiError) {
    console.log('❌ POI error:', poiError.message);
  } else {
    console.log('✅ POI found:', poiData);
  }
  
  // Check if Entity exists
  console.log('\n2. Checking if Entity exists...');
  const { data: entityData, error: entityError } = await supabase
    .from('entities')
    .select('id, name, is_schematic')
    .eq('id', testEntityId)
    .single();
  
  if (entityError) {
    console.log('❌ Entity error:', entityError.message);
  } else {
    console.log('✅ Entity found:', entityData);
  }
  
  // Test the join query directly
  console.log('\n3. Testing JOIN query...');
  const { data: joinData, error: joinError } = await supabase
    .from('poi_entity_links')
    .select(`
      *,
      pois (
        id,
        title,
        map_type
      ),
      entities (
        id,
        name,
        is_schematic
      )
    `)
    .eq('poi_id', testPoiId)
    .eq('entity_id', testEntityId)
    .limit(1);
  
  if (joinError) {
    console.log('❌ JOIN error:', joinError.message);
  } else {
    console.log('✅ JOIN result:', JSON.stringify(joinData, null, 2));
  }
  
  // Count total links
  console.log('\n4. Counting total links...');
  const { count, error: countError } = await supabase
    .from('poi_entity_links')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.log('❌ Count error:', countError.message);
  } else {
    console.log('📊 Total poi_entity_links:', count);
  }
})(); 