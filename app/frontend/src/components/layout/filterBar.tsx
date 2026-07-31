import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  UserIcon,
  UserGroupIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import type { CardGroupDTO } from '../../services/groups.service';
import groupsService from '../../services/groups.service';

export interface DateFilter {
  from?: string;
  to?: string;
}

export interface FilterOptions {
  dateFilter?: DateFilter;
  userFilter?: string;
  groupFilter?: string;
  mediaType?: 'all' | 'images' | 'videos';
}

interface FilterBarProps {
  onFilterChange?: (filters: FilterOptions) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: {
    user?: string;
    group?: string;
  };
  // Optional initial values
  initialFilters?: FilterOptions;
  // Optional list of users (if you have access to them)
  availableUsers?: Array<{ id: string; email: string; displayName?: string }>;
  // Compact mode for integration with Searchbar
  isExpanded?: boolean;
  compact?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  onFilterChange,
  className = "",
  disabled = false,
  placeholder = {},
  initialFilters = {},
  availableUsers = [],
  isExpanded = false,
  compact = false
}) => {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [availableGroups, setAvailableGroups] = useState<CardGroupDTO[]>([]);
  const [dropdownStates, setDropdownStates] = useState({
    user: false,
    group: false
  });

  // Use external expansion state if provided, otherwise use internal
  const expanded = isExpanded !== undefined ? isExpanded : internalExpanded;
  const toggleExpanded = () => {
    if (isExpanded === undefined) {
      setInternalExpanded(!internalExpanded);
    }
    // If isExpanded is controlled externally, we don't toggle internally
  };

  // Load available groups on component mount
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const groups = await groupsService.getAllGroups();
        setAvailableGroups(groups);
      } catch (error) {
        console.error('Failed to load groups:', error);
      }
    };
    loadGroups();
  }, []);

  // Notify parent component when filters change
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  const handleDateFilterChange = (type: 'from' | 'to', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateFilter: {
        ...prev.dateFilter,
        [type]: value || undefined
      }
    }));
  };

  const handleUserFilterChange = (userId: string) => {
    setFilters(prev => ({
      ...prev,
      userFilter: userId || undefined
    }));
    setDropdownStates(prev => ({ ...prev, user: false }));
  };

  const handleGroupFilterChange = (groupId: string) => {
    setFilters(prev => ({
      ...prev,
      groupFilter: groupId || undefined
    }));
    setDropdownStates(prev => ({ ...prev, group: false }));
  };

  const clearAllFilters = () => {
    setFilters({});
    setDropdownStates({ user: false, group: false });
  };

  const toggleDropdown = (type: 'user' | 'group') => {
    setDropdownStates(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const hasActiveFilters = () => {
    return !!(
      filters.dateFilter?.from ||
      filters.dateFilter?.to ||
      filters.userFilter ||
      filters.groupFilter
    );
  };

  const getSelectedUserDisplay = () => {
    if (!filters.userFilter) return placeholder.user || "All Users";
    const user = availableUsers.find(u => u.id === filters.userFilter);
    return user?.displayName || user?.email || filters.userFilter;
  };

  const getSelectedGroupDisplay = () => {
    if (!filters.groupFilter) return placeholder.group || "All Groups";
    const group = availableGroups.find(g => g.id === filters.groupFilter);
    return group?.name || filters.groupFilter;
  };

  return (
    <div className={`bg-gray-800 border border-gray-600 rounded-lg ${className}`}>
      {/* Compact mode - only show when expanded is false and compact is true */}
      {compact && !expanded && (
        <div className="p-3">
          <div className="text-sm text-gray-400 text-center">
            {hasActiveFilters() && (
              <span className="text-blue-400">
                {Object.values(filters).filter(Boolean).length} filter{Object.values(filters).filter(Boolean).length !== 1 ? 's' : ''} active
              </span>
            )}
            {!hasActiveFilters() && "No filters applied"}
          </div>
        </div>
      )}

      {/* Full FilterBar - shown when not in compact mode or when expanded */}
      {(!compact || expanded) && (
        <>
          {/* Filter Toggle Header */}
          <div className="flex items-center justify-between p-4">
            <button
              onClick={toggleExpanded}
              disabled={disabled}
              className={`
                flex items-center gap-2 text-gray-200 hover:text-white transition-colors
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <FunnelIcon className="h-5 w-5" />
              <span className="font-medium">Filters</span>
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
              />
            </button>

            <div className="flex items-center gap-2">
              {hasActiveFilters() && (
                <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">
                  {Object.values(filters).filter(Boolean).length} active
                </span>
              )}

              {hasActiveFilters() && (
                <button
                  onClick={clearAllFilters}
                  disabled={disabled}
                  className={`
                    p-1 text-gray-400 hover:text-gray-200 transition-colors rounded
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}
                  `}
                  aria-label="Clear all filters"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Controls */}
          {expanded && (
            <div className="border-t border-gray-600 p-4 space-y-4">
              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-200">
                  <CalendarIcon className="h-4 w-4" />
                  Date Range
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">From</label>
                    <input
                      type="date"
                      value={filters.dateFilter?.from || ''}
                      onChange={(e) => handleDateFilterChange('from', e.target.value)}
                      disabled={disabled}
                      className={`
                        w-full px-3 py-2 text-sm
                        bg-gray-700 border border-gray-600 rounded-md
                        text-gray-200 placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">To</label>
                    <input
                      type="date"
                      value={filters.dateFilter?.to || ''}
                      onChange={(e) => handleDateFilterChange('to', e.target.value)}
                      disabled={disabled}
                      className={`
                    w-full px-3 py-2 text-sm
                    bg-gray-700 border border-gray-600 rounded-md
                    text-gray-200 placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                    />
                  </div>
                </div>
              </div>

              {/* User Filter */}
              <div className="space-y-2 relative">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-200">
                  <UserIcon className="h-4 w-4" />
                  User
                </label>
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('user')}
                    disabled={disabled || availableUsers.length === 0}
                    className={`
                  w-full px-3 py-2 text-sm text-left
                  bg-gray-700 border border-gray-600 rounded-md
                  text-gray-200 hover:bg-gray-650 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-between
                `}
                  >
                    <span className={filters.userFilter ? 'text-gray-200' : 'text-gray-400'}>
                      {getSelectedUserDisplay()}
                    </span>
                    <ChevronDownIcon className={`h-4 w-4 transition-transform ${dropdownStates.user ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownStates.user && availableUsers.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      <button
                        onClick={() => handleUserFilterChange('')}
                        className="w-full px-3 py-2 text-sm text-left text-gray-200 hover:bg-gray-600 transition-colors"
                      >
                        All Users
                      </button>
                      {availableUsers.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleUserFilterChange(user.id)}
                          className={`
                        w-full px-3 py-2 text-sm text-left hover:bg-gray-600 transition-colors
                        ${filters.userFilter === user.id ? 'bg-blue-400/20 text-blue-200' : 'text-gray-200'}
                      `}
                        >
                          {user.displayName || user.email}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Group Filter */}
              <div className="space-y-2 relative">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-200">
                  <UserGroupIcon className="h-4 w-4" />
                  Group
                </label>
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('group')}
                    disabled={disabled}
                    className={`
                  w-full px-3 py-2 text-sm text-left
                  bg-gray-700 border border-gray-600 rounded-md
                  text-gray-200 hover:bg-gray-650 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-between
                `}
                  >
                    <span className={filters.groupFilter ? 'text-gray-200' : 'text-gray-400'}>
                      {getSelectedGroupDisplay()}
                    </span>
                    <ChevronDownIcon className={`h-4 w-4 transition-transform ${dropdownStates.group ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownStates.group && (
                    <div className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      <button
                        onClick={() => handleGroupFilterChange('')}
                        className="w-full px-3 py-2 text-sm text-left text-gray-200 hover:bg-gray-600 transition-colors"
                      >
                        All Groups
                      </button>
                      {availableGroups.map((group) => (
                        <button
                          key={group.id}
                          onClick={() => handleGroupFilterChange(group.id)}
                          className={`
                        w-full px-3 py-2 text-sm text-left hover:bg-gray-600 transition-colors flex items-center gap-2
                        ${filters.groupFilter === group.id ? 'bg-blue-400/20 text-blue-200' : 'text-gray-200'}
                      `}
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: group.color }}
                          />
                          {group.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FilterBar;
