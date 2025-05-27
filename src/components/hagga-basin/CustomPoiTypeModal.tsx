import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Trash2, Plus, Palette, Type, Folder, FileText, Edit } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { PoiType } from '../../types';
import { useAuth } from '../auth/AuthProvider';

interface CustomPoiTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  customPoiTypes: PoiType[];
  onPoiTypeCreated: (newPoiType: PoiType) => void;
  onPoiTypeDeleted: (poiTypeId: string) => void;
  onPoiTypeUpdated?: (updatedPoiType: PoiType) => void;
  onPoiTypeEdit?: (poiType: PoiType) => void;
  editingPoiType?: PoiType | null;
}

const CustomPoiTypeModal: React.FC<CustomPoiTypeModalProps> = ({
  isOpen,
  onClose,
  customPoiTypes,
  onPoiTypeCreated,
  onPoiTypeDeleted,
  onPoiTypeUpdated,
  onPoiTypeEdit,
  editingPoiType
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#8B5CF6');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [iconHasTransparentBackground, setIconHasTransparentBackground] = useState(true);
  
  // UI state
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Predefined categories from existing system
  const predefinedCategories = ['Base', 'Resources', 'Locations', 'NPCs'];

  // Initialize form when editing
  useEffect(() => {
    if (editingPoiType) {
      setIsEditing(true);
      setName(editingPoiType.name);
      setDescription(editingPoiType.default_description || '');
      setColor(editingPoiType.color);
      setIconHasTransparentBackground(editingPoiType.icon_has_transparent_background || false);
      
      // Handle category
      if (predefinedCategories.includes(editingPoiType.category)) {
        setCategory(editingPoiType.category);
        setCustomCategory('');
      } else {
        setCategory('custom');
        setCustomCategory(editingPoiType.category);
      }
      
      // Handle icon preview (if it's a URL)
      if (editingPoiType.icon.startsWith('http')) {
        setIconPreview(editingPoiType.icon);
        setSelectedIcon(null); // We don't have the original file
      }
    } else {
      setIsEditing(false);
      resetForm();
    }
  }, [editingPoiType]);

  // Reset form
  const resetForm = () => {
    setName('');
    setDescription('');
    setColor('#8B5CF6');
    setCategory('');
    setCustomCategory('');
    setSelectedIcon(null);
    setIconPreview(null);
    setIconHasTransparentBackground(true);
    setError(null);
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      setError('File size must be less than 1MB');
      return;
    }

    setSelectedIcon(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setIconPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload icon to Supabase Storage
  const uploadIcon = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `custom-poi-icon-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('screenshots')
      .upload(`icons/${fileName}`, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('screenshots')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  // Create custom POI type
  const handleCreate = async () => {
    if (!user) {
      setError('You must be logged in to create custom POI types');
      return;
    }

    if (!name.trim()) {
      setError('Please enter a name for the POI type');
      return;
    }

    if (!selectedIcon) {
      setError('Please select an icon for the POI type');
      return;
    }

    const finalCategory = category === 'custom' ? customCategory.trim() : category;
    if (!finalCategory) {
      setError('Please select or enter a category');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Upload icon
      const iconUrl = await uploadIcon(selectedIcon);

      // Create POI type in database
      const { data, error } = await supabase
        .from('poi_types')
        .insert({
          name: name.trim(),
          icon: iconUrl,
          color: color,
          category: finalCategory,
          default_description: description.trim() || null,
          icon_has_transparent_background: iconHasTransparentBackground,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      onPoiTypeCreated(data);
      resetForm();
    } catch (err) {
      console.error('Error creating custom POI type:', err);
      setError(err instanceof Error ? err.message : 'Failed to create POI type');
    } finally {
      setIsCreating(false);
    }
  };

  // Update custom POI type
  const handleUpdate = async () => {
    if (!user || !editingPoiType) {
      setError('Invalid update operation');
      return;
    }

    if (!name.trim()) {
      setError('Please enter a name for the POI type');
      return;
    }

    const finalCategory = category === 'custom' ? customCategory.trim() : category;
    if (!finalCategory) {
      setError('Please select or enter a category');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      let iconUrl = editingPoiType.icon;
      
      // Upload new icon if selected
      if (selectedIcon) {
        iconUrl = await uploadIcon(selectedIcon);
      }

      // Update POI type in database
      const { data, error } = await supabase
        .from('poi_types')
        .update({
          name: name.trim(),
          icon: iconUrl,
          color: color,
          category: finalCategory,
          default_description: description.trim() || null,
          icon_has_transparent_background: iconHasTransparentBackground
        })
        .eq('id', editingPoiType.id)
        .eq('created_by', user.id)
        .select()
        .single();

      if (error) throw error;

      if (onPoiTypeUpdated) {
        onPoiTypeUpdated(data);
      }
      onClose();
    } catch (err) {
      console.error('Error updating custom POI type:', err);
      setError(err instanceof Error ? err.message : 'Failed to update POI type');
    } finally {
      setIsCreating(false);
    }
  };

  // Delete custom POI type
  const handleDelete = async (poiTypeId: string) => {
    if (!user) return;

    setIsDeleting(poiTypeId);

    try {
      const { error } = await supabase
        .from('poi_types')
        .delete()
        .eq('id', poiTypeId)
        .eq('created_by', user.id);

      if (error) throw error;

      onPoiTypeDeleted(poiTypeId);
    } catch (err) {
      console.error('Error deleting custom POI type:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete POI type');
    } finally {
      setIsDeleting(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-sand-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-sand-800 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-spice-500" />
                Custom POI Types
              </h2>
              <p className="text-sm text-sand-600 mt-1">
                Create custom POI types with your own icons and categories
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-sand-400 hover:text-sand-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Left side: Creation form */}
          <div className="flex-1 p-6 border-r border-sand-200">
            <h3 className="text-lg font-medium text-sand-800 mb-4">
              {isEditing ? 'Edit POI Type' : 'Create New POI Type'}
            </h3>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-2">
                  <Type className="w-4 h-4 inline mr-1" />
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ancient Ruins, Resource Cache"
                  className="w-full px-3 py-2 border border-sand-300 rounded-md focus:outline-none focus:ring-2 focus:ring-spice-500"
                  maxLength={50}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-2">
                  <Folder className="w-4 h-4 inline mr-1" />
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-sand-300 rounded-md focus:outline-none focus:ring-2 focus:ring-spice-500 mb-2"
                >
                  <option value="">Select category...</option>
                  {predefinedCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="custom">Create custom category...</option>
                </select>
                
                {category === 'custom' && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category name"
                    className="w-full px-3 py-2 border border-sand-300 rounded-md focus:outline-none focus:ring-2 focus:ring-spice-500"
                    maxLength={30}
                  />
                )}
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-2">
                  <Palette className="w-4 h-4 inline mr-1" />
                  Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-10 border border-sand-300 rounded cursor-pointer"
                  />
                  <span className="text-sm text-sand-600">{color}</span>
                </div>
              </div>

              {/* Icon Upload */}
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-2">
                  <Upload className="w-4 h-4 inline mr-1" />
                  Icon
                </label>
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-sand-300 rounded-lg p-6 text-center cursor-pointer hover:border-spice-400 transition-colors"
                >
                  {iconPreview ? (
                    <div className="space-y-2">
                      <div 
                        className="w-16 h-16 mx-auto rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: iconHasTransparentBackground ? 'transparent' : color }}
                      >
                        <img
                          src={iconPreview}
                          alt="Icon preview"
                          className="w-12 h-12 object-contain"
                        />
                      </div>
                      <p className="text-sm text-sand-600">Click to change icon</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 text-sand-400 mx-auto" />
                      <p className="text-sand-600">Click to upload icon</p>
                      <p className="text-xs text-sand-500">PNG/JPG, max 1MB</p>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Transparent background option */}
                {iconPreview && (
                  <label className="flex items-center mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={iconHasTransparentBackground}
                      onChange={(e) => setIconHasTransparentBackground(e.target.checked)}
                      className="rounded border-sand-300 text-spice-600 focus:ring-spice-500"
                    />
                    <span className="ml-2 text-sm text-sand-700">
                      Icon has transparent background
                    </span>
                  </label>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-sand-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Default description for POIs of this type"
                  className="w-full px-3 py-2 border border-sand-300 rounded-md focus:outline-none focus:ring-2 focus:ring-spice-500"
                  rows={3}
                  maxLength={200}
                />
              </div>

              {/* Create/Update Button */}
              <button
                onClick={isEditing ? handleUpdate : handleCreate}
                disabled={isCreating || !name.trim() || (!isEditing && !selectedIcon) || (!category || (category === 'custom' && !customCategory.trim()))}
                className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating 
                  ? (isEditing ? 'Updating...' : 'Creating...') 
                  : (isEditing ? 'Update POI Type' : 'Create POI Type')
                }
              </button>
            </div>
          </div>

          {/* Right side: Existing custom types */}
          <div className="w-80 p-6">
            <h3 className="text-lg font-medium text-sand-800 mb-4">Your Custom Types</h3>
            
            {customPoiTypes.length === 0 ? (
              <div className="text-center py-8">
                <Plus className="w-12 h-12 text-sand-400 mx-auto mb-4" />
                <p className="text-sand-600 mb-2">No custom types yet</p>
                <p className="text-sand-500 text-sm">Create your first custom POI type</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {customPoiTypes.map(poiType => (
                  <div 
                    key={poiType.id} 
                    className="bg-sand-50 border border-sand-200 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center flex-1">
                        <div 
                          className="w-8 h-8 rounded flex items-center justify-center mr-3 flex-shrink-0"
                          style={{
                            backgroundColor: poiType.icon_has_transparent_background && poiType.icon.startsWith('http') 
                              ? 'transparent' 
                              : poiType.color
                          }}
                        >
                          {poiType.icon.startsWith('http') ? (
                            <img
                              src={poiType.icon}
                              alt={poiType.name}
                              className="w-5 h-5 object-contain"
                            />
                          ) : (
                            <span className="text-sm">{poiType.icon}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sand-800 truncate">{poiType.name}</div>
                          <div className="text-xs text-sand-600 capitalize">{poiType.category}</div>
                          {poiType.default_description && (
                            <div className="text-xs text-sand-500 mt-1 truncate">
                              {poiType.default_description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        {/* Edit button - only show if user can edit this type */}
                        {(user?.role === 'admin' || poiType.created_by === user?.id) && (
                          <button
                            onClick={() => onPoiTypeEdit && onPoiTypeEdit(poiType)}
                            className="text-spice-400 hover:text-spice-600 transition-colors"
                            title="Edit POI type"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        
                        {/* Delete button - only show if user can delete this type */}
                        {(user?.role === 'admin' || poiType.created_by === user?.id) && (
                          <button
                            onClick={() => handleDelete(poiType.id)}
                            disabled={isDeleting === poiType.id}
                            className="text-red-400 hover:text-red-600 transition-colors"
                            title="Delete POI type"
                          >
                            {isDeleting === poiType.id ? (
                              <div className="w-4 h-4 animate-spin border-2 border-red-400 border-t-transparent rounded-full"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomPoiTypeModal; 