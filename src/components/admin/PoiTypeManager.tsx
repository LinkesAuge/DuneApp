import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { PoiType } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Save, X, Upload, Image as ImageIcon, Hexagon } from 'lucide-react';

const MAX_ICON_SIZE = 48;
const POI_ICON_BUCKET = 'screenshots';
const POI_ICON_FOLDER = 'icons';

interface PoiTypeFormData {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: string;
  default_description: string | null;
  icon_has_transparent_background?: boolean;
}

const initialFormState: PoiTypeFormData = {
  id: '',
  name: '',
  icon: '',
  color: '#6B7280', // Default gray
  category: 'Uncategorized',
  default_description: '',
  icon_has_transparent_background: false,
};

const PoiTypeManager: React.FC = () => {
  const [poiTypes, setPoiTypes] = useState<PoiType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [currentPoiType, setCurrentPoiType] = useState<PoiTypeFormData>(initialFormState);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPoiTypes();
  }, []);

  const fetchPoiTypes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('poi_types')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;
      setPoiTypes(data || []);
    } catch (err: any) {
      console.error('Error fetching POI types:', err);
      setError('Failed to load POI types.');
      toast.error('Failed to load POI types: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const typesByCategory = poiTypes.reduce((acc: Record<string, PoiType[]>, type) => {
    const category = type.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(type);
    return acc;
  }, {});

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // Special handling for checkbox
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setCurrentPoiType(prev => ({ ...prev, [name]: checked }));
    } else {
      setCurrentPoiType(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentPoiType(prev => ({ ...prev, color: e.target.value }));
  };

  const resizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src); 
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        const maxSize = MAX_ICON_SIZE;
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        }, 'image/png');
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    });
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (PNG, JPEG, GIF, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const resizedBlob = await resizeImage(file);
      const uniqueId = uuidv4();
      const fileName = `${uniqueId}-${file.name}`;
      const path = `${POI_ICON_FOLDER}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(POI_ICON_BUCKET)
        .upload(path, resizedBlob, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(POI_ICON_BUCKET)
        .getPublicUrl(path);

      setCurrentPoiType(prev => ({ ...prev, icon: publicUrl }));
      toast.success('Icon uploaded successfully!');
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error('Failed to upload icon: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentPoiType.name || !currentPoiType.icon) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        name: currentPoiType.name,
        icon: currentPoiType.icon,
        color: currentPoiType.color,
        category: currentPoiType.category,
        default_description: currentPoiType.default_description || null,
        icon_has_transparent_background: currentPoiType.icon_has_transparent_background || false,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('poi_types')
          .update(submitData)
          .eq('id', currentPoiType.id);

        if (error) throw error;
        toast.success('POI type updated successfully!');
      } else {
        const { error } = await supabase
          .from('poi_types')
          .insert([submitData]);

        if (error) throw error;
        toast.success('POI type created successfully!');
      }

      await fetchPoiTypes();
      handleCancel();
    } catch (err: any) {
      console.error('Error saving POI type:', err);
      toast.error('Failed to save POI type: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (poiType: PoiType) => {
    setCurrentPoiType({
      id: poiType.id,
      name: poiType.name,
      icon: poiType.icon,
      color: poiType.color,
      category: poiType.category,
      default_description: poiType.default_description,
      icon_has_transparent_background: poiType.icon_has_transparent_background || false,
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setCurrentPoiType(initialFormState);
    setIsEditing(false);
  };

  const handleDelete = async (poiType: PoiType) => {
    if (!confirm(`Are you sure you want to delete the POI type "${poiType.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('poi_types')
        .delete()
        .eq('id', poiType.id);

      if (error) throw error;

      toast.success('POI type deleted successfully!');
      await fetchPoiTypes();
    } catch (err: any) {
      console.error('Error deleting POI type:', err);
      toast.error('Failed to delete POI type: ' + err.message);
    }
  };

  const isIconUrl = (icon: string): boolean => {
    return icon.startsWith('http://') || icon.startsWith('https://');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block p-4 rounded-full border border-gold-300/50 mb-6"
               style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
            <Hexagon className="text-gold-300" size={24} />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-300 mx-auto mb-4"></div>
          <p className="text-gold-300 font-light tracking-wide"
             style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            Loading POI types...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-light tracking-[0.15em] text-gold-300 flex items-center"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
          <Hexagon className="mr-4 text-amber-200" size={28} />
          P O I  T Y P E S
          <span className="ml-4 text-lg text-amber-200/70">({poiTypes.length} types)</span>
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-gold-300 hover:text-amber-200 transition-all duration-300 p-2 rounded-md border border-gold-300/30 hover:border-amber-200/40 hover:bg-amber-200/10 flex items-center"
          >
            <Plus size={18} className="mr-2" />
            <span className="text-sm font-light tracking-wide"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Add Type
            </span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-red-400/40"
             style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
          <p className="text-red-300 font-light"
             style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            {error}
          </p>
        </div>
      )}

      {/* Add/Edit Form */}
      {isEditing && (
        <div className="relative p-6 rounded-lg border border-gold-300/40 backdrop-blur-md"
             style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
          <h4 className="text-lg font-light text-gold-300 mb-6 flex items-center tracking-[0.1em]"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            <Hexagon className="mr-3 text-amber-200" size={20} />
            {currentPoiType.id ? 'E D I T  P O I  T Y P E' : 'C R E A T E  P O I  T Y P E'}
          </h4>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gold-300 mb-2 tracking-wide"
                       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={currentPoiType.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-void-950/60 border border-gold-300/30 rounded-md 
                           text-amber-200 placeholder-amber-200/40 backdrop-blur-sm
                           focus:outline-none focus:ring-2 focus:ring-gold-300/50 focus:border-gold-300/60
                           transition-all duration-300"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                  placeholder="e.g., Spice Harvester"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gold-300 mb-2 tracking-wide"
                       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={currentPoiType.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-void-950/60 border border-gold-300/30 rounded-md 
                           text-amber-200 placeholder-amber-200/40 backdrop-blur-sm
                           focus:outline-none focus:ring-2 focus:ring-gold-300/50 focus:border-gold-300/60
                           transition-all duration-300"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                  placeholder="e.g., Resources"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gold-300 mb-2 tracking-wide"
                       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    name="color"
                    value={currentPoiType.color}
                    onChange={handleColorChange}
                    className="w-16 h-12 bg-void-950/60 border border-gold-300/30 rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={currentPoiType.color}
                    onChange={(e) => setCurrentPoiType(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 px-4 py-3 bg-void-950/60 border border-gold-300/30 rounded-md 
                             text-amber-200 backdrop-blur-sm
                             focus:outline-none focus:ring-2 focus:ring-gold-300/50 focus:border-gold-300/60
                             transition-all duration-300"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                    placeholder="#HEXCODE"
                  />
                </div>
              </div>

              {/* Icon Upload */}
              <div>
                <label className="block text-sm font-medium text-gold-300 mb-2 tracking-wide"
                       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  Icon *
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-3 bg-void-950/60 border border-gold-300/30 rounded-md 
                             text-amber-200 hover:bg-gold-300/10 transition-all duration-300
                             disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-200 mr-2"></div>
                    ) : (
                      <Upload size={16} className="mr-2" />
                    )}
                    <span className="text-sm font-light"
                          style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      {isUploading ? 'Uploading...' : 'Upload'}
                    </span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {currentPoiType.icon && (
                    <div className="flex items-center space-x-2">
                      {isIconUrl(currentPoiType.icon) ? (
                        <img
                          src={currentPoiType.icon}
                          alt="Icon preview"
                          className="w-8 h-8 rounded border border-gold-300/30"
                          style={{
                            backgroundColor: currentPoiType.icon_has_transparent_background ? 'transparent' : currentPoiType.color
                          }}
                        />
                      ) : (
                        <span className="text-2xl" style={{ color: currentPoiType.color }}>
                          {currentPoiType.icon}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Default Description */}
            <div>
              <label className="block text-sm font-medium text-gold-300 mb-2 tracking-wide"
                     style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                Default Description
              </label>
              <textarea
                name="default_description"
                value={currentPoiType.default_description || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 bg-void-950/60 border border-gold-300/30 rounded-md 
                         text-amber-200 placeholder-amber-200/40 backdrop-blur-sm
                         focus:outline-none focus:ring-2 focus:ring-gold-300/50 focus:border-gold-300/60
                         transition-all duration-300 resize-none"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                placeholder="Optional default description for new POIs of this type..."
              />
            </div>

            {/* Transparent Background Checkbox */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="icon_has_transparent_background"
                checked={currentPoiType.icon_has_transparent_background || false}
                onChange={handleInputChange}
                className="w-4 h-4 text-gold-300 bg-void-950/60 border-gold-300/30 rounded 
                         focus:ring-gold-300/50 focus:ring-2"
              />
              <label className="text-amber-200 text-sm font-light tracking-wide"
                     style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                Icon has transparent background (don't apply color overlay)
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gold-300/20">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 text-amber-200/70 hover:text-amber-200 transition-all duration-300 
                         border border-amber-200/30 hover:border-amber-200/50 rounded-md font-light tracking-wide
                         hover:bg-amber-200/5"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploading || !currentPoiType.name || !currentPoiType.icon}
                className="px-6 py-3 bg-gold-300/90 hover:bg-gold-300 text-void-950 font-medium rounded-md 
                         transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center tracking-wide"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-void-950 mr-2"></div>
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                {currentPoiType.id ? 'Update Type' : 'Create Type'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* POI Types by Category */}
      <div className="space-y-6">
        {Object.entries(typesByCategory).map(([category, types]) => (
          <div key={category} className="relative rounded-lg border border-gold-300/30 backdrop-blur-md overflow-hidden"
               style={{ backgroundColor: 'rgba(42, 36, 56, 0.6)' }}>
            <div className="p-4 border-b border-gold-300/20"
                 style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
              <h4 className="text-lg font-light text-gold-300 tracking-[0.1em]"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                {category.toUpperCase().replace(/_/g, ' ')}
                <span className="ml-3 text-sm text-amber-200/70">({types.length} types)</span>
              </h4>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {types.map((type) => (
                  <div key={type.id} className="p-4 rounded-lg border border-gold-300/20 hover:border-gold-300/40 transition-all duration-300 group"
                       style={{ backgroundColor: 'rgba(42, 36, 56, 0.4)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded border border-gold-300/30 flex items-center justify-center"
                             style={{ 
                               backgroundColor: type.icon_has_transparent_background ? 'transparent' : type.color + '20',
                               borderColor: type.color + '40'
                             }}>
                          {isIconUrl(type.icon) ? (
                            <img
                              src={type.icon}
                              alt={type.name}
                              className="w-6 h-6 rounded"
                              style={{
                                backgroundColor: type.icon_has_transparent_background ? 'transparent' : type.color
                              }}
                            />
                          ) : (
                            <span className="text-lg" style={{ color: type.color }}>
                              {type.icon}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-amber-200 text-sm"
                               style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                            {type.name}
                          </div>
                          {type.default_description && (
                            <div className="text-xs text-amber-200/60 mt-1 font-light">
                              {type.default_description.length > 40 
                                ? type.default_description.substring(0, 40) + '...'
                                : type.default_description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => handleEdit(type)}
                          className="p-2 text-amber-200 hover:text-gold-300 transition-colors duration-300"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(type)}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors duration-300"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {poiTypes.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="inline-block p-4 rounded-full border border-amber-200/50 mb-4"
               style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
            <Hexagon className="text-amber-200" size={24} />
          </div>
          <p className="text-amber-200/70 font-light tracking-wide"
             style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            No POI types configured
          </p>
        </div>
      )}
    </div>
  );
};

export default PoiTypeManager;