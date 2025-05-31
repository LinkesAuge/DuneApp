import { PixelCrop } from 'react-image-crop';

// User related types
export type UserRole = 'admin' | 'editor' | 'member' | 'pending';

export interface User {
  id: string;
  email: string;
  username: string;
  display_name?: string | null; // User's preferred display name
  role: UserRole;
  // Discord authentication fields
  discord_id?: string | null;
  discord_username?: string | null;
  discord_avatar_url?: string | null;
  custom_avatar_url?: string | null; // User's custom avatar override
  use_discord_avatar?: boolean; // User's preference for which avatar to display
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
  updated_by: string | null; // Who last updated/edited this grid square
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
  display_in_panel?: boolean; // Whether this category appears in main POI filter panels
  category_display_order?: number; // Order in which category appears (lower numbers first)
  category_column_preference?: number; // Which column: 1=left, 2=right
}

export interface PoiScreenshot {
  id: string;
  url: string;
  original_url?: string | null; // URL of original image before cropping
  crop_details?: PixelCrop | null; // Crop information from react-image-crop
  uploaded_by: string;
  upload_date: string;
  updated_by?: string | null; // Who last edited this screenshot
  updated_at?: string; // When this screenshot was last updated
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
  updated_by: string | null; // Who last updated/edited this POI
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
  updated_by: string | null; // Who last updated/edited this collection
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
  updated_by?: string | null; // Who last edited this screenshot
  updated_at?: string; // When this screenshot was last updated
  file_size?: number;
  file_name?: string;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string | null; // Who last edited this comment
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
  // NEW: Items & Schematics state
  tiers: Tier[];
  categories: Category[];
  types: Type[];
  subtypes: SubType[];
  items: Item[];
  schematics: Schematic[];
  fieldDefinitions: FieldDefinition[];
  dropdownGroups: DropdownGroup[];
  dropdownOptions: DropdownOption[];
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
  type: 'poi_created' | 'poi_edited' | 'poi_deleted' | 'comment_added' | 'comment_edited' | 'comment_deleted' | 'grid_explored' | 'screenshot_uploaded' | 'screenshot_deleted' | 'collection_created' | 'poi_shared';
  title: string;
  description: string;
  timestamp: string;
  icon: string; // This matches how it's used in ActivityFeed.tsx
  targetId?: string;
  targetType?: 'poi' | 'grid_square' | 'comment' | 'collection';
  metadata?: {
    coordinate?: string;
    poiTitle?: string;
    screenshotUrl?: string;
    mapType?: MapType;
    collectionName?: string;
    editedBy?: string;
    deletedBy?: string;
  };
}

// Discord authentication types
export interface DiscordProfile {
  id: string;
  username: string;
  discriminator?: string; // For legacy Discord usernames
  global_name?: string | null; // New display name system
  avatar?: string | null; // Avatar hash
  email?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
  raw_user_meta_data?: {
    provider_id?: string;
    username?: string;
    avatar_url?: string;
    full_name?: string;
  };
}

// Helper types for avatar and display name resolution
export interface ProfileDisplay {
  display_name: string;
  avatar_url: string;
  is_discord_user: boolean;
  is_custom_avatar: boolean;
}

// Items & Schematics System Types
// =================================

// Core entity type definitions
export type FieldType = 'text' | 'number' | 'dropdown';
export type ScopeType = 'global' | 'category' | 'type';
export type AppliesTo = 'items' | 'schematics';

// Dynamic field value types
export type FieldValue = string | number | boolean | null;
export interface FieldValues {
  [key: string]: FieldValue;
}

// Tier system interface
export interface Tier {
  id: string;
  name: string;
  level: number;
  color: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Category system interface
export interface Category {
  id: string;
  name: string;
  icon: string | null;
  applies_to: AppliesTo[];
  description: string | null;
  created_by: string | null;
  is_global: boolean;
  created_at: string;
  updated_at: string;
}

// Type system interface
export interface Type {
  id: string;
  name: string;
  category_id: string;
  description: string | null;
  created_by: string | null;
  is_global: boolean;
  created_at: string;
  updated_at: string;
}

// SubType system interface
export interface SubType {
  id: string;
  name: string;
  type_id: string;
  description: string | null;
  created_by: string | null;
  is_global: boolean;
  created_at: string;
  updated_at: string;
}

// Dropdown system interfaces
export interface DropdownGroup {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DropdownOption {
  id: string;
  group_id: string;
  value: string;
  display_text: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

// Dynamic field system interface
export interface FieldDefinition {
  id: string;
  name: string;
  display_name: string;
  field_type: FieldType;
  scope_type: ScopeType;
  scope_id: string | null;
  is_required: boolean;
  default_visible: boolean;
  display_order: number;
  dropdown_group_id: string | null;
  validation_rules: Record<string, any>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Core item interface
export interface Item {
  id: string;
  name: string;
  description: string | null;
  category_id: string;
  type_id: string | null;
  subtype_id: string | null;
  tier_id: string | null;
  icon_url: string | null;
  field_values: FieldValues;
  created_by: string | null;
  is_global: boolean;
  created_at: string;
  updated_at: string;
}

// Core schematic interface
export interface Schematic {
  id: string;
  name: string;
  description: string | null;
  category_id: string;
  type_id: string | null;
  subtype_id: string | null;
  tier_id: string | null;
  icon_url: string | null;
  field_values: FieldValues;
  created_by: string | null;
  is_global: boolean;
  created_at: string;
  updated_at: string;
}

// Screenshot interfaces
export interface ItemScreenshot {
  id: string;
  item_id: string;
  url: string;
  original_url: string | null;
  crop_details: PixelCrop | null;
  uploaded_by: string | null;
  upload_date: string;
  sort_order: number;
  file_size: number | null;
  file_name: string | null;
}

export interface SchematicScreenshot {
  id: string;
  schematic_id: string;
  url: string;
  original_url: string | null;
  crop_details: PixelCrop | null;
  uploaded_by: string | null;
  upload_date: string;
  sort_order: number;
  file_size: number | null;
  file_name: string | null;
}

// Resolved field interface for inheritance system
export interface ResolvedField {
  id: string;
  name: string;
  display_name: string;
  field_type: FieldType;
  scope_type: ScopeType;
  scope_id: string | null;
  is_required: boolean;
  default_visible: boolean;
  display_order: number;
  dropdown_group_id: string | null;
  validation_rules: Record<string, any>;
  inheritance_level: number; // 1=global, 2=category, 3=type
}

// Extended interfaces with relationships
export interface ItemWithRelations extends Item {
  category?: Category;
  type?: Type;
  subtype?: SubType;
  tier?: Tier;
  screenshots?: ItemScreenshot[];
}

export interface SchematicWithRelations extends Schematic {
  category?: Category;
  type?: Type;
  subtype?: SubType;
  tier?: Tier;
  screenshots?: SchematicScreenshot[];
}

export interface CategoryWithTypes extends Category {
  types?: Type[];
}

export interface TypeWithSubTypes extends Type {
  subtypes?: SubType[];
  category?: Category;
}

export interface FieldDefinitionWithGroup extends FieldDefinition {
  dropdown_group?: DropdownGroup;
  dropdown_options?: DropdownOption[];
}

// Field resolution parameters
export interface FieldResolutionParams {
  category_id?: string;
  type_id?: string;
}

// Field resolution result
export interface FieldResolutionResult {
  fields: ResolvedField[];
  field_count: number;
  has_required_fields: boolean;
}

// Hierarchy validation interfaces
export interface HierarchyValidation {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ItemValidation extends HierarchyValidation {
  item: Partial<Item>;
}

export interface SchematicValidation extends HierarchyValidation {
  schematic: Partial<Schematic>;
}

// Items & Schematics Permission System Types
// ==========================================

// Permission action types
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage';

// Content scope types
export type ContentScope = 'global' | 'own' | 'all';

// Entity permission types
export type EntityType = 'tier' | 'category' | 'type' | 'subtype' | 'field_definition' | 'dropdown_group' | 'item' | 'schematic';

// Permission check result
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  requiresElevation?: boolean;
}

// User capabilities interface
export interface ItemsSchematicsCapabilities {
  // System management capabilities
  canManageTiers: boolean;
  canManageCategories: boolean;
  canManageTypes: boolean;
  canManageSubTypes: boolean;
  canManageFieldDefinitions: boolean;
  canManageDropdownGroups: boolean;
  
  // Item capabilities
  canCreateItems: boolean;
  canEditOwnItems: boolean;
  canEditAllItems: boolean;
  canDeleteOwnItems: boolean;
  canDeleteAllItems: boolean;
  
  // Schematic capabilities
  canCreateSchematics: boolean;
  canEditOwnSchematics: boolean;
  canEditAllSchematics: boolean;
  canDeleteOwnSchematics: boolean;
  canDeleteAllSchematics: boolean;
  
  // Global content capabilities
  canCreateGlobalContent: boolean;
  canManageGlobalContent: boolean;
  
  // Advanced capabilities
  isSystemBuilder: boolean;
  isAdministrator: boolean;
}

// Permission context for checking specific operations
export interface PermissionContext {
  user: User | null;
  entity?: {
    type: EntityType;
    id?: string;
    created_by?: string | null;
    is_global?: boolean;
  };
  action: PermissionAction;
  scope?: ContentScope;
}

// Bulk permission check result
export interface BulkPermissionResult {
  [entityId: string]: PermissionCheckResult;
}