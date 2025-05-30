import React, { useState, useEffect } from 'react';
import { GridSquare } from '../../types';
import { X, ChevronLeft, ChevronRight, Clock, User, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDateWithPreposition } from '../../lib/dateUtils';

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
  [key: string]: { username: string; display_name?: string | null; custom_avatar_url?: string | null; discord_avatar_url?: string | null; use_discord_avatar?: boolean };
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
        ].filter((id): id is string => id !== null && id !== undefined && id !== ''))
      ];

      if (userIds.length === 0) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, display_name, custom_avatar_url, discord_avatar_url, use_discord_avatar')
          .in('id', userIds);

        if (error) throw error;

        const infoMap = data.reduce((acc, user) => {
          acc[user.id] = { 
            username: user.username, 
            display_name: user.display_name, 
            custom_avatar_url: user.custom_avatar_url, 
            discord_avatar_url: user.discord_avatar_url,
            use_discord_avatar: user.use_discord_avatar
          };
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

  // Format metadata for screenshot
  const screenshotMeta = uploader && currentSquare.upload_date 
    ? `Screenshot by ${uploader.username} ${(() => {
        const { date, useOn } = formatDateWithPreposition(currentSquare.upload_date);
        return useOn ? `on ${date}` : date;
      })()}`
    : null;

  // Format metadata for POI
  const poiMeta = poiInfo?.created_by && userInfo[poiInfo.created_by] 
    ? `POI created by ${userInfo[poiInfo.created_by].username} ${(() => {
        const { date, useOn } = formatDateWithPreposition(poiInfo.created_at);
        return useOn ? `on ${date}` : date;
      })()}`
    : null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-[60] p-4"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      style={{
        backgroundImage: `url('/images/main-bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Simple background overlay */}
      <div className="absolute inset-0 bg-slate-950/90" />

      <div 
        className="relative z-10 w-[98vw] h-[96vh] overflow-hidden flex flex-col rounded-xl"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.90) 50%, rgba(15, 23, 42, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(251, 191, 36, 0.3)'
        }}
      >
        {/* Header with clean styling */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-amber-400/30">
          <div>
            <h3 
              className="text-2xl font-light text-amber-200 tracking-wide"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
            >
              {poiInfo?.title || `Grid Square ${currentSquare.coordinate}`}
            </h3>
            {screenshotMeta && (
              <div className="flex items-center text-amber-300/70 text-sm mt-1 tracking-wide">
                <Clock size={14} className="mr-2 text-amber-400" />
                <span style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  {screenshotMeta}
                </span>
              </div>
            )}
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="group p-3 rounded-xl transition-all duration-300 text-amber-300 hover:text-amber-100 hover:bg-slate-800/50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Image container with clean styling */}
        <div className="relative flex-1 flex items-center justify-center p-8">
          {/* Navigation buttons with clean styling */}
          {squares.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="absolute left-6 z-30 group p-4 rounded-full transition-all duration-300 bg-slate-900/80 hover:bg-slate-800/90 border border-amber-400/30 hover:border-amber-400/60"
              >
                <ChevronLeft size={28} className="text-amber-300 group-hover:text-amber-100" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-6 z-30 group p-4 rounded-full transition-all duration-300 bg-slate-900/80 hover:bg-slate-800/90 border border-amber-400/30 hover:border-amber-400/60"
              >
                <ChevronRight size={28} className="text-amber-300 group-hover:text-amber-100" />
              </button>
            </>
          )}

          {/* Image with clean presentation */}
          <div className="relative z-20 max-h-[calc(96vh-20rem)] max-w-full">
            <img
              src={currentSquare.screenshot_url || ''}
              alt={`Screenshot ${currentIndex + 1} of ${squares.length}`}
              className="max-h-[calc(96vh-20rem)] max-w-full object-contain rounded-lg shadow-2xl"
              style={{
                border: '2px solid rgba(251, 191, 36, 0.2)'
              }}
            />
          </div>
        </div>

        {/* Footer with clean styling */}
        <div className="px-6 py-4 border-t border-amber-400/30">
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-2">
              {poiInfo && (
                <>
                  <p 
                    className="text-amber-200/90 leading-relaxed font-light tracking-wide"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                  >
                    {poiInfo.description || 'No description provided'}
                  </p>
                  {poiMeta && (
                    <div className="flex items-center text-sm text-amber-300/70 tracking-wide">
                      <User size={12} className="mr-2 text-amber-400" />
                      <span style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                        {poiMeta}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="ml-6 text-right space-y-1">
              <div 
                className="text-sm text-amber-300/80 font-light tracking-wide"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              >
                Screenshot {currentIndex + 1} of {squares.length}
              </div>
              {currentSquare.coordinate && (
                <div className="flex items-center text-xs text-amber-400/70 tracking-wider">
                  <MapPin size={10} className="mr-1 text-amber-400" />
                  <span style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    {currentSquare.coordinate}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GridGallery;