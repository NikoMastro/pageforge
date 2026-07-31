import React from 'react';
import ConfigCard from './configCard';
import { useTopNavigation } from '../../layout/topNavigationContext';

export interface ConfigItem {
  id: string;
  name: string;
  description?: string;
  active?: boolean;
  author?: string; // last user who committed
}

interface ConfigCardsPanelProps {
  configs: ConfigItem[];
  loading: boolean;
  refreshing?: boolean;
  error: string | null;
  showAll?: boolean;
  onRefresh?: () => void;
  onOpen: (config: { id: string; name: string }) => void;
  onDelete?: (config: { id: string; name: string }) => void;
  onSeeAll?: () => void;
  title?: string;
  viewDefault?: 'list' | 'cards';
}

const ConfigCardsPanel: React.FC<ConfigCardsPanelProps> = ({
  configs,
  loading,
  refreshing: propRefreshing,
  error,
  showAll = false,
  onOpen,
  onDelete,
  onSeeAll,
  viewDefault = 'list',
}) => {
  // Get viewMode from context, fallback to viewDefault if context not available
  const topNavCtx = (() => {
    try { return useTopNavigation(); } catch { return undefined; }
  })();
  const viewMode = topNavCtx?.viewMode || viewDefault;

  // Use context refresh if no prop refresh provided
  const refreshing = propRefreshing ?? topNavCtx?.isRefreshing ?? false;

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
          </div>
        </div>
      );
    }

    if (!configs || configs.length === 0) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-lg text-gray-300">No configurations found.</p>
          </div>
        </div>
      );
    }

    const configsToShow = showAll ? [...configs] : [...configs].slice(0, 3);

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 min-h-0">
          {viewMode === 'cards' ? (
            <div className="h-full overflow-y-auto py-4">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {configsToShow.map((c) => (
                  <ConfigCard
                    key={c.id}
                    name={c.name}
                    description={c.description}
                    active={!!c.active}
                    author={c.author}
                    onClick={() => onOpen({ id: c.id, name: c.name })}
                    onDelete={onDelete ? () => onDelete({ id: c.id, name: c.name }) : undefined}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              {/* Header for list view */}
              <div className="hidden sm:grid sticky top-0 z-10 gap-3 px-4 py-2 text-xs font-medium text-gray-400 border-b border-gray-600 bg-gray-800 flex-shrink-0" style={{ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))' }}>
                <div style={{ gridColumn: 'span 3 / span 3' }}>Name</div>
                <div style={{ gridColumn: 'span 5 / span 5' }}>Description</div>
                <div style={{ gridColumn: 'span 2 / span 2' }}>Modified By</div>
                <div style={{ gridColumn: 'span 1 / span 1' }}>Status</div>
                <div className="text-right" style={{ gridColumn: 'span 1 / span 1' }}>Actions</div>
              </div>
              <div className="space-y-2 mt-2 p-2">
                {configsToShow.map((c) => (
                  <ConfigCard
                    key={c.id}
                    name={c.name}
                    description={c.description}
                    active={!!c.active}
                    author={c.author}
                    variant="list"
                    onClick={() => onOpen({ id: c.id, name: c.name })}
                    onDelete={onDelete ? () => onDelete({ id: c.id, name: c.name }) : undefined}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {!showAll && configs.length > 3 && onSeeAll && (
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
    <div className="w-full h-full flex flex-col">
      {renderMainContent()}
    </div>
  );
};

export default ConfigCardsPanel;
