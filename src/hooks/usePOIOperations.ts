import { useState, useCallback, useRef } from 'react';
import { Poi, PoiType } from '../types';
import { deletePOIWithCleanup, updatePOI, createPOI } from '../lib/api/pois';
import { useScreenshotManager } from './useScreenshotManager';
import { toast } from 'react-toastify';

export interface POIOperationsConfig {
  mapType: 'hagga_basin' | 'deep_desert';
  gridSquareId?: string;
  onPoiCreated?: (poi: Poi) => void;
  onPoiUpdated?: (poi: Poi) => void;
  onPoiDeleted?: (poiId: string) => void;
}

export interface POICreationData {
  title: string;
  description?: string;
  coordinates: { x: number; y: number };
  poi_type_id: string;
  privacy_level: 'public' | 'private' | 'shared';
  screenshots?: File[];
}

export interface POIOperationsReturn {
  // POI Placement/Creation
  placementMode: boolean;
  placementCoordinates: { x: number; y: number } | null;
  startPOIPlacement: (coordinates: { x: number; y: number }) => void;
  createPOI: (poiData: POICreationData) => Promise<void>;
  cancelPOIPlacement: () => void;
  
  // POI Editing  
  editingPoi: Poi | null;
  startPOIEdit: (poi: Poi) => void;
  updatePOI: (updatedPoi: Poi) => Promise<void>;
  cancelPOIEdit: () => void;
  
  // POI Deletion WITH COMPREHENSIVE CLEANUP
  poiToDelete: Poi | null;
  showDeleteConfirmation: boolean;
  requestPOIDeletion: (poi: Poi) => void;
  confirmPOIDeletion: () => Promise<void>;
  cancelPOIDeletion: () => void;
  
  // POI Sharing & Privacy
  sharingPoi: Poi | null;
  showShareModal: boolean;
  startPOISharing: (poi: Poi) => void;
  updatePOIPrivacy: (poi: Poi, privacy: string) => Promise<void>;
  closeShareModal: () => void;
  
  // POI Selection & Navigation
  selectedPoi: Poi | null;
  setSelectedPoi: (poi: Poi | null) => void;
  highlightedPoiId: string | null;
  setHighlightedPoiId: (id: string | null) => void;
  
  // Gallery Management
  showGallery: boolean;
  galleryPoi: Poi | null;
  galleryIndex: number;
  openGallery: (poi: Poi, index?: number) => void;
  closeGallery: () => void;
  
  // Modal Management
  showPOIModal: boolean;
  openPOIModal: () => void;
  closePOIModal: () => void;
  
  // State Management
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export const usePOIOperations = (config: POIOperationsConfig): POIOperationsReturn => {
  const { mapType, gridSquareId, onPoiCreated, onPoiUpdated, onPoiDeleted } = config;
  
  // Core state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // POI Placement/Creation state
  const [placementMode, setPlacementMode] = useState(false);
  const [placementCoordinates, setPlacementCoordinates] = useState<{ x: number; y: number } | null>(null);
  const [showPOIModal, setShowPOIModal] = useState(false);
  
  // POI Editing state
  const [editingPoi, setEditingPoi] = useState<Poi | null>(null);
  
  // POI Deletion state
  const [poiToDelete, setPoiToDelete] = useState<Poi | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  // POI Sharing state
  const [sharingPoi, setSharingPoi] = useState<Poi | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // POI Selection & Navigation state
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [highlightedPoiId, setHighlightedPoiId] = useState<string | null>(null);
  
  // Gallery state
  const [showGallery, setShowGallery] = useState(false);
  const [galleryPoi, setGalleryPoi] = useState<Poi | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  
  // Screenshot management integration
  const screenshotManager = useScreenshotManager({
    context: 'poi',
    entityId: placementCoordinates ? 'new' : editingPoi?.id || undefined
  });
  
  // Ref to track if we're in the middle of an operation
  const operationInProgress = useRef(false);
  
  // Error handling
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  const handleError = useCallback((error: any, operation: string) => {
    console.error(`[usePOIOperations] ${operation} failed:`, error);
    const errorMessage = error?.message || `${operation} failed. Please try again.`;
    setError(errorMessage);
    toast.error(errorMessage);
    setLoading(false);
    operationInProgress.current = false;
  }, []);
  
  // POI Placement/Creation operations
  const startPOIPlacement = useCallback((coordinates: { x: number; y: number }) => {
    if (operationInProgress.current) return;
    
    setPlacementCoordinates(coordinates);
    setPlacementMode(true);
    setShowPOIModal(true);
    clearError();
  }, [clearError]);
  
  const createPOI = useCallback(async (poiData: POICreationData) => {
    if (operationInProgress.current) {
      console.warn('[usePOIOperations] Create operation already in progress');
      return;
    }
    
    operationInProgress.current = true;
    setLoading(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!poiData.title.trim()) {
        throw new Error('POI title is required');
      }
      
      if (!poiData.poi_type_id) {
        throw new Error('POI type is required');
      }
      
      if (!poiData.coordinates) {
        throw new Error('POI coordinates are required');
      }
      
      // Prepare POI data for creation
      const poiCreateData = {
        ...poiData,
        map_type: mapType,
        grid_square_id: gridSquareId || null,
      };
      
      // Create POI in database
      const newPoi = await createPOI(poiCreateData);
      
      // Handle screenshot uploads if provided
      if (poiData.screenshots && poiData.screenshots.length > 0) {
        // TODO: Integrate with screenshot system for POI creation
        // This will be implemented when we integrate the screenshot system
      }
      
      // Success feedback
      toast.success(`POI "${poiData.title}" created successfully`);
      
      // Reset placement state
      setPlacementMode(false);
      setPlacementCoordinates(null);
      setShowPOIModal(false);
      
      // Notify parent component
      onPoiCreated?.(newPoi);
      
    } catch (error) {
      handleError(error, 'POI creation');
    } finally {
      setLoading(false);
      operationInProgress.current = false;
    }
  }, [mapType, gridSquareId, onPoiCreated, handleError]);
  
  const cancelPOIPlacement = useCallback(() => {
    setPlacementMode(false);
    setPlacementCoordinates(null);
    setShowPOIModal(false);
    clearError();
  }, [clearError]);
  
  // POI Editing operations
  const startPOIEdit = useCallback((poi: Poi) => {
    if (operationInProgress.current) return;
    
    setEditingPoi(poi);
    clearError();
  }, [clearError]);
  
  const updatePOI = useCallback(async (updatedPoi: Poi) => {
    if (operationInProgress.current) {
      console.warn('[usePOIOperations] Update operation already in progress');
      return;
    }
    
    operationInProgress.current = true;
    setLoading(true);
    setError(null);
    
    try {
      // Update POI in database
      const result = await updatePOI(updatedPoi);
      
      // Success feedback
      toast.success(`POI "${updatedPoi.title}" updated successfully`);
      
      // Reset editing state
      setEditingPoi(null);
      
      // Notify parent component
      onPoiUpdated?.(result);
      
    } catch (error) {
      handleError(error, 'POI update');
    } finally {
      setLoading(false);
      operationInProgress.current = false;
    }
  }, [onPoiUpdated, handleError]);
  
  const cancelPOIEdit = useCallback(() => {
    setEditingPoi(null);
    clearError();
  }, [clearError]);
  
  // POI Deletion operations with comprehensive cleanup
  const requestPOIDeletion = useCallback((poi: Poi) => {
    if (operationInProgress.current) return;
    
    setPoiToDelete(poi);
    setShowDeleteConfirmation(true);
    clearError();
  }, [clearError]);
  
  const confirmPOIDeletion = useCallback(async () => {
    if (!poiToDelete || operationInProgress.current) {
      console.warn('[usePOIOperations] No POI to delete or operation in progress');
      return;
    }
    
    operationInProgress.current = true;
    setLoading(true);
    setError(null);
    
    try {
      // Pre-deletion screenshot verification
      if (poiToDelete.screenshots && poiToDelete.screenshots.length > 0) {
        poiToDelete.screenshots.forEach((screenshot, index) => {
        });
      } else {
      }
      
      // Use enhanced deletion with comprehensive cleanup
      const result = await deletePOIWithCleanup(poiToDelete.id);
      if (result.success) {
        if (result.errors && result.errors.length > 0) {
        }
        
        // Success feedback
        toast.success(`POI "${poiToDelete.title}" deleted successfully - Check console for storage cleanup details`);
        
        // Handle partial failures with warnings
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach(error => {
            toast.warn(`Warning: ${error}`);
          });
        }
        
        // Reset deletion state
        setPoiToDelete(null);
        setShowDeleteConfirmation(false);
        
        // Clear any selections of the deleted POI
        if (selectedPoi?.id === poiToDelete.id) {
          setSelectedPoi(null);
        }
        if (editingPoi?.id === poiToDelete.id) {
          setEditingPoi(null);
        }
        if (galleryPoi?.id === poiToDelete.id) {
          setShowGallery(false);
          setGalleryPoi(null);
        }
        
        // Notify parent component
        onPoiDeleted?.(poiToDelete.id);
        
      } else {
        throw new Error(result.error || 'POI deletion failed');
      }
      
    } catch (error) {
      console.error('[usePOIOperations] ❌ POI deletion failed:', error);
      handleError(error, 'POI deletion');
    } finally {
      setLoading(false);
      operationInProgress.current = false;
    }
  }, [poiToDelete, selectedPoi, editingPoi, galleryPoi, onPoiDeleted, handleError]);
  
  const cancelPOIDeletion = useCallback(() => {
    setPoiToDelete(null);
    setShowDeleteConfirmation(false);
    clearError();
  }, [clearError]);
  
  // POI Sharing operations
  const startPOISharing = useCallback((poi: Poi) => {
    if (operationInProgress.current) return;
    
    setSharingPoi(poi);
    setShowShareModal(true);
    clearError();
  }, [clearError]);
  
  const updatePOIPrivacy = useCallback(async (poi: Poi, privacy: string) => {
    if (operationInProgress.current) {
      console.warn('[usePOIOperations] Privacy update operation already in progress');
      return;
    }
    
    operationInProgress.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const updatedPoi = { ...poi, privacy_level: privacy };
      const result = await updatePOI(updatedPoi);
      
      toast.success(`POI privacy updated to ${privacy}`);
      
      // Notify parent component
      onPoiUpdated?.(result);
      
    } catch (error) {
      handleError(error, 'POI privacy update');
    } finally {
      setLoading(false);
      operationInProgress.current = false;
    }
  }, [onPoiUpdated, handleError]);
  
  const closeShareModal = useCallback(() => {
    setSharingPoi(null);
    setShowShareModal(false);
    clearError();
  }, [clearError]);
  
  // Gallery operations
  const openGallery = useCallback((poi: Poi, index = 0) => {
    if (!poi.screenshots || poi.screenshots.length === 0) {
      toast.warn('No screenshots available for this POI');
      return;
    }
    
    setGalleryPoi(poi);
    setGalleryIndex(Math.max(0, Math.min(index, poi.screenshots.length - 1)));
    setShowGallery(true);
    clearError();
  }, [clearError]);
  
  const closeGallery = useCallback(() => {
    setShowGallery(false);
    setGalleryPoi(null);
    setGalleryIndex(0);
  }, []);
  
  // Modal operations
  const openPOIModal = useCallback(() => {
    setShowPOIModal(true);
    clearError();
  }, [clearError]);
  
  const closePOIModal = useCallback(() => {
    setShowPOIModal(false);
    if (!editingPoi) {
      // Only reset placement if we're not editing
      setPlacementMode(false);
      setPlacementCoordinates(null);
    }
    clearError();
  }, [editingPoi, clearError]);
  
  return {
    // POI Placement/Creation
    placementMode,
    placementCoordinates,
    startPOIPlacement,
    createPOI,
    cancelPOIPlacement,
    
    // POI Editing  
    editingPoi,
    startPOIEdit,
    updatePOI,
    cancelPOIEdit,
    
    // POI Deletion
    poiToDelete,
    showDeleteConfirmation,
    requestPOIDeletion,
    confirmPOIDeletion,
    cancelPOIDeletion,
    
    // POI Sharing & Privacy
    sharingPoi,
    showShareModal,
    startPOISharing,
    updatePOIPrivacy,
    closeShareModal,
    
    // POI Selection & Navigation
    selectedPoi,
    setSelectedPoi,
    highlightedPoiId,
    setHighlightedPoiId,
    
    // Gallery Management
    showGallery,
    galleryPoi,
    galleryIndex,
    openGallery,
    closeGallery,
    
    // Modal Management
    showPOIModal,
    openPOIModal,
    closePOIModal,
    
    // State Management
    loading,
    error,
    clearError,
  };
}; 