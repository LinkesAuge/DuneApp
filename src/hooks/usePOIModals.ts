import { useState, useCallback } from 'react';
import { Poi } from '../types/supabase';

export interface POIModalsConfig {
  mapType: 'hagga_basin' | 'deep_desert';
  onRefreshData?: () => Promise<void>;
}

export interface POIModalsReturn {
  // Share Modal
  showShareModal: boolean;
  selectedPoiForShare: Poi | null;
  openShareModal: (poi: Poi) => void;
  closeShareModal: () => Promise<void>;
  
  // Edit Modal  
  editingPoi: Poi | null;
  openEditModal: (poi: Poi) => void;
  closeEditModal: () => void;
  
  // Gallery Modal
  showGallery: boolean;
  galleryPoi: Poi | null;
  galleryIndex: number;
  openGallery: (poi: Poi, index?: number) => void;
  closeGallery: () => void;
  
  // Delete Confirmation
  showDeleteConfirmation: boolean;
  poiToDelete: Poi | null;
  requestDeletion: (poi: Poi) => void;
  cancelDeletion: () => void;
}

export const usePOIModals = (config: POIModalsConfig): POIModalsReturn => {
  // Share Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPoiForShare, setSelectedPoiForShare] = useState<Poi | null>(null);

  // Edit Modal State
  const [editingPoi, setEditingPoi] = useState<Poi | null>(null);

  // Gallery State
  const [showGallery, setShowGallery] = useState(false);
  const [galleryPoi, setGalleryPoi] = useState<Poi | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Delete Confirmation State
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [poiToDelete, setPoiToDelete] = useState<Poi | null>(null);

  // Share Modal Handlers
  const openShareModal = useCallback((poi: Poi) => {
    setSelectedPoiForShare(poi);
    setShowShareModal(true);
  }, []);

  const closeShareModal = useCallback(async () => {
    setShowShareModal(false);
    setSelectedPoiForShare(null);
    // Refresh data after sharing changes
    if (config.onRefreshData) {
      await config.onRefreshData();
    }
  }, [config]);

  // Edit Modal Handlers
  const openEditModal = useCallback((poi: Poi) => {
    setEditingPoi(poi);
  }, []);

  const closeEditModal = useCallback(() => {
    setEditingPoi(null);
  }, []);

  // Gallery Handlers
  const openGallery = useCallback((poi: Poi, index: number = 0) => {
    setGalleryPoi(poi);
    setGalleryIndex(index);
    setShowGallery(true);
  }, []);

  const closeGallery = useCallback(() => {
    setShowGallery(false);
    setGalleryPoi(null);
    setGalleryIndex(0);
  }, []);

  // Delete Confirmation Handlers
  const requestDeletion = useCallback((poi: Poi) => {
    setPoiToDelete(poi);
    setShowDeleteConfirmation(true);
  }, []);

  const cancelDeletion = useCallback(() => {
    setShowDeleteConfirmation(false);
    setPoiToDelete(null);
  }, []);

  return {
    // Share Modal
    showShareModal,
    selectedPoiForShare,
    openShareModal,
    closeShareModal,
    
    // Edit Modal
    editingPoi,
    openEditModal,
    closeEditModal,
    
    // Gallery Modal
    showGallery,
    galleryPoi,
    galleryIndex,
    openGallery,
    closeGallery,
    
    // Delete Confirmation
    showDeleteConfirmation,
    poiToDelete,
    requestDeletion,
    cancelDeletion,
  };
}; 