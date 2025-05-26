import type { PixelCoordinates, MarkerPosition, CoordinateConverter } from '../types';

// Constants for Hagga Basin map dimensions
export const MAP_SIZE = 4000; // 4000x4000 pixels

/**
 * Convert pixel coordinates (0-4000) to CSS percentage positioning
 */
export const getMarkerPosition = (x: number, y: number): MarkerPosition => ({
  left: `${(x / MAP_SIZE) * 100}%`,
  top: `${(y / MAP_SIZE) * 100}%`
});

/**
 * Convert click position on rendered map to pixel coordinates (0-4000)
 */
export const getPixelCoordinates = (
  clickX: number, 
  clickY: number, 
  mapRect: DOMRect
): PixelCoordinates => ({
  x: Math.round((clickX / mapRect.width) * MAP_SIZE),
  y: Math.round((clickY / mapRect.height) * MAP_SIZE)
});

/**
 * Validate that coordinates are within the valid range
 */
export const validateCoordinates = (x: number, y: number): boolean => {
  return x >= 0 && x <= MAP_SIZE && y >= 0 && y <= MAP_SIZE;
};

/**
 * Convert relative mouse position to pixel coordinates
 * Uses the actual transformed position of the map element
 */
export const getRelativeCoordinates = (
  event: React.MouseEvent,
  mapElement: HTMLElement
): PixelCoordinates => {
  // Get the actual bounding rect of the transformed map element
  const mapRect = mapElement.getBoundingClientRect();
  
  // Get click position relative to the transformed map element
  const clickX = event.clientX - mapRect.left;
  const clickY = event.clientY - mapRect.top;
  
  // Since the map element is 4000x4000px, we can directly convert
  // the click position to map coordinates by scaling based on the element's current size
  const mapX = (clickX / mapRect.width) * MAP_SIZE;
  const mapY = (clickY / mapRect.height) * MAP_SIZE;
  
  return {
    x: Math.max(0, Math.min(MAP_SIZE, Math.round(mapX))),
    y: Math.max(0, Math.min(MAP_SIZE, Math.round(mapY)))
  };
};

/**
 * Calculate distance between two points in pixels
 */
export const calculateDistance = (point1: PixelCoordinates, point2: PixelCoordinates): number => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Check if a point is within a given radius of another point
 */
export const isWithinRadius = (
  center: PixelCoordinates, 
  point: PixelCoordinates, 
  radius: number
): boolean => {
  return calculateDistance(center, point) <= radius;
};

/**
 * Clamp coordinates to valid range
 */
export const clampCoordinates = (coordinates: PixelCoordinates): PixelCoordinates => ({
  x: Math.max(0, Math.min(MAP_SIZE, coordinates.x)),
  y: Math.max(0, Math.min(MAP_SIZE, coordinates.y))
});

/**
 * Format coordinates for display (e.g., "2000, 1500")
 */
export const formatCoordinates = (x: number, y: number): string => {
  return `${Math.round(x)}, ${Math.round(y)}`;
};

/**
 * Parse coordinate string back to numbers
 */
export const parseCoordinates = (coordString: string): PixelCoordinates | null => {
  const parts = coordString.split(',').map(s => s.trim());
  if (parts.length !== 2) return null;
  
  const x = parseInt(parts[0], 10);
  const y = parseInt(parts[1], 10);
  
  if (isNaN(x) || isNaN(y)) return null;
  return { x, y };
};

/**
 * Create coordinate converter object with all utility functions
 */
export const createCoordinateConverter = (): CoordinateConverter => ({
  getMarkerPosition,
  getPixelCoordinates,
  validateCoordinates
});

/**
 * Default coordinate converter instance
 */
export const coordinateConverter = createCoordinateConverter(); 