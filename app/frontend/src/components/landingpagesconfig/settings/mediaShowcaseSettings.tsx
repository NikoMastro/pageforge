import React, { useState } from 'react';
import type { MediaShowcaseOptions, MediaShowcaseItem, ButtonOptions, WidgetOptions, ComponentDisplay, GeneralOptions } from '../../../types/ui.types';
import { MediaUrlPicker } from '../../ui/library';
import { MediaShowcase, Button, WidgetFull, SteamWidgetCropBuy, SteamWidgetCropInstall, SteamWidgetCropWishlist } from '@pageforge/static-websites';

interface MediaShowcaseSettingsProps {
  mediaShowcaseOptions: MediaShowcaseOptions;
  setMediaShowcaseOptions: (o: MediaShowcaseOptions) => void;
  buttonOptions: ButtonOptions;
  widgetOptions: WidgetOptions;
  componentDisplay: ComponentDisplay;
  generalOptions: GeneralOptions;
}

const MediaShowcaseSettings: React.FC<MediaShowcaseSettingsProps> = ({
  mediaShowcaseOptions,
  setMediaShowcaseOptions,
  buttonOptions,
  widgetOptions,
  componentDisplay,
  generalOptions
}) => {
  const { items = [], rows = 2, columns = 3 } = mediaShowcaseOptions;
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Get the selected item
  const selectedItem = items.find(i => i.id === selectedItemId);

  // Check if a cell is occupied
  const isCellOccupied = (row: number, col: number): MediaShowcaseItem | null => {
    return items.find(item =>
      row >= item.startRow &&
      row < item.startRow + item.rowSpan &&
      col >= item.startCol &&
      col < item.startCol + item.columnSpan
    ) || null;
  };

  // Add item at specific grid position
  const addItemAtPosition = (startRow: number, startCol: number) => {
    // Check if cell is already occupied
    if (isCellOccupied(startRow, startCol)) {
      return;
    }

    const newItem: MediaShowcaseItem = {
      id: `item-${Date.now()}`,
      url: '',
      type: 'image',
      alt: '',
      startRow,
      startCol,
      rowSpan: 1,
      columnSpan: 1,
    };
    setMediaShowcaseOptions({
      ...mediaShowcaseOptions,
      items: [...items, newItem]
    });
    setSelectedItemId(newItem.id!);
  };

  const removeItem = (id: string) => {
    setMediaShowcaseOptions({
      ...mediaShowcaseOptions,
      items: items.filter(i => i.id !== id)
    });
    if (selectedItemId === id) {
      setSelectedItemId(null);
    }
  };

  const updateItem = (id: string, field: keyof MediaShowcaseItem, value: any) => {
    setMediaShowcaseOptions({
      ...mediaShowcaseOptions,
      items: items.map(i => i.id === id ? { ...i, [field]: value } : i)
    });
  };

  return (
    <div className="pt-8">
      <h3 className="font-medium text-white mb-3">Media Showcase Settings</h3>
      <div className="space-y-6">
        {/* Grid Configuration */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md space-y-4">
          <h4 className="text-sm font-medium text-gray-300">Grid Configuration</h4>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Section Title</label>
            <input
              type="text"
              value={mediaShowcaseOptions.title || 'Media Showcase'}
              onChange={(e) => setMediaShowcaseOptions({
                ...mediaShowcaseOptions,
                title: e.target.value
              })}
              placeholder="Media Showcase"
              className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Rows</label>
              <input
                type="number"
                min="1"
                max="6"
                value={rows}
                onChange={(e) => setMediaShowcaseOptions({
                  ...mediaShowcaseOptions,
                  rows: parseInt(e.target.value) || 2
                })}
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Columns</label>
              <input
                type="number"
                min="1"
                max="6"
                value={columns}
                onChange={(e) => setMediaShowcaseOptions({
                  ...mediaShowcaseOptions,
                  columns: parseInt(e.target.value) || 3
                })}
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Cell Height</label>
              <input
                type="text"
                value={mediaShowcaseOptions.cellHeight}
                onChange={(e) => setMediaShowcaseOptions({
                  ...mediaShowcaseOptions,
                  cellHeight: e.target.value
                })}
                placeholder="300px"
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Gap (px)</label>
              <input
                type="number"
                min="0"
                value={mediaShowcaseOptions.gap}
                onChange={(e) => setMediaShowcaseOptions({
                  ...mediaShowcaseOptions,
                  gap: parseInt(e.target.value) || 10
                })}
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Padding</label>
              <input
                type="text"
                value={mediaShowcaseOptions.padding}
                onChange={(e) => setMediaShowcaseOptions({
                  ...mediaShowcaseOptions,
                  padding: e.target.value
                })}
                placeholder="0"
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Visual Grid Editor */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md space-y-4">
          <h4 className="text-sm font-medium text-gray-300">Grid Layout</h4>
          <p className="text-xs text-gray-400">Click on empty cells to add media. Click on existing items to select and edit them.</p>

          <div
            className="grid gap-2 bg-gray-900 p-4 rounded"
            style={{
              gridTemplateRows: `repeat(${rows}, 80px)`,
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
            }}
          >
            {Array.from({ length: rows }, (_, row) =>
              Array.from({ length: columns }, (_, col) => {
                const occupyingItem = isCellOccupied(row + 1, col + 1);

                // Si la cellule est occupée mais ce n'est pas le début de l'item, on la cache
                if (occupyingItem && (occupyingItem.startRow !== row + 1 || occupyingItem.startCol !== col + 1)) {
                  return null;
                }

                // Si c'est le début d'un item, afficher l'item
                if (occupyingItem) {
                  return (
                    <div
                      key={`${row}-${col}`}
                      className={`border-2 rounded cursor-pointer flex items-center justify-center text-xs font-medium relative ${selectedItemId === occupyingItem.id
                        ? 'border-indigo-500 bg-indigo-900/30'
                        : 'border-gray-600 bg-gray-800 hover:bg-gray-750'
                        }`}
                      style={{
                        gridRow: `${row + 1} / span ${occupyingItem.rowSpan}`,
                        gridColumn: `${col + 1} / span ${occupyingItem.columnSpan}`,
                      }}
                      onClick={() => setSelectedItemId(occupyingItem.id!)}
                    >
                      {occupyingItem.url ? (
                        <div className="w-full h-full overflow-hidden rounded">
                          {occupyingItem.type === 'video' ? (
                            <video
                              src={occupyingItem.url}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={occupyingItem.url}
                              alt={occupyingItem.alt || ''}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-400">
                          {occupyingItem.rowSpan}×{occupyingItem.columnSpan}<br />
                          No media
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(occupyingItem.id!);
                        }}
                        className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  );
                }

                // Cellule vide
                return (
                  <div
                    key={`${row}-${col}`}
                    className="border border-dashed border-gray-600 rounded cursor-pointer hover:bg-gray-800/50 flex items-center justify-center text-xs text-gray-500"
                    onClick={() => addItemAtPosition(row + 1, col + 1)}
                  >
                    +
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Item Editor */}
        {selectedItem && (
          <div className="p-4 border border-indigo-600 bg-indigo-900/20 rounded-md space-y-4">
            <h4 className="text-sm font-medium text-indigo-300">Edit Selected Media</h4>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Type</label>
              <select
                value={selectedItem.type}
                onChange={(e) => updateItem(selectedItem.id!, 'type', e.target.value)}
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Media URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={selectedItem.url}
                  onChange={(e) => updateItem(selectedItem.id!, 'url', e.target.value)}
                  placeholder="https://..."
                  className="flex-1 border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
                />
                <MediaUrlPicker
                  onPick={(url: string) => updateItem(selectedItem.id!, 'url', url)}
                  label="Browse"
                  mediaType={selectedItem.type === 'video' ? 'videos' : 'images'}
                  size="sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Alt Text</label>
              <input
                type="text"
                value={selectedItem.alt || ''}
                onChange={(e) => updateItem(selectedItem.id!, 'alt', e.target.value)}
                placeholder="Description of the media"
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Start Row</label>
                <input
                  type="number"
                  min="1"
                  max={rows}
                  value={selectedItem.startRow}
                  onChange={(e) => updateItem(selectedItem.id!, 'startRow', parseInt(e.target.value) || 1)}
                  className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Start Column</label>
                <input
                  type="number"
                  min="1"
                  max={columns}
                  value={selectedItem.startCol}
                  onChange={(e) => updateItem(selectedItem.id!, 'startCol', parseInt(e.target.value) || 1)}
                  className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Row Span</label>
                <input
                  type="number"
                  min="1"
                  max={rows - selectedItem.startRow + 1}
                  value={selectedItem.rowSpan}
                  onChange={(e) => updateItem(selectedItem.id!, 'rowSpan', parseInt(e.target.value) || 1)}
                  className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Column Span</label>
                <input
                  type="number"
                  min="1"
                  max={columns - selectedItem.startCol + 1}
                  value={selectedItem.columnSpan}
                  onChange={(e) => updateItem(selectedItem.id!, 'columnSpan', parseInt(e.target.value) || 1)}
                  className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
                />
              </div>
            </div>

            <button
              onClick={() => removeItem(selectedItem.id!)}
              className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Remove This Media
            </button>
          </div>
        )}

        {/* Background Settings */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md space-y-4">
          <h4 className="text-sm font-medium text-gray-300">Background Settings</h4>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Background Type</label>
            <select
              value={mediaShowcaseOptions.background?.type || 'solid'}
              onChange={(e) => {
                const type = e.target.value as 'solid' | 'gradient' | 'image';
                if (type === 'solid') {
                  setMediaShowcaseOptions({
                    ...mediaShowcaseOptions,
                    background: { type: 'solid', color: mediaShowcaseOptions.backgroundColor }
                  });
                } else if (type === 'gradient') {
                  setMediaShowcaseOptions({
                    ...mediaShowcaseOptions,
                    background: {
                      type: 'gradient',
                      gradient: {
                        type: 'linear',
                        colors: ['#000000', '#333333'],
                        direction: '180deg'
                      }
                    }
                  });
                } else if (type === 'image') {
                  setMediaShowcaseOptions({
                    ...mediaShowcaseOptions,
                    background: {
                      type: 'image',
                      image: {
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
            </select>
          </div>

          {/* Solid Color Background */}
          {mediaShowcaseOptions.background?.type === 'solid' && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Background Color</label>
              <input
                type="color"
                value={mediaShowcaseOptions.background.color || mediaShowcaseOptions.backgroundColor}
                onChange={(e) => setMediaShowcaseOptions({
                  ...mediaShowcaseOptions,
                  background: { ...mediaShowcaseOptions.background, type: 'solid', color: e.target.value }
                })}
                className="w-full h-10 border border-gray-600 bg-gray-800 rounded-md"
              />
            </div>
          )}

          {/* Gradient Background */}
          {mediaShowcaseOptions.background?.type === 'gradient' && mediaShowcaseOptions.background.gradient && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Gradient Type</label>
                <select
                  value={mediaShowcaseOptions.background.gradient.type}
                  onChange={(e) => setMediaShowcaseOptions({
                    ...mediaShowcaseOptions,
                    background: {
                      ...mediaShowcaseOptions.background!,
                      gradient: {
                        ...mediaShowcaseOptions.background!.gradient!,
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
                  value={mediaShowcaseOptions.background.gradient.colors[0] || '#000000'}
                  onChange={(e) => {
                    const newColors = [...mediaShowcaseOptions.background!.gradient!.colors];
                    newColors[0] = e.target.value;
                    setMediaShowcaseOptions({
                      ...mediaShowcaseOptions,
                      background: {
                        ...mediaShowcaseOptions.background!,
                        gradient: {
                          ...mediaShowcaseOptions.background!.gradient!,
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
                  value={mediaShowcaseOptions.background.gradient.colors[1] || '#333333'}
                  onChange={(e) => {
                    const newColors = [...mediaShowcaseOptions.background!.gradient!.colors];
                    newColors[1] = e.target.value;
                    setMediaShowcaseOptions({
                      ...mediaShowcaseOptions,
                      background: {
                        ...mediaShowcaseOptions.background!,
                        gradient: {
                          ...mediaShowcaseOptions.background!.gradient!,
                          colors: newColors
                        }
                      }
                    });
                  }}
                  className="w-full h-10 border border-gray-600 bg-gray-800 rounded-md"
                />
              </div>
              {mediaShowcaseOptions.background.gradient.type === 'linear' && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Direction (deg)</label>
                  <input
                    type="text"
                    value={mediaShowcaseOptions.background.gradient.direction || '180deg'}
                    onChange={(e) => setMediaShowcaseOptions({
                      ...mediaShowcaseOptions,
                      background: {
                        ...mediaShowcaseOptions.background!,
                        gradient: {
                          ...mediaShowcaseOptions.background!.gradient!,
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
          {mediaShowcaseOptions.background?.type === 'image' && mediaShowcaseOptions.background.image && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Background Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={mediaShowcaseOptions.background.image.url}
                    onChange={(e) => setMediaShowcaseOptions({
                      ...mediaShowcaseOptions,
                      background: {
                        ...mediaShowcaseOptions.background!,
                        image: {
                          ...mediaShowcaseOptions.background!.image!,
                          url: e.target.value
                        }
                      }
                    })}
                    placeholder="https://..."
                    className="flex-1 border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
                  />
                  <MediaUrlPicker
                    onPick={(url: string) => setMediaShowcaseOptions({
                      ...mediaShowcaseOptions,
                      background: {
                        ...mediaShowcaseOptions.background!,
                        image: {
                          ...mediaShowcaseOptions.background!.image!,
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
        </div>

        {/* CTA Section */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md space-y-4">
          <h4 className="text-sm font-medium text-gray-300">CTA (Call to Action)</h4>

          <div>
            <label className="flex items-center text-sm text-gray-300">
              <input
                type="checkbox"
                checked={mediaShowcaseOptions.displayCTA || false}
                onChange={(e) => setMediaShowcaseOptions({ ...mediaShowcaseOptions, displayCTA: e.target.checked })}
                className="form-checkbox text-indigo-500 bg-gray-800 border-gray-600 focus:ring-indigo-400 mr-2"
              />
              Display CTA
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Show the CTA (button or widget) after the media showcase content based on your general configuration
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md space-y-4">
          <h4 className="font-medium text-gray-200 mb-3">Preview</h4>
          <div className="max-w-full overflow-hidden bg-gray-900 rounded" style={{ fontFamily: generalOptions.font.family, fontWeight: generalOptions.font.weight }}>
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Click on grid cells above to add media items
              </div>
            ) : (
              <MediaShowcase
                items={items}
                title={mediaShowcaseOptions.title}
                background={mediaShowcaseOptions.background}
                rows={rows}
                columns={columns}
                gap={mediaShowcaseOptions.gap}
                backgroundColor={mediaShowcaseOptions.backgroundColor}
                padding={mediaShowcaseOptions.padding}
                cellHeight={mediaShowcaseOptions.cellHeight}
                display={true}
                noPadding={true}
              >
                {mediaShowcaseOptions.displayCTA && componentDisplay.button && (
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
                {mediaShowcaseOptions.displayCTA && componentDisplay.widget && widgetOptions.enabled && widgetOptions.type === 'full' && (
                  <WidgetFull
                    gameId={widgetOptions.gameId}
                    utm={widgetOptions.utm as any}
                  />
                )}
                {mediaShowcaseOptions.displayCTA && componentDisplay.widget && widgetOptions.enabled && widgetOptions.type === 'buy' && (
                  <SteamWidgetCropBuy
                    gameId={widgetOptions.gameId}
                    scale={1}
                    utm={widgetOptions.utm as any}
                  />
                )}
                {mediaShowcaseOptions.displayCTA && componentDisplay.widget && widgetOptions.enabled && widgetOptions.type === 'install' && (
                  <SteamWidgetCropInstall
                    gameId={widgetOptions.gameId}
                    scale={1}
                    utm={widgetOptions.utm as any}
                  />
                )}
                {mediaShowcaseOptions.displayCTA && componentDisplay.widget && widgetOptions.enabled && widgetOptions.type === 'wishlist' && (
                  <SteamWidgetCropWishlist
                    gameId={widgetOptions.gameId}
                    scale={1}
                    utm={widgetOptions.utm as any}
                  />
                )}
              </MediaShowcase>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaShowcaseSettings;
