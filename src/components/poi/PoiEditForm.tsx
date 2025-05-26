import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Poi, PoiType, PoiScreenshot } from '../../types';
import { useAuth } from '../auth/AuthProvider';
import { Upload, X, Save } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface PoiEditFormProps {
  poi: Poi;
  poiTypes: PoiType[];
  onCancel: () => void;
  onUpdate: (poi: Poi) => void;
}

const PoiEditForm: React.FC<PoiEditFormProps> = ({ poi, poiTypes, onCancel, onUpdate }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(poi.title);
  const [notes, setNotes] = useState(poi.description || '');
  const [poiTypeId, setPoiTypeId] = useState(poi.poi_type_id);
  const [screenshots, setScreenshots] = useState<PoiScreenshot[]>(poi.screenshots || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update title when POI type changes
  useEffect(() => {
    if (poiTypeId) {
      const selectedType = poiTypes.find(t => t.id === poiTypeId);
      if (selectedType) {
        setTitle(`${selectedType.name} (${selectedType.category})`);
      }
    }
  }, [poiTypeId, poiTypes]);

  const handleScreenshotUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    
    // Check if adding these files would exceed the 5 screenshot limit
    if (screenshots.length + files.length > 5) {
      setError('Maximum 5 screenshots allowed per POI');
      return;
    }

    setError(null);
    const newScreenshots: PoiScreenshot[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Upload the file to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `poi-screenshots/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('screenshots')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from('screenshots')
          .getPublicUrl(filePath);

        newScreenshots.push({
          id: uuidv4(),
          url: publicUrlData.publicUrl,
          uploaded_by: user.id,
          upload_date: new Date().toISOString()
        });
      } catch (err: any) {
        console.error('Error uploading screenshot:', err);
        setError(`Error uploading screenshot: ${err.message}`);
      }
    }
    
    setScreenshots(prev => [...prev, ...newScreenshots]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeScreenshot = (id: string) => {
    setScreenshots(prev => prev.filter(s => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const updatedPoi = {
        id: poi.id,
        title,
        description: notes,
        poi_type_id: poiTypeId,
        screenshots,
        grid_square_id: poi.grid_square_id
      };
      
      const { data, error } = await supabase
        .from('pois')
        .update(updatedPoi)
        .eq('id', poi.id)
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        onUpdate(data as Poi);
      }
    } catch (err: any) {
      console.error('Error updating POI:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-sand-300 rounded-lg p-4 bg-sand-50">
      <h3 className="text-lg font-medium mb-4">Edit Point of Interest</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="label" htmlFor="edit-poiType">
            Category & Type
          </label>
          <select
            id="edit-poiType"
            value={poiTypeId}
            onChange={(e) => setPoiTypeId(e.target.value)}
            className="select"
            required
          >
            <option value="">Select a category and type</option>
            {Object.entries(poiTypes.reduce((groups: Record<string, PoiType[]>, type) => {
              if (!groups[type.category]) {
                groups[type.category] = [];
              }
              groups[type.category].push(type);
              return groups;
            }, {}))
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([category, types]) => (
                <optgroup key={category} label={category}>
                  {types.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({category})
                    </option>
                  ))}
                </optgroup>
              ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="label" htmlFor="edit-title">
            Title
          </label>
          <input
            id="edit-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            required
            disabled={!poiTypeId}
          />
        </div>
        
        <div className="mb-4">
          <label className="label" htmlFor="edit-notes">
            Notes
          </label>
          <textarea
            id="edit-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input"
            rows={3}
            placeholder="Add any additional notes about this location..."
          />
        </div>
        
        <div className="mb-4">
          <label className="label">
            Screenshots ({screenshots.length}/5)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {screenshots.map(screenshot => (
              <div 
                key={screenshot.id}
                className="w-20 h-20 relative rounded overflow-hidden border border-sand-300"
              >
                <img 
                  src={screenshot.url} 
                  alt="POI Screenshot" 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeScreenshot(screenshot.id)}
                  className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-bl-md"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            
            {screenshots.length < 5 && (
              <button
                type="button"
                onClick={handleScreenshotUpload}
                className="w-20 h-20 border-2 border-dashed border-sand-300 rounded flex flex-col items-center justify-center text-sand-500 hover:text-sand-700 hover:border-sand-400"
              >
                <Upload size={20} />
                <span className="text-xs mt-1">Upload</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            multiple
            className="hidden"
          />
          <p className="text-xs text-sand-600">
            Upload up to 5 screenshots. Each must be less than 2MB.
          </p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !poiTypeId}
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Save size={16} />
                Update POI
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PoiEditForm;