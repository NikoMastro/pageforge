import React, { useState, useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title,
  message,
  itemName,
  onClose,
  onConfirm,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger'
}) => {
  const [deleting, setDeleting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    try {
      setDeleting(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error during delete operation:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 ease-out ${isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
      onKeyDown={handleKeyDown}
    >
      <div
        className={`bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-700 shadow-2xl transition-all duration-300 ease-out ${isAnimating
            ? 'transform scale-100 opacity-100 translate-y-0'
            : 'transform scale-95 opacity-0 translate-y-4'
          }`}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className={`h-6 w-6 mr-3 ${variant === 'danger' ? 'text-red-400' : 'text-yellow-400'}`} />
            <h3 className="text-lg font-medium text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={deleting}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-300 mb-2">{message}</p>
          {itemName && (
            <p className={`text-sm bg-gray-700 p-2 rounded border-l-4 ${variant === 'danger' ? 'text-gray-400 border-red-400' : 'text-gray-400 border-yellow-400'}`}>
              <strong>Configuration:</strong> {itemName}
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50 flex items-center ${variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
          >
            {deleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
