// TypeScript interfaces for the Shared Images System
// ALL IMAGES AVAILABLE FOR ALL USES - no restrictions by type

export interface SharedImage {
  id: string;
  filename: string;
  storage_path: string;
  image_url: string;
  uploaded_by: string | null;
  image_type: 'category' | 'type' | 'tier' | 'general'; // Organizational hint only - NOT a restriction
  file_size: number;
  mime_type: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
  width: number;
  height: number;
  is_active: boolean;
  usage_count: number;
  tags: string[];
  description?: string;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface SharedImageWithStats extends SharedImage {
  uploaded_by_username?: string;
  active_usage_count: number; // Real-time count of usage across all entity types
}

export interface ImageDisplayInfo {
  image_url?: string;
  is_image: boolean;
  display_value: string;
}

// Upload request interface
export interface SharedImageUpload {
  file: File;
  image_type?: 'category' | 'type' | 'tier' | 'general'; // Optional organizational hint
  tags?: string[];
  description?: string;
}

// Search/filter interface for image selection
export interface ImageSearchFilters {
  search_query?: string;
  tags?: string[];
  image_type?: 'category' | 'type' | 'tier' | 'general' | 'all'; // 'all' shows everything
  uploaded_by?: string;
  sort_by?: 'created_at' | 'usage_count' | 'filename';
  sort_direction?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Response interface for image selection API
export interface ImageSearchResponse {
  images: SharedImageWithStats[];
  total_count: number;
  has_more: boolean;
}

// Image selection component props
export interface ImageSelectorProps {
  value?: string | null; // Selected image ID
  onChange: (imageId: string | null) => void;
  placeholder?: string;
  showTypeFilter?: boolean; // Whether to show type filter in UI (organizational only)
  allowUpload?: boolean;
  className?: string;
}

// Enhanced entity interfaces with image support
export interface CategoryWithImage {
  id: string;
  name: string;
  icon_image_id?: string | null;
  icon_fallback?: string | null;
  // ... other category fields
}

export interface TypeWithImage {
  id: string;
  name: string;
  icon_image_id?: string | null;
  icon_fallback?: string | null;
  // ... other type fields
}

export interface TierWithImage {
  id: string;
  name: string;
  icon_image_id?: string | null;
  icon_fallback?: string | null;
  // ... other tier fields
}

// Utility type for any entity that can have an image
export interface EntityWithImageIcon {
  icon_image_id?: string | null;
  icon_fallback?: string | null;
}

export interface ImageUploadData {
  file: File;
  image_type: SharedImage['image_type'];
  tags: string[];
  description?: string;
}

export interface CreateSharedImageData {
  filename: string;
  storage_path: string;
  image_url: string;
  image_type: SharedImage['image_type'];
  file_size: number;
  mime_type: SharedImage['mime_type'];
  width: number;
  height: number;
  tags: string[];
  description?: string;
}

export interface UpdateSharedImageData {
  tags?: string[];
  description?: string;
  is_active?: boolean;
}

// API function types
export type FetchSharedImagesParams = {
  filters?: ImageSearchFilters;
  limit?: number;
  offset?: number;
};

export type FetchSharedImagesResponse = {
  data: SharedImageWithStats[];
  total: number;
  hasMore: boolean;
};

// Storage bucket organization
export const IMAGE_STORAGE_PATHS = {
  categories: 'shared-images/categories',
  types: 'shared-images/types', 
  tiers: 'shared-images/tiers',
  general: 'shared-images/general'
} as const;

// Image processing constants
export const IMAGE_CONSTRAINTS = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxDimensions: { width: 512, height: 512 },
  standardSize: { width: 64, height: 64 },
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  acceptedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif']
} as const;

export default SharedImage; 