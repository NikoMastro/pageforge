import React, { useRef, useEffect } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

type JsonHistoryEntry = {
  page_name?: string;
  user?: string;
  commit?: string;
  timestamp?: string;
  serverTimestamp?: unknown;
  hashid?: string;
  lp_json?: string;
  value?: any;
};

interface PreviewJsonHistoryProps {
  history: JsonHistoryEntry[];

  className?: string;
  initialKey?: string;
  pageName?: string;
  currentOverrideJson?: string;
}

function extractJsonContent(entry: JsonHistoryEntry | undefined): any {
  if (!entry) return {};
  if (entry.value) {
    return entry.value;
  }

  if (entry.lp_json) {
    if (typeof entry.lp_json === 'string') {
      try {
        return JSON.parse(entry.lp_json);
      } catch {
        return entry.lp_json;
      }
    }
    return entry.lp_json;
  }

  return {};
}

function toPrettyJson(input: string | unknown): string {
  try {
    if (typeof input === 'string') {
      const parsed = JSON.parse(input);
      return JSON.stringify(parsed, null, 2);
    }
    return JSON.stringify(input, null, 2);
  } catch {
    return typeof input === 'string' ? input : JSON.stringify(input);
  }
}

function sortByTimestampAsc(a: JsonHistoryEntry, b: JsonHistoryEntry): number {
  const at = a.timestamp ? Date.parse(a.timestamp) : 0;
  const bt = b.timestamp ? Date.parse(b.timestamp) : 0;
  return at - bt;
}

const itemKey = (e: JsonHistoryEntry) => [e.hashid, e.timestamp, e.commit].filter(Boolean).join('|');

const PreviewJsonHistory: React.FC<PreviewJsonHistoryProps> = ({
  history,

  className,
  initialKey,
  currentOverrideJson
}) => {
  const editorRef = useRef<editor.IStandaloneDiffEditor | null>(null);
  const mountedRef = useRef(false);

  const filtered = React.useMemo(() => {
    const list = Array.isArray(history) ? history.slice() : [];
    return list.sort(sortByTimestampAsc);
  }, [history]);

  const latest = filtered[filtered.length - 1];
  const defaultSelectedKey = React.useMemo(() => {
    if (initialKey) return initialKey;
    if (filtered.length > 1) return itemKey(filtered[filtered.length - 2]);
    if (filtered.length === 1) return itemKey(filtered[0]);
    return '';
  }, [filtered, initialKey]);

  const [selectedKey, setSelectedKey] = React.useState<string>(defaultSelectedKey);
  React.useEffect(() => {
    setSelectedKey(defaultSelectedKey);
  }, [defaultSelectedKey]);

  const selected = React.useMemo(() => {
    return filtered.find(e => itemKey(e) === selectedKey) || filtered[0];
  }, [filtered, selectedKey]);

  const originalJson = React.useMemo(() => {
    const content = extractJsonContent(selected);
    return toPrettyJson(content);
  }, [selected]);

  const modifiedJson = React.useMemo(() => {
    if (currentOverrideJson && currentOverrideJson.trim()) {
      return currentOverrideJson;
    }
    const content = extractJsonContent(latest);
    return toPrettyJson(content);
  }, [currentOverrideJson, latest]);

  const handleEditorDidMount = (editor: editor.IStandaloneDiffEditor) => {
    editorRef.current = editor;
    mountedRef.current = true;
  };

  useEffect(() => {
    return () => {
      if (editorRef.current) {
        try {
          const editor = editorRef.current;
          try {
            const originalEditor = editor.getOriginalEditor?.();
            const modifiedEditor = editor.getModifiedEditor?.();
            if (originalEditor && typeof originalEditor.setModel === 'function') {
              originalEditor.setModel(null);
            }
            if (modifiedEditor && typeof modifiedEditor.setModel === 'function') {
              modifiedEditor.setModel(null);
            }
          } catch (e) {
            // Ignore errors during model reset
          }

          // Then dispose the editor
          if (typeof editor.dispose === 'function') {
            editor.dispose();
          }

          editorRef.current = null;
          mountedRef.current = false;
        } catch (error) {
          // Silent fail
        }
      }
    };
  }, []); // Only run on component unmount

  const formattedSelectedDate = React.useMemo(() => {
    const ts = selected?.timestamp;
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
  }, [selected?.timestamp]);

  if (!filtered.length) {
    return (
      <div className={`p-4 text-sm text-gray-400 ${className || ''}`.trim()}>
        No history entries to display.
      </div>
    );
  }

  return (
    <div className={`h-full min-h-0 p-3 ${className || ''}`.trim()}>
      <div className="border border-gray-700 rounded-lg overflow-hidden min-h-0 h-full flex flex-col">
        <div className="grid grid-cols-2 items-center text-xs bg-gray-800/60 text-gray-200 border-b border-gray-700">
          <div className="px-3  truncate">Json from {formattedSelectedDate}</div>
          <div className="px-3  text-right">Current Json</div>
        </div>
        <div className="flex-1 min-h-0">
          <DiffEditor
            key="stable-history-diff"
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
        </div>
      </div>
    </div>
  );
};

export default PreviewJsonHistory;
