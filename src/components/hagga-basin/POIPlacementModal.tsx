import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  X, 
  MapPin, 
  Camera, 
  Globe, 
  Users, 
  Lock, 
  UserPlus, 
  Search, 
  Link2,
  Upload,
  Eye,
  Plus
} from 'lucide-react';
import type { 
  PixelCoordinates, 
  PoiType, 
  Poi, 
  PrivacyLevel,
  PoiScreenshot 
} from '../../types';
import { formatCoordinates } from '../../lib/coordinates';
import { useAuth } from '../../components/auth/AuthProvider';
import { validateUsername } from '../../lib/auth';
import { uploadImageToStorage, uploadPoiScreenshotOriginal, uploadPoiScreenshotCropped } from '../../lib/imageUpload';
import { extractStorageFilePath } from '../../lib/utils';
import { useScreenshotManager } from '../../hooks/useScreenshotManager';
import CropProcessor from '../shared/CropProcessor';
import UserAvatar from '../common/UserAvatar';

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
  
  // UI state
  const [showDetailedPoiSelection, setShowDetailedPoiSelection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversionStats, setConversionStats] = useState<string | null>(null);

  // Screenshot management - need manager for CropProcessor
  const screenshotManager = useScreenshotManager({
    context: 'poi',
    entityId: '',
    maxFileSize: 5,
    enableCropping: true
  });

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

  // Upload processed screenshots for POI creation (simplified version from POIEditModal)
  const uploadProcessedScreenshots = async (poiId: string): Promise<void> => {
    console.log('[POIPlacement] 🚀 Starting uploadProcessedScreenshots for POI:', poiId);
    
    const processedFiles = screenshotManager.filesToProcess.filter(f => f.isProcessed);
    console.log('[POIPlacement] 📊 All files to process:', screenshotManager.filesToProcess.length);
    console.log('[POIPlacement] ✅ Processed files found:', processedFiles.length);
    console.log('[POIPlacement] 📋 Processed files details:', processedFiles.map(f => ({
      id: f.id,
      name: f.originalFile.name,
      isProcessed: f.isProcessed,
      hasCropData: !!f.cropData,
      originalFileSize: f.originalFile.size,
      displayFileSize: f.displayFile.size
    })));
    
    if (processedFiles.length === 0) {
      console.log('[POIPlacement] ⚠️ No processed files found, skipping screenshot upload');
      return;
    }

    const newScreenshots: PoiScreenshot[] = [];

    for (const file of processedFiles) {
      console.log('[POIPlacement] 🔄 Processing file:', file.originalFile.name);
      
      try {
        const timestamp = Date.now();
        const fileExt = file.originalFile.name.split('.').pop() || 'jpg';
        const baseFileName = `${poiId}_${timestamp}.${fileExt}`;
        console.log('[POIPlacement] 📝 Generated base filename:', baseFileName);
        
        // Step 1: Upload original version to poi_screenshots/
        console.log('[POIPlacement] ⬆️ Step 1: Uploading original file...');
        const originalUpload = await uploadPoiScreenshotOriginal(file.originalFile, baseFileName);
        let originalUrl = originalUpload.url;
        let displayUrl = originalUrl; // Default to original
        console.log('[POIPlacement] ✅ Original upload complete:', originalUrl);
        
        // Step 2: Check if actual cropping was performed (using better approach)
        const wasActuallyCropped = file.wasActuallyCropped;
          
        if (wasActuallyCropped) {
          console.log('[POIPlacement] ✂️ Step 2: Actual cropping detected, uploading cropped version...');
          console.log('[POIPlacement] 📐 Crop data:', file.cropData);
          console.log('[POIPlacement] 🎯 Cropping analysis: wasActuallyCropped =', wasActuallyCropped);
          
          // Upload cropped version
          const croppedUpload = await uploadPoiScreenshotCropped(file.displayFile, baseFileName);
          console.log('[POIPlacement] ✅ Cropped upload complete:', croppedUpload);
          
          // Create screenshot record with cropped version as primary URL
          newScreenshots.push({
            id: `new_${Date.now()}_${Math.random()}`,
            poi_id: poiId,
            url: croppedUpload.url,
            original_url: originalUrl,
            crop_details: file.cropData || null,
            uploaded_by: user?.id || null,
            created_at: new Date().toISOString(),
          });
        } else {
          console.log('[POIPlacement] 📏 Step 2: No cropping performed, using original as display version...');
          console.log('[POIPlacement] 🎯 Cropping analysis: wasActuallyCropped =', wasActuallyCropped);
          
          // Create screenshot record with original as both URLs (no cropping performed)
          newScreenshots.push({
            id: `new_${Date.now()}_${Math.random()}`,
            poi_id: poiId,
            url: originalUrl, // Use original as display URL
            original_url: originalUrl,
            crop_details: null, // No crop details since no cropping
            uploaded_by: user?.id || null,
            created_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('[POIPlacement] ❌ Error uploading screenshot:', error);
        throw new Error(`Failed to upload screenshot: ${file.originalFile.name}`);
      }
    }

    console.log('[POIPlacement] 💾 Saving to unified system - newScreenshots count:', newScreenshots.length);

    // Save images to unified system using managed_images and poi_image_links tables
    if (newScreenshots.length > 0) {
      for (let index = 0; index < newScreenshots.length; index++) {
        const screenshot = newScreenshots[index];
        console.log('[POIPlacement] 🗄️ Step 1: Inserting into managed_images...', {
          original_url: screenshot.original_url,
          processed_url: screenshot.url !== screenshot.original_url ? screenshot.url : null,
          crop_details: screenshot.crop_details,
          image_type: 'poi_screenshot',
          uploaded_by: user?.id
        });
        
        // Step 1: Insert into managed_images table
        const { data: managedImage, error: imageError } = await supabase
          .from('managed_images')
          .insert({
            original_url: screenshot.original_url,
            processed_url: screenshot.url !== screenshot.original_url ? screenshot.url : null,
            crop_details: screenshot.crop_details,
            image_type: 'poi_screenshot',
            uploaded_by: user?.id
          })
          .select()
          .single();

        if (imageError) {
          console.error('[POIPlacement] ❌ Error saving managed image:', imageError);
          throw new Error('Failed to save image to database');
        }

        console.log('[POIPlacement] ✅ Managed image saved:', managedImage);

        // Step 2: Link image to POI in poi_image_links table
        console.log('[POIPlacement] 🔗 Step 2: Linking image to POI...', {
          poi_id: poiId,
          image_id: managedImage.id,
          display_order: index
        });
        
        const { error: linkError } = await supabase
          .from('poi_image_links')
          .insert({
            poi_id: poiId,
            image_id: managedImage.id,
            display_order: index
          });

        if (linkError) {
          console.error('[POIPlacement] ❌ Error linking image to POI:', linkError);
          throw new Error('Failed to link image to POI');
        }

        console.log('[POIPlacement] ✅ Image linked to POI successfully');
      }
      
      console.log('[POIPlacement] 🎉 All screenshots processed and saved successfully!');
    }
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('[POIPlacement] 🚀 Starting POI creation form submission');
    
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
      console.log('[POIPlacement] 📝 Creating POI record...');
      
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

      console.log('[POIPlacement] 📋 POI data to insert:', poiData);

      const { data: poi, error: poiError } = await supabase
        .from('pois')
        .insert([poiData])
        .select(`
          *,
          poi_types (*),
          profiles!pois_created_by_fkey (username),
          poi_image_links (
            managed_images (
              id,
              original_url,
              processed_url,
              crop_details,
              uploaded_by,
              created_at
            )
          )
        `)
        .single();

      if (poiError) {
        console.error('[POIPlacement] ❌ Error creating POI:', poiError);
        throw new Error('Failed to create POI');
      }

      console.log('[POIPlacement] ✅ POI created successfully:', poi);

      // Process screenshots through unified image system
      const processedFiles = screenshotManager.filesToProcess.filter(f => f.isProcessed);
      console.log('[POIPlacement] 🔍 Checking for screenshots to process...', {
        totalFiles: screenshotManager.filesToProcess.length,
        processedFiles: processedFiles.length,
        allFiles: screenshotManager.filesToProcess.map(f => ({
          id: f.id,
          name: f.originalFile.name,
          isProcessed: f.isProcessed
        }))
      });
      
      if (processedFiles.length > 0) {
        console.log(`[POIPlacement] 📸 Processing ${processedFiles.length} screenshots for POI ${poi.id}`);
        
        console.log('[POIPlacement] 🎯 Step 4: Uploading processed screenshots...');
        
        try {
          await uploadProcessedScreenshots(poi.id);
          console.log('[POIPlacement] ✅ Step 4 complete: All screenshots uploaded successfully');
          
          // Step 5: Fetch updated POI data with screenshots and pass to callback
          console.log('[POIPlacement] 🔄 Step 5: Fetching updated POI data with screenshots...');
          
          const { data: updatedPoi, error: fetchError } = await supabase
            .from('pois')
            .select(`
              *,
              poi_types (*),
              profiles!pois_created_by_fkey (username),
              poi_image_links (
                managed_images (
                  id,
                  original_url,
                  processed_url,
                  crop_details,
                  uploaded_by,
                  created_at
                )
              )
            `)
            .eq('id', poi.id)
            .single();

          if (fetchError) {
            console.error('[POIPlacement] ❌ Error fetching updated POI:', fetchError);
            // Continue with original POI data
            console.log('[POIPlacement] 📤 Calling onPoiCreated with original POI data (no screenshots)');
            onPoiCreated(poi);
          } else {
            console.log('[POIPlacement] ✅ Updated POI data fetched:', updatedPoi);
            console.log('[POIPlacement] 🖼️ POI image links:', updatedPoi.poi_image_links);
            // Use the simple approach like GridPage - just pass the POI data
            // Let usePOIManager real-time subscriptions handle the UI updates automatically
            console.log('[POIPlacement] 📤 Calling onPoiCreated with updated POI data (includes screenshot relations)');
            onPoiCreated(updatedPoi);
          }
          
        } catch (error) {
          console.error('[POIPlacement] ❌ Error processing screenshots:', error);
          // Continue with POI creation even if screenshots fail
          onPoiCreated(poi);
        }
      } else {
        console.log('[POIPlacement] ⚠️ No screenshots to process');
        onPoiCreated(poi);
      }

      // Handle sharing if privacy level is shared
      if (privacyLevel === 'shared' && selectedUsers.length > 0) {
        console.log('[POIPlacement] 👥 Setting up POI sharing...');
        
        const newShares = selectedUsers.map(u => ({
          poi_id: poi.id,
          shared_with_user_id: u.id,
          shared_by_user_id: user?.id
        }));
        
        console.log('[POIPlacement] 📤 Sharing data to insert:', newShares);

        
        const { data: shareData, error: shareError } = await supabase
          .from('poi_shares')
          .insert(newShares)
          .select();
          
        if (shareError) {
          console.error('[POIPlacement] ❌ Error saving POI shares:', shareError);
          throw new Error('Failed to save POI sharing settings');
        }
        
        console.log('[POIPlacement] ✅ POI sharing configured successfully');
      }

      console.log('[POIPlacement] 🎉 POI creation complete!');
    } catch (err) {
      console.error('[POIPlacement] ❌ Error in POI creation:', err);
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

          {/* Screenshots - Unified System */}
          <div>
            <label className="block text-sm font-medium text-amber-200 mb-3">
              Screenshots ({screenshotManager.filesToProcess.filter(f => f.isProcessed).length}/5)
            </label>
            
            <div className="space-y-3">
              {/* Screenshots Grid */}
              <div className="flex flex-wrap gap-2">
                {/* New Screenshots from Unified System */}
                {screenshotManager.filesToProcess.map((file) => (
                  <div 
                    key={file.id}
                    className={`w-20 h-20 relative rounded overflow-hidden border ${
                      file.isProcessed ? 'border-green-300' : 'border-slate-600'
                    }`}
                  >
                    <img 
                      src={file.preview} 
                      alt="New Screenshot" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => screenshotManager.removeFile(file.id)}
                      className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-bl-md hover:bg-red-700 transition-colors"
                      title="Remove screenshot"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-1 left-1">
                      <span className={`text-white text-xs px-1 rounded ${
                        file.isProcessed 
                          ? file.wasActuallyCropped 
                            ? 'bg-green-600' 
                            : 'bg-blue-600'
                          : 'bg-orange-600'
                      }`}>
                        {(() => {
                          if (!file.isProcessed) {
                            return 'Processing...';
                          }
                          return file.wasActuallyCropped ? 'New (Cropped)' : 'New (Full)';
                        })()}
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* Upload Button */}
                {screenshotManager.filesToProcess.length < 5 && (
                  <label className="w-20 h-20 border-2 border-dashed border-slate-600 rounded flex flex-col items-center justify-center text-slate-400 hover:text-amber-300 hover:border-amber-500 cursor-pointer transition-colors">
                    <Upload className="w-5 h-5" />
                    <span className="text-xs mt-1">Add</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          screenshotManager.uploadFiles(e.target.files);
                          // Clear the input so same files can be selected again
                          e.target.value = '';
                        }
                      }}
                      multiple
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <p className="text-xs text-slate-400">
                Upload up to 5 screenshots total. Each image must be under 5MB. PNG, JPG formats supported.
              </p>
            </div>
          </div>

          {/* Entity Linking Note */}
          <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-300 mb-2">
              <Link2 className="w-5 h-5" />
              <span className="font-medium">Item / Schematic Linking</span>
            </div>
            <p className="text-blue-200/80 text-sm">
              You can link items and schematics to this POI after it's created. Use the edit button on the POI to access linking features.
            </p>
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

      {/* Unified Crop Processor */}
      <CropProcessor
        screenshotManager={screenshotManager}
      />
    </div>
  );
};

export default POIPlacementModal; 