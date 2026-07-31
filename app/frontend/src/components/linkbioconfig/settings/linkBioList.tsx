import React from 'react';
import { Link } from 'react-router-dom';
import { RocketLaunchIcon, DocumentDuplicateIcon, GlobeAltIcon, EyeIcon, ArrowPathIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Pagination from '../../ui/pagination';
import { usePagination } from '../../../hooks/hooksPages';

export interface LinkBioListItem {
  id: string; // usually configName or slug
  title: string;
  pageTitle?: string; // Page title from general.pageTitle
  updatedAt: string; // ISO date
  createdBy?: string; // User who created/modified
  slug?: string;
}

interface LinkBioListProps {
  items: LinkBioListItem[];
  onSelect: (id: string) => void;
  selectedId?: string | null;
  onRefresh?: () => void;
  onDeploy?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
  error?: string | null;
}

const LinkBioList: React.FC<LinkBioListProps> = ({ items, onSelect, selectedId, onRefresh, onDeploy, onDuplicate, onDelete, loading = false, error = null }) => {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [sortField, setSortField] = React.useState<'title' | 'pageTitle' | 'updatedAt' | 'createdBy' | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  const handleRefresh = React.useCallback(() => {
    onRefresh?.();
  }, [onRefresh]);

  const handleSort = (field: 'title' | 'pageTitle' | 'updatedAt' | 'createdBy') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedItems = React.useMemo(() => {
    if (!sortField) return items;

    return [...items].sort((a, b) => {
      let aVal: string | undefined;
      let bVal: string | undefined;

      switch (sortField) {
        case 'title':
          aVal = a.title?.toLowerCase();
          bVal = b.title?.toLowerCase();
          break;
        case 'pageTitle':
          aVal = a.pageTitle?.toLowerCase() || '';
          bVal = b.pageTitle?.toLowerCase() || '';
          break;
        case 'updatedAt':
          aVal = a.updatedAt;
          bVal = b.updatedAt;
          break;
        case 'createdBy':
          aVal = a.createdBy?.toLowerCase() || '';
          bVal = b.createdBy?.toLowerCase() || '';
          break;
      }

      if (!aVal && !bVal) return 0;
      if (!aVal) return 1;
      if (!bVal) return -1;

      const comparison = aVal.localeCompare(bVal);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [items, sortField, sortDirection]);

  const { currentItems, currentPage, goToPage } = usePagination({
    items: sortedItems,
    itemsPerPage: 100,
  });

  const SortIcon: React.FC<{ field: 'title' | 'pageTitle' | 'updatedAt' | 'createdBy' }> = ({ field }) => {
    const isActive = sortField === field;
    return (
      <span className="inline-flex flex-col ml-1 -space-y-1">
        <ChevronUpIcon className={`h-2.5 w-2.5 ${isActive && sortDirection === 'asc' ? 'text-blue-400' : 'text-gray-600'}`} />
        <ChevronDownIcon className={`h-2.5 w-2.5 ${isActive && sortDirection === 'desc' ? 'text-blue-400' : 'text-gray-600'}`} />
      </span>
    );
  };

  return (
    <div className="flex h-full flex-col">
      {error && (
        <div className="border-b border-gray-800 bg-red-950/40 px-6 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-1 items-center justify-center gap-3 px-6 py-10 text-sm text-gray-300">
          <ArrowPathIcon className="h-5 w-5 animate-spin" />
          Loading LinkBios…
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center text-gray-400">
          <div className="text-sm text-gray-500 border border-dashed border-gray-700 rounded-md p-4">
            No LinkBios yet. Create one to get started.
          </div>
        </div>
      ) : (
        <>
          {onRefresh && (
            <div className="flex justify-end px-4 pb-2">
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-200 transition-colors hover:border-blue-500 hover:text-white"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Refresh
              </button>
            </div>
          )}
          {/* Header - matching LP layout */}
          <div className="hidden sm:grid sticky top-0 z-10 gap-4 px-4 py-2 text-xs font-medium text-gray-400 border-b border-gray-600 bg-gray-800 flex-shrink-0 rounded-sm" style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}>
            <div className="cursor-pointer hover:text-gray-200 transition-colors" style={{ gridColumn: 'span 4 / span 4' }} onClick={() => handleSort('title')}>
              Name <SortIcon field="title" />
            </div>
            <div className="cursor-pointer hover:text-gray-200 transition-colors" style={{ gridColumn: 'span 3 / span 3' }} onClick={() => handleSort('pageTitle')}>
              Page Title <SortIcon field="pageTitle" />
            </div>
            <div className="cursor-pointer hover:text-gray-200 transition-colors" style={{ gridColumn: 'span 3 / span 3' }} onClick={() => handleSort('createdBy')}>
              Modified By <SortIcon field="createdBy" />
            </div>
            <div className="cursor-pointer hover:text-gray-200 transition-colors" style={{ gridColumn: 'span 2 / span 2' }} onClick={() => handleSort('updatedAt')}>
              Last Modified <SortIcon field="updatedAt" />
            </div>
            <div className="text-right" style={{ gridColumn: 'span 2 / span 2' }}>Actions</div>
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 p-2 scrollbar-hide no-scrollbar">
            {currentItems.map((it) => {
              const isSelected = selectedId === it.id;
              return (
                <div
                  key={it.id}
                  className={`grid gap-4 px-4 py-3 border rounded-lg transition-colors duration-200 cursor-pointer ${isSelected ? 'border-blue-500 bg-gray-800' : 'border-gray-700 bg-gray-800/60 hover:border-gray-600 hover:bg-gray-800'}`}
                  style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}
                  onClick={() => onSelect(it.id)}
                >
                  {/* Name */}
                  <div className="flex items-center" style={{ gridColumn: 'span 4 / span 4' }}>
                    <div className="text-sm font-medium text-gray-100 truncate" title={it.title}>
                      {it.title}
                    </div>
                  </div>

                  {/* Page Title */}
                  <div className="hidden sm:flex items-center" style={{ gridColumn: 'span 3 / span 3' }}>
                    <span className="text-xs text-gray-300 truncate" title={it.pageTitle || 'N/A'}>
                      {it.pageTitle || 'N/A'}
                    </span>
                  </div>

                  {/* Modified By */}
                  <div className="hidden sm:flex items-center" style={{ gridColumn: 'span 3 / span 3' }}>
                    <span className="text-xs text-gray-300 truncate" title={it.createdBy || 'unknown'}>
                      {it.createdBy || 'unknown'}
                    </span>
                  </div>

                  {/* Last Modified */}
                  <div className="hidden sm:flex items-center" style={{ gridColumn: 'span 2 / span 2' }}>
                    <span className="text-xs text-gray-400" title={it.updatedAt}>
                      {new Date(it.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-start sm:justify-end gap-2 sm:gap-1 mt-2 sm:mt-0" style={{ gridColumn: 'span 2 / span 2' }}>
                    {/* Preview */}
                    <Link
                      to={`/linkbio/${encodeURIComponent(it.id)}`}
                      title="Preview"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700/50 rounded transition-colors duration-150"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>

                    {/* Open Page (globe) */}
                    <Link
                      to={`/linkbio/${encodeURIComponent(it.id)}/bioPage`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open Page"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-gray-700/50 rounded transition-colors duration-150"
                    >
                      <GlobeAltIcon className="h-4 w-4" />
                    </Link>

                    {/* Deploy (rocket) */}
                    <button
                      type="button"
                      title="Deploy"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeploy?.(it.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-gray-700/50 rounded transition-colors duration-150"
                    >
                      <RocketLaunchIcon className="h-4 w-4" />
                    </button>

                    {/* Duplicate */}
                    {onDuplicate && (
                      <button
                        type="button"
                        title="Duplicate"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate(it.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-cyan-400 hover:bg-gray-700/50 rounded transition-colors duration-150"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                    )}

                    {/* Delete */}
                    {onDelete && (
                      <button
                        type="button"
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(it.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700/50 rounded transition-colors duration-150"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (() => {
        const item = items.find(it => it.id === deletingId);
        if (!item) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-2">Delete LinkBio</h3>
              <p className="text-gray-300 mb-4">
                Are you sure you want to delete <span className="font-semibold text-white">"{item.title}"</span>?
                This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeletingId(null)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (onDelete) onDelete(item.id);
                    setDeletingId(null);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-150"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Sticky pagination at bottom */}
      {items.length > 100 && (
        <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 z-10">
          <Pagination
            currentPage={currentPage}
            totalItems={items.length}
            itemsPerPage={100}
            onPageChange={goToPage}
          />
        </div>
      )}
    </div>
  );
};

export default LinkBioList;
