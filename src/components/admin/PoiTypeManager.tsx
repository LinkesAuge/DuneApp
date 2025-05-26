import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { PoiType } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Save, X, Upload, Image as ImageIcon } from 'lucide-react';

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
  icon_has_transparent_background: false, // Initialize new field
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
        let { width, height } = img;
        if (width > height) {
          if (width > MAX_ICON_SIZE) {
            height = Math.round((height * MAX_ICON_SIZE) / width);
            width = MAX_ICON_SIZE;
          }
        } else {
          if (height > MAX_ICON_SIZE) {
            width = Math.round((width * MAX_ICON_SIZE) / height);
            height = MAX_ICON_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to convert canvas to blob'));
          },
          'image/png', 0.9 // Quality for PNG
        );
      };
      img.onerror = (errEv) => {
        URL.revokeObjectURL(img.src);
        const message = typeof errEv === 'string' ? errEv : 'Unknown image load error';
        reject(new Error('Failed to load image for resizing: ' + message));
      };
    });
  };

  const handleIconFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      if (file.size > 1 * 1024 * 1024) { // 1MB limit
        throw new Error('File size must be less than 1MB.');
      }
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only JPG, PNG, GIF, WebP allowed.');
      }

      const resizedBlob = await resizeImage(file);
      const fileName = `${uuidv4()}.png`; // Force PNG after resize
      const filePath = `${POI_ICON_FOLDER}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(POI_ICON_BUCKET)
        .upload(filePath, resizedBlob, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(POI_ICON_BUCKET)
        .getPublicUrl(filePath);

      if (!publicUrlData.publicUrl) {
        throw new Error('Failed to get public URL for uploaded image.');
      }
      
      setCurrentPoiType(prev => ({ ...prev, icon: publicUrlData.publicUrl }));
      toast.success('Icon uploaded successfully!');

    } catch (err: any) {
      console.error('Error uploading icon:', err);
      setError(err.message || 'Failed to upload icon.');
      toast.error(err.message || 'Failed to upload icon.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset file input
      }
    }
  };

  const handleAddNew = () => {
    setCurrentPoiType({ ...initialFormState, id: uuidv4() });
    setIsEditing(true);
    setError(null);
  };

  const handleEdit = (type: PoiType) => {
    setCurrentPoiType({
        id: type.id,
        name: type.name,
        icon: type.icon || '',
        color: type.color || '#6B7280',
        category: type.category || 'Uncategorized',
        default_description: type.default_description || '',
        icon_has_transparent_background: type.icon_has_transparent_background || false,
    });
    setIsEditing(true);
    setError(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentPoiType(initialFormState);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!currentPoiType.name.trim()) {
      toast.error("POI Type name cannot be empty.");
      setIsSubmitting(false);
      return;
    }
    if (!currentPoiType.category.trim()) {
      toast.error("Category cannot be empty.");
      setIsSubmitting(false);
      return;
    }
    if (!currentPoiType.icon.trim()) {
      toast.error("Icon cannot be empty. Please provide an emoji or upload an image.");
      setIsSubmitting(false);
      return;
    }
    
    const poiTypeToSave: Omit<PoiType, 'created_at' | 'updated_at'> = {
        id: currentPoiType.id,
        name: currentPoiType.name,
        icon: currentPoiType.icon,
        color: currentPoiType.color,
        category: currentPoiType.category,
        default_description: currentPoiType.default_description || null,
        icon_has_transparent_background: currentPoiType.icon_has_transparent_background || false,
    };

    try {
      const isNew = !poiTypes.some(pt => pt.id === currentPoiType.id);
      let savedData: PoiType | null = null;

      if (isNew) {
        const { data, error: insertError } = await supabase
          .from('poi_types')
          .insert(poiTypeToSave)
          .select()
          .single();
        if (insertError) throw insertError;
        savedData = data;
        toast.success(`POI Type "${savedData?.name}" added.`);
      } else {
        const { data, error: updateError } = await supabase
          .from('poi_types')
          .update(poiTypeToSave)
          .eq('id', currentPoiType.id)
          .select()
          .single();
        if (updateError) throw updateError;
        savedData = data;
        toast.success(`POI Type "${savedData?.name}" updated.`);
      }
      
      if (savedData) {
        fetchPoiTypes(); // Refetch all types to update the list
      }
      handleCancelEdit();

    } catch (err: any) {
      console.error('Error saving POI type:', err);
      const supabaseError = err as { message?: string; details?: string, hint?: string, code?: string };
      let displayError = 'Failed to save POI type.';
      if (supabaseError.message) displayError += ` ${supabaseError.message}`;
      if (supabaseError.details) displayError += ` Details: ${supabaseError.details}`;
      if (supabaseError.hint) displayError += ` Hint: ${supabaseError.hint}`;
      setError(displayError);
      toast.error(displayError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (typeToDelete: PoiType) => {
    if (!confirm(`Are you sure you want to delete "${typeToDelete.name}"? This action cannot be undone.`)) {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      // Delete icon from storage if it's a URL from our bucket
      if (typeToDelete.icon && isIconUrl(typeToDelete.icon) && typeToDelete.icon.includes(`${POI_ICON_BUCKET}/${POI_ICON_FOLDER}/`)) {
        const iconPath = typeToDelete.icon.substring(typeToDelete.icon.indexOf(`${POI_ICON_FOLDER}/`));
        const { error: storageError } = await supabase.storage
            .from(POI_ICON_BUCKET)
            .remove([iconPath]);
        if (storageError && storageError.message !== 'The resource was not found') { // Ignore "not found" as it might have been manually deleted or path is wrong
            toast.info(`Could not delete icon from storage: ${storageError.message}. Please check storage manually.`);
        } else if (!storageError) {
            toast.info(`Icon for "${typeToDelete.name}" deleted from storage.`);
        }
      }

      const { error: deleteError } = await supabase
        .from('poi_types')
        .delete()
        .eq('id', typeToDelete.id);

      if (deleteError) throw deleteError;

      toast.success(`POI Type "${typeToDelete.name}" deleted successfully.`);
      fetchPoiTypes(); // Refetch to update list
      if (currentPoiType.id === typeToDelete.id) {
        handleCancelEdit();
      }

    } catch (err: any) {
      console.error('Error deleting POI type:', err);
      setError(err.message || 'Failed to delete POI type.');
      toast.error(err.message || 'Failed to delete POI type.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isIconUrl = (iconValue: string | null | undefined): iconValue is string => 
    typeof iconValue === 'string' && (iconValue.startsWith('http://') || iconValue.startsWith('https://'));

  const getDisplayImageUrl = (url: string | null): string | undefined => {
    if (!url || !isIconUrl(url)) return undefined;
    if (!url.includes('/')) return undefined; 
    try {
      const urlObj = new URL(url);
      // Add a cache-busting query parameter if desired, e.g., for development
      // urlObj.searchParams.set('v', Date.now().toString());
      return urlObj.toString();
    } catch (e) {
      console.warn("Failed to parse URL for display:", url, e);
      return url; 
    }
  };

  if (isLoading && !poiTypes.length) {
    return <div className="p-6 text-center text-gray-700">Loading POI types...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-night-900">Manage POI Types</h1>
        {!isEditing && (
            <button 
                onClick={handleAddNew} 
                disabled={isSubmitting || isUploading} 
                className="flex items-center justify-center px-4 py-2 bg-spice-600 text-white rounded-md hover:bg-spice-700 focus:outline-none focus:ring-2 focus:ring-spice-500 focus:ring-opacity-50 transition duration-150 ease-in-out disabled:opacity-50"
            >
                <Plus className="mr-2 h-5 w-5" /> Add New Type
            </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md my-4" role="alert">
          <p className="font-bold">Operation Error</p>
          <p>{error}</p>
        </div>
      )}

      {isEditing && (
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 bg-sand-50 shadow-xl rounded-lg border border-sand-300 space-y-6 mb-8">
          <h2 className="text-2xl font-semibold text-night-700 border-b pb-3 border-sand-200">
            {poiTypes.some(pt => pt.id === currentPoiType.id) ? `Edit POI Type: ${currentPoiType.name || '...'}` : 'Add New POI Type'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="poi-type-name" className="block text-sm font-medium text-sand-700 mb-1">Name</label>
              <input 
                id="poi-type-name" 
                name="name"
                type="text" 
                value={currentPoiType.name} 
                onChange={handleInputChange} 
                required 
                className="mt-1 block w-full px-3 py-2 bg-white border border-sand-300 rounded-md shadow-sm focus:outline-none focus:ring-spice-500 focus:border-spice-500 sm:text-sm placeholder-sand-400 text-night-900"
                placeholder="e.g., Ancient Ruins"
              />
            </div>

            <div>
              <label htmlFor="poi-type-category" className="block text-sm font-medium text-sand-700 mb-1">Category</label>
              <input 
                id="poi-type-category" 
                name="category"
                type="text" 
                value={currentPoiType.category} 
                onChange={handleInputChange} 
                required 
                className="mt-1 block w-full px-3 py-2 bg-white border border-sand-300 rounded-md shadow-sm focus:outline-none focus:ring-spice-500 focus:border-spice-500 sm:text-sm placeholder-sand-400 text-night-900"
                list="categories-datalist"
                placeholder="e.g., Landmarks, Resources"
              />
              <datalist id="categories-datalist">
                {Object.keys(typesByCategory).map(cat => <option key={cat} value={cat} />)}
              </datalist>
            </div>
          </div>

          <div>
            <label htmlFor="poi-type-icon-text" className="block text-sm font-medium text-sand-700 mb-1">Icon (Emoji or Upload)</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input 
                id="poi-type-icon-text"
                name="icon"
                type="text" 
                value={currentPoiType.icon} 
                onChange={handleInputChange} 
                placeholder="e.g., 🌲 or will be auto-filled by upload"
                className="flex-1 block w-full min-w-0 rounded-none rounded-l-md px-3 py-2 border-sand-300 bg-white text-night-900 focus:ring-spice-500 focus:border-spice-500 sm:text-sm placeholder-sand-400"
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isUploading} 
                className="inline-flex items-center px-3 py-2 border border-l-0 border-sand-300 rounded-r-md bg-sand-100 text-sm font-medium text-sand-700 hover:bg-sand-200 focus:outline-none focus:ring-1 focus:ring-spice-500 focus:border-spice-500 disabled:opacity-50"
              >
                <Upload className={`mr-2 h-5 w-5 ${isUploading ? 'animate-spin' : ''}`} /> 
                {isUploading ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/jpeg,image/png,image/gif,image/webp" 
              onChange={handleIconFileUpload} 
              className="hidden" 
            />
            {currentPoiType.icon && (
              <div className="mt-2 flex items-center">
                <span className="text-xs text-sand-600 mr-2">Preview:</span>
                {isIconUrl(currentPoiType.icon) ? (
                  <img 
                    src={getDisplayImageUrl(currentPoiType.icon)} 
                    alt="Icon Preview" 
                    className="w-8 h-8 inline-block object-contain border border-sand-300 rounded bg-sand-100" 
                  />
                ) : (
                  <span className="text-2xl">{currentPoiType.icon}</span>
                )}
              </div>
            )}
             {currentPoiType.icon && isIconUrl(currentPoiType.icon) && (
                <p className="mt-1 text-xs text-sand-500">
                    Current URL: <a href={currentPoiType.icon} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{currentPoiType.icon}</a>
                </p>
            )}
          </div>
          
          <div>
            <label htmlFor="poi-type-color" className="block text-sm font-medium text-sand-700 mb-1">Display Color</label>
            <input 
              id="poi-type-color"
              name="color"
              type="color" 
              value={currentPoiType.color} 
              onChange={handleColorChange} 
              required 
              className="mt-1 h-10 w-full px-1 py-1 border border-sand-300 rounded-md shadow-sm focus:outline-none focus:ring-spice-500 focus:border-spice-500 cursor-pointer bg-white"
            />
          </div>

          <div>
            <label htmlFor="poi-type-icon-transparent" className="flex items-center text-sm font-medium text-sand-700 mb-1 cursor-pointer">
              <input
                id="poi-type-icon-transparent"
                name="icon_has_transparent_background"
                type="checkbox"
                checked={!!currentPoiType.icon_has_transparent_background}
                onChange={handleInputChange} // Reusing handleInputChange
                className="h-4 w-4 text-spice-600 border-sand-300 rounded focus:ring-spice-500 mr-2 cursor-pointer"
              />
              Icon has transparent background (won't use display color for icon BG)
            </label>
          </div>

          <div>
            <label htmlFor="poi-type-description" className="block text-sm font-medium text-sand-700 mb-1">Default Description (Optional)</label>
            <textarea
              id="poi-type-description"
              name="default_description"
              value={currentPoiType.default_description || ''}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 bg-white border border-sand-300 rounded-md shadow-sm focus:outline-none focus:ring-spice-500 focus:border-spice-500 sm:text-sm placeholder-sand-400 text-night-900"
              placeholder="A brief default description for this type of POI."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-sand-200">
            <button 
                type="button" 
                onClick={handleCancelEdit} 
                disabled={isSubmitting}
                className="px-4 py-2 border border-sand-400 rounded-md shadow-sm text-sm font-medium text-sand-700 bg-white hover:bg-sand-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sand-500 disabled:opacity-50 transition-colors"
            >
              <X className="mr-2 h-4 w-4 inline-block" /> Cancel
            </button>
            <button 
                type="submit" 
                disabled={isSubmitting || isUploading} 
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-spice-600 hover:bg-spice-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-spice-500 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div> : <Save className="mr-2 h-4 w-4 inline-block" />}
              {currentPoiType.id && poiTypes.some(pt => pt.id === currentPoiType.id) ? 'Save Changes' : 'Create POI Type'}
            </button>
          </div>
        </form>
      )}

      {!isEditing && (
        <div className="space-y-8">
          {Object.keys(typesByCategory).length === 0 && !isLoading && (
            <div className="text-center text-sand-500 py-10">
              <ImageIcon size={52} className="mx-auto mb-4 text-sand-400" />
              <p className="text-xl">No POI types found.</p>
              <p className="text-sm mt-1">Click "Add New Type" to get started.</p>
            </div>
          )}
          {Object.entries(typesByCategory)
            .sort(([catA], [catB]) => catA.localeCompare(catB))
            .map(([category, types]) => (
            <div key={category} className="bg-sand-200 border border-sand-300 rounded-lg shadow-md overflow-hidden">
              <h3 className="text-xl font-semibold text-night-800 bg-sand-300/50 px-6 py-4 border-b border-sand-300">{category}</h3>
              <ul className="divide-y divide-sand-300">
                {types.sort((a, b) => a.name.localeCompare(b.name)).map(type => (
                  <li key={type.id} className="px-6 py-4 flex items-center justify-between group hover:bg-blue-100 transition-colors duration-150">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl flex-shrink-0"
                        style={{ backgroundColor: (isIconUrl(type.icon) && type.icon_has_transparent_background) ? 'transparent' : (type.color || '#6B7280') }} // Use transparent if specified for URL icons
                      >
                        {isIconUrl(type.icon) ? (
                          <img src={getDisplayImageUrl(type.icon)} alt={type.name} className="w-8 h-8 object-contain" />
                        ) : (
                          <span>{type.icon}</span>
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium text-night-800 text-lg group-hover:text-blue-800 transition-colors duration-150">{type.name}</p>
                        {type.default_description && <p className="text-sm text-sand-600 mt-1 group-hover:text-blue-700 transition-colors duration-150">{type.default_description}</p>}
                      </div>
                    </div>
                    <div className="flex space-x-2 flex-shrink-0">
                      <button 
                        type="button" 
                        onClick={() => handleEdit(type)} 
                        disabled={isSubmitting || isUploading} 
                        title="Edit" 
                        className="p-2 rounded-full text-sand-600 group-hover:text-blue-600 hover:bg-blue-200/70 transition-colors duration-150"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleDelete(type)} 
                        disabled={isSubmitting || isUploading} 
                        className="p-2 rounded-full text-red-500 group-hover:text-red-600 hover:bg-red-100 transition-colors duration-150" 
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PoiTypeManager;