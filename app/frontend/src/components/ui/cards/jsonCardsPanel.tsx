import React, { useState } from 'react';
import JsonCard from './jsonCard';
import JsonListView from './jsonCardsList';
import ViewToggle from './cardsViewToggle';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import type { LandingPageData } from '../../../types';
interface JsonConfigurationsProps {
  jsonConfigs: { id: string; name: string; lastUpdated?: string; updatedAt?: string; createdBy?: string; landingPageData?: LandingPageData }[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  showAll?: boolean;
  onRefresh: () => void;
  onPreview: (config: { id: string; name: string }) => void;
  onOpenLp: (config: { id: string; name: string }) => void;
  onDeploy: (config: { id: string; name: string }) => void;
  onEdit?: (config: { id: string; name: string }) => void;
  onEditTitle?: (config: { id: string; name: string }, newTitle: string) => Promise<void>;
  onDuplicate?: (config: { id: string; name: string }) => void;
  onSeeAll?: () => void;
}

const JsonConfigurations: React.FC<JsonConfigurationsProps> = ({
  jsonConfigs,
  loading,
  refreshing,
  error,
  showAll = false,
  onRefresh,
  onPreview,
  onOpenLp,
  onDeploy,
  // removed props
  onEdit,
  onEditTitle,
  onDuplicate,
  onSeeAll,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const renderMainContent = () => {
    if (loading && !refreshing) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-300">Loading configurations...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-lg text-red-400">{error}</p>
            <button
              onClick={onRefresh}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (jsonConfigs.length === 0) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-lg text-gray-300">No configurations found.</p>
            <button
              onClick={onRefresh}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-300 bg-gray-700 hover:bg-gray-600"
            >
              Refresh List
            </button>
          </div>
        </div>
      );
    }

    // No timestamp info on simplified adapter; show in insertion order
    const configsToShow = showAll ? [...jsonConfigs] : [...jsonConfigs].slice(0, 3);

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 min-h-0">
          {viewMode === 'cards' ? (
            <div className="h-full overflow-y-auto overflow-x-hidden px-6 py-4 scrollbar-hide no-scrollbar">
              <div className="grid gap-6 grid-cols-1">
                {configsToShow.map((config) => (
                  <JsonCard
                    key={config.id}
                    name={config.name}
                    author={config.createdBy}
                    lastUpdated={config.lastUpdated || config.updatedAt}
                    configId={config.id}
                    landingPageData={config.landingPageData}
                    onPreview={() => onPreview(config)}
                    onOpenLp={() => onOpenLp(config)}
                    onDeploy={() => onDeploy(config)}
                    onEdit={onEdit ? () => onEdit(config) : undefined}
                    onEditTitle={onEditTitle ? (newTitle) => onEditTitle(config, newTitle) : undefined}
                    onDuplicate={onDuplicate ? () => onDuplicate(config) : undefined}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto overflow-x-hidden px-6 py-4 scrollbar-hide no-scrollbar">
              <JsonListView
                configs={configsToShow.map(c => ({ ...c, lastUpdated: c.lastUpdated || c.updatedAt }))}
                onPreview={onPreview}
                onOpenLp={onOpenLp}
                onDeploy={onDeploy}
                onEdit={onEdit}
                onEditTitle={onEditTitle}
                onDuplicate={onDuplicate}
              />
            </div>
          )}
        </div>

        {!showAll && jsonConfigs.length > 3 && onSeeAll && (
          <div className="flex-shrink-0 mt-4 text-center border-t border-gray-600 pt-4">
            <button
              onClick={onSeeAll}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-300 bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
            >
              See all
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="rounded-lg shadow-md bg-gray-800 border border-gray-700 p-6 h-96 flex flex-col">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-xl font-semibold text-white">
            {showAll ? 'All Configurations' : 'Latest Configurations'}
          </h2>
          <div className="flex items-center gap-3">
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md ${refreshing
                ? 'text-gray-500 bg-gray-700 cursor-not-allowed'
                : 'text-indigo-300 bg-gray-700 hover:bg-gray-600'
                }`}
            >
              {refreshing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="hidden sm:inline">Refreshing...</span>
                </>
              ) : (
                <>
                  <ArrowPathIcon className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Refresh</span>
                </>
              )}
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
};

export default JsonConfigurations;
