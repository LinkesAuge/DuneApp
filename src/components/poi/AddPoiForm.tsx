import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Poi, PoiType, PoiScreenshot } from '../../types';
import { useAuth } from '../auth/AuthProvider';
import { Upload, X, Check, XCircle, MapPin, Save, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { PixelCrop } from 'react-image-crop';
import { toast } from 'react-hot-toast';
import { getScreenshotLabel } from '../../lib/cropUtils';
import { uploadPoiScreenshot } from '../../lib/imageUpload';
import { formatConversionStats } from '../../lib/imageUtils';
import { useScreenshotManager } from '../../hooks/useScreenshotManager';
import ScreenshotUploader from '../shared/ScreenshotUploader';
import CropProcessor from '../shared/CropProcessor';

interface AddPoiFormProps {
  gridSquareId: string;
  poiTypes: PoiType[];
  onCancel: () => void;
  onPoiAdded: (poi: Poi) => void;
}

const AddPoiForm: React.FC<AddPoiFormProps> = ({ gridSquareId, poiTypes, onCancel, onPoiAdded }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [poiTypeId, setPoiTypeId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversionStats, setConversionStats] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Screenshot management - need manager for CropProcessor
  const screenshotManager = useScreenshotManager({
    context: 'poi',
    entityId: '',
    maxFileSize: 5,
    enableCropping: true
  });
  
  // Also track files from ScreenshotUploader for display count
  const [uploaderFiles, setUploaderFiles] = useState<any[]>([]);

  useEffect(() => {
    if (poiTypeId) {
      const selectedType = poiTypes.find(t => t.id === poiTypeId);
      if (selectedType) {
        setTitle(`${selectedType.name} (${selectedType.category})`);
      }
    } else {
      setTitle('');
    }
  }, [poiTypeId, poiTypes]);

  useEffect(() => {
    if (conversionStats) {
      const timer = setTimeout(() => setConversionStats(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [conversionStats]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      let finalNotes = notes;
      if (!finalNotes) {
        const selectedType = poiTypes.find(t => t.id === poiTypeId);
        if (selectedType?.default_description) {
          finalNotes = selectedType.default_description;
        }
      }

      const uploadedScreenshotPaths: { url: string; crop_details: PixelCrop | null; original_name: string; }[] = [];

      // Combine screenshots from both managers (screenshotManager has priority for processed files)
      const processedFiles = screenshotManager.filesToProcess.filter(f => f.isProcessed);
      const uploaderProcessedFiles = uploaderFiles.filter(f => f.isProcessed || f.displayFile);
      
      // Use screenshotManager files if available, otherwise use uploader files
      const allProcessedFiles = processedFiles.length > 0 ? processedFiles : uploaderProcessedFiles;
      
      for (const processedFile of allProcessedFiles) {
        const fileName = `${user.id}/${uuidv4()}-${(processedFile.originalFile || processedFile.file)?.name.replace(/\.[^/.]+$/, '.webp')}`;
        
        const uploadResult = await uploadPoiScreenshot(processedFile.displayFile || processedFile.file, fileName);

        if (uploadedScreenshotPaths.length === 0 && uploadResult.compressionRatio) {
          const stats = formatConversionStats(uploadResult);
          setConversionStats(stats);
        }

        uploadedScreenshotPaths.push({ 
          url: uploadResult.url, 
          crop_details: processedFile.cropDetails,
          original_name: processedFile.originalFile.name
        });
      }

      const { data: poi, error: poiError } = await supabase
        .from('pois')
        .insert({
          title,
          notes: finalNotes,
          poi_type_id: poiTypeId,
          coordinate: { x: 0, y: 0 },
          grid_square_id: gridSquareId,
          created_by: user.id,
          map_type: 'deep_desert'
        })
        .select()
        .single();

      if (poiError) throw poiError;

      if (uploadedScreenshotPaths.length > 0) {
        const screenshotRecords = uploadedScreenshotPaths.map(path => ({
          poi_id: poi.id,
          url: path.url,
          crop_details: path.crop_details,
          original_name: path.original_name,
          uploaded_by: user.id
        }));

        const { error: screenshotError } = await supabase
          .from('poi_screenshots')
          .insert(screenshotRecords);

        if (screenshotError) {
          console.error('Error saving screenshot records:', screenshotError);
        }
      }

      if (poi) {
        onPoiAdded(poi);
      } else {
        console.warn('[AddPoiForm] POI added but no data returned');
      }

      toast.success(`POI "${title}" added successfully!`);
    } catch (error) {
      console.error('Error creating POI:', error);
      setError(error instanceof Error ? error.message : 'Failed to create POI');
      toast.error('Failed to create POI. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-sand-300 rounded-lg p-4 bg-sand-50">
      <h3 className="text-lg font-medium mb-4">Add New Point of Interest</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {conversionStats && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm">
            ✓ {conversionStats}
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="label" htmlFor="poiType">
            Category & Type
          </label>
          <select
            id="poiType"
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
          <label className="label" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            required
            disabled={!poiTypeId}
          />
        </div>
        
        <div className="mb-4">
          <label className="label" htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input"
            rows={3}
            placeholder="Add any additional notes about this location..."
          />
        </div>
        
        <div className="mb-4">
          <label className="label">
            Screenshots (Optional, Max 5)
          </label>
                                  <ScreenshotUploader
              screenshotManager={screenshotManager}
              maxDisplayFiles={5}
              onProcessingComplete={(files) => setUploaderFiles(files)}
            />
            {(Math.max(screenshotManager.filesToProcess.filter(f => f.isProcessed).length, uploaderFiles.length) > 0) && (
              <p className="text-xs text-slate-400 mt-1">
                {Math.max(screenshotManager.filesToProcess.filter(f => f.isProcessed).length, uploaderFiles.length)}/5 screenshots
              </p>
          )}
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
                <Check size={16} />
                Save POI
              </>
            )}
          </button>
        </div>
      </form>

      {/* Unified Crop Processor */}
      <CropProcessor
        screenshotManager={screenshotManager}
      />
    </div>
  );
};

export default AddPoiForm;