import React, { useState, useEffect } from 'react';
import { Database, Map, Package, BarChart3 } from 'lucide-react';

// Import panels
import FiltersPanel from '../components/poi-linking/panels/FiltersPanel';
import POIsPanel from '../components/poi-linking/panels/POIsPanel';
import EntitiesPanel from '../components/poi-linking/panels/EntitiesPanel';
import SelectionSummaryPanel from '../components/poi-linking/panels/SelectionSummaryPanel';

// Import hooks
import { useFilterState } from '../hooks/useFilterState';

// Import view mode type
import { ViewMode } from '../components/poi-linking/components/ViewModeSelector';

interface PanelState {
  filters: boolean;
  pois: boolean;
  entities: boolean;
  summary: boolean;
}

const POIEntityLinkingPage: React.FC = () => {
  // Initialize filter state hook
  const filterState = useFilterState();
  
  // Store pre-map panel state for restoration
  const [preMapEntitiesState, setPreMapEntitiesState] = useState<boolean>(true);
  
  // Panel visibility state with localStorage persistence
  const [panelState, setPanelState] = useState<PanelState>(() => {
    const saved = localStorage.getItem('poi-linking-panel-state');
    return saved ? JSON.parse(saved) : {
      filters: true,
      pois: true,
      entities: true,
      summary: true
    };
  });

  // Persist panel state to localStorage
  useEffect(() => {
    localStorage.setItem('poi-linking-panel-state', JSON.stringify(panelState));
  }, [panelState]);

  const togglePanel = (panel: keyof PanelState) => {
    setPanelState(prev => ({
      ...prev,
      [panel]: !prev[panel]
    }));
  };

  // Handle POI view mode changes - auto-collapse entities panel in map mode
  const handlePOIViewModeChange = (mode: ViewMode) => {
    if (mode === 'map') {
      // Store current entities panel state before collapsing
      setPreMapEntitiesState(panelState.entities);
      
      // Auto-collapse entities panel for maximum map space
      setPanelState(prev => ({
        ...prev,
        entities: false
      }));
      
      // Handle filter restrictions: "both" → "hagga_basin" 
      if (filterState.poiFilters.mapType === 'both') {
        filterState.updatePOIFilters({
          ...filterState.poiFilters,
          mapType: 'hagga'
        });
      }
    } else {
      // Optionally restore entities panel when leaving map mode
      // For now, keep it collapsed (Option B behavior)
      // setPanelState(prev => ({ ...prev, entities: preMapEntitiesState }));
    }
  };

  // Panel components - now using real implementations

  // Collapsed panel components
  const CollapsedPanel: React.FC<{ 
    panel: keyof PanelState; 
    icon: React.ReactNode; 
    label: string; 
  }> = ({ panel, icon, label }) => (
    <div className="w-8 dune-panel border-r flex-col items-center justify-center flex">
      <button 
        className="dune-button-secondary p-2 mb-2 text-xs rounded transform -rotate-90"
        onClick={() => togglePanel(panel)}
      >
        <div className="flex items-center space-x-1">
          {icon}
          <span className="text-xs">{label}</span>
        </div>
      </button>
    </div>
  );

  return (
    <div className="flex h-screen" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Left Panel - Filters */}
      {panelState.filters ? (
        <FiltersPanel onTogglePanel={() => togglePanel('filters')} filterState={filterState} />
      ) : (
        <CollapsedPanel 
          panel="filters" 
          icon={<Database size={12} />} 
          label="Filters" 
        />
      )}

      {/* Middle Left Panel - POIs */}
      {panelState.pois ? (
        <POIsPanel 
          onTogglePanel={() => togglePanel('pois')} 
          filterState={filterState}
          onViewModeChange={handlePOIViewModeChange}
        />
      ) : (
        <CollapsedPanel 
          panel="pois" 
          icon={<Map size={12} />} 
          label="POIs" 
        />
      )}

      {/* Middle Right Panel - Entities */}
      {panelState.entities ? (
        <EntitiesPanel onTogglePanel={() => togglePanel('entities')} filterState={filterState} />
      ) : (
        <CollapsedPanel 
          panel="entities" 
          icon={<Package size={12} />} 
          label="Entities" 
        />
      )}

      {/* Right Panel - Selection Summary */}
      {panelState.summary ? (
        <SelectionSummaryPanel onTogglePanel={() => togglePanel('summary')} filterState={filterState} />
      ) : (
        <CollapsedPanel 
          panel="summary" 
          icon={<BarChart3 size={12} />} 
          label="Summary" 
        />
      )}
    </div>
  );
};

export default POIEntityLinkingPage; 