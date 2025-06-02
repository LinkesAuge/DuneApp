import React, { useState } from 'react';
import { Package, FileText, Grid3X3, List, TreePine, Search, Plus, Settings, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '../components/auth/AuthProvider';
import { useEntityCounts } from '../hooks/useItemsSchematicsData';
import CategoryHierarchyNav from '../components/items-schematics/CategoryHierarchyNav';
import ItemsSchematicsContent from '../components/items-schematics/ItemsSchematicsContent';
import DetailsPanel from '../components/items-schematics/DetailsPanel';

// Import types (these will need to be created)
interface Category {
  id: string;
  name: string;
  icon?: string;
  icon_image_id?: string;
  icon_fallback?: string;
}

interface ItemSchematicFilters {
  categories?: string[];
  types?: string[];
  tiers?: string[];
  creators?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  dynamicFields?: Record<string, any>;
}

type ViewMode = 'tree' | 'grid' | 'list';

const ItemsSchematicsPage: React.FC = () => {
  const { user } = useAuth();
  
  // State management
  const [activeView, setActiveView] = useState<'all' | 'items' | 'schematics'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ItemSchematicFilters>({});
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);

  // Force data refresh state
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Real data hooks for counts
  const { itemCount, schematicCount, loading: countsLoading } = useEntityCounts();

  // Bulk operations state
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedEntities(selectedIds);
  };

  const handleBulkOperationTriggered = (operation: 'edit' | 'delete', entities: any[]) => {
    // Clear selection after operation
    setSelectedEntities([]);
    // TODO: Refresh data when API is available
  };

  const handleAdvancedSearch = (criteria: any) => {
    // TODO: Implement advanced search logic
    // This would typically filter the data based on the criteria
  };

  // Clear selection when changing views
  const handleViewChange = (view: 'all' | 'items' | 'schematics') => {
    setActiveView(view);
  };

  const handleCreateNew = () => {
    // TODO: Implement create new item/schematic modal
  };

  const handleEntityCreated = (newEntity: any) => {
    // Force refresh of data by incrementing the refresh trigger
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEntityUpdated = (updatedEntity: any) => {
    // Force refresh of data by incrementing the refresh trigger
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEntityDeleted = (entityId: string) => {
    // Remove from selected if it was the deleted entity
    if (selectedItem?.id === entityId) {
      setSelectedItem(null);
    }
    // Force refresh of data by incrementing the refresh trigger
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle item selection - open details panel when item is selected
  const handleItemSelect = (item: any | null) => {
    setSelectedItem(item);
    // Open the details panel when an item is selected
    if (item && rightSidebarCollapsed) {
      setRightSidebarCollapsed(false);
    }
  };

  // Handle clicking in empty areas to close details panel
  const handleContentAreaClick = (event: React.MouseEvent) => {
    // Only close if clicking directly on the content area wrapper (not on child elements)
    if (event.target === event.currentTarget) {
      setSelectedItem(null);
    }
  };

  // Handle close from details panel
  const handleDetailsClose = () => {
    setSelectedItem(null);
  };

  const openSettings = () => {
    // TODO: Implement settings modal
  };

  return (
    <div className="min-h-screen">
      {/* Main background image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(/images/main-bg.webp)` }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {/* No header - view switching moved to control panel */}

        <div className="flex h-screen">
          {/* Left Sidebar - Controls Panel */}
          {!leftSidebarCollapsed ? (
            <div className="w-[30rem] flex-shrink-0">
              <div className="h-full group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60" />
                <div className="absolute inset-0 bg-gradient-to-b from-amber-600/10 via-amber-500/5 to-transparent" />
                
                <div className="relative h-full border-r border-amber-400/20">
                  <CategoryHierarchyNav
                    activeView={activeView}
                    selectedCategory={selectedCategory}
                    onCategorySelect={setSelectedCategory}
                    filters={filters}
                    onFiltersChange={setFilters}
                    onClose={() => setLeftSidebarCollapsed(true)}
                    filteredCount={0}
                    onEntityCreated={handleEntityCreated}
                    onViewChange={handleViewChange}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Collapsed Controls Panel - Reopen Button */
            <div className="w-12 flex-shrink-0 border-r border-amber-400/20">
              <div className="h-full group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60" />
                <div className="absolute inset-0 bg-gradient-to-b from-amber-600/10 via-amber-500/5 to-transparent" />
                
                <div className="relative h-full flex flex-col">
                  <button
                    onClick={() => setLeftSidebarCollapsed(false)}
                    className="p-3 text-amber-200/70 hover:text-amber-300 hover:bg-amber-500/10 transition-all duration-200 border-b border-amber-400/10"
                    title="Show Controls Panel"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area - with click handling to close details panel */}
          <div 
            className="flex-1 overflow-hidden cursor-pointer" 
            onClick={handleContentAreaClick}
          >
            <ItemsSchematicsContent
              activeView={activeView}
              viewMode={viewMode}
              selectedCategory={selectedCategory}
              searchTerm={searchTerm}
              filters={filters}
              onItemSelect={handleItemSelect}
              leftSidebarCollapsed={leftSidebarCollapsed}
              onToggleLeftSidebar={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
              rightSidebarCollapsed={rightSidebarCollapsed}
              onToggleRightSidebar={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
              onEntityUpdated={handleEntityUpdated}
              onEntityDeleted={handleEntityDeleted}
              refreshTrigger={refreshTrigger}
              selectedEntities={selectedEntities}
              onSelectionChange={handleSelectionChange}
              onBulkOperationTriggered={handleBulkOperationTriggered}
            />
          </div>

          {/* Right Sidebar - Details Panel - Only show when item is selected */}
          {selectedItem && !rightSidebarCollapsed ? (
            <div className="w-[30rem] flex-shrink-0">
              <div className="h-full group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60" />
                <div className="absolute inset-0 bg-gradient-to-b from-amber-600/10 via-amber-500/5 to-transparent" />
                
                <div className="relative h-full border-l border-amber-400/20">
                  <DetailsPanel
                    activeView={activeView}
                    selectedItem={selectedItem}
                    onClose={handleDetailsClose}
                  />
                </div>
              </div>
            </div>
          ) : selectedItem && rightSidebarCollapsed ? (
            /* Collapsed Details Panel - Reopen Button (only when item is selected) */
            <div className="w-12 flex-shrink-0 border-l border-amber-400/20">
              <div className="h-full group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60" />
                <div className="absolute inset-0 bg-gradient-to-b from-amber-600/10 via-amber-500/5 to-transparent" />
                
                <div className="relative h-full flex flex-col">
                  <button
                    onClick={() => setRightSidebarCollapsed(false)}
                    className="p-3 text-amber-200/70 hover:text-amber-300 hover:bg-amber-500/10 transition-all duration-200 border-b border-amber-400/10"
                    title="Show Details Panel"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ItemsSchematicsPage; 