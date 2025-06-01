import React, { useState, useEffect, useMemo } from 'react';
import { X, Package, FileText, Save, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { useItemsSchematics } from '../../hooks/useItemsSchematics';
import { useAuth } from '../auth/AuthProvider';
import type { AppliesTo, ResolvedField, FieldType } from '../../types';

// =================================
// Types and Interfaces
// =================================

interface Entity {
  id: string;
  name: string;
  description?: string;
  category_id: string;
  type_id?: string;
  tier_id?: string;
  icon_url?: string;
  field_values?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

interface FormData {
  name: string;
  description: string;
  category_id: string;
  type_id: string;
  tier_id: string;
  icon_url: string;
  field_values: Record<string, any>;
}

interface ValidationErrors {
  [key: string]: string;
}

interface CreateEditItemSchematicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (entity: Entity) => void;
  entityType?: 'items' | 'schematics';
  mode: 'create' | 'edit';
  entity?: Entity | null;
}

// =================================
// Dynamic Field Components
// =================================

const DynamicFieldRenderer: React.FC<{
  field: ResolvedField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  dropdownOptions?: Array<{ value: string; label: string }>;
}> = ({ field, value, onChange, error, dropdownOptions = [] }) => {
  const renderField = () => {
    switch (field.field_type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value || null)}
            className={`w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-amber-100 placeholder-slate-400
                       focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200
                       ${error ? 'border-red-400/60' : ''}`}
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
            placeholder={`Enter ${field.display_name.toLowerCase()}`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value !== null && value !== undefined ? value : ''}
            onChange={(e) => {
              const numValue = e.target.value;
              if (numValue === '') {
                onChange(null);
              } else {
                const parsed = Number(numValue);
                onChange(isNaN(parsed) ? null : parsed);
              }
            }}
            className={`w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-amber-100 placeholder-slate-400
                       focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200
                       ${error ? 'border-red-400/60' : ''}`}
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
            placeholder={`Enter ${field.display_name.toLowerCase()}`}
          />
        );

      case 'dropdown':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-amber-100 
                       focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200
                       ${error ? 'border-red-400/60' : ''}`}
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
          >
            <option value="">Select {field.display_name}</option>
            {dropdownOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-amber-100 placeholder-slate-400
                       focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200
                       ${error ? 'border-red-400/60' : ''}`}
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
            placeholder={`Enter ${field.display_name.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <FormField
      label={field.display_name}
      required={field.is_required}
      error={error}
      description={`${field.scope_type.charAt(0).toUpperCase() + field.scope_type.slice(1)} field (Level ${field.inheritance_level})`}
    >
      {renderField()}
    </FormField>
  );
};

const DynamicFieldsSection: React.FC<{
  fields: ResolvedField[];
  fieldValues: Record<string, any>;
  onFieldChange: (fieldName: string, value: any) => void;
  errors: ValidationErrors;
  loading: boolean;
}> = ({ fields, fieldValues, onFieldChange, errors, loading }) => {
  const { dropdownGroups } = useItemsSchematics();

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="font-light text-amber-200 border-b border-amber-400/20 pb-2 tracking-wide"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
          Custom Properties
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
          <span className="ml-2 text-amber-200/70 font-light tracking-wide"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            Loading custom fields...
          </span>
        </div>
      </div>
    );
  }

  if (fields.length === 0) {
    return null;
  }

  // Group fields by inheritance level for better organization
  const fieldsByLevel = fields.reduce((acc, field) => {
    const level = field.inheritance_level;
    if (!acc[level]) acc[level] = [];
    acc[level].push(field);
    return acc;
  }, {} as Record<number, ResolvedField[]>);

  const getLevelTitle = (level: number) => {
    switch (level) {
      case 1: return 'Global Properties';
      case 2: return 'Category Properties';
      case 3: return 'Type Properties';
      default: return 'Custom Properties';
    }
  };

  const getLevelDescription = (level: number) => {
    switch (level) {
      case 1: return 'Properties available to all items and schematics';
      case 2: return 'Properties specific to this category';
      case 3: return 'Properties specific to this type';
      default: return 'Additional custom properties';
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-light text-amber-200 border-b border-amber-400/20 pb-2 tracking-wide"
          style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
        Custom Properties
      </h3>

      {Object.entries(fieldsByLevel)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([level, levelFields]) => (
          <div key={level} className="space-y-4">
            <div className="bg-slate-800/60 border border-amber-400/20 rounded-lg p-3">
              <h4 className="font-light text-amber-200 text-sm tracking-wide"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                {getLevelTitle(Number(level))}
              </h4>
              <p className="text-xs text-amber-200/60 mt-1 font-light"
                 style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                {getLevelDescription(Number(level))}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {levelFields
                .sort((a, b) => a.display_order - b.display_order)
                .map(field => {
                  // Get dropdown options for this field
                  const dropdownOptions = field.dropdown_group_id 
                    ? dropdownGroups
                        .find(group => group.id === field.dropdown_group_id)
                        ?.options?.map(option => ({
                          value: option.value,
                          label: option.display_text
                        })) || []
                    : [];

                  return (
                    <DynamicFieldRenderer
                      key={field.id}
                      field={field}
                      value={fieldValues[field.name]}
                      onChange={(value) => onFieldChange(field.name, value)}
                      error={errors[`field_${field.name}`]}
                      dropdownOptions={dropdownOptions}
                    />
                  );
                })}
            </div>
          </div>
        ))}
    </div>
  );
};

// =================================
// Form Field Components
// =================================

const FormField: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  description?: string;
  children: React.ReactNode;
}> = ({ label, required, error, description, children }) => (
  <div className="space-y-2">
    <label className="block text-sm font-light text-amber-200/70 tracking-wide"
           style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
      {label}
      {required && <span className="text-red-300 ml-1">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-sm text-red-300 font-light"
         style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
        {error}
      </p>
    )}
    {description && !error && (
      <p className="text-xs text-amber-200/50 font-light"
         style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
        {description}
      </p>
    )}
  </div>
);

const HierarchySelector: React.FC<{
  entityType?: 'items' | 'schematics';
  selectedCategory: string;
  selectedType: string;
  selectedTier: string;
  onCategoryChange: (categoryId: string) => void;
  onTypeChange: (typeId: string) => void;
  onTierChange: (tierId: string) => void;
  errors: ValidationErrors;
}> = ({
  entityType,
  selectedCategory,
  selectedType,
  selectedTier,
  onCategoryChange,
  onTypeChange,
  onTierChange,
  errors
}) => {
  const { categories, types, tiers, loading, refetchTypes } = useItemsSchematics();
  
  const appliesTo = entityType === 'items' ? 'items' : entityType === 'schematics' ? 'schematics' : null;
  
  console.log('HierarchySelector - entityType:', entityType, 'appliesTo:', appliesTo);
  
  // Fetch types when a category is selected
  useEffect(() => {
    if (selectedCategory) {
      refetchTypes(selectedCategory);
    }
  }, [selectedCategory, refetchTypes]);
  
  // Filter categories by entity type (applies_to is an array in the database)
  const filteredCategories = categories.filter(cat => {
    // If no entity type selected, show all categories
    if (!appliesTo) return true;
    
    // Handle both array format from database and string format for backward compatibility
    if (Array.isArray(cat.applies_to)) {
      return cat.applies_to.includes(appliesTo);
    }
    // Fallback for string format (if any exist)
    return cat.applies_to === 'both' || cat.applies_to === appliesTo;
  });
  
  // Filter types by selected category
  const filteredTypes = types.filter(type => type.category_id === selectedCategory);

  return (
    <div className="space-y-4">
      {/* Category Selection */}
      <FormField
        label="Category"
        required
        error={errors.category_id}
        description="Choose the category this item belongs to"
      >
        <select
          value={selectedCategory}
          onChange={(e) => {
            onCategoryChange(e.target.value);
            onTypeChange(''); // Reset type when category changes
          }}
          className={`w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-amber-100 
                     focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed
                     ${errors.category_id ? 'border-red-400/60' : ''}`}
          style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
          disabled={loading.categories}
        >
          <option value="">Select a category</option>
          {filteredCategories.map(category => (
            <option key={category.id} value={category.id}>
              {category.icon_fallback || category.icon} {category.name}
            </option>
          ))}
        </select>
      </FormField>

      {/* Type Selection */}
      {selectedCategory && (
        <FormField
          label="Type"
          error={errors.type_id}
          description="Optionally specify a more specific type"
        >
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className={`w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-amber-100 
                       focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       ${errors.type_id ? 'border-red-400/60' : ''}`}
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
            disabled={loading.types}
          >
            <option value="">Select a type (optional)</option>
            {filteredTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.icon_fallback || type.icon} {type.name}
              </option>
            ))}
          </select>
        </FormField>
      )}

      {/* Tier Selection */}
      <FormField
        label="Tier"
        error={errors.tier_id}
        description="Choose the tier/quality level"
      >
        <select
          value={selectedTier}
          onChange={(e) => onTierChange(e.target.value)}
          className={`w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-amber-100 
                     focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed
                     ${errors.tier_id ? 'border-red-400/60' : ''}`}
          style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
          disabled={loading.tiers}
        >
          <option value="">Select a tier (optional)</option>
          {tiers
            .sort((a, b) => a.level - b.level)
            .map(tier => (
              <option key={tier.id} value={tier.id}>
                {tier.name} (Level {tier.level})
              </option>
            ))}
        </select>
      </FormField>
    </div>
  );
};

const IconSelector: React.FC<{
  selectedIcon: string;
  onIconSelect: (iconUrl: string) => void;
  error?: string;
}> = ({ selectedIcon, onIconSelect, error }) => {
  const [customIcon, setCustomIcon] = useState(selectedIcon);

  return (
    <FormField
      label="Icon"
      error={error}
      description="Enter a URL for a custom icon, or upload an image"
    >
      <div className="space-y-3">
        {/* Current Icon Preview */}
        {selectedIcon && (
          <div className="flex items-center gap-3 p-3 bg-slate-800/60 border border-amber-400/20 rounded-lg">
            <div className="w-12 h-12 bg-slate-700 border border-slate-600 rounded flex items-center justify-center">
              {selectedIcon.startsWith('http') ? (
                <img 
                  src={selectedIcon} 
                  alt="Icon preview" 
                  className="w-10 h-10 object-cover rounded"
                />
              ) : (
                <span className="text-2xl">{selectedIcon}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-light text-amber-200 tracking-wide"
                 style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                Current Icon
              </p>
              <p className="text-xs text-amber-200/60 truncate max-w-48 font-light"
                 style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                {selectedIcon}
              </p>
            </div>
          </div>
        )}

        {/* Icon URL Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customIcon}
            onChange={(e) => setCustomIcon(e.target.value)}
            placeholder="Enter icon URL or emoji"
            className={`flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-amber-100 placeholder-slate-400
                       focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200
                       ${error ? 'border-red-400/60' : ''}`}
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
          />
          <button
            type="button"
            onClick={() => onIconSelect(customIcon)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-amber-200 
                      rounded-lg transition-all duration-200 font-light tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
            disabled={!customIcon.trim()}
          >
            Apply
          </button>
        </div>

        {/* Upload Button Placeholder */}
        <button
          type="button"
          className="w-full p-3 border-2 border-dashed border-amber-400/30 rounded-lg text-amber-200/70 
                    hover:border-amber-400/50 hover:text-amber-200 transition-all duration-200 bg-slate-800/30"
          onClick={() => {
            // TODO: Implement image upload functionality
            console.log('Image upload coming soon...');
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" />
            <span className="text-sm font-light tracking-wide"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Upload custom icon (Coming Soon)
            </span>
          </div>
        </button>
      </div>
    </FormField>
  );
};

// =================================
// Main Modal Component
// =================================

const CreateEditItemSchematicModal: React.FC<CreateEditItemSchematicModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  entityType: propEntityType,
  mode,
  entity
}) => {
  const { user } = useAuth();
  const { resolveFields, createItem, createSchematic, updateItem, updateSchematic } = useItemsSchematics();

  // Entity class selection state (for create mode)
  const [selectedEntityClass, setSelectedEntityClass] = useState<'items' | 'schematics' | ''>('');
  const entityType = mode === 'edit' ? (entity?.entityType || propEntityType) : selectedEntityClass;

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category_id: '',
    type_id: '',
    tier_id: '',
    icon_url: '',
    field_values: {}
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic fields state
  const [resolvedFields, setResolvedFields] = useState<ResolvedField[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);

  // Resolve fields when category or type changes
  useEffect(() => {
    const loadFields = async () => {
      if (!formData.category_id) {
        setResolvedFields([]);
        return;
      }

      setFieldsLoading(true);
      try {
        console.log('🔍 Resolving fields for category:', formData.category_id, 'type:', formData.type_id);
        const fields = await resolveFields({
          category_id: formData.category_id,
          type_id: formData.type_id || undefined
        });
        console.log('🔍 Resolved fields:', fields);
        console.log('🔍 Current form field_values:', formData.field_values);
        setResolvedFields(fields);
      } catch (error) {
        console.error('Error resolving fields:', error);
        setResolvedFields([]);
      } finally {
        setFieldsLoading(false);
      }
    };

    loadFields();
  }, [formData.category_id, formData.type_id, resolveFields]);

  // Initialize form data when entity changes (for edit mode)
  useEffect(() => {
    if (mode === 'edit' && entity) {
      console.log('🔄 Initializing edit form with entity:', entity);
      console.log('🔄 Entity field_values:', entity.field_values);
      setFormData({
        name: entity.name || '',
        description: entity.description || '',
        category_id: entity.category_id || '',
        type_id: entity.type_id || '',
        tier_id: entity.tier_id || '',
        icon_url: entity.icon_url || '',
        field_values: entity.field_values || {}
      });
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        name: '',
        description: '',
        category_id: '',
        type_id: '',
        tier_id: '',
        icon_url: '',
        field_values: {}
      });
    }
    setValidationErrors({});
  }, [mode, entity, isOpen]);

  // Validation
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    console.log('=== VALIDATION DEBUG ===');
    console.log('Mode:', mode);
    console.log('Selected entity class:', selectedEntityClass);
    console.log('Form data:', formData);
    console.log('Resolved fields:', resolvedFields);

    // Entity class validation (create mode only)
    if (mode === 'create' && !selectedEntityClass) {
      errors.entityClass = 'Please select an entity class';
      console.log('❌ Entity class validation failed');
    } else {
      console.log('✅ Entity class validation passed');
    }

    // Basic validations
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      console.log('❌ Name validation failed');
    } else {
      console.log('✅ Name validation passed:', formData.name);
    }

    if (!formData.category_id) {
      errors.category_id = 'Category is required';
      console.log('❌ Category validation failed');
    } else {
      console.log('✅ Category validation passed:', formData.category_id);
    }

    // Validate dynamic fields
    console.log('Checking dynamic fields...');
    resolvedFields.forEach(field => {
      if (field.is_required) {
        const value = formData.field_values[field.name];
        if (value === null || value === undefined || value === '') {
          errors[`field_${field.name}`] = `${field.display_name} is required`;
          console.log(`❌ Required field '${field.name}' validation failed:`, value);
        } else {
          console.log(`✅ Required field '${field.name}' validation passed:`, value);
        }
      }
    });

    console.log('Final validation errors:', errors);
    console.log('=== END VALIDATION DEBUG ===');

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Mode:', mode);
    console.log('Selected entity class:', selectedEntityClass);
    console.log('Entity type:', entityType);
    console.log('Form data:', formData);
    
    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const entityData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category_id: formData.category_id,
        type_id: formData.type_id || null,
        tier_id: formData.tier_id || null,
        icon_url: formData.icon_url || null,
        field_values: formData.field_values,
        ...(mode === 'edit' && entity ? { id: entity.id } : {})
      };

      console.log('Entity data to be saved:', entityData);

      let result;
      
      if (mode === 'create') {
        console.log('Creating new entity of type:', entityType);
        if (entityType === 'items') {
          console.log('Calling createItem...');
          result = await createItem(entityData);
          console.log('CreateItem result:', result);
        } else if (entityType === 'schematics') {
          console.log('Calling createSchematic...');
          result = await createSchematic(entityData);
          console.log('CreateSchematic result:', result);
        } else {
          throw new Error(`Invalid entity class: ${entityType}`);
        }
      } else {
        // For edit mode, we need to pass the id separately from the updates
        const { id, ...updates } = entityData;
        if (entityType === 'items') {
          result = await updateItem(id!, updates);
        } else {
          result = await updateSchematic(id!, updates);
        }
      }

      console.log('Final result:', result);

      if (result) {
        onSuccess(result);
        onClose();
      } else {
        throw new Error('Creation failed - no result returned');
      }
    } catch (error) {
      console.error('Error saving entity:', error);
      setValidationErrors({
        submit: error instanceof Error ? error.message : 'An error occurred while saving'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update form field
  const updateField = (key: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const { [key]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  // Update dynamic field value
  const updateFieldValue = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      field_values: {
        ...prev.field_values,
        [fieldName]: value
      }
    }));
    // Clear validation error when user starts typing
    const errorKey = `field_${fieldName}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => {
        const { [errorKey]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  if (!isOpen) return null;

  const modalTitle = `${mode === 'create' ? 'Create Entity' : 'Edit'} ${mode === 'edit' ? (entityType === 'items' ? 'Item' : 'Schematic') : ''}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="group relative w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
        <div className="absolute inset-0 bg-gradient-to-b from-amber-600/10 via-amber-500/5 to-transparent rounded-lg" />
        
        <div className="relative rounded-lg border border-amber-400/20">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-amber-400/20">
            <div className="flex items-center gap-3">
              {entityType === 'items' ? (
                <Package className="w-6 h-6 text-amber-200/70" />
              ) : (
                <FileText className="w-6 h-6 text-amber-200/70" />
              )}
              <h2 className="text-xl font-light text-amber-200 tracking-wide"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                {modalTitle}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-amber-200/70 hover:text-amber-300 hover:bg-amber-500/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Entity Class Selection (Create Mode Only) */}
            {mode === 'create' && (
              <div className="space-y-4">
                <h3 className="font-light text-amber-200 border-b border-amber-400/20 pb-2 tracking-wide"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  Entity Class
                </h3>
                
                <FormField
                  label="Class"
                  required
                  error={validationErrors.entityClass}
                  description="Select whether you're creating an item or a schematic"
                >
                  <select
                    value={selectedEntityClass}
                    onChange={(e) => {
                      const newValue = e.target.value as 'items' | 'schematics';
                      console.log('Entity class changed to:', newValue);
                      setSelectedEntityClass(newValue);
                      // Clear entity class validation error
                      if (validationErrors.entityClass) {
                        setValidationErrors(prev => {
                          const { entityClass: removed, ...rest } = prev;
                          return rest;
                        });
                      }
                    }}
                    className={`w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-amber-100 
                               focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-200
                               ${validationErrors.entityClass ? 'border-red-400/60' : ''}`}
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                  >
                    <option value="">Select entity class...</option>
                    <option value="items">Item</option>
                    <option value="schematics">Schematic</option>
                  </select>
                </FormField>
              </div>
            )}

            {/* Only show the rest of the form if entity class is selected (create mode) or in edit mode */}
            {(mode === 'edit' || selectedEntityClass) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="font-light text-amber-200 border-b border-amber-400/20 pb-2 tracking-wide"
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      Basic Information
                    </h3>
                    
                    <FormField
                      label="Name"
                      required
                      error={validationErrors.name}
                      description={`Enter a descriptive name for this ${entityType?.slice(0, -1)}`}
                    >
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className={`form-input w-full bg-slate-800 border-slate-600 text-amber-100 placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 ${validationErrors.name ? 'border-red-400/60' : ''}`}
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                        placeholder={`Enter ${entityType?.slice(0, -1)} name`}
                        autoFocus
                      />
                    </FormField>

                    <FormField
                      label="Description"
                      error={validationErrors.description}
                      description="Provide additional details about this item"
                    >
                      <textarea
                        value={formData.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        className={`form-textarea w-full bg-slate-800 border-slate-600 text-amber-100 placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 ${validationErrors.description ? 'border-red-400/60' : ''}`}
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                        rows={3}
                        placeholder="Enter a description (optional)"
                      />
                    </FormField>
                  </div>

                  {/* Hierarchy Selection */}
                  <div className="space-y-4">
                    <h3 className="font-light text-amber-200 border-b border-amber-400/20 pb-2 tracking-wide"
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      Classification
                    </h3>
                    
                    <HierarchySelector
                      entityType={entityType}
                      selectedCategory={formData.category_id}
                      selectedType={formData.type_id}
                      selectedTier={formData.tier_id}
                      onCategoryChange={(categoryId) => updateField('category_id', categoryId)}
                      onTypeChange={(typeId) => updateField('type_id', typeId)}
                      onTierChange={(tierId) => updateField('tier_id', tierId)}
                      errors={validationErrors}
                    />
                  </div>

                  {/* Icon Selection */}
                  <div className="space-y-4">
                    <h3 className="font-light text-amber-200 border-b border-amber-400/20 pb-2 tracking-wide"
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      Appearance
                    </h3>
                    
                    <IconSelector
                      selectedIcon={formData.icon_url}
                      onIconSelect={(iconUrl) => updateField('icon_url', iconUrl)}
                      error={validationErrors.icon_url}
                    />
                  </div>
                </div>

                {/* Right Column - Dynamic Fields */}
                <div className="space-y-6">
                  <DynamicFieldsSection
                    fields={resolvedFields}
                    fieldValues={formData.field_values}
                    onFieldChange={updateFieldValue}
                    errors={validationErrors}
                    loading={fieldsLoading}
                  />
                </div>
              </div>
            )}

            {/* Submit Error */}
            {validationErrors.submit && (
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
                <div className="absolute inset-0 bg-gradient-to-b from-red-600/20 via-red-500/10 to-transparent rounded-lg" />
                
                <div className="relative p-4 rounded-lg border border-red-400/40">
                  <div className="flex items-center gap-2 text-red-300">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-light tracking-wide"
                          style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      Error
                    </span>
                  </div>
                  <p className="text-sm text-red-300/80 mt-1 font-light"
                     style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    {validationErrors.submit}
                  </p>
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-amber-400/20">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline font-light tracking-wide"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="btn btn-primary flex items-center gap-2 font-light tracking-wide"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              disabled={isSubmitting || !formData.name.trim() || !formData.category_id || (mode === 'create' && !selectedEntityClass)}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {mode === 'create' ? 'Create' : 'Update'} {entityType === 'items' ? 'Item' : 'Schematic'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEditItemSchematicModal; 