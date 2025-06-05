import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, AlertCircle, CheckCircle2, Loader2, Image as ImageIcon, Crop } from 'lucide-react';
import { useUnifiedImages } from '../../hooks/useUnifiedImages';
import ImageCropModal from '../grid/ImageCropModal';
import type { ImageType } from '../../types/unified-images';
import type { PixelCrop } from 'react-image-crop';

// =====================================================
// Component Props
// =====================================================

interface UnifiedImageUploaderProps {
  /** Type of images being uploaded */
  imageType: ImageType;
  
  /** Optional entity to auto-link uploaded images */
  entityId?: string;
  entityType?: 'poi' | 'comment' | 'item' | 'schematic';
  
  /** Upload configuration */
  maxFiles?: number;
  maxFileSize?: number; // in MB
  allowCropping?: boolean;
  autoUpload?: boolean;
  
  /** Styling and layout */
  className?: string;
  showQueue?: boolean;
  
  /** Callbacks */
  onUploadComplete?: (imageIds: string[]) => void;
  onError?: (error: string) => void;
}

// =====================================================
// Component
// =====================================================

export function UnifiedImageUploader({
  imageType,
  entityId,
  entityType,
  maxFiles = 10,
  maxFileSize = 5, // 5MB default
  allowCropping = true,
  autoUpload = true,
  className = '',
  showQueue = true,
  onUploadComplete,
  onError
}: UnifiedImageUploaderProps) {
  
  // Hooks
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [currentCropFile, setCurrentCropFile] = useState<File | null>(null);
  
  const {
    uploadQueue,
    isUploading,
    error,
    queueUploads,
    clearCompletedUploads,
    retryUpload,
    clearError
  } = useUnifiedImages();

  // =====================================================
  // File Handling
  // =====================================================

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: Not an image file`);
        return;
      }

      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        errors.push(`${file.name}: File too large (max ${maxFileSize}MB)`);
        return;
      }

      validFiles.push(file);
    });

    // Check total file count
    if (validFiles.length > maxFiles) {
      errors.push(`Too many files selected (max ${maxFiles})`);
      validFiles.splice(maxFiles);
    }

    // Report errors
    if (errors.length > 0) {
      const errorMessage = errors.join(', ');
      onError?.(errorMessage);
      return;
    }

    if (validFiles.length === 0) return;

    setPendingFiles(validFiles);

    if (allowCropping && validFiles.length === 1) {
      // For single file, open crop modal if cropping is allowed
      setCurrentCropFile(validFiles[0]);
      setCropModalOpen(true);
    } else if (autoUpload) {
      // Auto-upload without cropping for multiple files or when cropping disabled
      uploadFiles(validFiles);
    }
  }, [maxFiles, maxFileSize, allowCropping, autoUpload, onError]);

  /**
   * Upload files with optional crop details
   */
  const uploadFiles = useCallback((files: File[], cropDetails?: PixelCrop | null) => {
    const options = entityId && entityType ? {
      cropDetails,
      entityId,
      entityType
    } : {
      cropDetails
    };

    queueUploads(files, imageType, options);
    setPendingFiles([]);
    clearError();
  }, [queueUploads, imageType, entityId, entityType, clearError]);

  /**
   * Handle crop modal completion
   */
  const handleCropComplete = useCallback((cropDetails?: PixelCrop | null) => {
    if (currentCropFile) {
      uploadFiles([currentCropFile], cropDetails);
    }
    setCurrentCropFile(null);
    setCropModalOpen(false);
  }, [currentCropFile, uploadFiles]);

  /**
   * Handle crop modal cancellation
   */
  const handleCropCancel = useCallback(() => {
    if (autoUpload && currentCropFile) {
      // Upload without cropping
      uploadFiles([currentCropFile]);
    }
    setCurrentCropFile(null);
    setCropModalOpen(false);
  }, [autoUpload, currentCropFile, uploadFiles]);

  // =====================================================
  // UI Event Handlers
  // =====================================================

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    e.target.value = ''; // Clear input for re-upload
  }, [handleFileSelect]);

  // =====================================================
  // Queue Management
  // =====================================================

  const handleRetry = useCallback((uploadId: string) => {
    retryUpload(uploadId);
  }, [retryUpload]);

  const handleClearCompleted = useCallback(() => {
    clearCompletedUploads();
    
    // Check if all uploads completed successfully
    const completedUploads = uploadQueue.filter(item => item.status === 'completed');
    if (completedUploads.length > 0 && onUploadComplete) {
      const imageIds = completedUploads
        .map(item => item.result?.managedImage?.id)
        .filter(Boolean) as string[];
      onUploadComplete(imageIds);
    }
  }, [clearCompletedUploads, uploadQueue, onUploadComplete]);

  // =====================================================
  // Render Helpers
  // =====================================================

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
      case 'linking':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Upload className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading':
      case 'linking':
        return 'border-blue-200 bg-blue-50';
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  // =====================================================
  // Render
  // =====================================================

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed border-gray-300 rounded-lg p-6 text-center
          cursor-pointer transition-colors hover:border-gray-400 hover:bg-gray-50
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={maxFiles > 1}
          onChange={handleInputChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-2">
          <ImageIcon className="w-12 h-12 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, WebP up to {maxFileSize}MB each (max {maxFiles} files)
            </p>
            {allowCropping && (
              <p className="text-xs text-blue-600 mt-1">
                <Crop className="w-3 h-3 inline mr-1" />
                Cropping available for single images
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
          <button
            onClick={clearError}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Queue */}
      {showQueue && uploadQueue.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Upload Queue</h4>
            {uploadQueue.some(item => item.status === 'completed' || item.status === 'error') && (
              <button
                onClick={handleClearCompleted}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Clear Completed
              </button>
            )}
          </div>
          
          <div className="space-y-1">
            {uploadQueue.map((item) => (
              <div
                key={item.id}
                className={`flex items-center space-x-3 p-2 rounded border ${getStatusColor(item.status)}`}
              >
                {getStatusIcon(item.status)}
                <span className="flex-1 text-sm font-medium truncate">
                  {item.file.name}
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  {item.status}
                </span>
                
                {item.status === 'error' && (
                  <button
                    onClick={() => handleRetry(item.id)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Retry
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Files (when not auto-upload) */}
      {!autoUpload && pendingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Ready to Upload</h4>
          <div className="space-y-1">
            {pendingFiles.map((file, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-blue-50 border border-blue-200 rounded">
                <ImageIcon className="w-4 h-4 text-blue-500" />
                <span className="flex-1 text-sm font-medium truncate">{file.name}</span>
              </div>
            ))}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => uploadFiles(pendingFiles)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Upload All
            </button>
            <button
              onClick={() => setPendingFiles([])}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {cropModalOpen && currentCropFile && (
        <ImageCropModal
          file={currentCropFile}
          onComplete={handleCropComplete}
          onCancel={handleCropCancel}
          defaultToSquare={false}
        />
      )}
    </div>
  );
} 