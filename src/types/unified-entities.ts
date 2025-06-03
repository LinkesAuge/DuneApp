// Unified Entities System - TypeScript Interfaces
// Generated from database schema with 934 entities (711 Items + 223 Schematics)

// Core entity interface matching the entities table
export interface Entity {
  id: string;                    // uuid, PRIMARY KEY
  item_id: string;              // text, UNIQUE - secondary identifier
  name: string;                 // text, NOT NULL - display name
  description?: string;         // text - optional description
  icon?: string;               // text - LEGACY: icon filename (migrated to icon_fallback)
  icon_image_id?: string | null; // uuid - reference to shared_images.id
  icon_fallback?: string | null; // text - fallback text/emoji icon
  category: string;            // text - entity category
  type: string;                // text - entity type
  subtype?: string;            // text - optional subtype
  tier_number: number;         // integer, 0-7 - tier level
  is_global: boolean;          // boolean - global availability
  is_schematic: boolean;       // boolean - true for schematics, false for items
  field_values: Record<string, any>; // jsonb - dynamic fields for extensibility
  created_by?: string;         // uuid - user who created
  created_at?: string;         // timestamp - creation time
  updated_at?: string;         // timestamp - last update time
}

// Tier system interface matching the tiers table
export interface Tier {
  tier_number: number;         // integer, PRIMARY KEY (0-7)
  tier_name: string;          // text - tier display name (Makeshift → Plastanium)
}

// Recipe system interface matching the recipes table
export interface Recipe {
  recipe_id: string;           // text, PRIMARY KEY - unique recipe identifier
  produces_item_id: string;    // text - references entities.item_id
  crafting_time?: number;      // integer - time in seconds
  water_amount?: number;       // integer - water required
  created_by?: string;         // uuid - user who created
  created_at?: string;         // timestamp - creation time
  updated_at?: string;         // timestamp - last update time
}

// Recipe ingredients interface matching recipe_ingredients table
export interface RecipeIngredient {
  recipe_id: string;           // text - references recipes.recipe_id
  ingredient_item_id: string;  // text - references entities.item_id
  quantity: number;            // integer - amount required
  created_at?: string;         // timestamp - creation time
  // Populated entity data
  ingredient?: Entity;
}

// Recipe outputs interface matching recipe_outputs table
export interface RecipeOutput {
  recipe_id: string;           // text - references recipes.recipe_id
  output_item_id: string;      // text - references entities.item_id
  quantity: number;            // integer - amount produced
  created_at?: string;         // timestamp - creation time
  // Populated entity data
  output?: Entity;
}

// POI-Entity linking interface matching poi_entity_links table
export interface POIEntityLink {
  poi_id: string;              // uuid - references pois.id
  entity_id: string;           // uuid - references entities.id
  quantity: number;            // integer - amount found/required
  notes?: string;              // text - optional notes
  assignment_source?: string;  // text - how link was created
  added_by?: string;           // uuid - user who created link
  added_at?: string;           // timestamp - creation time
}

// Filter interfaces for API operations
export interface EntityFilters {
  search?: string;             // Search across name, description, category, type
  category?: string;           // Filter by category
  type?: string;               // Filter by type
  subtype?: string;            // Filter by subtype
  tier_number?: number;        // Filter by tier
  is_schematic?: boolean;      // Filter items vs schematics
  is_global?: boolean;         // Filter global vs local
  created_by?: string;         // Filter by creator
  limit?: number;              // Pagination limit
  offset?: number;             // Pagination offset
}

// Response interfaces for API operations
export interface EntityResponse {
  data: Entity[];
  count: number;
  total: number;
  has_more: boolean;
}

export interface TierResponse {
  data: Tier[];
  count: number;
}

// Utility type for entity creation (omit generated fields)
export type CreateEntityData = Omit<Entity, 'id' | 'created_at' | 'updated_at'> & {
  created_by?: string;
};

// Utility type for entity updates (partial with restrictions)
export type UpdateEntityData = Partial<Omit<Entity, 'id' | 'item_id' | 'created_at' | 'created_by'>> & {
  updated_at?: string;
};

// Recipe with related data for display
export interface RecipeWithDetails extends Recipe {
  ingredients: Array<RecipeIngredient & { entity?: Entity }>;
  outputs: Array<RecipeOutput & { entity?: Entity }>;
  produces_entity?: Entity;
}

// POI link with entity details for display
export interface POIEntityLinkWithDetails extends POIEntityLink {
  entity?: Entity;
  poi?: {
    id: string;
    title: string;
    map_type: string;
  };
}

// Statistics interfaces for analytics
export interface EntityStats {
  total_entities: number;
  total_items: number;
  total_schematics: number;
  entities_by_tier: Record<number, number>;
  entities_by_category: Record<string, number>;
  entities_by_type: Record<string, number>;
}

// Constants for the tier system
export const TIER_NAMES: Record<number, string> = {
  0: 'Makeshift',
  1: 'Copper',
  2: 'Iron', 
  3: 'Steel',
  4: 'Aluminium',
  5: 'Titanium',
  6: 'Exquisite',
  7: 'Plastanium'
};

// Constants for validation
export const ENTITY_CONSTRAINTS = {
  MIN_TIER: 0,
  MAX_TIER: 7,
  MAX_NAME_LENGTH: 255,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_CATEGORY_LENGTH: 100,
  MAX_TYPE_LENGTH: 100,
  MAX_SUBTYPE_LENGTH: 100,
  MAX_NOTES_LENGTH: 500
} as const;

// Type guards for runtime type checking
export function isEntity(obj: any): obj is Entity {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.item_id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.category === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.tier_number === 'number' &&
    typeof obj.is_global === 'boolean' &&
    typeof obj.is_schematic === 'boolean' &&
    typeof obj.field_values === 'object'
  );
}

export function isTier(obj: any): obj is Tier {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.tier_number === 'number' &&
    typeof obj.tier_name === 'string' &&
    obj.tier_number >= ENTITY_CONSTRAINTS.MIN_TIER &&
    obj.tier_number <= ENTITY_CONSTRAINTS.MAX_TIER
  );
}

export function isPOIEntityLink(obj: any): obj is POIEntityLink {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.poi_id === 'string' &&
    typeof obj.entity_id === 'string' &&
    typeof obj.quantity === 'number' &&
    obj.quantity > 0
  );
} 