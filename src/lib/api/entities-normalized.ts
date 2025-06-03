import { supabase } from '../supabase';
import { categoryHierarchyAPI } from './categories';
import { 
  Entity, 
  EntityWithRelations, 
  EntityFilters, 
  EntityResponse,
  CreateEntityData,
  UpdateEntityData 
} from '../../types/unified-entities';

/**
 * Entities API - Updated for normalized category/type/subtype structure
 * Provides CRUD operations for unified entities with foreign key relationships
 */
  
  tier_number: number;
  is_global: boolean;
  is_schematic: boolean;
  field_values: Record<string, any>;
  icon_image_id?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

// Enhanced entity interface with hierarchy info
export interface EntityWithHierarchy extends EntityNormalized {
  category_name?: string;
  type_name?: string;
  subtype_name?: string;
  hierarchy_path?: string; // "Category > Type > Subtype"
  tier_name?: string;
  shared_image?: {
    id: string;
    image_url: string;
  };
}

// Filtering interface updated for normalized structure
export interface EntityFiltersNormalized {
  search?: string;
  category_ids?: number[];
  type_ids?: number[];
  subtype_ids?: number[];
  tier_numbers?: number[];
  is_schematic?: boolean;
  is_global?: boolean;
  created_by?: string;
  
  // Legacy support (DEPRECATED)
  categories?: string[];
  types?: string[];
  subtypes?: string[];
}

// API Error handling
class EntityAPIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'EntityAPIError';
  }
}

function handleSupabaseError(error: any, operation: string): never {
  console.error(`Entity API Error (${operation}):`, error);
  throw new EntityAPIError(
    `Failed to ${operation}: ${error.message}`,
    error.code,
    error.details
  );
}

// Helper function to build select query with hierarchy
function buildSelectWithHierarchy() {
  return `
    *,
    category:categories(id, name, description, icon),
    type:types(id, name, description, icon),
    subtype:subtypes(id, name, description, icon),
    tier:tiers(tier_number, tier_name),
    shared_image:shared_images(id, image_url)
  `;
}

// Helper function to format entity with hierarchy info
function formatEntityWithHierarchy(entity: any): EntityWithHierarchy {
  if (!entity) return entity;
  
  return {
    ...entity,
    category_name: entity.category?.name,
    type_name: entity.type?.name,
    subtype_name: entity.subtype?.name,
    tier_name: entity.tier?.tier_name,
    hierarchy_path: [
      entity.category?.name,
      entity.type?.name,
      entity.subtype?.name
    ].filter(Boolean).join(' > '),
    
    // Add legacy text fields for backwards compatibility
    category: entity.category?.name,
    type: entity.type?.name,
    subtype: entity.subtype?.name
  };
}

// Main Entities API with Normalized Structure
export const entitiesNormalizedAPI = {
  /**
   * Get all entities with optional filtering and hierarchy info
   */
  async getAll(filters: EntityFiltersNormalized = {}): Promise<EntityWithHierarchy[]> {
    try {
      let query = supabase
        .from('entities')
        .select(buildSelectWithHierarchy())
        .order('name', { ascending: true });

      // Apply filters
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.category_ids?.length) {
        query = query.in('category_id', filters.category_ids);
      }

      if (filters.type_ids?.length) {
        query = query.in('type_id', filters.type_ids);
      }

      if (filters.subtype_ids?.length) {
        query = query.in('subtype_id', filters.subtype_ids);
      }

      if (filters.tier_numbers?.length) {
        query = query.in('tier_number', filters.tier_numbers);
      }

      if (filters.is_schematic !== undefined) {
        query = query.eq('is_schematic', filters.is_schematic);
      }

      if (filters.is_global !== undefined) {
        query = query.eq('is_global', filters.is_global);
      }

      if (filters.created_by) {
        query = query.eq('created_by', filters.created_by);
      }

      const { data, error } = await query;

      if (error) {
        handleSupabaseError(error, 'fetch entities');
      }

      return (data || []).map(formatEntityWithHierarchy);
    } catch (error) {
      if (error instanceof EntityAPIError) throw error;
      handleSupabaseError(error, 'fetch entities');
    }
  },

  /**
   * Get entity by ID with hierarchy info
   */
  async getById(id: string): Promise<EntityWithHierarchy | null> {
    try {
      const { data, error } = await supabase
        .from('entities')
        .select(buildSelectWithHierarchy())
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        handleSupabaseError(error, 'fetch entity by ID');
      }

      return formatEntityWithHierarchy(data);
    } catch (error) {
      if (error instanceof EntityAPIError) throw error;
      handleSupabaseError(error, 'fetch entity by ID');
    }
  },

  /**
   * Get entity by item_id with hierarchy info
   */
  async getByItemId(itemId: string): Promise<EntityWithHierarchy | null> {
    try {
      const { data, error } = await supabase
        .from('entities')
        .select(buildSelectWithHierarchy())
        .eq('item_id', itemId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        handleSupabaseError(error, 'fetch entity by item_id');
      }

      return formatEntityWithHierarchy(data);
    } catch (error) {
      if (error instanceof EntityAPIError) throw error;
      handleSupabaseError(error, 'fetch entity by item_id');
    }
  },

  /**
   * Create new entity with normalized hierarchy
   */
  async create(entity: Omit<EntityNormalized, 'id' | 'created_at' | 'updated_at'>): Promise<EntityWithHierarchy> {
    try {
      // Validate that required foreign keys are provided
      if (!entity.category_id || !entity.type_id) {
        throw new EntityAPIError('category_id and type_id are required for entity creation');
      }

      // Verify hierarchy exists
      await categoryHierarchyAPI.getEntityHierarchy(
        entity.category_id, 
        entity.type_id, 
        entity.subtype_id
      );

      const { data, error } = await supabase
        .from('entities')
        .insert(entity)
        .select(buildSelectWithHierarchy())
        .single();

      if (error) {
        handleSupabaseError(error, 'create entity');
      }

      return formatEntityWithHierarchy(data);
    } catch (error) {
      if (error instanceof EntityAPIError) throw error;
      handleSupabaseError(error, 'create entity');
    }
  },

  /**
   * Update entity with hierarchy validation
   */
  async update(id: string, updates: Partial<Omit<EntityNormalized, 'id' | 'created_at' | 'updated_at'>>): Promise<EntityWithHierarchy> {
    try {
      // If hierarchy fields are being updated, validate them
      if (updates.category_id || updates.type_id || updates.subtype_id !== undefined) {
        // Get current entity to fill in missing hierarchy fields
        const currentEntity = await this.getById(id);
        if (!currentEntity) {
          throw new EntityAPIError('Entity not found for update');
        }

        const categoryId = updates.category_id || currentEntity.category_id;
        const typeId = updates.type_id || currentEntity.type_id;
        const subtypeId = updates.subtype_id !== undefined ? updates.subtype_id : currentEntity.subtype_id;

        // Verify hierarchy exists
        await categoryHierarchyAPI.getEntityHierarchy(categoryId, typeId, subtypeId);
      }

      const { data, error } = await supabase
        .from('entities')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(buildSelectWithHierarchy())
        .single();

      if (error) {
        handleSupabaseError(error, 'update entity');
      }

      return formatEntityWithHierarchy(data);
    } catch (error) {
      if (error instanceof EntityAPIError) throw error;
      handleSupabaseError(error, 'update entity');
    }
  },

  /**
   * Delete entity
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('entities')
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'delete entity');
      }
    } catch (error) {
      if (error instanceof EntityAPIError) throw error;
      handleSupabaseError(error, 'delete entity');
    }
  },

  /**
   * Search entities by text with hierarchy info
   */
  async search(query: string): Promise<EntityWithHierarchy[]> {
    return this.getAll({ search: query });
  },

  /**
   * Get entities by category ID
   */
  async getByCategory(categoryId: number): Promise<EntityWithHierarchy[]> {
    return this.getAll({ category_ids: [categoryId] });
  },

  /**
   * Get entities by type ID
   */
  async getByType(typeId: number): Promise<EntityWithHierarchy[]> {
    return this.getAll({ type_ids: [typeId] });
  },

  /**
   * Get entities by tier number
   */
  async getByTier(tierNumber: number): Promise<EntityWithHierarchy[]> {
    return this.getAll({ tier_numbers: [tierNumber] });
  },

  /**
   * Get items only (is_schematic = false)
   */
  async getItems(filters: EntityFiltersNormalized = {}): Promise<EntityWithHierarchy[]> {
    return this.getAll({ ...filters, is_schematic: false });
  },

  /**
   * Get schematics only (is_schematic = true)
   */
  async getSchematics(filters: EntityFiltersNormalized = {}): Promise<EntityWithHierarchy[]> {
    return this.getAll({ ...filters, is_schematic: true });
  },

  /**
   * Get unique category/type/subtype combinations for filtering UI
   */
  async getFilterOptions(): Promise<{
    categories: Array<{id: number, name: string, count: number}>;
    types: Array<{id: number, name: string, category_id: number, count: number}>;
    subtypes: Array<{id: number, name: string, type_id: number, count: number}>;
    tiers: Array<{tier_number: number, tier_name: string, count: number}>;
  }> {
    try {
      // Get category counts
      const { data: categoryData, error: categoryError } = await supabase
        .from('entities')
        .select('category_id, category:categories(id, name)')
        .not('category_id', 'is', null);

      if (categoryError) {
        handleSupabaseError(categoryError, 'fetch category options');
      }

      // Get type counts
      const { data: typeData, error: typeError } = await supabase
        .from('entities')
        .select('type_id, category_id, type:types(id, name, category_id)')
        .not('type_id', 'is', null);

      if (typeError) {
        handleSupabaseError(typeError, 'fetch type options');
      }

      // Get subtype counts
      const { data: subtypeData, error: subtypeError } = await supabase
        .from('entities')
        .select('subtype_id, type_id, subtype:subtypes(id, name, type_id)')
        .not('subtype_id', 'is', null);

      if (subtypeError) {
        handleSupabaseError(subtypeError, 'fetch subtype options');
      }

      // Get tier counts
      const { data: tierData, error: tierError } = await supabase
        .from('entities')
        .select('tier_number, tier:tiers(tier_number, tier_name)')
        .not('tier_number', 'is', null);

      if (tierError) {
        handleSupabaseError(tierError, 'fetch tier options');
      }

      // Process counts
      const categoryMap = new Map();
      categoryData?.forEach(item => {
        if (item.category) {
          const key = item.category.id;
          categoryMap.set(key, {
            id: item.category.id,
            name: item.category.name,
            count: (categoryMap.get(key)?.count || 0) + 1
          });
        }
      });

      const typeMap = new Map();
      typeData?.forEach(item => {
        if (item.type) {
          const key = item.type.id;
          typeMap.set(key, {
            id: item.type.id,
            name: item.type.name,
            category_id: item.type.category_id,
            count: (typeMap.get(key)?.count || 0) + 1
          });
        }
      });

      const subtypeMap = new Map();
      subtypeData?.forEach(item => {
        if (item.subtype) {
          const key = item.subtype.id;
          subtypeMap.set(key, {
            id: item.subtype.id,
            name: item.subtype.name,
            type_id: item.subtype.type_id,
            count: (subtypeMap.get(key)?.count || 0) + 1
          });
        }
      });

      const tierMap = new Map();
      tierData?.forEach(item => {
        if (item.tier) {
          const key = item.tier.tier_number;
          tierMap.set(key, {
            tier_number: item.tier.tier_number,
            tier_name: item.tier.tier_name,
            count: (tierMap.get(key)?.count || 0) + 1
          });
        }
      });

      return {
        categories: Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
        types: Array.from(typeMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
        subtypes: Array.from(subtypeMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
        tiers: Array.from(tierMap.values()).sort((a, b) => a.tier_number - b.tier_number)
      };
    } catch (error) {
      if (error instanceof EntityAPIError) throw error;
      handleSupabaseError(error, 'fetch filter options');
    }
  }
}; 