import React, { useRef } from 'react';
import { Upload, Image, X, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScreenshotManagerReturn, PendingScreenshotFile } from '../../hooks/useScreenshotManager';

interface ScreenshotUploaderProps {
  screenshotManager: ScreenshotManagerReturn;
  onProcessingComplete?: (processedFiles: PendingScreenshotFile[]) => void;
  onError?: (error: string) => void;
  className?: string;
  maxDisplayFiles?: number;
}

const ScreenshotUploader: React.FC<ScreenshotUploaderProps> = ({
  screenshotManager,
  onProcessingComplete,
  onError,
  className = '',
  maxDisplayFiles = 6,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use the external screenshot manager
  const {
    filesToProcess,
    currentFileIndex,
    processingComplete,
    uploadFiles,
    processNextFile,
    clearProcessingQueue,
    removeFileFromQueue,
    isUploading,
    uploadProgress,
    error,
    clearError,
    getProcessingStatus,
  } = screenshotManager;

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      uploadFiles(files);
      // Clear the input so the same files can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle drag and drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      uploadFiles(files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // Handle processing completion
  React.useEffect(() => {
    if (processingComplete && filesToProcess.length > 0) {
      onProcessingComplete?.(filesToProcess);
    }
  }, [processingComplete, filesToProcess, onProcessingComplete]);

  // Handle errors
  React.useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  // Start processing when files are added
  React.useEffect(() => {
    if (filesToProcess.length > 0 && !isUploading) {
      const hasUnprocessed = filesToProcess.some(f => !f.isProcessed);
      if (hasUnprocessed) {
        // Small delay to ensure state is settled
        setTimeout(() => {
          processNextFile();
        }, 100);
      }
    }
  }, [filesToProcess, isUploading, processNextFile]);

  const status = getProcessingStatus();
  const displayFiles = filesToProcess.slice(0, maxDisplayFiles);
  const hasMoreFiles = filesToProcess.length > maxDisplayFiles;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-sand-300 rounded-lg p-6 text-center hover:border-sand-400 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Upload className="mx-auto h-12 w-12 text-sand-400 mb-4" />
        <p className="text-sand-600 mb-2">
          Drag and drop images here, or <span className="text-sand-800 font-medium">click to browse</span>
        </p>
        <p className="text-xs text-sand-500">
          JPEG, PNG, WebP • Max 5MB
        </p>
      </div>

      {/* Processing Status */}
      {filesToProcess.length > 0 && (
        <div className="bg-sand-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-sand-800">
              {processingComplete ? 'Processing Complete' : 'Processing Files'}
            </h3>
            <button
              onClick={clearProcessingQueue}
              className="text-sand-500 hover:text-sand-700 transition-colors"
              title="Clear all files"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="text-sm text-sand-600 mb-3">
            {status.processed} of {status.total} files processed
            {status.remaining > 0 && ` • ${status.remaining} remaining`}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-sand-200 rounded-full h-2">
            <div
              className="bg-sand-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* File Preview Grid */}
      {displayFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {displayFiles.map((file, index) => (
            <FilePreviewCard
              key={file.id}
              file={file}
              index={index}
              currentFileIndex={currentFileIndex}
              onRemove={() => removeFileFromQueue(file.id)}
            />
          ))}
          
          {hasMoreFiles && (
            <div className="aspect-square bg-sand-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-medium text-sand-600">
                  +{filesToProcess.length - maxDisplayFiles}
                </div>
                <div className="text-xs text-sand-500">more files</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-red-600 text-sm">{error}</div>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface FilePreviewCardProps {
  file: PendingScreenshotFile;
  index: number;
  currentFileIndex: number;
  onRemove: () => void;
}

const FilePreviewCard: React.FC<FilePreviewCardProps> = ({
  file,
  index,
  currentFileIndex,
  onRemove,
}) => {
  const isCurrentFile = index === currentFileIndex;
  const isProcessed = file.isProcessed;
  
  return (
    <div
      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
        isCurrentFile
          ? 'border-sand-500 ring-2 ring-sand-200'
          : isProcessed
          ? 'border-green-300 bg-green-50'
          : 'border-sand-200'
      }`}
    >
      {/* Preview Image */}
      {file.preview ? (
        <img
          src={file.preview}
          alt={`Preview ${index + 1}`}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-sand-100 flex items-center justify-center">
          <Image className="h-8 w-8 text-sand-400" />
        </div>
      )}
      
      {/* Status Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-colors flex items-center justify-center">
        {isCurrentFile && !isProcessed && (
          <div className="bg-sand-600 text-white px-2 py-1 rounded text-xs font-medium">
            Processing...
          </div>
        )}
        
        {isProcessed && (
          <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium opacity-0 hover:opacity-100 transition-opacity">
            ✓ Done
          </div>
        )}
      </div>
      
      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-1 transition-colors"
        title="Remove file"
      >
        <X className="h-3 w-3" />
      </button>
      
      {/* File Info */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
        <div className="text-xs truncate" title={file.originalFile.name}>
          {file.originalFile.name}
        </div>
        <div className="text-xs opacity-75">
          {(file.originalFile.size / 1024 / 1024).toFixed(1)}MB
        </div>
      </div>
    </div>
  );
};

export default ScreenshotUploader; 