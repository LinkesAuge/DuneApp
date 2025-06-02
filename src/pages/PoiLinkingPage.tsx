import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, Check, Package, FileText, MapPin, List, Map, Mountain, Grid3X3, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createBulkPoiItemLinks } from '../lib/api/poiItemLinks';
import { useAuth } from '../components/auth/AuthProvider';
import { supabase } from '../lib/supabase';
import InteractiveMap from '../components/hagga-basin/InteractiveMap';
import DeepDesertSelectionMode from '../components/poi-linking/DeepDesertSelectionMode';
import type { Poi, PoiType, Item, Schematic, HaggaBasinBaseMap, GridSquare } from '../types';

interface PoiFilters {
  searchTerm: string;
  selectedPoiTypes: Set<string>;
  selectedRegions: Set<string>;
}

interface EnhancedPoiLinkingState {
  // Map mode and navigation
  mapMode: 'hagga-basin' | 'deep-desert';
  currentGridId: string; // A1-I9 for Deep Desert navigation
  
  // Unified selection (works across both maps)
  selectedPoiIds: Set<string>;
  existingLinks: Set<string>;
  
  // Enhanced filtering (mode-aware)
  filters: PoiFilters;
}

const GRID_COORDINATES = [
  'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9',
  'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9',
  'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9',
  'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9',
  'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9',
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9',
  'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9',
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9',
  'I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8', 'I9'
];

const PoiLinkingPage: React.FC = () => {
  const { entityId } = useParams<{ entityId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Extract entityType from the URL path
  const entityType = location.pathname.includes('/items/') ? 'items' : 
                     location.pathname.includes('/schematics/') ? 'schematics' : 
                     undefined;
  
  // Entity data
  const [targetEntity, setTargetEntity] = useState<Item | Schematic | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Enhanced state management for dual map support
  const [mapMode, setMapMode] = useState<'hagga-basin' | 'deep-desert'>('hagga-basin');
  const [currentGridId, setCurrentGridId] = useState<string>('A1'); // Default starting grid
  const [selectedPoiIds, setSelectedPoiIds] = useState<Set<string>>(new Set());
  const [existingLinks, setExistingLinks] = useState<Set<string>>(new Set());
  
  // POI data - unified across both maps
  const [pois, setPois] = useState<Poi[]>([]);
  const [poiTypes, setPoiTypes] = useState<PoiType[]>([]);
  
  // Map-specific data
  const [baseMap, setBaseMap] = useState<HaggaBasinBaseMap | null>(null);

  const [allGridSquares, setAllGridSquares] = useState<GridSquare[]>([]);
  
  // UI state
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [relationshipType, setRelationshipType] = useState<'found_here' | 'material_source'>('found_here');
  const [submitting, setSubmitting] = useState(false);
  
  // Panel visibility state
  const [showRightPanel, setShowRightPanel] = useState(true);
  
  const [filters, setFilters] = useState<PoiFilters>({
    searchTerm: '',
    selectedPoiTypes: new Set(),
    selectedRegions: new Set(['hagga_basin', 'deep_desert'])
  });

  // Helper functions for icon rendering
  const isIconUrl = (icon: string): boolean => {
    return icon?.startsWith('http') || icon?.startsWith('/') || icon?.includes('.');
  };

  const renderPoiIcon = (icon: string | undefined, fallback: string = '📍', className: string = 'w-6 h-6') => {
    if (!icon) return <span className="text-lg">{fallback}</span>;
    
    if (isIconUrl(icon)) {
      return <img src={icon} alt="POI Icon" className={`${className} object-contain`} />;
    } else {
      return <span className="text-lg">{icon}</span>;
    }
  };

  // Map mode selection handlers
  const handleMapModeChange = (mode: 'hagga-basin' | 'deep-desert') => {
    setMapMode(mode);
    if (mode === 'deep-desert') {
      // Start at A1 when switching to Deep Desert
      setCurrentGridId('A1');
    }
  };

  // Deep Desert grid navigation
  const handleGridNavigate = (gridId: string) => {
    if (GRID_COORDINATES.includes(gridId)) {
      setCurrentGridId(gridId);
    }
  };

  // Selection handlers (unified across both maps)
  const handlePoiSelect = (poiId: string) => {
    setSelectedPoiIds(prev => {
      const newSet = new Set(prev);
      newSet.add(poiId);
      return newSet;
    });
  };

  const handlePoiDeselect = (poiId: string) => {
    setSelectedPoiIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(poiId);
      return newSet;
    });
  };

  const handlePoiToggle = (poiId: string) => {
    if (selectedPoiIds.has(poiId)) {
      handlePoiDeselect(poiId);
    } else {
      handlePoiSelect(poiId);
    }
  };

  // Fetch entity and POI data
  useEffect(() => {
    const fetchData = async () => {
      if (!entityId || !entityType) {
        navigate('/database');
        return;
      }

      try {
        setLoading(true);

        // Fetch target entity
        const entityTable = entityType === 'items' ? 'items' : 'schematics';
        const { data: entityData, error: entityError } = await supabase
          .from(entityTable)
          .select(`
            *,
            categories (id, name, icon),
            types (id, name),
            tiers (id, name, color)
          `)
          .eq('id', entityId)
          .single();

        if (entityError) throw entityError;
        setTargetEntity(entityData);

        // Fetch POIs from both maps
        const { data: poisData, error: poisError } = await supabase
          .from('pois')
          .select(`
            id,
            title,
            description,
            coordinates_x,
            coordinates_y,
            map_type,
            poi_type_id,
            created_by,
            privacy_level,

            screenshots,
            poi_types!inner (
              id,
              name,
              icon,
              category,
              color
            )
          `)
          .order('title');

        if (poisError) throw poisError;

        // Transform screenshots JSONB[] to PoiScreenshot[] format for compatibility
        const poisWithTransformedScreenshots = (poisData || []).map(poi => ({
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

        // Fetch POI types
        const { data: typesData, error: typesError } = await supabase
          .from('poi_types')
          .select('*')
          .order('category', { ascending: true });

        if (typesError) throw typesError;

        // Fetch base map for Hagga Basin
        const { data: baseMapData, error: baseMapError } = await supabase
          .from('hagga_basin_base_maps')
          .select('*')
          .eq('is_active', true)
          .single();

        if (baseMapError) {
          console.warn('No base map found, using fallback');
        }



        // Fetch all grid squares for Deep Desert minimap
        const { data: gridSquaresData, error: gridSquaresError } = await supabase
          .from('grid_squares')
          .select('*')
          .order('grid_id');

        if (gridSquaresError) {
          console.warn('Error fetching grid squares:', gridSquaresError);
        }

        setPois(poisWithTransformedScreenshots);
        setPoiTypes(typesData || []);
        setBaseMap(baseMapData || null);

        setAllGridSquares(gridSquaresData || []);

        // Fetch existing links for this entity
        const linkField = entityType === 'items' ? 'item_id' : 'schematic_id';
        const { data: existingLinksData, error: linksError } = await supabase
          .from('poi_item_links')
          .select('poi_id')
          .eq(linkField, entityId);

        if (linksError) {
          console.warn('Error fetching existing links:', linksError);
        } else {
          const linkedPoiIds = new Set((existingLinksData || []).map(link => link.poi_id));
          setExistingLinks(linkedPoiIds);
          setSelectedPoiIds(linkedPoiIds); // Pre-select existing links
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
        navigate('/database');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [entityId, entityType, navigate]);

  // Filter POIs based on current map mode and filters
  const filteredPois = useMemo(() => {
    let filtered = pois;

    // Filter by map mode
    if (mapMode === 'hagga-basin') {
      filtered = filtered.filter(poi => poi.map_type === 'hagga_basin');
    } else if (mapMode === 'deep-desert') {
      // For Deep Desert mode, filter to current grid if we have grid data
      filtered = filtered.filter(poi => poi.map_type === 'deep_desert');
      // Additional grid filtering would be added here when GridPage integration is complete
    }

    // Apply search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(poi =>
        poi.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        poi.description?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Apply POI type filter
    if (filters.selectedPoiTypes.size > 0) {
      filtered = filtered.filter(poi => filters.selectedPoiTypes.has(poi.poi_type_id));
    }

    return filtered;
  }, [pois, mapMode, filters, currentGridId]);

  // Filter handlers
  const handleFilterChange = (key: keyof PoiFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const togglePoiType = (typeId: string) => {
    setFilters(prev => {
      const newTypes = new Set(prev.selectedPoiTypes);
      if (newTypes.has(typeId)) {
        newTypes.delete(typeId);
      } else {
        newTypes.add(typeId);
      }
      return { ...prev, selectedPoiTypes: newTypes };
    });
  };

  const toggleRegion = (region: string) => {
    setFilters(prev => {
      const newRegions = new Set(prev.selectedRegions);
      if (newRegions.has(region)) {
        newRegions.delete(region);
      } else {
        newRegions.add(region);
      }
      return { ...prev, selectedRegions: newRegions };
    });
  };

  // Create links handler
  const handleCreateLinks = async () => {
    if (!targetEntity || !user) return;

    const newlySelectedPois = Array.from(selectedPoiIds).filter(poiId => !existingLinks.has(poiId));
    
    if (newlySelectedPois.length === 0) {
      toast.error('No new POIs selected to link');
      return;
    }

    try {
      setSubmitting(true);
      
      const operations = newlySelectedPois.map(poiId => ({
        poi_id: poiId,
        [entityType === 'items' ? 'item_id' : 'schematic_id']: targetEntity.id,
        link_type: relationshipType,
        created_by: user.id
      }));

      await createBulkPoiItemLinks(operations);
      
      toast.success(`Successfully linked ${newlySelectedPois.length} POI${newlySelectedPois.length !== 1 ? 's' : ''}`);
      navigate('/database');
    } catch (error) {
      console.error('Error creating links:', error);
      toast.error('Failed to create links');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle map POI clicks
  const handleMapPoiClick = (poi: Poi) => {
    handlePoiToggle(poi.id);
  };

  // Get selection counts by map type for summary
  const getSelectionSummary = () => {
    const selectedPois = Array.from(selectedPoiIds).map(id => pois.find(poi => poi.id === id)).filter(Boolean) as Poi[];
    const haggaBasinCount = selectedPois.filter(poi => poi.map_type === 'hagga_basin').length;
    const deepDesertCount = selectedPois.filter(poi => poi.map_type === 'deep_desert').length;
    const newSelectionCount = Array.from(selectedPoiIds).filter(id => !existingLinks.has(id)).length;
    
    return { haggaBasinCount, deepDesertCount, newSelectionCount, total: selectedPoiIds.size };
  };

  if (loading || !targetEntity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin mx-auto mb-4" />
          <span className="text-amber-200 font-light tracking-wide"
                style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
            Loading...
          </span>
        </div>
      </div>
    );
  }

  const selectionSummary = getSelectionSummary();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header with Map Mode Toggle */}
      <div className="sticky top-0 z-40 bg-slate-800/95 backdrop-blur border-b border-slate-700">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back Button & Title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/database')}
                className="p-2 text-slate-400 hover:text-amber-200 hover:bg-slate-700 rounded transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                {entityType === 'items' ? 
                  <Package className="w-6 h-6 text-amber-400" /> : 
                  <FileText className="w-6 h-6 text-amber-400" />
                }
                <div>
                  <h1 className="text-xl font-bold text-amber-200"
                      style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
                    Link POI Locations
                  </h1>
                  <p className="text-sm text-amber-200/60">
                    {targetEntity.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Center: Map Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleMapModeChange('hagga-basin')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  mapMode === 'hagga-basin' 
                    ? 'bg-amber-600 text-slate-900 shadow-lg' 
                    : 'bg-slate-700 text-amber-200 hover:bg-slate-600'
                }`}
                style={{ fontFamily: "'Trebuchet MS', sans-serif" }}
              >
                <Mountain className="w-4 h-4" />
                <span className="font-medium">Hagga Basin</span>
              </button>
              <button
                onClick={() => handleMapModeChange('deep-desert')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  mapMode === 'deep-desert' 
                    ? 'bg-amber-600 text-slate-900 shadow-lg' 
                    : 'bg-slate-700 text-amber-200 hover:bg-slate-600'
                }`}
                style={{ fontFamily: "'Trebuchet MS', sans-serif" }}
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="font-medium">Deep Desert</span>
              </button>
            </div>

            {/* Right: View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-amber-600 text-slate-900' 
                    : 'text-slate-400 hover:text-amber-200 hover:bg-slate-700'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'map' 
                    ? 'bg-amber-600 text-slate-900' 
                    : 'text-slate-400 hover:text-amber-200 hover:bg-slate-700'
                }`}
              >
                <Map className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Three-Panel Layout */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 h-[calc(100vh-8rem)]">
          
          {/* Left Panel: Controls */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 h-full overflow-y-auto">
              <h3 className="text-amber-200 font-semibold mb-6"
                  style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
                Controls & Filters
              </h3>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-amber-200/80 text-sm mb-2">Search POIs</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    placeholder="Search by name..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded text-amber-200 placeholder-slate-400 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* POI Types */}
              <div className="mb-6">
                <label className="block text-amber-200/80 text-sm mb-2">POI Types</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {poiTypes.map(type => (
                    <label key={type.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.selectedPoiTypes.has(type.id)}
                        onChange={() => togglePoiType(type.id)}
                        className="rounded border-slate-600 bg-slate-700 text-amber-400 focus:ring-amber-400"
                      />
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {renderPoiIcon(type.icon, '📍', 'w-4 h-4')}
                      </div>
                      <span className="text-amber-200/90 text-sm">{type.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Relationship Type */}
              <div className="mb-6">
                <label className="block text-amber-200/80 text-sm mb-2">Relationship Type</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="relationshipType"
                      value="found_here"
                      checked={relationshipType === 'found_here'}
                      onChange={(e) => setRelationshipType(e.target.value as 'found_here')}
                      className="border-slate-600 bg-slate-700 text-amber-400 focus:ring-amber-400"
                    />
                    <span className="text-amber-200/90 text-sm">Found Here</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="relationshipType"
                      value="material_source"
                      checked={relationshipType === 'material_source'}
                      onChange={(e) => setRelationshipType(e.target.value as 'material_source')}
                      className="border-slate-600 bg-slate-700 text-amber-400 focus:ring-amber-400"
                    />
                    <span className="text-amber-200/90 text-sm">Material Source</span>
                  </label>
                </div>
              </div>

              {/* Current Map Info */}
              <div className="border-t border-slate-600 pt-4">
                <div className="text-amber-200/80 text-sm mb-3">
                  Current Map: <span className="font-medium text-amber-200">
                    {mapMode === 'hagga-basin' ? 'Hagga Basin' : `Deep Desert (${currentGridId})`}
                  </span>
                </div>
                
                {/* Real-time stats */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-slate-700/30 rounded p-2 text-center">
                    <div className="text-amber-300 text-lg font-bold">
                      {filteredPois.length}
                    </div>
                    <div className="text-amber-200/60 text-xs">Available</div>
                  </div>
                  <div className="bg-slate-700/30 rounded p-2 text-center">
                    <div className="text-amber-300 text-lg font-bold">
                      {(() => {
                        const currentMapPois = filteredPois.filter(poi => 
                          mapMode === 'hagga-basin' 
                            ? poi.map_type === 'hagga_basin'
                            : poi.map_type === 'deep_desert'
                        );
                        return Array.from(selectedPoiIds).filter(id => 
                          currentMapPois.some(poi => poi.id === id)
                        ).length;
                      })()}
                    </div>
                    <div className="text-amber-200/60 text-xs">Selected</div>
                  </div>
                </div>
                
                {/* Quick selection actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      const currentMapPois = filteredPois.filter(poi => 
                        mapMode === 'hagga-basin' 
                          ? poi.map_type === 'hagga_basin'
                          : poi.map_type === 'deep_desert'
                      );
                      const newSelection = new Set(selectedPoiIds);
                      currentMapPois.forEach(poi => newSelection.add(poi.id));
                      setSelectedPoiIds(newSelection);
                    }}
                    disabled={filteredPois.length === 0}
                    className="w-full px-2 py-1 text-xs text-amber-200 border border-slate-600 rounded hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Select All on Current Map
                  </button>
                  <button
                    onClick={() => {
                      const currentMapPois = filteredPois.filter(poi => 
                        mapMode === 'hagga-basin' 
                          ? poi.map_type === 'hagga_basin'
                          : poi.map_type === 'deep_desert'
                      );
                      const newSelection = new Set(selectedPoiIds);
                      currentMapPois.forEach(poi => newSelection.delete(poi.id));
                      setSelectedPoiIds(newSelection);
                    }}
                    disabled={(() => {
                      const currentMapPois = filteredPois.filter(poi => 
                        mapMode === 'hagga-basin' 
                          ? poi.map_type === 'hagga_basin'
                          : poi.map_type === 'deep_desert'
                      );
                      return !Array.from(selectedPoiIds).some(id => 
                        currentMapPois.some(poi => poi.id === id)
                      );
                    })()}
                    className="w-full px-2 py-1 text-xs text-amber-200 border border-slate-600 rounded hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear Current Map
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel: Map/Grid Content */}
          <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            {/* Content Header */}
            <div className="p-4 border-b border-slate-700 bg-slate-750">
              <div className="flex items-center justify-between">
                <span className="text-amber-200/80 text-sm">
                  {mapMode === 'hagga-basin' ? 'Hagga Basin' : `Deep Desert - Grid ${currentGridId}`} • 
                  {filteredPois.length} POI{filteredPois.length !== 1 ? 's' : ''}
                </span>
                <span className="text-amber-200 text-sm">
                  {selectionSummary.total} selected
                </span>
              </div>
            </div>

            {/* Content Area */}
            <div className="h-[calc(100%-4rem)]">
              {mapMode === 'hagga-basin' ? (
                /* Hagga Basin Mode */
                viewMode === 'list' ? (
                  /* List View */
                  <div className="h-full overflow-y-auto p-4">
                    {filteredPois.length === 0 ? (
                      <div className="text-center py-12">
                        <MapPin className="w-12 h-12 text-amber-200/40 mx-auto mb-4" />
                        <p className="text-amber-200/60"
                           style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
                          No POIs match the current filters
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredPois.map(poi => {
                          const isSelected = selectedPoiIds.has(poi.id);
                          const isExistingLink = existingLinks.has(poi.id);
                          
                          return (
                            <div
                              key={poi.id}
                              onClick={() => handlePoiToggle(poi.id)}
                              className={`
                                p-4 rounded-lg border cursor-pointer transition-all relative
                                ${isSelected
                                  ? isExistingLink 
                                    ? 'border-blue-400 bg-blue-400/10' // Existing links - blue
                                    : 'border-amber-400 bg-amber-400/10' // New selections - amber
                                  : 'border-slate-600 bg-slate-700 hover:border-slate-500 hover:bg-slate-650'
                                }
                              `}
                            >
                              {/* Existing link indicator */}
                              {isExistingLink && (
                                <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                  Linked
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-3">
                                {/* Selection Indicator */}
                                <div className={`
                                  w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                                  ${isSelected
                                    ? isExistingLink
                                      ? 'border-blue-400 bg-blue-400'
                                      : 'border-amber-400 bg-amber-400'
                                    : 'border-slate-500'
                                  }
                                `}>
                                  {isSelected && (
                                    <Check className="w-3 h-3 text-slate-900" />
                                  )}
                                </div>

                                {/* POI Icon */}
                                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                                  {renderPoiIcon(poi.poi_types?.icon, '📍', 'w-6 h-6')}
                                </div>

                                {/* POI Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-amber-200 truncate"
                                       style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
                                    {poi.title}
                                  </div>
                                  <div className="text-sm text-amber-200/60 truncate">
                                    {poi.poi_types?.name} • {poi.map_type === 'hagga_basin' ? 'Hagga Basin' : 'Deep Desert'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Map View */
                  <div className="h-full relative">
                    {baseMap ? (
                      <InteractiveMap
                        baseMap={baseMap}
                        overlays={[]}
                        pois={filteredPois}
                        poiTypes={poiTypes}

                        onPoiClick={handleMapPoiClick}
                        selectedPoiIds={selectedPoiIds}
                        selectionMode={true}
                        onPoiCreated={() => {}} // Not needed in linking mode
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-slate-700">
                        <div className="text-center">
                          <div className="w-8 h-8 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin mx-auto mb-4" />
                          <span className="text-amber-200 font-light tracking-wide"
                                style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
                            Loading map...
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Selection Mode Indicator */}
                    <div className="absolute top-4 right-4 z-40 pointer-events-none">
                      <div className="bg-amber-500/90 text-white px-4 py-3 rounded-lg shadow-lg border border-amber-400/50">
                        <div className="text-center">
                          <MapPin className="w-5 h-5 mx-auto mb-1" />
                          <div className="text-sm font-medium">Selection Mode</div>
                          <div className="text-xs opacity-90">Click POIs to select/deselect</div>
                          <div className="text-xs font-medium mt-1">{selectionSummary.total} POI{selectionSummary.total !== 1 ? 's' : ''} selected</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                /* Deep Desert Mode */
                <DeepDesertSelectionMode
                  currentGridId={currentGridId}
                  allGridSquares={allGridSquares}
                  pois={pois}
                  poiTypes={poiTypes}

                  selectedPoiIds={selectedPoiIds}
                  onPoiSelect={handlePoiSelect}
                  onPoiDeselect={handlePoiDeselect}
                  onGridNavigate={handleGridNavigate}
                  filteredPois={filteredPois}
                />
              )}
            </div>
          </div>

          {/* Right Panel: Selection Summary */}
          {showRightPanel && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 h-full overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-amber-200 font-semibold"
                      style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
                    Selected POIs
                  </h3>
                  <button
                    onClick={() => setShowRightPanel(false)}
                    className="p-1 text-slate-400 hover:text-amber-200 hover:bg-slate-700 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Selection Summary */}
                <div className="mb-6">
                  <div className="text-amber-200 text-lg font-medium mb-4">
                    {selectionSummary.total} POI{selectionSummary.total !== 1 ? 's' : ''} selected
                  </div>
                  
                  {selectionSummary.total > 0 ? (
                    <div className="space-y-3">
                      {/* Map type breakdown */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Mountain className="w-4 h-4 text-amber-300 mr-1" />
                            <span className="text-xs text-amber-200/80 font-medium">Hagga Basin</span>
                          </div>
                          <div className="text-lg font-bold text-amber-200">
                            {selectionSummary.haggaBasinCount}
                          </div>
                        </div>
                        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Grid3X3 className="w-4 h-4 text-amber-300 mr-1" />
                            <span className="text-xs text-amber-200/80 font-medium">Deep Desert</span>
                          </div>
                          <div className="text-lg font-bold text-amber-200">
                            {selectionSummary.deepDesertCount}
                          </div>
                        </div>
                      </div>
                      
                      {/* Link status breakdown */}
                      <div className="border-t border-slate-600 pt-3">
                        {(() => {
                          const existingCount = Array.from(selectedPoiIds).filter(id => existingLinks.has(id)).length;
                          return (
                            <div className="space-y-2">
                              {existingCount > 0 && (
                                <div className="flex items-center justify-between p-2 bg-blue-500/10 border border-blue-500/20 rounded">
                                  <span className="text-blue-300 text-sm">Already linked</span>
                                  <span className="text-blue-200 font-medium">{existingCount}</span>
                                </div>
                              )}
                              {selectionSummary.newSelectionCount > 0 && (
                                <div className="flex items-center justify-between p-2 bg-amber-500/10 border border-amber-500/20 rounded">
                                  <span className="text-amber-300 text-sm">
                                    New ({relationshipType === 'found_here' ? 'Found Here' : 'Material Source'})
                                  </span>
                                  <span className="text-amber-200 font-medium">{selectionSummary.newSelectionCount}</span>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-amber-200/40">
                      <MapPin className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No POIs selected</p>
                      <p className="text-xs mt-1">Select POIs from either map to create links</p>
                    </div>
                  )}
                </div>

                {/* Selected POI List */}
                {selectionSummary.total > 0 && (
                  <div className="mb-6">
                    <h4 className="text-amber-200/80 text-sm font-medium mb-3">Selected POIs</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {Array.from(selectedPoiIds).map(poiId => {
                        const poi = pois.find(p => p.id === poiId);
                        if (!poi) return null;
                        
                        const poiType = poiTypes.find(type => type.id === poi.poi_type_id);
                        const isExistingLink = existingLinks.has(poiId);
                        
                        return (
                          <div
                            key={poiId}
                            className={`
                              flex items-center space-x-3 p-2 rounded-lg border transition-all
                              ${isExistingLink 
                                ? 'bg-blue-500/10 border-blue-500/20' 
                                : 'bg-amber-500/10 border-amber-500/20'
                              }
                            `}
                          >
                            {/* POI Icon */}
                            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                              {renderPoiIcon(poiType?.icon, '📍', 'w-4 h-4')}
                            </div>
                            
                            {/* POI Info */}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-amber-200 text-sm truncate">
                                {poi.title}
                              </div>
                              <div className="text-xs text-amber-200/60 truncate">
                                {poiType?.name} • {poi.map_type === 'hagga_basin' ? 'Hagga Basin' : 'Deep Desert'}
                              </div>
                            </div>
                            
                            {/* Status indicator */}
                            <div className="flex-shrink-0">
                              {isExistingLink ? (
                                <div className="w-2 h-2 bg-blue-400 rounded-full" title="Already linked" />
                              ) : (
                                <div className="w-2 h-2 bg-amber-400 rounded-full" title="New link" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-slate-600">
                  {selectionSummary.total > 0 && (
                    <button
                      onClick={() => setSelectedPoiIds(new Set())}
                      className="w-full px-4 py-2 text-amber-200 border border-slate-600 rounded hover:bg-slate-700 transition-colors flex items-center justify-center space-x-2"
                      style={{ fontFamily: "'Trebuchet MS', sans-serif" }}
                    >
                      <X className="w-4 h-4" />
                      <span>Clear All ({selectionSummary.total})</span>
                    </button>
                  )}
                  
                  <button
                    onClick={handleCreateLinks}
                    disabled={selectionSummary.newSelectionCount === 0 || submitting}
                    className={`
                      w-full px-4 py-3 rounded font-medium transition-all flex items-center justify-center space-x-2
                      ${selectionSummary.newSelectionCount > 0 && !submitting
                        ? 'bg-amber-600 text-slate-900 hover:bg-amber-500 shadow-lg'
                        : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      }
                    `}
                    style={{ fontFamily: "'Trebuchet MS', sans-serif" }}
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-700 border-t-slate-900 rounded-full animate-spin" />
                        <span>Creating Links...</span>
                      </>
                    ) : selectionSummary.newSelectionCount > 0 ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Create {selectionSummary.newSelectionCount} New Link{selectionSummary.newSelectionCount !== 1 ? 's' : ''}</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4" />
                        <span>Select POIs to Create Links</span>
                      </>
                    )}
                  </button>
                  
                  {/* Quick tips */}
                  <div className="text-xs text-amber-200/40 text-center space-y-1">
                    <div>💡 Tip: Switch between maps to select POIs from both areas</div>
                    {mapMode === 'deep-desert' && (
                      <div>🗺️ Use the minimap to navigate between grid squares</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right Panel Toggle (when collapsed) */}
          {!showRightPanel && (
            <div className="w-6 flex-shrink-0 flex items-start pt-6">
              <button
                onClick={() => setShowRightPanel(true)}
                className="p-2 text-slate-400 hover:text-amber-200 hover:bg-slate-700 rounded transition-colors bg-slate-800 border border-slate-700"
                title="Show selection panel"
              >
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PoiLinkingPage; 