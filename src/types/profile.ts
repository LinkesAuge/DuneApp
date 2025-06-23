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

// Guild System Types - NEW
export interface Guild {
  id: string;
  name: string;
  description?: string;
  tag_color: string; // Hex color for guild tag background
  tag_text_color: string; // Text color for contrast
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export type GuildRole = 'leader' | 'officer' | 'member';

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
  actual_join_date: string; // Immutable join date for admin display
  
  // Guild System Fields - NEW
  guild_id?: string | null;
  guild?: Guild | null; // Populated via join
  guild_role: GuildRole;
  guild_joined_at?: string | null;
  guild_assigned_by?: string | null;
  
  // Discord integration
  discord_username?: string | null;
  discord_avatar_url?: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// Helper type for guild membership display
export interface GuildMembership {
  user_id: string;
  username: string;
  display_name?: string | null;
  guild_id: string;
  guild_role: GuildRole;
  guild_joined_at: string;
  rank?: Rank | null;
  custom_avatar_url?: string | null;
  use_discord_avatar: boolean;
  discord_avatar_url?: string | null;
}

// Guild management types for admin interface
export interface GuildCreateRequest {
  name: string;
  description?: string;
  tag_color: string;
  tag_text_color: string;
  display_order?: number;
}

export interface GuildUpdateRequest extends Partial<GuildCreateRequest> {
  id: string;
  is_active?: boolean;
}

// User guild assignment types
export interface UserGuildAssignment {
  user_id: string;
  guild_id: string | null; // null for unassigned
  guild_role: GuildRole;
  assigned_by: string; // admin/guild leader who made the assignment
}

export interface ProfileUpdateData {
  display_name?: string;
  bio?: string;
  use_discord_avatar?: boolean;
  custom_avatar_url?: string;
  guild_id?: string | null;
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