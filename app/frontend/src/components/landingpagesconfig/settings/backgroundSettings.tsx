import React from 'react';
import { BackgroundMedia } from '@pageforge/static-websites';
import { MediaUrlPicker } from '../../ui/library';
import { ComputerDesktopIcon, DevicePhoneMobileIcon } from '@heroicons/react/20/solid';

interface BackgroundSettingsProps {
  backgroundUrl: string;
  setBackgroundUrl: (url: string) => void;
  phoneBackgroundUrl?: string;
  setPhoneBackgroundUrl?: (url: string) => void;
}

const BackgroundSettings: React.FC<BackgroundSettingsProps> = ({
  backgroundUrl,
  setBackgroundUrl,
  phoneBackgroundUrl,
  setPhoneBackgroundUrl
}) => {
  const [previewMode, setPreviewMode] = React.useState<'desktop' | 'phone'>('desktop');
  return (
    <div className="pt-8">
      {/* Single column: preview goes under */}
      <div className="space-y-6">
        {/* Settings */}
        <div className="space-y-4">
          {/* Desktop background URL with library picker */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div className="md:col-span-4">
              <label htmlFor="backgroundUrl" className="block text-sm font-medium text-gray-200">
                Desktop Background URL (image or video for big and medium screens)
              </label>
              <input
                type="text"
                id="backgroundUrl"
                value={backgroundUrl}
                onChange={(e) => setBackgroundUrl(e.target.value)}
                className="mt-1 block w-full border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
                placeholder="Paste an image (.jpg/.png/.webp) or video (.m3u8/.mpd/.mp4) URL"
              />
            </div>
            <div className="md:col-span-1">
              <MediaUrlPicker
                size="md"
                label="Library"
                mediaType="all"
                onPick={(url) => setBackgroundUrl(url)}
              />
            </div>
          </div>

          {/* Phone background URL with library picker */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div className="md:col-span-4">
              <label htmlFor="phoneBackgroundUrl" className="block text-sm font-medium text-gray-200">
                Phone Background URL (shown on screens smaller than sm)
              </label>
              <input
                type="text"
                id="phoneBackgroundUrl"
                value={phoneBackgroundUrl || ''}
                onChange={(e) => setPhoneBackgroundUrl && setPhoneBackgroundUrl(e.target.value)}
                className="mt-1 block w-full border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
                placeholder="Optional: mobile-specific image/video URL"
              />
            </div>
            <div className="md:col-span-1">
              <MediaUrlPicker
                size="md"
                label="Library"
                mediaType="all"
                onPick={(url) => setPhoneBackgroundUrl && setPhoneBackgroundUrl(url)}
              />
            </div>
          </div>
        </div>

        {/* Preview under settings */}
        <div className="p-4 bg-gray-700 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-300 font-medium">Preview</div>
            <div className="inline-flex rounded-md overflow-hidden border border-gray-600">
              <button
                type="button"
                className={`px-2.5 py-1.5 ${previewMode === 'desktop' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-600'}`}
                onClick={() => setPreviewMode('desktop')}
                disabled={!backgroundUrl}
                title={backgroundUrl ? 'Show desktop/tablet background' : 'Desktop background not set'}
                aria-label="Desktop preview"
              >
                <ComputerDesktopIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={`px-2.5 py-1.5 border-l border-gray-600 ${previewMode === 'phone' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-600'}`}
                onClick={() => setPreviewMode('phone')}
                disabled={!phoneBackgroundUrl && !backgroundUrl}
                title={phoneBackgroundUrl || backgroundUrl ? 'Show phone preview' : 'No background set'}
                aria-label="Phone preview"
              >
                <DevicePhoneMobileIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          {/* Container that adapts to preview mode - desktop: 16:9 landscape, phone: 9:16 portrait */}
          <div className="flex justify-center">
            <div
              className={`relative border border-gray-600 rounded-md overflow-hidden bg-gray-900 ${previewMode === 'phone'
                  ? 'w-[160px] h-[284px]' // ~9:16 aspect ratio (phone portrait)
                  : 'w-full max-w-[400px] h-[225px]' // ~16:9 aspect ratio (desktop landscape)
                }`}
            >
              {(backgroundUrl || phoneBackgroundUrl) ? (
                <>
                  {(() => {
                    const showPhone = previewMode === 'phone' && !!phoneBackgroundUrl;
                    const src = showPhone ? phoneBackgroundUrl! : (backgroundUrl || phoneBackgroundUrl!);
                    return (
                      <BackgroundMedia src={src} lazy autoPlay loop muted />
                    );
                  })()}
                  <div className="absolute top-1 right-1 bg-black/50 text-white px-1 py-0.5 rounded text-[10px]" aria-hidden>
                    {previewMode === 'phone' ? (
                      <DevicePhoneMobileIcon className="h-3 w-3" />
                    ) : (
                      <ComputerDesktopIcon className="h-3 w-3" />
                    )}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  No background
                </div>
              )}
            </div>
          </div>
          {backgroundUrl && (
            <p className="mt-2 text-[11px] text-gray-400 text-center">{phoneBackgroundUrl ? 'Use the toggle to preview how each background looks. Runtime behavior uses Phone on small screens and Desktop on sm and up.' : 'Desktop background will be used for all screen sizes.'}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackgroundSettings;
