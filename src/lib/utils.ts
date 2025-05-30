import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { User } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Gets the display name for a user, falling back to username if no display name is set
 */
export const getDisplayName = (user: User | { display_name?: string | null; username: string }): string => {
  return user.display_name || user.username || 'Unknown User';
};

/**
 * Gets the display name from a profile object with different field structure
 */
export const getDisplayNameFromProfile = (profile: { display_name?: string | null; username?: string | null } | null): string => {
  if (!profile) return 'Unknown User';
  return profile.display_name || profile.username || 'Unknown User';
}; 