import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/auth/AuthProvider';
import {
  fetchTiers,
  fetchCategories,
  fetchTypesByCategory,
  fetchSubTypesByType,
  fetchDropdownGroupsWithOptions,
  resolveInheritedFields,
  validateItemHierarchy,
  validateSchematicHierarchy,
  isItemNameUnique,
  isSchematicNameUnique
} from '../lib/itemsSchematicsUtils';
import {
  createTier,
  createCategory,
  createType,
  createItem,
  createSchematic,
  fetchCategories as fetchCategoriesCrud,
  fetchItems,
  fetchSchematics,
  getFieldsForEntity,
  validateEntityHierarchy
} from '../lib/itemsSchematicsCrud';
import type {
  Tier,
  Category,
  Type,
  SubType,
  FieldDefinition,
  DropdownGroup,
  DropdownOption,
  Item,
  Schematic,
  ItemScreenshot,
  SchematicScreenshot,
  ItemWithRelations,
  SchematicWithRelations,
  ResolvedField,
  FieldResolutionParams,
  AppliesTo
} from '../types';

// Hook state interface
interface ItemsSchematicsState {
  // Core data
  tiers: Tier[];
  categories: Category[];
  types: Type[];
  subtypes: SubType[];
  items: Item[];
  schematics: Schematic[];
  fieldDefinitions: FieldDefinition[];
  dropdownGroups: (DropdownGroup & { options: DropdownOption[] })[];
  
  // Loading states
  loading: {
    tiers: boolean;
    categories: boolean;
    types: boolean;
    subtypes: boolean;
    items: boolean;
    schematics: boolean;
    fieldDefinitions: boolean;
    dropdownGroups: boolean;
  };
  
  // Error states
  errors: {
    tiers: string | null;
    categories: string | null;
    types: string | null;
    subtypes: string | null;
    items: string | null;
    schematics: string | null;
    fieldDefinitions: string | null;
    dropdownGroups: string | null;
  };
}

// Hook return interface
interface UseItemsSchematicsReturn extends ItemsSchematicsState {
  // Data fetching functions
  refetchTiers: () => Promise<void>;
  refetchCategories: (appliesTo?: AppliesTo) => Promise<void>;
  refetchTypes: (categoryId: string) => Promise<void>;
  refetchAllTypes: () => Promise<void>;
  refetchSubtypes: (typeId: string) => Promise<void>;
  refetchItems: () => Promise<void>;
  refetchSchematics: () => Promise<void>;
  refetchFieldDefinitions: () => Promise<void>;
  refetchDropdownGroups: () => Promise<void>;
  
  // Field resolution
  resolveFields: (params: FieldResolutionParams) => Promise<ResolvedField[]>;
  
  // CRUD operations with permissions
  createItem: (itemData: Omit<Item, 'id' | 'created_at' | 'updated_at'>) => Promise<Item | null>;
  createSchematic: (schematicData: Omit<Schematic, 'id' | 'created_at' | 'updated_at'>) => Promise<Schematic | null>;
  createTier: (tierData: Omit<Tier, 'id' | 'created_at' | 'updated_at'>) => Promise<Tier | null>;
  createCategory: (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => Promise<Category | null>;
  createType: (typeData: Omit<Type, 'id' | 'created_at' | 'updated_at'>) => Promise<Type | null>;
  updateItem: (id: string, updates: Partial<Item>) => Promise<Item | null>;
  deleteItem: (id: string) => Promise<boolean>;
  updateSchematic: (id: string, updates: Partial<Schematic>) => Promise<Schematic | null>;
  deleteSchematic: (id: string) => Promise<boolean>;
  
  // Validation utilities
  validateItemData: (item: Partial<Item>) => Promise<{ isValid: boolean; errors: string[] }>;
  validateSchematicData: (schematic: Partial<Schematic>) => Promise<{ isValid: boolean; errors: string[] }>;
  checkItemNameUnique: (name: string, excludeId?: string) => Promise<boolean>;
  checkSchematicNameUnique: (name: string, excludeId?: string) => Promise<boolean>;
  
  // Helper functions
  getItemById: (id: string) => Item | undefined;
  getSchematicById: (id: string) => Schematic | undefined;
  getCategoryById: (id: string) => Category | undefined;
  getTypeById: (id: string) => Type | undefined;
  getSubtypeById: (id: string) => SubType | undefined;
  getTierById: (id: string) => Tier | undefined;
  
  // CRUD utility functions
  getFieldsForEntity: (categoryId?: string, typeId?: string) => Promise<any>;
  validateEntityHierarchy: (entityType: 'item' | 'schematic', categoryId: string, typeId?: string, subtypeId?: string) => Promise<any>;
}

export function useItemsSchematics(): UseItemsSchematicsReturn {
  const { user } = useAuth();
  const [state, setState] = useState<ItemsSchematicsState>({
    tiers: [],
    categories: [],
    types: [],
    subtypes: [],
    items: [],
    schematics: [],
    fieldDefinitions: [],
    dropdownGroups: [],
    loading: {
      tiers: false,
      categories: false,
      types: false,
      subtypes: false,
      items: false,
      schematics: false,
      fieldDefinitions: false,
      dropdownGroups: false,
    },
    errors: {
      tiers: null,
      categories: null,
      types: null,
      subtypes: null,
      items: null,
      schematics: null,
      fieldDefinitions: null,
      dropdownGroups: null,
    },
  });

  // =================================
  // Data Fetching Functions
  // =================================

  const refetchTiers = useCallback(async () => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, tiers: true }, errors: { ...prev.errors, tiers: null } }));
    try {
      const data = await fetchTiers();
      setState(prev => ({ ...prev, tiers: data, loading: { ...prev.loading, tiers: false } }));
    } catch (error) {
      console.error('Error fetching tiers:', error);
      setState(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, tiers: false },
        errors: { ...prev.errors, tiers: 'Failed to fetch tiers' }
      }));
    }
  }, []);

  const refetchCategories = useCallback(async (appliesTo?: AppliesTo) => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, categories: true }, errors: { ...prev.errors, categories: null } }));
    try {
      const data = await fetchCategories(appliesTo);
      setState(prev => ({ ...prev, categories: data, loading: { ...prev.loading, categories: false } }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      setState(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, categories: false },
        errors: { ...prev.errors, categories: 'Failed to fetch categories' }
      }));
    }
  }, []);

  const refetchTypes = useCallback(async (categoryId: string) => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, types: true }, errors: { ...prev.errors, types: null } }));
    try {
      const data = await fetchTypesByCategory(categoryId);
      setState(prev => ({ ...prev, types: data, loading: { ...prev.loading, types: false } }));
    } catch (error) {
      console.error('Error fetching types:', error);
      setState(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, types: false },
        errors: { ...prev.errors, types: 'Failed to fetch types' }
      }));
    }
  }, []);

  const refetchAllTypes = useCallback(async () => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, types: true }, errors: { ...prev.errors, types: null } }));
    try {
      const { data, error } = await supabase
        .from('types')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setState(prev => ({ ...prev, types: data || [], loading: { ...prev.loading, types: false } }));
    } catch (error) {
      console.error('Error fetching all types:', error);
      setState(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, types: false },
        errors: { ...prev.errors, types: 'Failed to fetch types' }
      }));
    }
  }, []);

  const refetchSubtypes = useCallback(async (typeId: string) => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, subtypes: true }, errors: { ...prev.errors, subtypes: null } }));
    try {
      const data = await fetchSubTypesByType(typeId);
      setState(prev => ({ ...prev, subtypes: data, loading: { ...prev.loading, subtypes: false } }));
    } catch (error) {
      console.error('Error fetching subtypes:', error);
      setState(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, subtypes: false },
        errors: { ...prev.errors, subtypes: 'Failed to fetch subtypes' }
      }));
    }
  }, []);

  const refetchItems = useCallback(async () => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, items: true }, errors: { ...prev.errors, items: null } }));
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setState(prev => ({ ...prev, items: data || [], loading: { ...prev.loading, items: false } }));
    } catch (error) {
      console.error('Error fetching items:', error);
      setState(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, items: false },
        errors: { ...prev.errors, items: 'Failed to fetch items' }
      }));
    }
  }, []);

  const refetchSchematics = useCallback(async () => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, schematics: true }, errors: { ...prev.errors, schematics: null } }));
    try {
      const { data, error } = await supabase
        .from('schematics')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setState(prev => ({ ...prev, schematics: data || [], loading: { ...prev.loading, schematics: false } }));
    } catch (error) {
      console.error('Error fetching schematics:', error);
      setState(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, schematics: false },
        errors: { ...prev.errors, schematics: 'Failed to fetch schematics' }
      }));
    }
  }, []);

  const refetchFieldDefinitions = useCallback(async () => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, fieldDefinitions: true }, errors: { ...prev.errors, fieldDefinitions: null } }));
    try {
      const { data, error } = await supabase
        .from('field_definitions')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setState(prev => ({ ...prev, fieldDefinitions: data || [], loading: { ...prev.loading, fieldDefinitions: false } }));
    } catch (error) {
      console.error('Error fetching field definitions:', error);
      setState(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, fieldDefinitions: false },
        errors: { ...prev.errors, fieldDefinitions: 'Failed to fetch field definitions' }
      }));
    }
  }, []);

  const refetchDropdownGroups = useCallback(async () => {
    setState(prev => ({ ...prev, loading: { ...prev.loading, dropdownGroups: true }, errors: { ...prev.errors, dropdownGroups: null } }));
    try {
      const data = await fetchDropdownGroupsWithOptions();
      setState(prev => ({ ...prev, dropdownGroups: data, loading: { ...prev.loading, dropdownGroups: false } }));
    } catch (error) {
      console.error('Error fetching dropdown groups:', error);
      setState(prev => ({ 
        ...prev, 
        loading: { ...prev.loading, dropdownGroups: false },
        errors: { ...prev.errors, dropdownGroups: 'Failed to fetch dropdown groups' }
      }));
    }
  }, []);

  // =================================
  // Field Resolution
  // =================================

  const resolveFields = useCallback(async (params: FieldResolutionParams): Promise<ResolvedField[]> => {
    try {
      const result = await resolveInheritedFields(params);
      return result.fields;
    } catch (error) {
      console.error('Error resolving fields:', error);
      return [];
    }
  }, []);

  // =================================
  // CRUD Operations Integration
  // =================================

  const createItemWithPermissions = useCallback(async (itemData: Omit<Item, 'id' | 'created_at' | 'updated_at'>): Promise<Item | null> => {
    const result = await createItem(user, itemData);
    
    if (result.success && result.data) {
      // Update local state
      setState(prev => ({ ...prev, items: [...prev.items, result.data!] }));
      return result.data;
    } else {
      console.error('Error creating item:', result.error);
      return null;
    }
  }, [user]);

  const createSchematicWithPermissions = useCallback(async (schematicData: Omit<Schematic, 'id' | 'created_at' | 'updated_at'>): Promise<Schematic | null> => {
    const result = await createSchematic(user, schematicData);
    
    if (result.success && result.data) {
      // Update local state
      setState(prev => ({ ...prev, schematics: [...prev.schematics, result.data!] }));
      return result.data;
    } else {
      console.error('Error creating schematic:', result.error);
      return null;
    }
  }, [user]);

  const createTierWithPermissions = useCallback(async (tierData: Omit<Tier, 'id' | 'created_at' | 'updated_at'>): Promise<Tier | null> => {
    const result = await createTier(user, tierData);
    
    if (result.success && result.data) {
      // Update local state
      setState(prev => ({ ...prev, tiers: [...prev.tiers, result.data!] }));
      return result.data;
    } else {
      console.error('Error creating tier:', result.error);
      return null;
    }
  }, [user]);

  const createCategoryWithPermissions = useCallback(async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category | null> => {
    const result = await createCategory(user, categoryData);
    
    if (result.success && result.data) {
      // Update local state
      setState(prev => ({ ...prev, categories: [...prev.categories, result.data!] }));
      return result.data;
    } else {
      console.error('Error creating category:', result.error);
      return null;
    }
  }, [user]);

  const createTypeWithPermissions = useCallback(async (typeData: Omit<Type, 'id' | 'created_at' | 'updated_at'>): Promise<Type | null> => {
    const result = await createType(user, typeData);
    
    if (result.success && result.data) {
      // Update local state
      setState(prev => ({ ...prev, types: [...prev.types, result.data!] }));
      return result.data;
    } else {
      console.error('Error creating type:', result.error);
      return null;
    }
  }, [user]);

  const updateItem = useCallback(async (id: string, updates: Partial<Item>): Promise<Item | null> => {
    try {
      console.log('🔧 updateItem called with:', { id, updates });
      
      const { data, error } = await supabase
        .from('items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('🔧 Supabase update error:', error);
        throw error;
      }

      console.log('🔧 Supabase update result:', data);

      // Update local state
      setState(prev => ({
        ...prev,
        items: prev.items.map(item => item.id === id ? { ...item, ...data } : item)
      }));
      
      return data;
    } catch (error) {
      console.error('Error updating item:', error);
      return null;
    }
  }, []);

  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setState(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id)
      }));
      
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      return false;
    }
  }, []);

  const createSchematicLocal = useCallback(async (schematic: Partial<Schematic>): Promise<Schematic | null> => {
    try {
      const { data, error } = await supabase
        .from('schematics')
        .insert([schematic])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setState(prev => ({ ...prev, schematics: [...prev.schematics, data] }));
      
      return data;
    } catch (error) {
      console.error('Error creating schematic:', error);
      return null;
    }
  }, []);

  const updateSchematic = useCallback(async (id: string, updates: Partial<Schematic>): Promise<Schematic | null> => {
    try {
      console.log('🔧 updateSchematic called with:', { id, updates });
      
      const { data, error } = await supabase
        .from('schematics')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('🔧 Supabase update error:', error);
        throw error;
      }

      console.log('🔧 Supabase update result:', data);

      // Update local state
      setState(prev => ({
        ...prev,
        schematics: prev.schematics.map(schematic => schematic.id === id ? { ...schematic, ...data } : schematic)
      }));
      
      return data;
    } catch (error) {
      console.error('Error updating schematic:', error);
      return null;
    }
  }, []);

  const deleteSchematic = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('schematics')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setState(prev => ({
        ...prev,
        schematics: prev.schematics.filter(schematic => schematic.id !== id)
      }));
      
      return true;
    } catch (error) {
      console.error('Error deleting schematic:', error);
      return false;
    }
  }, []);

  // =================================
  // Validation Functions
  // =================================

  const validateItemData = useCallback(async (item: Partial<Item>) => {
    const validation = await validateItemHierarchy(item);
    return {
      isValid: validation.is_valid,
      errors: validation.errors
    };
  }, []);

  const validateSchematicData = useCallback(async (schematic: Partial<Schematic>) => {
    const validation = await validateSchematicHierarchy(schematic);
    return {
      isValid: validation.is_valid,
      errors: validation.errors
    };
  }, []);

  const checkItemNameUnique = useCallback(async (name: string, excludeId?: string) => {
    return await isItemNameUnique(name, excludeId);
  }, []);

  const checkSchematicNameUnique = useCallback(async (name: string, excludeId?: string) => {
    return await isSchematicNameUnique(name, excludeId);
  }, []);

  // =================================
  // Helper Functions
  // =================================

  const getItemById = useCallback((id: string) => {
    return state.items.find(item => item.id === id);
  }, [state.items]);

  const getSchematicById = useCallback((id: string) => {
    return state.schematics.find(schematic => schematic.id === id);
  }, [state.schematics]);

  const getCategoryById = useCallback((id: string) => {
    return state.categories.find(category => category.id === id);
  }, [state.categories]);

  const getTypeById = useCallback((id: string) => {
    return state.types.find(type => type.id === id);
  }, [state.types]);

  const getSubtypeById = useCallback((id: string) => {
    return state.subtypes.find(subtype => subtype.id === id);
  }, [state.subtypes]);

  const getTierById = useCallback((id: string) => {
    return state.tiers.find(tier => tier.id === id);
  }, [state.tiers]);

  // =================================
  // Initial Data Loading
  // =================================

  useEffect(() => {
    refetchTiers();
    refetchCategories();
    refetchAllTypes();
    refetchItems();
    refetchSchematics();
    refetchFieldDefinitions();
    refetchDropdownGroups();
  }, [refetchTiers, refetchCategories, refetchAllTypes, refetchItems, refetchSchematics, refetchFieldDefinitions, refetchDropdownGroups]);

  return {
    ...state,
    refetchTiers,
    refetchCategories,
    refetchTypes,
    refetchAllTypes,
    refetchSubtypes,
    refetchItems,
    refetchSchematics,
    refetchFieldDefinitions,
    refetchDropdownGroups,
    resolveFields,
    // Permission-aware CRUD operations
    createItem: createItemWithPermissions,
    createSchematic: createSchematicWithPermissions,
    createTier: createTierWithPermissions,
    createCategory: createCategoryWithPermissions,
    createType: createTypeWithPermissions,
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
    // Utility functions from CRUD layer
    getFieldsForEntity: (categoryId?: string, typeId?: string) => getFieldsForEntity(user, categoryId, typeId),
    validateEntityHierarchy: (entityType: 'item' | 'schematic', categoryId: string, typeId?: string, subtypeId?: string) => 
      validateEntityHierarchy(entityType, categoryId, typeId, subtypeId),
  };
} 