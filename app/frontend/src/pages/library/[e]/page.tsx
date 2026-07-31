import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ImageEditor } from '../../../components/ui/library';
import type { MediaItem } from '../../../types/ui.types';
import { useLibraryImages } from '../../../hooks';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function LibraryEditorPage() {
  const { e } = useParams<{ e: string }>();
  const navigate = useNavigate();
  const { images, loading, error, refresh } = useLibraryImages();
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  // Find the item by ID when images load or ID changes
  useEffect(() => {
    if (!e || loading || images.length === 0) return;
    const item = images.find((img) => img.id === e);
    if (item) {
      setSelectedItem(item);
    } else {
      // Item not found, redirect to library
      navigate('/library');
    }
  }, [e, images, loading, navigate]);

  const handleBack = () => {
    navigate('/library');
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-600 border-t-gray-300 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading media...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
          >
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  if (!selectedItem) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Media item not found</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
          >
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden min-h-0">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Library</span>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <ImageEditor selectedItem={selectedItem} onChanged={refresh} />
        </div>
      </div>
    </div>
  );
}
