import { supabase } from '../supabase';

// ==========================================
// Types and Interfaces
// ==========================================

export interface PoiEntityLink {
  poi_id: string;
  entity_id: string;
  added_by: string;
  added_at: string;
  updated_by?: string;
  updated_at?: string;
}

export interface CreatePoiEntityLink {
  poi_id: string;
  entity_id: string;
}

export interface UpdatePoiEntityLink {
  // Currently no updatable fields besides audit trail
  // Future: could add notes, tags, etc.
}

// ==========================================
// Individual CRUD Operations
// ==========================================

// Create a single POI-Entity link
export async function createPoiEntityLink(link: CreatePoiEntityLink, added_by: string): Promise<PoiEntityLink> {
  const { data, error } = await supabase
    .from('poi_entity_links')
    .insert({
      poi_id: link.poi_id,
      entity_id: link.entity_id,
      added_by
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as PoiEntityLink;
}

// Get POI-Entity links with optional filtering
export async function getPoiEntityLinks(filters?: {
  poi_id?: string;
  entity_id?: string;
  added_by?: string;
}) {
  let query = supabase
    .from('poi_entity_links')
    .select(`
      *,
      pois(*),
      entities(*)
    `);

  if (filters?.poi_id) {
    query = query.eq('poi_id', filters.poi_id);
  }

  if (filters?.entity_id) {
    query = query.eq('entity_id', filters.entity_id);
  }

  if (filters?.added_by) {
    query = query.eq('added_by', filters.added_by);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as PoiEntityLink[];
}

// Update a POI-Entity link
export async function updatePoiEntityLink(
  poi_id: string,
  entity_id: string,
  updates: UpdatePoiEntityLink,
  updated_by: string
): Promise<PoiEntityLink> {
  const { data, error } = await supabase
    .from('poi_entity_links')
    .update({
      ...updates,
      updated_by,
      updated_at: new Date().toISOString()
    })
    .eq('poi_id', poi_id)
    .eq('entity_id', entity_id)
    .select('*')
    .single();

  if (error) throw error;
  return data as PoiEntityLink;
}

// Delete a POI-Entity link
export async function deletePoiEntityLink(poi_id: string, entity_id: string): Promise<void> {
  const { error } = await supabase
    .from('poi_entity_links')
    .delete()
    .eq('poi_id', poi_id)
    .eq('entity_id', entity_id);

  if (error) throw error;
}

// ==========================================
// Bulk Operations
// ==========================================

// Create multiple POI-Entity links at once
export async function createBulkPoiEntityLinks(
  links: Array<{
    poi_id: string;
    entity_id: string;
  }>,
  added_by: string
): Promise<PoiEntityLink[]> {
  const linksToInsert = links.map(link => ({
    poi_id: link.poi_id,
    entity_id: link.entity_id,
    added_by
  }));

  const { data, error } = await supabase
    .from('poi_entity_links')
    .insert(linksToInsert)
    .select('*');

  if (error) throw error;
  return data as PoiEntityLink[];
}

// Delete multiple POI-Entity links
export async function deleteBulkPoiEntityLinks(
  links: Array<{ poi_id: string; entity_id: string }>
): Promise<void> {
  // For bulk deletes with composite keys, we need to delete one by one
  // or use a more complex query. For now, using sequential deletes.
  for (const link of links) {
    await deletePoiEntityLink(link.poi_id, link.entity_id);
  }
}

// ==========================================
// Migration Utility Functions
// ==========================================

// Helper function to convert legacy item/schematic IDs to unified entity IDs
export async function getEntityIdFromLegacyId(itemId?: string, schematicId?: string): Promise<string | null> {
  if (!itemId && !schematicId) return null;
  
  const externalId = itemId || schematicId;
  const isSchematic = !!schematicId;

  const { data, error } = await supabase
    .from('entities')
    .select('id')
    .eq('item_id', externalId)
    .eq('is_schematic', isSchematic)
    .single();

  if (error || !data) return null;
  return data.id;
}

// Helper function to create bulk links for migration from legacy format
export async function createBulkPoiEntityLinksFromLegacy(
  legacyLinks: Array<{
    poi_id: string;
    item_id?: string;
    schematic_id?: string;
  }>,
  added_by: string
): Promise<PoiEntityLink[]> {
  const entityLinks: Array<{
    poi_id: string;
    entity_id: string;
  }> = [];

  // Convert legacy IDs to entity IDs
  for (const link of legacyLinks) {
    const entityId = await getEntityIdFromLegacyId(link.item_id, link.schematic_id);
    if (entityId) {
      entityLinks.push({
        poi_id: link.poi_id,
        entity_id: entityId
      });
    }
  }

  if (entityLinks.length === 0) {
    return [];
  }

  return createBulkPoiEntityLinks(entityLinks, added_by);
}

// ==========================================
// Statistics and Analytics
// ==========================================

// Get POI-Entity integration statistics
export async function getPoiEntityStats() {
  // Get total links count
  const { count: total_poi_entity_links } = await supabase
    .from('poi_entity_links')
    .select('*', { count: 'exact' });

  // Get POIs with entities count
  const { data: poisWithEntities } = await supabase
    .from('poi_entity_links')
    .select('poi_id')
    .distinct();

  // Get entities with locations count
  const { data: entitiesWithLocations } = await supabase
    .from('poi_entity_links')
    .select('entity_id')
    .distinct();

  // Get breakdown by entity type
  const { data: entityBreakdown } = await supabase
    .from('poi_entity_links')
    .select(`
      entity_id,
      entities!entity_id(is_schematic)
    `);

  const items_with_locations = entityBreakdown?.filter(link => !link.entities?.is_schematic).length || 0;
  const schematics_with_locations = entityBreakdown?.filter(link => link.entities?.is_schematic).length || 0;

  return {
    total_poi_entity_links: total_poi_entity_links || 0,
    pois_with_entities: poisWithEntities?.length || 0,
    entities_with_locations: entitiesWithLocations?.length || 0,
    items_with_locations,
    schematics_with_locations
  };
}

// ==========================================
// Legacy API Compatibility Functions
// ==========================================

// Get item with its POI locations (for ItemDetailPage compatibility)
export async function getItemWithLocations(itemId: string) {
  // Get the entity ID from the legacy item ID
  const { data: entity, error: entityError } = await supabase
    .from('entities')
    .select('id')
    .eq('item_id', itemId)
    .eq('is_schematic', false)
    .single();

  if (entityError || !entity) {
    return null;
  }

  // Get POI locations for this entity
  const { data: links, error: linksError } = await supabase
    .from('poi_entity_links')
    .select(`
      *,
      pois(*)
    `)
    .eq('entity_id', entity.id);

  if (linksError) {
    console.error('Error fetching POI locations:', linksError);
    return null;
  }

  return {
    entity_id: entity.id,
    poi_locations: links || []
  };
}

// Get schematic with its POI locations (for SchematicDetailPage compatibility)
export async function getSchematicWithLocations(schematicId: string) {
  // Get the entity ID from the legacy schematic ID
  const { data: entity, error: entityError } = await supabase
    .from('entities')
    .select('id')
    .eq('item_id', schematicId)
    .eq('is_schematic', true)
    .single();

  if (entityError || !entity) {
    return null;
  }

  // Get POI locations for this entity
  const { data: links, error: linksError } = await supabase
    .from('poi_entity_links')
    .select(`
      *,
      pois(*)
    `)
    .eq('entity_id', entity.id);

  if (linksError) {
    console.error('Error fetching POI locations:', linksError);
    return null;
  }

  return {
    entity_id: entity.id,
    poi_locations: links || []
  };
}

// Get POI with its linked entities (for PoiTooltip compatibility)
export async function getPoiWithItems(poiId: string) {
  const { data: links, error } = await supabase
    .from('poi_entity_links')
    .select(`
      *,
      entities(*)
    `)
    .eq('poi_id', poiId);

  if (error) {
    console.error('Error fetching POI linked entities:', error);
    return null;
  }

  return {
    poi_id: poiId,
    linked_entities: links || []
  };
} 