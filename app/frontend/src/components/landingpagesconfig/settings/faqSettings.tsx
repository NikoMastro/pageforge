import React, { useState } from 'react';
import type { FaqOptions, FaqItem, GeneralOptions } from '../../../types/ui.types';
import { MediaUrlPicker } from '../../ui/library';
import { FaqSection } from '@pageforge/static-websites';

interface FaqSettingsProps {
  faqOptions: FaqOptions;
  setFaqOptions: (o: FaqOptions) => void;
  generalOptions: GeneralOptions;
}

const FaqSettings: React.FC<FaqSettingsProps> = ({
  faqOptions,
  setFaqOptions,
  generalOptions,
}) => {
  const { items = [] } = faqOptions;
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Get the selected item
  const selectedItem = items.find(i => i.id === selectedItemId);

  // Add new FAQ item
  const addFaqItem = () => {
    const newItem: FaqItem = {
      id: `faq-${Date.now()}`,
      question: '',
      answer: '',
    };
    setFaqOptions({
      ...faqOptions,
      items: [...items, newItem]
    });
    setSelectedItemId(newItem.id);
  };

  // Remove FAQ item
  const removeItem = (id: string) => {
    setFaqOptions({
      ...faqOptions,
      items: items.filter(i => i.id !== id)
    });
    if (selectedItemId === id) {
      setSelectedItemId(null);
    }
  };

  // Update FAQ item
  const updateItem = (id: string, field: keyof FaqItem, value: string) => {
    setFaqOptions({
      ...faqOptions,
      items: items.map(i => i.id === id ? { ...i, [field]: value } : i)
    });
  };

  // Move item up
  const moveItemUp = (id: string) => {
    const index = items.findIndex(i => i.id === id);
    if (index > 0) {
      const newItems = [...items];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      setFaqOptions({ ...faqOptions, items: newItems });
    }
  };

  // Move item down
  const moveItemDown = (id: string) => {
    const index = items.findIndex(i => i.id === id);
    if (index < items.length - 1) {
      const newItems = [...items];
      [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
      setFaqOptions({ ...faqOptions, items: newItems });
    }
  };

  return (
    <div className="pt-8">
      <h3 className="font-medium text-white mb-3">FAQ Settings</h3>
      <div className="space-y-6">
        {/* General Settings */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md space-y-4">
          <h4 className="text-sm font-medium text-gray-300">General Settings</h4>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Section Title</label>
            <input
              type="text"
              value={faqOptions.title || 'Frequently Asked Questions'}
              onChange={(e) => setFaqOptions({
                ...faqOptions,
                title: e.target.value
              })}
              placeholder="Frequently Asked Questions"
              className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Text Color</label>
              <input
                type="color"
                value={faqOptions.textColor}
                onChange={(e) => setFaqOptions({
                  ...faqOptions,
                  textColor: e.target.value
                })}
                className="w-full h-10 border border-gray-600 bg-gray-800 rounded-md"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Icon Color</label>
              <input
                type="color"
                value={faqOptions.iconColor}
                onChange={(e) => setFaqOptions({
                  ...faqOptions,
                  iconColor: e.target.value
                })}
                className="w-full h-10 border border-gray-600 bg-gray-800 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Separator Color</label>
            <input
              type="color"
              value={faqOptions.separatorColor}
              onChange={(e) => setFaqOptions({
                ...faqOptions,
                separatorColor: e.target.value
              })}
              className="w-full h-10 border border-gray-600 bg-gray-800 rounded-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Question Font Size</label>
              <input
                type="text"
                value={faqOptions.questionFontSize}
                onChange={(e) => setFaqOptions({
                  ...faqOptions,
                  questionFontSize: e.target.value
                })}
                placeholder="18px"
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Answer Font Size</label>
              <input
                type="text"
                value={faqOptions.answerFontSize}
                onChange={(e) => setFaqOptions({
                  ...faqOptions,
                  answerFontSize: e.target.value
                })}
                placeholder="16px"
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
              value={faqOptions.background?.type || 'solid'}
              onChange={(e) => {
                const type = e.target.value as 'solid' | 'gradient' | 'image' | 'video';
                if (type === 'solid') {
                  setFaqOptions({
                    ...faqOptions,
                    background: { type: 'solid', color: faqOptions.backgroundColor }
                  });
                } else if (type === 'gradient') {
                  setFaqOptions({
                    ...faqOptions,
                    background: {
                      type: 'gradient',
                      gradient: {
                        type: 'linear',
                        colors: ['#ffffff', '#f3f4f6'],
                        direction: '180deg'
                      }
                    }
                  });
                } else if (type === 'image') {
                  setFaqOptions({
                    ...faqOptions,
                    background: {
                      type: 'image',
                      image: {
                        url: '',
                        position: 'center'
                      }
                    }
                  });
                } else if (type === 'video') {
                  setFaqOptions({
                    ...faqOptions,
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
          {faqOptions.background?.type === 'solid' && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Background Color</label>
              <input
                type="color"
                value={faqOptions.background.color || faqOptions.backgroundColor}
                onChange={(e) => setFaqOptions({
                  ...faqOptions,
                  background: { ...faqOptions.background, type: 'solid', color: e.target.value }
                })}
                className="w-full h-10 border border-gray-600 bg-gray-800 rounded-md"
              />
            </div>
          )}

          {/* Gradient Background */}
          {faqOptions.background?.type === 'gradient' && faqOptions.background.gradient && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Gradient Type</label>
                <select
                  value={faqOptions.background.gradient.type}
                  onChange={(e) => setFaqOptions({
                    ...faqOptions,
                    background: {
                      ...faqOptions.background!,
                      gradient: {
                        ...faqOptions.background!.gradient!,
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
                  value={faqOptions.background.gradient.colors[0] || '#ffffff'}
                  onChange={(e) => {
                    const newColors = [...(faqOptions.background!.gradient!.colors || [])];
                    newColors[0] = e.target.value;
                    setFaqOptions({
                      ...faqOptions,
                      background: {
                        ...faqOptions.background!,
                        gradient: { ...faqOptions.background!.gradient!, colors: newColors }
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
                  value={faqOptions.background.gradient.colors[1] || '#f3f4f6'}
                  onChange={(e) => {
                    const newColors = [...(faqOptions.background!.gradient!.colors || ['#ffffff', '#f3f4f6'])];
                    newColors[1] = e.target.value;
                    setFaqOptions({
                      ...faqOptions,
                      background: {
                        ...faqOptions.background!,
                        gradient: { ...faqOptions.background!.gradient!, colors: newColors }
                      }
                    });
                  }}
                  className="w-full h-10 border border-gray-600 bg-gray-800 rounded-md"
                />
              </div>
              {faqOptions.background.gradient.type === 'linear' && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Direction (deg)</label>
                  <input
                    type="text"
                    value={faqOptions.background.gradient.direction || '180deg'}
                    onChange={(e) => setFaqOptions({
                      ...faqOptions,
                      background: {
                        ...faqOptions.background!,
                        gradient: { ...faqOptions.background!.gradient!, direction: e.target.value }
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
          {faqOptions.background?.type === 'image' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={faqOptions.background.image?.url || ''}
                    onChange={(e) => setFaqOptions({
                      ...faqOptions,
                      background: {
                        ...faqOptions.background!,
                        image: { ...(faqOptions.background!.image || {}), url: e.target.value }
                      }
                    })}
                    placeholder="https://..."
                    className="flex-1 border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
                  />
                  <MediaUrlPicker
                    onPick={(url: string) => setFaqOptions({
                      ...faqOptions,
                      background: {
                        ...faqOptions.background!,
                        image: { ...(faqOptions.background!.image || {}), url }
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
          {faqOptions.background?.type === 'video' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Video URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={faqOptions.background.video?.url || ''}
                    onChange={(e) => setFaqOptions({
                      ...faqOptions,
                      background: {
                        ...faqOptions.background!,
                        video: { ...(faqOptions.background!.video || {}), url: e.target.value }
                      }
                    })}
                    placeholder="https://..."
                    className="flex-1 border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
                  />
                  <MediaUrlPicker
                    onPick={(url: string) => setFaqOptions({
                      ...faqOptions,
                      background: {
                        ...faqOptions.background!,
                        video: { ...(faqOptions.background!.video || {}), url }
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

        {/* FAQ Items List */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-300">FAQ Items ({items.length})</h4>
            <button
              onClick={addFaqItem}
              className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
            >
              + Add Question
            </button>
          </div>

          {items.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No FAQ items yet. Click "Add Question" to create one.</p>
          ) : (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-3 border rounded cursor-pointer transition-colors ${selectedItemId === item.id
                    ? 'border-indigo-500 bg-indigo-900/30'
                    : 'border-gray-600 bg-gray-800 hover:bg-gray-750'
                    }`}
                  onClick={() => setSelectedItemId(item.id)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">
                        {item.question || `Question ${index + 1}`}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-1">
                        {item.answer || 'No answer provided'}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {index > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveItemUp(item.id);
                          }}
                          className="px-2 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                          title="Move up"
                        >
                          ↑
                        </button>
                      )}
                      {index < items.length - 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveItemDown(item.id);
                          }}
                          className="px-2 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                          title="Move down"
                        >
                          ↓
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item.id);
                        }}
                        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Item Editor */}
        {selectedItem && (
          <div className="p-4 border border-indigo-600 bg-indigo-900/20 rounded-md space-y-4">
            <h4 className="text-sm font-medium text-indigo-300">Edit FAQ Item</h4>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Question</label>
              <input
                type="text"
                value={selectedItem.question}
                onChange={(e) => updateItem(selectedItem.id, 'question', e.target.value)}
                placeholder="Enter your question here..."
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Answer</label>
              <textarea
                value={selectedItem.answer}
                onChange={(e) => updateItem(selectedItem.id, 'answer', e.target.value)}
                placeholder="Enter your answer here..."
                rows={4}
                className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-2 py-1 text-sm resize-vertical"
              />
            </div>

            <button
              onClick={() => removeItem(selectedItem.id)}
              className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Remove This FAQ Item
            </button>
          </div>
        )}

        {/* Preview */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md space-y-4">
          <h4 className="text-sm font-medium text-gray-300">Preview</h4>
          <div className="border border-gray-600 rounded-md overflow-hidden bg-white" style={{ fontFamily: generalOptions.font.family, fontWeight: generalOptions.font.weight }}>
            <FaqSection {...faqOptions} display={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqSettings;
