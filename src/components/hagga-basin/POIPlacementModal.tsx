import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, MapPin, Lock, Users, Eye, Image, Upload } from 'lucide-react';
import type { 
  PixelCoordinates, 
  PoiType, 
  CustomIcon, 
  Poi, 
  PrivacyLevel 
} from '../../types';
import { formatCoordinates } from '../../lib/coordinates';
import { useAuth } from '../auth/AuthProvider';

interface POIPlacementModalProps {
  coordinates: PixelCoordinates;
  poiTypes: PoiType[];
  customIcons: CustomIcon[];
  onPoiCreated: (poi: Poi) => void;
  onClose: () => void;
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
  onClose
}) => {
  const { user } = useAuth();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPoiTypeId, setSelectedPoiTypeId] = useState('');
  const [selectedCustomIcon, setSelectedCustomIcon] = useState<string | null>(null);
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>('global');
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get categories for organizing POI types, including custom icons
  const categories = [...new Set(poiTypes.map(type => type.category))];
  if (customIcons.length > 0) {
    categories.push('custom');
  }

  // Handle screenshot upload
  const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB limit
    );
    
    if (validFiles.length !== files.length) {
      setError('Some files were invalid. Only images under 10MB are allowed.');
      return;
    }
    
    setScreenshots(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 screenshots
  };

  // Remove screenshot
  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  // Upload screenshots to Supabase Storage
  const uploadScreenshots = async (poiId: string): Promise<string[]> => {
    if (screenshots.length === 0) return [];

    const uploadedUrls: string[] = [];

    for (const file of screenshots) {
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

    if (!selectedPoiTypeId && !selectedCustomIcon) {
      setError('Please select a POI type or custom icon');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create the POI record
      const poiData = {
        title: title.trim(),
        description: description.trim() || null,
        poi_type_id: selectedCustomIcon ? null : selectedPoiTypeId,
        custom_icon_id: selectedCustomIcon || null,
        created_by: user.id,
        map_type: 'hagga_basin',
        coordinates_x: coordinates.x,
        coordinates_y: coordinates.y,
        privacy_level: privacyLevel,
        grid_square_id: null // Hagga Basin POIs don't have grid squares
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

      // Upload screenshots if any
      let screenshotUrls: string[] = [];
      if (screenshots.length > 0) {
        try {
          screenshotUrls = await uploadScreenshots(poi.id);
          
          // Update POI with screenshot URLs
          const screenshotRecords = screenshotUrls.map(url => ({
            poi_id: poi.id,
            url,
            uploaded_by: user.id
          }));

          const { error: screenshotError } = await supabase
            .from('poi_screenshots')
            .insert(screenshotRecords);

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
        screenshots: screenshotUrls.map((url, index) => ({
          id: `temp_${index}`,
          url,
          uploaded_by: user.id,
          upload_date: new Date().toISOString()
        }))
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
              <h3 className="text-lg font-semibold text-sand-800">Add POI to Hagga Basin</h3>
              <p className="text-sm text-sand-600">
                Coordinates: {formatCoordinates(coordinates.x, coordinates.y)}
              </p>
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

          {/* POI Type Selection */}
          <div>
            <label className="block text-sm font-medium text-sand-700 mb-2">
              POI Type *
            </label>
            <div className="space-y-4">
              {categories.map(category => {
                // Handle custom icons category
                if (category === 'custom') {
                  return (
                    <div key={category}>
                      <h4 className="text-sm font-medium text-sand-600 mb-2 capitalize">
                        Custom Icons
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {customIcons.map(customIcon => (
                          <label
                            key={`custom-${customIcon.id}`}
                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedCustomIcon === customIcon.id
                                ? 'border-spice-500 bg-spice-50'
                                : 'border-sand-200 hover:border-sand-300'
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
                            <div className="w-6 h-6 rounded-full border border-white shadow-sm flex items-center justify-center mr-3 bg-sand-200">
                              <img
                                src={customIcon.image_url}
                                alt={customIcon.name}
                                className="w-4 h-4 object-contain"
                              />
                            </div>
                            
                            <span className="text-sm font-medium text-sand-700 truncate">
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
                    <h4 className="text-sm font-medium text-sand-600 mb-2 capitalize">{category}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {categoryTypes.map(type => {
                        const imageUrl = getDisplayImageUrl(type.icon, customIcons);
                        
                        return (
                          <label
                            key={type.id}
                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedPoiTypeId === type.id && !selectedCustomIcon
                                ? 'border-spice-500 bg-spice-50'
                                : 'border-sand-200 hover:border-sand-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="poiType"
                              value={type.id}
                              checked={selectedPoiTypeId === type.id && !selectedCustomIcon}
                              onChange={(e) => {
                                setSelectedPoiTypeId(e.target.value);
                                setSelectedCustomIcon(null); // Clear custom icon selection
                              }}
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
            </div>
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
            {screenshots.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {screenshots.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeScreenshot(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
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
    </div>
  );
};

export default POIPlacementModal; 