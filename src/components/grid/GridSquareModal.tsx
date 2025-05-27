import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { GridSquare as GridSquareType, Poi, PoiType, CustomIcon } from '../../types';
import { useAuth } from '../auth/AuthProvider';
import { Upload, X, Plus, Check, Image, Trash2, Clock, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import PoiList from '../poi/PoiList';
import AddPoiForm from '../poi/AddPoiForm';
import CommentsList from '../comments/CommentsList';
import PoiControlPanel from '../common/PoiControlPanel';
import InteractivePoiImage from '../common/InteractivePoiImage';

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
  const [uploaderInfo, setUploaderInfo] = useState<{ username: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [currentSquare, setCurrentSquare] = useState<GridSquareType>(square);
  
  // POI filtering and control state
  const [selectedPoiTypes, setSelectedPoiTypes] = useState<string[]>([]);
  const [initialFilterSetup, setInitialFilterSetup] = useState(false);
  const [placementMode, setPlacementMode] = useState(false);

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
    if (selectedPoiTypes.length === 0) {
      setSelectedPoiTypes(poiTypes.map(type => type.id));
    } else {
      setSelectedPoiTypes([]);
    }
  };

  const handleExplorationToggle = async () => {
    try {
      const { data, error: updateError } = await supabase
        .from('grid_squares')
        .update({ is_explored: !currentSquare.is_explored })
        .eq('id', currentSquare.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating exploration status:', updateError);
        throw new Error('Failed to update exploration status');
      }

      if (!data) {
        throw new Error('No data returned after update');
      }

      setCurrentSquare(data);
      onUpdate(data);
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

    setIsUploading(true);
    setError(null);

    try {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size must be less than 2MB');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }

      // Generate unique filename with proper extension
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
      
      if (!allowedExtensions.includes(fileExtension)) {
        throw new Error('Unsupported file format. Please use JPG, PNG, or WebP.');
      }

      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = `screenshots/${fileName}`;

      // Delete old screenshot if it exists
      if (currentSquare.screenshot_url) {
        const oldPath = currentSquare.screenshot_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('screenshots')
            .remove([`screenshots/${oldPath}`]);
        }
      }

      // Upload new file
      const { error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('screenshots')
        .getPublicUrl(filePath);

      // Update grid square record
      const { data, error: updateError } = await supabase
        .from('grid_squares')
        .update({
          screenshot_url: publicUrl,
          uploaded_by: user.id,
          upload_date: new Date().toISOString()
        })
        .eq('id', currentSquare.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setCurrentSquare(data);
      onUpdate(data);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Error uploading screenshot:', err);
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteScreenshot = async () => {
    if (!confirm('Are you sure you want to delete this screenshot?')) return;

    try {
      // Delete from storage
      if (currentSquare.screenshot_url) {
        const path = currentSquare.screenshot_url.split('/').pop();
        if (path) {
          await supabase.storage
            .from('screenshots')
            .remove([`screenshots/${path}`]);
        }
      }

      // Update database
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
    if (onPoiSuccessfullyAdded) {
      // Add slight delay to ensure database transaction completes
      setTimeout(() => {
        onPoiSuccessfullyAdded();
      }, 100);
    }
  };

  const handleDeletePoi = (poiId: string) => {
    setPois(prev => prev.filter(poi => poi.id !== poiId));
  };

  const handleUpdatePoi = (updatedPoi: Poi) => {
    setPois(prev => prev.map(poi => poi.id === updatedPoi.id ? updatedPoi : poi));
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
            <h2 className="text-2xl font-bold text-white">
              Grid Square {currentSquare.coordinate}
            </h2>
            
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
        
        {/* Error Display */}
        {error && (
          <div className="mx-8 mt-6 p-4 bg-red-900/20 text-red-300 rounded-lg border border-red-700/30">
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
              onCreatePoiClick={() => setShowAddPoiForm(true)}
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
            </div>

            {/* Interactive Screenshot Area */}
            <div className="flex-1 overflow-hidden">
              {currentSquare.screenshot_url ? (
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
                  onClick={() => setShowAddPoiForm(true)}
                  className="btn bg-spice-600 text-white hover:bg-spice-700 text-sm"
                >
                  <Plus size={16} />
                  Add POI
                </button>
              )}
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spice-600"></div>
              </div>
            ) : showAddPoiForm ? (
              <AddPoiForm 
                gridSquareId={currentSquare.id} 
                poiTypes={poiTypes}
                onCancel={() => setShowAddPoiForm(false)}
                onPoiAdded={handleAddPoi}
              />
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
    </div>
  );
};

export default GridSquareModal;