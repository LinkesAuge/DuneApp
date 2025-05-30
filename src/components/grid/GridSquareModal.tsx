import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { GridSquare as GridSquareType, Poi, PoiType, CustomIcon } from '../../types';
import { useAuth } from '../auth/AuthProvider';
import { Upload, X, Plus, Image, Trash2, Clock, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Target, Edit, Check, MapPin } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import AddPoiForm from '../poi/AddPoiForm';
import CommentsList from '../comments/CommentsList';
import PoiControlPanel from '../common/PoiControlPanel';
import InteractivePoiImage from '../common/InteractivePoiImage';
import ImageCropModal from './ImageCropModal';
import POICard from '../common/POICard';
import { PixelCrop } from 'react-image-crop';
import { broadcastExplorationChange } from '../../lib/explorationEvents';
import POIPreviewCard from '../common/POIPreviewCard';

interface GridSquareModalProps {
  square: GridSquareType;
  onClose: () => void;
  onUpdate: (updatedSquare: GridSquareType) => void;
  onImageClick: (square: GridSquareType) => void;
  onPoiGalleryOpen?: (poi: Poi) => void;
  onPoiSuccessfullyAdded?: () => void;
  onExplorationStatusChanged?: () => void;
}

const GRID_SIZE = 9;

// Helper for consistent theming of text based on background
const getThemedTextColor = (variant: 'primary' | 'secondary' | 'muted') => {
  // Based on docs/ui_aesthetics.md
  if (variant === 'primary') return 'text-amber-200'; // Prominent text
  if (variant === 'secondary') return 'text-slate-300'; // Standard text
  return 'text-slate-400'; // Muted text
};

const GridSquareModal: React.FC<GridSquareModalProps> = ({ 
  square, 
  onClose, 
  onUpdate, 
  onImageClick,
  onPoiGalleryOpen,
  onPoiSuccessfullyAdded,
  onExplorationStatusChanged
}) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [pois, setPois] = useState<Poi[]>([]);
  const [poiTypes, setPoiTypes] = useState<PoiType[]>([]);
  const [customIcons, setCustomIcons] = useState<CustomIcon[]>([]);
  const [userInfo, setUserInfo] = useState<Record<string, { username: string }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAddPoiForm, setShowAddPoiForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploaderInfo, setUploaderInfo] = useState<{ username: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [currentSquare, setCurrentSquare] = useState<GridSquareType>(square);
  
  // POI filtering and control state
  const [selectedPoiTypes, setSelectedPoiTypes] = useState<string[]>([]);
  const [initialFilterSetup, setInitialFilterSetup] = useState(false);
  const [placementMode, setPlacementMode] = useState(false);
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);

  // Image cropping state
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  // Parse current coordinates
  const currentLetter = currentSquare.coordinate.charAt(0);
  const currentNumber = parseInt(currentSquare.coordinate.charAt(1));
  const letterIndex = currentLetter.charCodeAt(0) - 65; // Convert A-I to 0-8

  // Permission checks
  const canUpdateScreenshot = user && (!currentSquare.uploaded_by || currentSquare.uploaded_by === user.id);
  const canDeleteScreenshot = user && currentSquare.uploaded_by === user.id;

  // Generate grid options for navigation
  const gridOptions = [];
  for (let letter = 0; letter < GRID_SIZE; letter++) {
    for (let number = 1; number <= GRID_SIZE; number++) {
      gridOptions.push(`${String.fromCharCode(65 + letter)}${number}`);
    }
  }

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchGridSquare = async (coordinate: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('grid_squares')
        .select('*')
        .eq('coordinate', coordinate)
        .single();

      if (error) throw error;
      if (data) {
        setCurrentSquare(data);
        onUpdate(data);
      }
    } catch (err) {
      console.error('Error fetching grid square:', err);
      setError('Failed to load grid square');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateGrid = (direction: 'up' | 'down' | 'left' | 'right') => {
    let newLetter = letterIndex;
    let newNumber = currentNumber;

    switch (direction) {
      case 'up':
        if (letterIndex < GRID_SIZE - 1) newLetter++; // Going up means increasing letter (A→B→C)
        break;
      case 'down':
        if (letterIndex > 0) newLetter--; // Going down means decreasing letter (C→B→A)
        break;
      case 'left':
        if (currentNumber > 1) newNumber--;
        break;
      case 'right':
        if (currentNumber < GRID_SIZE) newNumber++;
        break;
    }

    const newCoordinate = `${String.fromCharCode(65 + newLetter)}${newNumber}`;
    fetchGridSquare(newCoordinate);
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch POIs, POI types, and custom icons
        const [poisResult, typesResult, customIconsResult] = await Promise.all([
          supabase
            .from('pois')
            .select('*')
            .eq('grid_square_id', currentSquare.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('poi_types')
            .select('*')
            .order('category', { ascending: true }),
          supabase
            .from('custom_icons')
            .select('*')
            .order('name', { ascending: true })
        ]);

        if (poisResult.error) throw poisResult.error;
        if (typesResult.error) throw typesResult.error;
        if (customIconsResult.error) throw customIconsResult.error;

        // If there's an uploader, fetch their username
        if (currentSquare.uploaded_by) {
          const { data: uploaderData, error: uploaderError } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', currentSquare.uploaded_by)
            .single();

          if (!uploaderError && uploaderData) {
            setUploaderInfo(uploaderData);
          }
        }

        if (isMounted) {
          setPois(poisResult.data || []);
          setPoiTypes(typesResult.data || []);
          setCustomIcons(customIconsResult.data || []);
          
          // Fetch user information for POI creators
          const userIds = [...new Set((poisResult.data || []).map(poi => poi.created_by))];
          if (userIds.length > 0) {
            const { data: userProfiles, error: userError } = await supabase
              .from('profiles')
              .select('id, username')
              .in('id', userIds);
            
            if (!userError && userProfiles) {
              const userInfoMap = userProfiles.reduce((acc, profile) => {
                acc[profile.id] = { username: profile.username };
                return acc;
              }, {} as Record<string, { username: string }>);
              setUserInfo(userInfoMap);
            }
          }
          
          // Initialize filter setup
          if (!initialFilterSetup && typesResult.data) {
            setSelectedPoiTypes(typesResult.data.map(type => type.id));
            setInitialFilterSetup(true);
          }
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [currentSquare.id, currentSquare.uploaded_by, initialFilterSetup]);

  // POI Control Functions
  const handleTypeToggle = (typeId: string) => {
    setSelectedPoiTypes(prev => 
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleCategoryToggle = (category: string, checked: boolean) => {
    const categoryTypes = poiTypes
      .filter(type => (type.category || 'Other') === category)
      .map(type => type.id);

    if (checked) {
      setSelectedPoiTypes(prev => [...new Set([...prev, ...categoryTypes])]);
    } else {
      setSelectedPoiTypes(prev => prev.filter(id => !categoryTypes.includes(id)));
    }
  };

  const handleToggleAllPois = () => {
    if (selectedPoiTypes.length > 0) {
      setSelectedPoiTypes([]);
    } else {
      setSelectedPoiTypes(poiTypes.map(type => type.id));
    }
  };

  const handleScreenshotUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file must be smaller than 10MB');
      return;
    }

    // Set up for cropping
    setTempImageFile(file);
    setTempImageUrl(URL.createObjectURL(file));
    setIsEditingExisting(false);
    setShowCropModal(true);

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle crop completion and upload
  const handleCropComplete = async (croppedImageBlob: Blob, cropData: PixelCrop, isFullImage: boolean) => {
    if (!tempImageFile || !user) return;

    setIsUploading(true);
    setError(null);

    try {
      const fileExt = tempImageFile.name.split('.').pop();
      const timestamp = Date.now();
      
      const originalFileName = `grid_originals/grid-${currentSquare.coordinate}-${timestamp}.${fileExt}`;
      const { error: originalUploadError } = await supabase.storage
        .from('screenshots')
        .upload(originalFileName, tempImageFile, { upsert: true });

      if (originalUploadError) throw originalUploadError;
      const { data: originalUrlData } = supabase.storage
        .from('screenshots')
        .getPublicUrl(originalFileName);

      let finalScreenshotUrl = originalUrlData.publicUrl;
      let dbCropDataToSet = {};

      if (!isFullImage) {
        const croppedFileName = `grid_cropped/grid-${currentSquare.coordinate}-${timestamp}.${fileExt}`;
        const { error: croppedUploadError } = await supabase.storage
          .from('screenshots')
          .upload(croppedFileName, croppedImageBlob, { upsert: true });
        if (croppedUploadError) throw croppedUploadError;

        const { data: croppedUrlData } = supabase.storage
          .from('screenshots')
          .getPublicUrl(croppedFileName);
        finalScreenshotUrl = croppedUrlData.publicUrl;
        dbCropDataToSet = {
          crop_x: Math.round(cropData.x),
          crop_y: Math.round(cropData.y),
          crop_width: Math.round(cropData.width),
          crop_height: Math.round(cropData.height),
          crop_created_at: new Date().toISOString(),
        };
      } else {
        // Full image: crop fields are null
        dbCropDataToSet = {
          crop_x: null,
          crop_y: null,
          crop_width: null,
          crop_height: null,
          crop_created_at: new Date().toISOString(), // Still mark when it became full image
        };
      }

      const { data, error } = await supabase
        .from('grid_squares')
        .upsert({
          coordinate: currentSquare.coordinate,
          screenshot_url: finalScreenshotUrl, // This is the cropped or original if isFullImage
          original_screenshot_url: originalUrlData.publicUrl, // This is always the original
          ...dbCropDataToSet,
          uploaded_by: user.id,
          upload_date: new Date().toISOString(),
          is_explored: true
        }, {
          onConflict: 'coordinate'
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSquare(data);
      onUpdate(data);
      setSuccess('Screenshot uploaded successfully');
      
      // Broadcast exploration status change globally
      broadcastExplorationChange({
        gridSquareId: data.id,
        coordinate: data.coordinate,
        isExplored: true,
        source: 'crop'
      });
      
      // Notify about exploration status change
      if (onExplorationStatusChanged) {
        onExplorationStatusChanged();
      }
      
      // Clean up
      setShowCropModal(false);
      setTempImageFile(null);
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
        setTempImageUrl(null);
      }
    } catch (err: any) {
      console.error('Error uploading screenshot:', err);
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle skipping crop (use original image)
  const handleSkipCrop = async () => {
    if (!tempImageFile || !user) return;

    setIsUploading(true);
    setError(null);

    try {
      const fileExt = tempImageFile.name.split('.').pop();
      const fileName = `grid-${currentSquare.coordinate}-${Date.now()}.${fileExt}`;
      
      // Upload original file
      const { error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(fileName, tempImageFile, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('screenshots')
        .getPublicUrl(fileName);

      // Update grid square (no crop data, original and current URL are the same)
      const { data, error } = await supabase
        .from('grid_squares')
        .upsert({
          coordinate: currentSquare.coordinate,
          screenshot_url: publicUrlData.publicUrl,
          original_screenshot_url: publicUrlData.publicUrl,
          crop_x: null,
          crop_y: null,
          crop_width: null,
          crop_height: null,
          crop_created_at: null,
          uploaded_by: user.id,
          upload_date: new Date().toISOString(),
          is_explored: true
        }, {
          onConflict: 'coordinate'
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSquare(data);
      onUpdate(data);
      setSuccess('Screenshot uploaded successfully!');
      
      // Broadcast exploration status change globally
      broadcastExplorationChange({
        gridSquareId: data.id,
        coordinate: data.coordinate,
        isExplored: true,
        source: 'upload'
      });
      
      // Notify about exploration status change
      if (onExplorationStatusChanged) {
        onExplorationStatusChanged();
      }
      
      // Clean up
      setShowCropModal(false);
      setTempImageFile(null);
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
        setTempImageUrl(null);
      }
    } catch (err: any) {
      console.error('Error uploading screenshot:', err);
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle editing existing screenshot crop
  const handleEditExistingCrop = () => {
    if (!currentSquare?.original_screenshot_url) {
      setError('No original image available for editing. original_screenshot_url is missing.');
      console.error('[GridSquareModal] handleEditExistingCrop: original_screenshot_url is missing for square:', currentSquare);
      return;
    }

    console.log('[GridSquareModal] handleEditExistingCrop starting.');
    console.log('[GridSquareModal] currentSquare.screenshot_url:', currentSquare.screenshot_url);
    console.log('[GridSquareModal] currentSquare.original_screenshot_url:', currentSquare.original_screenshot_url);
    console.log('[GridSquareModal] Current crop data from square:', {
      x: currentSquare.crop_x,
      y: currentSquare.crop_y,
      width: currentSquare.crop_width,
      height: currentSquare.crop_height
    });

    // Create a new image URL with cache-busting to avoid CORS issues with storage
    const originalUrlToLoad = new URL(currentSquare.original_screenshot_url);
    originalUrlToLoad.searchParams.set('t', Date.now().toString());
    const urlString = originalUrlToLoad.toString();
    console.log('[GridSquareModal] Setting tempImageUrl for ImageCropModal to:', urlString);
    
    setTempImageUrl(urlString);
    setIsEditingExisting(true);

    // Set initialCrop for the modal based on currentSquare's crop data
    // Ensure it's PixelCrop format and unit: 'px'
    let cropToPassAsInitial: PixelCrop | undefined = undefined;
    if (
      currentSquare.crop_x !== null && currentSquare.crop_x !== undefined &&
      currentSquare.crop_y !== null && currentSquare.crop_y !== undefined &&
      currentSquare.crop_width !== null && currentSquare.crop_width !== undefined &&
      currentSquare.crop_height !== null && currentSquare.crop_height !== undefined
    ) {
      cropToPassAsInitial = {
        x: currentSquare.crop_x,
        y: currentSquare.crop_y,
        width: currentSquare.crop_width,
        height: currentSquare.crop_height,
        unit: 'px' // Important: react-image-crop internally might use %, but our DB stores px
      };
      console.log('[GridSquareModal] Passing initialCrop to ImageCropModal:', cropToPassAsInitial);
    } else {
      console.log('[GridSquareModal] No existing crop data, initialCrop will be undefined.');
    }
    // The initialCrop prop name in ImageCropModal is `initialCrop`
    // No need to set a separate state here, just ensure it's passed correctly in JSX

    setShowCropModal(true);
  };

  // Handle recrop of existing image
  const handleRecropComplete = async (croppedImageBlob: Blob, cropData: PixelCrop, isFullImage: boolean) => {
    if (!user) return;
    if (!currentSquare || !currentSquare.original_screenshot_url) {
      setError("Cannot complete recrop: current square data or original image is missing.");
      setIsUploading(false); 
      return;
    }

    setIsUploading(true);
    setError(null);
    const previousCroppedStoragePath = currentSquare.screenshot_url && currentSquare.screenshot_url !== currentSquare.original_screenshot_url 
      ? new URL(currentSquare.screenshot_url).pathname.split('/screenshots/')[1] 
      : null;

    try {
      let newCroppedFileUrl = currentSquare.original_screenshot_url; 
      let dbCropDataToSet = {};
      let newCroppedStoragePath: string | null = null;

      if (!isFullImage) {
        const fileExt = currentSquare.original_screenshot_url.split('.').pop()?.split('?')[0] || 'jpg';
        const timestamp = Date.now();
        // Ensure newCroppedFileName includes the subfolder for consistency
        newCroppedStoragePath = `grid_cropped/grid-${currentSquare.coordinate}-${timestamp}.${fileExt}`;
        
        const { error: croppedUploadError } = await supabase.storage
          .from('screenshots')
          .upload(newCroppedStoragePath, croppedImageBlob, { upsert: true });

        if (croppedUploadError) throw croppedUploadError;
        const { data: croppedUrlData } = supabase.storage.from('screenshots').getPublicUrl(newCroppedStoragePath);
        newCroppedFileUrl = croppedUrlData.publicUrl;
        dbCropDataToSet = {
          crop_x: Math.round(cropData.x),
          crop_y: Math.round(cropData.y),
          crop_width: Math.round(cropData.width),
          crop_height: Math.round(cropData.height),
          crop_created_at: new Date().toISOString(),
        };
      } else {
        dbCropDataToSet = {
          crop_x: null,
          crop_y: null,
          crop_width: null,
          crop_height: null,
          crop_created_at: new Date().toISOString(),
        };
      }

      const { data, error } = await supabase
        .from('grid_squares')
        .update({
          screenshot_url: newCroppedFileUrl, // This is the new cropped URL or original_screenshot_url if full image
          ...dbCropDataToSet,
          is_explored: true 
        })
        .eq('coordinate', currentSquare.coordinate)
        .select()
        .single();

      if (error) throw error;

      // Delete the *previous* cropped image if it existed and was different from the new one and original
      if (previousCroppedStoragePath && previousCroppedStoragePath !== newCroppedStoragePath && previousCroppedStoragePath !== new URL(currentSquare.original_screenshot_url).pathname.split('/screenshots/')[1]) {
        try {
          console.log('Attempting to delete old cropped image from storage:', previousCroppedStoragePath);
          await supabase.storage.from('screenshots').remove([previousCroppedStoragePath]);
          console.log('Successfully deleted old cropped image:', previousCroppedStoragePath);
        } catch (deleteError) {
          console.warn('Failed to delete old cropped image:', deleteError);
        }
      }
      
      const updatedSquareData = {
        ...data,
        original_screenshot_url: currentSquare.original_screenshot_url 
      };

      setCurrentSquare(updatedSquareData);
      onUpdate(updatedSquareData);
      setSuccess('Screenshot crop updated successfully');
      
      // Broadcast exploration status change globally
      broadcastExplorationChange({
        gridSquareId: data.id,
        coordinate: data.coordinate,
        isExplored: true,
        source: 'recrop'
      });
      
      // Notify about exploration status change
      if (onExplorationStatusChanged) {
        onExplorationStatusChanged();
      }
      
      // Clean up
      setShowCropModal(false);
      setTempImageUrl(null);
      setIsEditingExisting(false);
    } catch (err: any) {
      console.error('Error recropping screenshot:', err);
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle closing crop modal
  const handleCloseCropModal = () => {
    setShowCropModal(false);
    setTempImageFile(null);
    setIsEditingExisting(false);
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl(null);
    }
  };

  const handleDeleteScreenshot = async () => {
    if (!confirm('Are you sure you want to delete this screenshot? This action cannot be undone.')) return;

    setIsUploading(true); // Consider renaming state if used for general processing
    setError(null);

    try {
      const filesToDelete = [];
      if (currentSquare.screenshot_url) {
        // Only add to delete list if it's not the same as the original_screenshot_url (if original exists)
        // or if original_screenshot_url doesn't exist (meaning screenshot_url is the only one or was the original)
        if (!currentSquare.original_screenshot_url || currentSquare.screenshot_url !== currentSquare.original_screenshot_url) {
          const screenshotPath = new URL(currentSquare.screenshot_url).pathname.split('/screenshots/')[1];
          if (screenshotPath) filesToDelete.push(screenshotPath);
        }
      }

      if (currentSquare.original_screenshot_url) {
        const originalPath = new URL(currentSquare.original_screenshot_url).pathname.split('/screenshots/')[1];
        if (originalPath && !filesToDelete.includes(originalPath)) { // Avoid double-adding if they were same
             filesToDelete.push(originalPath);
        }
      }

      if (filesToDelete.length > 0) {
        console.log('Attempting to delete from storage:', filesToDelete);
        const { error: deleteError } = await supabase.storage
          .from('screenshots')
          .remove(filesToDelete);
        if (deleteError) {
          console.warn('Some files might not have been deleted from storage:', deleteError);
          // Potentially non-critical, proceed to update DB
        }
      }

      const { data, error: dbError } = await supabase
        .from('grid_squares')
        .update({
          screenshot_url: null,
          original_screenshot_url: null,
          crop_x: null,
          crop_y: null,
          crop_width: null,
          crop_height: null,
          crop_created_at: null,
          uploaded_by: null,
          upload_date: null,
          is_explored: false
        })
        .eq('id', currentSquare.id)
        .select()
        .single();

      if (dbError) throw dbError;

      setCurrentSquare(data);
      onUpdate(data);
      setSuccess('Screenshot deleted successfully');
      
      // Broadcast exploration status change globally
      broadcastExplorationChange({
        gridSquareId: data.id,
        coordinate: data.coordinate,
        isExplored: false,
        source: 'upload'
      });
    } catch (err: any) {
      console.error('Error deleting screenshot:', err);
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePoiCreated = useCallback(async (newPoi: Poi) => {
    try {
      // Add grid_square_id to the POI
      const poiWithGrid = {
        ...newPoi,
        grid_square_id: currentSquare.id,
        map_type: 'deep_desert' as const
      };

      // Insert the POI into the database
      const { data, error } = await supabase
        .from('pois')
        .insert([poiWithGrid])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setPois(prev => [data, ...prev]);
      setSuccess('POI created successfully!');
      
      // Notify parent component
      if (onPoiSuccessfullyAdded) {
        onPoiSuccessfullyAdded();
      }
    } catch (err) {
      console.error('Error creating POI:', err);
      setError('Failed to create POI');
    }
  }, [currentSquare.id, onPoiSuccessfullyAdded]);

  const handleAddPoi = (newPoi: Poi) => {
    setPois(prev => [newPoi, ...prev]);
    setShowAddPoiForm(false);
    setSuccess('POI added successfully!');
    if (onPoiSuccessfullyAdded) {
      // Add slight delay to ensure database transaction completes
      setTimeout(() => {
        onPoiSuccessfullyAdded();
      }, 100);
    }
  };

  const handleDeletePoi = (poiId: string) => {
    setPois(prev => prev.filter(poi => poi.id !== poiId));
    setSuccess('POI deleted successfully');
  };

  const handleUpdatePoi = (updatedPoi: Poi) => {
    setPois(prev => prev.map(poi => poi.id === updatedPoi.id ? updatedPoi : poi));
    setSuccess('POI updated successfully');
  };

  // Handle create POI button click
  const handleCreatePoiClick = () => {
    if (!user) {
      setError('Please sign in to create POIs');
      return;
    }
    setShowAddPoiForm(true);
    setError(null);
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        // Ensure class check for gallery backdrop uses theme-consistent names if gallery is also restyled
        const isGalleryBackdrop = target.classList.contains('bg-slate-950/90') || // Updated from night-950
                                  target.closest('div[class*="bg-slate-950/90"][class*="z-[60"]');
        
        if (!isGalleryBackdrop) {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleImageClick = (e: React.MouseEvent) => {
    if (!placementMode) {
      onImageClick(currentSquare);
    }
  };

  // Handle deleting screenshot from crop modal
  const handleDeleteFromCrop = async () => {
    if (!confirm('Are you sure you want to delete this screenshot?')) return;

    try {
      // Extract filename from URL to delete from storage
      if (currentSquare.screenshot_url) {
        const url = new URL(currentSquare.screenshot_url);
        const fileName = url.pathname.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('screenshots')
            .remove([fileName]);
        }
      }

      // Also delete original if it's different
      if (currentSquare.original_screenshot_url && 
          currentSquare.original_screenshot_url !== currentSquare.screenshot_url) {
        const originalUrl = new URL(currentSquare.original_screenshot_url);
        const originalFileName = originalUrl.pathname.split('/').pop();
        if (originalFileName) {
          await supabase.storage
            .from('screenshots')
            .remove([originalFileName]);
        }
      }

      // Update grid square to remove screenshot reference and mark as not explored
      const { data, error } = await supabase
        .from('grid_squares')
        .update({
          screenshot_url: null,
          original_screenshot_url: null,
          crop_x: null,
          crop_y: null,
          crop_width: null,
          crop_height: null,
          crop_created_at: null,
          uploaded_by: null,
          upload_date: null,
          is_explored: false
        })
        .eq('id', currentSquare.id)
        .select()
        .single();

      if (error) throw error;

      setCurrentSquare(data);
      onUpdate(data);
      setSuccess('Screenshot deleted successfully');
      
      // Broadcast exploration status change globally
      broadcastExplorationChange({
        gridSquareId: data.id,
        coordinate: data.coordinate,
        isExplored: false,
        source: 'upload'
      });
      
      // Close the crop modal
      handleCloseCropModal();
    } catch (err: any) {
      console.error('Error deleting screenshot:', err);
      setError(err.message);
    }
  };

  return (
    <div 
      ref={modalRef} 
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" // Themed backdrop
    >
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col border border-slate-700"> {/* Themed content wrapper */}
        {/* Header Section */}
        <div className={`flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800`}> {/* Themed header */}
          <div className="flex items-center space-x-3">
            {/* Grid Coordinate Select */}
            <select
              value={currentSquare.coordinate}
              onChange={(e) => fetchGridSquare(e.target.value)}
              className={`px-3 py-2 rounded-md ${getThemedTextColor('secondary')} bg-slate-700 border border-slate-600 focus:ring-amber-400 focus:border-amber-400 text-sm`}
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
            >
              {gridOptions.map(coord => (
                <option key={coord} value={coord} className="bg-slate-700 text-slate-200">
                  {coord}
                </option>
              ))}
            </select>
            <h2 className={`text-xl font-bold ${getThemedTextColor('primary')}`} style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Grid Square Details
            </h2>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-1">
            {[
              { dir: 'left', icon: ChevronLeft, disabled: currentNumber === 1 },
              { dir: 'right', icon: ChevronRight, disabled: currentNumber === GRID_SIZE },
              { dir: 'down', icon: ChevronDown, disabled: letterIndex === 0 }, // A is 0
              { dir: 'up', icon: ChevronUp, disabled: letterIndex === GRID_SIZE -1 }, // I is 8
            ].map(({ dir, icon: Icon, disabled }) => (
              <button
                key={dir}
                onClick={() => navigateGrid(dir as 'up' | 'down' | 'left' | 'right')}
                disabled={isLoading || disabled}
                className={`p-2 rounded-md transition-colors disabled:opacity-40 ${disabled ? getThemedTextColor('muted') : getThemedTextColor('secondary')} hover:bg-slate-700 hover:${getThemedTextColor('primary')}`}
                title={`Navigate ${dir}`}
              >
                <Icon size={20} />
              </button>
            ))}
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={`p-2 rounded-full transition-colors ${getThemedTextColor('muted')} hover:bg-slate-700 hover:${getThemedTextColor('primary')}`} // Themed close button
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Success Message - Retaining green for positive feedback, adjusting intensity slightly */}
        {success && (
          <div className="mx-8 mt-4 p-3 bg-green-700/20 text-green-300 rounded-lg border border-green-600/30 flex items-center">
            <Check size={16} className="mr-2" />
            {success}
          </div>
        )}
        
        {/* Error Display - Retaining red for error feedback, adjusting intensity slightly */}
        {error && (
          <div className="mx-8 mt-4 p-3 bg-red-700/20 text-red-400 rounded-lg border border-red-600/30"> {/* Adjusted text color slightly */}
            {error}
          </div>
        )}
        
        {/* Main Content Area - This will need further updates for its children */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {/* Screenshot Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-3">
              <h3 className={`text-lg font-semibold ${getThemedTextColor('primary')}`} style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>Screenshot</h3>
              {currentSquare.screenshot_url ? (
                <div className="relative group">
                  <InteractivePoiImage
                    imageUrl={currentSquare.screenshot_url}
                    imageAlt={`Grid ${currentSquare.coordinate}`}
                    pois={pois}
                    poiTypes={poiTypes}
                    customIcons={customIcons}
                    selectedPoiTypes={selectedPoiTypes}
                    onPoiCreated={handlePoiCreated}
                    onPoiDeleted={handleDeletePoi}
                    onPoiGalleryOpen={onPoiGalleryOpen}
                    placementMode={placementMode}
                    onPlacementModeChange={setPlacementMode}
                    mapType="deep_desert"
                    gridSquareId={currentSquare.id}
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {!canUpdateScreenshot && currentSquare.screenshot_url && (
                      <p className={`text-xs ${getThemedTextColor('muted')} mt-2`}>You can only replace screenshots you uploaded.</p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleScreenshotUpload}
                    disabled={isUploading || !canUpdateScreenshot}
                    className={`btn btn-primary text-sm w-full justify-center ${!canUpdateScreenshot ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isUploading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                    {isUploading ? 'Uploading...' : 'Upload Screenshot'}
                  </button>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
               {uploaderInfo && (
                <p className={`text-xs ${getThemedTextColor('muted')} pt-2`}>
                  Uploaded by: <span className={getThemedTextColor('secondary')}>{uploaderInfo.username}</span> on {new Date(currentSquare.updated_at || currentSquare.created_at).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* POI Control Panel Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className={`text-lg font-semibold ${getThemedTextColor('primary')}`} style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>Points of Interest ({pois.length})</h3>
                {user && (
                  <button
                    onClick={handleCreatePoiClick}
                    className="btn btn-primary text-sm"
                  >
                    <Plus size={16} className="mr-1" /> Add POI
                  </button>
                )}
              </div>
              <PoiControlPanel
                poiTypes={poiTypes}
                selectedPoiTypes={selectedPoiTypes}
                onTypeToggle={handleTypeToggle}
                onCategoryToggle={handleCategoryToggle}
                onToggleAll={handleToggleAllPois}
                placementMode={placementMode}
                onPlacementModeChange={setPlacementMode}
                // Applying text theming to PoiControlPanel text elements if it doesn't handle it internally
                // textPrimaryColor={getThemedTextColor('primary')}
                // textSecondaryColor={getThemedTextColor('secondary')}
                // textMutedColor={getThemedTextColor('muted')}
              />
            </div>
          </div>
          
          {/* POI List or Add Form Section */}
          <div className="mt-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spice-600"></div>
              </div>
            ) : showAddPoiForm ? (
              <div className="space-y-4">
                <AddPoiForm 
                  gridSquareId={currentSquare.id} 
                  poiTypes={poiTypes}
                  onCancel={() => setShowAddPoiForm(false)}
                  onPoiAdded={handleAddPoi}
                />
                <button
                  onClick={() => setShowAddPoiForm(false)}
                  className="btn btn-outline w-full text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className={`text-md font-semibold ${getThemedTextColor('primary')}`}>
                  POIs in this Grid Square ({pois.filter(poi => selectedPoiTypes.includes(poi.poi_type_id)).length})
                </h4>
                {pois.filter(poi => selectedPoiTypes.includes(poi.poi_type_id)).length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400 mb-2">No POIs found</p>
                    <p className="text-slate-500 text-sm">Add a POI to this grid square to see it here</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {pois.filter(poi => selectedPoiTypes.includes(poi.poi_type_id)).map(poi => {
                      const poiType = poiTypes.find(type => type.id === poi.poi_type_id);
                      if (!poiType) return null;

                      return (
                        <POIPreviewCard
                          key={poi.id}
                          poi={poi}
                          poiType={poiType}
                          customIcons={customIcons}
                          userInfo={userInfo}
                          layout="grid"
                          onClick={() => setSelectedPoiId(poi.id)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Comments Section */}
            <div className="mt-8">
              <CommentsList gridSquareId={currentSquare.id} />
            </div>
          </div>
        </div>
      </div>
      
      {/* POI Card Modal */}
      {selectedPoiId && (() => {
        const selectedPoi = pois.find(poi => poi.id === selectedPoiId);
        const selectedPoiType = selectedPoi ? poiTypes.find(type => type.id === selectedPoi.poi_type_id) : null;
        if (!selectedPoi || !selectedPoiType) return null;
        
        return (
          <POICard
            poi={selectedPoi}
            poiType={selectedPoiType}
            customIcons={customIcons}
            isOpen={true}
            onClose={() => setSelectedPoiId(null)}
            onEdit={() => {
              // Handle edit - you may want to implement POI editing in grid square modal
              setSelectedPoiId(null);
            }}
            onDelete={() => {
              handleDeletePoi(selectedPoi.id);
              setSelectedPoiId(null);
            }}
            onImageClick={() => {
              if (onPoiGalleryOpen) {
                onPoiGalleryOpen(selectedPoi);
              }
              setSelectedPoiId(null);
            }}
          />
        );
      })()}
      
      {/* Image Crop Modal */}
      {showCropModal && tempImageUrl && (
        <ImageCropModal
          imageUrl={tempImageUrl}
          onCropComplete={isEditingExisting ? handleRecropComplete : handleCropComplete}
          onClose={handleCloseCropModal}
          onSkip={handleSkipCrop}
          onDelete={canDeleteScreenshot && currentSquare.screenshot_url ? handleDeleteFromCrop : undefined}
          title={isEditingExisting ? "Edit Screenshot Crop" : "Crop New Screenshot"}
          defaultToSquare={true} 
          initialCrop={
            isEditingExisting && 
            currentSquare.crop_x !== null && currentSquare.crop_y !== null && 
            currentSquare.crop_width !== null && currentSquare.crop_height !== null ? 
            {
              x: currentSquare.crop_x,
              y: currentSquare.crop_y,
              width: currentSquare.crop_width,
              height: currentSquare.crop_height,
              unit: 'px'
            } : undefined
          }
        />
      )}
    </div>
  );
};

export default GridSquareModal;