import React, { useState } from 'react';
import { XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface SaveConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (page_name: string) => void;
}

export const SaveConfigurationModal: React.FC<SaveConfigurationModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [pageName, setPageName] = useState('');

  const handleSave = () => {
    if (!pageName.trim()) {
      alert('Please enter a configuration name');
      return;
    }

    onSave(pageName.trim());

    // Reset form
    setPageName('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-lg border border-gray-700 bg-gray-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 p-4">
          <h2 className="text-xl font-semibold text-white">Save Configuration</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-4">
          {/* Name */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
              <DocumentTextIcon className="h-4 w-4" />
              Configuration Name *
            </label>
            <input
              type="text"
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              placeholder="e.g., Product Demo - High Quality"
              className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-700 p-4">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-700 px-4 py-2 text-white transition-colors hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
