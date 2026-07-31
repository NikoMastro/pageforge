import React from 'react';
import { PlayCircleIcon } from '@heroicons/react/24/outline';

type GeneratedVideo = {
  id: string;
  version: number;
  status: 'generating' | 'completed' | 'failed';
  url?: string | null;
  urls?: string[];
  thumbnail?: string;
  params: {
    prompt: string;
  };
};

type VideoGalleryProps = {
  videos: GeneratedVideo[];
  onIterate: (videoId: string) => void;
  onDownload: (url: string, filename: string) => void;
};

export const VideoGallery: React.FC<VideoGalleryProps> = ({ videos, onIterate, onDownload }) => {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-800 p-3 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        {videos.length > 0 && <span className="text-xs text-gray-400">{videos.length}</span>}
      </div>

      {videos.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <PlayCircleIcon className="mb-2 h-10 w-10 text-gray-600" />
          <p className="text-xs text-gray-400">No videos yet</p>
        </div>
      ) : (
        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
          {videos.map((video) => {
            const downloadUrl = video.url || video.urls?.[0] || null;

            return (
              <div
                key={video.id}
                className="cursor-pointer rounded-lg border border-gray-700 bg-gray-900/50 p-2 transition-colors hover:border-blue-500"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">V{video.version}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${video.status === 'completed'
                      ? 'bg-green-900/50 text-green-400'
                      : video.status === 'generating'
                        ? 'bg-blue-900/50 text-blue-400'
                        : 'bg-red-900/50 text-red-400'
                      }`}
                  >
                    {video.status === 'completed' ? '✓' : video.status === 'generating' ? '...' : '✗'}
                  </span>
                </div>

                <div className="mb-2 flex aspect-video items-center justify-center overflow-hidden rounded bg-black">
                  {video.status === 'completed' && downloadUrl ? (
                    <video src={downloadUrl} className="h-full w-full">
                      Your browser does not support the video tag.
                    </video>
                  ) : video.thumbnail ? (
                    <img src={video.thumbnail} alt="Thumbnail" className="h-full w-full object-cover" />
                  ) : (
                    <PlayCircleIcon className="h-6 w-6 text-gray-600" />
                  )}
                </div>

                <p className="mb-2 line-clamp-2 text-[10px] text-gray-400">{video.params.prompt}</p>

                <div className="flex gap-1">
                  <button
                    onClick={() => onIterate(video.id)}
                    className="flex-1 rounded bg-blue-600 px-2 py-1 text-[10px] font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Iterate
                  </button>
                  {video.status === 'completed' && downloadUrl && (
                    <button
                      onClick={() => onDownload(downloadUrl, `video-v${video.version}.mp4`)}
                      className="flex-1 rounded border border-gray-600 px-2 py-1 text-[10px] font-medium text-gray-200 transition-colors hover:border-blue-500"
                    >
                      Download
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
