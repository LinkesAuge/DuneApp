import React, { useState, useRef, useCallback, useEffect } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { Plus, ZoomIn, ZoomOut, RotateCcw, Move, HelpCircle } from 'lucide-react';
import { usePositionChange } from '../../hooks/usePositionChange';
import type { 
  HaggaBasinBaseMap, 
  HaggaBasinOverlay, 
  Poi, 
  PoiType, 
 
  PixelCoordinates 
} from '../../types';
import { getMarkerPosition, getRelativeCoordinates, validateCoordinates } from '../../lib/coordinates';
import { useMapSettings } from '../../lib/useMapSettings';
import MapPOIMarker from './MapPOIMarker';
import POIPlacementModal from './POIPlacementModal';
import POIEditModal from './POIEditModal';
import POICard from '../common/POICard';

interface InteractiveMapProps {
  baseMap?: HaggaBasinBaseMap;
  overlays?: HaggaBasinOverlay[];
  pois: Poi[];
  poiTypes?: PoiType[];
  onPoiCreated?: (poi: Poi) => void;
  onPoiUpdated?: (poi: Poi) => void;
  onPoiDeleted?: (poiId: string) => void;
  onPoiShare?: (poi: Poi) => void;
  onPoiGalleryOpen?: (poi: Poi) => void;
  onPositionChange?: (poi: Poi) => void;

  placementMode?: boolean;
  onPlacementModeChange?: (mode: boolean) => void;
  // Help tooltip props
  showHelpTooltip?: boolean;
  onHelpTooltipChange?: (show: boolean) => void;
  // Highlighting prop
  highlightedPoiId?: string | null;
  // POI Selection mode props (for linking workflows)
  selectionMode?: boolean;
  selectedPoiIds?: Set<string>;
  onPoiClick?: (poi: Poi) => void;
  // Map type support
  mapType?: 'hagga_basin' | 'deep_desert';
  // Entity links refresh trigger
  entityLinksRefreshTrigger?: number;
}

// Map configuration for zoom/pan (initialScale will be set dynamically)
const getMapConfig = (initialScale: number) => ({
  initialScale,
  minScale: 0.1,
  maxScale: 4,
  limitToBounds: false,
  centerOnInit: true,
  wheel: { step: 0.1 },
  pinch: { step: 5 },
  doubleClick: { disabled: false },
  panning: { disabled: false },
  velocityAnimation: { sensitivity: 1, animationTime: 400 }
});

// Layer z-index configuration
const layerZIndex = {
  baseMap: 1,
  overlayStart: 2,
  overlayEnd: 9,
  poiMarkers: 10,
  poiLabels: 11,
  uiControls: 20
} as const;

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  baseMap,
  overlays = [],
  pois,
  poiTypes = [],
  onPoiCreated,
  onPoiUpdated,
  onPoiDeleted,
  onPoiShare,
  onPoiGalleryOpen,
  onPositionChange,

  placementMode = false,
  onPlacementModeChange,
  // Help tooltip props
  showHelpTooltip = false,
  onHelpTooltipChange,
  // Highlighting prop
  highlightedPoiId,
  // Selection mode props
  selectionMode = false,
  selectedPoiIds = new Set(),
  onPoiClick,
  mapType = 'hagga_basin',
  entityLinksRefreshTrigger
}) => {
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  
  // Load admin settings
  const { settings: mapSettings } = useMapSettings();
  
  // Dynamic map config using hardcoded zoom level
  const mapConfig = getMapConfig(0.4);
  
  // State for POI placement
  const [placementCoordinates, setPlacementCoordinates] = useState<PixelCoordinates | null>(null);
  const [showPlacementModal, setShowPlacementModal] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [editingPoi, setEditingPoi] = useState<Poi | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(0.4);
  
  // Unified position change functionality
  const positionChange = usePositionChange({
    onPoiUpdated,
    onError: (error) => console.error(error)
  });

  // Handle map click for POI placement and position changing
  const handleMapClick = useCallback((event: React.MouseEvent) => {
    if (!mapElementRef.current) return;
    
    // Handle position change mode
    if (positionChange.positionChangeMode && positionChange.changingPositionPoi) {
      event.preventDefault();
      event.stopPropagation();
      
      try {
        const coordinates = getRelativeCoordinates(event, mapElementRef.current);
        
        if (validateCoordinates(coordinates.x, coordinates.y)) {
          positionChange.handlePositionUpdate(positionChange.changingPositionPoi, coordinates.x, coordinates.y);
        }
      } catch (error) {
        console.error('Error updating POI position:', error);
      }
      return;
    }
    
    // Handle regular placement mode
    if (!placementMode) return;

    event.preventDefault();
    event.stopPropagation();
    
    try {
      const coordinates = getRelativeCoordinates(
        event,
        mapElementRef.current
      );

      if (validateCoordinates(coordinates.x, coordinates.y)) {
        setPlacementCoordinates(coordinates);
        setShowPlacementModal(true);
        if (onPlacementModeChange) {
          onPlacementModeChange(false);
        }
      } else {
        console.warn('Invalid coordinates:', coordinates);
      }
    } catch (error) {
      console.error('Error calculating coordinates:', error);
    }
      }, [placementMode, positionChange.positionChangeMode, positionChange.changingPositionPoi, positionChange.handlePositionUpdate, onPlacementModeChange]);

  // Track zoom level for icon scaling - listen to all zoom events
  const handleZoomChange = useCallback((ref: ReactZoomPanPinchRef) => {
    const newZoom = ref.state.scale;
    setCurrentZoom(newZoom);
  }, []);

  // Start position change mode for a POI
  const startPositionChange = useCallback((poi: Poi) => {
    positionChange.startPositionChange(poi);
    if (onPlacementModeChange) {
      onPlacementModeChange(false);
    }
    setSelectedPoi(null);
  }, [positionChange.startPositionChange, onPlacementModeChange]);

  // Handle ESC key to cancel placement/position change modes
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (placementMode) {
          if (onPlacementModeChange) {
            onPlacementModeChange(false);
          }
          setPlacementCoordinates(null);
          setShowPlacementModal(false);
        }
        // Handle position change ESC via unified hook
        positionChange.handleEscapeKey(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [placementMode, onPlacementModeChange, positionChange.handleEscapeKey]);

  // Handle POI marker click
  const handlePoiClick = useCallback((poi: Poi, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    // If in selection mode, trigger the onPoiClick callback instead of showing details
    if (selectionMode && onPoiClick) {
      onPoiClick(poi);
    } else {
      setSelectedPoi(poi);
    }
  }, [selectionMode, onPoiClick]);

  // Handle successful POI creation
  const handlePoiCreated = useCallback((newPoi: Poi) => {
    onPoiCreated(newPoi);
    setShowPlacementModal(false);
    setPlacementCoordinates(null);
  }, [onPoiCreated]);

  // Handle image load to ensure proper positioning
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    // Remove manual positioning - let centerOnInit handle it automatically
  }, []);

  // Zoom controls
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
          handleZoomChange(transformRef.current);
        }
      }, 50);
    }
  };

  // Get overlay style with proper z-index and opacity
  const getOverlayStyle = (overlay: HaggaBasinOverlay, index: number) => ({
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: layerZIndex.overlayStart + index,
    opacity: overlay.opacity,
    pointerEvents: 'none' as const
  });

  // Get POI marker position style with counter-scaling to neutralize map zoom
  const getPoiMarkerStyle = (poi: Poi) => {
    if (!poi.coordinates_x || !poi.coordinates_y) return {};
    
    const position = getMarkerPosition(poi.coordinates_x, poi.coordinates_y);
    // Apply counter-scaling to neutralize the map's zoom effect
    const counterScale = 1 / currentZoom;
    
    return {
      position: 'absolute' as const,
      left: position.left,
      top: position.top,
      transform: `translate(-50%, -50%) scale(${counterScale})`,
      zIndex: layerZIndex.poiMarkers,
      pointerEvents: 'auto' as const
    };
  };

  // Note: Removed debug highlighting logs to reduce console noise

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Main background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
                      backgroundImage: `url(/images/main-bg.webp)`
        }}
      />
      
      {/* Dark overlay for better contrast */}
      {/* <div className="absolute inset-0 bg-slate-950/70" /> */}

      {/* Interactive Map Container */}
      <TransformWrapper
        ref={transformRef}
        {...mapConfig}
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
          contentStyle={{ width: '4000px', height: '4000px' }}
        >
          <div
            ref={mapElementRef}
            className="relative"
            style={{ 
              width: '4000px', 
              height: '4000px',
              cursor: (placementMode || positionChange.positionChangeMode) ? 'crosshair' : 'grab'
            }}
            onClick={handleMapClick}
          >
            {/* Base Map */}
            <img
              src={baseMap.image_url}
              alt={baseMap.name}
              className="w-full h-full object-cover"
              style={{ 
                zIndex: layerZIndex.baseMap,
                pointerEvents: 'none'
              }}
              draggable={false}
              onLoad={handleImageLoad}
            />

            {/* Overlay Layers */}
            {overlays.map((overlay, index) => (
              <img
                key={overlay.id}
                src={overlay.image_url}
                alt={overlay.name}
                className="w-full h-full object-cover"
                style={getOverlayStyle(overlay, index)}
                draggable={false}
              />
            ))}

            {/* POI Markers */}
            {pois.map(poi => {
              if (!poi.coordinates_x || !poi.coordinates_y) return null;
              
              const poiType = poiTypes.find(type => type.id === poi.poi_type_id);
              if (!poiType) return null;

              return (
                <div
                  key={poi.id}
                  style={getPoiMarkerStyle(poi)}
                  onClick={(e) => handlePoiClick(poi, e)}
                >
                  <MapPOIMarker
                    poi={poi}
                    poiType={poiType}
                    zoom={currentZoom}
                    mapSettings={mapSettings}
                    onEdit={setEditingPoi}
                    onDelete={onPoiDeleted}
                    onShare={onPoiShare}
                    onImageClick={() => {
                      // TODO: Open gallery modal
                  
                    }}
                    isHighlighted={highlightedPoiId === poi.id}
                    selectionMode={selectionMode}
                    isSelected={selectedPoiIds.has(poi.id)}
                    entityLinksRefreshTrigger={entityLinksRefreshTrigger}
                  />
                </div>
              );
            })}

            {/* Placement Preview */}
            {placementMode && placementCoordinates && (
              <div
                style={{
                  position: 'absolute',
                  left: getMarkerPosition(placementCoordinates.x, placementCoordinates.y).left,
                  top: getMarkerPosition(placementCoordinates.x, placementCoordinates.y).top,
                  transform: 'translate(-50%, -50%)',
                  zIndex: layerZIndex.poiMarkers + 1,
                  pointerEvents: 'none'
                }}
              >
                <div className="w-8 h-8 bg-spice-500/50 border-2 border-spice-500 rounded-full animate-pulse" />
              </div>
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>

      {/* UI Controls - positioned relative to viewport, not map content */}
      
      {/* Zoom Controls */}
      <div className="absolute top-4 left-4 z-40 flex flex-col space-y-2">
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
            onMouseEnter={() => onHelpTooltipChange?.(true)}
            onMouseLeave={() => onHelpTooltipChange?.(false)}
            className="bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-lg p-2 shadow-lg hover:bg-slate-800/90 transition-all"
            title="Help & Tips"
          >
            <HelpCircle className="w-5 h-5 text-amber-300" />
          </button>
          
          {/* Help Tooltip */}
          {showHelpTooltip && (
            <div className="absolute left-full ml-3 top-0 w-80 bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-xl p-4 z-50">
              <h4 className="font-medium text-amber-300 mb-3 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Hagga Basin Controls & Tips
              </h4>
              <div className="space-y-2 text-sm text-amber-200">
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
                
                <div className="mt-3"><strong>Hagga Basin Features:</strong></div>
                <div className="ml-2 space-y-1">
                  <div>• Click "Add POI" then click anywhere on the map</div>
                  <div>• Use map layers to toggle overlays and visibility</div>
                  <div>• Coordinate system uses in-game map positions</div>
                  <div>• Private POIs are only visible to you</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Placement Mode Indicator */}
      {placementMode && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
          <div className="bg-spice-500/80 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="text-center">
              <Plus className="w-6 h-6 mx-auto mb-1" />
              <div className="text-sm font-medium">Click on map to place POI</div>
              <div className="text-xs opacity-90">Press ESC to cancel</div>
            </div>
          </div>
        </div>
      )}

      {/* Position Change Mode Indicator */}
      {positionChange.positionChangeMode && positionChange.changingPositionPoi && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
          <div className="bg-blue-500/80 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="text-center">
              <Move className="w-6 h-6 mx-auto mb-1" />
              <div className="text-sm font-medium">Click to move "{positionChange.changingPositionPoi.title}"</div>
              <div className="text-xs opacity-90">Press ESC to cancel</div>
            </div>
          </div>
        </div>
      )}

      {/* POI Placement Modal */}
      {showPlacementModal && placementCoordinates && (
        <POIPlacementModal
          coordinates={placementCoordinates}
          poiTypes={poiTypes}
          onPoiCreated={handlePoiCreated}
          onClose={() => {
            setShowPlacementModal(false);
            setPlacementCoordinates(null);
          }}
        />
      )}

      {/* POI Details Card */}
      {selectedPoi && (() => {
        const poiType = poiTypes.find(type => type.id === selectedPoi.poi_type_id);
        if (!poiType) return null;
        
        return (
          <POICard
            poi={selectedPoi}
            poiType={poiType}
            isOpen={true}
            onClose={() => setSelectedPoi(null)}
            onEdit={() => {
              setEditingPoi(selectedPoi);
              setSelectedPoi(null);
            }}
            onDelete={() => {
                  if (onPoiDeleted) {
                onPoiDeleted(selectedPoi.id);
                  }
                  setSelectedPoi(null);
            }}
            onShare={() => {
              if (onPoiShare) {
                onPoiShare(selectedPoi);
              }
              setSelectedPoi(null);
            }}
            onImageClick={() => {
              if (onPoiGalleryOpen) {
                onPoiGalleryOpen(selectedPoi);
              }
            }}
          />
        );
      })()}

      {/* POI Edit Modal */}
      {editingPoi && (
        <POIEditModal
          poi={editingPoi}
          poiTypes={poiTypes}
          onPoiUpdated={(updatedPoi) => {
            if (onPoiUpdated) {
              onPoiUpdated(updatedPoi);
            }
            setEditingPoi(null);
          }}
          onLinksUpdated={() => {
            // Dispatch global event to trigger map refresh
            window.dispatchEvent(new CustomEvent('entityLinksUpdated'));
          }}
          onClose={() => setEditingPoi(null)}
          onPositionChange={onPositionChange || startPositionChange}
        />
      )}

      {/* Coordinate Display for Development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 z-20 bg-black/50 text-white px-2 py-1 rounded text-xs">
          {pois.length} POIs | {overlays.length} Layers
        </div>
      )}
    </div>
  );
};

export default InteractiveMap; 