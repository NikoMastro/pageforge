import React, { useState } from 'react';
import { BookmarkIcon, FolderOpenIcon } from '@heroicons/react/24/outline';
import type { SavedConfiguration } from '../../../hooks/hooksConfigs/useSavedConfigurations';
import { ConfigurationLibraryModal } from './configurationLibraryModal';

interface ConfigurationControlsProps {
  savedConfigurations: SavedConfiguration[];
  onSaveConfiguration: (name: string) => void;
  onLoadConfiguration: (id: string) => void;
  onDeleteConfiguration: (id: string) => void;
  onDuplicateConfiguration?: (id: string) => void;
  disabled?: boolean;
}

const defaultConfigName = () => `Config ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

export const ConfigurationControls: React.FC<ConfigurationControlsProps> = ({
  savedConfigurations,
  onSaveConfiguration,
  onLoadConfiguration,
  onDeleteConfiguration,
  onDuplicateConfiguration,
  disabled = false,
}) => {
  const [isLibraryOpen, setLibraryOpen] = useState(false);
  const [configName, setConfigName] = useState('');

  const handleSaveConfiguration = () => {
    const nameToUse = (configName || defaultConfigName()).trim();
    onSaveConfiguration(nameToUse);
    setConfigName('');
  };

  const handleSelectConfiguration = (config: SavedConfiguration) => {
    onLoadConfiguration(config.id);
    setLibraryOpen(false);
  };

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-200 transition-colors hover:border-blue-500 hover:bg-gray-700 hover:text-white"
        >
          <FolderOpenIcon className="h-5 w-5" />
          Load Configuration
          {savedConfigurations.length > 0 && (
            <span className="rounded-full bg-gray-700 px-2 py-0.5 text-xs text-gray-300">
              {savedConfigurations.length}
            </span>
          )}
        </button>

        <div className="flex flex-1 items-center gap-2 sm:max-w-md">
          <input
            type="text"
            value={configName}
            onChange={(event) => setConfigName(event.target.value)}
            placeholder="Configuration name (optional)"
            disabled={disabled}
            className="flex-1 rounded-md border border-gray-700 bg-gray-700 px-3 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleSaveConfiguration}
            disabled={disabled}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <BookmarkIcon className="h-5 w-5" />
            Save Config
          </button>
        </div>
      </div>

      <ConfigurationLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setLibraryOpen(false)}
        savedConfigurations={savedConfigurations}
        onSelectConfiguration={handleSelectConfiguration}
        onDeleteConfiguration={onDeleteConfiguration}
        onDuplicateConfiguration={onDuplicateConfiguration || (() => { })}
      />
    </>
  );
};
