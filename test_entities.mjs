import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://urgmimdahjhaecwepsov.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZ21pbWRhaGpoYWVjd2Vwc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0MTI1NjQsImV4cCI6MjA1MDk4ODU2NH0.r-c-pEFo9xNKO6rnl8LhQYJAH7YTvZxXKJreCMbAV3M'
);

async function checkEntities() {
  try {
    console.log('Checking entities table...');
    
    const { data, error, count } = await supabase
      .from('entities')
      .select('id, name, category, type, is_schematic, tier_number', { count: 'exact' })
      .limit(5);
    
    console.log('Total entities count:', count);
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('Sample entities:');
      data.forEach(entity => {
        console.log(`- ${entity.name} (${entity.is_schematic ? 'Schematic' : 'Item'}) - ${entity.category}/${entity.type} T${entity.tier_number}`);
      });
    } else {
      console.log('No entities found in database');
    }
    
    // Check items specifically
    const { data: items, count: itemCount } = await supabase
      .from('entities')
      .select('*', { count: 'exact' })
      .eq('is_schematic', false)
      .limit(3);
    
    console.log('Items count:', itemCount);
    
    // Check schematics specifically  
    const { data: schematics, count: schematicCount } = await supabase
      .from('entities')
      .select('*', { count: 'exact' })
      .eq('is_schematic', true)
      .limit(3);
    
    console.log('Schematics count:', schematicCount);
    
  } catch (err) {
    console.error('Connection error:', err);
  }
}

checkEntities(); 