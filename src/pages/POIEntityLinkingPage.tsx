import React, { useState, useEffect } from 'react';
import { Database, Map, Package, BarChart3 } from 'lucide-react';

// Import panels (to be created)
// import FiltersPanel from '../components/poi-linking/panels/FiltersPanel';
// import POIsPanel from '../components/poi-linking/panels/POIsPanel';
// import EntitiesPanel from '../components/poi-linking/panels/EntitiesPanel';
// import SelectionSummaryPanel from '../components/poi-linking/panels/SelectionSummaryPanel';

// Import hooks (to be created)
// import { usePanelState } from '../components/poi-linking/hooks/usePanelState';
// import { useFilterState } from '../components/poi-linking/hooks/useFilterState';
// import { useSelectionState } from '../components/poi-linking/hooks/useSelectionState';

interface PanelState {
  filters: boolean;
  pois: boolean;
  entities: boolean;
  summary: boolean;
}

const POIEntityLinkingPage: React.FC = () => {
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

  // Temporary panel components for Phase 1
  const FiltersPanel = () => (
    <div className="w-80 dune-panel border-r overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-600">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-amber-200 flex items-center">
            <Database size={18} className="mr-2" />
            POI Entity Linking
          </h2>
          <button 
            className="dune-button-secondary py-1 px-2 text-xs rounded"
            onClick={() => togglePanel('filters')}
          >
            ⬅️
          </button>
        </div>
        <p className="text-sm text-slate-400">Link POIs with items and schematics</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-600">
        <button className="flex-1 py-3 px-4 text-sm font-medium tab-active">
          🗺️ POI Filters
        </button>
        <button className="flex-1 py-3 px-4 text-sm font-medium tab-inactive">
          📦 Entity Filters
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-center text-slate-400 mt-8">
          <Database size={48} className="mx-auto mb-4 opacity-50" />
          <p>Filter system coming in Phase 2</p>
        </div>
      </div>
    </div>
  );

  const POIsPanel = () => (
    <div className="flex-1 dune-panel border-r overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-600">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-amber-200 flex items-center">
            <Map size={16} className="mr-2" />
            POIs
            <span className="ml-2 text-sm text-slate-400">(0 available • 0 selected)</span>
          </h3>
          <button 
            className="dune-button-secondary py-1 px-2 text-xs rounded"
            onClick={() => togglePanel('pois')}
          >
            ⬅️
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-center text-slate-400 mt-16">
          <Map size={48} className="mx-auto mb-4 opacity-50" />
          <p>POI selection coming in Phase 3</p>
        </div>
      </div>
    </div>
  );

  const EntitiesPanel = () => (
    <div className="flex-1 dune-panel border-r overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-600">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-amber-200 flex items-center">
            <Package size={16} className="mr-2" />
            Entities
            <span className="ml-2 text-sm text-slate-400">(0 available • 0 selected)</span>
          </h3>
          <button 
            className="dune-button-secondary py-1 px-2 text-xs rounded"
            onClick={() => togglePanel('entities')}
          >
            ➡️
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-center text-slate-400 mt-16">
          <Package size={48} className="mx-auto mb-4 opacity-50" />
          <p>Entity selection coming in Phase 3</p>
        </div>
      </div>
    </div>
  );

  const SelectionSummaryPanel = () => (
    <div className="w-80 dune-panel overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-600">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold text-amber-200 flex items-center">
            <BarChart3 size={16} className="mr-2" />
            Selection Summary
          </h3>
          <button 
            className="dune-button-secondary py-1 px-2 text-xs rounded"
            onClick={() => togglePanel('summary')}
          >
            ➡️
          </button>
        </div>
        <p className="text-sm text-slate-400">0 POIs • 0 Entities selected</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-center text-slate-400 mt-16">
          <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
          <p>Selection summary coming in Phase 4</p>
        </div>
      </div>
    </div>
  );

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
        <FiltersPanel />
      ) : (
        <CollapsedPanel 
          panel="filters" 
          icon={<Database size={12} />} 
          label="Filters" 
        />
      )}

      {/* Middle Left Panel - POIs */}
      {panelState.pois ? (
        <POIsPanel />
      ) : (
        <CollapsedPanel 
          panel="pois" 
          icon={<Map size={12} />} 
          label="POIs" 
        />
      )}

      {/* Middle Right Panel - Entities */}
      {panelState.entities ? (
        <EntitiesPanel />
      ) : (
        <CollapsedPanel 
          panel="entities" 
          icon={<Package size={12} />} 
          label="Entities" 
        />
      )}

      {/* Right Panel - Selection Summary */}
      {panelState.summary ? (
        <SelectionSummaryPanel />
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