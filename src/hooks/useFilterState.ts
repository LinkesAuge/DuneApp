import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/auth/AuthProvider';
import { fetchPrivacyFilteredPois } from '../lib/poiPrivacy';
import type { Poi, Entity, PoiType } from '../types';
import { entitiesAPI } from '../lib/api/entities';
import { useTiers } from './useTiers';

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
    tiers: {},
    scope: {
      global: true,
      custom: true
    }
  });

  // Data State
  const [pois, setPOIs] = useState<Poi[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [poiTypes, setPOITypes] = useState<PoiType[]>([]);
  const [entityCategories, setEntityCategories] = useState<string[]>([]);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection State
  const [selectedPOIIds, setSelectedPOIIds] = useState<Set<string>>(new Set());
  const [selectedEntityIds, setSelectedEntityIds] = useState<Set<string>>(new Set());

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

  // Fetch POIs (with proper privacy enforcement)
  const fetchPOIs = useCallback(async () => {
    try {
      const data = await fetchPrivacyFilteredPois(user);
      setPOIs(data);
    } catch (error) {
      console.error('Error fetching POIs:', error);
      setPOIs([]);
    }
  }, [user]);

  // Fetch Entities (with proper structure parsing)
  const fetchEntities = useCallback(async () => {
    try {
      const response = await entitiesAPI.getAll({ limit: 1000 });
      const entitiesData = response.data;
      
      setEntities(entitiesData || []);
      
      // Extract unique categories and types for filtering - ensure strings only from relationships
      const categoryValues = entitiesData
        .map(e => e.category?.name)
        .filter(c => c != null && typeof c === 'string' && c.trim() !== '');
      const categories = [...new Set(categoryValues)];
      
      const typeValues = entitiesData
        .map(e => e.type?.name)
        .filter(t => t != null && typeof t === 'string' && t.trim() !== '');
      const types = [...new Set(typeValues)];
      

      
      setEntityCategories(categories);
      setEntityTypes(types);
      
      // Initialize entity filters with all categories/types/tiers selected
      const categoryFilters = categories.reduce((acc, category) => {
        acc[category] = true;
        return acc;
      }, {} as { [category: string]: boolean });
      
      const typeFilters = types.reduce((acc, type) => {
        acc[type] = true;
        return acc;
      }, {} as { [type: string]: boolean });
      
      // Initialize tier filters (excluding T69)
      const validTiers = tiers.filter(tier => tier.tier_number !== 69);
      const tierFilters = validTiers.reduce((acc, tier) => {
        acc[tier.tier_number.toString()] = true;
        return acc;
      }, {} as { [tier: string]: boolean });
      
      setEntityFilters(prev => ({
        ...prev,
        categories: categoryFilters,
        types: typeFilters,
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
        fetchPOIs(),
        fetchEntities()
      ]);
      setLoading(false);
    };

    initializeData();
  }, [fetchPOITypes, fetchPOIs, fetchEntities]); // Include the fetch functions in dependencies

  // Filtered POIs with proper privacy and category filtering
  const filteredPOIs = useMemo(() => {
    return pois.filter(poi => {
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

      // Privacy level filter
      if (!poiFilters.privacyLevels.public && poi.privacy_level === 'global') {
        return false;
      }
      if (!poiFilters.privacyLevels.private && poi.privacy_level === 'private') {
        return false;
      }
      if (!poiFilters.privacyLevels.shared && poi.privacy_level === 'shared') {
        return false;
      }

      // POI type filter - Show only selected types (if none selected, show none)
      if (poiFilters.selectedPoiTypes.length > 0 && !poiFilters.selectedPoiTypes.includes(poi.poi_type_id)) {
        return false;
      }

      return true;
    });
  }, [pois, poiFilters]);

  // Get unique categories from POI types
  const categories = useMemo(() => 
    [...new Set(poiTypes.map(type => type.category))], 
    [poiTypes]
  );

  // POI type toggle
  const togglePOIType = useCallback((typeId: string) => {
    setPOIFilters(prev => ({
      ...prev,
      selectedPoiTypes: prev.selectedPoiTypes.includes(typeId)
        ? prev.selectedPoiTypes.filter(id => id !== typeId)
        : [...prev.selectedPoiTypes, typeId]
    }));
  }, []);

  // POI category toggle - syncs with selectedPoiTypes like other pages
  const togglePOICategory = useCallback((category: string, checked: boolean) => {
    const categoryTypeIds = poiTypes
      .filter(type => type.category === category)
      .map(type => type.id);

    if (checked) {
      // Add category and ensure ALL types in category are selected
      setPOIFilters(prev => ({
        ...prev,
        selectedCategories: prev.selectedCategories.includes(category) 
          ? prev.selectedCategories 
          : [...prev.selectedCategories, category],
        selectedPoiTypes: [
          ...prev.selectedPoiTypes.filter(typeId => !categoryTypeIds.includes(typeId)),
          ...categoryTypeIds
        ]
      }));
    } else {
      // Remove category and all its types
      setPOIFilters(prev => ({
        ...prev,
        selectedCategories: prev.selectedCategories.filter(c => c !== category),
        selectedPoiTypes: prev.selectedPoiTypes.filter(typeId => !categoryTypeIds.includes(typeId))
      }));
    }
  }, [poiTypes]);

  // Toggle all POIs
  const toggleAllPOIs = useCallback(() => {
    const allTypeIds = poiTypes.map(type => type.id);
    const allCategories = [...new Set(poiTypes.map(type => type.category))];
    const allTypesSelected = allTypeIds.length > 0 && allTypeIds.every(id => poiFilters.selectedPoiTypes.includes(id));
    
    if (allTypesSelected) {
      // Hide all POIs
      setPOIFilters(prev => ({
        ...prev,
        selectedCategories: [],
        selectedPoiTypes: []
      }));
    } else {
      // Show all POIs
      setPOIFilters(prev => ({
        ...prev,
        selectedCategories: allCategories,
        selectedPoiTypes: allTypeIds
      }));
    }
  }, [poiTypes, poiFilters.selectedPoiTypes]);

  // Filtered entities with proper type checking
  const filteredEntities = useMemo(() => {
    return entities.filter(entity => {
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

      // Tier filter - fix: hide T69 (undefined tier) and handle properly
      if (entity.tier_number !== null && entity.tier_number !== undefined) {
        // Hide T69 (undefined tier)
        if (entity.tier_number === 69) {
          return false;
        }
        
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
  }, [entities, entityFilters]);

  // Real-time filter counts
  const filterCounts: FilterCounts = useMemo(() => ({
    availablePOIs: filteredPOIs.length,
    availableEntities: filteredEntities.length,
    selectedPOIs: selectedPOIIds.size,
    selectedEntities: selectedEntityIds.size
  }), [filteredPOIs.length, filteredEntities.length, selectedPOIIds.size, selectedEntityIds.size]);

  // Filter update functions
  const updatePOIFilters = useCallback((updates: Partial<POIFilters>) => {
    setPOIFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const updateEntityFilters = useCallback((updates: Partial<EntityFilters>) => {
    setEntityFilters(prev => ({ ...prev, ...updates }));
  }, []);

  // Entity category toggle
  const toggleEntityCategory = useCallback((category: string, checked: boolean) => {
    setEntityFilters(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: checked
      }
    }));
  }, []);

  // Entity type toggle (new addition)
  const toggleEntityType = useCallback((type: string, checked: boolean) => {
    setEntityFilters(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: checked
      }
    }));
  }, []);

  // Entity tier toggle
  const toggleEntityTier = useCallback((tier: string, checked: boolean) => {
    setEntityFilters(prev => ({
      ...prev,
      tiers: {
        ...prev.tiers,
        [tier]: checked
      }
    }));
  }, []);

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
      tiers: allEntityTiers,
      scope: {
        global: true,
        custom: true
      }
    });
  }, [poiTypes, entityFilters.categories, entityFilters.types, entityFilters.tiers]);

  return {
    // Data
    pois: filteredPOIs,
    entities: filteredEntities,
    poiTypes,
    tiers,
    entityCategories,
    entityTypes,
    getTierName,
    loading,

    // Filter state
    poiFilters,
    entityFilters,
    filterCounts,

    // Selection state
    selectedPOIIds,
    selectedEntityIds,

    // Filter actions
    updatePOIFilters,
    updateEntityFilters,
    togglePOICategory,
    toggleEntityCategory,
    toggleEntityType,
    toggleEntityTier,
    clearAllFilters,

    // Selection actions
    togglePOISelection,
    toggleEntitySelection,
    clearAllSelections,

    // Data refresh
    refreshData: useCallback(() => Promise.all([fetchPOIs(), fetchEntities(), fetchPOITypes()]), [fetchPOIs, fetchEntities, fetchPOITypes]),

    // New POI filters
    togglePOIType,
    toggleAllPOIs
  };
}; 