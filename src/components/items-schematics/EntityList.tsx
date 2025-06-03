// EntityList Component for Unified Entities System
import React, { useState, useEffect } from 'react';
import { Grid3X3, List, Search, SortAsc, SortDesc, Filter, Package, FileText } from 'lucide-react';
import { entitiesAPI, EntityAPIError } from '../../lib/api/entities';
import type { Entity, EntityFilters, EntityResponse } from '../../types/unified-entities';
import { TIER_NAMES } from '../../types/unified-entities';
import EntityCard from './EntityCard';

interface EntityListProps {
  // Filtering
  filters?: EntityFilters;
  searchTerm?: string;
  // Display
  viewMode?: 'grid' | 'list';
  showSearch?: boolean;
  showFilters?: boolean;
  // Actions
  onEntitySelect?: (entity: Entity) => void;
  onEntityEdit?: (entity: Entity) => void;
  onEntityDelete?: (entity: Entity) => void;
  onEntityPoiLink?: (entity: Entity) => void;
  // Bulk selection
  selectedEntityIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  selectionMode?: boolean;
  // Data refresh
  refreshTrigger?: number;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
      <p className="text-amber-200 font-light tracking-wide"
         style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
        Loading entities...
      </p>
    </div>
  </div>
);

const ErrorMessage: React.FC<{ error: string; onRetry?: () => void }> = ({ error, onRetry }) => (
  <div className="group relative">
    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
    <div className="absolute inset-0 bg-gradient-to-b from-red-600/10 via-red-500/5 to-transparent rounded-lg" />
    
    <div className="relative p-4 rounded-lg border border-red-400/40">
      <p className="text-red-300 font-light mb-3"
         style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
        Error loading entities: {error}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600/20 text-red-300 border border-red-500/40 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
        >
          Retry
        </button>
      )}
    </div>
  </div>
);

const EmptyState: React.FC<{ filters?: EntityFilters; searchTerm?: string }> = ({ filters, searchTerm }) => {
  const hasFilters = searchTerm || filters?.category || filters?.type || filters?.tier_number !== undefined || filters?.is_schematic !== undefined;
  
  return (
    <div className="text-center py-12">
      <div className="inline-block p-4 rounded-full border border-amber-400/20 mb-6 bg-slate-800/60">
        <Package className="w-8 h-8 text-amber-400" />
      </div>
      <p className="text-amber-200 text-lg mb-2 font-light tracking-wide"
         style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
        {hasFilters ? 'No matching entities found' : 'No entities found'}
      </p>
      <p className="text-amber-200/60 font-light"
         style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
        {hasFilters ? 'Try adjusting your search or filter criteria.' : 'Entities will appear here once they are added to the database.'}
      </p>
    </div>
  );
};

const EntityList: React.FC<EntityListProps> = ({
  filters = {},
  searchTerm = '',
  viewMode = 'grid',
  showSearch = true,
  showFilters = false,
  onEntitySelect,
  onEntityEdit,
  onEntityDelete,
  onEntityPoiLink,
  selectedEntityIds = [],
  onSelectionChange,
  selectionMode = false,
  refreshTrigger = 0
}) => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 50,
    total: 0,
    hasMore: false
  });

  // Fetch entities from API
  const fetchEntities = async (searchQuery = localSearchTerm, offset = 0) => {
    try {
      setLoading(true);
      setError(null);

      const apiFilters: EntityFilters = {
        ...filters,
        search: searchQuery || undefined,
        limit: pagination.limit,
        offset
      };

      const response: EntityResponse = await entitiesAPI.getAll(apiFilters);
      
      if (offset === 0) {
        setEntities(response.data);
      } else {
        setEntities(prev => [...prev, ...response.data]);
      }

      setPagination(prev => ({
        ...prev,
        offset: offset,
        total: response.total,
        hasMore: response.has_more
      }));
    } catch (err) {
      console.error('Error fetching entities:', err);
      if (err instanceof EntityAPIError) {
        setError(err.message);
      } else {
        setError('Failed to load entities. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Effect for initial load and filter changes
  useEffect(() => {
    fetchEntities(searchTerm, 0);
  }, [filters, searchTerm, refreshTrigger]);

  // Effect for local search term changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchTerm !== searchTerm) {
        fetchEntities(localSearchTerm, 0);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchTerm]);

  // Load more entities (pagination)
  const loadMore = () => {
    if (!loading && pagination.hasMore) {
      fetchEntities(localSearchTerm, pagination.offset + pagination.limit);
    }
  };

  // Handle entity selection
  const handleEntityClick = (entity: Entity) => {
    onEntitySelect?.(entity);
  };

  // Handle bulk selection
  const handleSelectionToggle = (entityId: string) => {
    if (!onSelectionChange) return;

    const newSelectedIds = selectedEntityIds.includes(entityId)
      ? selectedEntityIds.filter(id => id !== entityId)
      : [...selectedEntityIds, entityId];
    
    onSelectionChange(newSelectedIds);
  };

  // Handle select all visible
  const handleSelectAllVisible = () => {
    if (!onSelectionChange) return;

    const visibleIds = entities.map(entity => entity.id);
    const allSelected = visibleIds.every(id => selectedEntityIds.includes(id));
    
    if (allSelected) {
      // Deselect all visible
      const newSelectedIds = selectedEntityIds.filter(id => !visibleIds.includes(id));
      onSelectionChange(newSelectedIds);
    } else {
      // Select all visible
      const newSelectedIds = [...new Set([...selectedEntityIds, ...visibleIds])];
      onSelectionChange(newSelectedIds);
    }
  };

  // Calculate selection stats
  const selectedCount = selectedEntityIds.length;
  const visibleSelectedCount = entities.filter(entity => selectedEntityIds.includes(entity.id)).length;
  const allVisibleSelected = entities.length > 0 && visibleSelectedCount === entities.length;

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      {(showSearch || selectionMode) && (
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          {showSearch && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-400" />
              <input
                type="text"
                placeholder="Search entities..."
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-amber-100 placeholder-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              />
            </div>
          )}

          {/* Selection Controls */}
          {selectionMode && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-amber-200/80">
                {selectedCount} selected
              </span>
              <button
                onClick={handleSelectAllVisible}
                className="px-3 py-1 text-sm bg-amber-600/20 text-amber-300 border border-amber-500/40 rounded hover:bg-amber-600/30 transition-colors"
              >
                {allVisibleSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results Summary */}
      {!loading && !error && (
        <div className="flex items-center justify-between text-sm text-amber-200/60">
          <span>
            Showing {entities.length} of {pagination.total} entities
          </span>
          {pagination.hasMore && (
            <button
              onClick={loadMore}
              className="px-3 py-1 bg-slate-700 text-amber-300 border border-slate-600 rounded hover:bg-slate-600 transition-colors"
            >
              Load More
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {loading && entities.length === 0 ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage error={error} onRetry={() => fetchEntities(localSearchTerm, 0)} />
      ) : entities.length === 0 ? (
        <EmptyState filters={filters} searchTerm={localSearchTerm} />
      ) : (
        <>
          {/* Entity Grid/List */}
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-3'
          }>
            {entities.map((entity) => (
              <EntityCard
                key={entity.id}
                entity={entity}
                onClick={handleEntityClick}
                onEdit={onEntityEdit}
                onDelete={onEntityDelete}
                onPoiLink={onEntityPoiLink}
                isSelected={selectedEntityIds.includes(entity.id)}
                onSelectionToggle={handleSelectionToggle}
                selectionMode={selectionMode}
                compact={viewMode === 'list'}
              />
            ))}
          </div>

          {/* Load More Button */}
          {pagination.hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2 bg-amber-600/20 text-amber-300 border border-amber-500/40 rounded-lg hover:bg-amber-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EntityList; 