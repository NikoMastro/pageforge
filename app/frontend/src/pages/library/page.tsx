import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhotoVideoList, ImageGrid, UploadModal } from '../../components/ui/library';
import type { MediaItem } from '../../types/ui.types';
import { useLibraryImages } from '../../hooks';
import { useTopNavigation } from '../../components/layout/topNavigationContext';
import Pagination from '../../components/ui/pagination';
import { usePagination } from '../../hooks/hooksPages';

export default function LibraryPage() {
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { images, loading, error, refresh } = useLibraryImages();
  const { searchQuery, filters, viewMode: contextViewMode, setRefreshCallback } = useTopNavigation();

  // Register refresh callback in context
  useEffect(() => {
    setRefreshCallback(refresh);
    return () => setRefreshCallback(undefined);
  }, [refresh, setRefreshCallback]);

  // Listen for upload event from Navigation button
  useEffect(() => {
    const handleOpenUpload = () => {
      setShowUploadModal(true);
    };

    window.addEventListener('library:open-upload-modal', handleOpenUpload);
    return () => {
      window.removeEventListener('library:open-upload-modal', handleOpenUpload);
    };
  }, []);

  // Map context viewMode ('cards' | 'list') to library viewMode ('grid' | 'list')
  const viewMode: 'grid' | 'list' = contextViewMode === 'cards' ? 'grid' : 'list';

  const mediaType = filters.mediaType || 'all';
  const filtered = useMemo(() => {
    const q = (searchQuery || '').toLowerCase();
    return images.filter((item) => {
      const matchesType = mediaType === 'all' || (mediaType === 'images' ? item.type === 'image' : item.type === 'video');
      const matchesSearch = !q || item.name.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [images, searchQuery, mediaType]);

  const { currentItems, currentPage, goToPage } = usePagination({
    items: filtered,
    itemsPerPage: 100,
  });

  const handleItemClick = (item: MediaItem) => {
    navigate(`/library/${item.id}`);
  };

  const handleDownload = (item: MediaItem) => {
    const filename = item.filename || item.name || 'download';
    // Prefer a blob download to avoid opening a new tab and to force download across browsers
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
      // Fallback: try a direct anchor with download attribute (may be ignored cross-origin)
      try {
        const a = document.createElement('a');
        a.href = item.url;
        a.download = filename;
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (e) {
        console.error('Failed to download media:', e);
      }
    });
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden min-h-0">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white">Media Library</h1>
          <p className="text-gray-300 mt-2">
            Manage your images and videos stored in Cloudflare {!loading && images.length > 0 && (
              <span className="text-blue-400">({images.length} items)</span>
            )}
          </p>
        </div>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-700/50 rounded-md">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 h-full flex flex-col overflow-hidden min-h-0">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-gray-600 border-t-gray-300 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading media library...</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {viewMode === 'grid' ? (
                <ImageGrid
                  items={currentItems}
                  onItemClick={handleItemClick}
                  onDownload={handleDownload}
                  onDeleted={refresh}
                  loading={loading}
                />
              ) : (
                <PhotoVideoList
                  items={currentItems}
                  onItemClick={handleItemClick}
                  onDownload={handleDownload}
                  mediaType={mediaType}
                  search={searchQuery}
                  onDeleted={refresh}
                />
              )}
            </div>
          )}
          {/* Sticky pagination at bottom */}
          {filtered.length > 100 && (
            <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 z-10 mt-auto">
              <Pagination
                currentPage={currentPage}
                totalItems={filtered.length}
                itemsPerPage={100}
                onPageChange={goToPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadComplete={() => {
          refresh();
        }}
      />
    </div>
  );
}
