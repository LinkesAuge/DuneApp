import React, { useState, useCallback } from 'react';
import { Camera, Package, Wrench, MapPin, MessageSquare, Trash2, Eye, Crop } from 'lucide-react';
import { UnifiedImageUploader } from '../unified-images/UnifiedImageUploader';
import { useUnifiedImages, useEntityImages } from '../../hooks/useUnifiedImages';
import type { ImageType, ManagedImage } from '../../types/unified-images';

// =====================================================
// Demo Component
// =====================================================

export function UnifiedImageSystemDemo() {
  const [selectedEntityType, setSelectedEntityType] = useState<'poi' | 'comment' | 'item' | 'schematic'>('item');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');
  const [viewingImages, setViewingImages] = useState<ManagedImage[]>([]);

  // Hooks
  const unifiedImages = useUnifiedImages();
  const entityImages = useEntityImages(selectedEntityId, selectedEntityType === 'item' || selectedEntityType === 'schematic' ? selectedEntityType : undefined);

  // =====================================================
  // Sample Entity Data (for demo purposes)
  // =====================================================

  const sampleEntities = {
    poi: [
      { id: 'poi-1', name: 'Spice Fields Alpha' },
      { id: 'poi-2', name: 'Water Reclamation Plant' },
      { id: 'poi-3', name: 'Sandworm Territory' }
    ],
    comment: [
      { id: 'comment-1', name: 'Bug Report #123' },
      { id: 'comment-2', name: 'Feature Suggestion' },
      { id: 'comment-3', name: 'User Feedback' }
    ],
    item: [
      { id: 'item-1', name: 'Makeshift Pistol' },
      { id: 'item-2', name: 'Spice Harvesting Tool' },
      { id: 'item-3', name: 'Desert Cloak' }
    ],
    schematic: [
      { id: 'schematic-1', name: 'Advanced Weapon Blueprint' },
      { id: 'schematic-2', name: 'Water Purifier Plans' },
      { id: 'schematic-3', name: 'Vehicle Modification' }
    ]
  };

  // =====================================================
  // Event Handlers
  // =====================================================

  const handleEntityChange = useCallback((entityType: 'poi' | 'comment' | 'item' | 'schematic', entityId: string) => {
    setSelectedEntityType(entityType);
    setSelectedEntityId(entityId);
    setViewingImages([]); // Clear current view
  }, []);

  const handleLoadImages = useCallback(async () => {
    if (!selectedEntityId) return;
    
    const images = await unifiedImages.loadImagesForEntity(selectedEntityId, selectedEntityType);
    setViewingImages(images);
  }, [selectedEntityId, selectedEntityType, unifiedImages]);

  const handleUploadComplete = useCallback((imageIds: string[]) => {
    console.log('Upload completed:', imageIds);
    // Reload images for current entity
    if (selectedEntityId) {
      handleLoadImages();
    }
  }, [selectedEntityId, handleLoadImages]);

  const handleDeleteImage = useCallback(async (imageId: string) => {
    const success = await unifiedImages.deleteImage(imageId);
    if (success) {
      setViewingImages(prev => prev.filter(img => img.id !== imageId));
    }
  }, [unifiedImages]);

  // =====================================================
  // Utility Functions
  // =====================================================

  const getImageTypeIcon = (type: ImageType) => {
    switch (type) {
      case 'poi_screenshot': return <MapPin className="w-4 h-4" />;
      case 'comment_image': return <MessageSquare className="w-4 h-4" />;
      case 'item_screenshot': return <Package className="w-4 h-4" />;
      case 'schematic_screenshot': return <Wrench className="w-4 h-4" />;
      default: return <Camera className="w-4 h-4" />;
    }
  };

  const getEntityTypeImage = (): ImageType => {
    switch (selectedEntityType) {
      case 'poi': return 'poi_screenshot';
      case 'comment': return 'comment_image';
      case 'item': return 'item_screenshot';
      case 'schematic': return 'schematic_screenshot';
    }
  };

  // =====================================================
  // Render
  // =====================================================

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🖼️ Unified Image Management System
        </h1>
        <p className="text-gray-600">
          Comprehensive image handling for POIs, Comments, Items & Schematics
        </p>
      </div>

      {/* Entity Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          📋 Select Entity for Image Management
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(sampleEntities).map(([entityType, entities]) => (
            <div key={entityType} className="space-y-2">
              <h3 className="font-medium text-gray-700 capitalize flex items-center space-x-2">
                {getImageTypeIcon(getEntityTypeImage())}
                <span>{entityType}s</span>
              </h3>
              <div className="space-y-1">
                {entities.map((entity) => (
                  <button
                    key={entity.id}
                    onClick={() => handleEntityChange(entityType as any, entity.id)}
                    className={`
                      w-full text-left px-3 py-2 text-sm rounded border transition-colors
                      ${selectedEntityId === entity.id 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    {entity.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {selectedEntityId && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">
              <strong>Selected:</strong> {selectedEntityType} - {sampleEntities[selectedEntityType].find(e => e.id === selectedEntityId)?.name}
            </p>
          </div>
        )}
      </div>

      {/* Image Upload Section */}
      {selectedEntityId && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Camera className="w-5 h-5" />
            <span>Upload Images for {selectedEntityType}</span>
          </h2>
          
          <UnifiedImageUploader
            imageType={getEntityTypeImage()}
            entityId={selectedEntityId}
            entityType={selectedEntityType}
            maxFiles={5}
            maxFileSize={3}
            allowCropping={true}
            autoUpload={true}
            onUploadComplete={handleUploadComplete}
            onError={(error) => console.error('Upload error:', error)}
          />
        </div>
      )}

      {/* Image Viewing Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>View Uploaded Images</span>
          </h2>
          {selectedEntityId && (
            <button
              onClick={handleLoadImages}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Load Images
            </button>
          )}
        </div>

        {viewingImages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {selectedEntityId 
              ? 'No images found. Upload some images above or click "Load Images" to refresh.'
              : 'Select an entity above to view its images.'
            }
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {viewingImages.map((image) => (
              <div key={image.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Image Display */}
                <div className="aspect-video bg-gray-100 relative">
                  <img
                    src={unifiedImages.getDisplayUrl(image)}
                    alt="Uploaded image"
                    className="w-full h-full object-cover"
                  />
                  {unifiedImages.isCropped(image) && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                      <Crop className="w-3 h-3" />
                      <span>Cropped</span>
                    </div>
                  )}
                </div>
                
                {/* Image Info */}
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      {getImageTypeIcon(image.image_type)}
                      <span className="capitalize">{image.image_type.replace('_', ' ')}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Size: {(image.file_size / 1024 / 1024).toFixed(2)} MB</div>
                    <div>
                      Dimensions: {image.dimensions?.width} × {image.dimensions?.height}
                    </div>
                    <div>
                      Uploaded: {new Date(image.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          📊 System Status
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {unifiedImages.uploadQueue.length}
            </div>
            <div className="text-sm text-blue-800">Queue Items</div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {unifiedImages.images.length}
            </div>
            <div className="text-sm text-green-800">Loaded Images</div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {unifiedImages.isUploading ? '🔄' : '✅'}
            </div>
            <div className="text-sm text-purple-800">
              {unifiedImages.isUploading ? 'Uploading' : 'Ready'}
            </div>
          </div>
        </div>
        
        {unifiedImages.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
            <strong>Error:</strong> {unifiedImages.error}
          </div>
        )}
      </div>
    </div>
  );
} 