import React, { useState, useRef, useCallback, useEffect } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { Plus, ZoomIn, ZoomOut, RotateCcw, Target } from 'lucide-react';
import type { 
  HaggaBasinBaseMap, 
  HaggaBasinOverlay, 
  Poi, 
  PoiType, 
  CustomIcon, 
  PixelCoordinates 
} from '../../types';
import { getMarkerPosition, getRelativeCoordinates, validateCoordinates, formatCoordinates } from '../../lib/coordinates';
import MapPOIMarker from './MapPOIMarker';
import POIPlacementModal from './POIPlacementModal';
import POIEditModal from './POIEditModal';
import HaggaBasinPoiCard from './HaggaBasinPoiCard';

interface InteractiveMapProps {
  baseMap: HaggaBasinBaseMap;
  overlays: HaggaBasinOverlay[];
  pois: Poi[];
  poiTypes: PoiType[];
  onPoiCreated: (poi: Poi) => void;
  onPoiUpdated?: (poi: Poi) => void;
  onPoiDeleted?: (poiId: string) => void;
  onPoiShare?: (poi: Poi) => void;
  customIcons: CustomIcon[];
}

// Map configuration for zoom/pan
const mapConfig = {
  initialScale: 0.4,
  minScale: 0.1,
  maxScale: 4,
  limitToBounds: false,
  centerOnInit: true,
  wheel: { step: 0.1 },
  pinch: { step: 5 },
  doubleClick: { disabled: false },
  panning: { disabled: false },
  velocityAnimation: { sensitivity: 1, animationTime: 400 }
};

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
  overlays,
  pois,
  poiTypes,
  onPoiCreated,
  onPoiUpdated,
  onPoiDeleted,
  onPoiShare,
  customIcons
}) => {
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const mapElementRef = useRef<HTMLDivElement | null>(null);

  // State for POI placement
  const [placementMode, setPlacementMode] = useState(false);
  const [placementCoordinates, setPlacementCoordinates] = useState<PixelCoordinates | null>(null);
  const [showPlacementModal, setShowPlacementModal] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [editingPoi, setEditingPoi] = useState<Poi | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(mapConfig.initialScale);
  
  // State for POI position changing
  const [positionChangeMode, setPositionChangeMode] = useState(false);
  const [changingPositionPoi, setChangingPositionPoi] = useState<Poi | null>(null);

  // POI dragging state
  const [draggedPoi, setDraggedPoi] = useState<Poi | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);

  // Handle map click for POI placement and position changing
  const handleMapClick = useCallback((event: React.MouseEvent) => {
    if (!mapElementRef.current || draggedPoi) return;
    
    // Handle position change mode
    if (positionChangeMode && changingPositionPoi) {
      event.preventDefault();
      event.stopPropagation();
      
      try {
        const coordinates = getRelativeCoordinates(event, mapElementRef.current);
        
        if (validateCoordinates(coordinates.x, coordinates.y)) {
          const updatedPoi = {
            ...changingPositionPoi,
            coordinates_x: coordinates.x,
            coordinates_y: coordinates.y
          };
          
          if (onPoiUpdated) {
            onPoiUpdated(updatedPoi);
          }
          
          // Exit position change mode
          setPositionChangeMode(false);
          setChangingPositionPoi(null);
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

      console.log('Calculated coordinates:', coordinates);

      if (validateCoordinates(coordinates.x, coordinates.y)) {
        setPlacementCoordinates(coordinates);
        setShowPlacementModal(true);
        setPlacementMode(false);
      } else {
        console.warn('Invalid coordinates:', coordinates);
      }
    } catch (error) {
      console.error('Error calculating coordinates:', error);
    }
  }, [placementMode, positionChangeMode, changingPositionPoi, draggedPoi, onPoiUpdated]);

  // Handle POI dragging
  const handlePoiMouseDown = useCallback((poi: Poi, event: React.MouseEvent) => {
    if (!mapElementRef.current) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const rect = mapElementRef.current.getBoundingClientRect();
    const poiPosition = getMarkerPosition(poi.coordinates_x || 0, poi.coordinates_y || 0);
    
    // Calculate offset from mouse to POI center
    const offset = {
      x: event.clientX - rect.left - parseFloat(poiPosition.left),
      y: event.clientY - rect.top - parseFloat(poiPosition.top)
    };
    
    setDraggedPoi(poi);
    setDragOffset(offset);
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!draggedPoi || !dragOffset || !mapElementRef.current) return;
    
    event.preventDefault();
    
    const coordinates = getRelativeCoordinates(event, mapElementRef.current);
    
    // Apply offset to get the correct POI position
    const adjustedCoordinates = {
      x: coordinates.x - dragOffset.x / 4000 * 100, // Convert back to percentage
      y: coordinates.y - dragOffset.y / 4000 * 100
    };
    
    if (validateCoordinates(adjustedCoordinates.x, adjustedCoordinates.y)) {
      // Update POI position optimistically
      const updatedPoi = {
        ...draggedPoi,
        coordinates_x: adjustedCoordinates.x,
        coordinates_y: adjustedCoordinates.y
      };
      
      // Temporarily update the POI in the list for immediate visual feedback
      setDraggedPoi(updatedPoi);
    }
  }, [draggedPoi, dragOffset]);

  const handleMouseUp = useCallback(async () => {
    if (!draggedPoi) return;
    
    try {
      // Update POI in database
      if (onPoiUpdated) {
        await onPoiUpdated(draggedPoi);
      }
    } catch (error) {
      console.error('Error updating POI position:', error);
    } finally {
      setDraggedPoi(null);
      setDragOffset(null);
    }
  }, [draggedPoi, onPoiUpdated]);

  // Track zoom level for icon scaling
  useEffect(() => {
    if (transformRef.current) {
      const handleTransform = (ref: ReactZoomPanPinchRef) => {
        setCurrentZoom(ref.state.scale);
      };
      
      // Listen to transform changes
      const unsubscribe = transformRef.current.instance.wrapperComponent?.addEventListener?.('wheel', () => {
        if (transformRef.current) {
          handleTransform(transformRef.current);
        }
      });
      
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [transformRef.current]);

  // Start position change mode for a POI
  const startPositionChange = useCallback((poi: Poi) => {
    setChangingPositionPoi(poi);
    setPositionChangeMode(true);
    setPlacementMode(false);
    setSelectedPoi(null);
  }, []);

  // Handle ESC key to cancel placement/position change modes
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (placementMode) {
          setPlacementMode(false);
          setPlacementCoordinates(null);
          setShowPlacementModal(false);
        }
        if (positionChangeMode) {
          setPositionChangeMode(false);
          setChangingPositionPoi(null);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [placementMode, positionChangeMode]);

  // Ensure proper positioning when transform ref is available and image is loaded
  useEffect(() => {
    if (transformRef.current && imageLoaded) {
      const timer = setTimeout(() => {
        // Position towards top-left instead of centering
        transformRef.current?.setTransform(200, 200, mapConfig.initialScale);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [imageLoaded]);

  // Handle POI marker click
  const handlePoiClick = useCallback((poi: Poi, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedPoi(poi);
  }, []);

  // Handle successful POI creation
  const handlePoiCreated = useCallback((newPoi: Poi) => {
    onPoiCreated(newPoi);
    setShowPlacementModal(false);
    setPlacementCoordinates(null);
  }, [onPoiCreated]);

  // Handle image load to ensure proper positioning
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    // Position the map towards top-left after image loads
    setTimeout(() => {
      if (transformRef.current) {
        // Instead of centering, position towards top-left
        transformRef.current.setTransform(200, 200, mapConfig.initialScale);
      }
    }, 100);
  }, []);

  // Zoom controls
  const zoomIn = () => transformRef.current?.zoomIn();
  const zoomOut = () => transformRef.current?.zoomOut();
  const resetTransform = () => {
    if (transformRef.current) {
      transformRef.current.resetTransform();
      // Position towards top-left after reset
      setTimeout(() => {
        transformRef.current?.setTransform(200, 200, mapConfig.initialScale);
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

  // Get POI marker position style
  const getPoiMarkerStyle = (poi: Poi) => {
    if (!poi.coordinates_x || !poi.coordinates_y) return {};
    
    const position = getMarkerPosition(poi.coordinates_x, poi.coordinates_y);
    return {
      position: 'absolute' as const,
      left: position.left,
      top: position.top,
      transform: 'translate(-50%, -50%)',
      zIndex: layerZIndex.poiMarkers,
      pointerEvents: 'auto' as const
    };
  };

  return (
    <div className="w-full h-full relative bg-sand-100 overflow-hidden">
      {/* Interactive Map Container */}
      <TransformWrapper
        ref={transformRef}
        {...mapConfig}
        onInit={(ref) => {
          transformRef.current = ref;
          // Initial centering will be handled after image load
        }}
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
              cursor: (placementMode || positionChangeMode) ? 'crosshair' : 'grab'
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

              // Use dragged position if this POI is being dragged
              const displayPoi = draggedPoi && draggedPoi.id === poi.id ? draggedPoi : poi;

              return (
                <div
                  key={poi.id}
                  style={getPoiMarkerStyle(displayPoi)}
                  onClick={(e) => handlePoiClick(poi, e)}
                  onMouseMove={draggedPoi ? handleMouseMove : undefined}
                  onMouseUp={draggedPoi ? handleMouseUp : undefined}
                >
                  <MapPOIMarker
                    poi={displayPoi}
                    poiType={poiType}
                    customIcons={customIcons}
                    zoom={currentZoom}
                    onMouseDown={handlePoiMouseDown}
                    isDragging={draggedPoi?.id === poi.id}
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
      <div className="absolute top-4 right-4 z-40 flex flex-col space-y-2">
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
      </div>

      {/* POI Placement Controls */}
      <div className="absolute bottom-4 right-4 z-40">
        <button
          onClick={() => setPlacementMode(!placementMode)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all ${
            placementMode 
              ? 'bg-spice-500 text-white' 
              : 'bg-white border border-sand-200 text-sand-700'
          }`}
          title="Click on map to place POI"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">
            {placementMode ? 'Click to Place POI' : 'Add POI'}
          </span>
        </button>
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
      {positionChangeMode && changingPositionPoi && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
          <div className="bg-blue-500/80 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="text-center">
              <Target className="w-6 h-6 mx-auto mb-1" />
              <div className="text-sm font-medium">Click to move "{changingPositionPoi.title}"</div>
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
          customIcons={customIcons}
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
          <HaggaBasinPoiCard
            poi={selectedPoi}
            poiType={poiType}
            customIcons={customIcons}
            isOpen={true}
            onClose={() => setSelectedPoi(null)}
            onEdit={() => {
              setEditingPoi(selectedPoi);
              setSelectedPoi(null);
            }}
            onDelete={async () => {
              if (window.confirm(`Are you sure you want to delete "${selectedPoi.title}"?`)) {
                try {
                  if (onPoiDeleted) {
                    await onPoiDeleted(selectedPoi.id);
                  }
                  setSelectedPoi(null);
                } catch (error) {
                  console.error('Error deleting POI:', error);
                  alert('Failed to delete POI. Please try again.');
                }
              }
            }}
            onShare={() => {
              if (onPoiShare) {
                onPoiShare(selectedPoi);
              }
              setSelectedPoi(null);
            }}
            onImageClick={() => {
              // TODO: Open gallery modal
              console.log('Open gallery for POI:', selectedPoi.id);
            }}
          />
                 );
       })()}

      {/* POI Edit Modal */}
      {editingPoi && (
        <POIEditModal
          poi={editingPoi}
          poiTypes={poiTypes}
          customIcons={customIcons}
          onPoiUpdated={(updatedPoi) => {
            if (onPoiUpdated) {
              onPoiUpdated(updatedPoi);
            }
            setEditingPoi(null);
          }}
          onClose={() => setEditingPoi(null)}
          onPositionChange={startPositionChange}
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