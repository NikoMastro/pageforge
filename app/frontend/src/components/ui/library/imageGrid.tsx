import React from 'react';
import { useNotifications } from '..';
import { PhotoIcon, VideoCameraIcon, ClipboardDocumentIcon, ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { MediaItem } from '../../../types/ui.types';
import pageforgeApi from '../../../api';

interface ImageGridProps {
  items: MediaItem[];
  onItemClick?: (item: MediaItem) => void;
  onDownload?: (item: MediaItem) => void;
  loading?: boolean;
  onDeleted?: () => void; // notify parent to refresh
}

export const ImageGrid: React.FC<ImageGridProps> = ({
  items,
  onItemClick,
  onDownload,
  loading = false,
  onDeleted,
}) => {
  const { success, error: notifyError } = useNotifications();
  const copyToClipboard = async (url: string, name: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        throw new Error('Clipboard API not available');
      }
      success(`Copied URL for "${name}"`);
    } catch (err) {
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
        success(`Copied URL for "${name}"`);
      } catch (e) {
        notifyError('Failed to copy URL');
      }
    }
  };

  const handleDelete = async (item: MediaItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    } catch (err) {
      notifyError('Failed to delete');
    }
  };

  const handleDownload = (item: MediaItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="aspect-square bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <PhotoIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No media found</h3>
        <p className="text-gray-400">Your Cloudflare images and videos will appear here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onItemClick?.(item)}
          className="group relative aspect-square bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all duration-200"
        >
          {/* Image Preview */}
          <div className="w-full h-full">
            {item.type === 'image' && item.url ? (
              <img
                src={item.url}
                alt={item.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : item.type === 'video' && item.thumbnail ? (
              <>
                <img
                  src={item.thumbnail}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <VideoCameraIcon className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {item.type === 'image' ? (
                  <PhotoIcon className="w-8 h-8 text-gray-400" />
                ) : (
                  <VideoCameraIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
            )}
          </div>

          {/* Overlay with Actions - Always visible */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 flex flex-col justify-between p-2">
            {/* Top: Actions */}
            <div className="flex justify-end items-start">
              <div className="flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(item.url, item.name);
                  }}
                  className="p-1.5 text-white/90 hover:text-white rounded bg-black/60 hover:bg-black/80 transition-colors shadow-lg"
                  title="Copy URL"
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleDownload(item, e)}
                  className="p-1.5 text-white/90 hover:text-white rounded bg-black/60 hover:bg-black/80 transition-colors shadow-lg"
                  title="Download"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleDelete(item, e)}
                  className="p-1.5 text-white/90 hover:text-white rounded bg-black/60 hover:bg-black/80 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  title={item.type === 'image' ? 'Delete Image' : 'Delete not supported'}
                  disabled={item.type !== 'image'}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom: File info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`
                  inline-flex items-center px-2 py-0.5 rounded text-xs font-medium shadow-lg
                  ${item.type === 'image'
                    ? 'bg-green-800/90 text-green-200'
                    : 'bg-blue-800/90 text-blue-200'
                  }
                `}>
                  {item.type}
                </span>
              </div>
              <p className="text-white text-xs font-medium truncate drop-shadow-lg" title={item.name}>
                {item.name}
              </p>
              <p className="text-white/80 text-xs drop-shadow-lg">
                {formatDate(item.createdAt)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
