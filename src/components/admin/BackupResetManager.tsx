import React, { useState } from 'react';
import { Download, Trash2, TestTube, Activity, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type MapType = 'deep_desert' | 'hagga_basin' | 'combined';

interface BackupResponse {
  success: boolean;
  message?: string;
  fileName?: string;
  stats?: any;
  error?: string;
}

interface ResetResponse {
  success: boolean;
  message?: string;
  stats?: any;
  warnings?: string[];
  error?: string;
}

interface TestResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

const BackupResetManager: React.FC = () => {
  const [backupLoading, setBackupLoading] = useState<MapType | null>(null);
  const [resetLoading, setResetLoading] = useState<MapType | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState<MapType | null>(null);
  const [lastResponse, setLastResponse] = useState<BackupResponse | ResetResponse | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showTesting, setShowTesting] = useState(false);

  const performBackup = async (mapType: MapType) => {
    setBackupLoading(mapType);
    setLastResponse(null);

    try {
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/backup-v2`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mapType }),
      });

      const data = await response.json();
      setLastResponse(data);
    } catch (error) {
      setLastResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setBackupLoading(null);
    }
  };

  const performReset = async (mapType: MapType) => {
    setResetLoading(mapType);
    setLastResponse(null);

    const confirmationText = mapType === 'deep_desert' ? 'DELETE DEEP DESERT' :
                           mapType === 'hagga_basin' ? 'DELETE HAGGA BASIN' : 'DELETE ALL DATA';

    try {
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/reset-v2`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          mapType,
          confirmText: confirmationText
        }),
      });

      const data = await response.json();
      setLastResponse(data);
      
      // Close modal after a short delay to show the result
      setTimeout(() => {
        setShowResetConfirm(null);
        setConfirmText('');
      }, 2000);
    } catch (error) {
      setLastResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      
      // Close modal after showing error
      setTimeout(() => {
        setShowResetConfirm(null);
        setConfirmText('');
      }, 3000);
    } finally {
      setResetLoading(null);
    }
  };

  // Testing Functions
  const runHealthCheck = async (): Promise<TestResult> => {
    try {
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/backup-v2`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mapType: 'test_health_check' }),
      });

      if (response.status === 200 || response.status === 400) {
        return {
          test: 'Backup Function Health',
          status: 'success',
          message: 'Function is responsive and operational',
          details: { status: response.status }
        };
      } else {
        return {
          test: 'Backup Function Health',
          status: 'error',
          message: `Unexpected response status: ${response.status}`,
          details: { status: response.status }
        };
      }
    } catch (error) {
      return {
        test: 'Backup Function Health',
        status: 'error',
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      };
    }
  };

  const testDatabaseConnectivity = async (): Promise<TestResult> => {
    try {
      const { data, error } = await supabase.from('grid_squares').select('count', { count: 'exact', head: true });
      
      if (error) {
        return {
          test: 'Database Connectivity',
          status: 'error',
          message: `Database connection failed: ${error.message}`,
          details: { error }
        };
      }

      return {
        test: 'Database Connectivity',
        status: 'success',
        message: 'Database connection successful',
        details: { gridSquareCount: data }
      };
    } catch (error) {
      return {
        test: 'Database Connectivity',
        status: 'error',
        message: `Database test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      };
    }
  };

  const testStorageAccess = async (): Promise<TestResult> => {
    try {
      const { data, error } = await supabase.storage.from('screenshots').list('', { limit: 1 });
      
      if (error) {
        return {
          test: 'Storage Access',
          status: 'error',
          message: `Storage access failed: ${error.message}`,
          details: { error }
        };
      }

      return {
        test: 'Storage Access',
        status: 'success',
        message: 'Storage bucket accessible',
        details: { fileCount: data?.length || 0 }
      };
    } catch (error) {
      return {
        test: 'Storage Access',
        status: 'error',
        message: `Storage test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      };
    }
  };

  const runSystemDiagnostics = async () => {
    setTestLoading(true);
    setTestResults([]);

    const tests = [
      runHealthCheck,
      testDatabaseConnectivity,
      testStorageAccess,
    ];

    const results: TestResult[] = [];
    
    for (const test of tests) {
      try {
        const result = await test();
        results.push(result);
      } catch (error) {
        results.push({
          test: 'Unknown Test',
          status: 'error',
          message: `Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: { error }
        });
      }
    }

    setTestResults(results);
    setTestLoading(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-400" size={16} />;
      case 'error':
        return <AlertCircle className="text-red-400" size={16} />;
      case 'warning':
        return <Info className="text-yellow-400" size={16} />;
    }
  };

  const mapTypeNames = {
    deep_desert: 'Deep Desert',
    hagga_basin: 'Hagga Basin',
    combined: 'Combined (Both Maps)',
  };

  const mapTypeDescriptions = {
    deep_desert: 'Grid squares, POIs, comments, and entity links from Deep Desert map',
    hagga_basin: 'POIs, comments, and entity links from Hagga Basin map',
    combined: 'All data from both Deep Desert and Hagga Basin maps',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-light text-gold-300 mb-2"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
          BACKUP & RESET OPERATIONS
        </h2>
        <p className="text-amber-200/70 text-sm font-light tracking-wide"
           style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
          Comprehensive data management and system testing
        </p>
      </div>

      {/* Testing Section Toggle */}
      <div className="border border-gold-300/30 rounded-lg p-6 backdrop-blur-md"
           style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TestTube className="text-gold-300" size={20} />
            <h3 className="text-lg font-light text-gold-300"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              SYSTEM DIAGNOSTICS
            </h3>
          </div>
          <button
            onClick={() => setShowTesting(!showTesting)}
            className="px-4 py-2 bg-gold-300/20 hover:bg-gold-300/30 border border-gold-300/50 rounded-md text-gold-300 transition-all duration-300"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
          >
            {showTesting ? 'HIDE TESTING' : 'SHOW TESTING'}
          </button>
        </div>

        {showTesting && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <button
                onClick={runSystemDiagnostics}
                disabled={testLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/50 rounded-md text-blue-300 transition-all duration-300 disabled:opacity-50"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              >
                <Activity size={16} />
                {testLoading ? 'RUNNING DIAGNOSTICS...' : 'RUN SYSTEM DIAGNOSTICS'}
              </button>
            </div>

            {testResults.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-md font-light text-gold-300"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  Diagnostic Results:
                </h4>
                {testResults.map((result, index) => (
                  <div key={index} className="border border-gold-300/20 rounded-md p-4 bg-void-950/30">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(result.status)}
                      <span className="text-amber-200 font-medium">{result.test}</span>
                    </div>
                    <p className="text-amber-200/80 text-sm mb-2">{result.message}</p>
                    {result.details && (
                      <pre className="text-xs text-amber-200/60 bg-void-950/50 p-2 rounded overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Backup Section */}
      <div className="border border-gold-300/30 rounded-lg p-6 backdrop-blur-md"
           style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
        <div className="flex items-center gap-3 mb-6">
          <Download className="text-gold-300" size={20} />
          <h3 className="text-lg font-light text-gold-300"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            DATA BACKUP
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['deep_desert', 'hagga_basin', 'combined'] as MapType[]).map((mapType) => (
            <button
              key={mapType}
              onClick={() => performBackup(mapType)}
              disabled={backupLoading !== null}
              className="p-4 border border-gold-300/50 rounded-md bg-gold-300/10 hover:bg-gold-300/20 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {backupLoading === mapType && <Loader2 className="animate-spin" size={16} />}
              <div className="text-gold-300 font-light tracking-wide text-sm"
                   style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                {backupLoading === mapType ? 'CREATING BACKUP...' : `BACKUP ${mapType.replace('_', ' ').toUpperCase()}`}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Reset Section */}
      <div className="border border-red-400/30 rounded-lg p-6 backdrop-blur-md"
           style={{ backgroundColor: 'rgba(60, 9, 9, 0.3)' }}>
        <div className="flex items-center gap-3 mb-6">
          <Trash2 className="text-red-400" size={20} />
          <h3 className="text-lg font-light text-red-400"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            DATA RESET (DANGER ZONE)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['deep_desert', 'hagga_basin', 'combined'] as MapType[]).map((mapType) => (
            <button
              key={mapType}
              onClick={() => setShowResetConfirm(mapType)}
              disabled={resetLoading !== null}
              className="p-4 border border-red-400/50 rounded-md bg-red-400/10 hover:bg-red-400/20 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {resetLoading === mapType && <Loader2 className="animate-spin" size={16} />}
              <div className="text-red-400 font-light tracking-wide text-sm"
                   style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                {resetLoading === mapType ? 'RESETTING...' : `RESET ${mapType.replace('_', ' ').toUpperCase()}`}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-void-950/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-void-950 border border-red-400/50 rounded-lg p-8 max-w-md mx-4">
            {resetLoading === showResetConfirm ? (
              // Progress State
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Loader2 className="text-red-400 animate-spin" size={24} />
                  <h3 className="text-xl font-light text-red-400"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    RESETTING DATA...
                  </h3>
                </div>
                <p className="text-amber-200/80 mb-6">
                  Please wait while we reset {showResetConfirm.replace('_', ' ')} data.
                  This may take a few moments.
                </p>
                
                {/* Show result if available */}
                {lastResponse && (
                  <div className={`mt-4 p-4 rounded-md border ${
                    lastResponse.success 
                      ? 'border-green-400/50 bg-green-400/10' 
                      : 'border-red-400/50 bg-red-400/10'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {lastResponse.success ? (
                        <CheckCircle className="text-green-400" size={16} />
                      ) : (
                        <AlertCircle className="text-red-400" size={16} />
                      )}
                      <span className={`font-medium ${lastResponse.success ? 'text-green-400' : 'text-red-400'}`}>
                        {lastResponse.success ? 'Reset Completed!' : 'Reset Failed'}
                      </span>
                    </div>
                    {lastResponse.message && (
                      <p className="text-amber-200/80 text-sm">{lastResponse.message}</p>
                    )}
                    {lastResponse.error && (
                      <p className="text-red-300 text-sm">{lastResponse.error}</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Confirmation State
              <>
                <h3 className="text-xl font-light text-red-400 mb-4"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  CONFIRM DATA RESET
                </h3>
                <p className="text-amber-200/80 mb-6">
                  This will permanently delete all {showResetConfirm.replace('_', ' ')} data. Type the confirmation text to proceed:
                </p>
                <p className="text-red-400 font-mono text-sm mb-4">
                  {showResetConfirm === 'deep_desert' ? 'DELETE DEEP DESERT' :
                   showResetConfirm === 'hagga_basin' ? 'DELETE HAGGA BASIN' : 'DELETE ALL DATA'}
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full p-3 bg-void-950 border border-gold-300/50 rounded-md text-amber-200 mb-6"
                  placeholder="Enter confirmation text..."
                />
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowResetConfirm(null);
                      setConfirmText('');
                    }}
                    className="flex-1 px-4 py-2 border border-gold-300/50 rounded-md text-gold-300 hover:bg-gold-300/10 transition-all duration-300"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={() => performReset(showResetConfirm)}
                    disabled={confirmText !== (showResetConfirm === 'deep_desert' ? 'DELETE DEEP DESERT' :
                                              showResetConfirm === 'hagga_basin' ? 'DELETE HAGGA BASIN' : 'DELETE ALL DATA')}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    CONFIRM RESET
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Response Display */}
      {lastResponse && (
        <div className={`border rounded-lg p-6 backdrop-blur-md ${
          lastResponse.success 
            ? 'border-green-400/30 bg-green-400/10' 
            : 'border-red-400/30 bg-red-400/10'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            {lastResponse.success ? (
              <CheckCircle className="text-green-400" size={20} />
            ) : (
              <AlertCircle className="text-red-400" size={20} />
            )}
            <h3 className={`text-lg font-light ${lastResponse.success ? 'text-green-400' : 'text-red-400'}`}
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              {lastResponse.success ? 'OPERATION SUCCESSFUL' : 'OPERATION FAILED'}
            </h3>
          </div>
          
          {lastResponse.message && (
            <p className="text-amber-200/80 mb-4">{lastResponse.message}</p>
          )}
          
          {lastResponse.fileName && (
            <p className="text-amber-200/80 mb-4">
              <strong>File:</strong> {lastResponse.fileName}
            </p>
          )}
          
          {lastResponse.error && (
            <p className="text-red-300 mb-4">
              <strong>Error:</strong> {lastResponse.error}
            </p>
          )}
          
          {lastResponse.stats && (
            <div className="mt-4">
              <h4 className="text-gold-300 font-medium mb-2">Statistics:</h4>
              <pre className="text-xs text-amber-200/80 bg-void-950/30 p-3 rounded overflow-x-auto">
                {JSON.stringify(lastResponse.stats, null, 2)}
              </pre>
            </div>
          )}
          
          {'warnings' in lastResponse && lastResponse.warnings && lastResponse.warnings.length > 0 && (
            <div className="mt-4">
              <h4 className="text-yellow-400 font-medium mb-2">Warnings:</h4>
              <ul className="text-yellow-300 text-sm space-y-1">
                {lastResponse.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BackupResetManager; 