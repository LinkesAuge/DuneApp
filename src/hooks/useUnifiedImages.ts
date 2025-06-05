import { useState, useCallback, useEffect } from 'react';
import { 
  createManagedImage,
  getManagedImage,
  updateManagedImage,
  deleteManagedImage,
  linkImageToPOI,
  linkImageToComment,
  linkImageToItem,
  linkImageToSchematic,
  unlinkImage,
  getImagesForEntity
} from '../lib/api/unified-images';
import type {
  ManagedImage,
  ImageType,
  ImageUploadResult,
  ImageEditRequest,
  ImageLinkRequest
} from '../types/unified-images';
import type { PixelCrop } from 'react-image-crop';

// =====================================================
// Types for Hook State Management
// =====================================================

interface UploadQueueItem {
  id: string;
  file: File;
  imageType: ImageType;
  cropDetails?: PixelCrop | null;
  entityId?: string;
  entityType?: 'poi' | 'comment' | 'item' | 'schematic';
  status: 'pending' | 'uploading' | 'linking' | 'completed' | 'error';
  error?: string;
  result?: ImageUploadResult;
}

interface UseUnifiedImagesState {
  images: ManagedImage[];
  uploadQueue: UploadQueueItem[];
  isUploading: boolean;
  isLoading: boolean;
  error: string | null;
}

// =====================================================
// Main Hook
// =====================================================

export function useUnifiedImages() {
  const [state, setState] = useState<UseUnifiedImagesState>({
    images: [],
    uploadQueue: [],
    isUploading: false,
    isLoading: false,
    error: null
  });

  // Update state helper
  const updateState = useCallback((updates: Partial<UseUnifiedImagesState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // =====================================================
  // Upload Operations
  // =====================================================

  /**
   * Add files to upload queue with optional auto-linking
   */
  const queueUploads = useCallback((
    files: File[],
    imageType: ImageType,
    options?: {
      cropDetails?: PixelCrop | null;
      entityId?: string;
      entityType?: 'poi' | 'comment' | 'item' | 'schematic';
    }
  ) => {
    const newItems: UploadQueueItem[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      imageType,
      cropDetails: options?.cropDetails,
      entityId: options?.entityId,
      entityType: options?.entityType,
      status: 'pending'
    }));

    setState(prev => ({
      ...prev,
      uploadQueue: [...prev.uploadQueue, ...newItems]
    }));

    // Start processing if not already uploading
    if (!state.isUploading) {
      processUploadQueue();
    }
  }, [state.isUploading]);

  /**
   * Process upload queue sequentially
   */
  const processUploadQueue = useCallback(async () => {
    updateState({ isUploading: true, error: null });

    while (state.uploadQueue.some(item => item.status === 'pending')) {
      const nextItem = state.uploadQueue.find(item => item.status === 'pending');
      if (!nextItem) break;

      try {
        // Update status to uploading
        setState(prev => ({
          ...prev,
          uploadQueue: prev.uploadQueue.map(item =>
            item.id === nextItem.id ? { ...item, status: 'uploading' } : item
          )
        }));

        // Upload image
        const result = await createManagedImage(
          nextItem.file,
          nextItem.imageType,
          nextItem.cropDetails
        );

        if (!result.success) {
          throw new Error(result.error || 'Upload failed');
        }

        // Update with result
        setState(prev => ({
          ...prev,
          uploadQueue: prev.uploadQueue.map(item =>
            item.id === nextItem.id ? { ...item, result, status: 'linking' } : item
          )
        }));

        // Auto-link if entity info provided
        if (nextItem.entityId && nextItem.entityType && result.managedImage) {
          const linkRequest: ImageLinkRequest = {
            imageId: result.managedImage.id,
            entityId: nextItem.entityId,
            displayOrder: 0
          };

          let linkSuccess = false;
          switch (nextItem.entityType) {
            case 'poi':
              linkSuccess = await linkImageToPOI(linkRequest);
              break;
            case 'comment':
              linkSuccess = await linkImageToComment(linkRequest);
              break;
            case 'item':
              linkSuccess = await linkImageToItem(linkRequest);
              break;
            case 'schematic':
              linkSuccess = await linkImageToSchematic(linkRequest);
              break;
          }

          if (!linkSuccess) {
            console.warn(`Failed to auto-link image to ${nextItem.entityType}`);
          }
        }

        // Mark as completed
        setState(prev => ({
          ...prev,
          uploadQueue: prev.uploadQueue.map(item =>
            item.id === nextItem.id ? { ...item, status: 'completed' } : item
          ),
          images: result.managedImage ? [...prev.images, result.managedImage] : prev.images
        }));

      } catch (error) {
        // Mark as error
        setState(prev => ({
          ...prev,
          uploadQueue: prev.uploadQueue.map(item =>
            item.id === nextItem.id 
              ? { ...item, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
              : item
          )
        }));
      }
    }

    updateState({ isUploading: false });
  }, [state.uploadQueue, updateState]);

  /**
   * Clear completed uploads from queue
   */
  const clearCompletedUploads = useCallback(() => {
    setState(prev => ({
      ...prev,
      uploadQueue: prev.uploadQueue.filter(item => 
        item.status !== 'completed' && item.status !== 'error'
      )
    }));
  }, []);

  /**
   * Retry failed upload
   */
  const retryUpload = useCallback((uploadId: string) => {
    setState(prev => ({
      ...prev,
      uploadQueue: prev.uploadQueue.map(item =>
        item.id === uploadId ? { ...item, status: 'pending', error: undefined } : item
      )
    }));

    if (!state.isUploading) {
      processUploadQueue();
    }
  }, [state.isUploading, processUploadQueue]);

  // =====================================================
  // Image Management Operations
  // =====================================================

  /**
   * Load images for a specific entity
   */
  const loadImagesForEntity = useCallback(async (
    entityId: string,
    entityType: 'poi' | 'comment' | 'item' | 'schematic'
  ) => {
    updateState({ isLoading: true, error: null });
    
    try {
      const images = await getImagesForEntity(entityId, entityType);
      updateState({ images, isLoading: false });
      return images;
    } catch (error) {
      updateState({ 
        error: error instanceof Error ? error.message : 'Failed to load images',
        isLoading: false
      });
      return [];
    }
  }, [updateState]);

  /**
   * Update image (mainly for cropping)
   */
  const updateImage = useCallback(async (
    imageId: string,
    updates: ImageEditRequest
  ): Promise<boolean> => {
    updateState({ error: null });
    
    try {
      const result = await updateManagedImage(imageId, updates);
      
      if (result.success && result.managedImage) {
        setState(prev => ({
          ...prev,
          images: prev.images.map(img => 
            img.id === imageId ? result.managedImage! : img
          )
        }));
        return true;
      } else {
        updateState({ error: result.error || 'Failed to update image' });
        return false;
      }
    } catch (error) {
      updateState({ error: error instanceof Error ? error.message : 'Failed to update image' });
      return false;
    }
  }, [updateState]);

  /**
   * Delete image
   */
  const deleteImage = useCallback(async (imageId: string): Promise<boolean> => {
    updateState({ error: null });
    
    try {
      const success = await deleteManagedImage(imageId);
      
      if (success) {
        setState(prev => ({
          ...prev,
          images: prev.images.filter(img => img.id !== imageId)
        }));
        return true;
      } else {
        updateState({ error: 'Failed to delete image' });
        return false;
      }
    } catch (error) {
      updateState({ error: error instanceof Error ? error.message : 'Failed to delete image' });
      return false;
    }
  }, [updateState]);

  // =====================================================
  // Entity Linking Operations
  // =====================================================

  /**
   * Link existing image to entity
   */
  const linkToEntity = useCallback(async (
    imageId: string,
    entityId: string,
    entityType: 'poi' | 'comment' | 'item' | 'schematic',
    displayOrder: number = 0
  ): Promise<boolean> => {
    updateState({ error: null });
    
    try {
      const linkRequest: ImageLinkRequest = {
        imageId,
        entityId,
        displayOrder
      };

      let success = false;
      switch (entityType) {
        case 'poi':
          success = await linkImageToPOI(linkRequest);
          break;
        case 'comment':
          success = await linkImageToComment(linkRequest);
          break;
        case 'item':
          success = await linkImageToItem(linkRequest);
          break;
        case 'schematic':
          success = await linkImageToSchematic(linkRequest);
          break;
      }

      if (!success) {
        updateState({ error: `Failed to link image to ${entityType}` });
      }

      return success;
    } catch (error) {
      updateState({ error: error instanceof Error ? error.message : 'Failed to link image' });
      return false;
    }
  }, [updateState]);

  /**
   * Unlink image from entity
   */
  const unlinkFromEntity = useCallback(async (
    imageId: string,
    entityId: string,
    entityType: 'poi' | 'comment' | 'item' | 'schematic'
  ): Promise<boolean> => {
    updateState({ error: null });
    
    try {
      const success = await unlinkImage(imageId, entityId, entityType);
      
      if (!success) {
        updateState({ error: `Failed to unlink image from ${entityType}` });
      }

      return success;
    } catch (error) {
      updateState({ error: error instanceof Error ? error.message : 'Failed to unlink image' });
      return false;
    }
  }, [updateState]);

  // =====================================================
  // Utility Functions
  // =====================================================

  /**
   * Get display URL for image (processed if available, otherwise original)
   */
  const getDisplayUrl = useCallback((image: ManagedImage): string => {
    return image.processed_url || image.original_url;
  }, []);

  /**
   * Get edit URL for image (always original for cropping)
   */
  const getEditUrl = useCallback((image: ManagedImage): string => {
    return image.original_url;
  }, []);

  /**
   * Check if image has been cropped
   */
  const isCropped = useCallback((image: ManagedImage): boolean => {
    return !!(image.processed_url && image.crop_details);
  }, []);

  // =====================================================
  // Hook Return
  // =====================================================

  return {
    // State
    images: state.images,
    uploadQueue: state.uploadQueue,
    isUploading: state.isUploading,
    isLoading: state.isLoading,
    error: state.error,

    // Upload operations
    queueUploads,
    clearCompletedUploads,
    retryUpload,

    // Image management
    loadImagesForEntity,
    updateImage,
    deleteImage,

    // Entity linking
    linkToEntity,
    unlinkFromEntity,

    // Utility functions
    getDisplayUrl,
    getEditUrl,
    isCropped,

    // Error handling
    clearError
  };
}

// =====================================================
// Specialized Hooks for Specific Use Cases
// =====================================================

/**
 * Hook specifically for POI image management
 */
export function usePOIImages(poiId?: string) {
  const unifiedImages = useUnifiedImages();

  // Load POI images on mount
  useEffect(() => {
    if (poiId) {
      unifiedImages.loadImagesForEntity(poiId, 'poi');
    }
  }, [poiId]);

  const uploadPOIImages = useCallback((
    files: File[],
    cropDetails?: PixelCrop | null
  ) => {
    if (!poiId) {
      throw new Error('POI ID is required');
    }
    
    unifiedImages.queueUploads(files, 'poi_screenshot', {
      cropDetails,
      entityId: poiId,
      entityType: 'poi'
    });
  }, [poiId, unifiedImages]);

  return {
    ...unifiedImages,
    uploadPOIImages
  };
}

/**
 * Hook specifically for item/schematic image management
 */
export function useEntityImages(entityId?: string, entityType?: 'item' | 'schematic') {
  const unifiedImages = useUnifiedImages();

  // Load entity images on mount
  useEffect(() => {
    if (entityId && entityType) {
      unifiedImages.loadImagesForEntity(entityId, entityType);
    }
  }, [entityId, entityType]);

  const uploadEntityImages = useCallback((
    files: File[],
    cropDetails?: PixelCrop | null
  ) => {
    if (!entityId || !entityType) {
      throw new Error('Entity ID and type are required');
    }
    
    const imageType = entityType === 'item' ? 'item_screenshot' : 'schematic_screenshot';
    
    unifiedImages.queueUploads(files, imageType, {
      cropDetails,
      entityId,
      entityType
    });
  }, [entityId, entityType, unifiedImages]);

  return {
    ...unifiedImages,
    uploadEntityImages
  };
} 