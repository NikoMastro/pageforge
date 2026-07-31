import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { LandingPageData } from '../../../types/shared.types';
import { pageforgeApi, type LandingPageRecord } from '../../../api';
import EditorPanel from '../../../components/ui/preview/previewEditFile';
import PreviewView from '../../../components/ui/preview/previewLP';
import PreviewHistoryList from '../../../components/ui/preview/previewHistoryList';
import ResizablePanels from '../../../components/ui/preview/displayPanels';
import type { LandingPageConfig } from '../../../types';
import { buildBackendPayload } from '../../../utils/backendPayload';
import { useAuth } from '../../../components/layout/authContext';
import { useNotifications } from '../../../components/ui';
import { useLandingPages } from '../../../hooks';

interface JsonPreviewProps {
  data: LandingPageData;
  onBack: () => void;
  onOpenLp?: () => void;
  isEditMode?: boolean;
  onSave?: (data: LandingPageData) => void;
  configItem?: { id: string; name: string };
  cardName?: string;
  fullConfig?: LandingPageConfig | null;
  onAfterSave?: () => void;
  onRollback?: (historyEntry: any) => void;
  isRollingBack?: boolean;
  onDeploy?: () => void;
}

const JsonPreviewComponent: React.FC<JsonPreviewProps> = ({ data, onBack, onOpenLp, isEditMode = false, onSave: _onSave, configItem, cardName, fullConfig, onAfterSave, onRollback, isRollingBack = false, onDeploy }) => {
  const [editableJson, setEditableJson] = useState<string>(JSON.stringify(data, null, 2));
  const [tempLandingData, setTempLandingData] = useState<LandingPageData | null>(null);
  const [tempHtmlConfig, setTempHtmlConfig] = useState<any>(null);
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 767.98px)').matches;
  });
  const [history, setHistory] = useState<LandingPageRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    setEditableJson(JSON.stringify(data, null, 2));
  }, [data]);

  // Callback to capture temporary changes from Config tab (before save)
  const handleTempDataChange = useCallback((updated: { landingPageData: LandingPageData; htmlConfig?: any }) => {
    setTempLandingData(updated.landingPageData);
    setTempHtmlConfig(updated.htmlConfig ?? null);
  }, []);

  // Watch for viewport changes to toggle mobile/desktop layouts
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(max-width: 767.98px)');
    const handler = (e: MediaQueryListEvent) => setIsSmallScreen(e.matches);
    setIsSmallScreen(mql.matches);
    try { mql.addEventListener('change', handler); } catch { mql.addListener(handler); }
    return () => { try { mql.removeEventListener('change', handler); } catch { mql.removeListener(handler); } };
  }, []);

  // Load history for the right-hand panel list (replacing Console)
  const pageForHistory = configItem?.name || cardName;
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!pageForHistory) return;
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const hist = await pageforgeApi.getLandingPageHistory(pageForHistory);
        if (!cancelled) setHistory(Array.isArray(hist) ? hist : []);
      } catch (e: any) {
        if (!cancelled) setHistoryError(e?.message || 'Failed to load history');
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [pageForHistory]);

  // Derive sorted entries and selection info
  const sortedHistory = useMemo(() => {
    const copy = history.slice();
    copy.sort((a, b) => {
      const at = a?.timestamp ? Date.parse(a.timestamp) : 0;
      const bt = b?.timestamp ? Date.parse(b.timestamp) : 0;
      return at - bt;
    });
    return copy;
  }, [history]);
  const latest = sortedHistory[sortedHistory.length - 1];
  const makeKey = (e?: LandingPageRecord) => e ? [e.hashid, e.timestamp, e.commit].filter(Boolean).join('|') : '';
  // Auto-select the latest (most recent) history entry to show diff between current and DB by default
  const defaultSelectedKey = useMemo(() => {
    if (sortedHistory.length > 0) return makeKey(sortedHistory[sortedHistory.length - 1]);
    return '';
  }, [sortedHistory]);
  const [selectedKey, setSelectedKey] = useState<string>(defaultSelectedKey);
  useEffect(() => { setSelectedKey(defaultSelectedKey); }, [defaultSelectedKey]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 flex justify-between items-center py-4 border-b border-gray-700 px-4">
        <h2 className="text-2xl font-bold text-white">
          {cardName ? `${cardName}${isEditMode ? ' (Edit Mode)' : ''}` : 'Loading...'}
        </h2>
        <div className="flex items-center space-x-4">
          {/* Edit button removed – editor always visible on the right */}

          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 border-transparent text-sm font-medium rounded-md text-indigo-300 bg-gray-800 hover:bg-gray-700"
          >
            Back to List
          </button>
          {onOpenLp && (
            <button
              onClick={onOpenLp}
              className="inline-flex items-center px-4 py-2 border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Open LP
            </button>
          )}
          {onDeploy && (
            <button
              onClick={onDeploy}
              className="inline-flex items-center px-4 py-2 border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Deploy
            </button>
          )}
        </div>
      </div>
      {/* Responsive Layout: stack on small screens, resizable split on md+ */}
      <div className="flex-1 min-h-0">
        {isSmallScreen ? (
          <div className="h-full flex flex-col overflow-auto">
            {/* 1) Configs (Editor with Json/Html/Config tabs) */}
            <div className="w-full bg-white/5 border-b border-gray-700">
              {configItem && fullConfig && (
                <EditorPanel
                  name={configItem.name}
                  initialConfig={fullConfig}
                  className="h-full"
                  onSaved={async () => {
                    setTempLandingData(null); // Reset temp data after save
                    setTempHtmlConfig(null); // Reset temp html config after save
                    await onAfterSave?.();
                  }}
                  selectedHistoryKey={selectedKey}
                  overrideCurrentLandingData={tempLandingData ?? (() => { try { return JSON.parse(editableJson); } catch { return data; } })()}
                  overrideCurrentHtmlConfig={tempHtmlConfig}
                  onTempDataChange={handleTempDataChange}
                />
              )}
            </div>
            {/* 2) Preview */}
            <div className="w-full min-h-0 p-4">
              <PreviewView data={data} editableJson={editableJson} />
            </div>
            {/* 3) History List */}
            <div className="w-full min-h-0 bg-gray-900 p-4 scrollbar-hide no-scrollbar">
              {historyLoading ? (
                <div className="text-sm text-gray-400">Loading history…</div>
              ) : historyError ? (
                <div className="text-sm text-red-400">{historyError}</div>
              ) : (
                <PreviewHistoryList
                  className="h-full"
                  entries={sortedHistory as any}
                  selectedKey={selectedKey}
                  onSelect={setSelectedKey}
                  latest={latest as any}
                  onRollback={onRollback}
                  isRollingBack={isRollingBack}
                />
              )}
            </div>
          </div>
        ) : (
          <ResizablePanels direction="horizontal" initialSizes={[70, 30]} minSizes={[40, 20]}>
            {/* Left: Editor */}
            <div className="h-full">
              {configItem && fullConfig && (
                <EditorPanel
                  name={configItem.name}
                  initialConfig={fullConfig}
                  className="h-full"
                  onSaved={async () => {
                    setTempLandingData(null); // Reset temp data after save
                    setTempHtmlConfig(null); // Reset temp html config after save
                    await onAfterSave?.();
                  }}
                  selectedHistoryKey={selectedKey}
                  overrideCurrentLandingData={tempLandingData ?? (() => { try { return JSON.parse(editableJson); } catch { return data; } })()}
                  overrideCurrentHtmlConfig={tempHtmlConfig}
                  onTempDataChange={handleTempDataChange}
                />
              )}
            </div>
            {/* Right: Preview + Console (vertical split) */}
            <div className="h-full border-l border-gray-700 bg-white/5">
              <ResizablePanels direction="vertical" initialSizes={[50, 50]} minSizes={[30, 10]}>
                <div className="w-full h-full min-h-0 p-4">
                  <PreviewView data={data} editableJson={editableJson} />
                </div>
                <div className="w-full h-full min-h-0 bg-gray-900 p-4 scrollbar-hide no-scrollbar">
                  {historyLoading ? (
                    <div className="text-sm text-gray-400">Loading history…</div>
                  ) : historyError ? (
                    <div className="text-sm text-red-400">{historyError}</div>
                  ) : (
                    <PreviewHistoryList
                      className="h-full"
                      entries={sortedHistory as any}
                      selectedKey={selectedKey}
                      onSelect={setSelectedKey}
                      latest={latest as any}
                      onRollback={onRollback}
                      isRollingBack={isRollingBack}
                    />
                  )}
                </div>
              </ResizablePanels>
            </div>
          </ResizablePanels>
        )}
      </div>
    </div>
  );
};

// Route-aware wrapper component
const JsonPreview: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const isEditMode = searchParams.get('edit') === 'true';
  const [data, setData] = useState<LandingPageData | null>(null);
  const [configItem, setConfigItem] = useState<{ id: string; name: string } | null>(null);
  const [fullConfig, setFullConfig] = useState<LandingPageConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRollingBack, setIsRollingBack] = useState<boolean>(false);
  const { user: authUser } = useAuth();
  const { success, error: notifyError } = useNotifications();
  const actor = authUser?.email || 'unknown';
  const { deploy } = useLandingPages();

  const loadData = useCallback(async () => {
    if (!name) return;
    try {
      setLoading(true);
      // Use PageforgeApi unified fetch
      const result = await pageforgeApi.getJsonFromFirestore(name);
      const raw = result.raw;
      if (!raw) {
        setError(`Configuration '${name}' not found`);
        return;
      }
      const adaptedConfig: LandingPageConfig = {
        backend: {
          user: raw.user,
          type: raw.type,
          commit: raw.commit,
          timestamp: raw.timestamp,
          page_name: raw.page_name,
          lp_json: raw.lp_json,
          hashid: raw.hashid
        },
        landingPageData: result.landingPageData || { metadata: {}, settings: {}, sections: [] },
        htmlConfig: result.htmlConfig || {},
        generatedHtml: result.generatedHtml || ''
      } as LandingPageConfig;
      setConfigItem({ id: adaptedConfig.backend.hashid, name: adaptedConfig.backend.page_name });
      setFullConfig(adaptedConfig);
      setData(adaptedConfig.landingPageData as LandingPageData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  }, [name]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleBack = () => {
    navigate('/landing-pages');
  };

  const handleOpenLp = () => {
    if (name) {
      window.open(`/landing/${name}`, '_blank');
    }
  };

  const handleSave = async (updatedData: LandingPageData) => {
    if (!configItem) return;
    try {
      const { metadata } = await buildBackendPayload({
        page_name: configItem.name,
        landingPageData: updatedData,
        htmlConfig: undefined,
        commit: 'edit',
        user: actor,
        type: 'update'
      });
      await pageforgeApi.saveToFirestore({ metadata });
      setData(updatedData);
      await loadData();
    } catch (err) {
      console.error('Failed to save configuration via saveToFirestore:', err);
    }
  };

  const handleRollback = async (historyEntry: any) => {
    if (!configItem || isRollingBack) return;

    const commitName = historyEntry.commit || 'Previous version';
    const timestamp = historyEntry.timestamp ? new Date(historyEntry.timestamp).toLocaleString() : 'Unknown time';

    // Ask for confirmation before rollback
    const confirmed = window.confirm(`Are you sure you want to rollback to "${commitName}" (${timestamp})?`);
    if (!confirmed) return;

    try {
      setIsRollingBack(true);

      // Parse the JSON from the history entry
      const parsedData = JSON.parse(historyEntry.lp_json);
      const rollbackLandingPageData = parsedData.landingPageData;
      if (!rollbackLandingPageData) throw new Error('Invalid rollback data: landingPageData not found');

      // Also extract htmlConfig if it exists
      const rollbackHtmlConfig = parsedData.htmlConfig || {};

      // Save the rollback data immediately
      const { metadata } = await buildBackendPayload({
        page_name: configItem.name,
        landingPageData: rollbackLandingPageData,
        htmlConfig: rollbackHtmlConfig,
        commit: `Rollback to: ${commitName}`,
        user: actor,
        type: 'update'
      });
      await pageforgeApi.saveToFirestore({ metadata });

      // Update local state and reload
      setData(rollbackLandingPageData);
      setFullConfig(prev => prev ? {
        ...prev,
        landingPageData: rollbackLandingPageData,
        htmlConfig: rollbackHtmlConfig
      } : null);
      await loadData();

      success(`Successfully rolled back to "${commitName}" (${timestamp})`);
    } catch (err) {
      console.error('Failed to rollback:', err);
      notifyError(`Failed to rollback: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsRollingBack(false);
    }
  };

  const handleDeploy = async () => {
    if (!configItem) return;
    try {
      // Ensure we have the latest data before deploying
      await loadData();
      const url = await deploy(configItem.name);
      if (!url) {
        console.warn('Deployment triggered but no URL returned');
      }
    } catch (e) {
      console.error('Error during deployment:', e);
      notifyError(`Failed to deploy: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-600 border-t-gray-300 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-400">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-sm text-red-400">{error || 'Configuration not found'}</p>
          <button
            onClick={handleBack}
            className="mt-4 inline-flex items-center px-4 py-2 border-transparent text-sm font-medium rounded-md text-indigo-300 bg-gray-800 hover:bg-gray-700"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <JsonPreviewComponent
      data={data}
      onBack={handleBack}
      onOpenLp={handleOpenLp}
      isEditMode={isEditMode}
      onSave={isEditMode ? handleSave : undefined}
      configItem={configItem || undefined}
      cardName={name}
      fullConfig={fullConfig}
      onAfterSave={loadData}
      onRollback={handleRollback}
      isRollingBack={isRollingBack}
      onDeploy={handleDeploy}
    />
  );
};

export default JsonPreview;
