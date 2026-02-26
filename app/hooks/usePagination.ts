// Pagination hook for managing paginated data

import { useState, useMemo, useCallback } from 'react';

interface UsePaginationOptions {
  totalCount: number;
  pageSize: number;
  siblingCount?: number;
  currentPage?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: () => void;
  previousPage: () => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  paginationRange: (number | string)[];
  startIndex: number;
  endIndex: number;
}

const range = (start: number, end: number): number[] => {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};

export function usePagination({
  totalCount,
  pageSize: initialPageSize,
  siblingCount = 1,
  currentPage: initialPage = 1,
}: UsePaginationOptions): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalPages = Math.ceil(totalCount / pageSize);

  const paginationRange = useMemo(() => {
    const totalPageNumbers = siblingCount * 2 + 5;

    // Case 1: If the number of pages is less than the page numbers we want to show
    if (totalPages <= totalPageNumbers) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case 2: No left dots to show, but rights dots to be shown
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 2 * siblingCount + 3;
      const leftRange = range(1, leftItemCount);

      return [...leftRange, '...', totalPages];
    }

    // Case 3: No right dots to show, but left dots to be shown
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 2 * siblingCount + 3;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);

      return [firstPageIndex, '...', ...rightRange];
    }

    // Case 4: Both left and right dots to be shown
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);

      return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
    }

    return [];
  }, [totalPages, siblingCount, currentPage]);

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage, hasPreviousPage]);

  const setPage = useCallback(
    (page: number) => {
      const pageNumber = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(pageNumber);
    },
    [totalPages]
  );

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1); // Reset to first page when page size changes
  }, []);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize - 1, totalCount - 1);

  return {
    currentPage,
    totalPages,
    pageSize,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    setPage,
    setPageSize,
    paginationRange,
    startIndex,
    endIndex,
  };
}