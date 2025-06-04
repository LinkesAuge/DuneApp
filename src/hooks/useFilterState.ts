import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/auth/AuthProvider';
import { fetchPrivacyFilteredPois } from '../lib/poiPrivacy';
import type { Poi, Entity, PoiType } from '../types';
import { entitiesAPI } from '../lib/api/entities';
import { useTiers } from './useTiers';
import React from 'react';

export interface POIFilters {
  searchQuery: string;
  mapType: 'hagga' | 'deep' | 'both';
  privacyLevels: {
    public: boolean;
    private: boolean;
    shared: boolean;
  };
  selectedPoiTypes: string[];  // Individual POI type IDs
  selectedCategories: string[]; // Categories with all types selected
}

export interface EntityFilters {
  searchQuery: string;
  entityTypes: {
    items: boolean;
    schematics: boolean;
  };
  categories: {
    [category: string]: boolean;
  };
  types: {
    [type: string]: boolean;
  };
  subtypes: {
    [subtype: string]: boolean;
  };
  tiers: {
    [tier: string]: boolean;
  };
  scope: {
    global: boolean;
    custom: boolean;
  };
}

export interface FilterCounts {
  availablePOIs: number;
  availableEntities: number;
  selectedPOIs: number;
  selectedEntities: number;
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginationConfig {
  pois: PaginationState;
  entities: PaginationState;
}

export const useFilterState = () => {
  const { user } = useAuth();
  const { tiers, getTierName } = useTiers();
  
  // POI Filter State
  const [poiFilters, setPOIFilters] = useState<POIFilters>({
    searchQuery: '',
    mapType: 'both',
    privacyLevels: {
      public: true,
      private: true,
      shared: true
    },
    selectedPoiTypes: [],
    selectedCategories: []
  });

  // Entity Filter State
  const [entityFilters, setEntityFilters] = useState<EntityFilters>({
    searchQuery: '',
    entityTypes: {
      items: true,
      schematics: true
    },
    categories: {},
    types: {},
    subtypes: {},
    tiers: {},
    scope: {
      global: true,
      custom: true
    }
  });

  // Raw Data State (ALL data, no pagination)
  const [allPOIs, setAllPOIs] = useState<Poi[]>([]);
  const [allEntities, setAllEntities] = useState<Entity[]>([]);
  const [poiTypes, setPOITypes] = useState<PoiType[]>([]);
  const [entityCategories, setEntityCategories] = useState<string[]>([]);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection State
  const [selectedPOIIds, setSelectedPOIIds] = useState<Set<string>>(new Set());
  const [selectedEntityIds, setSelectedEntityIds] = useState<Set<string>>(new Set());

  // Pagination State
  const [pagination, setPagination] = useState<PaginationConfig>({
    pois: {
      currentPage: 1,
      itemsPerPage: 25,
      totalItems: 0,
      totalPages: 0
    },
    entities: {
      currentPage: 1,
      itemsPerPage: 30,
      totalItems: 0,
      totalPages: 0
    }
  });

  // Fetch POI Types
  const fetchPOITypes = useCallback(async () => {
    const { data, error } = await supabase
      .from('poi_types')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      console.error('Error fetching POI types:', error);
      return;
    }

    setPOITypes(data || []);
    
    // Initialize POI filters directly here to avoid infinite loop
    if (data && data.length > 0) {
      const allTypeIds = data.map(type => type.id);
      const allCategories = [...new Set(data.map(type => type.category))];
      
      setPOIFilters(prev => ({
        ...prev,
        selectedPoiTypes: allTypeIds,
        selectedCategories: allCategories
      }));
    }
  }, []);

  // Fetch ALL POIs (no pagination - we'll handle pagination later)
  const fetchAllPOIs = useCallback(async () => {
    try {
      // Fetch ALL POIs without pagination limit
      const data = await fetchPrivacyFilteredPois(user, 1, 10000); // Large limit to get all
      setAllPOIs(data.items);
    } catch (error) {
      console.error('Error fetching all POIs:', error);
      setAllPOIs([]);
    }
  }, [user]);

  // Fetch ALL Entities (no pagination - we'll handle pagination later)
  const fetchAllEntities = useCallback(async () => {
    try {
      // Fetch ALL entities without pagination limit
      const response = await entitiesAPI.getAll({ limit: 10000 }); // Large limit to get all
      const entitiesData = response.data;
      
      setAllEntities(entitiesData || []);
      
      // Extract unique categories and types for filtering - ensure strings only from relationships
      const categoryValues = entitiesData
        .map(e => e.category?.name)
        .filter(c => c != null && typeof c === 'string' && c.trim() !== '');
      const categories = [...new Set(categoryValues)];
      
      const typeValues = entitiesData
        .map(e => e.type?.name)
        .filter(t => t != null && typeof t === 'string' && t.trim() !== '');
      const types = [...new Set(typeValues)];
      
      // Extract subtypes - keep "None" as it's a valid database value for types without specific subtypes
      const subtypeValues = entitiesData
        .map(e => e.subtype?.name)
        .filter(s => s != null && typeof s === 'string' && s.trim() !== '');
      const subtypes = [...new Set(subtypeValues)];

      
      setEntityCategories(categories);
      setEntityTypes(types);
      
      // Initialize entity filters with all categories/types/subtypes/tiers selected
      const categoryFilters = categories.reduce((acc, category) => {
        acc[category] = true;
        return acc;
      }, {} as { [category: string]: boolean });
      
      const typeFilters = types.reduce((acc, type) => {
        acc[type] = true;
        return acc;
      }, {} as { [type: string]: boolean });
      
      const subtypeFilters = subtypes.reduce((acc, subtype) => {
        acc[subtype] = true;
        return acc;
      }, {} as { [subtype: string]: boolean });
      
      // Initialize tier filters (including all tiers, no longer excluding T69)
      const tierFilters = tiers.reduce((acc, tier) => {
        acc[tier.tier_number.toString()] = true;
        return acc;
      }, {} as { [tier: string]: boolean });
      
      setEntityFilters(prev => ({
        ...prev,
        categories: categoryFilters,
        types: typeFilters,
        subtypes: subtypeFilters,
        tiers: tierFilters
      }));
      
    } catch (error) {
      console.error('Error fetching entities:', error);
    }
  }, [tiers]);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPOITypes(),
        fetchAllPOIs(),
        fetchAllEntities()
      ]);
      setLoading(false);
    };

    initializeData();
  }, [fetchPOITypes, fetchAllPOIs, fetchAllEntities]); // Include the fetch functions in dependencies

  // Filtered POIs (now working with ALL data)
  const filteredPOIs = useMemo(() => {
    return allPOIs.filter(poi => {
      // Search query filter
      if (poiFilters.searchQuery && 
          !poi.title.toLowerCase().includes(poiFilters.searchQuery.toLowerCase()) &&
          !poi.description?.toLowerCase().includes(poiFilters.searchQuery.toLowerCase())) {
        return false;
      }

      // Map type filter
      if (poiFilters.mapType !== 'both') {
        if (poiFilters.mapType === 'hagga' && poi.map_type !== 'hagga_basin') {
          return false;
        }
        if (poiFilters.mapType === 'deep' && poi.map_type !== 'deep_desert') {
          return false;
        }
      }

      // Privacy level filter - Enhanced access control logic
      if (!user) return false; // No access for unauthenticated users

      // Check privacy level access
      if (poi.privacy_level === 'global') {
        // Public POIs: accessible to all authenticated users
        if (!poiFilters.privacyLevels.public) {
          return false;
        }
      } else if (poi.privacy_level === 'private') {
        // Private POIs: only accessible to the creator
        if (!poiFilters.privacyLevels.private) {
          return false;
        }
        if (user.id !== poi.created_by) {
          return false; // Not the creator
        }
      } else if (poi.privacy_level === 'shared') {
        // Shared POIs: accessible to creator and shared users (simplified for now)
        if (!poiFilters.privacyLevels.shared) {
          return false;
        }
        if (user.id !== poi.created_by) {
          return false; // TODO: implement poi_shares table lookup
        }
      }

      // POI type filter - Fixed to handle empty arrays correctly
      // When selectedPoiTypes is empty, hide all POIs (don't skip filtering)
      if (!poiFilters.selectedPoiTypes.includes(poi.poi_type_id)) {
        return false;
      }

      return true;
    });
  }, [allPOIs, poiFilters, user]);

  // Filtered entities with proper type checking (now working with ALL data)
  const filteredEntities = useMemo(() => {
    return allEntities.filter(entity => {
      // Search query filter
      if (entityFilters.searchQuery && 
          !entity.name.toLowerCase().includes(entityFilters.searchQuery.toLowerCase()) &&
          !entity.description?.toLowerCase().includes(entityFilters.searchQuery.toLowerCase())) {
        return false;
      }

      // Entity type filter - fix: use is_schematic field
      if (!entityFilters.entityTypes.items && !entity.is_schematic) {
        return false;
      }
      if (!entityFilters.entityTypes.schematics && entity.is_schematic) {
        return false;
      }

      // Category filter  
      if (entity.category?.name) {
        const categorySelected = entityFilters.categories[entity.category.name];
        if (categorySelected === false) {
          return false;
        }
      }

      // Type filter (new addition)
      if (entity.type?.name) {
        const typeSelected = entityFilters.types[entity.type.name];
        if (typeSelected === false) {
          return false;
        }
      }

      // Subtype filter
      if (entity.subtype?.name) {
        const subtypeSelected = entityFilters.subtypes[entity.subtype.name];
        if (subtypeSelected === false) {
          return false;
        }
      }

      // Tier filter - removed T69 exclusion, now show all tiers
      if (entity.tier_number !== null && entity.tier_number !== undefined) {
        const tierKey = entity.tier_number.toString();
        const tierSelected = entityFilters.tiers[tierKey];
        if (tierSelected === false) {
          return false;
        }
      }

      // Scope filter - assuming global entities are system entities, custom are user-created
      const isGlobal = !entity.created_by; // System entities don't have created_by
      if (!entityFilters.scope.global && isGlobal) {
        return false;
      }
      if (!entityFilters.scope.custom && !isGlobal) {
        return false;
      }

      return true;
    });
  }, [allEntities, entityFilters]);

  // Calculate pagination for filtered results
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      pois: {
        ...prev.pois,
        totalItems: filteredPOIs.length,
        totalPages: Math.ceil(filteredPOIs.length / prev.pois.itemsPerPage)
      },
      entities: {
        ...prev.entities,
        totalItems: filteredEntities.length,
        totalPages: Math.ceil(filteredEntities.length / prev.entities.itemsPerPage)
      }
    }));
  }, [filteredPOIs.length, filteredEntities.length]);

  // Get paginated POIs from filtered results
  const paginatedPOIs = useMemo(() => {
    const { currentPage, itemsPerPage } = pagination.pois;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredPOIs.slice(startIndex, endIndex);
  }, [filteredPOIs, pagination.pois.currentPage, pagination.pois.itemsPerPage]);

  // Get paginated entities from filtered results
  const paginatedEntities = useMemo(() => {
    const { currentPage, itemsPerPage } = pagination.entities;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEntities.slice(startIndex, endIndex);
  }, [filteredEntities, pagination.entities.currentPage, pagination.entities.itemsPerPage]);

  // Pagination control functions
  const changePage = useCallback((type: 'pois' | 'entities', page: number) => {
    setPagination(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        currentPage: page
      }
    }));
  }, []);

  const changeItemsPerPage = useCallback((type: 'pois' | 'entities', itemsPerPage: number) => {
    setPagination(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        itemsPerPage,
        currentPage: 1,
        totalPages: Math.ceil(prev[type].totalItems / itemsPerPage)
      }
    }));
  }, []);

  // Get unique categories from POI types
  const categories = useMemo(() => 
    [...new Set(poiTypes.map(type => type.category))], 
    [poiTypes]
  );

  // POI type toggle
  const togglePOIType = useCallback((typeId: string) => {
    setPOIFilters(prev => {
      const isCurrentlySelected = prev.selectedPoiTypes.includes(typeId);
      const newFilters = {
        ...prev,
        selectedPoiTypes: isCurrentlySelected
          ? prev.selectedPoiTypes.filter(id => id !== typeId)
          : [...prev.selectedPoiTypes, typeId]
      };
      
      // Reset pagination to page 1 when filters change
      setTimeout(() => changePage('pois', 1), 0);
      
      return newFilters;
    });
  }, [changePage]);

  // POI category toggle - syncs with selectedPoiTypes like other pages
  const togglePOICategory = useCallback((category: string, checked: boolean) => {
    const categoryTypeIds = poiTypes
      .filter(type => type.category === category)
      .map(type => type.id);

    setPOIFilters(prev => {
      let newFilters;
      
      if (checked) {
        // Add category and ensure ALL types in category are selected
        newFilters = {
          ...prev,
          selectedCategories: prev.selectedCategories.includes(category) 
            ? prev.selectedCategories 
            : [...prev.selectedCategories, category],
          selectedPoiTypes: [
            ...prev.selectedPoiTypes.filter(typeId => !categoryTypeIds.includes(typeId)),
            ...categoryTypeIds
          ]
        };
      } else {
        // Remove category and all its types
        newFilters = {
          ...prev,
          selectedCategories: prev.selectedCategories.filter(c => c !== category),
          selectedPoiTypes: prev.selectedPoiTypes.filter(typeId => !categoryTypeIds.includes(typeId))
        };
      }
      
      // Reset pagination when category filters change
      setTimeout(() => changePage('pois', 1), 0);
      
      return newFilters;
    });
  }, [poiTypes, changePage]);

  // Hide/Show All POIs toggle 
  const toggleAllPOIs = useCallback((showAll: boolean) => {
    setPOIFilters(prev => {
      if (showAll) {
        // Show all: select all types and categories
        const allTypeIds = poiTypes.map(type => type.id);
        const allCategories = [...new Set(poiTypes.map(type => type.category))];
        
        return {
          ...prev,
          selectedPoiTypes: allTypeIds,
          selectedCategories: allCategories
        };
      } else {
        // Hide all: deselect everything
        return {
          ...prev,
          selectedPoiTypes: [],
          selectedCategories: []
        };
      }
    });
    
    // Reset pagination when toggling all
    changePage('pois', 1);
  }, [poiTypes, changePage]);

  // Hide/Show All Entities toggle
  const toggleAllEntities = useCallback((showAll: boolean) => {
    const allCategories = Object.keys(entityFilters.categories);
    const allTypes = Object.keys(entityFilters.types);
    const allSubtypes = Object.keys(entityFilters.subtypes);
    const allTiers = Object.keys(entityFilters.tiers);

    if (showAll) {
      // Show all categories/types/subtypes/tiers
      const showAllCategories = allCategories.reduce((acc, category) => {
        acc[category] = true;
        return acc;
      }, {} as { [category: string]: boolean });

      const showAllTypes = allTypes.reduce((acc, type) => {
        acc[type] = true;
        return acc;
      }, {} as { [type: string]: boolean });

      const showAllSubtypes = allSubtypes.reduce((acc, subtype) => {
        acc[subtype] = true;
        return acc;
      }, {} as { [subtype: string]: boolean });

      const showAllTiers = allTiers.reduce((acc, tier) => {
        acc[tier] = true;
        return acc;
      }, {} as { [tier: string]: boolean });

      setEntityFilters(prev => ({
        ...prev,
        categories: showAllCategories,
        types: showAllTypes,
        subtypes: showAllSubtypes,
        tiers: showAllTiers
      }));
    } else {
      // Hide all categories/types/subtypes/tiers
      const hideAllCategories = allCategories.reduce((acc, category) => {
        acc[category] = false;
        return acc;
      }, {} as { [category: string]: boolean });

      const hideAllTypes = allTypes.reduce((acc, type) => {
        acc[type] = false;
        return acc;
      }, {} as { [type: string]: boolean });

      const hideAllSubtypes = allSubtypes.reduce((acc, subtype) => {
        acc[subtype] = false;
        return acc;
      }, {} as { [subtype: string]: boolean });

      const hideAllTiers = allTiers.reduce((acc, tier) => {
        acc[tier] = false;
        return acc;
      }, {} as { [tier: string]: boolean });

      setEntityFilters(prev => ({
        ...prev,
        categories: hideAllCategories,
        types: hideAllTypes,
        subtypes: hideAllSubtypes,
        tiers: hideAllTiers
      }));
    }
    
    // Reset pagination when toggling all
    changePage('entities', 1);
  }, [entityFilters.categories, entityFilters.types, entityFilters.subtypes, entityFilters.tiers, changePage]);

  // Auto-detection for Show All / Hide All states for entities
  useEffect(() => {
    const allCategoriesSelected = Object.values(entityFilters.categories).every(selected => selected);
    const allTypesSelected = Object.values(entityFilters.types).every(selected => selected);
    const allSubtypesSelected = Object.values(entityFilters.subtypes).every(selected => selected);
    const allTiersSelected = Object.values(entityFilters.tiers).every(selected => selected);

    // If all filters are selected, maintain "show all" state  
    if (allCategoriesSelected && allTypesSelected && allSubtypesSelected && allTiersSelected) {
      // Already showing all - no action needed
      return;
    }

    // If all filters are deselected, maintain "hide all" state
    const noCategoriesSelected = Object.values(entityFilters.categories).every(selected => !selected);
    const noTypesSelected = Object.values(entityFilters.types).every(selected => !selected);
    const noSubtypesSelected = Object.values(entityFilters.subtypes).every(selected => !selected);
    const noTiersSelected = Object.values(entityFilters.tiers).every(selected => !selected);

    if (noCategoriesSelected && noTypesSelected && noSubtypesSelected && noTiersSelected) {
      // Already hiding all - no action needed
      return;
    }

    // If we have mixed states, we need to ensure all filters have values
    // This prevents filters from getting "stuck" in empty states
    if (Object.keys(entityFilters.categories).length === 0 || 
        Object.keys(entityFilters.types).length === 0 || 
        Object.keys(entityFilters.subtypes).length === 0 || 
        Object.keys(entityFilters.tiers).length === 0) {
      
      // Initialize missing filter categories with "show all" default
      const showAllCategories = entityCategories.reduce((acc, category) => {
        acc[category] = entityFilters.categories[category] ?? true;
        return acc;
      }, {} as { [category: string]: boolean });

      const showAllTypes = entityTypes.reduce((acc, type) => {
        acc[type] = entityFilters.types[type] ?? true;
        return acc;
      }, {} as { [type: string]: boolean });

      const allSubtypes = [...new Set(allEntities.map(e => e.subtype?.name).filter(s => s))];
      const showAllSubtypes = allSubtypes.reduce((acc, subtype) => {
        acc[subtype] = entityFilters.subtypes[subtype] ?? true;
        return acc;
      }, {} as { [subtype: string]: boolean });

      const showAllTiers = tiers.reduce((acc, tier) => {
        const tierKey = tier.tier_number.toString();
        acc[tierKey] = entityFilters.tiers[tierKey] ?? true;
        return acc;
      }, {} as { [tier: string]: boolean });

      setEntityFilters(prev => ({
        ...prev,
        categories: showAllCategories,
        types: showAllTypes,
        subtypes: showAllSubtypes,
        tiers: showAllTiers
      }));
    }
  }, [entityFilters.categories, entityFilters.types, entityFilters.subtypes, entityFilters.tiers, entityCategories, entityTypes, allEntities, tiers]);

  // Real-time filter counts - now accurate with all data
  const filterCounts: FilterCounts = useMemo(() => ({
    availablePOIs: filteredPOIs.length,
    availableEntities: filteredEntities.length,
    selectedPOIs: selectedPOIIds.size,
    selectedEntities: selectedEntityIds.size
  }), [filteredPOIs.length, filteredEntities.length, selectedPOIIds.size, selectedEntityIds.size]);

  // Filter update functions
  const updatePOIFilters = useCallback((updates: Partial<POIFilters>) => {
    setPOIFilters(prev => ({ ...prev, ...updates }));
    // Reset to page 1 when filters change
    changePage('pois', 1);
  }, [changePage]);

  const updateEntityFilters = useCallback((updates: Partial<EntityFilters>) => {
    setEntityFilters(prev => ({ ...prev, ...updates }));
    // Reset to page 1 when filters change  
    changePage('entities', 1);
  }, [changePage]);

  // Entity category toggle
  const toggleEntityCategory = useCallback((category: string, checked: boolean) => {
    setEntityFilters(prev => {
      const newFilters = {
        ...prev,
        categories: {
          ...prev.categories,
          [category]: checked
        }
      };
      
      // Only reset pagination if this is actually changing the filter
      if (prev.categories[category] !== checked) {
        // Use setTimeout to avoid infinite loop with changePage dependency
        setTimeout(() => changePage('entities', 1), 0);
      }
      
      return newFilters;
    });
  }, [changePage]);

  // Entity type toggle (new addition)
  const toggleEntityType = useCallback((type: string, checked: boolean) => {
    setEntityFilters(prev => {
      const newFilters = {
        ...prev,
        types: {
          ...prev.types,
          [type]: checked
        }
      };
      
      if (prev.types[type] !== checked) {
        setTimeout(() => changePage('entities', 1), 0);
      }
      
      return newFilters;
    });
  }, [changePage]);

  // Entity subtype toggle
  const toggleEntitySubtype = useCallback((subtype: string, checked: boolean) => {
    setEntityFilters(prev => {
      const newFilters = {
        ...prev,
        subtypes: {
          ...prev.subtypes,
          [subtype]: checked
        }
      };
      
      if (prev.subtypes[subtype] !== checked) {
        setTimeout(() => changePage('entities', 1), 0);
      }
      
      return newFilters;
    });
  }, [changePage]);

  // Entity tier toggle
  const toggleEntityTier = useCallback((tier: string, checked: boolean) => {
    setEntityFilters(prev => {
      const newFilters = {
        ...prev,
        tiers: {
          ...prev.tiers,
          [tier]: checked
        }
      };
      
      if (prev.tiers[tier] !== checked) {
        setTimeout(() => changePage('entities', 1), 0);
      }
      
      return newFilters;
    });
  }, [changePage]);

  // Selection management
  const togglePOISelection = useCallback((poiId: string) => {
    setSelectedPOIIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(poiId)) {
        newSet.delete(poiId);
      } else {
        newSet.add(poiId);
      }
      return newSet;
    });
  }, []);

  const toggleEntitySelection = useCallback((entityId: string) => {
    setSelectedEntityIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entityId)) {
        newSet.delete(entityId);
      } else {
        newSet.add(entityId);
      }
      return newSet;
    });
  }, []);

  // Clear all selections
  const clearAllSelections = useCallback(() => {
    setSelectedPOIIds(new Set());
    setSelectedEntityIds(new Set());
  }, []);

  // Get selected POIs data (for summary panel) - fetch from all pages if needed
  const getSelectedPOIs = useCallback(async () => {
    if (selectedPOIIds.size === 0) return [];
    
    try {
      // Get all selected POIs that might be on different pages
      const selectedIds = Array.from(selectedPOIIds);
      const { data, error } = await supabase
        .from('pois')
        .select('*, poi_types (*), profiles!pois_created_by_fkey (username, display_name)')
        .in('id', selectedIds);

      if (error) {
        console.error('Error fetching selected POIs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSelectedPOIs:', error);
      return [];
    }
  }, [selectedPOIIds]);

  // Get selected entities data (for summary panel) - fetch from all pages if needed
  const getSelectedEntities = useCallback(async () => {
    if (selectedEntityIds.size === 0) return [];
    
    try {
      // Get all selected entities that might be on different pages
      const selectedIds = Array.from(selectedEntityIds);
      const { data, error } = await supabase
        .from('entities')
        .select('*, categories(name), types(name), subtypes(name)')
        .in('id', selectedIds);

      if (error) {
        console.error('Error fetching selected entities:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSelectedEntities:', error);
      return [];
    }
  }, [selectedEntityIds]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    // Reset POI filters to show all
    const allTypeIds = poiTypes.map(type => type.id);
    const allCategories = [...new Set(poiTypes.map(type => type.category))];

    setPOIFilters({
      searchQuery: '',
      mapType: 'both',
      privacyLevels: {
        public: true,
        private: true,
        shared: true
      },
      selectedPoiTypes: allTypeIds,
      selectedCategories: allCategories
    });

    // Reset entity filters (updated to include types)
    const allEntityCategories = Object.keys(entityFilters.categories).reduce((acc, category) => {
      acc[category] = true;
      return acc;
    }, {} as { [category: string]: boolean });

    const allEntityTypes = Object.keys(entityFilters.types).reduce((acc, type) => {
      acc[type] = true;
      return acc;
    }, {} as { [type: string]: boolean });

    const allEntitySubtypes = Object.keys(entityFilters.subtypes).reduce((acc, subtype) => {
      acc[subtype] = true;
      return acc;
    }, {} as { [subtype: string]: boolean });

    const allEntityTiers = Object.keys(entityFilters.tiers).reduce((acc, tier) => {
      acc[tier] = true;
      return acc;
    }, {} as { [tier: string]: boolean });

    setEntityFilters({
      searchQuery: '',
      entityTypes: {
        items: true,
        schematics: true
      },
      categories: allEntityCategories,
      types: allEntityTypes,
      subtypes: allEntitySubtypes,
      tiers: allEntityTiers,
      scope: {
        global: true,
        custom: true
      }
    });
  }, [poiTypes, entityFilters.categories, entityFilters.types, entityFilters.subtypes, entityFilters.tiers]);

  // Valid tiers (now including all tiers, no longer excluding T69)
  const validTiers = React.useMemo(() => 
    tiers, 
    [tiers]
  );

  return {
    // Data - now returns paginated slices of filtered data
    pois: paginatedPOIs,
    entities: paginatedEntities,
    poiTypes,
    tiers,
    entityCategories,
    entityTypes,
    getTierName,
    loading,

    // ALL data for filter building (not paginated)
    allPOIs,
    allEntities,

    // Filter state
    poiFilters,
    entityFilters,
    filterCounts,

    // Pagination state
    pagination,
    changePage,
    changeItemsPerPage,

    // Selection state
    selectedPOIIds,
    selectedEntityIds,

    // Filter actions
    updatePOIFilters,
    updateEntityFilters,
    togglePOICategory,
    toggleEntityCategory,
    toggleEntityType,
    toggleEntitySubtype,
    toggleEntityTier,
    clearAllFilters,

    // Selection actions
    togglePOISelection,
    toggleEntitySelection,
    clearAllSelections,
    getSelectedPOIs,
    getSelectedEntities,

    // Data refresh
    refreshData: useCallback(() => Promise.all([fetchAllPOIs(), fetchAllEntities(), fetchPOITypes()]), [fetchAllPOIs, fetchAllEntities, fetchPOITypes]),

    // New POI filters
    togglePOIType,
    toggleAllPOIs,

    // New Entity filters
    toggleAllEntities,

    // Valid tiers
    validTiers
  };
}; 