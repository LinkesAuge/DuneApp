import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { GridSquare as GridSquareType, Poi, PoiType, CustomIcon } from '../../types';
import { useAuth } from '../auth/AuthProvider';
import { Upload, X, Plus, Check, Image, Trash2, Clock, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Target, Edit } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import PoiList from '../poi/PoiList';
import AddPoiForm from '../poi/AddPoiForm';
import CommentsList from '../comments/CommentsList';
import PoiControlPanel from '../common/PoiControlPanel';
import InteractivePoiImage from '../common/InteractivePoiImage';
import ImageCropModal from './ImageCropModal';
import { PixelCrop } from 'react-image-crop';

interface GridSquareModalProps {
  square: GridSquareType;
  onClose: () => void;
  onUpdate: (updatedSquare: GridSquareType) => void;
  onImageClick: (square: GridSquareType) => void;
  onPoiGalleryOpen?: (poi: Poi) => void;
  onPoiSuccessfullyAdded?: () => void;
}

const GRID_SIZE = 9;

const GridSquareModal: React.FC<GridSquareModalProps> = ({ 
  square, 
  onClose, 
  onUpdate, 
  onImageClick,
  onPoiGalleryOpen,
  onPoiSuccessfullyAdded
}) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [pois, setPois] = useState<Poi[]>([]);
  const [poiTypes, setPoiTypes] = useState<PoiType[]>([]);
  const [customIcons, setCustomIcons] = useState<CustomIcon[]>([]);
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

  const handleExplorationToggle = async () => {
    try {
      const { data, error } = await supabase
        .from('grid_squares')
        .update({ 
          is_explored: !currentSquare.is_explored,
          exploration_date: !currentSquare.is_explored ? new Date().toISOString() : null
        })
        .eq('id', currentSquare.id)
        .select()
        .single();

      if (error) throw error;

      setCurrentSquare(data);
      onUpdate(data);
      setSuccess(`Grid marked as ${data.is_explored ? 'explored' : 'unexplored'}`);
    } catch (err: any) {
      console.error('Error updating exploration status:', err);
      setError(err.message);
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
  const handleCropComplete = async (croppedImageBlob: Blob, cropData: PixelCrop) => {
    if (!tempImageFile || !user) return;

    setIsUploading(true);
    setError(null);

    try {
      const fileExt = tempImageFile.name.split('.').pop();
      const timestamp = Date.now();
      
      // Upload original image
      const originalFileName = `grid-${currentSquare.coordinate}-${timestamp}-original.${fileExt}`;
      const { error: originalUploadError } = await supabase.storage
        .from('screenshots')
        .upload(originalFileName, tempImageFile, { upsert: true });

      if (originalUploadError) throw originalUploadError;

      // Upload cropped image
      const croppedFileName = `grid-${currentSquare.coordinate}-${timestamp}-cropped.${fileExt}`;
      const { error: croppedUploadError } = await supabase.storage
        .from('screenshots')
        .upload(croppedFileName, croppedImageBlob, { upsert: true });

      if (croppedUploadError) throw croppedUploadError;

      // Get public URLs
      const { data: originalUrlData } = supabase.storage
        .from('screenshots')
        .getPublicUrl(originalFileName);

      const { data: croppedUrlData } = supabase.storage
        .from('screenshots')
        .getPublicUrl(croppedFileName);

      // Round crop coordinates to integers for database storage
      const roundedCropData = {
        x: Math.round(cropData.x),
        y: Math.round(cropData.y),
        width: Math.round(cropData.width),
        height: Math.round(cropData.height)
      };

      // Update grid square with both original and cropped URLs, plus crop metadata
      const { data, error } = await supabase
        .from('grid_squares')
        .update({
          screenshot_url: croppedUrlData.publicUrl,
          original_screenshot_url: originalUrlData.publicUrl,
          crop_x: roundedCropData.x,
          crop_y: roundedCropData.y,
          crop_width: roundedCropData.width,
          crop_height: roundedCropData.height,
          crop_created_at: new Date().toISOString(),
          uploaded_by: user.id,
          upload_date: new Date().toISOString(),
          is_explored: true
        })
        .eq('coordinate', currentSquare.coordinate)
        .select()
        .single();

      if (error) throw error;

      setCurrentSquare(data);
      onUpdate(data);
      setSuccess('Screenshot uploaded and cropped successfully');
      
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
        .update({
          screenshot_url: publicUrlData.publicUrl,
          original_screenshot_url: publicUrlData.publicUrl,
          crop_x: null,
          crop_y: null,
          crop_width: null,
          crop_height: null,
          crop_created_at: null,
          uploaded_by: user.id,
          upload_date: new Date().toISOString()
        })
        .eq('id', currentSquare.id)
        .select()
        .single();

      if (error) throw error;

      setCurrentSquare(data);
      onUpdate(data);
      setSuccess('Screenshot uploaded successfully!');
      
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
      setError('No original image available for editing');
      return;
    }

    console.log('Starting crop edit with original URL:', currentSquare.original_screenshot_url);
    console.log('Current crop data:', {
      x: currentSquare.crop_x,
      y: currentSquare.crop_y,
      width: currentSquare.crop_width,
      height: currentSquare.crop_height
    });

    // Create a new image URL with cache-busting to avoid CORS issues
    const originalUrl = new URL(currentSquare.original_screenshot_url);
    originalUrl.searchParams.set('t', Date.now().toString());
    
    setTempImageUrl(originalUrl.toString());
    setIsEditingExisting(true);
    setShowCropModal(true);
  };

  // Handle recrop of existing image
  const handleRecropComplete = async (croppedImageBlob: Blob, cropData: PixelCrop) => {
    if (!user) return;

    setIsUploading(true);
    setError(null);

    try {
      // Upload new cropped version
      const timestamp = Date.now();
      const croppedFileName = `grid-${currentSquare.coordinate}-${timestamp}-recropped.jpg`;
      
      const { error: croppedUploadError } = await supabase.storage
        .from('screenshots')
        .upload(croppedFileName, croppedImageBlob, { upsert: true });

      if (croppedUploadError) throw croppedUploadError;

      // Get public URL for new cropped image
      const { data: croppedUrlData } = supabase.storage
        .from('screenshots')
        .getPublicUrl(croppedFileName);

      // Delete old cropped image if it exists and is different from original
      if (currentSquare.screenshot_url && 
          currentSquare.screenshot_url !== currentSquare.original_screenshot_url) {
        try {
          const oldUrl = new URL(currentSquare.screenshot_url);
          const oldFileName = oldUrl.pathname.split('/').pop();
          if (oldFileName) {
            await supabase.storage.from('screenshots').remove([oldFileName]);
          }
        } catch (deleteError) {
          console.warn('Failed to delete old cropped image:', deleteError);
        }
      }

      // Round crop coordinates to integers for database storage
      const roundedCropData = {
        x: Math.round(cropData.x),
        y: Math.round(cropData.y),
        width: Math.round(cropData.width),
        height: Math.round(cropData.height)
      };

      // Update grid square with new crop data
      const { data, error } = await supabase
        .from('grid_squares')
        .update({
          screenshot_url: croppedUrlData.publicUrl,
          crop_x: roundedCropData.x,
          crop_y: roundedCropData.y,
          crop_width: roundedCropData.width,
          crop_height: roundedCropData.height,
          crop_created_at: new Date().toISOString()
        })
        .eq('coordinate', currentSquare.coordinate)
        .select()
        .single();

      if (error) throw error;

      setCurrentSquare(data);
      onUpdate(data);
      setSuccess('Screenshot crop updated successfully');
      
      // Clean up
      setShowCropModal(false);
      setTempImageUrl(null);
      setIsEditingExisting(false);
    } catch (err: any) {
      console.error('Error updating crop:', err);
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

      // Update grid square to remove screenshot reference
      const { data, error } = await supabase
        .from('grid_squares')
        .update({
          screenshot_url: null,
          uploaded_by: null,
          upload_date: null
        })
        .eq('id', currentSquare.id)
        .select()
        .single();

      if (error) throw error;

      setCurrentSquare(data);
      onUpdate(data);
      setSuccess('Screenshot deleted successfully');
    } catch (err: any) {
      console.error('Error deleting screenshot:', err);
      setError(err.message);
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
        // Check if the click is on a gallery backdrop
        const target = event.target as HTMLElement;
        const isGalleryBackdrop = target.classList.contains('bg-night-950/90') || 
                                  target.closest('div[class*="bg-night-950/90"][class*="z-[60"]');
        
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-night-900 border border-night-700 rounded-lg shadow-xl w-[95vw] h-[95vh] max-w-[1400px] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-night-700">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">
                Grid Square {currentSquare.coordinate}
              </h2>
              
              {/* Edit Screenshot Button in Header */}
              {currentSquare.screenshot_url && currentSquare.original_screenshot_url && canUpdateScreenshot && (
                <button
                  onClick={handleEditExistingCrop}
                  className="text-sm bg-amber-600 text-white hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                  title="Edit screenshot crop"
                >
                  <Edit size={14} />
                  Edit
                </button>
              )}
            </div>
            
            {/* Navigation Controls */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => navigateGrid('up')}
                disabled={letterIndex === GRID_SIZE - 1}
                className="p-1.5 hover:bg-night-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sand-300 hover:text-white"
              >
                <ChevronUp size={20} />
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigateGrid('left')}
                  disabled={currentNumber === 1}
                  className="p-1.5 hover:bg-night-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sand-300 hover:text-white"
                >
                  <ChevronLeft size={20} />
                </button>
                <select
                  value={currentSquare.coordinate}
                  onChange={(e) => fetchGridSquare(e.target.value)}
                  className="select w-[4.5rem] text-center px-1 py-1.5 bg-night-700 text-white border-night-600"
                >
                  {gridOptions.map(coord => (
                    <option key={coord} value={coord}>{coord}</option>
                  ))}
                </select>
                <button
                  onClick={() => navigateGrid('right')}
                  disabled={currentNumber === GRID_SIZE}
                  className="p-1.5 hover:bg-night-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sand-300 hover:text-white"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <button
                onClick={() => navigateGrid('down')}
                disabled={letterIndex === 0}
                className="p-1.5 hover:bg-night-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sand-300 hover:text-white"
              >
                <ChevronDown size={20} />
              </button>
            </div>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-sand-400 hover:text-white p-2 rounded-full hover:bg-night-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Success Message */}
        {success && (
          <div className="mx-8 mt-4 p-3 bg-green-900/20 text-green-300 rounded-lg border border-green-700/30 flex items-center">
            <Check size={16} className="mr-2" />
            {success}
          </div>
        )}
        
        {/* Error Display */}
        {error && (
          <div className="mx-8 mt-4 p-3 bg-red-900/20 text-red-300 rounded-lg border border-red-700/30">
            {error}
          </div>
        )}
        
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - POI Controls */}
          <div className="w-80 bg-sand-50 border-r border-sand-300 overflow-hidden">
            <PoiControlPanel
              pois={pois}
              poiTypes={poiTypes}
              customIcons={customIcons}
              selectedPoiTypes={selectedPoiTypes}
              onTypeToggle={handleTypeToggle}
              onCategoryToggle={handleCategoryToggle}
              onToggleAllPois={handleToggleAllPois}
              showCreatePoiButton={true}
              onCreatePoiClick={handleCreatePoiClick}
              compactMode={true}
            />
          </div>

          {/* Center - Interactive Screenshot */}
          <div className="flex-1 flex flex-col bg-sand-200">
            {/* Screenshot Controls */}
            <div className="p-6 border-b border-sand-300">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-night-800">Screenshot</h3>
                <div className="flex items-center gap-3">
                  {/* Placement Mode Toggle */}
                  {user && currentSquare.screenshot_url && (
                    <button
                      onClick={() => setPlacementMode(!placementMode)}
                      className={`flex items-center text-sm px-4 py-2 rounded-full transition-colors ${
                        placementMode 
                          ? 'bg-spice-600 text-white hover:bg-spice-700 shadow-md' 
                          : 'bg-night-600 text-white hover:bg-night-700 shadow-md'
                      }`}
                      title={placementMode ? 'Exit placement mode' : 'Click on map to place POIs'}
                    >
                      <Target size={16} className="mr-1.5" />
                      {placementMode ? 'Exit Placement' : 'Place POI'}
                    </button>
                  )}
                  
                  <button
                    onClick={handleExplorationToggle}
                    className={`flex items-center text-sm px-4 py-2 rounded-full transition-colors ${
                      currentSquare.is_explored 
                        ? 'bg-green-600 text-white hover:bg-green-700 shadow-md' 
                        : 'bg-night-800 text-white hover:bg-night-900 shadow-md'
                    }`}
                  >
                    {currentSquare.is_explored ? (
                      <>
                        <Check size={16} className="mr-1.5" />
                        Explored
                      </>
                    ) : (
                      'Mark as Explored'
                    )}
                  </button>
                  
                  {canUpdateScreenshot && (
                    <button
                      onClick={handleScreenshotUpload}
                      disabled={isUploading}
                      className="btn bg-spice-600 text-white hover:bg-spice-700 text-sm border border-spice-700 shadow-md"
                    >
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Upload size={16} />
                          {currentSquare.screenshot_url ? 'Update' : 'Upload'}
                        </>
                      )}
                    </button>
                  )}

                  {currentSquare.screenshot_url && canDeleteScreenshot && (
                    <button
                      onClick={handleDeleteScreenshot}
                      className="btn bg-red-600 text-white hover:bg-red-700 text-sm border border-red-700 shadow-md"
                      title="Delete screenshot"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              {currentSquare.uploaded_by && uploaderInfo && (
                <div className="mt-3 text-sm text-night-600 flex items-center">
                  <Clock size={14} className="mr-1.5" />
                  <span>
                    Updated by {uploaderInfo.username} on{' '}
                    {new Date(currentSquare.upload_date).toLocaleDateString()} at{' '}
                    {new Date(currentSquare.upload_date).toLocaleTimeString()}
                  </span>
                </div>
              )}
              
              {/* Placement Mode Instructions */}
              {placementMode && (
                <div className="mt-3 p-3 bg-spice-100 text-spice-800 rounded-lg text-sm">
                  <strong>Placement Mode Active:</strong> Click anywhere on the screenshot to place a new POI. Press Escape to cancel.
                </div>
              )}
            </div>

            {/* Interactive Screenshot Area */}
            <div className="flex-1 overflow-hidden relative">
              {currentSquare.screenshot_url ? (
                <>
                  {/* Edit Button Overlay for Screenshot */}
                  {currentSquare.original_screenshot_url && canUpdateScreenshot && (
                    <div className="absolute top-4 left-4 z-20">
                      <button
                        onClick={handleEditExistingCrop}
                        className="bg-amber-600 text-white hover:bg-amber-700 p-2 rounded-lg transition-colors shadow-lg flex items-center gap-1.5"
                        title="Edit screenshot crop"
                      >
                        <Edit size={16} />
                        Edit Crop
                      </button>
                    </div>
                  )}
                  
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
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 bg-sand-100">
                  <Image size={64} className="text-night-500 mb-4" />
                  <p className="text-lg text-night-600 font-medium">No screenshot uploaded</p>
                  {!user && <p className="text-sm mt-2 text-night-500">Sign in to upload screenshots</p>}
                  {user && !canUpdateScreenshot && (
                    <p className="text-sm mt-2 text-night-500">You don't have permission to update this screenshot</p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Right Panel - POI List & Forms */}
          <div className="w-96 p-6 border-l border-night-700 bg-night-900/50 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Points of Interest</h3>
              {user && !showAddPoiForm && (
                <button
                  onClick={handleCreatePoiClick}
                  className="btn bg-spice-600 text-white hover:bg-spice-700 text-sm flex items-center gap-1"
                  title="Create a new POI"
                >
                  <Plus size={16} />
                  Add POI
                </button>
              )}
            </div>
            
            {!user && (
              <div className="mb-6 p-4 bg-night-800 text-sand-300 rounded-lg text-sm">
                <p><strong>Sign in</strong> to create and manage POIs in this grid square.</p>
              </div>
            )}
            
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
              <PoiList 
                pois={pois} 
                poiTypes={poiTypes}
                customIcons={customIcons}
                onDelete={handleDeletePoi}
                onUpdate={handleUpdatePoi}
                onViewScreenshot={() => {}}
                onPoiGalleryOpen={onPoiGalleryOpen}
              />
            )}

            {/* Comments Section */}
            <div className="mt-8">
              <CommentsList gridSquareId={currentSquare.id} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Image Crop Modal */}
      {showCropModal && tempImageUrl && (
        <ImageCropModal
          imageUrl={tempImageUrl}
          onCropComplete={isEditingExisting ? handleRecropComplete : handleCropComplete}
          onClose={handleCloseCropModal}
          onSkip={isEditingExisting ? undefined : handleSkipCrop}
          title={isEditingExisting ? 'Edit Screenshot Crop' : 'Crop Your Screenshot'}
          initialCrop={
            isEditingExisting && currentSquare.crop_x !== null && currentSquare.crop_y !== null && 
            currentSquare.crop_width !== null && currentSquare.crop_height !== null
              ? {
                  x: currentSquare.crop_x,
                  y: currentSquare.crop_y,
                  width: currentSquare.crop_width,
                  height: currentSquare.crop_height,
                }
              : undefined
          }
        />
      )}
    </div>
  );
};

export default GridSquareModal;