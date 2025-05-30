import React, { useState } from 'react';
import { Shield, AlertCircle, CheckCircle, Shapes } from 'lucide-react';
import { useAdminData } from '../../hooks/useAdminData';
import DatabaseManagement from './DatabaseManagement';
import UserManagement from './UserManagement';
import ScheduledTasks from './ScheduledTasks';
import PoiDefinitionManager from './PoiTypeManager';
import MapSettings from './MapSettings';
import RankManagement from './RankManagement';
import DiamondIcon from '../common/DiamondIcon';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'database' | 'users' | 'poi-types' | 'settings' | 'tasks' | 'ranks'>('users');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    profiles,
    poiTypes,
    scheduledTasks,
    storedBackups,
    isLoading,
    isLoadingBackups,
    error,
    backupsError,
    refreshData,
    refreshBackups,
    refreshScheduledTasks,
    refreshProfiles,
    setError,
    setBackupsError
  } = useAdminData();

  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleError = (error: string) => {
    setErrorMessage(error);
    setSuccessMessage(null);
    setTimeout(() => setErrorMessage(null), 8000);
  };

  const tabs = [
    { id: 'users' as const, label: 'Users', icon: '👥' },
    { id: 'ranks' as const, label: 'Ranks', icon: '🏆' },
    { id: 'poi-types' as const, label: 'POI Definitions', icon: '📍' },
    { id: 'settings' as const, label: 'Map Settings', icon: '⚙️' },
    { id: 'tasks' as const, label: 'Scheduled Tasks', icon: '⏰' },
    { id: 'database' as const, label: 'Database', icon: '💾' }
  ];

  if (isLoading) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: 'url(/images/main-bg.jpg)' }}
      >
        {/* <div className="absolute inset-0 bg-void-950/80 backdrop-blur-sm" /> */}
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="relative p-12 rounded-lg border border-gold-300/30 backdrop-blur-md"
               style={{ backgroundColor: 'rgba(42, 36, 56, 0.9)' }}>
            <div className="text-center">
              <div className="inline-block p-4 rounded-full border border-gold-300/50 mb-6"
                   style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
                <Shield className="text-gold-300" size={32} />
              </div>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-300 mx-auto mb-6"></div>
              <p className="text-gold-300 text-xl font-light tracking-[0.15em]"
                 style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                INITIALIZING ADMIN CONTROL CENTER
              </p>
              <p className="text-amber-200/70 text-sm font-light tracking-wide mt-2"
                 style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                Loading system protocols...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: 'url(/images/main-bg.jpg)' }}
    >
      {/* <div className="absolute inset-0 bg-void-950/70 backdrop-blur-sm" /> */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="relative mb-8 p-4 rounded-lg border border-gold-300/30 backdrop-blur-md"
               style={{ backgroundColor: 'rgba(42, 36, 56, 0.9)' }}>
            <div className="flex items-center gap-4">
              <DiamondIcon
                icon={<Shield size={20} strokeWidth={1.5} />}
                size="lg"
                bgColor="bg-void-950"
                actualBorderColor="bg-gold-300"
                borderThickness={2}
                iconColor="text-gold-300"
              />
              <div>
                <h1 className="text-2xl font-light text-gold-300 mb-1"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  ADMIN CONTROL CENTER
                </h1>
                <p className="text-amber-200/80 text-sm font-light tracking-wide"
                   style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  System management for the Dune Awakening Tracker
                </p>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="relative mb-6 p-4 rounded-lg border border-green-400/40 backdrop-blur-md"
                 style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
              <div className="flex items-center gap-3">
                <DiamondIcon
                  icon={<CheckCircle size={16} strokeWidth={1.5} />}
                  size="sm"
                  bgColor="bg-green-900"
                  actualBorderColor="bg-green-400"
                  borderThickness={1}
                  iconColor="text-green-400"
                />
                <span className="text-green-300 font-light tracking-wide"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  {successMessage}
                </span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="relative mb-6 p-4 rounded-lg border border-red-400/40 backdrop-blur-md"
                 style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              <div className="flex items-center gap-3">
                <DiamondIcon
                  icon={<AlertCircle size={16} strokeWidth={1.5} />}
                  size="sm"
                  bgColor="bg-red-900"
                  actualBorderColor="bg-red-400"
                  borderThickness={1}
                  iconColor="text-red-400"
                />
                <span className="text-red-300 font-light tracking-wide"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  {errorMessage}
                </span>
              </div>
            </div>
          )}
        
          {/* Enhanced Navigation Tabs */}
          <div className="relative mb-8 p-2 rounded-lg border border-gold-300/30 backdrop-blur-md"
               style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
            <nav className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group/tab relative flex-1 px-6 py-4 transition-all duration-500 ease-out rounded-md
                    ${activeTab === tab.id ? 'z-10' : ''}
                  `}
                >
                  {/* Enhanced background layers */}
                  <div className={`absolute inset-0 rounded-md transition-all duration-500 ${
                    activeTab === tab.id 
                      ? 'bg-gradient-to-r from-gold-300/20 via-amber-200/25 to-gold-300/20' 
                      : 'bg-gradient-to-r from-transparent via-transparent to-transparent group-hover/tab:from-gold-300/10 group-hover/tab:via-amber-200/15 group-hover/tab:to-gold-300/10'
                  }`} />
                  
                  {/* Advanced purple overlay for hover */}
                  <div 
                    className={`absolute inset-0 rounded-md transition-all duration-700 opacity-0 group-hover/tab:opacity-100 ${
                      activeTab === tab.id ? 'opacity-30' : ''
                    }`}
                    style={{
                      background: 'radial-gradient(ellipse at center top, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.1) 40%, transparent 70%)'
                    }}
                  />
                  
                  {/* Enhanced border */}
                  <div className={`absolute inset-0 border rounded-md transition-all duration-500 ${
                    activeTab === tab.id 
                      ? 'border-gold-300/70 shadow-md shadow-gold-300/20' 
                      : 'border-transparent group-hover/tab:border-gold-300/40'
                    }`} />
                  
                  {/* Content with enhanced typography */}
                  <div className={`relative flex items-center justify-center space-x-3 transition-all duration-500 ${
                    activeTab === tab.id 
                      ? 'text-gold-300 transform scale-105' 
                      : 'text-amber-200/70 group-hover/tab:text-gold-300 group-hover/tab:transform group-hover/tab:scale-102'
                  }`}>
                    <span className="text-lg">{tab.icon}</span>
                    <span className="text-sm font-light tracking-[0.1em]"
                          style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      {tab.label.toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Expanding underline with gradient effect */}
                  <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 transition-all duration-700 ease-out ${
                    activeTab === tab.id 
                      ? 'w-4/5 bg-gradient-to-r from-transparent via-gold-300 to-transparent shadow-sm shadow-gold-300/50' 
                      : 'w-0 group-hover/tab:w-3/5 bg-gradient-to-r from-transparent via-gold-300/70 to-transparent'
                  }`} />
                </button>
              ))}
            </nav>
          </div>
          
          {/* Enhanced Tab Content Container */}
          <div className="relative p-8 rounded-lg border border-gold-300/30 backdrop-blur-md"
               style={{ backgroundColor: 'rgba(42, 36, 56, 0.9)' }}>
            {activeTab === 'database' && (
              <DatabaseManagement
                storedBackups={storedBackups}
                isLoadingBackups={isLoadingBackups}
                backupsError={backupsError}
                onRefreshBackups={refreshBackups}
                onError={handleError}
              />
            )}

            {activeTab === 'users' && (
              <UserManagement
                profiles={profiles}
                isLoading={isLoading}
                error={error}
                onRefreshProfiles={refreshProfiles}
                onError={handleError}
                onSuccess={handleSuccess}
              />
            )}

            {activeTab === 'poi-types' && (
              <PoiDefinitionManager 
                poiTypes={poiTypes}
                onError={handleError}
                onSuccess={handleSuccess}
                onDataChange={refreshData}
              />
            )}

            {activeTab === 'settings' && (
              <MapSettings
                onError={handleError}
                onSuccess={handleSuccess}
              />
            )}

            {activeTab === 'tasks' && (
              <ScheduledTasks
                scheduledTasks={scheduledTasks}
                isLoading={isLoading}
                error={error}
                onRefreshTasks={refreshScheduledTasks}
                onError={handleError}
                onSuccess={handleSuccess}
              />
            )}

            {activeTab === 'ranks' && (
              <RankManagement
                onError={handleError}
                onSuccess={handleSuccess}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;