import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Wrench, ChevronUp, ChevronDown, Edit2, Trash2, Eye, EyeOff, Settings } from 'lucide-react';
import { User, FieldDefinition, Category, Type, DropdownGroup, DropdownOption, ScopeType, FieldType, DropdownSourceType, AppliesTo } from '../../types';
import { useAuth } from '../auth/AuthProvider';
import { 
  fetchFieldDefinitions, 
  createFieldDefinition, 
  updateFieldDefinition,
  deleteFieldDefinition,
  fetchCategories,
  fetchTypes,
  fetchDropdownGroups,
  createDropdownGroup,
  updateDropdownGroup,
  deleteDropdownGroup,
  fetchDropdownOptions,
  createDropdownOption,
  updateDropdownOption,
  deleteDropdownOption,
  fetchTiers,
  fetchItems,
  fetchSchematics
} from '../../lib/itemsSchematicsCrud';
import DiamondIcon from '../common/DiamondIcon';
import { ConfirmationModal } from '../shared/ConfirmationModal';

interface FieldDefinitionManagerProps {
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

interface CreateFieldForm {
  name: string;
  display_name: string;
  field_type: FieldType;
  scope_type: ScopeType;
  scope_id: string | null;
  is_required: boolean;
  default_visible: boolean;
  dropdown_group_id: string | null;
  validation_rules: Record<string, any>;
}

interface SelectedScope {
  type: ScopeType;
  categoryId: string | null;
  typeId: string | null;
}

const FieldDefinitionManager: React.FC<FieldDefinitionManagerProps> = ({
  onError,
  onSuccess
}) => {
  const { user } = useAuth();
  
  // Core Data State
  const [fieldDefinitions, setFieldDefinitions] = useState<FieldDefinition[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [dropdownGroups, setDropdownGroups] = useState<DropdownGroup[]>([]);
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>([]);
  const [tiers, setTiers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [schematics, setSchematics] = useState<any[]>([]);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedScope, setSelectedScope] = useState<SelectedScope>({
    type: 'global',
    categoryId: null,
    typeId: null
  });
  
  // Dropdown Group Management State
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<DropdownGroup | null>(null);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  
  // Form State
  const [createForm, setCreateForm] = useState<CreateFieldForm>({
    name: '',
    display_name: '',
    field_type: 'text',
    scope_type: 'global',
    scope_id: null,
    is_required: false,
    default_visible: true,
    dropdown_group_id: null,
    validation_rules: {}
  });
  
  // Edit State
  const [editingField, setEditingField] = useState<FieldDefinition | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<CreateFieldForm>({
    name: '',
    display_name: '',
    field_type: 'text',
    scope_type: 'global',
    scope_id: null,
    is_required: false,
    default_visible: true,
    dropdown_group_id: null,
    validation_rules: {}
  });
  
  // Dropdown Group Form State
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    source_type: 'custom' as DropdownSourceType,
    source_category_id: null as string | null,
    source_type_id: null as string | null,
    source_tier_id: null as string | null,
    applies_to: null as AppliesTo | null
  });
  const [groupEditForm, setGroupEditForm] = useState({
    name: '',
    description: '',
    source_type: 'custom' as DropdownSourceType,
    source_category_id: null as string | null,
    source_type_id: null as string | null,
    source_tier_id: null as string | null,
    applies_to: null as AppliesTo | null
  });
  
  // Dropdown Option Management State
  const [showCreateOptionModal, setShowCreateOptionModal] = useState(false);
  const [editingOption, setEditingOption] = useState<DropdownOption | null>(null);
  const [showEditOptionModal, setShowEditOptionModal] = useState(false);
  const [optionForm, setOptionForm] = useState({
    value: '',
    label: '',
    sort_order: 1,
    group_id: ''
  });
  const [optionEditForm, setOptionEditForm] = useState({
    value: '',
    label: '',
    sort_order: 1
  });
  
  // Confirmation Modal State
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: ''
  });

  // Load all data
  const loadData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [fieldsResult, categoriesResult, typesResult, dropdownGroupsResult, tiersResult, itemsResult, schematicsResult] = await Promise.all([
        fetchFieldDefinitions(user),
        fetchCategories(user),
        fetchTypes(user),
        fetchDropdownGroups(user),
        fetchTiers(user),
        fetchItems(user),
        fetchSchematics(user)
      ]);

      if (fieldsResult.success) {
        setFieldDefinitions(fieldsResult.data || []);
      }
      if (categoriesResult.success) {
        setCategories(categoriesResult.data || []);
      }
      if (typesResult.success) {
        setTypes(typesResult.data || []);
      }
      if (dropdownGroupsResult.success) {
        setDropdownGroups(dropdownGroupsResult.data || []);
      }
      if (tiersResult.success) {
        setTiers(tiersResult.data || []);
      }
      if (itemsResult.success) {
        setItems(itemsResult.data || []);
      }
      if (schematicsResult.success) {
        setSchematics(schematicsResult.data || []);
      }
      
      // Load all dropdown options for all groups
      await loadAllDropdownOptions();
    } catch (error) {
      console.error('Error loading data:', error);
      onError('Failed to load field definition data');
    } finally {
      setLoading(false);
    }
  }, [user, onError]);

  // Load dropdown options for all groups
  const loadAllDropdownOptions = useCallback(async () => {
    if (!user) return;
    
    try {
      const allOptions: DropdownOption[] = [];
      for (const group of dropdownGroups) {
        const optionsResult = await fetchDropdownOptions(user, group.id);
        if (optionsResult.success) {
          allOptions.push(...(optionsResult.data || []));
        }
      }
      setDropdownOptions(allOptions);
    } catch (error) {
      console.error('Error loading dropdown options:', error);
    }
  }, [user, dropdownGroups]);

  // Load options for a specific group
  const loadOptionsForGroup = useCallback(async (groupId: string) => {
    if (!user) return;
    
    try {
      const optionsResult = await fetchDropdownOptions(user, groupId);
      if (optionsResult.success) {
        setDropdownOptions(prev => [
          ...prev.filter(opt => opt.group_id !== groupId),
          ...(optionsResult.data || [])
        ]);
      }
    } catch (error) {
      console.error('Error loading dropdown options for group:', error);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Modal helper functions
  const showSuccess = (title: string, message: string) => {
    setConfirmationModal({
      isOpen: true,
      type: 'success',
      title,
      message
    });
  };

  const showError = (title: string, message: string) => {
    setConfirmationModal({
      isOpen: true,
      type: 'error',
      title,
      message
    });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
  };

  // Get fields for current scope
  const getCurrentScopeFields = () => {
    return fieldDefinitions.filter(field => {
      if (selectedScope.type === 'global') {
        return field.scope_type === 'global';
      } else if (selectedScope.type === 'category') {
        return field.scope_type === 'category' && field.scope_id === selectedScope.categoryId;
      } else if (selectedScope.type === 'type') {
        return field.scope_type === 'type' && field.scope_id === selectedScope.typeId;
      }
      return false;
    });
  };

  // Get inherited fields for current scope
  const getInheritedFields = () => {
    const inherited: FieldDefinition[] = [];
    
    // Global fields are inherited by all
    const globalFields = fieldDefinitions.filter(f => f.scope_type === 'global');
    inherited.push(...globalFields);
    
    // Category fields are inherited by types in that category
    if (selectedScope.type === 'type' && selectedScope.categoryId) {
      const categoryFields = fieldDefinitions.filter(f => 
        f.scope_type === 'category' && f.scope_id === selectedScope.categoryId
      );
      inherited.push(...categoryFields);
    }
    
    return inherited;
  };

  // Handle create field
  const handleCreateField = async () => {
    if (!user) return;
    
    try {
      const fieldData = {
        ...createForm,
        scope_type: selectedScope.type,
        scope_id: selectedScope.type === 'global' ? null : 
                  selectedScope.type === 'category' ? selectedScope.categoryId :
                  selectedScope.typeId,
        display_order: getCurrentScopeFields().length + 1,
        created_by: user.id,
        updated_by: null
      };

      const result = await createFieldDefinition(user, fieldData);
      
      if (!result.success) {
        showError('Field Creation Failed', result.error || 'Failed to create field');
        return;
      }
      
      // Reset form and reload data
      setCreateForm({
        name: '',
        display_name: '',
        field_type: 'text',
        scope_type: 'global',
        scope_id: null,
        is_required: false,
        default_visible: true,
        dropdown_group_id: null,
        validation_rules: {}
      });
      setShowCreateModal(false);
      showSuccess('Field Created', `Field "${result.data!.display_name}" has been created successfully.`);
      await loadData();
      
    } catch (err: any) {
      console.error('Error creating field:', err);
      showError('Field Creation Failed', err.message || 'Failed to create field');
    }
  };

  // Handle edit field
  const handleEditField = (field: FieldDefinition) => {
    setEditingField(field);
    setEditForm({
      name: field.name,
      display_name: field.display_name,
      field_type: field.field_type,
      scope_type: field.scope_type,
      scope_id: field.scope_id,
      is_required: field.is_required,
      default_visible: field.default_visible,
      dropdown_group_id: field.dropdown_group_id,
      validation_rules: field.validation_rules || {}
    });
    setShowEditModal(true);
  };

  // Handle delete field
  const handleDeleteField = async (field: FieldDefinition) => {
    if (!user) return;
    
    if (!confirm(`Delete field "${field.display_name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const result = await deleteFieldDefinition(user, field.id);
      
      if (!result.success) {
        if (result.permissionError) {
          showError('Permission Denied', result.error || 'You do not have permission to delete this field');
        } else {
          showError('Delete Failed', result.error || 'Failed to delete field');
        }
        return;
      }

      showSuccess('Field Deleted', `Field "${field.display_name}" has been deleted successfully`);
      
      // Reload data
      await loadData();
      
    } catch (err: any) {
      console.error('Error deleting field:', err);
      showError('Delete Failed', err.message || 'Failed to delete field');
    }
  };

  const handleUpdateField = async () => {
    if (!user || !editingField) return;
    
    try {
      const updates = {
        name: editForm.name,
        display_name: editForm.display_name,
        field_type: editForm.field_type,
        is_required: editForm.is_required,
        default_visible: editForm.default_visible,
        dropdown_group_id: editForm.dropdown_group_id,
        validation_rules: editForm.validation_rules,
        updated_by: user.id
      };

      const result = await updateFieldDefinition(user, editingField.id, updates);
      
      if (!result.success) {
        showError('Field Update Failed', result.error || 'Failed to update field');
        return;
      }
      
      setShowEditModal(false);
      setEditingField(null);
      showSuccess('Field Updated', `Field "${result.data!.display_name}" has been updated successfully.`);
      await loadData();
      
    } catch (err: any) {
      console.error('Error updating field:', err);
      showError('Field Update Failed', err.message || 'Failed to update field');
    }
  };

  // Handle field order change
  const handleFieldOrderChange = async (fieldId: string, direction: 'up' | 'down') => {
    if (!user) return;
    
    const currentFields = getCurrentScopeFields().sort((a, b) => a.display_order - b.display_order);
    const fieldIndex = currentFields.findIndex(f => f.id === fieldId);
    
    if (fieldIndex === -1) return;
    if (direction === 'up' && fieldIndex === 0) return;
    if (direction === 'down' && fieldIndex === currentFields.length - 1) return;
    
    const field = currentFields[fieldIndex];
    const swapIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;
    const swapField = currentFields[swapIndex];
    
    try {
      // Use temporary order to avoid constraint violations
      const tempOrder = Math.max(...currentFields.map(f => f.display_order)) + 1000;
      
      await updateFieldDefinition(user, swapField.id, { display_order: tempOrder });
      await updateFieldDefinition(user, field.id, { display_order: swapField.display_order });
      await updateFieldDefinition(user, swapField.id, { display_order: field.display_order });
      
      await loadData();
    } catch (error) {
      console.error('Error updating field order:', error);
      showError('Field Order Update Failed', 'Failed to update field display order');
    }
  };

  // ===== DROPDOWN GROUP MANAGEMENT =====

  // Handle create dropdown group
  const handleCreateGroup = async () => {
    if (!user) return;
    
    try {
      const result = await createDropdownGroup(user, {
        name: groupForm.name,
        description: groupForm.description || null,
        source_type: groupForm.source_type,
        source_category_id: groupForm.source_category_id,
        source_type_id: groupForm.source_type_id,
        source_tier_id: groupForm.source_tier_id,
        applies_to: groupForm.applies_to
      });
      
      if (!result.success) {
        if (result.permissionError) {
          showError('Permission Denied', result.error || 'You do not have permission to create dropdown groups');
        } else {
          showError('Creation Failed', result.error || 'Failed to create dropdown group');
        }
        return;
      }

      showSuccess('Group Created', `Dropdown group "${groupForm.name}" has been created successfully`);
      
      // Reset form and close modal
      setGroupForm({ 
        name: '', 
        description: '',
        source_type: 'custom',
        source_category_id: null,
        source_type_id: null,
        source_tier_id: null,
        applies_to: null
      });
      setShowCreateGroupModal(false);
      
      // Reload data
      await loadData();
      
    } catch (err: any) {
      console.error('Error creating dropdown group:', err);
      showError('Creation Failed', err.message || 'Failed to create dropdown group');
    }
  };

  // Handle edit dropdown group
  const handleEditGroup = (group: DropdownGroup) => {
    setEditingGroup(group);
    setGroupEditForm({
      name: group.name,
      description: group.description || '',
      source_type: group.source_type || 'custom',
      source_category_id: group.source_category_id,
      source_type_id: group.source_type_id,
      source_tier_id: group.source_tier_id,
      applies_to: group.applies_to
    });
    setShowEditGroupModal(true);
  };

  // Handle update dropdown group
  const handleUpdateGroup = async () => {
    if (!user || !editingGroup) return;
    
    try {
      const result = await updateDropdownGroup(user, editingGroup.id, {
        name: groupEditForm.name,
        description: groupEditForm.description || null,
        source_type: groupEditForm.source_type,
        source_category_id: groupEditForm.source_category_id,
        source_type_id: groupEditForm.source_type_id,
        source_tier_id: groupEditForm.source_tier_id,
        applies_to: groupEditForm.applies_to
      });
      
      if (!result.success) {
        if (result.permissionError) {
          showError('Permission Denied', result.error || 'You do not have permission to update this dropdown group');
        } else {
          showError('Update Failed', result.error || 'Failed to update dropdown group');
        }
        return;
      }

      showSuccess('Group Updated', `Dropdown group "${groupEditForm.name}" has been updated successfully`);
      
      // Reset form and close modal
      setGroupEditForm({ 
        name: '', 
        description: '',
        source_type: 'custom',
        source_category_id: null,
        source_type_id: null,
        source_tier_id: null,
        applies_to: null
      });
      setEditingGroup(null);
      setShowEditGroupModal(false);
      
      // Reload data
      await loadData();
      
    } catch (err: any) {
      console.error('Error updating dropdown group:', err);
      showError('Update Failed', err.message || 'Failed to update dropdown group');
    }
  };

  // Handle delete dropdown group
  const handleDeleteGroup = async (group: DropdownGroup) => {
    if (!user) return;
    
    if (!confirm(`Delete dropdown group "${group.name}"? This will also delete all options in this group. This action cannot be undone.`)) {
      return;
    }
    
    try {
      const result = await deleteDropdownGroup(user, group.id);
      
      if (!result.success) {
        if (result.permissionError) {
          showError('Permission Denied', result.error || 'You do not have permission to delete this dropdown group');
        } else {
          showError('Delete Failed', result.error || 'Failed to delete dropdown group');
        }
        return;
      }

      showSuccess('Group Deleted', `Dropdown group "${group.name}" has been deleted successfully`);
      
      // Reload data
      await loadData();
      
    } catch (err: any) {
      console.error('Error deleting dropdown group:', err);
      showError('Delete Failed', err.message || 'Failed to delete dropdown group');
    }
  };

  // ===== DROPDOWN OPTION MANAGEMENT =====

  // Handle create dropdown option
  const handleCreateOption = async (groupId: string) => {
    setOptionForm({
      value: '',
      label: '',
      sort_order: 1,
      group_id: groupId
    });
    setShowCreateOptionModal(true);
  };

  // Handle submit create option
  const handleSubmitCreateOption = async () => {
    if (!user) return;
    
    try {
      // Get next sort order for the group
      const groupOptions = dropdownOptions.filter(opt => opt.group_id === optionForm.group_id);
      const nextSortOrder = groupOptions.length > 0 ? Math.max(...groupOptions.map(opt => opt.sort_order)) + 1 : 1;

      const result = await createDropdownOption(user, {
        group_id: optionForm.group_id,
        value: optionForm.value,
        label: optionForm.label || optionForm.value,
        sort_order: nextSortOrder,
        is_active: true
      });
      
      if (!result.success) {
        if (result.permissionError) {
          showError('Permission Denied', result.error || 'You do not have permission to create dropdown options');
        } else {
          showError('Creation Failed', result.error || 'Failed to create dropdown option');
        }
        return;
      }

      showSuccess('Option Created', `Dropdown option "${optionForm.value}" has been created successfully`);
      
      // Reset form and close modal
      setOptionForm({ value: '', label: '', sort_order: 1, group_id: '' });
      setShowCreateOptionModal(false);
      
      // Reload options for the group
      await loadOptionsForGroup(optionForm.group_id);
      
    } catch (err: any) {
      console.error('Error creating dropdown option:', err);
      showError('Creation Failed', err.message || 'Failed to create dropdown option');
    }
  };

  // Handle edit dropdown option
  const handleEditOption = (option: DropdownOption) => {
    setEditingOption(option);
    setOptionEditForm({
      value: option.value,
      label: option.label || option.value,
      sort_order: option.sort_order
    });
    setShowEditOptionModal(true);
  };

  // Handle submit edit option
  const handleSubmitEditOption = async () => {
    if (!user || !editingOption) return;
    
    try {
      const result = await updateDropdownOption(user, editingOption.id, {
        value: optionEditForm.value,
        label: optionEditForm.label || optionEditForm.value,
        sort_order: optionEditForm.sort_order
      });
      
      if (!result.success) {
        if (result.permissionError) {
          showError('Permission Denied', result.error || 'You do not have permission to update this dropdown option');
        } else {
          showError('Update Failed', result.error || 'Failed to update dropdown option');
        }
        return;
      }

      showSuccess('Option Updated', `Dropdown option "${optionEditForm.value}" has been updated successfully`);
      
      // Reset form and close modal
      setOptionEditForm({ value: '', label: '', sort_order: 1 });
      setEditingOption(null);
      setShowEditOptionModal(false);
      
      // Reload options for the group
      await loadOptionsForGroup(editingOption.group_id);
      
    } catch (err: any) {
      console.error('Error updating dropdown option:', err);
      showError('Update Failed', err.message || 'Failed to update dropdown option');
    }
  };

  // Handle delete dropdown option
  const handleDeleteOption = async (option: DropdownOption) => {
    if (!user) return;
    
    if (!confirm(`Delete dropdown option "${option.value}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const result = await deleteDropdownOption(user, option.id);
      
      if (!result.success) {
        if (result.permissionError) {
          showError('Permission Denied', result.error || 'You do not have permission to delete this dropdown option');
        } else {
          showError('Delete Failed', result.error || 'Failed to delete dropdown option');
        }
        return;
      }

      showSuccess('Option Deleted', `Dropdown option "${option.value}" has been deleted successfully`);
      
      // Reload options for the group
      await loadOptionsForGroup(option.group_id);
      
    } catch (err: any) {
      console.error('Error deleting dropdown option:', err);
      showError('Delete Failed', err.message || 'Failed to delete dropdown option');
    }
  };

  // Get dynamic options based on source type
  const getDynamicOptions = (group: DropdownGroup): { value: string; label: string; }[] => {
    if (group.source_type === 'custom') {
      return [];
    }

    try {
      switch (group.source_type) {
        case 'categories':
          return categories
            .filter(cat => !group.applies_to || cat.applies_to.includes(group.applies_to))
            .map(cat => ({ value: cat.id, label: cat.name }));
            
        case 'types':
          return types
            .filter(type => !group.source_category_id || type.category_id === group.source_category_id)
            .map(type => ({ value: type.id, label: type.name }));
            
        case 'tiers':
          return tiers
            .map(tier => ({ value: tier.id, label: tier.name }));
            
        case 'items':
          return items
            .filter(item => {
              if (group.source_category_id && item.category_id !== group.source_category_id) return false;
              if (group.source_type_id && item.type_id !== group.source_type_id) return false;
              if (group.source_tier_id && item.tier_id !== group.source_tier_id) return false;
              return true;
            })
            .map(item => ({ value: item.id, label: item.name }));
            
        case 'schematics':
          return schematics
            .filter(schematic => {
              if (group.source_category_id && schematic.category_id !== group.source_category_id) return false;
              if (group.source_type_id && schematic.type_id !== group.source_type_id) return false;
              if (group.source_tier_id && schematic.tier_id !== group.source_tier_id) return false;
              return true;
            })
            .map(schematic => ({ value: schematic.id, label: schematic.name }));
            
        default:
          return [];
      }
    } catch (error) {
      console.error('Error getting dynamic options:', error);
      return [];
    }
  };

  // Get available types for selected category
  const getAvailableTypes = () => {
    if (!selectedScope.categoryId) return [];
    return types.filter(type => type.category_id === selectedScope.categoryId);
  };

  // Render scope selector
  const renderScopeSelector = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-amber-200/80 mb-2">Scope Level</label>
        <div className="flex gap-2">
          {(['global', 'category', 'type'] as ScopeType[]).map((scope) => (
            <button
              key={scope}
              onClick={() => setSelectedScope({
                type: scope,
                categoryId: scope === 'global' ? null : selectedScope.categoryId,
                typeId: scope === 'type' ? selectedScope.typeId : null
              })}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                selectedScope.type === scope
                  ? 'bg-amber-900/50 text-amber-300 border border-amber-300/50'
                  : 'bg-slate-800/50 text-slate-300 border border-slate-600/50 hover:bg-slate-700/50'
              }`}
            >
              {scope.charAt(0).toUpperCase() + scope.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {selectedScope.type !== 'global' && (
        <div>
          <label className="block text-sm text-amber-200/80 mb-2">Category</label>
          <select
            value={selectedScope.categoryId || ''}
            onChange={(e) => setSelectedScope({
              ...selectedScope,
              categoryId: e.target.value || null,
              typeId: null // Reset type when category changes
            })}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
      )}

      {selectedScope.type === 'type' && selectedScope.categoryId && (
        <div>
          <label className="block text-sm text-amber-200/80 mb-2">Type</label>
          <select
            value={selectedScope.typeId || ''}
            onChange={(e) => setSelectedScope({
              ...selectedScope,
              typeId: e.target.value || null
            })}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
          >
            <option value="">Select Type</option>
            {getAvailableTypes().map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );

  // Render field list
  const renderFieldList = () => {
    const currentFields = getCurrentScopeFields().sort((a, b) => a.display_order - b.display_order);
    const inheritedFields = getInheritedFields();

    return (
      <div className="space-y-4">
        {/* Inherited Fields */}
        {inheritedFields.length > 0 && (
          <div>
            <h4 className="text-sm text-slate-400 mb-2 flex items-center gap-2">
              <Eye size={14} />
              Inherited Fields ({inheritedFields.length})
            </h4>
            <div className="space-y-1">
              {inheritedFields.map(field => (
                <div key={field.id} className="p-3 bg-slate-800/30 border border-slate-600/30 rounded flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-xs px-2 py-1 bg-slate-700/50 rounded">
                      {field.scope_type}
                    </span>
                    <span className="text-slate-300">{field.display_name}</span>
                    <span className="text-xs text-slate-500">({field.field_type})</span>
                    {field.is_required && (
                      <span className="text-xs text-amber-400">Required</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Scope Fields */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm text-amber-200 flex items-center gap-2">
              <Settings size={14} />
              {selectedScope.type.charAt(0).toUpperCase() + selectedScope.type.slice(1)} Fields ({currentFields.length})
            </h4>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1 bg-amber-900/50 text-amber-300 border border-amber-300/50 rounded text-sm hover:bg-amber-800/50 transition-colors flex items-center gap-1"
            >
              <Plus size={14} />
              Add Field
            </button>
          </div>
          
          {currentFields.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No fields defined at this scope level
            </div>
          ) : (
            <div className="space-y-1">
              {currentFields.map((field, index) => (
                <div key={field.id} className="p-3 bg-slate-800/50 border border-slate-600/50 rounded flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 text-xs px-2 py-1 bg-amber-900/30 rounded">
                      #{field.display_order}
                    </span>
                    <span className="text-slate-200">{field.display_name}</span>
                    <span className="text-xs text-slate-400">({field.field_type})</span>
                    {field.is_required && (
                      <span className="text-xs text-amber-400">Required</span>
                    )}
                    {!field.default_visible && (
                      <EyeOff size={12} className="text-slate-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditField(field)}
                      className="p-1 text-slate-400 hover:text-amber-300 transition-colors"
                      title="Edit field"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteField(field)}
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete field"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      onClick={() => handleFieldOrderChange(field.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-slate-400 hover:text-slate-200 disabled:text-slate-600 disabled:cursor-not-allowed"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => handleFieldOrderChange(field.id, 'down')}
                      disabled={index === currentFields.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-200 disabled:text-slate-600 disabled:cursor-not-allowed"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render create field modal
  const renderCreateFieldModal = () => {
    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-slate-900 border border-slate-600 rounded-lg p-6 w-full max-w-md space-y-4">
          <h3 className="text-lg font-light text-amber-300">
            Create Field at {selectedScope.type.charAt(0).toUpperCase() + selectedScope.type.slice(1)} Level
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-amber-200/80 mb-1">Field Name (Internal)</label>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
                placeholder="field_name"
              />
            </div>
            
            <div>
              <label className="block text-sm text-amber-200/80 mb-1">Display Name</label>
              <input
                type="text"
                value={createForm.display_name}
                onChange={(e) => setCreateForm({...createForm, display_name: e.target.value})}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
                placeholder="Display Name"
              />
            </div>
            
            <div>
              <label className="block text-sm text-amber-200/80 mb-1">Field Type</label>
              <select
                value={createForm.field_type}
                onChange={(e) => setCreateForm({
                  ...createForm, 
                  field_type: e.target.value as FieldType,
                  dropdown_group_id: e.target.value === 'dropdown' ? createForm.dropdown_group_id : null
                })}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="dropdown">Dropdown</option>
              </select>
            </div>
            
            {createForm.field_type === 'dropdown' && (
              <div>
                <label className="block text-sm text-amber-200/80 mb-1">Dropdown Group</label>
                <select
                  value={createForm.dropdown_group_id || ''}
                  onChange={(e) => setCreateForm({...createForm, dropdown_group_id: e.target.value || null})}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
                >
                  <option value="">Select Dropdown Group</option>
                  {dropdownGroups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={createForm.is_required}
                  onChange={(e) => setCreateForm({...createForm, is_required: e.target.checked})}
                  className="rounded"
                />
                <span className="text-sm text-slate-300">Required</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={createForm.default_visible}
                  onChange={(e) => setCreateForm({...createForm, default_visible: e.target.checked})}
                  className="rounded"
                />
                <span className="text-sm text-slate-300">Visible by Default</span>
              </label>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleCreateField}
              disabled={!createForm.name || !createForm.display_name || (createForm.field_type === 'dropdown' && !createForm.dropdown_group_id)}
              className="flex-1 px-4 py-2 bg-amber-900/50 text-amber-300 border border-amber-300/50 rounded hover:bg-amber-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Field
            </button>
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 bg-slate-700/50 text-slate-300 border border-slate-600/50 rounded hover:bg-slate-600/50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render dropdown groups panel
  const renderDropdownGroups = () => {
    if (dropdownGroups.length === 0) {
      return (
        <div className="text-center py-4 text-slate-400 text-sm">
          No dropdown groups created yet
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {dropdownGroups.map(group => {
          const groupOptions = dropdownOptions.filter(opt => opt.group_id === group.id);
          const dynamicOptions = getDynamicOptions(group);
          const allOptions = group.source_type === 'custom' ? groupOptions : dynamicOptions;
          
          return (
            <div key={group.id} className="border border-slate-600/50 rounded p-3 bg-slate-800/30">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h5 className="text-slate-200 font-medium text-sm">{group.name}</h5>
                  {group.description && (
                    <p className="text-slate-400 text-xs">{group.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      group.source_type === 'custom' 
                        ? 'bg-blue-900/30 text-blue-300' 
                        : 'bg-green-900/30 text-green-300'
                    }`}>
                      {group.source_type}
                    </span>
                    {group.source_type !== 'custom' && (
                      <span className="text-xs text-slate-500">
                        {dynamicOptions.length} dynamic option{dynamicOptions.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditGroup(group)}
                    className="p-1 text-amber-400 hover:bg-amber-900/30 rounded"
                    title="Edit Group"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group)}
                    className="p-1 text-red-400 hover:bg-red-900/30 rounded"
                    title="Delete Group"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              
              {group.source_type === 'custom' && (
                <div className="text-xs text-slate-500">
                  {groupOptions.length} option{groupOptions.length !== 1 ? 's' : ''}
                  {groupOptions.length > 0 && (
                    <span className="ml-2">
                      ({groupOptions.map(opt => opt.value).join(', ')})
                    </span>
                  )}
                </div>
              )}
              
              {selectedGroupId === group.id && (
                <div className="mt-3 pt-3 border-t border-slate-600/30">
                  <div className="text-xs text-slate-400 mb-2">
                    {group.source_type === 'custom' ? 'Custom Options:' : 'Dynamic Options:'}
                  </div>
                  
                  {group.source_type === 'custom' ? (
                    <>
                      {groupOptions.length > 0 ? (
                        <div className="space-y-1">
                          {groupOptions.map(option => (
                            <div key={option.id} className="flex items-center justify-between text-xs">
                              <span className="text-slate-300">{option.value}</span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleEditOption(option)}
                                  className="p-1 text-amber-400 hover:bg-amber-900/30 rounded"
                                  title="Edit Option"
                                >
                                  <Edit2 size={10} />
                                </button>
                                <button
                                  onClick={() => handleDeleteOption(option)}
                                  className="p-1 text-red-400 hover:bg-red-900/30 rounded"
                                  title="Delete Option"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500">No options yet</div>
                      )}
                      
                      <button
                        onClick={() => handleCreateOption(group.id)}
                        className="mt-2 w-full px-2 py-1 bg-amber-900/30 text-amber-300 border border-amber-300/30 rounded text-xs hover:bg-amber-800/30 transition-colors"
                      >
                        <Plus size={10} className="inline mr-1" />
                        Add Option
                      </button>
                    </>
                  ) : (
                    <>
                      {dynamicOptions.length > 0 ? (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {dynamicOptions.map(option => (
                            <div key={option.value} className="flex items-center justify-between text-xs">
                              <span className="text-slate-300">{option.label}</span>
                              <span className="text-slate-500 text-[10px]">{option.value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500">
                          No {group.source_type} found matching filters
                        </div>
                      )}
                      
                      <div className="mt-2 text-xs text-slate-500 italic">
                        Options auto-generated from {group.source_type}
                      </div>
                    </>
                  )}
                </div>
              )}
              
              <button
                onClick={() => setSelectedGroupId(selectedGroupId === group.id ? null : group.id)}
                className="mt-2 w-full px-2 py-1 bg-slate-700/50 text-slate-300 border border-slate-600/50 rounded text-xs hover:bg-slate-600/50 transition-colors"
              >
                {selectedGroupId === group.id ? 'Hide Options' : 'Manage Options'}
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-amber-200/70">Loading field definitions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <DiamondIcon
          icon={<Wrench size={18} strokeWidth={1.5} />}
          size="md"
          bgColor="bg-void-950"
          actualBorderColor="bg-gold-300"
          borderThickness={2}
          iconColor="text-gold-300"
        />
        <div>
          <h3 className="text-lg font-light text-gold-300"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            DYNAMIC FIELD BUILDER
          </h3>
          <p className="text-amber-200/70 text-sm font-light"
             style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            Configure custom data fields with inheritance
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Scope Selection */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-900/50 border border-slate-600/50 rounded-lg">
            <h4 className="text-amber-300 font-medium mb-4">Scope Selection</h4>
            {renderScopeSelector()}
          </div>
        </div>

        {/* Middle Panel: Field Management */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-900/50 border border-slate-600/50 rounded-lg">
            <h4 className="text-amber-300 font-medium mb-4">Field Management</h4>
            {renderFieldList()}
          </div>
        </div>

        {/* Right Panel: Dropdown Groups */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-900/50 border border-slate-600/50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-amber-300 font-medium">Dropdown Groups</h4>
              <button
                onClick={() => setShowCreateGroupModal(true)}
                className="px-3 py-1 bg-amber-900/50 text-amber-300 border border-amber-300/50 rounded text-sm hover:bg-amber-800/50 transition-colors"
              >
                <Plus size={14} className="inline mr-1" />
                Add Group
              </button>
            </div>
            {renderDropdownGroups()}
          </div>
        </div>
      </div>

      {/* Create Field Modal */}
      {renderCreateFieldModal()}

      {/* Edit Field Modal */}
      {showEditModal && editingField && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-600 rounded-lg p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-light text-amber-300">
              Edit Field: {editingField.display_name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-amber-200/80 mb-1">Field Name (Internal)</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
                  placeholder="field_name"
                />
              </div>
              
              <div>
                <label className="block text-sm text-amber-200/80 mb-1">Display Name</label>
                <input
                  type="text"
                  value={editForm.display_name}
                  onChange={(e) => setEditForm({...editForm, display_name: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
                  placeholder="Display Name"
                />
              </div>
              
              <div>
                <label className="block text-sm text-amber-200/80 mb-1">Field Type</label>
                <select
                  value={editForm.field_type}
                  onChange={(e) => setEditForm({
                    ...editForm, 
                    field_type: e.target.value as FieldType,
                    dropdown_group_id: e.target.value === 'dropdown' ? editForm.dropdown_group_id : null
                  })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="dropdown">Dropdown</option>
                </select>
              </div>
              
              {editForm.field_type === 'dropdown' && (
                <div>
                  <label className="block text-sm text-amber-200/80 mb-1">Dropdown Group</label>
                  <select
                    value={editForm.dropdown_group_id || ''}
                    onChange={(e) => setEditForm({...editForm, dropdown_group_id: e.target.value || null})}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
                  >
                    <option value="">Select Dropdown Group</option>
                    {dropdownGroups.map(group => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.is_required}
                    onChange={(e) => setEditForm({...editForm, is_required: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-300">Required</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.default_visible}
                    onChange={(e) => setEditForm({...editForm, default_visible: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-300">Visible by Default</span>
                </label>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleUpdateField}
                disabled={!editForm.name || !editForm.display_name || (editForm.field_type === 'dropdown' && !editForm.dropdown_group_id)}
                className="flex-1 px-4 py-2 bg-amber-900/50 text-amber-300 border border-amber-300/50 rounded hover:bg-amber-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Field
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingField(null);
                }}
                className="px-4 py-2 bg-slate-700/50 text-slate-300 border border-slate-600/50 rounded hover:bg-slate-600/50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Dropdown Group Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-600 rounded-lg p-6 w-full max-w-lg space-y-4">
            <h3 className="text-lg font-light text-amber-300">Create Dropdown Group</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-amber-200/80 mb-1">Group Name</label>
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
                  placeholder="Group name"
                />
              </div>
              
              <div>
                <label className="block text-sm text-amber-200/80 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({...groupForm, description: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
                  placeholder="Description"
                />
              </div>

              <div>
                <label className="block text-sm text-amber-200/80 mb-1">Source Type</label>
                <select
                  value={groupForm.source_type}
                  onChange={(e) => setGroupForm({
                    ...groupForm, 
                    source_type: e.target.value as DropdownSourceType,
                    source_category_id: null,
                    source_type_id: null,
                    source_tier_id: null,
                    applies_to: null
                  })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
                >
                  <option value="custom">Custom Options</option>
                  <option value="categories">Categories</option>
                  <option value="types">Types</option>
                  <option value="tiers">Tiers</option>
                  <option value="items">Items</option>
                  <option value="schematics">Schematics</option>
                </select>
                <div className="text-xs text-slate-400 mt-1">
                  {groupForm.source_type === 'custom' ? 'Manually create options' : `Auto-generate options from ${groupForm.source_type}`}
                </div>
              </div>

              {/* Filters for dynamic sources */}
              {(groupForm.source_type === 'categories' || groupForm.source_type === 'types') && (
                <div>
                  <label className="block text-sm text-amber-200/80 mb-1">Filter by Applies To</label>
                  <select
                    value={groupForm.applies_to || ''}
                    onChange={(e) => setGroupForm({...groupForm, applies_to: e.target.value as AppliesTo || null})}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
                  >
                    <option value="">All</option>
                    <option value="items">Items Only</option>
                    <option value="schematics">Schematics Only</option>
                    <option value="both">Both Items & Schematics</option>
                  </select>
                </div>
              )}

              {(groupForm.source_type === 'types' || groupForm.source_type === 'items' || groupForm.source_type === 'schematics') && (
                <div>
                  <label className="block text-sm text-amber-200/80 mb-1">Filter by Category</label>
                  <select
                    value={groupForm.source_category_id || ''}
                    onChange={(e) => setGroupForm({...groupForm, source_category_id: e.target.value || null})}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {(groupForm.source_type === 'items' || groupForm.source_type === 'schematics') && groupForm.source_category_id && (
                <div>
                  <label className="block text-sm text-amber-200/80 mb-1">Filter by Type</label>
                  <select
                    value={groupForm.source_type_id || ''}
                    onChange={(e) => setGroupForm({...groupForm, source_type_id: e.target.value || null})}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
                  >
                    <option value="">All Types</option>
                    {types.filter(type => type.category_id === groupForm.source_category_id).map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {(groupForm.source_type === 'items' || groupForm.source_type === 'schematics') && (
                <div>
                  <label className="block text-sm text-amber-200/80 mb-1">Filter by Tier</label>
                  <select
                    value={groupForm.source_tier_id || ''}
                    onChange={(e) => setGroupForm({...groupForm, source_tier_id: e.target.value || null})}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
                  >
                    <option value="">All Tiers</option>
                    {tiers.map(tier => (
                      <option key={tier.id} value={tier.id}>{tier.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleCreateGroup}
                disabled={!groupForm.name}
                className="flex-1 px-4 py-2 bg-amber-900/50 text-amber-300 border border-amber-300/50 rounded hover:bg-amber-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Group
              </button>
              <button
                onClick={() => {
                  setShowCreateGroupModal(false);
                  setGroupForm({ 
                    name: '', 
                    description: '',
                    source_type: 'custom',
                    source_category_id: null,
                    source_type_id: null,
                    source_tier_id: null,
                    applies_to: null
                  });
                }}
                className="px-4 py-2 bg-slate-700/50 text-slate-300 border border-slate-600/50 rounded hover:bg-slate-600/50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dropdown Group Modal */}
      {showEditGroupModal && editingGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-600 rounded-lg p-6 w-full max-w-lg space-y-4">
            <h3 className="text-lg font-light text-amber-300">
              Edit Group: {editingGroup.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-amber-200/80 mb-1">Group Name</label>
                <input
                  type="text"
                  value={groupEditForm.name}
                  onChange={(e) => setGroupEditForm({...groupEditForm, name: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
                  placeholder="Group name"
                />
              </div>
              
              <div>
                <label className="block text-sm text-amber-200/80 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={groupEditForm.description}
                  onChange={(e) => setGroupEditForm({...groupEditForm, description: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
                  placeholder="Description"
                />
              </div>

              <div>
                <label className="block text-sm text-amber-200/80 mb-1">Source Type</label>
                <select
                  value={groupEditForm.source_type}
                  onChange={(e) => setGroupEditForm({
                    ...groupEditForm, 
                    source_type: e.target.value as DropdownSourceType,
                    source_category_id: null,
                    source_type_id: null,
                    source_tier_id: null,
                    applies_to: null
                  })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
                >
                  <option value="custom">Custom Options</option>
                  <option value="categories">Categories</option>
                  <option value="types">Types</option>
                  <option value="tiers">Tiers</option>
                  <option value="items">Items</option>
                  <option value="schematics">Schematics</option>
                </select>
                <div className="text-xs text-slate-400 mt-1">
                  {groupEditForm.source_type === 'custom' ? 'Manually create options' : `Auto-generate options from ${groupEditForm.source_type}`}
                </div>
              </div>

              {/* Filters for dynamic sources */}
              {(groupEditForm.source_type === 'categories' || groupEditForm.source_type === 'types') && (
                <div>
                  <label className="block text-sm text-amber-200/80 mb-1">Filter by Applies To</label>
                  <select
                    value={groupEditForm.applies_to || ''}
                    onChange={(e) => setGroupEditForm({...groupEditForm, applies_to: e.target.value as AppliesTo || null})}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
                  >
                    <option value="">All</option>
                    <option value="items">Items Only</option>
                    <option value="schematics">Schematics Only</option>
                    <option value="both">Both Items & Schematics</option>
                  </select>
                </div>
              )}

              {(groupEditForm.source_type === 'types' || groupEditForm.source_type === 'items' || groupEditForm.source_type === 'schematics') && (
                <div>
                  <label className="block text-sm text-amber-200/80 mb-1">Filter by Category</label>
                  <select
                    value={groupEditForm.source_category_id || ''}
                    onChange={(e) => setGroupEditForm({...groupEditForm, source_category_id: e.target.value || null})}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {(groupEditForm.source_type === 'items' || groupEditForm.source_type === 'schematics') && groupEditForm.source_category_id && (
                <div>
                  <label className="block text-sm text-amber-200/80 mb-1">Filter by Type</label>
                  <select
                    value={groupEditForm.source_type_id || ''}
                    onChange={(e) => setGroupEditForm({...groupEditForm, source_type_id: e.target.value || null})}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
                  >
                    <option value="">All Types</option>
                    {types.filter(type => type.category_id === groupEditForm.source_category_id).map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {(groupEditForm.source_type === 'items' || groupEditForm.source_type === 'schematics') && (
                <div>
                  <label className="block text-sm text-amber-200/80 mb-1">Filter by Tier</label>
                  <select
                    value={groupEditForm.source_tier_id || ''}
                    onChange={(e) => setGroupEditForm({...groupEditForm, source_tier_id: e.target.value || null})}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
                  >
                    <option value="">All Tiers</option>
                    {tiers.map(tier => (
                      <option key={tier.id} value={tier.id}>{tier.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleUpdateGroup}
                disabled={!groupEditForm.name}
                className="flex-1 px-4 py-2 bg-amber-900/50 text-amber-300 border border-amber-300/50 rounded hover:bg-amber-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Group
              </button>
              <button
                onClick={() => {
                  setShowEditGroupModal(false);
                  setEditingGroup(null);
                  setGroupEditForm({ 
                    name: '', 
                    description: '',
                    source_type: 'custom',
                    source_category_id: null,
                    source_type_id: null,
                    source_tier_id: null,
                    applies_to: null
                  });
                }}
                className="px-4 py-2 bg-slate-700/50 text-slate-300 border border-slate-600/50 rounded hover:bg-slate-600/50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Dropdown Option Modal */}
      {showCreateOptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-600 rounded-lg p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-light text-amber-300">Add Option</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-amber-200/80 mb-1">Option Value</label>
                <input
                  type="text"
                  value={optionForm.value}
                  onChange={(e) => setOptionForm({...optionForm, value: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
                  placeholder="Option value"
                />
              </div>
              
              <div>
                <label className="block text-sm text-amber-200/80 mb-1">Display Label (Optional)</label>
                <input
                  type="text"
                  value={optionForm.label}
                  onChange={(e) => setOptionForm({...optionForm, label: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
                  placeholder="Display label (defaults to value)"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleSubmitCreateOption}
                disabled={!optionForm.value}
                className="flex-1 px-4 py-2 bg-amber-900/50 text-amber-300 border border-amber-300/50 rounded hover:bg-amber-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Option
              </button>
              <button
                onClick={() => {
                  setShowCreateOptionModal(false);
                  setOptionForm({ value: '', label: '', sort_order: 1, group_id: '' });
                }}
                className="px-4 py-2 bg-slate-700/50 text-slate-300 border border-slate-600/50 rounded hover:bg-slate-600/50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dropdown Option Modal */}
      {showEditOptionModal && editingOption && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-600 rounded-lg p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-light text-amber-300">
              Edit Option: {editingOption.value}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-amber-200/80 mb-1">Option Value</label>
                <input
                  type="text"
                  value={optionEditForm.value}
                  onChange={(e) => setOptionEditForm({...optionEditForm, value: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
                  placeholder="Option value"
                />
              </div>
              
              <div>
                <label className="block text-sm text-amber-200/80 mb-1">Display Label (Optional)</label>
                <input
                  type="text"
                  value={optionEditForm.label}
                  onChange={(e) => setOptionEditForm({...optionEditForm, label: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-200 focus:border-amber-500/50"
                  placeholder="Display label (defaults to value)"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleSubmitEditOption}
                disabled={!optionEditForm.value}
                className="flex-1 px-4 py-2 bg-amber-900/50 text-amber-300 border border-amber-300/50 rounded hover:bg-amber-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Option
              </button>
              <button
                onClick={() => {
                  setShowEditOptionModal(false);
                  setEditingOption(null);
                  setOptionEditForm({ value: '', label: '', sort_order: 1 });
                }}
                className="px-4 py-2 bg-slate-700/50 text-slate-300 border border-slate-600/50 rounded hover:bg-slate-600/50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        type={confirmationModal.type}
        title={confirmationModal.title}
        message={confirmationModal.message}
        onClose={closeConfirmationModal}
      />
    </div>
  );
};

export default FieldDefinitionManager; 