import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Package, Plus, Edit3, Trash2, Save, X, Settings, AlertCircle } from 'lucide-react';
import DiamondIcon from '../common/DiamondIcon';
import { ImageSelector, ImagePreview } from '../shared';
import { ConfirmationModal } from '../shared/ConfirmationModal';
import { useAuth } from '../auth/AuthProvider';
import { useItemsSchematics } from '../../hooks/useItemsSchematics';
import { createCategory as createCategoryAPI, updateCategory as updateCategoryAPI, deleteCategory as deleteCategoryAPI, getCategoryDependencies, migrateCategoryContent, type CategoryDependencies } from '../../lib/itemsSchematicsCrud';
import type { Category, AppliesTo } from '../../types';

interface CategoryManagerProps {
  // Removed callback props - using modal feedback instead
}

interface CategoryFormData {
  name: string;
  icon_image_id: string | null;
  icon_fallback: string;
  applies_to: AppliesTo[];
  description: string;
}

interface CategoryEditData extends CategoryFormData {
  id: string;
}

const CategoryManager: React.FC<CategoryManagerProps> = () => {
  const { user } = useAuth();
  const { 
    categories,
    loading,
    errors,
    refetchCategories 
  } = useItemsSchematics();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryEditData | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    icon_image_id: null,
    icon_fallback: '',
    applies_to: ['items', 'schematics'],
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  
  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  
  // Migration dialog state
  const [migrationDialog, setMigrationDialog] = useState<{
    isOpen: boolean;
    category: Category | null;
    dependencies: CategoryDependencies | null;
    selectedTargetId: string | null;
  }>({
    isOpen: false,
    category: null,
    dependencies: null,
    selectedTargetId: null
  });

  // Initialize categories on component mount
  useEffect(() => {
    refetchCategories();
  }, []);

  // Helper functions for modal feedback
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

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      icon_image_id: null,
      icon_fallback: '',
      applies_to: ['items', 'schematics'],
      description: ''
    });
    setModalError(null);
  };

  // Handle create modal open
  const handleCreateClick = () => {
    resetForm();
    setModalError(null);
    setIsCreateModalOpen(true);
  };

  // Handle edit click
  const handleEditClick = (category: Category) => {
    setModalError(null); // Clear any previous errors
    setEditingCategory({
      id: category.id,
      name: category.name,
      icon_image_id: category.icon_image_id,
      icon_fallback: category.icon_fallback || '',
      applies_to: category.applies_to,
      description: category.description || ''
    });
  };

  // Handle form field changes
  const handleFieldChange = (field: keyof CategoryFormData, value: any) => {
    if (editingCategory) {
      setEditingCategory(prev => prev ? { ...prev, [field]: value } : null);
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Handle applies_to checkbox changes
  const handleAppliesChange = (type: AppliesTo, checked: boolean) => {
    const currentData = editingCategory || formData;
    let newAppliesTo = [...currentData.applies_to];
    
    if (checked && !newAppliesTo.includes(type)) {
      newAppliesTo.push(type);
    } else if (!checked && newAppliesTo.includes(type)) {
      newAppliesTo = newAppliesTo.filter(t => t !== type);
    }

    handleFieldChange('applies_to', newAppliesTo);
  };

  // Handle create submission
  const handleCreateSubmit = async () => {
    // CategoryManager: Starting category creation
    
    // Clear any previous modal errors
    setModalError(null);
    
    if (!formData.name.trim()) {
      // CategoryManager: Validation failed - empty name
      setModalError('Category name is required');
      return;
    }

    if (formData.applies_to.length === 0) {
      // CategoryManager: Validation failed - no applies_to selected
      setModalError('Category must apply to at least Items or Schematics');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('🔧 CategoryManager: Calling createCategoryAPI with data:', {
        name: formData.name.trim(),
        icon_image_id: formData.icon_image_id,
        icon_fallback: formData.icon_fallback,
        applies_to: formData.applies_to,
        description: formData.description.trim() || null,
        created_by: user?.id || null,
        is_global: false
      });

      // Use the CRUD function directly to get detailed error information
      const result = await createCategoryAPI(user, {
        name: formData.name.trim(),
        icon_image_id: formData.icon_image_id,
        icon_fallback: formData.icon_fallback,
        applies_to: formData.applies_to,
        description: formData.description.trim() || null,
        created_by: user?.id || null,
        is_global: true
      });

      console.log('🔧 CategoryManager: API result:', result);

      if (result.success && result.data) {
        console.log('🔧 CategoryManager: Success! Calling modal feedback');
        showSuccess('Category Created', `Category "${result.data.name}" created successfully!`);
        setIsCreateModalOpen(false);
        setModalError(null);
        resetForm();
        refetchCategories(); // Refresh the categories list
      } else {
        // Show the specific error message in the modal
        console.log('🔧 CategoryManager: API error, showing in modal:', result.error);
        setModalError(result.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('🔧 CategoryManager: Exception caught:', error);
      setModalError('Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit submission
  const handleEditSubmit = async () => {
    if (!editingCategory) return;
    
    console.log('🔧 CategoryManager: Starting category edit for ID:', editingCategory.id);
    
    // Clear any previous modal errors
    setModalError(null);
    
    if (!editingCategory.name.trim()) {
      setModalError('Category name is required');
      return;
    }

    if (editingCategory.applies_to.length === 0) {
      setModalError('Category must apply to at least Items or Schematics');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('🔧 CategoryManager: Calling updateCategoryAPI with data:', {
        name: editingCategory.name.trim(),
        icon_image_id: editingCategory.icon_image_id,
        icon_fallback: editingCategory.icon_fallback,
        applies_to: editingCategory.applies_to,
        description: editingCategory.description.trim() || null
      });

      const result = await updateCategoryAPI(user, editingCategory.id, {
        name: editingCategory.name.trim(),
        icon_image_id: editingCategory.icon_image_id,
        icon_fallback: editingCategory.icon_fallback,
        applies_to: editingCategory.applies_to,
        description: editingCategory.description.trim() || null
      });

      console.log('🔧 CategoryManager: updateCategoryAPI result:', result);

      if (result.success && result.data) {
        console.log('🔧 CategoryManager: Category updated successfully');
        showSuccess('Category Updated', `Category "${result.data.name}" updated successfully`);
        setEditingCategory(null);
        await refetchCategories();
      } else {
        console.log('🔧 CategoryManager: Edit failed:', result.error);
        setModalError(result.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('🔧 CategoryManager: Edit error:', error);
      setModalError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete - check dependencies first
  const handleDelete = async (category: Category) => {
    console.log('🔧 CategoryManager: Checking dependencies for category:', category.id);
    
    try {
      // Check dependencies first
      const dependencyResult = await getCategoryDependencies(user, category.id);
      
      if (!dependencyResult.success) {
        showError('Dependency Check Failed', `Failed to check dependencies: ${dependencyResult.error}`);
        return;
      }

      const dependencies = dependencyResult.data!;
      console.log('🔧 CategoryManager: Dependencies found:', dependencies);

      if (dependencies.hasAny) {
        // Show migration dialog
        setMigrationDialog({
          isOpen: true,
          category,
          dependencies,
          selectedTargetId: null
        });
      } else {
        // No dependencies, proceed with simple deletion
        const confirmMessage = `Are you sure you want to delete the category "${category.name}"?\n\nThis action cannot be undone.`;
        
        if (!confirm(confirmMessage)) {
          return;
        }
        
        await performDeletion(category.id, category.name);
      }
    } catch (error) {
      console.error('🔧 CategoryManager: Error checking dependencies:', error);
      showError('Dependency Check Error', 'Failed to check category dependencies');
    }
  };

  // Perform the actual deletion
  const performDeletion = async (categoryId: string, categoryName: string, migrateToCategoryId?: string) => {
    console.log('🔧 CategoryManager: Starting category deletion for ID:', categoryId);
    
    try {
      const result = await deleteCategoryAPI(user, categoryId, migrateToCategoryId);
      
      console.log('🔧 CategoryManager: deleteCategoryAPI result:', result);

      if (result.success) {
        console.log('🔧 CategoryManager: Category deleted successfully');
        const message = migrateToCategoryId 
          ? `Category "${categoryName}" deleted successfully and content migrated`
          : `Category "${categoryName}" deleted successfully`;
        showSuccess('Category Deleted', message);
        
        // Close migration dialog and refresh
        setMigrationDialog({
          isOpen: false,
          category: null,
          dependencies: null,
          selectedTargetId: null
        });
        
        await refetchCategories();
      } else {
        console.log('🔧 CategoryManager: Delete failed:', result.error);
        showError('Delete Failed', result.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('🔧 CategoryManager: Delete error:', error);
      showError('Delete Error', 'An unexpected error occurred while deleting the category');
    }
  };

  // Handle migration dialog confirmation
  const handleMigrationConfirm = async () => {
    if (!migrationDialog.category || !migrationDialog.selectedTargetId) {
      showError('Migration Error', 'Please select a target category for migration');
      return;
    }

    await performDeletion(
      migrationDialog.category.id,
      migrationDialog.category.name,
      migrationDialog.selectedTargetId
    );
  };

  // Render category form
  const renderCategoryForm = (data: CategoryFormData, isEdit: boolean = false) => (
    <div className="space-y-4">
      {/* Name Field */}
      <div>
        <label className="block text-sm font-light text-amber-300 mb-2">
          Category Name *
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-100 
                   placeholder-slate-400 focus:outline-none focus:border-amber-300/60 focus:ring-1 focus:ring-amber-300/30"
          placeholder="Enter category name..."
          maxLength={100}
        />
      </div>

      {/* Icon Field */}
      <div>
        <label className="block text-sm font-light text-amber-300 mb-2">
          Icon Selection
        </label>
        
        {/* Image Selector */}
        <div className="mb-3">
          <ImageSelector
            value={data.icon_image_id}
            onChange={(value) => handleFieldChange('icon_image_id', value)}
            placeholder="Select an image or upload a new one"
            className="w-full"
          />
        </div>
        
        {/* Fallback Text Icon */}
        <div>
          <label className="block text-sm font-light text-sand-300 mb-2">
            Fallback Text Icon (if no image selected)
          </label>
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={data.icon_fallback}
              onChange={(e) => handleFieldChange('icon_fallback', e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-100 
                       placeholder-slate-400 focus:outline-none focus:border-amber-300/60 focus:ring-1 focus:ring-amber-300/30"
              placeholder="⚔️"
              maxLength={10}
            />
            <div className="w-10 h-10 rounded flex items-center justify-center overflow-hidden">
              <ImagePreview
                iconImageId={data.icon_image_id}
                iconFallback={data.icon_fallback}
                size="md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Applies To Checkboxes */}
      <div>
        <label className="block text-sm font-light text-amber-300 mb-2">
          Applies To *
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.applies_to.includes('items')}
              onChange={(e) => handleAppliesChange('items', e.target.checked)}
              className="w-4 h-4 text-amber-300 bg-slate-800 border-slate-600/50 rounded 
                       focus:ring-amber-300/30 focus:ring-2"
            />
            <span className="text-sm text-sand-200">Items</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.applies_to.includes('schematics')}
              onChange={(e) => handleAppliesChange('schematics', e.target.checked)}
              className="w-4 h-4 text-amber-300 bg-slate-800 border-slate-600/50 rounded 
                       focus:ring-amber-300/30 focus:ring-2"
            />
            <span className="text-sm text-sand-200">Schematics</span>
          </label>
        </div>
      </div>

      {/* Description Field */}
      <div>
        <label className="block text-sm font-light text-amber-300 mb-2">
          Description
        </label>
        <textarea
          value={data.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-100 
                   placeholder-slate-400 focus:outline-none focus:border-amber-300/60 focus:ring-1 focus:ring-amber-300/30"
          placeholder="Optional description..."
          rows={3}
          maxLength={500}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DiamondIcon
            icon={<Package size={18} strokeWidth={1.5} />}
            size="md"
            bgColor="bg-slate-900"
            actualBorderColor="bg-amber-300"
            borderThickness={2}
            iconColor="text-amber-300"
          />
          <div>
            <h3 className="text-lg font-light text-amber-300" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
              Category Management
            </h3>
            <p className="text-sm text-sand-400">
              Organize items and schematics into logical categories
            </p>
          </div>
        </div>
        
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600/20 border border-amber-300/30 rounded-lg
                   text-amber-300 hover:bg-amber-600/30 hover:border-amber-300/50 transition-all duration-200
                   font-light"
          style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
        >
          <Plus size={16} />
          Create Category
        </button>
      </div>

      {/* Loading State */}
      {loading.categories && (
        <div className="flex items-center justify-center py-12">
          <div className="text-sand-400">Loading categories...</div>
        </div>
      )}

      {/* Error State */}
      {errors.categories && (
        <div className="p-4 bg-red-900/20 border border-red-300/30 rounded-lg">
          <p className="text-red-300">{errors.categories}</p>
        </div>
      )}

      {/* Categories List */}
      {!loading.categories && !errors.categories && (
        <div className="space-y-4">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-sand-500 mb-4" />
              <p className="text-sand-400">No categories created yet</p>
              <p className="text-sm text-sand-500 mt-2">
                Create your first category to get started
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="p-4 bg-slate-800/20 border border-slate-600/30 rounded-lg hover:border-amber-300/50 transition-colors"
                >
                  {editingCategory?.id === category.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      {/* Inline Error Message for Edit Mode */}
                      {modalError && (
                        <div className="p-3 bg-red-900/20 border border-red-300/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <DiamondIcon
                              icon={<AlertCircle size={14} strokeWidth={1.5} />}
                              size="sm"
                              bgColor="bg-red-900"
                              actualBorderColor="bg-red-400"
                              borderThickness={1}
                              iconColor="text-red-400"
                            />
                            <p className="text-red-300 font-light text-sm">{modalError}</p>
                          </div>
                        </div>
                      )}
                      
                      {renderCategoryForm(editingCategory, true)}
                      <div className="flex gap-3 pt-4 border-t border-slate-600/30">
                        <button
                          onClick={handleEditSubmit}
                          disabled={isSubmitting}
                          className="flex items-center gap-2 px-3 py-2 bg-amber-600/20 border border-amber-300/30 
                                   rounded text-amber-300 hover:bg-amber-600/30 hover:border-amber-300/50 
                                   transition-all duration-200 disabled:opacity-50"
                        >
                          <Save size={14} />
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingCategory(null);
                            setModalError(null); // Clear errors when canceling
                          }}
                          className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-slate-600/50 
                                   rounded text-slate-300 hover:bg-slate-700/70 hover:border-slate-500/70 
                                   transition-all duration-200"
                        >
                          <X size={14} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded flex items-center justify-center overflow-hidden">
                          <ImagePreview
                            iconImageId={category.icon_image_id}
                            iconFallback={category.icon_fallback}
                            size="lg"
                            className="w-full h-full"
                          />
                        </div>
                        <div>
                          <h4 className="text-lg font-light text-sand-100 mb-1">
                            {category.name}
                          </h4>
                          <div className="flex items-center gap-3 text-sm text-sand-400">
                            <span>
                              Applies to: {category.applies_to.join(', ')}
                            </span>
                            {category.description && (
                              <>
                                <span>•</span>
                                <span>{category.description}</span>
                              </>
                            )}
                          </div>
                          <div className="text-xs text-sand-500 mt-1">
                            Last updated by: {category.updated_by ? 'User' : 'System'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(category)}
                          className="p-2 text-sand-400 hover:text-amber-300 hover:bg-amber-600/10 rounded transition-colors"
                          title="Edit Category"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="p-2 text-sand-400 hover:text-red-300 hover:bg-red-600/10 rounded transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Modal - Rendered using Portal to ensure proper viewport positioning */}
      {isCreateModalOpen && createPortal(
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
          onClick={() => setIsCreateModalOpen(false)} // Close modal when clicking backdrop
        >
          <div 
            className="bg-slate-800 border border-amber-300/30 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <DiamondIcon
                  icon={<Plus size={16} strokeWidth={1.5} />}
                  size="sm"
                  bgColor="bg-slate-900"
                  actualBorderColor="bg-amber-300"
                  borderThickness={2}
                  iconColor="text-amber-300"
                />
                <h3 className="text-lg font-light text-amber-300" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                  Create New Category
                </h3>
              </div>

              {/* Modal Error Message - Show at top */}
              {modalError && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-300/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <DiamondIcon
                      icon={<AlertCircle size={16} strokeWidth={1.5} />}
                      size="sm"
                      bgColor="bg-red-900"
                      actualBorderColor="bg-red-400"
                      borderThickness={1}
                      iconColor="text-red-400"
                    />
                    <p className="text-red-300 font-light">{modalError}</p>
                  </div>
                </div>
              )}

              {renderCategoryForm(formData)}

                              <div className="flex gap-3 pt-6 border-t border-slate-600/30 mt-6">
                <button
                  onClick={handleCreateSubmit}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-600/20 
                           border border-amber-300/30 rounded text-amber-300 hover:bg-amber-600/30 
                           hover:border-amber-300/50 transition-all duration-200 disabled:opacity-50"
                >
                  <Save size={16} />
                  {isSubmitting ? 'Creating...' : 'Create Category'}
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded text-slate-300 
                           hover:bg-slate-700/70 hover:border-slate-500/70 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Migration Dialog - Rendered using Portal */}
      {migrationDialog.isOpen && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div 
            className="bg-slate-800 border border-orange-300/30 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <DiamondIcon
                  icon={<AlertCircle size={16} strokeWidth={1.5} />}
                  size="sm"
                  bgColor="bg-orange-900"
                  actualBorderColor="bg-orange-300"
                  borderThickness={2}
                  iconColor="text-orange-300"
                />
                <h3 className="text-lg font-light text-orange-300" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                  Migrate Category Content
                </h3>
              </div>

              {migrationDialog.dependencies && (
                <div className="mb-6">
                  <div className="p-4 bg-orange-900/20 border border-orange-300/30 rounded-lg mb-4">
                    <p className="text-orange-300 font-light mb-3">
                      Category "{migrationDialog.category?.name}" contains content that must be migrated:
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-sand-100">{migrationDialog.dependencies.types}</div>
                        <div className="text-sand-400">Types</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-sand-100">{migrationDialog.dependencies.items}</div>
                        <div className="text-sand-400">Items</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-sand-100">{migrationDialog.dependencies.schematics}</div>
                        <div className="text-sand-400">Schematics</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-light text-amber-300 mb-3">
                      Select Target Category *
                    </label>
                    <select
                      value={migrationDialog.selectedTargetId || ''}
                      onChange={(e) => setMigrationDialog(prev => ({
                        ...prev,
                        selectedTargetId: e.target.value || null
                      }))}
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-100 
                               focus:outline-none focus:border-amber-300/60 focus:ring-1 focus:ring-amber-300/30"
                    >
                      <option value="">Select a category...</option>
                      {categories
                        .filter(cat => cat.id !== migrationDialog.category?.id) // Don't show the category being deleted
                        .filter(cat => {
                          // Only show categories that match applies_to compatibility
                          const sourceAppliesTo = migrationDialog.category?.applies_to || [];
                          return sourceAppliesTo.some(type => cat.applies_to.includes(type));
                        })
                        .map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                    <p className="text-xs text-sand-500 mt-2">
                      Only categories with compatible "Applies To" settings are shown
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-6 border-t border-slate-600/30">
                <button
                  onClick={handleMigrationConfirm}
                  disabled={!migrationDialog.selectedTargetId || isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600/20 
                           border border-orange-300/30 rounded text-orange-300 hover:bg-orange-600/30 
                           hover:border-orange-300/50 transition-all duration-200 disabled:opacity-50"
                >
                  <Package size={16} />
                  {isSubmitting ? 'Migrating...' : 'Migrate & Delete'}
                </button>
                <button
                  onClick={() => setMigrationDialog({
                    isOpen: false,
                    category: null,
                    dependencies: null,
                    selectedTargetId: null
                  })}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-300 
                           hover:bg-slate-700/70 hover:border-slate-500/70 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>

                              <div className="mt-4 p-3 bg-slate-800/30 border border-slate-600/30 rounded-lg">
                <p className="text-xs text-sand-400">
                  <strong>Note:</strong> This will move all types, items, and schematics from "{migrationDialog.category?.name}" 
                  to the selected target category, then delete the empty category. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        type={confirmationModal.type}
        title={confirmationModal.title}
        message={confirmationModal.message}
      />
    </div>
  );
};

export default CategoryManager; 