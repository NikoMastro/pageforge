import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ImageGrid } from './index';
import type { MediaItem } from '../../../types/ui.types';
import { useLibraryImages } from '../../../hooks';

interface MediaUrlPickerProps {
  onPick: (url: string, item?: MediaItem) => void;
  label?: string;
  mediaType?: 'images' | 'videos' | 'all';
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Small button that opens a lightweight modal with the media library (images by default)
 * and lets the user pick a URL to insert into the adjacent input.
 */
export const MediaUrlPicker: React.FC<MediaUrlPickerProps> = ({
  onPick,
  label = 'Browse',
  mediaType = 'images',
  className = '',
  size = 'sm'
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { images, loading, error, refresh } = useLibraryImages();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return images.filter((item) => {
      const matchesType = mediaType === 'all' || (mediaType === 'images' ? item.type === 'image' : item.type === 'video');
      if (!matchesType) return false;
      if (!q) return true;
      const name = item.name?.toLowerCase() || '';
      const url = item.url?.toLowerCase() || '';
      return name.includes(q) || url.includes(q);
    });
  }, [images, search, mediaType]);

  const handleItemClick = (item: MediaItem) => {
    const url = item.url || item.thumbnail || '';
    if (url) {
      onPick(url, item);
      setOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${className} inline-flex items-center gap-1 ${size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'} rounded-md bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-600`}
        title="Pick from media library"
      >
        {/* icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 2v6l-2.5-2.5a1 1 0 00-1.5.13L9 13 6.5 10.5a1 1 0 00-1.5.13L4 12V5h12z" />
        </svg>
        {label}
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />

          {/* modal */}
          <div className="relative z-[10000] w-[95vw] max-w-4xl max-h-[85vh] bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <h3 className="text-sm font-medium text-gray-100">Media Library {mediaType !== 'all' ? `(${mediaType})` : ''}</h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="w-48 md:w-72 rounded-md border border-gray-600 bg-gray-900 px-2 py-1.5 text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => refresh()}
                  className="px-2 py-1.5 text-xs rounded-md bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-600"
                >
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-2 py-1.5 text-xs rounded-md bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-3 overflow-auto max-h-[70vh]">
              {loading ? (
                <p className="text-sm text-gray-300">Loading media…</p>
              ) : error ? (
                <p className="text-sm text-red-400">{error}</p>
              ) : (
                <ImageGrid items={filtered} onItemClick={handleItemClick} />
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default MediaUrlPicker;
