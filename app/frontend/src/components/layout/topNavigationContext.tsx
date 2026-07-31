import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import type { FilterOptions } from './filterBar';

export type ViewMode = 'cards' | 'list';

export type TopNavState = {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filters: FilterOptions;
  setFilters: (f: FilterOptions) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  refreshCallback?: () => void | Promise<void>;
  setRefreshCallback: (callback?: () => void | Promise<void>) => void;
  isRefreshing: boolean;
  setIsRefreshing: (refreshing: boolean) => void;
  onSaveConfiguration?: () => void;
  setOnSaveConfiguration: (callback?: () => void) => void;
  onLoadConfiguration?: () => void;
  setOnLoadConfiguration: (callback?: () => void) => void;
};

const TopNavigationContext = createContext<TopNavState | undefined>(undefined);

export const useTopNavigation = (): TopNavState => {
  const ctx = useContext(TopNavigationContext);
  if (!ctx) throw new Error('useTopNavigation must be used within TopNavigationProvider');
  return ctx;
};

export const TopNavigationProvider: React.FC<{ children: React.ReactNode } & {
  initialSearchQuery?: string;
  initialFilters?: FilterOptions;
  initialViewMode?: ViewMode;
}> = ({ children, initialSearchQuery = '', initialFilters = {}, initialViewMode = 'list' }) => {
  const [searchQuery, setSearchQueryState] = useState<string>(initialSearchQuery);
  const [filters, setFiltersState] = useState<FilterOptions>(initialFilters);
  const [viewMode, setViewModeState] = useState<ViewMode>(initialViewMode);
  const [isRefreshing, setIsRefreshingState] = useState<boolean>(false);
  const [refreshCallback, setRefreshCallbackState] = useState<(() => void | Promise<void>) | undefined>(undefined);
  const [onSaveConfiguration, setOnSaveConfigurationState] = useState<(() => void) | undefined>(undefined);
  const [onLoadConfiguration, setOnLoadConfigurationState] = useState<(() => void) | undefined>(undefined);

  // Wrap all setters in useCallback to prevent them from changing on every render
  const setSearchQuery = useCallback((q: string) => setSearchQueryState(q), []);
  const setFilters = useCallback((f: FilterOptions) => setFiltersState(f), []);
  const setViewMode = useCallback((mode: ViewMode) => setViewModeState(mode), []);
  const setRefreshCallback = useCallback((callback?: () => void | Promise<void>) => {
    setRefreshCallbackState(() => callback);  // Use functional update to set the callback
  }, []);
  const setIsRefreshing = useCallback((refreshing: boolean) => setIsRefreshingState(refreshing), []);
  const setOnSaveConfiguration = useCallback((callback?: () => void) => {
    setOnSaveConfigurationState(() => callback);  // Wrap in function to store the callback
  }, []);
  const setOnLoadConfiguration = useCallback((callback?: () => void) => {
    setOnLoadConfigurationState(() => callback);  // Wrap in function to store the callback
  }, []);

  const value = useMemo(() => ({
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    viewMode,
    setViewMode,
    refreshCallback,
    setRefreshCallback,
    isRefreshing,
    setIsRefreshing,
    onSaveConfiguration,
    setOnSaveConfiguration,
    onLoadConfiguration,
    setOnLoadConfiguration
  }), [searchQuery, filters, viewMode, refreshCallback, isRefreshing, onSaveConfiguration, onLoadConfiguration, setSearchQuery, setFilters, setViewMode, setRefreshCallback, setIsRefreshing, setOnSaveConfiguration, setOnLoadConfiguration]);

  return (
    <TopNavigationContext.Provider value={value}>
      {children}
    </TopNavigationContext.Provider>
  );
};
