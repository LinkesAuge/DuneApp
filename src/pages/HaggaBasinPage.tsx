import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { MapPin, Filter, Settings, Plus, FolderOpen, Share, Image, Edit, Eye, Lock, Users } from 'lucide-react';
import type { 
  Poi, 
  PoiType, 
  HaggaBasinBaseMap, 
  HaggaBasinOverlay,
  PoiCollection,
  CustomIcon,
  User
} from '../types';
import InteractiveMap from '../components/hagga-basin/InteractiveMap';
import CollectionModal from '../components/hagga-basin/CollectionModal';
import CustomPoiTypeModal from '../components/hagga-basin/CustomPoiTypeModal';
import SharePoiModal from '../components/hagga-basin/SharePoiModal';
import GridGallery from '../components/grid/GridGallery';
import { useAuth } from '../components/auth/AuthProvider';

const HaggaBasinPage: React.FC = () => {
  // Authentication and user state
  const { user, loading: authLoading } = useAuth();

  // Core data state
  const [pois, setPois] = useState<Poi[]>([]);
  const [poiTypes, setPoiTypes] = useState<PoiType[]>([]);
  const [baseMaps, setBaseMaps] = useState<HaggaBasinBaseMap[]>([]);
  const [overlays, setOverlays] = useState<HaggaBasinOverlay[]>([]);
  const [collections, setCollections] = useState<PoiCollection[]>([]);
  const [customIcons, setCustomIcons] = useState<CustomIcon[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'filters' | 'customization' | 'overlays'>('filters');

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
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showCustomPoiTypeModal, setShowCustomPoiTypeModal] = useState(false);
  const [showSharePoiModal, setShowSharePoiModal] = useState(false);
  const [selectedPoiForShare, setSelectedPoiForShare] = useState<Poi | null>(null);
  const [editingPoiType, setEditingPoiType] = useState<PoiType | null>(null);

  // Gallery state
  const [showGallery, setShowGallery] = useState(false);
  const [galleryPoi, setGalleryPoi] = useState<Poi | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // State to track if initial filter setup has been done
  const [initialFilterSetup, setInitialFilterSetup] = useState(false);

  // Initialize data on component mount
  useEffect(() => {
    if (!authLoading) {
      initializeData();
    }
  }, [authLoading]);

  // Initialize filter state when POI types are loaded (only on initial setup)
  useEffect(() => {
    if (poiTypes.length > 0 && !initialFilterSetup) {
      // By default, select all types and categories on initial load
      setSelectedPoiTypes(poiTypes.map(type => type.id));
      setSelectedCategories([...new Set(poiTypes.map(type => type.category))]);
      setInitialFilterSetup(true);
    }
  }, [poiTypes, initialFilterSetup]);

  const initializeData = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchHaggaBasinPOIs(),
        fetchPoiTypes(),
        fetchBaseMaps(),
        fetchOverlays(),
        fetchCollections(),
        fetchCustomIcons()
      ]);
    } catch (err) {
      console.error('Error initializing Hagga Basin data:', err);
      setError('Failed to load map data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHaggaBasinPOIs = async () => {
    const { data, error } = await supabase
      .from('pois')
      .select(`
        *,
        poi_types (*),
        profiles (username)
      `)
      .eq('map_type', 'hagga_basin')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching Hagga Basin POIs:', error);
      throw error;
    }

    // Transform screenshots JSONB[] to PoiScreenshot[] format for compatibility
    const poisWithTransformedScreenshots = (data || []).map(poi => ({
      ...poi,
      screenshots: Array.isArray(poi.screenshots) 
        ? poi.screenshots.map((screenshot: any, index: number) => ({
            id: screenshot.id || `${poi.id}_${index}`,
            url: screenshot.url || screenshot,
            uploaded_by: screenshot.uploaded_by || poi.created_by,
            upload_date: screenshot.upload_date || poi.created_at
          }))
        : []
    }));

    setPois(poisWithTransformedScreenshots);
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

  // Filter POIs based on current filter state - Simplified logic
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

  // Get user-created POI types for display in customization tab
  const userCreatedPoiTypes = poiTypes.filter(type => type.created_by === user?.id);

  // Handle category toggle - now syncs with selectedPoiTypes
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

  // Helper function to render a category section
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
      // Add to local state
      setPois(prev => [newPoi, ...prev]);
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

  // Handle POI editing
  const handlePoiUpdated = async (updatedPoi: Poi) => {
    try {
      const { error } = await supabase
        .from('pois')
        .update({
          title: updatedPoi.title,
          description: updatedPoi.description,
          coordinates_x: updatedPoi.coordinates_x,
          coordinates_y: updatedPoi.coordinates_y,
          poi_type_id: updatedPoi.poi_type_id,
          privacy_level: updatedPoi.privacy_level
        })
        .eq('id', updatedPoi.id);

      if (error) throw error;

      // Update local state
      setPois(prev => prev.map(p => p.id === updatedPoi.id ? updatedPoi : p));
    } catch (error) {
      console.error('Error updating POI:', error);
      throw error;
    }
  };

  // Handle POI deletion
  const handlePoiDeleted = async (poiId: string) => {
    try {
      const { error } = await supabase
        .from('pois')
        .delete()
        .eq('id', poiId);

      if (error) throw error;

      // Update local state
      setPois(prev => prev.filter(p => p.id !== poiId));
    } catch (error) {
      console.error('Error deleting POI:', error);
      throw error;
    }
  };

  // Handle custom POI type updates
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

  // Handle POI gallery opening
  const handlePoiGalleryOpen = useCallback((poi: Poi) => {
    if (poi.screenshots && poi.screenshots.length > 0) {
      setGalleryPoi(poi);
      setGalleryIndex(0);
      setShowGallery(true);
    }
  }, []);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-spice-500 mx-auto"></div>
          <p className="mt-4 text-sand-600">Loading Hagga Basin map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error Loading Map</div>
          <p className="text-sand-600 mb-4">{error}</p>
          <button 
            onClick={() => initializeData()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-sand-50 flex overflow-hidden" style={{height: 'calc(100vh - 4rem)'}}>
      {/* Sidebar */}
      <div className={`bg-white border-r border-sand-200 transition-all duration-300 ${
        sidebarOpen ? 'w-96' : 'w-0 overflow-hidden'
      }`}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="border-b border-sand-200 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-sand-800 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-spice-500" />
                Hagga Basin
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-sand-400 hover:text-sand-600"
              >
                ✕
              </button>
            </div>
            
            {/* Tab Navigation */}
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
                onClick={() => setActiveTab('overlays')}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === 'overlays' 
                    ? 'bg-spice-100 text-spice-700' 
                    : 'text-sand-600 hover:text-sand-800'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-1" />
                Layers
              </button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'filters' && (
              <div className="space-y-4">
                {/* Add POI Button */}
                <div>
                  <button
                    onClick={() => setPlacementMode(!placementMode)}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                      placementMode 
                        ? 'bg-spice-500 text-white hover:bg-spice-600' 
                        : 'bg-white border-2 border-spice-200 text-spice-700 hover:bg-spice-50 hover:border-spice-300'
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                    <span>
                      {placementMode ? 'Click on Map to Place POI' : 'Add Point of Interest'}
                    </span>
                  </button>
                  {placementMode && (
                    <div className="text-xs text-spice-600 mt-2 text-center">
                      Click anywhere on the map to place a new POI. Click this button again to cancel.
                    </div>
                  )}
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

            {activeTab === 'overlays' && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-sand-700">Map Layers</h3>
                
                {overlays.length === 0 ? (
                  <div className="text-sm text-sand-500 italic">
                    No overlay layers available
                  </div>
                ) : (
                  <div className="space-y-2">
                    {overlays.map(overlay => (
                      <div key={overlay.id} className="flex items-center justify-between">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedOverlays.includes(overlay.id)}
                            onChange={() => handleOverlayToggle(overlay.id)}
                            className="rounded border-sand-300 text-spice-600 focus:ring-spice-500"
                          />
                          <span className="ml-2 text-sm text-sand-700">{overlay.name}</span>
                        </label>
                        <div className="text-xs text-sand-500">
                          {Math.round(overlay.opacity * 100)}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Map Controls */}
        <div className="absolute top-4 left-4 z-40 space-y-2">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="bg-white border border-sand-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow"
              title="Open Sidebar"
            >
              <Filter className="w-5 h-5 text-sand-600" />
            </button>
          )}
        </div>

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
            customIcons={customIcons}
            placementMode={placementMode}
            onPlacementModeChange={setPlacementMode}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-sand-100">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-sand-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-sand-600 mb-2">No Base Map Available</h3>
              <p className="text-sand-500">
                An administrator needs to upload a base map to enable the interactive map.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Collection Modal */}
      <CollectionModal
        isOpen={showCollectionModal}
        onClose={() => setShowCollectionModal(false)}
        onCollectionCreated={(newCollection) => {
          setCollections(prev => [newCollection, ...prev]);
          setShowCollectionModal(false);
        }}
        existingCollections={collections}
      />

      {/* Custom POI Type Modal */}
      <CustomPoiTypeModal
        isOpen={showCustomPoiTypeModal}
        onClose={() => {
          setShowCustomPoiTypeModal(false);
          setEditingPoiType(null);
        }}
        customPoiTypes={userCreatedPoiTypes}
        onPoiTypeCreated={handleCustomPoiTypeCreated}
        onPoiTypeDeleted={handleCustomPoiTypeDeleted}
        onPoiTypeUpdated={handleCustomPoiTypeUpdated}
        onPoiTypeEdit={handleCustomPoiTypeEdit}
        editingPoiType={editingPoiType}
      />

      {/* Share POI Modal */}
      <SharePoiModal
        isOpen={showSharePoiModal}
        onClose={() => {
          setShowSharePoiModal(false);
          setSelectedPoiForShare(null);
        }}
        poi={selectedPoiForShare}
      />

      {/* Gallery Modal */}
      {showGallery && galleryPoi?.screenshots && (
        <GridGallery
          squares={galleryPoi.screenshots.map(s => ({
            id: s.id,
            screenshot_url: s.url,
            uploaded_by: s.uploaded_by,
            upload_date: s.upload_date,
            coordinate: galleryPoi.title || 'POI',
            is_explored: false,
          }))}
          initialIndex={galleryIndex}
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
    </div>
  );
};

export default HaggaBasinPage; 