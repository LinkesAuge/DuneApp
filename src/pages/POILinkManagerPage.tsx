import React, { useState, useEffect } from 'react';
import { Database, List, Eye, ChevronDown, ChevronUp } from 'lucide-react';

// Import the hook
import { usePOILinks } from '../hooks/usePOILinks';

// Import shared components
import PaginationControls from '../components/shared/PaginationControls';
import { ImagePreview } from '../components/shared/ImagePreview';

const POILinkManagerPage: React.FC = () => {
  // Initialize POI links hook
  const poiLinksState = usePOILinks();
  
  // Panel state management
  const [panelState, setPanelState] = useState({
    filters: true,
    tree: true
  });

  const togglePanel = (panel: keyof typeof panelState) => {
    setPanelState(prev => ({
      ...prev,
      [panel]: !prev[panel]
    }));
  };

  return (
    <div className="flex h-screen" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Left Panel - Filters (temporarily placeholder) */}
      {panelState.filters ? (
        <div className="w-80 dune-panel border-r overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-600">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-amber-200 flex items-center" 
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                <Database size={16} className="mr-2" />
                Filters
              </h3>
              <button 
                className="dune-button-secondary py-1 px-2 text-xs rounded"
                onClick={() => togglePanel('filters')}
              >
                ⬅️
              </button>
            </div>
          </div>
          <div className="flex-1 p-4">
            <div className="text-amber-200/60 text-sm">
              Filter controls will be implemented here
            </div>
          </div>
        </div>
      ) : (
        <div className="w-8 dune-panel border-r flex-col items-center justify-center flex">
          <button 
            className="dune-button-secondary p-2 mb-2 text-xs rounded transform -rotate-90"
            onClick={() => togglePanel('filters')}
          >
            <div className="flex items-center space-x-1">
              <Database size={12} />
              <span className="text-xs">Filters</span>
            </div>
          </button>
        </div>
      )}

      {/* Right Panel - Tree View */}
      {panelState.tree ? (
        <POILinkTreePanel onTogglePanel={() => togglePanel('tree')} poiLinksState={poiLinksState} />
      ) : (
        <div className="w-8 dune-panel border-r flex-col items-center justify-center flex">
          <button 
            className="dune-button-secondary p-2 mb-2 text-xs rounded transform -rotate-90"
            onClick={() => togglePanel('tree')}
          >
            <div className="flex items-center space-x-1">
              <List size={12} />
              <span className="text-xs">Tree</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

// POI Link Tree Panel Component
interface POILinkTreePanelProps {
  onTogglePanel: () => void;
  poiLinksState: any; // Will be properly typed
}

const POILinkTreePanel: React.FC<POILinkTreePanelProps> = ({ onTogglePanel, poiLinksState }) => {
  // Selection mode state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [expandedPOIs, setExpandedPOIs] = useState<Set<string>>(new Set());

  const {
    poiLinks,
    loading,
    error,
    pagination,
    totalCount,
    setPage
  } = poiLinksState;

  // Initialize expanded POIs when data loads (POIs expanded by default)
  useEffect(() => {
    if (poiLinks.length > 0 && expandedPOIs.size === 0) {
      const allPOIIds = poiLinks.map((poiLink: any) => poiLink.poi.id);
      setExpandedPOIs(new Set(allPOIIds));
    }
  }, [poiLinks, expandedPOIs.size]);

  // Expand/Collapse handlers
  const expandAll = () => {
    const allPOIIds = poiLinks.map((poiLink: any) => poiLink.poi.id);
    setExpandedPOIs(new Set(allPOIIds));
  };

  const collapseAll = () => {
    setExpandedPOIs(new Set());
  };

  const togglePOIExpansion = (poiId: string) => {
    const newExpanded = new Set(expandedPOIs);
    if (newExpanded.has(poiId)) {
      newExpanded.delete(poiId);
    } else {
      newExpanded.add(poiId);
    }
    setExpandedPOIs(newExpanded);
  };

  // Selection handlers (placeholder for now)
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setSelectedItems(new Set());
    }
  };

  const handleBulkDelete = () => {
    // TODO: Implement bulk delete
    console.log('Bulk delete selected items:', selectedItems);
  };

  if (loading) {
    return (
      <div className="flex-1 dune-panel overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-amber-200 flex items-center"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              <List size={16} className="mr-2" />
              POI Links
              <span className="ml-2 text-sm text-slate-400">(Loading...)</span>
            </h3>
            <button 
              className="dune-button-secondary py-1 px-2 text-xs rounded"
              onClick={onTogglePanel}
            >
              ➡️
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-amber-300">Loading POI links...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 dune-panel overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-amber-200 flex items-center"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              <List size={16} className="mr-2" />
              POI Links
            </h3>
            <button 
              className="dune-button-secondary py-1 px-2 text-xs rounded"
              onClick={onTogglePanel}
            >
              ➡️
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-400">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 dune-panel overflow-hidden flex flex-col">
      {/* Tree Panel Header */}
      <div className="p-4 border-b border-slate-600">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-amber-200 flex items-center"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            <List size={16} className="mr-2" />
            POI Links
            <span className="ml-2 text-sm text-slate-400">({totalCount} total)</span>
          </h3>
          <button 
            className="dune-button-secondary py-1 px-2 text-xs rounded"
            onClick={onTogglePanel}
          >
            ➡️
          </button>
        </div>

        {/* Tree Controls */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <button
              onClick={expandAll}
              className="dune-button-secondary px-2 py-1 text-xs rounded flex items-center space-x-1"
            >
              <ChevronDown size={12} />
              <span>Expand All</span>
            </button>
            <button
              onClick={collapseAll}
              className="dune-button-secondary px-2 py-1 text-xs rounded flex items-center space-x-1"
            >
              <ChevronUp size={12} />
              <span>Collapse All</span>
            </button>
          </div>
          <button
            onClick={toggleSelectionMode}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              selectionMode 
                ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                : 'dune-button-secondary'
            }`}
          >
            {selectionMode ? 'Exit Select Mode' : 'Select Mode'}
          </button>
        </div>
      </div>

      {/* Selection Banner */}
      {selectedItems.size > 0 && (
        <div className="p-3 bg-purple-500/10 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-purple-200 text-sm">
              {selectedItems.size} item{selectedItems.size === 1 ? '' : 's'} selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedItems(new Set())}
                className="text-purple-300 hover:text-purple-200 text-sm underline"
              >
                Clear All
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded transition-colors"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto">
        {poiLinks.length === 0 ? (
          <div className="text-center py-12">
            <List className="w-12 h-12 text-amber-300/40 mx-auto mb-4" />
            <p className="text-amber-200/60">No POI links found</p>
          </div>
        ) : (
          <div className="p-2">
            {poiLinks.map((poiLink: any) => (
              <POITreeNode
                key={poiLink.poi.id}
                poiLink={poiLink}
                expanded={expandedPOIs.has(poiLink.poi.id)}
                selectionMode={selectionMode}
                selectedItems={selectedItems}
                onToggleExpand={() => togglePOIExpansion(poiLink.poi.id)}
                onToggleSelection={(itemId: string) => {
                  const newSelected = new Set(selectedItems);
                  if (newSelected.has(itemId)) {
                    newSelected.delete(itemId);
                  } else {
                    newSelected.add(itemId);
                  }
                  setSelectedItems(newSelected);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="border-t border-slate-600 p-4">
        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={totalCount}
          onPageChange={setPage}
          itemsPerPage={pagination.pageSize}
          showItemsPerPage={false}
        />
      </div>
    </div>
  );
};

// POI Tree Node Component
interface POITreeNodeProps {
  poiLink: any;
  expanded: boolean;
  selectionMode: boolean;
  selectedItems: Set<string>;
  onToggleExpand: () => void;
  onToggleSelection: (itemId: string) => void;
}

const POITreeNode: React.FC<POITreeNodeProps> = ({
  poiLink,
  expanded,
  selectionMode,
  selectedItems,
  onToggleExpand,
  onToggleSelection
}) => {
  const { poi, entities } = poiLink;
  const poiSelectionId = `poi:${poi.id}`;
  const isPoiSelected = selectedItems.has(poiSelectionId);

  return (
    <div className="mb-2">
      {/* POI Header */}
      <div className="flex items-center p-2 bg-slate-800/50 rounded-lg border border-slate-600 hover:border-amber-400/50 transition-colors">
        {selectionMode && (
          <input
            type="checkbox"
            checked={isPoiSelected}
            onChange={() => onToggleSelection(poiSelectionId)}
            className="mr-3 rounded text-purple-500"
          />
        )}
        
        <button
          onClick={onToggleExpand}
          className="mr-2 p-1 hover:bg-slate-700 rounded transition-colors"
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
        
        <div className="flex items-center space-x-2 flex-1">
          <span className="text-amber-200 font-medium">{poi.title}</span>
          <span className="text-slate-400 text-sm">({entities.length} entities)</span>
          <span className="text-slate-500 text-xs">
            {poi.map_type === 'hagga_basin' ? '🏔️ Hagga Basin' : '🏜️ Deep Desert'}
          </span>
        </div>
      </div>

      {/* Entity List */}
      {expanded && (
        <div className="ml-8 mt-1 space-y-1">
          {entities.map((entityLink: any) => (
            <EntityTreeNode
              key={`${entityLink.poi_id}-${entityLink.entity_id}`}
              entityLink={entityLink}
              selectionMode={selectionMode}
              isSelected={selectedItems.has(`link:${entityLink.poi_id}-${entityLink.entity_id}`)}
              onToggleSelection={() => onToggleSelection(`link:${entityLink.poi_id}-${entityLink.entity_id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Entity Tree Node Component
interface EntityTreeNodeProps {
  entityLink: any;
  selectionMode: boolean;
  isSelected: boolean;
  onToggleSelection: () => void;
}

const EntityTreeNode: React.FC<EntityTreeNodeProps> = ({
  entityLink,
  selectionMode,
  isSelected,
  onToggleSelection
}) => {
  const { entity } = entityLink;

  return (
    <div className="flex items-center p-2 pl-4 bg-slate-800/30 rounded border border-slate-700 hover:border-amber-400/30 transition-colors">
      {selectionMode && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelection}
          className="mr-3 rounded text-purple-500"
        />
      )}
      
      <div className="flex items-center space-x-2 flex-1">
        <div className="w-5 h-5 bg-slate-600 rounded flex items-center justify-center">
          <ImagePreview
            iconImageId={entity.icon_image_id}
            iconFallback={entity.icon_fallback || (entity.is_schematic ? '📋' : '📦')}
            size="xs"
            className="w-full h-full"
          />
        </div>
        <span className="text-slate-300">{entity.name}</span>
        <span className="text-xs text-slate-500">
          {entity.is_schematic ? '📋 Schematic' : '🔧 Item'}
        </span>
      </div>
      
      {!selectionMode && (
        <div className="flex space-x-1">
          <button className="dune-button-secondary text-xs p-1" title="Edit">
            ✏️
          </button>
          <button className="dune-button-secondary text-xs p-1 text-red-400" title="Delete">
            🗑️
          </button>
        </div>
      )}
    </div>
  );
};

export default POILinkManagerPage; 