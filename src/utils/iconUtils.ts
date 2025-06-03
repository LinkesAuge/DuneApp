/**
 * Utility functions for entity icon handling
 */

/**
 * Constructs the full URL for an entity icon from Supabase storage
 * @param iconFilename - Just the filename from database (e.g., "t_ui_icontmogitemvariant_d.webp")
 * @returns Full Supabase storage URL
 */
export function getEntityIconUrl(iconFilename: string | null | undefined): string {
  if (!iconFilename) {
    // Use a default icon from Supabase storage
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/screenshots/entity-icons/default-entity.png`;
  }
  
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/screenshots/entity-icons/${iconFilename}`;
}

/**
 * Constructs the full URL for a tier icon (if we have tier-specific icons)
 * @param tierNumber - The tier number (0-7)
 * @returns Full URL path to the tier icon
 */
export function getTierIconUrl(tierNumber: number): string {
  return `/assets/tier-icons/tier-${tierNumber}.png`;
}

/**
 * Gets a fallback icon based on entity category/type
 * @param category - Entity category
 * @param type - Entity type
 * @param isSchematic - Whether this is a schematic
 * @returns Fallback icon URL
 */
export function getFallbackIconUrl(
  category: string, 
  type: string, 
  isSchematic: boolean = false
): string {
  const prefix = isSchematic ? 'schematic' : 'item';
  const safeCategoryName = category.toLowerCase().replace(/\s+/g, '-');
  const safeTypeName = type.toLowerCase().replace(/\s+/g, '-');
  
  return `/assets/entity-icons/fallbacks/${prefix}-${safeCategoryName}-${safeTypeName}.png`;
}

/**
 * Validates if an icon file exists (for upload validation)
 * @param filename - The icon filename
 * @returns Boolean indicating if the filename has a valid format
 */
export function isValidIconFilename(filename: string): boolean {
  const validExtensions = ['.webp', '.png', '.jpg', '.jpeg', '.svg'];
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return validExtensions.includes(extension);
}

/**
 * Extracts the filename from a full file path or URL
 * @param path - Full path or URL
 * @returns Just the filename
 */
export function extractIconFilename(path: string): string {
  return path.split('/').pop() || path;
} 