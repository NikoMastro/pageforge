import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface EditTitleModalProps {
  isOpen: boolean;
  config: { id: string; name: string } | null;
  onClose: () => void;
  onSave: (newTitle: string) => Promise<void>;
}

const EditTitleModal: React.FC<EditTitleModalProps> = ({
  isOpen,
  config,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (config) {
      const backend = (config as any).backend;
      setTitle(backend?.page_name || config.name);
    }
  }, [config]);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Title cannot be empty');
      return;
    }

    try {
      setSaving(true);
      await onSave(title.trim());
      onClose();
    } catch (error) {
      console.error('Error saving title:', error);
      alert('Failed to save title');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen || !config) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 ease-out ${isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
    >
      <div
        className={`bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-700 shadow-2xl transition-all duration-300 ease-out ${isAnimating
          ? 'transform scale-100 opacity-100 translate-y-0'
          : 'transform scale-95 opacity-0 translate-y-4'
          }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Edit Title</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
            Configuration Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter configuration title"
            autoFocus
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 flex items-center"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTitleModal;
