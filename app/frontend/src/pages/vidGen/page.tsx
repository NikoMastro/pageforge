import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { VideoList } from '../../components/ui/videoGeneration';
import { useVideoLibrary } from '../../hooks/hooksMedia/useVideoLibrary';
import { useTopNavigation } from '../../components/layout/topNavigationContext';
import type { GeneratedVideoSummary } from '../../types/videoLibrary.types';

const GeneratedVideosPage: React.FC = () => {
  const navigate = useNavigate();
  const { videos, loading, error, refresh } = useVideoLibrary();
  const { searchQuery } = useTopNavigation();

  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) {
      return videos;
    }

    const needle = searchQuery.toLowerCase();

    return videos.filter((video) => {
      const matches: string[] = [
        video.name,
        video.createdBy ?? '',
        video.prompt ?? '',
        video.id,
      ]
        .map((value) => (typeof value === 'string' ? value.toLowerCase() : ''))
        .filter(Boolean);

      return matches.some((segment) => segment.includes(needle));
    });
  }, [videos, searchQuery]);

  const handleSelectVideo = (video: GeneratedVideoSummary) => {
    navigate(`/vidGen/${encodeURIComponent(video.id)}`);
  };
  const handleOpenNewVideo = () => {
    navigate('/vidGen/new');
  };

  return (
    <div className="flex h-full flex-col">
      <VideoList
        videos={filteredVideos}
        loading={loading}
        error={error}
        onRefresh={refresh}
        onSelect={filteredVideos.length > 0 ? handleSelectVideo : undefined}
        onNewVideo={handleOpenNewVideo}
      />
    </div>
  );
};

export default GeneratedVideosPage;
