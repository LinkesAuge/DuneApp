import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { 
  Users, 
  Database, 
  Shield, 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2, 
  AlertTriangle,
  Pencil,
  Map,
  ListChecks,
  Settings,
  Clock,
  Calendar,
  Monitor
} from 'lucide-react';
import DiamondIcon from '../common/DiamondIcon';
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
  mapType: 'deep_desert' | 'hagga_basin' | 'combined';
  metadata?: {
    database?: {
      grid_squares?: number;
      pois?: number;
      comments?: number;
    };
    formatVersion?: string;
    files?: {
      grid_screenshots?: number;
      poi_screenshots?: number;
      comment_screenshots?: number;
      custom_icons?: number;
    };
  };
}

interface BackupsByType {
  deep_desert: StoredBackupFile[];
  hagga_basin: StoredBackupFile[];
  combined: StoredBackupFile[];
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
  const [storedBackups, setStoredBackups] = useState<BackupsByType>({
    deep_desert: [],
    hagga_basin: [],
    combined: []
  });
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

  // Map Settings State - Hagga Basin
  const [mapSettings, setMapSettings] = useState({
    iconMinSize: 64,
    iconMaxSize: 128,
    iconBaseSize: 64,
    showTooltips: true,
    enablePositionChange: true,
    defaultVisibleTypes: [] as string[],
    enableAdvancedFiltering: false,
    showSharedIndicators: true
  });

  // Deep Desert Settings State
  const [deepDesertSettings, setDeepDesertSettings] = useState({
    iconMinSize: 32,
    iconMaxSize: 64,
    iconBaseSize: 32,
    showTooltips: true
  });

  // State for backup toggles on reset operations (default to true)
  const [deepDesertBackupOnReset, setDeepDesertBackupOnReset] = useState(true);
  const [haggaBasinBackupOnReset, setHaggaBasinBackupOnReset] = useState(true);

  // State for danger zone confirmation modal
  const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);
  const [dangerAction, setDangerAction] = useState<{
    type: 'reset';
    mapType: 'deep_desert' | 'hagga_basin';
    confirmationText: string;
    backupFirst: boolean;
  } | null>(null);
  const [dangerConfirmationInput, setDangerConfirmationInput] = useState('');

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
        setStoredBackups({
          deep_desert: [],
          hagga_basin: [],
          combined: []
        });
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
      if (result.backupsByType) {
        setStoredBackups(result.backupsByType);
      } else {
        console.warn('Unexpected format for stored backups list:', result);
        setStoredBackups({
          deep_desert: [],
          hagga_basin: [],
          combined: []
        });
      }
    } catch (err: any) {
      console.error('Error fetching stored backups:', err);
      setBackupsError('Could not load stored backups: ' + err.message);
      setStoredBackups({
        deep_desert: [],
        hagga_basin: [],
        combined: []
      });
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
      loadMapSettings();
      loadDeepDesertSettings();
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

  const handleBackup = async (mapType: 'deep_desert' | 'hagga_basin' | 'both' = 'both') => {
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
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/perform-map-backup`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mapType }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create backup');
      }

      const data = await response.json();
      alert(`Backup created successfully for ${mapType} maps! ${data.message}`);
      
      // Refresh stored backups list
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

  const handleReset = async (mapType: 'deep_desert' | 'hagga_basin', backupFirst: boolean = false) => {
    const mapTypeName = mapType === 'deep_desert' ? 'Deep Desert' : 'Hagga Basin';
    const confirmationText = mapType === 'deep_desert' ? 'DELETE DEEP DESERT' : 'DELETE HAGGA BASIN';
    
    // Open danger confirmation modal instead of simple confirm
    setDangerAction({
      type: 'reset',
      mapType,
      confirmationText,
      backupFirst
    });
    setDangerConfirmationInput('');
    setIsDangerModalOpen(true);
  };

  const handleDangerConfirmation = async () => {
    if (!dangerAction || dangerConfirmationInput !== dangerAction.confirmationText) {
      return; // Don't proceed if text doesn't match
    }

    const { mapType, backupFirst } = dangerAction;
    const mapTypeName = mapType === 'deep_desert' ? 'Deep Desert' : 'Hagga Basin';

    try {
    setIsResetting(true);
    setError(null);

      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/perform-map-reset`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.data.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            mapType,
            backupFirst
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Failed to reset ${mapTypeName}.`);
      }

      alert(result.message || `${mapTypeName} reset completed successfully.`);
      
      // Close the modal and refresh backups list
      setIsDangerModalOpen(false);
      setDangerAction(null);
      setDangerConfirmationInput('');
      fetchStoredBackups();
    } catch (err: any) {
      console.error(`Error resetting ${mapTypeName}:`, err);
      setError(err.message);
      alert(`Error resetting ${mapTypeName}: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const handleCloseDangerModal = () => {
    setIsDangerModalOpen(false);
    setDangerAction(null);
    setDangerConfirmationInput('');
  };

  const handleScheduleBackup = async (mapType: 'deep_desert' | 'hagga_basin' | 'both' = 'deep_desert') => {
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
            mapType,
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
      alert(`Backup task scheduled successfully for ${mapType}! Details: ` + (result.message || JSON.stringify(result.details)));
      fetchScheduledTasks(); 
    } catch (err: any) {
      console.error('Error scheduling backup:', err);
      setError(err.message);
      alert('Error scheduling backup: ' + err.message);
    } finally {
      setIsSchedulingBackup(false);
    }
  };

  const handleScheduleReset = async () => {
    // Only allow scheduling resets for Deep Desert
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
            mapType: 'deep_desert', // Only Deep Desert scheduled resets
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
      alert('Deep Desert reset task scheduled successfully! Details: ' + (result.message || JSON.stringify(result.details)));
      fetchScheduledTasks(); 
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
      defaultVisibleTypes: [],
      enableAdvancedFiltering: false,
      showSharedIndicators: true
    });
  };

  // Deep Desert Settings Functions
  const saveDeepDesertSettings = async () => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          setting_key: 'deep_desert_settings',
          setting_value: deepDesertSettings
        });

      if (error) throw error;
      
      console.log('Deep Desert settings saved successfully');
      alert('Deep Desert settings saved successfully!');
    } catch (error) {
      console.error('Error saving Deep Desert settings:', error);
      alert('Error saving Deep Desert settings');
    }
  };

  const loadDeepDesertSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'deep_desert_settings')
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" errors
      
      if (data?.setting_value) {
        setDeepDesertSettings(prev => ({ ...prev, ...data.setting_value }));
      }
    } catch (err: any) {
      console.error('Error loading Deep Desert settings:', err);
      // Keep using defaults
    }
  };

  const resetDeepDesertSettings = () => {
    setDeepDesertSettings({
      iconMinSize: 32,
      iconMaxSize: 64,
      iconBaseSize: 32,
      showTooltips: true
    });
  };

  // Load settings on component mount
  useEffect(() => {
    if (user && user.role === 'admin') {
      loadMapSettings();
    }
  }, [user]);
  
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
      {/* Deep Desert Operations */}
      <section className="p-6 border border-sand-200 rounded-lg bg-white shadow-sm">
        <h3 className="text-xl font-semibold text-night-700 mb-6 flex items-center">
          <Map className="mr-3 text-spice-600" />
          Deep Desert Operations
        </h3>
        
        {/* Manual Deep Desert Operations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Deep Desert Backup */}
          <div className="p-4 bg-sand-50 rounded-md border border-sand-200">
            <h4 className="text-lg font-medium text-night-600 mb-3 flex items-center">
              <Download className="mr-2 text-blue-500" /> Backup Deep Desert
            </h4>
            <p className="text-sm text-night-500 mb-4">
              Create backup of Deep Desert grid squares, POIs, and comments.
            </p>
            <button
              onClick={() => handleBackup('deep_desert')}
              disabled={isBackingUp || isRestoring || isResetting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBackingUp ? 'Creating Backup...' : 'Backup Deep Desert'}
            </button>
          </div>
          </div>

        {/* Scheduled Deep Desert Operations */}
        <div className="p-5 bg-sand-50 rounded-md border border-sand-200">
          <h4 className="text-lg font-medium text-night-600 mb-4">Scheduled Deep Desert Operations</h4>
            <p className="text-sm text-night-500 mb-4">
            <strong>Note:</strong> Scheduled resets are only available for Deep Desert to prevent accidental Hagga Basin data loss.
          </p>
          
          {/* Schedule Deep Desert Backup */}
          <div className="mb-6">
            <h5 className="text-md font-medium text-night-600 mb-3">Schedule Deep Desert Backup</h5>
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
                onClick={() => handleScheduleBackup('deep_desert')}
              disabled={isSchedulingBackup || isSchedulingReset}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSchedulingBackup ? 'Scheduling...' : 'Schedule Backup'}
            </button>
          </div>
        </div>

          {/* Schedule Deep Desert Reset */}
          <div>
            <h5 className="text-md font-medium text-night-600 mb-3">Schedule Deep Desert Reset</h5>
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
                Perform a backup before resetting Deep Desert.
              </label>
            </div>
        </div>
        </div>
      </section>

      {/* Hagga Basin Operations */}
      <section className="p-6 border border-sand-200 rounded-lg bg-white shadow-sm">
        <h3 className="text-xl font-semibold text-night-700 mb-6 flex items-center">
          <Map className="mr-3 text-sky-600" />
          Hagga Basin Operations
        </h3>
        
        {/* Manual Hagga Basin Operations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Hagga Basin Backup */}
          <div className="p-4 bg-sand-50 rounded-md border border-sand-200">
            <h4 className="text-lg font-medium text-night-600 mb-3 flex items-center">
              <Download className="mr-2 text-blue-500" /> Backup Hagga Basin
            </h4>
            <p className="text-sm text-night-500 mb-4">
              Create backup of Hagga Basin POIs and comments.
            </p>
            <button
              onClick={() => handleBackup('hagga_basin')}
              disabled={isBackingUp || isRestoring || isResetting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBackingUp ? 'Creating Backup...' : 'Backup Hagga Basin'}
            </button>
          </div>
        </div>

        {/* Scheduled Hagga Basin Backup */}
        <div className="p-5 bg-sand-50 rounded-md border border-sand-200">
          <h4 className="text-lg font-medium text-night-600 mb-4">Scheduled Hagga Basin Backup</h4>
          <p className="text-sm text-night-500 mb-4">
            Schedule regular backups for Hagga Basin data. Resets are manual-only for safety.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
              <label htmlFor="hagga-backup-time" className="block text-sm font-medium text-night-600 mb-1">Time (Local)</label>
              <input
                type="time"
                id="hagga-backup-time"
                value={scheduledBackupTime}
                onChange={(e) => setScheduledBackupTime(e.target.value)}
                className="w-full p-2 rounded-md bg-white border-sand-300 text-night-700 focus:ring-spice-500 focus:border-spice-500 shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="hagga-backup-start-date" className="block text-sm font-medium text-night-600 mb-1">Start Date</label>
              <input
                type="date"
                id="hagga-backup-start-date"
                value={scheduledBackupStartDate}
                onChange={(e) => setScheduledBackupStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-2 rounded-md bg-white border-sand-300 text-night-700 focus:ring-spice-500 focus:border-spice-500 shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="hagga-backup-frequency" className="block text-sm font-medium text-night-600 mb-1">Frequency</label>
              <select
                id="hagga-backup-frequency"
                value={scheduledBackupFrequency}
                onChange={(e) => setScheduledBackupFrequency(e.target.value as ScheduledTaskFrequency)}
                className="w-full p-2 rounded-md bg-white border-sand-300 text-night-700 focus:ring-spice-500 focus:border-spice-500 shadow-sm"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <button
              onClick={() => handleScheduleBackup('hagga_basin')}
              disabled={isSchedulingBackup || isSchedulingReset}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSchedulingBackup ? 'Scheduling...' : 'Schedule Backup'}
            </button>
          </div>
        </div>
      </section>

      {/* Global Operations */}
      <section className="p-6 border border-sand-200 rounded-lg bg-white shadow-sm">
        <h3 className="text-xl font-semibold text-night-700 mb-6 flex items-center">
          <Database className="mr-3 text-night-600" /> Global Operations
        </h3>
        
        {/* Combined Backup */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-4 bg-sand-50 rounded-md border border-sand-200">
            <h4 className="text-lg font-medium text-night-600 mb-3 flex items-center">
              <Download className="mr-2 text-green-500" /> Backup All Maps
            </h4>
            <p className="text-sm text-night-500 mb-4">
              Create a comprehensive backup of both Deep Desert and Hagga Basin data.
            </p>
            <button
              onClick={() => handleBackup('both')}
              disabled={isBackingUp || isRestoring || isResetting}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBackingUp ? 'Creating Backup...' : 'Backup All Maps'}
            </button>
          </div>

          {/* Manual Restore */}
          <div className="p-4 bg-sand-50 rounded-md border border-sand-200">
            <h4 className="text-lg font-medium text-night-600 mb-3 flex items-center">
              <Upload className="mr-2 text-purple-500" /> Restore from Backup
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

        {/* Scheduled Combined Backup */}
        <div className="p-5 bg-sand-50 rounded-md border border-sand-200">
          <h4 className="text-lg font-medium text-night-600 mb-4">Schedule Combined Backup</h4>
          <p className="text-sm text-night-500 mb-4">
            Schedule regular backups of all map data (both Deep Desert and Hagga Basin).
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label htmlFor="combined-backup-time" className="block text-sm font-medium text-night-600 mb-1">Time (Local)</label>
              <input
                type="time"
                id="combined-backup-time"
                value={scheduledBackupTime}
                onChange={(e) => setScheduledBackupTime(e.target.value)}
                className="w-full p-2 rounded-md bg-white border-sand-300 text-night-700 focus:ring-spice-500 focus:border-spice-500 shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="combined-backup-start-date" className="block text-sm font-medium text-night-600 mb-1">Start Date</label>
              <input
                type="date"
                id="combined-backup-start-date"
                value={scheduledBackupStartDate}
                onChange={(e) => setScheduledBackupStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-2 rounded-md bg-white border-sand-300 text-night-700 focus:ring-spice-500 focus:border-spice-500 shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="combined-backup-frequency" className="block text-sm font-medium text-night-600 mb-1">Frequency</label>
              <select
                id="combined-backup-frequency"
                value={scheduledBackupFrequency}
                onChange={(e) => setScheduledBackupFrequency(e.target.value as ScheduledTaskFrequency)}
                className="w-full p-2 rounded-md bg-white border-sand-300 text-night-700 focus:ring-spice-500 focus:border-spice-500 shadow-sm"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <button
              onClick={() => handleScheduleBackup('both')}
              disabled={isSchedulingBackup || isSchedulingReset}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSchedulingBackup ? 'Scheduling...' : 'Schedule Combined'}
            </button>
          </div>
        </div>
      </section>

      {/* Currently Scheduled Tasks List */}
      <section className="p-6 border border-sand-200 rounded-lg bg-white shadow-sm">
        <h3 className="text-xl font-semibold text-night-700 mb-6 flex items-center">
          <Calendar className="mr-3 text-night-600" /> Currently Scheduled Tasks
        </h3>
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
                    {task.jobName.includes('deep-desert') && ' (Deep Desert)'}
                    {task.jobName.includes('hagga-basin') && ' (Hagga Basin)'}
                    {task.jobName.includes('all-maps') && ' (All Maps)'}
                    </span>
                    <p className="text-sm text-night-500">
                      Scheduled for: {
                        task.frequency === 'weekly' && task.dayOfWeek !== undefined ?
                        `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][task.dayOfWeek]} at ` : 'Daily at '
                      }
                      {task.time ? 
                        task.time + ' (Target Local Time)' :
                      (task.originalScheduledTimeUTC && task.originalScheduledTimeUTC !== 'INVALID_UTC_TIME' ? 
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
      </section>

      {/* Stored Backups Section */}
      <section className="p-6 border border-sand-200 rounded-lg bg-white shadow-sm">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-night-700 flex items-center">
                <ListChecks className="mr-3 text-night-600" /> Stored Backups (Max 10 per type)
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

        {!isLoadingBackups && !backupsError && (
          <div className="space-y-8">
            {/* Deep Desert Backups */}
            <div>
              <h4 className="text-lg font-medium text-night-600 mb-4 flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-spice-100 text-spice-800 mr-2">
                  Deep Desert
                </span>
                ({storedBackups.deep_desert.length}/10 backups)
              </h4>
              {storedBackups.deep_desert.length === 0 ? (
                <p className="text-night-500 italic text-sm">No Deep Desert backups found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-sand-100">
                        <th className="px-3 py-2 border-b border-sand-200">Filename</th>
                        <th className="px-3 py-2 border-b border-sand-200">Size</th>
                        <th className="px-3 py-2 border-b border-sand-200">Content</th>
                        <th className="px-3 py-2 border-b border-sand-200">Created</th>
                        <th className="px-3 py-2 border-b border-sand-200 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storedBackups.deep_desert.map(backup => (
                        <tr key={backup.id || backup.name} className="hover:bg-sand-50">
                          <td className="px-3 py-2 border-b border-sand-200 truncate" title={backup.name}>{backup.name}</td>
                          <td className="px-3 py-2 border-b border-sand-200">{formatBytes(backup.size)}</td>
                          <td className="px-3 py-2 border-b border-sand-200">
                            {backup.metadata ? (
                              <div className="text-xs space-y-1">
                                <div className="flex items-center">
                                  <span className="font-medium text-blue-600 mr-1">DB:</span>
                                  <span className="text-night-600">
                                    {(backup.metadata.database?.grid_squares || 0) + 
                                     (backup.metadata.database?.pois || 0) + 
                                     (backup.metadata.database?.comments || 0)} records
                                  </span>
                                </div>
                                {backup.metadata.formatVersion === 'v2' && (
                                  <div className="flex items-center">
                                    <span className="font-medium text-green-600 mr-1">Files:</span>
                                    <span className="text-night-600">
                                      {(backup.metadata.files?.grid_screenshots || 0) + 
                                       (backup.metadata.files?.poi_screenshots || 0) + 
                                       (backup.metadata.files?.comment_screenshots || 0) + 
                                       (backup.metadata.files?.custom_icons || 0)} files
                                    </span>
                                  </div>
                                )}
                                <div className="text-xs text-night-400">
                                  Format: {backup.metadata.formatVersion || 'v1'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-night-400 italic text-xs">Loading...</span>
                            )}
                          </td>
                          <td className="px-3 py-2 border-b border-sand-200">{new Date(backup.created_at).toLocaleDateString()}</td>
                          <td className="px-3 py-2 border-b border-sand-200 text-center space-x-2">
                            {backup.downloadUrl ? (
                              <a 
                                href={backup.downloadUrl} 
                                download={backup.name}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-500"
                              >
                                <Download size={12} className="mr-1" />
                                Download
                              </a>
                            ) : (
                              <span className="text-xs text-night-400 italic">No URL</span>
                            )}
                            <button
                              onClick={() => handleDeleteBackupFile(backup.name)}
                              disabled={isDeletingBackup === backup.name}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-500 disabled:opacity-50"
                              title={`Delete ${backup.name}`}
                            >
                              {isDeletingBackup === backup.name ? (
                                <RefreshCw size={12} className="animate-spin" />
                              ) : (
                                <Trash2 size={12} />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Hagga Basin Backups */}
            <div>
              <h4 className="text-lg font-medium text-night-600 mb-4 flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-sky-100 text-sky-800 mr-2">
                  Hagga Basin
                </span>
                ({storedBackups.hagga_basin.length}/10 backups)
              </h4>
              {storedBackups.hagga_basin.length === 0 ? (
                <p className="text-night-500 italic text-sm">No Hagga Basin backups found.</p>
              ) : (
            <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-sand-100">
                        <th className="px-3 py-2 border-b border-sand-200">Filename</th>
                        <th className="px-3 py-2 border-b border-sand-200">Size</th>
                        <th className="px-3 py-2 border-b border-sand-200">Content</th>
                        <th className="px-3 py-2 border-b border-sand-200">Created</th>
                        <th className="px-3 py-2 border-b border-sand-200 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                      {storedBackups.hagga_basin.map(backup => (
                            <tr key={backup.id || backup.name} className="hover:bg-sand-50">
                          <td className="px-3 py-2 border-b border-sand-200 truncate" title={backup.name}>{backup.name}</td>
                          <td className="px-3 py-2 border-b border-sand-200">{formatBytes(backup.size)}</td>
                          <td className="px-3 py-2 border-b border-sand-200">
                            {backup.metadata ? (
                              <div className="text-xs space-y-1">
                                <div className="flex items-center">
                                  <span className="font-medium text-blue-600 mr-1">DB:</span>
                                  <span className="text-night-600">
                                    {(backup.metadata.database?.grid_squares || 0) + 
                                     (backup.metadata.database?.pois || 0) + 
                                     (backup.metadata.database?.comments || 0)} records
                                  </span>
                                </div>
                                {backup.metadata.formatVersion === 'v2' && (
                                  <div className="flex items-center">
                                    <span className="font-medium text-green-600 mr-1">Files:</span>
                                    <span className="text-night-600">
                                      {(backup.metadata.files?.grid_screenshots || 0) + 
                                       (backup.metadata.files?.poi_screenshots || 0) + 
                                       (backup.metadata.files?.comment_screenshots || 0) + 
                                       (backup.metadata.files?.custom_icons || 0)} files
                                    </span>
                                  </div>
                                )}
                                <div className="text-xs text-night-400">
                                  Format: {backup.metadata.formatVersion || 'v1'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-night-400 italic text-xs">Loading...</span>
                            )}
                          </td>
                          <td className="px-3 py-2 border-b border-sand-200">{new Date(backup.created_at).toLocaleDateString()}</td>
                          <td className="px-3 py-2 border-b border-sand-200 text-center space-x-2">
                                    {backup.downloadUrl ? (
                                        <a 
                                            href={backup.downloadUrl} 
                                            download={backup.name}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-500"
                                        >
                                <Download size={12} className="mr-1" />
                                            Download
                                        </a>
                                    ) : (
                              <span className="text-xs text-night-400 italic">No URL</span>
                                    )}
                                    <button
                                      onClick={() => handleDeleteBackupFile(backup.name)}
                              disabled={isDeletingBackup === backup.name}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-500 disabled:opacity-50"
                                      title={`Delete ${backup.name}`}
                                    >
                                      {isDeletingBackup === backup.name ? (
                                <RefreshCw size={12} className="animate-spin" />
                                      ) : (
                                <Trash2 size={12} />
                                      )}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
              )}
            </div>

            {/* Combined Backups */}
            <div>
              <h4 className="text-lg font-medium text-night-600 mb-4 flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 mr-2">
                  Combined
                </span>
                ({storedBackups.combined.length}/10 backups)
              </h4>
              {storedBackups.combined.length === 0 ? (
                <p className="text-night-500 italic text-sm">No combined backups found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-sand-100">
                        <th className="px-3 py-2 border-b border-sand-200">Filename</th>
                        <th className="px-3 py-2 border-b border-sand-200">Size</th>
                        <th className="px-3 py-2 border-b border-sand-200">Content</th>
                        <th className="px-3 py-2 border-b border-sand-200">Created</th>
                        <th className="px-3 py-2 border-b border-sand-200 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storedBackups.combined.map(backup => (
                        <tr key={backup.id || backup.name} className="hover:bg-sand-50">
                          <td className="px-3 py-2 border-b border-sand-200 truncate" title={backup.name}>{backup.name}</td>
                          <td className="px-3 py-2 border-b border-sand-200">{formatBytes(backup.size)}</td>
                          <td className="px-3 py-2 border-b border-sand-200">
                            {backup.metadata ? (
                              <div className="text-xs space-y-1">
                                <div className="flex items-center">
                                  <span className="font-medium text-blue-600 mr-1">DB:</span>
                                  <span className="text-night-600">
                                    {(backup.metadata.database?.grid_squares || 0) + 
                                     (backup.metadata.database?.pois || 0) + 
                                     (backup.metadata.database?.comments || 0)} records
                                  </span>
                                </div>
                                {backup.metadata.formatVersion === 'v2' && (
                                  <div className="flex items-center">
                                    <span className="font-medium text-green-600 mr-1">Files:</span>
                                    <span className="text-night-600">
                                      {(backup.metadata.files?.grid_screenshots || 0) + 
                                       (backup.metadata.files?.poi_screenshots || 0) + 
                                       (backup.metadata.files?.comment_screenshots || 0) + 
                                       (backup.metadata.files?.custom_icons || 0)} files
                                    </span>
                                  </div>
                                )}
                                <div className="text-xs text-night-400">
                                  Format: {backup.metadata.formatVersion || 'v1'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-night-400 italic text-xs">Loading...</span>
                            )}
                          </td>
                          <td className="px-3 py-2 border-b border-sand-200">{new Date(backup.created_at).toLocaleDateString()}</td>
                          <td className="px-3 py-2 border-b border-sand-200 text-center space-x-2">
                            {backup.downloadUrl ? (
                              <a 
                                href={backup.downloadUrl} 
                                download={backup.name}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-500"
                              >
                                <Download size={12} className="mr-1" />
                                Download
                              </a>
                            ) : (
                              <span className="text-xs text-night-400 italic">No URL</span>
                            )}
                            <button
                              onClick={() => handleDeleteBackupFile(backup.name)}
                              disabled={isDeletingBackup === backup.name}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-500 disabled:opacity-50"
                              title={`Delete ${backup.name}`}
                            >
                              {isDeletingBackup === backup.name ? (
                                <RefreshCw size={12} className="animate-spin" />
                              ) : (
                                <Trash2 size={12} />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            </div>
        )}
      </section>

      {/* DANGER ZONE - Reset Operations */}
      <section className="p-6 border-2 border-red-300 rounded-lg bg-red-50 shadow-lg">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-red-800 mb-2 flex items-center">
            <AlertTriangle className="mr-3 text-red-600" />
            🚨 DANGER ZONE 🚨
        </h3>
          <div className="p-4 bg-red-100 border border-red-300 rounded-md mb-4">
            <p className="text-red-800 font-semibold mb-2">⚠️ CRITICAL WARNING ⚠️</p>
            <p className="text-red-700 text-sm mb-2">
              Reset operations will <strong>PERMANENTLY DELETE ALL DATA</strong> for the selected map. 
              This includes POIs, comments, grid squares, and all associated screenshots and files.
            </p>
            <p className="text-red-700 text-sm font-semibold">
              THIS ACTION CANNOT BE UNDONE. Proceed with extreme caution.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deep Desert Reset */}
          <div className="p-4 bg-white rounded-md border-2 border-red-200 shadow-sm">
            <h4 className="text-lg font-bold text-red-700 mb-3 flex items-center">
              <AlertTriangle className="mr-2 text-red-600" />
              Reset Deep Desert
          </h4>
            <p className="text-red-600 text-sm mb-4 font-medium">
              Delete ALL Deep Desert data: grid squares (A1-I9), POIs, comments, and files.
            </p>
            <div className="mb-4">
              <label htmlFor="deep-desert-backup-toggle-danger" className="flex items-center text-sm text-red-700 font-medium">
                <input
                  type="checkbox"
                  id="deep-desert-backup-toggle-danger"
                  checked={deepDesertBackupOnReset}
                  onChange={(e) => setDeepDesertBackupOnReset(e.target.checked)}
                  className="mr-2 h-4 w-4 rounded text-red-600 focus:ring-red-500 border-red-400 bg-white shadow-sm"
                />
                Create backup before deletion
              </label>
            </div>
          <button
              onClick={() => handleReset('deep_desert', deepDesertBackupOnReset)}
            disabled={isBackingUp || isRestoring || isResetting}
              className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-md transition duration-150 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-800"
          >
              {isResetting ? 'DELETING...' : `DELETE DEEP DESERT${deepDesertBackupOnReset ? ' (with backup)' : ''}`}
          </button>
          </div>

          {/* Hagga Basin Reset */}
          <div className="p-4 bg-white rounded-md border-2 border-red-200 shadow-sm">
            <h4 className="text-lg font-bold text-red-700 mb-3 flex items-center">
              <AlertTriangle className="mr-2 text-red-600" />
              Reset Hagga Basin
            </h4>
            <p className="text-red-600 text-sm mb-4 font-medium">
              Delete ALL Hagga Basin data: POIs, comments, and files. No scheduled resets available.
            </p>
            <div className="mb-4">
              <label htmlFor="hagga-basin-backup-toggle-danger" className="flex items-center text-sm text-red-700 font-medium">
                <input
                  type="checkbox"
                  id="hagga-basin-backup-toggle-danger"
                  checked={haggaBasinBackupOnReset}
                  onChange={(e) => setHaggaBasinBackupOnReset(e.target.checked)}
                  className="mr-2 h-4 w-4 rounded text-red-600 focus:ring-red-500 border-red-400 bg-white shadow-sm"
                />
                Create backup before deletion
              </label>
            </div>
            <button
              onClick={() => handleReset('hagga_basin', haggaBasinBackupOnReset)}
              disabled={isBackingUp || isRestoring || isResetting}
              className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-md transition duration-150 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-800"
            >
              {isResetting ? 'DELETING...' : `DELETE HAGGA BASIN${haggaBasinBackupOnReset ? ' (with backup)' : ''}`}
            </button>
          </div>
        </div>
      </section>
    </div>
  );

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

  return (
    <div className="min-h-screen">
      {/* Multi-layer background system */}
      <div className="fixed inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950" />
      <div className="fixed inset-0 bg-gradient-to-b from-slate-900/90 via-slate-800/60 to-slate-900/90" />
      
      {/* Content container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <DiamondIcon
              icon={<Shield size={20} strokeWidth={1.5} />}
              size="lg"
              bgColor="bg-void-950"
              actualBorderColor="bg-gold-300"
              borderThickness={2}
              iconColor="text-gold-300"
            />
            <h1 className="text-4xl font-light tracking-[0.2em] text-amber-200"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              COMMAND INTERFACE
            </h1>
          </div>
        </div>
        
        {error && (
          <div className="group relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-red-950 via-red-900 to-red-950 rounded-lg" />
            <div className="relative p-4 rounded-lg border border-red-400/30">
              <div className="flex items-center gap-3">
                <DiamondIcon
                  icon={<AlertTriangle size={16} strokeWidth={1.5} />}
                  size="sm"
                  bgColor="bg-red-900"
                  actualBorderColor="bg-red-400"
                  borderThickness={1}
                  iconColor="text-red-400"
                />
                <p className="text-red-300 font-light tracking-wide">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-8">
          {/* Tab Navigation */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
            
            <div className="relative p-6 rounded-lg border border-amber-400/20">
              <nav className="flex space-x-1">
                {[
                  { id: 'users', label: 'Users', icon: Users },
                  { id: 'database', label: 'Database', icon: Database },
                  { id: 'poi-types', label: 'POI Types', icon: Settings },
                  { id: 'maps', label: 'Map Settings', icon: Map }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`group/tab relative flex items-center gap-2 px-6 py-3 transition-all duration-300 ${
                      activeTab === id ? 'z-10' : ''
                    }`}
                  >
                    {/* Tab background */}
                    <div className={`absolute inset-0 transition-all duration-300 ${
                      activeTab === id 
                        ? 'bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20' 
                        : 'bg-gradient-to-r from-transparent via-transparent to-transparent group-hover/tab:from-violet-600/10 group-hover/tab:via-violet-500/15 group-hover/tab:to-violet-600/10'
                    } rounded-lg`} />
                    
                    {/* Tab border */}
                    <div className={`absolute inset-0 rounded-lg border transition-all duration-300 ${
                      activeTab === id 
                        ? 'border-amber-400/50' 
                        : 'border-transparent group-hover/tab:border-violet-400/30'
                    }`} />
                    
                    {/* Tab content */}
                    <div className="relative flex items-center gap-2">
                      <Icon size={16} className={`transition-all duration-300 ${
                        activeTab === id 
                          ? 'text-amber-300' 
                          : 'text-amber-400/70 group-hover/tab:text-amber-200'
                      }`} />
                      <span className={`font-light text-sm tracking-wide transition-all duration-300 ${
                        activeTab === id 
                          ? 'text-amber-200' 
                          : 'text-amber-300/70 group-hover/tab:text-amber-100'
                      }`}
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                        {label}
                      </span>
                    </div>
                    
                    {/* Active tab underline */}
                    <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent transition-all duration-700 ease-out ${
                      activeTab === id ? 'w-full shadow-md shadow-amber-400/50' : 'w-0'
                    }`} />
                  </button>
                ))}
              </nav>
            </div>
          </div>
          
          {/* Tab Content */}
          {isLoading ? (
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
              <div className="relative flex justify-center items-center h-64 rounded-lg border border-amber-400/20">
                <div className="text-center">
                  <DiamondIcon
                    icon={<Monitor size={20} strokeWidth={1.5} />}
                    size="lg"
                    bgColor="bg-void-950"
                    actualBorderColor="bg-gold-300"
                    borderThickness={2}
                    iconColor="text-gold-300"
                    className="mx-auto mb-4 animate-pulse"
                  />
                  <p className="text-amber-300/80 font-light tracking-wide"
                     style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    Loading command interface...
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {activeTab === 'users' && (
                <div className="space-y-6">
                  {/* Section Header */}
                  <div className="flex items-center gap-4">
                    <DiamondIcon
                      icon={<Users size={18} strokeWidth={1.5} />}
                      size="md"
                      bgColor="bg-void-950"
                      actualBorderColor="bg-gold-300"
                      borderThickness={2}
                      iconColor="text-gold-300"
                    />
                    <h2 className="text-2xl font-light tracking-[0.15em] text-amber-200"
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      USER MANAGEMENT
                    </h2>
                  </div>
                  
                  {/* Users Table */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
                    
                    <div className="relative rounded-lg border border-amber-400/20 overflow-hidden">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-amber-400/20">
                            <th className="px-6 py-4 text-left text-xs font-light uppercase tracking-[0.2em] text-amber-300/80"
                                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                              Username
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-light uppercase tracking-[0.2em] text-amber-300/80"
                                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                              Email
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-light uppercase tracking-[0.2em] text-amber-300/80"
                                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                              Role
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-light uppercase tracking-[0.2em] text-amber-300/80"
                                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {profiles.map((profile) => (
                            <tr key={profile.id} className="group/row border-b border-amber-400/10 hover:bg-gradient-to-r hover:from-violet-600/5 hover:via-violet-500/10 hover:to-violet-600/5 transition-all duration-300">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-light text-amber-100 tracking-wide"
                                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                                  {profile.username}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-amber-200/70 tracking-wide"
                                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                                  {profile.email}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="relative">
                                  <select
                                    value={profile.role}
                                    onChange={(e) => handleRoleChange(profile.id, e.target.value as UserRole)}
                                    className="bg-gradient-to-r from-slate-900 to-slate-800 border border-amber-400/30 rounded-md px-3 py-1.5 text-sm text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/70 transition-all duration-300 disabled:opacity-50"
                                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                                    disabled={profile.id === user?.id}
                                  >
                                    <option value="user" className="bg-slate-900 text-amber-200">User</option>
                                    <option value="moderator" className="bg-slate-900 text-amber-200">Moderator</option>
                                    <option value="admin" className="bg-slate-900 text-amber-200">Admin</option>
                                  </select>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  {/* Edit Button */}
                                  <button
                                    onClick={() => handleOpenEditModal(profile)}
                                    className="group/btn relative p-2 transition-all duration-300"
                                    title="Edit User"
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-500/20 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-all duration-300" />
                                    <div className="absolute inset-0 border border-blue-400/30 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-all duration-300" />
                                    <Pencil size={16} className="relative text-blue-400 group-hover/btn:text-blue-300 transition-all duration-300" />
                                  </button>
                                  
                                  {/* Delete Button */}
                                  <button
                                    onClick={() => handleDeleteUser(profile.id, profile.username)}
                                    disabled={profile.id === user?.id || isDeletingUser === profile.id}
                                    className="group/btn relative p-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={profile.id === user?.id ? "Cannot delete your own account" : "Delete User"}
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-500/20 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-all duration-300" />
                                    <div className="absolute inset-0 border border-red-400/30 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-all duration-300" />
                                    {isDeletingUser === profile.id ? (
                                      <RefreshCw size={16} className="relative text-red-400 animate-spin" />
                                    ) : (
                                      <Trash2 size={16} className="relative text-red-400 group-hover/btn:text-red-300 transition-all duration-300" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'database' && <DatabaseTab />}

              {activeTab === 'poi-types' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-night-800">POI Type Management</h2>
              <PoiTypeManager 
                poiTypes={poiTypes}
                    onPoiTypesChange={() => fetchPoiTypesForAdmin()}
              />
                </div>
              )}

              {activeTab === 'maps' && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-semibold text-night-800">Map Configuration</h2>
                  
                  {/* Base Maps Section */}
                  <section className="p-6 border border-sand-200 rounded-lg bg-white shadow-sm">
                    <h3 className="text-xl font-semibold text-night-700 mb-6">Base Map Images</h3>
                    <BaseMapUploader />
                  </section>
                
                {/* Hagga Basin Settings */}
                  <section className="p-6 border border-sand-200 rounded-lg bg-white shadow-sm">
                    <h3 className="text-xl font-semibold text-night-700 mb-6 flex items-center">
                      <Map className="mr-3 text-sky-600" />
                    Hagga Basin Settings
                  </h3>
                  
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Icon Size Settings */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-medium text-night-600">Icon Size Configuration</h4>
                        
                        <div>
                          <label htmlFor="iconBaseSize" className="block text-sm font-medium text-night-600 mb-1">
                            Base Icon Size (px)
                          </label>
                          <input
                            type="number"
                            id="iconBaseSize"
                            min="16"
                            max="256"
                            value={mapSettings.iconBaseSize}
                            onChange={(e) => setMapSettings(prev => ({
                              ...prev,
                              iconBaseSize: parseInt(e.target.value) || 64
                            }))}
                            className="w-full p-2 border border-sand-300 rounded-md focus:ring-spice-500 focus:border-spice-500"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="iconMinSize" className="block text-sm font-medium text-night-600 mb-1">
                            Minimum Icon Size (px)
                          </label>
                          <input
                            type="number"
                            id="iconMinSize"
                            min="8"
                            max="128"
                            value={mapSettings.iconMinSize}
                            onChange={(e) => setMapSettings(prev => ({
                              ...prev,
                              iconMinSize: parseInt(e.target.value) || 32
                            }))}
                            className="w-full p-2 border border-sand-300 rounded-md focus:ring-spice-500 focus:border-spice-500"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="iconMaxSize" className="block text-sm font-medium text-night-600 mb-1">
                            Maximum Icon Size (px)
                          </label>
                          <input
                            type="number"
                            id="iconMaxSize"
                            min="32"
                            max="512"
                            value={mapSettings.iconMaxSize}
                            onChange={(e) => setMapSettings(prev => ({
                              ...prev,
                              iconMaxSize: parseInt(e.target.value) || 128
                            }))}
                            className="w-full p-2 border border-sand-300 rounded-md focus:ring-spice-500 focus:border-spice-500"
                          />
                      </div>
                    </div>
                    
                      {/* Interaction Settings */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-medium text-night-600">Map Interaction Settings</h4>
                        
                      <div className="space-y-3">
                          <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={mapSettings.showTooltips}
                            onChange={(e) => setMapSettings(prev => ({
                              ...prev,
                              showTooltips: e.target.checked
                            }))}
                              className="mr-2 h-4 w-4 text-spice-600 focus:ring-spice-500 border-sand-300 rounded"
                            />
                            <span className="text-sm text-night-600">Show POI tooltips on hover</span>
                          </label>
                          
                          <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={mapSettings.enablePositionChange}
                            onChange={(e) => setMapSettings(prev => ({
                              ...prev,
                              enablePositionChange: e.target.checked
                            }))}
                              className="mr-2 h-4 w-4 text-spice-600 focus:ring-spice-500 border-sand-300 rounded"
                            />
                            <span className="text-sm text-night-600">Allow POI position changes</span>
                          </label>
                          
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={mapSettings.enableAdvancedFiltering}
                              onChange={(e) => setMapSettings(prev => ({ 
                                ...prev, 
                                enableAdvancedFiltering: e.target.checked
                              }))}
                              className="mr-2 h-4 w-4 text-spice-600 focus:ring-spice-500 border-sand-300 rounded"
                            />
                            <span className="text-sm text-night-600">Enable advanced POI filtering</span>
                          </label>
                          
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={mapSettings.showSharedIndicators}
                              onChange={(e) => setMapSettings(prev => ({ 
                                ...prev, 
                                showSharedIndicators: e.target.checked
                              }))}
                              className="mr-2 h-4 w-4 text-spice-600 focus:ring-spice-500 border-sand-300 rounded"
                            />
                            <span className="text-sm text-night-600">Show shared POI indicators</span>
                          </label>
                      </div>
                    </div>
                  </div>
                  
                    {/* Save/Reset Buttons */}
                    <div className="mt-8 flex space-x-4">
                    <button 
                        onClick={saveMapSettings}
                        className="px-6 py-2 bg-spice-600 text-white rounded-md hover:bg-spice-700 focus:outline-none focus:ring-2 focus:ring-spice-500 focus:ring-offset-2"
                    >
                        Save Settings
                    </button>
                    <button 
                        onClick={resetMapSettings}
                        className="px-6 py-2 bg-sand-300 text-night-700 rounded-md hover:bg-sand-400 focus:outline-none focus:ring-2 focus:ring-sand-500 focus:ring-offset-2"
                    >
                        Reset to Defaults
                    </button>
                  </div>
                  </section>
                
                {/* Deep Desert Settings */}
                  <section className="p-6 border border-sand-200 rounded-lg bg-white shadow-sm">
                    <h3 className="text-xl font-semibold text-night-700 mb-6 flex items-center">
                      <Map className="mr-3 text-spice-600" />
                    Deep Desert Settings
                </h3>
                
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Icon Size Settings */}
                  <div className="space-y-4">
                      <h4 className="text-lg font-medium text-night-600">Icon Size Configuration</h4>
                      
                      <div>
                        <label htmlFor="ddIconBaseSize" className="block text-sm font-medium text-night-600 mb-1">
                          Base Icon Size (px)
                        </label>
                        <input
                          type="number"
                          id="ddIconBaseSize"
                          min="16"
                          max="256"
                          value={deepDesertSettings.iconBaseSize}
                          onChange={(e) => setDeepDesertSettings(prev => ({
                            ...prev,
                            iconBaseSize: parseInt(e.target.value) || 32
                          }))}
                          className="w-full p-2 border border-sand-300 rounded-md focus:ring-spice-500 focus:border-spice-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="ddIconMinSize" className="block text-sm font-medium text-night-600 mb-1">
                          Minimum Icon Size (px)
                        </label>
                        <input
                          type="number"
                          id="ddIconMinSize"
                          min="8"
                          max="128"
                          value={deepDesertSettings.iconMinSize}
                          onChange={(e) => setDeepDesertSettings(prev => ({
                            ...prev,
                            iconMinSize: parseInt(e.target.value) || 16
                          }))}
                          className="w-full p-2 border border-sand-300 rounded-md focus:ring-spice-500 focus:border-spice-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="ddIconMaxSize" className="block text-sm font-medium text-night-600 mb-1">
                          Maximum Icon Size (px)
                        </label>
                        <input
                          type="number"
                          id="ddIconMaxSize"
                          min="32"
                          max="512"
                          value={deepDesertSettings.iconMaxSize}
                          onChange={(e) => setDeepDesertSettings(prev => ({
                            ...prev,
                            iconMaxSize: parseInt(e.target.value) || 64
                          }))}
                          className="w-full p-2 border border-sand-300 rounded-md focus:ring-spice-500 focus:border-spice-500"
                        />
                    </div>
                  </div>
                  
                    {/* Interaction Settings */}
                  <div className="space-y-4">
                      <h4 className="text-lg font-medium text-night-600">Map Interaction Settings</h4>
                      
                    <div className="space-y-3">
                        <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={deepDesertSettings.showTooltips}
                          onChange={(e) => setDeepDesertSettings(prev => ({
                            ...prev,
                            showTooltips: e.target.checked
                          }))}
                            className="mr-2 h-4 w-4 text-spice-600 focus:ring-spice-500 border-sand-300 rounded"
                        />
                          <span className="text-sm text-night-600">Show POI tooltips on hover</span>
                        </label>
                    </div>
                  </div>
                </div>
                
                  {/* Save/Reset Buttons */}
                  <div className="mt-8 flex space-x-4">
                  <button 
                      onClick={saveDeepDesertSettings}
                      className="px-6 py-2 bg-spice-600 text-white rounded-md hover:bg-spice-700 focus:outline-none focus:ring-2 focus:ring-spice-500 focus:ring-offset-2"
                  >
                      Save Settings
                  </button>
                  <button 
                      onClick={resetDeepDesertSettings}
                      className="px-6 py-2 bg-sand-300 text-night-700 rounded-md hover:bg-sand-400 focus:outline-none focus:ring-2 focus:ring-sand-500 focus:ring-offset-2"
                  >
                      Reset to Defaults
                  </button>
                </div>
                </section>
              </div>
            )}
          </div>
        )}
      </div>
      </div> {/* Close content container: relative z-10 max-w-7xl mx-auto px-6 py-8 */}

      {/* User Edit Modal */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-50 p-4">
          <div className="group relative max-w-md w-full">
            {/* Multi-layer background system */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-800/60 to-slate-900/90 rounded-lg" />
            
            <div className="relative p-6 rounded-lg border border-amber-400/30">
              {/* Modal Header */}
              <div className="flex items-center gap-4 mb-6">
                <DiamondIcon
                  icon={<Pencil size={16} strokeWidth={1.5} />}
                  size="md"
                  bgColor="bg-void-950"
                  actualBorderColor="bg-gold-300"
                  borderThickness={2}
                  iconColor="text-gold-300"
                />
                <h3 className="text-xl font-light tracking-[0.15em] text-amber-200"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  EDIT USER
                </h3>
              </div>

              {editError && (
                <div className="group/error relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-950 via-red-900 to-red-950 rounded-lg" />
                  <div className="relative p-3 rounded-lg border border-red-400/30">
                    <div className="flex items-center gap-2">
                      <DiamondIcon
                        icon={<AlertTriangle size={14} strokeWidth={1.5} />}
                        size="sm"
                        bgColor="bg-red-900"
                        actualBorderColor="bg-red-400"
                        borderThickness={1}
                        iconColor="text-red-400"
                      />
                      <p className="text-red-300 text-sm font-light tracking-wide">{editError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="edit-username" className="block text-sm font-light tracking-wide text-amber-300/80 mb-2"
                         style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    Username
                  </label>
                  <input
                    type="text"
                    id="edit-username"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full p-3 bg-gradient-to-r from-slate-900 to-slate-800 border border-amber-400/30 rounded-lg text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/70 transition-all duration-300"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                    disabled={isUpdatingUser}
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-email" className="block text-sm font-light tracking-wide text-amber-300/80 mb-2"
                         style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    id="edit-email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full p-3 bg-gradient-to-r from-slate-900 to-slate-800 border border-amber-400/30 rounded-lg text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/70 transition-all duration-300"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                    disabled={isUpdatingUser}
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex space-x-3">
                {/* Update Button */}
                <button
                  onClick={handleUpdateUser}
                  disabled={isUpdatingUser}
                  className="group/btn relative flex-1 px-4 py-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-green-500/30 to-green-600/20 rounded-lg" />
                  <div className="absolute inset-0 border border-green-400/40 rounded-lg" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent group-hover/btn:from-violet-600/10 group-hover/btn:via-violet-500/15 group-hover/btn:to-violet-600/10 rounded-lg transition-all duration-300" />
                  
                  <span className="relative text-green-300 font-light tracking-wide flex items-center justify-center gap-2"
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    {isUpdatingUser ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update User'
                    )}
                  </span>
                </button>
                
                {/* Cancel Button */}
                <button 
                  onClick={handleCloseEditModal} 
                  disabled={isUpdatingUser}
                  className="group/btn relative flex-1 px-4 py-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-800/40 via-slate-700/50 to-slate-800/40 rounded-lg" />
                  <div className="absolute inset-0 border border-amber-400/30 rounded-lg" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent group-hover/btn:from-violet-600/10 group-hover/btn:via-violet-500/15 group-hover/btn:to-violet-600/10 rounded-lg transition-all duration-300" />
                  
                  <span className="relative text-amber-200/80 font-light tracking-wide flex items-center justify-center"
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    Cancel
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone Confirmation Modal */}
      {isDangerModalOpen && dangerAction && (
        <div className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-50 p-4">
          <div className="group relative max-w-lg w-full">
            {/* Multi-layer background system with red accents */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-950 via-red-900 to-red-950 rounded-lg" />
            <div className="absolute inset-0 bg-gradient-to-b from-red-900/90 via-red-800/60 to-red-900/90 rounded-lg" />
            
            <div className="relative p-6 rounded-lg border-2 border-red-400/50">
              {/* Modal Header */}
              <div className="flex items-center gap-4 mb-6">
                <DiamondIcon
                  icon={<AlertTriangle size={18} strokeWidth={1.5} />}
                  size="lg"
                  bgColor="bg-red-900"
                  actualBorderColor="bg-red-400"
                  borderThickness={2}
                  iconColor="text-red-400"
                />
                <h3 className="text-xl font-light tracking-[0.15em] text-red-300"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  🚨 CONFIRM DESTRUCTIVE ACTION 🚨
                </h3>
              </div>

              {/* Warning Content */}
              <div className="mb-6">
                <div className="group/warning relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-950 via-red-900 to-red-950 rounded-lg" />
                  <div className="relative p-4 rounded-lg border border-red-400/40">
                    <p className="text-red-300 font-medium mb-2 tracking-wide"
                       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      ⚠️ CRITICAL WARNING ⚠️
                    </p>
                    <p className="text-red-200/90 text-sm mb-2 font-light tracking-wide"
                       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      You are about to <strong>PERMANENTLY DELETE ALL DATA</strong> for{' '}
                      <strong>
                        {dangerAction.mapType === 'deep_desert' ? 'Deep Desert' : 'Hagga Basin'}
                      </strong>.
                    </p>
                    <p className="text-red-200/80 text-sm mb-2 font-light">
                      This will delete:
                    </p>
                    <ul className="text-red-200/80 text-sm list-disc list-inside ml-4 mb-2 space-y-1">
                      {dangerAction.mapType === 'deep_desert' && (
                        <li>All grid squares (A1-I9) and their screenshots</li>
                      )}
                      <li>All POIs and their images</li>
                      <li>All comments and comment screenshots</li>
                      <li>All associated storage files</li>
                    </ul>
                    <p className="text-red-300 text-sm font-medium tracking-wide"
                       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      THIS ACTION CANNOT BE UNDONE!
                    </p>
                    {dangerAction.backupFirst && (
                      <p className="text-green-300 text-sm font-medium mt-2 tracking-wide"
                         style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                        ✓ A backup will be created before deletion.
                      </p>
                    )}
                  </div>
                </div>

                {/* Confirmation Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-red-300/90 mb-2 tracking-wide"
                         style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    To confirm this action, type the following text exactly:
                  </label>
                  <div className="p-3 bg-slate-900/60 border border-red-400/30 rounded-lg mb-3">
                    <code className="text-red-200 font-mono text-sm tracking-wide">
                      {dangerAction.confirmationText}
                    </code>
                  </div>
                  <input
                    type="text"
                    value={dangerConfirmationInput}
                    onChange={(e) => setDangerConfirmationInput(e.target.value)}
                    placeholder="Type the confirmation text here..."
                    className="w-full p-3 bg-gradient-to-r from-slate-900 to-slate-800 border border-red-400/40 rounded-lg text-red-200 placeholder-red-400/50 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400/70 transition-all duration-300 font-mono"
                    autoFocus
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex space-x-3">
                {/* Confirm Button */}
                <button 
                  onClick={handleDangerConfirmation}
                  disabled={dangerConfirmationInput !== dangerAction.confirmationText || isResetting}
                  className="group/btn relative flex-1 px-4 py-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-700/60 via-red-600/70 to-red-700/60 rounded-lg" />
                  <div className="absolute inset-0 border-2 border-red-500/60 rounded-lg" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent group-hover/btn:from-red-500/20 group-hover/btn:via-red-400/30 group-hover/btn:to-red-500/20 rounded-lg transition-all duration-300" />
                  
                  <span className="relative text-red-100 font-medium tracking-wide flex items-center justify-center gap-2"
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    {isResetting ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        DELETING...
                      </>
                    ) : (
                      'CONFIRM DELETION'
                    )}
                  </span>
                </button>
                
                {/* Cancel Button */}
                <button
                  onClick={handleCloseDangerModal}
                  disabled={isResetting}
                  className="group/btn relative flex-1 px-4 py-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-700/40 via-slate-600/50 to-slate-700/40 rounded-lg" />
                  <div className="absolute inset-0 border border-slate-500/40 rounded-lg" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent group-hover/btn:from-violet-600/10 group-hover/btn:via-violet-500/15 group-hover/btn:to-violet-600/10 rounded-lg transition-all duration-300" />
                  
                  <span className="relative text-slate-300 font-light tracking-wide flex items-center justify-center"
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    Cancel
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
