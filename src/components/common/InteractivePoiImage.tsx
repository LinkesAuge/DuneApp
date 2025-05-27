import React, { useState, useRef, useCallback, useEffect } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { Poi, PoiType, CustomIcon } from '../../types';
import { ZoomIn, ZoomOut, RotateCcw, Plus } from 'lucide-react';
import POIPlacementModal from '../hagga-basin/POIPlacementModal';
import MapPOIMarker from '../hagga-basin/MapPOIMarker';

interface InteractivePoiImageProps {
  imageUrl: string;
  imageAlt: string;
  pois: Poi[];
  poiTypes: PoiType[];
  customIcons: CustomIcon[];
  selectedPoiTypes: string[];
  onPoiCreated: (poi: Poi) => void;
  onPoiUpdated?: (poi: Poi) => void;
  onPoiDeleted?: (poiId: string) => void;
  onPoiShare?: (poi: Poi) => void;
  onPoiGalleryOpen?: (poi: Poi) => void;
  imageWidth?: number;
  imageHeight?: number;
  enablePlacement?: boolean;
  placementMode?: boolean;
  onPlacementModeChange?: (mode: boolean) => void;
  mapSettings?: any;
  mapType?: 'deep_desert' | 'hagga_basin';
  gridSquareId?: string;
}

interface PlacementCoordinates {
  x: number;
  y: number;
}

// Configuration for the transform component
const getImageConfig = (initialScale: number = 0.8) => ({
  initialScale,
  minScale: 0.1,
  maxScale: 4,
  limitToBounds: false,
  centerOnInit: true,
  wheel: {
    step: 0.1,
  },
  pinch: {
    step: 5,
  },
  doubleClick: {
    disabled: true,
  },
});

const InteractivePoiImage: React.FC<InteractivePoiImageProps> = ({
  imageUrl,
  imageAlt,
  pois,
  poiTypes,
  customIcons,
  selectedPoiTypes,
  onPoiCreated,
  onPoiUpdated,
  onPoiDeleted,
  onPoiShare,
  onPoiGalleryOpen,
  imageWidth = 1920,
  imageHeight = 1080,
  enablePlacement = true,
  placementMode = false,
  onPlacementModeChange,
  mapSettings,
  mapType = 'hagga_basin',
  gridSquareId
}) => {
  const [currentZoom, setCurrentZoom] = useState(0.8);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showPlacementModal, setShowPlacementModal] = useState(false);
  const [placementCoordinates, setPlacementCoordinates] = useState<PlacementCoordinates | null>(null);
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [editingPoi, setEditingPoi] = useState<Poi | null>(null);
  
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const imageElementRef = useRef<HTMLDivElement>(null);

  const imageConfig = getImageConfig();

  // Filter POIs based on selected types
  const filteredPois = pois.filter(poi => 
    selectedPoiTypes.length === 0 || selectedPoiTypes.includes(poi.poi_type_id)
  );

  // Handle zoom changes
  const handleZoomChange = useCallback((ref: ReactZoomPanPinchRef) => {
    setCurrentZoom(ref.state.scale);
  }, []);

  // Handle image click for POI placement
  const handleImageClick = useCallback((e: React.MouseEvent) => {
    if (!enablePlacement || !placementMode) return;
    
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Ensure coordinates are within bounds
    if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
      setPlacementCoordinates({ x, y });
      setShowPlacementModal(true);
    }
  }, [enablePlacement, placementMode]);

  // Get marker position based on coordinates
  const getMarkerPosition = (x: number, y: number) => ({
    left: `${x}%`,
    top: `${y}%`
  });

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
    if (onPlacementModeChange) {
      onPlacementModeChange(false);
    }
  }, [onPoiCreated, onPlacementModeChange]);

  // Handle image load
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showPlacementModal) {
          setPlacementCoordinates(null);
          setShowPlacementModal(false);
          if (onPlacementModeChange) {
            onPlacementModeChange(false);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showPlacementModal, onPlacementModeChange]);

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
      setTimeout(() => {
        if (transformRef.current) {
          handleZoomChange(transformRef.current);
        }
      }, 50);
    }
  };

  // Toggle placement mode
  const togglePlacementMode = () => {
    const newMode = !placementMode;
    if (onPlacementModeChange) {
      onPlacementModeChange(newMode);
    }
  };

  // Get POI marker style with counter-scaling
  const getPoiMarkerStyle = (poi: Poi) => {
    if (!poi.coordinates_x || !poi.coordinates_y) return {};
    
    const position = getMarkerPosition(poi.coordinates_x, poi.coordinates_y);
    const counterScale = 1 / currentZoom;
    
    return {
      position: 'absolute' as const,
      left: position.left,
      top: position.top,
      transform: `translate(-50%, -50%) scale(${counterScale})`,
      zIndex: 20,
      pointerEvents: 'auto' as const
    };
  };

  return (
    <div className="w-full h-full relative bg-sand-100 overflow-hidden">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
        <button
          onClick={zoomIn}
          className="btn btn-sm bg-white shadow-lg border"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={zoomOut}
          className="btn btn-sm bg-white shadow-lg border"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={resetTransform}
          className="btn btn-sm bg-white shadow-lg border"
          title="Reset View"
        >
          <RotateCcw size={16} />
        </button>
        {enablePlacement && (
          <button
            onClick={togglePlacementMode}
            className={`btn btn-sm shadow-lg border ${
              placementMode 
                ? 'bg-spice-600 text-white hover:bg-spice-700' 
                : 'bg-white hover:bg-sand-50'
            }`}
            title={placementMode ? "Exit Placement Mode" : "Enter Placement Mode"}
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Status Indicator */}
      {placementMode && (
        <div className="absolute top-4 left-4 z-30 bg-spice-600 text-white px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <Plus size={16} />
            <span className="text-sm font-medium">Click to place POI</span>
          </div>
        </div>
      )}

      {/* Interactive Image Container */}
      <TransformWrapper
        ref={transformRef}
        {...imageConfig}
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
          contentStyle={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}
        >
          <div
            ref={imageElementRef}
            className="relative"
            style={{ 
              width: `${imageWidth}px`, 
              height: `${imageHeight}px`,
              cursor: placementMode ? 'crosshair' : 'grab'
            }}
            onClick={handleImageClick}
          >
            {/* Base Image */}
            <img
              src={imageUrl}
              alt={imageAlt}
              className="w-full h-full object-cover"
              style={{ 
                zIndex: 1,
                pointerEvents: 'none'
              }}
              draggable={false}
              onLoad={handleImageLoad}
            />

            {/* POI Markers */}
            {filteredPois.map(poi => {
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
                    zoom={currentZoom}
                    mapSettings={mapSettings}
                    onEdit={setEditingPoi}
                    onDelete={onPoiDeleted}
                    onShare={onPoiShare}
                    onImageClick={() => onPoiGalleryOpen?.(poi)}
                  />
                </div>
              );
            })}

            {/* Placement Preview */}
            {placementMode && placementCoordinates && (
              <div
                style={{
                  position: 'absolute',
                  left: `${placementCoordinates.x}%`,
                  top: `${placementCoordinates.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 25,
                  pointerEvents: 'none'
                }}
              >
                <div className="w-8 h-8 bg-spice-600 rounded-full border-2 border-white shadow-lg animate-pulse" />
              </div>
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>

      {/* POI Placement Modal */}
      {showPlacementModal && placementCoordinates && (
        <POIPlacementModal
          coordinates={{
            x: placementCoordinates.x,
            y: placementCoordinates.y
          }}
          poiTypes={poiTypes}
          customIcons={customIcons}
          onClose={() => {
            setShowPlacementModal(false);
            setPlacementCoordinates(null);
            if (onPlacementModeChange) {
              onPlacementModeChange(false);
            }
          }}
          onPoiCreated={handlePoiCreated}
          mapType={mapType}
          gridSquareId={gridSquareId}
        />
      )}
    </div>
  );
};

export default InteractivePoiImage; 