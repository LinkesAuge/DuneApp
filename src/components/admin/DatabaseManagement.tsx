import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2, 
  AlertTriangle,
  Archive,
  Shield
} from 'lucide-react';
import { BackupsByType, StoredBackupFile, DangerAction } from '../../types/admin';

interface DatabaseManagementProps {
  storedBackups: BackupsByType;
  isLoadingBackups: boolean;
  backupsError: string | null;
  onRefreshBackups: () => void;
  onError: (error: string) => void;
}

const DatabaseManagement: React.FC<DatabaseManagementProps> = ({
  storedBackups,
  isLoadingBackups,
  backupsError,
  onRefreshBackups,
  onError
}) => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isResettingDeepDesert, setIsResettingDeepDesert] = useState(false);
  const [isResettingHaggaBasin, setIsResettingHaggaBasin] = useState(false);
  const [isDeletingBackup, setIsDeletingBackup] = useState<string | null>(null);
  const [deepDesertBackupOnReset, setDeepDesertBackupOnReset] = useState(true);
  const [haggaBasinBackupOnReset, setHaggaBasinBackupOnReset] = useState(true);
  
  // Danger modal state
  const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);
  const [dangerAction, setDangerAction] = useState<DangerAction | null>(null);
  const [dangerConfirmationInput, setDangerConfirmationInput] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Unknown';
      
      // European format with Berlin time
      const berlinTime = new Intl.DateTimeFormat('de-DE', {
        timeZone: 'Europe/Berlin',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
      
      return `${berlinTime} (Berlin Time)`;
    } catch {
      return 'Unknown';
    }
  };

  const handleBackup = async (mapType: 'deep_desert' | 'hagga_basin' | 'both' = 'both') => {
    setIsBackingUp(true);
    try {
      const { data, error } = await supabase.functions.invoke('perform-map-backup', {
        body: { mapType }
      });

      if (error) throw error;

      if (data?.success) {
        onRefreshBackups();
      } else {
        throw new Error(data?.error || 'Backup failed');
      }
    } catch (error: any) {
      console.error('Backup error:', error);
      onError('Backup failed: ' + (error.message || 'Unknown error'));
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    try {
      const fileContent = await file.text();
      const backupData = JSON.parse(fileContent);

      const { data, error } = await supabase.functions.invoke('manage-database', {
        body: {
          action: 'restore',
          backupData: backupData
        }
      });

      if (error) throw error;

      if (data?.success) {
        onRefreshBackups();
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(data?.error || 'Restore failed');
      }
    } catch (error: any) {
      console.error('Restore error:', error);
      onError('Restore failed: ' + (error.message || 'Unknown error'));
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete backup "${filename}"?`)) {
      return;
    }

    setIsDeletingBackup(filename);
    try {
      const { data, error } = await supabase.functions.invoke('delete-map-backup', {
        body: { filename }
      });

      if (error) throw error;

      if (data?.success) {
        onRefreshBackups();
      } else {
        throw new Error(data?.error || 'Failed to delete backup');
      }
    } catch (error: any) {
      console.error('Delete backup error:', error);
      onError('Failed to delete backup: ' + (error.message || 'Unknown error'));
    } finally {
      setIsDeletingBackup(null);
    }
  };

  const confirmDangerAction = () => {
    const expectedText = dangerAction === 'reset_deep_desert' ? 'DELETE DEEP DESERT' : 'DELETE HAGGA BASIN';
    if (dangerConfirmationInput !== expectedText) {
      onError(`Please type "${expectedText}" to proceed`);
      return;
    }

    if (dangerAction === 'reset_deep_desert') {
      handleMapReset('deep_desert');
    } else if (dangerAction === 'reset_hagga_basin') {
      handleMapReset('hagga_basin');
    }

    setIsDangerModalOpen(false);
    setDangerAction(null);
    setDangerConfirmationInput('');
  };

  const handleMapReset = async (mapType: 'deep_desert' | 'hagga_basin') => {
    if (mapType === 'deep_desert') {
      setIsResettingDeepDesert(true);
    } else {
      setIsResettingHaggaBasin(true);
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('perform-map-reset', {
        body: {
          mapType,
          backupBeforeReset: mapType === 'deep_desert' ? deepDesertBackupOnReset : haggaBasinBackupOnReset
        }
      });

      if (error) throw error;

      if (data?.success) {
        onRefreshBackups();
      } else {
        throw new Error(data?.error || 'Map reset failed');
      }
    } catch (error: any) {
      console.error('Map reset error:', error);
      onError('Map reset failed: ' + (error.message || 'Unknown error'));
    } finally {
      if (mapType === 'deep_desert') {
        setIsResettingDeepDesert(false);
      } else {
        setIsResettingHaggaBasin(false);
      }
    }
  };

  if (isLoadingBackups) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block p-4 rounded-full border border-amber-400/20 mb-6"
               style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
            <Database className="text-gold-300" size={24} />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-300 mx-auto mb-4"></div>
          <p className="text-amber-200 font-light tracking-wide"
             style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            Loading database management...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-light text-amber-200 flex items-center"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
          <Database className="mr-4 text-gold-300" size={28} />
          Database Management
        </h3>
        <button
          onClick={onRefreshBackups}
          className="text-amber-200/70 hover:text-gold-300 transition-all duration-300 p-2 rounded-md border border-amber-200/30 hover:border-gold-300/40 hover:bg-gold-300/10 flex items-center"
        >
          <RefreshCw size={16} className="mr-2" />
          <span className="text-sm font-light tracking-wide"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            Refresh
          </span>
        </button>
      </div>

      {backupsError && (
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
          <div className="absolute inset-0 bg-gradient-to-b from-red-600/10 via-red-500/5 to-transparent rounded-lg" />
          
          <div className="relative p-4 rounded-lg border border-red-400/40">
            <p className="text-red-300 font-light"
               style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              {backupsError}
            </p>
          </div>
        </div>
      )}

      {/* Backup & Restore Section */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
        <div className="absolute inset-0 bg-gradient-to-b from-amber-600/10 via-amber-500/5 to-transparent rounded-lg" />
        
        <div className="relative rounded-lg border border-amber-400/20">
          <div className="p-4 border-b border-amber-300/20">
            <h4 className="text-lg font-light text-amber-200 flex items-center"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              <Archive className="mr-3 text-gold-300" size={20} />
              Backup & Restore
            </h4>
          </div>

          <div className="p-6 space-y-6">
            {/* Backup Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleBackup('deep_desert')}
                disabled={isBackingUp}
                className="group/btn relative p-4 rounded-lg border border-amber-400/30 hover:border-gold-300/50 transition-all duration-300 
                         hover:bg-gold-300/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-800/20 to-slate-900/40 rounded-lg" />
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-violet-600/10 via-violet-700/5 to-transparent" />
                
                <div className="relative text-center">
                  <div className="w-10 h-10 mx-auto mb-3 rounded border border-gold-300/40 flex items-center justify-center"
                       style={{ backgroundColor: 'rgba(251, 191, 36, 0.2)' }}>
                    {isBackingUp ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gold-300"></div>
                    ) : (
                      <Download className="text-gold-300" size={20} />
                    )}
                  </div>
                  <div className="text-amber-200 font-medium text-sm group-hover/btn:text-gold-300 transition-colors duration-300"
                       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    Deep Desert
                  </div>
                  <div className="text-amber-200/60 text-xs font-light mt-1">
                    Backup grid data
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleBackup('hagga_basin')}
                disabled={isBackingUp}
                className="group/btn relative p-4 rounded-lg border border-amber-400/30 hover:border-gold-300/50 transition-all duration-300 
                         hover:bg-gold-300/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-800/20 to-slate-900/40 rounded-lg" />
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-violet-600/10 via-violet-700/5 to-transparent" />
                
                <div className="relative text-center">
                  <div className="w-10 h-10 mx-auto mb-3 rounded border border-gold-300/40 flex items-center justify-center"
                       style={{ backgroundColor: 'rgba(251, 191, 36, 0.2)' }}>
                    {isBackingUp ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gold-300"></div>
                    ) : (
                      <Download className="text-gold-300" size={20} />
                    )}
                  </div>
                  <div className="text-amber-200 font-medium text-sm group-hover/btn:text-gold-300 transition-colors duration-300"
                       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    Hagga Basin
                  </div>
                  <div className="text-amber-200/60 text-xs font-light mt-1">
                    Backup POI data
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleBackup('both')}
                disabled={isBackingUp}
                className="group/btn relative p-4 rounded-lg border border-amber-400/30 hover:border-gold-300/50 transition-all duration-300 
                         hover:bg-gold-300/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-800/20 to-slate-900/40 rounded-lg" />
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-violet-600/10 via-violet-700/5 to-transparent" />
                
                <div className="relative text-center">
                  <div className="w-10 h-10 mx-auto mb-3 rounded border border-gold-300/40 flex items-center justify-center"
                       style={{ backgroundColor: 'rgba(251, 191, 36, 0.2)' }}>
                    {isBackingUp ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gold-300"></div>
                    ) : (
                      <Download className="text-gold-300" size={20} />
                    )}
                  </div>
                  <div className="text-amber-200 font-medium text-sm group-hover/btn:text-gold-300 transition-colors duration-300"
                       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    Complete Backup
                  </div>
                  <div className="text-amber-200/60 text-xs font-light mt-1">
                    All map data
                  </div>
                </div>
              </button>
            </div>

            {/* Restore Section */}
            <div className="space-y-4">
              <h5 className="text-amber-200 font-medium text-sm mb-4 tracking-wide"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                Restore from Backup
              </h5>
              <div className="flex items-center space-x-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleRestore}
                  disabled={isRestoring}
                  className="hidden"
                  id="backup-file-input"
                />
                <label
                  htmlFor="backup-file-input"
                  className={`group/restore relative px-6 py-3 rounded-lg border border-amber-400/30 hover:border-gold-300/50 transition-all duration-300 
                            cursor-pointer flex items-center ${
                              isRestoring 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:bg-gold-300/10 text-amber-200 hover:text-gold-300'
                            }`}
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-800/20 to-slate-900/40 rounded-lg" />
                  <div className="absolute inset-0 rounded-lg opacity-0 group-hover/restore:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-violet-600/10 via-violet-700/5 to-transparent" />
                  
                  <span className="relative flex items-center">
                    {isRestoring ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gold-300 mr-2"></div>
                    ) : (
                      <Upload size={16} className="mr-2" />
                    )}
                    {isRestoring ? 'Restoring...' : 'Choose Backup File'}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stored Backups */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
        <div className="absolute inset-0 bg-gradient-to-b from-amber-600/10 via-amber-500/5 to-transparent rounded-lg" />
        
        <div className="relative rounded-lg border border-amber-400/20">
          <div className="p-4 border-b border-amber-300/20">
            <h4 className="text-lg font-light text-amber-200 flex items-center"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              <Archive className="mr-3 text-gold-300" size={20} />
              Stored Backups
            </h4>
          </div>

          <div className="p-6">
            {Object.keys(storedBackups).length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-block p-3 rounded-full border border-amber-400/20 mb-3"
                     style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
                  <Archive className="text-gold-300" size={20} />
                </div>
                <p className="text-amber-200/70 font-light"
                   style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  No backups available
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(storedBackups).map(([type, backups]) => (
                  <div key={type}>
                    <h5 className="text-amber-200 font-medium text-sm mb-3 tracking-wide capitalize"
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      {type.replace('_', ' ')} Backups ({backups.length})
                    </h5>
                    <div className="space-y-2">
                      {backups.map((backup: StoredBackupFile) => (
                        <div key={backup.name} className="group/backup relative p-3 rounded-lg border border-amber-400/20 hover:border-gold-300/40 transition-all duration-300">
                          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
                          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-800/20 to-slate-900/40 rounded-lg" />
                          <div className="absolute inset-0 rounded-lg opacity-0 group-hover/backup:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-violet-600/10 via-violet-700/5 to-transparent" />
                          
                          <div className="relative flex items-center">
                            <div className="flex-1 min-w-0">
                              <div className="text-amber-200 font-medium text-sm"
                                   style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                                {backup.name}
                              </div>
                              <div className="text-amber-200/60 text-xs font-light mt-1 space-x-4">
                                <span>Size: {formatBytes(backup.size)}</span>
                                <span>Created: {formatDate(backup.created_at)}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 opacity-0 group-hover/backup:opacity-100 transition-opacity duration-300">
                              <a
                                href={backup.download_url}
                                download={backup.name}
                                className="p-2 text-amber-200 hover:text-gold-300 transition-colors duration-300"
                                title="Download backup"
                              >
                                <Download size={16} />
                              </a>
                              <button
                                onClick={() => handleDeleteBackup(backup.name)}
                                disabled={isDeletingBackup === backup.name}
                                className="p-2 text-red-400 hover:text-red-300 transition-colors duration-300 disabled:opacity-50"
                                title="Delete backup"
                              >
                                {isDeletingBackup === backup.name ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
        <div className="absolute inset-0 bg-gradient-to-b from-red-600/10 via-red-500/5 to-transparent rounded-lg" />
        
        <div className="relative rounded-lg border border-red-400/40">
          <div className="p-4 border-b border-red-400/30">
            <h4 className="text-lg font-light text-red-300 flex items-center"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              <AlertTriangle className="mr-3 text-red-400" size={20} />
              Danger Zone
            </h4>
          </div>

          <div className="p-6 space-y-6">
            {/* Backup Options for Reset */}
            <div className="space-y-6">
              {/* Deep Desert Reset Section */}
              <div className="group/reset relative">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-800/20 to-slate-900/40 rounded-lg" />
                <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 via-red-500/2 to-transparent rounded-lg" />
                
                <div className="relative space-y-4 p-4 rounded-lg border border-red-400/20">
                  <h5 className="text-red-300 font-medium text-sm tracking-wide flex items-center"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    <AlertTriangle size={16} className="mr-2" />
                    Deep Desert Reset
                  </h5>
                  <p className="text-red-300/80 text-xs font-light leading-relaxed">
                    This will permanently delete all Deep Desert data including:
                    <br />• All grid squares (A1-I9) and their screenshots
                    <br />• All Deep Desert POIs and their images
                    <br />• All comments on Deep Desert POIs
                    <br />• Original screenshot files and crop data
                  </p>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deepDesertBackupOnReset}
                      onChange={(e) => setDeepDesertBackupOnReset(e.target.checked)}
                      className="w-4 h-4 text-gold-300 bg-void-950/60 border-red-400/40 rounded 
                               focus:ring-red-400/50 focus:ring-2"
                    />
                    <span className="text-red-300 font-light tracking-wide"
                          style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      Create backup before reset (recommended)
                    </span>
                  </label>
                  <button
                    onClick={() => {
                      setDangerAction('reset_deep_desert');
                      setIsDangerModalOpen(true);
                    }}
                    disabled={isResettingDeepDesert}
                    className="group/dangerbtn relative px-6 py-3 text-white font-medium rounded-lg 
                             transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center border border-red-400/40 hover:border-red-400/60"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                  >
                    <div className="absolute inset-0 bg-red-500/80 group-hover/dangerbtn:bg-red-500 rounded-lg transition-all duration-300" />
                    <span className="relative flex items-center">
                      {isResettingDeepDesert ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <AlertTriangle size={16} className="mr-2" />
                      )}
                      {isResettingDeepDesert ? 'Resetting Deep Desert...' : 'Reset Deep Desert'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Hagga Basin Reset Section */}
              <div className="group/reset relative">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-800/20 to-slate-900/40 rounded-lg" />
                <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 via-red-500/2 to-transparent rounded-lg" />
                
                <div className="relative space-y-4 p-4 rounded-lg border border-red-400/20">
                  <h5 className="text-red-300 font-medium text-sm tracking-wide flex items-center"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    <AlertTriangle size={16} className="mr-2" />
                    Hagga Basin Reset
                  </h5>
                  <p className="text-red-300/80 text-xs font-light leading-relaxed">
                    This will permanently delete all Hagga Basin data including:
                    <br />• All Hagga Basin POIs and their screenshots
                    <br />• All comments on Hagga Basin POIs
                    <br />• POI position data and custom configurations
                    <br />• Associated image files and metadata
                  </p>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={haggaBasinBackupOnReset}
                      onChange={(e) => setHaggaBasinBackupOnReset(e.target.checked)}
                      className="w-4 h-4 text-gold-300 bg-void-950/60 border-red-400/40 rounded 
                               focus:ring-red-400/50 focus:ring-2"
                    />
                    <span className="text-red-300 font-light tracking-wide"
                          style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      Create backup before reset (recommended)
                    </span>
                  </label>
                  <button
                    onClick={() => {
                      setDangerAction('reset_hagga_basin');
                      setIsDangerModalOpen(true);
                    }}
                    disabled={isResettingHaggaBasin}
                    className="group/dangerbtn relative px-6 py-3 text-white font-medium rounded-lg 
                             transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center border border-red-400/40 hover:border-red-400/60"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                  >
                    <div className="absolute inset-0 bg-red-500/80 group-hover/dangerbtn:bg-red-500 rounded-lg transition-all duration-300" />
                    <span className="relative flex items-center">
                      {isResettingHaggaBasin ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <AlertTriangle size={16} className="mr-2" />
                      )}
                      {isResettingHaggaBasin ? 'Resetting Hagga Basin...' : 'Reset Hagga Basin'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Confirmation Modal */}
      {isDangerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
          <div className="relative max-w-md w-full rounded-lg border border-red-400/40 backdrop-blur-md"
               style={{ backgroundColor: 'rgba(42, 36, 56, 0.9)' }}>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full border border-red-400/40 flex items-center justify-center mr-4"
                     style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}>
                  <Shield className="text-red-400" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-light text-red-300 tracking-wide"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    Confirm Dangerous Action
                  </h3>
                  <p className="text-red-300/70 text-sm font-light">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-amber-200 text-sm mb-4 font-light"
                   style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  {dangerAction === 'reset_deep_desert' ? (
                    <>
                      You are about to permanently delete <strong>ALL Deep Desert data</strong> including grid squares (A1-I9), screenshots, POIs, comments, and original screenshot files and crop data.
                      <br /><br />
                      Type <strong>DELETE DEEP DESERT</strong> to confirm this irreversible action:
                    </>
                  ) : (
                    <>
                      You are about to permanently delete <strong>ALL Hagga Basin data</strong> including POIs, screenshots, comments, position data, and associated files.
                      <br /><br />
                      Type <strong>DELETE HAGGA BASIN</strong> to confirm this irreversible action:
                    </>
                  )}
                </p>
                <input
                  type="text"
                  value={dangerConfirmationInput}
                  onChange={(e) => setDangerConfirmationInput(e.target.value)}
                  className="w-full px-4 py-3 bg-void-950/60 border border-red-400/40 rounded-md 
                           text-amber-200 placeholder-red-300/40 backdrop-blur-sm
                           focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400/60
                           transition-all duration-300"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                  placeholder={dangerAction === 'reset_deep_desert' ? 'Type DELETE DEEP DESERT' : 'Type DELETE HAGGA BASIN'}
                />
              </div>

              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => {
                    setIsDangerModalOpen(false);
                    setDangerAction(null);
                    setDangerConfirmationInput('');
                  }}
                  className="px-4 py-2 text-amber-200/70 hover:text-amber-200 transition-all duration-300 
                           border border-amber-200/30 hover:border-amber-200/50 rounded-md font-light tracking-wide
                           hover:bg-amber-200/5"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDangerAction}
                  disabled={dangerConfirmationInput !== (dangerAction === 'reset_deep_desert' ? 'DELETE DEEP DESERT' : 'DELETE HAGGA BASIN')}
                  className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white font-medium rounded-md 
                           transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                           border border-red-400/40 hover:border-red-400/60"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                >
                  {dangerAction === 'reset_deep_desert' ? 'Confirm Deep Desert Reset' : 'Confirm Hagga Basin Reset'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseManagement; 