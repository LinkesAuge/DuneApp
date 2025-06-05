import { supabase } from './supabase';
import {
  checkPermission,
  isAdmin,
  isEditorOrHigher,
  isMemberOrHigher,
  isOwner,
  isGlobalContent
} from './itemsSchematicsPermissions';
import {
  resolveInheritedFields,
  validateItemHierarchy,
  validateSchematicHierarchy,
  isItemNameUnique,
  isSchematicNameUnique
} from './itemsSchematicsUtils';
import type {
  User,
  Tier,
  Category,
  Type,

  FieldDefinition,
  DropdownGroup,
  DropdownOption,
  Item,
  Schematic,
  ItemScreenshot,
  SchematicScreenshot,
  ItemWithRelations,
  SchematicWithRelations,
  PermissionCheckResult,
  FieldValues,
  AppliesTo,
  FieldType,
  ScopeType
} from '../types';

// =================================
// Core Result Types
// =================================

export interface CrudResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  permissionError?: boolean;
}

export interface CrudListResult<T> {
  success: boolean;
  data?: T[];
  error?: string;
  permissionError?: boolean;
}

// =================================
// Tier CRUD Operations
// =================================

export async function createTier(
  user: User | null,
  tierData: Omit<Tier, 'id' | 'created_at' | 'updated_at'>
): Promise<CrudResult<Tier>> {
  try {
    // Permission check
    if (!isAdmin(user)) {
      return {
        success: false,
        error: 'Admin role required to create tiers',
        permissionError: true
      };
    }

    // Validate name uniqueness
    const { data: existing, error: checkError } = await supabase
      .from('tiers')
      .select('id')
      .eq('name', tierData.name)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existing) {
      return {
        success: false,
        error: 'A tier with this name already exists'
      };
    }

    // Create tier
    const { data, error } = await supabase
      .from('tiers')
      .insert([{
        ...tierData,
        created_by: user!.id
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error creating tier:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create tier'
    };
  }
}

export async function updateTier(
  user: User | null,
  tierId: string,
  updates: Partial<Tier>
): Promise<CrudResult<Tier>> {
  try {
    // Fetch current tier for permission check
    const { data: currentTier, error: fetchError } = await supabase
      .from('tiers')
      .select('*')
      .eq('id', tierId)
      .single();

    if (fetchError) throw fetchError;

    // Permission check
    const permissionResult = checkPermission({
      user,
      entity: {
        type: 'tier',
        id: tierId,
        created_by: currentTier.created_by,
        is_global: currentTier.created_by === null
      },
      action: 'update'
    });

    if (!permissionResult.allowed) {
      return {
        success: false,
        error: permissionResult.reason || 'Permission denied',
        permissionError: true
      };
    }

    // Update tier with updated_by tracking
    const { data, error } = await supabase
      .from('tiers')
      .update({
        ...updates,
        updated_by: user?.id || null
      })
      .eq('id', tierId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error updating tier:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update tier'
    };
  }
}

export async function deleteTier(
  user: User | null,
  tierId: string
): Promise<CrudResult<boolean>> {
  try {
    // Fetch current tier for permission check
    const { data: currentTier, error: fetchError } = await supabase
      .from('tiers')
      .select('*')
      .eq('id', tierId)
      .single();

    if (fetchError) throw fetchError;

    // Permission check
    const permissionResult = checkPermission({
      user,
      entity: {
        type: 'tier',
        id: tierId,
        created_by: currentTier.created_by,
        is_global: currentTier.created_by === null
      },
      action: 'delete'
    });

    if (!permissionResult.allowed) {
      return {
        success: false,
        error: permissionResult.reason || 'Permission denied',
        permissionError: true
      };
    }

    // Check for dependencies
    const { data: dependencies, error: depError } = await supabase
      .from('items')
      .select('id')
      .eq('tier_id', tierId)
      .limit(1);

    if (depError) throw depError;

    if (dependencies && dependencies.length > 0) {
      return {
        success: false,
        error: 'Cannot delete tier: it is being used by items'
      };
    }

    // Delete tier
    const { error } = await supabase
      .from('tiers')
      .delete()
      .eq('id', tierId);

    if (error) throw error;

    return {
      success: true,
      data: true
    };
  } catch (error) {
    console.error('Error deleting tier:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete tier'
    };
  }
}

export async function fetchTiers(
  user: User | null
): Promise<CrudListResult<Tier>> {
  try {
    if (!isMemberOrHigher(user)) {
      return {
        success: false,
        error: 'Member role required to view tiers',
        permissionError: true
      };
    }

    const { data, error } = await supabase
      .from('tiers')
      .select('*')
      .order('level', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error fetching tiers:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tiers'
    };
  }
}

// =================================
// Category CRUD Operations
// =================================

export async function createCategory(
  user: User | null,
  categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>
): Promise<CrudResult<Category>> {
  try {
    if (!isEditorOrHigher(user)) {
      return {
        success: false,
        error: 'Editor role required to create categories',
        permissionError: true
      };
    }

    // Validate name uniqueness (within user's visible scope)
    const { data: existing, error: checkError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryData.name);

    if (checkError) {
      throw checkError;
    }

    if (existing && existing.length > 0) {
      return {
        success: false,
        error: 'A category with this name already exists'
      };
    }

    // Create category
    const { data, error } = await supabase
      .from('categories')
      .insert([{
        ...categoryData,
        created_by: user!.id,
        updated_by: user!.id, // Set initial updated_by to creator
        is_global: true
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error creating category:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create category'
    };
  }
}

export async function updateCategory(
  user: User | null,
  categoryId: string,
  updates: Partial<Category>
): Promise<CrudResult<Category>> {
  try {
    // Fetch current category for permission check
    const { data: currentCategory, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (fetchError) throw fetchError;

    // Permission check
    const permissionResult = checkPermission({
      user,
      entity: {
        type: 'category',
        id: categoryId,
        created_by: currentCategory.created_by,
        is_global: currentCategory.is_global
      },
      action: 'update'
    });

    if (!permissionResult.allowed) {
      return {
        success: false,
        error: permissionResult.reason || 'Permission denied',
        permissionError: true
      };
    }

    // Check name uniqueness if name is being updated
    if (updates.name && updates.name !== currentCategory.name) {
      const { data: existing, error: checkError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', updates.name)
        .neq('id', categoryId);

      if (checkError) {
        throw checkError;
      }

      if (existing && existing.length > 0) {
        return {
          success: false,
          error: `Category name '${updates.name}' already exists`
        };
      }
    }

    // Update category with updated_by field
    const { data, error } = await supabase
      .from('categories')
      .update({
        ...updates,
        updated_by: user?.id || null
      })
      .eq('id', categoryId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error updating category:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update category'
    };
  }
}

// Interface for category dependency information
export interface CategoryDependencies {
  types: number;
  items: number;
  schematics: number;
  total: number;
  hasAny: boolean;
}

// Get detailed dependency information for a category
export async function getCategoryDependencies(
  user: User | null,
  categoryId: string
): Promise<CrudResult<CategoryDependencies>> {
  try {
    if (!isMemberOrHigher(user)) {
      return {
        success: false,
        error: 'Member role required to check category dependencies',
        permissionError: true
      };
    }

    // Count types
    const { count: typeCount, error: typeError } = await supabase
      .from('types')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId);

    if (typeError) throw typeError;

    // Count items
    const { count: itemCount, error: itemError } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId);

    if (itemError) throw itemError;

    // Count schematics
    const { count: schematicCount, error: schematicError } = await supabase
      .from('schematics')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId);

    if (schematicError) throw schematicError;

    const dependencies: CategoryDependencies = {
      types: typeCount || 0,
      items: itemCount || 0,
      schematics: schematicCount || 0,
      total: (typeCount || 0) + (itemCount || 0) + (schematicCount || 0),
      hasAny: (typeCount || 0) > 0 || (itemCount || 0) > 0 || (schematicCount || 0) > 0
    };

    return {
      success: true,
      data: dependencies
    };
  } catch (error) {
    console.error('Error checking category dependencies:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check category dependencies'
    };
  }
}

// Migrate all content from one category to another
export async function migrateCategoryContent(
  user: User | null,
  fromCategoryId: string,
  toCategoryId: string
): Promise<CrudResult<{ migrated: number; errors: string[] }>> {
  try {
    // Permission checks for both categories
    const { data: fromCategory, error: fromError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', fromCategoryId)
      .single();

    if (fromError) throw fromError;

    const { data: toCategory, error: toError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', toCategoryId)
      .single();

    if (toError) throw toError;

    // Check permissions for source category
    const fromPermission = checkPermission({
      user,
      entity: {
        type: 'category',
        id: fromCategoryId,
        created_by: fromCategory.created_by,
        is_global: fromCategory.is_global
      },
      action: 'delete'
    });

    if (!fromPermission.allowed) {
      return {
        success: false,
        error: 'Permission denied to migrate from source category',
        permissionError: true
      };
    }

    // Check permissions for target category  
    const toPermission = checkPermission({
      user,
      entity: {
        type: 'category',
        id: toCategoryId,
        created_by: toCategory.created_by,
        is_global: toCategory.is_global
      },
      action: 'update'
    });

    if (!toPermission.allowed) {
      return {
        success: false,
        error: 'Permission denied to migrate to target category',
        permissionError: true
      };
    }

    let migratedCount = 0;
    const errors: string[] = [];

    // Migrate types
    try {
  
      
      const { count: typeCount, error: typeError } = await supabase
        .from('types')
        .update({ 
          category_id: toCategoryId,
          updated_by: user?.id || null
        })
        .eq('category_id', fromCategoryId)
        .select('*', { count: 'exact' });

      if (typeError) {
        console.error('🚨 Type migration error details:', {
          message: typeError.message,
          code: typeError.code,
          details: typeError.details,
          hint: typeError.hint
        });
        throw typeError;
      }
      
      migratedCount += typeCount || 0;
    } catch (error) {
      const errorMessage = `Failed to migrate types: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error('🚨 Type migration failed:', errorMessage);
      errors.push(errorMessage);
    }

    // Migrate items  
    try {

      const { count: itemCount, error: itemError } = await supabase
        .from('items')
        .update({ 
          category_id: toCategoryId,
          updated_by: user?.id || null
        })
        .eq('category_id', fromCategoryId)
        .select('*', { count: 'exact' });

      if (itemError) {
        console.error('🚨 Item migration error details:', {
          message: itemError.message,
          code: itemError.code,
          details: itemError.details,
          hint: itemError.hint
        });
        throw itemError;
      }
      
      migratedCount += itemCount || 0;
    } catch (error) {
      const errorMessage = `Failed to migrate items: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error('🚨 Item migration failed:', errorMessage);
      errors.push(errorMessage);
    }

    // Migrate schematics
    try {

      const { count: schematicCount, error: schematicError } = await supabase
        .from('schematics')
        .update({ 
          category_id: toCategoryId,
          updated_by: user?.id || null
        })
        .eq('category_id', fromCategoryId)
        .select('*', { count: 'exact' });

      if (schematicError) {
        console.error('🚨 Schematic migration error details:', {
          message: schematicError.message,
          code: schematicError.code,
          details: schematicError.details,
          hint: schematicError.hint
        });
        throw schematicError;
      }
      
      migratedCount += schematicCount || 0;
    } catch (error) {
      const errorMessage = `Failed to migrate schematics: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error('🚨 Schematic migration failed:', errorMessage);
      errors.push(errorMessage);
    }

    // Only return success if there were no errors
    if (errors.length > 0) {
      return {
        success: false,
        error: `Migration failed: ${errors.join('; ')}`,
        data: { migrated: migratedCount, errors }
      };
    }

    return {
      success: true,
      data: { migrated: migratedCount, errors }
    };
  } catch (error) {
    console.error('Error migrating category content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to migrate category content'
    };
  }
}

export async function deleteCategory(
  user: User | null,
  categoryId: string,
  migrateToCategoryId?: string
): Promise<CrudResult<boolean>> {
  try {
    // Fetch current category for permission check
    const { data: currentCategory, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (fetchError) throw fetchError;

    // Permission check
    const permissionResult = checkPermission({
      user,
      entity: {
        type: 'category',
        id: categoryId,
        created_by: currentCategory.created_by,
        is_global: currentCategory.is_global
      },
      action: 'delete'
    });

    if (!permissionResult.allowed) {
      return {
        success: false,
        error: permissionResult.reason || 'Permission denied',
        permissionError: true
      };
    }

    // If migration target is provided, migrate content first
    if (migrateToCategoryId) {
      const migrationResult = await migrateCategoryContent(user, categoryId, migrateToCategoryId);
      
      if (!migrationResult.success) {
        console.error(`🚨 Migration failed, aborting deletion:`, migrationResult.error);
        return {
          success: false,
          error: `Migration failed: ${migrationResult.error}`
        };
      }
      
      
      
      // Verify no remaining dependencies after migration
      const remainingDeps = await getCategoryDependencies(user, categoryId);
      
      
      if (remainingDeps.success && remainingDeps.data?.hasAny) {
        const errorMessage = `Migration incomplete: ${remainingDeps.data.types} types, ${remainingDeps.data.items} items, ${remainingDeps.data.schematics} schematics still remain`;
        console.error(`🚨 ${errorMessage}`);
        return { success: false, error: errorMessage };
      }
    } else {
      // Check for dependencies if no migration target provided
      const dependencyResult = await getCategoryDependencies(user, categoryId);
      if (!dependencyResult.success) {
        return {
          success: false,
          error: `Failed to check dependencies: ${dependencyResult.error}`
        };
      }

      if (dependencyResult.data!.hasAny) {
        return {
          success: false,
          error: `Cannot delete category: it contains ${dependencyResult.data!.types} types, ${dependencyResult.data!.items} items, and ${dependencyResult.data!.schematics} schematics. Please migrate content to another category first.`,
          data: dependencyResult.data
        };
      }
    }

    // Delete category
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;

    return {
      success: true,
      data: true
    };
  } catch (error) {
    console.error('Error deleting category:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete category'
    };
  }
}

export async function fetchCategories(
  user: User | null,
  appliesTo?: AppliesTo
): Promise<CrudListResult<Category>> {
  try {
    if (!isMemberOrHigher(user)) {
      return {
        success: false,
        error: 'Member role required to view categories',
        permissionError: true
      };
    }

    let query = supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (appliesTo) {
      query = query.contains('applies_to', [appliesTo]);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch categories'
    };
  }
}

// =================================
// Type CRUD Operations
// =================================

export async function createType(
  user: User | null,
  typeData: Omit<Type, 'id' | 'created_at' | 'updated_at'>
): Promise<CrudResult<Type>> {
  try {
    if (!isEditorOrHigher(user)) {
      return {
        success: false,
        error: 'Editor role required to create types',
        permissionError: true
      };
    }

    // Validate name uniqueness within category
    const { data: existing, error: checkError } = await supabase
      .from('types')
      .select('id')
      .eq('name', typeData.name)
      .eq('category_id', typeData.category_id);

    if (checkError) {
      throw checkError;
    }

    if (existing && existing.length > 0) {
      return {
        success: false,
        error: 'A type with this name already exists in this category'
      };
    }

    // Create type
    const { data, error } = await supabase
      .from('types')
      .insert([{
        ...typeData,
        created_by: user!.id,
        updated_by: user!.id, // Set initial updated_by to creator
        is_global: true
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error creating type:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create type'
    };
  }
}

export async function fetchTypes(
  user: User | null
): Promise<CrudListResult<Type>> {
  try {
    if (!isMemberOrHigher(user)) {
      return {
        success: false,
        error: 'Member role required to view types',
        permissionError: true
      };
    }

    const { data, error } = await supabase
      .from('types')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error fetching types:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch types'
    };
  }
}

export async function fetchTypesByCategory(
  user: User | null,
  categoryId: string
): Promise<CrudListResult<Type>> {
  try {
    if (!isMemberOrHigher(user)) {
      return {
        success: false,
        error: 'Member role required to view types',
        permissionError: true
      };
    }

    const { data, error } = await supabase
      .from('types')
      .select('*')
      .eq('category_id', categoryId)
      .order('name', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error fetching types:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch types'
    };
  }
}

export async function deleteType(
  user: User | null,
  typeId: string
): Promise<CrudResult<boolean>> {
  try {
    if (!isEditorOrHigher(user)) {
      return {
        success: false,
        error: 'Editor role required to delete types',
        permissionError: true
      };
    }

    // Check dependencies
    const depsResult = await getTypeDependencies(user, typeId);
    if (!depsResult.success || (depsResult.data && depsResult.data.total_count > 0)) {
      return {
        success: false,
        error: 'Cannot delete type: type has dependencies. Migrate content first.'
      };
    }

    const { error } = await supabase
      .from('types')
      .delete()
      .eq('id', typeId);

    if (error) throw error;

    return {
      success: true,
      data: true
    };
  } catch (error) {
    console.error('Error deleting type:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete type'
    };
  }
}

export async function getTypeDependencies(
  user: User | null,
  typeId: string
): Promise<CrudResult<TypeDependencies>> {
  try {
    if (!isMemberOrHigher(user)) {
      return {
        success: false,
        error: 'Member role required to check type dependencies',
        permissionError: true
      };
    }



    // Count items
    const { count: itemsCount } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: true })
      .eq('type_id', typeId);

    // Count schematics
    const { count: schematicsCount } = await supabase
      .from('schematics')
      .select('*', { count: 'exact', head: true })
      .eq('type_id', typeId);

    const dependencies: TypeDependencies = {
      items_count: itemsCount || 0,
      schematics_count: schematicsCount || 0,
      total_count: (itemsCount || 0) + (schematicsCount || 0)
    };

    return {
      success: true,
      data: dependencies
    };
  } catch (error) {
    console.error('Error getting type dependencies:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get type dependencies'
    };
  }
}

export async function migrateTypeContent(
  user: User | null,
  fromTypeId: string,
  toTypeId: string
): Promise<CrudResult<{ migrated: number; errors: string[] }>> {
  try {
    if (!isEditorOrHigher(user)) {
      return {
        success: false,
        error: 'Editor role required to migrate type content',
        permissionError: true
      };
    }

    let migrated = 0;
    const errors: string[] = [];



    // Migrate items
    try {
      const { count: itemsMigrated } = await supabase
        .from('items')
        .update({ 
          type_id: toTypeId,
          updated_by: user!.id,
          updated_at: new Date().toISOString()
        })
        .eq('type_id', fromTypeId)
        .select('*', { count: 'exact' });
      
      migrated += itemsMigrated || 0;
    } catch (error) {
      errors.push(`Failed to migrate items: ${error}`);
    }

    // Migrate schematics
    try {
      const { count: schematicsMigrated } = await supabase
        .from('schematics')
        .update({ 
          type_id: toTypeId,
          updated_by: user!.id,
          updated_at: new Date().toISOString()
        })
        .eq('type_id', fromTypeId)
        .select('*', { count: 'exact' });
      
      migrated += schematicsMigrated || 0;
    } catch (error) {
      errors.push(`Failed to migrate schematics: ${error}`);
    }

    return {
      success: true,
      data: { migrated, errors }
    };
  } catch (error) {
    console.error('Error migrating type content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to migrate type content'
    };
  }
}

// =================================
// Item CRUD Operations
// =================================

export async function createItem(
  user: User | null,
  itemData: Omit<Item, 'id' | 'created_at' | 'updated_at'>
): Promise<CrudResult<Item>> {
  try {
    if (!isMemberOrHigher(user)) {
      return {
        success: false,
        error: 'Member role required to create items',
        permissionError: true
      };
    }

    // Validate hierarchy
    const hierarchyValidation = await validateItemHierarchy({
      category_id: itemData.category_id,
      type_id: itemData.type_id
    });

    if (!hierarchyValidation.is_valid) {
      return {
        success: false,
        error: hierarchyValidation.errors.join(', ')
      };
    }

    // Validate name uniqueness
    const isUnique = await isItemNameUnique(itemData.name);
    if (!isUnique) {
      return {
        success: false,
        error: 'An item with this name already exists'
      };
    }

    // Create item
    const { data, error } = await supabase
      .from('items')
      .insert([{
        ...itemData,
        created_by: user!.id,
        is_global: false
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error creating item:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create item'
    };
  }
}

export async function fetchItems(
  user: User | null,
  filters?: {
    category_id?: string;
    type_id?: string;
    tier_id?: string;
    created_by?: string;
  }
): Promise<CrudListResult<ItemWithRelations>> {
  try {
    if (!isMemberOrHigher(user)) {
      return {
        success: false,
        error: 'Member role required to view items',
        permissionError: true
      };
    }

    let query = supabase
      .from('items')
      .select(`
        *,
        category:categories(*),
        type:types(*),
        tier:tiers(*),
        screenshots:item_screenshots(*)
      `)
      .order('name', { ascending: true });

    if (filters) {
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters.type_id) {
        query = query.eq('type_id', filters.type_id);
      }
      if (filters.tier_id) {
        query = query.eq('tier_id', filters.tier_id);
      }
      if (filters.created_by) {
        query = query.eq('created_by', filters.created_by);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error fetching items:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch items'
    };
  }
}

// =================================
// Schematic CRUD Operations
// =================================

export async function createSchematic(
  user: User | null,
  schematicData: Omit<Schematic, 'id' | 'created_at' | 'updated_at'>
): Promise<CrudResult<Schematic>> {
  try {
    if (!isMemberOrHigher(user)) {
      return {
        success: false,
        error: 'Member role required to create schematics',
        permissionError: true
      };
    }

    // Validate hierarchy
    const hierarchyValidation = await validateSchematicHierarchy({
      category_id: schematicData.category_id,
      type_id: schematicData.type_id
    });

    if (!hierarchyValidation.is_valid) {
      return {
        success: false,
        error: hierarchyValidation.errors.join(', ')
      };
    }

    // Validate name uniqueness
    const isUnique = await isSchematicNameUnique(schematicData.name);
    if (!isUnique) {
      return {
        success: false,
        error: 'A schematic with this name already exists'
      };
    }

    // Create schematic

    const { data, error } = await supabase
      .from('schematics')
      .insert([{
        ...schematicData,
        created_by: user!.id,
        is_global: false
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error creating schematic:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create schematic'
    };
  }
}

export async function fetchSchematics(
  user: User | null,
  filters?: {
    category_id?: string;
    type_id?: string;
    tier_id?: string;
    created_by?: string;
  }
): Promise<CrudListResult<SchematicWithRelations>> {
  try {
    if (!isMemberOrHigher(user)) {
      return {
        success: false,
        error: 'Member role required to view schematics',
        permissionError: true
      };
    }

    let query = supabase
      .from('schematics')
      .select(`
        *,
        category:categories(*),
        type:types(*),
        tier:tiers(*),
        screenshots:schematic_screenshots(*)
      `)
      .order('name', { ascending: true });

    if (filters) {
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters.type_id) {
        query = query.eq('type_id', filters.type_id);
      }
      if (filters.tier_id) {
        query = query.eq('tier_id', filters.tier_id);
      }
      if (filters.created_by) {
        query = query.eq('created_by', filters.created_by);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error fetching schematics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch schematics'
    };
  }
}

// =================================
// Field Definition Operations
// =================================

export async function createFieldDefinition(
  user: User | null,
  fieldData: Omit<FieldDefinition, 'id' | 'created_at' | 'updated_at'>
): Promise<CrudResult<FieldDefinition>> {
  try {
    if (!isAdmin(user)) {
      return {
        success: false,
        error: 'Admin role required to create field definitions',
        permissionError: true
      };
    }

    // Create field definition
    const { data, error } = await supabase
      .from('field_definitions')
      .insert([{
        ...fieldData,
        created_by: user!.id
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error creating field definition:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create field definition'
    };
  }
}

export async function fetchFieldDefinitions(
  user: User | null,
  scope?: { scope_type?: ScopeType; scope_id?: string }
): Promise<CrudListResult<FieldDefinition>> {
  try {
    if (!isMemberOrHigher(user)) {
      return {
        success: false,
        error: 'Member role required to view field definitions',
        permissionError: true
      };
    }

    let query = supabase
      .from('field_definitions')
      .select('*')
      .order('display_order', { ascending: true });

    if (scope) {
      if (scope.scope_type) {
        query = query.eq('scope_type', scope.scope_type);
      }
      if (scope.scope_id) {
        query = query.eq('scope_id', scope.scope_id);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error fetching field definitions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch field definitions'
    };
  }
}

// =================================
// Dropdown Group Operations
// =================================

export async function createDropdownGroup(
  user: User | null,
  groupData: Omit<DropdownGroup, 'id' | 'created_at' | 'updated_at'>
): Promise<CrudResult<DropdownGroup>> {
  try {
    if (!isAdmin(user)) {
      return {
        success: false,
        error: 'Admin role required to create dropdown groups',
        permissionError: true
      };
    }

    // Create dropdown group
    const { data, error } = await supabase
      .from('dropdown_groups')
      .insert([{
        ...groupData,
        created_by: user!.id
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error creating dropdown group:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create dropdown group'
    };
  }
}

export async function fetchDropdownGroups(
  user: User | null
): Promise<CrudListResult<DropdownGroup>> {
  try {
    if (!isMemberOrHigher(user)) {
      return {
        success: false,
        error: 'Member role required to view dropdown groups',
        permissionError: true
      };
    }

    const { data, error } = await supabase
      .from('dropdown_groups')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error fetching dropdown groups:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch dropdown groups'
    };
  }
}

export async function fetchDropdownOptions(
  user: User | null,
  groupId: string
): Promise<CrudListResult<DropdownOption>> {
  try {
    if (!isMemberOrHigher(user)) {
      return {
        success: false,
        error: 'Member role required to view dropdown options',
        permissionError: true
      };
    }

    const { data, error } = await supabase
      .from('dropdown_options')
      .select('*')
      .eq('group_id', groupId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error fetching dropdown options:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch dropdown options'
    };
  }
}

// =================================
// Update Functions (Complete CRUD)
// =================================

export async function updateType(
  user: User | null,
  typeId: string,
  updates: Partial<Type>
): Promise<CrudResult<Type>> {
  try {
    // Fetch current type for permission check
    const { data: currentType, error: fetchError } = await supabase
      .from('types')
      .select('*')
      .eq('id', typeId)
      .single();

    if (fetchError) throw fetchError;

    // Permission check
    const permissionResult = checkPermission({
      user,
      entity: {
        type: 'type',
        id: typeId,
        created_by: currentType.created_by,
        is_global: currentType.is_global
      },
      action: 'update'
    });

    if (!permissionResult.allowed) {
      return {
        success: false,
        error: permissionResult.reason || 'Permission denied',
        permissionError: true
      };
    }

    // Update type with updated_by tracking
    const { data, error } = await supabase
      .from('types')
      .update({
        ...updates,
        updated_by: user?.id || null
      })
      .eq('id', typeId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error updating type:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update type'
    };
  }
}

export async function updateFieldDefinition(
  user: User | null,
  fieldId: string,
  updates: Partial<FieldDefinition>
): Promise<CrudResult<FieldDefinition>> {
  try {
    // Fetch current field definition for permission check
    const { data: currentField, error: fetchError } = await supabase
      .from('field_definitions')
      .select('*')
      .eq('id', fieldId)
      .single();

    if (fetchError) throw fetchError;

    // Permission check
    const permissionResult = checkPermission({
      user,
      entity: {
        type: 'field_definition',
        id: fieldId,
        created_by: currentField.created_by
      },
      action: 'update'
    });

    if (!permissionResult.allowed) {
      return {
        success: false,
        error: permissionResult.reason || 'Permission denied',
        permissionError: true
      };
    }

    // Update field definition with updated_by tracking
    const { data, error } = await supabase
      .from('field_definitions')
      .update({
        ...updates,
        updated_by: user?.id || null
      })
      .eq('id', fieldId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error updating field definition:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update field definition'
    };
  }
}

export async function deleteFieldDefinition(
  user: User | null,
  fieldId: string
): Promise<CrudResult<boolean>> {
  try {
    // Fetch current field definition for permission check
    const { data: currentField, error: fetchError } = await supabase
      .from('field_definitions')
      .select('*')
      .eq('id', fieldId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return {
          success: false,
          error: 'Field definition not found'
        };
      }
      throw fetchError;
    }

    // Permission check
    const permissionResult = checkPermission({
      user,
      entity: {
        type: 'field_definition',
        id: fieldId,
        created_by: currentField.created_by
      },
      action: 'delete'
    });

    if (!permissionResult.allowed) {
      return {
        success: false,
        error: permissionResult.reason || 'Permission denied',
        permissionError: true
      };
    }

    // TODO: Check for dependencies (field values in items/schematics) before deletion
    // For now, we'll proceed with deletion and rely on database constraints

    // Delete field definition
    const { error } = await supabase
      .from('field_definitions')
      .delete()
      .eq('id', fieldId);

    if (error) throw error;

    return {
      success: true,
      data: true
    };
  } catch (error) {
    console.error('Error deleting field definition:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete field definition'
    };
  }
}

export async function deleteDropdownGroup(
  user: User | null,
  groupId: string
): Promise<CrudResult<boolean>> {
  try {
    // Fetch current dropdown group for permission check
    const { data: currentGroup, error: fetchError } = await supabase
      .from('dropdown_groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return {
          success: false,
          error: 'Dropdown group not found'
        };
      }
      throw fetchError;
    }

    // Permission check
    const permissionResult = checkPermission({
      user,
      entity: {
        type: 'dropdown_group',
        id: groupId,
        created_by: currentGroup.created_by
      },
      action: 'delete'
    });

    if (!permissionResult.allowed) {
      return {
        success: false,
        error: permissionResult.reason || 'Permission denied',
        permissionError: true
      };
    }

    // TODO: Check for dependencies (fields using this group) before deletion
    // For now, we'll proceed with deletion and rely on database constraints

    // Delete dropdown group
    const { error } = await supabase
      .from('dropdown_groups')
      .delete()
      .eq('id', groupId);

    if (error) throw error;

    return {
      success: true,
      data: true
    };
  } catch (error) {
    console.error('Error deleting dropdown group:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete dropdown group'
    };
  }
}

export async function createDropdownOption(
  user: User | null,
  optionData: Omit<DropdownOption, 'id' | 'created_at' | 'updated_at'>
): Promise<CrudResult<DropdownOption>> {
  try {
    if (!isEditorOrHigher(user)) {
      return {
        success: false,
        error: 'Editor role required to create dropdown options',
        permissionError: true
      };
    }

    // Check if value is unique within the group
    const { data: existing, error: checkError } = await supabase
      .from('dropdown_options')
      .select('id')
      .eq('group_id', optionData.group_id)
      .eq('value', optionData.value);

    if (checkError) throw checkError;

    if (existing && existing.length > 0) {
      return {
        success: false,
        error: 'An option with this value already exists in this group'
      };
    }

    // Create dropdown option
    const { data, error } = await supabase
      .from('dropdown_options')
      .insert([{
        ...optionData,
        updated_by: user!.id
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error creating dropdown option:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create dropdown option'
    };
  }
}

export async function updateDropdownOption(
  user: User | null,
  optionId: string,
  updates: Partial<DropdownOption>
): Promise<CrudResult<DropdownOption>> {
  try {
    // Fetch current dropdown option for permission check
    const { data: currentOption, error: fetchError } = await supabase
      .from('dropdown_options')
      .select('*')
      .eq('id', optionId)
      .single();

    if (fetchError) throw fetchError;

    // Permission check (note: dropdown options don't have created_by, using group permission)
    const permissionResult = checkPermission({
      user,
      entity: {
        type: 'dropdown_group',
        id: currentOption.group_id
      },
      action: 'update'
    });

    if (!permissionResult.allowed) {
      return {
        success: false,
        error: permissionResult.reason || 'Permission denied',
        permissionError: true
      };
    }

    // If updating value, check for duplicates within the same group
    if (updates.value && updates.value !== currentOption.value) {
      const { data: existing, error: dupError } = await supabase
        .from('dropdown_options')
        .select('id')
        .eq('group_id', currentOption.group_id)
        .eq('value', updates.value)
        .neq('id', optionId);

      if (dupError) throw dupError;

      if (existing && existing.length > 0) {
        return {
          success: false,
          error: 'An option with this value already exists in this group'
        };
      }
    }

    // Update dropdown option
    const { data, error } = await supabase
      .from('dropdown_options')
      .update({
        ...updates,
        updated_by: user?.id || null
      })
      .eq('id', optionId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error updating dropdown option:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update dropdown option'
    };
  }
}

export async function deleteDropdownOption(
  user: User | null,
  optionId: string
): Promise<CrudResult<boolean>> {
  try {
    // Fetch current dropdown option for permission check
    const { data: currentOption, error: fetchError } = await supabase
      .from('dropdown_options')
      .select('*')
      .eq('id', optionId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return {
          success: false,
          error: 'Dropdown option not found'
        };
      }
      throw fetchError;
    }

    // Permission check (note: dropdown options don't have created_by, using group permission)
    const permissionResult = checkPermission({
      user,
      entity: {
        type: 'dropdown_group',
        id: currentOption.group_id
      },
      action: 'delete'
    });

    if (!permissionResult.allowed) {
      return {
        success: false,
        error: permissionResult.reason || 'Permission denied',
        permissionError: true
      };
    }

    // Delete dropdown option
    const { error } = await supabase
      .from('dropdown_options')
      .delete()
      .eq('id', optionId);

    if (error) throw error;

    return {
      success: true,
      data: true
    };
  } catch (error) {
    console.error('Error deleting dropdown option:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete dropdown option'
    };
  }
}

export async function updateDropdownGroup(
  user: User | null,
  groupId: string,
  updates: Partial<DropdownGroup>
): Promise<CrudResult<DropdownGroup>> {
  try {
    // Fetch current dropdown group for permission check
    const { data: currentGroup, error: fetchError } = await supabase
      .from('dropdown_groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (fetchError) throw fetchError;

    // Permission check
    const permissionResult = checkPermission({
      user,
      entity: {
        type: 'dropdown_group',
        id: groupId,
        created_by: currentGroup.created_by
      },
      action: 'update'
    });

    if (!permissionResult.allowed) {
      return {
        success: false,
        error: permissionResult.reason || 'Permission denied',
        permissionError: true
      };
    }

    // Update dropdown group with updated_by tracking
    const { data, error } = await supabase
      .from('dropdown_groups')
      .update({
        ...updates,
        updated_by: user?.id || null
      })
      .eq('id', groupId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error updating dropdown group:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update dropdown group'
    };
  }
}

export async function updateItem(
  user: User | null,
  itemId: string,
  updates: Partial<Item>
): Promise<CrudResult<Item>> {
  try {
    // Fetch current item for permission check
    const { data: currentItem, error: fetchError } = await supabase
      .from('items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (fetchError) throw fetchError;

    // Permission check
    const permissionResult = checkPermission({
      user,
      entity: {
        type: 'item',
        id: itemId,
        created_by: currentItem.created_by,
        is_global: currentItem.is_global
      },
      action: 'update'
    });

    if (!permissionResult.allowed) {
      return {
        success: false,
        error: permissionResult.reason || 'Permission denied',
        permissionError: true
      };
    }

    // Update item with updated_by tracking
    const { data, error } = await supabase
      .from('items')
      .update({
        ...updates,
        updated_by: user?.id || null
      })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error updating item:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update item'
    };
  }
}

export async function updateSchematic(
  user: User | null,
  schematicId: string,
  updates: Partial<Schematic>
): Promise<CrudResult<Schematic>> {
  try {
    // Fetch current schematic for permission check
    const { data: currentSchematic, error: fetchError } = await supabase
      .from('schematics')
      .select('*')
      .eq('id', schematicId)
      .single();

    if (fetchError) throw fetchError;

    // Permission check
    const permissionResult = checkPermission({
      user,
      entity: {
        type: 'schematic',
        id: schematicId,
        created_by: currentSchematic.created_by,
        is_global: currentSchematic.is_global
      },
      action: 'update'
    });

    if (!permissionResult.allowed) {
      return {
        success: false,
        error: permissionResult.reason || 'Permission denied',
        permissionError: true
      };
    }

    // Update schematic with updated_by tracking
    const { data, error } = await supabase
      .from('schematics')
      .update({
        ...updates,
        updated_by: user?.id || null
      })
      .eq('id', schematicId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error updating schematic:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update schematic'
    };
  }
}

// =================================
// Screenshot Operations
// =================================

export async function uploadItemScreenshot(
  user: User | null,
  itemId: string,
  file: File
): Promise<CrudResult<ItemScreenshot>> {
  try {
    if (!isMemberOrHigher(user)) {
      return {
        success: false,
        error: 'Member role required to upload screenshots',
        permissionError: true
      };
    }

    // Check if user can manage this item
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (itemError) throw itemError;

    const permissionResult = checkPermission({
      user,
      entity: {
        type: 'item',
        id: itemId,
        created_by: item.created_by,
        is_global: item.is_global
      },
      action: 'update'
    });

    if (!permissionResult.allowed) {
      return {
        success: false,
        error: permissionResult.reason || 'Permission denied',
        permissionError: true
      };
    }

    // Upload file to storage
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `item_screenshots/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('screenshots')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('screenshots')
      .getPublicUrl(filePath);

    // Get next sort order
    const { data: existingScreenshots, error: sortError } = await supabase
      .from('item_screenshots')
      .select('sort_order')
      .eq('item_id', itemId)
      .order('sort_order', { ascending: false })
      .limit(1);

    if (sortError) throw sortError;

    const nextSortOrder = existingScreenshots.length > 0 
      ? existingScreenshots[0].sort_order + 1 
      : 1;

    // Create screenshot record
    const { data, error } = await supabase
      .from('item_screenshots')
      .insert([{
        item_id: itemId,
        url: publicUrl,
        original_url: publicUrl,
        uploaded_by: user!.id,
        sort_order: nextSortOrder,
        file_size: file.size,
        file_name: file.name
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error uploading item screenshot:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload screenshot'
    };
  }
}

export async function uploadSchematicScreenshot(
  user: User | null,
  schematicId: string,
  file: File
): Promise<CrudResult<SchematicScreenshot>> {
  try {
    if (!isMemberOrHigher(user)) {
      return {
        success: false,
        error: 'Member role required to upload screenshots',
        permissionError: true
      };
    }

    // Check if user can manage this schematic
    const { data: schematic, error: schematicError } = await supabase
      .from('schematics')
      .select('*')
      .eq('id', schematicId)
      .single();

    if (schematicError) throw schematicError;

    const permissionResult = checkPermission({
      user,
      entity: {
        type: 'schematic',
        id: schematicId,
        created_by: schematic.created_by,
        is_global: schematic.is_global
      },
      action: 'update'
    });

    if (!permissionResult.allowed) {
      return {
        success: false,
        error: permissionResult.reason || 'Permission denied',
        permissionError: true
      };
    }

    // Upload file to storage
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `schematic_screenshots/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('screenshots')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('screenshots')
      .getPublicUrl(filePath);

    // Get next sort order
    const { data: existingScreenshots, error: sortError } = await supabase
      .from('schematic_screenshots')
      .select('sort_order')
      .eq('schematic_id', schematicId)
      .order('sort_order', { ascending: false })
      .limit(1);

    if (sortError) throw sortError;

    const nextSortOrder = existingScreenshots.length > 0 
      ? existingScreenshots[0].sort_order + 1 
      : 1;

    // Create screenshot record
    const { data, error } = await supabase
      .from('schematic_screenshots')
      .insert([{
        schematic_id: schematicId,
        url: publicUrl,
        original_url: publicUrl,
        uploaded_by: user!.id,
        sort_order: nextSortOrder,
        file_size: file.size,
        file_name: file.name
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error uploading schematic screenshot:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload screenshot'
    };
  }
}

// =================================
// Utility Functions
// =================================

export async function getFieldsForEntity(
  user: User | null,
  categoryId?: string,
  typeId?: string
): Promise<CrudResult<any[]>> {
  try {
    if (!isMemberOrHigher(user)) {
      return {
        success: false,
        error: 'Member role required to view fields',
        permissionError: true
      };
    }

    const fieldResult = await resolveInheritedFields({
      category_id: categoryId,
      type_id: typeId
    });

    return {
      success: true,
      data: fieldResult.fields
    };
  } catch (error) {
    console.error('Error getting fields for entity:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get fields'
    };
  }
}

export async function validateEntityHierarchy(
  entityType: 'item' | 'schematic',
  categoryId: string,
  typeId?: string
): Promise<CrudResult<boolean>> {
  try {
    const validationResult = entityType === 'item' 
      ? await validateItemHierarchy({ category_id: categoryId, type_id: typeId })
      : await validateSchematicHierarchy({ category_id: categoryId, type_id: typeId });

    if (!validationResult.is_valid) {
      return {
        success: false,
        error: validationResult.errors.join(', ')
      };
    }

    return {
      success: true,
      data: true
    };
  } catch (error) {
    console.error('Error validating entity hierarchy:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to validate hierarchy'
    };
  }
} 