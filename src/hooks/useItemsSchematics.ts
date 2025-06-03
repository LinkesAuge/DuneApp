import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { entitiesAPI } from '../lib/api/entities';
import type { 
  Entity, 
  Tier, 
  EntityWithDetails, 
  EntityFilters,
  TIER_NAMES 
} from '../types/unified-entities';

// Hook state interface - simplified for unified entities
interface ItemsSchematicsState {
  // Core data
  entities: Entity[];
  tiers: Tier[];
  
  // Derived data
  categories: string[];
  types: string[];
  items: Entity[];
  schematics: Entity[];
  
  // Loading states
  loading: {
    entities: boolean;
    tiers: boolean;
    categories: boolean;
    types: boolean;
    items: boolean;
    schematics: boolean;
  };
  
  // Error states
  errors: {
    entities: string | null;
    tiers: string | null;
    categories: string | null;
    types: string | null;
    items: string | null;
    schematics: string | null;
  };
}

// Hook return interface
interface UseItemsSchematicsReturn extends ItemsSchematicsState {
  // Data fetching functions
  refetchEntities: () => Promise<void>;
  refetchTiers: () => Promise<void>;
  refetchCategories: () => Promise<void>;
  refetchTypes: () => Promise<void>;
  refetchAllTypes: () => Promise<void>;
  refetchItems: () => Promise<void>;
  refetchSchematics: () => Promise<void>;
  
  // Legacy compatibility functions
  refetchSubtypes: (typeId: string) => Promise<void>;
  refetchFieldDefinitions: () => Promise<void>;
  refetchDropdownGroups: () => Promise<void>;
  
  // CRUD operations
  createItem: (itemData: Partial<Entity>) => Promise<Entity | null>;
  createSchematic: (schematicData: Partial<Entity>) => Promise<Entity | null>;
  createTier: (tierData: Partial<Tier>) => Promise<Tier | null>;
  createCategory: (categoryData: any) => Promise<any | null>;
  createType: (typeData: any) => Promise<any | null>;
  updateItem: (id: string, updates: Partial<Entity>) => Promise<Entity | null>;
  deleteItem: (id: string) => Promise<boolean>;
  updateSchematic: (id: string, updates: Partial<Entity>) => Promise<Entity | null>;
  deleteSchematic: (id: string) => Promise<boolean>;
  
  // Validation utilities
  validateItemData: (item: Partial<Entity>) => Promise<{ isValid: boolean; errors: string[] }>;
  validateSchematicData: (schematic: Partial<Entity>) => Promise<{ isValid: boolean; errors: string[] }>;
  checkItemNameUnique: (name: string, excludeId?: string) => Promise<boolean>;
  checkSchematicNameUnique: (name: string, excludeId?: string) => Promise<boolean>;
  
  // Helper functions
  getItemById: (id: string) => Entity | undefined;
  getSchematicById: (id: string) => Entity | undefined;
  getCategoryById: (id: string) => any | undefined;
  getTypeById: (id: string) => any | undefined;
  getSubtypeById: (id: string) => any | undefined;
  getTierById: (id: string) => Tier | undefined;
  
  // Legacy compatibility functions
  getFieldsForEntity: (categoryId?: string, typeId?: string) => Promise<any>;
  validateEntityHierarchy: (entityType: 'item' | 'schematic', categoryId: string, typeId?: string, subtypeId?: string) => Promise<any>;
  resolveFields: (params: any) => Promise<any[]>;
}

export function useItemsSchematics(): UseItemsSchematicsReturn {
  const { user } = useAuth();
  const [state, setState] = useState<ItemsSchematicsState>({
    entities: [],
    tiers: [],
    categories: [],
    types: [],
    items: [],
    schematics: [],
    loading: {
      entities: false,
      tiers: false,
      categories: false,
      types: false,
      items: false,
      schematics: false,
    },
    errors: {
      entities: null,
      tiers: null,
      categories: null,
      types: null,
      items: null,
      schematics: null,
    },
  });

  // =================================
  // Data Fetching Functions
  // =================================

  const refetchEntities = useCallback(async () => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, entities: true }, errors: { ...prev.errors, entities: null } }));
    try {
      const response = await entitiesAPI.getAll({ limit: 1000 });
      const entities = response.data;
      
      // Derive categories and types
      const categories = Array.from(new Set(entities.map(e => e.category))).sort();
      const types = Array.from(new Set(entities.map(e => e.type))).sort();
      const items = entities.filter(e => !e.is_schematic);
      const schematics = entities.filter(e => e.is_schematic);
      
      setState(prev => ({ 
        ...prev, 
        entities,
        categories,
        types,
        items,
        schematics,
        loading: { ...prev.loading, entities: false, categories: false, types: false, items: false, schematics: false } 
      }));
    } catch (error) {
      console.error('Error fetching entities:', error);
      setState(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, entities: false },
        errors: { ...prev.errors, entities: 'Failed to fetch entities' }
      }));
    }
  }, []);

  const refetchTiers = useCallback(async () => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, tiers: true }, errors: { ...prev.errors, tiers: null } }));
    try {
      const tiers = await entitiesAPI.getTiers();
      setState(prev => ({ ...prev, tiers, loading: { ...prev.loading, tiers: false } }));
    } catch (error) {
      console.error('Error fetching tiers:', error);
      setState(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, tiers: false },
        errors: { ...prev.errors, tiers: 'Failed to fetch tiers' }
      }));
    }
  }, []);

  // Legacy compatibility functions that just call refetchEntities
  const refetchCategories = useCallback(async () => {
    await refetchEntities();
  }, [refetchEntities]);

  const refetchTypes = useCallback(async () => {
    await refetchEntities();
  }, [refetchEntities]);

  const refetchAllTypes = useCallback(async () => {
    await refetchEntities();
  }, [refetchEntities]);

  const refetchItems = useCallback(async () => {
    await refetchEntities();
  }, [refetchEntities]);

  const refetchSchematics = useCallback(async () => {
    await refetchEntities();
  }, [refetchEntities]);

  // Legacy compatibility - these are no longer needed but kept for compatibility
  const refetchSubtypes = useCallback(async (typeId: string) => {
    // Subtypes are now part of entities, no separate fetching needed
  }, []);

  const refetchFieldDefinitions = useCallback(async () => {
    // Field definitions are now stored in entity.field_values
  }, []);

  const refetchDropdownGroups = useCallback(async () => {
    // Dropdown groups are now handled differently
  }, []);

  // =================================
  // CRUD Operations
  // =================================

  const createItem = useCallback(async (itemData: Partial<Entity>): Promise<Entity | null> => {
    try {
      const entity = await entitiesAPI.create({
        ...itemData,
        is_schematic: false
      } as Omit<Entity, 'id' | 'created_at' | 'updated_at'>);
      await refetchEntities();
      return entity;
    } catch (error) {
      console.error('Error creating item:', error);
      return null;
    }
  }, [refetchEntities]);

  const createSchematic = useCallback(async (schematicData: Partial<Entity>): Promise<Entity | null> => {
    try {
      const entity = await entitiesAPI.create({
        ...schematicData,
        is_schematic: true
      } as Omit<Entity, 'id' | 'created_at' | 'updated_at'>);
      await refetchEntities();
      return entity;
    } catch (error) {
      console.error('Error creating schematic:', error);
      return null;
    }
  }, [refetchEntities]);

  const createTier = useCallback(async (tierData: Partial<Tier>): Promise<Tier | null> => {
    try {
      // Tiers are managed separately - this would need to be implemented in entitiesAPI
      console.warn('Creating tiers not yet implemented in unified system');
      return null;
    } catch (error) {
      console.error('Error creating tier:', error);
      return null;
    }
  }, []);

  const createCategory = useCallback(async (categoryData: any): Promise<any | null> => {
    // Categories are now just strings in the unified system
    console.warn('Creating categories not needed in unified system - they are derived from entities');
    return null;
  }, []);

  const createType = useCallback(async (typeData: any): Promise<any | null> => {
    // Types are now just strings in the unified system
    console.warn('Creating types not needed in unified system - they are derived from entities');
    return null;
  }, []);

  const updateItem = useCallback(async (id: string, updates: Partial<Entity>): Promise<Entity | null> => {
    try {
      const entity = await entitiesAPI.update(id, updates);
      await refetchEntities();
      return entity;
    } catch (error) {
      console.error('Error updating item:', error);
      return null;
    }
  }, [refetchEntities]);

  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      await entitiesAPI.delete(id);
      await refetchEntities();
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      return false;
    }
  }, [refetchEntities]);

  const updateSchematic = useCallback(async (id: string, updates: Partial<Entity>): Promise<Entity | null> => {
    try {
      const entity = await entitiesAPI.update(id, updates);
      await refetchEntities();
      return entity;
    } catch (error) {
      console.error('Error updating schematic:', error);
      return null;
    }
  }, [refetchEntities]);

  const deleteSchematic = useCallback(async (id: string): Promise<boolean> => {
    try {
      await entitiesAPI.delete(id);
      await refetchEntities();
      return true;
    } catch (error) {
      console.error('Error deleting schematic:', error);
      return false;
    }
  }, [refetchEntities]);

  // =================================
  // Validation Functions
  // =================================

  const validateItemData = useCallback(async (item: Partial<Entity>): Promise<{ isValid: boolean; errors: string[] }> => {
    const errors: string[] = [];
    
    if (!item.name || item.name.trim() === '') {
      errors.push('Name is required');
    }
    
    if (!item.category || item.category.trim() === '') {
      errors.push('Category is required');
    }
    
    if (!item.type || item.type.trim() === '') {
      errors.push('Type is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const validateSchematicData = useCallback(async (schematic: Partial<Entity>): Promise<{ isValid: boolean; errors: string[] }> => {
    return validateItemData(schematic); // Same validation logic
  }, [validateItemData]);

  const checkItemNameUnique = useCallback(async (name: string, excludeId?: string): Promise<boolean> => {
    try {
      const response = await entitiesAPI.search({ name, is_schematic: false });
      const existingItems = response.data.filter(item => item.id !== excludeId);
      return existingItems.length === 0;
    } catch (error) {
      console.error('Error checking item name uniqueness:', error);
      return false;
    }
  }, []);

  const checkSchematicNameUnique = useCallback(async (name: string, excludeId?: string): Promise<boolean> => {
    try {
      const response = await entitiesAPI.search({ name, is_schematic: true });
      const existingSchematics = response.data.filter(schematic => schematic.id !== excludeId);
      return existingSchematics.length === 0;
    } catch (error) {
      console.error('Error checking schematic name uniqueness:', error);
      return false;
    }
  }, []);

  // =================================
  // Helper Functions
  // =================================

  const getItemById = useCallback((id: string): Entity | undefined => {
    return state.items.find(item => item.id === id);
  }, [state.items]);

  const getSchematicById = useCallback((id: string): Entity | undefined => {
    return state.schematics.find(schematic => schematic.id === id);
  }, [state.schematics]);

  const getCategoryById = useCallback((id: string): any | undefined => {
    // Categories are now just strings, not objects with IDs
    return { id, name: id };
  }, []);

  const getTypeById = useCallback((id: string): any | undefined => {
    // Types are now just strings, not objects with IDs
    return { id, name: id };
  }, []);

  const getSubtypeById = useCallback((id: string): any | undefined => {
    // Subtypes are now stored in entity.subtype
    return { id, name: id };
  }, []);

  const getTierById = useCallback((id: string): Tier | undefined => {
    return state.tiers.find(tier => tier.id === id);
  }, [state.tiers]);

  // Legacy compatibility functions
  const getFieldsForEntity = useCallback(async (categoryId?: string, typeId?: string): Promise<any> => {
    // In the unified system, fields are stored in entity.field_values
    return {};
  }, []);

  const validateEntityHierarchy = useCallback(async (entityType: 'item' | 'schematic', categoryId: string, typeId?: string, subtypeId?: string): Promise<any> => {
    // Basic validation - in unified system, hierarchy is simpler
    return { isValid: true, errors: [] };
  }, []);

  const resolveFields = useCallback(async (params: any): Promise<any[]> => {
    // Field resolution is simpler in unified system
    return [];
  }, []);

  // =================================
  // Effects
  // =================================

  useEffect(() => {
    refetchEntities();
    refetchTiers();
  }, [refetchEntities, refetchTiers]);

  return {
    ...state,
    refetchEntities,
    refetchTiers,
    refetchCategories,
    refetchTypes,
    refetchAllTypes,
    refetchItems,
    refetchSchematics,
    refetchSubtypes,
    refetchFieldDefinitions,
    refetchDropdownGroups,
    createItem,
    createSchematic,
    createTier,
    createCategory,
    createType,
    updateItem,
    deleteItem,
    updateSchematic,
    deleteSchematic,
    validateItemData,
    validateSchematicData,
    checkItemNameUnique,
    checkSchematicNameUnique,
    getItemById,
    getSchematicById,
    getCategoryById,
    getTypeById,
    getSubtypeById,
    getTierById,
    getFieldsForEntity,
    validateEntityHierarchy,
    resolveFields,
  };
} 