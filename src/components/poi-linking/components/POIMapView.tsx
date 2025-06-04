import React, { useState, useEffect, useMemo } from 'react';
import { Map as MapIcon, RotateCcw, Mountain, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { HaggaBasinBaseMap, GridSquare, Poi, PoiType } from '../../../types';
import InteractiveMap from '../../hagga-basin/InteractiveMap';
import DeepDesertSelectionMode from '../DeepDesertSelectionMode';

interface POIMapViewProps {
  pois: Poi[];
  mapType: 'hagga' | 'deep' | 'both';
  onMapTypeChange?: (mapType: 'hagga' | 'deep') => void;
  onPOISelect?: (poiId: string) => void;
  selectedPOIIds?: Set<string>;
  poiTypes?: PoiType[];
}

const POIMapView: React.FC<POIMapViewProps> = ({
  pois,
  mapType,
  onMapTypeChange,
  onPOISelect,
  selectedPOIIds = new Set(),
  poiTypes = []
}) => {
  // Filter POIs by current map type (if not 'both')
  const getCurrentMapType = (): 'hagga' | 'deep' => {
    if (mapType === 'both') return 'hagga'; // Default to Hagga Basin
    return mapType;
  };

  const currentMapType = getCurrentMapType();
  // Map filter values to database values
  const dbMapType = currentMapType === 'hagga' ? 'hagga_basin' : 'deep_desert';
  const currentMapPOIs = pois.filter(poi => poi.map_type === dbMapType);

  // State for map data
  const [baseMaps, setBaseMaps] = useState<HaggaBasinBaseMap[]>([]);
  const [gridSquares, setGridSquares] = useState<GridSquare[]>([]);
  const [currentGridId, setCurrentGridId] = useState('A1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load map-specific data
  useEffect(() => {
    const loadMapData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (currentMapType === 'hagga') {
          // Load Hagga Basin base maps
          const { data: baseMapsData, error: baseMapsError } = await supabase
            .from('hagga_basin_base_maps')
            .select('*')
            .order('created_at', { ascending: false });

          if (baseMapsError) throw baseMapsError;
          setBaseMaps(baseMapsData || []);
        } else {
          // Load Deep Desert grid squares
          const { data: gridData, error: gridError } = await supabase
            .from('grid_squares')
            .select('*')
            .order('coordinate');

          if (gridError) throw gridError;
          setGridSquares(gridData || []);
        }
      } catch (err: any) {
        console.error('Error loading map data:', err);
        setError(err.message || 'Failed to load map data');
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, [currentMapType]);

  // Handle POI selection
  const handlePoiSelect = (poi: Poi) => {
    if (onPOISelect) {
      onPOISelect(poi.id);
    }
  };

  // Get active base map for Hagga Basin
  const activeBaseMap = useMemo(() => {
    return baseMaps.find(map => map.is_active) || baseMaps[0];
  }, [baseMaps]);

  const MapViewHeader: React.FC = () => (
    <div className="flex items-center justify-between p-3 border-b border-slate-600 bg-slate-800/50">
      <div className="flex items-center space-x-2">
        <MapIcon className="w-4 h-4 text-amber-400" />
        <span className="font-medium text-amber-200">
          {currentMapType === 'hagga' ? 'Hagga Basin Map' : 'Deep Desert Map'}
        </span>
        <span className="text-sm text-slate-400">
          ({currentMapPOIs.length} POIs)
        </span>
      </div>
      
      {mapType === 'both' && onMapTypeChange && (
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500">Map Type:</span>
          <div className="flex bg-slate-700 rounded p-1">
            <button
              onClick={() => onMapTypeChange('hagga')}
              className={`px-2 py-1 text-xs rounded ${
                currentMapType === 'hagga' 
                  ? 'bg-amber-600 text-amber-100' 
                  : 'text-slate-300 hover:bg-slate-600'
              }`}
            >
              🏔️ Hagga Basin
            </button>
            <button
              onClick={() => onMapTypeChange('deep')}
              className={`px-2 py-1 text-xs rounded ${
                currentMapType === 'deep' 
                  ? 'bg-amber-600 text-amber-100' 
                  : 'text-slate-300 hover:bg-slate-600'
              }`}
            >
              🏜️ Deep Desert
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const EmptyMapState: React.FC = () => (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <MapIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-slate-400 mb-2">
          No POIs found for {currentMapType === 'hagga' ? 'Hagga Basin' : 'Deep Desert'}
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          No POIs match the current filters for this map type.
        </p>
        <button className="dune-button-secondary text-xs px-3 py-1 rounded-lg flex items-center space-x-1 mx-auto">
          <RotateCcw size={12} />
          <span>Clear Filters</span>
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex-1 flex flex-col h-full">
        <MapViewHeader />
        <div className="flex-1 flex items-center justify-center bg-slate-900/30">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading {currentMapType === 'hagga' ? 'Hagga Basin' : 'Deep Desert'} map...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col h-full">
        <MapViewHeader />
        <div className="flex-1 flex items-center justify-center bg-slate-900/30">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">Error Loading Map</h3>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <MapViewHeader />
      
      {currentMapPOIs.length === 0 ? (
        <EmptyMapState />
      ) : (
        <div className="flex-1 relative">
          {/* Selection indicator */}
          <div className="absolute top-4 right-4 z-30 bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-lg px-3 py-2 shadow-lg">
            <div className="text-center">
              <div className={`text-lg font-bold ${
                currentMapType === 'hagga' ? 'text-blue-300' : 'text-orange-300'
              }`}>
                {selectedPOIIds.size}
              </div>
              <div className="text-slate-400 text-xs">Selected</div>
            </div>
          </div>

          {/* Render appropriate map component */}
          {currentMapType === 'hagga' ? (
            activeBaseMap ? (
              <InteractiveMap
                baseMap={activeBaseMap}
                overlays={[]}
                pois={currentMapPOIs}
                poiTypes={poiTypes}
                selectionMode={true}
                selectedPoiIds={selectedPOIIds}
                onPoiClick={handlePoiSelect}
                mapType="hagga_basin"
              />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-slate-900/30">
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mountain className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-300 mb-2">No Base Map Available</h3>
                  <p className="text-slate-500">Please upload a base map in the admin panel.</p>
                </div>
              </div>
            )
          ) : (
            <DeepDesertSelectionMode
              currentGridId={currentGridId}
              allGridSquares={gridSquares}
              pois={pois}
              poiTypes={poiTypes}
              selectedPoiIds={selectedPOIIds}
              onPoiSelect={(poiId) => onPOISelect?.(poiId)}
              onPoiDeselect={(poiId) => onPOISelect?.(poiId)}
              onGridNavigate={setCurrentGridId}
              filteredPois={currentMapPOIs}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default POIMapView; 