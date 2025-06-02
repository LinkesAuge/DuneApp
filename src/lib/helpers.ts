import { Poi, PoiType } from '../types';

// Helper function to check if icon is a URL
export const isIconUrl = (icon: string): boolean => {
  return icon.startsWith('http') || icon.startsWith('/') || icon.includes('.');
};

// Simple helper to get display image URL from icon string
export const getDisplayImageUrlFromIcon = (icon: string): string => {
  if (isIconUrl(icon)) {
    return icon;
  }
  return icon; // Return the emoji as is
};

// Simplified helper function to get display image URL for POI type icons
export const getDisplayImageUrl = (poiType: PoiType): string | null => {
  // Check if POI type icon is a URL
  if (isIconUrl(poiType.icon)) {
    return poiType.icon;
  }
  
  // Default: Use emoji icon (return null so component uses emoji)
  return null;
}; 