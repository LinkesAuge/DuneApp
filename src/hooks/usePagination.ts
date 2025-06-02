import { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export interface PaginationConfig {
  itemsPerPage?: number;
  maxVisiblePages?: number;
  urlParamPrefix?: string;
  persistInUrl?: boolean;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationActions {
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  setItemsPerPage: (items: number) => void;
}

export interface UsePaginationReturn extends PaginationState, PaginationActions {
  paginatedData: <T>(data: T[]) => T[];
  visiblePages: number[];
  resetPagination: () => void;
}

export function usePagination<T = any>(
  data: T[],
  config: PaginationConfig = {}
): UsePaginationReturn {
  const {
    itemsPerPage: defaultItemsPerPage = 50,
    maxVisiblePages = 5,
    urlParamPrefix = '',
    persistInUrl = false
  } = config;

  const location = useLocation();
  const navigate = useNavigate();

  // Get initial values from URL if enabled
  const getInitialPage = () => {
    if (persistInUrl) {
      const searchParams = new URLSearchParams(location.search);
      const pageParam = `${urlParamPrefix}page`;
      const page = parseInt(searchParams.get(pageParam) || '1', 10);
      return Math.max(1, page);
    }
    return 1;
  };

  const getInitialItemsPerPage = () => {
    if (persistInUrl) {
      const searchParams = new URLSearchParams(location.search);
      const itemsParam = `${urlParamPrefix}items`;
      const items = parseInt(searchParams.get(itemsParam) || String(defaultItemsPerPage), 10);
      return Math.max(1, Math.min(100, items)); // Limit between 1-100
    }
    return defaultItemsPerPage;
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [itemsPerPage, setItemsPerPageState] = useState(getInitialItemsPerPage);

  // Update URL when pagination changes
  const updateUrl = useCallback((page: number, items: number) => {
    if (!persistInUrl) return;

    const searchParams = new URLSearchParams(location.search);
    const pageParam = `${urlParamPrefix}page`;
    const itemsParam = `${urlParamPrefix}items`;

    if (page === 1) {
      searchParams.delete(pageParam);
    } else {
      searchParams.set(pageParam, String(page));
    }

    if (items === defaultItemsPerPage) {
      searchParams.delete(itemsParam);
    } else {
      searchParams.set(itemsParam, String(items));
    }

    const newUrl = `${location.pathname}?${searchParams.toString()}`;
    navigate(newUrl, { replace: true });
  }, [location, navigate, persistInUrl, urlParamPrefix, defaultItemsPerPage]);

  // Calculate pagination state
  const paginationState = useMemo((): PaginationState => {
    const totalItems = data.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    return {
      currentPage: safePage,
      totalPages,
      totalItems,
      itemsPerPage,
      startIndex,
      endIndex,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1
    };
  }, [data.length, currentPage, itemsPerPage]);

  // Calculate visible page numbers for pagination controls
  const visiblePages = useMemo(() => {
    const { totalPages, currentPage } = paginationState;
    const pages: number[] = [];

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages <= max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show subset with current page in the middle
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(1, currentPage - halfVisible);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      // Adjust start if we're near the end
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }, [paginationState.totalPages, paginationState.currentPage, maxVisiblePages]);

  // Pagination actions
  const goToPage = useCallback((page: number) => {
    const newPage = Math.max(1, Math.min(page, paginationState.totalPages));
    setCurrentPage(newPage);
    updateUrl(newPage, itemsPerPage);
  }, [paginationState.totalPages, itemsPerPage, updateUrl]);

  const goToNextPage = useCallback(() => {
    if (paginationState.hasNextPage) {
      goToPage(paginationState.currentPage + 1);
    }
  }, [paginationState.hasNextPage, paginationState.currentPage, goToPage]);

  const goToPreviousPage = useCallback(() => {
    if (paginationState.hasPreviousPage) {
      goToPage(paginationState.currentPage - 1);
    }
  }, [paginationState.hasPreviousPage, paginationState.currentPage, goToPage]);

  const goToFirstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const goToLastPage = useCallback(() => {
    goToPage(paginationState.totalPages);
  }, [goToPage, paginationState.totalPages]);

  const setItemsPerPage = useCallback((items: number) => {
    const newItems = Math.max(1, Math.min(100, items));
    const newTotalPages = Math.ceil(data.length / newItems);
    const newPage = Math.min(currentPage, newTotalPages);
    
    setItemsPerPageState(newItems);
    setCurrentPage(newPage);
    updateUrl(newPage, newItems);
  }, [data.length, currentPage, updateUrl]);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setItemsPerPageState(defaultItemsPerPage);
    updateUrl(1, defaultItemsPerPage);
  }, [defaultItemsPerPage, updateUrl]);

  // Get paginated data
  const paginatedData = useCallback(<T>(sourceData: T[]): T[] => {
    const { startIndex, endIndex } = paginationState;
    return sourceData.slice(startIndex, endIndex);
  }, [paginationState]);

  // Reset to first page when data changes significantly
  useEffect(() => {
    if (currentPage > paginationState.totalPages && paginationState.totalPages > 0) {
      goToPage(1);
    }
  }, [data.length, currentPage, paginationState.totalPages, goToPage]);

  // Update current page if URL changes
  useEffect(() => {
    if (persistInUrl) {
      const newPage = getInitialPage();
      const newItemsPerPage = getInitialItemsPerPage();
      
      if (newPage !== currentPage) {
        setCurrentPage(newPage);
      }
      if (newItemsPerPage !== itemsPerPage) {
        setItemsPerPageState(newItemsPerPage);
      }
    }
  }, [location.search]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // State
    ...paginationState,
    
    // Actions
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    setItemsPerPage,
    
    // Utils
    paginatedData,
    visiblePages,
    resetPagination
  };
} 