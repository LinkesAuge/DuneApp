// Date and time formatting utilities

/**
 * Format a date/timestamp to remove seconds, showing only date and hours:minutes
 * @param dateString - ISO date string or date string
 * @param includeTime - Whether to include time portion (default: true)
 * @returns Formatted date string without seconds
 */
export const formatDateTime = (dateString: string, includeTime: boolean = true): string => {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    if (includeTime) {
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      
      return date.toLocaleDateString('en-US', dateOptions) + ' at ' + 
             date.toLocaleTimeString('en-US', timeOptions);
    }
    
    return date.toLocaleDateString('en-US', dateOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format just the date portion (no time)
 * @param dateString - ISO date string or date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  return formatDateTime(dateString, false);
};

/**
 * Get relative time (e.g., "2 hours ago", "yesterday")
 * @param dateString - ISO date string or date string
 * @returns Relative time string
 */
export const getRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    // Less than a minute
    if (diffMs < 60000) {
      return 'just now';
    }
    
    // Less than an hour
    if (diffMs < 3600000) {
      const minutes = Math.floor(diffMs / 60000);
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }
    
    // Less than a day
    if (diffMs < 86400000) {
      const hours = Math.floor(diffMs / 3600000);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }
    
    // Less than a week
    if (diffMs < 604800000) {
      const days = Math.floor(diffMs / 86400000);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    }
    
    // More than a week, show formatted date
    return formatDate(dateString);
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return formatDate(dateString);
  }
};

/**
 * Format a compact timestamp for metadata display (smaller text)
 * @param dateString - ISO date string or date string
 * @returns Compact formatted string
 */
export const formatCompactDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Show relative time if recent, otherwise show compact date
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    // Less than 24 hours - show relative time
    if (diffMs < 86400000) {
      return getRelativeTime(dateString);
    }
    
    // More than 24 hours - show compact date
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    };
    
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error('Error formatting compact date:', error);
    return 'Invalid date';
  }
};

/**
 * Check if two dates are the same (ignoring time)
 * @param date1 - First date string
 * @param date2 - Second date string
 * @returns True if dates are the same day
 */
export const isSameDay = (date1: string, date2: string): boolean => {
  try {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  } catch (error) {
    return false;
  }
};

/**
 * Check if a date was updated (created_at !== updated_at)
 * @param createdAt - Creation timestamp
 * @param updatedAt - Update timestamp
 * @returns True if the item was edited after creation
 */
export const wasUpdated = (createdAt: string, updatedAt: string): boolean => {
  try {
    const created = new Date(createdAt).getTime();
    const updated = new Date(updatedAt).getTime();
    
    // Consider it updated if there's more than 1 second difference
    return Math.abs(updated - created) > 1000;
  } catch (error) {
    return false;
  }
};

/**
 * Check if a formatted date string is relative time (no "on" needed) or actual date ("on" needed)
 * @param formattedDate - The formatted date string
 * @returns True if "on" should be used before the date
 */
export const shouldUseOnPreposition = (formattedDate: string): boolean => {
  // If it contains "ago" or "just now", it's relative time and doesn't need "on"
  return !formattedDate.includes('ago') && !formattedDate.includes('just now');
};

/**
 * Format a date string with proper grammar for "created by X [on] date" context
 * @param dateString - ISO date string or date string
 * @returns Object with formatted date and whether to use "on"
 */
export const formatDateWithPreposition = (dateString: string): { date: string; useOn: boolean } => {
  const formattedDate = formatCompactDateTime(dateString);
  return {
    date: formattedDate,
    useOn: shouldUseOnPreposition(formattedDate)
  };
}; 