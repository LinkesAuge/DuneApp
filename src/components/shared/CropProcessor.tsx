import React from 'react';
import ImageCropModal from '../grid/ImageCropModal';
import { ScreenshotManagerReturn } from '../../hooks/useScreenshotManager';
import { PixelCrop } from 'react-image-crop';

interface CropProcessorProps {
  screenshotManager: ScreenshotManagerReturn;
  onProcessingComplete?: () => void;
  defaultToSquare?: boolean;
  className?: string;
}

const CropProcessor: React.FC<CropProcessorProps> = ({
  screenshotManager,
  onProcessingComplete,
  defaultToSquare = false,
  className = '',
}) => {
  const {
    showCropModal,
    currentCropFile,
    completeCrop,
    skipCrop,
    closeCropModal,
    processingComplete,
    getProcessingStatus,
  } = screenshotManager;

  // Handle crop completion
  const handleCropComplete = async (croppedBlob: Blob, cropData: PixelCrop) => {
    await completeCrop(croppedBlob, cropData);
  };

  // Handle crop skip
  const handleCropSkip = async () => {
    await skipCrop();
  };

  // Handle processing completion
  React.useEffect(() => {
    if (processingComplete) {
      onProcessingComplete?.();
    }
  }, [processingComplete, onProcessingComplete]);

  // Don't render if no file is being processed
  if (!showCropModal || !currentCropFile) {
    return null;
  }

  const status = getProcessingStatus();

  return (
    <div className={className}>
      <ImageCropModal
        isOpen={showCropModal}
        onClose={closeCropModal}
        imageUrl={currentCropFile.preview}
        onCropComplete={handleCropComplete}
        onSkip={handleCropSkip}
        defaultToSquare={defaultToSquare}
        title={`Crop Image (${status.processed + 1} of ${status.total})`}
        fileName={currentCropFile.originalFile.name}
      />
    </div>
  );
};

export default CropProcessor; 