const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://urgmimdahjhaecwepsov.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZ21pbWRhaGpoYWVjd2Vwc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI1NjU3OTUsImV4cCI6MjAxODE0MTc5NX0.GORv4K1J3i4Ny5-bkCNTL90VFGQ0i8Dzy4rJHTCYhYo'
);

async function checkEntityIcons() {
  console.log('📋 Checking entity icons...');
  
  // Check entities with icons
  const { data: entitiesWithIcons, error: iconsError } = await supabase
    .from('entities')
    .select('id, name, icon, category')
    .not('icon', 'is', null)
    .limit(10);
    
  if (iconsError) {
    console.error('❌ Error fetching entities with icons:', iconsError);
  } else {
    console.log(`✅ Found ${entitiesWithIcons?.length || 0} entities with icons`);
    entitiesWithIcons?.forEach((entity, idx) => {
      console.log(`   ${idx + 1}. ${entity.name}: ${entity.icon}`);
    });
  }
  
  console.log('\n📊 Checking total entity counts...');
  
  // Get total counts
  const { count: totalCount, error: countError } = await supabase
    .from('entities')
    .select('*', { count: 'exact', head: true });
    
  if (countError) {
    console.error('❌ Error getting total count:', countError);
  } else {
    console.log(`📈 Total entities: ${totalCount}`);
  }
  
  // Check entities without icons
  const { count: noIconCount, error: noIconError } = await supabase
    .from('entities')
    .select('*', { count: 'exact', head: true })
    .is('icon', null);
    
  if (noIconError) {
    console.error('❌ Error getting no-icon count:', noIconError);
  } else {
    console.log(`📋 Entities without icons: ${noIconCount}`);
    console.log(`🎨 Entities with icons: ${totalCount - noIconCount}`);
  }
  
  // Sample entities without icons
  const { data: entitiesWithoutIcons, error: noIconSampleError } = await supabase
    .from('entities')
    .select('id, name, category, is_schematic')
    .is('icon', null)
    .limit(5);
    
  if (noIconSampleError) {
    console.error('❌ Error fetching entities without icons:', noIconSampleError);
  } else {
    console.log('\n📂 Sample entities without icons:');
    entitiesWithoutIcons?.forEach((entity, idx) => {
      console.log(`   ${idx + 1}. ${entity.name} (${entity.category}) - ${entity.is_schematic ? 'Schematic' : 'Item'}`);
    });
  }
}

checkEntityIcons().catch(console.error); 