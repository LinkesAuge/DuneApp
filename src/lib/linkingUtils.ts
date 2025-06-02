import { supabase } from './supabase';
import { createBulkPoiItemLinks, type PoiItemLink } from './api/poiItemLinks';
import type { LinkingStats, LinkingValidation } from '../hooks/useLinkingState';

export interface LinkCreationOptions {
  linkType?: 'found_here' | 'crafted_here' | 'required_for' | 'material_source';
  defaultQuantity?: number;
  notes?: string;
  batchSize?: number;
  onProgress?: (progress: number, current: number, total: number) => void;
}

export interface LinkCreationResult {
  success: boolean;
  created: number;
  failed: number;
  errors: string[];
  duplicatesSkipped?: number;
  totalProcessed: number;
}

export interface ExistingLinkInfo {
  poiId: string;
  itemId?: string;
  schematicId?: string;
  entityType: 'item' | 'schematic';
  linkId: string;
}

/**
 * Creates POI-Item/Schematic links in bulk with progress tracking
 */
export async function createPoiItemLinks(
  selectedPoiIds: Set<string>,
  selectedItemIds: Set<string>,
  selectedSchematicIds: Set<string>,
  options: LinkCreationOptions = {}
): Promise<LinkCreationResult> {
  const {
    linkType = 'found_here',
    defaultQuantity = 1,
    notes = '',
    batchSize = 25,
    onProgress
  } = options;

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      success: false,
      created: 0,
      failed: 0,
      errors: ['User not authenticated'],
      totalProcessed: 0
    };
  }

  // Generate all link combinations
  const linksToCreate: Omit<PoiItemLink, 'id' | 'created_at' | 'updated_at' | 'updated_by'>[] = [];
  
  // POI-Item links
  for (const poiId of selectedPoiIds) {
    for (const itemId of selectedItemIds) {
      linksToCreate.push({
        poi_id: poiId,
        item_id: itemId,
        schematic_id: null,
        link_type: linkType,
        quantity: defaultQuantity,
        notes: notes || null,
        created_by: user.id
      });
    }
  }

  // POI-Schematic links
  for (const poiId of selectedPoiIds) {
    for (const schematicId of selectedSchematicIds) {
      linksToCreate.push({
        poi_id: poiId,
        item_id: null,
        schematic_id: schematicId,
        link_type: linkType,
        quantity: defaultQuantity,
        notes: notes || null,
        created_by: user.id
      });
    }
  }

  const totalLinks = linksToCreate.length;
  
  if (totalLinks === 0) {
    return {
      success: false,
      created: 0,
      failed: 0,
      errors: ['No valid link combinations found'],
      totalProcessed: 0
    };
  }

  // Check for existing links to avoid duplicates
  const existingLinks = await checkExistingLinks(selectedPoiIds, selectedItemIds, selectedSchematicIds);
  const existingLinkKeys = new Set(
    existingLinks.map(link => 
      `${link.poiId}-${link.itemId || link.schematicId}-${link.entityType}`
    )
  );

  // Filter out existing links
  const newLinksToCreate = linksToCreate.filter(link => {
    const linkKey = `${link.poi_id}-${link.item_id || link.schematic_id}-${link.item_id ? 'item' : 'schematic'}`;
    return !existingLinkKeys.has(linkKey);
  });

  const duplicatesSkipped = totalLinks - newLinksToCreate.length;

  if (newLinksToCreate.length === 0) {
    return {
      success: true,
      created: 0,
      failed: 0,
      errors: [],
      duplicatesSkipped,
      totalProcessed: totalLinks
    };
  }

  // Process links in batches
  let created = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < newLinksToCreate.length; i += batchSize) {
    const batch = newLinksToCreate.slice(i, i + batchSize);
    
    try {
      const createdLinks = await createBulkPoiItemLinks(batch);
      if (createdLinks && Array.isArray(createdLinks)) {
        created += createdLinks.length;
      } else {
        failed += batch.length;
        errors.push(`Batch ${Math.floor(i / batchSize) + 1} failed: No links returned`);
      }
    } catch (error) {
      failed += batch.length;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Batch ${Math.floor(i / batchSize) + 1} error: ${errorMessage}`);
      console.error('Batch creation error:', error);
    }

    // Report progress
    const processed = Math.min(i + batchSize, newLinksToCreate.length);
    onProgress?.(
      (processed / newLinksToCreate.length) * 100,
      processed,
      newLinksToCreate.length
    );
  }

  return {
    success: created > 0,
    created,
    failed,
    errors,
    duplicatesSkipped,
    totalProcessed: totalLinks
  };
}

/**
 * Check for existing links to avoid duplicates
 */
export async function checkExistingLinks(
  poiIds: Set<string>,
  itemIds: Set<string>,
  schematicIds: Set<string>
): Promise<ExistingLinkInfo[]> {
  const existingLinks: ExistingLinkInfo[] = [];

  try {
    // Check POI-Item links
    if (poiIds.size > 0 && itemIds.size > 0) {
      const { data: itemLinks, error: itemError } = await supabase
        .from('poi_item_links')
        .select('id, poi_id, item_id')
        .in('poi_id', Array.from(poiIds))
        .in('item_id', Array.from(itemIds))
        .not('item_id', 'is', null);

      if (itemError) {
        console.error('Error checking existing item links:', itemError);
      } else if (itemLinks) {
        existingLinks.push(...itemLinks.map(link => ({
          poiId: link.poi_id,
          itemId: link.item_id,
          entityType: 'item' as const,
          linkId: link.id
        })));
      }
    }

    // Check POI-Schematic links
    if (poiIds.size > 0 && schematicIds.size > 0) {
      const { data: schematicLinks, error: schematicError } = await supabase
        .from('poi_item_links')
        .select('id, poi_id, schematic_id')
        .in('poi_id', Array.from(poiIds))
        .in('schematic_id', Array.from(schematicIds))
        .not('schematic_id', 'is', null);

      if (schematicError) {
        console.error('Error checking existing schematic links:', schematicError);
      } else if (schematicLinks) {
        existingLinks.push(...schematicLinks.map(link => ({
          poiId: link.poi_id,
          schematicId: link.schematic_id,
          entityType: 'schematic' as const,
          linkId: link.id
        })));
      }
    }
  } catch (error) {
    console.error('Error checking existing links:', error);
  }

  return existingLinks;
}

/**
 * Validates selection state and returns detailed validation info
 */
export function validateLinkingSelections(
  stats: LinkingStats,
  options: {
    minPois?: number;
    minItems?: number;
    minSchematics?: number;
    maxTotalLinks?: number;
    warnThreshold?: number;
  } = {}
): LinkingValidation {
  const {
    minPois = 1,
    minItems = 0,
    minSchematics = 0,
    maxTotalLinks = 1000,
    warnThreshold = 100
  } = options;

  const errors: string[] = [];
  const warnings: string[] = [];

  // Validation checks
  if (stats.selectedPois < minPois) {
    errors.push(`At least ${minPois} POI${minPois > 1 ? 's' : ''} must be selected`);
  }

  if (stats.totalEntitySelections === 0) {
    errors.push('At least one item or schematic must be selected');
  }

  if (minItems > 0 && stats.selectedItems < minItems) {
    errors.push(`At least ${minItems} item${minItems > 1 ? 's' : ''} must be selected`);
  }

  if (minSchematics > 0 && stats.selectedSchematics < minSchematics) {
    errors.push(`At least ${minSchematics} schematic${minSchematics > 1 ? 's' : ''} must be selected`);
  }

  if (stats.totalPossibleLinks > maxTotalLinks) {
    errors.push(`Too many links would be created (${stats.totalPossibleLinks}). Maximum allowed: ${maxTotalLinks}`);
  }

  // Warning checks
  if (stats.totalPossibleLinks > warnThreshold) {
    warnings.push(`This will create ${stats.totalPossibleLinks} links. Consider reducing selections for better performance.`);
  }

  if (stats.selectedPois > 20) {
    warnings.push('Large number of POIs selected. Consider filtering to be more specific.');
  }

  if (stats.totalEntitySelections > 50) {
    warnings.push('Large number of items/schematics selected. Consider filtering to be more specific.');
  }

  const isValid = errors.length === 0;
  const canCreateLinks = isValid && stats.totalPossibleLinks > 0;

  return {
    isValid,
    errors,
    warnings,
    canCreateLinks
  };
}

/**
 * Formats linking statistics for display
 */
export function formatLinkingStats(stats: LinkingStats): {
  summary: string;
  details: string[];
  cartesianProduct: string;
} {
  const summary = `${stats.selectedPois} POIs × ${stats.totalEntitySelections} Items/Schematics = ${stats.totalPossibleLinks} Links`;
  
  const details: string[] = [];
  if (stats.selectedPois > 0) {
    details.push(`${stats.selectedPois} POI${stats.selectedPois > 1 ? 's' : ''} selected`);
  }
  if (stats.selectedItems > 0) {
    details.push(`${stats.selectedItems} item${stats.selectedItems > 1 ? 's' : ''} selected`);
  }
  if (stats.selectedSchematics > 0) {
    details.push(`${stats.selectedSchematics} schematic${stats.selectedSchematics > 1 ? 's' : ''} selected`);
  }

  const cartesianProduct = stats.totalPossibleLinks > 0 
    ? `Will create ${stats.totalPossibleLinks} link${stats.totalPossibleLinks > 1 ? 's' : ''}`
    : 'No links will be created';

  return {
    summary,
    details,
    cartesianProduct
  };
}

/**
 * Generates URL with pre-selected entities for linking
 */
export function generateLinkingUrl(
  baseUrl: string,
  poiIds?: string[],
  itemIds?: string[],
  schematicIds?: string[]
): string {
  const params = new URLSearchParams();

  if (poiIds && poiIds.length > 0) {
    params.set('poi_ids', poiIds.join(','));
  }

  if (itemIds && itemIds.length > 0) {
    params.set('item_ids', itemIds.join(','));
  }

  if (schematicIds && schematicIds.length > 0) {
    params.set('schematic_ids', schematicIds.join(','));
  }

  const paramString = params.toString();
  return paramString ? `${baseUrl}?${paramString}` : baseUrl;
}

/**
 * Parses URL parameters for entity pre-selection
 */
export function parseLinkingParams(search: string): {
  poiIds: string[];
  itemIds: string[];
  schematicIds: string[];
} {
  const params = new URLSearchParams(search);
  
  return {
    poiIds: params.get('poi_ids')?.split(',').filter(Boolean) || [],
    itemIds: params.get('item_ids')?.split(',').filter(Boolean) || [],
    schematicIds: params.get('schematic_ids')?.split(',').filter(Boolean) || []
  };
} 