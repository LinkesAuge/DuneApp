import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, MapPin, Lock, Users, Eye, Image, Upload, Plus, Search, UserPlus } from 'lucide-react';
import type { 
  PixelCoordinates, 
  PoiType, 
 
  Poi, 
  PrivacyLevel,
  PercentageCoordinates
} from '../../types';
import { formatCoordinates } from '../../lib/coordinates';
import { useAuth } from '../auth/AuthProvider';

import ImageCropModal from '../grid/ImageCropModal';
import { PixelCrop } from 'react-image-crop';
import { v4 as uuidv4 } from 'uuid';
import { getScreenshotLabel } from '../../lib/cropUtils';
import UserAvatar from '../common/UserAvatar';
import { uploadPoiScreenshot } from '../../lib/imageUpload';
import { formatConversionStats } from '../../lib/imageUtils';

interface POIPlacementModalProps {
  coordinates: PixelCoordinates;
  poiTypes: PoiType[];

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
    description: 'Shared with specific users (select below)',
    color: 'text-blue-600'
  }
];

// Helper function to determine if an icon is a URL or emoji
const isIconUrl = (icon: string): boolean => {
  return icon.startsWith('http') || icon.startsWith('/') || icon.includes('.');
};

// Helper function to get display image URL for POI icons
const getDisplayImageUrl = (icon: string): string | null => {
  // Check if it's already a URL
  if (isIconUrl(icon)) {
    return icon;
  }
  
  return null;
};

// Define a type for our screenshot objects
interface ScreenshotFile {
  id: string;
  file: File;
  cropDetails: PixelCrop | null; // Store crop data or null if it's a full image
  isNew: boolean; // To differentiate between newly added and existing (if ever needed)
  previewUrl: string; // For displaying the image
}

const POIPlacementModal: React.FC<POIPlacementModalProps> = ({
  coordinates,
  poiTypes,

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
  const [screenshots, setScreenshots] = useState<ScreenshotFile[]>([]);
  
  // UI state
  const [showDetailedPoiSelection, setShowDetailedPoiSelection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversionStats, setConversionStats] = useState<string | null>(null);



  // Screenshot cropping state
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  // Sharing state
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showSharingSection, setShowSharingSection] = useState(false);

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
    }
  }, [selectedPoiTypeId, poiTypes]);



  // Load available users
  useEffect(() => {
    loadAvailableUsers();
  }, []);

  // Show sharing section when privacy level is shared
  useEffect(() => {
    setShowSharingSection(privacyLevel === 'shared');
  }, [privacyLevel]);

  // Clear conversion stats after 5 seconds
  useEffect(() => {
    if (conversionStats) {
      const timer = setTimeout(() => setConversionStats(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [conversionStats]);

  const loadAvailableUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, username, email, display_name, discord_username, custom_avatar_url, discord_avatar_url, use_discord_avatar')
        .neq('id', user?.id || '') // Exclude current user
        .order('username');

      if (error) throw error;
      setAvailableUsers(users || []);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Handle adding a user to share with
  const handleAddUser = (userToAdd: any) => {
    if (!selectedUsers.find(u => u.id === userToAdd.id)) {
      setSelectedUsers(prev => [...prev, userToAdd]);
      // Automatically set privacy to shared when users are selected
      if (privacyLevel !== 'shared') {
        setPrivacyLevel('shared');
      }
    }
  };

  // Handle removing a user from sharing
  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
    // If no users selected, change back to private
    const remainingUsers = selectedUsers.filter(u => u.id !== userId);
    if (remainingUsers.length === 0 && privacyLevel === 'shared') {
      setPrivacyLevel('private');
    }
  };

  // Filter available users based on search and already selected
  const filteredAvailableUsers = availableUsers.filter(user => {
    const matchesSearch = !searchTerm || 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.discord_username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const notAlreadySelected = !selectedUsers.find(su => su.id === user.id);
    
    return matchesSearch && notAlreadySelected;
  });



  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Check total limit
    if (screenshots.length + pendingFiles.length + files.length > 5) {
      setError(`Cannot add ${files.length} file(s). Maximum 5 screenshots total. Currently have ${screenshots.length + pendingFiles.length}.`);
      event.target.value = '';
      return;
    }

    // Validate all files first
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        setError(`File "${file.name}" is too large. Maximum 10MB allowed.`);
        event.target.value = '';
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError(`File "${file.name}" is not an image. Please select image files only.`);
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

  const handleCloseCropModal = () => {
    if (tempImageUrl) URL.revokeObjectURL(tempImageUrl);
    setTempImageFile(null);
    setTempImageUrl(null);
    setShowCropModal(false);
  };

  const processNextFile = () => {
    if (pendingFiles.length === 0) return;
    
    const nextFile = pendingFiles[0];
    setTempImageFile(nextFile);
    setTempImageUrl(URL.createObjectURL(nextFile));
    setShowCropModal(true);
  };

  const handleCropComplete = async (croppedImageBlob: Blob, cropData: PixelCrop, isFullImage: boolean) => {
    if (!tempImageFile) return;

    const processedFile = new File([croppedImageBlob], tempImageFile.name, {
      type: 'image/jpeg',
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

  const removeScreenshot = (idToRemove: string) => {
    setScreenshots(prev => prev.filter(s => {
      if (s.id === idToRemove) {
        URL.revokeObjectURL(s.previewUrl); // Clean up object URL
        return false;
      }
      return true;
    }));
  };

  const savePoi = async () => {
    // ... (validation logic for name, type, etc.)
    setIsSubmitting(true);
    // ... (existing user ID check)

    const uploadedScreenshotPaths: { url: string; crop_details: PixelCrop | null; original_name: string; }[] = [];

    for (const screenshot of screenshots) {
      if (screenshot.isNew) { // Only upload new files
        const fileName = `${user.id}/${uuidv4()}-${screenshot.file.name}`;
        const filePath = `poi-screenshots/${fileName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('screenshots')
          .upload(filePath, screenshot.file, { upsert: false });

        if (uploadError) {
          // ... (error handling)
          setIsSubmitting(false);
          return;
        }
        
        const publicURL = supabase.storage.from('screenshots').getPublicUrl(filePath).data.publicUrl;
        uploadedScreenshotPaths.push({ 
          url: publicURL, 
          crop_details: screenshot.cropDetails, // This now correctly reflects full/cropped
          original_name: screenshot.file.name 
        });
      }
    }

    const poiDataToInsert = {
      // ... (other POI fields)
      screenshots: uploadedScreenshotPaths.length > 0 ? uploadedScreenshotPaths : null,
      // ...
    };

    // ... (Supabase insert logic)
    // ... (rest of the function, success/error handling, reset state)
    setScreenshots([]); // Clear screenshots after successful save
    // ...
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

    // Validate shared privacy level workflow
    if (privacyLevel === 'shared' && selectedUsers.length === 0) {
      setError('Please select users to share with or change privacy level to Private.');
      return;
    }

    // Use the selected POI type directly
    let finalPoiTypeId = selectedPoiTypeId;

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
        coordinates_x: Math.round(coordinates.x),
        coordinates_y: Math.round(coordinates.y),
        privacy_level: privacyLevel,
        grid_square_id: mapType === 'deep_desert' ? gridSquareId : null
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
      const totalScreenshots = screenshots.length;
      
      if (totalScreenshots > 0) {
        try {
          // Upload screenshots one by one with WebP conversion
          for (const screenshot of screenshots) {
            if (screenshot.isNew) { // Only upload new files
              const fileName = `${user.id}/${uuidv4()}-${screenshot.file.name}`;
              
              // Upload with WebP conversion
              const uploadResult = await uploadPoiScreenshot(screenshot.file, fileName);
              
              // Show conversion feedback for the first upload
              if (finalScreenshots.length === 0 && uploadResult.compressionRatio) {
                const stats = formatConversionStats(uploadResult);
                setConversionStats(stats);
              }
              
              finalScreenshots.push({
                id: `${poi.id}_${Date.now()}_${finalScreenshots.length}`,
                url: uploadResult.url,
                uploaded_by: user.id,
                upload_date: new Date().toISOString()
              });
            }
          }

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

      // Handle sharing if privacy level is shared
      if (privacyLevel === 'shared' && selectedUsers.length > 0) {
        console.log('[POIPlacementModal] Saving shares for POI:', poi.id, 'with users:', selectedUsers.map(u => u.id));
        
        const newShares = selectedUsers.map(u => ({
          poi_id: poi.id,
          shared_with_user_id: u.id,
          shared_by_user_id: user?.id
        }));
        
        console.log('[POIPlacementModal] Share data to insert:', newShares);
        
        const { data: shareData, error: shareError } = await supabase
          .from('poi_shares')
          .insert(newShares)
          .select();
          
        if (shareError) {
          console.error('Error saving POI shares:', shareError);
          throw new Error('Failed to save POI sharing settings');
        }
        
        console.log('[POIPlacementModal] Successfully saved shares:', shareData);
      } else if (privacyLevel === 'shared') {
        console.log('[POIPlacementModal] Privacy is shared but no users selected');
      } else {
        console.log('[POIPlacementModal] Privacy level is:', privacyLevel, 'not saving shares');
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
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center">
            <MapPin className="w-6 h-6 text-amber-400 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-amber-200" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                Add POI to {mapType === 'deep_desert' ? 'Deep Desert Grid' : 'Hagga Basin'}
              </h3>
              <div className="flex items-center gap-2">
                <p className="text-sm text-slate-400">
                  Coordinates: {formatCoordinates(coordinates.x, coordinates.y, mapType)}
                </p>
                {mapType === 'deep_desert' && onRequestPlacement && (
                  <button
                    type="button"
                    onClick={onRequestPlacement}
                    className="text-xs bg-amber-900/30 text-amber-300 px-2 py-1 rounded hover:bg-amber-800/40 transition-colors flex items-center gap-1"
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
            className="text-slate-400 hover:text-amber-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* POI Type Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="poiTypeSelect" className="block text-sm font-medium text-amber-200">
                POI Type *
              </label>
              <button
                type="button"
                onClick={() => {/* Custom POI type creation removed */}}
                className="text-sm text-amber-400 hover:text-amber-300 font-medium flex items-center"
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
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-amber-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 mb-3"
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

            </select>

            {/* Show More Details Toggle */}
            <button
              type="button"
              onClick={() => setShowDetailedPoiSelection(!showDetailedPoiSelection)}
              className="text-sm text-amber-400 hover:text-amber-300 font-medium underline"
            >
              {showDetailedPoiSelection ? 'Hide details' : 'Show more details'}
            </button>

            {/* Detailed Visual Selection */}
            {showDetailedPoiSelection && (
              <div className="mt-4 space-y-4 border border-slate-600 rounded-lg p-4 bg-slate-800/50">
                {categories.map(category => {
                  const categoryTypes = poiTypes.filter(type => type.category === category);
                  
                  return (
                    <div key={category}>
                      <h4 className="text-sm font-medium text-amber-300 mb-2 capitalize">
                        {category}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {categoryTypes.map(poiType => {
                          const imageUrl = getDisplayImageUrl(poiType.icon);
                          
                          return (
                            <label
                              key={poiType.id}
                              className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedPoiTypeId === poiType.id
                                  ? 'border-amber-500 bg-amber-900/20'
                                  : 'border-slate-600 hover:border-slate-500 bg-slate-800'
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
                                className="w-6 h-6 rounded-full border border-slate-500 flex items-center justify-center mr-3"
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
                                    className="w-4 h-4 object-contain"
                                  />
                                ) : (
                                  <span className="text-xs text-white">{poiType.icon}</span>
                                )}
                              </div>
                              
                              <span className="text-sm font-medium text-amber-200">{poiType.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}


              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-amber-200 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter POI title..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-amber-100 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-amber-200 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter POI description..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-amber-100 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Privacy Level */}
          <div>
            <label className="block text-sm font-medium text-amber-200 mb-2">
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
                        ? 'border-amber-500 bg-amber-900/20'
                        : 'border-slate-600 hover:border-slate-500 bg-slate-800'
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
                      <div className="font-medium text-amber-200">{option.label}</div>
                      <div className="text-sm text-slate-400">{option.description}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Sharing Section */}
          {showSharingSection && (
            <div>
              <label className="block text-sm font-medium text-amber-200 mb-3">
                Share with Users
              </label>
              
              {/* Currently Selected Users */}
              {selectedUsers.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-amber-200 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Selected Users ({selectedUsers.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedUsers.map(selectedUser => (
                      <div key={selectedUser.id} className="bg-slate-800 border border-slate-600 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              user={selectedUser}
                              size="sm"
                              className="w-8 h-8"
                            />
                            <div>
                              <p className="text-amber-200 font-medium"
                                 style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                                {selectedUser.display_name || selectedUser.username}
                              </p>
                              <p className="text-slate-400 text-xs">{selectedUser.email}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveUser(selectedUser.id)}
                            className="p-1.5 text-red-300 hover:text-red-100 hover:bg-slate-700/50 rounded transition-colors"
                            title="Remove access"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Users Section */}
              <div>
                <h4 className="text-sm font-medium text-amber-200 mb-3 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add Users
                </h4>
                
                {/* Search Input */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                  />
                </div>

                {/* Available Users */}
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {loadingUsers ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-4"></div>
                      <p className="text-slate-400">Loading users...</p>
                    </div>
                  ) : filteredAvailableUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-300 mb-2"
                         style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                        {searchTerm ? 'No users found matching your search' : 'No more users to share with'}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {searchTerm ? 'Try adjusting your search terms' : 'All available users have already been selected'}
                      </p>
                    </div>
                  ) : (
                    filteredAvailableUsers.map(availableUser => (
                      <div key={availableUser.id} className="bg-slate-800 border border-slate-600 rounded-lg p-3 hover:border-slate-500 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              user={availableUser}
                              size="sm"
                              className="w-8 h-8"
                            />
                            <div>
                              <p className="text-amber-200 font-medium"
                                 style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                                {availableUser.display_name || availableUser.username}
                              </p>
                              <p className="text-slate-400 text-xs">{availableUser.email}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddUser(availableUser)}
                            className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-2"
                            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Screenshots - Matching Edit Modal Style */}
          <div>
            <label className="block text-sm font-medium text-amber-200 mb-3">
              Screenshots ({screenshots.length + pendingFiles.length}/5)
            </label>
            <div className="space-y-3">
              {/* Screenshots Grid - Matching POI Edit Modal */}
              <div className="flex flex-wrap gap-2">
                {/* Uploaded Screenshots */}
                {screenshots.map((sFile) => (
                  <div 
                    key={sFile.id}
                    className="w-20 h-20 relative rounded overflow-hidden border border-slate-600"
                  >
                    <img 
                      src={sFile.previewUrl} 
                      alt="POI Screenshot" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeScreenshot(sFile.id)}
                      className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 flex items-center justify-center hover:bg-red-700 transition-colors"
                      title="Remove screenshot"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {/* Screenshot label */}
                    <div className="absolute bottom-1 left-1">
                      {(() => {
                        const label = getScreenshotLabel(true, sFile.cropDetails);
                        return (
                          <span className={label.className}>{label.text}</span>
                        );
                      })()}
                    </div>
                  </div>
                ))}

                {/* Upload Button - Matching Edit Modal */}
                {(screenshots.length + pendingFiles.length) < 5 && (
                  <label className="w-20 h-20 border-2 border-dashed border-slate-600 rounded flex flex-col items-center justify-center text-slate-400 hover:text-amber-300 hover:border-amber-500 cursor-pointer transition-colors">
                    <Upload className="w-5 h-5" />
                    <span className="text-xs mt-1">Add</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      multiple
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <p className="text-xs text-slate-400">
                Upload up to 5 screenshots total. Each image must be under 10MB. PNG, JPG formats supported.
              </p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Conversion Stats Display */}
          {conversionStats && (
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-3">
              <p className="text-sm text-green-300">{conversionStats}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-700 hover:bg-slate-600 text-amber-300 border border-slate-600 hover:border-slate-500 px-4 py-2 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-amber-600 hover:bg-amber-500 text-slate-900 border border-amber-700 hover:border-amber-600 px-4 py-2 rounded-lg transition-colors flex items-center font-medium"
              disabled={isSubmitting || !title.trim() || !selectedPoiTypeId}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900 mr-2"></div>
                  Creating POI...
                </div>
              ) : (
                'Create POI'
              )}
            </button>
          </div>
        </form>
      </div>



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

export default POIPlacementModal; 