import { useState, useEffect, useCallback } from 'react';
import { 
  categoriesAPI, 
  typesAPI, 
  subtypesAPI, 
  categoryHierarchyAPI,
  Category,
  Type,
  Subtype,
  CategoryWithTypes,
  TypeWithSubtypes,
  SubtypeWithParents
} from '../lib/api/categories';

/**
 * React hook for managing categories, types, and subtypes
 * Provides CRUD operations and hierarchy management for normalized structure
 */

export interface UseCategoriesResult {
  // Data
  categories: CategoryWithTypes[];
  types: TypeWithSubtypes[];
  subtypes: SubtypeWithParents[];
  hierarchy: CategoryWithTypes[];
  
  // Loading states
  loading: boolean;
  categoriesLoading: boolean;
  typesLoading: boolean;
  subtypesLoading: boolean;
  
  // Error states
  error: string | null;
  
  // CRUD operations
  createCategory: (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => Promise<Category>;
  updateCategory: (id: number, updates: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: number) => Promise<void>;
  
  createType: (type: Omit<Type, 'id' | 'created_at' | 'updated_at'>) => Promise<Type>;
  updateType: (id: number, updates: Partial<Type>) => Promise<Type>;
  deleteType: (id: number) => Promise<void>;
  
  createSubtype: (subtype: Omit<Subtype, 'id' | 'created_at' | 'updated_at'>) => Promise<Subtype>;
  updateSubtype: (id: number, updates: Partial<Subtype>) => Promise<Subtype>;
  deleteSubtype: (id: number) => Promise<void>;
  
  // Utility functions
  refreshData: () => Promise<void>;
  getCategoryById: (id: number) => Category | undefined;
  getTypeById: (id: number) => Type | undefined;
  getSubtypeById: (id: number) => Subtype | undefined;
  getTypesByCategory: (categoryId: number) => Type[];
  getSubtypesByType: (typeId: number) => Subtype[];
  getCategoryName: (id: number) => string;
  getTypeName: (id: number) => string;
  getSubtypeName: (id: number) => string;
  getHierarchyPath: (categoryId: number, typeId: number, subtypeId?: number) => string;
}

export const useCategories = (): UseCategoriesResult => {
  // State management
  const [categories, setCategories] = useState<CategoryWithTypes[]>([]);
  const [types, setTypes] = useState<TypeWithSubtypes[]>([]);
  const [subtypes, setSubtypes] = useState<SubtypeWithParents[]>([]);
  const [hierarchy, setHierarchy] = useState<CategoryWithTypes[]>([]);
  
  // Loading states
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [typesLoading, setTypesLoading] = useState(true);
  const [subtypesLoading, setSubtypesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed loading state
  const loading = categoriesLoading || typesLoading || subtypesLoading;

  // Data fetching functions
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      setError(null);
      const data = await categoriesAPI.getAll(true); // Include types and subtypes
      setCategories(data);
      setHierarchy(data); // Use the same data for hierarchy
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const fetchTypes = useCallback(async () => {
    try {
      setTypesLoading(true);
      setError(null);
      const data = await typesAPI.getAll(undefined, true); // Include subtypes and categories
      setTypes(data);
    } catch (err) {
      console.error('Failed to fetch types:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch types');
    } finally {
      setTypesLoading(false);
    }
  }, []);

  const fetchSubtypes = useCallback(async () => {
    try {
      setSubtypesLoading(true);
      setError(null);
      const data = await subtypesAPI.getAll(); // Include parents
      setSubtypes(data);
    } catch (err) {
      console.error('Failed to fetch subtypes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subtypes');
    } finally {
      setSubtypesLoading(false);
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchCategories(),
      fetchTypes(),
      fetchSubtypes()
    ]);
  }, [fetchCategories, fetchTypes, fetchSubtypes]);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // CRUD operations with optimistic updates
  const createCategory = useCallback(async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newCategory = await categoriesAPI.create(category);
      await fetchCategories(); // Refresh to get updated hierarchy
      return newCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
      throw err;
    }
  }, [fetchCategories]);

  const updateCategory = useCallback(async (id: number, updates: Partial<Category>) => {
    try {
      const updatedCategory = await categoriesAPI.update(id, updates);
      await fetchCategories(); // Refresh to get updated hierarchy
      return updatedCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
      throw err;
    }
  }, [fetchCategories]);

  const deleteCategory = useCallback(async (id: number) => {
    try {
      await categoriesAPI.delete(id);
      await refreshData(); // Refresh all data as cascade deletes may affect types/subtypes
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      throw err;
    }
  }, [refreshData]);

  const createType = useCallback(async (type: Omit<Type, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newType = await typesAPI.create(type);
      await Promise.all([fetchCategories(), fetchTypes()]); // Refresh hierarchy and types
      return newType;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create type');
      throw err;
    }
  }, [fetchCategories, fetchTypes]);

  const updateType = useCallback(async (id: number, updates: Partial<Type>) => {
    try {
      const updatedType = await typesAPI.update(id, updates);
      await Promise.all([fetchCategories(), fetchTypes()]); // Refresh hierarchy and types
      return updatedType;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update type');
      throw err;
    }
  }, [fetchCategories, fetchTypes]);

  const deleteType = useCallback(async (id: number) => {
    try {
      await typesAPI.delete(id);
      await refreshData(); // Refresh all data as cascade deletes may affect subtypes
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete type');
      throw err;
    }
  }, [refreshData]);

  const createSubtype = useCallback(async (subtype: Omit<Subtype, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newSubtype = await subtypesAPI.create(subtype);
      await refreshData(); // Refresh all data to update hierarchy
      return newSubtype;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subtype');
      throw err;
    }
  }, [refreshData]);

  const updateSubtype = useCallback(async (id: number, updates: Partial<Subtype>) => {
    try {
      const updatedSubtype = await subtypesAPI.update(id, updates);
      await refreshData(); // Refresh all data to update hierarchy
      return updatedSubtype;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update subtype');
      throw err;
    }
  }, [refreshData]);

  const deleteSubtype = useCallback(async (id: number) => {
    try {
      await subtypesAPI.delete(id);
      await refreshData(); // Refresh all data to update hierarchy
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete subtype');
      throw err;
    }
  }, [refreshData]);

  // Utility functions
  const getCategoryById = useCallback((id: number): Category | undefined => {
    return categories.find(cat => cat.id === id);
  }, [categories]);

  const getTypeById = useCallback((id: number): Type | undefined => {
    return types.find(type => type.id === id);
  }, [types]);

  const getSubtypeById = useCallback((id: number): Subtype | undefined => {
    return subtypes.find(subtype => subtype.id === id);
  }, [subtypes]);

  const getTypesByCategory = useCallback((categoryId: number): Type[] => {
    return types.filter(type => type.category_id === categoryId);
  }, [types]);

  const getSubtypesByType = useCallback((typeId: number): Subtype[] => {
    return subtypes.filter(subtype => subtype.type_id === typeId);
  }, [subtypes]);

  const getCategoryName = useCallback((id: number): string => {
    const category = getCategoryById(id);
    return category?.name || `Category ${id}`;
  }, [getCategoryById]);

  const getTypeName = useCallback((id: number): string => {
    const type = getTypeById(id);
    return type?.name || `Type ${id}`;
  }, [getTypeById]);

  const getSubtypeName = useCallback((id: number): string => {
    const subtype = getSubtypeById(id);
    return subtype?.name || `Subtype ${id}`;
  }, [getSubtypeById]);

  const getHierarchyPath = useCallback((categoryId: number, typeId: number, subtypeId?: number): string => {
    const parts = [
      getCategoryName(categoryId),
      getTypeName(typeId)
    ];
    
    if (subtypeId) {
      parts.push(getSubtypeName(subtypeId));
    }
    
    return parts.join(' > ');
  }, [getCategoryName, getTypeName, getSubtypeName]);

  return {
    // Data
    categories,
    types,
    subtypes,
    hierarchy,
    
    // Loading states
    loading,
    categoriesLoading,
    typesLoading,
    subtypesLoading,
    
    // Error state
    error,
    
    // CRUD operations
    createCategory,
    updateCategory,
    deleteCategory,
    createType,
    updateType,
    deleteType,
    createSubtype,
    updateSubtype,
    deleteSubtype,
    
    // Utility functions
    refreshData,
    getCategoryById,
    getTypeById,
    getSubtypeById,
    getTypesByCategory,
    getSubtypesByType,
    getCategoryName,
    getTypeName,
    getSubtypeName,
    getHierarchyPath
  };
}; 