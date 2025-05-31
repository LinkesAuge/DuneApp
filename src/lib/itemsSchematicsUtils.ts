import { supabase } from './supabase';
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
  ResolvedField,
  FieldResolutionParams,
  FieldResolutionResult,
  HierarchyValidation,
  ItemValidation,
  SchematicValidation,
  FieldValues,
  AppliesTo,
  FieldType,
  ScopeType
} from '../types';

// =================================
// Field Resolution System
// =================================

/**
 * Resolves inherited fields for a given category and type combination
 */
export async function resolveInheritedFields(
  params: FieldResolutionParams
): Promise<FieldResolutionResult> {
  try {
    const { data, error } = await supabase.rpc('resolve_inherited_fields', {
      p_category_id: params.category_id || null,
      p_type_id: params.type_id || null
    });

    if (error) throw error;

    const fields: ResolvedField[] = data || [];
    
    return {
      fields,
      field_count: fields.length,
      has_required_fields: fields.some(field => field.is_required)
    };
  } catch (error) {
    console.error('Error resolving inherited fields:', error);
    return {
      fields: [],
      field_count: 0,
      has_required_fields: false
    };
  }
}

/**
 * Gets dropdown options for a specific dropdown group
 */
export async function getDropdownOptions(groupId: string): Promise<DropdownOption[]> {
  try {
    const { data, error } = await supabase
      .from('dropdown_options')
      .select('*')
      .eq('group_id', groupId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching dropdown options:', error);
    return [];
  }
}

/**
 * Validates field values against their definitions
 */
export function validateFieldValues(
  fieldValues: FieldValues,
  fieldDefinitions: ResolvedField[]
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  const requiredFields = fieldDefinitions.filter(field => field.is_required);
  for (const field of requiredFields) {
    const value = fieldValues[field.name];
    if (value === null || value === undefined || value === '') {
      errors.push(`${field.display_name} is required`);
    }
  }

  // Validate field types
  for (const field of fieldDefinitions) {
    const value = fieldValues[field.name];
    if (value !== null && value !== undefined) {
      if (field.field_type === 'number' && typeof value !== 'number') {
        errors.push(`${field.display_name} must be a number`);
      }
      if (field.field_type === 'text' && typeof value !== 'string') {
        errors.push(`${field.display_name} must be text`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// =================================
// Hierarchy Validation System
// =================================

/**
 * Validates item hierarchy integrity
 */
export async function validateItemHierarchy(item: Partial<Item>): Promise<ItemValidation> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Validate category is required
    if (!item.category_id) {
      errors.push('Category is required');
      return { is_valid: false, errors, warnings, item };
    }

    // Validate category applies to items
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('applies_to')
      .eq('id', item.category_id)
      .single();

    if (categoryError) {
      errors.push('Invalid category');
      return { is_valid: false, errors, warnings, item };
    }

    if (!category.applies_to.includes('items' as AppliesTo)) {
      errors.push('Category does not apply to items');
    }

    // Validate type belongs to category if specified
    if (item.type_id) {
      const { data: type, error: typeError } = await supabase
        .from('types')
        .select('category_id')
        .eq('id', item.type_id)
        .single();

      if (typeError) {
        errors.push('Invalid type');
      } else if (type.category_id !== item.category_id) {
        errors.push('Type does not belong to the specified category');
      }
    }

    // Validate subtype belongs to type if specified
    if (item.subtype_id) {
      if (!item.type_id) {
        errors.push('Type is required when subtype is specified');
      } else {
        const { data: subtype, error: subtypeError } = await supabase
          .from('subtypes')
          .select('type_id')
          .eq('id', item.subtype_id)
          .single();

        if (subtypeError) {
          errors.push('Invalid subtype');
        } else if (subtype.type_id !== item.type_id) {
          errors.push('Subtype does not belong to the specified type');
        }
      }
    }

    return {
      is_valid: errors.length === 0,
      errors,
      warnings,
      item
    };
  } catch (error) {
    console.error('Error validating item hierarchy:', error);
    return {
      is_valid: false,
      errors: ['Validation error occurred'],
      warnings,
      item
    };
  }
}

/**
 * Validates schematic hierarchy integrity
 */
export async function validateSchematicHierarchy(schematic: Partial<Schematic>): Promise<SchematicValidation> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Validate category is required
    if (!schematic.category_id) {
      errors.push('Category is required');
      return { is_valid: false, errors, warnings, schematic };
    }

    // Validate category applies to schematics
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('applies_to')
      .eq('id', schematic.category_id)
      .single();

    if (categoryError) {
      errors.push('Invalid category');
      return { is_valid: false, errors, warnings, schematic };
    }

    if (!category.applies_to.includes('schematics' as AppliesTo)) {
      errors.push('Category does not apply to schematics');
    }

    // Validate type belongs to category if specified
    if (schematic.type_id) {
      const { data: type, error: typeError } = await supabase
        .from('types')
        .select('category_id')
        .eq('id', schematic.type_id)
        .single();

      if (typeError) {
        errors.push('Invalid type');
      } else if (type.category_id !== schematic.category_id) {
        errors.push('Type does not belong to the specified category');
      }
    }

    // Validate subtype belongs to type if specified
    if (schematic.subtype_id) {
      if (!schematic.type_id) {
        errors.push('Type is required when subtype is specified');
      } else {
        const { data: subtype, error: subtypeError } = await supabase
          .from('subtypes')
          .select('type_id')
          .eq('id', schematic.subtype_id)
          .single();

        if (subtypeError) {
          errors.push('Invalid subtype');
        } else if (subtype.type_id !== schematic.type_id) {
          errors.push('Subtype does not belong to the specified type');
        }
      }
    }

    return {
      is_valid: errors.length === 0,
      errors,
      warnings,
      schematic
    };
  } catch (error) {
    console.error('Error validating schematic hierarchy:', error);
    return {
      is_valid: false,
      errors: ['Validation error occurred'],
      warnings,
      schematic
    };
  }
}

// =================================
// Data Fetching Utilities
// =================================

/**
 * Fetches all tiers ordered by level
 */
export async function fetchTiers(): Promise<Tier[]> {
  try {
    const { data, error } = await supabase
      .from('tiers')
      .select('*')
      .order('level', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching tiers:', error);
    return [];
  }
}

/**
 * Fetches categories with optional filtering by applies_to
 */
export async function fetchCategories(appliesTo?: AppliesTo): Promise<Category[]> {
  try {
    let query = supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (appliesTo) {
      query = query.contains('applies_to', [appliesTo]);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Fetches types for a specific category
 */
export async function fetchTypesByCategory(categoryId: string): Promise<Type[]> {
  try {
    const { data, error } = await supabase
      .from('types')
      .select('*')
      .eq('category_id', categoryId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching types:', error);
    return [];
  }
}

/**
 * Fetches subtypes for a specific type
 */
export async function fetchSubTypesByType(typeId: string): Promise<SubType[]> {
  try {
    const { data, error } = await supabase
      .from('subtypes')
      .select('*')
      .eq('type_id', typeId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching subtypes:', error);
    return [];
  }
}

/**
 * Fetches all dropdown groups with their options
 */
export async function fetchDropdownGroupsWithOptions(): Promise<(DropdownGroup & { options: DropdownOption[] })[]> {
  try {
    const { data: groups, error: groupsError } = await supabase
      .from('dropdown_groups')
      .select('*')
      .order('name', { ascending: true });

    if (groupsError) throw groupsError;

    if (!groups || groups.length === 0) return [];

    const { data: options, error: optionsError } = await supabase
      .from('dropdown_options')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (optionsError) throw optionsError;

    return groups.map(group => ({
      ...group,
      options: (options || []).filter(option => option.group_id === group.id)
    }));
  } catch (error) {
    console.error('Error fetching dropdown groups with options:', error);
    return [];
  }
}

// =================================
// Name Validation Utilities
// =================================

/**
 * Checks if an item name is unique
 */
export async function isItemNameUnique(name: string, excludeId?: string): Promise<boolean> {
  try {
    let query = supabase
      .from('items')
      .select('id')
      .ilike('name', name);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return !data || data.length === 0;
  } catch (error) {
    console.error('Error checking item name uniqueness:', error);
    return false;
  }
}

/**
 * Checks if a schematic name is unique
 */
export async function isSchematicNameUnique(name: string, excludeId?: string): Promise<boolean> {
  try {
    let query = supabase
      .from('schematics')
      .select('id')
      .ilike('name', name);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return !data || data.length === 0;
  } catch (error) {
    console.error('Error checking schematic name uniqueness:', error);
    return false;
  }
}

// =================================
// Formatting Utilities
// =================================

/**
 * Formats field values for display
 */
export function formatFieldValue(value: any, fieldType: FieldType): string {
  if (value === null || value === undefined) return '';
  
  switch (fieldType) {
    case 'number':
      return typeof value === 'number' ? value.toString() : String(value);
    case 'text':
      return String(value);
    case 'dropdown':
      return String(value);
    default:
      return String(value);
  }
}

/**
 * Gets display text for a dropdown value
 */
export function getDropdownDisplayText(
  value: string,
  options: DropdownOption[]
): string {
  const option = options.find(opt => opt.value === value);
  return option?.display_text || value;
}

/**
 * Builds a hierarchical display name for an item/schematic
 */
export function buildHierarchicalName(
  name: string,
  categoryName?: string,
  typeName?: string,
  subtypeName?: string
): string {
  const parts = [name];
  
  if (subtypeName) parts.unshift(subtypeName);
  if (typeName) parts.unshift(typeName);
  if (categoryName) parts.unshift(categoryName);
  
  return parts.join(' > ');
} 