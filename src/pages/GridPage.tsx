import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { supabase } from '../lib/supabase';
import { GridSquare, Poi, PoiType, PixelCoordinates } from '../types';
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Upload, Image, Plus, MapPin, Move, ZoomIn, ZoomOut, RotateCcw, Filter, Settings, FolderOpen, Share, Edit, Eye, Lock, Users, HelpCircle, Map, ArrowUp, BarChart3, Grid3X3 } from 'lucide-react';
import POIPlacementModal from '../components/hagga-basin/POIPlacementModal';
import POIEditModal from '../components/hagga-basin/POIEditModal';
import SharePoiModal from '../components/hagga-basin/SharePoiModal';
import GridGallery from '../components/grid/GridGallery';
import { ConfirmationModal } from '../components/shared/ConfirmationModal';

import MapPOIMarker from '../components/hagga-basin/MapPOIMarker';
import { useAuth } from '../components/auth/AuthProvider';
import { gridDisplayVariations } from '../lib/coordinates';
import ImageCropModal from '../components/grid/ImageCropModal';
import { PixelCrop } from 'react-image-crop';
import { v4 as uuidv4 } from 'uuid';
import { broadcastExplorationChange } from '../lib/explorationEvents';
import { toast } from 'react-toastify';
import POICard from '../components/common/POICard';
import POIPreviewCard from '../components/common/POIPreviewCard';
import GridSquareModal from '../components/grid/GridSquareModal';
import { getMapDisplayInfo } from '../lib/coordinates';
import MapControlPanel from '../components/common/MapControlPanel';
import POIPanel from '../components/common/POIPanel';
import { uploadImageWithConversion } from '../lib/imageUpload';
import { formatConversionStats } from '../lib/imageUtils';
  import { deletePOIWithCleanup } from '../lib/api/pois';
import { usePOIManager } from '../hooks/usePOIManager';
import { usePOIOperations } from '../hooks/usePOIOperations';
import { usePOIModals } from '../hooks/usePOIModals';
import { usePositionChange } from '../hooks/usePositionChange';
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
  
  // Get highlight parameter for POI highlighting
  const highlightPoiId = searchParams.get('highlight');

  const [gridSquare, setGridSquare] = useState<GridSquare | null>(null);
  const [allGridSquares, setAllGridSquares] = useState<GridSquare[]>([]); // NEW: All grid squares for minimap
  
  // Unified POI management for this specific grid square
  const { 
    pois, 
    loading: poisLoading, 
    error: poisError, 
    refreshPOIs, 
    addPOI, 
    updatePOI, 
    removePOI 
  } = usePOIManager({ 
    mapType: 'deep_desert', 
    gridSquareId: gridSquare?.id || null 
  });
  
  // 🚀 PHASE 2: Unified POI Operations (testing integration)
  const poiOps = usePOIOperations({
    mapType: 'deep_desert',
    gridSquareId: gridSquare?.id,
    onPoiCreated: (newPoi) => {
      addPOI(newPoi); // Update POI manager state
    },
    onPoiUpdated: (updatedPoi) => {
      updatePOI(updatedPoi); // Update POI manager state
    },
    onPoiDeleted: (poiId) => {
      removePOI(poiId); // Update POI manager state
    }
  });

  // Unified modal management
  const modals = usePOIModals({ 
    mapType: 'deep_desert',
    onRefreshData: refreshPOIs
  });
  
  const [poiTypes, setPoiTypes] = useState<PoiType[]>([]);

  const [userInfo, setUserInfo] = useState<{ [key: string]: { username: string; display_name?: string | null; custom_avatar_url?: string | null; discord_avatar_url?: string | null; use_discord_avatar?: boolean } }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Combined loading and error state
  const isLoading = loading || poisLoading;
  const combinedError = error || poisError;

  // Panel visibility state
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(true);

  // Sidebar tab state
  const [activeTab, setActiveTab] = useState<'filters' | 'layers'>('filters');

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
  const [placementCoordinates, setPlacementCoordinates] = useState<{ x: number; y: number } | null>(null);

  // Unified position change functionality
  const positionChange = usePositionChange({
    onPoiUpdated: updatePOI,
    onError: setError
  });

  // POI interaction state (non-modal)
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);

  // Help tooltip state
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);

  // Highlighted POI state for navigation focus
  const [highlightedPoiId, setHighlightedPoiId] = useState<string | null>(null);
  
  // Entity links refresh trigger for real-time updates
  const [entityLinksGlobalRefreshTrigger, setEntityLinksGlobalRefreshTrigger] = useState(0);
  
  // Set highlighted POI from URL parameter
  useEffect(() => {
    if (highlightPoiId) {
      setHighlightedPoiId(highlightPoiId);
      // Clear the highlight parameter from URL after a delay
      setTimeout(() => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('highlight');
        setSearchParams(newParams, { replace: true });
      }, 3000);
    }
  }, [highlightPoiId, searchParams, setSearchParams]);

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
  const [conversionStats, setConversionStats] = useState<string | null>(null);

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
      // Filter POI types available on Deep Desert map
      const availableTypes = poiTypes.filter(type => type.available_on_deep_desert !== false);
      
      // Select types that should be visible by default
      const defaultVisibleTypes = availableTypes.filter(type => type.default_visible !== false);
      
      setSelectedPoiTypes(defaultVisibleTypes.map(type => type.id));
      setSelectedCategories([...new Set(defaultVisibleTypes.map(type => type.category))]);
      setInitialFilterSetup(true);
    }
  }, [poiTypes, initialFilterSetup]);

  // Listen for admin panel changes to refresh POI types
  useEffect(() => {
    const handleAdminDataUpdate = () => {
      fetchPoiTypes();
    };

    // Listen for custom events from admin panel
    window.addEventListener('adminDataUpdated', handleAdminDataUpdate);

    return () => {
      window.removeEventListener('adminDataUpdated', handleAdminDataUpdate);
    };
  }, []);

  // Listen for entity links updates to refresh POI data
  useEffect(() => {
    const handleEntityLinksUpdate = () => {
      setEntityLinksGlobalRefreshTrigger(prev => prev + 1);
      refreshPOIs(); // Refresh POI data from database
    };

    window.addEventListener('entityLinksUpdated', handleEntityLinksUpdate);

    return () => {
      window.removeEventListener('entityLinksUpdated', handleEntityLinksUpdate);
    };
  }, [refreshPOIs]);

  // Refresh POI data when global entity links trigger changes
  useEffect(() => {
    if (entityLinksGlobalRefreshTrigger > 0) {
      refreshPOIs();
    }
  }, [entityLinksGlobalRefreshTrigger, refreshPOIs]);

  // Clear conversion stats after 5 seconds
  useEffect(() => {
    if (conversionStats) {
      const timer = setTimeout(() => setConversionStats(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [conversionStats]);

  // Load map settings for base categories
  useEffect(() => {
    loadMapSettings();
  }, []);

  const loadMapSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'map_settings')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // Deep Desert doesn't use baseCategories filtering
      // Settings loaded successfully
    } catch (error: any) {
      console.error('Error loading map settings:', error);
      // Keep default categories if loading fails
    }
  };

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

  // Helper function to check if an icon is a URL
  const isIconUrl = (icon: string): boolean => {
    return icon.startsWith('http') || icon.startsWith('/') || icon.includes('.');
  };

  // Helper function to get display image URL
  const getDisplayImageUrl = (icon: string): string => {
    if (isIconUrl(icon)) {
      return icon;
    }
    return icon; // Return emoji as-is
  };

  // Load Deep Desert map settings
  const loadDeepDesertSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'map_settings')
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

  const fetchUserInfo = async (pois: Poi[]) => {
    if (pois.length === 0) return;

    // Filter out null/undefined values to avoid UUID errors
    const userIds = [...new Set(pois.map(poi => poi.created_by).filter(id => id !== null && id !== undefined))];
    
    if (userIds.length === 0) {
      setUserInfo({});
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, username, display_name, custom_avatar_url, discord_avatar_url, use_discord_avatar')
      .in('id', userIds);

    if (userError) {
      console.error('Error fetching user info:', userError);
      return;
    }

    const userInfoMap = userData.reduce((acc, user) => {
      acc[user.id] = { 
        username: user.username, 
        display_name: user.display_name, 
        custom_avatar_url: user.custom_avatar_url, 
        discord_avatar_url: user.discord_avatar_url,
        use_discord_avatar: user.use_discord_avatar
      };
      return acc;
    }, {} as { [key: string]: { username: string; display_name?: string | null; custom_avatar_url?: string | null; discord_avatar_url?: string | null; use_discord_avatar?: boolean } });

    setUserInfo(userInfoMap);
  };

  // Handle POI sharing - Same as Hagga Basin
  const handlePoiShare = (poi: Poi) => {
    modals.openShareModal(poi);
    setSelectedPoi(null);
  };

  // Handle POI gallery opening - Same as Hagga Basin
  const handlePoiGalleryOpen = useCallback((poi: Poi) => {
    if (poi.screenshots && poi.screenshots.length > 0) {
      modals.openGallery(poi, 0);
    }
  }, [modals]);

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
        // No screenshot, open modal directly with center coordinates (50%, 50%)
        setPlacementCoordinates({ x: 50, y: 50 });
        setShowPoiModal(true);
      }
    } else {
      setError('Failed to create grid square. Please try again.');
    }
  };

  // Handle placement mode - clicking on screenshot
  const handleScreenshotClick = (event: React.MouseEvent) => {
    if (!placementMode && !positionChange.positionChangeMode) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Calculate pixel coordinates for the 2000x2000 Deep Desert screenshot
    const pixelX = (x / rect.width) * 2000;
    const pixelY = (y / rect.height) * 2000;
    
    // Handle position change mode
    if (positionChange.positionChangeMode && positionChange.changingPositionPoi) {
      positionChange.handlePositionUpdate(positionChange.changingPositionPoi, pixelX, pixelY);
      return;
    }
    
    // Handle placement mode
    if (placementMode) {
      setPlacementCoordinates({ x: pixelX, y: pixelY });
      setPlacementMode(false);
      setShowPoiModal(true);
    }
  };

  // Handle Add POI button - enter placement mode
  const handleAddPOI = async () => {
    
    // Clear any existing errors
    setError(null);
    
    // Check if user is authenticated
    if (!user) {
      setError('Please sign in to create POIs');
      return;
    }
    
    // Ensure we have a grid square in the database
    const gridSquareData = await ensureGridSquareExists();
    if (!gridSquareData) {
      setError('Failed to create grid square. Please try again.');
      return;
    }
    
    if (gridSquareData.screenshot_url) {
      // Enter simple placement mode like Hagga Basin
      setPlacementMode(true);
    } else {
      // No screenshot, open modal directly with center coordinates (50%, 50%)
      setPlacementCoordinates({ x: 50, y: 50 });
      setShowPoiModal(true);
    }
  };

  // Handle ESC key to exit placement and position change modes
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (placementMode) {
          setPlacementMode(false);
          setPlacementCoordinates(null);
        }
        // Handle position change ESC via unified hook
        positionChange.handleEscapeKey(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [placementMode, positionChange.handleEscapeKey]);

  // Handle modal callbacks
  const handleModalClose = () => {
    setShowPoiModal(false);
    setPlacementCoordinates(null);
  };

  // Handle POI click from POI panel - highlighting only
  const handlePoiHighlight = (poi: Poi) => {
    // Highlight the POI with pulsing animation
    setHighlightedPoiId(poi.id);
    // Remove highlight after 6 seconds
    setTimeout(() => {
      setHighlightedPoiId(null);
    }, 6000);
  };

  // Handle POI click - only opens modal, no highlighting effect
  const handlePoiClick = (poi: Poi, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Open the POI details modal only
    setSelectedPoi(poi);
  };

  // Handle POI editing
  const handlePoiEdit = (poi: Poi) => {
    modals.openEditModal(poi);
    setSelectedPoi(null);
  };

  // Helper function to extract file path from Supabase Storage URL
  const extractStorageFilePath = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      // Extract path after '/storage/v1/object/public/{bucket}/'
      const pathParts = urlObj.pathname.split('/');
      const bucketIndex = pathParts.indexOf('public') + 1;
      if (bucketIndex > 0 && bucketIndex < pathParts.length) {
        return pathParts.slice(bucketIndex + 1).join('/'); // Skip bucket name too
      }
      return null;
    } catch {
      return null;
    }
  };

  // Handle POI deletion request - shows confirmation first
  const handlePoiDelete = async (poiId: string) => {
    const poi = pois.find(p => p.id === poiId);
    if (!poi) {
        setError('POI not found');
        return;
      }

    modals.requestDeletion(poi);
  };

  // Perform actual POI deletion after confirmation
  const performPoiDeletion = async () => {
    if (!modals.poiToDelete) return;
    
    try {
      // Use comprehensive deletion API that handles all cleanup
      const result = await deletePOIWithCleanup(modals.poiToDelete.id);

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

      // Update unified state to remove the deleted POI
      removePOI(modals.poiToDelete.id);
      
      // Clear any highlighted POI if it was the deleted one
      if (selectedPoiId === modals.poiToDelete.id) {
        setSelectedPoiId(null);
      }

      // Close any open POI modal if it was the deleted POI
      if (selectedPoi?.id === modals.poiToDelete.id) {
        setSelectedPoi(null);
      }

      // Close confirmation modal
      modals.cancelDeletion();
    } catch (error) {
      console.error('Error in POI deletion:', error);
      setError('Failed to delete POI');
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
    updatePOI(updatedPoi);
    modals.closeEditModal();
  };

  const handlePoiSuccessfullyAdded = (newPoi: Poi) => {
    // Add the new POI via unified hook
    addPOI(newPoi);
    
    // Close the modal after successful POI creation
    setShowPoiModal(false);
    setPlacementCoordinates(null);
    setPlacementMode(false);
  };

  // Initialize data on component mount
  useEffect(() => {
    const fetchGridData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load Deep Desert map settings first
        await loadDeepDesertSettings();

        // Fetch ALL grid squares for minimap (NEW)
        const { data: allGridsData, error: allGridsError } = await supabase
          .from('grid_squares')
          .select('*')
          .order('coordinate', { ascending: true });

        if (allGridsError && allGridsError.code !== 'PGRST116') {
          console.warn('Error fetching all grid squares:', allGridsError);
        } else {
          setAllGridSquares(allGridsData || []);
        }

        // Fetch current grid square by coordinate (not by id)
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

        // POI fetching is now handled by usePOIManager hook

        // Fetch POI types
        const { data: typesData, error: typesError } = await supabase
          .from('poi_types')
          .select('*')
          .order('category', { ascending: true });

        if (typesError) throw typesError;
        setPoiTypes(typesData || []);

        // User info fetching will be handled when POIs are loaded

      } catch (err) {
        console.error('Error fetching grid data:', err);
        setError('Failed to load grid data');
      } finally {
        setLoading(false);
      }
    };

    fetchGridData();
  }, [gridId, user]);

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
  const handleCropComplete = async (croppedImageBlob: Blob, cropData: PixelCrop, isFullImage: boolean) => {
    if (!tempImageFile || !gridSquare) return;
    setUploading(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not authenticated");

      const fileName = `${user.id}/${gridSquare.coordinate}-${Date.now()}.webp`;
      
      // Convert blob to file for WebP conversion
      const croppedFile = new File([croppedImageBlob], fileName, { type: croppedImageBlob.type });
      
      const uploadResult = await uploadImageWithConversion(croppedFile, fileName, {
        quality: 'medium',
        bucket: 'screenshots',
        folder: 'grid-screenshots',
        maxWidth: 2000,
        maxHeight: 2000
      });

      // Show conversion feedback
      if (uploadResult.compressionStats) {
        setConversionStats(formatConversionStats(uploadResult.compressionStats));
      }

      const publicURL = uploadResult.url;
      const cropDetailsForDb = isFullImage ? null : cropData;
      const originalScreenshotUrlToStore = isFullImage ? publicURL : (gridSquare.original_screenshot_url || publicURL);

      const { data, error: updateError } = await supabase
        .from('grid_squares')
        .upsert({
          coordinate: gridId,
          screenshot_url: publicURL,
          original_screenshot_url: originalScreenshotUrlToStore,
          crop_x: isFullImage ? null : Math.round(cropData?.x || 0),
          crop_y: isFullImage ? null : Math.round(cropData?.y || 0),
          crop_width: isFullImage ? null : Math.round(cropData?.width || 0),
          crop_height: isFullImage ? null : Math.round(cropData?.height || 0),
          uploaded_by: user.id,
          upload_date: new Date().toISOString(),
          updated_by: user.id,
          is_explored: true
        }, {
          onConflict: 'coordinate'
        })
        .select()
        .single();

      if (updateError) throw updateError;

      setGridSquare(data);
      
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
      console.error("Error during screenshot upload or DB update:", err);
      setError(err.message || "Failed to upload screenshot.");
    } finally {
      setUploading(false);
    }
  };
  
  const handleRecropComplete = async (croppedImageBlob: Blob, cropData: PixelCrop, isFullImage: boolean) => {
    if (!gridSquare || !gridSquare.screenshot_url) return;
    setUploading(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not authenticated");

      const fileName = `${user.id}/${gridSquare.coordinate}-recrop-${Date.now()}.webp`;
      
      // Convert blob to file for WebP conversion
      const croppedFile = new File([croppedImageBlob], fileName, { type: croppedImageBlob.type });
      
      const uploadResult = await uploadImageWithConversion(croppedFile, fileName, {
        quality: 'medium',
        bucket: 'screenshots',
        folder: 'grid-screenshots',
        maxWidth: 2000,
        maxHeight: 2000
      });

      // Show conversion feedback
      if (uploadResult.compressionStats) {
        setConversionStats(formatConversionStats(uploadResult.compressionStats));
      }
      
      const publicURL = uploadResult.url;
      const cropDetailsForDb = isFullImage ? null : cropData;
      const newOriginalScreenshotUrl = isFullImage ? publicURL : gridSquare.original_screenshot_url;

      const { data, error: updateError } = await supabase
        .from('grid_squares')
        .update({
          screenshot_url: publicURL,
          original_screenshot_url: newOriginalScreenshotUrl,
          crop_x: isFullImage ? null : Math.round(cropData?.x || 0),
          crop_y: isFullImage ? null : Math.round(cropData?.y || 0),
          crop_width: isFullImage ? null : Math.round(cropData?.width || 0),
          crop_height: isFullImage ? null : Math.round(cropData?.height || 0),
          updated_by: user.id,
        })
        .eq('coordinate', gridId)
        .select()
        .single();

      if (updateError) throw updateError;

      setGridSquare(data);
      
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
      console.error("Error during screenshot recrop or DB update:", err);
      setError(err.message || "Failed to update screenshot.");
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
      const fileName = `grid-${gridId}-${Date.now()}.webp`;
      
      const uploadResult = await uploadImageWithConversion(tempImageFile, fileName, {
        quality: 'medium',
        bucket: 'screenshots',
        folder: 'grid-screenshots',
        maxWidth: 2000,
        maxHeight: 2000
      });

      // Show conversion feedback
      if (uploadResult.compressionStats) {
        setConversionStats(formatConversionStats(uploadResult.compressionStats));
      }

      // Use upsert to handle both existing and new grid squares (no crop data, original and current URL are the same)
      const { data, error } = await supabase
        .from('grid_squares')
        .upsert({
          coordinate: gridId,
          screenshot_url: uploadResult.url,
          original_screenshot_url: uploadResult.url,
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

    // Create a new image URL with cache-busting to avoid CORS issues
    const originalUrl = new URL(gridSquare.original_screenshot_url);
    originalUrl.searchParams.set('t', Date.now().toString());
    
    setTempImageUrl(originalUrl.toString());
    setIsEditingExisting(true);
    setShowCropModal(true);
  };

  // Handle deleting screenshot from crop modal
  const handleDeleteFromCrop = async () => {
    if (!confirm('Are you sure you want to delete this screenshot?')) return;

    try {
      // Extract file paths from URLs to delete from storage
      const filesToDelete: string[] = [];
      
      if (gridSquare?.screenshot_url) {
        const filePath = extractStorageFilePath(gridSquare.screenshot_url);
        if (filePath) {
          filesToDelete.push(filePath);
        }
      }

      // Also delete original if it's different
      if (gridSquare?.original_screenshot_url && 
          gridSquare.original_screenshot_url !== gridSquare.screenshot_url) {
        const originalFilePath = extractStorageFilePath(gridSquare.original_screenshot_url);
        if (originalFilePath && !filesToDelete.includes(originalFilePath)) {
          filesToDelete.push(originalFilePath);
        }
      }

      // Delete files from storage
      if (filesToDelete.length > 0) {
        const { error: storageError } = await supabase.storage
            .from('screenshots')
          .remove(filesToDelete);
        
        if (storageError) {
          console.error('Error deleting screenshot files from storage:', storageError);
          // Continue with database update even if storage deletion fails
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
    // Just manage highlighting state without verbose logging
  }, [highlightedPoiId, pois]);

  // Validate grid ID format - AFTER all hooks are called
  if (!gridId || !VALID_GRID_PATTERN.test(gridId)) {
    return <Navigate to="/deep-desert" replace />;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        {/* Main background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(/images/main-bg.webp)`
          }}
        />
        
        <div className="relative text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <div className="text-amber-200 font-light" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            Loading Grid {gridId}...
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (combinedError) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        {/* Main background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(/images/main-bg.webp)`
          }}
        />
        
        <div className="relative text-center">
          <div className="text-red-400 mb-4 font-light">{combinedError}</div>
          <button 
            onClick={handleBackToOverview}
            className="bg-amber-600 hover:bg-amber-500 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Back to Deep Desert
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* Main background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(/images/main-bg.webp)`
        }}
      />

      {/* Header Bar */}
      <div className="relative bg-slate-900/90 border-b border-slate-700/50 backdrop-blur-sm px-4 py-3 flex items-center justify-center">
        <div className="w-full max-w-6xl flex items-center justify-between">
          {/* Left Section - Back Button */}
          <div className="flex-1">
            <button
              onClick={handleBackToOverview}
              className="flex items-center gap-2 text-amber-300 hover:text-amber-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-light tracking-wide" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Back to Deep Desert
              </span>
            </button>
          </div>

          {/* Center Section - Title */}
          <div className="flex-1 flex justify-center">
            <h1 className="text-xl font-light text-yellow-300 tracking-wider" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Grid Square {gridId}
            </h1>
          </div>

          {/* Right Section - Navigation Controls */}
          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-2">
              {/* Left/Right Navigation */}
              <button
                onClick={() => handleNavigateToGrid(adjacentGrids.left)}
                className="px-3 py-1 text-sm rounded bg-slate-800/90 text-amber-200 hover:bg-slate-700/90 hover:text-amber-100 border border-slate-600/50 transition-all"
                title={`Go left to ${adjacentGrids.left}`}
              >
                ← {adjacentGrids.left}
              </button>
              <button
                onClick={() => handleNavigateToGrid(adjacentGrids.right)}
                className="px-3 py-1 text-sm rounded bg-slate-800/90 text-amber-200 hover:bg-slate-700/90 hover:text-amber-100 border border-slate-600/50 transition-all"
                title={`Go right to ${adjacentGrids.right}`}
              >
                {adjacentGrids.right} →
              </button>
              
              {/* Vertical separator */}
              <div className="h-6 w-px bg-slate-600/50 mx-1" />
              
              {/* Up/Down Navigation */}
              <button
                onClick={() => handleNavigateToGrid(adjacentGrids.up)}
                className="px-3 py-1 text-sm rounded bg-slate-800/90 text-amber-200 hover:bg-slate-700/90 hover:text-amber-100 border border-slate-600/50 transition-all"
                title={`Go up to ${adjacentGrids.up}`}
              >
                ↑ {adjacentGrids.up}
              </button>
              <button
                onClick={() => handleNavigateToGrid(adjacentGrids.down)}
                className="px-3 py-1 text-sm rounded bg-slate-800/90 text-amber-200 hover:bg-slate-700/90 hover:text-amber-100 border border-slate-600/50 transition-all"
                title={`Go down to ${adjacentGrids.down}`}
              >
                ↓ {adjacentGrids.down}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Left Panel - Map Controls */}
        <MapControlPanel 
          showPanel={showLeftPanel}
          onTogglePanel={() => setShowLeftPanel(!showLeftPanel)}
          mode="grid"
          currentLocation={gridId}
          mapType="deep_desert"
          pois={pois}
          filteredPois={filteredPois}
          poiTypes={poiTypes}

          activeTab={activeTab}
          onActiveTabChange={setActiveTab}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          selectedPoiTypes={selectedPoiTypes}
          selectedCategories={selectedCategories}
          privacyFilter={privacyFilter}
          onPrivacyFilterChange={setPrivacyFilter}
          onAddPOI={handleAddPOI}
          onTypeToggle={handleTypeToggle}
          onCategoryToggle={handleCategoryToggle}
          onToggleAllPois={handleToggleAllPois}
          onOtherTypesToggle={handleOtherTypesToggle}

          isIconUrl={isIconUrl}
          getDisplayImageUrl={getDisplayImageUrl}
          additionalLayerContent={
                    <div className="space-y-2">
                      {/* Grid Screenshot Layer */}
                      <div className="flex items-center justify-between">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={gridSquare?.screenshot_url ? true : false}
                            disabled={true}
                    className="rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500/30"
                          />
                  <span className="ml-2 text-sm text-amber-200">Grid Screenshot</span>
                        </label>
                <div className="text-xs text-amber-300/70">
                          {gridSquare?.screenshot_url ? 'Active' : 'None'}
                        </div>
                      </div>
                        </div>
          }
        />

        {/* Center Panel - Interactive Screenshot */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          {/* Placement Mode Indicator */}
          {placementMode && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
              <div className="bg-amber-600/80 text-slate-900 px-4 py-2 rounded-lg shadow-lg">
                <div className="text-center">
                  <Plus className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-sm font-medium">Click on screenshot to place POI</div>
                  <div className="text-xs opacity-90">Press ESC to cancel</div>
                </div>
              </div>
            </div>
          )}

          {/* Position Change Mode Indicator */}
          {positionChange.positionChangeMode && positionChange.changingPositionPoi && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
              <div className="bg-blue-600/80 text-white px-4 py-2 rounded-lg shadow-lg">
                <div className="text-center">
                  <Move className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-sm font-medium">Click to move "{positionChange.changingPositionPoi.title}"</div>
                  <div className="text-xs opacity-90">Press ESC to cancel</div>
                </div>
              </div>
            </div>
          )}

          {gridSquare?.screenshot_url ? (
            <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
              {/* Zoom Controls */}
              <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
                <button
                  onClick={zoomIn}
                  className="bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-lg p-2 shadow-lg hover:bg-slate-800/90 transition-all"
                  title="Zoom In"
                >
                  <ZoomIn className="w-5 h-5 text-amber-300" />
                </button>
                <button
                  onClick={zoomOut}
                  className="bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-lg p-2 shadow-lg hover:bg-slate-800/90 transition-all"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-5 h-5 text-amber-300" />
                </button>
                <button
                  onClick={resetTransform}
                  className="bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-lg p-2 shadow-lg hover:bg-slate-800/90 transition-all"
                  title="Reset View"
                >
                  <RotateCcw className="w-5 h-5 text-amber-300" />
                </button>
                
                {/* Help Button with Tooltip */}
                <div className="relative">
                  <button
                    onMouseEnter={() => setShowHelpTooltip(true)}
                    onMouseLeave={() => setShowHelpTooltip(false)}
                    className="bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-lg p-2 shadow-lg hover:bg-slate-800/90 transition-all"
                    title="Help & Tips"
                  >
                    <HelpCircle className="w-5 h-5 text-amber-300" />
                  </button>
                  
                  {/* Help Tooltip */}
                  {showHelpTooltip && (
                    <div className="absolute left-full ml-3 top-0 w-80 bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-xl p-4 z-50">
                      <h4 className="font-medium text-yellow-300 mb-3 flex items-center gap-2" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                        <HelpCircle className="w-4 h-4" />
                        Deep Desert Controls & Tips
                      </h4>
                      <div className="space-y-2 text-sm text-amber-200">
                        <div><strong className="text-amber-100">Map Controls:</strong></div>
                        <div className="ml-2 space-y-1 text-amber-200/90">
                          <div>• Mouse wheel or +/- buttons to zoom</div>
                          <div>• Click and drag to pan around</div>
                          <div>• Double-click to zoom in quickly</div>
                          <div>• Reset button to restore original view</div>
                        </div>
                        
                        <div className="mt-3"><strong className="text-amber-100">POI Management:</strong></div>
                        <div className="ml-2 space-y-1 text-amber-200/90">
                          <div>• Click on POI cards to view details and screenshots</div>
                          <div>• Use view toggle to switch between grid and list layouts</div>
                          <div>• Sort POIs by date, title, category, or type</div>
                          <div>• Filter POIs using the search and privacy controls</div>
                        </div>
                        
                        <div className="mt-3"><strong className="text-amber-100">Deep Desert Features:</strong></div>
                        <div className="ml-2 space-y-1 text-amber-200/90">
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
                    className="bg-amber-600 text-slate-900 border border-amber-700 rounded-lg p-2 shadow-lg hover:bg-amber-500 transition-all"
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
                  contentStyle={{ width: '2000px', height: '2000px' }}
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={gridSquare.screenshot_url}
                      alt={`Grid ${gridId} screenshot`}
                      className={`transition-all ${
                        placementMode
                          ? 'cursor-crosshair' 
                          : ''
                      }`}
                      style={{ 
                        width: '2000px',
                        height: '2000px',
                        objectFit: 'contain',
                        pointerEvents: 'none'
                      }}
                      draggable={false}
                      onLoad={handleImageLoad}
                    />
                    
                    {/* Placement Click Overlay */}
                    {placementMode && (
                      <div
                        className="absolute inset-0 cursor-crosshair z-20"
                        style={{ pointerEvents: 'auto' }}
                        onClick={handleScreenshotClick}
                        title="Click to place POI here"
                      />
                    )}

                    {/* Position Change Click Overlay */}
                    {positionChange.positionChangeMode && positionChange.changingPositionPoi && (
                      <div
                        className="absolute inset-0 cursor-crosshair z-20"
                        style={{ pointerEvents: 'auto' }}
                        onClick={handleScreenshotClick}
                        title={`Click to move "${positionChange.changingPositionPoi.title}"`}
                      />
                    )}
                    
                    {/* Show existing POIs on the screenshot */}
                    {filteredPois.map((poi) => {
                      if (!poi.coordinates_x || !poi.coordinates_y) return null;
                      
                      const poiType = poiTypes.find(type => type.id === poi.poi_type_id);
                      if (!poiType) return null;

                      // Calculate position as percentage of container for both map types
                      // Deep Desert: pixel coordinates (0-2000) -> percentage (0-100%)
                      // Hagga Basin: pixel coordinates (0-4000) -> percentage (0-100%)
                      const maxCoordinate = poi.map_type === 'hagga_basin' ? 4000 : 2000;
                      const leftPercent = (poi.coordinates_x / maxCoordinate) * 100;
                      const topPercent = (poi.coordinates_y / maxCoordinate) * 100;

                      return (
                        <div
                          key={poi.id}
                          className="absolute"
                          style={{
                            left: `${leftPercent}%`,
                            top: `${topPercent}%`,
                            transform: `translate(-50%, -50%) scale(${1 / currentZoom})`,
                            zIndex: 10,
                            pointerEvents: 'auto'
                          }}
                          onClick={(e) => handlePoiClick(poi, e)}
                        >
                          <MapPOIMarker
                            poi={poi}
                            poiType={poiType}
              
                            zoom={currentZoom}
                            mapSettings={deepDesertMapSettings}
                            onEdit={handlePoiEdit}
                            onDelete={handlePoiDelete}
                            onShare={handlePoiShare}
                            onImageClick={handlePoiGalleryOpen}
                            isHighlighted={highlightedPoiId === poi.id}
                            entityLinksRefreshTrigger={entityLinksGlobalRefreshTrigger}
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
                      ? 'border-amber-400 bg-amber-500/10'
                      : 'border-slate-600/50 bg-slate-900/30 hover:border-slate-500/50 hover:bg-slate-900/40'
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
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
                    ) : (
                      <Image className="h-12 w-12 text-amber-400/70 mx-auto" />
                    )}
                  </div>
                  
                  <div className="text-lg font-medium text-yellow-300 mb-2" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    {uploading ? 'Uploading...' : 'Upload Screenshot'}
                  </div>
                  
                  <div className="text-amber-200 mb-4">
                    {uploading
                      ? 'Processing your screenshot...'
                      : 'Drag and drop an image here, or click to select'
                    }
                  </div>
                  
                  {!uploading && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-amber-600 hover:bg-amber-500 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Choose File
                    </button>
                  )}
                  
                  {/* Conversion Stats Display */}
                  {conversionStats && (
                    <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 mt-4">
                      <p className="text-green-300 text-sm font-light" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                        {conversionStats}
                      </p>
                    </div>
                  )}
                  
                  <div className="text-xs text-amber-300/70 mt-4">
                    Supported formats: JPG, PNG, GIF, WEBP
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Mini Map Panel */}
          <div className={`absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-xl transition-all duration-200 ${
            showMiniMap ? 'w-64' : 'w-12'
          }`}>
            <div className="p-3 border-b border-slate-700/50 flex items-center justify-between">
              <button
                onClick={() => setShowMiniMap(!showMiniMap)}
                className="p-1 rounded hover:bg-slate-800/50 text-amber-300 hover:text-amber-100 transition-colors"
                title={showMiniMap ? "Collapse mini map" : "Expand mini map"}
              >
                {showMiniMap ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showMiniMap && (
                <div className="text-sm font-semibold text-yellow-300" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  Grid Navigation
                </div>
              )}
            </div>
            {showMiniMap && (
              <div className="p-3">
                <div className="grid grid-cols-9 gap-1 mb-3">
                  {GRID_ROWS.slice().reverse().map((row) =>
                    GRID_COLS.map((col) => {
                      const cellId = row + col;
                      const isCurrent = cellId === gridId;
                      const gridSquareData = allGridSquares.find(square => square.coordinate === cellId);
                      const isExplored = gridSquareData?.is_explored || false;
                      
                      // Determine styling based on state
                      let buttonClasses = 'w-6 h-6 text-xs rounded transition-colors ';
                      let titleText = `Navigate to grid ${cellId}`;
                      
                      if (isCurrent) {
                        // Current/active grid - amber
                        buttonClasses += 'bg-amber-600 text-slate-900 font-bold';
                        titleText += ' (current)';
                      } else if (isExplored) {
                        // Explored grid - green
                        buttonClasses += 'bg-emerald-600/80 text-slate-900 font-medium hover:bg-emerald-500/80';
                        titleText += ' (explored)';
                      } else {
                        // Unexplored grid - slate
                        buttonClasses += 'bg-slate-800/70 text-amber-200 hover:bg-slate-700/70 hover:text-amber-100';
                        titleText += ' (unexplored)';
                      }
                      
                      return (
                        <button
                          key={cellId}
                          onClick={() => handleNavigateToGrid(cellId)}
                          className={buttonClasses}
                          title={titleText}
                        >
                          {cellId}
                        </button>
                      );
                    })
                  )}
                </div>
                
                {/* Legend */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-amber-600 rounded"></div>
                    <span className="text-xs">Current</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-600/80 rounded"></div>
                    <span className="text-xs">Explored</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-slate-800/70 rounded"></div>
                    <span className="text-xs">Unexplored</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - POI List */}
        <POIPanel
          showPanel={showRightPanel}
          onTogglePanel={() => setShowRightPanel(!showRightPanel)}
          title={`POIs in ${gridId}`}
          pois={filteredPois}
          poiTypes={poiTypes}
          
          userInfo={userInfo}
          onPoiClick={(poi) => {
            // Highlight the POI on the map instead of opening a modal
            setHighlightedPoiId(poi.id);
            // Clear highlight after 3 seconds
            setTimeout(() => setHighlightedPoiId(null), 3000);
          }}
          onPoiEdit={handlePoiEdit}
          onPoiDelete={handlePoiDelete}
          onPoiShare={handlePoiShare}
          onPoiImageClick={handlePoiGalleryOpen}
          emptyStateMessage="No POIs found"
          emptyStateSubtitle="Add POIs to this grid square to see them here"
          entityLinksRefreshTrigger={entityLinksGlobalRefreshTrigger}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="relative mx-6 mt-4 p-3 bg-red-900/80 backdrop-blur-sm text-red-200 rounded-lg border border-red-700/50">
          {error}
        </div>
      )}

      {/* POI Placement Modal */}
      {showPoiModal && gridSquare && gridSquare.id && placementCoordinates && (
        <POIPlacementModal
          coordinates={placementCoordinates}
          poiTypes={poiTypes}
          onPoiCreated={handlePoiSuccessfullyAdded}
          onClose={handleModalClose}
          mapType="deep_desert"
          gridSquareId={gridSquare.id}
        />
      )}

      {/* POI Details Card (reusing Hagga Basin component) */}
      {selectedPoi && (() => {
        const poiType = poiTypes.find(type => type.id === selectedPoi.poi_type_id);
        if (!poiType) return null;
        
        return (
          <POICard
            poi={selectedPoi}
            poiType={poiType}
            isOpen={true}
            onClose={() => setSelectedPoi(null)}
            onEdit={() => handlePoiEdit(selectedPoi)}
            onDelete={() => handlePoiDelete(selectedPoi.id)}
            onShare={() => handlePoiShare(selectedPoi)}
            onImageClick={() => handlePoiGalleryOpen(selectedPoi)}
          />
        );
      })()}

      {/* POI Card Modal from POIPanel */}
      {selectedPoiId && (() => {
        const selectedPoiFromPanel = filteredPois.find(poi => poi.id === selectedPoiId);
        const selectedPoiType = selectedPoiFromPanel ? poiTypes.find(type => type.id === selectedPoiFromPanel.poi_type_id) : null;
        if (!selectedPoiFromPanel || !selectedPoiType) return null;
        
        return (
          <POICard
            poi={selectedPoiFromPanel}
            poiType={selectedPoiType}
            isOpen={true}
            onClose={() => setSelectedPoiId(null)}
            onEdit={() => {
              modals.openEditModal(selectedPoiFromPanel);
              setSelectedPoiId(null);
            }}
            onDelete={() => {
              handlePoiDelete(selectedPoiFromPanel.id);
              setSelectedPoiId(null);
            }}
            onShare={() => {
              handlePoiShare(selectedPoiFromPanel);
              setSelectedPoiId(null);
            }}
            onImageClick={() => handlePoiGalleryOpen(selectedPoiFromPanel)}
          />
        );
      })()}

      {/* POI Edit Modal */}
      {modals.editingPoi && (
        <POIEditModal
          poi={modals.editingPoi}
          poiTypes={poiTypes}
          onPoiUpdated={handlePoiUpdated}
          onPoiDataChanged={(updatedPoi) => {
            // Update POI data without closing the modal (for entity link changes)
            // Force a complete re-render by creating a new POI object with a timestamp
            const refreshedPoi = {
              ...updatedPoi,
              _lastUpdated: Date.now() // Force React to detect changes
            };
            updatePOI(refreshedPoi);
            // DO NOT call modals.closeEditModal() here
          }}
          onLinksUpdated={() => {
            setEntityLinksGlobalRefreshTrigger(prev => prev + 1);
          }}
          onClose={() => modals.closeEditModal()}
          onPositionChange={(poi) => {
            positionChange.startPositionChange(poi);
            // Exit placement mode if active
            setPlacementMode(false);
            setPlacementCoordinates(null);
            modals.closeEditModal();
          }}
        />
      )}

      {/* Share POI Modal - Same as Hagga Basin */}
      {modals.showShareModal && modals.selectedPoiForShare && (
        <SharePoiModal
          poi={modals.selectedPoiForShare}
          isOpen={modals.showShareModal}
          onClose={async () => {
            await modals.closeShareModal();
          }}
        />
      )}

      {/* Gallery Modal - Fixed to show POI screenshots instead of grid screenshots */}
      {modals.showGallery && modals.galleryPoi && modals.galleryPoi.screenshots && modals.galleryPoi.screenshots.length > 0 && (
        <GridGallery
          initialImageUrl={modals.galleryPoi.screenshots[modals.galleryIndex]?.url || modals.galleryPoi.screenshots[0].url}
          allImages={modals.galleryPoi.screenshots.map(s => ({
            url: s.url,
            source: 'poi' as const,
            poi: modals.galleryPoi,
            poiType: poiTypes.find(type => type.id === modals.galleryPoi.poi_type_id)
          }))}
          onClose={() => {
            modals.closeGallery();
          }}
        />
      )}

      {/* Image Crop Modal */}
      {showCropModal && tempImageUrl && (
        <ImageCropModal
          imageUrl={tempImageUrl}
          onCropComplete={isEditingExisting ? handleRecropComplete : handleCropComplete}
          onClose={handleCloseCropModal}
          onDelete={isEditingExisting ? handleDeleteFromCrop : undefined}
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

      {/* POI Deletion Confirmation Modal */}
      {modals.showDeleteConfirmation && modals.poiToDelete && (
        <ConfirmationModal
          isOpen={modals.showDeleteConfirmation}
          onClose={() => modals.cancelDeletion()}
          onConfirm={performPoiDeletion}
          title="Delete POI"
          message={`Are you sure you want to delete "${modals.poiToDelete.title}"? This action cannot be undone and will delete all associated screenshots, comments, and entity links.`}
          confirmButtonText="Delete POI"
          cancelButtonText="Cancel"
          variant="danger"
        />
      )}

      {/* Unified POI Operations Deletion Modal */}
      {poiOps.showDeleteConfirmation && poiOps.poiToDelete && (
        <ConfirmationModal
          isOpen={poiOps.showDeleteConfirmation}
          onClose={poiOps.cancelPOIDeletion}
          onConfirm={poiOps.confirmPOIDeletion}
          title="Delete POI"
          message={`Are you sure you want to delete "${poiOps.poiToDelete.title}"? This action cannot be undone and will delete all associated screenshots, comments, and entity links.`}
          confirmButtonText="Delete POI"
          cancelButtonText="Cancel"
          variant="danger"
        />
      )}

    </div>
  );
};

export default GridPage;
