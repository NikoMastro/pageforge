import React, { useEffect, useMemo, useState } from 'react';
import { backendUrl } from '../../config/config';
import LhResult from '../../components/ui/lptester/lhResult';
import type { UrlTesterResult } from '../../types/ui.types';
import HistorySidebar, { type HistoryItem, type HistoryRun } from '../../components/ui/lptester/historySidebar';

const BACKEND_URL = backendUrl;

const ExperimentsPage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UrlTesterResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalUrl, setModalUrl] = useState('');

  // Local history (UI-only placeholder). Persist in localStorage.
  const storageKey = 'urlTester.history.v1';
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw) as HistoryItem[];
    } catch { }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(history));
    } catch { }
  }, [history]);

  // Listen for the event from the navigation button to open the modal
  useEffect(() => {
    const handleOpenModal = () => {
      setIsModalOpen(true);
      setModalUrl('');
    };

    window.addEventListener('url-tester:open-scan-modal', handleOpenModal);
    return () => {
      window.removeEventListener('url-tester:open-scan-modal', handleOpenModal);
    };
  }, []);

  const handleModalSubmit = () => {
    if (modalUrl.trim()) {
      setUrl(modalUrl);
      setIsModalOpen(false);
      // Trigger the test with the new URL
      setTimeout(() => {
        handleTest();
      }, 0);
    }
  };

  const handleTest = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BACKEND_URL}/crawler/analyze`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: UrlTesterResult = await response.json();

      if (!data.ok) {
        throw new Error('Test failed - response not ok');
      }

      setResult(data);
      if (data.target) {
        setUrl(data.target);
      }

      // Update history (UI only)
      const keyUrl = data.target || url;
      if (keyUrl) {
        setHistory((prev) => {
          const idx = prev.findIndex((h) => h.url === keyUrl);
          const run: HistoryRun = { at: Date.now(), result: data, source: 'manual' };
          if (idx >= 0) {
            const next = [...prev];
            const existing = next[idx];
            next[idx] = { ...existing, runs: [...existing.runs, run].slice(-20) };
            return next;
          }
          return [...prev, { url: keyUrl, runs: [run] }];
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while testing the URL');
      console.error('Error testing URL:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTest();
    }
  };

  // Placeholder daily auto re-test logic (UI only, no actual backend scheduling)
  useEffect(() => {
    // Check each minute if an item is due; if so, mark a synthetic run using last known result
    const id = setInterval(() => {
      setHistory((prev) => {
        const now = Date.now();
        let changed = false;
        const next = prev.map((item) => {
          const last = item.runs[item.runs.length - 1];
          const lastAt = last?.at ?? 0;
          const dueAt = lastAt + 24 * 60 * 60 * 1000;
          if (now >= dueAt && last) {
            // create a copy run with same result to simulate auto re-test
            const synthetic: HistoryRun = { at: now, result: last.result, source: 'auto' };
            changed = true;
            return { ...item, runs: [...item.runs, synthetic].slice(-20) };
          }
          return item;
        });
        return changed ? next : prev;
      });
    }, 60_000); // every minute
    return () => clearInterval(id);
  }, []);

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => {
      const aAt = a.runs[a.runs.length - 1]?.at ?? 0;
      const bAt = b.runs[b.runs.length - 1]?.at ?? 0;
      return bAt - aAt;
    });
  }, [history]);

  const selectHistory = (item: HistoryItem) => {
    const last = item.runs[item.runs.length - 1]?.result;
    if (last) {
      setResult(last);
      setUrl(item.url);
      setError(null);
    }
  };

  const retestHistory = (item: HistoryItem) => {
    // UI-only: reuse last result to append a new run immediately
    const last = item.runs[item.runs.length - 1];
    if (!last) return;
    setHistory((prev) =>
      prev.map((h) => {
        if (h.url !== item.url) return h;
        const newRun: HistoryRun = { at: Date.now(), result: last.result, source: 'manual' };
        return { ...h, runs: [...h.runs, newRun].slice(-20) };
      })
    );
    setUrl(item.url);
    setResult(last.result);
  };

  const removeHistory = (item: HistoryItem) => {
    setHistory((prev) => prev.filter((h) => h.url !== item.url));
  };

  return (
    <div className="h-full p-6 flex flex-col overflow-hidden">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col overflow-hidden">
        <div className="mb-6 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">URL Tester</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Test URLs and analyze Lighthouse performance metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
          <div className="lg:col-span-8 space-y-6 overflow-y-auto pr-2 h-full">
            {/* URL Input Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enter URL to Test
                  </label>
                  <div className="flex gap-3">
                    <input
                      id="url-input"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="https://example.com"
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent outline-none transition-all"
                      disabled={loading}
                    />
                    <button
                      onClick={handleTest}
                      disabled={loading || !url.trim()}
                      className="px-6 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Testing...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                          </svg>
                          Test
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Error</h3>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results Section */}
            {result && result.lighthouse && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <LhResult data={result} />
              </div>
            )}

            {/* Empty State */}
            {!result && !loading && !error && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Ready to Test</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Enter a URL above and click "Test" to analyze its Lighthouse performance metrics.
                </p>
              </div>
            )}
          </div>
          <div className="lg:col-span-4 overflow-y-auto h-full">
            <HistorySidebar items={sortedHistory} onSelect={selectHistory} onRetest={retestHistory} onRemove={removeHistory} />
          </div>
        </div>
      </div>

      {/* Scan URL Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Scan URL</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <label htmlFor="modal-url-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter URL to Scan
              </label>
              <input
                id="modal-url-input"
                type="url"
                value={modalUrl}
                onChange={(e) => setModalUrl(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleModalSubmit();
                  }
                }}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent outline-none transition-all"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                disabled={!modalUrl.trim()}
                className="px-6 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                Scan URL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperimentsPage;
