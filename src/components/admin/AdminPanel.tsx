import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { User, UserRole, PoiType, ScheduledAdminTask } from '../../types';
import { Shield, Users, Database, Download, Upload, Trash2, AlertTriangle, Map, CalendarClock, Trash, ListChecks, RefreshCw, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PoiTypeManager from './PoiTypeManager';
import BaseMapUploader from './BaseMapUploader';

interface Profile {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

// Interface for files listed from storage
interface StoredBackupFile {
  name: string;
  id: string; 
  created_at: string;
  size: number; 
  mime_type?: string;
  downloadUrl?: string; 
  fullPath: string; 
}

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [poiTypes, setPoiTypes] = useState<PoiType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'database' | 'poi-types' | 'maps'>('users');
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for scheduled tasks
  type ScheduledTaskFrequency = 'daily' | 'weekly';
  const [scheduledBackupTime, setScheduledBackupTime] = useState('02:00');
  const [scheduledBackupStartDate, setScheduledBackupStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledBackupFrequency, setScheduledBackupFrequency] = useState<ScheduledTaskFrequency>('daily');
  const [scheduledResetTime, setScheduledResetTime] = useState('02:00');
  const [scheduledResetStartDate, setScheduledResetStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledResetFrequency, setScheduledResetFrequency] = useState<ScheduledTaskFrequency>('daily');
  const [backupBeforeReset, setBackupBeforeReset] = useState(true);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledAdminTask[]>([]);
  const [isSchedulingBackup, setIsSchedulingBackup] = useState(false);
  const [isSchedulingReset, setIsSchedulingReset] = useState(false);

  // State for stored backup files list
  const [storedBackups, setStoredBackups] = useState<StoredBackupFile[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [backupsError, setBackupsError] = useState<string | null>(null);
  const [isDeletingBackup, setIsDeletingBackup] = useState<string | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState<string | null>(null);

  // State for User Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  // Map Settings State
  const [mapSettings, setMapSettings] = useState({
    iconMinSize: 64,
    iconMaxSize: 128,
    iconBaseSize: 64,
    showTooltips: true,
    enablePositionChange: true,
    defaultZoom: 0.4,
    defaultVisibleTypes: [] as string[],
    enableAdvancedFiltering: false,
    showSharedIndicators: true
  });

  const fetchScheduledTasks = async () => {
    setError(null);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.warn('No active session or session error, cannot fetch scheduled tasks.');
        setScheduledTasks([]);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-scheduled-admin-tasks`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch scheduled tasks.');
      }
      if (result.tasks && Array.isArray(result.tasks)) {
        setScheduledTasks(result.tasks);
      } else {
        console.warn('Unexpected format for scheduled tasks:', result);
        setScheduledTasks([]);
      }
    } catch (err: any) {
      console.error('Error fetching scheduled tasks:', err);
      setError('Could not load scheduled tasks: ' + err.message);
      setScheduledTasks([]);
    }
  };

  const fetchStoredBackups = async () => {
    setIsLoadingBackups(true);
    setBackupsError(null);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.warn('No active session for fetching stored backups.');
        setStoredBackups([]);
        setIsLoadingBackups(false);
        return;
      }
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/list-map-backups`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch stored backups.');
      }
      if (result.backups && Array.isArray(result.backups)) {
        setStoredBackups(result.backups);
      } else {
        console.warn('Unexpected format for stored backups list:', result);
        setStoredBackups([]);
      }
    } catch (err: any) {
      console.error('Error fetching stored backups:', err);
      setBackupsError('Could not load stored backups: ' + err.message);
      setStoredBackups([]);
    } finally {
      setIsLoadingBackups(false);
    }
  };

  const handleDeleteBackupFile = async (fileName: string) => {
    if (!confirm(`Are you sure you want to delete the backup file: ${fileName}? This action cannot be undone.`)) {
      return;
    }
    setIsDeletingBackup(fileName);
    setBackupsError(null);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.warn('No active session for deleting backup.');
        throw new Error('No active session. Please re-login.');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-map-backup`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileName: fileName }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Failed to delete backup file ${fileName}.`);
      }
      alert(result.message || `Backup file ${fileName} deleted successfully.`);
      fetchStoredBackups();
    } catch (err: any) {
      console.error(`Error deleting backup file ${fileName}:`, err);
      setBackupsError(`Could not delete ${fileName}: ${err.message}`);
      alert(`Error deleting ${fileName}: ${err.message}`);
    } finally {
      setIsDeletingBackup(null);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, role, email')
        .order('username');
      if (profilesError) throw profilesError;
      setProfiles(profilesData || []);
    } catch (err: any) {
      console.error('Error fetching profiles:', err);
      setError(err.message);
      setProfiles([]);
    }
  };

  const fetchPoiTypesForAdmin = async () => {
    try {
      const { data: poiTypesData, error: poiTypesError } = await supabase
        .from('poi_types')
        .select('*')
        .order('category', { ascending: true });
      if (poiTypesError) throw poiTypesError;
      setPoiTypes(poiTypesData || []);
    } catch (err: any) {
      console.error('Error fetching POI types:', err);
      setError(err.message);
      setPoiTypes([]);
    }
  };

  const fetchInitialAdminData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchProfiles(),
        fetchPoiTypesForAdmin(),
      ]);
    } catch (err: any) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchInitialAdminData();
      fetchScheduledTasks();
      fetchStoredBackups();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleRoleChange = async (profileId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(prev => 
        prev.map(profile => 
          profile.id === profileId ? { ...profile, role: newRole } : profile
        )
      );
    } catch (err: any) {
      console.error('Error updating role:', err);
      setError(err.message);
    }
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    setError(null);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) {
        navigate('/auth');
        throw new Error('No active session');
      }

      const { data: { user: freshUser }, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) throw refreshError;
      if (!freshUser) {
        throw new Error('Failed to refresh session');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;
      if (!profile || profile.role !== 'admin') {
        throw new Error('Only administrators can perform this action');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-database`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ operation: 'backup' }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create backup');
      }

      const data = await response.json();
      
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `deep-desert-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // After manual backup, refresh the list of stored backups
      fetchStoredBackups(); 

    } catch (err: any) {
      console.error('Error creating backup:', err);
      if (err.message.includes('No active session') || err.message.includes('Invalid Refresh Token')) {
        navigate('/auth');
      }
      setError(err.message);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    setError(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) {
        navigate('/auth');
        throw new Error('No active session');
      }

      const { data: { user: freshUser }, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) throw refreshError;
      if (!freshUser) {
        throw new Error('Failed to refresh session');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;
      if (!profile || profile.role !== 'admin') {
        throw new Error('Only administrators can perform this action');
      }

      const fileContent = await file.text();
      const backupData = JSON.parse(fileContent);

      if (!backupData.timestamp || !backupData.grid_squares || !backupData.pois) {
        throw new Error('Invalid backup file format');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-database`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            operation: 'restore',
            data: backupData
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to restore backup');
      }

      alert('Backup restored successfully. Please refresh the page to see the changes.');
    } catch (err: any) {
      console.error('Error restoring backup:', err);
      if (err.message.includes('No active session') || err.message.includes('Invalid Refresh Token')) {
        navigate('/auth');
      }
      setError(err.message);
    } finally {
      setIsRestoring(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleReset = async () => {
    if (!confirm('WARNING: This will permanently delete all grid squares and POIs. This action cannot be undone. Are you sure you want to proceed?')) {
      return;
    }

    setIsResetting(true);
    setError(null);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) {
        navigate('/auth');
        throw new Error('No active session');
      }

      const { data: { user: freshUser }, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) throw refreshError;
      if (!freshUser) {
        throw new Error('Failed to refresh session');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;
      if (!profile || profile.role !== 'admin') {
        throw new Error('Only administrators can perform this action');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-database`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ operation: 'reset' }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset map');
      }

      alert('Map has been reset successfully. Please refresh the page to see the changes.');
      fetchStoredBackups(); // Refresh list after reset (if backup was made as part of it, or to show it's empty)
    } catch (err: any) {
      console.error('Error resetting map:', err);
      if (err.message.includes('No active session') || err.message.includes('Invalid Refresh Token')) {
        navigate('/auth');
      }
      setError(err.message);
    } finally {
      setIsResetting(false);
    }
  };

  const handleScheduleBackup = async () => {
    setIsSchedulingBackup(true);
    setError(null);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error(sessionError?.message || 'No active session. Please re-login.');
      }
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/schedule-admin-task`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            taskType: 'backup',
            time: scheduledBackupTime,
            startDate: scheduledBackupStartDate,
            frequency: scheduledBackupFrequency,
            timezone: userTimezone,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to schedule backup.');
      }
      alert('Backup task scheduled successfully! Details: ' + (result.message || JSON.stringify(result.details)));
      fetchScheduledTasks(); 
      // It might take a moment for the scheduled backup to actually run and create a file.
      // So, a slight delay or just relying on the next manual refresh might be better than immediate fetchStoredBackups.
      // For now, let's let the user manually refresh the stored backups list.
    } catch (err: any) {
      console.error('Error scheduling backup:', err);
      setError(err.message);
      alert('Error scheduling backup: ' + err.message);
    } finally {
      setIsSchedulingBackup(false);
    }
  };

  const handleScheduleReset = async () => {
    setIsSchedulingReset(true);
    setError(null);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error(sessionError?.message || 'No active session. Please re-login.');
      }
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/schedule-admin-task`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            taskType: 'reset',
            time: scheduledResetTime,
            startDate: scheduledResetStartDate,
            frequency: scheduledResetFrequency,
            backupBeforeReset: backupBeforeReset,
            timezone: userTimezone,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to schedule reset.');
      }
      alert('Reset task scheduled successfully! Details: ' + (result.message || JSON.stringify(result.details)));
      fetchScheduledTasks(); 
      // Similar to scheduled backup, the actual backup file from pre-reset won't appear instantly.
    } catch (err: any) {
      console.error('Error scheduling reset:', err);
      setError(err.message);
      alert('Error scheduling reset: ' + err.message);
    } finally {
      setIsSchedulingReset(false);
    }
  };

  const handleDeleteScheduledTask = async (jobName: string) => {
    if (!confirm(`Are you sure you want to delete the scheduled task: ${jobName}?`)) return;
    setError(null);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error(sessionError?.message || 'No active session. Please re-login.');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-scheduled-admin-task`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ jobName }),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Failed to delete task ${jobName}.`);
      }
      alert(result.message || `Task ${jobName} deleted successfully.`);
      fetchScheduledTasks();
    } catch (err: any) {
      console.error(`Error deleting task ${jobName}:`, err);
      setError(err.message);
      alert(`Error deleting task ${jobName}: ` + err.message);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (userId === user?.id) {
      alert("You cannot delete your own account from the admin panel.");
      return;
    }
    if (!confirm(`Are you sure you want to delete the user '${username}'? This will delete their account and profile data. This action cannot be undone.`)) {
      return;
    }
    setIsDeletingUser(userId);
    setError(null);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error(sessionError?.message || 'No active session. Please re-login.');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userIdToDelete: userId }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Failed to delete user ${username}.`);
      }
      alert(result.message || `User ${username} deleted successfully.`);
      fetchProfiles();
    } catch (err: any) {
      console.error(`Error deleting user ${username}:`, err);
      setError(err.message);
      alert(`Error deleting user ${username}: ${err.message}`);
    } finally {
      setIsDeletingUser(null);
    }
  };

  const handleOpenEditModal = (profile: Profile) => {
    setEditingUser(profile);
    setEditUsername(profile.username);
    setEditEmail(profile.email);
    setIsEditModalOpen(true);
    setEditError(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
    setEditUsername('');
    setEditEmail('');
    setEditError(null);
    setIsUpdatingUser(false);
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !editUsername.trim() || !editEmail.trim()) {
      setEditError('Username and Email cannot be empty.');
      return;
    }
    if (editUsername === editingUser.username && editEmail === editingUser.email) {
      setEditError('No changes detected.');
      return;
    }

    setIsUpdatingUser(true);
    setEditError(null);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error(sessionError?.message || 'No active session. Please re-login.');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-user`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userIdToUpdate: editingUser.id,
            newUsername: editUsername,
            newEmail: editEmail,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update user.');
      }

      // Update local profiles state
      setProfiles(prevProfiles => 
        prevProfiles.map(p => 
          p.id === editingUser.id ? { ...p, username: editUsername, email: editEmail } : p
        )
      );
      alert(result.message || 'User updated successfully!');
      handleCloseEditModal();

    } catch (err: any) {
      console.error('Error updating user:', err);
      setEditError(err.message || 'An unexpected error occurred while updating the user.');
    } finally {
      setIsUpdatingUser(false);
    }
  };

  // Map Settings Functions
  const saveMapSettings = async () => {
    try {
      console.log('🔧 [AdminPanel] Attempting to save map settings:', mapSettings);
      
      const { data, error } = await supabase
        .from('app_settings')
        .upsert({
          setting_key: 'hagga_basin_settings',
          setting_value: mapSettings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        })
        .select();

      if (error) {
        console.error('❌ [AdminPanel] Database error saving settings:', error);
        throw error;
      }
      
      console.log('✅ [AdminPanel] Settings saved successfully:', data);
      alert('Map settings saved successfully!');
    } catch (err: any) {
      console.error('❌ [AdminPanel] Error saving map settings:', err);
      alert('Error saving settings: ' + err.message);
    }
  };

  const loadMapSettings = async () => {
    try {
      console.log('🔧 [AdminPanel] Loading map settings from database...');
      
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'hagga_basin_settings')
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" errors
      
      if (data?.setting_value) {
        console.log('🔧 [AdminPanel] Found settings in database:', data.setting_value);
        setMapSettings(prev => ({ ...prev, ...data.setting_value }));
      } else {
        console.log('🔧 [AdminPanel] No settings found in database, using defaults');
      }
    } catch (err: any) {
      console.error('❌ [AdminPanel] Error loading map settings:', err);
    }
  };

  const resetMapSettings = () => {
    setMapSettings({
      iconMinSize: 64,
      iconMaxSize: 128,
      iconBaseSize: 64,
      showTooltips: true,
      enablePositionChange: true,
      defaultZoom: 0.4,
      defaultVisibleTypes: [],
      enableAdvancedFiltering: false,
      showSharedIndicators: true
    });
  };

  // Load settings on component mount
  useEffect(() => {
    if (user && user.role === 'admin') {
      loadMapSettings();
    }
  }, [user]);

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Shield className="text-red-500 w-16 h-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-night-800 mb-2">Access Denied</h1>
        <p className="text-night-600">
          You don't have permission to access the admin panel. Only users with admin role can access this page.
        </p>
      </div>
    );
  }
  
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  const DatabaseTab = () => (
    <div className="space-y-8">
      {/* Manual Backup and Restore Section */}
      <section className="p-6 border border-sand-200 rounded-lg bg-white shadow-sm">
        <h3 className="text-xl font-semibold text-night-700 mb-6 flex items-center">
          <Database className="mr-3 text-night-600" /> Manual Database Operations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Manual Backup */}
          <div className="p-4 bg-sand-50 rounded-md border border-sand-200">
            <h4 className="text-lg font-medium text-night-600 mb-3 flex items-center">
              <Download className="mr-2 text-night-500" /> Create Backup
            </h4>
            <p className="text-sm text-night-500 mb-4">
              Download a JSON file containing all grid squares and POIs.
            </p>
            <button
              onClick={handleBackup}
              disabled={isBackingUp || isRestoring || isResetting}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBackingUp ? 'Backing up...' : 'Download Backup'}
            </button>
          </div>

          {/* Manual Restore */}
          <div className="p-4 bg-sand-50 rounded-md border border-sand-200">
            <h4 className="text-lg font-medium text-night-600 mb-3 flex items-center">
              <Upload className="mr-2 text-night-500" /> Restore from Backup
            </h4>
            <p className="text-sm text-night-500 mb-4">
              Restore the database from a previously downloaded JSON backup file.
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleRestore}
              ref={fileInputRef}
              disabled={isBackingUp || isRestoring || isResetting}
              className="block w-full text-sm text-night-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sand-200 file:text-night-700 hover:file:bg-sand-300 disabled:opacity-50 disabled:cursor-not-allowed mb-2"
            />
            {isRestoring && <p className="text-sm text-blue-500">Restoring backup...</p>}
          </div>
        </div>
      </section>

      {/* Scheduled Tasks Section */}
      <section className="p-6 border border-sand-200 rounded-lg bg-white shadow-sm">
        <h3 className="text-xl font-semibold text-night-700 mb-8 flex items-center">
          <CalendarClock className="mr-3 text-night-600" /> Scheduled Admin Tasks
        </h3>

        {/* Schedule Backup Form */}
        <div className="mb-10 p-5 bg-sand-50 rounded-md border border-sand-200">
          <h4 className="text-lg font-medium text-night-600 mb-4">Schedule Map Backup</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label htmlFor="backup-time" className="block text-sm font-medium text-night-600 mb-1">Time (Local)</label>
              <input
                type="time"
                id="backup-time"
                value={scheduledBackupTime}
                onChange={(e) => setScheduledBackupTime(e.target.value)}
                className="w-full p-2 rounded-md bg-white border-sand-300 text-night-700 focus:ring-spice-500 focus:border-spice-500 shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="backup-start-date" className="block text-sm font-medium text-night-600 mb-1">Start Date</label>
              <input
                type="date"
                id="backup-start-date"
                value={scheduledBackupStartDate}
                onChange={(e) => setScheduledBackupStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-2 rounded-md bg-white border-sand-300 text-night-700 focus:ring-spice-500 focus:border-spice-500 shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="backup-frequency" className="block text-sm font-medium text-night-600 mb-1">Frequency</label>
              <select
                id="backup-frequency"
                value={scheduledBackupFrequency}
                onChange={(e) => setScheduledBackupFrequency(e.target.value as ScheduledTaskFrequency)}
                className="w-full p-2 rounded-md bg-white border-sand-300 text-night-700 focus:ring-spice-500 focus:border-spice-500 shadow-sm"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <button
              onClick={handleScheduleBackup}
              disabled={isSchedulingBackup || isSchedulingReset}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSchedulingBackup ? 'Scheduling...' : 'Schedule Backup'}
            </button>
          </div>
        </div>

        {/* Schedule Reset Form */}
        <div className="mb-10 p-5 bg-sand-50 rounded-md border border-sand-200">
          <h4 className="text-lg font-medium text-night-600 mb-4">Schedule Map Reset</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label htmlFor="reset-time" className="block text-sm font-medium text-night-600 mb-1">Time (Local)</label>
              <input
                type="time"
                id="reset-time"
                value={scheduledResetTime}
                onChange={(e) => setScheduledResetTime(e.target.value)}
                className="w-full p-2 rounded-md bg-white border-sand-300 text-night-700 focus:ring-spice-500 focus:border-spice-500 shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="reset-start-date" className="block text-sm font-medium text-night-600 mb-1">Start Date</label>
              <input
                type="date"
                id="reset-start-date"
                value={scheduledResetStartDate}
                onChange={(e) => setScheduledResetStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-2 rounded-md bg-white border-sand-300 text-night-700 focus:ring-spice-500 focus:border-spice-500 shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="reset-frequency" className="block text-sm font-medium text-night-600 mb-1">Frequency</label>
              <select
                id="reset-frequency"
                value={scheduledResetFrequency}
                onChange={(e) => setScheduledResetFrequency(e.target.value as ScheduledTaskFrequency)}
                className="w-full p-2 rounded-md bg-white border-sand-300 text-night-700 focus:ring-spice-500 focus:border-spice-500 shadow-sm"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <button
              onClick={handleScheduleReset}
              disabled={isSchedulingBackup || isSchedulingReset}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSchedulingReset ? 'Scheduling...' : 'Schedule Reset'}
            </button>
          </div>
          <div className="mt-3">
              <label htmlFor="backup-before-reset" className="flex items-center text-sm text-night-600">
                <input
                  type="checkbox"
                  id="backup-before-reset"
                  checked={backupBeforeReset}
                  onChange={(e) => setBackupBeforeReset(e.target.checked)}
                  className="mr-2 h-4 w-4 rounded text-spice-600 focus:ring-spice-500 border-sand-400 bg-white shadow-sm"
                />
                Perform a backup before resetting the map.
              </label>
            </div>
        </div>

        {/* Currently Scheduled Tasks List */}
        <div>
          <h4 className="text-lg font-medium text-night-600 mb-4">Currently Scheduled Tasks</h4>
          {error && <p className="text-sm text-red-500 mb-2">Error loading scheduled tasks: {error}</p>} 
          {scheduledTasks.length === 0 && !error ? (
            <p className="text-night-500 italic">No tasks are currently scheduled.</p>
          ) : (
            <ul className="space-y-3">
              {scheduledTasks.map((task) => (
                <li key={task.jobId} className="p-4 bg-sand-50 rounded-md border border-sand-200 shadow-sm flex justify-between items-center">
                  <div>
                    <span className={`font-semibold ${task.taskType === 'backup' ? 'text-blue-600' : 'text-orange-600'}`}>
                      {task.taskType.charAt(0).toUpperCase() + task.taskType.slice(1)}
                    </span>
                    <p className="text-sm text-night-500">
                      Scheduled for: {
                        task.frequency === 'weekly' && task.dayOfWeek !== undefined ?
                        `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][task.dayOfWeek]} at ` : 'Daily at '
                      }
                      {task.time ? 
                        task.time + ' (Target Local Time)' :
                        (task.originalScheduledTimeUTC && task.originalScheduledTimeUTC !== 'INVALID_UTC_TIME' ? // Fallback
                          new Date(task.originalScheduledTimeUTC).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) +
                          ' (Calculated Local Time Now)' :
                          'Time Error'
                        )
                      }
                      {task.taskType === 'reset' && task.jobName.includes('_with_backup') &&
                        <span className="italic text-xs"> (includes pre-reset backup)</span>
                      }
                    </p>
                    <p className="text-xs text-night-400">ID: {task.jobName} {task.isActive ? "(Active)" : "(Inactive)"}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteScheduledTask(task.jobName)}
                    className="text-red-600 hover:text-red-500 p-1 rounded-full transition duration-150 ease-in-out"
                    title="Delete Scheduled Task"
                  >
                    <Trash size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Stored Backups Section - NEW */}
      <section className="p-6 border border-sand-200 rounded-lg bg-white shadow-sm">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-night-700 flex items-center">
                <ListChecks className="mr-3 text-night-600" /> Stored Backups (Max 10)
            </h3>
            <button 
                onClick={fetchStoredBackups}
                disabled={isLoadingBackups}
                className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
            >
                <RefreshCw size={16} className={`mr-2 ${isLoadingBackups ? 'animate-spin' : ''}`} />
                {isLoadingBackups ? 'Refreshing...' : 'Refresh List'}
            </button>
        </div>
        
        {isLoadingBackups && (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
          </div>
        )}
        {backupsError && (
            <p className="text-sm text-red-500 mb-4">Error loading stored backups: {backupsError}</p>
        )}
        {!isLoadingBackups && !backupsError && storedBackups.length === 0 && (
            <p className="text-night-500 italic">No stored backups found in Supabase Storage.</p>
        )}
        {!isLoadingBackups && !backupsError && storedBackups.length > 0 && (
            <div className="overflow-x-auto">
                <table className="w-full text-left table-fixed">
                    <thead>
                        <tr className="bg-sand-100">
                            <th className="px-4 py-3 border-b border-sand-200 w-2/5">Filename</th>
                            <th className="px-4 py-3 border-b border-sand-200 w-1/5">Size</th>
                            <th className="px-4 py-3 border-b border-sand-200 w-1/5">Created At</th>
                            <th className="px-4 py-3 border-b border-sand-200 w-1/5 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {storedBackups.map(backup => (
                            <tr key={backup.id || backup.name} className="hover:bg-sand-50">
                                <td className="px-4 py-3 border-b border-sand-200 truncate" title={backup.name}>{backup.name}</td>
                                <td className="px-4 py-3 border-b border-sand-200">{formatBytes(backup.size)}</td>
                                <td className="px-4 py-3 border-b border-sand-200">{new Date(backup.created_at).toLocaleString()}</td>
                                <td className="px-4 py-3 border-b border-sand-200 text-center space-x-2">
                                    {backup.downloadUrl ? (
                                        <a 
                                            href={backup.downloadUrl} 
                                            download={backup.name}
                                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 disabled:opacity-50"
                                        >
                                            <Download size={16} className="mr-1.5" />
                                            Download
                                        </a>
                                    ) : (
                                        <span className="text-xs text-night-400 italic">No download URL</span>
                                    )}
                                    <button
                                      onClick={() => handleDeleteBackupFile(backup.name)}
                                      disabled={isDeletingBackup === backup.name || isLoadingBackups}
                                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                      title={`Delete ${backup.name}`}
                                    >
                                      {isDeletingBackup === backup.name ? (
                                        <>
                                          <RefreshCw size={16} className="mr-1.5 animate-spin" />
                                          Deleting...
                                        </>
                                      ) : (
                                        <Trash2 size={16} className="mr-1.5" />
                                      )}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </section>

      {/* Map Reset Section (Manual) - Danger Zone */}
      <section className="p-6 border border-red-300 rounded-lg bg-red-50 shadow-sm">
        <h3 className="text-xl font-semibold text-red-700 mb-6 flex items-center">
          <AlertTriangle className="mr-3 text-red-600" /> Danger Zone: Map Reset
        </h3>
        <div className="p-4 bg-red-100/50 rounded-md border border-red-300">
          <h4 className="text-lg font-medium text-night-600 mb-3 flex items-center">
            <Map className="mr-2 text-night-500" /> Reset Map Data
          </h4>
          <p className="text-sm text-night-500 mb-4">
            This will permanently delete all grid squares and POIs from the database.
            <strong className="text-red-600"> This action cannot be undone.</strong> It is highly recommended to create a backup first.
          </p>
          <button
            onClick={handleReset}
            disabled={isBackingUp || isRestoring || isResetting}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResetting ? 'Resetting Map...' : 'Reset Map Now'}
          </button>
        </div>
      </section>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Shield className="text-spice-600 mr-3" size={24} />
        <h1 className="text-3xl font-bold">Admin Panel</h1>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mb-6 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b border-sand-200">
          <button
            className={`flex items-center px-6 py-3 ${activeTab === 'users'
                ? 'bg-night-50 border-b-2 border-spice-600 text-night-900 font-medium'
                : 'text-night-600 hover:bg-night-50'
              }`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} className="mr-2" />
            User Management
          </button>
          <button
            className={`flex items-center px-6 py-3 ${activeTab === 'poi-types'
                ? 'bg-night-50 border-b-2 border-spice-600 text-night-900 font-medium'
                : 'text-night-600 hover:bg-night-50'
              }`}
            onClick={() => setActiveTab('poi-types')}
          >
            <Map size={18} className="mr-2" />
            POI Types
          </button>
          <button
            className={`flex items-center px-6 py-3 ${activeTab === 'database'
                ? 'bg-night-50 border-b-2 border-spice-600 text-night-900 font-medium'
                : 'text-night-600 hover:bg-night-50'
              }`}
            onClick={() => setActiveTab('database')}
          >
            <Database size={18} className="mr-2" />
            Database Management
          </button>
          <button
            className={`flex items-center px-6 py-3 ${activeTab === 'maps'
                ? 'bg-night-50 border-b-2 border-spice-600 text-night-900 font-medium'
                : 'text-night-600 hover:bg-night-50'
              }`}
            onClick={() => setActiveTab('maps')}
          >
            <Map size={18} className="mr-2" />
            Map Management
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'users' ? (
            <>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spice-600"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-night-700 mb-1">User Management</h2>
                    <p className="text-sm text-night-500">Manage user roles and permissions.</p>
                  </div>
                  {profiles.map((profile) => (
                    <div key={profile.id} className="p-4 border border-sand-200 rounded-lg bg-sand-50 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1 mb-4 sm:mb-0">
                        <h4 className="text-lg font-semibold text-night-700">{profile.username}</h4>
                        <p className="text-sm text-night-600">{profile.email}</p>
                      </div>
                      <div className="flex items-center space-x-4 sm:ml-4">
                        <select
                          value={profile.role}
                          onChange={(e) => handleRoleChange(profile.id, e.target.value as UserRole)}
                          disabled={profile.id === user?.id}
                          className="bg-white border border-sand-300 text-night-700 rounded-md px-3 py-2 text-sm focus:ring-spice-500 focus:border-spice-500 shadow-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="member">Member</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(profile)}
                            disabled={profile.id === user?.id}
                            className="p-2 text-night-500 hover:text-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Edit User"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(profile.id, profile.username)}
                            disabled={profile.id === user?.id || isDeletingUser === profile.id}
                            className="p-2 text-night-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Delete User"
                          >
                            {isDeletingUser === profile.id ? <RefreshCw size={18} className="animate-spin" /> : <Trash2 size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : activeTab === 'poi-types' ? (
            <PoiTypeManager 
              poiTypes={poiTypes}
              onUpdate={setPoiTypes}
            />
          ) : activeTab === 'maps' ? (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-night-700 mb-1">Map Management</h2>
                <p className="text-sm text-night-500">Upload and manage base maps and configure map settings.</p>
              </div>
              
              {/* Hagga Basin Settings */}
              <div className="bg-sand-50 border border-sand-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-night-700 mb-4 flex items-center">
                  <Map className="w-5 h-5 mr-2 text-spice-600" />
                  Hagga Basin Settings
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* POI Icon Scaling */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-night-600">POI Icon Scaling</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-night-700 mb-1">
                          Minimum Icon Size (pixels)
                        </label>
                        <input
                          type="number"
                          min="32"
                          max="128"
                          value={mapSettings.iconMinSize}
                          onChange={(e) => setMapSettings(prev => ({
                            ...prev,
                            iconMinSize: parseInt(e.target.value) || 64
                          }))}
                          className="w-full px-3 py-2 border border-sand-300 rounded-md focus:outline-none focus:ring-2 focus:ring-spice-500"
                          placeholder="Default: 64"
                        />
                        <p className="text-xs text-night-500 mt-1">Icons won't scale smaller than this size</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-night-700 mb-1">
                          Maximum Icon Size (pixels)
                        </label>
                        <input
                          type="number"
                          min="64"
                          max="256"
                          value={mapSettings.iconMaxSize}
                          onChange={(e) => setMapSettings(prev => ({
                            ...prev,
                            iconMaxSize: parseInt(e.target.value) || 128
                          }))}
                          className="w-full px-3 py-2 border border-sand-300 rounded-md focus:outline-none focus:ring-2 focus:ring-spice-500"
                          placeholder="Default: 128"
                        />
                        <p className="text-xs text-night-500 mt-1">Icons won't scale larger than this size</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-night-700 mb-1">
                          Base Icon Size (pixels)
                        </label>
                        <input
                          type="number"
                          min="32"
                          max="128"
                          value={mapSettings.iconBaseSize}
                          onChange={(e) => setMapSettings(prev => ({
                            ...prev,
                            iconBaseSize: parseInt(e.target.value) || 64
                          }))}
                          className="w-full px-3 py-2 border border-sand-300 rounded-md focus:outline-none focus:ring-2 focus:ring-spice-500"
                          placeholder="Default: 64"
                        />
                        <p className="text-xs text-night-500 mt-1">Base size before zoom scaling is applied</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Map Interaction Settings */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-night-600">Map Interaction</h4>
                    <div className="space-y-3">

                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-night-700">
                          Show POI Tooltips
                        </label>
                        <input
                          type="checkbox"
                          checked={mapSettings.showTooltips}
                          onChange={(e) => setMapSettings(prev => ({
                            ...prev,
                            showTooltips: e.target.checked
                          }))}
                          className="w-4 h-4 text-spice-600 border-sand-300 rounded focus:ring-spice-500"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-night-700">
                          Enable Position Change Mode
                        </label>
                        <input
                          type="checkbox"
                          checked={mapSettings.enablePositionChange}
                          onChange={(e) => setMapSettings(prev => ({
                            ...prev,
                            enablePositionChange: e.target.checked
                          }))}
                          className="w-4 h-4 text-spice-600 border-sand-300 rounded focus:ring-spice-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-night-700 mb-1">
                          Default Zoom Level
                        </label>
                        <input
                          type="number"
                          min="0.1"
                          max="2.0"
                          step="0.1"
                          value={mapSettings.defaultZoom}
                          onChange={(e) => setMapSettings(prev => ({
                            ...prev,
                            defaultZoom: parseFloat(e.target.value) || 0.4
                          }))}
                          className="w-full px-3 py-2 border border-sand-300 rounded-md focus:outline-none focus:ring-2 focus:ring-spice-500"
                          placeholder="Default: 0.4"
                        />
                        <p className="text-xs text-night-500 mt-1">Initial zoom level when map loads</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-sand-300">
                  <button 
                    onClick={resetMapSettings}
                    className="px-4 py-2 text-sm font-medium text-night-700 bg-sand-100 hover:bg-sand-200 rounded-md transition-colors"
                  >
                    Reset to Defaults
                  </button>
                  <button 
                    onClick={saveMapSettings}
                    className="px-4 py-2 text-sm font-medium text-white bg-spice-600 hover:bg-spice-700 rounded-md transition-colors"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
              
              {/* Base Map Upload */}
              <div className="bg-white border border-sand-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-night-700 mb-4 flex items-center">
                  <Upload className="w-5 h-5 mr-2 text-spice-600" />
                  Base Map Upload
                </h3>
                <BaseMapUploader />
              </div>
            </div>
          ) : (
            <DatabaseTab />
          )}
        </div>
      </div>

      {/* User Edit Modal */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-night-900 bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md ring-1 ring-sand-200">
            <h3 className="text-xl font-semibold text-night-800 mb-4">Edit User: {editingUser.username}</h3>
            {editError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
                <AlertTriangle size={16} className="inline mr-2 mb-0.5" /> {editError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="editUsername" className="block text-sm font-medium text-night-700 mb-1">Username</label>
                <input 
                  type="text" 
                  id="editUsername" 
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full bg-white text-night-900 border border-sand-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-spice-500 focus:border-spice-500 placeholder-night-400"
                  placeholder="Enter new username"
                />
              </div>
              <div>
                <label htmlFor="editEmail" className="block text-sm font-medium text-night-700 mb-1">Email</label>
                <input 
                  type="email" 
                  id="editEmail" 
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-white text-night-900 border border-sand-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-spice-500 focus:border-spice-500 placeholder-night-400"
                  placeholder="Enter new email"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                onClick={handleCloseEditModal} 
                className="px-4 py-2 text-sm font-medium text-night-700 bg-sand-100 hover:bg-sand-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-sand-500 transition-colors"
                disabled={isUpdatingUser}
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateUser} 
                className="px-4 py-2 text-sm font-medium text-white bg-spice-600 hover:bg-spice-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-spice-500 disabled:opacity-70 transition-colors flex items-center"
                disabled={isUpdatingUser || !editUsername.trim() || !editEmail.trim() || (editUsername === editingUser.username && editEmail === editingUser.email)}
              >
                {isUpdatingUser ? (
                  <RefreshCw size={16} className="animate-spin mr-2" />
                ) : null}
                {isUpdatingUser ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;