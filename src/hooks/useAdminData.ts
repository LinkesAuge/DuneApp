import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, BackupsByType, ScheduledAdminTask } from '../types/admin';
import { PoiType } from '../types';

export const useAdminData = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [poiTypes, setPoiTypes] = useState<PoiType[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledAdminTask[]>([]);
  const [storedBackups, setStoredBackups] = useState<BackupsByType>({
    deep_desert: [],
    hagga_basin: [],
    combined: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backupsError, setBackupsError] = useState<string | null>(null);

  // Load all admin data
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadProfiles(),
        loadPoiTypes(),
        loadScheduledTasks()
      ]);
    } catch (error: any) {
      console.error('Error loading admin data:', error);
      setError('Failed to load admin data: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Load user profiles
  const loadProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, email, role, custom_avatar_url, discord_avatar_url, use_discord_avatar')
      .order('username');

    if (error) throw error;
    
    // Add a placeholder created_at since the column doesn't exist in profiles table
    const profilesWithDate = (data || []).map(profile => ({
      ...profile,
      created_at: new Date().toISOString() // Placeholder date
    }));
    
    // Profiles loaded successfully
    setProfiles(profilesWithDate);
  };

  // Load POI types
  const loadPoiTypes = async () => {
    const { data, error } = await supabase
      .from('poi_types')
      .select('*')
      .order('name');

    if (error) throw error;
    setPoiTypes(data || []);
  };

  // Load scheduled tasks
  const loadScheduledTasks = async () => {
    try {
      // Attempting to load scheduled tasks
      const { data, error } = await supabase.functions.invoke('get-scheduled-admin-tasks');

              // Scheduled tasks response received

      if (error) {
        console.warn('Edge Functions not available for scheduled tasks:', error);
        setScheduledTasks([]);
        return;
      }

      if (data?.tasks) {
        // Successfully loaded scheduled tasks
        setScheduledTasks(data.tasks || []);
      } else {
        console.warn('Failed to load scheduled tasks, data structure:', data);
        setScheduledTasks([]);
      }
    } catch (error: any) {
      console.warn('Scheduled tasks feature unavailable:', error.message);
      // Don't throw here as this is optional functionality
      setScheduledTasks([]);
    }
  };

  // Load backup files
  const loadBackups = async () => {
    setIsLoadingBackups(true);
    setBackupsError(null);

    try {
      const { data, error } = await supabase.functions.invoke('list-map-backups');

      if (error) throw error;

      if (data?.success) {
        setStoredBackups(data.backups || {
          deep_desert: [],
          hagga_basin: [],
          combined: []
        });
      } else {
        throw new Error(data?.error || 'Failed to load backups');
      }
    } catch (error: any) {
      console.error('Error loading backups:', error);
      setBackupsError('Failed to load backups: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoadingBackups(false);
    }
  };

  // Refresh functions
  const refreshData = () => {
    loadData();
  };

  const refreshProfiles = () => {
    loadProfiles();
  };

  const refreshScheduledTasks = () => {
    loadScheduledTasks();
  };

  const refreshBackups = () => {
    loadBackups();
  };

  // Initial data load
  useEffect(() => {
    loadData();
  }, []);

  return {
    // Data
    profiles,
    poiTypes,
    scheduledTasks,
    storedBackups,
    
    // Loading states
    isLoading,
    isLoadingBackups,
    
    // Error states
    error,
    backupsError,
    
    // Refresh functions
    refreshData,
    refreshProfiles,
    refreshScheduledTasks,
    refreshBackups,
    
    // Error setters
    setError,
    setBackupsError
  };
}; 