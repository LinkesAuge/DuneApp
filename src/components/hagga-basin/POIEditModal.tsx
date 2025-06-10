import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { X, MapPin, Lock, Users, Eye, Save, Upload, Trash2, Target, Edit, Plus, FileText, Tag, EyeOff, Share2, Globe, AlertTriangle, Settings, Image as ImageIcon, Search, UserPlus } from 'lucide-react';
import type { 
  Poi, 
  PoiType, 
 
  PrivacyLevel, 
  PoiScreenshot
} from '../../types';
import { formatCoordinates } from '../../lib/coordinates';
import { useAuth } from '../auth/AuthProvider';
// Import ImageCropModal for unified system
import ImageCropModal from '../grid/ImageCropModal';
import { PixelCrop, Crop } from 'react-image-crop';
import CommentsList from '../comments/CommentsList';
import { getScreenshotLabel } from '../../lib/cropUtils';
import UserAvatar from '../common/UserAvatar';
import { uploadPoiScreenshotOriginal, uploadPoiScreenshotCropped, deleteOldCroppedVersion, deleteImage } from '../../lib/imageUpload';
import { formatConversionStats } from '../../lib/imageUtils';
import LinkedEntitiesSection from '../poi-linking/LinkedEntitiesSection';
// Add unified system imports
import { useScreenshotManager } from '../../hooks/useScreenshotManager';
import ScreenshotUploader from '../shared/ScreenshotUploader';

interface POIEditModalProps {
  poi: Poi;
  poiTypes: PoiType[];

  onPoiUpdated: (poi: Poi) => void;
  onPoiDataChanged?: (poi: Poi) => void; // For updates that shouldn't close modal
  onLinksUpdated?: () => void; // For entity links updates that should refresh map markers
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

/**
 * Extract storage file path from a Supabase storage URL
 * Updated to handle multiple folder structures for proper file deletion
 */
const extractStorageFilePathFromUrl = (url: string): string | null => {
  try {
    // Handle both full URLs and relative paths
    const patterns = [
      // New simplified structure (current)
      '/storage/v1/object/public/screenshots/poi_screenshots/',
      '/storage/v1/object/public/screenshots/poi_cropped/',
      // Legacy structures (for backward compatibility)
      '/storage/v1/object/public/screenshots/poi_screenshots_original/',
      '/storage/v1/object/public/screenshots/poi_screenshots_cropped/',
      '/storage/v1/object/public/screenshots/poi_originals/',
      '/storage/v1/object/public/screenshots/comment_screenshots_original/',
      '/storage/v1/object/public/screenshots/comment_screenshots_cropped/',
      '/storage/v1/object/public/screenshots/comment-screenshots/',
      // Generic screenshots
      '/storage/v1/object/public/screenshots/'
    ];

    for (const pattern of patterns) {
      if (url.includes(pattern)) {
        const parts = url.split(pattern);
        if (parts.length > 1) {
          // Get everything after '/screenshots/' from the pattern
          const afterScreenshots = pattern.split('/screenshots/')[1];
          if (afterScreenshots) {
            // Remove trailing slash and return folder + filename
            const folderName = afterScreenshots.replace(/\/$/, '');
        
            return `${folderName}/${parts[1]}`;
          } else {
            return parts[1];
          }
        }
      }
    }

    // Handle relative paths
    const relativePatterns = [
      // New simplified structure (current)
      '/screenshots/poi_screenshots/',
      '/screenshots/poi_cropped/',
      // Legacy structures (for backward compatibility)
      '/screenshots/poi_screenshots_original/',
      '/screenshots/poi_screenshots_cropped/',
      '/screenshots/poi_originals/',
      '/screenshots/comment_screenshots_original/',
      '/screenshots/comment_screenshots_cropped/',
      '/screenshots/comment-screenshots/',
      '/screenshots/'
    ];

    for (const pattern of relativePatterns) {
      if (url.includes(pattern)) {
        const parts = url.split(pattern);
        if (parts.length > 1) {
          const folderName = pattern.split('/').filter(p => p).pop() || '';
          return folderName ? `${folderName}/${parts[1]}` : parts[1];
        }
      }
    }

    // Just filename
    if (!url.includes('/') && !url.includes('http')) {
      return url;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting storage file path:', error);
    return null;
  }
};

const POIEditModal: React.FC<POIEditModalProps> = ({
  poi,
  poiTypes,

  onPoiUpdated,
  onPoiDataChanged,
  onLinksUpdated,
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
  
  // Unified screenshot system for new uploads
  const screenshotManager = useScreenshotManager({
    context: 'poi',
    entityId: poi.id,
    maxFileSize: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    enableCropping: true
  });
  
  // Keep track of existing screenshots for deletion
  const [existingScreenshots, setExistingScreenshots] = useState<PoiScreenshot[]>(
    poi.screenshots || [] 
  );

  const [screenshotsBeingEdited, setScreenshotsBeingEdited] = useState<Map<string, PoiScreenshot>>(new Map());
  
  // No additional screenshot state needed - using unified screenshotManager
  
  // UI state
  const [showDetailedPoiSelection, setShowDetailedPoiSelection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversionStats, setConversionStats] = useState<string | null>(null);
  
  // Sharing state
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showSharingSection, setShowSharingSection] = useState(false);

  // Check permissions
  const canEdit = user && (user.id === poi.created_by || user.role === 'admin' || user.role === 'editor');

  // Get categories for organizing POI types
  const categories = [...new Set(poiTypes.map(type => type.category))];

  // Initialize screenshots from POI data
  useEffect(() => {
    setExistingScreenshots(poi.screenshots || []);
  }, [poi.screenshots]);

  // Load available users and current shares
  useEffect(() => {
    loadAvailableUsers();
    loadCurrentShares();
  }, [poi.id, poi.privacy_level]); // Re-run when POI changes or privacy level changes

  // Initialize sharing section visibility and load shares when modal opens
  useEffect(() => {
    if (poi.privacy_level === 'shared') {
      setShowSharingSection(true);
      // Ensure shares are loaded when modal opens with shared POI
      loadCurrentShares();
    } else {
      setShowSharingSection(false);
      setSelectedUsers([]); // Clear selected users for non-shared POIs
    }
  }, []); // Run only once when modal opens

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

  const loadCurrentShares = async () => {
    // Reset selected users first
    setSelectedUsers([]);
    
    if (poi.privacy_level !== 'shared') {
      return;
    }
    try {
      // First get the poi_shares
      const { data: shares, error: sharesError } = await supabase
        .from('poi_shares')
        .select('*')
        .eq('poi_id', poi.id);

      if (sharesError) throw sharesError;
      if (!shares || shares.length === 0) {
        return;
      }

      // Get the user IDs from shares
      const userIds = shares.map(share => share.shared_with_user_id);
      
      // Separately fetch the user profiles
      const { data: userProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, email, display_name, discord_username, custom_avatar_url, discord_avatar_url, use_discord_avatar')
        .in('id', userIds);

      if (profilesError) throw profilesError;
      setSelectedUsers(userProfiles || []);
    } catch (err) {
      console.error('Error loading current shares:', err);
    }
  };

  // Handle position change
  const handlePositionChange = () => {
    if (onPositionChange) {
      onPositionChange(poi);
      onClose();
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

  // Handle existing screenshot deletion
  const handleDeleteExistingScreenshot = async (screenshotId: string) => {
    const screenshotToDelete = existingScreenshots.find(s => s.id === screenshotId);
    if (!screenshotToDelete) {
      setError('Screenshot not found for deletion.');
      return;
    }

    try {
      
      // Delete from storage first (both original and processed if they exist)
      if (screenshotToDelete.original_url) {
        const originalPath = extractStorageFilePathFromUrl(screenshotToDelete.original_url);
        if (originalPath) {
          await deleteImage('screenshots', originalPath);
        }
      }
      
      // Check for processed version (cropped file)
      // Use processed_url if available, otherwise use url if it's different from original_url
      const processedUrl = screenshotToDelete.processed_url || 
                          (screenshotToDelete.url !== screenshotToDelete.original_url ? screenshotToDelete.url : null);
      
      if (processedUrl && processedUrl !== screenshotToDelete.original_url) {
        const processedPath = extractStorageFilePathFromUrl(processedUrl);
        if (processedPath) {
          await deleteImage('screenshots', processedPath);
        }
      }
      
      // Delete from database tables
      // First delete from poi_image_links
      const { error: linkError } = await supabase
        .from('poi_image_links')
        .delete()
        .eq('image_id', screenshotId);
      
      if (linkError) {
        console.error('[POIEdit] ❌ Error deleting poi_image_links:', linkError);
        throw new Error('Failed to remove image link');
      }
      
      // Then delete from managed_images (this will cascade)
      const { error: imageError } = await supabase
        .from('managed_images')
        .delete()
        .eq('id', screenshotId);
      
      if (imageError) {
        console.error('[POIEdit] ❌ Error deleting managed_images:', imageError);
        throw new Error('Failed to delete image record');
      }
      
      // Remove from UI
    setExistingScreenshots(prev => prev.filter(s => s.id !== screenshotId));
    } catch (error: any) {
      console.error('[POIEdit] ❌ Error deleting screenshot:', error);
      setError(error.message || 'Failed to delete screenshot. Please try again.');
    }
  };

  // Handle screenshot upload using unified system
  const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Use unified system for file processing
    screenshotManager.uploadFiles(files);

    // Clear the input value to allow re-upload of the same file
    event.target.value = '';
  };

  // Calculate total screenshot count using unified system
  const processedNewScreenshots = screenshotManager.filesToProcess.filter(f => f.isProcessed);
  const totalScreenshotCount = existingScreenshots.length + processedNewScreenshots.length;

  // Helper function to download existing screenshot and convert to File for editing
  const downloadScreenshotAsFile = async (screenshot: PoiScreenshot): Promise<File> => {
    const imageUrl = screenshot.original_url || screenshot.url;
    if (!imageUrl) {
      throw new Error('No image URL available for this screenshot.');
    }

    try {
      // Download the image
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // Create a File object with proper naming
      const fileName = `existing_screenshot_${screenshot.id}_${Date.now()}.jpg`;
      const file = new File([blob], fileName, { 
        type: blob.type || 'image/jpeg',
        lastModified: Date.now() 
      });

      return file;
    } catch (error) {
      console.error('Error downloading screenshot:', error);
      throw new Error('Failed to download screenshot for editing. Please try again.');
    }
  };

  // Handle editing existing screenshot using unified system
  const handleEditExistingScreenshot = async (screenshotId: string) => {
    const screenshotToEdit = existingScreenshots.find(s => s.id === screenshotId);
    if (!screenshotToEdit) {
      setError('Screenshot not found for editing.');
      return;
    }

    try {
      setError(null);
      
      // Download and convert existing screenshot to File
      const file = await downloadScreenshotAsFile(screenshotToEdit);
      
      // Add editing metadata to the file object
      (file as any).isEdit = true;
      (file as any).editingScreenshotId = screenshotId;
      (file as any).managedImageId = screenshotId; // In unified system, screenshot ID is managed_images.id
      (file as any).originalScreenshotUrl = screenshotToEdit.original_url || screenshotToEdit.url; // Use original_url for re-cropping
      (file as any).originalCropDetails = screenshotToEdit.crop_details;
      
      // Track that this screenshot is being edited (for restoration if cancelled)
      setScreenshotsBeingEdited(prev => new Map(prev.set(screenshotId, screenshotToEdit)));
      
      // Add to unified system for processing - this will trigger crop modal
      screenshotManager.uploadFiles([file]);
      
      // Remove from existing screenshots temporarily (will be restored if user cancels)
      setExistingScreenshots(prev => prev.filter(s => s.id !== screenshotId));
      
    } catch (error: any) {
      console.error('Error starting screenshot edit:', error);
      setError(error.message || 'Failed to start editing screenshot. Please try again.');
    }
  };

  // Remove new screenshot from unified system
  const removeNewScreenshot = (fileId: string) => {
    const fileToRemove = screenshotManager.filesToProcess.find(f => f.id === fileId);
    
    // If this was an edit that's being cancelled, restore the original screenshot FIRST
    if (fileToRemove) {
      const fileWithMetadata = fileToRemove.originalFile as any;
      if (fileWithMetadata?.isEdit && fileWithMetadata?.editingScreenshotId) {
        const originalScreenshot = screenshotsBeingEdited.get(fileWithMetadata.editingScreenshotId);
        if (originalScreenshot) {
          // Restore the original screenshot
          setExistingScreenshots(prev => {
            // Make sure we don't duplicate
            const filtered = prev.filter(s => s.id !== originalScreenshot.id);
            return [...filtered, originalScreenshot];
          });
          setScreenshotsBeingEdited(prev => {
            const newMap = new Map(prev);
            newMap.delete(fileWithMetadata.editingScreenshotId);
            return newMap;
          });
        }
      }
    }
    
    // Now cancel the crop (which removes from queue)
    screenshotManager.cancelCrop(fileId);
  };

  // Upload screenshots using unified system (handles both new and edited)
  const uploadProcessedScreenshots = async (poiId: string): Promise<void> => {
    const processedFiles = screenshotManager.filesToProcess.filter(f => f.isProcessed);
    if (processedFiles.length === 0) {
      return;
    }

    for (let index = 0; index < processedFiles.length; index++) {
      const file = processedFiles[index];
      try {
        // Check if this is an edit of an existing screenshot
        const fileWithMetadata = file.originalFile as any;
        const isEdit = fileWithMetadata?.isEdit;
        
        if (isEdit) {
          // EDITING EXISTING SCREENSHOT - Update managed_images record
          const wasActuallyCropped = file.wasActuallyCropped;
          const existingOriginalUrl = fileWithMetadata.originalScreenshotUrl;
          
          let processedUrl: string | null = null;
          
          if (wasActuallyCropped) {
            // User wants new crop - upload cropped version
            const timestamp = Date.now();
            const fileExt = file.originalFile.name.split('.').pop() || 'jpg';
            const baseFileName = `${poiId}_${timestamp}.${fileExt}`;
            
            await deleteOldCroppedVersion(existingOriginalUrl);
            const croppedUpload = await uploadPoiScreenshotCropped(file.displayFile, baseFileName);
            processedUrl = croppedUpload.url;
          } else {
            // User wants full image - remove any existing cropped version
            await deleteOldCroppedVersion(existingOriginalUrl);
            processedUrl = null; // No processed version, use original
          }
          
          // Update the managed_images record
          const { error: updateError } = await supabase
            .from('managed_images')
            .update({
              processed_url: processedUrl,
              crop_details: wasActuallyCropped ? (file.cropData || null) : null
              // updated_at is automatically handled by database trigger
            })
            .eq('id', fileWithMetadata.managedImageId);

          if (updateError) {
            console.error('[POIEdit] ❌ Error updating managed image:', updateError);
            throw new Error('Failed to update existing screenshot');
          }
        } else {
          // NEW SCREENSHOT UPLOAD - Same as POIPlacementModal
          const timestamp = Date.now();
          const fileExt = file.originalFile.name.split('.').pop() || 'jpg';
          const baseFileName = `${poiId}_${timestamp}.${fileExt}`;
          
          // Step 1: Upload original version to poi_screenshots/
          const originalUpload = await uploadPoiScreenshotOriginal(file.originalFile, baseFileName);
          let originalUrl = originalUpload.url;
          // Step 2: Check if actual cropping was performed
          const wasActuallyCropped = file.wasActuallyCropped;
          let processedUrl: string | null = null;
          
          if (wasActuallyCropped) {
            const croppedUpload = await uploadPoiScreenshotCropped(file.displayFile, baseFileName);
            processedUrl = croppedUpload.url;
          } else {
          }
          
          // Step 3: Insert into managed_images table
          
          const { data: managedImage, error: imageError } = await supabase
            .from('managed_images')
            .insert({
              original_url: originalUrl,
              processed_url: processedUrl,
              crop_details: wasActuallyCropped ? (file.cropData || null) : null,
              image_type: 'poi_screenshot',
              uploaded_by: user?.id
            })
            .select()
            .single();

          if (imageError) {
            console.error('[POIEdit] ❌ Error saving managed image:', imageError);
            throw new Error('Failed to save image to database');
          }
          // Step 4: Link image to POI in poi_image_links table
          const existingLinksCount = await supabase
            .from('poi_image_links')
            .select('display_order')
            .eq('poi_id', poiId)
            .order('display_order', { ascending: false })
            .limit(1);
          
          const nextDisplayOrder = (existingLinksCount.data?.[0]?.display_order ?? -1) + 1;
          const { error: linkError } = await supabase
            .from('poi_image_links')
            .insert({
              poi_id: poiId,
              image_id: managedImage.id,
              display_order: nextDisplayOrder
            });

          if (linkError) {
            console.error('[POIEdit] ❌ Error linking image to POI:', linkError);
            throw new Error('Failed to link image to POI');
          }
        }
      } catch (error) {
        console.error('[POIEdit] ❌ Error uploading screenshot:', error);
        throw new Error(`Failed to upload screenshot: ${file.originalFile.name}`);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canEdit) {
      setError('You do not have permission to edit this POI.');
      return;
    }

    // Validate shared privacy level workflow
    if (privacyLevel === 'shared' && selectedUsers.length === 0) {
      setError('Please select users to share with or change privacy level to Private.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    let updatedPoiData: Partial<Poi> = {
      title,
      description,
      poi_type_id: selectedPoiTypeId,
      privacy_level: privacyLevel,
      coordinates_x: coordinatesX,
      coordinates_y: coordinatesY,
      updated_by: user!.id, // Set who is making the edit
    };

    try {
      // 1. Upload new/edited screenshots using unified system
      await uploadProcessedScreenshots(poi.id);

      // 4. Update the POI record in the database (excluding screenshots)
      const { data: updatedPoi, error: updateError } = await supabase
        .from('pois')
        .update(updatedPoiData)
        .eq('id', poi.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // 5. Handle sharing updates
      if (privacyLevel === 'shared') {
        // Get current shares
        const { data: currentShares } = await supabase
          .from('poi_shares')
          .select('shared_with_user_id')
          .eq('poi_id', poi.id);

        const currentUserIds = new Set(currentShares?.map(s => s.shared_with_user_id) || []);
        const newUserIds = new Set(selectedUsers.map(u => u.id));

        // Remove shares that are no longer selected
        const toRemove = [...currentUserIds].filter(id => !newUserIds.has(id));
        if (toRemove.length > 0) {
          const { error: shareDeleteError } = await supabase
            .from('poi_shares')
            .delete()
            .eq('poi_id', poi.id)
            .in('shared_with_user_id', toRemove);
            
          if (shareDeleteError) {
            console.error('Error removing shares:', shareDeleteError);
            throw new Error('Failed to update POI sharing settings');
          }
        }

        // Add new shares
        const toAdd = [...newUserIds].filter(id => !currentUserIds.has(id));
        if (toAdd.length > 0) {
          const newShares = toAdd.map(userId => ({
            poi_id: poi.id,
            shared_with_user_id: userId,
            shared_by_user_id: user!.id
          }));
          
          const { error: shareInsertError } = await supabase
            .from('poi_shares')
            .insert(newShares);
            
          if (shareInsertError) {
            console.error('Error inserting new shares:', shareInsertError);
            throw new Error('Failed to save POI sharing settings');
          }
        }
      } else {
        // If privacy level changed away from shared, remove all shares
        const { error: shareDeleteAllError } = await supabase
          .from('poi_shares')
          .delete()
          .eq('poi_id', poi.id);
          
        if (shareDeleteAllError) {
          console.error('Error removing all shares:', shareDeleteAllError);
          throw new Error('Failed to update POI privacy settings');
        }
      }

      // 3. Fetch updated POI data with screenshots from unified system
      const { data: updatedPoiWithScreenshots, error: fetchError } = await supabase
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
        console.error('[POIEdit] ❌ Error fetching updated POI:', fetchError);
        // Continue with basic updated POI data
      }

      // 3. Clear processing queues and notify parent
      screenshotManager.clearProcessingQueue();
      setScreenshotsBeingEdited(new Map());
      
      // Use updated POI data with screenshots if available, otherwise use basic updated data
      const finalPoiData = updatedPoiWithScreenshots || updatedPoi;
      onPoiUpdated(finalPoiData);
      onClose();
    } catch (err: any) {
      console.error('Error submitting POI edits:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canEdit) {
    return (
      <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full">
          <div className="p-6 text-center">
            <h2 className="text-xl font-bold text-amber-200 mb-4">Access Denied</h2>
            <p className="text-slate-300 mb-4">
              You do not have permission to edit this POI.
            </p>
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-600 hover:border-slate-500 px-4 py-2 rounded-lg w-full transition-colors"
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
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapPin className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-xl font-bold text-amber-200" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>Edit POI</h2>
              <p className="text-sm text-slate-400">
                Update POI details and position
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-amber-300 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          <div className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Conversion Stats Display */}
            {conversionStats && (
              <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                <p className="text-green-300 text-sm">{conversionStats}</p>
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-amber-200 mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-amber-100 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="Enter POI title..."
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-amber-200 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-amber-100 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 h-24 resize-none"
                placeholder="Describe this location..."
              />
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-amber-200 mb-2">
                Position
              </label>
              <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-amber-300">
                    <div className="font-medium">Current Position:</div>
                    <div className="text-slate-400">
                      X: {coordinatesX.toFixed(0)}, Y: {coordinatesY.toFixed(0)}
                    </div>
                  </div>
                  {onPositionChange && (
                    <button
                      type="button"
                      onClick={handlePositionChange}
                      className="bg-slate-700 hover:bg-slate-600 text-amber-300 border border-slate-500 hover:border-amber-500 px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center"
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
              <label htmlFor="poiTypeSelect" className="block text-sm font-medium text-amber-200 mb-2">
                POI Type *
              </label>
              
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
                                  className="w-8 h-8 rounded-full border border-slate-500 shadow-sm flex items-center justify-center flex-shrink-0"
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
                                
                                <span className="text-sm font-medium text-amber-200 truncate">
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
              )}
            </div>

            {/* Privacy Level */}
            <div>
              <label className="block text-sm font-medium text-amber-200 mb-3">
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
                          ? 'border-amber-500 bg-amber-900/20'
                          : 'border-slate-600 hover:border-slate-500 bg-slate-800'
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
                        <div className="font-medium text-sm text-amber-200">{option.label}</div>
                        <div className="text-xs text-slate-400">{option.description}</div>
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

            {/* Screenshots Management */}
            <div>
              <label className="block text-sm font-medium text-amber-200 mb-3">
                Screenshots ({totalScreenshotCount}/5)
              </label>
              <div className="space-y-3">
                {/* Screenshots Grid */}
                <div className="flex flex-wrap gap-2">
                  {/* Existing Screenshots */}
                  {existingScreenshots.map(screenshot => (
                    <div 
                      key={screenshot.id}
                      className="w-20 h-20 relative rounded overflow-hidden border border-slate-600"
                    >
                      <img 
                        src={screenshot.url} 
                        alt="POI Screenshot" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-0 right-0 flex">
                        <button
                          type="button"
                          onClick={() => handleEditExistingScreenshot(screenshot.id)}
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
                      {/* Screenshot label */}
                      <div className="absolute bottom-1 left-1">
                        {(() => {
                          const label = getScreenshotLabel(false, screenshot.crop_details);
                          return (
                            <span className={label.className}>{label.text}</span>
                          );
                        })()}
                      </div>
                    </div>
                  ))}

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
                        onClick={() => removeNewScreenshot(file.id)}
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
                            const fileWithMetadata = file.originalFile as any;
                            const isEdit = fileWithMetadata?.isEdit;
                            
                            if (!file.isProcessed) {
                              return 'Processing...';
                            }
                            
                            if (isEdit) {
                              return file.wasActuallyCropped ? 'Edit (Cropped)' : 'Edit (Full)';
                            }
                            
                            return file.wasActuallyCropped ? 'New (Cropped)' : 'New (Full)';
                          })()}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Upload Button */}
                  {totalScreenshotCount < 5 && (
                    <label className="w-20 h-20 border-2 border-dashed border-slate-600 rounded flex flex-col items-center justify-center text-slate-400 hover:text-amber-300 hover:border-amber-500 cursor-pointer transition-colors">
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
                
                <p className="text-xs text-slate-400">
                  Upload up to 5 screenshots total. Each image must be under 10MB. PNG, JPG formats supported.
                </p>
              </div>
            </div>

            {/* Linked Entities Section */}
            <LinkedEntitiesSection
              poiId={poi.id}
              poiTitle={poi.title}
              className="mt-6"
              showLinkButton={canEdit}
              canEdit={canEdit}
              onLinksChanged={async () => {
                // Call onLinksUpdated to dispatch global event for map markers
                if (onLinksUpdated) {
                  onLinksUpdated();
                }
                
                // For entity link changes, we don't want to close the modal
                // So we'll update the POI data directly without calling onPoiUpdated
                try {
                  // Add a small delay to ensure database transaction is committed
                  await new Promise(resolve => setTimeout(resolve, 200));
                  
                  // Fetch updated POI data with all related information
                  const { data: updatedPoiData, error } = await supabase
                    .from('pois')
                    .select(`
                      *,
                      poi_types (*),
                      profiles!pois_created_by_fkey (username)
                    `)
                    .eq('id', poi.id)
                    .single();

                  if (!error && updatedPoiData) {
                    // Transform screenshots for compatibility (same as in HaggaBasinPage.tsx)
                    const transformedPoi = {
                      ...updatedPoiData,
                      screenshots: Array.isArray(updatedPoiData.screenshots) 
                        ? updatedPoiData.screenshots.map((screenshot: any, index: number) => ({
                            id: screenshot.id || `${updatedPoiData.id}_${index}`,
                            url: screenshot.url || screenshot,
                            uploaded_by: screenshot.uploaded_by || updatedPoiData.created_by,
                            upload_date: screenshot.upload_date || updatedPoiData.created_at
                          }))
                        : []
                    };
                    
                    // Update the parent component's POI list without closing the modal
                    // Use onPoiDataChanged instead of onPoiUpdated to prevent modal closure
                    if (onPoiDataChanged) {
                      onPoiDataChanged(transformedPoi);
                    }
                  } else {
                    console.error('[POIEditModal] Failed to fetch updated POI data:', error);
                  }
                } catch (error) {
                  console.error('[POIEditModal] Error refreshing POI data after link change:', error);
                }
              }}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="bg-slate-800/50 px-6 py-4 border-t border-slate-700 flex justify-end space-x-3">
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
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-amber-600 hover:bg-amber-500 text-slate-900 border border-amber-700 hover:border-amber-600 px-4 py-2 rounded-lg transition-colors flex items-center font-medium"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Updating...' : 'Update POI'}
          </button>
        </div>
      </div>

      {/* Image Crop Modal - Unified System */}
      {screenshotManager.showCropModal && screenshotManager.currentCropFile && (
        <ImageCropModal
          imageUrl={screenshotManager.currentCropFile.preview}
          onCropComplete={screenshotManager.completeCrop}
          onSkip={screenshotManager.skipCrop}
                        onClose={screenshotManager.cancelCrop}
          title="Crop POI Screenshot"
          defaultToSquare={false}
        />
      )}
    </div>
  );
};

export default POIEditModal; 