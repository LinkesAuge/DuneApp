import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Poi, PoiType, PoiScreenshot } from '../../types';
import { useAuth } from '../auth/AuthProvider';
import { Upload, X, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ImageCropModal from '../grid/ImageCropModal';
import { PixelCrop } from 'react-image-crop';

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
  const [screenshots, setScreenshots] = useState<PoiScreenshot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Screenshot cropping state
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [pendingCroppedFiles, setPendingCroppedFiles] = useState<File[]>([]);
  const [originalFiles, setOriginalFiles] = useState<File[]>([]);

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

  const handleScreenshotUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    
    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB limit
    );
    
    if (validFiles.length !== files.length) {
      setError('Some files were invalid. Only images under 10MB are allowed.');
      return;
    }

    // Check total screenshot limit (uploaded + pending)
    const totalFiles = screenshots.length + pendingCroppedFiles.length + originalFiles.length + validFiles.length;
    if (totalFiles > 5) {
      setError('Maximum 5 screenshots allowed per POI');
      return;
    }

    setError(null);
    
    // Process files one by one through cropping
    processFilesForCropping(validFiles);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Process files through cropping workflow
  const processFilesForCropping = (files: File[]) => {
    if (files.length === 0) return;
    
    const [firstFile, ...remainingFiles] = files;
    
    // Set up for cropping the first file
    setTempImageFile(firstFile);
    setTempImageUrl(URL.createObjectURL(firstFile));
    setShowCropModal(true);
    
    // Store remaining files to process after current crop is complete
    if (remainingFiles.length > 0) {
      // We'll handle remaining files after crop completion
      setTempImageFile(prev => {
        // Store remaining files in a way we can access them
        (firstFile as any).remainingFiles = remainingFiles;
        return firstFile;
      });
    }
  };

  // Handle crop completion
  const handleCropComplete = async (croppedImageBlob: Blob) => {
    if (!tempImageFile) return;

    try {
      // Convert blob to File
      const croppedFile = new File([croppedImageBlob], tempImageFile.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      // Add to pending cropped files
      setPendingCroppedFiles(prev => [...prev, croppedFile]);

      // Check if there are remaining files to process
      const remainingFiles = (tempImageFile as any).remainingFiles as File[] || [];
      
      // Clean up current temp state
      setShowCropModal(false);
      setTempImageFile(null);
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
        setTempImageUrl(null);
      }

      // Process remaining files if any
      if (remainingFiles.length > 0) {
        setTimeout(() => processFilesForCropping(remainingFiles), 100);
      }
    } catch (error) {
      console.error('Error processing cropped image:', error);
      setError('Failed to process cropped image. Please try again.');
    }
  };

  // Handle skipping crop for a file (use original)
  const handleSkipCrop = () => {
    if (!tempImageFile) return;

    // Add original file to original files array
    setOriginalFiles(prev => [...prev, tempImageFile]);

    // Check if there are remaining files to process
    const remainingFiles = (tempImageFile as any).remainingFiles as File[] || [];
    
    // Clean up current temp state
    setShowCropModal(false);
    setTempImageFile(null);
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl(null);
    }

    // Process remaining files if any
    if (remainingFiles.length > 0) {
      setTimeout(() => processFilesForCropping(remainingFiles), 100);
    }
  };

  // Handle closing crop modal
  const handleCloseCropModal = () => {
    setShowCropModal(false);
    setTempImageFile(null);
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl(null);
    }
  };

  // Remove uploaded screenshot
  const removeScreenshot = (id: string) => {
    setScreenshots(prev => prev.filter(s => s.id !== id));
  };

  // Remove cropped screenshot
  const removeCroppedScreenshot = (index: number) => {
    setPendingCroppedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Remove original screenshot
  const removeOriginalScreenshot = (index: number) => {
    setOriginalFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload all files (original and cropped) to Supabase Storage
  const uploadAllFiles = async (): Promise<PoiScreenshot[]> => {
    const allFiles = [...originalFiles, ...pendingCroppedFiles];
    if (allFiles.length === 0) return [];

    const newScreenshots: PoiScreenshot[] = [];
    
    for (const file of allFiles) {
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
          uploaded_by: user!.id,
          upload_date: new Date().toISOString()
        });
      } catch (err: any) {
        console.error('Error uploading screenshot:', err);
        throw new Error(`Error uploading screenshot: ${err.message}`);
      }
    }
    
    return newScreenshots;
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

      // Upload all files (original + cropped) and combine with existing screenshots
      const newUploadedScreenshots = await uploadAllFiles();
      const allScreenshots = [...screenshots, ...newUploadedScreenshots];
      
      const newPoi = {
        grid_square_id: gridSquareId,
        poi_type_id: poiTypeId,
        title,
        description: finalNotes,
        created_by: user.id,
        screenshots: allScreenshots
      };
      
      const { data, error } = await supabase
        .from('pois')
        .insert(newPoi)
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        console.log('[AddPoiForm] POI added successfully:', data);
        onPoiAdded(data as Poi);
      } else {
        console.warn('[AddPoiForm] POI added but no data returned');
      }
    } catch (err: any) {
      console.error('Error adding POI:', err);
      setError(err.message);
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
                <Check size={16} />
                Save POI
              </>
            )}
          </button>
        </div>
      </form>

      {/* Image Crop Modal */}
      {showCropModal && tempImageFile && tempImageUrl && (
        <ImageCropModal
          imageUrl={tempImageUrl}
          onCropComplete={(croppedImageBlob: Blob) => handleCropComplete(croppedImageBlob)}
          onClose={handleCloseCropModal}
          onSkip={handleSkipCrop}
          title="Crop POI Screenshot"
          defaultToSquare={false}
        />
      )}
    </div>
  );
};

export default AddPoiForm;