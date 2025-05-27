import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, MapPin, Lock, Users, Eye, Save, Upload, Trash2, Target, Edit } from 'lucide-react';
import type { 
  Poi, 
  PoiType, 
  CustomIcon, 
  PrivacyLevel 
} from '../../types';
import { formatCoordinates } from '../../lib/coordinates';
import { useAuth } from '../auth/AuthProvider';
import ImageCropModal from '../grid/ImageCropModal';
import { PixelCrop } from 'react-image-crop';

interface POIEditModalProps {
  poi: Poi;
  poiTypes: PoiType[];
  customIcons: CustomIcon[];
  onPoiUpdated: (poi: Poi) => void;
  onClose: () => void;
  onPositionChange?: (poi: Poi) => void;
}

// Privacy level options with descriptions
const privacyOptions = [
  {
    value: 'global' as PrivacyLevel,
    label: 'Public',
    icon: Eye,
    description: 'Visible to all users',
    color: 'text-green-600'
  },
  {
    value: 'private' as PrivacyLevel,
    label: 'Private',
    icon: Lock,
    description: 'Only visible to you',
    color: 'text-red-600'
  },
  {
    value: 'shared' as PrivacyLevel,
    label: 'Shared',
    icon: Users,
    description: 'Share with specific users',
    color: 'text-blue-600'
  }
];

// Helper function to determine if an icon is a URL or emoji
const isIconUrl = (icon: string): boolean => {
  return icon.startsWith('http') || icon.startsWith('/') || icon.includes('.');
};

// Helper function to get display image URL for POI icons
const getDisplayImageUrl = (icon: string, customIcons: CustomIcon[]): string | null => {
  // Check if it's a custom icon reference
  const customIcon = customIcons.find(ci => ci.id === icon || ci.name === icon);
  if (customIcon) {
    return customIcon.image_url;
  }
  
  // Check if it's already a URL
  if (isIconUrl(icon)) {
    return icon;
  }
  
  return null;
};

const POIEditModal: React.FC<POIEditModalProps> = ({
  poi,
  poiTypes,
  customIcons,
  onPoiUpdated,
  onClose,
  onPositionChange
}) => {
  const { user } = useAuth();
  
  // Form state
  const [title, setTitle] = useState(poi.title);
  const [description, setDescription] = useState(poi.description || '');
  const [selectedPoiTypeId, setSelectedPoiTypeId] = useState(poi.poi_type_id);
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>(poi.privacy_level);
  const [coordinatesX, setCoordinatesX] = useState(poi.coordinates_x || 0);
  const [coordinatesY, setCoordinatesY] = useState(poi.coordinates_y || 0);
  
  // Screenshot management - work with existing screenshots from POI
  const [existingScreenshots, setExistingScreenshots] = useState<{ id: string; url: string }[]>(
    poi.screenshots?.map(s => ({ id: s.id, url: s.url })) || []
  );
  const [screenshotsToDelete, setScreenshotsToDelete] = useState<string[]>([]);
  const [additionalScreenshots, setAdditionalScreenshots] = useState<File[]>([]);
  
  // Screenshot cropping state
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [pendingCroppedFiles, setPendingCroppedFiles] = useState<File[]>([]);
  const [editingScreenshotId, setEditingScreenshotId] = useState<string | null>(null);
  
  // UI state
  const [showDetailedPoiSelection, setShowDetailedPoiSelection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check permissions
  const canEdit = user && (user.id === poi.created_by || user.role === 'admin' || user.role === 'editor');

  // Get categories for organizing POI types
  const categories = [...new Set(poiTypes.map(type => type.category))];

  // Initialize screenshots from POI data
  useEffect(() => {
    setExistingScreenshots(poi.screenshots?.map(s => ({ id: s.id, url: s.url })) || []);
  }, [poi.screenshots]);

  // Handle position change
  const handlePositionChange = () => {
    if (onPositionChange) {
      onPositionChange(poi);
      onClose();
    }
  };

  // Handle existing screenshot deletion
  const handleDeleteExistingScreenshot = (screenshotId: string) => {
    setExistingScreenshots(prev => prev.filter(s => s.id !== screenshotId));
    setScreenshotsToDelete(prev => [...prev, screenshotId]);
  };

  // Calculate total screenshot count
  const totalScreenshotCount = existingScreenshots.length + additionalScreenshots.length + pendingCroppedFiles.length;

  // Handle additional screenshot upload - now with cropping
  const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;
    
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB limit
    );
    
    if (validFiles.length !== files.length) {
      setError('Some files were invalid. Only images under 10MB are allowed.');
      return;
    }

    // Check total screenshot limit
    const maxNew = 5 - totalScreenshotCount;
    if (maxNew <= 0) {
      setError('Maximum 5 screenshots allowed per POI');
      return;
    }
    
    const filesToAdd = validFiles.slice(0, maxNew);
    if (filesToAdd.length < validFiles.length) {
      setError(`Only ${filesToAdd.length} screenshot(s) can be added (5 total limit)`);
    }
    
    // Process files one by one through cropping
    processFilesForCropping(filesToAdd);
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

    // Add original file to additional screenshots instead of pending cropped files
    setAdditionalScreenshots(prev => [...prev, tempImageFile]);

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
    setEditingScreenshotId(null);
  };

  // Handle editing existing screenshot
  const handleEditExistingScreenshot = (screenshotId: string, screenshotUrl: string) => {
    setEditingScreenshotId(screenshotId);
    
    // Create a cache-busted URL to avoid CORS issues
    const url = new URL(screenshotUrl);
    url.searchParams.set('t', Date.now().toString());
    
    setTempImageUrl(url.toString());
    setShowCropModal(true);
  };

  // Handle crop completion for existing screenshot
  const handleEditCropComplete = async (croppedImageBlob: Blob) => {
    if (!editingScreenshotId || !user) return;

    try {
      // Convert blob to File
      const croppedFile = new File([croppedImageBlob], 'cropped-screenshot.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      // Add to pending cropped files
      setPendingCroppedFiles(prev => [...prev, croppedFile]);

      // Remove the original screenshot from existing screenshots
      setExistingScreenshots(prev => prev.filter(s => s.id !== editingScreenshotId));
      setScreenshotsToDelete(prev => [...prev, editingScreenshotId]);

      // Close modal
      setShowCropModal(false);
      setTempImageFile(null);
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
        setTempImageUrl(null);
      }
      setEditingScreenshotId(null);
    } catch (error) {
      console.error('Error processing cropped image:', error);
      setError('Failed to process cropped image. Please try again.');
    }
  };

  // Remove additional screenshot
  const removeAdditionalScreenshot = (index: number) => {
    setAdditionalScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  // Remove cropped screenshot
  const removeCroppedScreenshot = (index: number) => {
    setPendingCroppedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload additional screenshots to Supabase Storage
  const uploadAdditionalScreenshots = async (poiId: string): Promise<string[]> => {
    const allFiles = [...additionalScreenshots, ...pendingCroppedFiles];
    if (allFiles.length === 0) return [];

    const uploadedUrls: string[] = [];

    for (const file of allFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${poiId}_${Date.now()}.${fileExt}`;
      const filePath = `screenshots/${fileName}`;

      const { data, error } = await supabase.storage
        .from('screenshots')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading screenshot:', error);
        throw new Error(`Failed to upload screenshot: ${file.name}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('screenshots')
        .getPublicUrl(data.path);

      uploadedUrls.push(urlData.publicUrl);
    }

    return uploadedUrls;
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!canEdit) {
      setError('You do not have permission to edit this POI');
      return;
    }

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!selectedPoiTypeId) {
      setError('Please select a POI type');
      return;
    }

    // Handle custom icon selection
    let finalPoiTypeId = selectedPoiTypeId;
    let customIconId = null;
    
    console.log('🔧 [POIEditModal] Selected POI Type ID:', selectedPoiTypeId);
    console.log('🔧 [POIEditModal] Available custom icons:', customIcons);
    
    if (selectedPoiTypeId.startsWith('custom_')) {
      customIconId = selectedPoiTypeId.replace('custom_', '');
      const customIcon = customIcons.find(icon => icon.id === customIconId);
      
      console.log('🔧 [POIEditModal] Custom icon ID:', customIconId);
      console.log('🔧 [POIEditModal] Found custom icon:', customIcon);
      
      if (!customIcon) {
        setError('Selected custom icon not found.');
        return;
      }
      
      // Find a generic POI type to use as base, prefer "Custom" category or first available
      const customCategoryType = poiTypes.find(type => type.category.toLowerCase() === 'custom');
      const fallbackType = poiTypes.find(type => type.category.toLowerCase() === 'general') || poiTypes[0];
      
      finalPoiTypeId = customCategoryType?.id || fallbackType?.id;
      
      console.log('🔧 [POIEditModal] Final POI type ID:', finalPoiTypeId);
      
      if (!finalPoiTypeId) {
        setError('No suitable POI type found for custom icon.');
        return;
      }
      
      console.log('🔧 [POIEditModal] Will save custom icon ID to database:', customIconId);
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // For custom icons, we'll modify the POI type data on the client side after update

      // Prepare update data
      const updateData = {
        title: title.trim(),
        description: description.trim() || null,
        poi_type_id: finalPoiTypeId,
        coordinates_x: coordinatesX,
        coordinates_y: coordinatesY,
        privacy_level: privacyLevel,
        custom_icon_id: customIconId,
        updated_by: user!.id
      };

      // Update the POI record
      const { data: updatedPoi, error: updateError } = await supabase
        .from('pois')
        .update(updateData)
        .eq('id', poi.id)
        .select(`
          *,
          poi_types (*),
          profiles (username)
        `)
        .single();

      if (updateError) {
        console.error('Error updating POI:', updateError);
        throw new Error('Failed to update POI');
      }

      // Handle screenshot updates
      let finalScreenshots = [...poi.screenshots || []];
      
      // Remove screenshots marked for deletion
      if (screenshotsToDelete.length > 0) {
        finalScreenshots = finalScreenshots.filter(screenshot => 
          !screenshotsToDelete.includes(screenshot.id)
        );
      }

      // Upload additional screenshots if any (both original and cropped)
      const allNewFiles = [...additionalScreenshots, ...pendingCroppedFiles];
      if (allNewFiles.length > 0) {
        try {
          const screenshotUrls = await uploadAdditionalScreenshots(poi.id);
          
          // Add new screenshots to the array
          const newScreenshots = screenshotUrls.map((url, index) => ({
            id: `${poi.id}_${Date.now()}_${index}`,
            url,
            uploaded_by: user!.id,
            upload_date: new Date().toISOString()
          }));

          finalScreenshots = [...finalScreenshots, ...newScreenshots];
        } catch (screenshotUploadError) {
          console.error('Error uploading screenshots:', screenshotUploadError);
          setError('POI updated successfully, but some screenshots failed to upload');
        }
      }

      // Update POI with new screenshots array
      if (screenshotsToDelete.length > 0 || allNewFiles.length > 0) {
        const { error: screenshotUpdateError } = await supabase
          .from('pois')
          .update({ screenshots: finalScreenshots })
          .eq('id', poi.id);

        if (screenshotUpdateError) {
          console.error('Error updating screenshots:', screenshotUpdateError);
          // Don't fail the main update for this
        }
      }

      // Create updated POI object with updated screenshots
      const finalUpdatedPoi = {
        ...updatedPoi,
        screenshots: finalScreenshots.map(s => ({
          id: s.id,
          url: s.url,
          uploaded_by: s.uploaded_by,
          upload_date: s.upload_date
        }))
      };

      onPoiUpdated(finalUpdatedPoi);
      onClose();
    } catch (error) {
      console.error('Error updating POI:', error);
      setError(error instanceof Error ? error.message : 'Failed to update POI');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canEdit) {
    return (
      <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
        <div className="bg-sand-50 rounded-xl shadow-2xl max-w-md w-full">
          <div className="p-6 text-center">
            <h2 className="text-xl font-bold text-sand-900 mb-4">Access Denied</h2>
            <p className="text-sand-700 mb-4">
              You do not have permission to edit this POI.
            </p>
            <button
              onClick={onClose}
              className="btn btn-outline w-full"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
      <div className="bg-sand-50 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-sand-200 px-6 py-4 border-b border-sand-300 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapPin className="w-6 h-6 text-sand-700" />
            <div>
              <h2 className="text-xl font-bold text-sand-900">Edit POI</h2>
              <p className="text-sm text-sand-600">
                Update POI details and position
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-sand-600 hover:text-sand-800 hover:bg-sand-300/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          <div className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-sand-800 mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Enter POI title..."
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-sand-800 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input input-bordered w-full h-24 resize-none"
                placeholder="Describe this location..."
              />
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-sand-800 mb-2">
                Position
              </label>
              <div className="bg-sand-50 border border-sand-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-sand-700">
                    <div className="font-medium">Current Position:</div>
                    <div className="text-sand-600">
                      X: {coordinatesX.toFixed(0)}, Y: {coordinatesY.toFixed(0)}
                    </div>
                  </div>
                  {onPositionChange && (
                    <button
                      type="button"
                      onClick={handlePositionChange}
                      className="btn btn-outline btn-sm"
                    >
                      <Target className="w-4 h-4 mr-1" />
                      Change Position
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* POI Type Selection */}
            <div>
              <label htmlFor="poiTypeSelect" className="block text-sm font-medium text-sand-800 mb-2">
                POI Type *
              </label>
              
              {/* Dropdown Selection */}
              <select
                id="poiTypeSelect"
                value={selectedPoiTypeId}
                onChange={(e) => setSelectedPoiTypeId(e.target.value)}
                className="input input-bordered w-full mb-3"
                required
              >
                <option value="">Select a POI type</option>
                {categories.sort().map(category => (
                  <optgroup key={category} label={category}>
                    {poiTypes
                      .filter(type => type.category === category)
                      .map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
                {customIcons.length > 0 && (
                  <optgroup label="Custom Icons">
                    {customIcons.map(icon => (
                      <option key={`custom_${icon.id}`} value={`custom_${icon.id}`}>
                        {icon.name} (Custom)
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>

              {/* Show More Details Toggle */}
              <button
                type="button"
                onClick={() => setShowDetailedPoiSelection(!showDetailedPoiSelection)}
                className="text-sm text-spice-600 hover:text-spice-800 font-medium underline"
              >
                {showDetailedPoiSelection ? 'Hide details' : 'Show more details'}
              </button>

              {/* Detailed Visual Selection */}
              {showDetailedPoiSelection && (
                <div className="mt-4 space-y-4 border border-sand-200 rounded-lg p-4 bg-sand-25">
                  {categories.map(category => {
                    const categoryTypes = poiTypes.filter(type => type.category === category);
                    
                    return (
                      <div key={category}>
                        <h4 className="text-sm font-medium text-sand-700 mb-2 capitalize">
                          {category}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {categoryTypes.map(poiType => {
                            const imageUrl = getDisplayImageUrl(poiType.icon, customIcons);
                            
                            return (
                              <label
                                key={poiType.id}
                                className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                  selectedPoiTypeId === poiType.id
                                    ? 'border-spice-500 bg-spice-50'
                                    : 'border-sand-200 hover:border-sand-300 bg-white'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="poiType"
                                  value={poiType.id}
                                  checked={selectedPoiTypeId === poiType.id}
                                  onChange={(e) => setSelectedPoiTypeId(e.target.value)}
                                  className="sr-only"
                                />
                                
                                {/* POI Type Icon */}
                                <div 
                                  className="w-8 h-8 rounded-full border border-white shadow-sm flex items-center justify-center flex-shrink-0"
                                  style={{
                                    backgroundColor: poiType.icon_has_transparent_background && imageUrl 
                                      ? 'transparent' 
                                      : poiType.color
                                  }}
                                >
                                  {imageUrl ? (
                                    <img
                                      src={imageUrl}
                                      alt={poiType.name}
                                      className="w-5 h-5 object-contain"
                                      style={{
                                        filter: poiType.icon_has_transparent_background ? 'none' : 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))'
                                      }}
                                    />
                                  ) : (
                                    <span 
                                      className="text-sm leading-none"
                                      style={{ 
                                        color: poiType.icon_has_transparent_background ? poiType.color : 'white',
                                        textShadow: poiType.icon_has_transparent_background ? '0 1px 1px rgba(0,0,0,0.3)' : 'none'
                                      }}
                                    >
                                      {poiType.icon}
                                    </span>
                                  )}
                                </div>
                                
                                <span className="text-sm font-medium text-sand-800 truncate">
                                  {poiType.name}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Custom Icons Section */}
                  {customIcons.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-sand-700 mb-2">
                        Custom Icons
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {customIcons.map(customIcon => (
                          <label
                            key={`custom_${customIcon.id}`}
                            className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedPoiTypeId === `custom_${customIcon.id}`
                                ? 'border-spice-500 bg-spice-50'
                                : 'border-sand-200 hover:border-sand-300 bg-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name="poiType"
                              value={`custom_${customIcon.id}`}
                              checked={selectedPoiTypeId === `custom_${customIcon.id}`}
                              onChange={(e) => setSelectedPoiTypeId(e.target.value)}
                              className="sr-only"
                            />
                            
                            {/* Custom Icon */}
                            <div className="w-8 h-8 rounded-full border border-white shadow-sm flex items-center justify-center flex-shrink-0 bg-transparent">
                              <img
                                src={customIcon.image_url}
                                alt={customIcon.name}
                                className="w-5 h-5 object-contain"
                              />
                            </div>
                            
                            <span className="text-sm font-medium text-sand-800 truncate">
                              {customIcon.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Privacy Level */}
            <div>
              <label className="block text-sm font-medium text-sand-800 mb-3">
                Privacy Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {privacyOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <label
                      key={option.value}
                      className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        privacyLevel === option.value
                          ? 'border-spice-500 bg-spice-50'
                          : 'border-sand-200 hover:border-sand-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="privacy"
                        value={option.value}
                        checked={privacyLevel === option.value}
                        onChange={(e) => setPrivacyLevel(e.target.value as PrivacyLevel)}
                        className="sr-only"
                      />
                      <Icon className={`w-5 h-5 ${option.color}`} />
                      <div>
                        <div className="font-medium text-sm text-sand-800">{option.label}</div>
                        <div className="text-xs text-sand-600">{option.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Screenshots Management */}
            <div>
              <label className="block text-sm font-medium text-sand-800 mb-3">
                Screenshots ({totalScreenshotCount}/5)
              </label>
              <div className="space-y-3">
                {/* Screenshots Grid */}
                <div className="flex flex-wrap gap-2">
                  {/* Existing Screenshots */}
                  {existingScreenshots.map(screenshot => (
                    <div 
                      key={screenshot.id}
                      className="w-20 h-20 relative rounded overflow-hidden border border-sand-300"
                    >
                      <img 
                        src={screenshot.url} 
                        alt="POI Screenshot" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-0 right-0 flex">
                        <button
                          type="button"
                          onClick={() => handleEditExistingScreenshot(screenshot.id, screenshot.url)}
                          className="bg-blue-600 text-white w-5 h-5 flex items-center justify-center rounded-bl-md hover:bg-blue-700 transition-colors"
                          title="Edit screenshot"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExistingScreenshot(screenshot.id)}
                          className="bg-red-600 text-white w-5 h-5 flex items-center justify-center hover:bg-red-700 transition-colors"
                          title="Delete screenshot"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* New Screenshots to Upload (Original) */}
                  {additionalScreenshots.map((file, index) => (
                    <div 
                      key={`new-${index}`}
                      className="w-20 h-20 relative rounded overflow-hidden border border-sand-300"
                    >
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt="New Screenshot" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeAdditionalScreenshot(index)}
                        className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-bl-md hover:bg-red-700 transition-colors"
                        title="Remove screenshot"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                        Original
                      </div>
                    </div>
                  ))}

                  {/* Cropped Screenshots to Upload */}
                  {pendingCroppedFiles.map((file, index) => (
                    <div 
                      key={`cropped-${index}`}
                      className="w-20 h-20 relative rounded overflow-hidden border border-green-300"
                    >
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt="Cropped Screenshot" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeCroppedScreenshot(index)}
                        className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-bl-md hover:bg-red-700 transition-colors"
                        title="Remove cropped screenshot"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                        Cropped
                      </div>
                    </div>
                  ))}
                  
                  {/* Upload Button */}
                  {totalScreenshotCount < 5 && (
                    <label className="w-20 h-20 border-2 border-dashed border-sand-300 rounded flex flex-col items-center justify-center text-sand-500 hover:text-sand-700 hover:border-sand-400 cursor-pointer transition-colors">
                      <Upload className="w-5 h-5" />
                      <span className="text-xs mt-1">Add</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        multiple
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                
                <p className="text-xs text-sand-600">
                  Upload up to 5 screenshots total. Each image must be under 10MB. PNG, JPG formats supported.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-sand-200 px-6 py-4 border-t border-sand-300 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Updating...' : 'Update POI'}
          </button>
        </div>
      </div>

      {/* Image Crop Modal */}
      {showCropModal && tempImageUrl && (
        <ImageCropModal
          imageUrl={tempImageUrl}
          onCropComplete={editingScreenshotId ? 
            (croppedImageBlob: Blob) => handleEditCropComplete(croppedImageBlob) :
            (croppedImageBlob: Blob) => handleCropComplete(croppedImageBlob)
          }
          onClose={handleCloseCropModal}
          onSkip={editingScreenshotId ? undefined : handleSkipCrop}
          title={editingScreenshotId ? "Edit POI Screenshot" : "Crop POI Screenshot"}
          defaultToSquare={false}
        />
      )}
    </div>
  );
};

export default POIEditModal; 