import { useMemo } from 'react';
import type { DateFilter, FilterOptions } from '../../components/layout/filterBar';

export interface FilterableItem {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  lastUpdated?: string;
  createdBy?: string;
  userId?: string;
  groupId?: string;
  groupIds?: string[];
  [key: string]: any;
}

export function useFilteredData<T extends FilterableItem>(data: T[], filters: FilterOptions): T[] {
  return useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.filter((item) => {
      if (filters.dateFilter) {
        const itemDate = getItemDate(item);
        if (itemDate && !isDateInRange(itemDate, filters.dateFilter)) {
          return false;
        }
      }

      if (filters.userFilter) {
        const itemUserId = getItemUserId(item);
        if (!itemUserId || itemUserId !== filters.userFilter) {
          return false;
        }
      }

      if (filters.groupFilter) {
        const itemGroupIds = getItemGroupIds(item);
        if (!itemGroupIds || !itemGroupIds.includes(filters.groupFilter)) {
          return false;
        }
      }

      return true;
    });
  }, [data, filters]);
}

function getItemDate(item: FilterableItem): Date | null {
  const dateString = item.updatedAt || item.lastUpdated || item.createdAt;
  if (!dateString) return null;

  try {
    return new Date(dateString);
  } catch {
    return null;
  }
}

function getItemUserId(item: FilterableItem): string | null {
  return item.userId || item.createdBy || null;
}

function getItemGroupIds(item: FilterableItem): string[] {
  if (item.groupIds && Array.isArray(item.groupIds)) {
    return item.groupIds;
  }
  if (item.groupId) {
    return [item.groupId];
  }
  return [];
}

function isDateInRange(date: Date, range: DateFilter): boolean {
  if (range.from) {
    const fromDate = new Date(range.from);
    fromDate.setHours(0, 0, 0, 0);
    if (date < fromDate) return false;
  }

  if (range.to) {
    const toDate = new Date(range.to);
    toDate.setHours(23, 59, 59, 999);
    if (date > toDate) return false;
  }

  return true;
}

export function createFiltersFromSearchParams(searchParams: URLSearchParams): FilterOptions {
  const filters: FilterOptions = {};

  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  if (dateFrom || dateTo) {
    filters.dateFilter = {};
    if (dateFrom) filters.dateFilter.from = dateFrom;
    if (dateTo) filters.dateFilter.to = dateTo;
  }

  const userFilter = searchParams.get('user');
  if (userFilter) filters.userFilter = userFilter;

  const groupFilter = searchParams.get('group');
  if (groupFilter) filters.groupFilter = groupFilter;

  return filters;
}

export function createSearchParamsFromFilters(filters: FilterOptions): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (filters.dateFilter?.from) {
    searchParams.set('dateFrom', filters.dateFilter.from);
  }
  if (filters.dateFilter?.to) {
    searchParams.set('dateTo', filters.dateFilter.to);
  }
  if (filters.userFilter) {
    searchParams.set('user', filters.userFilter);
  }
  if (filters.groupFilter) {
    searchParams.set('group', filters.groupFilter);
  }

  return searchParams;
}
