import React, { useState, Suspense } from 'react';
import { Map, Eye, CheckSquare, Square, Lock, Users } from 'lucide-react';
import UserAvatar from '../../common/UserAvatar';
import PaginationControls from '../../shared/PaginationControls';
import ViewModeSelector, { ViewMode } from '../components/ViewModeSelector';

// Lazy load the map view component
const POIMapView = React.lazy(() => import('../components/POIMapView'));

interface POIsPanelProps {
  onTogglePanel: () => void;
  filterState: any; // Will be properly typed when we import the hook
  onViewModeChange?: (mode: ViewMode) => void; // New prop for parent notification
}

const POIsPanel: React.FC<POIsPanelProps> = ({ onTogglePanel, filterState, onViewModeChange }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Handle view mode changes and notify parent
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    onViewModeChange?.(mode);
  };
  
  const {
    pois,
    poiTypes,
    filterCounts,
    selectedPOIIds,
    togglePOISelection,
    clearAllSelections,
    loading,
    pagination,
    changePage,
    changeItemsPerPage
  } = filterState;

  // Bulk selection handlers
  const selectAllFiltered = () => {
    pois.forEach((poi: any) => {
      if (!selectedPOIIds.has(poi.id)) {
        togglePOISelection(poi.id);
      }
    });
  };

  const clearPOISelection = () => {
    selectedPOIIds.forEach((poiId: string) => {
      togglePOISelection(poiId);
    });
  };

  // Helper function to check if an icon is a URL
  const isIconUrl = (icon: string): boolean => {
    return icon.startsWith('http') || icon.startsWith('/') || icon.includes('.');
  };

  // Helper function to get display image URL
  const getDisplayImageUrl = (icon: string): string => {
    if (isIconUrl(icon)) {
      return icon;
    }
    return icon; // Return emoji as-is
  };

  // Get POI type info for display - using actual POI types from data
  const getPOITypeInfo = (poi: any) => {
    const poiType = poiTypes.find((type: any) => type.id === poi.poi_type_id);
    if (!poiType) return { icon: '📍', color: poiType?.color || '#64748b', name: 'Unknown' };
    
    return { 
      icon: poiType.icon || '📍', 
      color: poiType.color || '#64748b',
      name: poiType.name || 'Unknown',
      category: poiType.category || 'Unknown'
    };
  };

  // Get privacy level info - using EXACT same icons as MapControlPanel
  const getPrivacyInfo = (privacyLevel: string) => {
    const privacyMap: { [key: string]: { icon: React.ReactNode; color: string } } = {
      'global': { icon: <Eye className="w-3 h-3 text-green-400" />, color: 'text-green-400' },
      'private': { icon: <Lock className="w-3 h-3 text-red-400" />, color: 'text-red-400' },
      'shared': { icon: <Users className="w-3 h-3 text-blue-400" />, color: 'text-blue-400' }
    };
    
    return privacyMap[privacyLevel] || { icon: <Eye className="w-3 h-3 text-slate-400" />, color: 'text-slate-400' };
  };

  // Render individual POI card
  const POICard: React.FC<{ poi: any }> = ({ poi }) => {
    const isSelected = selectedPOIIds.has(poi.id);
    const typeInfo = getPOITypeInfo(poi);
    const privacyInfo = getPrivacyInfo(poi.privacy_level);

    return (
      <div 
        className={`poi-card rounded-lg p-3 cursor-pointer transition-all duration-200 ${
          isSelected ? 'selected border-green-500 bg-green-900/20' : 'border-slate-600 hover:border-amber-400'
        }`}
        onClick={() => togglePOISelection(poi.id)}
      >
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => togglePOISelection(poi.id)}
            className="mt-1 rounded text-green-500"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              {/* POI Type Icon - use actual type icon */}
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                {isIconUrl(typeInfo.icon) ? (
                  <img 
                    src={getDisplayImageUrl(typeInfo.icon)} 
                    alt={typeInfo.name}
                    className="w-4 h-4 object-contain"
                  />
                ) : (
                  <span 
                    className="text-sm leading-none"
                    style={{ color: typeInfo.color }}
                  >
                    {typeInfo.icon}
                  </span>
                )}
              </div>
              <h5 className="font-medium text-amber-200 truncate flex-1">{String(poi.title || '')}</h5>
              {/* Privacy Icon - exact same as MapControlPanel */}
              <span className={privacyInfo.color}>{privacyInfo.icon}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              {String(poi.description || 'No description available')}
            </p>
            {/* POI Details - matching format from other POI components */}
            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
              <div className="flex items-center space-x-3">
                <span>{String(poi.map_type) === 'hagga_basin' ? '🏔️ Hagga Basin' : '🏜️ Deep Desert'}</span>
                <span>{typeInfo.category}</span>
                <span>{typeInfo.name}</span>
              </div>
              {poi.link_count && (
                <span className="text-amber-400">🔗 {poi.link_count}</span>
              )}
            </div>
            {/* Creator info with proper avatar */}
            {poi.profiles && (
              <div className="flex items-center space-x-2 mt-2">
                <UserAvatar 
                  user={{
                    username: poi.profiles.username,
                    display_name: poi.profiles.display_name,
                    custom_avatar_url: poi.profiles.custom_avatar_url,
                    discord_avatar_url: poi.profiles.discord_avatar_url,
                    use_discord_avatar: poi.profiles.use_discord_avatar
                  }}
                  size="xs"
                  className="flex-shrink-0"
                />
                <span className="text-xs text-slate-500">
                  by {String(poi.profiles.display_name || poi.profiles.username || '')}
                </span>
                <span className="text-xs text-slate-600">
                  {new Date(poi.created_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 dune-panel border-r overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-amber-200 flex items-center">
              <Map size={16} className="mr-2" />
              POIs
              <span className="ml-2 text-sm text-slate-400">(Loading...)</span>
            </h3>
            <button 
              className="dune-button-secondary py-1 px-2 text-xs rounded"
              onClick={onTogglePanel}
            >
              ⬅️
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-amber-300">Loading POIs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 dune-panel border-r overflow-hidden flex flex-col">
      {/* POI Panel Header */}
      <div className="p-4 border-b border-slate-600">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-amber-200 flex items-center">
            <Map size={16} className="mr-2" />
            POIs
            <span className="ml-2 text-sm text-slate-400">
              ({filterCounts.availablePOIs} available • {filterCounts.selectedPOIs} selected)
            </span>
          </h3>
          
          <div className="flex items-center space-x-2">
            {/* View Mode Selector */}
            <ViewModeSelector 
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
            />
            {/* Collapse Button */}
            <button 
              className="dune-button-secondary py-1 px-2 text-xs rounded"
              onClick={onTogglePanel}
            >
              ⬅️
            </button>
          </div>
        </div>
        
        {/* POI Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={selectAllFiltered}
            className="dune-button-secondary py-1 px-3 text-xs rounded-lg flex items-center space-x-1"
            disabled={pois.length === 0}
          >
            <CheckSquare size={12} />
            <span>Select All Filtered</span>
          </button>
          <button
            onClick={clearPOISelection}
            className="dune-button-secondary py-1 px-3 text-xs rounded-lg flex items-center space-x-1"
            disabled={filterCounts.selectedPOIs === 0}
          >
            <Square size={12} />
            <span>Clear Selection</span>
          </button>
          <button 
            className="text-xs text-amber-400 hover:text-amber-300 ml-auto flex items-center space-x-1"
            disabled
            title="View on Map coming in Phase 6"
          >
            <Eye size={12} />
            <span>View on Map</span>
          </button>
        </div>
      </div>
      
      {/* POI Content Area */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'map' ? (
          <Suspense fallback={
            <div className="flex-1 flex items-center justify-center">
              <div className="text-amber-300">Loading map view...</div>
            </div>
          }>
            <POIMapView 
              pois={pois}
              mapType={filterState.poiFilters.mapType || 'hagga'}
              selectedPOIIds={selectedPOIIds}
              onPOISelect={togglePOISelection}
              poiTypes={filterState.poiTypes}
            />
          </Suspense>
        ) : (
          <div className="h-full overflow-y-auto p-4">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 gap-3"> {/* Changed to 2 columns */}
                {pois.map((poi: any) => (
                  <POICard key={poi.id} poi={poi} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {pois.map((poi: any) => (
                  <POICard key={poi.id} poi={poi} />
                ))}
              </div>
            )}
            
            {pois.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                No POIs match the current filters
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination Controls - Hidden in map mode */}
      {viewMode !== 'map' && (
        <PaginationControls
          currentPage={pagination.pois.currentPage}
          totalPages={pagination.pois.totalPages}
          totalItems={pagination.pois.totalItems}
          itemsPerPage={pagination.pois.itemsPerPage}
          onPageChange={(page) => changePage('pois', page)}
          onItemsPerPageChange={(itemsPerPage) => changeItemsPerPage('pois', itemsPerPage)}
          loading={loading}
        />
      )}
    </div>
  );
};

export default POIsPanel; 