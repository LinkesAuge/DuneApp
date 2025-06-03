// Unified Entities API Layer
// Provides CRUD operations for the unified entities system

import { supabase } from '../supabase';
import type { 
  Entity, 
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
        .select('*, shared_images!icon_image_id(*)', { count: 'exact' });

      // Apply filters
      if (filters.search) {
        // Full-text search across multiple fields
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,category.ilike.%${filters.search}%,type.ilike.%${filters.search}%`);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.subtype) {
        query = query.eq('subtype', filters.subtype);
      }

      if (filters.tier_number !== undefined) {
        query = query.eq('tier_number', filters.tier_number);
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
      const limit = Math.min(filters.limit || 50, 100); // Max 100 items per request
      const offset = filters.offset || 0;
      query = query.range(offset, offset + limit - 1);

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
        data: data || [],
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
  async getById(id: string): Promise<Entity> {
    try {
      const { data, error } = await supabase
        .from('entities')
        .select('*, shared_images!icon_image_id(*)')
        .eq('id', id)
        .single();

      if (error) {
        handleSupabaseError(error, 'fetch entity by ID');
      }

      if (!data) {
        throw new EntityAPIError(`Entity not found with ID: ${id}`, 'NOT_FOUND');
      }

      return data;
    } catch (error) {
      if (error instanceof EntityAPIError) throw error;
      handleSupabaseError(error, 'fetch entity by ID');
    }
  },

  /**
   * Get entity by item_id (secondary identifier)
   */
  async getByItemId(itemId: string): Promise<Entity> {
    try {
      const { data, error } = await supabase
        .from('entities')
        .select('*, shared_images!icon_image_id(*)')
        .eq('item_id', itemId)
        .single();

      if (error) {
        handleSupabaseError(error, 'fetch entity by item ID');
      }

      if (!data) {
        throw new EntityAPIError(`Entity not found with item_id: ${itemId}`, 'NOT_FOUND');
      }

      return data;
    } catch (error) {
      if (error instanceof EntityAPIError) throw error;
      handleSupabaseError(error, 'fetch entity by item ID');
    }
  },

  // === WRITE OPERATIONS ===

  /**
   * Create a new entity
   */
  async create(entityData: CreateEntityData): Promise<Entity> {
    try {
      // Validate data
      if (!entityData.name?.trim()) {
        throw new EntityAPIError('Entity name is required', 'VALIDATION_ERROR');
      }

      if (!entityData.item_id?.trim()) {
        throw new EntityAPIError('Entity item_id is required', 'VALIDATION_ERROR');
      }

      if (!entityData.category?.trim()) {
        throw new EntityAPIError('Entity category is required', 'VALIDATION_ERROR');
      }

      if (!entityData.type?.trim()) {
        throw new EntityAPIError('Entity type is required', 'VALIDATION_ERROR');
      }

      if (entityData.tier_number < ENTITY_CONSTRAINTS.MIN_TIER || 
          entityData.tier_number > ENTITY_CONSTRAINTS.MAX_TIER) {
        throw new EntityAPIError(
          `Tier number must be between ${ENTITY_CONSTRAINTS.MIN_TIER} and ${ENTITY_CONSTRAINTS.MAX_TIER}`,
          'VALIDATION_ERROR'
        );
      }

      const { data, error } = await supabase
        .from('entities')
        .insert([{
          ...entityData,
          field_values: entityData.field_values || {}
        }])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'create entity');
      }

      return data;
    } catch (error) {
      if (error instanceof EntityAPIError) throw error;
      handleSupabaseError(error, 'create entity');
    }
  },

  /**
   * Update an existing entity
   */
  async update(id: string, updates: UpdateEntityData): Promise<Entity> {
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

      const { data, error } = await supabase
        .from('entities')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'update entity');
      }

      if (!data) {
        throw new EntityAPIError(`Entity not found with ID: ${id}`, 'NOT_FOUND');
      }

      return data;
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
   * Get entities by category
   */
  async getByCategory(category: string, filters: Omit<EntityFilters, 'category'> = {}): Promise<Entity[]> {
    try {
      const response = await this.getAll({ ...filters, category });
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
   * Get all unique categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('entities')
        .select('category')
        .not('category', 'is', null);

      if (error) {
        handleSupabaseError(error, 'fetch categories');
      }

      const categories = Array.from(new Set(
        (data || []).map(item => item.category).filter(Boolean)
      )).sort();

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
        .from('entities')
        .select('type')
        .not('type', 'is', null);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        handleSupabaseError(error, 'fetch types');
      }

      const types = Array.from(new Set(
        (data || []).map(item => item.type).filter(Boolean)
      )).sort();

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
        .select('is_schematic, tier_number, category, type');

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
        if (entity.category) {
          entitiesByCategory[entity.category] = (entitiesByCategory[entity.category] || 0) + 1;
        }
        
        // Count by type
        if (entity.type) {
          entitiesByType[entity.type] = (entitiesByType[entity.type] || 0) + 1;
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