import React, { useRef, useEffect } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import type { ConfigHistoryRecord } from '../../../api';

export interface ConfigHistoryViewProps {
  history: ConfigHistoryRecord[];
  selectedKey?: string;
  className?: string;
  // When provided, overrides the right-side (current) JSON without relying on latest history
  currentOverrideJson?: string;
}

const getTs = (e?: ConfigHistoryRecord) => e?.timestamp || (e?.data as any)?.Timestamp || (e as any)?.Timestamp || '';
const getCommit = (e?: ConfigHistoryRecord) => (e?.data as any)?.commit || (e as any)?.commit || '';
const itemKey = (e: ConfigHistoryRecord) => {
  const parts = [e.name, getTs(e), getCommit(e), e.version].filter(Boolean);
  return parts.length > 0 ? parts.join('|') : `fallback-${Math.random().toString(36).substring(7)}`;
};

function prettyConfigJson(entry?: ConfigHistoryRecord): string {
  if (!entry) return '{}';
  try {
    const d = entry.data as any;
    const core = {
      page_name: d?.page_name,
      description: d?.description,
      type: d?.type,
      active: !!d?.active,
      type_value: d?.type_value ?? (d as any)?.typevalue,
      value: typeof d?.value === 'undefined' ? {} : d?.value,
    };
    return JSON.stringify(core, null, 2);
  } catch {
    try { return JSON.stringify(entry.data ?? {}, null, 2); } catch { return '{}'; }
  }
}

const StableDiffEditor: React.FC<{
  originalJson: string;
  modifiedJson: string;
}> = React.memo(({ originalJson, modifiedJson }) => {
  const editorRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (editorRef.current) {
        try {
          const editor = editorRef.current;
          // First, set models to null to avoid the "TextModel got disposed before DiffEditorWidget model got reset" error
          try {
            const originalEditor = editor.getOriginalEditor();
            const modifiedEditor = editor.getModifiedEditor();
            if (originalEditor) originalEditor.setModel(null);
            if (modifiedEditor) modifiedEditor.setModel(null);
          } catch (e) {
            // Ignore errors during model reset
          }

          // Then dispose the editor
          if (editor.dispose) {
            editor.dispose();
          }

          editorRef.current = null;
        } catch (error) {
          console.debug('Monaco editor cleanup completed');
        }
      }
    };
  }, []);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  return (
    <DiffEditor
      key="stable-diff-editor"
      original={originalJson}
      modified={modifiedJson}
      language="json"
      theme="vs-dark"
      onMount={handleEditorDidMount}
      options={{
        readOnly: true,
        renderSideBySide: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        wordWrap: 'on',
        diffAlgorithm: 'advanced',
        renderIndicators: true,
        useInlineViewWhenSpaceIsLimited: false,
      }}
      height="100%"
    />
  );
});

StableDiffEditor.displayName = 'StableDiffEditor';

const ConfigHistoryView: React.FC<ConfigHistoryViewProps> = ({ history, selectedKey, className, currentOverrideJson }) => {
  const sorted = React.useMemo(() => {
    const copy = Array.isArray(history) ? history.slice() : [];
    copy.sort((a, b) => {
      const at = getTs(a) ? Date.parse(getTs(a)) : 0;
      const bt = getTs(b) ? Date.parse(getTs(b)) : 0;
      return at - bt;
    });
    return copy;
  }, [history]);

  // Keep hooks order stable regardless of empty/non-empty history
  const latest = sorted[sorted.length - 1];
  const selected = React.useMemo(() => {
    if (!sorted.length) return undefined;
    if (!selectedKey) return sorted.length > 1 ? sorted[sorted.length - 2] : sorted[0];
    return sorted.find(e => itemKey(e) === selectedKey) || sorted[0];
  }, [sorted, selectedKey]);

  const originalJson = sorted.length ? prettyConfigJson(selected) : '{}';
  const modifiedJson = currentOverrideJson && currentOverrideJson.trim()
    ? currentOverrideJson
    : (sorted.length ? prettyConfigJson(latest) : '{}');

  const formattedSelectedDate = React.useMemo(() => {
    const ts = getTs(selected);
    if (!ts) return 'unknown date';
    try {
      const d = new Date(ts);
      return d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return ts;
    }
  }, [selected]);

  return (
    <div className={["h-full min-h-0 p-3", className || ''].join(' ').trim()}>
      <div className="border border-gray-700 rounded-lg overflow-hidden min-h-0 h-full flex flex-col">
        <div className="grid grid-cols-2 items-center text-xs bg-gray-800/60 text-gray-200 border-b border-gray-700">
          <div className="px-3 truncate">{sorted.length ? `Config from ${formattedSelectedDate}` : 'No history'}</div>
          <div className="px-3 text-right">Current Config</div>
        </div>
        <div className="flex-1 min-h-0">
          {sorted.length ? (
            <StableDiffEditor
              originalJson={originalJson}
              modifiedJson={modifiedJson}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-sm text-gray-400">No history entries to compare.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigHistoryView;
