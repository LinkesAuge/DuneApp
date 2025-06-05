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
// Remove old crop modal import
// import ImageCropModal from '../grid/ImageCropModal';
import { PixelCrop, Crop } from 'react-image-crop';
import CommentsList from '../comments/CommentsList';
import { getScreenshotLabel } from '../../lib/cropUtils';
import UserAvatar from '../common/UserAvatar';
import { uploadPoiScreenshotOriginal, uploadPoiScreenshotCropped } from '../../lib/imageUpload';
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
      // New structure
      '/storage/v1/object/public/screenshots/poi_screenshots_original/',
      '/storage/v1/object/public/screenshots/poi_screenshots_cropped/',
      '/storage/v1/object/public/screenshots/comment_screenshots_original/',
      '/storage/v1/object/public/screenshots/comment_screenshots_cropped/',
      // Legacy structure
      '/storage/v1/object/public/screenshots/poi_originals/',
      '/storage/v1/object/public/screenshots/poi_screenshots/',
      '/storage/v1/object/public/screenshots/comment-screenshots/',
      // Generic screenshots
      '/storage/v1/object/public/screenshots/'
    ];

    for (const pattern of patterns) {
      if (url.includes(pattern)) {
        const parts = url.split(pattern);
        if (parts.length > 1) {
          // Get the folder name from the pattern and combine with the file path
          const folderName = pattern.split('/').pop() || '';
          return folderName ? `${folderName}${parts[1]}` : parts[1];
        }
      }
    }

    // Handle relative paths
    const relativePatterns = [
      '/screenshots/poi_screenshots_original/',
      '/screenshots/poi_screenshots_cropped/',
      '/screenshots/comment_screenshots_original/',
      '/screenshots/comment_screenshots_cropped/',
      '/screenshots/poi_originals/',
      '/screenshots/poi_screenshots/',
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
  
  // Replace complex screenshot state with unified system
  const screenshotManager = useScreenshotManager({
    context: 'poi',
    maxFiles: 5,
    userId: user?.id || '',
    gridSquareId: poi.grid_square_id || undefined,
    existingScreenshots: poi.screenshots || []
  });
  
  // Keep track of existing screenshots for deletion
  const [existingScreenshots, setExistingScreenshots] = useState<PoiScreenshot[]>(
    poi.screenshots || [] 
  );
  const [screenshotsToDelete, setScreenshotsToDelete] = useState<string[]>([]);
  
  // Remove old screenshot state - handled by unified system now
  // const [additionalScreenshots, setAdditionalScreenshots] = useState<File[]>([]);
  // const [showCropModal, setShowCropModal] = useState(false);
  // const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  // const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  // const [pendingCroppedFiles, setPendingCroppedFiles] = useState<PendingScreenshotFile[]>([]);
  // const [editingScreenshot, setEditingScreenshot] = useState<PoiScreenshot | null>(null);
  
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
      console.log('POI is not shared, clearing selected users');
      return;
    }
    
    console.log('Loading current shares for POI:', poi.id);
    
    try {
      // First get the poi_shares
      const { data: shares, error: sharesError } = await supabase
        .from('poi_shares')
        .select('*')
        .eq('poi_id', poi.id);

      if (sharesError) throw sharesError;
      
      console.log('Loaded shares:', shares);
      
      if (!shares || shares.length === 0) {
        console.log('No shares found for this POI');
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
      
      console.log('Loaded user profiles:', userProfiles);
      console.log('Setting selected users:', userProfiles);
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
  const handleDeleteExistingScreenshot = (screenshotId: string) => {
    setExistingScreenshots(prev => prev.filter(s => s.id !== screenshotId));
    setScreenshotsToDelete(prev => [...prev, screenshotId]);
  };

  // Remove old screenshot handling methods - replaced by unified system
  // const totalScreenshotCount = existingScreenshots.length + additionalScreenshots.length + pendingCroppedFiles.length;
  // const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => { ... }
  // const [filesToProcess, setFilesToProcess] = useState<File[]>([]);
  // const processFilesForCropping = (files: File[]) => { ... }

  // Handle crop completion for NEWLY UPLOADED files
  const handleCropComplete = async (croppedImageBlob: Blob, cropData: PixelCrop, isFullImage: boolean) => {
    if (!tempImageFile) return;

    try {
      const processedFile = new File([croppedImageBlob], tempImageFile.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      const newPendingFile: PendingScreenshotFile = {
        id: Date.now().toString(), // Simple unique ID for list key
        originalFile: tempImageFile, // Preserve the original uploaded file
        displayFile: processedFile, // Use the cropped version for display
        cropDetails: isFullImage ? null : cropData,
        previewUrl: URL.createObjectURL(processedFile)
      };

      setPendingCroppedFiles(prev => [...prev, newPendingFile]);
      
      // Clean up current temp state
      setShowCropModal(false);
      setTempImageFile(null);
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
        setTempImageUrl(null);
      }

      // Process remaining files if any
      console.log(`[POIEditModal] Crop complete. ${filesToProcess.length} files remaining in queue`);
      if (filesToProcess.length > 0) {
        setTimeout(() => {
          console.log(`[POIEditModal] Processing remaining files from queue:`, filesToProcess.map(f => f.name));
          processFilesForCropping(filesToProcess);
          setFilesToProcess([]); // Clear the queue
        }, 100);
      }
    } catch (error) {
      console.error('Error processing cropped image:', error);
      setError('Failed to process cropped image. Please try again.');
    }
  };

  // Handle skipping crop for a file (use original) - for NEWLY UPLOADED files
  const handleSkipCrop = () => {
    if (!tempImageFile) return;

    // Add original file as a pending file with null cropDetails
    const newPendingFile: PendingScreenshotFile = {
      id: Date.now().toString(),
      originalFile: tempImageFile, // Original file
      displayFile: tempImageFile, // Same as original since no crop
      cropDetails: null,
      previewUrl: URL.createObjectURL(tempImageFile)
    };
    setPendingCroppedFiles(prev => [...prev, newPendingFile]);
    
    // Clean up current temp state
    setShowCropModal(false);
    setTempImageFile(null);
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl(null);
    }

    // Process remaining files if any
    if (filesToProcess.length > 0) {
      setTimeout(() => {
        processFilesForCropping(filesToProcess);
        setFilesToProcess([]); // Clear the queue
      }, 100);
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
    setEditingScreenshot(null);
    setFilesToProcess([]); // Clear any remaining files in queue
  };

  // Handle editing existing screenshot
  const handleEditExistingScreenshot = (screenshotId: string) => {
    const screenshotToEdit = existingScreenshots.find(s => s.id === screenshotId);
    if (!screenshotToEdit) {
      setError('Screenshot not found for editing.');
      return;
    }


    
    const imageUrlForCropper = screenshotToEdit.original_url || screenshotToEdit.url;
    if (!imageUrlForCropper) {
      setError('No image URL available for cropping this screenshot.');
      console.error('[POIEditModal] No original_url or url found for screenshot:', screenshotToEdit);
      return;
    }

    setEditingScreenshot(screenshotToEdit);
    setTempImageUrl(imageUrlForCropper);
    setShowCropModal(true);
    // initialCrop for the modal will be set in the modal's props directly
  };

  // Handle crop completion for an EXISTING screenshot being EDITED
  const handleEditCropComplete = async (croppedImageBlob: Blob, cropData: PixelCrop, isFullImage: boolean) => {
    if (!editingScreenshot) {
      setError('No screenshot selected for editing crop.');
      return;
    }


    const processedFile = new File([croppedImageBlob], `poi_screenshot_edited_${editingScreenshot.id}_${Date.now()}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    // For editing existing screenshots, we don't have the original file locally,
    // so we'll use the processedFile as both original and display for the pending structure
    // The actual original_url will be preserved from the existing screenshot
    const newPendingVersion: PendingScreenshotFile = {
      id: `edited_${editingScreenshot.id}_${Date.now()}`, 
      originalFile: processedFile, // We don't have access to the true original file
      displayFile: processedFile, // The new cropped version
      cropDetails: isFullImage ? null : cropData,
      previewUrl: URL.createObjectURL(processedFile),
      originalScreenshotId: editingScreenshot.id,
      originalScreenshotUrl: editingScreenshot.original_url || editingScreenshot.url // Keep track of the source original
    };

    setPendingCroppedFiles(prev => [...prev, newPendingVersion]);
    setExistingScreenshots(prev => prev.filter(s => s.id !== editingScreenshot.id));

    setShowCropModal(false);
    setTempImageFile(null); 
    if (tempImageUrl) URL.revokeObjectURL(tempImageUrl); 
    setTempImageUrl(null);
    setEditingScreenshot(null);
    
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
    const allFiles = [...additionalScreenshots, ...pendingCroppedFiles.map(file => file.displayFile)];
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
      // 1. Upload NEW screenshots (those without originalScreenshotId)
      const newUploadedScreenshotObjects: PoiScreenshot[] = [];
      const filesToUploadActuallyNew = pendingCroppedFiles.filter(pf => !pf.originalScreenshotId);
      
      for (const pendingFile of filesToUploadActuallyNew) {
        const newScreenshotId = crypto.randomUUID();
        const fileExt = pendingFile.displayFile.name.split('.').pop() || 'jpg';
        
        // Upload original file with WebP conversion
        const originalFileName = `${poi.id}/${newScreenshotId}_original.webp`;
        const originalUploadResult = await uploadPoiScreenshotOriginal(pendingFile.originalFile, originalFileName);

        // Upload display file (cropped or same as original) with WebP conversion
        const displayFileName = `${poi.id}/${newScreenshotId}_display.webp`;
        const displayUploadResult = await uploadPoiScreenshotCropped(pendingFile.displayFile, displayFileName);
        
        // Show conversion feedback for the first upload
        if (filesToUploadActuallyNew[0] === pendingFile && displayUploadResult.compressionRatio) {
          const stats = formatConversionStats(displayUploadResult);
          setConversionStats(stats);
        }

        newUploadedScreenshotObjects.push({
          id: newScreenshotId, 
          url: displayUploadResult.url, // Display URL (cropped or original)
          original_url: originalUploadResult.url, // Original URL
          crop_details: pendingFile.cropDetails, // Store the crop data
          uploaded_by: user!.id,
          upload_date: new Date().toISOString(),
        });
      }

      // 2. Handle EDITED screenshots (those with originalScreenshotId)
      const editedScreenshotObjects: PoiScreenshot[] = [];
      const urlsOfOldDisplayFilesToDelete: string[] = [];

      const filesToUploadAsEdits = pendingCroppedFiles.filter(pf => pf.originalScreenshotId && pf.originalScreenshotUrl);
      for (const pendingVersion of filesToUploadAsEdits) {
        const displayFileName = `${poi.id}/edited_${pendingVersion.originalScreenshotId}_${Date.now()}.webp`;
        
        // Upload display file with WebP conversion
        const displayUploadResult = await uploadPoiScreenshotCropped(pendingVersion.displayFile, displayFileName);
        
        editedScreenshotObjects.push({
          id: pendingVersion.originalScreenshotId!, 
          url: displayUploadResult.url, 
          original_url: pendingVersion.originalScreenshotUrl, // Preserve the original source URL
          crop_details: pendingVersion.cropDetails, // The new crop details
          uploaded_by: user!.id, // Should be updated_by for edits
          upload_date: poi.screenshots.find(s=>s.id === pendingVersion.originalScreenshotId!)?.upload_date || new Date().toISOString(),
          updated_by: user!.id,
          updated_at: new Date().toISOString(),
        });
        // The old DISPLAY URL of the screenshot that was re-cropped
        const oldScreenshotInstance = poi.screenshots.find(s => s.id === pendingVersion.originalScreenshotId!)
        if(oldScreenshotInstance && oldScreenshotInstance.url) {
             urlsOfOldDisplayFilesToDelete.push(oldScreenshotInstance.url);
        }
      }

      // 3. Construct the final poi.screenshots array
      let finalScreenshotsArray: PoiScreenshot[] = poi.screenshots?.map(s => ({ ...s })) || [];
      finalScreenshotsArray = finalScreenshotsArray.filter(s => !screenshotsToDelete.includes(s.id));

      finalScreenshotsArray = finalScreenshotsArray.map(s => {
        const editedVersion = editedScreenshotObjects.find(es => es.id === s.id);
        if (editedVersion) {
          return editedVersion; // Replace with the full new object including new url, crop_details, original_url
        }
        return s;
      });

      finalScreenshotsArray.push(...newUploadedScreenshotObjects);
      updatedPoiData.screenshots = finalScreenshotsArray;

      // 4. Update the POI record in the database
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

      // 6. Delete files from storage
      // These are: 
      //    - original URLs of screenshots explicitly marked for deletion (screenshotsToDelete translates to URLs)
      //    - old CROPPED URLs of screenshots that were re-cropped (urlsOfOldCroppedFilesToDelete)
      
      const urlsOfExplicitlyDeletedScreenshots = screenshotsToDelete.map(idToDelete => {
        // Find the screenshot in the *original* poi.screenshots to get its URL for deletion
        const originalPoiScreenshot = poi.screenshots?.find(s => s.id === idToDelete);
        // We need to decide if we delete the original_url or the display url, or both.
        // For now, deleting the display url. If original_url is different and also needs deletion, that's more complex.
        return originalPoiScreenshot?.url; 
      }).filter(url => !!url) as string[];

      const allUrlsToDeleteFromStorage = [
        ...urlsOfExplicitlyDeletedScreenshots,
        ...urlsOfOldDisplayFilesToDelete
      ];

      if (allUrlsToDeleteFromStorage.length > 0) {
        // Extract path from full URL for Supabase delete using the enhanced path extraction
        const pathsToDelete = allUrlsToDeleteFromStorage.map(url => {
          try {
            // Use the same extraction logic as in the API
            return extractStorageFilePathFromUrl(url);
          } catch (e) {
            console.error(`Invalid URL for deletion: ${url}`, e);
            return null;
          }
        }).filter(path => !!path) as string[];
        
        if (pathsToDelete.length > 0) {
    
          const { error: deleteError } = await supabase.storage.from('screenshots').remove(pathsToDelete);
          if (deleteError) {
            // Log delete error but don't necessarily throw, as POI update was successful
            console.error('[POIEditModal] Error deleting files from storage:', deleteError);
            setError(prevError => prevError ? `${prevError}. Some old screenshots might not have been deleted.` : 'POI updated, but some old screenshots might not have been deleted.')
          }
        }
      }

      onPoiUpdated(updatedPoi);
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

                  {/* New Screenshots to Upload (Original) */}
                  {additionalScreenshots.map((file, index) => (
                    <div 
                      key={`new-${index}`}
                      className="w-20 h-20 relative rounded overflow-hidden border border-slate-600"
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
                      <div className="absolute bottom-1 left-1">
                        <span className="bg-green-600 text-white text-xs px-1 rounded">New (Full)</span>
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
                        src={file.previewUrl} 
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
                      <div className="absolute bottom-1 left-1">
                        <span className="bg-green-600 text-white text-xs px-1 rounded">New (Cropped)</span>
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
                console.log('[POIEditModal] POI entity links changed, refreshing POI data for map...');
                
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
                    
                    console.log('[POIEditModal] Updating POI data directly without closing modal...');
                    console.log('[POIEditModal] Updated POI object:', transformedPoi);
                    
                    // Update the parent component's POI list without closing the modal
                    // Use onPoiDataChanged instead of onPoiUpdated to prevent modal closure
                    if (onPoiDataChanged) {
                      onPoiDataChanged(transformedPoi);
                    } else {
                      console.log('[POIEditModal] No onPoiDataChanged callback provided, skipping parent update');
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

      {/* Image Crop Modal */}
      {showCropModal && tempImageUrl && (
        <ImageCropModal
          imageUrl={tempImageUrl}
          onCropComplete={editingScreenshot ? handleEditCropComplete : handleCropComplete}
          onClose={handleCloseCropModal}
          title={editingScreenshot ? "Edit POI Screenshot" : "Crop New POI Screenshot"}
          defaultToSquare={false}
          initialCrop={editingScreenshot && editingScreenshot.crop_details 
            ? { ...editingScreenshot.crop_details, unit: 'px' } 
            : undefined
          }
        />
      )}
    </div>
  );
};

export default POIEditModal; 