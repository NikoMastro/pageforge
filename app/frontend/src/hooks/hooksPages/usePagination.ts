import { useState, useMemo } from 'react';

interface UsePaginationProps<T> {
  items: T[];
  itemsPerPage?: number;
  initialPage?: number;
}

interface UsePaginationResult<T> {
  currentPage: number;
  totalPages: number;
  currentItems: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  startIndex: number;
  endIndex: number;
}

/**
 * Custom hook to manage client-side pagination
 *
 * @param items - Array of items to paginate
 * @param itemsPerPage - Number of items per page (default: 100)
 * @param initialPage - Initial page (default: 1)
 * @returns Object containing pagination state and navigation methods
 *
 * @example
 * ```tsx
 * const { currentItems, currentPage, totalPages, goToPage } = usePagination({
 *   items: myArray,
 *   itemsPerPage: 100
 * });
 *
 * return (
 *   <>
 *     {currentItems.map(item => <ItemCard key={item.id} item={item} />)}
 *     <Pagination
 *       currentPage={currentPage}
 *       totalItems={myArray.length}
 *       itemsPerPage={100}
 *       onPageChange={goToPage}
 *     />
 *   </>
 * );
 * ```
 */
export function usePagination<T>({
  items,
  itemsPerPage = 100,
  initialPage = 1,
}: UsePaginationProps<T>): UsePaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  // Ensure the current page is valid
  const validatedPage = useMemo(() => {
    if (currentPage < 1) return 1;
    if (currentPage > totalPages && totalPages > 0) return totalPages;
    return currentPage;
  }, [currentPage, totalPages]);

  // Calculate items for the current page
  const currentItems = useMemo(() => {
    const startIndex = (validatedPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, validatedPage, itemsPerPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (validatedPage < totalPages) {
      setCurrentPage(validatedPage + 1);
    }
  };

  const previousPage = () => {
    if (validatedPage > 1) {
      setCurrentPage(validatedPage - 1);
    }
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToLastPage = () => {
    if (totalPages > 0) {
      setCurrentPage(totalPages);
    }
  };

  const startIndex = (validatedPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, items.length);

  return {
    currentPage: validatedPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
    canGoNext: validatedPage < totalPages,
    canGoPrevious: validatedPage > 1,
    startIndex,
    endIndex,
  };
}

export default usePagination;
