// Enhanced Profile System Types
// Support for admin-configurable ranks and user profiles

export interface Rank {
  id: string;
  name: string;
  description?: string;
  color: string; // Hex color code
  text_color: string; // Text color for contrast
  display_order: number; // For sorting ranks
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface EnhancedProfile {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'member' | 'pending';
  
  // Enhanced profile fields
  display_name?: string | null;
  rank_id?: string | null;
  rank?: Rank | null; // Populated via join
  custom_avatar_url?: string | null;
  use_discord_avatar: boolean;
  profile_completed: boolean;
  bio?: string | null;
  join_date: string;
  
  // Discord fields
  discord_id?: string | null;
  discord_username?: string | null;
  discord_avatar_url?: string | null;
  discord_discriminator?: string | null;
  
  // Timestamps
  created_at?: string;
  updated_at: string;
}

export interface ProfileUpdateData {
  display_name?: string;
  bio?: string;
  use_discord_avatar?: boolean;
  custom_avatar_url?: string;
}

export interface RankCreateData {
  name: string;
  description?: string;
  color: string;
  text_color: string;
  display_order: number;
}

export interface RankUpdateData extends Partial<RankCreateData> {
  id: string;
}

// Utility type for displaying user info throughout the app
export interface UserDisplayInfo {
  id: string;
  displayName: string; // Computed: display_name || username
  avatarUrl: string; // Computed: custom or discord avatar
  rank?: Rank | null;
  role: 'admin' | 'editor' | 'member' | 'pending';
}

// For profile setup flow
export interface ProfileSetupData {
  display_name: string;
  use_discord_avatar: boolean;
  custom_avatar_file?: File;
  bio?: string;
} 