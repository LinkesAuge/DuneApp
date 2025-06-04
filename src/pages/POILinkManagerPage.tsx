import React, { useState, useEffect } from 'react';
import { Database, List, Eye, ChevronDown, ChevronUp, Lock, Users, Grid3X3, Menu, Edit, Trash2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import the hook
import { usePOILinks } from '../hooks/usePOILinks';

// Import shared components
import PaginationControls from '../components/shared/PaginationControls';
import { ImagePreview } from '../components/shared/ImagePreview';
import POILinkFiltersPanel from '../components/POILinkFiltersPanel';
import { ConfirmationModal } from '../components/shared/ConfirmationModal';
import { useAuth } from '../components/auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { useTiers } from '../hooks/useTiers';

const POILinkManagerPage: React.FC = () => {
  // Initialize POI links hook
  const poiLinksState = usePOILinks();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getTierName } = useTiers();
  
  // Panel state management (only filters panel is collapsible)
  const [filtersOpen, setFiltersOpen] = useState(true);

  const toggleFilters = () => {
    setFiltersOpen(!filtersOpen);
  };

  // Selection state management - persistent across pages
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'danger' as const,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel'
  });
  
  // Expansion state management for POI tree nodes
  const [expandedPOIs, setExpandedPOIs] = useState<Set<string>>(new Set());
  
  // Shared POIs state for permission checking
  const [sharedPOIs, setSharedPOIs] = useState<Set<string>>(new Set());
  
  // View mode state - grid is default as requested
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Extract filter state from the hook
  const { filters, setFilters, filterOptions } = poiLinksState;

  // Create filter state object for the filters panel
  const filtersData = {
    filters,
    setFilters
  };

  // Fetch shared POIs for the current user
  useEffect(() => {
    const fetchSharedPOIs = async () => {
      // Only members need to check shared POIs, admins/editors have full access
      if (!user || user.role !== 'member') {
        setSharedPOIs(new Set());
        return;
      }

      try {
        // Query poi_shares table to find POIs shared with this user
        const { data: sharedPOIData, error } = await supabase
          .from('poi_shares')
          .select('poi_id')
          .eq('shared_with_user_id', user.id);

        if (error) {
          console.error('Error fetching shared POIs:', error);
          return;
        }

        // Convert to Set for O(1) lookup performance in canModifyPOI
        const sharedPOIIds = new Set(sharedPOIData?.map(share => share.poi_id) || []);
        setSharedPOIs(sharedPOIIds);
      } catch (error) {
        console.error('Error fetching shared POIs:', error);
      }
    };

    fetchSharedPOIs();
  }, [user]);

  // Permission checking function
  const canModifyPOI = (poi: any) => {
    if (!user) return false;
    
    // Admins and editors can modify all POI links
    if (user.role === 'admin' || user.role === 'editor') {
      return true;
    }
    
    // Members can only modify their own POIs or POIs shared with them
    if (user.role === 'member') {
      // Can modify their own POIs regardless of privacy level
      if (poi.created_by === user.id) {
        return true;
      }
      
      // For shared POIs, check if the POI is shared with this user
      // sharedPOIs Set is populated from poi_shares table in useEffect
      if (poi.privacy_level === 'shared') {
        return sharedPOIs.has(poi.id);
      }
      
      // Private POIs not owned by the user are not accessible
      // Public POIs are accessible for viewing but not modification (based on project rules)
    }
    
    return false;
  };

  // Selection handlers
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setSelectedItems(new Set()); // Clear selections when exiting selection mode
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const togglePOISelection = (poiId: string, entityLinkIds: string[]) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      const poiSelected = newSet.has(`poi:${poiId}`);
      
      if (poiSelected) {
        // Remove POI and all its entity links
        newSet.delete(`poi:${poiId}`);
        entityLinkIds.forEach(linkId => newSet.delete(`link:${linkId}`));
      } else {
        // Add POI and all its entity links
        newSet.add(`poi:${poiId}`);
        entityLinkIds.forEach(linkId => newSet.add(`link:${linkId}`));
      }
      return newSet;
    });
  };

  const clearAllSelections = () => {
    setSelectedItems(new Set());
  };

  // Expand/Collapse handlers
  const expandAll = () => {
    if (poiLinksState.poiLinks) {
      const allPOIIds = poiLinksState.poiLinks.map((poiLink: any) => poiLink.poi.id);
      setExpandedPOIs(new Set(allPOIIds));
    }
  };

  const collapseAll = () => {
    setExpandedPOIs(new Set());
  };

  const handleToggleExpanded = (poiId: string) => {
    setExpandedPOIs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(poiId)) {
        newSet.delete(poiId);
      } else {
        newSet.add(poiId);
      }
      return newSet;
    });
  };

  // Delete operations
  const handleDeleteLink = async (linkId: string) => {
    const entityName = poiLinksState.poiLinks
      .flatMap((p: any) => p.entities)
      .find((e: any) => e.linkId === linkId)?.entity.name || 'Unknown Entity';

    setConfirmationModal({
      isOpen: true,
      title: 'Delete POI Link',
      message: `Are you sure you want to delete the link to "${entityName}"? This action cannot be undone.`,
      variant: 'danger',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      onConfirm: async () => {
        try {
          await poiLinksState.deleteLink(linkId);
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Failed to delete link:', error);
          // TODO: Show error toast
        }
      }
    });
  };

  const handleBulkDelete = () => {
    const linkCount = Array.from(selectedItems).filter(item => item.startsWith('link:')).length;
    const poiCount = Array.from(selectedItems).filter(item => item.startsWith('poi:')).length;
    
    let message = `Are you sure you want to delete ${linkCount} link${linkCount === 1 ? '' : 's'}`;
    if (poiCount > 0) {
      message += ` and all links for ${poiCount} POI${poiCount === 1 ? '' : 's'}`;
    }
    message += '? This action cannot be undone.';

    setConfirmationModal({
      isOpen: true,
      title: 'Bulk Delete Links',
      message,
      variant: 'danger',
      confirmButtonText: 'Delete All',
      cancelButtonText: 'Cancel',
      onConfirm: async () => {
        try {
          await poiLinksState.bulkDeleteLinks(selectedItems);
          setSelectedItems(new Set()); // Clear selection after successful deletion
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Failed to bulk delete links:', error);
          // TODO: Show error toast
        }
      }
    });
  };

  // Edit operations
  const handleEditPOI = (poiId: string, entityIds: string[]) => {
    const entityIdsQuery = entityIds.join(',');
    navigate(`/poi-linking?poi=${poiId}&entities=${entityIdsQuery}`);
  };

  const handleEditLink = (poiId: string, entityId: string) => {
    navigate(`/poi-linking?poi=${poiId}&entities=${entityId}`);
  };

  return (
    <div className="flex h-screen" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Left Panel - Filters */}
      {filtersOpen ? (
        <POILinkFiltersPanel 
          onTogglePanel={toggleFilters} 
          filterState={filtersData}
          filterOptions={filterOptions}
        />
      ) : (
        <div className="w-8 dune-panel border-r flex-col items-center justify-center flex">
          <button 
            className="dune-button-secondary p-2 mb-2 text-xs rounded transform -rotate-90"
            onClick={toggleFilters}
          >
            <div className="flex items-center space-x-1">
              <Database size={12} />
              <span className="text-xs">Filters</span>
            </div>
          </button>
        </div>
      )}

      {/* Right Panel - Tree View (always visible) */}
              <POILinkTreePanel 
          poiLinksState={poiLinksState}
          selectionMode={selectionMode}
          selectedItems={selectedItems}
          onToggleSelectionMode={toggleSelectionMode}
          onToggleItemSelection={toggleItemSelection}
          onTogglePOISelection={togglePOISelection}
          onClearAllSelections={clearAllSelections}
          expandedPOIs={expandedPOIs}
          onToggleExpanded={handleToggleExpanded}
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
          onBulkDelete={handleBulkDelete}
          onDeleteLink={handleDeleteLink}
          onEditPOI={handleEditPOI}
          onEditLink={handleEditLink}
          canModifyPOI={canModifyPOI}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        onConfirm={confirmationModal.onConfirm}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        variant={confirmationModal.variant}
        confirmButtonText={confirmationModal.confirmButtonText}
        cancelButtonText={confirmationModal.cancelButtonText}
      />
    </div>
  );
};

// POI Link Tree Panel Component
interface POILinkTreePanelProps {
  poiLinksState: any; // Will be properly typed
  selectionMode: boolean;
  selectedItems: Set<string>;
  onToggleSelectionMode: () => void;
  onToggleItemSelection: (itemId: string) => void;
  onTogglePOISelection: (poiId: string, entityIds: string[]) => void;
  onClearAllSelections: () => void;
  expandedPOIs: Set<string>;
  onToggleExpanded: (poiId: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onBulkDelete: () => void;
  onDeleteLink: (linkId: string) => void;
  onEditPOI: (poiId: string, entityIds: string[]) => void;
  onEditLink: (poiId: string, entityId: string) => void;
  canModifyPOI: (poi: any) => boolean;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const POILinkTreePanel: React.FC<POILinkTreePanelProps> = ({ 
  poiLinksState, 
  selectionMode, 
  selectedItems, 
  onToggleSelectionMode, 
  onToggleItemSelection, 
  onTogglePOISelection, 
  onClearAllSelections,
  expandedPOIs,
  onToggleExpanded,
  onExpandAll,
  onCollapseAll,
  onBulkDelete,
  onDeleteLink,
  onEditPOI,
  onEditLink,
  canModifyPOI,
  viewMode,
  onViewModeChange
}) => {
  // Get data from props

  const {
    poiLinks,
    loading,
    error,
    pagination,
    totalCount,
    filteredCount,
    filters,
    setPage,
    setItemsPerPage
  } = poiLinksState;

  // Initialize expanded POIs when data loads (POIs expanded by default)
  const [hasInitialized, setHasInitialized] = useState(false);
  
  useEffect(() => {
    if (poiLinks.length > 0 && !hasInitialized) {
      const allPOIIds = poiLinks.map((poiLink: any) => poiLink.poi.id);
      onExpandAll();
      setHasInitialized(true);
    }
  }, [poiLinks, hasInitialized, onExpandAll]);

  const togglePOIExpansion = (poiId: string) => {
    onToggleExpanded(poiId);
  };

  // Selection handlers (placeholder for now)
  // Use the toggle from props
  const toggleSelectionModeLocal = onToggleSelectionMode;

  // Use the bulk delete handler from props
  const handleBulkDeleteLocal = onBulkDelete;

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      filters.search ||
      filters.mapType !== 'both' ||
      filters.poiCategories.length > 0 ||
      filters.entityCategories.length > 0 ||
      filters.entityTypes.length > 0 ||
      filters.entityTiers.length > 0
    );
  };

  // Get display count text
  const getDisplayCount = () => {
    if (hasActiveFilters()) {
      return `${filteredCount} of ${totalCount} POIs`;
    }
    return `${totalCount} POIs`;
  };

  if (loading) {
    return (
      <div className="flex-1 dune-panel overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-600">
          <h3 className="text-lg font-semibold text-amber-200 flex items-center"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            <List size={16} className="mr-2" />
            POI Links
            <span className="ml-2 text-sm text-slate-400">(Loading...)</span>
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-400">Loading POI links...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 dune-panel overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-600">
          <h3 className="text-lg font-semibold text-amber-200 flex items-center"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            <List size={16} className="mr-2" />
            POI Links
            <span className="ml-2 text-sm text-red-400">(Error)</span>
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-400">Error loading POI links: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 dune-panel overflow-hidden flex flex-col">
      {/* Header with controls */}
      <div className="p-4 border-b border-slate-600">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold text-amber-200 flex items-center"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              <List size={16} className="mr-2" />
              POI Links
              <span className="ml-2 text-sm text-slate-400">({getDisplayCount()})</span>
            </h3>
            
            <button
              onClick={toggleSelectionModeLocal}
              className={`ml-4 text-xs px-3 py-1 ${
                selectionMode ? 'dune-button-primary' : 'dune-button-secondary'
              }`}
            >
              {selectionMode ? 'Exit Selection' : 'Select Mode'}
            </button>
          </div>
          
          <div className="flex space-x-2">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-800/50 rounded-lg p-1 border border-slate-600/50">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`px-2 py-1 text-xs rounded transition-all duration-200 flex items-center gap-1 ${
                  viewMode === 'grid'
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-400/30'
                    : 'text-amber-200/70 hover:text-amber-200 hover:bg-slate-700/50'
                }`}
                title="Grid View"
              >
                <Grid3X3 size={12} />
                Grid
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`px-2 py-1 text-xs rounded transition-all duration-200 flex items-center gap-1 ${
                  viewMode === 'list'
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-400/30'
                    : 'text-amber-200/70 hover:text-amber-200 hover:bg-slate-700/50'
                }`}
                title="List View"
              >
                <Menu size={12} />
                List
              </button>
            </div>
            
            <button
              onClick={onExpandAll}
              className="dune-button-secondary text-xs px-3 py-1"
            >
              Expand All
            </button>
            <button
              onClick={onCollapseAll}
              className="dune-button-secondary text-xs px-3 py-1"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Selection Banner */}
        {selectedItems.size > 0 && (
          <div className="dune-panel-secondary p-3 mb-4 flex justify-between items-center">
            <span className="text-amber-200">
              {selectedItems.size} item{selectedItems.size === 1 ? '' : 's'} selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={onClearAllSelections}
                className="dune-button-secondary text-xs px-3 py-1"
              >
                Clear All
              </button>
              <button
                onClick={handleBulkDeleteLocal}
                className="dune-button-secondary text-xs px-3 py-1 text-red-400 hover:bg-red-900/20"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content - Grid or List View */}
      <div className="flex-1 overflow-y-auto">
        {poiLinks.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No POI links found
          </div>
        ) : viewMode === 'grid' ? (
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4">
              {poiLinks.map((poiLink: any) => (
                <POIGridCard
                  key={poiLink.poi.id}
                  poiLink={poiLink}
                  selectionMode={selectionMode}
                  selectedItems={selectedItems}
                  expanded={expandedPOIs.has(poiLink.poi.id)}
                  onToggleExpanded={() => togglePOIExpansion(poiLink.poi.id)}
                  onToggleItemSelection={onToggleItemSelection}
                  onTogglePOISelection={onTogglePOISelection}
                  onDeleteLink={onDeleteLink}
                  onEditPOI={onEditPOI}
                  onEditLink={onEditLink}
                  canModifyPOI={canModifyPOI}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {poiLinks.map((poiLink: any) => (
              <POITreeNode
                key={poiLink.poi.id}
                poiLink={poiLink}
                expanded={expandedPOIs.has(poiLink.poi.id)}
                selectionMode={selectionMode}
                selectedItems={selectedItems}
                onToggleExpand={() => togglePOIExpansion(poiLink.poi.id)}
                onToggleItemSelection={onToggleItemSelection}
                onTogglePOISelection={onTogglePOISelection}
                onDeleteLink={onDeleteLink}
                onEditPOI={onEditPOI}
                onEditLink={onEditLink}
                canModifyPOI={canModifyPOI}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="border-t border-slate-600 p-4">
        <PaginationControls
          currentPage={pagination.page}
          totalPages={Math.ceil((hasActiveFilters() ? filteredCount : totalCount) / pagination.itemsPerPage)}
          onPageChange={setPage}
          itemsPerPage={pagination.itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          totalItems={hasActiveFilters() ? filteredCount : totalCount}
          itemLabel="POIs"
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
  onToggleItemSelection: (itemId: string) => void;
  onTogglePOISelection: (poiId: string, entityLinkIds: string[]) => void;
  onDeleteLink: (linkId: string) => void;
  onEditPOI: (poiId: string, entityIds: string[]) => void;
  onEditLink: (poiId: string, entityId: string) => void;
  canModifyPOI: (poi: any) => boolean;
}

const POITreeNode: React.FC<POITreeNodeProps> = ({
  poiLink,
  expanded,
  selectionMode,
  selectedItems,
  onToggleExpand,
  onToggleItemSelection,
  onTogglePOISelection,
  onDeleteLink,
  onEditPOI,
  onEditLink,
  canModifyPOI
}) => {
  const poi = poiLink.poi;
  const entities = poiLink.entities || [];
  const entityLinkIds = entities.map(e => e.linkId || `${poi.id}|${e.entity.id}`);
  
  const isSelected = selectedItems.has(`poi:${poi.id}`);

  return (
    <div className="border border-slate-600 rounded-lg mb-2">
      {/* POI Header */}
      <div className="flex items-center p-3 hover:bg-slate-800/30">
        {selectionMode && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onTogglePOISelection(poi.id, entityLinkIds)}
            className="mr-3"
          />
        )}
        
        <button
          onClick={onToggleExpand}
          className="mr-2 p-1 hover:bg-slate-700 rounded"
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
        
        <div className="flex items-center space-x-2 flex-1">
          <span className="text-amber-200 font-medium">{poi.title}</span>
          
          {/* Privacy Icon */}
          {poi.privacy_level === 'global' && <Eye className="w-4 h-4 text-green-400" title="Public POI" />}
          {poi.privacy_level === 'private' && <Lock className="w-4 h-4 text-red-400" title="Private POI" />}
          {poi.privacy_level === 'shared' && <Users className="w-4 h-4 text-blue-400" title="Shared POI" />}
          
          <span className="text-xs text-slate-400">
            ({entities.length} item{entities.length === 1 ? '' : 's'})
          </span>
        </div>
        
        {!selectionMode && canModifyPOI(poi) && (
          <div className="flex space-x-1">
            <button 
              onClick={() => onEditPOI(poi.id, entities.map(e => e.entity.id))}
              className="dune-button-secondary text-xs p-1"
              title="Edit POI links"
            >
              ✏️
            </button>
          </div>
        )}
      </div>

      {/* Entity List */}
      {expanded && entities.length > 0 && (
        <div className="border-t border-slate-600">
          {entities.map((entityLink: any) => (
            <EntityTreeNode
              key={entityLink.linkId || `${poi.id}|${entityLink.entity.id}`}
              entityLink={entityLink}
              poi={poi}
              poiId={poi.id}
              selectionMode={selectionMode}
              isSelected={selectedItems.has(`link:${entityLink.linkId || `${poi.id}|${entityLink.entity.id}`}`)}
              onToggleSelection={() => onToggleItemSelection(`link:${entityLink.linkId || `${poi.id}|${entityLink.entity.id}`}`)}
              onDeleteLink={onDeleteLink}
              onEditLink={onEditLink}
              canModifyPOI={canModifyPOI}
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
  poi: any;
  poiId: string;
  selectionMode: boolean;
  isSelected: boolean;
  onToggleSelection: () => void;
  onDeleteLink: (linkId: string) => void;
  onEditLink: (poiId: string, entityId: string) => void;
  canModifyPOI: (poi: any) => boolean;
}

const EntityTreeNode: React.FC<EntityTreeNodeProps> = ({
  entityLink,
  poi,
  poiId,
  selectionMode,
  isSelected,
  onToggleSelection,
  onDeleteLink,
  onEditLink,
  canModifyPOI
}) => {
  const entity = entityLink.entity;

  return (
    <div className="flex items-center p-2 pl-6 hover:bg-slate-800/30 border-b border-slate-700 last:border-b-0">
      {selectionMode && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelection}
          className="mr-3"
        />
      )}
      
      <div className="flex items-center space-x-2 flex-1">
        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
          <ImagePreview
            iconImageId={entity.icon_image_id}
            iconFallback={entity.icon || '📦'}
            size="xs"
            className="w-full h-full"
          />
        </div>
        <span className="text-slate-300">{entity.name}</span>
        {entityLink.quantity && (
          <span className="text-xs text-amber-400">Qty: {entityLink.quantity}</span>
        )}
      </div>
      
      {!selectionMode && canModifyPOI(poi) && (
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onEditLink(poiId, entity.id)}
            className="p-1 hover:bg-slate-700/50 rounded text-amber-400/70 hover:text-amber-300 transition-colors"
            title="Edit this link"
          >
            <Edit className="w-3 h-3" />
          </button>
          <button 
            onClick={() => onDeleteLink(entityLink.linkId || `${poiId}|${entity.id}`)}
            className="p-1 hover:bg-slate-700/50 rounded text-red-400/70 hover:text-red-300 transition-colors"
            title="Delete this link"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

// POI Grid Card Component for grid view
interface POIGridCardProps {
  poiLink: any;
  selectionMode: boolean;
  selectedItems: Set<string>;
  expanded: boolean;
  onToggleExpanded: () => void;
  onToggleItemSelection: (itemId: string) => void;
  onTogglePOISelection: (poiId: string, entityIds: string[]) => void;
  onDeleteLink: (linkId: string) => void;
  onEditPOI: (poiId: string, entityIds: string[]) => void;
  onEditLink: (poiId: string, entityId: string) => void;
  canModifyPOI: (poi: any) => boolean;
}

const POIGridCard: React.FC<POIGridCardProps> = ({
  poiLink,
  selectionMode,
  selectedItems,
  expanded,
  onToggleExpanded,
  onToggleItemSelection,
  onTogglePOISelection,
  onDeleteLink,
  onEditPOI,
  onEditLink,
  canModifyPOI
}) => {
  const poi = poiLink.poi;
  const entities = poiLink.entities || [];
  const entityLinkIds = entities.map((e: any) => e.linkId || `${poi.id}|${e.entity.id}`);
  
  const isSelected = selectedItems.has(`poi:${poi.id}`);
  const canModify = canModifyPOI(poi);

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'global': return <Eye className="w-3 h-3 text-green-400" />;
      case 'private': return <Lock className="w-3 h-3 text-red-400" />;
      case 'shared': return <Users className="w-3 h-3 text-blue-400" />;
      default: return <Eye className="w-3 h-3 text-gray-400" />;
    }
  };

  return (
    <div className="dune-panel-secondary border border-slate-600/50 rounded-lg hover:border-amber-400/30 transition-all duration-200">
      {/* Card Header */}
      <div className="p-4 border-b border-slate-600/50">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1">
            {selectionMode && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onTogglePOISelection(poi.id, entityLinkIds)}
                className="mr-2"
              />
            )}
            <button
              onClick={onToggleExpanded}
              className="flex-shrink-0 p-1 hover:bg-slate-700/50 rounded"
            >
              {expanded ? (
                <ChevronDown className="w-3 h-3 text-slate-400" />
              ) : (
                <ChevronRight className="w-3 h-3 text-slate-400" />
              )}
            </button>
            <h3 className="text-amber-200 font-medium text-sm line-clamp-2"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              {poi.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {getPrivacyIcon(poi.privacy_level)}
            {canModify && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEditPOI(poi.id, entities.map((e: any) => e.entity.id))}
                  className="p-1 hover:bg-slate-700/50 rounded text-amber-400/70 hover:text-amber-300 transition-colors"
                  title="Edit POI links"
                >
                  <Edit className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{poi.map_type === 'hagga_basin' ? 'Hagga Basin' : 'Deep Desert'}</span>
          <span>{entities.length} item{entities.length === 1 ? '' : 's'}</span>
        </div>
        
        {poi.coordinates && (
          <div className="text-xs text-slate-500 mt-1">
            {poi.coordinates.x}, {poi.coordinates.y}
          </div>
        )}
      </div>

      {/* Entities List - Collapsible */}
      {expanded && (
        <div className="p-4">
          {entities.length === 0 ? (
            <p className="text-slate-500 text-xs text-center py-2">No linked items</p>
          ) : (
            <div className="space-y-2">
              {entities.map((entityLink: any, index: number) => {
                const linkId = entityLink.linkId || `${poi.id}|${entityLink.entity.id}`;
                const isEntitySelected = selectedItems.has(`link:${linkId}`);
                
                return (
                  <div key={linkId} className="flex items-center justify-between p-2 bg-slate-800/30 rounded text-xs">
                    <div className="flex items-center gap-2 flex-1">
                      {selectionMode && (
                        <input
                          type="checkbox"
                          checked={isEntitySelected}
                          onChange={() => onToggleItemSelection(`link:${linkId}`)}
                          className="mr-1"
                        />
                      )}
                      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                        <ImagePreview
                          iconImageId={entityLink.entity.icon_image_id}
                          iconFallback={entityLink.entity.icon || '📦'}
                          size="xs"
                          className="w-full h-full"
                        />
                      </div>
                      <span className="text-amber-200/80 truncate">
                        {entityLink.entity.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 text-xs">
                        {getTierName(entityLink.entity.tier_number)}
                      </span>
                      {canModify && !selectionMode && (
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => onEditLink(poi.id, entityLink.entity.id)}
                            className="p-1 hover:bg-slate-700/50 rounded text-amber-400/70 hover:text-amber-300 transition-colors"
                            title="Edit this link"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDeleteLink(linkId)}
                            className="p-1 hover:bg-slate-700/50 rounded text-red-400/70 hover:text-red-300 transition-colors"
                            title="Delete this link"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default POILinkManagerPage; 