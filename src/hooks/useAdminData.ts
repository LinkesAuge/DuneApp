import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, BackupsByType, ScheduledAdminTask } from '../types/admin';
import { PoiType } from '../types';
import { Guild } from '../types/profile';

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
  const [guilds, setGuilds] = useState<Guild[]>([]);

  // Load all admin data
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadProfiles(),
        loadPoiTypes(),
        loadScheduledTasks(),
        loadGuilds()
      ]);
    } catch (error: any) {
      console.error('Error loading admin data:', error);
      setError('Failed to load admin data: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Load user profiles with guild information
  const loadProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id, 
        username, 
        email, 
        role, 
        custom_avatar_url, 
        discord_avatar_url, 
        use_discord_avatar, 
        actual_join_date, 
        updated_at,
        guild_id,
        guild_role,
        guild_joined_at,
        guild_assigned_by,
        guilds:guild_id (
          id,
          name,
          tag_color,
          tag_text_color
        )
      `)
      .order('username');

    if (error) throw error;
    
    setProfiles(data || []);
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

  // Load guilds
  const loadGuilds = async () => {
    const { data, error } = await supabase
      .from('guilds')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    setGuilds(data || []);
  };

  // Assign user to guild
  const assignUserToGuild = async (userId: string, guildId: string | null, guildRole: 'leader' | 'officer' | 'member' = 'member') => {
    const updateData: any = {
      guild_id: guildId,
      guild_role: guildRole,
      guild_joined_at: guildId ? new Date().toISOString() : null,
      guild_assigned_by: guildId ? (await supabase.auth.getUser()).data.user?.id : null
    };

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) throw error;
    
    // Reload profiles to get updated data
    await loadProfiles();
  };

  // Get guild by ID
  const getGuildById = (guildId: string | null): Guild | null => {
    if (!guildId) return null;
    return guilds.find(g => g.id === guildId) || null;
  };

  // Get unassigned guild (for default assignment)
  const getUnassignedGuild = (): Guild | null => {
    return guilds.find(g => g.name === 'Unassigned') || null;
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
    guilds,
    
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
    setBackupsError,
    
    // Guild functions
    loadGuilds,
    assignUserToGuild,
    getGuildById,
    getUnassignedGuild
  };
}; 