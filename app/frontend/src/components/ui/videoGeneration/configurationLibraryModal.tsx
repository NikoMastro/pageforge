import React, { useState, useMemo } from 'react';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { SavedConfiguration } from '../../../hooks/hooksConfigs/useSavedConfigurations';

interface ConfigurationLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedConfigurations: SavedConfiguration[];
  onSelectConfiguration: (config: SavedConfiguration) => void;
  onDeleteConfiguration: (id: string) => void;
  onDuplicateConfiguration: (id: string) => void;
}

export const ConfigurationLibraryModal: React.FC<ConfigurationLibraryModalProps> = ({
  isOpen,
  onClose,
  savedConfigurations,
  onSelectConfiguration,
  onDeleteConfiguration,
  onDuplicateConfiguration,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConfigurations = useMemo(() => {
    return savedConfigurations.filter((config) => {
      const matchesSearch =
        config.page_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        config.promptState.prompt.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [savedConfigurations, searchQuery]);

  const handleSelect = (config: SavedConfiguration) => {
    onSelectConfiguration(config);
    onClose();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      onDeleteConfiguration(id);
    }
  };

  const handleDuplicate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDuplicateConfiguration(id);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col rounded-lg border border-gray-700 bg-gray-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 p-4">
          <h2 className="text-xl font-semibold text-white">Configuration Library</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-gray-700 p-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search configurations..."
              className="w-full rounded-md border border-gray-600 bg-gray-700 py-2 pl-10 pr-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Configurations List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredConfigurations.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-400">
              {searchQuery
                ? 'No configurations match your search'
                : 'No saved configurations yet'}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredConfigurations.map((config) => (
                <div
                  key={config.id}
                  onClick={() => handleSelect(config)}
                  className="group cursor-pointer rounded-lg border border-gray-700 bg-gray-750 p-4 transition-all hover:border-blue-500 hover:bg-gray-700"
                >
                  {/* Header */}
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate font-semibold text-white group-hover:text-blue-400">
                        {config.page_name}
                      </h3>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => handleDuplicate(e, config.id)}
                        className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-600 hover:text-blue-400"
                        title="Duplicate"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, config.id)}
                        className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-600 hover:text-red-400"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Prompt Preview */}
                  <div className="mb-3 rounded border border-gray-600 bg-gray-800 p-2">
                    <p className="text-xs text-gray-300 line-clamp-2">
                      {config.promptState.prompt || 'No prompt'}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1.5 text-xs text-gray-400">

                    {/* Settings Summary */}
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded bg-gray-700 px-1.5 py-0.5">
                        {config.settings.modelId}
                      </span>
                      <span className="rounded bg-gray-700 px-1.5 py-0.5">
                        {config.settings.resolution}
                      </span>
                      <span className="rounded bg-gray-700 px-1.5 py-0.5">
                        {config.settings.aspectRatio}
                      </span>
                      <span className="rounded bg-gray-700 px-1.5 py-0.5">
                        {config.settings.durationSeconds}s
                      </span>
                    </div>

                    {/* Usage Stats */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>{formatDate(config.metadata.createdAt)}</span>
                      </div>
                      {config.metadata.usageCount !== undefined && config.metadata.usageCount > 0 && (
                        <span>Used {config.metadata.usageCount}x</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4">
          <p className="text-center text-sm text-gray-400">
            {filteredConfigurations.length} configuration{filteredConfigurations.length !== 1 ? 's' : ''}{' '}
            {searchQuery && `(filtered from ${savedConfigurations.length})`}
          </p>
        </div>
      </div>
    </div>
  );
};
