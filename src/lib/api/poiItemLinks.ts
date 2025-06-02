import { supabase } from '../supabase';
import type { 
  PoiItemLink, 
  PoiWithItems, 
  ItemWithLocations, 
  SchematicWithLocations,
  PoiLocationInfo,
  MaterialRequirement,
  RecipeInfo,
  PoiItemStats,
  PoiSearchWithItems
} from '../../types';

// ==========================================
// POI-Item Link CRUD Operations
// ==========================================

// Create a new POI-Item link
export async function createPoiItemLink(link: Omit<PoiItemLink, 'id' | 'created_at' | 'updated_at' | 'updated_by'>) {
  const { data, error } = await supabase
    .from('poi_item_links')
    .insert({
      poi_id: link.poi_id,
      item_id: link.item_id,
      schematic_id: link.schematic_id,
      link_type: link.link_type,
      quantity: link.quantity,
      notes: link.notes,
      created_by: link.created_by
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as PoiItemLink;
}

// Get POI-Item links with optional filtering
export async function getPoiItemLinks(filters?: {
  poi_id?: string;
  item_id?: string;
  schematic_id?: string;
  link_type?: string;
  created_by?: string;
}) {
  let query = supabase.from('poi_item_links').select('*');

  if (filters) {
    if (filters.poi_id) query = query.eq('poi_id', filters.poi_id);
    if (filters.item_id) query = query.eq('item_id', filters.item_id);
    if (filters.schematic_id) query = query.eq('schematic_id', filters.schematic_id);
    if (filters.link_type) query = query.eq('link_type', filters.link_type);
    if (filters.created_by) query = query.eq('created_by', filters.created_by);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data as PoiItemLink[];
}

// Update a POI-Item link
export async function updatePoiItemLink(
  id: string, 
  updates: Partial<Pick<PoiItemLink, 'link_type' | 'quantity' | 'notes'>>,
  updated_by: string
) {
  const { data, error } = await supabase
    .from('poi_item_links')
    .update({
      ...updates,
      updated_by,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as PoiItemLink;
}

// Delete a POI-Item link
export async function deletePoiItemLink(id: string) {
  const { error } = await supabase
    .from('poi_item_links')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ==========================================
// POI with Items Integration
// ==========================================

// Get POI with all linked items and schematics
export async function getPoiWithItems(poi_id: string): Promise<PoiWithItems | null> {
  // First get the POI
  const { data: poi, error: poiError } = await supabase
    .from('pois')
    .select('*')
    .eq('id', poi_id)
    .single();

  if (poiError) throw poiError;
  if (!poi) return null;

  // Get all links for this POI
  const { data: links, error: linksError } = await supabase
    .from('poi_item_links')
    .select(`
      *,
      item:items(*),
      schematic:schematics(*)
    `)
    .eq('poi_id', poi_id);

  if (linksError) throw linksError;

  // Separate items and schematics
  const linked_items = links
    ?.filter(link => link.item)
    .map(link => link.item) || [];
  
  const linked_schematics = links
    ?.filter(link => link.schematic)
    .map(link => link.schematic) || [];

  return {
    ...poi,
    linked_items,
    linked_schematics,
    item_links: links || []
  } as PoiWithItems;
}

// Get all POIs with their linked items (for map display)
export async function getPoisWithItems(filters?: PoiSearchWithItems) {
  let query = supabase
    .from('pois')
    .select(`
      *,
      poi_item_links(
        *,
        item:items(*),
        schematic:schematics(*)
      )
    `);

  // Apply filters
  if (filters) {
    if (filters.text_search) {
      query = query.or(`title.ilike.%${filters.text_search}%,description.ilike.%${filters.text_search}%`);
    }
    if (filters.poi_type_ids && filters.poi_type_ids.length > 0) {
      query = query.in('poi_type_id', filters.poi_type_ids);
    }
    if (filters.map_type) {
      query = query.eq('map_type', filters.map_type);
    }
  }

  const { data, error } = await query;

  if (error) throw error;

  // Transform data to include proper linked items
  return data?.map(poi => ({
    ...poi,
    linked_items: poi.poi_item_links?.filter(link => link.item).map(link => link.item) || [],
    linked_schematics: poi.poi_item_links?.filter(link => link.schematic).map(link => link.schematic) || [],
    item_links: poi.poi_item_links || []
  })) as PoiWithItems[];
}

// ==========================================
// Item/Schematic Location Integration
// ==========================================

// Get item with all POI locations
export async function getItemWithLocations(item_id: string): Promise<ItemWithLocations | null> {
  // Get the item with all relations
  const { data: item, error: itemError } = await supabase
    .from('items')
    .select(`
      *,
      category:categories(*),
      type:types(*),
      subtype:subtypes(*),
      tier:tiers(*),
      screenshots:item_screenshots(*)
    `)
    .eq('id', item_id)
    .single();

  if (itemError) throw itemError;
  if (!item) return null;

  // Get POI locations for this item
  const { data: links, error: linksError } = await supabase
    .from('poi_item_links')
    .select(`
      *,
      poi:pois(
        *,
        poi_type:poi_types(*)
      )
    `)
    .eq('item_id', item_id);

  if (linksError) throw linksError;

  // Transform to location info
  const poi_locations: PoiLocationInfo[] = links?.map(link => ({
    poi_id: link.poi.id,
    poi_title: link.poi.title,
    poi_type: link.poi.poi_type,
    map_type: link.poi.map_type,
    coordinate: link.poi.grid_square_id, // For Deep Desert
    coordinates_x: link.poi.coordinates_x,
    coordinates_y: link.poi.coordinates_y,
    link_type: link.link_type as 'found_here' | 'crafted_here',
    quantity: link.quantity,
    notes: link.notes
  })) || [];

  // Separate found and crafting locations
  const found_locations = poi_locations.filter(loc => loc.link_type === 'found_here');
  const crafting_locations = poi_locations.filter(loc => loc.link_type === 'crafted_here');

  return {
    ...item,
    poi_locations: found_locations,
    crafting_locations
  } as ItemWithLocations;
}

// Get schematic with locations and recipe requirements
export async function getSchematicWithLocations(schematic_id: string): Promise<SchematicWithLocations | null> {
  // Get the schematic with all relations
  const { data: schematic, error: schematicError } = await supabase
    .from('schematics')
    .select(`
      *,
      category:categories(*),
      type:types(*),
      subtype:subtypes(*),
      tier:tiers(*),
      screenshots:schematic_screenshots(*)
    `)
    .eq('id', schematic_id)
    .single();

  if (schematicError) throw schematicError;
  if (!schematic) return null;

  // Get POI locations for this schematic
  const { data: links, error: linksError } = await supabase
    .from('poi_item_links')
    .select(`
      *,
      poi:pois(
        *,
        poi_type:poi_types(*)
      )
    `)
    .eq('schematic_id', schematic_id);

  if (linksError) throw linksError;

  // Transform to location info
  const poi_locations: PoiLocationInfo[] = links?.map(link => ({
    poi_id: link.poi.id,
    poi_title: link.poi.title,
    poi_type: link.poi.poi_type,
    map_type: link.poi.map_type,
    coordinate: link.poi.grid_square_id,
    coordinates_x: link.poi.coordinates_x,
    coordinates_y: link.poi.coordinates_y,
    link_type: link.link_type as 'found_here' | 'crafted_here',
    quantity: link.quantity,
    notes: link.notes
  })) || [];

  // Separate found and crafting locations
  const found_locations = poi_locations.filter(loc => loc.link_type === 'found_here');
  const crafting_locations = poi_locations.filter(loc => loc.link_type === 'crafted_here');

  // TODO: Get required materials from recipe system (future enhancement)
  const required_materials: MaterialRequirement[] = [];

  return {
    ...schematic,
    poi_locations: found_locations,
    crafting_locations,
    required_materials
  } as SchematicWithLocations;
}

// ==========================================
// Recipe Information
// ==========================================

// Get complete recipe information for a schematic
export async function getRecipeInfo(schematic_id: string): Promise<RecipeInfo | null> {
  // Get schematic with locations
  const schematicWithLocations = await getSchematicWithLocations(schematic_id);
  if (!schematicWithLocations) return null;

  // TODO: Implement recipe requirements parsing from field_values
  // This would extract recipe information from the schematic's field_values
  const required_materials: MaterialRequirement[] = [];
  
  // Calculate completion stats
  const total_materials = required_materials.length;
  const materials_with_known_locations = required_materials.filter(
    material => material.available_locations && material.available_locations.length > 0
  ).length;
  
  const completion_percentage = total_materials > 0 
    ? Math.round((materials_with_known_locations / total_materials) * 100)
    : 100;

  return {
    schematic_id,
    required_materials,
    crafting_locations: schematicWithLocations.crafting_locations || [],
    total_materials,
    materials_with_known_locations,
    completion_percentage
  };
}

// ==========================================
// Statistics and Analytics
// ==========================================

// Get POI-Item integration statistics
export async function getPoiItemStats(): Promise<PoiItemStats> {
  // Get total links count
  const { count: total_poi_item_links } = await supabase
    .from('poi_item_links')
    .select('*', { count: 'exact' });

  // Get POIs with items count
  const { data: poisWithItems } = await supabase
    .from('poi_item_links')
    .select('poi_id', { count: 'exact' })
    .distinct();

  // Get items with locations count
  const { data: itemsWithLocations } = await supabase
    .from('poi_item_links')
    .select('item_id', { count: 'exact' })
    .not('item_id', 'is', null)
    .distinct();

  // Get schematics with locations count
  const { data: schematicsWithLocations } = await supabase
    .from('poi_item_links')
    .select('schematic_id', { count: 'exact' })
    .not('schematic_id', 'is', null)
    .distinct();

  // Get link types breakdown
  const { data: linkTypes } = await supabase
    .from('poi_item_links')
    .select('link_type')
    .then(({ data }) => data || []);

  const link_types_count = {
    found_here: linkTypes.filter(l => l.link_type === 'found_here').length,
    crafted_here: linkTypes.filter(l => l.link_type === 'crafted_here').length,
    required_for: linkTypes.filter(l => l.link_type === 'required_for').length,
    material_source: linkTypes.filter(l => l.link_type === 'material_source').length
  };

  return {
    total_poi_item_links: total_poi_item_links || 0,
    pois_with_items: poisWithItems?.length || 0,
    items_with_locations: itemsWithLocations?.length || 0,
    schematics_with_locations: schematicsWithLocations?.length || 0,
    completed_recipes: 0, // TODO: Calculate based on recipe completion
    link_types_count
  };
}

// ==========================================
// Bulk Operations
// ==========================================

// Create multiple POI-Item links at once
export async function createBulkPoiItemLinks(links: Omit<PoiItemLink, 'id' | 'created_at' | 'updated_at' | 'updated_by'>[]) {
  const { data, error } = await supabase
    .from('poi_item_links')
    .insert(links)
    .select('*');

  if (error) throw error;
  return data as PoiItemLink[];
}

// Delete multiple POI-Item links
export async function deleteBulkPoiItemLinks(link_ids: string[]) {
  const { error } = await supabase
    .from('poi_item_links')
    .delete()
    .in('id', link_ids);

  if (error) throw error;
} 