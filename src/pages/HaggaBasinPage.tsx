import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MapPin, Filter, Settings, Plus, FolderOpen, Share, Image, Edit, Eye, Lock, Users, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import type { 
  Poi, 
  PoiType, 
  HaggaBasinBaseMap, 
  HaggaBasinOverlay,
  User
} from '../types';
import InteractiveMap from '../components/hagga-basin/InteractiveMap';


import SharePoiModal from '../components/hagga-basin/SharePoiModal';
import POIEditModal from '../components/hagga-basin/POIEditModal';
import GridGallery from '../components/grid/GridGallery';
import POICard from '../components/common/POICard';
import MapControlPanel from '../components/common/MapControlPanel';
import POIPanel from '../components/common/POIPanel';
import { ConfirmationModal } from '../components/shared/ConfirmationModal';
import { useAuth } from '../components/auth/AuthProvider';
import { deletePOIWithCleanup } from '../lib/api/pois';
import { usePOIManager } from '../hooks/usePOIManager';

const HaggaBasinPage: React.FC = () => {
  // Authentication and user state
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Unified POI management
  const { 
    pois, 
    loading: poisLoading, 
    error: poisError, 
    refreshPOIs, 
    addPOI, 
    updatePOI, 
    removePOI 
  } = usePOIManager({ mapType: 'hagga_basin' });

  // Other data state
  const [poiTypes, setPoiTypes] = useState<PoiType[]>([]);
  const [baseMaps, setBaseMaps] = useState<HaggaBasinBaseMap[]>([]);
  const [overlays, setOverlays] = useState<HaggaBasinOverlay[]>([]);


  const [userInfo, setUserInfo] = useState<{ [key: string]: { username: string; display_name?: string | null; custom_avatar_url?: string | null; discord_avatar_url?: string | null; use_discord_avatar?: boolean } }>({});

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Combined loading and error state
  const isLoading = loading || poisLoading;
  const combinedError = error || poisError;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [activeTab, setActiveTab] = useState<'filters' | 'overlays'>('filters');

  // Filter state - Updated for proper default selection
  const [selectedPoiTypes, setSelectedPoiTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [privacyFilter, setPrivacyFilter] = useState<'all' | 'public' | 'private' | 'shared'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Map state
  const [selectedOverlays, setSelectedOverlays] = useState<string[]>([]);
  const [activeBaseMap, setActiveBaseMap] = useState<HaggaBasinBaseMap | null>(null);
  const [placementMode, setPlacementMode] = useState(false);
  
  // Modal state

  const [showSharePoiModal, setShowSharePoiModal] = useState(false);
  const [selectedPoiForShare, setSelectedPoiForShare] = useState<Poi | null>(null);

  const [editingPoi, setEditingPoi] = useState<Poi | null>(null);

  // Gallery state
  const [showGallery, setShowGallery] = useState(false);
  const [galleryPoi, setGalleryPoi] = useState<Poi | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Help tooltip state
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);

  // Highlighted POI state for navigation focus
  const [highlightedPoiId, setHighlightedPoiId] = useState<string | null>(null);
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);
  
  // Confirmation modal state for POI deletion
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [poiToDelete, setPoiToDelete] = useState<Poi | null>(null);
  
  // Get highlight parameter for POI highlighting
  const highlightPoiId = searchParams.get('highlight');
  
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

  // State to track if initial filter setup has been done
  const [initialFilterSetup, setInitialFilterSetup] = useState(false);

  // Initialize filter state when POI types are loaded (only on initial setup)
  useEffect(() => {
    if (poiTypes.length > 0 && !initialFilterSetup) {
      // By default, select all types and categories on initial load
      setSelectedPoiTypes(poiTypes.map(type => type.id));
      setSelectedCategories([...new Set(poiTypes.map(type => type.category))]);
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

  const initializeData = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchPoiTypes(),
        fetchBaseMaps(),
        fetchOverlays(),
      ]);
    } catch (err) {
      console.error('Error initializing Hagga Basin data:', err);
      setError('Failed to load map data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Expose refresh function for POI types specifically
  const refreshPoiTypes = async () => {
    try {
      await fetchPoiTypes();
    } catch (err) {
      console.error('Error refreshing POI types:', err);
    }
  };



  const fetchPoiTypes = async () => {
    const { data, error } = await supabase
      .from('poi_types')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      console.error('Error fetching POI types:', error);
      throw error;
    }

    setPoiTypes(data || []);
  };

  const fetchBaseMaps = async () => {
    const { data, error } = await supabase
      .from('hagga_basin_base_maps')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching base maps:', error);
      throw error;
    }

    setBaseMaps(data || []);
    
    // Set the active base map
    const activeMap = data?.find(map => map.is_active);
    if (activeMap) {
      setActiveBaseMap(activeMap);
    }
  };

  const fetchOverlays = async () => {
    const { data, error } = await supabase
      .from('hagga_basin_overlays')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching overlays:', error);
      throw error;
    }

    setOverlays(data || []);
    
    // Initialize all overlays as visible by default
    setSelectedOverlays((data || []).map(overlay => overlay.id));
  };





  const fetchUserInfo = async (pois: Poi[]) => {
    if (pois.length === 0) return;

    // Filter out null/undefined values to avoid UUID errors
    const userIds = [...new Set(pois.map(poi => poi.created_by).filter(id => id !== null && id !== undefined && id !== ''))];
    
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

  // Filter POIs based on current filter state - No duplicates should exist at source level
  const filteredPois = useMemo(() => {
    return pois.filter(poi => {
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
  }, [pois, searchTerm, selectedPoiTypes, privacyFilter]);

  // Handle individual POI type toggle
  const handleTypeToggle = (typeId: string) => {
    setSelectedPoiTypes(prev => {
      if (prev.includes(typeId)) {
        return prev.filter(id => id !== typeId);
      } else {
        return [...prev, typeId];
      }
    });
  };



  // Handle category toggle - now syncs with selectedPoiTypes
  const handleCategoryToggle = (category: string, checked: boolean) => {
    const categoryTypeIds = poiTypes
      .filter(type => type.category === category)
      .map(type => type.id);

    if (checked) {
      // Show all: Add category and ensure ALL types in category are selected
      setSelectedCategories(prev => [...prev, category]);
      setSelectedPoiTypes(prev => {
        // Remove all category types first, then add them all back
        const withoutCategory = prev.filter(typeId => !categoryTypeIds.includes(typeId));
        return [...withoutCategory, ...categoryTypeIds];
      });
    } else {
      // Hide all: Remove category and all its types
      setSelectedCategories(prev => prev.filter(c => c !== category));
      setSelectedPoiTypes(prev => prev.filter(typeId => !categoryTypeIds.includes(typeId)));
    }
  };

  // Handle "All POIs" toggle - show/hide all POI types
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

  // Handle "Other Types" toggle - for categories not in main four
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

  // Handle overlay toggle
  const handleOverlayToggle = (overlayId: string) => {
    setSelectedOverlays(prev => 
      prev.includes(overlayId)
        ? prev.filter(id => id !== overlayId)
        : [...prev, overlayId]
    );
  };

  // Handle POI creation
  const handlePoiCreated = async (newPoi: Poi) => {
    try {
      // Add to unified POI state
      addPOI(newPoi);
      // Exit placement mode
      setPlacementMode(false);
    } catch (error) {
      console.error('Error handling created POI:', error);
    }
  };

  // Handle sharing POI
  const handleSharePoi = (poi: Poi) => {
    setSelectedPoiForShare(poi);
    setShowSharePoiModal(true);
  };

  // Handle POI privacy level changes from sharing modal
  const handlePoiPrivacyLevelChanged = async (poiId: string, newPrivacyLevel: 'private' | 'shared') => {
    try {
      // Find and update the POI with new privacy level
      const targetPoi = pois.find(poi => poi.id === poiId);
      if (targetPoi) {
        updatePOI({ ...targetPoi, privacy_level: newPrivacyLevel });
      }

      // Refresh POI data to ensure consistency
      await refreshPOIs();
    } catch (error) {
      console.error('Error handling POI privacy level change:', error);
      // Refresh on error to revert any optimistic updates
      await refreshPOIs();
    }
  };

  // Handle share modal close with refresh
  const handleShareModalClose = async () => {
    setShowSharePoiModal(false);
    setSelectedPoiForShare(null);
    // Refresh POIs after sharing changes to ensure all users see updates
    await refreshPOIs();
  };

  // Handle POI editing
  const handlePoiUpdated = (updatedPoi: Poi) => {
    // POI has already been updated in the database by the modal
    // Just update unified state with the returned data
    updatePOI(updatedPoi);
  };

  // Handle POI deletion request - shows confirmation first
  const handlePoiDeleted = async (poiId: string) => {
    const poi = pois.find(p => p.id === poiId);
    if (!poi) {
      setError('POI not found');
      return;
    }
    
    setPoiToDelete(poi);
    setShowDeleteConfirmation(true);
  };

  // Perform actual POI deletion after confirmation
  const performPoiDeletion = async () => {
    if (!poiToDelete) return;
    
    try {
      // Use comprehensive deletion API that handles all cleanup
      const result = await deletePOIWithCleanup(poiToDelete.id);

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

      // Update unified state
      removePOI(poiToDelete.id);

      // Clear any highlighted POI if it was the deleted one
      if (highlightedPoiId === poiToDelete.id) {
        setHighlightedPoiId(null);
      }
      if (selectedPoiId === poiToDelete.id) {
        setSelectedPoiId(null);
      }

      // Close confirmation modal
      setShowDeleteConfirmation(false);
      setPoiToDelete(null);
    } catch (error) {
      console.error('Error deleting POI:', error);
      setError('Failed to delete POI');
    }
  };



  // Handle POI gallery opening
  const handlePoiGalleryOpen = useCallback((poi: Poi) => {
    if (poi.screenshots && poi.screenshots.length > 0) {
      setGalleryPoi(poi);
      setGalleryIndex(0);
      setShowGallery(true);
    }
  }, []);

  // Handle POI click for detail view
  const handlePoiClick = useCallback((poi: Poi) => {
    // Highlight the POI with pulsing animation
    setHighlightedPoiId(poi.id);
    // Remove highlight after 6 seconds
    setTimeout(() => {
      setHighlightedPoiId(null);
    }, 6000);
  }, []);

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

  // Initialize data on component mount
  useEffect(() => {
    initializeData();
  }, []);



  // Handle POI editing
  const handlePoiEdit = (poi: Poi) => {
    setEditingPoi(poi);
  };

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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-amber-200 font-light" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            Loading Hagga Basin map...
          </p>
        </div>
      </div>
    );
  }

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
          <div className="text-red-400 text-xl mb-4 font-light" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            Error Loading Map
          </div>
          <p className="text-amber-200 mb-4">{combinedError}</p>
          <button 
            onClick={() => initializeData()}
            className="bg-amber-600 hover:bg-amber-500 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex overflow-hidden" style={{height: 'calc(100vh - 4rem)'}}>
      {/* Main background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(/images/main-bg.webp)`
        }}
      />

      {/* Left Sidebar */}
      <MapControlPanel 
        showPanel={sidebarOpen}
        onTogglePanel={() => setSidebarOpen(!sidebarOpen)}
        mode="map"
        currentLocation="Hagga Basin"
        pois={pois}
        filteredPois={filteredPois}
        poiTypes={poiTypes}

        activeTab={activeTab === 'overlays' ? 'layers' : activeTab}
        onActiveTabChange={(tab) => setActiveTab(tab === 'layers' ? 'overlays' : tab)}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        selectedPoiTypes={selectedPoiTypes}
        selectedCategories={selectedCategories}
        privacyFilter={privacyFilter}
        onPrivacyFilterChange={setPrivacyFilter}
        onAddPOI={() => setPlacementMode(!placementMode)}
        onTypeToggle={handleTypeToggle}
        onCategoryToggle={handleCategoryToggle}
        onToggleAllPois={handleToggleAllPois}
        onOtherTypesToggle={handleOtherTypesToggle}

        isIconUrl={isIconUrl}
        getDisplayImageUrl={getDisplayImageUrl}
        additionalLayerContent={
          <div className="space-y-2">
            {/* Base Map Layer */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={!!activeBaseMap}
                  disabled={true}
                  className="rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500/30"
                />
                <span className="ml-2 text-sm text-amber-200">Base Map</span>
              </label>
              <div className="text-xs text-amber-300/70">
                {activeBaseMap ? activeBaseMap.name : 'None'}
              </div>
            </div>
            
            {/* Map Overlays */}
            {overlays.map(overlay => (
              <div key={overlay.id} className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedOverlays.includes(overlay.id)}
                    onChange={() => handleOverlayToggle(overlay.id)}
                    className="rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500/30"
                  />
                  <span className="ml-2 text-sm text-amber-200">{overlay.name}</span>
                </label>
                <div className="text-xs text-amber-300/70">
                  {overlay.opacity}%
                </div>
              </div>
            ))}
            
            {/* POI Markers Layer */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={true}
                  disabled={true}
                  className="rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500/30"
                />
                <span className="ml-2 text-sm text-amber-200">POI Markers</span>
              </label>
              <div className="text-xs text-amber-300/70">
                {filteredPois.length} visible
              </div>
            </div>
          </div>
        }
      />

      {/* Main Map Area */}
      <div className="relative flex-1 overflow-hidden">
        {/* Interactive Map */}
        {activeBaseMap ? (
          <InteractiveMap
            baseMap={activeBaseMap}
            overlays={overlays.filter(overlay => selectedOverlays.includes(overlay.id))}
            pois={filteredPois}
            poiTypes={poiTypes}
            onPoiCreated={handlePoiCreated}
            onPoiUpdated={handlePoiUpdated}
            onPoiDeleted={handlePoiDeleted}
            onPoiShare={handleSharePoi}
            onPoiGalleryOpen={handlePoiGalleryOpen}
            placementMode={placementMode}
            onPlacementModeChange={setPlacementMode}
            showHelpTooltip={showHelpTooltip}
            onHelpTooltipChange={setShowHelpTooltip}
            highlightedPoiId={highlightedPoiId}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-amber-400/70 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-yellow-300 mb-2" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                No Base Map Available
              </h3>
              <p className="text-amber-200">
                An administrator needs to upload a base map to enable the interactive map.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - POI List */}
      <POIPanel
        showPanel={showRightPanel}
        onTogglePanel={() => setShowRightPanel(!showRightPanel)}
        title={`POIs on Map`}
        pois={filteredPois}
        poiTypes={poiTypes}
        userInfo={userInfo}
        onPoiClick={handlePoiClick}
        onPoiEdit={handlePoiEdit}
        onPoiDelete={handlePoiDeleted}
        onPoiShare={handleSharePoi}
        onPoiImageClick={handlePoiGalleryOpen}
        emptyStateMessage="No POIs found"
        emptyStateSubtitle="Add POIs to the map to see them here"
      />



      {/* Share POI Modal */}
      <SharePoiModal
        isOpen={showSharePoiModal}
        onClose={handleShareModalClose}
        poi={selectedPoiForShare}
        onPrivacyLevelChanged={handlePoiPrivacyLevelChanged}
      />

      {/* POI Edit Modal */}
      {editingPoi && (
        <POIEditModal
          poi={editingPoi}
          poiTypes={poiTypes}
          onPoiUpdated={(updatedPoi) => {
            handlePoiUpdated(updatedPoi);
            setEditingPoi(null);
          }}
          onPoiDataChanged={(updatedPoi) => {
            // Update POI data without closing the modal (for entity link changes)
            // Force a complete re-render by creating a new POI object with a timestamp
            const refreshedPoi = {
              ...updatedPoi,
              _lastUpdated: Date.now() // Force React to detect changes
            };
            handlePoiUpdated(refreshedPoi);
            // DO NOT call setEditingPoi(null) here
          }}
          onClose={() => setEditingPoi(null)}
        />
      )}

      {/* POI Card Modal */}
      {selectedPoiId && (() => {
        const selectedPoi = filteredPois.find(poi => poi.id === selectedPoiId);
        const selectedPoiType = selectedPoi ? poiTypes.find(type => type.id === selectedPoi.poi_type_id) : null;
        if (!selectedPoi || !selectedPoiType) return null;
        
        return (
          <POICard
            poi={selectedPoi}
            poiType={selectedPoiType}
            isOpen={true}
            onClose={() => setSelectedPoiId(null)}
            onEdit={() => {
              setEditingPoi(selectedPoi);
              setSelectedPoiId(null);
            }}
            onDelete={() => {
              handlePoiDeleted(selectedPoi.id);
              setSelectedPoiId(null);
            }}
            onShare={() => {
              handleSharePoi(selectedPoi);
              setSelectedPoiId(null);
            }}
            onImageClick={() => {
              handlePoiGalleryOpen(selectedPoi);
              setSelectedPoiId(null);
            }}
          />
        );
      })()}

      {/* Gallery Modal */}
      {showGallery && galleryPoi?.screenshots && (
        <GridGallery
          initialImageUrl={galleryPoi.screenshots[galleryIndex]?.url || galleryPoi.screenshots[0]?.url}
          allImages={galleryPoi.screenshots.map(s => ({
            url: s.url,
            source: 'poi' as const,
            poi: galleryPoi,
            poiType: poiTypes.find(pt => pt.id === galleryPoi.poi_type_id)
          }))}
          onClose={() => {
            setShowGallery(false);
            setGalleryPoi(null);
          }}
        />
      )}

      {/* POI Deletion Confirmation Modal */}
      {showDeleteConfirmation && poiToDelete && (
        <ConfirmationModal
          isOpen={showDeleteConfirmation}
          onClose={() => {
            setShowDeleteConfirmation(false);
            setPoiToDelete(null);
          }}
          onConfirm={performPoiDeletion}
          title="Delete POI"
          message={`Are you sure you want to delete "${poiToDelete.title}"? This action cannot be undone and will delete all associated screenshots, comments, and entity links.`}
          confirmButtonText="Delete POI"
          cancelButtonText="Cancel"
          variant="danger"
        />
      )}
    </div>
  );
};

export default HaggaBasinPage; 