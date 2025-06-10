import { PixelCrop } from 'react-image-crop';
// Import correct interfaces from their source files instead of redefining them
import { Poi } from './index';
import { Entity } from './unified-entities';

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
// Extended Types Using Correct Base Interfaces
// =====================================================

// Extend the correct POI interface with image data
export interface POIWithImages extends Poi {
  images: (POIImageLink & { managed_image: ManagedImage })[];
}

// Comment interface - import from correct source when available
export interface CommentWithImages {
  id: string;
  poi_id: string;
  comment: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  images: (CommentImageLink & { managed_image: ManagedImage })[];
  // Joined data
  profiles?: any;
}

// Entity image extensions
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