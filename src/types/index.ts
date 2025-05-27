// User related types
export type UserRole = 'admin' | 'editor' | 'member' | 'pending';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
}

// Map system types - NEW for Hagga Basin
export type MapType = 'deep_desert' | 'hagga_basin';
export type PrivacyLevel = 'global' | 'private' | 'shared';

// Coordinate types for Hagga Basin
export interface PixelCoordinates {
  x: number; // 0-4000 pixel coordinates
  y: number; // 0-4000 pixel coordinates
}

export interface MarkerPosition {
  left: string; // CSS percentage
  top: string;  // CSS percentage
}

// Grid related types
export interface GridSquare {
  id: string;
  coordinate: string;
  screenshot_url: string | null;
  is_explored: boolean;
  uploaded_by: string | null;
  upload_date: string;
  // NEW: Crop functionality fields
  original_screenshot_url: string | null;
  crop_x: number | null;
  crop_y: number | null;
  crop_width: number | null;
  crop_height: number | null;
  crop_created_at: string | null;
}

// POI related types - EXTENDED for multi-map support
export interface PoiType {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: string;
  default_description: string | null;
  icon_has_transparent_background?: boolean;
  created_by?: string | null; // NULL means system/admin created, user ID means user-created
}

export interface PoiScreenshot {
  id: string;
  url: string;
  uploaded_by: string;
  upload_date: string;
}

// EXTENDED POI interface for multi-map support
export interface Poi {
  id: string;
  grid_square_id: string | null; // nullable for Hagga Basin POIs
  poi_type_id: string;
  title: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string; // When the POI was last updated
  screenshots: PoiScreenshot[];
  // NEW fields for Hagga Basin support
  map_type: MapType;
  coordinates_x: number | null; // pixel coordinates for Hagga Basin
  coordinates_y: number | null; // pixel coordinates for Hagga Basin
  privacy_level: PrivacyLevel;
  // NEW: Custom icon support
  custom_icon_id: string | null; // Reference to custom icon, overrides POI type icon when set
}

export interface PoiWithGridSquare extends Poi {
  grid_square?: GridSquare;
}

// NEW: Hagga Basin Base Map Management
export interface HaggaBasinBaseMap {
  id: string;
  name: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
  created_by: string;
}

// NEW: Hagga Basin Overlay Management
export interface HaggaBasinOverlay {
  id: string;
  name: string;
  image_url: string;
  opacity: number; // 0.0 - 1.0
  display_order: number;
  is_active: boolean;
  can_toggle: boolean;
  created_at: string;
  created_by: string;
}

// NEW: POI Collections System
export interface PoiCollection {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface PoiCollectionItem {
  collection_id: string;
  poi_id: string;
  added_at: string;
}

export interface PoiCollectionWithItems extends PoiCollection {
  items: PoiCollectionItem[];
  pois?: Poi[];
}

// NEW: POI Sharing System
export interface PoiShare {
  poi_id: string;
  shared_with_user_id: string;
  shared_by_user_id: string;
  created_at: string;
}

// NEW: Custom Icons System
export interface CustomIcon {
  id: string;
  user_id: string;
  name: string;
  image_url: string;
  created_at: string;
}

// NEW: Coordinate conversion utilities interface
export interface CoordinateConverter {
  getMarkerPosition: (x: number, y: number) => MarkerPosition;
  getPixelCoordinates: (clickX: number, clickY: number, mapRect: DOMRect) => PixelCoordinates;
  validateCoordinates: (x: number, y: number) => boolean;
}

// NEW: Interactive Map Configuration
export interface MapConfig {
  initialScale: number;
  minScale: number;
  maxScale: number;
  limitToBounds: boolean;
  centerOnInit: boolean;
  wheel: { step: number };
  pinch: { step: number };
  doubleClick: { disabled: boolean };
}

// NEW: Layer styling for z-index management
export interface LayerZIndex {
  baseMap: number;
  overlayStart: number;
  overlayEnd: number;
  poiMarkers: number;
  poiLabels: number;
  uiControls: number;
}

// Comment related types
export interface CommentScreenshot {
  id: string;
  url: string;
  uploaded_by: string;
  upload_date: string;
  file_size?: number;
  file_name?: string;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  poi_id?: string;
  grid_square_id?: string;
  screenshots?: CommentScreenshot[];
}

export interface CommentWithUser extends Comment {
  user?: {
    username: string;
  };
}

// Like related types
export interface Like {
  id: string;
  created_at: string;
  created_by: string;
  target_type: 'comment' | 'poi';
  target_id: string;
}

export interface LikeStatus {
  likeCount: number;
  isLikedByUser: boolean;
  userLikeId?: string;
}

// Generic types
export interface Coordinate {
  x: number;
  y: number;
  label: string;
}

// Auth state
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Application state - EXTENDED for multi-map support
export interface AppState {
  gridSquares: GridSquare[];
  selectedGridSquare: GridSquare | null;
  pois: Poi[];
  poiTypes: PoiType[];
  isLoading: boolean;
  error: string | null;
  // NEW: Hagga Basin state
  haggaBasinBaseMaps: HaggaBasinBaseMap[];
  haggaBasinOverlays: HaggaBasinOverlay[];
  poiCollections: PoiCollection[];
  customIcons: CustomIcon[];
}

// Admin Panel Specific Types
export interface ScheduledAdminTask {
  jobId: number;
  jobName: string;
  taskType: 'backup' | 'reset' | 'unknown';
  frequency: 'daily' | 'weekly' | 'custom' | 'unknown';
  time: string; // HH:MM
  dayOfWeek?: number; // 0-6 for weekly, undefined for daily
  isActive: boolean;
  fullCronExpression: string;
  rawCommand: string;
  // nextRun?: string; // Could be string if pre-formatted, or Date if to be formatted in frontend
}

// Dashboard Types - EXTENDED for multi-map support
export interface DashboardStats {
  totalPois: number;
  totalComments: number;
  totalGridSquares: number;
  exploredGridSquares: number;
  totalScreenshots: number;
  totalUsers: number;
  // NEW: Hagga Basin specific stats
  deepDesertPois: number;
  haggaBasinPois: number;
  poiCollections: number;
  sharedPois: number;
  privatePois: number;
}

export interface ActivityItem {
  id: string;
  type: 'poi_created' | 'comment_added' | 'grid_explored' | 'screenshot_uploaded' | 'collection_created' | 'poi_shared';
  title: string;
  description: string;
  user: {
    username: string;
  };
  timestamp: string;
  targetId?: string;
  targetType?: 'poi' | 'grid_square' | 'comment' | 'collection';
  metadata?: {
    coordinate?: string;
    poiTitle?: string;
    screenshotUrl?: string;
    mapType?: MapType;
    collectionName?: string;
  };
}