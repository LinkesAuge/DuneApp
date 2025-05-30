import React from 'react';
import { MapPin, ChevronLeft } from 'lucide-react';
import { Poi, PoiType, CustomIcon } from '../../types';
import POIPreviewCard from './POIPreviewCard';

interface POIPanelProps {
  // Panel state
  showPanel: boolean;
  onTogglePanel: () => void;
  
  // Content
  title: string;
  pois: Poi[];
  poiTypes: PoiType[];
  customIcons: CustomIcon[];
  userInfo: { [key: string]: { username: string } };
  
  // Event handlers
  onPoiClick: (poi: Poi) => void;
  
  // Customization
  emptyStateMessage?: string;
  emptyStateSubtitle?: string;
  className?: string;
  
  // Styling mode
  mode?: 'grid' | 'map';
}

const POIPanel: React.FC<POIPanelProps> = ({
  showPanel,
  onTogglePanel,
  title,
  pois,
  poiTypes,
  customIcons,
  userInfo,
  onPoiClick,
  emptyStateMessage = "No POIs found",
  emptyStateSubtitle = "Add POIs to see them here",
  className = '',
  mode = 'grid'
}) => {
  const titleClass = mode === 'grid' ? 'text-yellow-300' : 'text-yellow-300';

  return (
    <div className={`${showPanel ? 'w-[450px]' : 'w-12'} bg-slate-900/95 backdrop-blur-sm border-l border-slate-700/50 flex flex-col transition-all duration-200 ${className}`}>
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
        <button
          onClick={onTogglePanel}
          className="text-amber-300/70 hover:text-amber-200 transition-colors"
          title={showPanel ? "Collapse panel" : "Expand panel"}
        >
          {showPanel ? '✕' : <ChevronLeft className="w-5 h-5" />}
        </button>
        {showPanel && (
          <h2 className="text-lg font-semibold text-yellow-300" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            POIs & Info
          </h2>
        )}
      </div>
      
      {showPanel && (
        <div className="flex-1 overflow-hidden">
          <div className="p-4 space-y-4">
            <h4 className={`text-md font-semibold ${titleClass}`} style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              {title} ({pois.length})
            </h4>
            
            {pois.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-amber-400/70 mx-auto mb-4" />
                <p className="text-amber-200 mb-2">{emptyStateMessage}</p>
                <p className="text-amber-300/70 text-sm">{emptyStateSubtitle}</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-full overflow-y-auto">
                {pois.map(poi => {
                  const poiType = poiTypes.find(type => type.id === poi.poi_type_id);
                  if (!poiType) return null;

                  return (
                    <POIPreviewCard
                      key={poi.id}
                      poi={poi}
                      poiType={poiType}
                      customIcons={customIcons}
                      userInfo={userInfo}
                      layout="grid"
                      onClick={() => onPoiClick(poi)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default POIPanel; 