import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { supabase } from '../../lib/supabase';
import { GridSquare, Poi, PoiType } from '../../types';
import { ChevronUp, ChevronDown, ZoomIn, ZoomOut, RotateCcw, MapPin, Check } from 'lucide-react';
import MapPOIMarker from '../hagga-basin/MapPOIMarker';

interface DeepDesertSelectionModeProps {
  currentGridId: string;
  allGridSquares: GridSquare[];
  pois: Poi[];
  poiTypes: PoiType[];

  selectedPoiIds: Set<string>;
  onPoiSelect: (poiId: string) => void;
  onPoiDeselect: (poiId: string) => void;
  onGridNavigate: (gridId: string) => void;
  filteredPois: Poi[];
}

// Grid constants - matching GridPage
const GRID_ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
const GRID_COLS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

const DeepDesertSelectionMode: React.FC<DeepDesertSelectionModeProps> = ({
  currentGridId,
  allGridSquares,
  pois,
  poiTypes,

  selectedPoiIds,
  onPoiSelect,
  onPoiDeselect,
  onGridNavigate,
  filteredPois
}) => {
  const [gridSquare, setGridSquare] = useState<GridSquare | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [currentZoom, setCurrentZoom] = useState(0.8);
  const [imageLoaded, setImageLoaded] = useState(false);
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);

  // Icon helper functions (reused from GridPage)
  const isIconUrl = (icon: string): boolean => {
    return icon?.startsWith('http') || icon?.startsWith('/') || icon?.includes('.');
  };

  const getDisplayImageUrl = (icon: string): string => {
    if (isIconUrl(icon)) {
      return icon;
    }
    return icon; // Return emoji as-is
  };

  // Fetch current grid square data
  useEffect(() => {
    const fetchGridData = async () => {
      if (!currentGridId) return;

      try {
        setLoading(true);

        // Fetch current grid square
        const { data: gridData, error: gridError } = await supabase
          .from('grid_squares')
          .select('*')
          .eq('coordinate', currentGridId)
          .single();

        if (gridError && gridError.code !== 'PGRST116') {
          console.error('Error fetching grid square:', gridError);
        }

        setGridSquare(gridData || null);
      } catch (error) {
        console.error('Error in fetchGridData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGridData();
  }, [currentGridId]);

  // Get POIs for current grid
  const currentGridPois = useMemo(() => {
    return filteredPois.filter(poi => {
      // For Deep Desert, we need to determine which grid a POI belongs to
      // This would typically be based on coordinates or explicit grid assignment
      // For now, show all Deep Desert POIs
      return poi.map_type === 'deep_desert';
    });
  }, [filteredPois]);

  // Grid navigation handler
  const handleNavigateToGrid = (targetGridId: string) => {
    onGridNavigate(targetGridId);
  };

  // POI selection handlers
  const handlePoiClick = (poi: Poi, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (selectedPoiIds.has(poi.id)) {
      onPoiDeselect(poi.id);
    } else {
      onPoiSelect(poi.id);
    }
  };

  // Zoom controls
  const zoomIn = () => {
    if (transformRef.current) {
      transformRef.current.zoomIn(0.2);
    }
  };

  const zoomOut = () => {
    if (transformRef.current) {
      transformRef.current.zoomOut(0.2);
    }
  };

  const resetTransform = () => {
    if (transformRef.current) {
      transformRef.current.resetTransform();
    }
  };

  const handleZoomChange = (ref: ReactZoomPanPinchRef) => {
    setCurrentZoom(ref.state.scale);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Get selection counts for minimap
  const getGridSelectionCounts = () => {
    const counts: { [gridId: string]: number } = {};
    
    // Count selected POIs by grid (simplified for now)
    currentGridPois.forEach(poi => {
      if (selectedPoiIds.has(poi.id)) {
        counts[currentGridId] = (counts[currentGridId] || 0) + 1;
      }
    });
    
    return counts;
  };

  const selectionCounts = getGridSelectionCounts();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-700">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin mx-auto mb-4" />
          <span className="text-amber-200 font-light tracking-wide"
                style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
            Loading grid...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      {/* Main content area */}
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
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
                    alt={`Grid ${currentGridId} screenshot`}
                    className="transition-all"
                    style={{ 
                      width: '2000px',
                      height: '2000px',
                      objectFit: 'contain',
                      pointerEvents: 'none'
                    }}
                    draggable={false}
                    onLoad={handleImageLoad}
                  />
                  
                  {/* POI Markers in selection mode */}
                  {currentGridPois.map((poi) => {
                    if (!poi.coordinates_x || !poi.coordinates_y) return null;
                    
                    const poiType = poiTypes.find(type => type.id === poi.poi_type_id);
                    if (!poiType) return null;

                    // Calculate position as percentage of container
                    const maxCoordinate = 2000; // Deep Desert coordinates
                    const leftPercent = (poi.coordinates_x / maxCoordinate) * 100;
                    const topPercent = (poi.coordinates_y / maxCoordinate) * 100;

                    const isSelected = selectedPoiIds.has(poi.id);

                    return (
                      <div
                        key={poi.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
                        style={{
                          left: `${leftPercent}%`,
                          top: `${topPercent}%`,
                        }}
                        onClick={(event) => handlePoiClick(poi, event)}
                      >
                        {/* Enhanced Selection overlay */}
                        <div className={`
                          relative rounded-full transition-all duration-300
                          ${isSelected 
                            ? 'ring-4 ring-amber-400/80 bg-amber-400/20 scale-110 shadow-lg' 
                            : 'hover:ring-2 hover:ring-amber-300/60 hover:scale-105'
                          }
                        `}>
                          {/* Enhanced Selection checkbox */}
                          {isSelected && (
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 border-3 border-white rounded-full flex items-center justify-center z-30 shadow-xl animate-pulse ring-2 ring-green-300/50">
                              <Check className="w-5 h-5 text-white drop-shadow-md font-bold" strokeWidth={3} />
                            </div>
                          )}
                          
                          <MapPOIMarker
                            poi={poi}
                            poiType={poiType}
        
                            onClick={(event) => handlePoiClick(poi, event)}
                            isSelectionMode={true}
                            isSelected={isSelected}
                            iconSize={32}
                            showTooltip={true}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TransformComponent>
            </TransformWrapper>
          </div>
        ) : (
          /* No screenshot available */
          <div className="h-full flex items-center justify-center bg-slate-700">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-amber-200/40 mx-auto mb-4" />
              <p className="text-amber-200 text-lg font-medium mb-2"
                 style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
                Grid {currentGridId}
              </p>
              <p className="text-amber-200/60 text-sm">
                No screenshot available for this grid
              </p>
              <p className="text-amber-200/40 text-xs mt-2">
                {currentGridPois.length} POI{currentGridPois.length !== 1 ? 's' : ''} in this area
              </p>
            </div>
          </div>
        )}

        {/* Selection Mode Indicator */}
        <div className="absolute top-4 right-80 z-40 pointer-events-none">
          <div className="bg-amber-500/90 text-white px-4 py-3 rounded-lg shadow-lg border border-amber-400/50">
            <div className="text-center">
              <MapPin className="w-5 h-5 mx-auto mb-1" />
              <div className="text-sm font-medium">Selection Mode</div>
              <div className="text-xs opacity-90">Click POIs to select/deselect</div>
              <div className="text-xs font-medium mt-1">
                {Array.from(selectedPoiIds).filter(id => currentGridPois.some(poi => poi.id === id)).length} selected in {currentGridId}
              </div>
            </div>
          </div>
        </div>

        {/* Minimap Panel */}
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
              <div className="text-sm font-semibold text-yellow-300" style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
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
                    const isCurrent = cellId === currentGridId;
                    const gridSquareData = allGridSquares.find(square => square.coordinate === cellId);
                    const isExplored = gridSquareData?.is_explored || false;
                    const selectionCount = selectionCounts[cellId] || 0;
                    
                    // Determine styling based on state
                    let buttonClasses = 'w-6 h-6 text-xs rounded transition-colors relative ';
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
                    
                    if (selectionCount > 0) {
                      titleText += ` - ${selectionCount} POI${selectionCount !== 1 ? 's' : ''} selected`;
                    }
                    
                    return (
                      <button
                        key={cellId}
                        onClick={() => handleNavigateToGrid(cellId)}
                        className={buttonClasses}
                        title={titleText}
                      >
                        {cellId}
                        {/* Selection count badge */}
                        {selectionCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 text-slate-900 text-xs rounded-full flex items-center justify-center font-bold">
                            {selectionCount > 9 ? '9+' : selectionCount}
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
              
              {/* Legend */}
              <div className="space-y-2">
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
                
                {/* Selection info */}
                <div className="text-xs text-amber-300 text-center pt-2 border-t border-slate-700/50">
                  Total selected: {selectedPoiIds.size}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* POI List for current grid (simplified) */}
        <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-xl p-4 max-w-80">
          <h4 className="text-amber-200 font-medium mb-3" style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
            POIs in {currentGridId} ({currentGridPois.length})
          </h4>
          
          {currentGridPois.length === 0 ? (
            <p className="text-amber-200/60 text-sm">No POIs in this grid</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {currentGridPois.map(poi => {
                const isSelected = selectedPoiIds.has(poi.id);
                const poiType = poiTypes.find(type => type.id === poi.poi_type_id);
                
                return (
                  <div
                    key={poi.id}
                    onClick={(event) => handlePoiClick(poi, event)}
                    className={`
                      flex items-center space-x-2 p-2 rounded cursor-pointer transition-all
                      ${isSelected 
                        ? 'bg-amber-400/20 border border-amber-400/50' 
                        : 'bg-slate-800/50 hover:bg-slate-700/70'
                      }
                    `}
                  >
                    {/* Selection indicator */}
                    <div className={`
                      w-4 h-4 rounded border flex items-center justify-center flex-shrink-0
                      ${isSelected 
                        ? 'bg-amber-400 border-amber-400' 
                        : 'border-slate-500'
                      }
                    `}>
                      {isSelected && <Check className="w-2 h-2 text-slate-900" />}
                    </div>
                    
                    {/* POI info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-amber-200 text-sm font-medium truncate">
                        {poi.title}
                      </div>
                      <div className="text-amber-200/60 text-xs truncate">
                        {poiType?.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeepDesertSelectionMode; 