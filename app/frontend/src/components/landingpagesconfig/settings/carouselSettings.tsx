import type { CarouselOptions, ButtonOptions, WidgetOptions, ComponentDisplay, GeneralOptions } from '../../../types/ui.types';
import { Carousel as StaticCarousel, Button, SteamWidgetCropBuy, SteamWidgetCropInstall, SteamWidgetCropWishlist } from '@pageforge/static-websites';
//removed widget import above because it's not used for now.
import { MediaUrlPicker } from '../../ui/library';

interface CarouselSettingsProps {
  carouselOptions: CarouselOptions & {
    orientation?: 'horizontal' | 'vertical';
    height?: string | number;
    width?: string | number;
    imageHeight?: string | number;
    imageWidth?: string | number;
  };
  setCarouselOptions: (o: CarouselOptions & { orientation?: 'horizontal' | 'vertical'; height?: string | number; width?: string | number; imageHeight?: string | number; imageWidth?: string | number; }) => void;
  buttonOptions: ButtonOptions;
  widgetOptions: WidgetOptions;
  componentDisplay: ComponentDisplay;
  generalOptions: GeneralOptions;
}

const emptyImage = () => ({ src: '', alt: '' });

const CarouselSettings = ({ carouselOptions, setCarouselOptions, buttonOptions, widgetOptions, componentDisplay, generalOptions }: CarouselSettingsProps) => {
  const { images = [] } = carouselOptions;

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
        setCarouselOptions({ ...carouselOptions, images: expanded });
        return;
      }
    }
    const next = images.map((img, i) => (i === idx ? { ...img, [field]: value } : img));
    setCarouselOptions({ ...carouselOptions, images: next });
  };
  const addImage = () => setCarouselOptions({ ...carouselOptions, images: [...images, emptyImage()] });
  const removeImage = (idx: number) => setCarouselOptions({ ...carouselOptions, images: images.filter((_, i) => i !== idx) });

  return (
    <div className="pt-8">
      <h3 className="font-medium text-white mb-3">Carousel Settings</h3>
      <div className="space-y-6">
        {/* Enable / Basic toggles */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md space-y-4">
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Interval (ms)</label>
              <input
                type="number"
                min={1000}
                step={500}
                value={carouselOptions.interval}
                onChange={(e) => setCarouselOptions({ ...carouselOptions, interval: parseInt(e.target.value, 10) || 0 })}
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Orientation</label>
              <select
                value={carouselOptions.orientation || 'horizontal'}
                onChange={(e) => setCarouselOptions({ ...carouselOptions, orientation: e.target.value as 'horizontal' | 'vertical' })}
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
              >
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
              </select>
            </div>
          </div>
          {/* Unified size control */}
          <div className="pt-2">
            {(() => {
              // Derive a numeric size from width in pixels
              const raw = carouselOptions.width;
              let widthPx = 960; // default width
              if (typeof raw === 'number') {
                widthPx = raw;
              } else if (typeof raw === 'string' && raw.match(/px$/)) {
                const n = parseInt(raw, 10);
                if (!isNaN(n)) widthPx = n;
              }

              // Convert to slider value (300px to 1200px)
              const sliderMin = 300;
              const sliderMax = 1200;
              const sliderValue = Math.max(sliderMin, Math.min(sliderMax, widthPx));

              const handleChange = (w: number) => {
                const finalWidth = Math.max(sliderMin, Math.min(sliderMax, w));
                const finalHeight = Math.round(finalWidth * 9 / 16); // 16:9 ratio

                setCarouselOptions({
                  ...carouselOptions,
                  width: finalWidth,
                  height: finalHeight,
                });
              };

              return (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Size</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={sliderMin}
                      max={sliderMax}
                      step={20}
                      value={sliderValue}
                      onChange={(e) => handleChange(parseInt(e.target.value, 10))}
                      className="flex-1"
                    />
                    <span className="text-xs w-20 text-right text-gray-300">{sliderValue}px</span>
                  </div>
                  <p className="mt-1 text-[10px] text-gray-400">
                    Width: {sliderValue}px, Height: {Math.round(sliderValue * 9 / 16)}px (16:9 ratio)
                  </p>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Images */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md">
          <h4 className="font-medium text-gray-200 mb-4 flex items-center justify-between">Images
            <button
              type="button"
              onClick={addImage}
              className="ml-4 px-2 py-1 text-xs bg-indigo-600 hover:bg-indigo-500 rounded-md text-white"
            >Add</button>
          </h4>
          {images.length === 0 && <p className="text-xs text-gray-400">No images yet. Add one.</p>}
          <div className="space-y-4">
            {images.map((img, i) => (
              <div key={i} className="p-3 bg-gray-800 border border-gray-600 rounded-md space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Image {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >Remove</button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Src</label>
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
                    <label className="block text-xs font-medium text-gray-400 mb-1">Alt</label>
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
              value={carouselOptions.background?.type || 'solid'}
              onChange={(e) => {
                const type = e.target.value as 'solid' | 'gradient' | 'image' | 'video';
                if (type === 'solid') {
                  setCarouselOptions({
                    ...carouselOptions,
                    background: { type: 'solid', color: '#000000' }
                  });
                } else if (type === 'gradient') {
                  setCarouselOptions({
                    ...carouselOptions,
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
                  setCarouselOptions({
                    ...carouselOptions,
                    background: {
                      type: 'image',
                      image: {
                        url: '',
                        position: 'center'
                      }
                    }
                  });
                } else if (type === 'video') {
                  setCarouselOptions({
                    ...carouselOptions,
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
          {carouselOptions.background?.type === 'solid' && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Background Color</label>
              <input
                type="color"
                value={carouselOptions.background.color || '#000000'}
                onChange={(e) => setCarouselOptions({
                  ...carouselOptions,
                  background: { ...carouselOptions.background, type: 'solid', color: e.target.value }
                })}
                className="w-full h-10 border border-gray-600 bg-gray-800 rounded-md"
              />
            </div>
          )}

          {/* Gradient Background */}
          {carouselOptions.background?.type === 'gradient' && carouselOptions.background.gradient && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Gradient Type</label>
                <select
                  value={carouselOptions.background.gradient.type}
                  onChange={(e) => setCarouselOptions({
                    ...carouselOptions,
                    background: {
                      ...carouselOptions.background!,
                      gradient: {
                        ...carouselOptions.background!.gradient!,
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
                  value={carouselOptions.background.gradient.colors[0] || '#000000'}
                  onChange={(e) => {
                    const newColors = [...(carouselOptions.background!.gradient!.colors || [])];
                    newColors[0] = e.target.value;
                    setCarouselOptions({
                      ...carouselOptions,
                      background: {
                        ...carouselOptions.background!,
                        gradient: { ...carouselOptions.background!.gradient!, colors: newColors }
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
                  value={carouselOptions.background.gradient.colors[1] || '#1a1a1a'}
                  onChange={(e) => {
                    const newColors = [...(carouselOptions.background!.gradient!.colors || ['#000000', '#1a1a1a'])];
                    newColors[1] = e.target.value;
                    setCarouselOptions({
                      ...carouselOptions,
                      background: {
                        ...carouselOptions.background!,
                        gradient: { ...carouselOptions.background!.gradient!, colors: newColors }
                      }
                    });
                  }}
                  className="w-full h-10 border border-gray-600 bg-gray-800 rounded-md"
                />
              </div>
              {carouselOptions.background.gradient.type === 'linear' && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Direction (deg)</label>
                  <input
                    type="text"
                    value={carouselOptions.background.gradient.direction || '180deg'}
                    onChange={(e) => setCarouselOptions({
                      ...carouselOptions,
                      background: {
                        ...carouselOptions.background!,
                        gradient: { ...carouselOptions.background!.gradient!, direction: e.target.value }
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
          {carouselOptions.background?.type === 'image' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={carouselOptions.background.image?.url || ''}
                    onChange={(e) => setCarouselOptions({
                      ...carouselOptions,
                      background: {
                        ...carouselOptions.background!,
                        image: { ...(carouselOptions.background!.image || {}), url: e.target.value }
                      }
                    })}
                    placeholder="https://..."
                    className="flex-1 border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
                  />
                  <MediaUrlPicker
                    onPick={(url: string) => setCarouselOptions({
                      ...carouselOptions,
                      background: {
                        ...carouselOptions.background!,
                        image: { ...(carouselOptions.background!.image || {}), url }
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
          {carouselOptions.background?.type === 'video' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Video URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={carouselOptions.background.video?.url || ''}
                    onChange={(e) => setCarouselOptions({
                      ...carouselOptions,
                      background: {
                        ...carouselOptions.background!,
                        video: { ...(carouselOptions.background!.video || {}), url: e.target.value }
                      }
                    })}
                    placeholder="https://..."
                    className="flex-1 border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
                  />
                  <MediaUrlPicker
                    onPick={(url: string) => setCarouselOptions({
                      ...carouselOptions,
                      background: {
                        ...carouselOptions.background!,
                        video: { ...(carouselOptions.background!.video || {}), url }
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
                checked={carouselOptions.displayCTA || false}
                onChange={(e) => setCarouselOptions({ ...carouselOptions, displayCTA: e.target.checked })}
                className="form-checkbox text-indigo-500 bg-gray-800 border-gray-600 focus:ring-indigo-400 mr-2"
              />
              Display CTA
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Show the CTA (button or widget) after the carousel content based on your general configuration
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md">
          <h4 className="font-medium text-gray-200 mb-3">Preview</h4>
          <div className="max-w-full overflow-hidden bg-gray-900 rounded">
            {images.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Add images above to see preview
              </div>
            ) : (
              <div className="relative w-full" style={{
                minHeight: '400px',
                fontFamily: generalOptions.font.family,
                fontWeight: generalOptions.font.weight,
                ...(carouselOptions.background?.type === 'solid' ? {
                  backgroundColor: carouselOptions.background.color
                } : carouselOptions.background?.type === 'gradient' && carouselOptions.background.gradient ? {
                  background: carouselOptions.background.gradient.type === 'linear'
                    ? `linear-gradient(${carouselOptions.background.gradient.direction || '180deg'}, ${carouselOptions.background.gradient.colors.join(', ')})`
                    : `radial-gradient(circle, ${carouselOptions.background.gradient.colors.join(', ')})`
                } : {})
              }}>
                {/* Background layer - absolute positioning for image */}
                {carouselOptions.background?.type === 'image' && carouselOptions.background.image?.url && (
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                      backgroundImage: `url(${carouselOptions.background.image.url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: carouselOptions.background.image.position || 'center',
                    }}
                  />
                )}

                {/* Background layer - absolute positioning for video */}
                {carouselOptions.background?.type === 'video' && carouselOptions.background.video?.url && (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      objectFit: carouselOptions.background.video.fit || 'cover',
                      objectPosition: carouselOptions.background.video.position || 'center',
                    }}
                  >
                    <source src={carouselOptions.background.video.url} type="video/mp4" />
                  </video>
                )}

                {/* Content layer - relative positioning on top */}
                <div className={`relative z-10 w-full h-full flex flex-col items-center px-4 ${carouselOptions.displayCTA && (componentDisplay.button || (componentDisplay.widget && widgetOptions.enabled))
                  ? 'justify-between py-8'
                  : 'justify-center'
                  }`} style={{ minHeight: '400px' }}>
                  <div className={`w-full flex items-center justify-center ${carouselOptions.displayCTA && (componentDisplay.button || (componentDisplay.widget && widgetOptions.enabled))
                    ? 'flex-1 min-h-0'
                    : ''
                    }`}>
                    <StaticCarousel
                      images={images}
                      autoPlay={carouselOptions.autoPlay}
                      interval={carouselOptions.interval}
                      showDots={carouselOptions.showDots}
                      showArrows={carouselOptions.showArrows}
                      orientation={carouselOptions.orientation || 'horizontal'}
                      height={carouselOptions.height}
                      width={carouselOptions.width}
                      showControls
                    />
                  </div>
                  {carouselOptions.displayCTA && componentDisplay.button && (
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
                  {carouselOptions.displayCTA && componentDisplay.widget && widgetOptions.enabled && widgetOptions.type === 'buy' && (
                    <div className="flex-shrink-0 mt-6">
                      <SteamWidgetCropBuy gameId={widgetOptions.gameId} scale={widgetOptions.scale || 1} utm={widgetOptions.utm} />
                    </div>
                  )}
                  {carouselOptions.displayCTA && componentDisplay.widget && widgetOptions.enabled && widgetOptions.type === 'install' && (
                    <div className="flex-shrink-0 mt-6">
                      <SteamWidgetCropInstall gameId={widgetOptions.gameId} scale={widgetOptions.scale || 1} utm={widgetOptions.utm} />
                    </div>
                  )}
                  {carouselOptions.displayCTA && componentDisplay.widget && widgetOptions.enabled && widgetOptions.type === 'wishlist' && (
                    <div className="flex-shrink-0 mt-6">
                      <SteamWidgetCropWishlist gameId={widgetOptions.gameId} scale={widgetOptions.scale || 1} utm={widgetOptions.utm} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarouselSettings;
