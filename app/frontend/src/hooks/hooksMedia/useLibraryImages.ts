import { useCallback, useEffect, useState } from 'react';
import { pageforgeApi } from '../../api';

export interface UseLibraryImagesResult {
  images: import('../../types/ui.types').MediaItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  selectedImage: import('../../types/ui.types').MediaItem | null;
  selectImage: (image: import('../../types/ui.types').MediaItem | null) => void;
}

export function useLibraryImages(): UseLibraryImagesResult {
  const [images, setImages] = useState<import('../../types/ui.types').MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<import('../../types/ui.types').MediaItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const media = await pageforgeApi.getLibraryMedia();
      setImages(media);
    } catch (e: any) {
      setError(e.message || 'Failed to load library images');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectImage = useCallback((image: import('../../types/ui.types').MediaItem | null) => {
    setSelectedImage(image);
  }, []);

  return {
    images,
    loading,
    error,
    refresh: load,
    selectedImage,
    selectImage,
  };
}
