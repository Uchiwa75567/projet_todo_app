import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

interface UsePaginationOptions {
  items: any[];
  defaultPageSize?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  paginatedItems: any[];
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (size: number) => void;
  setSearchParams: (params: Record<string, string>) => void;
}

export const usePagination = (
  { items, defaultPageSize = 6, searchParams, setSearchParams }: UsePaginationOptions & { searchParams: URLSearchParams; setSearchParams: (updater: (prev: URLSearchParams) => URLSearchParams) => void }
): UsePaginationReturn => {
  // Get values from URL params with defaults
  const pageSize = Number(searchParams.get('size')) || defaultPageSize;
  const currentPage = Number(searchParams.get('page')) || 1;

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Calculate paginated items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', newPage.toString());
      return newParams;
    });
  };

  const handlePageSizeChange = (newSize: number) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('size', newSize.toString());
      newParams.set('page', '1'); // Reset to first page
      return newParams;
    });
  };

  const updateSearchParams = (params: Record<string, string>) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });
      newParams.set('page', '1'); // Reset page when filters change
      return newParams;
    });
  };

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems,
    handlePageChange,
    handlePageSizeChange,
    setSearchParams: updateSearchParams,
  };
};
