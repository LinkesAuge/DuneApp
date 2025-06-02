import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';
import { UsePaginationReturn } from '../../hooks/usePagination';
import { cn } from '../../lib/utils';

export interface PaginationControlsProps {
  pagination: UsePaginationReturn;
  className?: string;
  showItemsPerPage?: boolean;
  showTotalItems?: boolean;
  showPageInfo?: boolean;
  itemsPerPageOptions?: number[];
  compact?: boolean;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  pagination,
  className,
  showItemsPerPage = true,
  showTotalItems = true,
  showPageInfo = true,
  itemsPerPageOptions = [25, 50, 100],
  compact = false
}) => {
  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    startIndex,
    endIndex,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    setItemsPerPage,
    visiblePages
  } = pagination;

  // Don't render if there's only one page and no items per page selector
  if (totalPages <= 1 && !showItemsPerPage) {
    return null;
  }

  const buttonBaseClasses = `
    inline-flex items-center justify-center
    min-w-[40px] h-10 px-3
    text-sm font-medium
    border border-sand-200 
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-spice-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const pageButtonClasses = `
    ${buttonBaseClasses}
    bg-sand-50 text-sand-700 hover:bg-sand-100 hover:text-sand-900
    data-[active=true]:bg-spice-500 data-[active=true]:text-white 
    data-[active=true]:border-spice-500 data-[active=true]:shadow-md
  `;

  const navigationButtonClasses = `
    ${buttonBaseClasses}
    bg-sand-100 text-sand-600 hover:bg-sand-200 hover:text-sand-800
    disabled:bg-sand-50 disabled:text-sand-400
  `;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {/* Navigation buttons */}
        <div className="flex items-center">
          <button
            onClick={goToPreviousPage}
            disabled={!hasPreviousPage}
            className={`${navigationButtonClasses} rounded-l-md`}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="px-4 py-2 text-sm text-sand-600 bg-sand-50 border-t border-b border-sand-200">
            {currentPage} / {totalPages}
          </div>
          
          <button
            onClick={goToNextPage}
            disabled={!hasNextPage}
            className={`${navigationButtonClasses} rounded-r-md`}
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Items per page (compact) */}
        {showItemsPerPage && (
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="px-2 py-1 text-sm border border-sand-200 rounded bg-sand-50 text-sand-700 focus:outline-none focus:ring-2 focus:ring-spice-500"
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}/page
              </option>
            ))}
          </select>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4", className)}>
      {/* Items per page and info */}
      <div className="flex items-center gap-4">
        {showItemsPerPage && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-sand-600">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3 py-2 text-sm border border-sand-200 rounded-md bg-sand-50 text-sand-700 hover:bg-sand-100 focus:outline-none focus:ring-2 focus:ring-spice-500 focus:ring-offset-2"
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option} items
                </option>
              ))}
            </select>
          </div>
        )}

        {showTotalItems && totalItems > 0 && (
          <div className="text-sm text-sand-600">
            {showPageInfo ? (
              <>
                Showing {startIndex + 1}–{endIndex} of {totalItems} items
              </>
            ) : (
              <>
                {totalItems} {totalItems === 1 ? 'item' : 'items'} total
              </>
            )}
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* First page */}
          <button
            onClick={goToFirstPage}
            disabled={!hasPreviousPage}
            className={`${navigationButtonClasses} rounded-l-md`}
            aria-label="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous page */}
          <button
            onClick={goToPreviousPage}
            disabled={!hasPreviousPage}
            className={navigationButtonClasses}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page numbers */}
          <div className="flex items-center">
            {/* Show ellipsis before visible pages if needed */}
            {visiblePages.length > 0 && visiblePages[0] > 1 && (
              <>
                <button
                  onClick={() => goToPage(1)}
                  className={pageButtonClasses}
                  data-active={currentPage === 1}
                >
                  1
                </button>
                {visiblePages[0] > 2 && (
                  <span className="px-2 text-sand-400">
                    <MoreHorizontal className="w-4 h-4" />
                  </span>
                )}
              </>
            )}

            {/* Visible page numbers */}
            {visiblePages.map((page, index) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={cn(
                  pageButtonClasses,
                  index === 0 && visiblePages[0] === 1 && "rounded-l-md",
                  index === visiblePages.length - 1 && visiblePages[visiblePages.length - 1] === totalPages && "rounded-r-md"
                )}
                data-active={currentPage === page}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            ))}

            {/* Show ellipsis after visible pages if needed */}
            {visiblePages.length > 0 && visiblePages[visiblePages.length - 1] < totalPages && (
              <>
                {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                  <span className="px-2 text-sand-400">
                    <MoreHorizontal className="w-4 h-4" />
                  </span>
                )}
                <button
                  onClick={() => goToPage(totalPages)}
                  className={pageButtonClasses}
                  data-active={currentPage === totalPages}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          {/* Next page */}
          <button
            onClick={goToNextPage}
            disabled={!hasNextPage}
            className={navigationButtonClasses}
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Last page */}
          <button
            onClick={goToLastPage}
            disabled={!hasNextPage}
            className={`${navigationButtonClasses} rounded-r-md`}
            aria-label="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PaginationControls; 