import React from 'react';
import { ArrowDownTrayIcon, PlayCircleIcon } from '@heroicons/react/24/outline';

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

type VideoPreviewProps = {
  video: GeneratedVideo | null;
  onIterate: (videoId: string) => void;
  onDownload: (url: string, filename: string) => void;
};

export const VideoPreview: React.FC<VideoPreviewProps> = ({ video, onIterate, onDownload }) => {
  const previewUrl = video?.url || video?.urls?.[0] || null;

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        {video && video.status === 'completed' && (
          <span className="text-xs text-gray-400">Version {video.version}</span>
        )}
      </div>

      {video && video.status === 'completed' && previewUrl ? (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="flex min-h-0 flex-1 overflow-hidden rounded-lg bg-black">
            <video src={previewUrl} controls className="h-full w-full object-contain">
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">Version {video.version}</p>
              <p className="mt-1 line-clamp-2 text-xs text-gray-400">{video.params.prompt}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => onIterate(video.id)}
                className="inline-flex items-center gap-2 rounded-md border border-blue-500 px-3 py-2 text-xs font-medium text-blue-300 transition-colors hover:bg-blue-950/40"
              >
                Iterate
              </button>
              <button
                onClick={() => onDownload(previewUrl, `video-v${video.version}.mp4`)}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
          {video?.urls && video.urls.length > 1 && (
            <p className="text-xs text-gray-400">
              {video.urls.length} outputs available. Download the others from the gallery.
            </p>
          )}
        </div>
      ) : video && video.status === 'generating' ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-lg bg-black">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <p className="text-sm text-gray-300">Generating video...</p>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-700 bg-gray-900/50">
          <PlayCircleIcon className="mb-3 h-16 w-16 text-gray-600" />
          <p className="text-sm text-gray-400">No preview available</p>
          <p className="mt-1 text-xs text-gray-500">Generate a video to see it here.</p>
        </div>
      )}
    </div>
  );
};
