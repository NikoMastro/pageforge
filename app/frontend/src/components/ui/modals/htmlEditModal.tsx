import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

interface HtmlEditModalProps {
  isOpen: boolean;
  configName: string;
  content: string;
  onSave: (content: string) => void;
  onDelete?: () => void;
  onClose: () => void;
  onContentChange?: (content: string) => void;
}

const HtmlEditModal: React.FC<HtmlEditModalProps> = ({
  isOpen,
  configName,
  content: htmlContent,
  onSave,
  onDelete,
  onClose,
  onContentChange,
}) => {
  const [content, setContent] = useState(htmlContent);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    setContent(htmlContent);
  }, [htmlContent]);

  // Cleanup effect to properly dispose the editor when modal closes
  useEffect(() => {
    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.dispose();
          editorRef.current = null;
        } catch (error) {
          console.debug('Monaco editor cleanup completed');
        }
      }
    };
  }, []);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onContentChange?.(newContent);
  };

  const handleSave = () => {
    onSave(content);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with opacity and blur */}
      <div
        className="absolute inset-0 bg-black"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)'
        }}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className="relative bg-gray-800 border border-gray-600 rounded-lg shadow-xl w-full max-w-4xl h-5/6 mx-4 flex flex-col"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-600 flex-shrink-0">
          <h2 className="text-xl font-semibold text-white">
            Editing HTML: {configName}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors duration-200"
            title="Close (ESC)"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="w-full h-full border border-gray-600 rounded-md overflow-hidden">
            <Editor
              value={content}
              language="html"
              onChange={(value) => handleContentChange(value || '')}
              onMount={handleEditorDidMount}
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
                bracketPairColorization: { enabled: true },
                guides: {
                  bracketPairs: true,
                  bracketPairsHorizontal: true,
                  highlightActiveBracketPair: true,
                  indentation: true
                },
                suggest: {
                  showWords: true,
                  showSnippets: true
                },
                formatOnPaste: true,
                formatOnType: true
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-600 flex-shrink-0">
          <div className="flex items-center">
            {onDelete && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition-colors duration-200 mr-3"
              >
                Delete HTML
              </button>
            )}
            <div className="text-sm text-gray-400">
              Press Ctrl+S (Cmd+S) to save, ESC to close
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 transition-colors duration-200"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HtmlEditModal;
