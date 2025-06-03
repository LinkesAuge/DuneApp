// Entities API Test Component
import React, { useState, useEffect } from 'react';
import { entitiesAPI, EntityAPIError } from '../../lib/api/entities';
import type { Entity, EntityStats } from '../../types/unified-entities';

const EntitiesAPITest: React.FC = () => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [stats, setStats] = useState<EntityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    setLoading(true);
    setError(null);
    const results: string[] = [];

    try {
      // Test 1: Get all entities (first 10)
      results.push('🧪 Testing Unified Entities API...');
      results.push('');

      results.push('📋 Test 1: Get all entities (first 10)');
      const entitiesResponse = await entitiesAPI.getAll({ limit: 10 });
      setEntities(entitiesResponse.data);
      results.push(`✅ Success! Found ${entitiesResponse.total} total entities`);
      results.push(`📊 Retrieved ${entitiesResponse.data.length} entities`);
      if (entitiesResponse.data.length > 0) {
        results.push(`🔍 First entity: ${entitiesResponse.data[0].name} (${entitiesResponse.data[0].category})`);
        results.push(`🔍 Last entity: ${entitiesResponse.data[entitiesResponse.data.length - 1].name} (${entitiesResponse.data[entitiesResponse.data.length - 1].category})`);
      }
      results.push('');

      // Test 2: Get items only
      results.push('📦 Test 2: Get items only (first 5)');
      const itemsResponse = await entitiesAPI.getAll({ is_schematic: false, limit: 5 });
      results.push(`✅ Success! Found ${itemsResponse.data.length} items`);
      itemsResponse.data.forEach((item, idx) => {
        results.push(`   ${idx + 1}. ${item.name} (Tier ${item.tier_number}, ${item.category})`);
      });
      results.push('');

      // Test 3: Get schematics only
      results.push('📋 Test 3: Get schematics only (first 5)');
      const schematicsResponse = await entitiesAPI.getAll({ is_schematic: true, limit: 5 });
      results.push(`✅ Success! Found ${schematicsResponse.data.length} schematics`);
      schematicsResponse.data.forEach((schematic, idx) => {
        results.push(`   ${idx + 1}. ${schematic.name} (Tier ${schematic.tier_number}, ${schematic.category})`);
      });
      results.push('');

      // Test 4: Search functionality
      results.push('🔍 Test 4: Search for "sword"');
      const searchResults = await entitiesAPI.search('sword');
      results.push(`✅ Success! Found ${searchResults.length} entities matching "sword"`);
      searchResults.forEach((result, idx) => {
        results.push(`   ${idx + 1}. ${result.name} (${result.is_schematic ? 'Schematic' : 'Item'}, ${result.category})`);
      });
      results.push('');

      // Test 5: Get tiers
      results.push('🏆 Test 5: Get all tiers');
      const tiers = await entitiesAPI.getTiers();
      results.push(`✅ Success! Found ${tiers.length} tiers`);
      tiers.forEach((tier) => {
        results.push(`   T${tier.tier_number}: ${tier.tier_name}`);
      });
      results.push('');

      // Test 6: Get categories
      results.push('📂 Test 6: Get unique categories');
      const categories = await entitiesAPI.getCategories();
      results.push(`✅ Success! Found ${categories.length} unique categories`);
      categories.slice(0, 10).forEach((category, idx) => {
        results.push(`   ${idx + 1}. ${category}`);
      });
      if (categories.length > 10) {
        results.push(`   ... and ${categories.length - 10} more categories`);
      }
      results.push('');

      // Test 7: Get statistics
      results.push('📊 Test 7: Get entity statistics');
      const entityStats = await entitiesAPI.getStats();
      setStats(entityStats);
      results.push(`✅ Success! Generated statistics`);
      results.push(`   Total entities: ${entityStats.total_entities}`);
      results.push(`   Items: ${entityStats.total_items}`);
      results.push(`   Schematics: ${entityStats.total_schematics}`);
      results.push('');

      results.push('🎉 All tests completed successfully!');

    } catch (err) {
      console.error('Test error:', err);
      if (err instanceof EntityAPIError) {
        setError(err.message);
        results.push(`❌ Error: ${err.message}`);
      } else {
        setError('Failed to run tests. Please check console for details.');
        results.push('❌ Error: Failed to run tests. Please check console for details.');
      }
    } finally {
      setLoading(false);
      setTestResults(results);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-amber-100">
            Unified Entities API Test
          </h2>
          <button
            onClick={runTests}
            disabled={loading}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Running Tests...' : 'Run Tests'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg">
            <p className="text-red-300">Error: {error}</p>
          </div>
        )}

        {/* Test Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Console Output */}
          <div>
            <h3 className="text-lg font-semibold text-amber-200 mb-3">Test Console</h3>
            <div className="bg-black/60 border border-slate-600 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
              {testResults.map((result, idx) => (
                <div key={idx} className="text-green-300">
                  {result}
                </div>
              ))}
            </div>
          </div>

          {/* Entity Samples */}
          <div>
            <h3 className="text-lg font-semibold text-amber-200 mb-3">Sample Entities</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {entities.map((entity) => (
                <div
                  key={entity.id}
                  className="bg-slate-800 border border-slate-600 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-amber-100">{entity.name}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      entity.is_schematic 
                        ? 'bg-blue-500/20 text-blue-300' 
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {entity.is_schematic ? 'Schematic' : 'Item'}
                    </span>
                  </div>
                  <div className="text-sm text-amber-200/60 mt-1">
                    {entity.category} • Tier {entity.tier_number}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-amber-200 mb-3">Entity Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-100">{stats.total_entities}</div>
                <div className="text-sm text-amber-200/60">Total Entities</div>
              </div>
              <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-100">{stats.total_items}</div>
                <div className="text-sm text-amber-200/60">Items</div>
              </div>
              <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-100">{stats.total_schematics}</div>
                <div className="text-sm text-blue-200/60">Schematics</div>
              </div>
              <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-100">{Object.keys(stats.entities_by_category).length}</div>
                <div className="text-sm text-green-200/60">Categories</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntitiesAPITest; 