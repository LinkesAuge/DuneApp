import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { GridSquare as GridSquareType, Poi, PoiType } from '../../types';
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
import { Rank } from '../../types/profile';
import { toast } from 'react-hot-toast';
import { uploadPoiScreenshotOriginal, uploadPoiScreenshotCropped } from '../../lib/imageUpload';

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
  const [pois, setPois] = useState<Poi[]>([]);
  const [poiTypes, setPoiTypes] = useState<PoiType[]>([]);

  const [userInfo, setUserInfo] = useState<Record<string, { 
    username: string; 
    display_name?: string | null; 
    custom_avatar_url?: string | null; 
    discord_avatar_url?: string | null; 
    use_discord_avatar?: boolean;
    rank?: Rank | null;
  }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAddPoiForm, setShowAddPoiForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploaderInfo, setUploaderInfo] = useState<{ username: string; rank?: Rank | null } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [currentSquare, setCurrentSquare] = useState<GridSquareType>(square);
  
  // POI filtering and control state
  const [selectedPoiTypes, setSelectedPoiTypes] = useState<string[]>([]);
  const [initialFilterSetup, setInitialFilterSetup] = useState(false);
  const [placementMode, setPlacementMode] = useState(false);
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);

  // Simple screenshot upload state (based on proven POI system)
  const [showUploader, setShowUploader] = useState(false);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [cropData, setCropData] = useState<PixelCrop | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [editingOriginalUrl, setEditingOriginalUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
        const [poisResult, typesResult] = await Promise.all([
          supabase
            .from('pois')
            .select('*')
            .eq('grid_square_id', currentSquare.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('poi_types')
            .select('*')
            .order('category', { ascending: true })
        ]);

        if (poisResult.error) throw poisResult.error;
        if (typesResult.error) throw typesResult.error;

        // If there's an uploader, fetch their username and rank
        if (currentSquare.uploaded_by) {
          const { data: uploaderData, error: uploaderError } = await supabase
            .from('profiles')
            .select('username, rank:ranks(*)')
            .eq('id', currentSquare.uploaded_by)
            .single();

          if (!uploaderError && uploaderData) {
            setUploaderInfo(uploaderData);
          }
        }

        if (isMounted) {
          setPois(poisResult.data || []);
          setPoiTypes(typesResult.data || []);
          
          // Fetch user information for POI creators - Filter out null values to avoid UUID errors
          const userIds = [...new Set((poisResult.data || []).map(poi => poi.created_by).filter(id => id !== null && id !== undefined))];
          if (userIds.length > 0) {
            const { data: userProfiles, error: userError } = await supabase
              .from('profiles')
              .select('id, username, display_name, custom_avatar_url, discord_avatar_url, use_discord_avatar, rank:ranks(*)')
              .in('id', userIds);
            
            if (!userError && userProfiles) {
              const userInfoMap = userProfiles.reduce((acc, profile) => {
                acc[profile.id] = { 
                  username: profile.username, 
                  display_name: profile.display_name, 
                  custom_avatar_url: profile.custom_avatar_url, 
                  discord_avatar_url: profile.discord_avatar_url,
                  use_discord_avatar: profile.use_discord_avatar,
                  rank: profile.rank
                };
                return acc;
              }, {} as Record<string, { 
                username: string; 
                display_name?: string | null; 
                custom_avatar_url?: string | null; 
                discord_avatar_url?: string | null; 
                use_discord_avatar?: boolean;
                rank?: Rank | null;
              }>);
              setUserInfo(userInfoMap);
            }
          } else {
            setUserInfo({});
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

  // Simple file input approach (like POI system)
  const handleScreenshotUpload = () => {
    // Trigger file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        setUploadingFile(file);
        setEditingOriginalUrl(null);
        setIsEditingExisting(false);
        setShowCropModal(true);
      } else {
      }
    };
    input.click();
  };

  // Handle crop completion - saves both original and cropped versions
  const handleCropComplete = async (
    finalPixelCrop: PixelCrop,
    croppedBlob: Blob,
    isFullImageUpload: boolean,
    isFullImageRequestedByUser: boolean,
    cropForProcessing?: PixelCrop
  ) => {
    if (!uploadingFile) {
      console.error('❌ [GridSquareModal] No uploading file found!');
      return;
    }

    setIsProcessing(true);
    setShowCropModal(false);
    try {
      const timestamp = Date.now();
      const coordinate = currentSquare.coordinate;
      const fileExt = uploadingFile.name.split('.').pop() || 'jpg';
      const baseFileName = `grid-${coordinate}-${timestamp}.${fileExt}`;
      let originalUrl = '';
      let displayUrl = '';

      // Step 1: Always upload original file
      const originalUpload = await uploadPoiScreenshotOriginal(uploadingFile, baseFileName);
      originalUrl = originalUpload.url;
      // Step 2: Check if cropping was actually performed  
      const wasActuallyCropped = !isFullImageUpload && croppedBlob;
      if (wasActuallyCropped) {
        const croppedFile = new File([croppedBlob], baseFileName, { type: 'image/webp' });
        const croppedUpload = await uploadPoiScreenshotCropped(croppedFile, baseFileName);
        displayUrl = croppedUpload.url;
      } else {
        // No cropping - use original as display
        displayUrl = originalUrl;
      }

      // Step 3: Update grid square in database
      const updateData = {
        coordinate: currentSquare.coordinate,
        screenshot_url: displayUrl,
        original_screenshot_url: originalUrl,
        crop_x: wasActuallyCropped ? finalPixelCrop.x : null,
        crop_y: wasActuallyCropped ? finalPixelCrop.y : null,
        crop_width: wasActuallyCropped ? finalPixelCrop.width : null,
        crop_height: wasActuallyCropped ? finalPixelCrop.height : null,
        crop_created_at: wasActuallyCropped ? new Date().toISOString() : null,
        uploaded_by: user?.id,
        upload_date: new Date().toISOString(),
        is_explored: true
      };
      const { data, error } = await supabase
        .from('grid_squares')
        .upsert(updateData, {
          onConflict: 'coordinate'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [GridSquareModal] Database update error:', error);
        throw error;
      }
      setCurrentSquare(data);
      onUpdate(data);
      setSuccess('Screenshot uploaded successfully! Both original and display versions saved.');
      
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
      setUploadingFile(null);
    } catch (error: any) {
      console.error('💥 [GridSquareModal] Upload failed:', {
        error: error.message,
        stack: error.stack,
        uploadingFile: uploadingFile?.name,
        coordinate: currentSquare.coordinate
      });
      setError(error.message || 'Failed to upload screenshot');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle editing existing screenshot crop
  const handleEditExistingCrop = () => {
    if (!currentSquare?.original_screenshot_url) {
      setError('No original image available for editing');
      return;
    }

    setIsEditingExisting(true);
    setEditingOriginalUrl(currentSquare.original_screenshot_url);
    
    // Set crop data if it exists
    if (currentSquare.crop_x !== null) {
      setCropData({
        x: currentSquare.crop_x,
        y: currentSquare.crop_y,
        width: currentSquare.crop_width,
        height: currentSquare.crop_height,
        unit: 'px' as const
      });
    }
    
    setShowCropModal(true);
  };

  const handleDeleteScreenshot = async () => {
    if (!confirm('Are you sure you want to delete this screenshot? This action cannot be undone.')) return;

    try {
      setError(null);
      
      // Delete files from storage
      const filesToDelete = [];
      if (currentSquare.screenshot_url) {
        if (!currentSquare.original_screenshot_url || currentSquare.screenshot_url !== currentSquare.original_screenshot_url) {
          const screenshotPath = new URL(currentSquare.screenshot_url).pathname.split('/screenshots/')[1];
          if (screenshotPath) filesToDelete.push(screenshotPath);
        }
      }

      if (currentSquare.original_screenshot_url) {
        const originalPath = new URL(currentSquare.original_screenshot_url).pathname.split('/screenshots/')[1];
        if (originalPath && !filesToDelete.includes(originalPath)) {
          filesToDelete.push(originalPath);
        }
      }

      if (filesToDelete.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from('screenshots')
          .remove(filesToDelete);
        if (deleteError) {
          console.warn('Some files might not have been deleted from storage:', deleteError);
        }
      }

      // Update database
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
        source: 'delete'
      });
      
      if (onExplorationStatusChanged) {
        onExplorationStatusChanged();
      }
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

  const handleDeletePoi = async (poiId: string) => {
    try {
      // Use comprehensive deletion API that handles all cleanup
      const { deletePOIWithCleanup } = await import('../../lib/api/pois');
      const result = await deletePOIWithCleanup(poiId);

      if (!result.success) {
        console.error('Error deleting POI:', result.error);
        setError(`Failed to delete POI: ${result.error}`);
        return;
      }

      // Show warnings for non-critical errors (e.g., some files couldn't be deleted)
      if (result.errors && result.errors.length > 0) {
        console.warn('POI deleted with some cleanup warnings:', result.errors);
        setError(`POI deleted successfully, but some cleanup warnings: ${result.errors.join(', ')}`);
      }

      // Update local state
      setPois(prev => prev.filter(poi => poi.id !== poiId));
      setSuccess('POI deleted successfully');
    } catch (error) {
      console.error('Error deleting POI:', error);
      setError('Failed to delete POI');
    }
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
                    {canUpdateScreenshot && (
                      <>
                        <button
                          onClick={handleEditExistingCrop}
                          className="btn btn-outline text-xs"
                        >
                          <Edit size={14} className="mr-1" />
                          Edit Crop
                        </button>
                        <button
                          onClick={handleDeleteScreenshot}
                          className="btn btn-outline btn-danger text-xs"
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete
                        </button>
                      </>
                    )}
                    {!canUpdateScreenshot && currentSquare.screenshot_url && (
                      <p className={`text-xs ${getThemedTextColor('muted')} mt-2`}>You can only replace screenshots you uploaded.</p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleScreenshotUpload}
                    disabled={isProcessing || !canUpdateScreenshot}
                    className={`btn btn-primary text-sm w-full justify-center ${!canUpdateScreenshot ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isProcessing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                    {isProcessing ? 'Processing...' : 'Upload Screenshot'}
                  </button>
                </>
              )}

               {uploaderInfo && (
                <div className={`text-xs ${getThemedTextColor('muted')} pt-2 flex items-center flex-wrap gap-1`}>
                  <span>Uploaded by:</span>
                  <span className={getThemedTextColor('secondary')}>{uploaderInfo.username}</span>
                  {uploaderInfo.rank && (
                    <span 
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border"
                      style={{ 
                        backgroundColor: `${uploaderInfo.rank.color}20`,
                        borderColor: `${uploaderInfo.rank.color}40`, 
                        color: uploaderInfo.rank.text_color,
                        fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif"
                      }}
                    >
                      <Award className="w-2.5 h-2.5 mr-1" style={{ color: uploaderInfo.rank.text_color }} />
                      {uploaderInfo.rank.name}
                    </span>
                  )}
                  <span>on {new Date(currentSquare.updated_at || currentSquare.created_at).toLocaleDateString()}</span>
                </div>
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
      
      {/* Simple Crop Modal */}
      {showCropModal && (uploadingFile || editingOriginalUrl) && (
        <ImageCropModal
          file={uploadingFile}
          imageUrl={editingOriginalUrl}
          isOpen={showCropModal}
          onClose={() => {
            setShowCropModal(false);
            setUploadingFile(null);
            setEditingOriginalUrl(null);
          }}
          onCropComplete={handleCropComplete}
          existingCrop={cropData}
          aspect={undefined} // Allow freeform cropping
          title={isEditingExisting ? 'Edit Screenshot Crop' : 'Crop Screenshot'}
        />
      )}
    </div>
  );
};

export default GridSquareModal;