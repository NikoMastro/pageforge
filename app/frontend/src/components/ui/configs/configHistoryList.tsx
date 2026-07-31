import React from 'react';
import type { ConfigHistoryRecord } from '../../../api';

const EXPANDED_WIDTH_PX = 320;
const COLLAPSED_WIDTH_PX = 18;

const formatWhen = (ts?: string): string => {
  if (!ts) return 'Unknown date';
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return ts || '';
  }
};

const getTimestamp = (e: ConfigHistoryRecord) =>
  e.timestamp || (e.data as any)?.Timestamp || (e as any)?.Timestamp || '';

const getCommit = (e: ConfigHistoryRecord) =>
  (e.data as any)?.commit || (e as any)?.commit || '';

const getUser = (e: ConfigHistoryRecord) =>
  (e.data as any)?.user || (e as any)?.user || '';

const itemKey = (e: ConfigHistoryRecord) => {
  const parts = [e.name, getTimestamp(e), getCommit(e), e.version].filter(Boolean);
  return parts.length > 0 ? parts.join('|') : `fallback-${Math.random().toString(36).substring(7)}`;
};

const parseTimestamp = (ts?: string): number => {
  if (!ts) return 0;
  const t = Date.parse(ts);
  return Number.isNaN(t) ? 0 : t;
};

// Sub-components
const SpinnerIcon: React.FC = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const RollbackIcon: React.FC = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
  </svg>
);

const ChevronRightIcon: React.FC = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const ChevronLeftIcon: React.FC = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export interface ConfigHistoryListProps {
  entries: ConfigHistoryRecord[];
  selectedKey: string;
  onSelect: (key: string) => void;
  latest?: ConfigHistoryRecord;
  className?: string;
  onRollback?: (entry: ConfigHistoryRecord) => void;
  isRollingBack?: boolean;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const ConfigHistoryList: React.FC<ConfigHistoryListProps> = ({
  entries,
  selectedKey,
  onSelect,
  latest,
  className,
  onRollback,
  isRollingBack = false,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onToggleCollapse,
}) => {
  const [internalCollapsed, setInternalCollapsed] = React.useState<boolean>(!!defaultCollapsed);
  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const toggleCollapsed = onToggleCollapse || (() => setInternalCollapsed(v => !v));

  const sortedEntries = React.useMemo(() => {
    return [...entries].sort((a, b) => parseTimestamp(getTimestamp(b)) - parseTimestamp(getTimestamp(a)));
  }, [entries]);

  return (
    <div
      className={[
        "relative h-full transition-all duration-300 ease-in-out",
        className || ''
      ].join(' ').trim()}
      style={{
        width: collapsed ? `${COLLAPSED_WIDTH_PX}px` : `${EXPANDED_WIDTH_PX}px`
      }}
    >
      <div className={[
        "border border-gray-700 rounded-lg overflow-hidden flex flex-col min-h-0 h-full bg-gray-900 transition-all duration-300 ease-in-out",
        collapsed ? "opacity-0 pointer-events-none select-none w-0" : "opacity-100 flex-1"
      ].join(' ')}>
        <style>
          {`
        /* Scoped hide scrollbar for this component */
        .history-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .history-scroll::-webkit-scrollbar { width: 0 !important; height: 0 !important; background: transparent; display: none; }
        .history-scroll::-webkit-scrollbar-thumb { background: transparent; }
        .history-scroll::-webkit-scrollbar-track { background: transparent; }
        `}
        </style>
        <div className="px-3 py-2 border-b border-gray-700 text-xs uppercase tracking-wide text-gray-400 flex items-center justify-between gap-2">
          <span>Config revisions ({entries.length})</span>
          {latest && (
            <div className="normal-case text-[11px] text-gray-400 flex items-center gap-2 min-w-0">
              <span className="text-gray-300">Latest:</span>
              <span className="text-gray-200 truncate max-w-[28ch]">{getCommit(latest) || 'Latest'}</span>
              <span className="text-gray-500 truncate">{formatWhen(getTimestamp(latest))}</span>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden divide-y divide-gray-800 scrollbar-hide no-scrollbar history-scroll">
          {sortedEntries.map((h) => {
            const key = itemKey(h);
            const isActive = key === selectedKey;
            const isLatest = latest && itemKey(latest) === key;
            const user = getUser(h);
            return (
              <div
                key={key}
                className={[
                  'w-full px-3 py-2 hover:bg-gray-800/60 transition-colors grid grid-cols-[1fr_auto] items-start gap-2 overflow-hidden',
                  isActive ? 'bg-gray-800/80' : ''
                ].join(' ')}
              >
                <button
                  onClick={() => onSelect(key)}
                  className="flex-1 min-w-0 text-left"
                  title={getCommit(h) || ''}
                >
                  <div className="min-w-0 flex flex-col gap-0.5">
                    <div className="flex items-start justify-between gap-2 min-w-0">
                      <span className="text-xs font-medium text-gray-200 whitespace-normal break-words block min-w-0">
                        {getCommit(h) || 'Update'}
                      </span>
                      {user && (
                        <span className="text-[10px] text-gray-400 truncate flex-shrink-0 max-w-[16ch]">{user}</span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-400 truncate text-left min-w-0">{formatWhen(getTimestamp(h))}</div>
                  </div>
                </button>
                {!isLatest && onRollback && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRollback(h);
                    }}
                    disabled={isRollingBack}
                    className={[
                      "flex-shrink-0 p-1 rounded transition-colors justify-self-end self-start",
                      isRollingBack
                        ? "text-gray-600 cursor-not-allowed"
                        : "text-gray-400 hover:text-indigo-300 hover:bg-gray-700"
                    ].join(' ')}
                    title={isRollingBack ? "Rolling back..." : "Rollback to this version"}
                  >
                    {isRollingBack ? <SpinnerIcon /> : <RollbackIcon />}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <button
        type="button"
        aria-label={collapsed ? 'Expand history panel' : 'Collapse history panel'}
        aria-expanded={!collapsed}
        onClick={toggleCollapsed}
        className={[
          "absolute top-1/2 -translate-y-1/2 z-10 w-[18px] h-12 flex items-center justify-center bg-gray-700/80 hover:bg-gray-600 text-gray-200 border border-gray-600 shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-300 ease-in-out",
          collapsed ? "-right-[18px] rounded-r-md" : "right-0 rounded-r-md"
        ].join(' ')}
        title={collapsed ? 'Open' : 'Close'}
      >
        {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      </button>
    </div>
  );
};

export default ConfigHistoryList;
