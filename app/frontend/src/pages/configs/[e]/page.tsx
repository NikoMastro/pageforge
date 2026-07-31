import React, { useState, useEffect, useMemo, useRef } from 'react';
import ToggleSwitch from '../../../components/ui/toggleSwitch';
import JsonView from '../../../components/ui/preview/previewJsonFile';
import type { LandingPageData } from '../../../types/shared.types';
import { pageforgeApi, type ConfigHistoryRecord } from '../../../api';
import { useAuth } from '../../../components/layout/authContext';
import { computeHashHex } from '../../../utils/backendPayload';
import { useNotifications } from '../../../components/ui';
import { useNavigate, useParams } from 'react-router-dom';
import ConfigHistoryList from '../../../components/ui/configs/configHistoryList';
import ConfigHistoryView from '../../../components/ui/configs/configHistoryView';

// Draft JSON the user edits: exclude metadata (user, Timestamp, hashid, commit)
type ConfigDraft = {
  page_name?: string;
  description?: string;
  type: string;
  active: boolean;
  type_value?: string;
  value?: any;
};

// Validation errors for required fields
type ValidationErrors = {
  page_name?: string;
  description?: string;
  type?: string;
  type_value?: string;
  value?: string;
};

const ConfigsPage: React.FC = () => {
  const { name: urlConfigName } = useParams<{ name: string }>();
  const [configActivationState, setConfigActivationState] = useState<'inactive' | 'active'>('active');

  const defaultConfigDraft: ConfigDraft = {
    page_name: "",
    description: "",
    type: "config",
    active: false,
    type_value: "",
    value: {}
  };

  const emptyLandingPagePreviewData: LandingPageData = {
    sections: []
  };

  const [currentConfigDraft, setCurrentConfigDraft] = useState<ConfigDraft>(defaultConfigDraft);
  const [configEditorJson, setConfigEditorJson] = useState(() => {
    const { active: _omit, ...rest } = defaultConfigDraft;
    return JSON.stringify(rest, null, 2);
  });
  const [jsonParsingError, setJsonParsingError] = useState<string | null>(null);
  const [configValidationErrors, setConfigValidationErrors] = useState<ValidationErrors>({});
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
  const [commitSummary, setCommitSummary] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: notifyError } = useNotifications();
  const [persistedHashId, setPersistedHashId] = useState<string | undefined>(undefined);
  const [initialConfigSnapshot, setInitialConfigSnapshot] = useState<string | null>(null);
  const [configHistory, setConfigHistory] = useState<ConfigHistoryRecord[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);
  const [historyLoadError, setHistoryLoadError] = useState<string | null>(null);
  const [isHistoryPanelCollapsed, setIsHistoryPanelCollapsed] = useState(true);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const sortedConfigHistory = useMemo(() => {
    const configHistoryCopy = configHistory.slice();
    configHistoryCopy.sort((a, b) => {
      const at = a?.timestamp ? Date.parse(a.timestamp) : Date.parse((a.data as any)?.Timestamp || '') || 0;
      const bt = b?.timestamp ? Date.parse(b.timestamp) : Date.parse((b.data as any)?.Timestamp || '') || 0;
      return at - bt;
    });
    return configHistoryCopy;
  }, [configHistory]);
  const latestConfigHistoryEntry = sortedConfigHistory[sortedConfigHistory.length - 1];
  const [activeHistoryEntryKey, setActiveHistoryEntryKey] = useState<string>('');
  const mainEditorPanelRef = useRef<HTMLDivElement | null>(null);

  // Remove auto selection of latest history on load to avoid confusion.
  // useEffect(() => {
  //   if (latestHistory && !selectedHistoryKey && sortedHistory.length > 0) {
  //     const latestKey = [
  //       latestHistory.name,
  //       latestHistory.timestamp || (latestHistory.data as any)?.Timestamp || (latestHistory as any)?.Timestamp || '',
  //       (latestHistory.data as any)?.commit || (latestHistory as any)?.commit || '',
  //       latestHistory.version
  //     ].filter(Boolean).join('|');
  //     setSelectedHistoryKey(latestKey || '');
  //   }
  // }, [latestHistory, sortedHistory.length]);

  const handleSelectHistory = (historyEntryKey: string) => {
    setActiveHistoryEntryKey(historyEntryKey);
    try { mainEditorPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch { /* ignore */ }
  };

  // Stable stringify util to compare JSON structures regardless of key order/whitespace
  const stableSerializeForComparison = (valueToSerialize: any): string => {
    const normalize = (value: any): any => {
      if (Array.isArray(value)) return value.map(normalize);
      if (value && typeof value === 'object') {
        const normalizedObject: Record<string, any> = {};
        for (const key of Object.keys(value).sort()) normalizedObject[key] = normalize(value[key]);
        return normalizedObject;
      }
      return value;
    };
    try {
      return JSON.stringify(normalize(valueToSerialize));
    } catch {
      return '';
    }
  };

  // Build the canonical snapshot we care about for saving/dirty-check
  const buildConfigSnapshot = (config: ConfigDraft): string => {
    const snapshotForComparison = {
      page_name: (config.page_name || '').trim(),
      description: (config.description || '').trim(),
      type: (config.type || 'config').toString(),
      active: !!config.active,
      type_value: ((config as any).type_value ?? '').toString(),
      value: typeof (config as any).value === 'undefined' ? {} : (config as any).value,
    };
    return stableSerializeForComparison(snapshotForComparison);
  };

  // Helper: stringify config without the `active` field (hidden in the JSON editor)
  const stringifyConfigWithoutActive = (config: ConfigDraft) => {
    const { active: _omit, ...rest } = config;
    return JSON.stringify(rest, null, 2);
  };

  // Validation function for required fields
  const validateConfigDraft = (configDraft: ConfigDraft): ValidationErrors => {
    const validationIssues: ValidationErrors = {};

    if (!configDraft.page_name || configDraft.page_name.trim().length === 0) {
      validationIssues.page_name = 'Page name is required';
    }

    if (!configDraft.type || configDraft.type.trim().length === 0) {
      validationIssues.type = 'Type is required';
    }

    // type_value and description are optional

    // Check if value is empty (null, undefined, empty object, or empty string)
    if (!configDraft.value ||
      (typeof configDraft.value === 'object' && Object.keys(configDraft.value).length === 0) ||
      (typeof configDraft.value === 'string' && configDraft.value.trim().length === 0)) {
      validationIssues.value = 'Value is required';
    }

    return validationIssues;
  };

  // Check if configuration is valid
  const isConfigDraftValid = () => {
    return Object.keys(configValidationErrors).length === 0;
  };

  useEffect(() => {
    setConfigActivationState(currentConfigDraft.active ? 'active' : 'inactive');
    setJsonParsingError(null);
    setConfigValidationErrors(validateConfigDraft(currentConfigDraft));
  }, [currentConfigDraft]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!urlConfigName || urlConfigName === 'new') { setIsLoading(false); return; }
        const fetchedConfig = await pageforgeApi.getConfig(urlConfigName);
        if (!mounted) return;
        const apiValue: any = (fetchedConfig as any).value;
        const configDraftFromApi: ConfigDraft = {
          page_name: fetchedConfig.page_name || urlConfigName,
          description: fetchedConfig.description || '',
          type: (fetchedConfig as any).type || 'config',
          active: !!fetchedConfig.active,
          type_value: (fetchedConfig as any).type_value ?? (fetchedConfig as any).typevalue ?? '',
          // Prefer objects as value; keep legacy compatibility for arrays/strings
          value: (() => {
            if (apiValue == null) return {};
            if (typeof apiValue === 'object') return apiValue; // object or array
            // legacy primitive -> wrap in { value: primitive }
            return { value: apiValue };
          })()
        };
        setCurrentConfigDraft(configDraftFromApi);
        setConfigEditorJson(stringifyConfigWithoutActive(configDraftFromApi));
        setConfigActivationState(configDraftFromApi.active ? 'active' : 'inactive');
        if (fetchedConfig.hashid) setPersistedHashId(fetchedConfig.hashid);
        // Capture initial snapshot for dirty-check
        setInitialConfigSnapshot(buildConfigSnapshot(configDraftFromApi));
      } catch (e) {
        console.error('Failed to load config', e);
      } finally {
        if (mounted) setIsLoading(false);
      }
      try {
        if (urlConfigName && urlConfigName !== 'new') {
          setIsHistoryLoading(true);
          setHistoryLoadError(null);
          const configHistoryResponse = await pageforgeApi.getConfigHistory(urlConfigName);
          setConfigHistory(Array.isArray(configHistoryResponse) ? configHistoryResponse : []);
        }
      } catch (e: any) {
        setHistoryLoadError(e?.message || 'Failed to load config history');
      } finally {
        setIsHistoryLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [urlConfigName]);

  const handleJsonChange = (updatedJson: string) => {
    // Preserve user formatting while typing (no auto pretty-print)
    setConfigEditorJson(updatedJson);
    try {
      const parsedConfigDraft = JSON.parse(updatedJson) as Omit<ConfigDraft, 'active'> & Partial<Pick<ConfigDraft, 'active'>>;
      const { active: _ignored, ...rest } = parsedConfigDraft as Record<string, unknown> as ConfigDraft;
      const nextConfigDraft = { ...rest, active: configActivationState === 'active' } as ConfigDraft;
      setCurrentConfigDraft((previousState) => ({ ...previousState, ...rest, active: previousState.active }));

      // Validate the new configuration
      setConfigValidationErrors(validateConfigDraft(nextConfigDraft));

      // Do NOT rewrite the editor content here; only validate and update state.
      setJsonParsingError(null);
    } catch (error) {
      setJsonParsingError(error instanceof Error ? error.message : 'Invalid JSON');
    }
  };

  const handlePrimarySaveClick = () => { setCommitSummary(''); setIsCommitModalOpen(true); };

  // Compute current snapshot from editor JSON + active toggle
  const currentConfigSnapshot = useMemo(() => {
    try {
      const configDraftWithoutActive = JSON.parse(configEditorJson) as Omit<ConfigDraft, 'active'> & Partial<Pick<ConfigDraft, 'active'>>;
      const mergedConfigDraft: ConfigDraft = { ...(configDraftWithoutActive as any), active: configActivationState === 'active' } as ConfigDraft;
      return buildConfigSnapshot(mergedConfigDraft);
    } catch {
      return null; // invalid JSON -> handled via jsonError
    }
  }, [configEditorJson, configActivationState]);

  const hasUnsavedChanges = useMemo(() => {
    if (!initialConfigSnapshot) return true; // before load, treat as dirty to keep Save gated by loading/validation
    if (!currentConfigSnapshot) return false; // can't determine, but JSON is invalid so Save is disabled anyway
    return currentConfigSnapshot !== initialConfigSnapshot;
  }, [initialConfigSnapshot, currentConfigSnapshot]);

  const persistConfig = async () => {
    setIsSaving(true);
    try {
      if (!hasUnsavedChanges) {
        setIsSaving(false);
        notifyError('No changes to save', { title: 'Config' });
        return;
      }
      const configDraftWithoutActive = JSON.parse(configEditorJson) as Omit<ConfigDraft, 'active'> & Partial<Pick<ConfigDraft, 'active'>>;

      // Validate the configuration before saving
      const configDraftToValidate = { ...configDraftWithoutActive, active: configActivationState === 'active' } as ConfigDraft;
      const validationIssues = validateConfigDraft(configDraftToValidate);
      if (Object.keys(validationIssues).length > 0) {
        notifyError('Please fix validation errors before saving', { title: 'Config' });
        setIsSaving(false);
        return;
      }

      // Required fields validation - page_name and description must be present
      if (!configDraftWithoutActive.page_name || configDraftWithoutActive.page_name.trim().length === 0) {
        notifyError('Page name is required', { title: 'Config' });
        setIsSaving(false);
        return;
      }

      if (!configDraftWithoutActive.description || configDraftWithoutActive.description.trim().length === 0) {
        notifyError('Description is required', { title: 'Config' });
        setIsSaving(false);
        return;
      }

      // Use the validated values
      const safeName = configDraftWithoutActive.page_name.trim();
      const safeDescription = configDraftWithoutActive.description.trim();
      const safeType = (configDraftWithoutActive as any).type || 'config';
      const safeTypeValue = ((configDraftWithoutActive as any).type_value ?? '').toString();
      const rawValue: any = (configDraftWithoutActive as any).value;
      // Allow any JSON; ensure undefined becomes {}
      const safeValue: any = typeof rawValue === 'undefined' ? {} : rawValue;
      // Build full metadata for save; these are not user's inputs but must be sent
      const timestamp = new Date().toISOString();
      const commit = commitSummary && commitSummary.trim().length > 0 ? commitSummary.trim() : 'update';
      const hashSource = JSON.stringify({
        page_name: safeName,
        description: safeDescription,
        type: safeType,
        active: configActivationState === 'active',
        type_value: safeTypeValue,
        value: safeValue,
      });
      const computedHash = await computeHashHex(hashSource);
      const metadata = {
        page_name: safeName,
        description: safeDescription,
        type: safeType,
        active: configActivationState === 'active',
        type_value: safeTypeValue,
        value: safeValue,
        Timestamp: timestamp,
        hashid: persistedHashId || computedHash,
        user: user?.email || 'unknown',
        commit,
      };
      await pageforgeApi.saveConfig({ metadata });
      success('Configuration saved', { title: 'Config' });
      setIsCommitModalOpen(false);
      navigate('/configs');
    } catch (e: any) {
      console.error('Save failed', e);
      notifyError(e?.message || 'Failed to save configuration', { title: 'Config' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivationToggle = (value: string) => {
    const nextActivationState = (value === 'active' ? 'active' : 'inactive') as 'inactive' | 'active';
    setConfigActivationState(nextActivationState);
    setCurrentConfigDraft((previousState) => ({ ...previousState, active: nextActivationState === 'active' }));
  };

  const handleRollback = async (entry: ConfigHistoryRecord) => {
    if (!entry || isRollingBack) return;

    const entryData = entry.data as any;
    const commitName = entryData?.commit || 'Previous version';
    const timestamp = entryData?.Timestamp || entry.timestamp;
    const formattedTime = timestamp ? new Date(timestamp).toLocaleString() : 'Unknown time';

    // Ask for confirmation before rollback
    const confirmed = window.confirm(`Are you sure you want to rollback to "${commitName}" (${formattedTime})?`);
    if (!confirmed) return;

    try {
      setIsRollingBack(true);
      const data = entryData;
      const restoredConfigDraft: ConfigDraft = {
        page_name: data?.page_name || entry.name,
        description: data?.description || '',
        type: data?.type || 'config',
        active: !!data?.active,
        type_value: typeof data?.type_value !== 'undefined' ? data.type_value : (data as any)?.typevalue || '',
        value: typeof data?.value === 'undefined' ? {} : data.value,
      };

      // Build metadata and save immediately
      const timestamp = new Date().toISOString();
      const hashSource = JSON.stringify({
        page_name: restoredConfigDraft.page_name,
        description: restoredConfigDraft.description,
        type: restoredConfigDraft.type,
        active: restoredConfigDraft.active,
        type_value: restoredConfigDraft.type_value,
        value: restoredConfigDraft.value,
      });
      const computedHash = await computeHashHex(hashSource);
      const metadata = {
        page_name: restoredConfigDraft.page_name,
        description: restoredConfigDraft.description,
        type: restoredConfigDraft.type,
        active: restoredConfigDraft.active,
        type_value: restoredConfigDraft.type_value,
        value: restoredConfigDraft.value,
        Timestamp: timestamp,
        hashid: persistedHashId || computedHash,
        user: user?.email || 'unknown',
        commit: `Rollback to: ${commitName}`,
      };
      await pageforgeApi.saveConfig({ metadata });

      // Update local state
      setCurrentConfigDraft(restoredConfigDraft);
      setConfigActivationState(restoredConfigDraft.active ? 'active' : 'inactive');
      setConfigEditorJson(stringifyConfigWithoutActive(restoredConfigDraft));
      setJsonParsingError(null);

      success(`Successfully rolled back to "${commitName}" (${formattedTime})`, { title: 'Config' });
      navigate('/configs');
    } catch (e: any) {
      console.error('Rollback failed', e);
      notifyError(e?.message || 'Failed to rollback', { title: 'Config' });
    } finally {
      setIsRollingBack(false);
    }
  };

  return (
    <div className="p-6 h-full min-h-0 flex flex-col text-white">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-1.5 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors"
            >
              Back
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <ToggleSwitch
              leftLabel="Inactive"
              rightLabel="Active"
              leftValue="inactive"
              rightValue="active"
              value={configActivationState}
              onToggle={handleActivationToggle}
            />
            <button
              onClick={handlePrimarySaveClick}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium disabled:bg-gray-600 disabled:cursor-not-allowed"
              disabled={!!jsonParsingError || !isConfigDraftValid() || !hasUnsavedChanges}
              title={
                jsonParsingError
                  ? 'Fix JSON errors before saving'
                  : !isConfigDraftValid()
                    ? 'Please fill in all required fields (page name, description, type, type value, and value)'
                    : !hasUnsavedChanges
                      ? 'No changes to save'
                      : ''
              }
            >
              Save
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-gray-400">Loading…</div>
        ) : (
          <>
            {/* Validation Errors Display */}
            {Object.keys(configValidationErrors).length > 0 && (
              <div className="mb-4 p-4 bg-red-900/20 border border-red-700 rounded-lg">
                <h4 className="text-red-400 font-medium mb-2">Validation Errors:</h4>
                <ul className="space-y-1">
                  {configValidationErrors.page_name && (
                    <li className="text-red-300 text-sm">• {configValidationErrors.page_name}</li>
                  )}
                  {configValidationErrors.description && (
                    <li className="text-red-300 text-sm">• {configValidationErrors.description}</li>
                  )}
                  {configValidationErrors.type && (
                    <li className="text-red-300 text-sm">• {configValidationErrors.type}</li>
                  )}
                  {configValidationErrors.type_value && (
                    <li className="text-red-300 text-sm">• {configValidationErrors.type_value}</li>
                  )}
                  {configValidationErrors.value && (
                    <li className="text-red-300 text-sm">• {configValidationErrors.value}</li>
                  )}
                </ul>
              </div>
            )}

            {/* Show history panel only if not creating a new config */}
            {urlConfigName && urlConfigName !== 'new' ? (
              <div className={[
                "flex-1 min-h-0 grid gap-4",
                isHistoryPanelCollapsed
                  ? "grid-cols-[auto_1fr]"
                  : "grid-cols-[320px_1fr]"
              ].join(' ')}>
                {/* Left: History list */}
                <div className="min-h-0 min-w-0 flex flex-col overflow-visible">
                  {isHistoryLoading ? (
                    <div className="flex-1 flex items-center justify-center text-sm text-gray-400 border border-gray-700 rounded-lg">Loading history…</div>
                  ) : historyLoadError ? (
                    <div className="flex-1 p-3 text-sm text-red-400 border border-red-700 rounded-lg">{historyLoadError}</div>
                  ) : (
                    <ConfigHistoryList
                      className="h-full"
                      entries={sortedConfigHistory}
                      selectedKey={activeHistoryEntryKey}
                      onSelect={handleSelectHistory}
                      latest={latestConfigHistoryEntry}
                      onRollback={handleRollback}
                      isRollingBack={isRollingBack}
                      collapsed={isHistoryPanelCollapsed}
                      onToggleCollapse={() => setIsHistoryPanelCollapsed(!isHistoryPanelCollapsed)}
                    />
                  )}
                </div>
                {/* Right: JSON editor */}
                <div ref={mainEditorPanelRef} className="min-h-0 min-w-0 flex flex-col bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden">
                  {activeHistoryEntryKey ? (
                    <div className="h-full w-full flex flex-col overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700 bg-gray-900/50">
                        <div className="text-sm text-gray-300">Viewing history diff</div>
                        <button
                          onClick={() => setActiveHistoryEntryKey('')}
                          className="px-2 py-1 text-xs bg-gray-700 text-gray-200 rounded hover:bg-gray-600"
                        >
                          Back to editor
                        </button>
                      </div>
                      <div className="flex-1 min-h-0">
                        <ConfigHistoryView
                          key="config-history-view-stable"
                          history={sortedConfigHistory}
                          selectedKey={activeHistoryEntryKey}
                          currentOverrideJson={(() => {
                            try {
                              // Build pretty JSON from current editor state to mirror prettyConfigJson structure
                              const configDraftWithoutActive = JSON.parse(configEditorJson) as any;
                              const mergedConfigDraft = { ...configDraftWithoutActive, active: configActivationState === 'active' };
                              return JSON.stringify(mergedConfigDraft, null, 2);
                            } catch {
                              return undefined;
                            }
                          })()}
                        />
                      </div>
                    </div>
                  ) : (
                    <JsonView
                      key="editor"
                      data={emptyLandingPagePreviewData}
                      editableJson={configEditorJson}
                      isEditMode={true}
                      jsonError={jsonParsingError}
                      onJsonChange={handleJsonChange}
                      autoCleanOnMount={false}
                    />
                  )}
                </div>
              </div>
            ) : (
              /* New config: Show only the editor without history panel */
              <div className="flex-1 min-h-0">
                <div ref={mainEditorPanelRef} className="h-full flex flex-col bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden">
                  <JsonView
                    key="editor"
                    data={emptyLandingPagePreviewData}
                    editableJson={configEditorJson}
                    isEditMode={true}
                    jsonError={jsonParsingError}
                    onJsonChange={handleJsonChange}
                    autoCleanOnMount={false}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Commit message modal */}
      {isCommitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
            onClick={() => setIsCommitModalOpen(false)}
          />
          <div className="relative bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-md mx-4 p-5">
            <h3 className="text-lg font-semibold text-white mb-3">Commit message</h3>
            <textarea
              value={commitSummary}
              onChange={(e) => setCommitSummary(e.target.value)}
              placeholder="Describe your changes"
              className="w-full h-28 p-3 bg-gray-900 text-gray-100 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <div className="mt-4 flex items-center justify-between">
              <div />
              <div className="space-x-2">
                <button
                  onClick={() => { setIsCommitModalOpen(false); }}
                  className="px-3 py-2 text-sm bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600"
                  disabled={isSaving}
                >
                  Cancel and go back
                </button>
                <button
                  onClick={persistConfig}
                  className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={(() => {
                    return (isSaving || !!jsonParsingError || !isConfigDraftValid() || commitSummary.trim().length === 0 || !hasUnsavedChanges);
                  })()}
                  title={
                    !isConfigDraftValid()
                      ? 'Please fill in all required fields (page name, description, type, type value, and value)'
                      : jsonParsingError
                        ? 'Fix JSON errors before saving'
                        : commitSummary.trim().length === 0
                          ? 'Commit message is required'
                          : !hasUnsavedChanges
                            ? 'No changes to save'
                            : ''
                  }
                >
                  {isSaving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
            {/* Required fields: page_name, description, type, type_value and value must be provided */}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigsPage;
