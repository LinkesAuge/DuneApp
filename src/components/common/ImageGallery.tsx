import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
  title?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  initialIndex, 
  onClose, 
  title = "Image Gallery" 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-night-950/90 flex items-center justify-center z-[70] p-2"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div 
        className="bg-sand-200 rounded-xl shadow-2xl w-[98vw] h-[96vh] overflow-hidden flex flex-col border border-night-700"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-night-700 bg-night-900">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-sand-400 hover:text-white p-2 rounded-full hover:bg-night-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Image container */}
        <div className="relative flex-1 flex items-center justify-center p-8 bg-sand-200">
          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="absolute left-4 bg-night-900 hover:bg-night-700 rounded-full p-3 text-white transition-all z-10"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 bg-night-900 hover:bg-night-700 rounded-full p-3 text-white transition-all z-10"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Image */}
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1} of ${images.length}`}
            className="max-h-[calc(96vh-12rem)] max-w-full object-contain"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-night-700 bg-night-900">
          <div className="flex justify-center items-center">
            <div className="text-sm text-sand-300">
              Image {currentIndex + 1} of {images.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGallery; 