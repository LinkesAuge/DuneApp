import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  ChevronRight, 
  ChevronDown, 
  Move,
  AlertTriangle,
  Package,
  FolderTree
} from 'lucide-react';
import DiamondIcon from '../common/DiamondIcon';
import { ImageSelector } from '../shared/ImageSelector';
import { ImagePreview } from '../shared/ImagePreview';
import { ConfirmationModal } from '../shared/ConfirmationModal';
import { useAuth } from '../auth/AuthProvider';
import { 
  fetchTypes, 
  fetchCategories,
  createType as createTypeAPI,
  updateType as updateTypeAPI,
  deleteType as deleteTypeAPI,
  getTypeDependencies,
  migrateTypeContent
} from '../../lib/itemsSchematicsCrud';
import type { 
  Type, 
  Category, 
  TypeDependencies, 
  CreateTypeRequest, 
  UpdateTypeRequest 
} from '../../types';

interface TypeTreeNode extends Type {
  children: TypeTreeNode[];
  isExpanded: boolean;
  level: number;
}

interface TypeManagerProps {
  className?: string;
}

export const TypeManager: React.FC<TypeManagerProps> = ({ className = '' }) => {
  const { user } = useAuth();
  
  // State Management
  const [types, setTypes] = useState<Type[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // UI State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingType, setEditingType] = useState<Type | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  
  // Form State
  const [createForm, setCreateForm] = useState({
    name: '',
    icon_image_id: null as string | null,
    icon_fallback: '',
    description: '',
    category_id: '',
    parent_type_id: null as string | null
  });
  
  // Error States
  const [createError, setCreateError] = useState<string | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  
  // Confirmation Modal State
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: ''
  });

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [typesResult, categoriesResult] = await Promise.all([
        fetchTypes(user),
        fetchCategories(user)
      ]);
      
      // Handle types result
      if (!typesResult.success) {
        throw new Error(typesResult.error || 'Failed to load types');
      }
      
      // Handle categories result
      if (!categoriesResult.success) {
        throw new Error(categoriesResult.error || 'Failed to load categories');
      }
      
      const typesData = typesResult.data || [];
      const categoriesData = categoriesResult.data || [];
      
      setTypes(typesData);
      setCategories(categoriesData);
      
      // Auto-select first category if none selected
      if (!selectedCategory && categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0].id);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load types and categories');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, user]);

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

  // Build hierarchical tree structure
  const buildTypeTree = useCallback((categoryId: string): TypeTreeNode[] => {
    const categoryTypes = types.filter(type => type.category_id === categoryId);
    
    const buildNode = (type: Type, level: number = 0): TypeTreeNode => {
      const children = categoryTypes
        .filter(t => t.parent_type_id === type.id)
        .map(t => buildNode(t, level + 1));
      
      return {
        ...type,
        children,
        isExpanded: expandedNodes.has(type.id),
        level
      };
    };
    
    // Get root types (no parent)
    const rootTypes = categoryTypes.filter(type => !type.parent_type_id);
    return rootTypes.map(type => buildNode(type));
  }, [types, expandedNodes]);

  // Toggle node expansion
  const toggleNode = (typeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(typeId)) {
        newSet.delete(typeId);
      } else {
        newSet.add(typeId);
      }
      return newSet;
    });
  };

  // Handle create type
  const handleCreateType = async () => {
    if (!user) return;
    
    setCreateError(null);
    
    try {
      // Validation
      if (!createForm.name.trim()) {
        setCreateError('Type name is required');
        return;
      }
      
      if (!createForm.category_id) {
        setCreateError('Category is required');
        return;
      }

      const request: CreateTypeRequest = {
        name: createForm.name.trim(),
        icon_image_id: createForm.icon_image_id,
        icon_fallback: createForm.icon_fallback.trim() || null,
        description: createForm.description.trim() || null,
        category_id: createForm.category_id,
        parent_type_id: createForm.parent_type_id
      };

      const result = await createTypeAPI(user, request);
      
      if (!result.success) {
        // Show error modal instead of just setting form error
        showError('Type Creation Failed', result.error || 'Failed to create type');
        return;
      }
      
      // Reset form and reload data
      setCreateForm({
        name: '',
        icon_image_id: null,
        icon_fallback: '',
        description: '',
        category_id: selectedCategory || '',
        parent_type_id: null
      });
      setShowCreateModal(false);
      setCreateError(null); // Clear any previous errors
      await loadData();
      
      // Show success modal
      showSuccess('Type Created', `Type "${request.name}" has been created successfully.`);
      
    } catch (err: any) {
      console.error('Error creating type:', err);
      showError('Type Creation Failed', err.message || 'Failed to create type');
    }
  };

  // Handle update type
  const handleUpdateType = async (type: Type, updates: Partial<UpdateTypeRequest>) => {
    if (!user) return;
    
    setEditErrors(prev => ({ ...prev, [type.id]: '' }));
    
    try {
      const result = await updateTypeAPI(user, type.id, updates);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update type');
      }
      
      await loadData();
      
    } catch (err: any) {
      console.error('Error updating type:', err);
      setEditErrors(prev => ({ 
        ...prev, 
        [type.id]: err.message || 'Failed to update type' 
      }));
    }
  };

  // Handle delete type
  const handleDeleteType = async (type: Type) => {
    if (!user) return;
    
    try {
      // Check dependencies
      const depsResult = await getTypeDependencies(user, type.id);
      
      if (!depsResult.success) {
        throw new Error(depsResult.error || 'Failed to check dependencies');
      }
      
      const dependencies = depsResult.data!;
      
      if (dependencies.total_count > 0) {
        // Show migration dialog
        await handleDeleteWithMigration(type, dependencies);
      } else {
        // Safe to delete
        if (confirm(`Delete type "${type.name}"? This action cannot be undone.`)) {
          const deleteResult = await deleteTypeAPI(user, type.id);
          
          if (!deleteResult.success) {
            throw new Error(deleteResult.error || 'Failed to delete type');
          }
          
          await loadData();
        }
      }
      
    } catch (err: any) {
      console.error('Error deleting type:', err);
      alert(err.message || 'Failed to delete type');
    }
  };

  // Handle delete with migration
  const handleDeleteWithMigration = async (type: Type, dependencies: TypeDependencies) => {
    const availableTypes = types.filter(t => 
      t.id !== type.id && 
      t.category_id === type.category_id &&
      t.parent_type_id === type.parent_type_id // Same level
    );
    
    if (availableTypes.length === 0) {
      alert('Cannot delete type: no alternative types available for migration');
      return;
    }
    
    const targetTypeId = prompt(`This type has ${dependencies.total_count} items/schematics.\n\nChoose target type ID for migration:\n${availableTypes.map(t => `${t.id}: ${t.name}`).join('\n')}`);
    
    if (!targetTypeId || !availableTypes.find(t => t.id === targetTypeId)) {
      return;
    }
    
    try {
      const migrateResult = await migrateTypeContent(user, type.id, targetTypeId);
      
      if (!migrateResult.success) {
        throw new Error(migrateResult.error || 'Failed to migrate content');
      }
      
      const deleteResult = await deleteTypeAPI(user, type.id);
      
      if (!deleteResult.success) {
        throw new Error(deleteResult.error || 'Failed to delete type');
      }
      
      await loadData();
      
    } catch (err: any) {
      console.error('Error migrating and deleting type:', err);
      alert(err.message || 'Failed to migrate and delete type');
    }
  };

  // Render type tree node
  const renderTypeNode = (node: TypeTreeNode): React.ReactNode => {
    const isEditing = editingType?.id === node.id;
    const hasChildren = node.children.length > 0;
    const error = editErrors[node.id];
    
    return (
      <div key={node.id} className="space-y-1">
        {/* Type Item */}
        <div 
          className={`flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/30 transition-colors group ${
            node.level > 0 ? 'ml-4 border-l border-slate-600/30' : ''
          }`}
        >
          {/* Expand/Collapse Button */}
          <button
            onClick={() => toggleNode(node.id)}
            className={`w-6 h-6 flex items-center justify-center transition-colors ${
              hasChildren 
                ? 'text-slate-400 hover:text-amber-300' 
                : 'invisible'
            }`}
          >
            {hasChildren && (
              node.isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
            )}
          </button>

          {/* Type Icon */}
          <ImagePreview
            iconImageId={node.icon_image_id}
            iconFallback={node.icon_fallback}
            size="sm"
          />

          {/* Type Info */}
          {isEditing ? (
            <EditTypeForm
              type={node}
              onSave={(updates) => {
                handleUpdateType(node, updates);
                setEditingType(null);
              }}
              onCancel={() => {
                setEditingType(null);
                setEditErrors(prev => ({ ...prev, [node.id]: '' }));
              }}
              error={error}
            />
          ) : (
            <>
              <div className="flex-1">
                <h4 className="text-slate-100 font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                  {node.name}
                </h4>
                {node.description && (
                  <p className="text-xs text-slate-400 font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                    {node.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingType(node)}
                  className="p-1 text-slate-400 hover:text-amber-300 hover:bg-amber-600/10 rounded"
                  title="Edit type"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDeleteType(node)}
                  className="p-1 text-slate-400 hover:text-red-300 hover:bg-red-600/10 rounded"
                  title="Delete type"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="ml-8 flex items-center gap-2 p-2 bg-red-600/10 border border-red-600/30 rounded text-red-200 text-sm">
            <DiamondIcon
              icon={<AlertTriangle size={14} />}
              size="sm"
              bgColor="bg-red-600"
              iconColor="text-white"
            />
            <span className="font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
              {error}
            </span>
          </div>
        )}

        {/* Children */}
        {node.isExpanded && node.children.map(child => renderTypeNode(child))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-800/30 rounded"></div>
          <div className="h-64 bg-slate-800/30 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center h-64`}>
        <div className="text-center space-y-3">
          <DiamondIcon
            icon={<AlertTriangle size={24} />}
            size="lg"
            bgColor="bg-red-600"
            iconColor="text-white"
          />
          <p className="text-red-300 font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
            {error}
          </p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-amber-600/20 border border-amber-300/30 rounded text-amber-300 hover:bg-amber-600/30 hover:border-amber-300/50 transition-all duration-200 font-light"
            style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);
  const typeTree = selectedCategory ? buildTypeTree(selectedCategory) : [];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DiamondIcon
            icon={<FolderTree size={20} />}
            size="md"
            bgColor="bg-void-950"
            actualBorderColor="bg-amber-300"
            borderThickness={2}
            iconColor="text-amber-300"
          />
          <h2 className="text-xl font-light text-amber-300" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
            Type Management
          </h2>
        </div>

        {selectedCategory && (
          <button
            onClick={() => {
              setCreateForm(prev => ({ ...prev, category_id: selectedCategory }));
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600/20 border border-amber-300/30 rounded text-amber-300 hover:bg-amber-600/30 hover:border-amber-300/50 transition-all duration-200 font-light"
            style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
          >
            <Plus size={16} />
            Create Type
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Category Sidebar */}
        <div className="space-y-4">
          <h3 className="text-lg font-light text-slate-100" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
            Categories
          </h3>
          
          <div className="space-y-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-amber-600/20 border border-amber-300/30 text-amber-300'
                    : 'hover:bg-slate-800/30 text-slate-100'
                }`}
              >
                <ImagePreview
                  iconImageId={category.icon_image_id}
                  iconFallback={category.icon_fallback}
                  size="sm"
                />
                <span className="font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Types Tree */}
        <div className="col-span-3">
          {selectedCategoryData ? (
            <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <ImagePreview
                  iconImageId={selectedCategoryData.icon_image_id}
                  iconFallback={selectedCategoryData.icon_fallback}
                  size="md"
                />
                <div>
                  <h3 className="text-lg font-light text-slate-100" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                    {selectedCategoryData.name} Types
                  </h3>
                  <p className="text-sm text-slate-400 font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                    {typeTree.length} root types
                  </p>
                </div>
              </div>

              {typeTree.length > 0 ? (
                <div className="space-y-1">
                  {typeTree.map(node => renderTypeNode(node))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Package size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                    No types in this category yet
                  </p>
                  <p className="text-sm font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                    Create your first type to get started
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-6 text-center">
              <p className="text-slate-400 font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                Select a category to view and manage its types
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Type Modal */}
      {showCreateModal && (
        <CreateTypeModal
          form={createForm}
          categories={categories}
          types={types.filter(t => t.category_id === createForm.category_id)}
          onChange={setCreateForm}
          onSubmit={handleCreateType}
          onClose={() => {
            setShowCreateModal(false);
            setCreateError(null);
          }}
          error={createError}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={closeConfirmationModal}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        confirmText="OK"
        cancelText=""
      />
    </div>
  );
};

// Edit Type Form Component
interface EditTypeFormProps {
  type: Type;
  onSave: (updates: Partial<UpdateTypeRequest>) => void;
  onCancel: () => void;
  error?: string;
}

const EditTypeForm: React.FC<EditTypeFormProps> = ({ type, onSave, onCancel, error }) => {
  const [name, setName] = useState(type.name);
  const [iconImageId, setIconImageId] = useState<string | null>(type.icon_image_id);
  const [iconFallback, setIconFallback] = useState(type.icon_fallback || '');
  const [description, setDescription] = useState(type.description || '');

  const handleSave = () => {
    if (!name.trim()) return;
    
    onSave({
      name: name.trim(),
      icon_image_id: iconImageId,
      icon_fallback: iconFallback.trim() || null,
      description: description.trim() || null
    });
  };

  return (
    <div className="flex-1 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Type name"
          className="px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-100 placeholder-slate-400 text-sm font-light"
          style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
        />
        
        <input
          type="text"
          value={iconFallback}
          onChange={(e) => setIconFallback(e.target.value)}
          placeholder="Text icon (fallback)"
          className="px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-100 placeholder-slate-400 text-sm font-light"
          style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
        />
      </div>

      <ImageSelector
        value={iconImageId}
        onChange={setIconImageId}
        placeholder="Select type icon"
        className="text-sm"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={2}
        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-100 placeholder-slate-400 text-sm resize-none font-light"
        style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
      />

      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          className="flex items-center gap-1 px-3 py-1 bg-amber-600/20 border border-amber-300/30 rounded text-amber-300 hover:bg-amber-600/30 hover:border-amber-300/50 transition-all duration-200 text-sm font-light"
          style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
        >
          <Save size={14} />
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1 px-3 py-1 text-slate-400 hover:text-amber-300 hover:bg-amber-600/10 rounded text-sm transition-colors font-light"
          style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
        >
          <X size={14} />
          Cancel
        </button>
      </div>

      {error && (
        <p className="text-red-300 text-sm font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
          {error}
        </p>
      )}
    </div>
  );
};

// Create Type Modal Component  
interface CreateTypeModalProps {
  form: {
    name: string;
    icon_image_id: string | null;
    icon_fallback: string;
    description: string;
    category_id: string;
    parent_type_id: string | null;
  };
  categories: Category[];
  types: Type[];
  onChange: (form: any) => void;
  onSubmit: () => void;
  onClose: () => void;
  error?: string | null;
}

const CreateTypeModal: React.FC<CreateTypeModalProps> = ({
  form,
  categories,
  types,
  onChange,
  onSubmit,
  onClose,
  error
}) => {
  const selectedCategory = categories.find(c => c.id === form.category_id);
  const availableParentTypes = types.filter(t => !t.parent_type_id); // Only root types can be parents

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-amber-300/30 rounded-lg shadow-2xl w-full max-w-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
          <div className="flex items-center gap-3">
            <DiamondIcon
              icon={<Plus size={18} />}
              size="md"
              bgColor="bg-void-950"
              actualBorderColor="bg-amber-300"
              borderThickness={2}
              iconColor="text-amber-300"
            />
            <h3 className="text-lg font-light text-amber-300" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
              Create New Type
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-amber-300 hover:bg-amber-600/10 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-3 p-3 bg-red-600/10 border border-red-600/30 rounded-lg text-red-200">
              <DiamondIcon
                icon={<AlertTriangle size={16} />}
                size="sm"
                bgColor="bg-red-600"
                iconColor="text-white"
              />
              <span className="font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                {error}
              </span>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-light text-amber-300 mb-2" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                Type Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => onChange({ ...form, name: e.target.value })}
                placeholder="Enter type name"
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 font-light"
                style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
              />
            </div>

            <div>
              <label className="block text-sm font-light text-amber-300 mb-2" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                Category *
              </label>
              <select
                value={form.category_id}
                onChange={(e) => onChange({ ...form, category_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 font-light"
                style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {availableParentTypes.length > 0 && (
            <div>
              <label className="block text-sm font-light text-amber-300 mb-2" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                Parent Type (Optional)
              </label>
              <select
                value={form.parent_type_id || ''}
                onChange={(e) => onChange({ ...form, parent_type_id: e.target.value || null })}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 font-light"
                style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
              >
                <option value="">Root Level Type</option>
                {availableParentTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-light text-amber-300 mb-2" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                Icon Selection
              </label>
              <ImageSelector
                value={form.icon_image_id}
                onChange={(value) => onChange({ ...form, icon_image_id: value })}
                placeholder="Select or upload icon"
              />
            </div>

            <div>
              <label className="block text-sm font-light text-amber-300 mb-2" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                Text Icon (Fallback)
              </label>
              <input
                type="text"
                value={form.icon_fallback}
                onChange={(e) => onChange({ ...form, icon_fallback: e.target.value })}
                placeholder="e.g., ⚔️, 🔧, 📦"
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 font-light"
                style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-light text-amber-300 mb-2" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
              Description (Optional)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => onChange({ ...form, description: e.target.value })}
              placeholder="Describe this type..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 resize-none font-light"
              style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-600/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-amber-300 hover:bg-amber-600/10 rounded transition-colors font-light"
            style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!form.name.trim() || !form.category_id}
            className="px-4 py-2 bg-amber-600/20 border border-amber-300/30 rounded text-amber-300 hover:bg-amber-600/30 hover:border-amber-300/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-light"
            style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
          >
            Create Type
          </button>
        </div>
      </div>
    </div>
  );
};

export default TypeManager; 