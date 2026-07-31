import React, { useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import type { LandingPageData } from '../../../types/shared.types';

interface JsonViewProps {
  data: LandingPageData;
  editableJson: string;
  isEditMode: boolean;
  jsonError: string | null;
  onJsonChange: (value: string) => void;
  autoCleanOnMount?: boolean;

}

const PreviewJsonFile: React.FC<JsonViewProps> = ({
  data,
  editableJson,
  isEditMode,
  jsonError,
  onJsonChange,
  autoCleanOnMount = true,

}) => {

  const editEditorRef = useRef<any>(null);
  const viewEditorRef = useRef<any>(null);
  const scrollPositionRef = useRef<{ scrollTop: number; scrollLeft: number }>({ scrollTop: 0, scrollLeft: 0 });

  // Cleanup effect to properly dispose editors
  useEffect(() => {
    return () => {
      if (editEditorRef.current) {
        try {
          editEditorRef.current.dispose();
          editEditorRef.current = null;
        } catch (error) {
          console.debug('Monaco editor cleanup completed');
        }
      }
      if (viewEditorRef.current) {
        try {
          viewEditorRef.current.dispose();
          viewEditorRef.current = null;
        } catch (error) {
          console.debug('Monaco editor cleanup completed');
        }
      }
    };
  }, []);

  // Clean widget language properties for crop widgets that use auto-detection
  const cleanWidgetLanguages = useCallback((data: unknown): unknown => {
    if (!data || typeof data !== 'object') return data;

    if (Array.isArray(data)) {
      return data.map(cleanWidgetLanguages);
    }

    const cleaned = { ...data as Record<string, unknown> };

    // Clean widget objects
    if (cleaned.type === 'widget' && cleaned.props && typeof cleaned.props === 'object') {
      const widgetProps = cleaned.props as Record<string, unknown>;
      // Remove language property for crop widgets (buy, install, wishlist) since they auto-detect
      if (widgetProps.type && ['buy', 'install', 'wishlist'].includes(widgetProps.type as string)) {
        delete widgetProps.language;
      }
    }

    // Recursively clean nested objects
    Object.keys(cleaned).forEach(key => {
      if (typeof cleaned[key] === 'object' && cleaned[key] !== null) {
        cleaned[key] = cleanWidgetLanguages(cleaned[key]);
      }
    });

    return cleaned;
  }, []);

  // Clean the data on component mount if requested (keeps user formatting otherwise)
  useEffect(() => {
    if (!autoCleanOnMount) return;
    try {
      const currentData = JSON.parse(editableJson);
      const cleanedData = cleanWidgetLanguages(currentData);
      const cleanedJson = JSON.stringify(cleanedData, null, 2);

      // Only update if the cleaned version is different
      if (cleanedJson !== editableJson) {
        onJsonChange(cleanedJson);
      }
    } catch {
      // If JSON is invalid, don't do anything
    }
  }, [editableJson, cleanWidgetLanguages, onJsonChange, autoCleanOnMount]);

  // Check if there are changes by comparing current JSON with original data
  const hasChanges = editableJson !== JSON.stringify(data, null, 2);
  // Handle edit editor mount and save/restore scroll position
  const handleEditEditorDidMount = (editor: any) => {
    editEditorRef.current = editor;

    // Restore scroll position
    if (scrollPositionRef.current.scrollTop > 0 || scrollPositionRef.current.scrollLeft > 0) {
      setTimeout(() => {
        editor.setScrollPosition(scrollPositionRef.current);
      }, 100);
    }

    // Save scroll position when scrolling
    editor.onDidScrollChange((e: any) => {
      scrollPositionRef.current = {
        scrollTop: e.scrollTop,
        scrollLeft: e.scrollLeft
      };
    });
  };

  // Handle view editor mount and save/restore scroll position
  const handleViewEditorDidMount = (editor: any) => {
    viewEditorRef.current = editor;

    // Restore scroll position
    if (scrollPositionRef.current.scrollTop > 0 || scrollPositionRef.current.scrollLeft > 0) {
      setTimeout(() => {
        editor.setScrollPosition(scrollPositionRef.current);
      }, 100);
    }

    // Save scroll position when scrolling
    editor.onDidScrollChange((e: any) => {
      scrollPositionRef.current = {
        scrollTop: e.scrollTop,
        scrollLeft: e.scrollLeft
      };
    });
  };  // Get current data for display (use edited data if valid, otherwise original)
  const getCurrentData = (): LandingPageData => {
    try {
      return JSON.parse(editableJson);
    } catch {
      return data; // Fallback to original if edited JSON is invalid
    }
  };

  return (
    <div className="h-full min-h-0 p-4 flex flex-col overflow-hidden">
      {isEditMode ? (
        // Editable mode with Monaco Editor
        <div className="h-full min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 border border-gray-700 rounded-lg overflow-hidden">
            <Editor
              value={editableJson}
              language="json"
              onChange={(value) => onJsonChange(value || '')}
              onMount={handleEditEditorDidMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                lineNumbers: 'on',
                glyphMargin: false,
                folding: true,
                lineDecorationsWidth: 0,
                lineNumbersMinChars: 3,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                wordWrap: 'on',
                formatOnType: false,
                formatOnPaste: false,
                bracketPairColorization: { enabled: true },
                guides: {
                  bracketPairs: true,
                  bracketPairsHorizontal: true,
                  highlightActiveBracketPair: true,
                  indentation: true
                },
                suggest: {
                  showWords: false,
                  showSnippets: false
                }
              }}
            />
          </div>
          {jsonError && (
            <div className="mt-2 p-2 border border-red-700 rounded text-red-200 text-sm">
              <strong>JSON Error:</strong> {jsonError}
            </div>
          )}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-400">
              {hasChanges ? 'Unsaved changes' : 'No changes'}
            </div>
          </div>
        </div>
      ) : (
        // Read-only view mode with Monaco Editor
        <div className="h-full min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 border border-gray-700 rounded-lg overflow-hidden">
            <Editor
              value={JSON.stringify(getCurrentData(), null, 2)}
              language="json"
              onMount={handleViewEditorDidMount}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                lineNumbers: 'on',
                glyphMargin: false,
                folding: true,
                lineDecorationsWidth: 0,
                lineNumbersMinChars: 3,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                bracketPairColorization: { enabled: true },
                guides: {
                  bracketPairs: true,
                  bracketPairsHorizontal: true,
                  highlightActiveBracketPair: true,
                  indentation: true
                },
                contextmenu: false,
                links: false,
                selectOnLineNumbers: false
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewJsonFile;
