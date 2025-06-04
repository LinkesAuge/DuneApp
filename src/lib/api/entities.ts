// Unified Entities API Layer - NORMALIZED VERSION
// Provides CRUD operations for the unified entities system with foreign key relationships

import { supabase } from '../supabase';
import type { 
  Entity, 
  EntityWithRelations,
  Category,
  Type,
  Subtype,
  Tier, 
  Recipe,
  RecipeIngredient,
  RecipeOutput,
  POIEntityLink,
  EntityFilters,
  EntityResponse,
  TierResponse,
  CreateEntityData,
  UpdateEntityData,
  RecipeWithDetails,
  POIEntityLinkWithDetails,
  EntityStats,
  ENTITY_CONSTRAINTS
} from '../../types/unified-entities';
// Note: Legacy category hierarchy validation removed in unified system
// import { categoryHierarchyAPI } from './categories';

// Error handling utilities
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

// Helper function to build select query with relationships
function buildSelectWithRelations() {
  return `
    *,
          category:categories(id, name, icon, sort_order),
      type:types(id, name, icon, sort_order, category_id),
      subtype:subtypes(id, name, icon, sort_order, type_id),
    shared_image:shared_images(id, image_url)
  `;
}

// Helper function to format entity with relationships
function formatEntityWithRelations(entity: any): EntityWithRelations {
  if (!entity) return entity;
  
  return {
    ...entity,
    category: entity.category || undefined,
    type: entity.type || undefined,
    subtype: entity.subtype || undefined
  };
}

// Main entities API
export const entitiesAPI = {
  // === READ OPERATIONS ===

  /**
   * Get all entities with optional filtering and pagination
   */
  async getAll(filters: EntityFilters = {}): Promise<EntityResponse> {
    try {
      let query = supabase
        .from('entities')
        .select(buildSelectWithRelations(), { count: 'exact' });

      // Apply filters using NORMALIZED foreign key structure
      if (filters.search) {
        // Full-text search across entity name and description only
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters.category_ids?.length) {
        query = query.in('category_id', filters.category_ids);
      }

      if (filters.type_id) {
        query = query.eq('type_id', filters.type_id);
      }

      if (filters.type_ids?.length) {
        query = query.in('type_id', filters.type_ids);
      }

      if (filters.subtype_id) {
        query = query.eq('subtype_id', filters.subtype_id);
      }

      if (filters.subtype_ids?.length) {
        query = query.in('subtype_id', filters.subtype_ids);
      }

      if (filters.tier_number !== undefined) {
        query = query.eq('tier_number', filters.tier_number);
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

      // Apply pagination
      const limit = filters.limit || 10000; // Default to 10000 items (no practical limit)
      const offset = filters.offset || 0;
      
      // Only apply range if we have a reasonable limit
      if (limit < 10000) {
        query = query.range(offset, offset + limit - 1);
      }

      // Default ordering by name
      query = query.order('name', { ascending: true });

      const { data, error, count } = await query;

      if (error) {
        handleSupabaseError(error, 'fetch entities');
      }

      const total = count || 0;
      const returnedCount = data?.length || 0;
      const hasMore = (offset + returnedCount) < total;

      return {
        data: (data || []).map(formatEntityWithRelations),
        count: returnedCount,
        total,
        has_more: hasMore
      };
    } catch (error) {
      if (error instanceof EntityAPIError) throw error;
      handleSupabaseError(error, 'fetch entities');
    }
  },

  /**
   * Get entity by ID
   */
  async getById(id: string): Promise<EntityWithRelations | null> {
    try {
      const { data, error } = await supabase
        .from('entities')
        .select(buildSelectWithRelations())
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        handleSupabaseError(error, 'fetch entity by ID');
      }

      if (!data) {
        return null;
      }

      return formatEntityWithRelations(data);
    } catch (error) {
      if (error instanceof EntityAPIError) throw error;
      handleSupabaseError(error, 'fetch entity by ID');
    }
  },

  /**
   * Get entity by item_id (secondary identifier)
   */
  async getByItemId(itemId: string): Promise<EntityWithRelations | null> {
    try {
      const { data, error } = await supabase
        .from('entities')
        .select(buildSelectWithRelations())
        .eq('item_id', itemId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        handleSupabaseError(error, 'fetch entity by item ID');
      }

      if (!data) {
        return null;
      }

      return formatEntityWithRelations(data);
    } catch (error) {
      if (error instanceof EntityAPIError) throw error;
      handleSupabaseError(error, 'fetch entity by item ID');
    }
  },

  // === WRITE OPERATIONS ===

  /**
   * Create a new entity
   */
  async create(entityData: CreateEntityData): Promise<EntityWithRelations> {
    try {
      // Validate data using NORMALIZED structure
      if (!entityData.name?.trim()) {
        throw new EntityAPIError('Entity name is required', 'VALIDATION_ERROR');
      }

      if (!entityData.item_id?.trim()) {
        throw new EntityAPIError('Entity item_id is required', 'VALIDATION_ERROR');
      }

      if (!entityData.category_id) {
        throw new EntityAPIError('Entity category_id is required', 'VALIDATION_ERROR');
      }

      if (!entityData.type_id) {
        throw new EntityAPIError('Entity type_id is required', 'VALIDATION_ERROR');
      }

      if (entityData.tier_number < ENTITY_CONSTRAINTS.MIN_TIER || 
          entityData.tier_number > ENTITY_CONSTRAINTS.MAX_TIER) {
        throw new EntityAPIError(
          `Tier number must be between ${ENTITY_CONSTRAINTS.MIN_TIER} and ${ENTITY_CONSTRAINTS.MAX_TIER}`,
          'VALIDATION_ERROR'
        );
      }

      // Validation for foreign key relationships
      // Note: Additional validation could be added here to verify foreign keys exist

      const { data, error } = await supabase
        .from('entities')
        .insert([{
          ...entityData,
          field_values: entityData.field_values || {}
        }])
        .select(buildSelectWithRelations())
        .single();

      if (error) {
        handleSupabaseError(error, 'create entity');
      }

      return formatEntityWithRelations(data);
    } catch (error) {
      if (error instanceof EntityAPIError) throw error;
      handleSupabaseError(error, 'create entity');
    }
  },

  /**
   * Update an existing entity
   */
  async update(id: string, updates: UpdateEntityData): Promise<EntityWithRelations> {
    try {
      // Validate tier if provided
      if (updates.tier_number !== undefined && 
          (updates.tier_number < ENTITY_CONSTRAINTS.MIN_TIER || 
           updates.tier_number > ENTITY_CONSTRAINTS.MAX_TIER)) {
        throw new EntityAPIError(
          `Tier number must be between ${ENTITY_CONSTRAINTS.MIN_TIER} and ${ENTITY_CONSTRAINTS.MAX_TIER}`,
          'VALIDATION_ERROR'
        );
      }

      // Validation for foreign key relationships
      // Note: Additional validation could be added here to verify foreign keys exist

      const { data, error } = await supabase
        .from('entities')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(buildSelectWithRelations())
        .single();

      if (error) {
        handleSupabaseError(error, 'update entity');
      }

      if (!data) {
        throw new EntityAPIError(`Entity not found with ID: ${id}`, 'NOT_FOUND');
      }

      return formatEntityWithRelations(data);
    } catch (error) {
      if (error instanceof EntityAPIError) throw error;
      handleSupabaseError(error, 'update entity');
    }
  },

  /**
   * Delete an entity
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

  // === SEARCH AND FILTERING ===

  /**
   * Search entities with advanced text search
   */
  async search(query: string, filters: Omit<EntityFilters, 'search'> = {}): Promise<Entity[]> {
    try {
      const response = await this.getAll({ ...filters, search: query });
      return response.data;
    } catch (error) {
      if (error instanceof EntityAPIError) throw error;
      handleSupabaseError(error, 'search entities');
    }
  },

  /**
   * Get entities by category (using category name)
   */
  async getByCategory(categoryName: string, filters: Omit<EntityFilters, 'category_id'> = {}): Promise<Entity[]> {
    try {
      // First get the category ID
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', categoryName)
        .single();

      if (categoryError || !categoryData) {
        return []; // Category not found
      }

      const response = await this.getAll({ ...filters, category_id: categoryData.id });
      return response.data;
    } catch (error) {
      if (error instanceof EntityAPIError) throw error;
      handleSupabaseError(error, 'fetch entities by category');
    }
  },

  /**
   * Get entities by tier
   */
  async getByTier(tierNumber: number, filters: Omit<EntityFilters, 'tier_number'> = {}): Promise<Entity[]> {
    try {
      const response = await this.getAll({ ...filters, tier_number: tierNumber });
      return response.data;
    } catch (error) {
      if (error instanceof EntityAPIError) throw error;
      handleSupabaseError(error, 'fetch entities by tier');
    }
  },

  // === UTILITY FUNCTIONS ===

  /**
   * Get all tiers
   */
  async getTiers(): Promise<Tier[]> {
    try {
      const { data, error } = await supabase
        .from('tiers')
        .select('*')
        .order('tier_number', { ascending: true });

      if (error) {
        handleSupabaseError(error, 'fetch tiers');
      }

      return data || [];
    } catch (error) {
      if (error instanceof EntityAPIError) throw error;
      handleSupabaseError(error, 'fetch tiers');
    }
  },

  /**
   * Get all unique categories (from the categories table via foreign keys)
   */
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .order('name', { ascending: true });

      if (error) {
        handleSupabaseError(error, 'fetch categories');
      }

      const categories = (data || []).map(item => item.name).filter(Boolean);
      return categories;
    } catch (error) {
      if (error instanceof EntityAPIError) throw error;
      handleSupabaseError(error, 'fetch categories');
    }
  },

  /**
   * Get all types, optionally filtered by category
   */
  async getTypes(category?: string): Promise<string[]> {
    try {
      let query = supabase
        .from('types')
        .select('name')
        .order('name', { ascending: true });

      if (category) {
        // First get the category ID
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', category)
          .single();

        if (categoryError || !categoryData) {
          // If category not found, return empty array
          return [];
        }

        query = query.eq('category_id', categoryData.id);
      }

      const { data, error } = await query;

      if (error) {
        handleSupabaseError(error, 'fetch types');
      }

      const types = (data || []).map(item => item.name).filter(Boolean);
      return types;
    } catch (error) {
      if (error instanceof EntityAPIError) throw error;
      handleSupabaseError(error, 'fetch types');
    }
  },

  /**
   * Get entity statistics
   */
  async getStats(): Promise<EntityStats> {
    try {
      const { data, error } = await supabase
        .from('entities')
        .select(`
          is_schematic, 
          tier_number, 
          category:categories(name),
          type:types(name)
        `);

      if (error) {
        handleSupabaseError(error, 'fetch entity statistics');
      }

      const entities = data || [];
      const items = entities.filter(e => !e.is_schematic);
      const schematics = entities.filter(e => e.is_schematic);

      const entitiesByTier: Record<number, number> = {};
      const entitiesByCategory: Record<string, number> = {};
      const entitiesByType: Record<string, number> = {};

      entities.forEach(entity => {
        // Count by tier
        entitiesByTier[entity.tier_number] = (entitiesByTier[entity.tier_number] || 0) + 1;
        
        // Count by category
        if (entity.category?.name) {
          entitiesByCategory[entity.category.name] = (entitiesByCategory[entity.category.name] || 0) + 1;
        }
        
        // Count by type
        if (entity.type?.name) {
          entitiesByType[entity.type.name] = (entitiesByType[entity.type.name] || 0) + 1;
        }
      });

      return {
        total_entities: entities.length,
        total_items: items.length,
        total_schematics: schematics.length,
        entities_by_tier: entitiesByTier,
        entities_by_category: entitiesByCategory,
        entities_by_type: entitiesByType
      };
    } catch (error) {
      if (error instanceof EntityAPIError) throw error;
      handleSupabaseError(error, 'fetch entity statistics');
    }
  }
};

// Export error class for external use
export { EntityAPIError }; 