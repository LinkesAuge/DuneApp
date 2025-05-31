import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useItemsSchematics } from '../../hooks/useItemsSchematics';
import {
  fetchTiers,
  fetchCategories,
  createTier,
  createCategory,
  createItem,
  createSchematic,
  CrudResult,
  CrudListResult
} from '../../lib/itemsSchematicsCrud';
import {
  resolveInheritedFields,
  validateItemHierarchy,
  validateSchematicHierarchy
} from '../../lib/itemsSchematicsUtils';
import {
  checkPermission,
  isAdmin,
  isEditorOrHigher,
  isMemberOrHigher
} from '../../lib/itemsSchematicsPermissions';
import { TestTube, Play, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

const ApiTestingComponent: React.FC = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Permission System
    try {
      addResult({
        name: 'Permission System - Role Checks',
        status: 'pending',
        message: 'Testing role-based permissions...'
      });

      const adminCheck = isAdmin(user);
      const editorCheck = isEditorOrHigher(user);
      const memberCheck = isMemberOrHigher(user);

      addResult({
        name: 'Permission System - Role Checks',
        status: 'success',
        message: `Admin: ${adminCheck}, Editor+: ${editorCheck}, Member+: ${memberCheck}`,
        details: { user: user?.role }
      });
    } catch (error) {
      addResult({
        name: 'Permission System - Role Checks',
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Test 2: Fetch Tiers
    try {
      addResult({
        name: 'CRUD - Fetch Tiers',
        status: 'pending',
        message: 'Fetching tiers...'
      });

      const tierResult = await fetchTiers(user);
      
      if (tierResult.success) {
        addResult({
          name: 'CRUD - Fetch Tiers',
          status: 'success',
          message: `Successfully fetched ${tierResult.data?.length || 0} tiers`,
          details: tierResult.data
        });
      } else {
        addResult({
          name: 'CRUD - Fetch Tiers',
          status: tierResult.permissionError ? 'warning' : 'error',
          message: tierResult.error || 'Unknown error'
        });
      }
    } catch (error) {
      addResult({
        name: 'CRUD - Fetch Tiers',
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Test 3: Fetch Categories
    try {
      addResult({
        name: 'CRUD - Fetch Categories',
        status: 'pending',
        message: 'Fetching categories...'
      });

      const categoryResult = await fetchCategories(user);
      
      if (categoryResult.success) {
        addResult({
          name: 'CRUD - Fetch Categories',
          status: 'success',
          message: `Successfully fetched ${categoryResult.data?.length || 0} categories`,
          details: categoryResult.data
        });
      } else {
        addResult({
          name: 'CRUD - Fetch Categories',
          status: categoryResult.permissionError ? 'warning' : 'error',
          message: categoryResult.error || 'Unknown error'
        });
      }
    } catch (error) {
      addResult({
        name: 'CRUD - Fetch Categories',
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Test 4: Field Resolution
    try {
      addResult({
        name: 'Field Resolution - Global Fields',
        status: 'pending',
        message: 'Testing field resolution system...'
      });

      const fieldResult = await resolveInheritedFields({ });
      
      addResult({
        name: 'Field Resolution - Global Fields',
        status: 'success',
        message: `Resolved ${fieldResult.fields.length} global fields`,
        details: fieldResult.fields
      });
    } catch (error) {
      addResult({
        name: 'Field Resolution - Global Fields',
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Test 5: Hierarchy Validation
    try {
      addResult({
        name: 'Hierarchy Validation - Item',
        status: 'pending',
        message: 'Testing hierarchy validation...'
      });

      // Test with minimal data (should pass)
      const itemValidation = await validateItemHierarchy({
        category_id: 'test-category-id'
      });

      addResult({
        name: 'Hierarchy Validation - Item',
        status: itemValidation.is_valid ? 'success' : 'warning',
        message: itemValidation.is_valid 
          ? 'Hierarchy validation working correctly'
          : `Validation issues: ${itemValidation.errors.join(', ')}`,
        details: itemValidation
      });
    } catch (error) {
      addResult({
        name: 'Hierarchy Validation - Item',
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Test 6: Permission Check Function
    try {
      addResult({
        name: 'Permission Check - Entity Access',
        status: 'pending',
        message: 'Testing entity permission checks...'
      });

      const permissionCheck = checkPermission({
        user,
        entity: {
          type: 'item',
          id: 'test-id',
          created_by: user?.id || null,
          is_global: false
        },
        action: 'read'
      });

      addResult({
        name: 'Permission Check - Entity Access',
        status: permissionCheck.allowed ? 'success' : 'warning',
        message: permissionCheck.allowed 
          ? 'Permission check passed'
          : `Permission denied: ${permissionCheck.reason}`,
        details: permissionCheck
      });
    } catch (error) {
      addResult({
        name: 'Permission Check - Entity Access',
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Test 7: Create Operations (only if user has permissions)
    if (user && (user.role === 'admin' || user.role === 'editor')) {
      try {
        addResult({
          name: 'CRUD - Create Test Category',
          status: 'pending',
          message: 'Testing category creation...'
        });

        const createResult = await createCategory(user, {
          name: `Test Category ${Date.now()}`,
          description: 'API Test Category',
          applies_to: ['items'],
          display_order: 999
        });

        if (createResult.success) {
          addResult({
            name: 'CRUD - Create Test Category',
            status: 'success',
            message: 'Successfully created test category',
            details: createResult.data
          });
        } else {
          addResult({
            name: 'CRUD - Create Test Category',
            status: createResult.permissionError ? 'warning' : 'error',
            message: createResult.error || 'Unknown error'
          });
        }
      } catch (error) {
        addResult({
          name: 'CRUD - Create Test Category',
          status: 'error',
          message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    } else {
      addResult({
        name: 'CRUD - Create Test Category',
        status: 'warning',
        message: 'Skipped - Insufficient permissions (need Editor+ role)'
      });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'pending':
        return <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-700/30 bg-green-900/20';
      case 'error':
        return 'border-red-700/30 bg-red-900/20';
      case 'warning':
        return 'border-yellow-700/30 bg-yellow-900/20';
      case 'pending':
        return 'border-blue-700/30 bg-blue-900/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <TestTube className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl text-amber-200 font-medium">API Testing Suite</h2>
        </div>
        
        <button
          onClick={runTests}
          disabled={isRunning}
          className="btn btn-primary flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </button>
      </div>

      {user && (
        <div className="bg-slate-800/50 border border-slate-600/30 p-4">
          <h3 className="text-amber-300 font-medium mb-2">Current User Context</h3>
          <div className="space-y-1 text-sm text-slate-300">
            <p><span className="text-amber-400">Role:</span> {user.role}</p>
            <p><span className="text-amber-400">ID:</span> {user.id}</p>
            <p><span className="text-amber-400">Email:</span> {user.email}</p>
          </div>
        </div>
      )}

      {testResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-amber-300 font-medium">Test Results</h3>
          
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`border p-4 ${getStatusColor(result.status)}`}
            >
              <div className="flex items-start gap-3">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <h4 className="text-slate-200 font-medium">{result.name}</h4>
                  <p className="text-slate-300 text-sm mt-1">{result.message}</p>
                  {result.details && (
                    <details className="mt-2">
                      <summary className="text-slate-400 text-xs cursor-pointer hover:text-slate-300">
                        View Details
                      </summary>
                      <pre className="text-xs text-slate-400 mt-1 overflow-x-auto bg-slate-900/50 p-2">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApiTestingComponent; 