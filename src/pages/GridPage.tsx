import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { supabase } from '../lib/supabase';
import { GridSquare, Poi, PoiType, CustomIcon, PixelCoordinates, PoiCollection } from '../types';
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Upload, Image, Plus, MapPin, Target, ZoomIn, ZoomOut, RotateCcw, Filter, Settings, FolderOpen, Share, Edit, Eye, Lock, Users, HelpCircle } from 'lucide-react';
import POIPlacementModal from '../components/hagga-basin/POIPlacementModal';
import POIEditModal from '../components/hagga-basin/POIEditModal';
import HaggaBasinPoiCard from '../components/hagga-basin/HaggaBasinPoiCard';
import MapPOIMarker from '../components/hagga-basin/MapPOIMarker';
import CollectionModal from '../components/hagga-basin/CollectionModal';
import CustomPoiTypeModal from '../components/hagga-basin/CustomPoiTypeModal';
import SharePoiModal from '../components/hagga-basin/SharePoiModal';
import GridGallery from '../components/grid/GridGallery';
import POIPanel from '../components/common/POIPanel';
import { useAuth } from '../components/auth/AuthProvider';
import ImageCropModal from '../components/grid/ImageCropModal';
import { PixelCrop } from 'react-image-crop';
import { broadcastExplorationChange } from '../lib/explorationEvents';

// Grid validation: A1-I9 pattern
const VALID_GRID_PATTERN = /^[A-I][1-9]$/;
const GRID_ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
const GRID_COLS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

interface GridPageParams extends Record<string, string | undefined> {
  gridId: string;
}

const GridPage: React.FC = () => {
  const { gridId } = useParams<GridPageParams>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
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
  const [collections, setCollections] = useState<PoiCollection[]>([]);
  const [userInfo, setUserInfo] = useState<{ [key: string]: { username: string } }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Panel visibility state
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(true);

  // Sidebar tab state
  const [activeTab, setActiveTab] = useState<'filters' | 'customization' | 'layers'>('filters');

  // Filter state - Same as Hagga Basin  
  const [selectedPoiTypes, setSelectedPoiTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [privacyFilter, setPrivacyFilter] = useState<'all' | 'public' | 'private' | 'shared'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [initialFilterSetup, setInitialFilterSetup] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // POI placement state
  const [showPoiModal, setShowPoiModal] = useState(false);
  const [placementMode, setPlacementMode] = useState(false);
  const [placementReady, setPlacementReady] = useState(false); // User clicked "Place Marker"
  const [placementCoordinates, setPlacementCoordinates] = useState<PixelCoordinates | null>(null);

  // POI interaction state (same as Hagga Basin)
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [editingPoi, setEditingPoi] = useState<Poi | null>(null);

  // Modal state - Same as Hagga Basin
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showCustomPoiTypeModal, setShowCustomPoiTypeModal] = useState(false);
  const [showSharePoiModal, setShowSharePoiModal] = useState(false);
  const [selectedPoiForShare, setSelectedPoiForShare] = useState<Poi | null>(null);
  const [editingPoiType, setEditingPoiType] = useState<PoiType | null>(null);

  // Gallery state
  const [showGallery, setShowGallery] = useState(false);
  const [galleryPoi, setGalleryPoi] = useState<Poi | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Help tooltip state
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);

  // Highlighted POI state for navigation focus
  const [highlightedPoiId, setHighlightedPoiId] = useState<string | null>(null);

  // Zoom/Pan state for interactive screenshots
  const [currentZoom, setCurrentZoom] = useState(0.8); // Changed from 0.4 to 0.8 for smaller Deep Desert screenshots
  const [imageLoaded, setImageLoaded] = useState(false);
  const [deepDesertMapSettings, setDeepDesertMapSettings] = useState({
    iconMinSize: 32,
    iconMaxSize: 64,
    iconBaseSize: 32,
    showTooltips: true,
    // Additional required MapSettings properties
    enablePositionChange: false,
    defaultVisibleTypes: [] as string[],
    enableAdvancedFiltering: true,
    showSharedIndicators: true
  });
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);

  // Image cropping state
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [isEditingExisting, setIsEditingExisting] = useState(false);

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

  // Initialize filter state when POI types are loaded (only on initial setup)
  useEffect(() => {
    if (poiTypes.length > 0 && !initialFilterSetup) {
      // By default, select all types and categories on initial load
      setSelectedPoiTypes(poiTypes.map(type => type.id));
      setSelectedCategories([...new Set(poiTypes.map(type => type.category))]);
      setInitialFilterSetup(true);
    }
  }, [poiTypes, initialFilterSetup]);

  // Filter POIs based on current filter state - Same logic as Hagga Basin
  const filteredPois = pois.filter(poi => {
    // Search term filter
    if (searchTerm && !poi.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // POI type filter - Show only selected types (if none selected, show none)
    if (!selectedPoiTypes.includes(poi.poi_type_id)) {
      return false;
    }

    // Privacy filter
    if (privacyFilter !== 'all') {
      if (privacyFilter === 'public' && poi.privacy_level !== 'global') {
        return false;
      }
      if (privacyFilter === 'private' && poi.privacy_level !== 'private') {
        return false;
      }
      if (privacyFilter === 'shared' && poi.privacy_level !== 'shared') {
        return false;
      }
    }

    return true;
  });

  // Handle individual POI type toggle - Same as Hagga Basin
  const handleTypeToggle = (typeId: string) => {
    setSelectedPoiTypes(prev => {
      if (prev.includes(typeId)) {
        return prev.filter(id => id !== typeId);
      } else {
        return [...prev, typeId];
      }
    });
  };

  // Get user-created POI types for display in customization tab
  const userCreatedPoiTypes = poiTypes.filter(type => type.created_by === user?.id);

  // Handle category toggle - Same as Hagga Basin  
  const handleCategoryToggle = (category: string, checked: boolean) => {
    const categoryTypeIds = poiTypes
      .filter(type => type.category === category)
      .map(type => type.id);

    if (checked) {
      setSelectedCategories(prev => [...prev, category]);
      setSelectedPoiTypes(prev => {
        const newTypes = [...prev];
        categoryTypeIds.forEach(typeId => {
          if (!newTypes.includes(typeId)) {
            newTypes.push(typeId);
          }
        });
        return newTypes;
      });
    } else {
      setSelectedCategories(prev => prev.filter(c => c !== category));
      setSelectedPoiTypes(prev => prev.filter(typeId => !categoryTypeIds.includes(typeId)));
    }
  };

  // Handle "All POIs" toggle - Same as Hagga Basin
  const handleToggleAllPois = () => {
    // Check if all POI types are currently selected
    const allTypeIds = poiTypes.map(type => type.id);
    const allTypesSelected = allTypeIds.length > 0 && allTypeIds.every(id => selectedPoiTypes.includes(id));
    
    if (allTypesSelected) {
      // Hide all POIs
      setSelectedCategories([]);
      setSelectedPoiTypes([]);
    } else {
      // Show all POIs
      const allCategories = [...new Set(poiTypes.map(type => type.category))];
      setSelectedCategories(allCategories);
      setSelectedPoiTypes(allTypeIds);
    }
  };

  // Handle "Other Types" toggle - Same as Hagga Basin
  const handleOtherTypesToggle = () => {
    const mainCategories = ['Base', 'Resources', 'Locations', 'NPCs'];
    const otherCategories = categories.filter(cat => !mainCategories.includes(cat));
    const otherTypeIds = poiTypes
      .filter(type => otherCategories.includes(type.category))
      .map(type => type.id);
    
    // Check if any other types are currently selected
    const anyOtherTypesSelected = otherTypeIds.some(id => selectedPoiTypes.includes(id));
    
    if (anyOtherTypesSelected) {
      // Deselect all other types
      setSelectedCategories(prev => prev.filter(cat => !otherCategories.includes(cat)));
      setSelectedPoiTypes(prev => prev.filter(id => !otherTypeIds.includes(id)));
    } else {
      // Select all other types
      setSelectedCategories(prev => [...new Set([...prev, ...otherCategories])]);
      setSelectedPoiTypes(prev => [...new Set([...prev, ...otherTypeIds])]);
    }
  };

  // Get unique categories for filtering
  const categories = [...new Set(poiTypes.map(type => type.category))];

  // Helper function to check if an icon is a URL - Same as Hagga Basin
  const isIconUrl = (icon: string): boolean => {
    return icon.startsWith('http') || icon.startsWith('/') || icon.includes('.');
  };

  // Helper function to get display image URL - Same as Hagga Basin
  const getDisplayImageUrl = (icon: string): string => {
    if (isIconUrl(icon)) {
      return icon;
    }
    return icon; // Return emoji as-is
  };

  // Helper function to render a category section - Exact same as Hagga Basin
  const renderCategorySection = (category: string) => {
    const categoryTypes = poiTypes.filter(type => type.category === category);
    const categoryTypeIds = categoryTypes.map(type => type.id);
    
    // A category is "visible" if ALL its types are selected
    const categoryVisible = categoryTypeIds.length > 0 && categoryTypeIds.every(id => selectedPoiTypes.includes(id));
    
    return (
      <div key={category} className="mb-3">
        {/* Category Header - More prominent styling */}
        <div className="bg-sand-100 border border-sand-200 rounded-lg px-3 py-2 mb-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={categoryVisible}
                onChange={(e) => handleCategoryToggle(category, e.target.checked)}
                className="rounded border-sand-300 text-spice-600 focus:ring-spice-500"
              />
              <span className="ml-2 text-sm font-semibold text-sand-900 capitalize group-hover:text-spice-700 transition-colors">
                {category}
              </span>
            </label>
            <span className="text-xs text-sand-600 font-medium">
              {categoryTypes.length}
            </span>
          </div>
        </div>
        
        {/* Individual POI Types in Category - No indentation, less spacing */}
        <div className="space-y-0.5">
          {categoryTypes.map(type => {
            const typePoiCount = filteredPois.filter(poi => poi.poi_type_id === type.id).length;
            const isTypeSelected = selectedPoiTypes.includes(type.id);
            
            return (
              <label 
                key={type.id} 
                className={`flex items-center justify-between cursor-pointer group px-2 py-1 rounded transition-all ${
                  !categoryVisible 
                    ? 'opacity-40 cursor-not-allowed' 
                    : isTypeSelected 
                      ? 'hover:bg-spice-50' 
                      : 'opacity-60 hover:opacity-80 hover:bg-sand-50'
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isTypeSelected}
                    onChange={() => handleTypeToggle(type.id)}
                    disabled={!categoryVisible}
                    className="rounded border-sand-300 text-spice-600 focus:ring-spice-500 w-3 h-3"
                  />
                  
                  {/* POI Type Icon */}
                  <div 
                    className="w-4 h-4 rounded flex items-center justify-center ml-2 mr-2 flex-shrink-0"
                    style={{
                      backgroundColor: type.icon_has_transparent_background && isIconUrl(type.icon) 
                        ? 'transparent' 
                        : type.color
                    }}
                  >
                    {isIconUrl(type.icon) ? (
                      <img
                        src={getDisplayImageUrl(type.icon)}
                        alt={type.name}
                        className="w-2.5 h-2.5 object-contain"
                        style={{
                          filter: type.icon_has_transparent_background ? 'none' : 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))'
                        }}
                      />
                    ) : (
                      <span 
                        className="text-xs leading-none"
                        style={{ 
                          color: type.icon_has_transparent_background ? type.color : 'white',
                          textShadow: type.icon_has_transparent_background ? '0 1px 1px rgba(0,0,0,0.2)' : 'none'
                        }}
                      >
                        {type.icon}
                      </span>
                    )}
                  </div>
                  
                  <span className={`text-xs transition-colors ${
                    !categoryVisible 
                      ? 'text-sand-400' 
                      : isTypeSelected 
                        ? 'text-sand-800 group-hover:text-spice-800' 
                        : 'text-sand-500 group-hover:text-sand-700'
                  }`}>
                    {type.name}
                  </span>
                </div>
                <span className={`text-xs ${
                  !categoryVisible 
                    ? 'text-sand-300' 
                    : isTypeSelected 
                      ? 'text-sand-600' 
                      : 'text-sand-400'
                }`}>
                  {typePoiCount}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  // Load Deep Desert map settings
  const loadDeepDesertSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'deep_desert_settings')
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" errors
      
      if (data?.setting_value) {
        setDeepDesertMapSettings(prev => ({ ...prev, ...data.setting_value }));
      }
    } catch (err: any) {
      console.error('Error loading Deep Desert settings:', err);
      // Keep using defaults
    }
  };

  // Fetch functions - Extended from Hagga Basin pattern
  const fetchCollections = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('poi_collections')
      .select('*')
      .or(`created_by.eq.${user.id},is_public.eq.true`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching collections:', error);
      throw error;
    }

    setCollections(data || []);
  };

  const fetchCustomIcons = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('custom_icons')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching custom icons:', error);
      throw error;
    }

    setCustomIcons(data || []);
  };

  const fetchUserInfo = async (pois: Poi[]) => {
    if (pois.length === 0) return;

    const userIds = [...new Set(pois.map(poi => poi.created_by))];
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', userIds);

    if (userError) {
      console.error('Error fetching user info:', userError);
      return;
    }

    const userInfoMap = userData.reduce((acc, user) => {
      acc[user.id] = { username: user.username };
      return acc;
    }, {} as { [key: string]: { username: string } });

    setUserInfo(userInfoMap);
  };

  // Handle custom POI type updates - Same as Hagga Basin
  const handleCustomPoiTypeCreated = (newPoiType: PoiType) => {
    setPoiTypes(prev => [newPoiType, ...prev]);
  };

  const handleCustomPoiTypeDeleted = (poiTypeId: string) => {
    setPoiTypes(prev => prev.filter(type => type.id !== poiTypeId));
  };

  const handleCustomPoiTypeUpdated = (updatedPoiType: PoiType) => {
    setPoiTypes(prev => prev.map(type => type.id === updatedPoiType.id ? updatedPoiType : type));
    setEditingPoiType(null);
  };

  const handleCustomPoiTypeEdit = (poiType: PoiType) => {
    setEditingPoiType(poiType);
    setShowCustomPoiTypeModal(true);
  };

  // Handle POI sharing - Same as Hagga Basin
  const handlePoiShare = (poi: Poi) => {
    setSelectedPoiForShare(poi);
    setShowSharePoiModal(true);
    setSelectedPoi(null);
  };

  // Handle POI gallery opening - Same as Hagga Basin
  const handlePoiGalleryOpen = useCallback((poi: Poi) => {
    if (poi.screenshots && poi.screenshots.length > 0) {
      setGalleryPoi(poi);
      setGalleryIndex(0);
      setShowGallery(true);
    }
  }, []);

  // Create or get grid square for modal
  const ensureGridSquareExists = async (): Promise<GridSquare | null> => {
    try {
      // Check if grid square already exists
      if (gridSquare && gridSquare.id) {
        return gridSquare;
      }

      // If gridSquare exists but has no ID, or doesn't exist, create it
      if (!user) {
        console.error('User not authenticated');
        return null;
      }

      // Create new grid square in database
      const { data, error } = await supabase
        .from('grid_squares')
        .insert([{
          coordinate: gridId,
          screenshot_url: gridSquare?.screenshot_url || null,
          uploaded_by: gridSquare?.uploaded_by || null,
          upload_date: gridSquare?.upload_date || null,
          is_explored: gridSquare?.is_explored || false
        }])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setGridSquare(data);
      return data;

    } catch (err) {
      console.error('Error creating grid square:', err);
      return null;
    }
  };

  // Handle opening the POI creation modal
  const handleOpenPoiModal = async () => {
    console.log('Add POI clicked');
    
    // Clear any existing errors
    setError(null);
    
    // Check if user is authenticated
    if (!user) {
      setError('Please sign in to create POIs');
      return;
    }
    
    // Ensure we have a grid square in the database
    const gridSquareData = await ensureGridSquareExists();
    if (gridSquareData) {
      // If there's a screenshot, start in placement mode
      if (gridSquareData.screenshot_url) {
        setPlacementMode(true);
        setPlacementCoordinates(null);
      } else {
        // No screenshot, open modal directly with center coordinates (center of 4000x4000 map)
        setPlacementCoordinates({ x: 2000, y: 2000 });
        setShowPoiModal(true);
      }
    } else {
      setError('Failed to create grid square. Please try again.');
    }
  };

  // Handle placement mode - clicking on screenshot
  const handleScreenshotClick = (event: React.MouseEvent) => {
    if (!placementMode || !placementReady) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert to pixel coordinates (0-4000) for database storage
    // The database expects integer pixel coordinates, not percentages
    const pixelX = Math.round((x / rect.width) * 4000);
    const pixelY = Math.round((y / rect.height) * 4000);
    
    setPlacementCoordinates({ x: pixelX, y: pixelY });
    setPlacementMode(false);
    setPlacementReady(false);
    setShowPoiModal(true);
  };

  // Handle choosing to place marker
  const handleChoosePlaceMarker = () => {
    setPlacementReady(true);
  };

  // Handle exiting placement mode
  const handleExitPlacementMode = () => {
    setPlacementMode(false);
    setPlacementReady(false);
    setPlacementCoordinates(null);
  };

  // Handle placement request from modal
  const handleRequestPlacement = () => {
    setShowPoiModal(false);
    setPlacementMode(true);
    setPlacementReady(false);
  };

  // Handle modal callbacks
  const handleModalClose = () => {
    setShowPoiModal(false);
    setPlacementCoordinates(null);
  };

  // Handle POI click from POI panel - highlighting only
  const handlePoiHighlight = (poi: Poi) => {
    console.log('GridPage handlePoiHighlight called for POI:', poi.title, 'coordinates:', poi.coordinates_x, poi.coordinates_y);
    // Highlight the POI with pulsing animation
    setHighlightedPoiId(poi.id);
    console.log('GridPage: Set highlightedPoiId to:', poi.id);
    // Remove highlight after 6 seconds
    setTimeout(() => {
      setHighlightedPoiId(null);
      console.log('GridPage: Cleared highlightedPoiId');
    }, 6000);
  };

  // Handle POI click (same as Hagga Basin)
  const handlePoiClick = (poi: Poi, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('GridPage handlePoiClick called for POI:', poi.title, 'coordinates:', poi.coordinates_x, poi.coordinates_y);
    console.log('GridPage: Setting selectedPoi and highlightedPoiId to:', poi.id);
    
    // Open the POI details modal
    setSelectedPoi(poi);
    
    // Also highlight the POI with pulsing animation
    setHighlightedPoiId(poi.id);
    console.log('GridPage: Set selectedPoi and highlightedPoiId to:', poi.id);
    
    // Remove highlight after 6 seconds
    setTimeout(() => {
      setHighlightedPoiId(null);
      console.log('GridPage: Cleared highlightedPoiId');
    }, 6000);
  };

  // Handle POI editing
  const handlePoiEdit = (poi: Poi) => {
    setEditingPoi(poi);
    setSelectedPoi(null);
  };

  // Handle POI deletion
  const handlePoiDelete = async (poiId: string) => {
    try {
      const { error } = await supabase
        .from('pois')
        .delete()
        .eq('id', poiId);

      if (error) throw error;

      // Update local state
      setPois(prev => prev.filter(p => p.id !== poiId));
      setSelectedPoi(null);
    } catch (error) {
      console.error('Error deleting POI:', error);
      throw error;
    }
  };

  // Zoom/Pan handlers
  const handleZoomChange = (ref: ReactZoomPanPinchRef) => {
    setCurrentZoom(ref.state.scale);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    // Remove manual positioning - let centerOnInit handle it automatically
  };

  const zoomIn = () => {
    transformRef.current?.zoomIn();
    setTimeout(() => {
      if (transformRef.current) {
        handleZoomChange(transformRef.current);
      }
    }, 50);
  };
  
  const zoomOut = () => {
    transformRef.current?.zoomOut();
    setTimeout(() => {
      if (transformRef.current) {
        handleZoomChange(transformRef.current);
      }
    }, 50);
  };
  
  const resetTransform = () => {
    if (transformRef.current) {
      transformRef.current.resetTransform();
      // Let resetTransform handle positioning automatically, don't override
      setTimeout(() => {
        if (transformRef.current) {
          setCurrentZoom(0.8);
        }
      }, 50);
    }
  };

  // Handle POI updating
  const handlePoiUpdated = (updatedPoi: Poi) => {
    setPois(prev => prev.map(p => p.id === updatedPoi.id ? updatedPoi : p));
    setEditingPoi(null);
  };

  const handlePoiSuccessfullyAdded = (newPoi: Poi) => {
    // Add the new POI to the local state
    setPois(prev => [newPoi, ...prev]);
    
    // Refresh POI data from database as well to ensure consistency
    if (gridSquare && gridSquare.id) {
      supabase
        .from('pois')
        .select('*')
        .eq('grid_square_id', gridSquare.id)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) {
            setPois(data);
          }
        });
    }
    
    // Close the modal after successful POI creation
    setShowPoiModal(false);
    setPlacementCoordinates(null);
    setPlacementMode(false);
    setPlacementReady(false);
  };

  // Initialize data on component mount
  useEffect(() => {
    const fetchGridData = async () => {
      try {
        console.log('Starting data fetch for grid:', gridId);
        setLoading(true);
        setError(null);

        // Load Deep Desert map settings first
        await loadDeepDesertSettings();

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

        // Fetch collections and custom icons like Hagga Basin
        await Promise.all([
          fetchCollections(),
          fetchCustomIcons()
        ]);

        // Fetch user info for POI creators
        await fetchUserInfo(poisData);

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
      if (!user) {
        console.error('User not authenticated');
        return;
      }

      // Set up for cropping
      setTempImageFile(file);
      setTempImageUrl(URL.createObjectURL(file));
      setIsEditingExisting(false);
      setShowCropModal(true);

    } catch (error) {
      console.error('Error preparing file for cropping:', error);
    } finally {
      setUploading(false);
    }
  };

  // Handle crop completion and upload
  const handleCropComplete = async (croppedImageBlob: Blob, cropData: PixelCrop) => {
    if (!tempImageFile || !user) return;

    setUploading(true);
    setError(null);

    try {
      const fileExt = tempImageFile.name.split('.').pop();
      const timestamp = Date.now();
      
      // Upload original image
      const originalFileName = `grid-${gridId}-${timestamp}-original.${fileExt}`;
      const { error: originalUploadError } = await supabase.storage
        .from('screenshots')
        .upload(originalFileName, tempImageFile, { upsert: true });

      if (originalUploadError) throw originalUploadError;

      // Upload cropped image
      const croppedFileName = `grid-${gridId}-${timestamp}-cropped.${fileExt}`;
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

      // Use upsert to handle both existing and new grid squares
      const { data, error } = await supabase
        .from('grid_squares')
        .upsert({
          coordinate: gridId,
          screenshot_url: croppedUrlData.publicUrl,
          original_screenshot_url: originalUrlData.publicUrl,
          crop_x: roundedCropData.x,
          crop_y: roundedCropData.y,
          crop_width: roundedCropData.width,
          crop_height: roundedCropData.height,
          crop_created_at: new Date().toISOString(),
          uploaded_by: user.id,
          upload_date: new Date().toISOString(),
          updated_by: user.id,
          is_explored: true
        }, {
          onConflict: 'coordinate'
        })
        .select()
        .single();

      if (error) throw error;

      setGridSquare(data);
      console.log('Screenshot uploaded and cropped successfully');
      
      // Broadcast exploration status change globally
      broadcastExplorationChange({
        gridSquareId: data.id,
        coordinate: data.coordinate,
        isExplored: true,
        source: 'crop'
      });
      
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
      setUploading(false);
    }
  };

  // Handle skipping crop (use original image)
  const handleSkipCrop = async () => {
    if (!tempImageFile || !user) return;

    setUploading(true);
    setError(null);

    try {
      const fileExt = tempImageFile.name.split('.').pop();
      const fileName = `grid-${gridId}-${Date.now()}.${fileExt}`;
      
      // Upload original file
      const { error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(fileName, tempImageFile, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('screenshots')
        .getPublicUrl(fileName);

      // Use upsert to handle both existing and new grid squares (no crop data, original and current URL are the same)
      const { data, error } = await supabase
        .from('grid_squares')
        .upsert({
          coordinate: gridId,
          screenshot_url: publicUrlData.publicUrl,
          original_screenshot_url: publicUrlData.publicUrl,
          crop_x: null,
          crop_y: null,
          crop_width: null,
          crop_height: null,
          crop_created_at: null,
          uploaded_by: user.id,
          upload_date: new Date().toISOString(),
          updated_by: user.id,
          is_explored: true
        }, {
          onConflict: 'coordinate'
        })
        .select()
        .single();

      if (error) throw error;

      setGridSquare(data);
      console.log('Screenshot uploaded successfully');
      
      // Broadcast exploration status change globally
      broadcastExplorationChange({
        gridSquareId: data.id,
        coordinate: data.coordinate,
        isExplored: true,
        source: 'upload'
      });
      
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
      setUploading(false);
    }
  };

  // Handle editing existing screenshot crop
  const handleEditExistingCrop = () => {
    if (!gridSquare?.original_screenshot_url) {
      setError('No original image available for editing');
      return;
    }

    console.log('Starting crop edit with original URL:', gridSquare.original_screenshot_url);
    console.log('Current crop data:', {
      x: gridSquare.crop_x,
      y: gridSquare.crop_y,
      width: gridSquare.crop_width,
      height: gridSquare.crop_height
    });

    // Create a new image URL with cache-busting to avoid CORS issues
    const originalUrl = new URL(gridSquare.original_screenshot_url);
    originalUrl.searchParams.set('t', Date.now().toString());
    
    setTempImageUrl(originalUrl.toString());
    setIsEditingExisting(true);
    setShowCropModal(true);
  };

  // Handle recrop of existing image
  const handleRecropComplete = async (croppedImageBlob: Blob, cropData: PixelCrop) => {
    if (!user || !gridSquare) return;

    setUploading(true);
    setError(null);

    try {
      // Upload new cropped version
      const timestamp = Date.now();
      const croppedFileName = `grid-${gridId}-${timestamp}-recropped.jpg`;
      
      const { error: croppedUploadError } = await supabase.storage
        .from('screenshots')
        .upload(croppedFileName, croppedImageBlob, { upsert: true });

      if (croppedUploadError) throw croppedUploadError;

      // Get public URL for new cropped image
      const { data: croppedUrlData } = supabase.storage
        .from('screenshots')
        .getPublicUrl(croppedFileName);

      // Delete old cropped image if it exists and is different from original
      if (gridSquare.screenshot_url && 
          gridSquare.screenshot_url !== gridSquare.original_screenshot_url) {
        try {
          const oldUrl = new URL(gridSquare.screenshot_url);
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
          crop_created_at: new Date().toISOString(),
          updated_by: user.id,
          is_explored: true
        })
        .eq('coordinate', gridId)
        .select()
        .single();

      if (error) throw error;

      setGridSquare(data);
      console.log('Screenshot crop updated successfully');
      
      // Broadcast exploration status change globally
      broadcastExplorationChange({
        gridSquareId: data.id,
        coordinate: data.coordinate,
        isExplored: true,
        source: 'recrop'
      });
      
      // Clean up
      setShowCropModal(false);
      setTempImageUrl(null);
      setIsEditingExisting(false);
    } catch (err: any) {
      console.error('Error updating crop:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Handle deleting screenshot from crop modal
  const handleDeleteFromCrop = async () => {
    if (!confirm('Are you sure you want to delete this screenshot?')) return;

    try {
      // Extract filename from URL to delete from storage
      if (gridSquare?.screenshot_url) {
        const url = new URL(gridSquare.screenshot_url);
        const fileName = url.pathname.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('screenshots')
            .remove([fileName]);
        }
      }

      // Also delete original if it's different
      if (gridSquare?.original_screenshot_url && 
          gridSquare.original_screenshot_url !== gridSquare.screenshot_url) {
        const originalUrl = new URL(gridSquare.original_screenshot_url);
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
          updated_by: user?.id || null,
          is_explored: false
        })
        .eq('coordinate', gridId)
        .select()
        .single();

      if (error) throw error;

      setGridSquare(data);
      console.log('Screenshot deleted successfully');
      
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

  // Clear error after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle POI focusing from URL parameter
  useEffect(() => {
    const poiIdFromUrl = searchParams.get('poi');
    if (poiIdFromUrl && pois.length > 0) {
      const targetPoi = pois.find(poi => poi.id === poiIdFromUrl);
      if (targetPoi) {
        // Highlight the POI with pulsing animation (but don't open modal)
        setHighlightedPoiId(targetPoi.id);
        // Remove highlight after 6 seconds
        setTimeout(() => {
          setHighlightedPoiId(null);
        }, 6000);
        // Remove the POI parameter from URL after focusing
        setSearchParams(prev => {
          const newParams = new URLSearchParams(prev);
          newParams.delete('poi');
          return newParams;
        });
      }
    }
  }, [pois, searchParams, setSearchParams]);

  // Highlighted POI effect (no centering/zooming)
  useEffect(() => {
    if (highlightedPoiId) {
      console.log('Deep Desert: Highlighting POI:', highlightedPoiId);
      const highlightedPoi = pois.find(poi => poi.id === highlightedPoiId);
      if (highlightedPoi) {
        console.log('Deep Desert: Found POI to highlight:', highlightedPoi.title);
      } else {
        console.log('Deep Desert: POI not found for highlighting');
      }
    } else {
      console.log('Deep Desert: No POI highlighted');
    }
  }, [highlightedPoiId, pois]);

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
        {/* Left Panel - Filter/Customization/Layers */}
        <div className={`${showLeftPanel ? 'w-96' : 'w-12'} bg-white border-r border-sand-200 flex flex-col transition-all duration-200`}>
          {/* Panel Header with Collapse Button */}
          <div className="p-4 border-b border-sand-200 flex items-center justify-between">
            {showLeftPanel && (
              <h2 className="text-lg font-semibold text-night-800">Map Controls</h2>
            )}
            <button
              onClick={() => setShowLeftPanel(!showLeftPanel)}
              className="text-sand-400 hover:text-sand-600"
              title={showLeftPanel ? "Collapse panel" : "Expand panel"}
            >
              {showLeftPanel ? '✕' : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>

          {showLeftPanel && (
            <>
              {/* Tab Navigation - Exact same as Hagga Basin */}
              <div className="flex mt-4 space-x-2">
                <button
                  onClick={() => setActiveTab('filters')}
                  className={`px-3 py-1 text-sm rounded ${
                    activeTab === 'filters' 
                      ? 'bg-spice-100 text-spice-700' 
                      : 'text-sand-600 hover:text-sand-800'
                  }`}
                >
                  <Filter className="w-4 h-4 inline mr-1" />
                  Filters
                </button>
                <button
                  onClick={() => setActiveTab('customization')}
                  className={`px-3 py-1 text-sm rounded ${
                    activeTab === 'customization' 
                      ? 'bg-spice-100 text-spice-700' 
                      : 'text-sand-600 hover:text-sand-800'
                  }`}
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Customization
                </button>
                <button
                  onClick={() => setActiveTab('layers')}
                  className={`px-3 py-1 text-sm rounded ${
                    activeTab === 'layers' 
                      ? 'bg-spice-100 text-spice-700' 
                      : 'text-sand-600 hover:text-sand-800'
                  }`}
                >
                  <Settings className="w-4 h-4 inline mr-1" />
                  Layers
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* Filters Tab - Exact same as Hagga Basin */}
                {activeTab === 'filters' && (
                  <div className="space-y-4">
                    {/* Add POI Button */}
                    <div>
                      <button
                        onClick={handleOpenPoiModal}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all bg-white border-2 border-spice-200 text-spice-700 hover:bg-spice-50 hover:border-spice-300"
                      >
                        <Plus className="w-5 h-5" />
                        <span>
                          {gridSquare?.screenshot_url ? 'Add POI to Grid' : 'Add Point of Interest'}
                        </span>
                      </button>
                    </div>

                    {/* Search */}
                    <div>
                      <label className="block text-sm font-medium text-sand-700 mb-2">
                        Search POIs
                      </label>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by title..."
                        className="w-full px-3 py-2 border border-sand-300 rounded-md focus:outline-none focus:ring-2 focus:ring-spice-500"
                      />
                    </div>

                    {/* Stats at the top */}
                    <div className="bg-spice-50 border border-spice-200 p-3 rounded-lg">
                      <div className="text-sm font-medium text-spice-800">
                        Showing {filteredPois.length} of {pois.length} POIs
                      </div>
                    </div>

                    {/* POI Type Filters */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium text-sand-800">
                          Points of Interests
                        </label>
                        <div className="flex gap-1">
                          <button
                            onClick={handleToggleAllPois}
                            className="text-xs text-spice-600 hover:text-spice-700 font-medium"
                            title="Toggle All POIs"
                          >
                            {(() => {
                              const allTypeIds = poiTypes.map(type => type.id);
                              const allTypesSelected = allTypeIds.length > 0 && allTypeIds.every(id => selectedPoiTypes.includes(id));
                              const buttonText = allTypesSelected ? 'Hide All' : 'Show All';
                              return buttonText;
                            })()}
                          </button>
                        </div>
                      </div>
                      
                      {/* Two-Column Layout */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {/* Left Column: Base + Resources Types */}
                        <div className="space-y-1">
                          {categories.includes('Base') && renderCategorySection('Base')}
                          {categories.includes('Resources') && renderCategorySection('Resources')}
                        </div>
                        
                        {/* Right Column: Locations + NPCs */}
                        <div className="space-y-1">
                          {categories.includes('Locations') && renderCategorySection('Locations')}
                          {categories.includes('NPCs') && renderCategorySection('NPCs')}
                        </div>
                      </div>
                      
                      {/* Other Categories (if any) */}
                      {categories.filter(cat => !['Base', 'Resources', 'Locations', 'NPCs'].includes(cat)).length > 0 && (
                        <div className="border-t border-sand-200 pt-3">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium text-sand-800">Other Types</h4>
                            <button
                              onClick={handleOtherTypesToggle}
                              className="text-xs text-spice-600 hover:text-spice-700 font-medium"
                              title="Toggle All Other Types"
                            >
                              {(() => {
                                const mainCategories = ['Base', 'Resources', 'Locations', 'NPCs'];
                                const otherCategories = categories.filter(cat => !mainCategories.includes(cat));
                                const otherTypeIds = poiTypes
                                  .filter(type => otherCategories.includes(type.category))
                                  .map(type => type.id);
                                const anyOtherTypesSelected = otherTypeIds.some(id => selectedPoiTypes.includes(id));
                                return anyOtherTypesSelected ? 'Hide All' : 'Show All';
                              })()}
                            </button>
                          </div>
                          <div className="space-y-1">
                            {categories
                              .filter(cat => !['Base', 'Resources', 'Locations', 'NPCs'].includes(cat))
                              .map(category => renderCategorySection(category))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Additional Filters Section */}
                    <div className="border-t border-sand-200 pt-4">
                      <h4 className="text-sm font-medium text-sand-800 mb-3">Additional Filters</h4>
                      
                      {/* Visibility Presets */}
                      <div>
                        <label className="block text-sm font-medium text-sand-700 mb-2">
                          Quick Visibility Filters
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setPrivacyFilter('public')}
                            className={`px-3 py-2 text-xs rounded border flex items-center justify-center gap-1 ${
                              privacyFilter === 'public'
                                ? 'bg-spice-100 border-spice-300 text-spice-700'
                                : 'bg-sand-50 border-sand-300 text-sand-600 hover:bg-sand-100'
                            }`}
                          >
                            <Eye className="w-3 h-3 text-green-600" />
                            Public Only
                          </button>
                          <button
                            onClick={() => setPrivacyFilter('private')}
                            className={`px-3 py-2 text-xs rounded border flex items-center justify-center gap-1 ${
                              privacyFilter === 'private'
                                ? 'bg-spice-100 border-spice-300 text-spice-700'
                                : 'bg-sand-50 border-sand-300 text-sand-600 hover:bg-sand-100'
                            }`}
                          >
                            <Lock className="w-3 h-3 text-red-600" />
                            Private Only
                          </button>
                          <button
                            onClick={() => setPrivacyFilter('shared')}
                            className={`px-3 py-2 text-xs rounded border flex items-center justify-center gap-1 ${
                              privacyFilter === 'shared'
                                ? 'bg-spice-100 border-spice-300 text-spice-700'
                                : 'bg-sand-50 border-sand-300 text-sand-600 hover:bg-sand-100'
                            }`}
                          >
                            <Users className="w-3 h-3 text-blue-600" />
                            Shared Only
                          </button>
                          <button
                            onClick={() => setPrivacyFilter('all')}
                            className={`px-3 py-2 text-xs rounded border flex items-center justify-center gap-1 ${
                              privacyFilter === 'all'
                                ? 'bg-spice-100 border-spice-300 text-spice-700'
                                : 'bg-sand-50 border-sand-300 text-sand-600 hover:bg-sand-100'
                            }`}
                          >
                            <Eye className="w-3 h-3 text-sand-600" />
                            Show All
                          </button>
                        </div>
                        <div className="mt-2 text-xs text-sand-500">
                          Icons show privacy levels on map POIs: <Eye className="w-3 h-3 inline text-green-600" /> Public, <Lock className="w-3 h-3 inline text-red-600" /> Private, <Users className="w-3 h-3 inline text-blue-600" /> Shared
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Customization Tab - Exact same as Hagga Basin */}
                {activeTab === 'customization' && (
                  <div className="space-y-4">
                    {/* Custom POI Types Section */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-medium text-sand-800">Custom POI Types</h4>
                        <button 
                          onClick={() => {
                            setEditingPoiType(null);
                            setShowCustomPoiTypeModal(true);
                          }}
                          className="btn btn-sm btn-primary"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Create
                        </button>
                      </div>
                      
                      {userCreatedPoiTypes.length === 0 ? (
                        <div className="text-center py-8">
                          <Plus className="w-12 h-12 text-sand-400 mx-auto mb-4" />
                          <p className="text-sand-600 mb-2">No custom POI types yet</p>
                          <p className="text-sand-500 text-sm">Create custom POI types with your own icons and categories</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {userCreatedPoiTypes.map(poiType => (
                            <div 
                              key={poiType.id} 
                              className="bg-sand-50 border border-sand-200 rounded-lg p-3"
                            >
                              <div className="flex items-center">
                                <div 
                                  className="w-8 h-8 rounded flex items-center justify-center mr-3 flex-shrink-0"
                                  style={{
                                    backgroundColor: poiType.icon_has_transparent_background && poiType.icon.startsWith('http') 
                                      ? 'transparent' 
                                      : poiType.color
                                  }}
                                >
                                  {poiType.icon.startsWith('http') ? (
                                    <img
                                      src={poiType.icon}
                                      alt={poiType.name}
                                      className="w-5 h-5 object-contain"
                                    />
                                  ) : (
                                    <span className="text-sm">{poiType.icon}</span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center">
                                    <h4 className="font-medium text-sand-800 truncate">{poiType.name}</h4>
                                    <span className="ml-2 px-2 py-0.5 bg-spice-100 text-spice-700 text-xs rounded capitalize">
                                      {poiType.category}
                                    </span>
                                  </div>
                                  {poiType.default_description && (
                                    <p className="text-sm text-sand-600 mt-1 truncate">{poiType.default_description}</p>
                                  )}
                                </div>
                                {/* Edit button for sidebar */}
                                <button
                                  onClick={() => handleCustomPoiTypeEdit(poiType)}
                                  className="text-spice-400 hover:text-spice-600 transition-colors ml-2"
                                  title="Edit POI type"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Collections Section */}
                    <div className="pt-4 border-t border-sand-200">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-medium text-sand-700">POI Collections</h4>
                        <button 
                          onClick={() => setShowCollectionModal(true)}
                          className="btn btn-sm btn-outline"
                        >
                          <FolderOpen className="w-4 h-4 mr-1" />
                          Manage
                        </button>
                      </div>
                      <p className="text-xs text-sand-500 mb-3">
                        {collections.length} collections • Organize and share groups of POIs
                      </p>
                      
                      {collections.length > 0 && (
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {collections.slice(0, 3).map(collection => (
                            <div key={collection.id} className="flex items-center text-sm">
                              <FolderOpen className="w-4 h-4 text-spice-600 mr-2 flex-shrink-0" />
                              <span className="text-sand-700 truncate">{collection.name}</span>
                              {collection.is_public && (
                                <span className="ml-auto text-xs text-blue-600">Public</span>
                              )}
                            </div>
                          ))}
                          {collections.length > 3 && (
                            <div className="text-xs text-sand-500 italic">
                              +{collections.length - 3} more collections
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Layers Tab - Exact same as Hagga Basin */}
                {activeTab === 'layers' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-sand-700">Map Layers</h3>
                    
                    <div className="space-y-2">
                      {/* Grid Screenshot Layer */}
                      <div className="flex items-center justify-between">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={gridSquare?.screenshot_url ? true : false}
                            disabled={true}
                            className="rounded border-sand-300 text-spice-600 focus:ring-spice-500"
                          />
                          <span className="ml-2 text-sm text-sand-700">Grid Screenshot</span>
                        </label>
                        <div className="text-xs text-sand-500">
                          {gridSquare?.screenshot_url ? 'Active' : 'None'}
                        </div>
                      </div>

                      {/* POI Markers Layer */}
                      <div className="flex items-center justify-between">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={true}
                            disabled={true}
                            className="rounded border-sand-300 text-spice-600 focus:ring-spice-500"
                          />
                          <span className="ml-2 text-sm text-sand-700">POI Markers</span>
                        </label>
                        <div className="text-xs text-sand-500">
                          {filteredPois.length} visible
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-sand-500 italic mt-4 text-center">
                      No overlay layers available
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Center Panel - Interactive Screenshot */}
        <div className="flex-1 bg-sand-50 flex items-center justify-center relative">
          {/* Placement Mode Instructions - Top overlay */}
          {placementMode && !placementReady && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
              <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm text-center border-2 border-spice-500">
                <Target className="w-8 h-8 text-spice-600 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-night-800 mb-2">
                  📍 POI Placement Mode
                </h3>
                <p className="text-xs text-sand-600 mb-3">
                  Choose how to place your POI marker:
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={handleChoosePlaceMarker}
                    className="px-3 py-2 bg-spice-600 text-white text-xs rounded-lg hover:bg-spice-700 transition-colors flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" />
                    Place Marker
                  </button>
                  <button
                    onClick={() => {
                      setPlacementCoordinates({ x: 2000, y: 2000 });
                      setPlacementMode(false);
                      setShowPoiModal(true);
                    }}
                    className="px-3 py-2 bg-sand-200 text-sand-700 text-xs rounded-lg hover:bg-sand-300 transition-colors"
                  >
                    Skip Placement
                  </button>
                </div>
                <button
                  onClick={handleExitPlacementMode}
                  className="mt-2 text-xs text-sand-500 hover:text-sand-700 underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Placement Mode - Ready to click indicator */}
          {placementMode && placementReady && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
              <div className="bg-spice-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                Click anywhere on the screenshot to place POI
              </div>
            </div>
          )}

          {gridSquare?.screenshot_url ? (
            <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
              {/* Zoom Controls */}
              <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
                <button
                  onClick={zoomIn}
                  className="bg-white border border-sand-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow"
                  title="Zoom In"
                >
                  <ZoomIn className="w-5 h-5 text-sand-600" />
                </button>
                <button
                  onClick={zoomOut}
                  className="bg-white border border-sand-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-5 h-5 text-sand-600" />
                </button>
                <button
                  onClick={resetTransform}
                  className="bg-white border border-sand-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow"
                  title="Reset View"
                >
                  <RotateCcw className="w-5 h-5 text-sand-600" />
                </button>
                
                {/* Help Button with Tooltip */}
                <div className="relative">
                  <button
                    onMouseEnter={() => setShowHelpTooltip(true)}
                    onMouseLeave={() => setShowHelpTooltip(false)}
                    className="bg-white border border-sand-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow"
                    title="Help & Tips"
                  >
                    <HelpCircle className="w-5 h-5 text-sand-600" />
                  </button>
                  
                  {/* Help Tooltip */}
                  {showHelpTooltip && (
                    <div className="absolute left-full ml-3 top-0 w-80 bg-white border border-sand-200 rounded-lg shadow-lg p-4 z-50">
                      <h4 className="font-medium text-sand-800 mb-3 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        Deep Desert Controls & Tips
                      </h4>
                      <div className="space-y-2 text-sm text-sand-600">
                        <div><strong>Map Controls:</strong></div>
                        <div className="ml-2 space-y-1">
                          <div>• Mouse wheel or +/- buttons to zoom</div>
                          <div>• Click and drag to pan around</div>
                          <div>• Double-click to zoom in quickly</div>
                          <div>• Reset button to restore original view</div>
                        </div>
                        
                        <div className="mt-3"><strong>POI Management:</strong></div>
                        <div className="ml-2 space-y-1">
                          <div>• Click on POI cards to view details and screenshots</div>
                          <div>• Use view toggle to switch between grid and list layouts</div>
                          <div>• Sort POIs by date, title, category, or type</div>
                          <div>• Filter POIs using the search and privacy controls</div>
                        </div>
                        
                        <div className="mt-3"><strong>Deep Desert Features:</strong></div>
                        <div className="ml-2 space-y-1">
                          <div>• Grid coordinates help identify exact locations</div>
                          <div>• Upload screenshots to enable precise POI placement</div>
                          <div>• Navigate between adjacent grids using arrows</div>
                          <div>• Private POIs are only visible to you</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Edit Screenshot Crop Button */}
                {gridSquare?.original_screenshot_url && user && (
                  <button
                    onClick={handleEditExistingCrop}
                    className="bg-amber-600 text-white border border-amber-700 rounded-lg p-2 shadow-sm hover:shadow-md hover:bg-amber-700 transition-all"
                    title="Edit screenshot crop"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                )}
              </div>

              <TransformWrapper
                ref={transformRef}
                initialScale={0.8}
                minScale={0.1}
                maxScale={4}
                limitToBounds={false}
                centerOnInit={true}
                wheel={{ step: 0.1 }}
                pinch={{ step: 5 }}
                doubleClick={{ disabled: false }}
                panning={{ disabled: false }}
                onInit={(ref) => {
                  transformRef.current = ref;
                  setCurrentZoom(ref.state.scale);
                }}
                onZoom={handleZoomChange}
                onZoomStop={handleZoomChange}
                onPanning={handleZoomChange}
                onPanningStop={handleZoomChange}
              >
                <TransformComponent 
                  wrapperStyle={{ width: '100%', height: '100%' }}
                  contentStyle={{ width: '100%', height: '100%' }}
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={gridSquare.screenshot_url}
                      alt={`Grid ${gridId} screenshot`}
                      className={`max-w-full max-h-full object-contain transition-all ${
                        placementMode && placementReady
                          ? 'border-4 border-spice-500 rounded shadow-lg' 
                          : placementMode
                          ? 'opacity-50'
                          : ''
                      }`}
                      style={{ 
                        pointerEvents: 'none'
                      }}
                      draggable={false}
                      onLoad={handleImageLoad}
                    />
                    
                    {/* Placement Click Overlay */}
                    {placementMode && placementReady && (
                      <div
                        className="absolute inset-0 cursor-crosshair z-20"
                        style={{ pointerEvents: 'auto' }}
                        onClick={handleScreenshotClick}
                        title="Click to place POI here"
                      />
                    )}
                    
                    {/* Show existing POIs on the screenshot */}
                    {filteredPois.map((poi) => {
                      if (!poi.coordinates_x || !poi.coordinates_y) return null;
                      
                      const poiType = poiTypes.find(type => type.id === poi.poi_type_id);
                      if (!poiType) return null;

                      // Apply counter-scaling to neutralize the zoom effect
                      const counterScale = 1 / currentZoom;

                      return (
                        <div
                          key={poi.id}
                          className="absolute"
                          style={{
                            left: `${(poi.coordinates_x / 4000) * 100}%`,
                            top: `${(poi.coordinates_y / 4000) * 100}%`,
                            transform: `translate(-50%, -50%) scale(${counterScale})`,
                            zIndex: 10,
                            pointerEvents: 'auto'
                          }}
                          onClick={(e) => handlePoiClick(poi, e)}
                        >
                          <MapPOIMarker
                            poi={poi}
                            poiType={poiType}
                            customIcons={customIcons}
                            zoom={currentZoom}
                            mapSettings={deepDesertMapSettings}
                            onEdit={handlePoiEdit}
                            onDelete={() => handlePoiDelete(poi.id)}
                            onShare={() => handlePoiShare(poi)}
                            onImageClick={() => handlePoiGalleryOpen(poi)}
                            isHighlighted={highlightedPoiId === poi.id}
                          />
                        </div>
                      );
                    })}
                  </div>
                </TransformComponent>
              </TransformWrapper>
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

        {/* Right Panel - Enhanced POI Panel */}
        <div className={`${showRightPanel ? 'w-[450px]' : 'w-12'} bg-white border-l border-sand-200 flex flex-col transition-all duration-200`}>
          <div className="p-4 border-b border-sand-200 flex items-center justify-between">
            <button
              onClick={() => setShowRightPanel(!showRightPanel)}
              className="text-sand-400 hover:text-sand-600"
              title={showRightPanel ? "Collapse panel" : "Expand panel"}
            >
              {showRightPanel ? '✕' : <ChevronLeft className="w-5 h-5" />}
            </button>
            {showRightPanel && (
              <h2 className="text-lg font-semibold text-night-800">POIs & Info</h2>
            )}
          </div>
          {showRightPanel && (
            <div className="flex-1 overflow-hidden">
              <POIPanel
                pois={pois}
                poiTypes={poiTypes}
                customIcons={customIcons}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedPoiTypes={selectedPoiTypes}
                onPoiTypeToggle={handleTypeToggle}
                privacyFilter={privacyFilter}
                onPrivacyFilterChange={setPrivacyFilter}
                mapType="deep_desert"
                gridSquares={gridSquare ? [gridSquare] : []}
                userInfo={userInfo}
                onPoiClick={(poi) => handlePoiClick(poi, {} as React.MouseEvent)}
                onPoiHighlight={handlePoiHighlight}
                onPoiEdit={handlePoiEdit}
                onPoiDelete={handlePoiDelete}
                onPoiShare={handlePoiShare}
                onPoiGalleryOpen={handlePoiGalleryOpen}
              />
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-300">
          {error}
        </div>
      )}

      {/* POI Placement Modal */}
      {showPoiModal && gridSquare && placementCoordinates && (
        <POIPlacementModal
          coordinates={placementCoordinates}
          poiTypes={poiTypes}
          customIcons={customIcons}
          onPoiCreated={handlePoiSuccessfullyAdded}
          onClose={handleModalClose}
          mapType="deep_desert"
          gridSquareId={gridSquare.id}
          onRequestPlacement={gridSquare.screenshot_url ? handleRequestPlacement : undefined}
        />
      )}

      {/* POI Details Card (reusing Hagga Basin component) */}
      {selectedPoi && (() => {
        const poiType = poiTypes.find(type => type.id === selectedPoi.poi_type_id);
        if (!poiType) return null;
        
        return (
          <HaggaBasinPoiCard
            poi={selectedPoi}
            poiType={poiType}
            customIcons={customIcons}
            isOpen={true}
            onClose={() => setSelectedPoi(null)}
            onEdit={() => handlePoiEdit(selectedPoi)}
            onDelete={async () => {
              if (window.confirm(`Are you sure you want to delete "${selectedPoi.title}"?`)) {
                try {
                  await handlePoiDelete(selectedPoi.id);
                } catch (error) {
                  console.error('Error deleting POI:', error);
                  alert('Failed to delete POI. Please try again.');
                }
              }
            }}
            onShare={() => handlePoiShare(selectedPoi)}
            onImageClick={() => handlePoiGalleryOpen(selectedPoi)}
          />
        );
      })()}

      {/* POI Edit Modal */}
      {editingPoi && (
        <POIEditModal
          poi={editingPoi}
          poiTypes={poiTypes}
          customIcons={customIcons}
          onPoiUpdated={handlePoiUpdated}
          onClose={() => setEditingPoi(null)}
          onPositionChange={(poi) => {
            // TODO: Implement position change for Deep Desert if needed
            console.log('Position change requested for POI:', poi);
          }}
        />
      )}

      {/* Collection Modal - Same as Hagga Basin */}
      {showCollectionModal && (
        <CollectionModal
          isOpen={showCollectionModal}
          existingCollections={collections}
          onClose={() => setShowCollectionModal(false)}
          onCollectionUpdated={() => {
            fetchCollections();
          }}
        />
      )}

      {/* Custom POI Type Modal - Same as Hagga Basin */}
      {showCustomPoiTypeModal && (
        <CustomPoiTypeModal
          isOpen={showCustomPoiTypeModal}
          editingPoiType={editingPoiType}
          customPoiTypes={userCreatedPoiTypes}
          onPoiTypeCreated={handleCustomPoiTypeCreated}
          onPoiTypeUpdated={handleCustomPoiTypeUpdated}
          onPoiTypeDeleted={handleCustomPoiTypeDeleted}
          onClose={() => {
            setShowCustomPoiTypeModal(false);
            setEditingPoiType(null);
          }}
        />
      )}

      {/* Share POI Modal - Same as Hagga Basin */}
      {showSharePoiModal && selectedPoiForShare && (
        <SharePoiModal
          poi={selectedPoiForShare}
          isOpen={showSharePoiModal}
          onClose={() => {
            setShowSharePoiModal(false);
            setSelectedPoiForShare(null);
          }}
        />
      )}

      {/* Gallery Modal - Fixed to show POI screenshots instead of grid screenshots */}
      {showGallery && galleryPoi && galleryPoi.screenshots && galleryPoi.screenshots.length > 0 && (
        <GridGallery
          initialIndex={galleryIndex}
          squares={galleryPoi.screenshots.map(s => ({
            id: s.id,
            coordinate: galleryPoi.title || 'POI',
            screenshot_url: s.url,
            original_screenshot_url: s.url, // Use same URL for original
            is_explored: false,
            uploaded_by: s.uploaded_by,
            upload_date: s.upload_date,
            created_at: s.upload_date,
            updated_by: s.uploaded_by, // Use same as uploaded_by for POI screenshots
            crop_x: 0, // Default crop values for POI screenshots
            crop_y: 0,
            crop_width: 2000, // Default dimensions
            crop_height: 2000,
            crop_created_at: s.upload_date, // Use upload date for crop creation
          }))}
          onClose={() => {
            setShowGallery(false);
            setGalleryPoi(null);
          }}
          poiInfo={{
            title: galleryPoi.title,
            description: galleryPoi.description,
            created_at: galleryPoi.created_at,
            created_by: galleryPoi.created_by,
          }}
        />
      )}

      {/* Image Crop Modal */}
      {showCropModal && tempImageUrl && (
        <ImageCropModal
          imageUrl={tempImageUrl}
          onCropComplete={isEditingExisting ? handleRecropComplete : handleCropComplete}
          onClose={handleCloseCropModal}
          onSkip={isEditingExisting ? undefined : handleSkipCrop}
          onDelete={isEditingExisting ? handleDeleteFromCrop : undefined}
          title={isEditingExisting ? 'Edit Screenshot Crop' : 'Crop Your Screenshot'}
          defaultToSquare={true}
          initialCrop={
            isEditingExisting && gridSquare && 
            gridSquare.crop_x !== null && gridSquare.crop_y !== null && 
            gridSquare.crop_width !== null && gridSquare.crop_height !== null
              ? {
                  unit: 'px' as const,
                  x: gridSquare.crop_x,
                  y: gridSquare.crop_y,
                  width: gridSquare.crop_width,
                  height: gridSquare.crop_height,
                }
              : undefined
          }
        />
      )}

    </div>
  );
};

export default GridPage;