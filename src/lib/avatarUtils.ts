import { User, ProfileDisplay } from '../types';

/**
 * Resolves the display avatar URL for a user
 * Respects user preference for Discord vs custom avatar
 */
export function getDisplayAvatarUrl(user: User | { custom_avatar_url?: string | null; discord_avatar_url?: string | null; use_discord_avatar?: boolean }): string {
  // If user prefers Discord avatar and has one, use it
  if (user.use_discord_avatar !== false && user.discord_avatar_url) {
    return user.discord_avatar_url;
  }
  
  // If user prefers custom avatar and has one, use it
  if (user.use_discord_avatar === false && user.custom_avatar_url) {
    return user.custom_avatar_url;
  }
  
  // Fallback: try custom first, then Discord
  if (user.custom_avatar_url) {
    return user.custom_avatar_url;
  }
  
  if (user.discord_avatar_url) {
    return user.discord_avatar_url;
  }
  
  return '/default-avatar.png';
}

/**
 * Resolves the display name for a user
 * Priority: display_name > discord_username > username > email prefix
 */
export function getDisplayName(user: User): string {
  if (user.display_name) {
    return user.display_name;
  }
  
  if (user.discord_username) {
    return user.discord_username;
  }
  
  if (user.username) {
    return user.username;
  }
  
  // Fallback to email prefix
  return user.email.split('@')[0];
}

/**
 * Gets complete profile display information
 */
export function getProfileDisplay(user: User): ProfileDisplay {
  const display_name = getDisplayName(user);
  const avatar_url = getDisplayAvatarUrl(user);
  const is_discord_user = Boolean(user.discord_id);
  const is_custom_avatar = Boolean(user.custom_avatar_url);
  
  return {
    display_name,
    avatar_url,
    is_discord_user,
    is_custom_avatar
  };
}

/**
 * Constructs a Discord avatar URL from user data
 */
export function buildDiscordAvatarUrl(discordId: string, avatarHash: string, size: number = 80): string {
  if (!avatarHash) {
    // Default Discord avatar for users without custom avatars
    const defaultAvatarNum = (parseInt(discordId) >>> 22) % 6;
    return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNum}.png`;
  }
  
  // Determine if it's a GIF avatar
  const extension = avatarHash.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.${extension}?size=${size}`;
}

/**
 * Checks if a user has any form of custom avatar (Discord or uploaded)
 */
export function hasCustomAvatar(user: User): boolean {
  return Boolean(user.custom_avatar_url || user.discord_avatar_url);
}

/**
 * Gets avatar source type for UI display
 */
export function getAvatarSource(user: User): 'custom' | 'discord' | 'default' {
  if (user.custom_avatar_url) {
    return 'custom';
  }
  
  if (user.discord_avatar_url) {
    return 'discord';
  }
  
  return 'default';
}

/**
 * Formats Discord username for display (handles legacy discriminator system)
 */
export function formatDiscordUsername(username: string, discriminator?: string): string {
  if (discriminator && discriminator !== '0') {
    return `${username}#${discriminator}`;
  }
  return username;
} 