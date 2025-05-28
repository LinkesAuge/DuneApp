import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import { X, Square, Maximize2, RotateCcw, Check, Download } from 'lucide-react';
import 'react-image-crop/dist/ReactCrop.css';

// Helper for consistent theming of text based on background (can be imported from a shared util if used in many places)
const getThemedTextColor = (variant: 'primary' | 'secondary' | 'muted') => {
  if (variant === 'primary') return 'text-amber-200';
  if (variant === 'secondary') return 'text-slate-300';
  return 'text-slate-400';
};

interface ImageCropModalProps {
  imageUrl: string;
  onCropComplete: (croppedImageBlob: Blob, cropData: PixelCrop) => Promise<void>;
  onClose: () => void;
  onSkip?: () => void;
  onDelete?: () => Promise<void>;
  title?: string;
  defaultToSquare?: boolean;
  initialCrop?: PixelCrop;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({
  imageUrl,
  onCropComplete,
  onClose,
  onSkip,
  onDelete,
  title = "Crop Your Screenshot",
  initialCrop,
  defaultToSquare = false
}) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    x: 25,
    y: 25,
    width: 50,
    height: 50,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [squareMode, setSquareMode] = useState(defaultToSquare);
  const [isProcessing, setIsProcessing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Set up initial crop when image loads
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    const { width: displayWidth, height: displayHeight } = e.currentTarget.getBoundingClientRect();
    
    if (initialCrop && displayWidth > 0 && displayHeight > 0) {
      // Convert stored crop coordinates from natural dimensions to display dimensions
      const scaleX = displayWidth / naturalWidth;
      const scaleY = displayHeight / naturalHeight;
      
      const displayX = initialCrop.x * scaleX;
      const displayY = initialCrop.y * scaleY;
      const displayWidth_crop = initialCrop.width * scaleX;
      const displayHeight_crop = initialCrop.height * scaleY;
      
      // Ensure the crop is within the display bounds
      const clampedX = Math.max(0, Math.min(displayX, displayWidth - 50));
      const clampedY = Math.max(0, Math.min(displayY, displayHeight - 50));
      const clampedWidth = Math.max(50, Math.min(displayWidth_crop, displayWidth - clampedX));
      const clampedHeight = Math.max(50, Math.min(displayHeight_crop, displayHeight - clampedY));
      
      setCrop({
        unit: 'px',
        x: clampedX,
        y: clampedY,
        width: clampedWidth,
        height: clampedHeight,
      });
      
      setCompletedCrop({
        x: clampedX,
        y: clampedY,
        width: clampedWidth,
        height: clampedHeight,
      });
    } else {
      // Create a centered crop using percentage to ensure it's always visible
      const cropSize = 60; // 60% of the image
      const centerX = (100 - cropSize) / 2; // 20%
      const centerY = (100 - cropSize) / 2; // 20%
      
      const newCrop: Crop = {
        unit: '%',
        x: centerX,
        y: centerY,
        width: cropSize,
        height: defaultToSquare ? cropSize : cropSize * 0.8, // Square or slightly rectangular
      };
      
      setCrop(newCrop);
      
      // Also set completedCrop in pixel coordinates for consistency
      const pixelX = (centerX / 100) * displayWidth;
      const pixelY = (centerY / 100) * displayHeight;
      const pixelWidth = (cropSize / 100) * displayWidth;
      const pixelHeight = ((defaultToSquare ? cropSize : cropSize * 0.8) / 100) * displayHeight;
      
      setCompletedCrop({
        x: pixelX,
        y: pixelY,
        width: pixelWidth,
        height: pixelHeight,
      });
    }
  }, [initialCrop, defaultToSquare]);

  // Generate cropped image canvas
  const generateCroppedImage = useCallback(async (): Promise<Blob | null> => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return null;
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    const { x, y, width, height } = completedCrop;
    
    // Get the natural (actual) dimensions of the image
    const { naturalWidth, naturalHeight } = image;
    
    // Get the displayed dimensions
    const { width: displayWidth, height: displayHeight } = image.getBoundingClientRect();
    
    // Calculate scale factors to convert from display coordinates to natural coordinates
    const scaleX = naturalWidth / displayWidth;
    const scaleY = naturalHeight / displayHeight;
    
    // Convert crop coordinates to natural image coordinates
    const naturalX = x * scaleX;
    const naturalY = y * scaleY;
    const naturalCropWidth = width * scaleX;
    const naturalCropHeight = height * scaleY;
    
    // Ensure coordinates are within image bounds
    const clampedX = Math.max(0, Math.min(naturalX, naturalWidth - 1));
    const clampedY = Math.max(0, Math.min(naturalY, naturalHeight - 1));
    const clampedWidth = Math.max(1, Math.min(naturalCropWidth, naturalWidth - clampedX));
    const clampedHeight = Math.max(1, Math.min(naturalCropHeight, naturalHeight - clampedY));

    // Set canvas size to crop size (using natural dimensions)
    canvas.width = clampedWidth;
    canvas.height = clampedHeight;

    // Draw the cropped portion using natural coordinates
    ctx.drawImage(
      image,
      clampedX, clampedY, clampedWidth, clampedHeight,  // Source rectangle (natural coords)
      0, 0, clampedWidth, clampedHeight   // Destination rectangle (canvas coords)
    );

    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.9);
    });
  }, [completedCrop]);

  const handleCropConfirm = async () => {
    if (!completedCrop) {
      alert('Please select an area to crop');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Starting crop process with data:', completedCrop);
      console.log('Image dimensions:', {
        natural: imgRef.current ? { width: imgRef.current.naturalWidth, height: imgRef.current.naturalHeight } : 'N/A',
        display: imgRef.current ? imgRef.current.getBoundingClientRect() : 'N/A'
      });
      
      const croppedBlob = await generateCroppedImage();
      if (croppedBlob) {
        console.log('Crop successful, blob size:', croppedBlob.size);
        await onCropComplete(croppedBlob, completedCrop);
      } else {
        throw new Error('Failed to generate cropped image blob');
      }
    } catch (error) {
      console.error('Error generating cropped image:', error);
      console.error('Crop data at time of error:', completedCrop);
      console.error('Image element:', imgRef.current);
      alert('Failed to process the cropped image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSquareModeToggle = () => {
    setSquareMode(!squareMode);
    
    if (!squareMode && imgRef.current && completedCrop) {
      // Switching to square mode - make current crop square and ensure it's visible
      const { width: displayWidth, height: displayHeight } = imgRef.current.getBoundingClientRect();
      
      if (displayWidth > 0 && displayHeight > 0) {
        const { x, y, width, height } = completedCrop;
        
        // Use the smaller dimension to create a square
        const size = Math.min(width, height);
        
        // Center the square within the current crop area
        let newX = x + (width - size) / 2;
        let newY = y + (height - size) / 2;
        
        // Ensure the square crop is within display bounds
        newX = Math.max(0, Math.min(newX, displayWidth - size));
        newY = Math.max(0, Math.min(newY, displayHeight - size));
        
        // If the crop would be too small or off-screen, reset to center
        if (size < 50 || newX < 0 || newY < 0 || newX + size > displayWidth || newY + size > displayHeight) {
          const cropSize = Math.min(displayWidth, displayHeight) * 0.6;
          newX = (displayWidth - cropSize) / 2;
          newY = (displayHeight - cropSize) / 2;
          
          const newCrop: Crop = {
            unit: 'px',
            x: newX,
            y: newY,
            width: cropSize,
            height: cropSize,
          };
          
          setCrop(newCrop);
          setCompletedCrop({
            x: newX,
            y: newY,
            width: cropSize,
            height: cropSize,
          });
        } else {
          const newCrop: Crop = {
            unit: 'px',
            x: newX,
            y: newY,
            width: size,
            height: size,
          };
          
          setCrop(newCrop);
          setCompletedCrop({
            x: newX,
            y: newY,
            width: size,
            height: size,
          });
        }
      }
    }
  };

  const resetCrop = () => {
    if (imgRef.current) {
      const { width: displayWidth, height: displayHeight } = imgRef.current.getBoundingClientRect();
      
      if (squareMode) {
        // Square mode - use percentage for consistent visibility
        const cropSize = 60; // 60% of the image
        const centerX = (100 - cropSize) / 2; // 20%
        const centerY = (100 - cropSize) / 2; // 20%
        
        const newCrop: Crop = {
          unit: '%',
          x: centerX,
          y: centerY,
          width: cropSize,
          height: cropSize,
        };
        
        setCrop(newCrop);
        
        // Update completedCrop in pixel coordinates
        if (displayWidth > 0 && displayHeight > 0) {
          const pixelX = (centerX / 100) * displayWidth;
          const pixelY = (centerY / 100) * displayHeight;
          const pixelWidth = (cropSize / 100) * displayWidth;
          const pixelHeight = (cropSize / 100) * displayHeight;
          
          setCompletedCrop({
            x: pixelX,
            y: pixelY,
            width: pixelWidth,
            height: pixelHeight,
          });
        }
      } else {
        // Free form mode - use percentage for consistent visibility
        const newCrop: Crop = {
          unit: '%',
          x: 15,
          y: 15,
          width: 70,
          height: 60,
        };
        
        setCrop(newCrop);
        
        // Update completedCrop in pixel coordinates
        if (displayWidth > 0 && displayHeight > 0) {
          const pixelX = (15 / 100) * displayWidth;
          const pixelY = (15 / 100) * displayHeight;
          const pixelWidth = (70 / 100) * displayWidth;
          const pixelHeight = (60 / 100) * displayHeight;
          
          setCompletedCrop({
            x: pixelX,
            y: pixelY,
            width: pixelWidth,
            height: pixelHeight,
          });
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg shadow-2xl max-w-5xl max-h-[90vh] w-full mx-4 flex flex-col border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className={`text-xl font-semibold ${getThemedTextColor('primary')}`} style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>{title}</h2>
          <button
            onClick={onClose}
            className={`${getThemedTextColor('muted')} hover:${getThemedTextColor('primary')} p-1 rounded-full hover:bg-slate-700 transition-colors`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSquareModeToggle}
              className={`btn text-xs ${squareMode ? 'btn-primary' : 'btn-outline'}`}
            >
              <Square className="w-4 h-4" />
              Square Mode
            </button>
            
            <button
              onClick={() => setSquareMode(false)}
              className={`btn text-xs ${!squareMode ? 'btn-primary' : 'btn-outline'}`}
            >
              <Maximize2 className="w-4 h-4" />
              Free Form
            </button>

            <button 
              onClick={resetCrop}
              className="btn btn-outline text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Crop
            </button>
          </div>
        </div>

        {/* Image Area - ReactCrop component is here, background is inherited */}
        <div className="flex-grow p-4 overflow-hidden flex items-center justify-center bg-slate-850">
          {imageUrl ? (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={squareMode ? 1 : undefined}
              minWidth={50}
              minHeight={50}
              circularCrop={false}
              ruleOfThirds
              className="max-w-full max-h-full"
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imageUrl}
                onLoad={onImageLoad}
                className="max-w-full max-h-[60vh] object-contain select-none"
                style={{ imageRendering: 'pixelated' }}
              />
            </ReactCrop>
          ) : (
            <p className={getThemedTextColor('secondary')}>Loading image...</p>
          )}
        </div>

        {/* Footer with Actions */}
        <div className="flex items-center justify-between p-4 border-t border-slate-700 bg-slate-800">
          <div className="flex gap-3">
            {onSkip && (
              <button
                onClick={onSkip}
                className={`font-light transition-colors ${getThemedTextColor('secondary')} hover:${getThemedTextColor('primary')} text-sm py-2 px-3 rounded-md hover:bg-slate-700`}
                style={{fontFamily: "'Trebuchet MS', sans-serif"}}
              >
                Skip Cropping
              </button>
            )}
            {onDelete && (
              <button
                onClick={async () => {
                  setIsProcessing(true);
                  try {
                    await onDelete();
                  } catch (error) {
                    console.error('Error deleting screenshot:', error);
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                disabled={isProcessing}
                className="btn btn-danger text-sm"
              >
                {isProcessing && onDelete ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="btn btn-outline text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleCropConfirm}
              disabled={isProcessing || !completedCrop}
              className="btn btn-primary text-sm"
            >
              {isProcessing && !onDelete ? 'Processing...' : 'Confirm Crop'}
              {!isProcessing && <Check size={16} className="ml-1" />}
            </button>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageCropModal;