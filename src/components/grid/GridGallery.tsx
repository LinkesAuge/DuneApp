import React, { useState, useEffect } from 'react';
import { GridSquare } from '../../types';
import { X, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface GridGalleryProps {
  squares: GridSquare[];
  initialIndex: number;
  onClose: () => void;
  poiInfo?: {
    title: string;
    description: string | null;
    created_at: string;
    created_by: string;
  };
}

interface UserInfo {
  [key: string]: { username: string };
}

const GridGallery: React.FC<GridGalleryProps> = ({ squares, initialIndex, onClose, poiInfo }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [userInfo, setUserInfo] = useState<UserInfo>({});

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userIds = [
        ...new Set([
          ...squares.map(square => square.uploaded_by),
          poiInfo?.created_by,
        ].filter((id): id is string => id !== null))
      ];

      if (userIds.length === 0) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        if (error) throw error;

        const infoMap = data.reduce((acc, user) => {
          acc[user.id] = { username: user.username };
          return acc;
        }, {} as UserInfo);

        setUserInfo(infoMap);
      } catch (err) {
        console.error('Error fetching user info:', err);
      }
    };

    fetchUserInfo();
  }, [squares, poiInfo]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : squares.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < squares.length - 1 ? prev + 1 : 0));
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

  const currentSquare = squares[currentIndex];
  const uploader = currentSquare.uploaded_by ? userInfo[currentSquare.uploaded_by] : null;

  return (
    <div 
      className="fixed inset-0 bg-night-950/90 flex items-center justify-center z-[60] p-2"
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
          <div>
            <h3 className="text-2xl font-bold text-white">
              {poiInfo?.title || `Grid Square ${currentSquare.coordinate}`}
            </h3>
            {uploader && currentSquare.upload_date && (
              <div className="flex items-center text-sand-300 text-sm mt-1">
                <Clock size={14} className="mr-1.5" />
                <span>
                  Screenshot by {uploader.username} on {new Date(currentSquare.upload_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            className="absolute left-4 bg-night-900 hover:bg-night-700 rounded-full p-3 text-white transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 bg-night-900 hover:bg-night-700 rounded-full p-3 text-white transition-all"
          >
            <ChevronRight size={24} />
          </button>

          {/* Image */}
          <img
            src={currentSquare.screenshot_url || ''}
            alt={`Screenshot ${currentIndex + 1} of ${squares.length}`}
            className="max-h-[calc(96vh-16rem)] max-w-full object-contain"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-night-700 bg-night-900">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {poiInfo && (
                <>
                  <p className="text-sand-300 mb-2">
                    {poiInfo.description || 'No description provided'}
                  </p>
                  {poiInfo.created_by && userInfo[poiInfo.created_by] && (
                    <div className="flex items-center text-sm text-sand-400">
                      <Clock size={12} className="mr-1.5" />
                      <span>
                        POI added by {userInfo[poiInfo.created_by].username} on {new Date(poiInfo.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="text-sm text-sand-300 ml-4">
              Screenshot {currentIndex + 1} of {squares.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GridGallery;