import type { SteamReviewsOptions, ButtonOptions, WidgetOptions, ComponentDisplay, GeneralOptions } from '../../../types/ui.types';
import { SteamReviews as StaticSteamReviews, Button, SteamWidgetCropBuy, SteamWidgetCropInstall, SteamWidgetCropWishlist } from '@pageforge/static-websites';
// removed WidgetFull import above because it's not used for now.
import { MediaUrlPicker } from '../../ui/library';

interface SteamReviewsSettingsProps {
  steamReviewsOptions: SteamReviewsOptions;
  setSteamReviewsOptions: (o: SteamReviewsOptions) => void;
  buttonOptions: ButtonOptions;
  widgetOptions: WidgetOptions;
  componentDisplay: ComponentDisplay;
  generalOptions: GeneralOptions;
}

const emptyImage = () => ({ src: '', alt: '' });

const SteamReviewsSettings = ({ steamReviewsOptions, setSteamReviewsOptions, buttonOptions, widgetOptions, componentDisplay, generalOptions }: SteamReviewsSettingsProps) => {
  const { images = [] } = steamReviewsOptions;

  const updateImage = (idx: number, field: 'src' | 'alt', value: string) => {
    if (field === 'src') {
      const tokens = value
        .split(/[\n,;]+/)
        .map(s => s.trim())
        .filter(Boolean);
      if (tokens.length > 1) {
        const expanded = [
          ...images.slice(0, idx),
          ...tokens.map(t => ({ src: t, alt: '' })),
          ...images.slice(idx + 1)
        ];
        setSteamReviewsOptions({ ...steamReviewsOptions, images: expanded });
        return;
      }
    }
    const next = images.map((img, i) => (i === idx ? { ...img, [field]: value } : img));
    setSteamReviewsOptions({ ...steamReviewsOptions, images: next });
  };
  const addImage = () => setSteamReviewsOptions({ ...steamReviewsOptions, images: [...images, emptyImage()] });
  const removeImage = (idx: number) => setSteamReviewsOptions({ ...steamReviewsOptions, images: images.filter((_, i) => i !== idx) });

  return (
    <div className="pt-8">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">Steam Reviews Settings</h3>
      <div className="space-y-6">
        {/* Configuration options */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Orientation</label>
              <select
                value={steamReviewsOptions.orientation}
                onChange={(e) => setSteamReviewsOptions({ ...steamReviewsOptions, orientation: e.target.value as 'horizontal' | 'vertical' })}
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
              >
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Scroll Speed (px/s)</label>
              <input
                type="text"
                value={steamReviewsOptions.scrollSpeed ?? ''}
                onChange={(e) => setSteamReviewsOptions({ ...steamReviewsOptions, scrollSpeed: e.target.value === '' ? undefined : (parseInt(e.target.value, 10) || undefined) })}
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
              />
            </div>
          </div>

          {/* Container size */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Container Height (px)</label>
            <input
              type="text"
              value={steamReviewsOptions.height ?? ''}
              onChange={(e) => setSteamReviewsOptions({ ...steamReviewsOptions, height: e.target.value === '' ? undefined : (parseInt(e.target.value, 10) || undefined) })}
              className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
            />
          </div>

          {/* Image dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Image Width</label>
              <input
                type="text"
                value={steamReviewsOptions.imageWidth}
                onChange={(e) => setSteamReviewsOptions({ ...steamReviewsOptions, imageWidth: e.target.value })}
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
                placeholder="auto or px value"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Image Height</label>
              <input
                type="text"
                value={steamReviewsOptions.imageHeight}
                onChange={(e) => setSteamReviewsOptions({ ...steamReviewsOptions, imageHeight: e.target.value })}
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
                placeholder="auto or px value"
              />
            </div>
          </div>

          {/* Gap between images */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Gap Between Images (px)</label>
            <input
              type="text"
              value={steamReviewsOptions.gap ?? ''}
              onChange={(e) => setSteamReviewsOptions({ ...steamReviewsOptions, gap: e.target.value === '' ? undefined : (parseInt(e.target.value, 10) || undefined) })}
              className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
            />
          </div>
        </div>

        {/* Review Screenshots (Images) */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md">
          <h4 className="font-medium text-gray-200 mb-4 flex items-center justify-between">
            Review Screenshots
            <button
              type="button"
              onClick={addImage}
              className="ml-4 px-2 py-1 text-xs bg-indigo-600 hover:bg-indigo-500 rounded-md text-white"
            >
              Add
            </button>
          </h4>
          {images.length === 0 && <p className="text-xs text-gray-400">No screenshots yet. Add one to display Steam reviews.</p>}
          <div className="space-y-4">
            {images.map((img, i) => (
              <div key={i} className="p-3 bg-gray-800 border border-gray-600 rounded-md space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Screenshot {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Image URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={img.src}
                        onChange={(e) => updateImage(i, 'src', e.target.value)}
                        className="flex-1 border border-gray-600 bg-gray-900 text-white rounded-md px-2 py-1 text-xs"
                        placeholder="https://..."
                      />
                      <MediaUrlPicker
                        size="sm"
                        label="Library"
                        mediaType="images"
                        onPick={(url) => updateImage(i, 'src', url)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Alt Text</label>
                    <input
                      type="text"
                      value={img.alt}
                      onChange={(e) => updateImage(i, 'alt', e.target.value)}
                      className="w-full border border-gray-600 bg-gray-900 text-white rounded-md px-2 py-1 text-xs"
                      placeholder="Description"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Background Settings */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md space-y-4">
          <h4 className="text-sm font-medium text-gray-300">Background Settings</h4>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Background Type</label>
            <select
              value={steamReviewsOptions.background?.type || 'solid'}
              onChange={(e) => {
                const type = e.target.value as 'solid' | 'gradient' | 'image' | 'video';
                if (type === 'solid') {
                  setSteamReviewsOptions({
                    ...steamReviewsOptions,
                    background: { type: 'solid', color: '#000000' }
                  });
                } else if (type === 'gradient') {
                  setSteamReviewsOptions({
                    ...steamReviewsOptions,
                    background: {
                      type: 'gradient',
                      gradient: {
                        type: 'linear',
                        colors: ['#000000', '#1a1a1a'],
                        direction: '180deg'
                      }
                    }
                  });
                } else if (type === 'image') {
                  setSteamReviewsOptions({
                    ...steamReviewsOptions,
                    background: {
                      type: 'image',
                      image: {
                        url: '',
                        position: 'center'
                      }
                    }
                  });
                } else if (type === 'video') {
                  setSteamReviewsOptions({
                    ...steamReviewsOptions,
                    background: {
                      type: 'video',
                      video: {
                        url: '',
                        position: 'center'
                      }
                    }
                  });
                }
              }}
              className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
            >
              <option value="solid">Solid Color</option>
              <option value="gradient">Gradient</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>

          {/* Solid Color Background */}
          {steamReviewsOptions.background?.type === 'solid' && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Background Color</label>
              <input
                type="color"
                value={steamReviewsOptions.background.color || '#000000'}
                onChange={(e) => setSteamReviewsOptions({
                  ...steamReviewsOptions,
                  background: { ...steamReviewsOptions.background, type: 'solid', color: e.target.value }
                })}
                className="w-full h-10 border border-gray-600 bg-gray-800 rounded-md"
              />
            </div>
          )}

          {/* Gradient Background */}
          {steamReviewsOptions.background?.type === 'gradient' && steamReviewsOptions.background.gradient && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Gradient Type</label>
                <select
                  value={steamReviewsOptions.background.gradient.type}
                  onChange={(e) => setSteamReviewsOptions({
                    ...steamReviewsOptions,
                    background: {
                      ...steamReviewsOptions.background!,
                      gradient: {
                        ...steamReviewsOptions.background!.gradient!,
                        type: e.target.value as 'linear' | 'radial'
                      }
                    }
                  })}
                  className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
                >
                  <option value="linear">Linear</option>
                  <option value="radial">Radial</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Color 1</label>
                <input
                  type="color"
                  value={steamReviewsOptions.background.gradient.colors[0] || '#000000'}
                  onChange={(e) => {
                    const newColors = [...(steamReviewsOptions.background!.gradient!.colors || [])];
                    newColors[0] = e.target.value;
                    setSteamReviewsOptions({
                      ...steamReviewsOptions,
                      background: {
                        ...steamReviewsOptions.background!,
                        gradient: { ...steamReviewsOptions.background!.gradient!, colors: newColors }
                      }
                    });
                  }}
                  className="w-full h-10 border border-gray-600 bg-gray-800 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Color 2</label>
                <input
                  type="color"
                  value={steamReviewsOptions.background.gradient.colors[1] || '#1a1a1a'}
                  onChange={(e) => {
                    const newColors = [...(steamReviewsOptions.background!.gradient!.colors || ['#000000', '#1a1a1a'])];
                    newColors[1] = e.target.value;
                    setSteamReviewsOptions({
                      ...steamReviewsOptions,
                      background: {
                        ...steamReviewsOptions.background!,
                        gradient: { ...steamReviewsOptions.background!.gradient!, colors: newColors }
                      }
                    });
                  }}
                  className="w-full h-10 border border-gray-600 bg-gray-800 rounded-md"
                />
              </div>
              {steamReviewsOptions.background.gradient.type === 'linear' && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Direction (deg)</label>
                  <input
                    type="text"
                    value={steamReviewsOptions.background.gradient.direction || '180deg'}
                    onChange={(e) => setSteamReviewsOptions({
                      ...steamReviewsOptions,
                      background: {
                        ...steamReviewsOptions.background!,
                        gradient: { ...steamReviewsOptions.background!.gradient!, direction: e.target.value }
                      }
                    })}
                    placeholder="180deg"
                    className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
                  />
                </div>
              )}
            </div>
          )}

          {/* Image Background */}
          {steamReviewsOptions.background?.type === 'image' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={steamReviewsOptions.background.image?.url || ''}
                    onChange={(e) => setSteamReviewsOptions({
                      ...steamReviewsOptions,
                      background: {
                        ...steamReviewsOptions.background!,
                        image: { ...(steamReviewsOptions.background!.image || {}), url: e.target.value }
                      }
                    })}
                    placeholder="https://..."
                    className="flex-1 border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
                  />
                  <MediaUrlPicker
                    onPick={(url: string) => setSteamReviewsOptions({
                      ...steamReviewsOptions,
                      background: {
                        ...steamReviewsOptions.background!,
                        image: { ...(steamReviewsOptions.background!.image || {}), url }
                      }
                    })}
                    label="Browse"
                    mediaType="images"
                    size="sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Video Background */}
          {steamReviewsOptions.background?.type === 'video' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Video URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={steamReviewsOptions.background.video?.url || ''}
                    onChange={(e) => setSteamReviewsOptions({
                      ...steamReviewsOptions,
                      background: {
                        ...steamReviewsOptions.background!,
                        video: { ...(steamReviewsOptions.background!.video || {}), url: e.target.value }
                      }
                    })}
                    placeholder="https://..."
                    className="flex-1 border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
                  />
                  <MediaUrlPicker
                    onPick={(url: string) => setSteamReviewsOptions({
                      ...steamReviewsOptions,
                      background: {
                        ...steamReviewsOptions.background!,
                        video: { ...(steamReviewsOptions.background!.video || {}), url }
                      }
                    })}
                    label="Browse"
                    mediaType="videos"
                    size="sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA Settings */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md space-y-4">
          <h4 className="text-sm font-medium text-gray-300">CTA Settings</h4>
          <div>
            <label className="flex items-center text-sm text-gray-300">
              <input
                type="checkbox"
                checked={steamReviewsOptions.displayCTA || false}
                onChange={(e) => setSteamReviewsOptions({ ...steamReviewsOptions, displayCTA: e.target.checked })}
                className="form-checkbox text-indigo-500 bg-gray-800 border-gray-600 focus:ring-indigo-400 mr-2"
              />
              Display CTA
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Show the CTA (button or widget) after the Steam reviews content based on your general configuration
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md">
          <h4 className="font-medium text-gray-200 mb-3">Preview</h4>
          <div className="max-w-full overflow-hidden bg-gray-900 rounded">
            {images.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Add review screenshots above to see preview
              </div>
            ) : (
              <div className={`w-full h-full flex flex-col items-center px-4 ${steamReviewsOptions.displayCTA && (componentDisplay.button || (componentDisplay.widget && widgetOptions.enabled))
                ? 'justify-between py-8'
                : 'justify-center'
                }`} style={{ fontFamily: generalOptions.font.family, fontWeight: generalOptions.font.weight }}>
                <div className={`w-full flex items-center justify-center ${steamReviewsOptions.displayCTA && (componentDisplay.button || (componentDisplay.widget && widgetOptions.enabled))
                  ? 'flex-1 min-h-0'
                  : ''
                  }`}>
                  <StaticSteamReviews
                    images={images}
                    orientation={steamReviewsOptions.orientation}
                    scrollSpeed={steamReviewsOptions.scrollSpeed}
                    height={steamReviewsOptions.height}
                    width={steamReviewsOptions.width}
                    maxWidth={steamReviewsOptions.maxWidth}
                    imageHeight={steamReviewsOptions.imageHeight}
                    imageWidth={steamReviewsOptions.imageWidth}
                    gap={steamReviewsOptions.gap}
                  />
                </div>
                {steamReviewsOptions.displayCTA && componentDisplay.button && (
                  <div className="flex-shrink-0 mt-6">
                    <Button
                      text={buttonOptions.text}
                      onClick={() => { }}
                      buttonSize={buttonOptions.buttonSize}
                      backgroundColor={buttonOptions.backgroundColor}
                      hoverBackgroundColor={buttonOptions.hoverBackgroundColor}
                      font={buttonOptions.font}
                      border={buttonOptions.border}
                      padding={buttonOptions.padding}
                      margin={buttonOptions.margin}
                      shadow={buttonOptions.shadow}
                      hoverShadow={buttonOptions.hoverShadow}
                      transition={buttonOptions.transition}
                      steamIcon={buttonOptions.steamIcon}
                      image={buttonOptions.image}
                    />
                  </div>
                )}
                {steamReviewsOptions.displayCTA && componentDisplay.widget && widgetOptions.enabled && widgetOptions.type === 'buy' && (
                  <div className="flex-shrink-0 mt-6">
                    <SteamWidgetCropBuy gameId={widgetOptions.gameId} scale={widgetOptions.scale || 1} utm={widgetOptions.utm} />
                  </div>
                )}
                {steamReviewsOptions.displayCTA && componentDisplay.widget && widgetOptions.enabled && widgetOptions.type === 'install' && (
                  <div className="flex-shrink-0 mt-6">
                    <SteamWidgetCropInstall gameId={widgetOptions.gameId} scale={widgetOptions.scale || 1} utm={widgetOptions.utm} />
                  </div>
                )}
                {steamReviewsOptions.displayCTA && componentDisplay.widget && widgetOptions.enabled && widgetOptions.type === 'wishlist' && (
                  <div className="flex-shrink-0 mt-6">
                    <SteamWidgetCropWishlist gameId={widgetOptions.gameId} scale={widgetOptions.scale || 1} utm={widgetOptions.utm} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SteamReviewsSettings;
