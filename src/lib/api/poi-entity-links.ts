// POI Entity Links API Layer
// Provides CRUD operations for linking entities to POIs

import { supabase } from '../supabase';
import type { 
  POIEntityLink, 
  POIEntityLinkWithDetails,
  Entity 
} from '../../types/unified-entities';

// Error handling utilities
class POIEntityLinkAPIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'POIEntityLinkAPIError';
  }
}

function handleSupabaseError(error: any, operation: string): never {
  console.error(`POI Entity Link API Error (${operation}):`, error);
  throw new POIEntityLinkAPIError(
    `Failed to ${operation}: ${error.message}`,
    error.code,
    error.details
  );
}

// Helper function to format entity with relationships (same as entities.ts)
function formatEntityWithRelations(entity: any) {
  if (!entity) return entity;
  
  // For now, return entity as-is since we're not loading relationships in the query
  // The relationships will be resolved by the frontend components
  return entity;
}

// Interface for creating new POI-entity links
export interface CreatePOIEntityLinkData {
  poi_id: string;
  entity_id: string;
}

// Interface for updating existing POI-entity links
export interface UpdatePOIEntityLinkData {
  // Currently no updatable fields besides audit trail
  // Future: could add notes, tags, etc.
}

// Interface for bulk linking operations
export interface BulkLinkData {
  poi_id: string;
  entity_links: Array<{
    entity_id: string;
  }>;
}

// Main POI Entity Links API
export const poiEntityLinksAPI = {
  // === CREATE OPERATIONS ===

  /**
   * Link an entity to a POI
   */
  async linkEntityToPOI(linkData: CreatePOIEntityLinkData, userId?: string): Promise<POIEntityLink> {
    try {
      // Validate required fields
      if (!linkData.poi_id?.trim()) {
        throw new POIEntityLinkAPIError('POI ID is required', 'VALIDATION_ERROR');
      }

      if (!linkData.entity_id?.trim()) {
        throw new POIEntityLinkAPIError('Entity ID is required', 'VALIDATION_ERROR');
      }

      // Check if link already exists
      const { data: existing } = await supabase
        .from('poi_entity_links')
        .select('*')
        .eq('poi_id', linkData.poi_id)
        .eq('entity_id', linkData.entity_id)
        .maybeSingle();

      if (existing) {
        throw new POIEntityLinkAPIError(
          'This entity is already linked to this POI. Use update operation instead.',
          'DUPLICATE_LINK'
        );
      }

      const { data, error } = await supabase
        .from('poi_entity_links')
        .insert([{
          poi_id: linkData.poi_id,
          entity_id: linkData.entity_id,
          added_by: userId,
          added_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'create POI entity link');
      }

      return data;
    } catch (error) {
      if (error instanceof POIEntityLinkAPIError) throw error;
      handleSupabaseError(error, 'create POI entity link');
    }
  },

  /**
   * Bulk link multiple entities to a POI
   */
  async bulkLinkEntitiesToPOI(bulkData: BulkLinkData, userId?: string): Promise<POIEntityLink[]> {
    try {
      if (!bulkData.poi_id?.trim()) {
        throw new POIEntityLinkAPIError('POI ID is required', 'VALIDATION_ERROR');
      }

      if (!bulkData.entity_links?.length) {
        throw new POIEntityLinkAPIError('At least one entity link is required', 'VALIDATION_ERROR');
      }

      // Validate all entity links
      for (const link of bulkData.entity_links) {
        if (!link.entity_id?.trim()) {
          throw new POIEntityLinkAPIError('All entity IDs are required', 'VALIDATION_ERROR');
        }
      }

      // Check for existing links
      const entityIds = bulkData.entity_links.map(link => link.entity_id);
      const { data: existingLinks } = await supabase
        .from('poi_entity_links')
        .select('entity_id')
        .eq('poi_id', bulkData.poi_id)
        .in('entity_id', entityIds);

      if (existingLinks && existingLinks.length > 0) {
        const duplicateIds = existingLinks.map(link => link.entity_id);
        throw new POIEntityLinkAPIError(
          `Some entities are already linked to this POI: ${duplicateIds.join(', ')}`,
          'DUPLICATE_LINKS'
        );
      }

      // Prepare bulk insert data
      const insertData = bulkData.entity_links.map(link => ({
        poi_id: bulkData.poi_id,
        entity_id: link.entity_id,
        added_by: userId,
        added_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('poi_entity_links')
        .insert(insertData)
        .select();

      if (error) {
        handleSupabaseError(error, 'bulk create POI entity links');
      }

      return data || [];
    } catch (error) {
      if (error instanceof POIEntityLinkAPIError) throw error;
      handleSupabaseError(error, 'bulk create POI entity links');
    }
  },

  // === READ OPERATIONS ===

  /**
   * Get all entities linked to a specific POI
   */
  async getPOIEntityLinks(poiId: string): Promise<POIEntityLinkWithDetails[]> {
    try {
      if (!poiId?.trim()) {
        throw new POIEntityLinkAPIError('POI ID is required', 'VALIDATION_ERROR');
      }

      const { data, error } = await supabase
        .from('poi_entity_links')
        .select(`
          *,
          entities!inner (
            id,
            item_id,
            name,
            description,
            icon_image_id,
            icon_fallback,
            category_id,
            type_id,
            tier_number,
            is_schematic,
            is_global
          )
        `)
        .eq('poi_id', poiId)
        .order('added_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'fetch POI entity links');
      }

      return (data || []).map(link => ({
        ...link,
        entity: formatEntityWithRelations(link.entities)
      }));
    } catch (error) {
      if (error instanceof POIEntityLinkAPIError) throw error;
      handleSupabaseError(error, 'fetch POI entity links');
    }
  },

  /**
   * Get all POIs linked to a specific entity
   */
  async getEntityPOILinks(entityId: string): Promise<POIEntityLinkWithDetails[]> {
    try {
      if (!entityId?.trim()) {
        throw new POIEntityLinkAPIError('Entity ID is required', 'VALIDATION_ERROR');
      }

      const { data, error } = await supabase
        .from('poi_entity_links')
        .select(`
          *,
          pois!inner (
            id,
            title,
            map_type,
            coordinate,
            poi_type_id
          )
        `)
        .eq('entity_id', entityId)
        .order('added_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'fetch entity POI links');
      }

      return (data || []).map(link => ({
        ...link,
        poi: link.pois
      }));
    } catch (error) {
      if (error instanceof POIEntityLinkAPIError) throw error;
      handleSupabaseError(error, 'fetch entity POI links');
    }
  },

  /**
   * Get a specific POI-entity link
   */
  async getPOIEntityLink(poiId: string, entityId: string): Promise<POIEntityLinkWithDetails | null> {
    try {
      if (!poiId?.trim() || !entityId?.trim()) {
        throw new POIEntityLinkAPIError('Both POI ID and Entity ID are required', 'VALIDATION_ERROR');
      }

      const { data, error } = await supabase
        .from('poi_entity_links')
        .select(`
          *,
          entities!inner (
            id,
            item_id,
            name,
            description,
            icon_image_id,
            icon_fallback,
            category_id,
            type_id,
            tier_number,
            is_schematic,
            is_global
          ),
          pois!inner (
            id,
            title,
            map_type,
            coordinate,
            poi_type_id
          )
        `)
        .eq('poi_id', poiId)
        .eq('entity_id', entityId)
        .maybeSingle();

      if (error) {
        handleSupabaseError(error, 'fetch POI entity link');
      }

      if (!data) {
        return null;
      }

      return {
        ...data,
        entity: formatEntityWithRelations(data.entities),
        poi: data.pois
      };
    } catch (error) {
      if (error instanceof POIEntityLinkAPIError) throw error;
      handleSupabaseError(error, 'fetch POI entity link');
    }
  },

  // === UPDATE OPERATIONS ===

  /**
   * Update an existing POI-entity link
   */
  async updatePOIEntityLink(
    poiId: string, 
    entityId: string, 
    updates: UpdatePOIEntityLinkData
  ): Promise<POIEntityLink> {
    try {
      if (!poiId?.trim() || !entityId?.trim()) {
        throw new POIEntityLinkAPIError('Both POI ID and Entity ID are required', 'VALIDATION_ERROR');
      }

      const { data, error } = await supabase
        .from('poi_entity_links')
        .update(updates)
        .eq('poi_id', poiId)
        .eq('entity_id', entityId)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'update POI entity link');
      }

      if (!data) {
        throw new POIEntityLinkAPIError(
          `POI entity link not found: POI ${poiId}, Entity ${entityId}`,
          'NOT_FOUND'
        );
      }

      return data;
    } catch (error) {
      if (error instanceof POIEntityLinkAPIError) throw error;
      handleSupabaseError(error, 'update POI entity link');
    }
  },

  // === DELETE OPERATIONS ===

  /**
   * Remove a POI-entity link
   */
  async unlinkEntityFromPOI(poiId: string, entityId: string): Promise<void> {
    try {
      if (!poiId?.trim() || !entityId?.trim()) {
        throw new POIEntityLinkAPIError('Both POI ID and Entity ID are required', 'VALIDATION_ERROR');
      }

      const { error } = await supabase
        .from('poi_entity_links')
        .delete()
        .eq('poi_id', poiId)
        .eq('entity_id', entityId);

      if (error) {
        handleSupabaseError(error, 'remove POI entity link');
      }
    } catch (error) {
      if (error instanceof POIEntityLinkAPIError) throw error;
      handleSupabaseError(error, 'remove POI entity link');
    }
  },

  /**
   * Remove all entity links from a POI
   */
  async removeAllPOIEntityLinks(poiId: string): Promise<void> {
    try {
      if (!poiId?.trim()) {
        throw new POIEntityLinkAPIError('POI ID is required', 'VALIDATION_ERROR');
      }

      const { error } = await supabase
        .from('poi_entity_links')
        .delete()
        .eq('poi_id', poiId);

      if (error) {
        handleSupabaseError(error, 'remove all POI entity links');
      }
    } catch (error) {
      if (error instanceof POIEntityLinkAPIError) throw error;
      handleSupabaseError(error, 'remove all POI entity links');
    }
  },

  /**
   * Remove all POI links from an entity
   */
  async removeAllEntityPOILinks(entityId: string): Promise<void> {
    try {
      if (!entityId?.trim()) {
        throw new POIEntityLinkAPIError('Entity ID is required', 'VALIDATION_ERROR');
      }

      const { error } = await supabase
        .from('poi_entity_links')
        .delete()
        .eq('entity_id', entityId);

      if (error) {
        handleSupabaseError(error, 'remove all entity POI links');
      }
    } catch (error) {
      if (error instanceof POIEntityLinkAPIError) throw error;
      handleSupabaseError(error, 'remove all entity POI links');
    }
  },

  // === UTILITY FUNCTIONS ===

  /**
   * Get POI entity link statistics
   */
  async getPOIEntityLinkStats(): Promise<{
    total_links: number;
    pois_with_links: number;
    entities_with_links: number;
    most_linked_entity: { entity_id: string; entity_name: string; link_count: number } | null;
    most_linked_poi: { poi_id: string; poi_title: string; link_count: number } | null;
  }> {
    try {
      // Get total links count
      const { count: totalLinks } = await supabase
        .from('poi_entity_links')
        .select('*', { count: 'exact', head: true });

      // Get unique POIs with links
      const { data: poisData } = await supabase
        .from('poi_entity_links')
        .select('poi_id')
        .group('poi_id');

      // Get unique entities with links  
      const { data: entitiesData } = await supabase
        .from('poi_entity_links')
        .select('entity_id')
        .group('entity_id');

      // Get most linked entity
      const { data: entityStats } = await supabase
        .rpc('get_most_linked_entity');

      // Get most linked POI
      const { data: poiStats } = await supabase
        .rpc('get_most_linked_poi');

      return {
        total_links: totalLinks || 0,
        pois_with_links: poisData?.length || 0,
        entities_with_links: entitiesData?.length || 0,
        most_linked_entity: entityStats || null,
        most_linked_poi: poiStats || null
      };
    } catch (error) {
      // Don't throw on stats errors, return default values
      console.warn('Failed to fetch POI entity link stats:', error);
      return {
        total_links: 0,
        pois_with_links: 0,
        entities_with_links: 0,
        most_linked_entity: null,
        most_linked_poi: null
      };
    }
  }
};

// Export error class for external use
export { POIEntityLinkAPIError };

/**
 * Get POI with all linked entities (compatible with legacy PoiWithItems interface)
 * This function bridges the old items/schematics system with the new unified entities system
 */
export async function getPoiWithEntities(poiId: string): Promise<any> {
  try {
    // Get the POI first
    const { data: poi, error: poiError } = await supabase
      .from('pois')
      .select('*')
      .eq('id', poiId)
      .single();

    if (poiError) throw poiError;
    if (!poi) return null;

    // Get all linked entities for this POI
    const entityLinks = await poiEntityLinksAPI.getPOIEntityLinks(poiId);

    // Get tier names from the database
    const { data: tiers, error: tiersError } = await supabase
      .from('tiers')
      .select('tier_number, tier_name');

    const tierMap = new Map();
    if (!tiersError && tiers) {
      tiers.forEach(tier => {
        tierMap.set(tier.tier_number, { 
          name: tier.tier_name, 
          color: '#fbbf24' // Default amber color for all tiers
        });
      });
    }

    // Helper function to get tier info
    const getTierInfo = (tierNumber: number) => {
      return tierMap.get(tierNumber) || { 
        name: `Tier ${tierNumber}`, 
        color: '#fbbf24' 
      };
    };

    // Separate items and schematics for legacy compatibility
    const linked_items = entityLinks
      ?.filter(link => link.entity && !link.entity.is_schematic)
      .map(link => ({
        ...link.entity,
        // Map to legacy item structure
        icon_url: null, // Will be handled by ImagePreview component
        category: { name: link.entity.category?.name || 'Unknown' },
        type: { name: link.entity.type?.name || 'Unknown' },
        tier: link.entity.tier_number > 0 ? getTierInfo(link.entity.tier_number) : null,
        field_values: {} // No custom fields in unified system yet
      })) || [];
    
    const linked_schematics = entityLinks
      ?.filter(link => link.entity && link.entity.is_schematic)
      .map(link => ({
        ...link.entity,
        // Map to legacy schematic structure
        icon_url: null, // Will be handled by ImagePreview component
        category: { name: link.entity.category?.name || 'Unknown' },
        type: { name: link.entity.type?.name || 'Unknown' },
        tier: link.entity.tier_number > 0 ? getTierInfo(link.entity.tier_number) : null,
        field_values: {} // No custom fields in unified system yet
      })) || [];

    return {
      ...poi,
      linked_items,
      linked_schematics,
      item_links: entityLinks || []
    };
  } catch (error) {
    console.error('Error fetching POI with entities:', error);
    throw error;
  }
} 