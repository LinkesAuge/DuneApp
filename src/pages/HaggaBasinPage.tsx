import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { MapPin, Filter, Settings, Plus, FolderOpen, Share, Image } from 'lucide-react';
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
import CustomIconsModal from '../components/hagga-basin/CustomIconsModal';
import SharePoiModal from '../components/hagga-basin/SharePoiModal';
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
  const [activeTab, setActiveTab] = useState<'filters' | 'collections' | 'overlays'>('filters');

  // Filter state
  const [selectedPoiTypes, setSelectedPoiTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [privacyFilter, setPrivacyFilter] = useState<'all' | 'public' | 'private' | 'shared'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Map state
  const [selectedOverlays, setSelectedOverlays] = useState<string[]>([]);
  const [activeBaseMap, setActiveBaseMap] = useState<HaggaBasinBaseMap | null>(null);
  
  // Modal state
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showCustomIconsModal, setShowCustomIconsModal] = useState(false);
  const [showSharePoiModal, setShowSharePoiModal] = useState(false);
  const [selectedPoiForShare, setSelectedPoiForShare] = useState<Poi | null>(null);

  // Initialize data on component mount
  useEffect(() => {
    if (!authLoading) {
      initializeData();
    }
  }, [authLoading]);

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

    setPois(data || []);
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

  // Filter POIs based on current filter state
  const filteredPois = pois.filter(poi => {
    // Search term filter
    if (searchTerm && !poi.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // POI type filter
    if (selectedPoiTypes.length > 0 && !selectedPoiTypes.includes(poi.poi_type_id)) {
      return false;
    }

    // Category filter
    if (selectedCategories.length > 0) {
      const poiType = poiTypes.find(type => type.id === poi.poi_type_id);
      if (!poiType || !selectedCategories.includes(poiType.category)) {
        return false;
      }
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

  // Handle POI creation
  const handlePoiCreated = useCallback(async (newPoi: Poi) => {
    setPois(prev => [newPoi, ...prev]);
    await fetchHaggaBasinPOIs(); // Refresh to ensure consistency
  }, []);

  // Handle overlay toggle
  const handleOverlayToggle = (overlayId: string) => {
    setSelectedOverlays(prev => 
      prev.includes(overlayId)
        ? prev.filter(id => id !== overlayId)
        : [...prev, overlayId]
    );
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
          custom_icon_id: updatedPoi.custom_icon_id,
          privacy_level: updatedPoi.privacy_level,
          updated_at: new Date().toISOString()
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

  // Handle custom icon updates
  const handleCustomIconUploaded = (newIcon: CustomIcon) => {
    setCustomIcons(prev => [newIcon, ...prev]);
  };

  const handleCustomIconDeleted = (iconId: string) => {
    setCustomIcons(prev => prev.filter(icon => icon.id !== iconId));
  };

  // Get unique categories for filtering
  const categories = [...new Set(poiTypes.map(type => type.category))];

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
        sidebarOpen ? 'w-80' : 'w-0 overflow-hidden'
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
                onClick={() => setActiveTab('collections')}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === 'collections' 
                    ? 'bg-spice-100 text-spice-700' 
                    : 'text-sand-600 hover:text-sand-800'
                }`}
              >
                <FolderOpen className="w-4 h-4 inline mr-1" />
                Collections
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
              <div className="space-y-6">
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

                {/* Privacy Filter */}
                <div>
                  <label className="block text-sm font-medium text-sand-700 mb-2">
                    Visibility
                  </label>
                  <select
                    value={privacyFilter}
                    onChange={(e) => setPrivacyFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-sand-300 rounded-md focus:outline-none focus:ring-2 focus:ring-spice-500"
                  >
                    <option value="all">All POIs</option>
                    <option value="public">Public Only</option>
                    <option value="private">Private Only</option>
                    <option value="shared">Shared Only</option>
                  </select>
                </div>

                {/* POI Type Filters */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-sand-700">
                      POI Types
                    </label>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setSelectedCategories(categories)}
                        className="text-xs text-spice-600 hover:text-spice-700"
                        title="Show All"
                      >
                        All
                      </button>
                      <span className="text-xs text-sand-400">|</span>
                      <button
                        onClick={() => setSelectedCategories([])}
                        className="text-xs text-spice-600 hover:text-spice-700"
                        title="Hide All"
                      >
                        None
                      </button>
                    </div>
                  </div>
                  
                  {/* Category Sections */}
                  {categories.map(category => {
                    const categoryTypes = poiTypes.filter(type => type.category === category);
                    const categoryVisible = selectedCategories.includes(category);
                    
                    return (
                      <div key={category} className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={categoryVisible}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCategories(prev => [...prev, category]);
                                } else {
                                  setSelectedCategories(prev => prev.filter(c => c !== category));
                                }
                              }}
                              className="rounded border-sand-300 text-spice-600 focus:ring-spice-500"
                            />
                            <span className="ml-2 text-sm font-medium text-sand-700 capitalize">
                              {category}
                            </span>
                          </label>
                          <span className="text-xs text-sand-500">
                            {categoryTypes.length}
                          </span>
                        </div>
                        
                        {/* Individual POI Types in Category */}
                        {categoryVisible && (
                          <div className="ml-6 space-y-1">
                            {categoryTypes.map(type => {
                              const typePoiCount = filteredPois.filter(poi => poi.poi_type_id === type.id).length;
                              
                              return (
                                <label key={type.id} className="flex items-center justify-between cursor-pointer group">
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={true} // For now, all types within visible categories are shown
                                      onChange={() => {
                                        // TODO: Implement individual type filtering
                                      }}
                                      className="rounded border-sand-300 text-spice-600 focus:ring-spice-500 w-3 h-3"
                                    />
                                    <span className="ml-2 text-xs text-sand-600 group-hover:text-sand-800">
                                      {type.name}
                                    </span>
                                  </div>
                                  <span className="text-xs text-sand-400">
                                    {typePoiCount}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Stats */}
                <div className="bg-sand-50 p-3 rounded-lg">
                  <div className="text-sm text-sand-600">
                    Showing {filteredPois.length} of {pois.length} POIs
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'collections' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-sand-700">Your Collections</h3>
                  <button 
                    onClick={() => setShowCollectionModal(true)}
                    className="btn btn-sm btn-primary"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Custom Icons Section */}
                <div className="pt-4 border-t border-sand-200">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-sand-700">Custom Icons</h4>
                    <button 
                      onClick={() => setShowCustomIconsModal(true)}
                      className="btn btn-sm btn-outline"
                    >
                      <Image className="w-4 h-4 mr-1" />
                      Manage
                    </button>
                  </div>
                  <p className="text-xs text-sand-500">
                    {customIcons.length}/10 custom icons • Upload PNG files for POI markers
                  </p>
                </div>
                
                {collections.length === 0 ? (
                  <div className="text-center py-8">
                    <FolderOpen className="w-12 h-12 text-sand-400 mx-auto mb-4" />
                    <p className="text-sand-600 mb-2">No collections yet</p>
                    <p className="text-sand-500 text-sm">Create your first collection to organize POIs</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {collections.map(collection => (
                      <div 
                        key={collection.id} 
                        className="bg-sand-50 border border-sand-200 rounded-lg p-3 cursor-pointer hover:bg-sand-100 transition-colors"
                        onClick={() => setShowCollectionModal(true)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <FolderOpen className="w-4 h-4 text-spice-600 mr-2" />
                              <h4 className="font-medium text-sand-800">{collection.name}</h4>
                              {collection.is_public && (
                                <div className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                  Public
                                </div>
                              )}
                            </div>
                            {collection.description && (
                              <p className="text-sm text-sand-600 mt-1">{collection.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
            customIcons={customIcons}
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

      {/* Custom Icons Modal */}
      <CustomIconsModal
        isOpen={showCustomIconsModal}
        onClose={() => setShowCustomIconsModal(false)}
        customIcons={customIcons}
        onIconUploaded={handleCustomIconUploaded}
        onIconDeleted={handleCustomIconDeleted}
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
    </div>
  );
};

export default HaggaBasinPage; 