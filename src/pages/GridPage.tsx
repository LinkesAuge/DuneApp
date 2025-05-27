import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GridSquare, Poi, PoiType, CustomIcon } from '../types';
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Upload, Image, Plus, MapPin } from 'lucide-react';

// Grid validation: A1-I9 pattern
const VALID_GRID_PATTERN = /^[A-I][1-9]$/;
const GRID_ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
const GRID_COLS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

interface GridPageParams {
  gridId: string;
}

const GridPage: React.FC = () => {
  const { gridId } = useParams<GridPageParams>();
  const navigate = useNavigate();
  
  // Debug logging
  console.log('GridPage rendered with gridId:', gridId);
  console.log('Grid pattern test:', gridId ? VALID_GRID_PATTERN.test(gridId) : 'gridId is null/undefined');
  
  // Validate grid ID format
  if (!gridId || !VALID_GRID_PATTERN.test(gridId)) {
    console.log('Grid validation failed, redirecting to /deep-desert');
    return <Navigate to="/deep-desert" replace />;
  }

  const [gridSquare, setGridSquare] = useState<GridSquare | null>(null);
  const [pois, setPois] = useState<Poi[]>([]);
  const [poiTypes, setPoiTypes] = useState<PoiType[]>([]);
  const [customIcons, setCustomIcons] = useState<CustomIcon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Panel visibility state
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(true);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);



  // Calculate adjacent grids for navigation with wrap-around
  const getAdjacentGrids = (currentGrid: string) => {
    const row = currentGrid[0];
    const col = currentGrid[1];
    const rowIndex = GRID_ROWS.indexOf(row);
    const colIndex = GRID_COLS.indexOf(col);

    return {
      // UP: Move to next letter in sequence (A->B->C...->I->A) - visual up since I is at top, A at bottom
      up: GRID_ROWS[(rowIndex + 1) % GRID_ROWS.length] + col,
      // DOWN: Move to previous letter in sequence (I->H->G...->A->I) - visual down
      down: GRID_ROWS[(rowIndex - 1 + GRID_ROWS.length) % GRID_ROWS.length] + col,
      // LEFT: Move to previous number with wrap-around (1->9, 2->1, etc.)
      left: row + GRID_COLS[(colIndex - 1 + GRID_COLS.length) % GRID_COLS.length],
      // RIGHT: Move to next number with wrap-around (9->1, 1->2, etc.)
      right: row + GRID_COLS[(colIndex + 1) % GRID_COLS.length],
    };
  };

  const adjacentGrids = getAdjacentGrids(gridId);

  // Fetch grid square data
  useEffect(() => {
    const fetchGridData = async () => {
      try {
        console.log('Starting data fetch for grid:', gridId);
        setLoading(true);
        setError(null);

        // Fetch grid square by coordinate (not by id)
        const { data: gridData, error: gridError } = await supabase
          .from('grid_squares')
          .select('*')
          .eq('coordinate', gridId)
          .single();

        let gridSquareData: any;
        if (gridError) {
          if (gridError.code === 'PGRST116') {
            // Grid square doesn't exist in database - create a default one
            gridSquareData = {
              id: null, // No ID since it doesn't exist in database
              coordinate: gridId,
              screenshot_url: null,
              uploaded_by: null,
              upload_date: null,
              is_explored: false
            };
            setGridSquare(gridSquareData);
          } else {
            throw gridError;
          }
        } else {
          gridSquareData = gridData;
          setGridSquare(gridData);
        }

        // Fetch POIs for this grid (only if grid square exists in database)
        let poisData = [];
        if (gridSquareData.id) {
          const { data, error: poisError } = await supabase
            .from('pois')
            .select('*')
            .eq('grid_square_id', gridSquareData.id)
            .order('created_at', { ascending: false });

          if (poisError) throw poisError;
          poisData = data || [];
        }
        setPois(poisData);

        // Fetch POI types
        const { data: typesData, error: typesError } = await supabase
          .from('poi_types')
          .select('*')
          .order('category', { ascending: true });

        if (typesError) throw typesError;
        setPoiTypes(typesData || []);

        // Fetch custom icons
        const { data: iconsData, error: iconsError } = await supabase
          .from('custom_icons')
          .select('*')
          .order('name', { ascending: true });

        if (iconsError) throw iconsError;
        setCustomIcons(iconsData || []);

      } catch (err) {
        console.error('Error fetching grid data:', err);
        setError('Failed to load grid data');
      } finally {
        console.log('Data fetch completed for grid:', gridId);
        setLoading(false);
      }
    };

    fetchGridData();
  }, [gridId]);



  // Navigation handlers
  const handleBackToOverview = () => {
    navigate('/deep-desert');
  };

  const handleNavigateToGrid = (targetGridId: string) => {
    navigate(`/deep-desert/grid/${targetGridId}`);
  };

  // Upload handlers
  const handleFileUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      console.error('Please select an image file');
      return;
    }

    try {
      setUploading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        return;
      }

      // Create unique filename
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${gridId}-${timestamp}.${fileExt}`;
      const filePath = `screenshots/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('screenshots')
        .getPublicUrl(filePath);

      // Create or update grid square in database
      let gridSquareData;
      if (gridSquare?.id) {
        // Update existing grid square
        const { data, error } = await supabase
          .from('grid_squares')
          .update({
            screenshot_url: publicUrl,
            uploaded_by: user.id,
            upload_date: new Date().toISOString(),
            is_explored: true
          })
          .eq('id', gridSquare.id)
          .select()
          .single();

        if (error) throw error;
        gridSquareData = data;
      } else {
        // Create new grid square
        const { data, error } = await supabase
          .from('grid_squares')
          .insert({
            coordinate: gridId,
            screenshot_url: publicUrl,
            uploaded_by: user.id,
            upload_date: new Date().toISOString(),
            is_explored: true
          })
          .select()
          .single();

        if (error) throw error;
        gridSquareData = data;
      }

      setGridSquare(gridSquareData);
      console.log('Screenshot uploaded successfully');

    } catch (error) {
      console.error('Error uploading screenshot:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Loading state
  if (loading) {
    console.log('GridPage: Still loading data...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spice-600 mx-auto mb-4"></div>
          <div className="text-night-600">Loading Grid {gridId}...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-100">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={handleBackToOverview}
            className="btn btn-primary"
          >
            Back to Deep Desert
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-sand-100 flex flex-col overflow-hidden">
      {/* Header Bar */}
      <div className="bg-white border-b border-sand-200 px-4 py-3 flex items-center justify-center">
        <div className="w-full max-w-6xl flex items-center justify-between">
          {/* Left Section - Back Button */}
          <div className="flex-1">
            <button
              onClick={handleBackToOverview}
              className="flex items-center gap-2 text-night-600 hover:text-night-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Deep Desert
            </button>
          </div>

          {/* Center Section - Title */}
          <div className="flex-1 flex justify-center">
            <h1 className="text-xl font-bold text-night-800">
              Grid Square {gridId}
            </h1>
          </div>

          {/* Right Section - Navigation Controls */}
          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-2">
              {/* Left/Right Navigation */}
              <button
                onClick={() => handleNavigateToGrid(adjacentGrids.left)}
                className="px-3 py-1 text-sm rounded bg-spice-100 text-spice-700 hover:bg-spice-200"
                title={`Go left to ${adjacentGrids.left}`}
              >
                ← {adjacentGrids.left}
              </button>
              <button
                onClick={() => handleNavigateToGrid(adjacentGrids.right)}
                className="px-3 py-1 text-sm rounded bg-spice-100 text-spice-700 hover:bg-spice-200"
                title={`Go right to ${adjacentGrids.right}`}
              >
                {adjacentGrids.right} →
              </button>
              
              {/* Vertical separator */}
              <div className="h-6 w-px bg-sand-300 mx-1" />
              
              {/* Up/Down Navigation */}
              <button
                onClick={() => handleNavigateToGrid(adjacentGrids.up)}
                className="px-3 py-1 text-sm rounded bg-spice-100 text-spice-700 hover:bg-spice-200"
                title={`Go up to ${adjacentGrids.up}`}
              >
                ↑ {adjacentGrids.up}
              </button>
              <button
                onClick={() => handleNavigateToGrid(adjacentGrids.down)}
                className="px-3 py-1 text-sm rounded bg-spice-100 text-spice-700 hover:bg-spice-200"
                title={`Go down to ${adjacentGrids.down}`}
              >
                ↓ {adjacentGrids.down}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - POI Controls */}
        <div className={`${showLeftPanel ? 'w-80' : 'w-12'} bg-white border-r border-sand-200 flex flex-col transition-all duration-200`}>
          <div className="p-4 border-b border-sand-200 flex items-center justify-between">
            {showLeftPanel && (
              <h2 className="text-lg font-semibold text-night-800">POI Controls</h2>
            )}
            <button
              onClick={() => setShowLeftPanel(!showLeftPanel)}
              className="p-1 rounded hover:bg-sand-100 text-sand-600 hover:text-sand-800"
              title={showLeftPanel ? "Collapse panel" : "Expand panel"}
            >
              {showLeftPanel ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
          {showLeftPanel && (
            <div className="flex-1 overflow-y-auto p-4">
              {/* Add POI Button */}
              <div className="mb-4">
                <button
                  onClick={() => {
                    // TODO: Implement add POI functionality
                    console.log('Add POI clicked');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all bg-white border-2 border-spice-200 text-spice-700 hover:bg-spice-50 hover:border-spice-300"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Point of Interest</span>
                </button>
              </div>
              
              {/* POI filtering and creation controls */}
              <div className="text-sand-600">
                POI filtering and other controls will be implemented here
              </div>
            </div>
          )}
        </div>

        {/* Center Panel - Interactive Screenshot */}
        <div className="flex-1 bg-sand-50 flex items-center justify-center relative">
          {gridSquare?.screenshot_url ? (
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={gridSquare.screenshot_url}
                alt={`Grid ${gridId} screenshot`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-md w-full">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-spice-400 bg-spice-50'
                      : 'border-sand-300 bg-white hover:border-sand-400'
                  } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <div className="mb-4">
                    {uploading ? (
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spice-600 mx-auto"></div>
                    ) : (
                      <Image className="h-12 w-12 text-sand-400 mx-auto" />
                    )}
                  </div>
                  
                  <div className="text-lg font-medium text-night-800 mb-2">
                    {uploading ? 'Uploading...' : 'Upload Screenshot'}
                  </div>
                  
                  <div className="text-sand-600 mb-4">
                    {uploading
                      ? 'Processing your screenshot...'
                      : 'Drag and drop an image here, or click to select'
                    }
                  </div>
                  
                  {!uploading && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-primary inline-flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Choose File
                    </button>
                  )}
                  
                  <div className="text-xs text-sand-500 mt-4">
                    Supported formats: JPG, PNG, GIF, WEBP
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Mini Map Panel */}
          <div className={`absolute top-4 right-4 bg-white border border-sand-200 rounded-lg shadow-lg transition-all duration-200 ${
            showMiniMap ? 'w-64' : 'w-12'
          }`}>
            <div className="p-3 border-b border-sand-200 flex items-center justify-between">
              <button
                onClick={() => setShowMiniMap(!showMiniMap)}
                className="p-1 rounded hover:bg-sand-100 text-sand-600 hover:text-sand-800"
                title={showMiniMap ? "Collapse mini map" : "Expand mini map"}
              >
                {showMiniMap ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showMiniMap && (
                <div className="text-sm font-semibold text-night-800">Grid Navigation</div>
              )}
            </div>
            {showMiniMap && (
              <div className="p-3">
                <div className="grid grid-cols-9 gap-1">
                  {GRID_ROWS.slice().reverse().map((row) =>
                    GRID_COLS.map((col) => {
                      const cellId = row + col;
                      const isCurrent = cellId === gridId;
                      return (
                        <button
                          key={cellId}
                          onClick={() => handleNavigateToGrid(cellId)}
                          className={`w-6 h-6 text-xs rounded transition-colors ${
                            isCurrent
                              ? 'bg-spice-600 text-white font-bold'
                              : 'bg-sand-100 text-sand-700 hover:bg-sand-200'
                          }`}
                          title={`Navigate to grid ${cellId}`}
                        >
                          {cellId}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - POI List/Forms/Comments */}
        <div className={`${showRightPanel ? 'w-80' : 'w-12'} bg-white border-l border-sand-200 flex flex-col transition-all duration-200`}>
          <div className="p-4 border-b border-sand-200 flex items-center justify-between">
            <button
              onClick={() => setShowRightPanel(!showRightPanel)}
              className="p-1 rounded hover:bg-sand-100 text-sand-600 hover:text-sand-800"
              title={showRightPanel ? "Collapse panel" : "Expand panel"}
            >
              {showRightPanel ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
            {showRightPanel && (
              <h2 className="text-lg font-semibold text-night-800">POIs & Info</h2>
            )}
          </div>
          {showRightPanel && (
            <div className="flex-1 overflow-y-auto p-4">
              {pois.length > 0 ? (
                <div className="space-y-3">
                  {pois.map((poi) => (
                    <div key={poi.id} className="p-3 bg-sand-50 rounded-lg">
                      <div className="font-medium text-night-800">{poi.name}</div>
                      {poi.description && (
                        <div className="text-sm text-night-600 mt-1">{poi.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sand-600">No POIs in this grid square</div>
              )}
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default GridPage; 