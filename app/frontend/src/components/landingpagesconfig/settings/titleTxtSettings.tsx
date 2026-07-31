import React from 'react';
import type { TitleTxtOptions, ButtonOptions, WidgetOptions, ComponentDisplay, GeneralOptions } from '../../../types/ui.types';
import { MediaUrlPicker } from '../../ui/library';
import { TitleTxt, Button, WidgetFull, SteamWidgetCropBuy, SteamWidgetCropInstall, SteamWidgetCropWishlist } from '@pageforge/static-websites';

interface TitleTxtSettingsProps {
  titleTxtOptions: TitleTxtOptions;
  setTitleTxtOptions: (o: TitleTxtOptions) => void;
  buttonOptions: ButtonOptions;
  widgetOptions: WidgetOptions;
  componentDisplay: ComponentDisplay;
  generalOptions: GeneralOptions;
}

const TitleTxtSettings: React.FC<TitleTxtSettingsProps> = ({
  titleTxtOptions,
  setTitleTxtOptions,
  buttonOptions,
  widgetOptions,
  componentDisplay,
  generalOptions
}) => {
  // Safety check: return null if titleTxtOptions is undefined
  if (!titleTxtOptions) {
    return null;
  }

  return (
    <div className="pt-8">
      <h3 className="font-medium text-white mb-3">Game Presentation</h3>
      <div className="space-y-6">
        {/* Text Content */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md space-y-4">
          <h4 className="text-sm font-medium text-gray-300">Content</h4>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Title</label>
            <input
              type="text"
              value={titleTxtOptions.title || ''}
              onChange={(e) => setTitleTxtOptions({
                ...titleTxtOptions,
                title: e.target.value
              })}
              placeholder="Enter title"
              className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Text</label>
            <textarea
              value={(titleTxtOptions.subtext || '').replace(/<br\s*\/?>/gi, '\n')}
              onChange={(e) => {
                const textWithBreaks = e.target.value.replace(/\n/g, '<br>');
                setTitleTxtOptions({
                  ...titleTxtOptions,
                  subtext: textWithBreaks
                });
              }}
              placeholder="Enter text"
              rows={3}
              className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
            />
          </div>
        </div>

        {/* Text Styling */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md space-y-4">
          <h4 className="text-sm font-medium text-gray-300">Text Styling</h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Title Color</label>
              <input
                type="color"
                value={titleTxtOptions.titleColor || '#000000'}
                onChange={(e) => setTitleTxtOptions({
                  ...titleTxtOptions,
                  titleColor: e.target.value
                })}
                className="w-full h-10 border border-gray-600 bg-gray-800 rounded-md"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Title Font Size</label>
              <input
                type="text"
                value={titleTxtOptions.titleFontSize || '48px'}
                onChange={(e) => setTitleTxtOptions({
                  ...titleTxtOptions,
                  titleFontSize: e.target.value
                })}
                placeholder="48px"
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Text Color</label>
              <input
                type="color"
                value={titleTxtOptions.subtextColor || '#666666'}
                onChange={(e) => setTitleTxtOptions({
                  ...titleTxtOptions,
                  subtextColor: e.target.value
                })}
                className="w-full h-10 border border-gray-600 bg-gray-800 rounded-md"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Text Size</label>
              <input
                type="text"
                value={titleTxtOptions.subtextFontSize || '24px'}
                onChange={(e) => setTitleTxtOptions({
                  ...titleTxtOptions,
                  subtextFontSize: e.target.value
                })}
                placeholder="24px"
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Background Settings */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md space-y-4">
          <h4 className="text-sm font-medium text-gray-300">Background Settings</h4>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Background Type</label>
            <select
              value={titleTxtOptions.background?.type || 'solid'}
              onChange={(e) => {
                const type = e.target.value as 'solid' | 'gradient' | 'image' | 'video';
                if (type === 'solid') {
                  setTitleTxtOptions({
                    ...titleTxtOptions,
                    background: { type: 'solid', color: titleTxtOptions.backgroundColor }
                  });
                } else if (type === 'gradient') {
                  setTitleTxtOptions({
                    ...titleTxtOptions,
                    background: {
                      type: 'gradient',
                      gradient: {
                        type: 'linear',
                        colors: ['#ffffff', '#f0f0f0'],
                        direction: '180deg'
                      }
                    }
                  });
                } else if (type === 'image') {
                  setTitleTxtOptions({
                    ...titleTxtOptions,
                    background: {
                      type: 'image',
                      image: {
                        url: '',
                        position: 'center'
                      }
                    }
                  });
                } else if (type === 'video') {
                  setTitleTxtOptions({
                    ...titleTxtOptions,
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
          {titleTxtOptions.background?.type === 'solid' && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Background Color</label>
              <input
                type="color"
                value={titleTxtOptions.background.color || titleTxtOptions.backgroundColor}
                onChange={(e) => setTitleTxtOptions({
                  ...titleTxtOptions,
                  background: { type: 'solid', color: e.target.value },
                  backgroundColor: e.target.value
                })}
                className="w-full h-10 border border-gray-600 bg-gray-800 rounded-md"
              />
            </div>
          )}

          {/* Gradient Background */}
          {titleTxtOptions.background?.type === 'gradient' && titleTxtOptions.background.gradient && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Gradient Type</label>
                <select
                  value={titleTxtOptions.background.gradient.type}
                  onChange={(e) => setTitleTxtOptions({
                    ...titleTxtOptions,
                    background: {
                      ...titleTxtOptions.background!,
                      gradient: {
                        ...titleTxtOptions.background!.gradient!,
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Color 1</label>
                  <input
                    type="color"
                    value={titleTxtOptions.background.gradient.colors[0] || '#ffffff'}
                    onChange={(e) => {
                      const newColors = [...titleTxtOptions.background!.gradient!.colors];
                      newColors[0] = e.target.value;
                      setTitleTxtOptions({
                        ...titleTxtOptions,
                        background: {
                          ...titleTxtOptions.background!,
                          gradient: {
                            ...titleTxtOptions.background!.gradient!,
                            colors: newColors
                          }
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
                    value={titleTxtOptions.background.gradient.colors[1] || '#f0f0f0'}
                    onChange={(e) => {
                      const newColors = [...titleTxtOptions.background!.gradient!.colors];
                      newColors[1] = e.target.value;
                      setTitleTxtOptions({
                        ...titleTxtOptions,
                        background: {
                          ...titleTxtOptions.background!,
                          gradient: {
                            ...titleTxtOptions.background!.gradient!,
                            colors: newColors
                          }
                        }
                      });
                    }}
                    className="w-full h-10 border border-gray-600 bg-gray-800 rounded-md"
                  />
                </div>
              </div>

              {titleTxtOptions.background.gradient.type === 'linear' && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Direction (deg)</label>
                  <input
                    type="text"
                    value={titleTxtOptions.background.gradient.direction || '180deg'}
                    onChange={(e) => setTitleTxtOptions({
                      ...titleTxtOptions,
                      background: {
                        ...titleTxtOptions.background!,
                        gradient: {
                          ...titleTxtOptions.background!.gradient!,
                          direction: e.target.value
                        }
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
          {titleTxtOptions.background?.type === 'image' && titleTxtOptions.background.image && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Background Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={titleTxtOptions.background.image.url}
                    onChange={(e) => setTitleTxtOptions({
                      ...titleTxtOptions,
                      background: {
                        ...titleTxtOptions.background!,
                        image: {
                          ...titleTxtOptions.background!.image!,
                          url: e.target.value
                        }
                      }
                    })}
                    placeholder="https://..."
                    className="flex-1 border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
                  />
                  <MediaUrlPicker
                    onPick={(url: string) => setTitleTxtOptions({
                      ...titleTxtOptions,
                      background: {
                        ...titleTxtOptions.background!,
                        image: {
                          ...titleTxtOptions.background!.image!,
                          url
                        }
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
          {titleTxtOptions.background?.type === 'video' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Video URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={titleTxtOptions.background.video?.url || ''}
                    onChange={(e) => setTitleTxtOptions({
                      ...titleTxtOptions,
                      background: {
                        ...titleTxtOptions.background!,
                        video: { ...(titleTxtOptions.background!.video || {}), url: e.target.value }
                      }
                    })}
                    placeholder="https://..."
                    className="flex-1 border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
                  />
                  <MediaUrlPicker
                    onPick={(url: string) => setTitleTxtOptions({
                      ...titleTxtOptions,
                      background: {
                        ...titleTxtOptions.background!,
                        video: { ...(titleTxtOptions.background!.video || {}), url }
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
                checked={titleTxtOptions.displayCTA || false}
                onChange={(e) => setTitleTxtOptions({ ...titleTxtOptions, displayCTA: e.target.checked })}
                className="form-checkbox text-indigo-500 bg-gray-800 border-gray-600 focus:ring-indigo-400 mr-2"
              />
              Display CTA
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Show the CTA (button or widget) after the game presentation content based on your general configuration
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md space-y-4">
          <h4 className="font-medium text-gray-200 mb-3">Preview</h4>
          <div className="max-w-full bg-gray-900 rounded overflow-hidden" style={{ fontFamily: generalOptions.font.family, fontWeight: generalOptions.font.weight }}>
            <TitleTxt
              title={titleTxtOptions.title}
              subtext={titleTxtOptions.subtext}
              background={titleTxtOptions.background}
              backgroundColor={titleTxtOptions.backgroundColor}
              titleColor={titleTxtOptions.titleColor}
              subtextColor={titleTxtOptions.subtextColor}
              titleFontSize={titleTxtOptions.titleFontSize}
              subtextFontSize={titleTxtOptions.subtextFontSize}
              display={true}
            >
              {titleTxtOptions.displayCTA && componentDisplay.button && (
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
              )}
              {titleTxtOptions.displayCTA && componentDisplay.widget && widgetOptions.enabled && widgetOptions.type === 'full' && (
                <WidgetFull gameId={widgetOptions.gameId} utm={widgetOptions.utm as any} />
              )}
              {titleTxtOptions.displayCTA && componentDisplay.widget && widgetOptions.enabled && widgetOptions.type === 'buy' && (
                <SteamWidgetCropBuy gameId={widgetOptions.gameId} scale={widgetOptions.scale || 1} utm={widgetOptions.utm as any} />
              )}
              {titleTxtOptions.displayCTA && componentDisplay.widget && widgetOptions.enabled && widgetOptions.type === 'install' && (
                <SteamWidgetCropInstall gameId={widgetOptions.gameId} scale={widgetOptions.scale || 1} utm={widgetOptions.utm as any} />
              )}
              {titleTxtOptions.displayCTA && componentDisplay.widget && widgetOptions.enabled && widgetOptions.type === 'wishlist' && (
                <SteamWidgetCropWishlist gameId={widgetOptions.gameId} scale={widgetOptions.scale || 1} utm={widgetOptions.utm as any} />
              )}
            </TitleTxt>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitleTxtSettings;
