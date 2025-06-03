import { useState, useEffect, useMemo } from 'react';
import { useItemsSchematics } from './useItemsSchematics';
import { useAuth } from '../components/auth/AuthProvider';

// =================================
// Simplified Hooks for UI Components
// =================================

/**
 * Hook for categories filtered by entity type
 */
export function useCategories(entityType: 'items' | 'schematics') {
  const { user } = useAuth();
  const { categories, loading, errors, refetchCategories, items, schematics } = useItemsSchematics();
  
  // In unified system, derive categories from actual entities
  const filteredCategories = useMemo(() => {
    const entities = entityType === 'items' ? items : schematics;
    const categoryObjs = entities.map(e => e.category).filter(Boolean);
    const uniqueCategories = Array.from(
      new Map(categoryObjs.map(cat => [cat.id, cat])).values()
    ).sort((a, b) => a.name.localeCompare(b.name));
    
    return uniqueCategories;
  }, [items, schematics, entityType]);

  useEffect(() => {
    if (user) {
      refetchCategories();
    }
  }, [user, refetchCategories]);

  return {
    categories: filteredCategories,
    loading: loading.categories,
    error: errors.categories,
    refetch: refetchCategories
  };
}

/**
 * Hook for types filtered by category
 */
export function useTypes(categoryId?: string) {
  const { user } = useAuth();
  const { types, loading, errors, refetchTypes, items, schematics } = useItemsSchematics();
  
  // In unified system, derive types from actual entities for the specified category
  const filteredTypes = useMemo(() => {
    if (!categoryId) return [];
    
    const allEntities = [...items, ...schematics];
    const categoryEntities = allEntities.filter(e => e.category?.id === categoryId);
    const typeObjs = categoryEntities.map(e => e.type).filter(Boolean);
    const uniqueTypes = Array.from(
      new Map(typeObjs.map(type => [type.id, type])).values()
    ).sort((a, b) => a.name.localeCompare(b.name));
    
    return uniqueTypes;
  }, [items, schematics, categoryId]);

  useEffect(() => {
    if (user && categoryId) {
      refetchTypes();
    }
  }, [user, categoryId, refetchTypes]);

  return {
    types: filteredTypes,
    loading: loading.types,
    error: errors.types,
    refetch: refetchTypes
  };
}

/**
 * Hook for all tiers
 */
export function useTiers() {
  const { user } = useAuth();
  const { tiers, loading, errors, refetchTiers } = useItemsSchematics();

  useEffect(() => {
    if (user) {
      refetchTiers();
    }
  }, [user, refetchTiers]);

  return {
    tiers,
    loading: loading.tiers,
    error: errors.tiers,
    refetch: refetchTiers
  };
}

/**
 * Hook for items with filtering
 */
export function useItems(filters?: {
  category_id?: string;
  type_id?: string;
  tier_id?: string;
  searchTerm?: string;
}) {
  const { user } = useAuth();
  const { items, loading, errors, refetchItems } = useItemsSchematics();

  // Apply filters
  const filteredItems = useMemo(() => {
    let result = [...items];

    if (filters?.category_id) {
      result = result.filter(item => item.category?.id === filters.category_id);
    }

    if (filters?.type_id) {
      result = result.filter(item => item.type?.id === filters.type_id);
    }

    if (filters?.tier_id) {
      // tier_id comes as string but tier_number is a number
      const tierNumber = parseInt(filters.tier_id, 10);
      result = result.filter(item => item.tier_number === tierNumber);
    }

    if (filters?.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.category?.name?.toLowerCase().includes(searchLower) ||
        item.type?.name?.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [items, filters]);

  useEffect(() => {
    if (user) {
      refetchItems();
    }
  }, [user, refetchItems]);

  return {
    items: filteredItems,
    allItems: items,
    loading: loading.items,
    error: errors.items,
    refetch: refetchItems
  };
}

/**
 * Hook for schematics with filtering
 */
export function useSchematics(filters?: {
  category_id?: string;
  type_id?: string;
  tier_id?: string;
  searchTerm?: string;
}) {
  const { user } = useAuth();
  const { schematics, loading, errors, refetchSchematics } = useItemsSchematics();

  // Apply filters
  const filteredSchematics = useMemo(() => {
    let result = [...schematics];

    if (filters?.category_id) {
      result = result.filter(schematic => schematic.category?.id === filters.category_id);
    }

    if (filters?.type_id) {
      result = result.filter(schematic => schematic.type?.id === filters.type_id);
    }

    if (filters?.tier_id) {
      // tier_id comes as string but tier_number is a number
      const tierNumber = parseInt(filters.tier_id, 10);
      result = result.filter(schematic => schematic.tier_number === tierNumber);
    }

    if (filters?.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(schematic => 
        schematic.name.toLowerCase().includes(searchLower) ||
        schematic.description?.toLowerCase().includes(searchLower) ||
        schematic.category?.name?.toLowerCase().includes(searchLower) ||
        schematic.type?.name?.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [schematics, filters]);

  useEffect(() => {
    if (user) {
      refetchSchematics();
    }
  }, [user, refetchSchematics]);

  return {
    schematics: filteredSchematics,
    allSchematics: schematics,
    loading: loading.schematics,
    error: errors.schematics,
    refetch: refetchSchematics
  };
}

/**
 * Combined hook for the current active view
 */
export function useActiveViewData(
  activeView: 'items' | 'schematics',
  filters?: {
    category_id?: string;
    type_id?: string;
    tier_id?: string;
    searchTerm?: string;
  }
) {
  const itemsResult = useItems(filters);
  const schematicsResult = useSchematics(filters);

  return activeView === 'items' ? itemsResult : schematicsResult;
}

/**
 * Hook for entity counts by category
 */
export function useEntityCounts(entityType: 'items' | 'schematics') {
  const { items, schematics } = useItemsSchematics();
  
  const counts = useMemo(() => {
    const entities = entityType === 'items' ? items : schematics;
    const countMap = new Map<string, number>();
    
    entities.forEach(entity => {
      const categoryId = entity.category;
      countMap.set(categoryId, (countMap.get(categoryId) || 0) + 1);
    });
    
    return countMap;
  }, [items, schematics, entityType]);

  return counts;
}

/**
 * Hook for getting creators/users who have created items or schematics
 */
export function useCreators(entityType: 'items' | 'schematics') {
  const { items, schematics } = useItemsSchematics();
  
  const creators = useMemo(() => {
    const entities = entityType === 'items' ? items : schematics;
    const creatorSet = new Set<string>();
    
    entities.forEach(entity => {
      if (entity.created_by) {
        creatorSet.add(entity.created_by);
      }
    });
    
    return Array.from(creatorSet);
  }, [items, schematics, entityType]);

  return {
    creators,
    loading: false,
    error: null
  };
} 