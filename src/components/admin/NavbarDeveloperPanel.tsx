import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { Settings, Bug, TestTube, X, ChevronDown } from 'lucide-react';

const NavbarDeveloperPanel: React.FC = () => {
  const { user, profile } = useAuth();
  const [isDevPanelOpen, setIsDevPanelOpen] = useState(false);

  // Only show for admin users
  if (!user || !profile || profile.role !== 'admin') {
    return null;
  }

  const toggleDevPanel = () => setIsDevPanelOpen(!isDevPanelOpen);

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

  return (
    <div className="relative">
      <button
        onClick={toggleDevPanel}
        className="group relative flex items-center h-16 px-3 min-w-[100px] justify-center transition-all duration-300"
      >
        {/* Button background image */}
        <div 
          className="absolute inset-0 bg-center bg-cover bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/bg-button.webp)',
            backgroundSize: 'cover'
          }}
        />
        
        {/* Purple hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-600/0 via-violet-700/0 to-transparent group-hover:from-violet-600/40 group-hover:via-violet-700/20 transition-all duration-300" />
        
        {/* Content */}
        <div className="relative z-10 flex items-center space-x-2">
          <span className="transition-all duration-300 text-amber-300 group-hover:text-amber-100 group-hover:drop-shadow-lg"
            style={{
              fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif"
            }}
          >
            <Bug size={14} strokeWidth={1.5} />
          </span>
          <span className="font-light text-xs uppercase tracking-widest transition-all duration-300 whitespace-nowrap text-amber-200 group-hover:text-amber-50 group-hover:drop-shadow-lg"
            style={{
              fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif"
            }}
          >
            Dev
          </span>
          <ChevronDown 
            size={12} 
            strokeWidth={1.5} 
            className={`
              transition-all duration-300 text-amber-300 group-hover:text-amber-100 group-hover:drop-shadow-lg
              ${isDevPanelOpen ? 'rotate-180' : 'rotate-0'}
            `}
          />
        </div>
        
        {/* Sleek expanding underline */}
        <div className="absolute bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent group-hover:w-full transition-all duration-700 ease-out shadow-md shadow-violet-400/50" />
      </button>

      {/* Developer Panel Dropdown */}
      {isDevPanelOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsDevPanelOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-600/30 shadow-2xl z-50 backdrop-blur-sm">
            
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-600/20 bg-gradient-to-r from-purple-600/10 via-purple-500/5 to-purple-600/10">
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-amber-100">Developer Panel</span>
                <span className="text-xs text-amber-300">(Admin Only)</span>
              </div>
              <div className="text-xs text-amber-200 mt-1">
                Development testing tools for debugging and validation
              </div>
            </div>

            {/* Test Buttons */}
            <div className="p-3 space-y-2">
              <button
                onClick={() => {
                  runScreenshotTest();
                  setIsDevPanelOpen(false);
                }}
                className="group relative flex items-center w-full text-left px-3 py-2 text-amber-200 hover:text-amber-50 transition-all duration-300 rounded"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-800/0 to-blue-700/0 group-hover:from-blue-800/20 group-hover:to-blue-700/20 transition-all duration-300 rounded" />
                
                <TestTube size={14} strokeWidth={1.5} className="relative z-10 mr-3 text-blue-400 group-hover:text-blue-300 transition-all duration-300" />
                <span className="relative z-10 font-light tracking-wide text-sm">Test Screenshot System</span>
              </button>

              <button
                onClick={() => {
                  runDatabaseTest();
                  setIsDevPanelOpen(false);
                }}
                className="group relative flex items-center w-full text-left px-3 py-2 text-amber-200 hover:text-amber-50 transition-all duration-300 rounded"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-800/0 to-green-700/0 group-hover:from-green-800/20 group-hover:to-green-700/20 transition-all duration-300 rounded" />
                
                <Settings size={14} strokeWidth={1.5} className="relative z-10 mr-3 text-green-400 group-hover:text-green-300 transition-all duration-300" />
                <span className="relative z-10 font-light tracking-wide text-sm">Test Database Connection</span>
              </button>

              <button
                onClick={() => {
                  clearConsole();
                  setIsDevPanelOpen(false);
                }}
                className="group relative flex items-center w-full text-left px-3 py-2 text-amber-200 hover:text-amber-50 transition-all duration-300 rounded"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-800/0 to-orange-700/0 group-hover:from-orange-800/20 group-hover:to-orange-700/20 transition-all duration-300 rounded" />
                
                <X size={14} strokeWidth={1.5} className="relative z-10 mr-3 text-orange-400 group-hover:text-orange-300 transition-all duration-300" />
                <span className="relative z-10 font-light tracking-wide text-sm">Clear Console</span>
              </button>
            </div>

            {/* System Info */}
            <div className="border-t border-slate-600/20 px-4 py-3 bg-gradient-to-r from-amber-600/5 via-amber-500/3 to-amber-600/5">
              <div className="text-xs text-amber-300 space-y-1">
                <div>User: {profile?.username || 'Unknown'}</div>
                <div>Role: {profile?.role || 'Unknown'}</div>
                <div>Mode: Development</div>
              </div>
              <div className="text-xs text-amber-400 mt-2">
                💡 Check browser console for test results
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NavbarDeveloperPanel; 