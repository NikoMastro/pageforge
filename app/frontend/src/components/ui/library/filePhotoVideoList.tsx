import { useMemo } from 'react';
import { useNotifications } from '..';
import {
  PhotoIcon,
  VideoCameraIcon,
  ClipboardDocumentIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import type { MediaItem } from '../../../types/ui.types';
import pageforgeApi from '../../../api';

interface PhotoVideoListProps {
  items?: MediaItem[];
  onItemClick?: (item: MediaItem) => void;
  onDownload?: (item: MediaItem) => void;
  mediaType?: 'all' | 'images' | 'videos';
  search?: string;
  onDeleted?: () => void; // notify parent to refresh
}

export const PhotoVideoList: React.FC<PhotoVideoListProps> = ({
  items = [],
  onItemClick,
  onDownload,
  mediaType = 'all',
  search = '',
  onDeleted,
}) => {
  const { success, error: notifyError } = useNotifications();
  const filteredItems = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(item => {
      const matchesType = mediaType === 'all' || (mediaType === 'images' ? item.type === 'image' : item.type === 'video');
      const matchesSearch = item.name.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [items, mediaType, search]);

  const copyToClipboard = async (url: string, itemName: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        throw new Error('Clipboard API not available');
      }
      success(`Copied URL for "${itemName}"`);
    } catch (error) {
      // Fallback for non-secure contexts or denied permissions
      try {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        input.setSelectionRange(0, url.length);
        const ok = document.execCommand('copy');
        document.body.removeChild(input);
        if (!ok) throw new Error('document.execCommand copy failed');
        success(`Copied URL for "${itemName}"`);
      } catch (e) {
        notifyError('Failed to copy URL');
      }
    }
  };

  const handleDelete = async (item: MediaItem, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (item.type !== 'image') {
      notifyError('Deleting videos is not supported yet');
      return;
    }
    const confirmed = window.confirm(`Delete image "${item.name}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await pageforgeApi.deleteImage(item.id);
      success(`Deleted ${item.name}`);
      onDeleted?.();
    } catch (e) {
      notifyError('Failed to delete');
    }
  };

  const handleItemClick = (item: MediaItem, event: React.MouseEvent) => {
    event.preventDefault();
    onItemClick?.(item);
  };

  const handleDownload = (item: MediaItem, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (onDownload) { onDownload(item); return; }
    const filename = item.filename || item.name || 'download';
    const forceBlobDownload = async () => {
      const res = await fetch(item.url, { mode: 'cors' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
    forceBlobDownload().catch(() => {
      try {
        const a = document.createElement('a');
        a.href = item.url;
        a.download = filename;
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (err) {
        console.error('Failed to download:', err);
      }
    });
  };

  // no-op

  const getItemIcon = (type: 'image' | 'video') => {
    return type === 'image'
      ? <PhotoIcon className="w-5 h-5" />
      : <VideoCameraIcon className="w-5 h-5" />;
  };

  return (
    <div className="space-y-4 w-full">
      {/* Items List */}
      <div className="space-y-2 w-full">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="space-y-2">
              {items.length === 0 ? (
                <>
                  <PhotoIcon className="w-12 h-12 mx-auto text-gray-500" />
                  <p>No media files uploaded yet</p>
                  <p className="text-sm">Upload some images or videos to get started</p>
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-gray-500" />
                  <p>No items match your search</p>
                  <p className="text-sm">Try adjusting your search or filter</p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-2 w-full">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={(e) => handleItemClick(item, e)}
                className="flex items-center space-x-3 p-3 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors group w-full overflow-hidden"
              >
                {/* Thumbnail/Icon */}
                <div className="flex-shrink-0 w-6 h-6 bg-gray-600 rounded-lg flex items-center justify-center">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-gray-400">
                      {getItemIcon(item.type)}
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-white truncate">
                      {item.name}
                    </p>
                    <span className={`
                      inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                      ${item.type === 'image'
                        ? 'bg-green-800 text-green-200'
                        : 'bg-blue-800 text-blue-200'
                      }
                    `}>
                      {item.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                    <span>{item.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions - Always visible */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(item.url, item.name);
                    }}
                    className="p-1.5 text-gray-300 hover:text-blue-400 rounded bg-gray-800/50 hover:bg-gray-800 transition-colors"
                    title="Copy URL"
                  >
                    <ClipboardDocumentIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDownload(item, e)}
                    className="p-1.5 text-gray-300 hover:text-green-400 rounded bg-gray-800/50 hover:bg-gray-800 transition-colors"
                    title="Download"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(item, e)}
                    className="p-1.5 text-gray-300 hover:text-red-400 rounded bg-gray-800/50 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={item.type === 'image' ? 'Delete Image' : 'Delete not supported'}
                    disabled={item.type !== 'image'}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results Count */}
      {filteredItems.length > 0 && (
        <div className="text-xs text-gray-400 text-center">
          Showing {filteredItems.length} of {items.length} items
        </div>
      )}
    </div>
  );
};
