// Quick test script for Unified Entities API
// Run with: node test_entities_api.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://urgmimdahjhaecwepsov.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZ21pbWRhaGpoYWVjd2Vwc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI1NjU3OTUsImV4cCI6MjAxODE0MTc5NX0.GORv4K1J3i4Ny5-bkCNTL90VFGQ0i8Dzy4rJHTCYhYo'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testEntitiesAPI() {
  console.log('🧪 Testing Unified Entities API...\n')

  try {
    // Test 1: Get all entities with pagination
    console.log('📋 Test 1: Get all entities (first 10)')
    const { data: entities, error: entitiesError, count } = await supabase
      .from('entities')
      .select('*', { count: 'exact' })
      .range(0, 9)
      .order('name', { ascending: true })

    if (entitiesError) {
      console.error('❌ Error fetching entities:', entitiesError)
      return
    }

    console.log(`✅ Success! Found ${count} total entities`)
    console.log(`📊 Retrieved ${entities?.length || 0} entities`)
    if (entities && entities.length > 0) {
      console.log(`🔍 First entity: ${entities[0].name} (${entities[0].category})`)
      console.log(`🔍 Last entity: ${entities[entities.length - 1].name} (${entities[entities.length - 1].category})`)
    }
    console.log('')

    // Test 2: Get items only
    console.log('📦 Test 2: Get items only (first 5)')
    const { data: items, error: itemsError } = await supabase
      .from('entities')
      .select('*')
      .eq('is_schematic', false)
      .range(0, 4)
      .order('name', { ascending: true })

    if (itemsError) {
      console.error('❌ Error fetching items:', itemsError)
      return
    }

    console.log(`✅ Success! Found ${items?.length || 0} items`)
    if (items && items.length > 0) {
      items.forEach((item, idx) => {
        console.log(`   ${idx + 1}. ${item.name} (Tier ${item.tier_number}, ${item.category})`)
      })
    }
    console.log('')

    // Test 3: Get schematics only
    console.log('📋 Test 3: Get schematics only (first 5)')
    const { data: schematics, error: schematicsError } = await supabase
      .from('entities')
      .select('*')
      .eq('is_schematic', true)
      .range(0, 4)
      .order('name', { ascending: true })

    if (schematicsError) {
      console.error('❌ Error fetching schematics:', schematicsError)
      return
    }

    console.log(`✅ Success! Found ${schematics?.length || 0} schematics`)
    if (schematics && schematics.length > 0) {
      schematics.forEach((schematic, idx) => {
        console.log(`   ${idx + 1}. ${schematic.name} (Tier ${schematic.tier_number}, ${schematic.category})`)
      })
    }
    console.log('')

    // Test 4: Search functionality
    console.log('🔍 Test 4: Search for "sword"')
    const { data: searchResults, error: searchError } = await supabase
      .from('entities')
      .select('*')
      .or('name.ilike.%sword%,description.ilike.%sword%,category.ilike.%sword%,type.ilike.%sword%')
      .order('name', { ascending: true })

    if (searchError) {
      console.error('❌ Error searching entities:', searchError)
      return
    }

    console.log(`✅ Success! Found ${searchResults?.length || 0} entities matching "sword"`)
    if (searchResults && searchResults.length > 0) {
      searchResults.forEach((result, idx) => {
        console.log(`   ${idx + 1}. ${result.name} (${result.is_schematic ? 'Schematic' : 'Item'}, ${result.category})`)
      })
    }
    console.log('')

    // Test 5: Get tiers
    console.log('🏆 Test 5: Get all tiers')
    const { data: tiers, error: tiersError } = await supabase
      .from('tiers')
      .select('*')
      .order('tier_number', { ascending: true })

    if (tiersError) {
      console.error('❌ Error fetching tiers:', tiersError)
      return
    }

    console.log(`✅ Success! Found ${tiers?.length || 0} tiers`)
    if (tiers && tiers.length > 0) {
      tiers.forEach((tier) => {
        console.log(`   T${tier.tier_number}: ${tier.tier_name}`)
      })
    }
    console.log('')

    // Test 6: Get unique categories
    console.log('📂 Test 6: Get unique categories')
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('entities')
      .select('category')
      .not('category', 'is', null)

    if (categoriesError) {
      console.error('❌ Error fetching categories:', categoriesError)
      return
    }

    const categories = Array.from(new Set(
      (categoriesData || []).map(item => item.category).filter(Boolean)
    )).sort()

    console.log(`✅ Success! Found ${categories.length} unique categories`)
    categories.forEach((category, idx) => {
      console.log(`   ${idx + 1}. ${category}`)
    })

    console.log('\n🎉 All tests completed successfully!')
    console.log('📊 Summary:')
    console.log(`   Total entities: ${count}`)
    console.log(`   Items: ${items?.length || 0} (sample)`)
    console.log(`   Schematics: ${schematics?.length || 0} (sample)`)
    console.log(`   Search results: ${searchResults?.length || 0}`)
    console.log(`   Tiers: ${tiers?.length || 0}`)
    console.log(`   Categories: ${categories.length}`)

  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

// Run the test
testEntitiesAPI() 