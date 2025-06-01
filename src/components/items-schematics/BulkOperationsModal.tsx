import React, { useState, useEffect } from 'react';
import { X, Save, Trash, Edit, AlertCircle, Package, FileText, Check } from 'lucide-react';
import { useItemsSchematics } from '../../hooks/useItemsSchematics';
import type { AppliesTo } from '../../types';

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

interface BulkEditData {
  category_id?: string;
  type_id?: string;
  tier_id?: string;
  icon_url?: string;
  field_values?: Record<string, any>;
}

interface BulkOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEntities: Entity[];
  entityType: 'items' | 'schematics';
  operation: 'edit' | 'delete';
  onSuccess: (operation: string, count: number) => void;
}

interface ValidationErrors {
  [key: string]: string;
}

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
  <div className="space-y-1">
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {description && (
      <p className="text-xs text-slate-500">{description}</p>
    )}
    {children}
    {error && (
      <div className="flex items-center gap-1 text-sm text-red-600">
        <AlertCircle className="w-4 h-4" />
        {error}
      </div>
    )}
  </div>
);

const ProgressBar: React.FC<{
  current: number;
  total: number;
}> = ({ current, total }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  
  return (
    <div className="w-full bg-slate-200 rounded-full h-2">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

// =================================
// Bulk Delete Component
// =================================

const BulkDeleteContent: React.FC<{
  entities: Entity[];
  entityType: 'items' | 'schematics';
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;
  progress: number;
}> = ({ entities, entityType, onConfirm, onCancel, isProcessing, progress }) => {
  return (
    <div className="space-y-6">
      {/* Warning Message */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
        <div className="absolute inset-0 bg-gradient-to-b from-red-600/20 via-red-500/10 to-transparent rounded-lg" />
        
        <div className="relative p-4 rounded-lg border border-red-400/40">
          <div className="flex items-center gap-2 text-red-300 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium tracking-wide"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Confirm Bulk Deletion
            </span>
          </div>
          <p className="text-red-200/80 text-sm font-light"
             style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            You are about to permanently delete {entities.length} {entityType}. 
            This action cannot be undone.
          </p>
        </div>
      </div>

      {/* Entity List */}
      <div className="space-y-3">
        <h4 className="font-medium text-amber-200 tracking-wide"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
          {entityType === 'items' ? 'Items' : 'Schematics'} to be deleted:
        </h4>
        <div className="group relative max-h-48 overflow-y-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
          
          <div className="relative rounded-lg border border-amber-400/20">
            {entities.map((entity, index) => (
              <div key={entity.id} className={`flex items-center gap-3 p-3 ${
                index < entities.length - 1 ? 'border-b border-amber-400/10' : ''
              }`}>
                <div className="w-8 h-8 bg-slate-900/60 border border-amber-400/20 rounded flex items-center justify-center">
                  {entity.icon_url ? (
                    <img 
                      src={entity.icon_url} 
                      alt={entity.name}
                      className="w-6 h-6 object-cover rounded"
                    />
                  ) : (
                    entityType === 'items' ? (
                      <Package className="w-4 h-4 text-gold-300" />
                    ) : (
                      <FileText className="w-4 h-4 text-gold-300" />
                    )
                  )}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-amber-200 text-sm tracking-wide"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    {entity.name}
                  </h5>
                  <p className="text-xs text-amber-200/60 font-light">
                    {entity.category_id} {entity.type_id ? `• ${entity.type_id}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Bar (when processing) */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-amber-200/70 font-light"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Deleting entities...
            </span>
            <span className="text-amber-200/70 font-light"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              {progress} / {entities.length}
            </span>
          </div>
          <ProgressBar current={progress} total={entities.length} />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-400/20">
        <button
          type="button"
          onClick={onCancel}
          className="group relative px-4 py-2 text-amber-200 border border-amber-400/40 
                   hover:bg-amber-400/10 rounded-lg transition-all duration-200 font-light"
          style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
          disabled={isProcessing}
        >
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-lg" />
          <span className="relative">Cancel</span>
        </button>
        <button
          onClick={onConfirm}
          className="group relative px-4 py-2 text-red-200 border border-red-400/40 
                   hover:bg-red-400/20 rounded-lg transition-all duration-200 font-light flex items-center gap-2"
          style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
          disabled={isProcessing}
        >
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-lg" />
          <span className="relative flex items-center gap-2">
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-red-200 border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash className="w-4 h-4" />
                Delete {entities.length} {entityType}
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
};

// =================================
// Bulk Edit Component
// =================================

const BulkEditContent: React.FC<{
  entities: Entity[];
  entityType: 'items' | 'schematics';
  onSave: (data: BulkEditData) => void;
  onCancel: () => void;
  isProcessing: boolean;
  progress: number;
}> = ({ entities, entityType, onSave, onCancel, isProcessing, progress }) => {
  const { categories, types, tiers, loading } = useItemsSchematics();
  
  const [editData, setEditData] = useState<BulkEditData>({});
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const appliesTo: AppliesTo = entityType === 'items' ? 'item' : 'schematic';
  
  // Filter categories by entity type
  const filteredCategories = categories.filter(cat => 
    cat.applies_to === 'both' || cat.applies_to === appliesTo
  );
  
  // Filter types by selected category
  const filteredTypes = types.filter(type => type.category_id === editData.category_id);

  const toggleField = (fieldName: string) => {
    const newSelected = new Set(selectedFields);
    if (newSelected.has(fieldName)) {
      newSelected.delete(fieldName);
      // Clear the data for unselected fields
      const newEditData = { ...editData };
      delete newEditData[fieldName as keyof BulkEditData];
      setEditData(newEditData);
    } else {
      newSelected.add(fieldName);
    }
    setSelectedFields(newSelected);
  };

  const updateField = (key: keyof BulkEditData, value: any) => {
    setEditData(prev => ({ ...prev, [key]: value }));
    // Clear validation error when user starts editing
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const { [key]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSave = () => {
    // Only include selected fields in the update
    const dataToSave: BulkEditData = {};
    selectedFields.forEach(field => {
      if (editData[field as keyof BulkEditData] !== undefined) {
        dataToSave[field as keyof BulkEditData] = editData[field as keyof BulkEditData];
      }
    });

    if (Object.keys(dataToSave).length === 0) {
      setValidationErrors({ general: 'Please select at least one field to update' });
      return;
    }

    setValidationErrors({});
    onSave(dataToSave);
  };

  return (
    <div className="space-y-6">
      {/* Info Message */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-blue-700 mb-2">
          <Edit className="w-5 h-5" />
          <span className="font-medium">Bulk Edit</span>
        </div>
        <p className="text-blue-600 text-sm">
          You are editing {entities.length} {entityType}. 
          Select the fields you want to update and provide new values.
        </p>
      </div>

      {/* Field Selection and Editing */}
      <div className="space-y-4">
        <h4 className="font-medium text-slate-900">Select fields to update:</h4>

        {/* Category */}
        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              checked={selectedFields.has('category_id')}
              onChange={() => toggleField('category_id')}
              className="rounded border-slate-300"
            />
            <label className="font-medium text-slate-700">Category</label>
          </div>
          {selectedFields.has('category_id') && (
            <select
              value={editData.category_id || ''}
              onChange={(e) => {
                updateField('category_id', e.target.value);
                // Reset type when category changes
                if (selectedFields.has('type_id')) {
                  updateField('type_id', '');
                }
              }}
              className="form-select w-full"
              disabled={loading.categories}
            >
              <option value="">Select a category</option>
              {filteredCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon_fallback || category.icon} {category.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Type */}
        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              checked={selectedFields.has('type_id')}
              onChange={() => toggleField('type_id')}
              className="rounded border-slate-300"
            />
            <label className="font-medium text-slate-700">Type</label>
          </div>
          {selectedFields.has('type_id') && (
            <select
              value={editData.type_id || ''}
              onChange={(e) => updateField('type_id', e.target.value)}
              className="form-select w-full"
              disabled={loading.types || !editData.category_id}
            >
              <option value="">Select a type (optional)</option>
              {filteredTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.icon_fallback || type.icon} {type.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Tier */}
        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              checked={selectedFields.has('tier_id')}
              onChange={() => toggleField('tier_id')}
              className="rounded border-slate-300"
            />
            <label className="font-medium text-slate-700">Tier</label>
          </div>
          {selectedFields.has('tier_id') && (
            <select
              value={editData.tier_id || ''}
              onChange={(e) => updateField('tier_id', e.target.value)}
              className="form-select w-full"
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
          )}
        </div>

        {/* Icon URL */}
        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              checked={selectedFields.has('icon_url')}
              onChange={() => toggleField('icon_url')}
              className="rounded border-slate-300"
            />
            <label className="font-medium text-slate-700">Icon URL</label>
          </div>
          {selectedFields.has('icon_url') && (
            <input
              type="text"
              value={editData.icon_url || ''}
              onChange={(e) => updateField('icon_url', e.target.value)}
              placeholder="Enter icon URL or emoji"
              className="form-input w-full"
            />
          )}
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.general && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Error</span>
          </div>
          <p className="text-sm text-red-600 mt-1">{validationErrors.general}</p>
        </div>
      )}

      {/* Progress Bar (when processing) */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Updating entities...</span>
            <span className="text-slate-600">{progress} / {entities.length}</span>
          </div>
          <ProgressBar current={progress} total={entities.length} />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="btn btn-primary flex items-center gap-2"
          disabled={isProcessing || selectedFields.size === 0}
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Update {entities.length} {entityType}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// =================================
// Main Modal Component
// =================================

const BulkOperationsModal: React.FC<BulkOperationsModalProps> = ({
  isOpen,
  onClose,
  selectedEntities,
  entityType,
  operation,
  onSuccess
}) => {
  const { updateItem, updateSchematic, deleteItem, deleteSchematic } = useItemsSchematics();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [isOpen]);

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    setProgress(0);

    try {
      const deleteFunction = entityType === 'items' ? deleteItem : deleteSchematic;
      
      for (let i = 0; i < selectedEntities.length; i++) {
        const entity = selectedEntities[i];
        await deleteFunction(entity.id);
        setProgress(i + 1);
        
        // Small delay to show progress
        if (i < selectedEntities.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      onSuccess('delete', selectedEntities.length);
      onClose();
    } catch (error) {
      console.error('Bulk delete error:', error);
      // TODO: Show error toast
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkEdit = async (editData: BulkEditData) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      const updateFunction = entityType === 'items' ? updateItem : updateSchematic;
      
      for (let i = 0; i < selectedEntities.length; i++) {
        const entity = selectedEntities[i];
        const updatedEntity = {
          ...entity,
          ...editData,
          id: entity.id
        };
        
        await updateFunction(updatedEntity);
        setProgress(i + 1);
        
        // Small delay to show progress
        if (i < selectedEntities.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      onSuccess('edit', selectedEntities.length);
      onClose();
    } catch (error) {
      console.error('Bulk edit error:', error);
      // TODO: Show error toast
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const modalTitle = `Bulk ${operation === 'edit' ? 'Edit' : 'Delete'} ${entityType === 'items' ? 'Items' : 'Schematics'}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="group relative w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
        <div className="absolute inset-0 bg-gradient-to-b from-amber-600/10 via-amber-500/5 to-transparent rounded-lg" />
        
        <div className="relative rounded-lg border border-amber-400/20">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-amber-400/20">
            <div className="flex items-center gap-3">
              {operation === 'edit' ? (
                <Edit className="w-6 h-6 text-gold-300" />
              ) : (
                <Trash className="w-6 h-6 text-red-400" />
              )}
              <h2 className="text-xl font-medium text-amber-200 tracking-wide"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                {modalTitle}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-amber-200/60 hover:text-gold-300 hover:bg-gold-300/20 rounded-full transition-all duration-200"
              disabled={isProcessing}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {operation === 'delete' ? (
              <BulkDeleteContent
                entities={selectedEntities}
                entityType={entityType}
                onConfirm={handleBulkDelete}
                onCancel={onClose}
                isProcessing={isProcessing}
                progress={progress}
              />
            ) : (
              <BulkEditContent
                entities={selectedEntities}
                entityType={entityType}
                onSave={handleBulkEdit}
                onCancel={onClose}
                isProcessing={isProcessing}
                progress={progress}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOperationsModal; 