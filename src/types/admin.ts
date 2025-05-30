export type UserRole = 'member' | 'editor' | 'admin';

export interface Profile {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
  discord_id?: string | null;
  discord_username?: string | null;
  discord_avatar_url?: string | null;
  discord_discriminator?: string | null;
  rank_id?: string | null;
  rank?: {
    id: string;
    name: string;
    description: string | null;
    color: string;
    text_color: string;
    display_order: number;
  } | null;
}

export interface StoredBackupFile {
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

export interface BackupsByType {
  deep_desert: StoredBackupFile[];
  hagga_basin: StoredBackupFile[];
  combined: StoredBackupFile[];
}

export interface ScheduledAdminTask {
  id: string;
  task_name: string;
  task_type: 'backup' | 'reset';
  map_type: 'deep_desert' | 'hagga_basin' | 'both';
  schedule: string;
  next_run?: string;
  created_at: string;
  backup_before_reset?: boolean;
}

export type DangerAction = 'reset_deep_desert' | 'reset_hagga_basin';

export interface MapSettings {
  iconMinSize: number;
  iconMaxSize: number;
  iconBaseSize: number;
  showTooltips: boolean;
  allowPositionChange: boolean;
  enableAdvancedFiltering: boolean;
  showSharedIndicators: boolean;
}

export type ScheduledTaskFrequency = 'daily' | 'weekly';
export type AdminTab = 'users' | 'database' | 'poi-types' | 'settings' | 'tasks' | 'ranks'; 