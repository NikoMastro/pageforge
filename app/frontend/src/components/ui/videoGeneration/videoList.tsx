import React from 'react';
import { ArrowPathIcon, FilmIcon } from '@heroicons/react/24/outline';
import type { GeneratedVideoSummary } from '../../../types/videoLibrary.types';

type VideoListProps = {
  videos: GeneratedVideoSummary[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onSelect?: (video: GeneratedVideoSummary) => void;
  onNewVideo?: () => void;
};

const formatDateTime = (value?: string | null): string => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export const VideoList: React.FC<VideoListProps> = ({
  videos,
  loading = false,
  error = null,
  onRefresh,
  onSelect,
  onNewVideo,
}) => {
  const handleRowKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, video: GeneratedVideoSummary) => {
    if (!onSelect) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(video);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-800 bg-gray-900/70 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Generated Videos</h2>
          <p className="text-sm text-gray-400">Browse the videos that have already been generated.</p>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md border border-gray-700 px-3 py-2 text-sm font-medium text-gray-200 transition-colors hover:border-blue-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
          {onNewVideo && (
            <button
              type="button"
              onClick={onNewVideo}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              New Video
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="border-b border-gray-800 bg-red-950/40 px-6 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {loading ? (
          <div className="flex flex-1 items-center justify-center gap-3 px-6 py-10 text-sm text-gray-300">
            <ArrowPathIcon className="h-5 w-5 animate-spin" />
            Loading videos…
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center text-gray-400">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-gray-700 bg-gray-800/60">
              <FilmIcon className="h-10 w-10 text-gray-600" />
            </div>
            <div>
              <p className="text-base font-medium text-white">No videos available yet</p>
              <p className="mt-1 text-sm text-gray-400">Generated videos will appear here once the backend is ready.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="sticky top-0 hidden grid-cols-12 gap-4 border-b border-gray-800 bg-gray-900/80 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 sm:grid">
              <div className="col-span-6">Video</div>
              <div className="col-span-3">Created By</div>
              <div className="col-span-3">Created</div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {videos.map((video) => {
                const isInteractive = Boolean(onSelect);

                return (
                  <div
                    key={video.id}
                    role={isInteractive ? 'button' : undefined}
                    tabIndex={isInteractive ? 0 : undefined}
                    onKeyDown={(event) => handleRowKeyDown(event, video)}
                    onClick={() => onSelect?.(video)}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 transition-colors ${isInteractive
                      ? 'cursor-pointer hover:bg-gray-800/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
                      : 'cursor-default'
                      }`}
                  >
                    <div className="col-span-12 flex items-center gap-4 sm:col-span-6">
                      {video.thumbnailUrl ? (
                        <div className="h-12 w-20 overflow-hidden rounded-md border border-gray-700 bg-black">
                          <img src={video.thumbnailUrl} alt="Video thumbnail" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-12 w-20 items-center justify-center rounded-md border border-gray-700 bg-gray-800">
                          <FilmIcon className="h-5 w-5 text-gray-500" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white" title={video.name}>
                          {video.name}
                        </p>
                        {video.prompt && (
                          <p className="mt-1 line-clamp-1 text-xs text-gray-400" title={video.prompt}>
                            {video.prompt}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="col-span-12 flex items-center text-sm text-gray-300 sm:col-span-3 sm:justify-start">
                      {video.createdBy ?? '—'}
                    </div>

                    <div className="col-span-12 flex items-center text-sm text-gray-300 sm:col-span-3">
                      {formatDateTime(video.createdAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
