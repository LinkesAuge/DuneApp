import type {
  User,
  UserRole,
  PermissionAction,
  ContentScope,
  EntityType,
  PermissionCheckResult,
  PermissionContext,
  ItemsSchematicsCapabilities,
  BulkPermissionResult,
  Tier,
  Category,
  Type,
  SubType,
  FieldDefinition,
  DropdownGroup,
  Item,
  Schematic
} from '../types';

// =================================
// Core Permission Constants
// =================================

/**
 * Role hierarchy levels for permission escalation
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  'pending': 0,
  'member': 1,
  'editor': 2,
  'admin': 3
};

/**
 * Minimum role levels required for different actions
 */
export const MIN_ROLE_LEVELS = {
  // System management (requires admin or editor+)
  MANAGE_SYSTEM: 2,
  // Global content creation (requires admin)
  CREATE_GLOBAL: 3,
  // Content moderation (requires editor+)
  MODERATE_CONTENT: 2,
  // Basic content creation (requires member+)
  CREATE_CONTENT: 1,
  // Read access (requires member+)
  READ_CONTENT: 1
} as const;

// =================================
// Role and User Utilities
// =================================

/**
 * Checks if user has a specific minimum role level
 */
export function hasMinimumRole(user: User | null, minLevel: number): boolean {
  if (!user) return false;
  return ROLE_HIERARCHY[user.role] >= minLevel;
}

/**
 * Checks if user is an administrator
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

/**
 * Checks if user is an editor or higher
 */
export function isEditorOrHigher(user: User | null): boolean {
  return hasMinimumRole(user, MIN_ROLE_LEVELS.MODERATE_CONTENT);
}

/**
 * Checks if user is a member or higher (not pending)
 */
export function isMemberOrHigher(user: User | null): boolean {
  return hasMinimumRole(user, MIN_ROLE_LEVELS.CREATE_CONTENT);
}

/**
 * Checks if user owns the specified content
 */
export function isOwner(user: User | null, createdBy: string | null): boolean {
  return !!(user && createdBy && user.id === createdBy);
}

/**
 * Checks if content is global (system-created)
 */
export function isGlobalContent(createdBy: string | null): boolean {
  return createdBy === null;
}

// =================================
// Entity-Specific Permission Checks
// =================================

/**
 * Checks permissions for tier operations
 */
export function checkTierPermission(
  user: User | null,
  action: PermissionAction,
  tier?: Tier
): PermissionCheckResult {
  if (!user) {
    return { allowed: false, reason: 'Authentication required' };
  }

  switch (action) {
    case 'read':
      return isMemberOrHigher(user) 
        ? { allowed: true }
        : { allowed: false, reason: 'Member role required to view tiers' };

    case 'create':
    case 'update':
    case 'delete':
    case 'manage':
      if (isAdmin(user)) {
        return { allowed: true };
      }
      
      if (tier && !isGlobalContent(tier.created_by) && isOwner(user, tier.created_by)) {
        return isEditorOrHigher(user)
          ? { allowed: true }
          : { allowed: false, reason: 'Editor role required to manage tiers' };
      }

      return { 
        allowed: false, 
        reason: 'Admin role required to manage global tiers',
        requiresElevation: true 
      };

    default:
      return { allowed: false, reason: 'Invalid action' };
  }
}

/**
 * Checks permissions for category operations
 */
export function checkCategoryPermission(
  user: User | null,
  action: PermissionAction,
  category?: Category
): PermissionCheckResult {
  if (!user) {
    return { allowed: false, reason: 'Authentication required' };
  }

  switch (action) {
    case 'read':
      return isMemberOrHigher(user) 
        ? { allowed: true }
        : { allowed: false, reason: 'Member role required to view categories' };

    case 'create':
      return isEditorOrHigher(user)
        ? { allowed: true }
        : { allowed: false, reason: 'Editor role required to create categories' };

    case 'update':
    case 'delete':
    case 'manage':
      if (isAdmin(user)) {
        return { allowed: true };
      }
      
      if (category) {
        if (category.is_global) {
          return { 
            allowed: false, 
            reason: 'Admin role required to manage global categories',
            requiresElevation: true 
          };
        }
        
        if (isOwner(user, category.created_by)) {
          return isEditorOrHigher(user)
            ? { allowed: true }
            : { allowed: false, reason: 'Editor role required to manage categories' };
        }
      }

      return { 
        allowed: false, 
        reason: 'Can only manage your own categories or admin access required' 
      };

    default:
      return { allowed: false, reason: 'Invalid action' };
  }
}

/**
 * Checks permissions for type operations
 */
export function checkTypePermission(
  user: User | null,
  action: PermissionAction,
  type?: Type
): PermissionCheckResult {
  if (!user) {
    return { allowed: false, reason: 'Authentication required' };
  }

  switch (action) {
    case 'read':
      return isMemberOrHigher(user) 
        ? { allowed: true }
        : { allowed: false, reason: 'Member role required to view types' };

    case 'create':
      return isEditorOrHigher(user)
        ? { allowed: true }
        : { allowed: false, reason: 'Editor role required to create types' };

    case 'update':
    case 'delete':
    case 'manage':
      if (isAdmin(user)) {
        return { allowed: true };
      }
      
      if (type) {
        if (type.is_global) {
          return { 
            allowed: false, 
            reason: 'Admin role required to manage global types',
            requiresElevation: true 
          };
        }
        
        if (isOwner(user, type.created_by)) {
          return isEditorOrHigher(user)
            ? { allowed: true }
            : { allowed: false, reason: 'Editor role required to manage types' };
        }
      }

      return { 
        allowed: false, 
        reason: 'Can only manage your own types or admin access required' 
      };

    default:
      return { allowed: false, reason: 'Invalid action' };
  }
}

/**
 * Checks permissions for field definition operations
 */
export function checkFieldDefinitionPermission(
  user: User | null,
  action: PermissionAction,
  fieldDefinition?: FieldDefinition
): PermissionCheckResult {
  if (!user) {
    return { allowed: false, reason: 'Authentication required' };
  }

  switch (action) {
    case 'read':
      return isMemberOrHigher(user) 
        ? { allowed: true }
        : { allowed: false, reason: 'Member role required to view field definitions' };

    case 'create':
    case 'update':
    case 'delete':
    case 'manage':
      // Field definitions are system-level components, require admin access
      return isAdmin(user)
        ? { allowed: true }
        : { 
            allowed: false, 
            reason: 'Admin role required to manage field definitions',
            requiresElevation: true 
          };

    default:
      return { allowed: false, reason: 'Invalid action' };
  }
}

/**
 * Checks permissions for item operations
 */
export function checkItemPermission(
  user: User | null,
  action: PermissionAction,
  item?: Item,
  scope: ContentScope = 'own'
): PermissionCheckResult {
  if (!user) {
    return { allowed: false, reason: 'Authentication required' };
  }

  switch (action) {
    case 'read':
      return isMemberOrHigher(user) 
        ? { allowed: true }
        : { allowed: false, reason: 'Member role required to view items' };

    case 'create':
      return isMemberOrHigher(user)
        ? { allowed: true }
        : { allowed: false, reason: 'Member role required to create items' };

    case 'update':
      if (isAdmin(user)) {
        return { allowed: true };
      }
      
      if (item) {
        if (scope === 'all' || (item.is_global && !isOwner(user, item.created_by))) {
          return isEditorOrHigher(user)
            ? { allowed: true }
            : { 
                allowed: false, 
                reason: 'Editor role required to edit other users\' items',
                requiresElevation: true 
              };
        }
        
        if (isOwner(user, item.created_by)) {
          return { allowed: true };
        }
      }

      return { allowed: false, reason: 'Can only edit your own items' };

    case 'delete':
      if (isAdmin(user)) {
        return { allowed: true };
      }
      
      if (item) {
        if (scope === 'all' || (item.is_global && !isOwner(user, item.created_by))) {
          return isEditorOrHigher(user)
            ? { allowed: true }
            : { 
                allowed: false, 
                reason: 'Editor role required to delete other users\' items',
                requiresElevation: true 
              };
        }
        
        if (isOwner(user, item.created_by)) {
          return { allowed: true };
        }
      }

      return { allowed: false, reason: 'Can only delete your own items' };

    case 'manage':
      return isEditorOrHigher(user)
        ? { allowed: true }
        : { 
            allowed: false, 
            reason: 'Editor role required to manage items',
            requiresElevation: true 
          };

    default:
      return { allowed: false, reason: 'Invalid action' };
  }
}

/**
 * Checks permissions for schematic operations
 */
export function checkSchematicPermission(
  user: User | null,
  action: PermissionAction,
  schematic?: Schematic,
  scope: ContentScope = 'own'
): PermissionCheckResult {
  if (!user) {
    return { allowed: false, reason: 'Authentication required' };
  }

  switch (action) {
    case 'read':
      return isMemberOrHigher(user) 
        ? { allowed: true }
        : { allowed: false, reason: 'Member role required to view schematics' };

    case 'create':
      return isMemberOrHigher(user)
        ? { allowed: true }
        : { allowed: false, reason: 'Member role required to create schematics' };

    case 'update':
      if (isAdmin(user)) {
        return { allowed: true };
      }
      
      if (schematic) {
        if (scope === 'all' || (schematic.is_global && !isOwner(user, schematic.created_by))) {
          return isEditorOrHigher(user)
            ? { allowed: true }
            : { 
                allowed: false, 
                reason: 'Editor role required to edit other users\' schematics',
                requiresElevation: true 
              };
        }
        
        if (isOwner(user, schematic.created_by)) {
          return { allowed: true };
        }
      }

      return { allowed: false, reason: 'Can only edit your own schematics' };

    case 'delete':
      if (isAdmin(user)) {
        return { allowed: true };
      }
      
      if (schematic) {
        if (scope === 'all' || (schematic.is_global && !isOwner(user, schematic.created_by))) {
          return isEditorOrHigher(user)
            ? { allowed: true }
            : { 
                allowed: false, 
                reason: 'Editor role required to delete other users\' schematics',
                requiresElevation: true 
              };
        }
        
        if (isOwner(user, schematic.created_by)) {
          return { allowed: true };
        }
      }

      return { allowed: false, reason: 'Can only delete your own schematics' };

    case 'manage':
      return isEditorOrHigher(user)
        ? { allowed: true }
        : { 
            allowed: false, 
            reason: 'Editor role required to manage schematics',
            requiresElevation: true 
          };

    default:
      return { allowed: false, reason: 'Invalid action' };
  }
}

// =================================
// General Permission Checker
// =================================

/**
 * Universal permission checker that routes to entity-specific functions
 */
export function checkPermission(context: PermissionContext): PermissionCheckResult {
  const { user, entity, action, scope } = context;

  if (!entity) {
    return { allowed: false, reason: 'No entity context provided' };
  }

  switch (entity.type) {
    case 'tier':
      return checkTierPermission(user, action, entity as Tier);
    
    case 'category':
      return checkCategoryPermission(user, action, entity as Category);
    
    case 'type':
      return checkTypePermission(user, action, entity as Type);
    
    case 'subtype':
      return checkTypePermission(user, action, entity as SubType);
    
    case 'field_definition':
      return checkFieldDefinitionPermission(user, action, entity as FieldDefinition);
    
    case 'dropdown_group':
      return checkFieldDefinitionPermission(user, action, entity as DropdownGroup);
    
    case 'item':
      return checkItemPermission(user, action, entity as Item, scope);
    
    case 'schematic':
      return checkSchematicPermission(user, action, entity as Schematic, scope);
    
    default:
      return { allowed: false, reason: 'Unknown entity type' };
  }
}

// =================================
// User Capabilities Calculator
// =================================

/**
 * Calculates comprehensive user capabilities for Items & Schematics system
 */
export function calculateUserCapabilities(user: User | null): ItemsSchematicsCapabilities {
  if (!user) {
    return {
      canManageTiers: false,
      canManageCategories: false,
      canManageTypes: false,
      canManageSubTypes: false,
      canManageFieldDefinitions: false,
      canManageDropdownGroups: false,
      canCreateItems: false,
      canEditOwnItems: false,
      canEditAllItems: false,
      canDeleteOwnItems: false,
      canDeleteAllItems: false,
      canCreateSchematics: false,
      canEditOwnSchematics: false,
      canEditAllSchematics: false,
      canDeleteOwnSchematics: false,
      canDeleteAllSchematics: false,
      canCreateGlobalContent: false,
      canManageGlobalContent: false,
      isSystemBuilder: false,
      isAdministrator: false,
    };
  }

  const userIsAdmin = isAdmin(user);
  const userIsEditor = isEditorOrHigher(user);
  const userIsMember = isMemberOrHigher(user);

  return {
    // System management capabilities (admin only for most, editor+ for some)
    canManageTiers: userIsAdmin,
    canManageCategories: userIsEditor,
    canManageTypes: userIsEditor,
    canManageSubTypes: userIsEditor,
    canManageFieldDefinitions: userIsAdmin,
    canManageDropdownGroups: userIsAdmin,
    
    // Item capabilities
    canCreateItems: userIsMember,
    canEditOwnItems: userIsMember,
    canEditAllItems: userIsEditor,
    canDeleteOwnItems: userIsMember,
    canDeleteAllItems: userIsEditor,
    
    // Schematic capabilities
    canCreateSchematics: userIsMember,
    canEditOwnSchematics: userIsMember,
    canEditAllSchematics: userIsEditor,
    canDeleteOwnSchematics: userIsMember,
    canDeleteAllSchematics: userIsEditor,
    
    // Global content capabilities
    canCreateGlobalContent: userIsAdmin,
    canManageGlobalContent: userIsAdmin,
    
    // Advanced capabilities
    isSystemBuilder: userIsEditor,
    isAdministrator: userIsAdmin,
  };
}

// =================================
// Bulk Permission Checks
// =================================

/**
 * Checks permissions for multiple entities of the same type
 */
export function checkBulkPermissions<T extends { id: string; created_by?: string | null; is_global?: boolean }>(
  user: User | null,
  entities: T[],
  entityType: EntityType,
  action: PermissionAction,
  scope?: ContentScope
): BulkPermissionResult {
  const results: BulkPermissionResult = {};

  for (const entity of entities) {
    const context: PermissionContext = {
      user,
      entity: {
        type: entityType,
        id: entity.id,
        created_by: entity.created_by,
        is_global: entity.is_global
      },
      action,
      scope
    };

    results[entity.id] = checkPermission(context);
  }

  return results;
}

/**
 * Checks if user can perform action on any entity in a collection
 */
export function canPerformActionOnAny<T extends { id: string; created_by?: string | null; is_global?: boolean }>(
  user: User | null,
  entities: T[],
  entityType: EntityType,
  action: PermissionAction,
  scope?: ContentScope
): boolean {
  return entities.some(entity => {
    const context: PermissionContext = {
      user,
      entity: {
        type: entityType,
        id: entity.id,
        created_by: entity.created_by,
        is_global: entity.is_global
      },
      action,
      scope
    };

    return checkPermission(context).allowed;
  });
}

/**
 * Filters entities based on user permissions
 */
export function filterEntitiesByPermission<T extends { id: string; created_by?: string | null; is_global?: boolean }>(
  user: User | null,
  entities: T[],
  entityType: EntityType,
  action: PermissionAction,
  scope?: ContentScope
): T[] {
  if (!user) return [];

  return entities.filter(entity => {
    const context: PermissionContext = {
      user,
      entity: {
        type: entityType,
        id: entity.id,
        created_by: entity.created_by,
        is_global: entity.is_global
      },
      action,
      scope
    };

    return checkPermission(context).allowed;
  });
} 