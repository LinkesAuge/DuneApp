import React, { useState } from 'react';
import { Map, List, Grid, Eye, CheckSquare, Square } from 'lucide-react';

interface POIsPanelProps {
  onTogglePanel: () => void;
  filterState: any; // Will be properly typed when we import the hook
}

const POIsPanel: React.FC<POIsPanelProps> = ({ onTogglePanel, filterState }) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('list');
  
  const {
    pois,
    filterCounts,
    selectedPOIIds,
    togglePOISelection,
    clearAllSelections,
    loading
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

  // Get POI type info for display
  const getPOITypeInfo = (poi: any) => {
    if (!poi.poi_types) return { icon: '📍', color: 'bg-slate-600' };
    
    const typeMap: { [key: string]: { icon: string; color: string } } = {
      'Base': { icon: '⚡', color: 'bg-blue-600' },
      'Resources': { icon: '💎', color: 'bg-orange-600' },
      'Locations': { icon: '🏛️', color: 'bg-purple-600' },
      'NPCs': { icon: '👤', color: 'bg-green-600' },
      'Exploration': { icon: '🔍', color: 'bg-yellow-600' }
    };
    
    return typeMap[poi.poi_types.category] || { icon: '📍', color: 'bg-slate-600' };
  };

  // Get privacy level info
  const getPrivacyInfo = (privacyLevel: string) => {
    const privacyMap: { [key: string]: { icon: string; color: string } } = {
      'global': { icon: '🌍', color: 'text-green-400' },
      'private': { icon: '🔒', color: 'text-red-400' },
      'shared': { icon: '👥', color: 'text-blue-400' }
    };
    
    return privacyMap[privacyLevel] || { icon: '❓', color: 'text-slate-400' };
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
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 ${typeInfo.color} rounded-full flex items-center justify-center text-xs`}>
                {typeInfo.icon}
              </div>
              <h5 className="font-medium text-amber-200 truncate">{String(poi.title || '')}</h5>
              <span className={`text-xs ${privacyInfo.color}`}>{privacyInfo.icon}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              {String(poi.description || 'No description available')}
            </p>
            <div className="flex items-center space-x-3 mt-2 text-xs text-slate-500">
              <span>📍 {String(poi.map_type) === 'hagga_basin' ? 'Hagga Basin' : 'Deep Desert'}</span>
              {poi.profiles?.username && (
                <span>👤 by {String(poi.profiles.username || '')}</span>
              )}
              <span>🔗 {poi.linkCount || 0} links</span>
            </div>
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
            {/* View Mode Toggle */}
            <div className="flex bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`py-1 px-2 text-xs rounded ${
                  viewMode === 'list' ? 'dune-button-primary' : 'dune-button-secondary'
                }`}
              >
                <List size={14} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`py-1 px-2 text-xs rounded ${
                  viewMode === 'grid' ? 'dune-button-primary' : 'dune-button-secondary'
                }`}
              >
                <Grid size={14} />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`py-1 px-2 text-xs rounded ${
                  viewMode === 'map' ? 'dune-button-primary' : 'dune-button-secondary'
                }`}
                disabled
                title="Map view coming in Phase 6"
              >
                <Map size={14} />
              </button>
            </div>
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
      <div className="flex-1 overflow-y-auto p-4">
        {pois.length === 0 ? (
          <div className="text-center text-slate-400 mt-16">
            <Map size={48} className="mx-auto mb-4 opacity-50" />
            <p>No POIs match current filters</p>
            <p className="text-xs mt-2">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className={`gap-3 ${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 xl:grid-cols-2' 
              : 'flex flex-col'
          }`}>
            {pois.map((poi: any) => (
              <POICard key={poi.id} poi={poi} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default POIsPanel; 