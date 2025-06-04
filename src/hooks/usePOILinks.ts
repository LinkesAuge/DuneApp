import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { 
  POILinkTreeNode, 
  EntityLinkNode, 
  POILinkFilters, 
  POISortingState, 
  TreePaginationState, 
  POILinkQueryResult,
  UsePOILinksReturn 
} from '../types/poi-link-manager';
import { POI, Entity } from '../types';
import { useAuth } from '../components/auth/AuthProvider';

// Default filter state
const defaultFilters: POILinkFilters = {
  search: '',
  mapType: 'both',
  poiCategories: [],
  entityTypes: [],
  entityCategories: [],
  entityTiers: [],
  dateRange: null,
  createdBy: []
};

// Default sorting state (latest POI link creation first)
const defaultSorting: POISortingState = {
  field: 'poi_created_at',
  direction: 'desc'
};

// Default pagination state
const defaultPagination: TreePaginationState = {
  currentPage: 1,
  pageSize: 50,
  totalItems: 0,
  totalPages: 0
};

export const usePOILinks = (): UsePOILinksReturn => {
  const { user } = useAuth();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<POILinkQueryResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  
  // Filter, sorting, and pagination state
  const [filters, setFiltersState] = useState<POILinkFilters>(defaultFilters);
  const [sorting, setSortingState] = useState<POISortingState>(defaultSorting);
  const [pagination, setPaginationState] = useState<TreePaginationState>(defaultPagination);

  // Fetch data manually using separate queries and combine
  const fetchDataManually = useCallback(async () => {
    console.log('Fetching POI links manually...');
    
    // Step 1: Get the link records
    const { data: links, error: linksError } = await supabase
      .from('poi_entity_links')
      .select('*')
      .range(0, 49); // First 50 for testing
    
    if (linksError) {
      console.error('Error fetching links:', linksError);
      throw linksError;
    }
    
    console.log('Step 1: Got', links?.length, 'link records');
    
    if (!links || links.length === 0) {
      return [];
    }
    
    // Step 2: Get unique POI IDs and fetch POIs
    const poiIds = [...new Set(links.map(link => link.poi_id))];
    console.log('Step 2: Fetching', poiIds.length, 'unique POIs');
    
    const { data: pois, error: poisError } = await supabase
      .from('pois')
      .select('id, title, description, created_at, poi_type_id, map_type')
      .in('id', poiIds);
    
    if (poisError) {
      console.error('Error fetching POIs:', poisError);
      throw poisError;
    }
    
    console.log('Step 2: Got', pois?.length, 'POI records');
    
    // Step 3: Get unique entity IDs and fetch entities
    const entityIds = [...new Set(links.map(link => link.entity_id))];
    console.log('Step 3: Fetching', entityIds.length, 'unique entities');
    
    const { data: entities, error: entitiesError } = await supabase
      .from('entities')
      .select('id, name, icon_fallback, icon_image_id, category_id, type_id, tier_number, is_schematic')
      .in('id', entityIds);
    
    if (entitiesError) {
      console.error('Error fetching entities:', entitiesError);
      throw entitiesError;
    }
    
    console.log('Step 3: Got', entities?.length, 'entity records');
    
    // Step 4: Create lookup maps
    const poiMap = new Map(pois?.map(poi => [poi.id, poi]) || []);
    const entityMap = new Map(entities?.map(entity => [entity.id, entity]) || []);
    
    // Step 5: Combine the data
    const combinedData = links.map(link => ({
      ...link,
      pois: poiMap.get(link.poi_id),
      entities: entityMap.get(link.entity_id)
    }));
    
    const validLinks = combinedData.filter(link => link.pois && link.entities);
    const invalidLinks = combinedData.filter(link => !link.pois || !link.entities);
    
    console.log('Step 5: Combined data - Valid:', validLinks.length, 'Invalid:', invalidLinks.length);
    
    if (invalidLinks.length > 0) {
      console.warn('Invalid links found:', invalidLinks);
    }
    
    return validLinks;
  }, []);

  // Build the database query with all JOINs (keeping as backup)
  const buildQuery = useCallback(() => {
    let query = supabase
      .from('poi_entity_links')
      .select(`
        *,
        pois!inner (
          id,
          title,
          description,
          created_at,
          poi_type_id,
          map_type
        ),
        entities!inner (
          id,
          name,
          icon_fallback,
          icon_image_id,
          category_id,
          type_id,
          tier_number,
          is_schematic
        )
      `);

    return query;
  }, []);

  // Apply filters to the query
  const applyFilters = useCallback((query: any) => {
    // Map type filter
    if (filters.mapType !== 'both') {
      query = query.eq('pois.map_type', filters.mapType);
    }

    // Search filter (POI title/description or entity name)
    if (filters.search.trim()) {
      const searchTerm = filters.search.trim();
      query = query.or(
        `pois.title.ilike.%${searchTerm}%,pois.description.ilike.%${searchTerm}%,entities.name.ilike.%${searchTerm}%`
      );
    }

    // POI categories filter - temporarily disabled until poi_types relationship is fixed
    // if (filters.poiCategories.length > 0) {
    //   query = query.in('pois.poi_types.category', filters.poiCategories);
    // }

    // Entity categories filter
    if (filters.entityCategories.length > 0) {
      query = query.in('entities.category', filters.entityCategories);
    }

    // Entity types filter
    if (filters.entityTypes.length > 0) {
      query = query.in('entities.type', filters.entityTypes);
    }

    // Entity tiers filter
    if (filters.entityTiers.length > 0) {
      query = query.in('entities.tier_number', filters.entityTiers);
    }

    // Date range filter
    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange;
      query = query
        .gte('added_at', startDate.toISOString())
        .lte('added_at', endDate.toISOString());
    }

    // Created by filter
    if (filters.createdBy.length > 0) {
      query = query.in('added_by', filters.createdBy);
    }

    return query;
  }, [filters]);

  // Apply sorting to the query
  const applySorting = useCallback((query: any) => {
    // Simple sorting by link creation date for now
    return query.order('added_at', { ascending: sorting.direction === 'asc' });
  }, [sorting]);

  // Transform raw query results into tree structure
  const transformToTreeNodes = useCallback((data: any[]): POILinkTreeNode[] => {
    console.log('Raw POI links data count:', data?.length || 0);
    console.log('First few raw records:', data?.slice(0, 2));
    
    if (!data || data.length === 0) {
      return [];
    }

    // Group data by POI
    const poiMap = new Map<string, POILinkTreeNode>();

    data.forEach((link, index) => {
      // Handle missing data gracefully - this indicates orphaned links
      if (!link.pois || !link.entities) {
        console.warn(`Record ${index}: Skipping orphaned link - POI or entity no longer exists`, {
          poi_id: link.poi_id,
          entity_id: link.entity_id,
          has_poi: !!link.pois,
          has_entity: !!link.entities
        });
        return;
      }

      const poiId = link.poi_id;
      
      // Get or create POI tree node
      if (!poiMap.has(poiId)) {
        poiMap.set(poiId, {
          poi: {
            id: link.pois.id,
            title: link.pois.title,
            description: link.pois.description,
            created_at: link.pois.created_at,
            poi_type_id: link.pois.poi_type_id,
            map_type: link.pois.map_type
          } as POI,
          entities: [],
          expanded: true, // Default expanded as per requirements
          totalLinks: 0
        });
      }

      // Create EntityLinkNode
      const entityLink: EntityLinkNode = {
        entity: {
          id: link.entities.id,
          name: link.entities.name,
          icon: link.entities.icon_fallback || '🔍',
          icon_image_id: link.entities.icon_image_id,
          entity_class: link.entities.is_schematic ? 'Schematic' : 'Item',
          category_id: link.entities.category_id,
          type_id: link.entities.type_id,
          tier_number: link.entities.tier_number
        } as Entity,
        poi_id: link.poi_id,
        entity_id: link.entity_id,
        added_at: link.added_at,
        added_by: link.added_by,
        updated_by: link.updated_by,
        updated_at: link.updated_at
      };

      const poiNode = poiMap.get(poiId)!;
      poiNode.entities.push(entityLink);
      poiNode.totalLinks = poiNode.entities.length;
    });

    return Array.from(poiMap.values());
  }, []);

  // Fetch POI links data
  const fetchPOILinks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use manual fetch instead of JOIN query for now
      const data = await fetchDataManually();

      console.log('Manual fetch returned', data?.length, 'valid records');
      if (data && data.length > 0) {
        console.log('Sample record structure:', data[0]);
      }

      setRawData(data || []);
      
      // For now, set total count to the manual fetch count
      setTotalCount(data?.length || 0);
      setFilteredCount(data?.length || 0);
      
      // Update pagination total pages
      setPaginationState(prev => ({
        ...prev,
        totalItems: data?.length || 0,
        totalPages: Math.ceil((data?.length || 0) / prev.pageSize)
      }));

    } catch (err) {
      console.error('Error fetching POI links:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch POI links');
    } finally {
      setLoading(false);
    }
  }, [fetchDataManually]);

  // Transform raw data to tree structure
  const poiLinks = useMemo(() => {
    return transformToTreeNodes(rawData);
  }, [rawData, transformToTreeNodes]);

  // Delete individual link using composite key
  const deleteLink = useCallback(async (poi_id: string, entity_id: string) => {
    try {
      const { error } = await supabase
        .from('poi_entity_links')
        .delete()
        .eq('poi_id', poi_id)
        .eq('entity_id', entity_id);

      if (error) throw error;

      // Refresh data after deletion
      await fetchPOILinks();
    } catch (err) {
      console.error('Error deleting link:', err);
      throw err;
    }
  }, [fetchPOILinks]);

  // Bulk delete links using composite keys
  const bulkDeleteLinks = useCallback(async (links: Array<{poi_id: string; entity_id: string}>) => {
    try {
      // Since we can't use .in() with composite keys, delete one by one
      for (const link of links) {
        const { error } = await supabase
          .from('poi_entity_links')
          .delete()
          .eq('poi_id', link.poi_id)
          .eq('entity_id', link.entity_id);

        if (error) throw error;
      }

      // Refresh data after deletion
      await fetchPOILinks();
    } catch (err) {
      console.error('Error bulk deleting links:', err);
      throw err;
    }
  }, [fetchPOILinks]);

  // Delete all links for specific POIs
  const bulkDeletePOIs = useCallback(async (poiIds: string[]) => {
    try {
      const { error } = await supabase
        .from('poi_entity_links')
        .delete()
        .in('poi_id', poiIds);

      if (error) throw error;

      // Refresh data after deletion
      await fetchPOILinks();
    } catch (err) {
      console.error('Error bulk deleting POI links:', err);
      throw err;
    }
  }, [fetchPOILinks]);

  // Refresh data
  const refreshData = useCallback(() => {
    fetchPOILinks();
  }, [fetchPOILinks]);

  // State setters
  const setPage = useCallback((page: number) => {
    setPaginationState(prev => ({ ...prev, currentPage: page }));
  }, []);

  const setSorting = useCallback((newSorting: POISortingState) => {
    setSortingState(newSorting);
    // Reset to first page when sorting changes
    setPaginationState(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const setFilters = useCallback((newFilters: Partial<POILinkFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    // Reset to first page when filters change
    setPaginationState(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchPOILinks();
  }, [fetchPOILinks]);

  return {
    // Data
    poiLinks,
    loading,
    error,
    
    // Pagination
    pagination,
    
    // Sorting
    sorting,
    
    // Filtering
    filters,
    
    // Totals
    totalCount,
    filteredCount,
    
    // Actions
    deleteLink,
    bulkDeleteLinks,
    bulkDeletePOIs,
    refreshData,
    
    // State setters
    setPage,
    setSorting,
    setFilters
  };
}; 