import React, { useState } from 'react';
import { Upload, FileImage, CheckCircle, AlertCircle } from 'lucide-react';
import { 
  convertToWebP, 
  createWebPFile, 
  isConvertibleImage, 
  formatConversionStats,
  supportsWebP 
} from '../../lib/imageUtils';

interface WebPConverterProps {
  onFileConverted?: (file: File, stats: string) => void;
  quality?: 'high' | 'standard' | 'compressed' | 'icon';
  maxWidth?: number;
  maxHeight?: number;
  className?: string;
}

const WebPConverter: React.FC<WebPConverterProps> = ({
  onFileConverted,
  quality = 'standard',
  maxWidth,
  maxHeight,
  className = ''
}) => {
  const [isConverting, setIsConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [webPSupported, setWebPSupported] = useState<boolean | null>(null);

  // Check WebP support on component mount
  React.useEffect(() => {
    supportsWebP().then(setWebPSupported);
  }, []);

  const handleFileSelect = async (file: File) => {
    if (!isConvertibleImage(file)) {
      setError('Please select a valid image file (JPEG, PNG, BMP, or GIF)');
      return;
    }

    if (file.type === 'image/webp') {
      setError('File is already in WebP format');
      return;
    }

    if (!webPSupported) {
      setError('WebP conversion is not supported in your browser');
      return;
    }

    setIsConverting(true);
    setError(null);
    setConversionResult(null);

    try {
      const qualitySettings = {
        high: { quality: 0.9 },
        standard: { quality: 0.85 },
        compressed: { quality: 0.75 },
        icon: { quality: 0.8 }
      };

      const result = await convertToWebP(file, {
        ...qualitySettings[quality],
        maxWidth,
        maxHeight
      });

      const webpFile = createWebPFile(result.blob, file.name);
      const stats = formatConversionStats(result);
      
      setConversionResult(stats);
      onFileConverted?.(webpFile, stats);

    } catch (err: any) {
      setError(err.message || 'Conversion failed');
    } finally {
      setIsConverting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className={`bg-slate-800 rounded-lg border border-slate-600 ${className}`}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileImage className="text-blue-400" size={20} />
          <h3 className="text-slate-200 font-medium">WebP Converter</h3>
          {webPSupported === false && (
            <AlertCircle className="text-red-400" size={16} />
          )}
        </div>

        {webPSupported === false ? (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm">
              WebP conversion is not supported in your browser. Please use a modern browser.
            </p>
          </div>
        ) : (
          <>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors
                ${isConverting 
                  ? 'border-blue-400 bg-blue-400/10' 
                  : 'border-slate-500 bg-slate-700/50 hover:border-slate-400 hover:bg-slate-700/70'
                } cursor-pointer`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById('webp-file-input')?.click()}
            >
              <input
                id="webp-file-input"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/bmp,image/gif"
                onChange={handleFileInput}
                className="hidden"
              />
              
              {isConverting ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                  <p className="text-blue-400 text-sm">Converting to WebP...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className="text-slate-400" size={32} />
                  <div>
                    <p className="text-slate-300 text-sm font-medium">
                      Drop an image here or click to select
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      Supports JPEG, PNG, BMP, GIF → WebP conversion
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Settings Display */}
            <div className="mt-3 text-xs text-slate-400 space-y-1">
              <div>Quality: <span className="text-slate-300">{quality}</span></div>
              {maxWidth && <div>Max Width: <span className="text-slate-300">{maxWidth}px</span></div>}
              {maxHeight && <div>Max Height: <span className="text-slate-300">{maxHeight}px</span></div>}
            </div>

            {/* Results */}
            {conversionResult && (
              <div className="mt-4 bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-400" size={16} />
                  <p className="text-green-400 text-sm font-medium">Conversion Successful!</p>
                </div>
                <p className="text-green-300 text-xs mt-1">{conversionResult}</p>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-red-400" size={16} />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WebPConverter; 