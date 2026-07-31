import React from 'react';
import {
  RocketLaunchIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  GlobeAltIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
interface JsonListViewProps {
  configs: { id: string; name: string; pageTitle?: string; lastUpdated?: string; createdBy?: string }[];
  onPreview: (config: { id: string; name: string }) => void;
  onOpenLp: (config: { id: string; name: string }) => void;
  onDeploy: (config: { id: string; name: string }) => void;
  onEdit?: (config: { id: string; name: string }) => void;
  onEditTitle?: (config: { id: string; name: string }, newTitle: string) => Promise<void>;
  onDuplicate?: (config: { id: string; name: string }) => void;
  onDelete?: (config: { id: string; name: string }) => void;
  onCardDragStart?: () => void;
  onCardDragEnd?: () => void;
}

const JsonListView: React.FC<JsonListViewProps> = ({
  configs,
  onPreview,
  onOpenLp,
  onDeploy,
  onEdit,
  onDuplicate,
  onDelete,
  onCardDragStart,
  onCardDragEnd,
}) => {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [sortField, setSortField] = React.useState<'name' | 'pageTitle' | 'lastUpdated' | 'createdBy' | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  // Deployment status removed from list view

  const handleSort = (field: 'name' | 'pageTitle' | 'lastUpdated' | 'createdBy') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedConfigs = React.useMemo(() => {
    if (!sortField) return configs;

    return [...configs].sort((a, b) => {
      let aVal: string | undefined;
      let bVal: string | undefined;

      switch (sortField) {
        case 'name':
          aVal = a.name?.toLowerCase();
          bVal = b.name?.toLowerCase();
          break;
        case 'pageTitle':
          aVal = a.pageTitle?.toLowerCase() || '';
          bVal = b.pageTitle?.toLowerCase() || '';
          break;
        case 'lastUpdated':
          aVal = a.lastUpdated;
          bVal = b.lastUpdated;
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
  }, [configs, sortField, sortDirection]);

  const SortIcon: React.FC<{ field: 'name' | 'pageTitle' | 'lastUpdated' | 'createdBy' }> = ({ field }) => {
    const isActive = sortField === field;
    return (
      <span className="inline-flex flex-col ml-1 -space-y-1">
        <ChevronUpIcon className={`h-2.5 w-2.5 ${isActive && sortDirection === 'asc' ? 'text-blue-400' : 'text-gray-600'}`} />
        <ChevronDownIcon className={`h-2.5 w-2.5 ${isActive && sortDirection === 'desc' ? 'text-blue-400' : 'text-gray-600'}`} />
      </span>
    );
  };

  const handleDragStart = (e: React.DragEvent, config: { id: string; name: string }) => {
    const dragData = {
      type: 'json-card',
      cardId: config.id,
      cardName: config.name
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copy';

    if (onCardDragStart) onCardDragStart();
  };

  const handleDragEnd = () => {
    if (onCardDragEnd) onCardDragEnd();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div
        className="hidden sm:grid sticky top-0 z-10 gap-4 px-4 py-2 text-xs font-medium text-gray-400 border-b border-gray-600 bg-gray-800 flex-shrink-0 rounded-sm"
        style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}
      >
        <div style={{ gridColumn: 'span 4 / span 4' }} className="cursor-pointer hover:text-gray-200 transition-colors" onClick={() => handleSort('name')}>
          Name <SortIcon field="name" />
        </div>
        <div style={{ gridColumn: 'span 3 / span 3' }} className="cursor-pointer hover:text-gray-200 transition-colors" onClick={() => handleSort('pageTitle')}>
          Page Title <SortIcon field="pageTitle" />
        </div>
        <div style={{ gridColumn: 'span 3 / span 3' }} className="cursor-pointer hover:text-gray-200 transition-colors" onClick={() => handleSort('createdBy')}>
          Modified By <SortIcon field="createdBy" />
        </div>
        <div style={{ gridColumn: 'span 2 / span 2' }} className="cursor-pointer hover:text-gray-200 transition-colors" onClick={() => handleSort('lastUpdated')}>
          Last Modified <SortIcon field="lastUpdated" />
        </div>
        <div style={{ gridColumn: 'span 2 / span 2' }} className="text-right">Actions</div>
      </div>

      {/* List Items */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 p-2 scrollbar-hide no-scrollbar">
        {sortedConfigs.map((config) => (
          <div
            key={config.id}
            draggable
            onDragStart={(e) => handleDragStart(e, config)}
            onDragEnd={handleDragEnd}
            className="grid gap-4 px-4 py-3 bg-gray-900 hover:bg-gray-700/50 border border-gray-700 rounded-lg transition-colors duration-200 cursor-move"
            style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}
          >
            {/* Name */}
            <div className="flex items-center" style={{ gridColumn: 'span 4 / span 4' }}>
              <div
                onClick={() => onPreview(config)}
                className="text-sm font-medium text-white truncate cursor-pointer hover:text-blue-400"
                title={config.name}
              >
                {config.name}
              </div>
            </div>

            {/* Page Title */}
            <div className="flex items-center" style={{ gridColumn: 'span 3 / span 3' }}>
              <span className="text-xs text-gray-300 truncate" title={config.pageTitle || 'N/A'}>
                {config.pageTitle || 'N/A'}
              </span>
            </div>

            {/* Modified By */}
            <div className="flex items-center" style={{ gridColumn: 'span 3 / span 3' }}>
              <span className="text-xs text-gray-300 truncate" title={config.createdBy || 'unknown'}>
                {config.createdBy || 'unknown'}
              </span>
            </div>

            {/* Last Modified */}
            <div className="flex items-center" style={{ gridColumn: 'span 2 / span 2' }}>
              {config.lastUpdated ? (
                <span className="text-xs text-gray-400" title={config.lastUpdated}>
                  {new Date(config.lastUpdated).toLocaleDateString()}
                </span>
              ) : (
                <span className="text-xs text-gray-500 italic">n/a</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-1" style={{ gridColumn: 'span 2 / span 2' }}>
              <button
                onClick={() => onOpenLp(config)}
                className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded transition-colors duration-150"
                title="Open Landing Page"
              >
                <GlobeAltIcon className="h-4 w-4" />
              </button>

              <button
                onClick={() => onDeploy(config)}
                className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-gray-700 rounded transition-colors duration-150"
                title="Deploy"
              >
                <RocketLaunchIcon className="h-4 w-4" />
              </button>

              {onEdit && (
                <button
                  onClick={() => onEdit(config)}
                  className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors duration-150"
                  title="Edit Config"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              )}

              {onDuplicate && (
                <button
                  onClick={() => onDuplicate(config)}
                  className="p-1.5 text-gray-400 hover:text-cyan-400 hover:bg-gray-700 rounded transition-colors duration-150"
                  title="Duplicate"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </button>
              )}

              {onDelete && (
                <button
                  onClick={() => setDeletingId(config.id)}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors duration-150"
                  title="Delete"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}

            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (() => {
        const config = configs.find(c => c.id === deletingId);
        if (!config) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-2">Delete Landing Page</h3>
              <p className="text-gray-300 mb-4">
                Are you sure you want to delete <span className="font-semibold text-white">"{config.name}"</span>?
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
                    if (onDelete) onDelete(config);
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
    </div>
  );
};

export default JsonListView;
