import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import {
  calculateUserCapabilities,
  checkPermission,
  checkBulkPermissions,
  canPerformActionOnAny,
  filterEntitiesByPermission,
  isAdmin,
  isEditorOrHigher,
  isMemberOrHigher,
  isOwner,
  isGlobalContent
} from '../lib/itemsSchematicsPermissions';
import type {
  User,
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
  FieldDefinition,
  DropdownGroup,
  Item,
  Schematic
} from '../types';

// Hook return interface
interface UseItemsSchematicsPermissionsReturn {
  // Current user and capabilities
  user: User | null;
  capabilities: ItemsSchematicsCapabilities;
  
  // Permission checking functions
  checkPermission: (context: PermissionContext) => PermissionCheckResult;
  checkBulkPermissions: <T extends { id: string; created_by?: string | null; is_global?: boolean }>(
    entities: T[],
    entityType: EntityType,
    action: PermissionAction,
    scope?: ContentScope
  ) => BulkPermissionResult;
  
  // Utility functions
  canPerformActionOnAny: <T extends { id: string; created_by?: string | null; is_global?: boolean }>(
    entities: T[],
    entityType: EntityType,
    action: PermissionAction,
    scope?: ContentScope
  ) => boolean;
  
  filterEntitiesByPermission: <T extends { id: string; created_by?: string | null; is_global?: boolean }>(
    entities: T[],
    entityType: EntityType,
    action: PermissionAction,
    scope?: ContentScope
  ) => T[];
  
  // Entity-specific permission checkers
  canManageTier: (tier?: Tier, action?: PermissionAction) => PermissionCheckResult;
  canManageCategory: (category?: Category, action?: PermissionAction) => PermissionCheckResult;
  canManageType: (type?: Type, action?: PermissionAction) => PermissionCheckResult;

  canManageFieldDefinition: (fieldDef?: FieldDefinition, action?: PermissionAction) => PermissionCheckResult;
  canManageDropdownGroup: (group?: DropdownGroup, action?: PermissionAction) => PermissionCheckResult;
  canManageItem: (item?: Item, action?: PermissionAction, scope?: ContentScope) => PermissionCheckResult;
  canManageSchematic: (schematic?: Schematic, action?: PermissionAction, scope?: ContentScope) => PermissionCheckResult;
  
  // Quick role checks
  isAdmin: boolean;
  isEditor: boolean;
  isMember: boolean;
  
  // Ownership utilities
  isOwnerOf: (createdBy: string | null) => boolean;
  isGlobalContent: (createdBy: string | null) => boolean;
  
  // UI helper functions
  getPermissionMessage: (result: PermissionCheckResult) => string;
  shouldShowElevationPrompt: (result: PermissionCheckResult) => boolean;
}

export function useItemsSchematicsPermissions(): UseItemsSchematicsPermissionsReturn {
  const { user } = useAuth();
  
  // Calculate user capabilities whenever user changes
  const capabilities = useMemo(() => calculateUserCapabilities(user), [user]);
  
  // Quick role checks
  const userIsAdmin = useMemo(() => isAdmin(user), [user]);
  const userIsEditor = useMemo(() => isEditorOrHigher(user), [user]);
  const userIsMember = useMemo(() => isMemberOrHigher(user), [user]);
  
  // Permission checking functions with user context
  const checkPermissionWithUser = useCallback((context: PermissionContext): PermissionCheckResult => {
    return checkPermission({ ...context, user });
  }, [user]);
  
  const checkBulkPermissionsWithUser = useCallback(<T extends { id: string; created_by?: string | null; is_global?: boolean }>(
    entities: T[],
    entityType: EntityType,
    action: PermissionAction,
    scope?: ContentScope
  ): BulkPermissionResult => {
    return checkBulkPermissions(user, entities, entityType, action, scope);
  }, [user]);
  
  const canPerformActionOnAnyWithUser = useCallback(<T extends { id: string; created_by?: string | null; is_global?: boolean }>(
    entities: T[],
    entityType: EntityType,
    action: PermissionAction,
    scope?: ContentScope
  ): boolean => {
    return canPerformActionOnAny(user, entities, entityType, action, scope);
  }, [user]);
  
  const filterEntitiesByPermissionWithUser = useCallback(<T extends { id: string; created_by?: string | null; is_global?: boolean }>(
    entities: T[],
    entityType: EntityType,
    action: PermissionAction,
    scope?: ContentScope
  ): T[] => {
    return filterEntitiesByPermission(user, entities, entityType, action, scope);
  }, [user]);
  
  // Entity-specific permission checkers
  const canManageTier = useCallback((tier?: Tier, action: PermissionAction = 'manage'): PermissionCheckResult => {
    return checkPermissionWithUser({
      user,
      entity: tier ? {
        type: 'tier',
        id: tier.id,
        created_by: tier.created_by,
        is_global: tier.created_by === null
      } : undefined,
      action
    });
  }, [user, checkPermissionWithUser]);
  
  const canManageCategory = useCallback((category?: Category, action: PermissionAction = 'manage'): PermissionCheckResult => {
    return checkPermissionWithUser({
      user,
      entity: category ? {
        type: 'category',
        id: category.id,
        created_by: category.created_by,
        is_global: category.is_global
      } : undefined,
      action
    });
  }, [user, checkPermissionWithUser]);
  
  const canManageType = useCallback((type?: Type, action: PermissionAction = 'manage'): PermissionCheckResult => {
    return checkPermissionWithUser({
      user,
      entity: type ? {
        type: 'type',
        id: type.id,
        created_by: type.created_by,
        is_global: type.is_global
      } : undefined,
      action
    });
  }, [user, checkPermissionWithUser]);
  

  
  const canManageFieldDefinition = useCallback((fieldDef?: FieldDefinition, action: PermissionAction = 'manage'): PermissionCheckResult => {
    return checkPermissionWithUser({
      user,
      entity: fieldDef ? {
        type: 'field_definition',
        id: fieldDef.id,
        created_by: fieldDef.created_by,
        is_global: fieldDef.created_by === null
      } : undefined,
      action
    });
  }, [user, checkPermissionWithUser]);
  
  const canManageDropdownGroup = useCallback((group?: DropdownGroup, action: PermissionAction = 'manage'): PermissionCheckResult => {
    return checkPermissionWithUser({
      user,
      entity: group ? {
        type: 'dropdown_group',
        id: group.id,
        created_by: group.created_by,
        is_global: group.created_by === null
      } : undefined,
      action
    });
  }, [user, checkPermissionWithUser]);
  
  const canManageItem = useCallback((
    item?: Item, 
    action: PermissionAction = 'manage', 
    scope: ContentScope = 'own'
  ): PermissionCheckResult => {
    return checkPermissionWithUser({
      user,
      entity: item ? {
        type: 'item',
        id: item.id,
        created_by: item.created_by,
        is_global: item.is_global
      } : undefined,
      action,
      scope
    });
  }, [user, checkPermissionWithUser]);
  
  const canManageSchematic = useCallback((
    schematic?: Schematic, 
    action: PermissionAction = 'manage', 
    scope: ContentScope = 'own'
  ): PermissionCheckResult => {
    return checkPermissionWithUser({
      user,
      entity: schematic ? {
        type: 'schematic',
        id: schematic.id,
        created_by: schematic.created_by,
        is_global: schematic.is_global
      } : undefined,
      action,
      scope
    });
  }, [user, checkPermissionWithUser]);
  
  // Ownership utilities
  const isOwnerOf = useCallback((createdBy: string | null): boolean => {
    return isOwner(user, createdBy);
  }, [user]);
  
  const isGlobalContentCheck = useCallback((createdBy: string | null): boolean => {
    return isGlobalContent(createdBy);
  }, []);
  
  // UI helper functions
  const getPermissionMessage = useCallback((result: PermissionCheckResult): string => {
    if (result.allowed) {
      return 'Action allowed';
    }
    
    if (result.reason) {
      return result.reason;
    }
    
    return 'Action not permitted';
  }, []);
  
  const shouldShowElevationPrompt = useCallback((result: PermissionCheckResult): boolean => {
    return !result.allowed && !!result.requiresElevation;
  }, []);
  
  return {
    // Current user and capabilities
    user,
    capabilities,
    
    // Permission checking functions
    checkPermission: checkPermissionWithUser,
    checkBulkPermissions: checkBulkPermissionsWithUser,
    
    // Utility functions
    canPerformActionOnAny: canPerformActionOnAnyWithUser,
    filterEntitiesByPermission: filterEntitiesByPermissionWithUser,
    
    // Entity-specific permission checkers
    canManageTier,
    canManageCategory,
    canManageType,
    canManageFieldDefinition,
    canManageDropdownGroup,
    canManageItem,
    canManageSchematic,
    
    // Quick role checks
    isAdmin: userIsAdmin,
    isEditor: userIsEditor,
    isMember: userIsMember,
    
    // Ownership utilities
    isOwnerOf,
    isGlobalContent: isGlobalContentCheck,
    
    // UI helper functions
    getPermissionMessage,
    shouldShowElevationPrompt,
  };
}

// =================================
// Additional Utility Hooks
// =================================

/**
 * Hook for checking permissions on a specific entity
 */
export function useEntityPermissions<T extends { id: string; created_by?: string | null; is_global?: boolean }>(
  entity: T | null,
  entityType: EntityType
) {
  const { user, checkPermission } = useItemsSchematicsPermissions();
  
  return useMemo(() => {
    if (!entity) {
      return {
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canManage: false
      };
    }
    
    const entityContext = {
      type: entityType,
      id: entity.id,
      created_by: entity.created_by,
      is_global: entity.is_global
    };
    
    return {
      canRead: checkPermission({ user, entity: entityContext, action: 'read' }).allowed,
      canCreate: checkPermission({ user, entity: entityContext, action: 'create' }).allowed,
      canUpdate: checkPermission({ user, entity: entityContext, action: 'update' }).allowed,
      canDelete: checkPermission({ user, entity: entityContext, action: 'delete' }).allowed,
      canManage: checkPermission({ user, entity: entityContext, action: 'manage' }).allowed,
    };
  }, [entity, entityType, user, checkPermission]);
}

/**
 * Hook for managing permission-based UI state
 */
export function usePermissionUIState() {
  const { capabilities, isAdmin, isEditor, isMember } = useItemsSchematicsPermissions();
  
  return useMemo(() => ({
    // Navigation visibility
    shouldShowSystemBuilder: capabilities.isSystemBuilder,
    shouldShowAdminFeatures: capabilities.isAdministrator,
    shouldShowItemsTab: capabilities.canCreateItems || capabilities.canEditOwnItems,
    shouldShowSchematicsTab: capabilities.canCreateSchematics || capabilities.canEditOwnSchematics,
    
    // Button visibility
    shouldShowCreateItemButton: capabilities.canCreateItems,
    shouldShowCreateSchematicButton: capabilities.canCreateSchematics,
    shouldShowManagementButtons: capabilities.isSystemBuilder,
    
    // Feature availability
    canAccessSystemConfiguration: capabilities.canManageFieldDefinitions,
    canModerateContent: isEditor,
    canAdministrate: isAdmin,
    canContribute: isMember,
    
    // Warning states
    hasLimitedAccess: isMember && !isEditor,
    requiresElevation: !isEditor,
  }), [capabilities, isAdmin, isEditor, isMember]);
} 