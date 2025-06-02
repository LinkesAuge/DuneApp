import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Poi, PoiType, PoiScreenshot } from '../../types';
import { useAuth } from '../auth/AuthProvider';
import { Upload, X, Check, XCircle, MapPin, Save, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ImageCropModal from '../grid/ImageCropModal';
import { PixelCrop } from 'react-image-crop';
import { toast } from 'react-hot-toast';
import { getScreenshotLabel } from '../../lib/cropUtils';
import { uploadPoiScreenshot } from '../../lib/imageUpload';
import { formatConversionStats } from '../../lib/imageUtils';

interface AddPoiFormProps {
  gridSquareId: string;
  poiTypes: PoiType[];
  onCancel: () => void;
  onPoiAdded: (poi: Poi) => void;
}

// Define a type for our screenshot objects
interface ScreenshotFile {
  id: string;
  file: File;
  cropDetails: PixelCrop | null; // Store crop data or null if it's a full image
  isNew: boolean; 
  previewUrl: string; 
}

const AddPoiForm: React.FC<AddPoiFormProps> = ({ gridSquareId, poiTypes, onCancel, onPoiAdded }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [poiTypeId, setPoiTypeId] = useState('');
  const [screenshots, setScreenshots] = useState<ScreenshotFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversionStats, setConversionStats] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Screenshot cropping state
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  // Update title when POI type changes
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

  // Clear conversion stats after 5 seconds
  useEffect(() => {
    if (conversionStats) {
      const timer = setTimeout(() => setConversionStats(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [conversionStats]);

  const handleScreenshotUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Check total limit
    if (screenshots.length + pendingFiles.length + files.length > 5) {
      toast.error(`Cannot add ${files.length} file(s). Maximum 5 screenshots total. Currently have ${screenshots.length + pendingFiles.length}.`);
      event.target.value = '';
      return;
    }

    // Validate all files first
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" is too large (max 10MB).`);
        event.target.value = '';
        return;
      }
      
      if (!file.type.startsWith("image/")) {
        toast.error(`File "${file.name}" is not an image. Please select image files only.`);
        event.target.value = '';
        return;
      }
    }

    // Add files to pending queue
    const newPendingFiles = [...pendingFiles, ...files];
    setPendingFiles(newPendingFiles);
    
    // Start processing the first file if not already processing
    if (pendingFiles.length === 0 && !showCropModal) {
      const firstFile = newPendingFiles[0];
      setTempImageFile(firstFile);
      setTempImageUrl(URL.createObjectURL(firstFile));
      setShowCropModal(true);
    }
    
    event.target.value = '';
  };

  const handleCropComplete = async (croppedImageBlob: Blob, cropData: PixelCrop, isFullImage: boolean) => {
    if (!tempImageFile) return;

    const processedFile = new File([croppedImageBlob], tempImageFile.name, {
      type: tempImageFile.type,
      lastModified: Date.now(),
    });
    
    const newScreenshot: ScreenshotFile = {
      id: uuidv4(),
      file: processedFile,
      cropDetails: isFullImage ? null : cropData,
      isNew: true,
      previewUrl: URL.createObjectURL(processedFile),
    };

    setScreenshots(prev => [...prev, newScreenshot]);
    
    // Remove processed file from pending queue
    setPendingFiles(prevPending => {
      const remainingFiles = prevPending.slice(1);
      
      // Close current modal
      handleCloseCropModal();
      
      // Process next file if any (with slight delay to ensure state is updated)
      if (remainingFiles.length > 0) {
        setTimeout(() => {
          const nextFile = remainingFiles[0];
          setTempImageFile(nextFile);
          setTempImageUrl(URL.createObjectURL(nextFile));
          setShowCropModal(true);
        }, 100);
      }
      
      return remainingFiles;
    });
  };

  const handleCloseCropModal = () => {
    if (tempImageUrl) URL.revokeObjectURL(tempImageUrl);
    setTempImageFile(null);
    setTempImageUrl(null);
    setShowCropModal(false);
  };

  const removeScreenshot = (idToRemove: string) => {
    setScreenshots(prev => prev.filter(s => {
      if (s.id === idToRemove) {
        URL.revokeObjectURL(s.previewUrl); // Clean up object URL
        return false;
      }
      return true;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Get default description from POI type if notes is empty
      let finalNotes = notes;
      if (!finalNotes) {
        const selectedType = poiTypes.find(t => t.id === poiTypeId);
        if (selectedType?.default_description) {
          finalNotes = selectedType.default_description;
        }
      }

      const uploadedScreenshotPaths: { url: string; crop_details: PixelCrop | null; original_name: string; }[] = [];

      for (const screenshot of screenshots) {
        if (screenshot.isNew) {
          const fileName = `${user.id}/${uuidv4()}-${screenshot.file.name.replace(/\.[^/.]+$/, '.webp')}`;
          
          const uploadResult = await uploadPoiScreenshot(screenshot.file, fileName);

          // Show conversion feedback for first upload
          if (uploadedScreenshotPaths.length === 0 && uploadResult.compressionRatio) {
            const stats = formatConversionStats(uploadResult);
            setConversionStats(stats);
          }

          uploadedScreenshotPaths.push({ 
            url: uploadResult.url, 
            crop_details: screenshot.cropDetails,
            original_name: screenshot.file.name 
          });
        }
      }

      const newPoi = {
        grid_square_id: gridSquareId,
        poi_type_id: poiTypeId,
        title,
        description: finalNotes,
        created_by: user.id,
        screenshots: uploadedScreenshotPaths.length > 0 ? uploadedScreenshotPaths : null,
      };
      
      const { data, error } = await supabase
        .from('pois')
        .insert(newPoi)
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        // AddPoiForm: POI added successfully
        onPoiAdded(data as Poi);
      } else {
        console.warn('[AddPoiForm] POI added but no data returned');
      }
    } catch (err: any) {
      console.error('Error adding POI:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
      setScreenshots([]);
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

      {/* Conversion Stats Display */}
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
          <input
            id="poi-screenshots"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="input-file" 
            disabled={screenshots.length + pendingFiles.length >= 5}
            multiple
          />
          {screenshots.length + pendingFiles.length >= 5 && <p className="text-xs text-red-400 mt-1">Maximum 5 screenshots reached.</p>}
          {(screenshots.length + pendingFiles.length > 0) && (
            <p className="text-xs text-slate-400 mt-1">
              {screenshots.length + pendingFiles.length}/5 screenshots
              {pendingFiles.length > 0 && ` • ${pendingFiles.length} pending crop`}
            </p>
          )}
        </div>
        
        {screenshots.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-sand-300 mb-1">Attached Screenshots:</p>
            <div className="grid grid-cols-3 gap-2">
              {screenshots.map((sFile) => (
                <div key={sFile.id} className="relative group">
                  <img 
                    src={sFile.previewUrl} 
                    alt={sFile.file.name} 
                    className="w-full h-24 object-cover" // Ensure sharp corners
                  />
                  <button
                    type="button"
                    onClick={() => removeScreenshot(sFile.id)}
                    className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity" // Ensure sharp corners for button too
                    aria-label="Remove screenshot"
                  >
                    <XCircle size={18} />
                  </button>
                   {(() => {
                     const label = getScreenshotLabel(true, sFile.cropDetails);
                     return (
                       <span className={label.className}>{label.text}</span>
                     );
                   })()}
                </div>
              ))}
            </div>
          </div>
        )}
        
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

      {/* Image Crop Modal */}
      {showCropModal && tempImageUrl && tempImageFile && (
        <ImageCropModal
          imageUrl={tempImageUrl}
          onCropComplete={handleCropComplete}
          onClose={handleCloseCropModal}
          title={`Crop POI Screenshot (${screenshots.length + 1}/${screenshots.length + pendingFiles.length + 1})`}
          defaultToSquare={false}
        />
      )}
    </div>
  );
};

export default AddPoiForm;