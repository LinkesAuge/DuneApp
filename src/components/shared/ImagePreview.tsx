// ImagePreview Component - Consistent image display for Shared Images System
// Handles both shared images and fallback text icons

import React, { useEffect, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { getImageDisplayInfo } from '../../lib/api/sharedImages';
import type { ImageDisplayInfo } from '../../types/sharedImages';

interface ImagePreviewProps {
  iconImageId?: string | null;
  iconFallback?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showLabel?: boolean;
}

const sizeClasses = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6', 
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const textSizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg', 
  xl: 'text-xl'
};

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  iconImageId,
  iconFallback,
  size = 'md',
  className = '',
  showLabel = false
}) => {
  const [displayInfo, setDisplayInfo] = useState<ImageDisplayInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadDisplayInfo = async () => {
      if (!iconImageId && !iconFallback) {
        setDisplayInfo(null);
        return;
      }

      setLoading(true);
      setError(false);

      try {
        const info = await getImageDisplayInfo(iconImageId, iconFallback);
        setDisplayInfo(info);
      } catch (err) {
        console.error('Error loading image display info:', err);
        setError(true);
        // Fallback to text icon
        setDisplayInfo({
          image_url: undefined,
          is_image: false,
          display_value: iconFallback || ''
        });
      } finally {
        setLoading(false);
      }
    };

    loadDisplayInfo();
  }, [iconImageId, iconFallback]);

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} ${className} animate-pulse rounded flex items-center justify-center`}>
        <ImageIcon className={`${sizeClasses[size]} text-slate-400`} />
      </div>
    );
  }

  if (!displayInfo || (!displayInfo.image_url && !displayInfo.display_value)) {
    return (
      <div className={`${sizeClasses[size]} ${className} rounded flex items-center justify-center`}>
        <ImageIcon className={`w-1/2 h-1/2 text-slate-400`} />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Image or Text Icon Display */}
      {displayInfo.is_image && displayInfo.image_url && !error ? (
        <img
          src={displayInfo.image_url}
          alt={displayInfo.display_value || 'Icon'}
          className={`${sizeClasses[size]} object-cover rounded`}
          crossOrigin="anonymous"
          onError={() => setError(true)}
          onLoad={() => setError(false)}
        />
      ) : (
        <div className={`${sizeClasses[size]} flex items-center justify-center rounded`}>
          {displayInfo.display_value ? (
            <span className={`${textSizeClasses[size]} text-slate-200 font-light`} style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
              {displayInfo.display_value}
            </span>
          ) : (
            <ImageIcon className={`w-1/2 h-1/2 text-slate-400`} />
          )}
        </div>
      )}

      {/* Optional Label */}
      {showLabel && displayInfo.display_value && (
        <span className={`${textSizeClasses[size]} text-slate-200 truncate font-light`} style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
          {displayInfo.display_value}
        </span>
      )}
    </div>
  );
}; 