import { PhotoIcon, VideoCameraIcon, EyeIcon } from '@heroicons/react/24/outline';
import type { MediaItem } from '../../../types/ui.types';

interface PreviewProps {
  selectedItem?: MediaItem | null;
}

export const Preview: React.FC<PreviewProps> = ({ selectedItem }) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!selectedItem) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Preview</h3>
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
          <EyeIcon className="w-12 h-12 mx-auto text-gray-500 mb-3" />
          <p className="text-gray-400 text-sm">Select an item to preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Preview</h3>

      <div className="border border-gray-600 rounded-lg overflow-hidden">
        {/* Preview Area */}
        <div className="aspect-video bg-gray-700 flex items-center justify-center">
          {selectedItem.type === 'image' ? (
            selectedItem.thumbnail || selectedItem.url ? (
              <img
                src={selectedItem.thumbnail || selectedItem.url}
                alt={selectedItem.name}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <PhotoIcon className="w-16 h-16 text-gray-400" />
            )
          ) : (
            selectedItem.thumbnail ? (
              <div className="relative">
                <img
                  src={selectedItem.thumbnail}
                  alt={selectedItem.name}
                  className="max-w-full max-h-full object-contain"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                  <VideoCameraIcon className="w-12 h-12 text-white" />
                </div>
              </div>
            ) : (
              <VideoCameraIcon className="w-16 h-16 text-gray-400" />
            )
          )}
        </div>

        {/* Item Details */}
        <div className="p-4 bg-gray-800">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-white truncate">{selectedItem.name}</h4>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`
                  inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                  ${selectedItem.type === 'image'
                    ? 'bg-green-800 text-green-200'
                    : 'bg-blue-800 text-blue-200'
                  }
                `}>
                  {selectedItem.type}
                </span>
              </div>
            </div>

            <div className="space-y-1 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Size:</span>
                <span>{selectedItem.size ? formatFileSize(selectedItem.size) : 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span>Created:</span>
                <span>{selectedItem.createdAt.toLocaleDateString()}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-600">
              <p className="text-xs text-gray-400 break-all">
                <span className="font-medium">URL:</span> {selectedItem.url}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
