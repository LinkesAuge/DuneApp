import { POI, Entity } from './index';

// Core tree structure for displaying POI-entity relationships
export interface POILinkTreeNode {
  poi: POI;
  entities: EntityLinkNode[];
  expanded: boolean;
  totalLinks: number;
}

// Individual entity link within a POI
export interface EntityLinkNode {
  entity: Entity;
  poi_id: string; // composite key part 1
  entity_id: string; // composite key part 2
  added_at: string;
  added_by: string;
  updated_by?: string;
  updated_at?: string;
}

// Filters specific to POI Link Manager
export interface POILinkFilters {
  search: string;
  mapType: 'hagga_basin' | 'deep_desert' | 'both';
  poiCategories: string[];
  entityTypes: string[];
  entityCategories: string[];
  entityTiers: string[];
  dateRange: [Date, Date] | null;
  createdBy: string[];
}

// Tree selection state management
export interface TreeSelectionState {
  selectedItems: Set<string>; // "poi:123" or "link:456"
  selectionMode: boolean;
  
  // Selection operations
  togglePOI: (poiId: string, entityLinkIds: string[]) => void;
  toggleLink: (linkId: string) => void;
  toggleAll: (poiLinks: POILinkTreeNode[]) => void;
  clearAll: () => void;
  
  // Getters
  getSelectedPOIs: () => string[];
  getSelectedLinks: () => string[];
  getSelectionSummary: () => SelectionSummary;
}

// Summary of current selection for bulk operations
export interface SelectionSummary {
  totalLinks: number;
  poisAffected: number;
  entityBreakdown: Record<string, number>; // entity name -> count
  selectedItems: {
    pois: string[];
    links: string[];
  };
}

// Pagination state for tree view
export interface TreePaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// Sorting options for POI links
export interface POISortingState {
  field: 'poi_created_at' | 'poi_title' | 'link_count' | 'latest_link';
  direction: 'asc' | 'desc';
}

// Database query result structure
export interface POILinkQueryResult {
  // POI fields
  poi_id: string;
  poi_title: string;
  poi_description?: string;
  poi_created_at: string;
  poi_type_id: string;
  poi_map_type: 'hagga_basin' | 'deep_desert';
  
  // Entity fields
  entity_id: string;
  entity_name: string;
  entity_icon: string;
  entity_category: string;
  entity_type: string;
  entity_tier_number: number;
  
  // Link fields
  link_added_at: string;
  link_added_by: string;
  link_updated_by?: string;
  link_updated_at?: string;
}

// Hook return interface
export interface UsePOILinksReturn {
  // Data
  poiLinks: POILinkTreeNode[];
  loading: boolean;
  error: string | null;
  
  // Pagination
  pagination: TreePaginationState;
  
  // Sorting
  sorting: POISortingState;
  
  // Filtering
  filters: POILinkFilters;
  
  // Totals
  totalCount: number;
  filteredCount: number;
  
  // Actions
  deleteLink: (poi_id: string, entity_id: string) => Promise<void>;
  bulkDeleteLinks: (links: Array<{poi_id: string; entity_id: string}>) => Promise<void>;
  bulkDeletePOIs: (poiIds: string[]) => Promise<void>;
  refreshData: () => void;
  
  // State setters
  setPage: (page: number) => void;
  setSorting: (sorting: POISortingState) => void;
  setFilters: (filters: Partial<POILinkFilters>) => void;
}

// Expand/collapse state management
export interface TreeExpandState {
  expandedPOIs: Set<string>;
  togglePOI: (poiId: string) => void;
  expandAll: (poiIds: string[]) => void;
  collapseAll: () => void;
  isExpanded: (poiId: string) => boolean;
}

// Delete operation types
export type DeleteOperationType = 'single_link' | 'bulk_links' | 'poi_all_links';

export interface DeleteConfirmation {
  type: DeleteOperationType;
  summary: string;
  affectedItems: {
    pois: number;
    links: number;
    entities: string[];
  };
} 