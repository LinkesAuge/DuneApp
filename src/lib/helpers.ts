import { Poi, PoiType, CustomIcon } from '../types';

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

// Helper function to get display image URL for POI icons
export const getDisplayImageUrl = (poi: Poi, poiType: PoiType, customIcons: CustomIcon[]): string | null => {
  // First priority: Check if POI has a custom icon reference
  if (poi.custom_icon_id) {
    const customIcon = customIcons.find(ci => ci.id === poi.custom_icon_id);
    if (customIcon) {
      return customIcon.image_url;
    }
  }
  
  // Second priority: Check if POI type icon is a custom icon reference
  const customIconByPoiType = customIcons.find(ci => ci.id === poiType.icon || ci.name === poiType.icon);
  if (customIconByPoiType) {
    return customIconByPoiType.image_url;
  }
  
  // Third priority: Check if POI type icon is already a URL
  if (isIconUrl(poiType.icon)) {
    return poiType.icon;
  }
  
  // Default: Use emoji icon (return null so component uses emoji)
  return null;
}; 