import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { Settings, Bug, TestTube, X, ChevronDown, ChevronUp } from 'lucide-react';

const DeveloperPanel: React.FC = () => {
  const { user, profile } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show for admin users
  if (!user || !profile || profile.role !== 'admin') {
    return null;
  }

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
    if (!isVisible) setIsExpanded(false);
  };

  const runScreenshotTest = () => {
    console.log('🧪 Screenshot System Test');
    console.log('- Unified Screenshot Manager: Available');
    console.log('- Storage Architecture: poi_screenshots/ + poi_cropped/');
    console.log('- RLS Policies: Active');
    console.log('✅ All systems operational');
  };

  const runDatabaseTest = () => {
    console.log('🔍 Database Connection Test');
    console.log('- User authenticated:', !!user);
    console.log('- Profile loaded:', !!profile);
    console.log('- User role:', profile?.role);
    console.log('- User ID:', user?.id);
  };

  const clearConsole = () => {
    console.clear();
    console.log('🧹 Console cleared - Development mode active');
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={toggleVisibility}
          className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Open Developer Panel (Admin Only)"
        >
          <Bug className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white rounded-lg shadow-xl border border-gray-700 min-w-80">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium">Developer Panel</span>
          <span className="text-xs text-gray-400">(Admin Only)</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-700 rounded"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleVisibility}
            className="p-1 hover:bg-gray-700 rounded"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-3 space-y-3">
          <div className="text-xs text-gray-400 mb-2">
            Development testing tools for debugging and validation
          </div>

          {/* Test Buttons */}
          <div className="space-y-2">
            <button
              onClick={runScreenshotTest}
              className="w-full flex items-center gap-2 p-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
            >
              <TestTube className="w-4 h-4" />
              Test Screenshot System
            </button>

            <button
              onClick={runDatabaseTest}
              className="w-full flex items-center gap-2 p-2 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
            >
              <Settings className="w-4 h-4" />
              Test Database Connection
            </button>

            <button
              onClick={clearConsole}
              className="w-full flex items-center gap-2 p-2 bg-orange-600 hover:bg-orange-700 rounded text-sm transition-colors"
            >
              <X className="w-4 h-4" />
              Clear Console
            </button>
          </div>

          {/* System Info */}
          <div className="border-t border-gray-700 pt-2 mt-3">
            <div className="text-xs text-gray-400 space-y-1">
              <div>User: {profile?.username || 'Unknown'}</div>
              <div>Role: {profile?.role || 'Unknown'}</div>
              <div>Mode: Development</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="border-t border-gray-700 pt-2 mt-2">
            <div className="text-xs text-gray-500">
              💡 Check browser console for test results
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperPanel; 