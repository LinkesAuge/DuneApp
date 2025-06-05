import { PixelCrop } from 'react-image-crop';

/**
 * Determines if a crop represents a meaningful crop operation or if it's effectively a "full image"
 * @param cropDetails - The crop details from react-image-crop
 * @returns true if the image has been meaningfully cropped, false if it's effectively the full image
 */
export const isMeaningfullyCropped = (cropDetails: PixelCrop | null | undefined): boolean => {
  // If cropDetails is null or undefined, it's definitely not cropped
  if (!cropDetails) {
    return false;
  }

  // If any crop dimension is zero or negative, it's invalid/not cropped
  if (cropDetails.width <= 0 || cropDetails.height <= 0) {
    return false;
  }

  // If x and y are both 0, and width/height suggest it might be full image, need more sophisticated check
  // For now, we'll consider any crop with valid dimensions as "cropped"
  // The ImageCropModal should only pass meaningful crops when isFullImage=false
  return true;
};

/**
 * Gets the appropriate display label for a screenshot based on its crop status and newness
 * @param isNew - Whether this is a newly added screenshot
 * @param cropDetails - The crop details from react-image-crop
 * @returns The appropriate label string and CSS classes
 */
export const getScreenshotLabel = (isNew: boolean, cropDetails: PixelCrop | null | undefined) => {
  const isCropped = isMeaningfullyCropped(cropDetails);
  
  if (isNew && isCropped) {
    return {
      text: "New (Cropped)",
      className: "bg-green-600 text-white text-xs px-1 rounded"
    };
  }
  
  if (isNew && !isCropped) {
    return {
      text: "New (Full)",
      className: "bg-green-600 text-white text-xs px-1 rounded"
    };
  }
  
  if (!isNew && isCropped) {
    return {
      text: "Cropped", 
      className: "bg-blue-600 text-white text-xs px-1 rounded"
    };
  }
  
  // !isNew && !isCropped
  return {
    text: "Original",
    className: "bg-blue-600 text-white text-xs px-1 rounded"
  };
}; 