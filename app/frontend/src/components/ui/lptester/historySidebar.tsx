import React from 'react';
import type { UrlTesterResult } from '../../../types/ui.types';

export interface HistoryRun {
  at: number; // epoch ms
  result: UrlTesterResult;
  source?: 'manual' | 'auto' | 'seed';
}

export interface HistoryItem {
  url: string;
  runs: HistoryRun[];
}

export interface HistorySidebarProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onRetest: (item: HistoryItem) => void;
  onRemove: (item: HistoryItem) => void;
}

const fmtAgo = (ts: number): string => {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'just now';
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const fmtCountdown = (ts: number): string => {
  const diff = ts - Date.now();
  if (diff <= 0) return 'due now';
  const mins = Math.ceil(diff / 60_000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  if (hrs < 24) return `${hrs}h ${rem}m`;
  const days = Math.floor(hrs / 24);
  const remH = hrs % 24;
  return `${days}d ${remH}h`;
};

const scoreBadge = (label: string, score?: number) => {
  const s = Math.round(score ?? 0);
  const color = s >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : s >= 50 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${color}`}>
      {label}: {Number.isFinite(s) ? s : '—'}
    </span>
  );
};

const HistorySidebar: React.FC<HistorySidebarProps> = ({ items, onSelect, onRetest, onRemove }) => {
  return (
    <aside className="h-fit bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">History</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <div className="text-xs text-gray-500 dark:text-gray-400">No tested URLs yet.</div>
      ) : (
        <ul className="space-y-3">
          {items.map((it) => {
            const lastRun = it.runs[it.runs.length - 1];
            const scores = lastRun?.result?.lighthouse?.scores;
            const lastAt = lastRun?.at ?? 0;
            const nextAt = lastAt + 24 * 60 * 60 * 1000;
            const due = Date.now() >= nextAt;
            const hostname = (() => {
              try {
                return new URL(it.url).hostname;
              } catch {
                return it.url;
              }
            })();
            return (
              <li key={it.url} className="group border border-gray-200 dark:border-gray-700 rounded-md p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <button className="text-left flex-1 min-w-0" onClick={() => onSelect(it)}>
                    <div className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate" title={hostname}>{hostname}</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate" title={it.url}>{it.url}</div>
                  </button>
                  <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-medium ${due ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {due ? 'Due' : fmtCountdown(nextAt)}
                  </span>
                </div>

                {scores && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {scoreBadge('Perf', scores.performance)}
                    {scoreBadge('SEO', (scores as any).seo)}
                    {scoreBadge('Access', (scores as any).accessibility)}
                    {scoreBadge('BP', (scores as any)['best-practices'])}
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">Last: {lastAt ? fmtAgo(lastAt) : '—'}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onRetest(it)}
                      className="px-2 py-1 text-[11px] rounded bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                    >
                      Retest
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(it)}
                      className="px-2 py-1 text-[11px] rounded bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-3 text-[11px] text-gray-500 dark:text-gray-400">
        Auto placeholder retest runs daily. Backend wiring TBD.
      </div>
    </aside>
  );
};

export default HistorySidebar;
