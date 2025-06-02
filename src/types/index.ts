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



// NEW: POI Sharing System
export interface PoiShare {
  poi_id: string;
  shared_with_user_id: string;
  shared_by_user_id: string;
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
  sharedPois: number;
  privatePois: number;
}

export interface ActivityItem {
  id: string;
  type: 'poi_created' | 'poi_edited' | 'poi_deleted' | 'comment_added' | 'comment_edited' | 'comment_deleted' | 'grid_explored' | 'screenshot_uploaded' | 'screenshot_deleted' | 'poi_shared';
  title: string;
  description: string;
  timestamp: string;
  icon: string; // This matches how it's used in ActivityFeed.tsx
  targetId?: string;
  targetType?: 'poi' | 'grid_square' | 'comment';
  metadata?: {
    coordinate?: string;
    poiTitle?: string;
    screenshotUrl?: string;
    mapType?: MapType;

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
  updated_by: string | null; // Who last updated this tier
  created_at: string;
  updated_at: string;
}

// Category system interface
export interface Category {
  id: string;
  name: string;
  icon: string | null; // Legacy field for backward compatibility
  icon_image_id: string | null; // NEW: Reference to shared image
  icon_fallback: string | null; // NEW: Fallback text icon
  applies_to: AppliesTo[];
  description: string | null;
  created_by: string | null;
  updated_by: string | null; // Who last updated this category
  is_global: boolean;
  created_at: string;
  updated_at: string;
}

// Type system interface
export interface Type {
  id: string;
  name: string;
  category_id: string;
  parent_type_id: string | null; // NEW: Support for type hierarchy
  icon_image_id: string | null; // NEW: Reference to shared image
  icon_fallback: string | null; // NEW: Fallback text icon
  description: string | null;
  created_by: string | null;
  updated_by: string | null; // Who last updated this type
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
  updated_by: string | null; // Who last updated this subtype
  is_global: boolean;
  created_at: string;
  updated_at: string;
}

// NEW: Type management interfaces
export interface TypeDependencies {
  subtypes_count: number;
  items_count: number;
  schematics_count: number;
  total_count: number;
}

export interface CreateTypeRequest {
  name: string;
  category_id: string;
  parent_type_id?: string | null;
  icon_image_id?: string | null;
  icon_fallback?: string | null;
  description?: string | null;
}

export interface UpdateTypeRequest {
  name?: string;
  parent_type_id?: string | null;
  icon_image_id?: string | null;
  icon_fallback?: string | null;
  description?: string | null;
}

// Dropdown system interfaces
export type DropdownSourceType = 'custom' | 'categories' | 'types' | 'items' | 'schematics' | 'tiers';

export interface DropdownGroup {
  id: string;
  name: string;
  description: string | null;
  source_type: DropdownSourceType; // How options are populated
  // Filter fields for dynamic sources
  source_category_id: string | null; // Filter items/schematics by category
  source_type_id: string | null; // Filter items/schematics by type
  source_tier_id: string | null; // Filter items/schematics by tier
  applies_to: AppliesTo | null; // Filter categories/types by what they apply to
  created_by: string | null;
  updated_by: string | null; // Who last updated this dropdown group
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
  updated_at: string; // When this dropdown option was last updated
  updated_by: string | null; // Who last updated this dropdown option
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
  updated_by: string | null; // Who last updated this field definition
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
  updated_by: string | null; // Who last updated this item
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
  updated_by: string | null; // Who last updated this schematic
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

// ==========================================
// POI Integration System Types
// ==========================================

// POI-Item linking interface
export interface PoiItemLink {
  id: string;
  poi_id: string;
  item_id: string | null;
  schematic_id: string | null;
  link_type: 'found_here' | 'crafted_here' | 'required_for' | 'material_source';
  quantity?: number | null; // For recipe requirements
  notes?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

// POI with linked items for display
export interface PoiWithItems extends Poi {
  linked_items?: ItemWithRelations[];
  linked_schematics?: SchematicWithRelations[];
  item_links?: PoiItemLink[];
}

// Item/Schematic with POI locations
export interface ItemWithLocations extends ItemWithRelations {
  poi_locations?: PoiLocationInfo[];
  crafting_locations?: PoiLocationInfo[];
}

export interface SchematicWithLocations extends SchematicWithRelations {
  poi_locations?: PoiLocationInfo[];
  crafting_locations?: PoiLocationInfo[];
  required_materials?: MaterialRequirement[];
}

// Location information for items/schematics
export interface PoiLocationInfo {
  poi_id: string;
  poi_title: string;
  poi_type: PoiType;
  map_type: MapType;
  coordinate?: string; // For Deep Desert grid
  coordinates_x?: number | null; // For Hagga Basin
  coordinates_y?: number | null; // For Hagga Basin
  link_type: 'found_here' | 'crafted_here';
  quantity?: number | null;
  notes?: string | null;
  distance?: number; // For map sorting/filtering
}

// Recipe/crafting requirements
export interface MaterialRequirement {
  item_id: string;
  item_name: string;
  quantity: number;
  tier?: Tier;
  available_locations?: PoiLocationInfo[];
}

// Recipe information for schematics
export interface RecipeInfo {
  schematic_id: string;
  required_materials: MaterialRequirement[];
  crafting_locations: PoiLocationInfo[];
  total_materials: number;
  materials_with_known_locations: number;
  completion_percentage: number;
}

// Map integration types
export interface MapItemFilter {
  item_ids: string[];
  schematic_ids: string[];
  link_types: ('found_here' | 'crafted_here' | 'required_for' | 'material_source')[];
  show_only_linked_pois: boolean;
}

// POI search/filter with item integration
export interface PoiSearchWithItems {
  text_search?: string;
  poi_type_ids?: string[];
  item_ids?: string[];
  schematic_ids?: string[];
  link_types?: ('found_here' | 'crafted_here' | 'required_for' | 'material_source')[];
  map_type?: MapType;
  has_items?: boolean; // Show only POIs with linked items
}

// Statistics for POI-Item integration
export interface PoiItemStats {
  total_poi_item_links: number;
  pois_with_items: number;
  items_with_locations: number;
  schematics_with_locations: number;
  completed_recipes: number; // Schematics where all materials have known locations
  link_types_count: {
    found_here: number;
    crafted_here: number;
    required_for: number;
    material_source: number;
  };
}