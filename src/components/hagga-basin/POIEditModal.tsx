import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, MapPin, Lock, Users, Eye, Save, Upload, Trash2, Target } from 'lucide-react';
import type { 
  Poi, 
  PoiType, 
  CustomIcon, 
  PrivacyLevel 
} from '../../types';
import { formatCoordinates } from '../../lib/coordinates';
import { useAuth } from '../auth/AuthProvider';

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
  const [selectedCustomIcon, setSelectedCustomIcon] = useState<string | null>(null);
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>(poi.privacy_level);
  const [coordinatesX, setCoordinatesX] = useState(poi.coordinates_x || 0);
  const [coordinatesY, setCoordinatesY] = useState(poi.coordinates_y || 0);
  const [additionalScreenshots, setAdditionalScreenshots] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check permissions
  const canEdit = user && (user.id === poi.created_by || user.role === 'admin' || user.role === 'editor');

  // Get categories for organizing POI types, including custom icons
  const categories = [...new Set(poiTypes.map(type => type.category))];
  if (customIcons.length > 0) {
    categories.push('custom');
  }

  // Handle position change
  const handlePositionChange = () => {
    if (onPositionChange) {
      onPositionChange(poi);
      onClose();
    }
  };

  // Handle additional screenshot upload
  const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB limit
    );
    
    if (validFiles.length !== files.length) {
      setError('Some files were invalid. Only images under 10MB are allowed.');
      return;
    }
    
    setAdditionalScreenshots(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 total
  };

  // Remove additional screenshot
  const removeAdditionalScreenshot = (index: number) => {
    setAdditionalScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  // Upload additional screenshots to Supabase Storage
  const uploadAdditionalScreenshots = async (poiId: string): Promise<string[]> => {
    if (additionalScreenshots.length === 0) return [];

    const uploadedUrls: string[] = [];

    for (const file of additionalScreenshots) {
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

    if (!selectedPoiTypeId && !selectedCustomIcon) {
      setError('Please select a POI type or custom icon');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare update data
      const updateData = {
        title: title.trim(),
        description: description.trim() || null,
        poi_type_id: selectedCustomIcon ? null : selectedPoiTypeId,
        custom_icon_id: selectedCustomIcon || null,
        coordinates_x: coordinatesX,
        coordinates_y: coordinatesY,
        privacy_level: privacyLevel,
        updated_at: new Date().toISOString()
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

      // Upload additional screenshots if any
      if (additionalScreenshots.length > 0) {
        try {
          const screenshotUrls = await uploadAdditionalScreenshots(poi.id);
          
          // Save screenshot records
          const screenshotRecords = screenshotUrls.map(url => ({
            poi_id: poi.id,
            url,
            uploaded_by: user!.id
          }));

          const { error: screenshotError } = await supabase
            .from('poi_screenshots')
            .insert(screenshotRecords);

          if (screenshotError) {
            console.error('Error saving screenshot records:', screenshotError);
            // Don't fail the update for this
          }
        } catch (screenshotUploadError) {
          console.error('Error uploading screenshots:', screenshotUploadError);
          setError('POI updated successfully, but some screenshots failed to upload');
        }
      }

      // Create updated POI object with existing screenshots
      const finalUpdatedPoi = {
        ...updatedPoi,
        screenshots: poi.screenshots // Keep existing screenshots
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
                      X: {coordinatesX.toFixed(2)}%, Y: {coordinatesY.toFixed(2)}%
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
              <label className="block text-sm font-medium text-sand-800 mb-3">
                POI Type *
              </label>
              <div className="space-y-4">
                {categories.map(category => {
                  // Handle custom icons category
                  if (category === 'custom') {
                    return (
                      <div key={category}>
                        <h4 className="text-sm font-medium text-sand-700 mb-2 capitalize">
                          Custom Icons
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {customIcons.map(customIcon => (
                            <label
                              key={`custom-${customIcon.id}`}
                              className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedCustomIcon === customIcon.id
                                  ? 'border-spice-500 bg-spice-50'
                                  : 'border-sand-200 hover:border-sand-300 bg-white'
                              }`}
                            >
                              <input
                                type="radio"
                                name="poiType"
                                value={`custom-${customIcon.id}`}
                                checked={selectedCustomIcon === customIcon.id}
                                onChange={() => {
                                  setSelectedCustomIcon(customIcon.id);
                                  setSelectedPoiTypeId(''); // Clear regular type selection
                                }}
                                className="sr-only"
                              />
                              
                              {/* Custom Icon */}
                              <div className="w-8 h-8 rounded-full border border-white shadow-sm flex items-center justify-center flex-shrink-0 bg-sand-200">
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
                    );
                  }

                  // Handle regular POI type categories
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
                                selectedPoiTypeId === poiType.id && !selectedCustomIcon
                                  ? 'border-spice-500 bg-spice-50'
                                  : 'border-sand-200 hover:border-sand-300 bg-white'
                              }`}
                            >
                              <input
                                type="radio"
                                name="poiType"
                                value={poiType.id}
                                checked={selectedPoiTypeId === poiType.id && !selectedCustomIcon}
                                onChange={(e) => {
                                  setSelectedPoiTypeId(e.target.value);
                                  setSelectedCustomIcon(null); // Clear custom icon selection
                                }}
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
              </div>
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

            {/* Additional Screenshots */}
            <div>
              <label className="block text-sm font-medium text-sand-800 mb-3">
                Add Screenshots
              </label>
              <div className="space-y-3">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-sand-300 border-dashed rounded-lg cursor-pointer bg-sand-50 hover:bg-sand-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-sand-500" />
                      <p className="text-sm text-sand-600">
                        <span className="font-medium">Click to upload</span> additional screenshots
                      </p>
                      <p className="text-xs text-sand-500">PNG, JPG up to 10MB (max 5 files)</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Additional Screenshot Previews */}
                {additionalScreenshots.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {additionalScreenshots.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Additional screenshot ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-sand-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeAdditionalScreenshot(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
    </div>
  );
};

export default POIEditModal; 