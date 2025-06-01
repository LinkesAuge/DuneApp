import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, Check, Package, FileText, MapPin, List, Map } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createBulkPoiItemLinks } from '../lib/api/poiItemLinks';
import { useAuth } from '../components/auth/AuthProvider';
import { supabase } from '../lib/supabase';
import InteractiveMap from '../components/hagga-basin/InteractiveMap';
import type { Poi, PoiType, Item, Schematic, HaggaBasinBaseMap, CustomIcon } from '../types';

interface PoiFilters {
  searchTerm: string;
  selectedPoiTypes: Set<string>;
  selectedRegions: Set<string>;
}

const PoiLinkingPage: React.FC = () => {
  const { entityId } = useParams<{ entityId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Extract entityType from the URL path
  const entityType = location.pathname.includes('/items/') ? 'items' : 
                     location.pathname.includes('/schematics/') ? 'schematics' : 
                     undefined;
  
  // Note: EntityType extracted from URL path for proper routing
  
  // Entity data
  const [targetEntity, setTargetEntity] = useState<Item | Schematic | null>(null);
  const [loading, setLoading] = useState(true);
  
  // POI data
  const [pois, setPois] = useState<Poi[]>([]);
  const [poiTypes, setPoiTypes] = useState<PoiType[]>([]);
  const [selectedPoiIds, setSelectedPoiIds] = useState<Set<string>>(new Set());
  const [existingLinks, setExistingLinks] = useState<Set<string>>(new Set()); // POIs already linked
  
  // Map data
  const [baseMap, setBaseMap] = useState<HaggaBasinBaseMap | null>(null);
  const [customIcons, setCustomIcons] = useState<CustomIcon[]>([]);
  
  // UI state
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [relationshipType, setRelationshipType] = useState<'found_here' | 'material_source'>('found_here');
  const [submitting, setSubmitting] = useState(false);
  
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

        // Fetch POIs
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
            custom_icon_id,
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

        // Fetch custom icons
        const { data: iconsData, error: iconsError } = await supabase
          .from('custom_icons')
          .select('*')
          .order('name');

        if (iconsError) {
          console.warn('Error fetching custom icons:', iconsError);
        }

        setPois(poisWithTransformedScreenshots);
        setPoiTypes(typesData || []);
        setBaseMap(baseMapData || null);
        setCustomIcons(iconsData || []);

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

  // Filter POIs
  const filteredPois = useMemo(() => {
    let filtered = pois;

    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(poi => 
        poi.title.toLowerCase().includes(searchLower)
      );
    }

    if (filters.selectedPoiTypes.size > 0) {
      filtered = filtered.filter(poi => 
        filters.selectedPoiTypes.has(poi.poi_type_id)
      );
    }

    if (filters.selectedRegions.size > 0 && filters.selectedRegions.size < 2) {
      filtered = filtered.filter(poi => {
        if (filters.selectedRegions.has('hagga_basin')) {
          return poi.map_type === 'hagga_basin';
        }
        if (filters.selectedRegions.has('deep_desert')) {
          return poi.map_type === 'deep_desert';
        }
        return true;
      });
    }

    return filtered;
  }, [pois, filters]);

  // Handlers
  const handlePoiToggle = (poiId: string) => {
    const newSelection = new Set(selectedPoiIds);
    if (newSelection.has(poiId)) {
      newSelection.delete(poiId);
    } else {
      newSelection.add(poiId);
    }
    setSelectedPoiIds(newSelection);
  };

  const handleFilterChange = (key: keyof PoiFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const togglePoiType = (typeId: string) => {
    const newSelection = new Set(filters.selectedPoiTypes);
    if (newSelection.has(typeId)) {
      newSelection.delete(typeId);
    } else {
      newSelection.add(typeId);
    }
    handleFilterChange('selectedPoiTypes', newSelection);
  };

  const toggleRegion = (region: string) => {
    const newSelection = new Set(filters.selectedRegions);
    if (newSelection.has(region)) {
      newSelection.delete(region);
    } else {
      newSelection.add(region);
    }
    handleFilterChange('selectedRegions', newSelection);
  };

  const handleCreateLinks = async () => {
    if (selectedPoiIds.size === 0 || !targetEntity) return;

    try {
      setSubmitting(true);

      // Only create links for newly selected POIs (not already existing ones)
      const newlySelectedPois = Array.from(selectedPoiIds).filter(poiId => !existingLinks.has(poiId));
      
      if (newlySelectedPois.length === 0) {
        toast.success('No new links to create');
        navigate('/database');
        return;
      }

      const operations = newlySelectedPois.map(poiId => ({
        poi_id: poiId,
        [entityType === 'items' ? 'item_id' : 'schematic_id']: targetEntity.id,
        link_type: relationshipType,
        created_by: user?.id
      }));

      await createBulkPoiItemLinks(operations);

      toast.success(`Created ${newlySelectedPois.length} new POI link${newlySelectedPois.length !== 1 ? 's' : ''} successfully`);
      navigate('/database');
    } catch (error) {
      console.error('Error creating links:', error);
      toast.error('Failed to create POI links');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle map POI click
  const handleMapPoiClick = (poi: Poi) => {
    handlePoiToggle(poi.id);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-800/95 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button & Title */}
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

            {/* View Mode Toggle */}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 sticky top-24">
              <h3 className="text-amber-200 font-semibold mb-6"
                  style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
                Filters & Settings
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

              {/* Regions */}
              <div className="mb-6">
                <label className="block text-amber-200/80 text-sm mb-2">Regions</label>
                <div className="space-y-2">
                  {[
                    { id: 'hagga_basin', label: 'Hagga Basin' },
                    { id: 'deep_desert', label: 'Deep Desert' }
                  ].map(region => (
                    <label key={region.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.selectedRegions.has(region.id)}
                        onChange={() => toggleRegion(region.id)}
                        className="rounded border-slate-600 bg-slate-700 text-amber-400 focus:ring-amber-400"
                      />
                      <span className="text-amber-200/90 text-sm">{region.label}</span>
                    </label>
                  ))}
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

              {/* Selection Summary */}
              <div className="border-t border-slate-600 pt-4">
                <div className="text-amber-200/80 text-sm mb-2">
                  {selectedPoiIds.size} POI{selectedPoiIds.size !== 1 ? 's' : ''} selected
                </div>
                {selectedPoiIds.size > 0 && (
                  <div className="text-amber-200/60 text-xs space-y-1">
                    {(() => {
                      const newSelections = Array.from(selectedPoiIds).filter(id => !existingLinks.has(id)).length;
                      const existingSelections = Array.from(selectedPoiIds).filter(id => existingLinks.has(id)).length;
                      
                      return (
                        <>
                          {existingSelections > 0 && (
                            <div className="text-blue-300">
                              {existingSelections} already linked
                            </div>
                          )}
                          {newSelections > 0 && (
                            <div>
                              {newSelections} new as "{relationshipType === 'found_here' ? 'Found Here' : 'Material Source'}"
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              {/* Content Header */}
              <div className="p-4 border-b border-slate-700 bg-slate-750">
                <div className="flex items-center justify-between">
                  <span className="text-amber-200/80 text-sm">
                    {filteredPois.length} POI{filteredPois.length !== 1 ? 's' : ''} available
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className="text-amber-200 text-sm">
                      {selectedPoiIds.size} selected
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="h-[600px]">
                {viewMode === 'list' ? (
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
                          const isNewlySelected = isSelected && !isExistingLink;
                          
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
                        customIcons={customIcons}
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
                          <div className="text-xs font-medium mt-1">{selectedPoiIds.size} POI{selectedPoiIds.size !== 1 ? 's' : ''} selected</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-6 bg-slate-800 rounded-lg border border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <div className="text-amber-200/80 text-sm">
                  {selectedPoiIds.size > 0 ? (
                    (() => {
                      const newSelections = Array.from(selectedPoiIds).filter(id => !existingLinks.has(id)).length;
                      const existingSelections = Array.from(selectedPoiIds).filter(id => existingLinks.has(id)).length;
                      
                      if (newSelections === 0 && existingSelections > 0) {
                        return `${existingSelections} POI${existingSelections !== 1 ? 's' : ''} already linked`;
                      } else if (newSelections > 0 && existingSelections === 0) {
                        return `Ready to create ${newSelections} new link${newSelections !== 1 ? 's' : ''} as "${relationshipType === 'found_here' ? 'Found Here' : 'Material Source'}"`;
                      } else if (newSelections > 0 && existingSelections > 0) {
                        return `${existingSelections} existing + ${newSelections} new link${newSelections !== 1 ? 's' : ''} to create`;
                      }
                      return 'Select POIs to create relationships';
                    })()
                  ) : (
                    'Select POIs to create relationships'
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => navigate('/database')}
                    disabled={submitting}
                    className="px-4 py-2 text-amber-200 border border-slate-600 rounded hover:bg-slate-700 transition-colors disabled:opacity-50"
                    style={{ fontFamily: "'Trebuchet MS', sans-serif" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateLinks}
                    disabled={selectedPoiIds.size === 0 || submitting}
                    className="px-6 py-2 bg-amber-600 text-slate-900 rounded hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    style={{ fontFamily: "'Trebuchet MS', sans-serif" }}
                  >
                    {submitting ? 'Creating Links...' : (() => {
                      const newSelections = Array.from(selectedPoiIds).filter(id => !existingLinks.has(id)).length;
                      return `Create ${newSelections} Link${newSelections !== 1 ? 's' : ''}`;
                    })()}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoiLinkingPage; 