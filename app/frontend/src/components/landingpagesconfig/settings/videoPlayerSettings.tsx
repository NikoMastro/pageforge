import React from 'react';
import type { VideoPlayerOptions, ButtonOptions, WidgetOptions, ComponentDisplay, GeneralOptions } from '../../../types/ui.types';
import { MediaUrlPicker } from '../../ui/library';
import { VideoPlayer, Button, WidgetFull, SteamWidgetCropBuy, SteamWidgetCropInstall, SteamWidgetCropWishlist } from '@pageforge/static-websites';

interface VideoPlayerSettingsProps {
  videoPlayerOptions: VideoPlayerOptions;
  setVideoPlayerOptions: (o: VideoPlayerOptions) => void;
  buttonOptions: ButtonOptions;
  widgetOptions: WidgetOptions;
  componentDisplay: ComponentDisplay;
  generalOptions: GeneralOptions;
}

const VideoPlayerSettings: React.FC<VideoPlayerSettingsProps> = ({
  videoPlayerOptions,
  setVideoPlayerOptions,
  buttonOptions,
  widgetOptions,
  componentDisplay,
  generalOptions
}) => {
  const updateBackground = (field: string, value: any) => {
    if (!videoPlayerOptions.background) return;
    const updated = { ...videoPlayerOptions.background };
    (updated as any)[field] = value;
    setVideoPlayerOptions({
      ...videoPlayerOptions,
      background: updated
    });
  };

  const updateVideoSource = (field: string, value: any) => {
    const updated = { ...videoPlayerOptions.videoSource };
    (updated as any)[field] = value;
    setVideoPlayerOptions({
      ...videoPlayerOptions,
      videoSource: updated
    });
  };

  return (
    <div className="pt-8">
      <h3 className="font-medium text-white mb-3">Video Player Settings</h3>
      <div className="space-y-6">
        {/* Background Settings */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md space-y-4">
          <h4 className="text-sm font-medium text-gray-300">Background</h4>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Type</label>
            <select
              value={videoPlayerOptions.background?.type || 'solid'}
              onChange={(e) => {
                const type = e.target.value as 'solid' | 'gradient' | 'image' | 'video';
                setVideoPlayerOptions({
                  ...videoPlayerOptions,
                  background: {
                    type,
                    ...(type === 'solid' && { color: '#000000' }),
                    ...(type === 'gradient' && { gradient: 'linear-gradient(to right, #000000, #333333)' }),
                    ...(type === 'image' && { src: '' }),
                    ...(type === 'video' && { src: '' })
                  } as any
                });
              }}
              className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
            >
              <option value="solid">Solid Color</option>
              <option value="gradient">Gradient</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>

          {videoPlayerOptions.background?.type === 'solid' && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Color</label>
              <input
                type="color"
                value={(videoPlayerOptions.background as any).color || '#000000'}
                onChange={(e) => updateBackground('color', e.target.value)}
                className="w-full h-10 border border-gray-600 bg-gray-800 rounded-md"
              />
            </div>
          )}

          {videoPlayerOptions.background?.type === 'gradient' && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Gradient CSS</label>
              <input
                type="text"
                value={(videoPlayerOptions.background as any).gradient || ''}
                onChange={(e) => updateBackground('gradient', e.target.value)}
                placeholder="linear-gradient(to right, #000, #333)"
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
              />
            </div>
          )}

          {(videoPlayerOptions.background?.type === 'image' || videoPlayerOptions.background?.type === 'video') && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                {videoPlayerOptions.background?.type === 'image' ? 'Image URL' : 'Video URL'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={(videoPlayerOptions.background as any).src || ''}
                  onChange={(e) => updateBackground('src', e.target.value)}
                  placeholder={`Enter ${videoPlayerOptions.background?.type} URL`}
                  className="flex-1 border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
                />
                <MediaUrlPicker
                  onPick={(url: string) => updateBackground('src', url)}
                  label="Browse"
                  mediaType={videoPlayerOptions.background?.type === 'image' ? 'images' : 'videos'}
                  size="sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Video Source Settings */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md space-y-4">
          <h4 className="text-sm font-medium text-gray-300">Video Source</h4>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Source Type</label>
            <select
              value={videoPlayerOptions.videoSource?.type || 'url'}
              onChange={(e) => {
                const type = e.target.value as 'url' | 'embed' | 'cloudflare';
                setVideoPlayerOptions({
                  ...videoPlayerOptions,
                  videoSource: {
                    type,
                    ...(type === 'url' && { url: '' }),
                    ...(type === 'embed' && { embedCode: '' }),
                    ...(type === 'cloudflare' && { src: '' })
                  } as any
                });
              }}
              className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
            >
              <option value="url">URL (YouTube, Direct)</option>
              <option value="embed">Embed Code</option>
              <option value="cloudflare">Cloudflare Library</option>
            </select>
          </div>

          {videoPlayerOptions.videoSource?.type === 'url' && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Video URL</label>
              <input
                type="text"
                value={(videoPlayerOptions.videoSource as any).url || ''}
                onChange={(e) => updateVideoSource('url', e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
              />
            </div>
          )}

          {videoPlayerOptions.videoSource?.type === 'embed' && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Embed Code</label>
              <textarea
                value={(videoPlayerOptions.videoSource as any).embedCode || ''}
                onChange={(e) => updateVideoSource('embedCode', e.target.value)}
                placeholder='<iframe src="..." ...></iframe>'
                rows={4}
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm font-mono"
              />
            </div>
          )}

          {videoPlayerOptions.videoSource?.type === 'cloudflare' && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Cloudflare Video URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={(videoPlayerOptions.videoSource as any).src || ''}
                  onChange={(e) => updateVideoSource('src', e.target.value)}
                  placeholder="Select from Cloudflare library"
                  className="flex-1 border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
                />
                <MediaUrlPicker
                  onPick={(url: string) => updateVideoSource('src', url)}
                  label="Browse"
                  mediaType="videos"
                  size="sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Video Display Settings */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md space-y-4">
          <h4 className="text-sm font-medium text-gray-300">Display Settings</h4>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Aspect Ratio</label>
            <select
              value={videoPlayerOptions.aspectRatio || '16/9'}
              onChange={(e) => setVideoPlayerOptions({ ...videoPlayerOptions, aspectRatio: e.target.value })}
              className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
            >
              <option value="16/9">16:9 (Widescreen)</option>
              <option value="4/3">4:3 (Standard)</option>
              <option value="21/9">21:9 (Ultrawide)</option>
              <option value="1/1">1:1 (Square)</option>
              <option value="9/16">9:16 (Vertical)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Poster Image (Optional)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={videoPlayerOptions.poster || ''}
                onChange={(e) => setVideoPlayerOptions({ ...videoPlayerOptions, poster: e.target.value })}
                placeholder="Thumbnail before video loads"
                className="flex-1 border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
              />
              <MediaUrlPicker
                onPick={(url: string) => setVideoPlayerOptions({ ...videoPlayerOptions, poster: url })}
                label="Browse"
                mediaType="images"
                size="sm"
              />
            </div>
            {videoPlayerOptions.poster && (
              <p className="text-red-500 text-xs mt-1">
                Activate auto play or show controls to make sure video runs
              </p>
            )}
          </div>
        </div>

        {/* Video Controls */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md space-y-4">
          <h4 className="text-sm font-medium text-gray-300">Video Controls</h4>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center text-sm text-gray-300">
              <input
                type="checkbox"
                checked={videoPlayerOptions.autoPlay || false}
                onChange={(e) => setVideoPlayerOptions({ ...videoPlayerOptions, autoPlay: e.target.checked })}
                className="form-checkbox text-indigo-500 bg-gray-800 border-gray-600 focus:ring-indigo-400 mr-2"
              />
              Auto Play
            </label>

            <label className="flex items-center text-sm text-gray-300">
              <input
                type="checkbox"
                checked={videoPlayerOptions.loop || false}
                onChange={(e) => setVideoPlayerOptions({ ...videoPlayerOptions, loop: e.target.checked })}
                className="form-checkbox text-indigo-500 bg-gray-800 border-gray-600 focus:ring-indigo-400 mr-2"
              />
              Loop
            </label>

            <label className="flex items-center text-sm text-gray-300">
              <input
                type="checkbox"
                checked={videoPlayerOptions.muted !== false}
                onChange={(e) => setVideoPlayerOptions({ ...videoPlayerOptions, muted: e.target.checked })}
                className="form-checkbox text-indigo-500 bg-gray-800 border-gray-600 focus:ring-indigo-400 mr-2"
              />
              Muted
            </label>

            <label className="flex items-center text-sm text-gray-300">
              <input
                type="checkbox"
                checked={videoPlayerOptions.controls !== false}
                onChange={(e) => setVideoPlayerOptions({ ...videoPlayerOptions, controls: e.target.checked })}
                className="form-checkbox text-indigo-500 bg-gray-800 border-gray-600 focus:ring-indigo-400 mr-2"
              />
              Show Controls
            </label>
          </div>
        </div>

        {/* CTA Section */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md space-y-4">
          <h4 className="text-sm font-medium text-gray-300">CTA (Call to Action)</h4>

          <div>
            <label className="flex items-center text-sm text-gray-300">
              <input
                type="checkbox"
                checked={videoPlayerOptions.displayCTA || false}
                onChange={(e) => setVideoPlayerOptions({ ...videoPlayerOptions, displayCTA: e.target.checked })}
                className="form-checkbox text-indigo-500 bg-gray-800 border-gray-600 focus:ring-indigo-400 mr-2"
              />
              Display CTA
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Show the CTA (button or widget) below the video based on your general configuration
            </p>
          </div>
        </div>

        {/* Preview Section */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md">
          <h4 className="font-medium text-gray-200 mb-3">Preview</h4>
          <div className="max-w-full overflow-hidden bg-gray-900 rounded">
            {(!videoPlayerOptions.videoSource?.url &&
              !videoPlayerOptions.videoSource?.embedCode &&
              !videoPlayerOptions.videoSource?.src) ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Configure video source above to see preview
              </div>
            ) : (
              <div className="relative w-full" style={{ minHeight: '500px', fontFamily: generalOptions.font.family, fontWeight: generalOptions.font.weight }}>
                {/* Background layer - absolute positioning */}
                {(videoPlayerOptions.background?.type === 'image' ||
                  videoPlayerOptions.background?.type === 'video') && (
                    <div className="absolute inset-0 w-full h-full">
                      <VideoPlayer
                        background={videoPlayerOptions.background as any}
                        videoSource={{ type: 'url', url: '' }}
                        display={true}
                        containerClassName="!absolute !inset-0 !p-0"
                        className="hidden"
                      />
                    </div>
                  )}

                {/* Content layer - relative positioning on top */}
                <div className="relative z-10 w-full h-full flex flex-col" style={{ minHeight: '500px' }}>
                  <div className={`w-full h-full flex flex-col items-center px-4 ${videoPlayerOptions.displayCTA && (componentDisplay.button || (componentDisplay.widget && widgetOptions.enabled))
                    ? 'justify-between py-8'
                    : 'justify-center'
                    }`}>
                    <div className={`w-full flex items-center justify-center ${videoPlayerOptions.displayCTA && (componentDisplay.button || (componentDisplay.widget && widgetOptions.enabled))
                      ? 'flex-1 min-h-0'
                      : ''
                      }`}>
                      <VideoPlayer
                        background={{ type: 'solid', color: 'transparent' }}
                        videoSource={videoPlayerOptions.videoSource as any}
                        videoWidth={videoPlayerOptions.videoWidth}
                        videoHeight={videoPlayerOptions.videoHeight}
                        aspectRatio={videoPlayerOptions.aspectRatio}
                        autoPlay={videoPlayerOptions.autoPlay}
                        loop={videoPlayerOptions.loop}
                        muted={videoPlayerOptions.muted}
                        controls={videoPlayerOptions.controls}
                        playsInline={videoPlayerOptions.playsInline}
                        poster={videoPlayerOptions.poster}
                        display={true}
                      />
                    </div>
                    {videoPlayerOptions.displayCTA && componentDisplay.button && (
                      <div className="flex-shrink-0 mt-6">
                        <Button
                          text={buttonOptions.buttonText}
                          onClick={() => { }}
                          buttonSize={buttonOptions.buttonSize || 'default'}
                          backgroundColor={buttonOptions.backgroundColor}
                          hoverBackgroundColor={buttonOptions.hoverBackgroundColor}
                          font={buttonOptions.font}
                          border={buttonOptions.border}
                          padding={buttonOptions.padding}
                          margin={buttonOptions.margin}
                          shadow={buttonOptions.shadow && buttonOptions.shadow !== 'none'
                            ? `0 4px 14px rgba(0,0,0,${buttonOptions.shadowIntensity ?? 0.25})`
                            : buttonOptions.shadow}
                          hoverShadow={buttonOptions.shadow && buttonOptions.shadow !== 'none'
                            ? `0 6px 20px rgba(0,0,0,${buttonOptions.hoverShadowIntensity ?? 0.35})`
                            : buttonOptions.hoverShadow}
                          transition={buttonOptions.transition}
                          steamIcon={buttonOptions.steamIcon}
                          image={buttonOptions.image}
                        />
                      </div>
                    )}
                    {videoPlayerOptions.displayCTA && componentDisplay.widget && widgetOptions.enabled && widgetOptions.type === 'full' && (
                      <div className="flex-shrink-0 mt-6">
                        <WidgetFull
                          gameId={widgetOptions.gameId}
                          utm={widgetOptions.utm as any}
                        />
                      </div>
                    )}
                    {videoPlayerOptions.displayCTA && componentDisplay.widget && widgetOptions.enabled && widgetOptions.type === 'buy' && (
                      <div className="flex-shrink-0 mt-6">
                        <SteamWidgetCropBuy
                          gameId={widgetOptions.gameId}
                          scale={1}
                          utm={widgetOptions.utm as any}
                        />
                      </div>
                    )}
                    {videoPlayerOptions.displayCTA && componentDisplay.widget && widgetOptions.enabled && widgetOptions.type === 'install' && (
                      <div className="flex-shrink-0 mt-6">
                        <SteamWidgetCropInstall
                          gameId={widgetOptions.gameId}
                          scale={1}
                          utm={widgetOptions.utm as any}
                        />
                      </div>
                    )}
                    {videoPlayerOptions.displayCTA && componentDisplay.widget && widgetOptions.enabled && widgetOptions.type === 'wishlist' && (
                      <div className="flex-shrink-0 mt-6">
                        <SteamWidgetCropWishlist
                          gameId={widgetOptions.gameId}
                          scale={1}
                          utm={widgetOptions.utm as any}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerSettings;
