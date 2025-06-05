import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PixelCrop } from 'react-image-crop';

// Types for screenshot management
export interface PendingScreenshotFile {
  file: File;
  id: string;
  originalFile: File;
  displayFile: File;
  preview: string;
  needsCropping: boolean;
  isProcessed: boolean;
  cropData?: PixelCrop;
  wasActuallyCropped?: boolean; // Track if actual cropping was performed (better approach)
  uploadedUrl?: string;
  originalUrl?: string;
  error?: string;
}

export interface ScreenshotManagerConfig {
  context: 'poi' | 'grid' | 'comment';
  entityId?: string; // POI ID, Grid ID, Comment ID, etc.
  maxFileSize?: number; // In MB, default 5MB
  allowedTypes?: string[]; // Default: ['image/jpeg', 'image/png', 'image/webp']
  enableCropping?: boolean; // Default: true
}

export interface ScreenshotManagerReturn {
  // File Processing Queue
  filesToProcess: PendingScreenshotFile[];
  currentFileIndex: number;
  processingComplete: boolean;
  allFilesProcessed: boolean;
  
  // Upload Management
  uploadFiles: (files: FileList | File[]) => void;
  processNextFile: () => void;
  skipCurrentFile: () => void;
  retryCurrentFile: () => void;
  clearProcessingQueue: () => void;
  removeFileFromQueue: (fileId: string) => void;
  
  // Crop Management
  showCropModal: boolean;
  currentCropFile: PendingScreenshotFile | null;
  startCropping: (fileId: string) => void;
  completeCrop: (croppedBlob: Blob, cropData: PixelCrop, isFullImage?: boolean) => Promise<void>;
  skipCrop: () => Promise<void>;
  closeCropModal: () => void;
  cancelCrop: () => void;
  
  // Upload to Storage
  uploadToStorage: (file: PendingScreenshotFile) => Promise<{ url: string; originalUrl?: string }>;
  
  // State Management
  isUploading: boolean;
  uploadProgress: number;
  currentFileProgress: number;
  error: string | null;
  clearError: () => void;
  
  // Queue Navigation
  canGoToNext: boolean;
  canGoToPrevious: boolean;
  goToNextFile: () => void;
  goToPreviousFile: () => void;
  
  // Processing Status
  getProcessingStatus: () => {
    total: number;
    processed: number;
    remaining: number;
    current: PendingScreenshotFile | null;
  };
}

const DEFAULT_CONFIG: Required<ScreenshotManagerConfig> = {
  context: 'poi',
  entityId: '',
  maxFileSize: 5,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  enableCropping: true,
};

export const useScreenshotManager = (config: ScreenshotManagerConfig): ScreenshotManagerReturn => {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Core state
  const [filesToProcess, setFilesToProcess] = useState<PendingScreenshotFile[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [showCropModal, setShowCropModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileProgress, setCurrentFileProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for stable callbacks
  const processingRef = useRef(false);
  const fileCounterRef = useRef(0);

  // Helper function to generate unique file IDs
  const generateFileId = () => `file_${Date.now()}_${++fileCounterRef.current}`;

  // Helper function to create object URL safely
  const createPreviewUrl = (file: File): string => {
    try {
      return URL.createObjectURL(file);
    } catch (error) {
      console.error('Error creating preview URL:', error);
      return '';
    }
  };

  // Validate file before processing
  const validateFile = (file: File): string | null => {
    if (!fullConfig.allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed types: ${fullConfig.allowedTypes.join(', ')}`;
    }
    
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > fullConfig.maxFileSize) {
      return `File size too large. Maximum size: ${fullConfig.maxFileSize}MB`;
    }
    
    return null;
  };

  // Upload files to processing queue
  const uploadFiles = useCallback((files: FileList | File[]) => {
    console.log('[useScreenshotManager] 📥 uploadFiles called with:', files.length, 'files');
    
    const fileArray = Array.from(files);
    const newFiles: PendingScreenshotFile[] = [];
    
    setError(null);
    
    for (const file of fileArray) {
      console.log('[useScreenshotManager] 🔍 Validating file:', file.name, file.size);
      
      const validationError = validateFile(file);
      if (validationError) {
        console.log('[useScreenshotManager] ❌ Validation failed:', validationError);
        setError(validationError);
        continue;
      }
      
      const fileId = generateFileId();
      const preview = createPreviewUrl(file);
      
      console.log('[useScreenshotManager] ✅ File validated, creating pending file:', {
        id: fileId,
        name: file.name,
        size: file.size,
        needsCropping: fullConfig.enableCropping
      });
      
      const pendingFile: PendingScreenshotFile = {
        file,
        id: fileId,
        originalFile: file,
        displayFile: file,
        preview,
        needsCropping: fullConfig.enableCropping,
        isProcessed: false,
      };
      
      newFiles.push(pendingFile);
    }
    
    if (newFiles.length > 0) {
      console.log('[useScreenshotManager] 📦 Adding', newFiles.length, 'new files to processing queue');
      
      setFilesToProcess(prev => {
        const updated = [...prev, ...newFiles];
        console.log('[useScreenshotManager] 📋 Updated queue length:', updated.length);
        return updated;
      });
      
      // CRITICAL: Start processing after adding files
      setTimeout(() => {
        console.log('[useScreenshotManager] ⏰ Starting delayed processing trigger...');
        // Trigger processing via useEffect by changing state
        setCurrentFileIndex(0);
      }, 100);
    } else {
      console.log('[useScreenshotManager] ⚠️ No valid files to add to queue');
    }
  }, [fullConfig.allowedTypes, fullConfig.maxFileSize, fullConfig.enableCropping]);

  // Get current file being processed
  const currentCropFile = filesToProcess[currentFileIndex] || null;

  // Start cropping for a specific file
  const startCropping = useCallback((fileId: string) => {
    const fileIndex = filesToProcess.findIndex(f => f.id === fileId);
    if (fileIndex >= 0) {
      setCurrentFileIndex(fileIndex);
      setShowCropModal(true);
      setError(null);
    }
  }, [filesToProcess]);

  // Process file without cropping
  const markFileAsProcessed = useCallback((fileId: string) => {
    console.log('[useScreenshotManager] ✅ markFileAsProcessed called for:', fileId);
    
    setFilesToProcess(prev => 
      prev.map(f => {
        if (f.id === fileId) {
          console.log('[useScreenshotManager] 📝 Marking file as processed:', f.originalFile.name);
          return { ...f, needsCropping: false, isProcessed: true };
        }
        return f;
      })
    );
  }, []);

  // Process next file in queue
  const processNextFile = useCallback(() => {
    if (processingRef.current) return;
    
    const unprocessedIndex = filesToProcess.findIndex(f => !f.isProcessed);
    if (unprocessedIndex >= 0) {
      const file = filesToProcess[unprocessedIndex];
      setCurrentFileIndex(unprocessedIndex);
      
      if (fullConfig.enableCropping && file.needsCropping) {
        setShowCropModal(true);
      } else {
        // Mark as processed directly without cropping
        markFileAsProcessed(file.id);
      }
    } else {
      setCurrentFileIndex(-1);
    }
  }, [filesToProcess, fullConfig.enableCropping, markFileAsProcessed]);

  // Complete crop operation
  const completeCrop = useCallback(async (croppedBlob: Blob, cropData: PixelCrop, isFullImageUpload = false) => {
    if (!currentCropFile) return;
    
    try {
      processingRef.current = true;
      setIsUploading(true);
      setCurrentFileProgress(0);
      setError(null);
      
      // Create cropped file
      const croppedFile = new File([croppedBlob], currentCropFile.originalFile.name, {
        type: currentCropFile.originalFile.type,
      });
      
      // Better approach: Check if actual cropping was performed
      // If crop area doesn't cover the entire image, it was actually cropped
      const imageElement = document.querySelector('img[src="' + currentCropFile.preview + '"]') as HTMLImageElement;
      const wasActuallyCropped = imageElement ? (
        cropData.x > 0 || 
        cropData.y > 0 || 
        cropData.width < imageElement.naturalWidth ||
        cropData.height < imageElement.naturalHeight
      ) : false;
      
      console.log('[useScreenshotManager] 🎯 Crop analysis:', {
        cropData,
        imageNaturalSize: imageElement ? { width: imageElement.naturalWidth, height: imageElement.naturalHeight } : 'unknown',
        wasActuallyCropped,
        isFullImageUpload
      });
      
      // Update file in queue
      const updatedFile: PendingScreenshotFile = {
        ...currentCropFile,
        displayFile: croppedFile,
        cropData,
        wasActuallyCropped, // Use the better detection approach
        needsCropping: false,
        isProcessed: true,
      };
      
      setFilesToProcess(prev => 
        prev.map(f => f.id === currentCropFile.id ? updatedFile : f)
      );
      
      // Close crop modal
      setShowCropModal(false);
      setCurrentFileProgress(100);
      
      // Auto-advance to next file - let useEffect handle this
      processingRef.current = false;
      
    } catch (error) {
      console.error('Error completing crop:', error);
      setError(`Failed to process cropped image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      processingRef.current = false;
    }
  }, [currentCropFile]);

  // Skip cropping for current file
  const skipCrop = useCallback(async () => {
    if (!currentCropFile) {
      console.log('[useScreenshotManager] ⚠️ skipCrop called but no currentCropFile');
      return;
    }
    
    console.log('[useScreenshotManager] ⏭️ skipCrop called for:', currentCropFile.originalFile.name);
    
    try {
      processingRef.current = true;
      setIsUploading(true);
      setCurrentFileProgress(0);
      setError(null);
      
      // Mark file as processed without cropping
      const updatedFile: PendingScreenshotFile = {
        ...currentCropFile,
        needsCropping: false,
        isProcessed: true,
        wasActuallyCropped: false, // No cropping was performed
      };
      
      console.log('[useScreenshotManager] 🔄 Updating file to processed state:', updatedFile.originalFile.name);
      
      setFilesToProcess(prev => 
        prev.map(f => f.id === currentCropFile.id ? updatedFile : f)
      );
      
      // Close crop modal
      setShowCropModal(false);
      setCurrentFileProgress(100);
      
      console.log('[useScreenshotManager] ✅ skipCrop completed for:', currentCropFile.originalFile.name);
      
      // Auto-advance to next file - let useEffect handle this
      processingRef.current = false;
      
    } catch (error) {
      console.error('[useScreenshotManager] ❌ Error skipping crop:', error);
      setError(`Failed to skip cropping: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      processingRef.current = false;
    }
  }, [currentCropFile]);

  // Upload file to Supabase storage
  const uploadToStorage = useCallback(async (file: PendingScreenshotFile): Promise<{ url: string; originalUrl?: string }> => {
    const timestamp = Date.now();
    const fileExtension = file.originalFile.name.split('.').pop() || 'jpg';
    
    // Generate storage paths based on context
    let basePath: string;
    let originalBasePath: string;
    
    switch (fullConfig.context) {
      case 'poi':
        basePath = 'poi_screenshots';
        originalBasePath = 'poi_originals';
        break;
      case 'grid':
        basePath = 'grid_screenshots';
        originalBasePath = 'grid_originals';
        break;
      case 'comment':
        basePath = 'comment_screenshots';
        originalBasePath = 'comment_originals';
        break;
      default:
        basePath = 'screenshots';
        originalBasePath = 'originals';
    }
    
    const displayPath = `${basePath}/${fullConfig.entityId || 'temp'}_${timestamp}.${fileExtension}`;
    const originalPath = `${originalBasePath}/${fullConfig.entityId || 'temp'}_${timestamp}_original.${fileExtension}`;
    
    try {
      // Upload display version (cropped or original)
      const { data: displayData, error: displayError } = await supabase.storage
        .from('screenshots')
        .upload(displayPath, file.displayFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (displayError) throw displayError;
      
      // Get public URL for display version
      const { data: displayUrlData } = supabase.storage
        .from('screenshots')
        .getPublicUrl(displayPath);
      
      let originalUrl: string | undefined;
      
      // Upload original version if different from display
      if (file.cropData && file.originalFile !== file.displayFile) {
        const { data: originalData, error: originalError } = await supabase.storage
          .from('screenshots')
          .upload(originalPath, file.originalFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (originalError) {
          console.warn('Failed to upload original file:', originalError);
        } else {
          const { data: originalUrlData } = supabase.storage
            .from('screenshots')
            .getPublicUrl(originalPath);
          originalUrl = originalUrlData.publicUrl;
        }
      }
      
      return {
        url: displayUrlData.publicUrl,
        originalUrl
      };
      
    } catch (error) {
      console.error('Error uploading to storage:', error);
      throw new Error(`Storage upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [fullConfig.context, fullConfig.entityId]);

  // Skip current file
  const skipCurrentFile = useCallback(() => {
    if (currentFileIndex < filesToProcess.length - 1) {
      setCurrentFileIndex(prev => prev + 1);
    }
    setShowCropModal(false);
  }, [currentFileIndex, filesToProcess.length]);

  // Retry current file
  const retryCurrentFile = useCallback(() => {
    if (currentCropFile) {
      setError(null);
      const updatedFile = { ...currentCropFile, isProcessed: false, error: undefined };
      setFilesToProcess(prev => 
        prev.map(f => f.id === currentCropFile.id ? updatedFile : f)
      );
      // Let useEffect handle processing
    }
  }, [currentCropFile]);

  // Clear entire processing queue
  const clearProcessingQueue = useCallback(() => {
    // Clean up object URLs to prevent memory leaks
    filesToProcess.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    
    setFilesToProcess([]);
    setCurrentFileIndex(0);
    setShowCropModal(false);
    setIsUploading(false);
    setUploadProgress(0);
    setCurrentFileProgress(0);
    setError(null);
    processingRef.current = false;
  }, [filesToProcess]);

  // Remove specific file from queue
  const removeFileFromQueue = useCallback((fileId: string) => {
    setFilesToProcess(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      
      const newFiles = prev.filter(f => f.id !== fileId);
      
      // Adjust current index if necessary
      const removedIndex = prev.findIndex(f => f.id === fileId);
      if (removedIndex <= currentFileIndex && currentFileIndex > 0) {
        setCurrentFileIndex(idx => Math.max(0, idx - 1));
      }
      
      return newFiles;
    });
  }, [currentFileIndex]);

  // Close crop modal
  const closeCropModal = useCallback(() => {
    setShowCropModal(false);
  }, []);

  // Cancel crop - handle user canceling the crop modal
  const cancelCrop = useCallback((fileId?: string) => {
    const targetFile = fileId ? filesToProcess.find(f => f.id === fileId) : currentCropFile;
    
    if (targetFile) {
      console.log('[useScreenshotManager] 🚫 User canceled crop for:', targetFile.originalFile.name);
      
      // Remove the file from queue
      removeFileFromQueue(targetFile.id);
      
      // Close modal if this was the current crop file
      if (targetFile.id === currentCropFile?.id) {
        setShowCropModal(false);
      }
      
      console.log('[useScreenshotManager] ✅ File removed from queue due to cancel');
    } else {
      // Just close modal if no file found
      setShowCropModal(false);
    }
  }, [currentCropFile, filesToProcess, removeFileFromQueue]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Navigation helpers
  const canGoToNext = currentFileIndex < filesToProcess.length - 1;
  const canGoToPrevious = currentFileIndex > 0;
  
  const goToNextFile = useCallback(() => {
    if (canGoToNext) {
      setCurrentFileIndex(prev => prev + 1);
    }
  }, [canGoToNext]);
  
  const goToPreviousFile = useCallback(() => {
    if (canGoToPrevious) {
      setCurrentFileIndex(prev => prev - 1);
    }
  }, [canGoToPrevious]);

  // Processing status
  const getProcessingStatus = useCallback(() => {
    const total = filesToProcess.length;
    const processed = filesToProcess.filter(f => f.isProcessed).length;
    const remaining = total - processed;
    const current = currentCropFile;
    
    return { total, processed, remaining, current };
  }, [filesToProcess, currentCropFile]);

  // Computed values
  const processingComplete = filesToProcess.length > 0 && filesToProcess.every(f => f.isProcessed);
  const allFilesProcessed = processingComplete;

  // Update overall upload progress
  const updateUploadProgress = useCallback(() => {
    if (filesToProcess.length === 0) {
      setUploadProgress(0);
      return;
    }
    
    const processed = filesToProcess.filter(f => f.isProcessed).length;
    const progress = (processed / filesToProcess.length) * 100;
    setUploadProgress(progress);
  }, [filesToProcess]);

  // Effect to update progress when files change
  useEffect(() => {
    updateUploadProgress();
  }, [updateUploadProgress]);

  // Effect to continue processing when files are marked as processed
  useEffect(() => {
    console.log('[useScreenshotManager] 🔄 Auto-processing useEffect triggered:', {
      processingRefCurrent: processingRef.current,
      filesToProcessLength: filesToProcess.length,
      filesToProcessIds: filesToProcess.map(f => ({ id: f.id, name: f.originalFile.name, isProcessed: f.isProcessed }))
    });
    
    if (!processingRef.current && filesToProcess.length > 0) {
      const hasUnprocessed = filesToProcess.some(f => !f.isProcessed);
      console.log('[useScreenshotManager] 🔍 Checking for unprocessed files:', {
        hasUnprocessed,
        unprocessedFiles: filesToProcess.filter(f => !f.isProcessed).map(f => ({ id: f.id, name: f.originalFile.name }))
      });
      
      if (hasUnprocessed) {
        console.log('[useScreenshotManager] ⏰ Setting timer for auto-processing...');
        
        const timer = setTimeout(() => {
          console.log('[useScreenshotManager] 🚀 Timer triggered, starting auto-processing...');
          
          // Call processNextFile directly since we're inside useEffect
          if (processingRef.current) {
            console.log('[useScreenshotManager] ⚠️ Processing already in progress, skipping');
            return;
          }
          
          const unprocessedIndex = filesToProcess.findIndex(f => !f.isProcessed);
          console.log('[useScreenshotManager] 🔍 Found unprocessed file at index:', unprocessedIndex);
          
          if (unprocessedIndex >= 0) {
            const file = filesToProcess[unprocessedIndex];
            console.log('[useScreenshotManager] 📄 Processing file:', file.originalFile.name, {
              needsCropping: file.needsCropping,
              enableCropping: fullConfig.enableCropping
            });
            
            setCurrentFileIndex(unprocessedIndex);
            
            if (fullConfig.enableCropping && file.needsCropping) {
              console.log('[useScreenshotManager] ✂️ File needs cropping, showing crop modal...');
              setShowCropModal(true);
            } else {
              console.log('[useScreenshotManager] ⏭️ File does not need cropping, marking as processed...');
              // Mark as processed directly without cropping
              setFilesToProcess(prev => 
                prev.map(f => {
                  if (f.id === file.id) {
                    console.log('[useScreenshotManager] ✅ Auto-marking file as processed:', f.originalFile.name);
                    return { ...f, needsCropping: false, isProcessed: true };
                  }
                  return f;
                })
              );
            }
          } else {
            console.log('[useScreenshotManager] ✅ No unprocessed files found, setting currentFileIndex to -1');
            setCurrentFileIndex(-1);
          }
        }, 100);
        return () => {
          console.log('[useScreenshotManager] 🧹 Cleaning up auto-processing timer');
          clearTimeout(timer);
        };
      } else {
        console.log('[useScreenshotManager] ✅ All files processed!');
      }
    } else {
      console.log('[useScreenshotManager] ⚠️ Auto-processing skipped:', {
        reason: processingRef.current ? 'Processing in progress' : 'No files to process'
      });
    }
  }, [filesToProcess, fullConfig.enableCropping]);

  return {
    // File Processing Queue
    filesToProcess,
    currentFileIndex,
    processingComplete,
    allFilesProcessed,
    
    // Upload Management
    uploadFiles,
    processNextFile,
    skipCurrentFile,
    retryCurrentFile,
    clearProcessingQueue,
    removeFileFromQueue,
    
    // Crop Management
    showCropModal,
    currentCropFile,
    startCropping,
    completeCrop,
    skipCrop,
    closeCropModal,
    cancelCrop,
    
    // Upload to Storage
    uploadToStorage,
    
    // State Management
    isUploading,
    uploadProgress,
    currentFileProgress,
    error,
    clearError,
    
    // Queue Navigation
    canGoToNext,
    canGoToPrevious,
    goToNextFile,
    goToPreviousFile,
    
    // Processing Status
    getProcessingStatus,
  };
}; 