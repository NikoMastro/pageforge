import React from 'react';
import type { ColumnTxtOptions, ColumnTxtRow, ButtonOptions, WidgetOptions, ComponentDisplay, GeneralOptions } from '../../../types/ui.types';
import { MediaUrlPicker } from '../../ui/library';
import { ColumnTxt, Button, WidgetFull, SteamWidgetCropBuy, SteamWidgetCropInstall, SteamWidgetCropWishlist } from '@pageforge/static-websites';

interface ColumnTxtSettingsProps {
  columnTxtOptions: ColumnTxtOptions;
  setColumnTxtOptions: (o: ColumnTxtOptions) => void;
  buttonOptions: ButtonOptions;
  widgetOptions: WidgetOptions;
  componentDisplay: ComponentDisplay;
  generalOptions: GeneralOptions;
}

const ColumnTxtSettings: React.FC<ColumnTxtSettingsProps> = ({
  columnTxtOptions,
  setColumnTxtOptions,
  buttonOptions,
  widgetOptions,
  componentDisplay,
  generalOptions
}) => {
  const { rows = [] } = columnTxtOptions;

  const addRow = () => {
    const newRow: ColumnTxtRow = {
      id: `row-${Date.now()}`,
      title: '',
      text: 'Enter your text here...',
      imageUrl: '',
      imageAlt: `Game feature image ${rows.length + 1}`,
      layout: 'text-left'
    };
    setColumnTxtOptions({
      ...columnTxtOptions,
      rows: [...rows, newRow]
    });
  };

  const removeRow = (id: string) => {
    setColumnTxtOptions({
      ...columnTxtOptions,
      rows: rows.filter(r => r.id !== id)
    });
  };

  const updateRow = (id: string, field: keyof ColumnTxtRow, value: any) => {
    setColumnTxtOptions({
      ...columnTxtOptions,
      rows: rows.map(r => r.id === id ? { ...r, [field]: value } : r)
    });
  };

  return (
    <div className="pt-8">
      <h3 className="font-medium text-white mb-3">Game Features Settings</h3>
      <div className="space-y-6">
        {/* Global Settings */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md space-y-4">
          <h4 className="text-sm font-medium text-gray-300">Global Settings</h4>

          {/* Background Type */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Background Type</label>
            <select
              value={columnTxtOptions.background?.type || 'solid'}
              onChange={(e) => {
                const type = e.target.value as 'solid' | 'gradient' | 'image' | 'video';
                if (type === 'solid') {
                  setColumnTxtOptions({
                    ...columnTxtOptions,
                    background: { type: 'solid', color: columnTxtOptions.backgroundColor }
                  });
                } else if (type === 'gradient') {
                  setColumnTxtOptions({
                    ...columnTxtOptions,
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
                  setColumnTxtOptions({
                    ...columnTxtOptions,
                    background: {
                      type: 'image',
                      image: {
                        url: '',
                        position: 'center'
                      }
                    }
                  });
                } else if (type === 'video') {
                  setColumnTxtOptions({
                    ...columnTxtOptions,
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
          {columnTxtOptions.background?.type === 'solid' && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Background Color</label>
              <input
                type="color"
                value={columnTxtOptions.background.color || columnTxtOptions.backgroundColor}
                onChange={(e) => setColumnTxtOptions({
                  ...columnTxtOptions,
                  background: { ...columnTxtOptions.background, type: 'solid', color: e.target.value }
                })}
                className="w-full h-10 border border-gray-600 bg-gray-800 rounded-md"
              />
            </div>
          )}

          {/* Gradient Background */}
          {columnTxtOptions.background?.type === 'gradient' && columnTxtOptions.background.gradient && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Gradient Type</label>
                <select
                  value={columnTxtOptions.background.gradient.type}
                  onChange={(e) => setColumnTxtOptions({
                    ...columnTxtOptions,
                    background: {
                      ...columnTxtOptions.background!,
                      gradient: {
                        ...columnTxtOptions.background!.gradient!,
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
                  value={columnTxtOptions.background.gradient.colors[0] || '#ffffff'}
                  onChange={(e) => {
                    const newColors = [...columnTxtOptions.background!.gradient!.colors];
                    newColors[0] = e.target.value;
                    setColumnTxtOptions({
                      ...columnTxtOptions,
                      background: {
                        ...columnTxtOptions.background!,
                        gradient: {
                          ...columnTxtOptions.background!.gradient!,
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
                  value={columnTxtOptions.background.gradient.colors[1] || '#f0f0f0'}
                  onChange={(e) => {
                    const newColors = [...columnTxtOptions.background!.gradient!.colors];
                    newColors[1] = e.target.value;
                    setColumnTxtOptions({
                      ...columnTxtOptions,
                      background: {
                        ...columnTxtOptions.background!,
                        gradient: {
                          ...columnTxtOptions.background!.gradient!,
                          colors: newColors
                        }
                      }
                    });
                  }}
                  className="w-full h-10 border border-gray-600 bg-gray-800 rounded-md"
                />
              </div>
              {columnTxtOptions.background.gradient.type === 'linear' && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Direction (deg)</label>
                  <input
                    type="number"
                    value={parseInt(columnTxtOptions.background.gradient.direction || '180')}
                    onChange={(e) => setColumnTxtOptions({
                      ...columnTxtOptions,
                      background: {
                        ...columnTxtOptions.background!,
                        gradient: {
                          ...columnTxtOptions.background!.gradient!,
                          direction: `${e.target.value}deg`
                        }
                      }
                    })}
                    className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
                  />
                </div>
              )}
            </div>
          )}

          {/* Image Background */}
          {columnTxtOptions.background?.type === 'image' && columnTxtOptions.background.image && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={columnTxtOptions.background.image.url || ''}
                    onChange={(e) => setColumnTxtOptions({
                      ...columnTxtOptions,
                      background: {
                        ...columnTxtOptions.background!,
                        image: {
                          ...columnTxtOptions.background!.image!,
                          url: e.target.value
                        }
                      }
                    })}
                    placeholder="https://..."
                    className="flex-1 border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
                  />
                  <MediaUrlPicker
                    onPick={(url: string) => setColumnTxtOptions({
                      ...columnTxtOptions,
                      background: {
                        ...columnTxtOptions.background!,
                        image: {
                          ...columnTxtOptions.background!.image!,
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
          {columnTxtOptions.background?.type === 'video' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Video URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={columnTxtOptions.background.video?.url || ''}
                    onChange={(e) => setColumnTxtOptions({
                      ...columnTxtOptions,
                      background: {
                        ...columnTxtOptions.background!,
                        video: { ...(columnTxtOptions.background!.video || {}), url: e.target.value }
                      }
                    })}
                    placeholder="https://..."
                    className="flex-1 border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
                  />
                  <MediaUrlPicker
                    onPick={(url: string) => setColumnTxtOptions({
                      ...columnTxtOptions,
                      background: {
                        ...columnTxtOptions.background!,
                        video: { ...(columnTxtOptions.background!.video || {}), url }
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Text Color</label>
              <input
                type="color"
                value={columnTxtOptions.textColor}
                onChange={(e) => setColumnTxtOptions({ ...columnTxtOptions, textColor: e.target.value })}
                className="w-full h-10 border border-gray-600 bg-gray-800 rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Font Size</label>
              <input
                type="text"
                value={columnTxtOptions.fontSize}
                onChange={(e) => setColumnTxtOptions({ ...columnTxtOptions, fontSize: e.target.value })}
                placeholder="16px"
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Gap (px)</label>
              <input
                type="number"
                value={columnTxtOptions.gap}
                onChange={(e) => setColumnTxtOptions({ ...columnTxtOptions, gap: parseInt(e.target.value) || 32 })}
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Rows */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-300">Rows ({rows.length})</h4>
            <button
              onClick={addRow}
              className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition"
            >
              + Add Row
            </button>
          </div>

          {rows.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No rows yet. Click "Add Row" to create one.
            </p>
          ) : (
            <div className="space-y-4">
              {rows.map((row, index) => (
                <div key={row.id} className="p-3 border border-gray-500 bg-gray-800 rounded space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-300">Row {index + 1}</span>
                    <button
                      onClick={() => removeRow(row.id)}
                      className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                    >
                      Remove
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Layout</label>
                    <select
                      value={row.layout}
                      onChange={(e) => updateRow(row.id, 'layout', e.target.value)}
                      className="w-full border border-gray-600 bg-gray-700 text-white rounded-md px-2 py-1 text-sm"
                    >
                      <option value="text-left">Text Left - Image Right</option>
                      <option value="text-right">Text Right - Image Left</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={row.title || ''}
                      onChange={(e) => updateRow(row.id, 'title', e.target.value)}
                      placeholder="Section title (optional)"
                      className="w-full border border-gray-600 bg-gray-700 text-white rounded-md px-2 py-1 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Text</label>
                    <textarea
                      value={row.text.replace(/<br\s*\/?>/gi, '\n')}
                      onChange={(e) => {
                        const textWithBreaks = e.target.value.replace(/\n/g, '<br>');
                        updateRow(row.id, 'text', textWithBreaks);
                      }}
                      rows={4}
                      placeholder="Your text here..."
                      className="w-full border border-gray-600 bg-gray-700 text-white rounded-md px-2 py-1 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Image URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={row.imageUrl}
                        onChange={(e) => updateRow(row.id, 'imageUrl', e.target.value)}
                        placeholder="https://..."
                        className="flex-1 border border-gray-600 bg-gray-700 text-white rounded-md px-2 py-1 text-sm"
                      />
                      <MediaUrlPicker
                        onPick={(url: string) => updateRow(row.id, 'imageUrl', url)}
                        label="Browse"
                        mediaType="images"
                        size="sm"
                      />
                    </div>
                  </div>



                  {/* Text Background */}
                  <div className="space-y-2 p-3 border border-gray-600 bg-gray-750 rounded">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`textBg-${row.id}`}
                        checked={row.hasTextBackground || false}
                        onChange={(e) => updateRow(row.id, 'hasTextBackground', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label htmlFor={`textBg-${row.id}`} className="text-xs font-medium text-gray-300">
                        Add text container background
                      </label>
                    </div>

                    {row.hasTextBackground && (
                      <div className="space-y-2 pl-6">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Background Color</label>
                          <input
                            type="color"
                            value={row.textBackgroundColor || '#000000'}
                            onChange={(e) => updateRow(row.id, 'textBackgroundColor', e.target.value)}
                            className="w-full h-8 border border-gray-600 bg-gray-800 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Opacity: {row.textBackgroundOpacity ?? 15}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={row.textBackgroundOpacity ?? 15}
                            onChange={(e) => updateRow(row.id, 'textBackgroundOpacity', parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md space-y-4">
          <h4 className="text-sm font-medium text-gray-300">CTA (Call to Action)</h4>

          <div>
            <label className="flex items-center text-sm text-gray-300">
              <input
                type="checkbox"
                checked={columnTxtOptions.displayCTA || false}
                onChange={(e) => setColumnTxtOptions({ ...columnTxtOptions, displayCTA: e.target.checked })}
                className="form-checkbox text-indigo-500 bg-gray-800 border-gray-600 focus:ring-indigo-400 mr-2"
              />
              Display CTA
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Show the CTA (button or widget) after the game features content based on your general configuration
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md">
          <h4 className="font-medium text-gray-200 mb-3">Preview</h4>
          <div className="max-w-full overflow-hidden bg-gray-900 rounded" style={{ fontFamily: generalOptions.font.family, fontWeight: generalOptions.font.weight }}>
            {rows.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Add rows to see preview
              </div>
            ) : (
              <ColumnTxt
                rows={rows}
                background={columnTxtOptions.background}
                backgroundColor={columnTxtOptions.backgroundColor}
                textColor={columnTxtOptions.textColor}
                fontSize={columnTxtOptions.fontSize}
                imageWidth={columnTxtOptions.imageWidth}
                imageHeight={columnTxtOptions.imageHeight}
                gap={columnTxtOptions.gap}
                padding={columnTxtOptions.padding}
                display={true}
              >
                {columnTxtOptions.displayCTA && componentDisplay.button && (
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
                )}
                {columnTxtOptions.displayCTA && componentDisplay.widget && widgetOptions.enabled && widgetOptions.type === 'full' && (
                  <WidgetFull
                    gameId={widgetOptions.gameId}
                    utm={widgetOptions.utm as any}
                  />
                )}
                {columnTxtOptions.displayCTA && componentDisplay.widget && widgetOptions.enabled && widgetOptions.type === 'buy' && (
                  <SteamWidgetCropBuy
                    gameId={widgetOptions.gameId}
                    scale={1}
                    utm={widgetOptions.utm as any}
                  />
                )}
                {columnTxtOptions.displayCTA && componentDisplay.widget && widgetOptions.enabled && widgetOptions.type === 'install' && (
                  <SteamWidgetCropInstall
                    gameId={widgetOptions.gameId}
                    scale={1}
                    utm={widgetOptions.utm as any}
                  />
                )}
                {columnTxtOptions.displayCTA && componentDisplay.widget && widgetOptions.enabled && widgetOptions.type === 'wishlist' && (
                  <SteamWidgetCropWishlist
                    gameId={widgetOptions.gameId}
                    scale={1}
                    utm={widgetOptions.utm as any}
                  />
                )}
              </ColumnTxt>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnTxtSettings;
