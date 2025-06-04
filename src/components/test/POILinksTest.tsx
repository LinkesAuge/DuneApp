import React from 'react';
import { usePOILinks } from '../../hooks/usePOILinks';

/**
 * Test component to validate POI Links hook and data transformation
 * This is for Day 1 foundation verification only
 */
export const POILinksTest: React.FC = () => {
  const {
    poiLinks,
    loading,
    error,
    pagination,
    sorting,
    filters,
    totalCount,
    filteredCount,
    setPage,
    setSorting,
    setFilters
  } = usePOILinks();

  if (loading) {
    return (
      <div className="p-4 bg-night-800 text-sand-100">
        <h2 className="text-xl font-bold mb-4">POI Links Test - Loading...</h2>
        <div className="animate-pulse">Loading POI links data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-night-800 text-sand-100">
        <h2 className="text-xl font-bold mb-4">POI Links Test - Error</h2>
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-night-800 text-sand-100 space-y-4">
      <h2 className="text-xl font-bold">POI Links Test - Day 1 Foundation</h2>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-night-700 rounded">
        <div>
          <div className="text-sm text-sand-400">Total Links</div>
          <div className="text-lg font-bold">{totalCount}</div>
        </div>
        <div>
          <div className="text-sm text-sand-400">Filtered Links</div>
          <div className="text-lg font-bold">{filteredCount}</div>
        </div>
        <div>
          <div className="text-sm text-sand-400">POI Groups</div>
          <div className="text-lg font-bold">{poiLinks.length}</div>
        </div>
        <div>
          <div className="text-sm text-sand-400">Current Page</div>
          <div className="text-lg font-bold">{pagination.currentPage} / {pagination.totalPages}</div>
        </div>
      </div>

      {/* Filter Controls Test */}
      <div className="p-4 bg-night-700 rounded space-y-2">
        <h3 className="font-bold">Filter Tests</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="px-2 py-1 bg-night-600 text-sand-100 rounded"
          />
          <select
            value={filters.mapType}
            onChange={(e) => setFilters({ mapType: e.target.value as 'hagga_basin' | 'deep_desert' | 'both' })}
            className="px-2 py-1 bg-night-600 text-sand-100 rounded"
          >
            <option value="both">Both Maps</option>
            <option value="hagga_basin">Hagga Basin</option>
            <option value="deep_desert">Deep Desert</option>
          </select>
        </div>
      </div>

      {/* Sorting Controls Test */}
      <div className="p-4 bg-night-700 rounded space-y-2">
        <h3 className="font-bold">Sorting Tests</h3>
        <div className="flex gap-2">
          <select
            value={sorting.field}
            onChange={(e) => setSorting({ ...sorting, field: e.target.value as any })}
            className="px-2 py-1 bg-night-600 text-sand-100 rounded"
          >
            <option value="poi_created_at">POI Created Date</option>
            <option value="poi_title">POI Title</option>
            <option value="latest_link">Latest Link</option>
          </select>
          <select
            value={sorting.direction}
            onChange={(e) => setSorting({ ...sorting, direction: e.target.value as 'asc' | 'desc' })}
            className="px-2 py-1 bg-night-600 text-sand-100 rounded"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Tree Data Structure Display */}
      <div className="p-4 bg-night-700 rounded space-y-2">
        <h3 className="font-bold">POI Tree Structure (Preview)</h3>
        <div className="max-h-96 overflow-y-auto space-y-2">
          {poiLinks.map((poiLink) => (
            <div key={poiLink.poi.id} className="border border-night-600 rounded p-2">
              <div className="flex justify-between items-center">
                <div className="font-medium">
                  📍 {poiLink.poi.title} 
                  <span className="text-sm text-sand-400 ml-2">
                    ({poiLink.totalLinks} links)
                  </span>
                </div>
                <div className="text-xs text-sand-400">
                  {poiLink.poi.map_type}
                </div>
              </div>
              
              {poiLink.expanded && (
                <div className="ml-4 mt-2 space-y-1">
                  {poiLink.entities.map((entityLink) => (
                    <div key={`${entityLink.poi_id}-${entityLink.entity_id}`} className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-2">
                        <span>{entityLink.entity.icon}</span>
                        <span>{entityLink.entity.name}</span>
                        <span className="text-xs text-sand-400">
                          ({entityLink.entity.entity_class})
                        </span>
                      </div>
                      <div className="text-xs text-sand-400">
                        Tier {entityLink.entity.tier_number}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Test */}
      <div className="p-4 bg-night-700 rounded">
        <h3 className="font-bold mb-2">Pagination Test</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, pagination.currentPage - 1))}
            disabled={pagination.currentPage <= 1}
            className="px-3 py-1 bg-spice-600 text-sand-100 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(pagination.totalPages, pagination.currentPage + 1))}
            disabled={pagination.currentPage >= pagination.totalPages}
            className="px-3 py-1 bg-spice-600 text-sand-100 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Raw Data Debug */}
      <details className="p-4 bg-night-700 rounded">
        <summary className="font-bold cursor-pointer">Debug: Raw Hook Data</summary>
        <pre className="mt-2 text-xs overflow-auto max-h-48 bg-night-800 p-2 rounded">
          {JSON.stringify({ 
            pagination, 
            sorting, 
            filters,
            poiLinksCount: poiLinks.length,
            firstPOI: poiLinks[0] || null
          }, null, 2)}
        </pre>
      </details>
    </div>
  );
}; 