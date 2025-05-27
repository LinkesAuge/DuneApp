import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, MapPin, Lock, Users, Eye, Image, Upload, Plus } from 'lucide-react';
import type { 
  PixelCoordinates, 
  PoiType, 
  CustomIcon, 
  Poi, 
  PrivacyLevel,
  PercentageCoordinates
} from '../../types';
import { formatCoordinates } from '../../lib/coordinates';
import { useAuth } from '../auth/AuthProvider';
import CustomPoiTypeModal from './CustomPoiTypeModal';
import ImageCropModal from '../grid/ImageCropModal';
import { PixelCrop } from 'react-image-crop';

interface POIPlacementModalProps {
  coordinates: PixelCoordinates;
  poiTypes: PoiType[];
  customIcons: CustomIcon[];
  onPoiCreated: (poi: Poi) => void;
  onClose: () => void;
  mapType?: 'deep_desert' | 'hagga_basin';
  gridSquareId?: string;
  onRequestPlacement?: () => void; // For Deep Desert - temporarily close modal and enter placement mode
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

const POIPlacementModal: React.FC<POIPlacementModalProps> = ({
  coordinates,
  poiTypes,
  customIcons,
  onPoiCreated,
  onClose,
  mapType = 'hagga_basin',
  gridSquareId,
  onRequestPlacement
}) => {
  const { user } = useAuth();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPoiTypeId, setSelectedPoiTypeId] = useState('');
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>('global');
  const [screenshots, setScreenshots] = useState<File[]>([]);
  
  // UI state
  const [showDetailedPoiSelection, setShowDetailedPoiSelection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustomPoiTypeModal, setShowCustomPoiTypeModal] = useState(false);
  const [userCreatedPoiTypes, setUserCreatedPoiTypes] = useState<PoiType[]>([]);

  // Screenshot cropping state
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [pendingCroppedFiles, setPendingCroppedFiles] = useState<File[]>([]);

  // Get categories for organizing POI types
  const categories = [...new Set(poiTypes.map(type => type.category))];

  // Auto-fill title and description when POI type is selected
  useEffect(() => {
    if (selectedPoiTypeId && !selectedPoiTypeId.startsWith('custom_')) {
      const selectedType = poiTypes.find(type => type.id === selectedPoiTypeId);
      if (selectedType) {
        setTitle(selectedType.name);
        setDescription(selectedType.default_description || '');
      }
    } else if (selectedPoiTypeId.startsWith('custom_')) {
      const customIconId = selectedPoiTypeId.replace('custom_', '');
      const customIcon = customIcons.find(icon => icon.id === customIconId);
      if (customIcon) {
        setTitle(customIcon.name);
        setDescription('');
      }
    }
  }, [selectedPoiTypeId, poiTypes, customIcons]);

  // Get user-created POI types for the custom modal
  useEffect(() => {
    const userTypes = poiTypes.filter(type => type.created_by === user?.id);
    setUserCreatedPoiTypes(userTypes);
  }, [poiTypes, user?.id]);

  // Handle custom POI type creation
  const handleCustomPoiTypeCreated = (newPoiType: PoiType) => {
    setUserCreatedPoiTypes(prev => [newPoiType, ...prev]);
    setSelectedPoiTypeId(newPoiType.id);
    setShowCustomPoiTypeModal(false);
  };

  const handleCustomPoiTypeDeleted = (poiTypeId: string) => {
    setUserCreatedPoiTypes(prev => prev.filter(type => type.id !== poiTypeId));
    if (selectedPoiTypeId === poiTypeId) {
      setSelectedPoiTypeId('');
    }
  };

  const handleCustomPoiTypeUpdated = (updatedPoiType: PoiType) => {
    setUserCreatedPoiTypes(prev => prev.map(type => type.id === updatedPoiType.id ? updatedPoiType : type));
  };

  // Handle screenshot upload - now with cropping
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
    const totalFiles = screenshots.length + pendingCroppedFiles.length + validFiles.length;
    if (totalFiles > 5) {
      setError('Maximum 5 screenshots allowed per POI');
      return;
    }
    
    // Process files one by one through cropping
    processFilesForCropping(validFiles);
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

    // Add original file to screenshots instead of pending cropped files
    setScreenshots(prev => [...prev, tempImageFile]);

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

  // Remove screenshot (original files)
  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  // Remove cropped screenshot
  const removeCroppedScreenshot = (index: number) => {
    setPendingCroppedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload screenshots to Supabase Storage
  const uploadScreenshots = async (poiId: string): Promise<string[]> => {
    const allFiles = [...screenshots, ...pendingCroppedFiles];
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
    
    if (!user) {
      setError('You must be logged in to create POIs');
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
    
    console.log('🔧 [POIPlacementModal] Selected POI Type ID:', selectedPoiTypeId);
    console.log('🔧 [POIPlacementModal] Available custom icons:', customIcons);
    
    if (selectedPoiTypeId.startsWith('custom_')) {
      customIconId = selectedPoiTypeId.replace('custom_', '');
      const customIcon = customIcons.find(icon => icon.id === customIconId);
      
      console.log('🔧 [POIPlacementModal] Custom icon ID:', customIconId);
      console.log('🔧 [POIPlacementModal] Found custom icon:', customIcon);
      
      if (!customIcon) {
        setError('Selected custom icon not found.');
        return;
      }
      
      // Find a generic POI type to use as base, prefer "Custom" category or first available
      const customCategoryType = poiTypes.find(type => type.category.toLowerCase() === 'custom');
      const fallbackType = poiTypes.find(type => type.category.toLowerCase() === 'general') || poiTypes[0];
      
      finalPoiTypeId = customCategoryType?.id || fallbackType?.id;
      
      console.log('🔧 [POIPlacementModal] Final POI type ID:', finalPoiTypeId);
      
      if (!finalPoiTypeId) {
        setError('No suitable POI type found for custom icon.');
        return;
      }
      
      console.log('🔧 [POIPlacementModal] Will save custom icon ID to database:', customIconId);
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create the POI record
      const poiData = {
        title: title.trim(),
        description: description.trim() || null,
        poi_type_id: finalPoiTypeId,
        created_by: user.id,
        map_type: mapType,
        coordinates_x: coordinates.x,
        coordinates_y: coordinates.y,
        privacy_level: privacyLevel,
        grid_square_id: mapType === 'deep_desert' ? gridSquareId : null,
        custom_icon_id: customIconId
      };

      const { data: poi, error: poiError } = await supabase
        .from('pois')
        .insert([poiData])
        .select(`
          *,
          poi_types (*),
          profiles (username)
        `)
        .single();

      if (poiError) {
        console.error('Error creating POI:', poiError);
        throw new Error('Failed to create POI');
      }

      // Upload screenshots if any and update POI
      let finalScreenshots: any[] = [];
      const totalScreenshots = screenshots.length + pendingCroppedFiles.length;
      
      if (totalScreenshots > 0) {
        try {
          const screenshotUrls = await uploadScreenshots(poi.id);
          
          // Create screenshot objects in the format expected by the database
          finalScreenshots = screenshotUrls.map((url, index) => ({
            id: `${poi.id}_${Date.now()}_${index}`,
            url,
            uploaded_by: user.id,
            upload_date: new Date().toISOString()
          }));

          // Update the POI with screenshots in JSONB[] format
          const { error: screenshotError } = await supabase
            .from('pois')
            .update({ screenshots: finalScreenshots })
            .eq('id', poi.id);

          if (screenshotError) {
            console.error('Error saving screenshot records:', screenshotError);
            // Don't fail the POI creation for this
          }
        } catch (screenshotUploadError) {
          console.error('Error uploading screenshots:', screenshotUploadError);
          // Don't fail the POI creation for screenshot upload failures
          setError('POI created successfully, but some screenshots failed to upload');
        }
      }

      // Add screenshots to the POI object for immediate display
      const poiWithScreenshots = {
        ...poi,
        screenshots: finalScreenshots
      };

      onPoiCreated(poiWithScreenshots as Poi);
    } catch (err) {
      console.error('Error in POI creation:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-night-950/90 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sand-200">
          <div className="flex items-center">
            <MapPin className="w-6 h-6 text-spice-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-sand-800">
                Add POI to {mapType === 'deep_desert' ? 'Deep Desert Grid' : 'Hagga Basin'}
              </h3>
              <div className="flex items-center gap-2">
                <p className="text-sm text-sand-600">
                  Coordinates: {formatCoordinates(coordinates.x, coordinates.y)}
                </p>
                {mapType === 'deep_desert' && onRequestPlacement && (
                  <button
                    type="button"
                    onClick={onRequestPlacement}
                    className="text-xs bg-spice-100 text-spice-700 px-2 py-1 rounded hover:bg-spice-200 transition-colors flex items-center gap-1"
                    title="Click to change POI placement on the screenshot"
                  >
                    <MapPin className="w-3 h-3" />
                    Place POI
                  </button>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-sand-400 hover:text-sand-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* POI Type Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="poiTypeSelect" className="block text-sm font-medium text-sand-700">
                POI Type *
              </label>
              <button
                type="button"
                onClick={() => setShowCustomPoiTypeModal(true)}
                className="text-sm text-spice-600 hover:text-spice-800 font-medium flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Create Custom Type
              </button>
            </div>
            
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
                      <h4 className="text-sm font-medium text-sand-600 mb-2 capitalize">{category}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {categoryTypes.map(type => {
                          const imageUrl = getDisplayImageUrl(type.icon, customIcons);
                          
                          return (
                            <label
                              key={type.id}
                              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedPoiTypeId === type.id
                                  ? 'border-spice-500 bg-spice-50'
                                  : 'border-sand-200 hover:border-sand-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="poiType"
                                value={type.id}
                                checked={selectedPoiTypeId === type.id}
                                onChange={(e) => setSelectedPoiTypeId(e.target.value)}
                                className="sr-only"
                              />
                              
                              {/* POI Type Icon */}
                              <div 
                                className="w-6 h-6 rounded-full flex items-center justify-center mr-3 text-white text-sm"
                                style={{
                                  backgroundColor: type.icon_has_transparent_background && imageUrl 
                                    ? 'transparent' 
                                    : type.color
                                }}
                              >
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={type.name}
                                    className="w-4 h-4 object-contain"
                                    style={{
                                      filter: type.icon_has_transparent_background ? 'none' : 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))'
                                    }}
                                  />
                                ) : (
                                  <span 
                                    style={{ 
                                      color: type.icon_has_transparent_background ? type.color : 'white',
                                      textShadow: type.icon_has_transparent_background ? '0 1px 1px rgba(0,0,0,0.3)' : 'none'
                                    }}
                                  >
                                    {type.icon}
                                  </span>
                                )}
                              </div>
                              
                              <span className="text-sm font-medium text-sand-700">{type.name}</span>
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
                    <h4 className="text-sm font-medium text-sand-600 mb-2">Custom Icons</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {customIcons.map(customIcon => (
                        <label
                          key={`custom_${customIcon.id}`}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedPoiTypeId === `custom_${customIcon.id}`
                              ? 'border-spice-500 bg-spice-50'
                              : 'border-sand-200 hover:border-sand-300'
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
                          <div className="w-6 h-6 rounded-full flex items-center justify-center mr-3 bg-transparent">
                            <img
                              src={customIcon.image_url}
                              alt={customIcon.name}
                              className="w-4 h-4 object-contain"
                            />
                          </div>
                          
                          <span className="text-sm font-medium text-sand-700">{customIcon.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-sand-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter POI title..."
              className="w-full px-3 py-2 border border-sand-300 rounded-md focus:outline-none focus:ring-2 focus:ring-spice-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-sand-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter POI description..."
              rows={3}
              className="w-full px-3 py-2 border border-sand-300 rounded-md focus:outline-none focus:ring-2 focus:ring-spice-500"
            />
          </div>

          {/* Privacy Level */}
          <div>
            <label className="block text-sm font-medium text-sand-700 mb-2">
              Visibility
            </label>
            <div className="space-y-2">
              {privacyOptions.map(option => {
                const Icon = option.icon;
                return (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      privacyLevel === option.value
                        ? 'border-spice-500 bg-spice-50'
                        : 'border-sand-200 hover:border-sand-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      checked={privacyLevel === option.value}
                      onChange={(e) => setPrivacyLevel(e.target.value as PrivacyLevel)}
                      className="sr-only"
                    />
                    <Icon className={`w-5 h-5 mr-3 ${option.color}`} />
                    <div>
                      <div className="font-medium text-sand-700">{option.label}</div>
                      <div className="text-sm text-sand-500">{option.description}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Screenshots */}
          <div>
            <label className="block text-sm font-medium text-sand-700 mb-2">
              Screenshots (Optional)
            </label>
            
            {/* Upload Button */}
            <div className="mb-4">
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-sand-300 rounded-lg cursor-pointer hover:border-sand-400 transition-colors">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-sand-400 mx-auto mb-2" />
                  <span className="text-sm text-sand-600">
                    Click to upload screenshots
                  </span>
                  <p className="text-xs text-sand-500 mt-1">
                    PNG, JPG up to 10MB each (max 5 images)
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  className="sr-only"
                />
              </label>
            </div>

            {/* Screenshot Previews */}
            {(screenshots.length > 0 || pendingCroppedFiles.length > 0) && (
              <div className="space-y-4">
                {/* Original Screenshots */}
                {screenshots.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-sand-700 mb-2">Original Screenshots</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {screenshots.map((file, index) => (
                        <div key={`original-${index}`} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Original Screenshot ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeScreenshot(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                            Original
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cropped Screenshots */}
                {pendingCroppedFiles.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-sand-700 mb-2">Cropped Screenshots</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {pendingCroppedFiles.map((file, index) => (
                        <div key={`cropped-${index}`} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Cropped Screenshot ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeCroppedScreenshot(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                            Cropped
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-sand-200">
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
              className="btn btn-primary"
              disabled={isSubmitting || !title.trim() || !selectedPoiTypeId}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating POI...
                </div>
              ) : (
                'Create POI'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Custom POI Type Modal */}
      <CustomPoiTypeModal
        isOpen={showCustomPoiTypeModal}
        onClose={() => setShowCustomPoiTypeModal(false)}
        customPoiTypes={userCreatedPoiTypes}
        onPoiTypeCreated={handleCustomPoiTypeCreated}
        onPoiTypeDeleted={handleCustomPoiTypeDeleted}
        onPoiTypeUpdated={handleCustomPoiTypeUpdated}
      />

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

export default POIPlacementModal; 