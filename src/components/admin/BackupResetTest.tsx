import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, XCircle, AlertCircle, Play, RefreshCw, Database, HardDrive } from 'lucide-react';
import DiamondIcon from '../common/DiamondIcon';
import { useAuth } from '../auth/AuthProvider';

interface TestResults {
  phase: string;
  success: boolean;
  message: string;
  details?: any;
  timestamp: string;
}

interface TestData {
  poiIds: string[];
  commentIds: string[];
  entityIds: string[];
  imageIds: string[];
  linkIds: string[];
}

export default function BackupResetTest() {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const [results, setResults] = useState<TestResults[]>([]);
  const [testData, setTestData] = useState<TestData | null>(null);
  const [selectedMapType, setSelectedMapType] = useState<'deep_desert' | 'hagga_basin'>('deep_desert');

  const addResult = (phase: string, success: boolean, message: string, details?: any) => {
    const result: TestResults = {
      phase,
      success,
      message,
      details,
      timestamp: new Date().toISOString()
    };
    setResults(prev => [...prev, result]);
  };

  const createTestData = async (): Promise<TestData> => {
    setCurrentPhase('Creating test data...');
    
    try {
      // Check if user is authenticated
      if (!user?.id) {
        throw new Error('User must be authenticated to create test data');
      }

      // Get the first available POI type for the test
      const { data: poiTypes, error: poiTypesError } = await supabase
        .from('poi_types')
        .select('id')
        .limit(1);

      if (poiTypesError) throw poiTypesError;
      if (!poiTypes || poiTypes.length === 0) {
        throw new Error('No POI types available for testing');
      }

      // Get a grid square ID if testing Deep Desert
      let gridSquareId = null;
      if (selectedMapType === 'deep_desert') {
        const { data: gridSquares, error: gridError } = await supabase
          .from('grid_squares')
          .select('id')
          .limit(1);

        if (gridError) throw gridError;
        if (!gridSquares || gridSquares.length === 0) {
          throw new Error('No grid squares available for Deep Desert testing');
        }
        gridSquareId = gridSquares[0].id;
      }

      // Create POI data based on map type
      let poiData;
      if (selectedMapType === 'deep_desert') {
        poiData = {
          title: `Test POI - ${selectedMapType}`,
          description: 'Test POI created by backup/reset test',
          poi_type_id: poiTypes[0].id,
          coordinates_x: 100,
          coordinates_y: 100,
          grid_square_id: gridSquareId,
          created_by: user.id,
          map_type: selectedMapType,
          privacy_level: 'private'
        };
      } else {
        poiData = {
          title: `Test POI - ${selectedMapType}`,
          description: 'Test POI created by backup/reset test',
          poi_type_id: poiTypes[0].id,
          coordinates_x: 100,
          coordinates_y: 100,
          grid_square_id: null,
          created_by: user.id,
          map_type: selectedMapType,
          privacy_level: 'private'
        };
      }

      // Create test POI
      const { data: poi, error: poiError } = await supabase
        .from('pois')
        .insert(poiData)
        .select('id')
        .single();

      if (poiError) throw poiError;

      // Create test managed images
      const { data: images, error: imagesError } = await supabase
        .from('managed_images')
        .insert([
          {
            original_url: 'test/original1.jpg',
            processed_url: 'test/processed1.jpg',
            image_type: 'poi_screenshot',
            mime_type: 'image/jpeg'
          },
          {
            original_url: 'test/original2.jpg',
            image_type: 'comment_image',
            mime_type: 'image/jpeg'
          }
        ])
        .select('id');

      if (imagesError) throw imagesError;

      // Create POI image links
      await supabase
        .from('poi_image_links')
        .insert({
          poi_id: poi.id,
          image_id: images[0].id,
          display_order: 0
        });

      // Create test comment
      const { data: comment, error: commentError } = await supabase
        .from('comments')
        .insert({
          content: 'Test comment for backup/reset validation',
          poi_id: poi.id,
          created_by: user.id
        })
        .select('id')
        .single();

      if (commentError) throw commentError;

      // Create comment image links
      await supabase
        .from('comment_image_links')
        .insert({
          comment_id: comment.id,
          image_id: images[1].id
        });

      // Get test entity for POI entity links
      const { data: entities, error: entitiesError } = await supabase
        .from('entities')
        .select('id')
        .limit(2);

      if (entitiesError) throw entitiesError;

      // Create POI entity links
      const poiEntityLinks = [];
      if (entities.length > 0) {
        const { data: links, error: linksError } = await supabase
          .from('poi_entity_links')
          .insert([
            {
              poi_id: poi.id,
              entity_id: entities[0].id
            },
            entities.length > 1 ? {
              poi_id: poi.id,
              entity_id: entities[1].id
            } : null
          ].filter(Boolean))
          .select('poi_id, entity_id');

        if (linksError) throw linksError;
        poiEntityLinks.push(...(links || []));
      }

      const testData: TestData = {
        poiIds: [poi.id],
        commentIds: [comment.id],
        entityIds: entities.map(e => e.id),
        imageIds: images.map(img => img.id),
        linkIds: poiEntityLinks.map(link => `${link.poi_id}-${link.entity_id}`)
      };

      addResult('Create Test Data', true, `Created test data: 1 POI, 1 comment, 2 images, ${poiEntityLinks.length} entity links`, testData);
      return testData;

    } catch (error) {
      addResult('Create Test Data', false, `Failed to create test data: ${(error as Error).message}`);
      throw error;
    }
  };

  const testBackupFunction = async () => {
    setCurrentPhase('Testing backup function...');
    
    try {
      console.log('🔧 Testing backup function for map type:', selectedMapType);
      
      const response = await supabase.functions.invoke('perform-map-backup', {
        body: { mapType: selectedMapType }
      });

      console.log('📡 Backup function response:', response);
      
      if (response.error) {
        console.error('❌ Backup function error details:', {
          error: response.error,
          data: response.data,
          status: response.status,
          statusText: response.statusText
        });
        
        // Try to extract more details from the error
        let errorMessage = 'Backup failed with status 500';
        if (response.error?.message) {
          errorMessage = response.error.message;
        } else if (response.data?.error) {
          errorMessage = response.data.error;
        } else if (response.data?.details) {
          errorMessage = `${response.data.error || 'Backup failed'}: ${response.data.details}`;
        }
        
        throw new Error(errorMessage);
      }

      if (!response.data || !response.data.success) {
        console.error('❌ Backup function returned unsuccessful result:', response.data);
        throw new Error(response.data?.message || 'Backup function returned unsuccessful result');
      }


      return {
        success: true,
        message: response.data.message || 'Backup completed successfully',
        details: response.data
      };

    } catch (error: any) {
      console.error('💥 Backup function test error:', error);
      console.error('📋 Error stack:', error.stack);
      throw new Error(`Backup failed: ${error.message}`);
    }
  };

  // Quick health check for backup function
  const testBackupHealth = async () => {
    try {
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/perform-map-backup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mapType: 'test_health_check' }),
      });

      const responseText = await response.text();

      if (response.status === 200 || response.status === 400) {
        // Both 200 (success) and 400 (expected validation error) indicate function is responsive
        return true;
      } else {
        return false;
      }

    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  };

  // Debug function to test backup with direct fetch
  const debugBackupFunction = async () => {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 120000); // 120 second timeout

      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/perform-map-backup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mapType: selectedMapType }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }

      const responseData = JSON.parse(responseText);
      return responseData;

    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Request was aborted due to timeout');
      }
      throw error;
    }
  };

  const checkDataBeforeReset = async () => {
    setCurrentPhase('Checking data before reset...');
    
    try {
      const checks = await Promise.all([
        supabase.from('pois').select('id').eq('map_type', selectedMapType),
        supabase.from('poi_image_links').select('poi_id, image_id'),
        supabase.from('comment_image_links').select('comment_id, image_id'),
        supabase.from('poi_entity_links').select('poi_id, entity_id'),
        supabase.from('managed_images').select('id').in('image_type', ['poi_screenshot', 'comment_image'])
      ]);

      const beforeCounts = {
        pois: checks[0].data?.length || 0,
        poiImageLinks: checks[1].data?.length || 0,
        commentImageLinks: checks[2].data?.length || 0,
        poiEntityLinks: checks[3].data?.length || 0,
        managedImages: checks[4].data?.length || 0
      };

      addResult('Pre-Reset Check', true, 'Data inventory before reset', beforeCounts);
      return beforeCounts;

    } catch (error) {
      addResult('Pre-Reset Check', false, `Failed to check data: ${(error as Error).message}`);
      throw error;
    }
  };

  const testReset = async () => {
    setCurrentPhase('Testing reset function...');
    
    try {
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/perform-map-reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          mapType: selectedMapType,
          backupBeforeReset: false // Don't backup again since we already tested that
        }),
      });

      if (!response.ok) {
        throw new Error(`Reset failed with status ${response.status}`);
      }

      const result = await response.json();
      addResult('Reset Function', true, 'Reset completed successfully', result);
      return result;

    } catch (error) {
      addResult('Reset Function', false, `Reset failed: ${(error as Error).message}`);
      throw error;
    }
  };

  const checkDataAfterReset = async () => {
    setCurrentPhase('Checking for orphaned records...');
    
    try {
      const checks = await Promise.all([
        supabase.from('pois').select('id').eq('map_type', selectedMapType),
        supabase.from('poi_image_links').select('poi_id, image_id'),
        supabase.from('comment_image_links').select('comment_id, image_id'),
        supabase.from('poi_entity_links').select('poi_id, entity_id'),
        supabase.from('managed_images').select('id').in('image_type', ['poi_screenshot', 'comment_image']),
        selectedMapType === 'deep_desert' 
          ? supabase.from('grid_squares').select('id')
          : Promise.resolve({ data: [] })
      ]);

      const afterCounts = {
        pois: checks[0].data?.length || 0,
        poiImageLinks: checks[1].data?.length || 0,
        commentImageLinks: checks[2].data?.length || 0,
        poiEntityLinks: checks[3].data?.length || 0,
        managedImages: checks[4].data?.length || 0,
        gridSquares: checks[5].data?.length || 0
      };

      const isClean = selectedMapType === 'deep_desert' 
        ? Object.values(afterCounts).every(count => count === 0)
        : afterCounts.pois === 0 && afterCounts.poiImageLinks === 0 && 
          afterCounts.commentImageLinks === 0 && afterCounts.poiEntityLinks === 0;

      addResult(
        'Post-Reset Check', 
        isClean, 
        isClean ? 'No orphaned records found - clean reset!' : 'Orphaned records detected',
        afterCounts
      );

      return afterCounts;

    } catch (error) {
      addResult('Post-Reset Check', false, `Failed to check data: ${(error as Error).message}`);
      throw error;
    }
  };

  const runFullTest = async () => {
    setIsRunning(true);
    setResults([]);
    setCurrentPhase('Starting comprehensive backup/reset test...');

    try {
      // Phase 1: Create test data
      const createdTestData = await createTestData();
      setTestData(createdTestData);

      // Phase 2: Test backup
      await testBackupFunction();

      // Phase 3: Check data before reset
      await checkDataBeforeReset();

      // Phase 4: Test reset
      await testReset();

      // Phase 5: Check for orphaned records
      await checkDataAfterReset();

      setCurrentPhase('Test completed!');
      addResult('Full Test', true, 'Backup/Reset system test completed successfully');

    } catch (error) {
      addResult('Full Test', false, `Test failed: ${(error as Error).message}`);
      setCurrentPhase('Test failed');
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setTestData(null);
    setCurrentPhase('');
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-5 w-5 text-green-400" />
    ) : (
      <XCircle className="h-5 w-5 text-red-400" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Authentication Check */}
      {!user?.id && (
        <div className="relative p-6 rounded-lg border border-red-400/50 backdrop-blur-md"
             style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-400" />
            <span className="text-red-300 font-light tracking-wide"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Authentication required. Please ensure you are logged in as an admin user.
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <DiamondIcon
          icon={<Database size={20} strokeWidth={1.5} />}
          size="lg"
          bgColor="bg-void-950"
          actualBorderColor="bg-gold-300"
          borderThickness={2}
          iconColor="text-gold-300"
        />
        <div>
          <h2 className="text-xl font-light text-gold-300 mb-1"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            BACKUP/RESET SYSTEM TEST
          </h2>
          <p className="text-amber-200/80 text-sm font-light tracking-wide"
             style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            Comprehensive validation for the unified architecture backup and reset system
          </p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="relative p-6 rounded-lg border border-gold-300/30 backdrop-blur-md"
           style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-light text-gold-300 tracking-wide"
                   style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Map Type:
            </label>
            <select
              value={selectedMapType}
              onChange={(e) => setSelectedMapType(e.target.value as 'deep_desert' | 'hagga_basin')}
              className="px-3 py-2 rounded border border-gold-300/30 bg-void-950/80 text-gold-300 text-sm"
              style={{ 
                fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif",
                backgroundColor: 'rgba(42, 36, 56, 0.9)'
              }}
              disabled={isRunning || !user?.id}
            >
              <option value="deep_desert">Deep Desert</option>
              <option value="hagga_basin">Hagga Basin</option>
            </select>
          </div>
          
          <button 
            onClick={runFullTest} 
            disabled={isRunning || !user?.id}
            className="relative group px-6 py-3 rounded border border-gold-300/50 bg-void-950/80 text-gold-300 hover:border-gold-300 hover:bg-gold-300/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span className="text-sm font-light tracking-wide">
              {isRunning ? 'RUNNING TEST...' : 'RUN FULL TEST'}
            </span>
          </button>

          <button 
            onClick={testBackupHealth}
            disabled={isRunning || !user?.id}
            className="relative group px-4 py-3 rounded border border-green-400/50 bg-void-950/80 text-green-400 hover:border-green-400 hover:bg-green-400/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
          >
            <span className="text-sm font-light tracking-wide">HEALTH CHECK</span>
          </button>

          <button 
            onClick={debugBackupFunction}
            disabled={isRunning || !user?.id}
            className="relative group px-4 py-3 rounded border border-blue-400/50 bg-void-950/80 text-blue-400 hover:border-blue-400 hover:bg-blue-400/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
          >
            <span className="text-sm font-light tracking-wide">DEBUG BACKUP</span>
          </button>

          <button 
            onClick={clearResults}
            disabled={isRunning || !user?.id}
            className="relative group px-4 py-3 rounded border border-amber-400/50 bg-void-950/80 text-amber-400 hover:border-amber-400 hover:bg-amber-400/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
          >
            <span className="text-sm font-light tracking-wide">CLEAR RESULTS</span>
          </button>
        </div>

        {currentPhase && (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-blue-400/30"
               style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
            {isRunning && <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />}
            <span className="text-sm font-light text-blue-300 tracking-wide"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              {currentPhase}
            </span>
          </div>
        )}
      </div>

      {/* Test Results */}
      {results.length > 0 && (
        <div className="relative p-6 rounded-lg border border-gold-300/30 backdrop-blur-md"
             style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
          <div className="flex items-center gap-3 mb-6">
            <DiamondIcon
              icon={<HardDrive size={16} strokeWidth={1.5} />}
              size="sm"
              bgColor="bg-void-950"
              actualBorderColor="bg-gold-300"
              borderThickness={1}
              iconColor="text-gold-300"
            />
            <h3 className="text-lg font-light text-gold-300 tracking-wide"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              TEST RESULTS
            </h3>
          </div>
          
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border border-gold-300/20 rounded-lg p-4"
                   style={{ backgroundColor: 'rgba(42, 36, 56, 0.5)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.success)}
                    <span className="font-light text-gold-300 tracking-wide"
                          style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      {result.phase}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-light tracking-wider ${
                      result.success 
                        ? 'bg-green-900/50 text-green-300 border border-green-400/30' 
                        : 'bg-red-900/50 text-red-300 border border-red-400/30'
                    }`}
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      {result.success ? "PASS" : "FAIL"}
                    </span>
                  </div>
                  <span className="text-xs text-amber-200/60 font-light">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <p className="text-sm text-amber-200/80 mb-3 font-light"
                   style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  {result.message}
                </p>
                
                {result.details && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gold-300/70 hover:text-gold-300 font-light tracking-wide"
                             style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      VIEW DETAILS
                    </summary>
                    <pre className="mt-3 p-3 rounded overflow-auto text-amber-200/70 border border-gold-300/20"
                         style={{ 
                           backgroundColor: 'rgba(42, 36, 56, 0.7)',
                           fontFamily: "'Courier New', monospace"
                         }}>
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Data Summary */}
      {testData && (
        <div className="relative p-6 rounded-lg border border-gold-300/30 backdrop-blur-md"
             style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
          <div className="flex items-center gap-3 mb-4">
            <DiamondIcon
              icon={<AlertCircle size={16} strokeWidth={1.5} />}
              size="sm"
              bgColor="bg-void-950"
              actualBorderColor="bg-amber-400"
              borderThickness={1}
              iconColor="text-amber-400"
            />
            <h3 className="text-lg font-light text-gold-300 tracking-wide"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              TEST DATA CREATED
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-xl font-light text-gold-300">{testData.poiIds.length}</div>
              <div className="text-xs text-amber-200/70 font-light tracking-wide"
                   style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                POIs
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-light text-gold-300">{testData.commentIds.length}</div>
              <div className="text-xs text-amber-200/70 font-light tracking-wide"
                   style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                Comments
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-light text-gold-300">{testData.imageIds.length}</div>
              <div className="text-xs text-amber-200/70 font-light tracking-wide"
                   style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                Images
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-light text-gold-300">{testData.linkIds.length}</div>
              <div className="text-xs text-amber-200/70 font-light tracking-wide"
                   style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                Entity Links
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-light text-gold-300">{selectedMapType.replace('_', ' ').toUpperCase()}</div>
              <div className="text-xs text-amber-200/70 font-light tracking-wide"
                   style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                Map Type
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 