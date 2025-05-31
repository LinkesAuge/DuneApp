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

    // Update tier
    const { data, error } = await supabase
      .from('tiers')
      .update(updates)
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

    // Validate name uniqueness
    const { data: existing, error: checkError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryData.name)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existing) {
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
    console.error('Error creating category:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create category'
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
      .eq('category_id', typeData.category_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existing) {
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
    console.error('Error creating type:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create type'
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
      type_id: itemData.type_id,
      subtype_id: itemData.subtype_id
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
        subtype:subtypes(*),
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
      type_id: schematicData.type_id,
      subtype_id: schematicData.subtype_id
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
        subtype:subtypes(*),
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
  typeId?: string,
  subtypeId?: string
): Promise<CrudResult<boolean>> {
  try {
    const validationResult = entityType === 'item' 
      ? await validateItemHierarchy({ category_id: categoryId, type_id: typeId, subtype_id: subtypeId })
      : await validateSchematicHierarchy({ category_id: categoryId, type_id: typeId, subtype_id: subtypeId });

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