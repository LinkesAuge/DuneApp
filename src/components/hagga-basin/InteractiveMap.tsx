import React, { useState, useRef, useCallback, useEffect } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { Plus, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
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

interface InteractiveMapProps {
  baseMap: HaggaBasinBaseMap;
  overlays: HaggaBasinOverlay[];
  pois: Poi[];
  poiTypes: PoiType[];
  onPoiCreated: (poi: Poi) => void;
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
  customIcons
}) => {
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const mapElementRef = useRef<HTMLDivElement | null>(null);

  // State for POI placement
  const [placementMode, setPlacementMode] = useState(false);
  const [placementCoordinates, setPlacementCoordinates] = useState<PixelCoordinates | null>(null);
  const [showPlacementModal, setShowPlacementModal] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Handle map click for POI placement
  const handleMapClick = useCallback((event: React.MouseEvent) => {
    if (!placementMode || !mapElementRef.current) return;

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
  }, [placementMode]);

  // Handle ESC key to cancel placement mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && placementMode) {
        setPlacementMode(false);
        setPlacementCoordinates(null);
        setShowPlacementModal(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [placementMode]);

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
              cursor: placementMode ? 'crosshair' : 'grab'
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
                    customIcons={customIcons}
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

      {/* POI Details Modal - Placeholder for future implementation */}
      {selectedPoi && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => setSelectedPoi(null)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-sand-800 mb-2">{selectedPoi.title}</h3>
            <p className="text-sand-600 mb-4">{selectedPoi.description}</p>
            <div className="text-sm text-sand-500">
              Coordinates: {formatCoordinates(selectedPoi.coordinates_x || 0, selectedPoi.coordinates_y || 0)}
            </div>
            <button
              onClick={() => setSelectedPoi(null)}
              className="mt-4 btn btn-outline w-full"
            >
              Close
            </button>
          </div>
        </div>
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