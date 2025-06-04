const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://urgmimdahjhaecwepsov.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZ21pbWRhaGpoYWVjd2Vwc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NzU2MzYsImV4cCI6MjA1MTE1MTYzNn0.YeaYs7w3lE2z5xeXJaLwEf_-lK_7D-8t4DLy_n69qRY';
const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('Testing simple poi_entity_links query...');
  
  // First test basic access
  const { data, error, count } = await supabase
    .from('poi_entity_links')
    .select('*', { count: 'exact' })
    .limit(3);
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Total count:', count);
    console.log('Sample data:', JSON.stringify(data, null, 2));
  }
})(); 