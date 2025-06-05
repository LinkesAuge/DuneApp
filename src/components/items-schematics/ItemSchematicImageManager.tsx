import React, { useState, useCallback } from 'react';
import { Camera, Image as ImageIcon, Trash2, Crop, Plus } from 'lucide-react';
import { UnifiedImageUploader } from '../unified-images/UnifiedImageUploader';
import { useEntityImages } from '../../hooks/useUnifiedImages';
import type { Entity } from '../../types/unified-entities';

// =====================================================
// Component Props
// =====================================================

interface ItemSchematicImageManagerProps {
  /** The entity (item or schematic) to manage images for */
  entity: Entity;
  
  /** Whether to show in compact mode */
  compact?: boolean;
  
  /** Maximum number of images to allow */
  maxImages?: number;
  
  /** Styling classes */
  className?: string;
}

// =====================================================
// Component
// =====================================================

export function ItemSchematicImageManager({
  entity,
  compact = false,
  maxImages = 5,
  className = ''
}: ItemSchematicImageManagerProps) {

  // State
  const [showUploader, setShowUploader] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  // Determine entity type from the entity
  const entityType = entity.type === 'Item' ? 'item' : 'schematic';
  const imageType = entityType === 'item' ? 'item_screenshot' : 'schematic_screenshot';

  // Hook for entity images
  const {
    images,
    isLoading,
    isUploading,
    error,
    deleteImage,
    getDisplayUrl,
    getEditUrl,
    isCropped,
    clearError
  } = useEntityImages(entity.id, entityType);

  // =====================================================
  // Event Handlers
  // =====================================================

  const handleUploadComplete = useCallback((imageIds: string[]) => {
    console.log(`Uploaded ${imageIds.length} images for ${entity.name}`);
    setShowUploader(false);
  }, [entity.name]);

  const handleDeleteImage = useCallback(async (imageId: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      const success = await deleteImage(imageId);
      if (success) {
        setSelectedImageId(null);
      }
    }
  }, [deleteImage]);

  const handleImageClick = useCallback((imageId: string) => {
    setSelectedImageId(selectedImageId === imageId ? null : imageId);
  }, [selectedImageId]);

  // =====================================================
  // Render Helpers
  // =====================================================

  const canAddMore = images.length < maxImages;

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <Camera className="w-4 h-4" />
            <span>Images ({images.length})</span>
          </div>
          {canAddMore && (
            <button
              onClick={() => setShowUploader(!showUploader)}
              className="p-1 text-blue-600 hover:text-blue-800"
              title="Add images"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Compact Image Grid */}
        {images.length > 0 && (
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {images.map((image) => (
              <div
                key={image.id}
                className="flex-shrink-0 w-16 h-16 relative cursor-pointer group"
                onClick={() => handleImageClick(image.id)}
              >
                <img
                  src={getDisplayUrl(image)}
                  alt={entity.name}
                  className="w-full h-full object-cover rounded border-2 border-gray-200 group-hover:border-blue-300"
                />
                {isCropped(image) && (
                  <Crop className="absolute top-0 right-0 w-3 h-3 text-green-500 bg-white rounded-full p-0.5" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Compact Uploader */}
        {showUploader && (
          <UnifiedImageUploader
            imageType={imageType}
            entityId={entity.id}
            entityType={entityType}
            maxFiles={maxImages - images.length}
            maxFileSize={3}
            allowCropping={true}
            autoUpload={true}
            showQueue={false}
            onUploadComplete={handleUploadComplete}
            onError={(error) => console.error('Upload error:', error)}
            className="mt-2"
          />
        )}

        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Full mode render
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Camera className="w-5 h-5" />
          <span>Images for {entity.name}</span>
        </h3>
        {canAddMore && (
          <button
            onClick={() => setShowUploader(!showUploader)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Images</span>
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
          <strong>Error:</strong> {error}
          <button
            onClick={clearError}
            className="ml-2 text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Uploader */}
      {showUploader && (
        <div className="border border-gray-200 rounded-lg p-4">
          <UnifiedImageUploader
            imageType={imageType}
            entityId={entity.id}
            entityType={entityType}
            maxFiles={maxImages - images.length}
            maxFileSize={3}
            allowCropping={true}
            autoUpload={true}
            onUploadComplete={handleUploadComplete}
            onError={(error) => console.error('Upload error:', error)}
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8 text-gray-500">
          Loading images...
        </div>
      )}

      {/* No Images State */}
      {!isLoading && images.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No images uploaded yet</p>
          <p className="text-sm">Click "Add Images" above to get started</p>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Image Display */}
              <div 
                className="aspect-video bg-gray-100 relative cursor-pointer group"
                onClick={() => handleImageClick(image.id)}
              >
                <img
                  src={getDisplayUrl(image)}
                  alt={entity.name}
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                />
                {isCropped(image) && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                    <Crop className="w-3 h-3" />
                    <span>Cropped</span>
                  </div>
                )}
                
                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(getDisplayUrl(image), '_blank');
                      }}
                      className="p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100"
                      title="View full size"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(image.id);
                      }}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                      title="Delete image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Image Details */}
              {selectedImageId === image.id && (
                <div className="p-3 bg-gray-50 border-t">
                  <div className="text-xs text-gray-600 space-y-1">
                    <div><strong>Size:</strong> {(image.file_size / 1024 / 1024).toFixed(2)} MB</div>
                    <div><strong>Dimensions:</strong> {image.dimensions?.width} × {image.dimensions?.height}</div>
                    <div><strong>Type:</strong> {image.mime_type}</div>
                    <div><strong>Uploaded:</strong> {new Date(image.created_at).toLocaleDateString()}</div>
                    {image.crop_details && (
                      <div><strong>Crop:</strong> {image.crop_details.width} × {image.crop_details.height}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Status */}
      {isUploading && (
        <div className="text-center py-4 text-blue-600">
          Uploading images...
        </div>
      )}
    </div>
  );
} 