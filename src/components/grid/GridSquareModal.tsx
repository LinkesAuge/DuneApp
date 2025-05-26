import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { GridSquare as GridSquareType, Poi, PoiType } from '../../types';
import { useAuth } from '../auth/AuthProvider';
import { Upload, X, Plus, Check, Image, Trash2, Clock, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import PoiList from '../poi/PoiList';
import AddPoiForm from '../poi/AddPoiForm';
import CommentsList from '../comments/CommentsList';

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
  const [isLoading, setIsLoading] = useState(false);
  const [showAddPoiForm, setShowAddPoiForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploaderInfo, setUploaderInfo] = useState<{ username: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [currentSquare, setCurrentSquare] = useState<GridSquareType>(square);
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);

  // Parse current coordinates
  const currentLetter = currentSquare.coordinate.charAt(0);
  const currentNumber = parseInt(currentSquare.coordinate.charAt(1));
  const letterIndex = currentLetter.charCodeAt(0) - 65; // Convert A-I to 0-8

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
        // Fetch POIs and POI types
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
  }, [currentSquare.id, currentSquare.uploaded_by]);

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
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Only JPEG, PNG, and WebP images are allowed');
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `grid-screenshots/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error('Failed to upload image');
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('screenshots')
        .getPublicUrl(filePath);

      // Update grid square
      const { data, error: updateError } = await supabase
        .from('grid_squares')
        .update({ 
          screenshot_url: publicUrlData.publicUrl,
          uploaded_by: user.id,
          upload_date: new Date().toISOString()
        })
        .eq('id', currentSquare.id)
        .select()
        .single();

      if (updateError) {
        // Clean up uploaded file if update fails
        await supabase.storage
          .from('screenshots')
          .remove([filePath]);
        throw updateError;
      }

      if (!data) {
        throw new Error('No data returned after update');
      }

      setUploaderInfo({ username: user.username });
      setCurrentSquare(data);
      onUpdate(data);
    } catch (err: any) {
      console.error('Error uploading screenshot:', err);
      setError(err.message || 'Failed to update grid square');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteScreenshot = async () => {
    if (!confirm('Are you sure you want to delete this screenshot?')) return;

    try {
      const { data, error: updateError } = await supabase
        .from('grid_squares')
        .update({ 
          screenshot_url: null,
          uploaded_by: null,
          upload_date: null
        })
        .eq('id', currentSquare.id)
        .select()
        .single();

      if (updateError) {
        throw new Error('Failed to delete screenshot');
      }

      if (!data) {
        throw new Error('No data returned after update');
      }

      setUploaderInfo(null);
      setCurrentSquare(data);
      onUpdate(data);
    } catch (err: any) {
      console.error('Error deleting screenshot:', err);
      setError(err.message);
    }
  };

  // Check if the current user can update this grid square
  const canUpdateScreenshot = user && (
    user.role === 'admin' || 
    user.role === 'editor' || 
    (user.role === 'member' && (!currentSquare.uploaded_by || user.id === currentSquare.uploaded_by))
  );

  const canDeleteScreenshot = user && (
    user.role === 'admin' || 
    user.role === 'editor' || 
    user.id === currentSquare.uploaded_by
  );

  const handleAddPoi = (newPoi: Poi) => {
    console.log('[GridSquareModal] POI added, updating local state:', newPoi);
    setPois(prevPois => [newPoi, ...prevPois]);
    setShowAddPoiForm(false);
    if (onPoiSuccessfullyAdded) {
      console.log('[GridSquareModal] Calling onPoiSuccessfullyAdded callback');
      onPoiSuccessfullyAdded();
    } else {
      console.warn('[GridSquareModal] onPoiSuccessfullyAdded callback not provided');
    }
  };

  const handleDeletePoi = (poiId: string) => {
    setPois(prevPois => prevPois.filter(poi => poi.id !== poiId));
  };

  const handleUpdatePoi = (updatedPoi: Poi) => {
    setPois(prevPois => prevPois.map(poi => poi.id === updatedPoi.id ? updatedPoi : poi));
  };

  // Click outside to close modal, unless clicking on the gallery backdrop
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // console.log("[GridSquareModal] handleClickOutside triggered. Target: ", event.target);
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        // Check if the click target or its parent is part of the GridGallery (which has a higher z-index)
        // This is a heuristic. A more robust solution might involve a global state or context for overlays.
        const galleryBackdrop = (event.target as HTMLElement).closest('div[class*="bg-night-950/90"][class*="z-[60"]');
        if (galleryBackdrop) {
          // console.log("[GridSquareModal] Click target is part of GridGallery. Ignoring.");
          return; // Do not close if the click is on the gallery backdrop
        }
        onClose();
      } else {
        // console.log("[GridSquareModal] Click was inside modal.");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Generate grid options for dropdown
  const gridOptions = Array.from({ length: GRID_SIZE }, (_, i) => {
    const letter = String.fromCharCode(65 + i);
    return Array.from({ length: GRID_SIZE }, (_, j) => `${letter}${j + 1}`);
  }).flat();

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onImageClick && currentSquare.screenshot_url) {
      onImageClick(currentSquare);
    }
  };

  return (
    <div className="fixed inset-0 bg-night-950/90 flex items-center justify-center z-50 p-2">
      <div 
        ref={modalRef}
        className="bg-night-800 rounded-xl shadow-2xl w-[98vw] h-[96vh] overflow-hidden flex flex-col border border-night-700"
      >
        {/* Modal header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-night-700 bg-night-900">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">Grid Square {currentSquare.coordinate}</h2>
            
            {/* Grid Navigation */}
            <div className="flex items-center">
              <div className="flex flex-col items-center">
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
        
        {/* Modal content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {error && (
            <div className="mx-8 mt-6 p-4 bg-red-900/20 text-red-300 rounded-lg border border-red-700/30">
              {error}
            </div>
          )}
          
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left side - Screenshot */}
            <div className="lg:w-2/3 p-8 flex flex-col min-h-0 bg-sand-200">
              <div className="mb-6 flex justify-between items-center">
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
              
              <div className="flex-1 bg-sand-100 rounded-xl overflow-hidden flex items-center justify-center border border-sand-300">
                {currentSquare.screenshot_url ? (
                  <img 
                    src={currentSquare.screenshot_url} 
                    alt={`Grid ${currentSquare.coordinate}`}
                    className="max-w-full max-h-full object-contain cursor-zoom-in"
                    onClick={handleImageClick}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8">
                    <Image size={64} className="text-night-500 mb-4" />
                    <p className="text-lg text-night-600 font-medium">No screenshot uploaded</p>
                    {!user && <p className="text-sm mt-2 text-night-500">Sign in to upload screenshots</p>}
                    {user && !canUpdateScreenshot && (
                      <p className="text-sm mt-2 text-night-500">You don't have permission to update this screenshot</p>
                    )}
                  </div>
                )}
              </div>
              
              {currentSquare.uploaded_by && uploaderInfo && (
                <div className="mt-4 text-sm text-night-600 flex items-center">
                  <Clock size={14} className="mr-1.5" />
                  <span>
                    Updated by {uploaderInfo.username} on{' '}
                    {new Date(currentSquare.upload_date).toLocaleDateString()} at{' '}
                    {new Date(currentSquare.upload_date).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
            
            {/* Right side - POIs */}
            <div className="lg:w-1/3 p-8 border-t lg:border-t-0 lg:border-l border-night-700 bg-night-900/50 overflow-y-auto">
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
                  onDelete={handleDeletePoi}
                  onUpdate={handleUpdatePoi}
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
    </div>
  );
};

export default GridSquareModal;