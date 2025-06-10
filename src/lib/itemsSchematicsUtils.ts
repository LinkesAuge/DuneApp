import { entitiesAPI } from './api/entities';
import type { 
  Entity, 
  Tier,
  EntityFilters 
} from '../types/unified-entities';

// Legacy type compatibility
type AppliesTo = 'items' | 'schematics';

interface Category {
  id: string;
  name: string;
  applies_to: AppliesTo[];
}

interface Type {
  id: string;
  name: string;
  category_id: string;
}

interface DropdownOption {
  id: string;
  value: string;
  label: string;
}

interface DropdownGroup {
  id: string;
  name: string;
  options: DropdownOption[];
}

interface FieldDefinition {
  id: string;
  name: string;
  type: string;
}

// Legacy validation interfaces
interface ItemValidation {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  item: any;
}

interface SchematicValidation {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  schematic: any;
}

interface FieldResolutionParams {
  categoryId?: string;
  typeId?: string;
}

interface FieldResolutionResult {
  fields: any[];
}

// =================================
// Legacy Compatibility Functions
// =================================

/**
 * Legacy field resolution - simplified in unified system
 */
export async function resolveInheritedFields(
  params: FieldResolutionParams
): Promise<FieldResolutionResult> {
  // In unified system, fields are stored in entity.field_values
  // This is kept for compatibility but returns empty
  return { fields: [] };
}

/**
 * Legacy dropdown options - simplified in unified system
 */
export async function getDropdownOptions(groupId: string): Promise<DropdownOption[]> {
  // Dropdown options are handled differently in unified system
  return [];
}

/**
 * Legacy field validation - simplified in unified system
 */
export function validateFieldValues(
  fieldValues: any,
  fieldDefinitions: any[]
): { isValid: boolean; errors: string[]; warnings: string[] } {
  // Field validation is simpler in unified system
  return { isValid: true, errors: [], warnings: [] };
}

/**
 * Legacy item validation - updated for unified entities
 */
export async function validateItemHierarchy(item: Partial<Entity>): Promise<ItemValidation> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Basic validation for unified entities
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
 * Legacy schematic validation - updated for unified entities
 */
export async function validateSchematicHierarchy(schematic: Partial<Entity>): Promise<SchematicValidation> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Basic validation for unified entities
    if (!schematic.name || schematic.name.trim() === '') {
      errors.push('Name is required');
    }
    
    if (!schematic.category || schematic.category.trim() === '') {
      errors.push('Category is required');
    }
    
    if (!schematic.type || schematic.type.trim() === '') {
      errors.push('Type is required');
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
// Data Fetching Utilities - Updated for Unified System
// =================================

/**
 * Fetches all tiers ordered by tier_number (updated for unified system)
 */
export async function fetchTiers(): Promise<Tier[]> {
  try {
    return await entitiesAPI.getTiers();
  } catch (error) {
    console.error('Error fetching tiers:', error);
    return [];
  }
}

/**
 * Fetches categories with optional filtering (derived from entities)
 */
export async function fetchCategories(appliesTo?: AppliesTo): Promise<Category[]> {
  try {
    const response = await entitiesAPI.getAll({ limit: 1000 });
    const entities = response.data;
    
    // Filter entities by type if specified
    const filteredEntities = appliesTo 
      ? entities.filter(e => appliesTo === 'items' ? !e.is_schematic : e.is_schematic)
      : entities;
    
    // Extract unique categories
    const categories = Array.from(new Set(filteredEntities.map(e => e.category)))
      .sort()
      .map(name => ({
        id: name,
        name,
        applies_to: ['items', 'schematics'] as AppliesTo[]
      }));
    
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Fetches types for a specific category (derived from entities)
 */
export async function fetchTypesByCategory(categoryId: string): Promise<Type[]> {
  try {
    const response = await entitiesAPI.getAll({ limit: 1000 });
    const entities = response.data.filter(e => e.category === categoryId);
    
    // Extract unique types
    const types = Array.from(new Set(entities.map(e => e.type)))
      .sort()
      .map(name => ({
        id: name,
        name,
        category_id: categoryId
      }));
    
    return types;
  } catch (error) {
    console.error('Error fetching types:', error);
    return [];
  }
}

/**
 * Legacy dropdown groups - simplified in unified system
 */
export async function fetchDropdownGroupsWithOptions(): Promise<(DropdownGroup & { options: DropdownOption[] })[]> {
  // Dropdown groups are handled differently in unified system
  return [];
}

/**
 * Checks if item name is unique (updated for unified entities)
 */
export async function isItemNameUnique(name: string, excludeId?: string): Promise<boolean> {
  try {
    const response = await entitiesAPI.search({ name, is_schematic: false });
    const existingItems = response.data.filter(item => item.id !== excludeId);
    return existingItems.length === 0;
  } catch (error) {
    console.error('Error checking item name uniqueness:', error);
    return false;
  }
}

/**
 * Checks if schematic name is unique (updated for unified entities)
 */
export async function isSchematicNameUnique(name: string, excludeId?: string): Promise<boolean> {
  try {
    const response = await entitiesAPI.search({ name, is_schematic: true });
    const existingSchematics = response.data.filter(schematic => schematic.id !== excludeId);
    return existingSchematics.length === 0;
  } catch (error) {
    console.error('Error checking schematic name uniqueness:', error);
    return false;
  }
}

// =================================
// Legacy Utility Functions
// =================================

/**
 * Legacy field value formatting - simplified
 */
export function formatFieldValue(value: any, fieldType: string): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

/**
 * Legacy dropdown display text - simplified
 */
export function getDropdownDisplayText(
  value: string,
  options: DropdownOption[]
): string {
  const option = options.find(opt => opt.value === value);
  return option ? option.label : value;
}

/**
 * Legacy hierarchical name builder - simplified
 */
export function buildHierarchicalName(
  name: string,
  categoryName?: string,
  typeName?: string
): string {
  const parts = [name];
  if (categoryName) parts.unshift(categoryName);
  if (typeName) parts.unshift(typeName);
  return parts.join(' > ');
} 