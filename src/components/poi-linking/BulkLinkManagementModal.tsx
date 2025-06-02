import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Trash2, Edit3, Search, Filter, Package, FileText, MapPin, CheckSquare, Square, AlertCircle, Clock, Users, ExternalLink } from 'lucide-react';
import { Poi, Item, Schematic, PoiItemLink } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { EnhancedProgressIndicator } from './EnhancedProgressIndicator';
import { EnhancedFeedbackDisplay } from './EnhancedFeedbackDisplay';
import { VirtualizedList, PaginationControls } from '../shared';
import { usePagination } from '../../hooks/usePagination';

interface BulkLinkManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOperationComplete: (result: { success: boolean; message: string; affectedCount: number }) => void;
}

interface LinkWithDetails extends PoiItemLink {
  poi: Poi;
  item?: Item;
  schematic?: Schematic;
}

interface FilterState {
  searchTerm: string;
  poiFilter: string; // POI ID or 'all'
  mapType: 'all' | 'hagga_basin' | 'deep_desert';
  entityType: 'all' | 'items' | 'schematics';
  creatorFilter: string; // User ID or 'all' or 'mine'
  dateFilter: 'all' | 'today' | 'week' | 'month';
}

type BulkOperation = 'delete' | 'export' | 'changeType';

const BulkLinkManagementModal: React.FC<BulkLinkManagementModalProps> = ({
  isOpen,
  onClose,
  onOperationComplete
}) => {
  const { user } = useAuth();
  
  // Data state
  const [links, setLinks] = useState<LinkWithDetails[]>([]);
  const [selectedLinkIds, setSelectedLinkIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and search state
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    poiFilter: 'all',
    mapType: 'all',
    entityType: 'all',
    creatorFilter: 'all',
    dateFilter: 'all'
  });
  
  // Operation state
  const [selectedOperation, setSelectedOperation] = useState<BulkOperation>('delete');
  const [isProcessing, setIsProcessing] = useState(false);
  const [operationProgress, setOperationProgress] = useState(0);
  const [operationResult, setOperationResult] = useState<any>(null);
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'created_at' | 'poi_title' | 'entity_name'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load links data
  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: linksData, error: linksError } = await supabase
        .from('poi_item_links')
        .select(`
          *,
          poi:pois!poi_item_links_poi_id_fkey (
            id,
            title,
            description,
            map_type,
            created_by,
            created_at,
            poi_types (
              id,
              name,
              category,
              icon
            ),
            profiles!pois_created_by_fkey (
              id,
              username,
              display_name
            )
          ),
          item:items!poi_item_links_item_id_fkey (
            id,
            name,
            description,
            created_by,
            created_at,
            tiers (name, color),
            types (name, category),
            profiles!items_created_by_fkey (
              id,
              username,
              display_name
            )
          ),
          schematic:schematics!poi_item_links_schematic_id_fkey (
            id,
            name,
            description,
            created_by,
            created_at,
            tiers (name, color),
            types (name, category),
            profiles!schematics_created_by_fkey (
              id,
              username,
              display_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (linksError) throw linksError;

      // Process the data to ensure proper typing
      const processedLinks: LinkWithDetails[] = (linksData || []).map(link => ({
        ...link,
        poi: Array.isArray(link.poi) ? link.poi[0] : link.poi,
        item: link.item_id ? (Array.isArray(link.item) ? link.item[0] : link.item) : undefined,
        schematic: link.schematic_id ? (Array.isArray(link.schematic) ? link.schematic[0] : link.schematic) : undefined,
      }));

      setLinks(processedLinks);
    } catch (err) {
      console.error('Error fetching links:', err);
      setError(err instanceof Error ? err.message : 'Failed to load links');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and sort links
  const filteredAndSortedLinks = useMemo(() => {
    let filtered = links.filter(link => {
      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const poiTitle = link.poi?.title?.toLowerCase() || '';
        const entityName = (link.item?.name || link.schematic?.name || '').toLowerCase();
        const description = (link.poi?.description || link.item?.description || link.schematic?.description || '').toLowerCase();
        
        if (!poiTitle.includes(searchLower) && !entityName.includes(searchLower) && !description.includes(searchLower)) {
          return false;
        }
      }

      // Map type filter
      if (filters.mapType !== 'all' && link.poi?.map_type !== filters.mapType) {
        return false;
      }

      // Entity type filter
      if (filters.entityType === 'items' && !link.item_id) return false;
      if (filters.entityType === 'schematics' && !link.schematic_id) return false;

      // Creator filter
      if (filters.creatorFilter === 'mine' && link.created_by !== user?.id) return false;
      if (filters.creatorFilter !== 'all' && filters.creatorFilter !== 'mine' && link.created_by !== filters.creatorFilter) return false;

      // Date filter
      if (filters.dateFilter !== 'all') {
        const linkDate = new Date(link.created_at);
        const now = new Date();
        const diffMs = now.getTime() - linkDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        switch (filters.dateFilter) {
          case 'today':
            if (diffDays > 1) return false;
            break;
          case 'week':
            if (diffDays > 7) return false;
            break;
          case 'month':
            if (diffDays > 30) return false;
            break;
        }
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortBy) {
        case 'poi_title':
          aVal = a.poi?.title || '';
          bVal = b.poi?.title || '';
          break;
        case 'entity_name':
          aVal = a.item?.name || a.schematic?.name || '';
          bVal = b.item?.name || b.schematic?.name || '';
          break;
        case 'created_at':
        default:
          aVal = new Date(a.created_at);
          bVal = new Date(b.created_at);
          break;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [links, filters, sortBy, sortOrder, user?.id]);

  // Pagination
  const pagination = usePagination(filteredAndSortedLinks, {
    itemsPerPage: 50,
    enableUrlSync: false,
    urlPrefix: 'bulk-links'
  });

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchLinks();
    }
  }, [isOpen, fetchLinks]);

  // Selection handlers
  const toggleLinkSelection = (linkId: string) => {
    setSelectedLinkIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(linkId)) {
        newSelection.delete(linkId);
      } else {
        newSelection.add(linkId);
      }
      return newSelection;
    });
  };

  const selectAllVisible = () => {
    const visibleIds = pagination.paginatedData(filteredAndSortedLinks).map(link => link.id);
    setSelectedLinkIds(new Set(visibleIds));
  };

  const clearSelection = () => {
    setSelectedLinkIds(new Set());
  };

  const selectAllFiltered = () => {
    const allFilteredIds = filteredAndSortedLinks.map(link => link.id);
    setSelectedLinkIds(new Set(allFilteredIds));
  };

  // Bulk operations
  const executeBulkOperation = async () => {
    if (selectedLinkIds.size === 0) return;

    try {
      setIsProcessing(true);
      setOperationProgress(0);
      
      const selectedLinksArray = Array.from(selectedLinkIds);
      const totalCount = selectedLinksArray.length;

      if (selectedOperation === 'delete') {
        // Bulk delete operation with progress tracking
        const batchSize = 10;
        let processed = 0;
        const errors: string[] = [];

        for (let i = 0; i < selectedLinksArray.length; i += batchSize) {
          const batch = selectedLinksArray.slice(i, i + batchSize);
          
          try {
            const { error } = await supabase
              .from('poi_item_links')
              .delete()
              .in('id', batch);

            if (error) throw error;
            
            processed += batch.length;
            setOperationProgress((processed / totalCount) * 100);
          } catch (err) {
            errors.push(`Batch ${i / batchSize + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }
        }

        // Refresh data
        await fetchLinks();
        
        // Clear selection
        setSelectedLinkIds(new Set());

        const result = {
          success: errors.length === 0,
          message: errors.length === 0 
            ? `Successfully deleted ${processed} links`
            : `Deleted ${processed} links with ${errors.length} errors`,
          affectedCount: processed,
          errors: errors.length > 0 ? errors : undefined
        };

        setOperationResult(result);
        onOperationComplete(result);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Operation failed';
      const result = {
        success: false,
        message: errorMessage,
        affectedCount: 0
      };
      setOperationResult(result);
      onOperationComplete(result);
    } finally {
      setIsProcessing(false);
      setOperationProgress(0);
    }
  };

  // Render link item
  const renderLinkItem = (index: number, link: LinkWithDetails) => {
    const isSelected = selectedLinkIds.has(link.id);
    const entity = link.item || link.schematic;
    const entityType = link.item ? 'Item' : 'Schematic';
    const entityIcon = link.item ? Package : FileText;

    return (
      <div
        key={link.id}
        className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors ${
          isSelected
            ? 'bg-blue-600/20 border-blue-500'
            : 'bg-slate-800/50 border-slate-600 hover:border-slate-500'
        }`}
      >
        {/* Selection checkbox */}
        <button
          onClick={() => toggleLinkSelection(link.id)}
          className="text-slate-400 hover:text-slate-200"
        >
          {isSelected ? (
            <CheckSquare className="w-5 h-5 text-blue-400" />
          ) : (
            <Square className="w-5 h-5" />
          )}
        </button>

        {/* POI info */}
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-200 truncate">
              {link.poi?.title || 'Unknown POI'}
            </div>
            <div className="text-xs text-slate-400">
              {link.poi?.map_type === 'hagga_basin' ? 'Hagga Basin' : 'Deep Desert'}
            </div>
          </div>
        </div>

        {/* Entity info */}
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          {React.createElement(entityIcon, { className: "w-4 h-4 text-blue-400 flex-shrink-0" })}
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-200 truncate">
              {entity?.name || 'Unknown Entity'}
            </div>
            <div className="text-xs text-slate-400">
              {entityType} • {entity?.types?.name || 'No type'}
            </div>
          </div>
        </div>

        {/* Link metadata */}
        <div className="text-xs text-slate-400 text-right flex-shrink-0">
          <div>{new Date(link.created_at).toLocaleDateString()}</div>
          <div>by {link.profiles?.username || 'Unknown'}</div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <ExternalLink className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-slate-100">Bulk Link Management</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filters and controls */}
        <div className="p-4 border-b border-slate-700 space-y-3">
          {/* Search and filter toggle */}
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search links by POI title, entity name, or description..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                showFilters
                  ? 'bg-blue-600 text-blue-100'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <select
                value={filters.mapType}
                onChange={(e) => setFilters(prev => ({ ...prev, mapType: e.target.value as any }))}
                className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100"
              >
                <option value="all">All Maps</option>
                <option value="hagga_basin">Hagga Basin</option>
                <option value="deep_desert">Deep Desert</option>
              </select>

              <select
                value={filters.entityType}
                onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value as any }))}
                className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100"
              >
                <option value="all">All Types</option>
                <option value="items">Items Only</option>
                <option value="schematics">Schematics Only</option>
              </select>

              <select
                value={filters.creatorFilter}
                onChange={(e) => setFilters(prev => ({ ...prev, creatorFilter: e.target.value }))}
                className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100"
              >
                <option value="all">All Creators</option>
                <option value="mine">My Links</option>
              </select>

              <select
                value={filters.dateFilter}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFilter: e.target.value as any }))}
                className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
              </select>
            </div>
          )}
        </div>

        {/* Selection summary and bulk operations */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-slate-300">
                Showing <span className="text-blue-300 font-medium">{filteredAndSortedLinks.length}</span> links
              </span>
              {selectedLinkIds.size > 0 && (
                <span className="text-blue-400">
                  <span className="font-medium">{selectedLinkIds.size}</span> selected
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Selection controls */}
              <button
                onClick={selectAllVisible}
                className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors"
              >
                Select Page
              </button>
              <button
                onClick={selectAllFiltered}
                className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors"
              >
                Select All ({filteredAndSortedLinks.length})
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors"
              >
                Clear
              </button>

              {/* Bulk operation controls */}
              {selectedLinkIds.size > 0 && (
                <>
                  <select
                    value={selectedOperation}
                    onChange={(e) => setSelectedOperation(e.target.value as BulkOperation)}
                    className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-slate-100"
                  >
                    <option value="delete">Delete Links</option>
                    <option value="export">Export Data</option>
                  </select>
                  <button
                    onClick={executeBulkOperation}
                    disabled={isProcessing}
                    className="px-4 py-1.5 text-sm bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded transition-colors"
                  >
                    {isProcessing ? 'Processing...' : `Execute (${selectedLinkIds.size})`}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        {isProcessing && (
          <div className="p-4 border-b border-slate-700">
            <EnhancedProgressIndicator
              operationId="bulk-link-operation"
              completed={Math.round((operationProgress / 100) * selectedLinkIds.size)}
              total={selectedLinkIds.size}
              status={operationProgress < 100 ? 'processing' : 'completed'}
              showDetails={true}
              showPerformanceMetrics={true}
            />
          </div>
        )}

        {/* Results feedback */}
        {operationResult && (
          <div className="p-4 border-b border-slate-700">
            <EnhancedFeedbackDisplay
              result={operationResult}
              isLoading={false}
              onClose={() => setOperationResult(null)}
            />
          </div>
        )}

        {/* Links list */}
        <div className="flex-1 overflow-hidden p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400">Loading links...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-400 mb-2">Error loading links</p>
                <p className="text-slate-400 text-sm">{error}</p>
                <button
                  onClick={fetchLinks}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : filteredAndSortedLinks.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <ExternalLink className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">No links found</p>
                <p className="text-slate-500 text-sm">Try adjusting your filters or create some links first.</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <VirtualizedList
                items={pagination.paginatedData(filteredAndSortedLinks)}
                itemHeight={80}
                renderItem={renderLinkItem}
                threshold={20}
                className="flex-1"
              />
              
              {/* Pagination */}
              <div className="mt-4">
                <PaginationControls
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={pagination.setPage}
                  totalItems={filteredAndSortedLinks.length}
                  itemsPerPage={pagination.itemsPerPage}
                  showDetails={true}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkLinkManagementModal; 