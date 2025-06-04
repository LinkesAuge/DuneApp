import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/auth/AuthProvider';
import { entitiesAPI } from '../lib/api/entities';
import { useTiers } from './useTiers';
import type { 
  POILinkTreeNode, 
  TreePaginationState, 
  POISortingState, 
  POILinkFilters,
  UsePOILinksReturn
} from '../types/poi-link-manager';

export const usePOILinks = (): UsePOILinksReturn => {
  const { user } = useAuth();
  const { tiers, getTierName } = useTiers();

  // Raw data state
  const [rawData, setRawData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter options data
  const [poiTypes, setPOITypes] = useState<any[]>([]);
  const [entityCategories, setEntityCategories] = useState<string[]>([]);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);

  // Default states
  const defaultPagination: TreePaginationState = {
    page: 1,
    itemsPerPage: 50,
    totalItems: 0,
    totalPages: 0
  };

  const defaultSorting: POISortingState = {
    field: 'created_at',
    direction: 'desc'
  };

  const defaultFilters: POILinkFilters = {
    search: '',
    mapType: 'both',
    poiCategories: [],
    entityCategories: [],
    entityTypes: [],
    entityTiers: [],
    dateRange: null,
    createdBy: []
  };

  // Component state
  const [pagination, setPaginationState] = useState<TreePaginationState>(defaultPagination);
  const [sorting, setSortingState] = useState<POISortingState>(defaultSorting);
  const [filters, setFiltersState] = useState<POILinkFilters>(defaultFilters);

  // Expansion state
  const [expandedPOIs, setExpandedPOIsState] = useState<Set<string>>(new Set());
  const [hasInitialized, setHasInitialized] = useState(false);

  // Fetch filter options data
  const fetchFilterOptions = useCallback(async () => {
    try {
      // Fetch POI types
      const { data: poiTypesData, error: poiTypesError } = await supabase
        .from('poi_types')
        .select('*')
        .order('category', { ascending: true });

      if (poiTypesError) throw poiTypesError;
      setPOITypes(poiTypesData || []);

      // Fetch entities for category/type options
      const entitiesResponse = await entitiesAPI.getAll({ limit: 10000 });
      const entities = entitiesResponse.data || [];
      
      // Extract categories and types from normalized structure
      const categories = [...new Set(entities
        .map(e => e.category?.name)
        .filter(c => c && typeof c === 'string')
      )].sort();
      
      const types = [...new Set(entities
        .map(e => e.type?.name)
        .filter(t => t && typeof t === 'string')
      )].sort();

      setEntityCategories(categories);
      setEntityTypes(types);

      // Initialize filters with all options selected
      setFiltersState(prev => ({
        ...prev,
        poiCategories: [...new Set(poiTypesData?.map(pt => pt.category) || [])],
        entityCategories: [...categories],
        entityTypes: [...types],
        entityTiers: tiers.map(t => t.tier_number.toString())
      }));

    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  }, [tiers]);

  // Fetch raw POI links data
  const fetchData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('poi_entity_links')
        .select(`
          poi_id,
          entity_id,
          added_at,
          added_by,
          pois!inner (
            id,
            title,
            description,
            map_type,
            poi_type_id,
            created_at,
            created_by,
            privacy_level,
            poi_types (
              id,
              name,
              category,
              icon
            ),
            profiles!pois_created_by_fkey (
              username
            )
          ),
          entities!inner (
            id,
            name,
            category_id,
            type_id,
            subtype_id,
            tier_number,
            icon,
            icon_image_id,
            created_by,
            categories (
              id,
              name
            ),
            types (
              id,
              name
            ),
            subtypes (
              id,
              name
            ),
            shared_images (
              id,
              image_url
            )
          )
        `)
        .order('added_at', { ascending: false });

      if (fetchError) throw fetchError;
      setRawData(data || []);

    } catch (err) {
      console.error('Error fetching POI links:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch POI links');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Apply filters to raw data
  const filteredData = useMemo(() => {
    if (!rawData.length) return [];

    return rawData.filter(link => {
      const poi = link.pois;
      const entity = link.entities;

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const titleMatch = poi.title?.toLowerCase().includes(searchTerm);
        const entityMatch = entity.name?.toLowerCase().includes(searchTerm);
        if (!titleMatch && !entityMatch) return false;
      }

      // Map type filter
      if (filters.mapType !== 'both') {
        if (filters.mapType === 'hagga_basin' && poi.map_type !== 'hagga_basin') return false;
        if (filters.mapType === 'deep_desert' && poi.map_type !== 'deep_desert') return false;
      }

      // POI category filter
      if (filters.poiCategories.length > 0) {
        const poiCategory = poi.poi_types?.category;
        if (!poiCategory || !filters.poiCategories.includes(poiCategory)) return false;
      }

      // Entity category filter
      if (filters.entityCategories.length > 0) {
        const entityCategory = entity.categories?.name;
        if (!entityCategory || !filters.entityCategories.includes(entityCategory)) return false;
      }

      // Entity type filter
      if (filters.entityTypes.length > 0) {
        const entityType = entity.types?.name;
        if (!entityType || !filters.entityTypes.includes(entityType)) return false;
      }

      // Entity tier filter
      if (filters.entityTiers.length > 0) {
        const tierNumber = entity.tier_number?.toString();
        if (!filters.entityTiers.includes(tierNumber)) return false;
      }

      return true;
    });
  }, [rawData, filters]);

  // Transform data to tree structure
  const transformToTreeNodes = useCallback((data: any[]): POILinkTreeNode[] => {
    // Group by POI
    const poiGroups = new Map<string, { poi: any; entities: any[] }>();

    data.forEach(link => {
      const poiId = link.poi_id;
      if (!poiGroups.has(poiId)) {
        poiGroups.set(poiId, {
          poi: link.pois,
          entities: []
        });
      }
      
      poiGroups.get(poiId)!.entities.push({
        entity: link.entities,
        linkId: `${link.poi_id}|${link.entity_id}`, // Composite key (using | to avoid UUID dash conflicts)
        created_at: link.added_at
      });
    });

    // Convert to tree nodes
    const treeNodes: POILinkTreeNode[] = Array.from(poiGroups.values()).map(group => ({
      poi: group.poi,
      entities: group.entities.sort((a, b) => 
        a.entity.name.localeCompare(b.entity.name)
      ),
      expanded: expandedPOIs.has(group.poi.id),
      totalLinks: group.entities.length
    }));

    // Apply sorting
    return treeNodes.sort((a, b) => {
      switch (sorting.field) {
        case 'title':
          return sorting.direction === 'asc' 
            ? a.poi.title.localeCompare(b.poi.title)
            : b.poi.title.localeCompare(a.poi.title);
        case 'created_at':
        default:
          const aDate = new Date(a.poi.created_at).getTime();
          const bDate = new Date(b.poi.created_at).getTime();
          return sorting.direction === 'asc' ? aDate - bDate : bDate - aDate;
      }
    });
  }, [expandedPOIs, sorting]);

  // Transform filtered data to tree structure with pagination
  const poiLinks = useMemo(() => {
    const allPOINodes = transformToTreeNodes(filteredData);
    
    // Count unique POIs for pagination
    const uniquePOIIds = new Set(filteredData.map(link => link.poi_id));
    const poiCount = uniquePOIIds.size;
    
    // Update pagination total pages based on POI count
    setPaginationState(prev => ({
      ...prev,
      totalItems: poiCount,
      totalPages: Math.ceil(poiCount / prev.itemsPerPage)
    }));

    // Apply POI-based pagination
    const startIndex = (pagination.page - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    
    return allPOINodes.slice(startIndex, endIndex);
  }, [filteredData, transformToTreeNodes, pagination.page, pagination.itemsPerPage]);

  // Auto-expand POIs on initial load
  useEffect(() => {
    if (poiLinks.length > 0 && !hasInitialized) {
      const poiIds = poiLinks.map(poiLink => poiLink.poi.id);
      setExpandedPOIsState(new Set(poiIds));
      setHasInitialized(true);
    }
  }, [poiLinks, hasInitialized]);

  // State setters
  const setPage = useCallback((page: number) => {
    setPaginationState(prev => ({ ...prev, page }));
  }, []);

  const setSorting = useCallback((newSorting: POISortingState) => {
    setSortingState(newSorting);
    setPaginationState(prev => ({ ...prev, page: 1 }));
  }, []);

  const setFilters = useCallback((newFilters: Partial<POILinkFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPaginationState(prev => ({ ...prev, page: 1 }));
  }, []);

  const setItemsPerPage = useCallback((itemsPerPage: number) => {
    setPaginationState(prev => ({ 
      ...prev, 
      itemsPerPage,
      page: 1,
      totalPages: Math.ceil(prev.totalItems / itemsPerPage)
    }));
  }, []);

  const setExpandedPOIs = useCallback((expandedSet: Set<string>) => {
    setExpandedPOIsState(expandedSet);
  }, []);

  // Initialize data
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Delete operations
  const deleteLink = useCallback(async (linkId: string) => {
    if (!user) return;

    try {
      const [poiId, entityId] = linkId.split('|');
      const { error } = await supabase
        .from('poi_entity_links')
        .delete()
        .eq('poi_id', poiId)
        .eq('entity_id', entityId);

      if (error) throw error;
      
      // Refresh data after successful deletion
      await fetchData();
    } catch (err) {
      console.error('Error deleting POI link:', err);
      throw err;
    }
  }, [user, fetchData]);

  const bulkDeleteLinks = useCallback(async (selectedItems: Set<string>) => {
    if (!user) return;

    try {
      const linkIds = Array.from(selectedItems)
        .filter(item => item.startsWith('link:'))
        .map(item => item.replace('link:', ''));

      const deletions = linkIds.map(linkId => {
        const [poiId, entityId] = linkId.split('|');
        return supabase
          .from('poi_entity_links')
          .delete()
          .eq('poi_id', poiId)
          .eq('entity_id', entityId);
      });

      const results = await Promise.all(deletions);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Failed to delete ${errors.length} links`);
      }

      // Refresh data after successful deletion
      await fetchData();
    } catch (err) {
      console.error('Error bulk deleting POI links:', err);
      throw err;
    }
  }, [user, fetchData]);

  // Calculate counts (POI-based, not link-based)
  const totalCount = new Set(rawData.map(link => link.poi_id)).size;
  const filteredCount = new Set(filteredData.map(link => link.poi_id)).size;

  return {
    poiLinks,
    loading,
    error,
    pagination,
    sorting,
    filters,
    expandedPOIs,
    totalCount,
    filteredCount,
    
    // Filter options data
    filterOptions: {
      poiTypes,
      entityCategories,
      entityTypes,
      tiers: tiers.map(t => ({ id: t.tier_number, name: getTierName(t.tier_number) }))
    },

    // Actions
    setPage,
    setSorting,
    setFilters,
    setItemsPerPage,
    setExpandedPOIs,
    refreshData: fetchData,
    deleteLink,
    bulkDeleteLinks
  };
}; 