import React, { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import type { LandingPageConfig, LandingPageData } from '../../../types';
import { pageforgeApi } from '../../../api';
import type { LandingPageRecord } from '../../../api';
import { buildBackendPayload } from '../../../utils/backendPayload';
import { useNotifications } from '../../layout/notifiations';
import { useAuth } from '../../layout/authContext';
import JsonEditConfigurator from '../../landingpagesconfig/lpEditConfiguration';
import PreviewJsonFile from './previewJsonFile';
import PreviewJsonHistory from './previewJsonHistory';

type TabKey = 'json' | 'html' | 'config' | 'history';

interface EditorPanelProps {
  id?: string;
  name?: string;
  className?: string;
  onSaved?: (cfg: LandingPageConfig) => void;
  autoSave?: boolean;
  initialConfig?: LandingPageConfig;
  selectedHistoryKey?: string;
  overrideCurrentLandingData?: LandingPageData;
  overrideCurrentHtmlConfig?: any;
  onTempDataChange?: (data: { landingPageData: LandingPageData; htmlConfig?: any }) => void;
}

const EditorPanel: React.FC<EditorPanelProps> = ({ id, name, className = '', onSaved, initialConfig, selectedHistoryKey, overrideCurrentLandingData, overrideCurrentHtmlConfig, onTempDataChange }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('config');
  const [config, setConfig] = useState<LandingPageConfig | null>(null);
  const { error: notifyError } = useNotifications() as any;
  const [rawLandingData, setRawLandingData] = useState<string>('{}');
  const [history, setHistory] = useState<LandingPageRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const { user: authUser } = useAuth();
  const actor = authUser?.email || 'unknown';
  const htmlEditorRef = React.useRef<any>(null);

  const loadConfig = useCallback(async () => {
    if (initialConfig) {
      const pm = (initialConfig.htmlConfig as any)?.pixelMode;
      const normPm = pm === 'custom' || pm === 'full' || pm === 'none' || pm === 'global' || pm === 'pftag_prod' || pm === 'pftag_preprod' ? pm : 'full';
      const normalized = {
        ...initialConfig,
        htmlConfig: {
          ...initialConfig.htmlConfig,
          pixelMode: normPm as any
        }
      } as typeof initialConfig;
      setConfig(normalized);
      setRawLandingData(JSON.stringify(initialConfig.landingPageData, null, 2));
      return;
    }
    if (!id && !name) return;
    setLoading(true); setError(null);
    try {
      const data = await pageforgeApi.getJsonFromFirestore(name);
      const backendLike = data.raw ? data.raw : {
        user: 'unknown', type: 'fetch', commit: 'fetch', timestamp: new Date().toISOString(), page_name: name || id || 'default', lp_json: JSON.stringify({ landingPageData: data.landingPageData, htmlConfig: data.htmlConfig, generatedHtml: data.generatedHtml }), hashid: id || name || 'temp'
      };
      let unified: LandingPageConfig = {
        id: backendLike.hashid,
        backend: {
          user: backendLike.user,
          type: backendLike.type,
          commit: backendLike.commit,
          timestamp: backendLike.timestamp,
          page_name: backendLike.page_name,
          lp_json: backendLike.lp_json,
          hashid: backendLike.hashid,
        },
        landingPageData: data.landingPageData,
        htmlConfig: data.htmlConfig || {},
        generatedHtml: data.generatedHtml || '',
        kind: 'unified'
      };

      {
        const pm = (unified.htmlConfig as any)?.pixelMode;
        const normPm = pm === 'custom' || pm === 'full' || pm === 'none' || pm === 'global' || pm === 'pftag_prod' || pm === 'pftag_preprod' ? pm : 'full';
        unified = { ...unified, htmlConfig: { ...unified.htmlConfig, pixelMode: normPm as any } };
      }

      setConfig(unified);
      setRawLandingData(JSON.stringify(unified.landingPageData, null, 2));
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [id, name, initialConfig]);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  // Cleanup HTML editor on unmount
  useEffect(() => {
    return () => {
      if (htmlEditorRef.current) {
        try {
          htmlEditorRef.current.dispose();
          htmlEditorRef.current = null;
        } catch (error) {
          console.debug('Monaco HTML editor cleanup completed');
        }
      }
    };
  }, []);

  const loadHistory = useCallback(async (page?: string) => {
    const target = page || config?.backend?.page_name || name;
    if (!target) return;
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const hist = await pageforgeApi.getLandingPageHistory(target);

      if (hist && hist.length > 0) {
        setHistory(hist);
      } else {
        if (config?.backend) {
          setHistory([config.backend as unknown as LandingPageRecord]);
        } else {
          setHistory([]);
        }
      }
    } catch (e: any) {
      setHistoryError(e?.message || 'Failed to load history');
      // Seed with config backend when available so UI still shows something
      if (config?.backend) {
        setHistory([config.backend as unknown as LandingPageRecord]);
      }
    } finally {
      setHistoryLoading(false);
    }
  }, [config?.backend, name]);

  useEffect(() => {
    const page = config?.backend?.page_name || name;
    if (!page) return;
    loadHistory(page);
  }, [config?.backend?.page_name, name, loadHistory]);

  // Handle JSON changes with validation
  const handleJsonChange = useCallback((value: string) => {
    setRawLandingData(value);

    // Validate JSON
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (e: any) {
      setJsonError(e.message);
    }
  }, []);

  // HTML settings edits are handled in the UI tab configurator.

  const handleSave = async () => {
    if (!config) return;
    setSaving(true); setError(null);
    try {
      let landingPageData: LandingPageData = config.landingPageData;
      let htmlConfig = config.htmlConfig;

      // Use override data if available (from config editor temp changes)
      if (overrideCurrentLandingData) {
        landingPageData = overrideCurrentLandingData;
      }
      if (overrideCurrentHtmlConfig) {
        htmlConfig = overrideCurrentHtmlConfig;
      }

      if (activeTab === 'json') {
        try { landingPageData = JSON.parse(rawLandingData); } catch { throw new Error('Invalid JSON in Landing Page Data'); }
      }
      const saveReq = {
        page_name: config.backend.page_name,
        landingPageData,
        htmlConfig,
        commit: 'editor-save',
        user: actor,
        type: 'update'
      } as const;
      const tempConfigForHtml = { ...config, landingPageData, htmlConfig };
      const htmlAutoReq = { ...saveReq, landingPageData: tempConfigForHtml.landingPageData, htmlConfig: tempConfigForHtml.htmlConfig };
      const { metadata } = await buildBackendPayload(htmlAutoReq, {
        existingId: config.id,
        user: actor,
        type: saveReq.type,
        commit: saveReq.commit,
      });
      await pageforgeApi.saveToFirestore({ metadata });

      await loadConfig();
      await loadHistory(config.backend.page_name);

      onSaved?.(tempConfigForHtml as any);
    } catch (e: any) {
      console.error('Save error:', e);
      setError(e.message || 'Failed to save');
      notifyError?.(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>
        {`
        /* Hide scrollbar utility */
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { width: 0; height: 0; }
        /* Ensure all nested scroll areas in the panel have hidden/transparent scrollbars */
        .editor-panel * { -ms-overflow-style: none; scrollbar-width: none; }
        .editor-panel *::-webkit-scrollbar { width: 0 !important; height: 0 !important; background: transparent; }
        .editor-panel *::-webkit-scrollbar-thumb { background: transparent; }
        .editor-panel *::-webkit-scrollbar-track { background: transparent; }
        `}
      </style>
      <div className={`editor-panel flex flex-col h-full overflow-hidden dark:bg-gray-900 ${className}`}>
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-4">
            {(['json', 'html', 'config', 'history'] as TabKey[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium pb-1 border-b-2 ${activeTab === tab ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {saving && <span className="text-xs text-indigo-500 dark:text-indigo-400 animate-pulse">Saving...</span>}
            {activeTab !== 'config' && (
              <button onClick={handleSave} disabled={saving || loading || !config} className="px-3 py-1.5 rounded-md text-sm bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed">Save</button>
            )}
          </div>
        </div>
        {error && <div className="px-4 py-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">{error}</div>}
        <div className="flex-1 min-h-0 relative">
          {loading && <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">Loading...</div>}

          {/* Keep config editor always mounted to preserve state when switching tabs */}
          {!loading && config && (
            <div className={`absolute inset-0 overflow-auto no-scrollbar p-4 ${activeTab === 'config' ? 'block' : 'hidden'}`}>
              <JsonEditConfigurator
                key={`config-editor-${config.backend.page_name}`}
                pageName={config.backend.page_name}
                initialData={config.landingPageData as any}
                initialHtmlConfig={config.htmlConfig as any}
                className="h-full"
                onSaved={() => {
                  // Reload the config so HTML/JSON reflect latest
                  loadConfig();
                  onSaved?.(config);
                }}
                onTempDataChange={onTempDataChange}
              />
            </div>
          )}

          {!loading && config && activeTab === 'json' && (
            <div className="absolute inset-0 overflow-auto no-scrollbar p-4">
              <PreviewJsonFile
                data={config.landingPageData}
                editableJson={rawLandingData}
                isEditMode={true}
                jsonError={jsonError}
                onJsonChange={handleJsonChange}
                autoCleanOnMount={true}
              />
            </div>
          )}

          {!loading && config && activeTab === 'html' && (
            <div className="absolute inset-0 overflow-auto no-scrollbar p-4 flex flex-col gap-2">
              {config.generatedHtml?.trim() ? (
                <>
                  <div className="text-xs text-gray-500 dark:text-gray-400">HTML from JSON (read-only)</div>
                  <Editor
                    language="html"
                    height="calc(100vh - 220px)"
                    value={config.generatedHtml}
                    onMount={(editor) => { htmlEditorRef.current = editor; }}
                    options={{ readOnly: true, minimap: { enabled: false }, fontSize: 12, wordWrap: 'off' }}
                    theme="vs-dark"
                  />
                </>
              ) : (
                <div className="text-sm text-gray-600 dark:text-gray-300">HTML not available</div>
              )}
            </div>
          )}

          {!loading && config && activeTab === 'history' && (
            <div className="absolute inset-0 overflow-auto no-scrollbar p-4 flex flex-col">
              {historyLoading && (
                <div className="p-3 text-sm text-gray-400">Loading history…</div>
              )}
              {historyError && (
                <div className="p-3 text-sm text-red-400">{historyError}</div>
              )}
              {!historyLoading && (
                <PreviewJsonHistory
                  history={history}
                  className="flex-1"
                  initialKey={selectedHistoryKey}
                  currentOverrideJson={(() => {
                    try {
                      const lp = overrideCurrentLandingData ?? config.landingPageData;
                      const html = overrideCurrentHtmlConfig ?? config.htmlConfig;
                      const obj = { landingPageData: lp, htmlConfig: html, generatedHtml: config.generatedHtml };
                      return JSON.stringify(obj, null, 2);
                    } catch {
                      return undefined;
                    }
                  })()}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EditorPanel;
