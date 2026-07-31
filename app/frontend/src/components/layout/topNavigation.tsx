import React from 'react';
import Searchbar from './searchbar';
import { useTopNavigation } from './topNavigationContext';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export interface TopNavigationProps {
  // Search
  searchPlaceholder?: string;
  searchValue?: string;
  onSearch?: (query: string) => void;
  onSearchClear?: () => void;
  searchDisabled?: boolean;

  // Layout
  className?: string;
  rightContent?: React.ReactNode;

  // Refresh
  showRefresh?: boolean;
}

const TopNavigation: React.FC<TopNavigationProps> = (props) => {
  const ctx = (() => {
    try { return useTopNavigation(); } catch { return undefined; }
  })();

  const {
    searchPlaceholder = 'Search…',
    searchValue,
    onSearch,
    onSearchClear,
    searchDisabled = false,
    className = '',
    rightContent,
    showRefresh = false
  } = props;

  const effectiveSearchValue = ctx ? ctx.searchQuery : searchValue;
  const handleSearch = (q: string) => {
    if (ctx) ctx.setSearchQuery(q);
    if (onSearch) onSearch(q);
  };
  const handleClear = () => {
    if (ctx) ctx.setSearchQuery('');
    if (onSearchClear) onSearchClear();
    if (onSearch) onSearch('');
  };

  const handleRefresh = async () => {
    if (ctx?.refreshCallback) {
      ctx.setIsRefreshing(true);
      try {
        await ctx.refreshCallback();
      } finally {
        ctx.setIsRefreshing(false);
      }
    }
  };

  const showRefreshButton = showRefresh && ctx?.refreshCallback;
  const isRefreshing = ctx?.isRefreshing ?? false;

  return (
    <div className={`w-full ${className}`}>
      <div className="space-y-3">
        {/* Search */}
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-4">
          <div className="flex-1 min-w-0">
            <Searchbar
              placeholder={searchPlaceholder}
              value={effectiveSearchValue}
              onSearch={handleSearch}
              onClear={handleClear}
              disabled={searchDisabled}
              className="w-full"
            />
          </div>

          <div className="flex-none md:self-stretch flex items-center justify-end gap-2">
            {showRefreshButton && (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            )}
            {rightContent && (
              <div className="flex items-center">
                {rightContent}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;
