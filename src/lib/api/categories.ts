import { supabase } from '../supabase';

/**
 * Categories API - Database-driven category management
 * Provides CRUD operations for the normalized category/type/subtype structure
 */

// TypeScript interfaces for the normalized structure
export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Type {
  id: number;
  name: string;
  category_id: number;
  description?: string;
  icon?: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Subtype {
  id: number;
  name: string;
  type_id: number;
  description?: string;
  icon?: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

// Enhanced interfaces with relationships
export interface CategoryWithTypes extends Category {
  types?: Type[];
}

export interface TypeWithSubtypes extends Type {
  subtypes?: Subtype[];
  category?: Category;
}

export interface SubtypeWithParents extends Subtype {
  type?: Type;
  category?: Category;
}

// API Error handling
class CategoryAPIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'CategoryAPIError';
  }
}

function handleSupabaseError(error: any, operation: string): never {
  console.error(`Category API Error (${operation}):`, error);
  throw new CategoryAPIError(
    `Failed to ${operation}: ${error.message}`,
    error.code,
    error.details
  );
}

// Categories API
export const categoriesAPI = {
  /**
   * Get all categories with optional type/subtype loading
   */
  async getAll(includeTypes = false): Promise<CategoryWithTypes[]> {
    try {
      let query = supabase
        .from('categories')
        .select(includeTypes 
          ? '*, types(*, subtypes(*))' 
          : '*'
        )
        .order('sort_order', { ascending: true });

      const { data, error } = await query;

      if (error) {
        handleSupabaseError(error, 'fetch categories');
      }

      return data || [];
    } catch (error) {
      if (error instanceof CategoryAPIError) throw error;
      handleSupabaseError(error, 'fetch categories');
    }
  },

  /**
   * Get category by ID
   */
  async getById(id: number): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        handleSupabaseError(error, 'fetch category by ID');
      }

      return data;
    } catch (error) {
      if (error instanceof CategoryAPIError) throw error;
      handleSupabaseError(error, 'fetch category by ID');
    }
  },

  /**
   * Create new category
   */
  async create(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'create category');
      }

      return data;
    } catch (error) {
      if (error instanceof CategoryAPIError) throw error;
      handleSupabaseError(error, 'create category');
    }
  },

  /**
   * Update category
   */
  async update(id: number, updates: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>): Promise<Category> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'update category');
      }

      return data;
    } catch (error) {
      if (error instanceof CategoryAPIError) throw error;
      handleSupabaseError(error, 'update category');
    }
  },

  /**
   * Delete category
   */
  async delete(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'delete category');
      }
    } catch (error) {
      if (error instanceof CategoryAPIError) throw error;
      handleSupabaseError(error, 'delete category');
    }
  }
};

// Types API
export const typesAPI = {
  /**
   * Get all types with optional category/subtype loading
   */
  async getAll(categoryId?: number, includeSubtypes = false): Promise<TypeWithSubtypes[]> {
    try {
      let query = supabase
        .from('types')
        .select(includeSubtypes 
          ? '*, category:categories(*), subtypes(*)' 
          : '*, category:categories(*)'
        )
        .order('sort_order', { ascending: true });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) {
        handleSupabaseError(error, 'fetch types');
      }

      return data || [];
    } catch (error) {
      if (error instanceof CategoryAPIError) throw error;
      handleSupabaseError(error, 'fetch types');
    }
  },

  /**
   * Get type by ID
   */
  async getById(id: number): Promise<TypeWithSubtypes | null> {
    try {
      const { data, error } = await supabase
        .from('types')
        .select('*, category:categories(*), subtypes(*)')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        handleSupabaseError(error, 'fetch type by ID');
      }

      return data;
    } catch (error) {
      if (error instanceof CategoryAPIError) throw error;
      handleSupabaseError(error, 'fetch type by ID');
    }
  },

  /**
   * Create new type
   */
  async create(type: Omit<Type, 'id' | 'created_at' | 'updated_at'>): Promise<Type> {
    try {
      const { data, error } = await supabase
        .from('types')
        .insert(type)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'create type');
      }

      return data;
    } catch (error) {
      if (error instanceof CategoryAPIError) throw error;
      handleSupabaseError(error, 'create type');
    }
  },

  /**
   * Update type
   */
  async update(id: number, updates: Partial<Omit<Type, 'id' | 'created_at' | 'updated_at'>>): Promise<Type> {
    try {
      const { data, error } = await supabase
        .from('types')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'update type');
      }

      return data;
    } catch (error) {
      if (error instanceof CategoryAPIError) throw error;
      handleSupabaseError(error, 'update type');
    }
  },

  /**
   * Delete type
   */
  async delete(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('types')
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'delete type');
      }
    } catch (error) {
      if (error instanceof CategoryAPIError) throw error;
      handleSupabaseError(error, 'delete type');
    }
  }
};

// Subtypes API
export const subtypesAPI = {
  /**
   * Get all subtypes with optional parent loading
   */
  async getAll(typeId?: number): Promise<SubtypeWithParents[]> {
    try {
      let query = supabase
        .from('subtypes')
        .select('*, type:types(*, category:categories(*))')
        .order('sort_order', { ascending: true });

      if (typeId) {
        query = query.eq('type_id', typeId);
      }

      const { data, error } = await query;

      if (error) {
        handleSupabaseError(error, 'fetch subtypes');
      }

      return data || [];
    } catch (error) {
      if (error instanceof CategoryAPIError) throw error;
      handleSupabaseError(error, 'fetch subtypes');
    }
  },

  /**
   * Get subtype by ID
   */
  async getById(id: number): Promise<SubtypeWithParents | null> {
    try {
      const { data, error } = await supabase
        .from('subtypes')
        .select('*, type:types(*, category:categories(*))')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        handleSupabaseError(error, 'fetch subtype by ID');
      }

      return data;
    } catch (error) {
      if (error instanceof CategoryAPIError) throw error;
      handleSupabaseError(error, 'fetch subtype by ID');
    }
  },

  /**
   * Create new subtype
   */
  async create(subtype: Omit<Subtype, 'id' | 'created_at' | 'updated_at'>): Promise<Subtype> {
    try {
      const { data, error } = await supabase
        .from('subtypes')
        .insert(subtype)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'create subtype');
      }

      return data;
    } catch (error) {
      if (error instanceof CategoryAPIError) throw error;
      handleSupabaseError(error, 'create subtype');
    }
  },

  /**
   * Update subtype
   */
  async update(id: number, updates: Partial<Omit<Subtype, 'id' | 'created_at' | 'updated_at'>>): Promise<Subtype> {
    try {
      const { data, error } = await supabase
        .from('subtypes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'update subtype');
      }

      return data;
    } catch (error) {
      if (error instanceof CategoryAPIError) throw error;
      handleSupabaseError(error, 'update subtype');
    }
  },

  /**
   * Delete subtype
   */
  async delete(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('subtypes')
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'delete subtype');
      }
    } catch (error) {
      if (error instanceof CategoryAPIError) throw error;
      handleSupabaseError(error, 'delete subtype');
    }
  }
};

// Utility functions for working with the hierarchy
export const categoryHierarchyAPI = {
  /**
   * Get complete hierarchy for dropdown/selection interfaces
   */
  async getHierarchy(): Promise<CategoryWithTypes[]> {
    return categoriesAPI.getAll(true);
  },

  /**
   * Get hierarchy path for an entity (category -> type -> subtype)
   */
  async getEntityHierarchy(categoryId: number, typeId: number, subtypeId?: number): Promise<{
    category: Category;
    type: Type;
    subtype?: Subtype;
  }> {
    try {
      const [category, type, subtype] = await Promise.all([
        categoriesAPI.getById(categoryId),
        typesAPI.getById(typeId),
        subtypeId ? subtypesAPI.getById(subtypeId) : Promise.resolve(null)
      ]);

      if (!category || !type) {
        throw new CategoryAPIError('Invalid hierarchy IDs provided');
      }

      return {
        category,
        type,
        subtype: subtype || undefined
      };
    } catch (error) {
      if (error instanceof CategoryAPIError) throw error;
      handleSupabaseError(error, 'fetch entity hierarchy');
    }
  }
}; 