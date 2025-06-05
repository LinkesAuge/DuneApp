import { PixelCrop } from 'react-image-crop';

// =====================================================
// Unified Image Management Types
// =====================================================

export type ImageType = 'poi_screenshot' | 'comment_image' | 'profile_avatar' | 'custom_icon' | 'item_screenshot' | 'schematic_screenshot';

export interface ManagedImage {
  id: string;
  original_url: string;           // Always the unprocessed original
  processed_url: string | null;   // Cropped/processed version if exists
  crop_details: PixelCrop | null; // Crop data from react-image-crop
  image_type: ImageType;
  file_size: number | null;
  dimensions: { width: number; height: number } | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface POIImageLink {
  poi_id: string;
  image_id: string;
  display_order: number;
  created_at: string;
  managed_image?: ManagedImage; // Joined data
}

export interface CommentImageLink {
  comment_id: string;
  image_id: string;
  created_at: string;
  managed_image?: ManagedImage; // Joined data
}

export interface ItemImageLink {
  entity_id: string;
  image_id: string;
  display_order: number;
  created_at: string;
  managed_image?: ManagedImage; // Joined data
}

export interface SchematicImageLink {
  entity_id: string;
  image_id: string;
  display_order: number;
  created_at: string;
  managed_image?: ManagedImage; // Joined data
}

// =====================================================
// Upload Related Types
// =====================================================

export interface ImageUploadOptions {
  imageType: ImageType;
  maxFileSize?: number; // In bytes, default 10MB
  allowedTypes?: string[]; // MIME types, default ['image/jpeg', 'image/png', 'image/webp']
  maxDimensions?: { width: number; height: number };
}

export interface ImageUploadResult {
  managed_image: ManagedImage;
  success: boolean;
  error?: string;
}

export interface ImageProcessingResult {
  original_url: string;
  processed_url?: string;
  crop_details?: PixelCrop;
  file_size: number;
  dimensions: { width: number; height: number };
  mime_type: string;
}

// =====================================================
// Crop and Edit Types
// =====================================================

export interface ImageEditOptions {
  crop?: PixelCrop;
  removeProcessed?: boolean; // Remove processed version, keep only original
}

export interface ImageEditResult {
  managed_image: ManagedImage;
  deleted_urls: string[]; // URLs that were deleted from storage
  success: boolean;
  error?: string;
}

// =====================================================
// Display Helper Types
// =====================================================

export interface ImageDisplayInfo {
  url: string;           // URL to display (processed if exists, otherwise original)
  original_url: string;  // Always the original
  is_processed: boolean; // Whether displayed image is processed version
  crop_details: PixelCrop | null;
  label: string;         // 'Original' or 'Cropped'
}

// =====================================================
// Legacy Type Updates
// =====================================================

// Update existing POI type to use new system
export interface Poi {
  id: string;
  title: string;
  description: string | null;
  coordinates_x: number | null;
  coordinates_y: number | null;
  poi_type_id: string;
  privacy_level: 'private' | 'shared' | 'public';
  created_by: string;
  created_at: string;
  updated_by: string | null;
  updated_at: string | null;
  grid_coordinate: string | null;
  custom_icon_id: string | null;
  
  // New image system
  images?: POIImageLink[];  // Array of linked images
  
  // Joined data
  poi_types?: any;
  profiles?: any;
}

// Update existing Comment type to use new system  
export interface Comment {
  id: string;
  poi_id: string;
  comment: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  
  // New image system
  images?: CommentImageLink[]; // Array of linked images
  
  // Joined data
  profiles?: any;
}

// Add Entity support for items and schematics
export interface Entity {
  id: string;
  name: string;
  description: string | null;
  entity_type: 'item' | 'schematic';
  category: string;
  type: string;
  tier_number: number;
  tier: string;
  icon: string | null;
  
  // New image system - separate arrays for items vs schematics
  item_images?: ItemImageLink[];       // For items
  schematic_images?: SchematicImageLink[]; // For schematics
  
  // Existing fields...
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

// =====================================================
// API Response Types
// =====================================================

export interface POIWithImages extends Poi {
  images: (POIImageLink & { managed_image: ManagedImage })[];
}

export interface CommentWithImages extends Comment {
  images: (CommentImageLink & { managed_image: ManagedImage })[];
}

export interface ItemWithImages extends Entity {
  item_images: (ItemImageLink & { managed_image: ManagedImage })[];
}

export interface SchematicWithImages extends Entity {
  schematic_images: (SchematicImageLink & { managed_image: ManagedImage })[];
}

export interface EntityWithImages extends Entity {
  item_images?: (ItemImageLink & { managed_image: ManagedImage })[];
  schematic_images?: (SchematicImageLink & { managed_image: ManagedImage })[];
}