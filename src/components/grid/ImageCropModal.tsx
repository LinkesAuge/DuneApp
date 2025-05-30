import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from 'react-image-crop';
import { X, Square, Maximize2, RotateCcw, Check, Download, Minimize2, Trash2 } from 'lucide-react';
import 'react-image-crop/dist/ReactCrop.css';

// Utility function to get the cropped image Blob
// It's important that the crop parameter accurately reflects the desired output dimensions
// and the source rectangle from the original image.
const getCroppedImg = (
  image: HTMLImageElement,
  crop: PixelCrop,
  fileName: string
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to get 2d context'));
      return;
    }

    // Set canvas dimensions to the exact dimensions of the crop area
    canvas.width = crop.width;
    canvas.height = crop.height;

    // Draw the cropped portion of the image onto the canvas.
    // The crop.x, crop.y, crop.width, crop.height define the source rectangle
    // from the original image. We draw this into a canvas of size crop.width, crop.height
    // at destination (0,0) on the canvas.
    ctx.drawImage(
      image,
      crop.x, // Source X from original image
      crop.y, // Source Y from original image
      crop.width, // Source Width from original image
      crop.height, // Source Height from original image
      0, // Destination X on canvas
      0, // Destination Y on canvas
      crop.width, // Destination Width on canvas
      crop.height // Destination Height on canvas
    );

    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      // Optionally, you could add blob.name = fileName here if needed by consumers
      // but typically file name is handled when constructing the File object later.
      resolve(blob);
    }, 'image/jpeg');
  });
};

// Helper for consistent theming of text based on background (can be imported from a shared util if used in many places)
const getThemedTextColor = (variant: 'primary' | 'secondary' | 'muted') => {
  if (variant === 'primary') return 'text-amber-200';
  if (variant === 'secondary') return 'text-slate-300';
  return 'text-slate-400';
};

interface ImageCropModalProps {
  imageUrl: string;
  onCropComplete: (croppedImageBlob: Blob, cropData: PixelCrop, isFullImage: boolean) => Promise<void>;
  onClose: () => void;
  onDelete?: () => Promise<void>;
  title?: string;
  defaultToSquare?: boolean;
  initialCrop?: PixelCrop;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({
  imageUrl,
  onCropComplete,
  onClose: parentOnClose,
  onDelete,
  title = "Image Editing",
  initialCrop,
  defaultToSquare = false
}) => {
  const [crop, setCrop] = useState<Crop | undefined>(undefined);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [aspect, setAspect] = useState<number | undefined | null>(
    defaultToSquare ? 1 / 1 : null  // null = no tool active, undefined = free form, 1/1 = square
  );
  const [isFullImageRequestedByUser, setIsFullImageRequestedByUser] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const cropperRef = useRef<ReactCrop | null>(null);

  const handleInternalOnClose = () => {
    setIsFullImageRequestedByUser(false);
    parentOnClose();
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsImageLoaded(true);
    const img = e.currentTarget;
    const { width: mediaWidth, height: mediaHeight } = img;

    if (initialCrop) {
      setCrop(initialCrop);
      setCompletedCrop(initialCrop);
      
      if (defaultToSquare) {
        setAspect(1 / 1);
      } else {
        const isInitialCropSquare = initialCrop.width && initialCrop.height && initialCrop.width === initialCrop.height;
        setAspect(isInitialCropSquare ? 1 / 1 : undefined);
      }
    } else if (defaultToSquare) {
      const newCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          1 / 1,
          mediaWidth,
          mediaHeight
        ),
        mediaWidth,
        mediaHeight
      );
      setCrop(newCrop);
      setAspect(1 / 1);
    } else {
      // No tool should be preselected - keep aspect as null
      setCrop(undefined);
      setAspect(null);
    }
  }, [initialCrop, defaultToSquare]);

  useEffect(() => {
    setIsImageLoaded(false);
    setCrop(undefined);
    setCompletedCrop(undefined);
  }, [imageUrl]);

  const activateSquareMode = () => {
    setIsFullImageRequestedByUser(false);
    setAspect(1 / 1);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      const newCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: crop?.width && crop.unit === '%' ? crop.width : 90,
          },
          1 / 1,
          width,
          height
        ),
        width,
        height
      );
      setCrop(newCrop);
      if (newCrop.width > 0 && newCrop.height > 0) {
        setCompletedCrop({
          x: Math.round((width * newCrop.x) / 100),
          y: Math.round((height * newCrop.y) / 100),
          width: Math.round((width * newCrop.width) / 100),
          height: Math.round((height * newCrop.height) / 100),
          unit: 'px',
        });
      } else {
        setCompletedCrop(undefined);
      }
    }
  };

  const activateFreeFormMode = () => {
    setIsFullImageRequestedByUser(false);
    setAspect(undefined);
  };

  const handleConfirmCrop = async () => {
    console.log('[ImageCropModal] handleConfirmCrop started.');
    console.log('[ImageCropModal] Initial completedCrop:', JSON.parse(JSON.stringify(completedCrop || {})));
    console.log('[ImageCropModal] Initial isFullImageRequestedByUser:', isFullImageRequestedByUser);

    let finalPixelCrop: PixelCrop | undefined;
    let isFullImageUpload = false;

    if (!imgRef.current) {
      setError("Image reference is not available. Cannot process crop.");
      console.error("[ImageCropModal] imgRef.current is null.");
      return;
    }
    const { naturalWidth, naturalHeight } = imgRef.current;
    console.log(`[ImageCropModal] imgRef.current dimensions: naturalW=${naturalWidth}, naturalH=${naturalHeight}, displayW=${imgRef.current.width}, displayH=${imgRef.current.height}`);

    if (isFullImageRequestedByUser) {
      console.log('[ImageCropModal] Prioritizing full image due to isFullImageRequestedByUser=true.');
      finalPixelCrop = { unit: 'px', x: 0, y: 0, width: naturalWidth, height: naturalHeight };
      isFullImageUpload = true;
    } else if (!completedCrop || completedCrop.width === 0 || completedCrop.height === 0) {
      console.log('[ImageCropModal] No valid user-defined completedCrop, defaulting to full natural image.');
      finalPixelCrop = { unit: 'px', x: 0, y: 0, width: naturalWidth, height: naturalHeight };
      setCrop({ unit: '%', x: 0, y: 0, width: 100, height: 100 });
      isFullImageUpload = true;
    } else {
      console.log('[ImageCropModal] Using user-defined completedCrop.');
      finalPixelCrop = completedCrop;
      if (
        finalPixelCrop.x === 0 &&
        finalPixelCrop.y === 0 &&
        finalPixelCrop.width === naturalWidth &&
        finalPixelCrop.height === naturalHeight
      ) {
        console.log('[ImageCropModal] User-defined completedCrop IS the full natural image.');
        isFullImageUpload = true;
      } else {
        console.log('[ImageCropModal] User-defined completedCrop is a partial crop.');
        isFullImageUpload = false;
      }
    }

    console.log('[ImageCropModal] Determined finalPixelCrop (before potential scaling):', JSON.parse(JSON.stringify(finalPixelCrop || {})));
    console.log('[ImageCropModal] Determined isFullImageUpload:', isFullImageUpload);

    if (!finalPixelCrop || finalPixelCrop.width === 0 || finalPixelCrop.height === 0) {
       setError("Cannot confirm with an empty or invalid crop area. This shouldn't happen after defaulting logic.");
       console.error('[ImageCropModal] finalPixelCrop is STILL invalid before processing. Logic error somewhere!');
       return;
    }

    let cropForProcessing: PixelCrop = { ...finalPixelCrop };

    if (!isFullImageUpload && imgRef.current) {
      const { naturalWidth, naturalHeight, width: displayWidth, height: displayHeight } = imgRef.current;
      
      if (displayWidth > 0 && displayHeight > 0) {
        console.log('[ImageCropModal] Scaling partial crop coordinates from display to natural.');
        console.log('[ImageCropModal] Before scaling: x=${cropForProcessing.x}, y=${cropForProcessing.y}, w=${cropForProcessing.width}, h=${cropForProcessing.height}');
        
        cropForProcessing.x = (cropForProcessing.x / displayWidth) * naturalWidth;
        cropForProcessing.y = (cropForProcessing.y / displayHeight) * naturalHeight;
        cropForProcessing.width = (cropForProcessing.width / displayWidth) * naturalWidth;
        cropForProcessing.height = (cropForProcessing.height / displayHeight) * naturalHeight;

        cropForProcessing.x = Math.round(cropForProcessing.x);
        cropForProcessing.y = Math.round(cropForProcessing.y);
        cropForProcessing.width = Math.round(cropForProcessing.width);
        cropForProcessing.height = Math.round(cropForProcessing.height);

        console.log('[ImageCropModal] After scaling: x=${cropForProcessing.x}, y=${cropForProcessing.y}, w=${cropForProcessing.width}, h=${cropForProcessing.height}');
      } else {
        console.warn('[ImageCropModal] Display dimensions are zero, cannot scale crop. Using unscaled crop data.');
      }
    }

    setIsProcessing(true);
    setError(null);
    try {
      const croppedBlob = await getCroppedImg(imgRef.current!, cropForProcessing, 'cropped-image.jpeg');
      
      await onCropComplete(croppedBlob, finalPixelCrop, isFullImageUpload);
      handleInternalOnClose(); 
    } catch (e: any) {
      console.error("Cropping failed in ImageCropModal. Details:", e);
      if (e && typeof e === 'object' && 'message' in e) {
        console.error("Error message:", e.message);
        console.error("Error name:", e.name);
        console.error("Error stack:", e.stack);
      }
      setError("Failed to crop image. Please try again.");
    } finally {
      setIsProcessing(false);
      setIsFullImageRequestedByUser(false);
    }
  };

  const handleResetCrop = () => {
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      if (aspect === 1/1) {
         const newCrop = centerCrop(
          makeAspectCrop(
            {
              unit: '%',
              width: 90,
            },
            1/1,
            width,
            height
          ),
          width,
          height
        );
        setCrop(newCrop);
        setCompletedCrop({
            x: (width * newCrop.x) / 100,
            y: (height * newCrop.y) / 100,
            width: (width * newCrop.width) / 100,
            height: (height * newCrop.height) / 100,
            unit: 'px',
        });
      } else {
        setCrop(undefined);
        setCompletedCrop(undefined);
      }
    }
  };

  const handleUseFullImage = () => {
    if (imgRef.current) {
      setIsFullImageRequestedByUser(true);
      const { naturalWidth, naturalHeight } = imgRef.current;
      const fullCrop: Crop = {
        unit: '%',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      };
      setCrop(fullCrop);
      setCompletedCrop({
        unit: 'px',
        x: 0,
        y: 0,
        width: naturalWidth,
        height: naturalHeight,
      });
    }
  };
  
  return createPortal(
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg shadow-2xl max-w-5xl max-h-[90vh] w-full mx-4 flex flex-col border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className={`text-xl font-semibold ${getThemedTextColor('primary')}`}>{title}</h2>
          <button
            onClick={handleInternalOnClose}
            className={`${getThemedTextColor('muted')} hover:${getThemedTextColor('primary')} p-1 rounded-full hover:bg-slate-700 transition-colors`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-900/30 border-b border-red-700">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={handleUseFullImage}
              className="btn text-xs btn-outline"
            >
              <Maximize2 className="w-4 h-4 mr-1" />
              Use Full Image
            </button>
            <button
              onClick={activateSquareMode} 
              className={`btn text-xs ${aspect === 1/1 ? 'btn-primary' : 'btn-outline'}`}
            >
              <Square className="w-4 h-4 mr-1" />
              Square Mode
            </button>
            <button
              onClick={activateFreeFormMode} 
              className={`btn text-xs ${aspect === undefined ? 'btn-primary' : 'btn-outline'}`}
            >
              <Minimize2 className="w-4 h-4 mr-1" />
              Free Form
            </button>
            <button
              onClick={handleResetCrop}
              className="btn text-xs btn-outline"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset Crop
            </button>
          </div>
        </div>

        {/* Image Area */}
        <div className="flex-grow p-4 overflow-hidden flex items-center justify-center bg-slate-850">
          {imageUrl ? (
            <ReactCrop
              ref={cropperRef}
              crop={crop}
              onChange={(_, percentCrop) => {
                setIsFullImageRequestedByUser(false);
                setCrop(percentCrop);
              }}
              onComplete={(c) => {
                setCompletedCrop(c);
              }}
              aspect={aspect === null ? undefined : aspect}
              minWidth={50}
              minHeight={50}
              circularCrop={false}
              ruleOfThirds
              className="max-w-full max-h-full"
              disabled={isProcessing}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imageUrl}
                onLoad={onImageLoad}
                crossOrigin="anonymous"
                className="max-w-full max-h-full object-contain select-none"
                style={{ imageRendering: 'pixelated' }}
              />
            </ReactCrop>
          ) : (
            <p className={getThemedTextColor('secondary')}>Loading image...</p>
          )}
        </div>

        {/* Footer with Actions */}
        <div className="flex items-center justify-between p-4 border-t border-slate-700 bg-slate-800">
          <div className="flex gap-3 items-center">
            {onDelete && (
              <button
                onClick={async () => {
                  if (!confirm("Are you sure you want to delete this image? This action cannot be undone.")) return;
                  setIsProcessing(true);
                  try {
                    await onDelete();
                  } catch (deleteError: any) {
                    console.error('Error deleting image:', deleteError);
                    setError(deleteError.message || "Failed to delete image.");
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                disabled={isProcessing}
                className="btn btn-danger text-sm"
              >
                {isProcessing ? 'Deleting...' : <><Trash2 size={16} className="mr-1" /> Delete Image</>}
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleInternalOnClose}
              className="btn btn-outline text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmCrop}
              disabled={isProcessing || !imgRef.current || !isImageLoaded}
              className="btn btn-primary text-sm"
            >
              {isProcessing ? (
                <>
                  <span className="loading loading-spinner loading-xs mr-2"></span>
                  Processing...
                </>
              ) : (
                <>
                  <Check size={16} className="mr-1" /> Confirm
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImageCropModal;