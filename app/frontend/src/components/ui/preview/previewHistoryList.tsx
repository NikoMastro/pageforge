import React from 'react';

// Keep a local copy of the history entry type to avoid tight coupling
export type JsonHistoryEntry = {
  page_name?: string;
  user?: string;
  commit?: string;
  timestamp?: string;
  serverTimestamp?: unknown;
  hashid?: string;
  lp_json?: string; // Optional now - legacy format
  value?: any; // New format stores data here
};

export interface PreviewHistoryListProps {
  entries: JsonHistoryEntry[];
  selectedKey: string;
  onSelect: (key: string) => void;
  latest?: JsonHistoryEntry;
  className?: string;
  onRollback?: (entry: JsonHistoryEntry) => void;
  isRollingBack?: boolean;
}

function formatWhen(ts?: string): string {
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
}

const itemKey = (e: JsonHistoryEntry) => [e.hashid, e.timestamp, e.commit].filter(Boolean).join('|');
const PreviewHistoryList: React.FC<PreviewHistoryListProps> = ({
  entries,
  selectedKey,
  onSelect,
  latest,
  className,
  onRollback,
  isRollingBack = false,
}) => {
  const parseTs = (ts?: string) => {
    if (!ts) return 0;
    const t = Date.parse(ts);
    return Number.isNaN(t) ? 0 : t;
  };

  const sortedEntries = React.useMemo(() => {
    return [...entries].sort((a, b) => parseTs(b.timestamp) - parseTs(a.timestamp));
  }, [entries]);
  return (
    <div className={["border border-gray-700 rounded-lg overflow-hidden flex flex-col min-h-0", className || ''].join(' ').trim()}>
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
        <span>Revisions ({entries.length})</span>
        {latest && (
          <div className="normal-case text-[11px] text-gray-400 flex items-center gap-2 min-w-0">
            <span className="text-gray-300">Latest:</span>
            <span className="text-gray-200 truncate max-w-[28ch]">{latest.commit || 'Latest'}</span>
            <span className="text-gray-500 truncate">{formatWhen(latest.timestamp)}</span>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden divide-y divide-gray-800 scrollbar-hide no-scrollbar history-scroll">
        {sortedEntries.map((h) => {
          const key = itemKey(h);
          const isActive = key === selectedKey;
          const isLatest = latest && itemKey(latest) === key;
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
                title={h.commit || ''}
              >
                <div className="min-w-0 flex flex-col gap-0.5">
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <span className="text-xs font-medium text-gray-200 whitespace-normal break-words block min-w-0">
                      {h.commit || 'Update'}
                    </span>
                    {h.user && (
                      <span className="text-[10px] text-gray-400 truncate flex-shrink-0 max-w-[16ch]">{h.user}</span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400 truncate text-left min-w-0">{formatWhen(h.timestamp)}</div>
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
                  {isRollingBack ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PreviewHistoryList;
