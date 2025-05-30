import React, { useState } from 'react';
import { MapPin, ChevronRight, LayoutGrid, List, SortAsc, SortDesc, ChevronDown } from 'lucide-react';
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
  userInfo: { [key: string]: { username: string; display_name?: string | null; custom_avatar_url?: string | null; discord_avatar_url?: string | null; use_discord_avatar?: boolean } };
  
  // Event handlers
  onPoiClick: (poi: Poi) => void;
  onPoiEdit?: (poi: Poi) => void;
  onPoiDelete?: (poiId: string) => void;
  onPoiShare?: (poi: Poi) => void;
  onPoiImageClick?: (poi: Poi) => void;
  
  // Customization
  emptyStateMessage?: string;
  emptyStateSubtitle?: string;
  className?: string;
}

type ViewMode = 'grid' | 'list';
type SortOrder = 'asc' | 'desc';
type SortBy = 'created_at' | 'title' | 'poi_type';

const POIPanel: React.FC<POIPanelProps> = ({
  showPanel,
  onTogglePanel,
  title,
  pois,
  poiTypes,
  customIcons,
  userInfo,
  onPoiClick,
  onPoiEdit,
  onPoiDelete,
  onPoiShare,
  onPoiImageClick,
  emptyStateMessage = "No POIs found",
  emptyStateSubtitle = "No additional information"
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc'); // Default desc for newest first
  const [sortBy, setSortBy] = useState<SortBy>('created_at'); // Default to date created
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Sort POIs based on current sort criteria
  const sortedPois = [...pois].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'poi_type':
        const aType = poiTypes.find(type => type.id === a.poi_type_id)?.name || '';
        const bType = poiTypes.find(type => type.id === b.poi_type_id)?.name || '';
        comparison = aType.localeCompare(bType);
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const sortOptions = [
    { value: 'created_at', label: 'Date Created' },
    { value: 'title', label: 'Title' },
    { value: 'poi_type', label: 'POI Type' }
  ];

  return (
    <>
      <div className={`${showPanel ? 'w-[30rem]' : 'w-0'} relative flex flex-col transition-all duration-200 overflow-hidden`}>
        {/* Background matching map controls */}
        <div className="absolute inset-0 bg-slate-900" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col h-full backdrop-blur-sm border-l border-amber-400/30">
          {/* Panel Header */}
          <div className="p-4 border-b border-amber-400/20 flex items-center justify-between">
            {showPanel && (
              <h2 className="text-lg font-light text-amber-200 tracking-wide" 
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                Points of Interest
              </h2>
            )}
            <button
              onClick={onTogglePanel}
              className="text-amber-300/70 hover:text-amber-200 transition-all duration-300 hover:scale-110"
              title={showPanel ? "Collapse panel" : "Expand panel"}
            >
              {showPanel ? '✕' : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>

          {showPanel && (
            <>
              {/* View Controls - Enhanced with Sort Dropdown */}
              <div className="flex items-center justify-between p-4 border-b border-amber-400/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-300/70 font-light">
                    {pois.length} POI{pois.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Sort Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSortDropdown(!showSortDropdown)}
                      className="p-2 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-amber-300 border border-slate-700 transition-colors duration-150 flex items-center gap-1 text-xs"
                      title="Sort by"
                    >
                      <span>{sortOptions.find(opt => opt.value === sortBy)?.label}</span>
                      <ChevronDown size={14} />
                    </button>
                    
                    {showSortDropdown && (
                      <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 min-w-[120px]">
                        {sortOptions.map(option => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value as SortBy);
                              setShowSortDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                              sortBy === option.value 
                                ? 'bg-slate-700 text-amber-300' 
                                : 'text-slate-300 hover:bg-slate-700 hover:text-amber-200'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sort Order Toggle - Matching POI Page */}
                  <button 
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="p-2 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-amber-300 border border-slate-700 transition-colors duration-150"
                    title={`Sort direction: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
                  >
                    {sortOrder === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
                  </button>

                  {/* Display Mode Toggle - Matching POI Page */}
                  <div className="flex border border-slate-700">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 transition-colors duration-150 ${
                        viewMode === 'grid' 
                          ? 'bg-slate-700 text-amber-300' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-200'
                      }`}
                      title="Grid View"
                    >
                      <LayoutGrid size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 transition-colors duration-150 ${
                        viewMode === 'list' 
                          ? 'bg-slate-700 text-amber-300' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-200'
                      }`}
                      title="List View"
                    >
                      <List size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* POI Content */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-slate-800/80 scrollbar-thumb-amber-500/80 hover:scrollbar-thumb-amber-400 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
                {sortedPois.length === 0 ? (
                  <div className="p-6 text-center">
                    <MapPin className="w-12 h-12 text-amber-400/60 mx-auto mb-4" />
                    <p className="text-amber-200/80 font-medium mb-2">{emptyStateMessage}</p>
                    <p className="text-amber-300/60 text-sm">{emptyStateSubtitle}</p>
                  </div>
                ) : (
                  <div className={
                    viewMode === 'grid' 
                      ? "grid grid-cols-1 gap-3 p-4" 
                      : "space-y-3 p-4"
                  }>
                    {sortedPois.map((poi) => (
                      <POIPreviewCard
                        key={poi.id}
                        poi={poi}
                        poiTypes={poiTypes}
                        customIcons={customIcons}
                        userInfo={userInfo}
                        layout={viewMode}
                        onClick={() => onPoiClick(poi)}
                        onEdit={onPoiEdit ? () => onPoiEdit(poi) : undefined}
                        onDelete={onPoiDelete ? () => onPoiDelete(poi.id) : undefined}
                        onShare={onPoiShare ? () => onPoiShare(poi) : undefined}
                        onImageClick={onPoiImageClick ? () => onPoiImageClick(poi) : undefined}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Close dropdown when clicking outside */}
              {showSortDropdown && (
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowSortDropdown(false)}
                />
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Floating Toggle Button when Panel is Closed */}
      {!showPanel && (
        <button
          onClick={onTogglePanel}
          className="fixed top-1/2 right-4 transform -translate-y-1/2 z-50 text-amber-300/70 hover:text-amber-200 transition-all duration-300 hover:scale-110 bg-slate-900/60 backdrop-blur-sm border border-amber-400/30 rounded-lg p-2"
          title="Expand panel"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </>
  );
};

export default POIPanel; 