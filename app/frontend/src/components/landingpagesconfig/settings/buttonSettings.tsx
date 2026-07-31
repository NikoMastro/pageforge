import React, { useState } from 'react';
import { MediaUrlPicker } from '../../ui/library';
import type { ButtonOptions } from '../../../types/ui.types';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import ToggleSwitch from '../../ui/toggleSwitch';

interface ButtonSettingsProps {
  buttonOptions: ButtonOptions;
  setButtonOptions: (options: ButtonOptions) => void;
  paddingValues: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  setPaddingValues: (values: { top: number; right: number; bottom: number; left: number; }) => void;
  marginValues: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  setMarginValues: (values: { top: number; right: number; bottom: number; left: number; }) => void;
  borderRadiusValue: number;
  setBorderRadiusValue: (value: number) => void;
  updatePadding: (values: { top: number; right: number; bottom: number; left: number; }) => void;
  updateMargin: (values: { top: number; right: number; bottom: number; left: number; }) => void;
  updateBorderRadius: (value: number) => void;
}

const ButtonSettings: React.FC<ButtonSettingsProps> = ({
  buttonOptions,
  setButtonOptions,
  paddingValues,
  setPaddingValues,
  marginValues,
  borderRadiusValue,
  setBorderRadiusValue,
  updatePadding,
  updateMargin,
  updateBorderRadius
}) => {
  const [isBorderEffectsOpen, setIsBorderEffectsOpen] = useState(false); // collapsed by default
  const previewTransition = buttonOptions.transition || 'all 0.2s ease-in-out';
  return (
    <div className="pt-8">
      <h3 className="font-medium text-white mb-3">Button Settings</h3>
      <p className="text-sm text-gray-300 mb-4">Configure your standalone button component</p>

      {/* Quick Presets */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-200 mb-2">Quick Presets</label>
        <div className="flex flex-wrap gap-2">
          {/* Existing Presets */}
          <button
            type="button"
            onClick={() => {
              const newOptions: ButtonOptions = {
                ...buttonOptions,
                buttonText: 'PLAY NOW',
                buttonSize: 'big' as const,
                backgroundColor: '#1b2838',
                hoverBackgroundColor: '#2a475e',
                font: { ...buttonOptions.font, family: 'Arial, sans-serif', weight: '700', size: '24px' },
                padding: '20px 40px',
                border: { ...buttonOptions.border, radius: '8px' },
                shadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                hoverShadow: '0 8px 25px rgba(0, 0, 0, 0.25)',
                steamIcon: { ...buttonOptions.steamIcon, display: true },
                image: { ...buttonOptions.image, display: false }
              };
              setButtonOptions(newOptions);
              setPaddingValues({ top: 20, right: 40, bottom: 20, left: 40 });
              setBorderRadiusValue(8);
            }}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            Steam
          </button>
          {/* Removed Big CTA & Rounded presets per request */}

          {/* Platform Presets */}
          <button
            type="button"
            onClick={() => {
              const newOptions: ButtonOptions = {
                ...buttonOptions,
                buttonText: 'Wishlist on PlayStation',
                buttonSize: 'big' as const,
                backgroundColor: '#0070D1',
                hoverBackgroundColor: '#0059A8',
                font: { ...buttonOptions.font, family: 'Inter, sans-serif', weight: '600', size: '18px' },
                padding: '14px 32px',
                border: { ...buttonOptions.border, radius: '10px' },
                shadow: '0 4px 14px rgba(0, 112, 209, 0.25)',
                hoverShadow: '0 6px 20px rgba(0, 112, 209, 0.35)',
                steamIcon: { ...buttonOptions.steamIcon, display: false },
                image: { ...buttonOptions.image, display: true, src: 'https://imagedelivery.net/demo-media-account/38dd9098-48a8-4edc-d7b9-64b72f6fb600/public', width: 32, height: 32, position: 'left', alt: 'PlayStation' }
              };
              setButtonOptions(newOptions);
              setPaddingValues({ top: 14, right: 32, bottom: 14, left: 32 });
              setBorderRadiusValue(10);
            }}
            className="px-3 py-1 text-sm bg-blue-700/40 hover:bg-blue-600/60 text-white rounded-md transition-colors"
          >
            PlayStation
          </button>
          <button
            type="button"
            onClick={() => {
              const newOptions: ButtonOptions = {
                ...buttonOptions,
                buttonText: 'Wishlist on Nintendo',
                buttonSize: 'big' as const,
                backgroundColor: '#E60012',
                hoverBackgroundColor: '#C3000F',
                font: { ...buttonOptions.font, family: 'Inter, sans-serif', weight: '600', size: '18px' },
                padding: '0px 32px',
                border: { ...buttonOptions.border, radius: '10px' },
                shadow: '0 4px 14px rgba(230, 0, 18, 0.25)',
                hoverShadow: '0 6px 20px rgba(230, 0, 18, 0.35)',
                steamIcon: { ...buttonOptions.steamIcon, display: false },
                image: { ...buttonOptions.image, display: true, src: 'https://imagedelivery.net/demo-media-account/53c978a3-8d2b-4e2e-aa91-726fdc08a000/public', width: 64, height: 64, position: 'left', alt: 'Nintendo' }
              };
              setButtonOptions(newOptions);
              setPaddingValues({ top: 0, right: 20, bottom: 0, left: 20 });
              setBorderRadiusValue(10);
            }}
            className="px-3 py-1 text-sm bg-red-700/40 hover:bg-red-600/60 text-white rounded-md transition-colors"
          >
            Nintendo
          </button>
          <button
            type="button"
            onClick={() => {
              const newOptions: ButtonOptions = {
                ...buttonOptions,
                buttonText: 'Wishlist on Xbox',
                buttonSize: 'big' as const,
                backgroundColor: '#164116',
                hoverBackgroundColor: '#30CF30',
                font: { ...buttonOptions.font, family: 'Inter, sans-serif', weight: '600', size: '18px' },
                padding: '14px 32px',
                border: { ...buttonOptions.border, radius: '10px' },
                shadow: '0 4px 14px rgba(16, 124, 16, 0.25)',
                hoverShadow: '0 6px 20px rgba(16, 124, 16, 0.35)',
                steamIcon: { ...buttonOptions.steamIcon, display: false },
                image: { ...buttonOptions.image, display: true, src: 'https://imagedelivery.net/demo-media-account/1dd54846-ef75-46ae-82c4-c9888d2c4000/public', width: 32, height: 32, position: 'left', alt: 'Xbox' }
              };
              setButtonOptions(newOptions);
              setPaddingValues({ top: 14, right: 32, bottom: 14, left: 32 });
              setBorderRadiusValue(10);
            }}
            className="px-3 py-1 text-sm bg-green-700/40 hover:bg-green-600/60 text-white rounded-md transition-colors"
          >
            Xbox
          </button>
          <button
            type="button"
            onClick={() => {
              const newOptions: ButtonOptions = {
                ...buttonOptions,
                buttonText: 'View on Epic Games',
                buttonSize: 'big' as const,
                backgroundColor: '#2A2A2A',
                hoverBackgroundColor: '#3A3A3A',
                font: { ...buttonOptions.font, family: 'Inter, sans-serif', weight: '600', size: '18px' },
                padding: '14px 32px',
                border: { ...buttonOptions.border, radius: '10px' },
                shadow: '0 4px 14px rgba(0,0,0,0.35)',
                hoverShadow: '0 6px 20px rgba(0,0,0,0.5)',
                steamIcon: { ...buttonOptions.steamIcon, display: false },
                image: { ...buttonOptions.image, display: true, src: 'https://imagedelivery.net/demo-media-account/5fc87dab-0b9b-426e-9fbb-d9354b8c2e00/public', width: 28, height: 28, position: 'left', alt: 'Epic Games' }
              };
              setButtonOptions(newOptions);
              setPaddingValues({ top: 14, right: 32, bottom: 14, left: 32 });
              setBorderRadiusValue(10);
            }}
            className="px-3 py-1 text-sm bg-neutral-700/60 hover:bg-neutral-600/80 text-white rounded-md transition-colors"
          >
            Epic
          </button>
          <button
            type="button"
            onClick={() => {
              const newOptions: ButtonOptions = {
                ...buttonOptions,
                buttonText: 'Get it on Google Play',
                buttonSize: 'big' as const,
                backgroundColor: '#1A73E8',
                hoverBackgroundColor: '#1557B0',
                font: { ...buttonOptions.font, family: 'Inter, sans-serif', weight: '600', size: '18px' },
                padding: '14px 32px',
                border: { ...buttonOptions.border, radius: '10px' },
                shadow: '0 4px 14px rgba(26, 115, 232, 0.35)',
                hoverShadow: '0 6px 20px rgba(26, 115, 232, 0.45)',
                steamIcon: { ...buttonOptions.steamIcon, display: false },
                image: { ...buttonOptions.image, display: true, src: 'https://imagedelivery.net/demo-media-account/4df496e9-8cf7-4cac-bc86-f4db66548400/public', width: 40, height: 40, position: 'left', alt: 'Google Play' }
              };
              setButtonOptions(newOptions);
              setPaddingValues({ top: 14, right: 32, bottom: 14, left: 32 });
              setBorderRadiusValue(10);
            }}
            className="px-3 py-1 text-sm bg-sky-700/50 hover:bg-sky-600/70 text-white rounded-md transition-colors"
          >
            Google Play
          </button>
          <button
            type="button"
            onClick={() => {
              const newOptions: ButtonOptions = {
                ...buttonOptions,
                buttonText: 'Download on the App Store',
                buttonSize: 'big' as const,
                backgroundColor: '#000000',
                hoverBackgroundColor: '#333333',
                font: { ...buttonOptions.font, family: 'Inter, sans-serif', weight: '600', size: '18px' },
                padding: '14px 32px',
                border: { ...buttonOptions.border, radius: '14px' },
                shadow: '0 4px 14px rgba(0,0,0,0.35)',
                hoverShadow: '0 6px 20px rgba(0,0,0,0.5)',
                steamIcon: { ...buttonOptions.steamIcon, display: false },
                image: { ...buttonOptions.image, display: true, src: 'https://imagedelivery.net/demo-media-account/fb413120-0595-4538-d346-ac327039b700/public', width: 28, height: 28, position: 'right', alt: 'Apple App Store' }
              };
              setButtonOptions(newOptions);
              setPaddingValues({ top: 14, right: 32, bottom: 14, left: 32 });
              setBorderRadiusValue(14);
            }}
            className="px-3 py-1 text-sm bg-neutral-800 hover:bg-neutral-700 text-white rounded-md transition-colors"
          >
            Apple
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Settings */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md">
          <h4 className="font-medium text-gray-200 mb-4">Basic Settings</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-200">Button Text</label>
              <input
                type="text"
                value={buttonOptions.buttonText}
                onChange={(e) => setButtonOptions({ ...buttonOptions, buttonText: e.target.value })}
                className="mt-1 block w-full border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              {/* Steam Game ID and URL removed as they are no longer needed */}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200">Button Size</label>
              <select
                value={buttonOptions.buttonSize}
                onChange={(e) => setButtonOptions({ ...buttonOptions, buttonSize: e.target.value as 'small' | 'default' | 'big' })}
                className="mt-1 block w-full border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="small">Small</option>
                <option value="default">Default</option>
                <option value="big">Big</option>
              </select>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={buttonOptions.disabled}
                  onChange={(e) => setButtonOptions({ ...buttonOptions, disabled: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 bg-gray-700 rounded"
                />
                <label className="ml-2 block text-sm text-gray-200">Disabled</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={buttonOptions.fullWidth}
                  onChange={(e) => setButtonOptions({ ...buttonOptions, fullWidth: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 bg-gray-700 rounded"
                />
                <label className="ml-2 block text-sm text-gray-200">Full Width</label>
              </div>
            </div>
          </div>
        </div>

        {/* Typography & Colors */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md">
          <h4 className="font-medium text-gray-200 mb-4">Typography & Colors</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-200">Font Size</label>
              <input
                type="text"
                value={buttonOptions.font.size}
                onChange={(e) => setButtonOptions({ ...buttonOptions, font: { ...buttonOptions.font, size: e.target.value } })}
                className="mt-1 block w-full border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200">Font Weight</label>
              <select
                value={buttonOptions.font.weight}
                onChange={(e) => setButtonOptions({ ...buttonOptions, font: { ...buttonOptions.font, weight: e.target.value } })}
                className="mt-1 block w-full border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="300">300 (Light)</option>
                <option value="400">400 (Normal)</option>
                <option value="500">500 (Medium)</option>
                <option value="600">600 (Semi Bold)</option>
                <option value="700">700 (Bold)</option>
                <option value="800">800 (Extra Bold)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200">Background Color</label>
              <input
                type="color"
                value={buttonOptions.backgroundColor}
                onChange={(e) => setButtonOptions({ ...buttonOptions, backgroundColor: e.target.value })}
                className="mt-1 block w-full h-10 border border-gray-600 bg-gray-800 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200">Hover Background Color</label>
              <input
                type="color"
                value={buttonOptions.hoverBackgroundColor}
                onChange={(e) => setButtonOptions({ ...buttonOptions, hoverBackgroundColor: e.target.value })}
                className="mt-1 block w-full h-10 border border-gray-600 bg-gray-800 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200">Text Color</label>
              <input
                type="color"
                value={buttonOptions.font.color}
                onChange={(e) => setButtonOptions({ ...buttonOptions, font: { ...buttonOptions.font, color: e.target.value } })}
                className="mt-1 block w-full h-10 border border-gray-600 bg-gray-800 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200">Hover Text Color</label>
              <input
                type="color"
                value={buttonOptions.font.hoverColor}
                onChange={(e) => setButtonOptions({ ...buttonOptions, font: { ...buttonOptions.font, hoverColor: e.target.value } })}
                className="mt-1 block w-full h-10 border border-gray-600 bg-gray-800 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Icons & Images */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md">
          <h4 className="font-medium text-gray-200 mb-4">Icons & Images</h4>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={buttonOptions.steamIcon.display}
                onChange={(e) => setButtonOptions({ ...buttonOptions, steamIcon: { ...buttonOptions.steamIcon, display: e.target.checked } })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 bg-gray-700 rounded"
              />
              <label className="ml-2 block text-sm text-gray-200">Show Steam Icon</label>
            </div>
            {buttonOptions.steamIcon.display && (
              <div className="space-y-3 pl-6">
                <div>
                  <label className="block text-sm font-medium text-gray-200">Steam Icon Size</label>
                  <input
                    type="text"
                    value={buttonOptions.steamIcon.size}
                    onChange={(e) => setButtonOptions({ ...buttonOptions, steamIcon: { ...buttonOptions.steamIcon, size: e.target.value } })}
                    className="mt-1 block w-full border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Steam Icon Style</label>
                  <select
                    value={buttonOptions.steamIcon.variant}
                    onChange={(e) => {
                      const val = e.target.value as 'default' | 'black' | 'white' | 'gray';
                      // Map style presets to specific colors
                      const colorMap: Record<'black' | 'white' | 'gray', string> = {
                        black: '#000000',
                        white: '#ffffff',
                        gray: '#787878',
                      };
                      const newColor = (val === 'default') ? buttonOptions.steamIcon.color : colorMap[val as 'black' | 'white' | 'gray'];
                      setButtonOptions({
                        ...buttonOptions,
                        steamIcon: {
                          ...buttonOptions.steamIcon,
                          variant: val,
                          color: newColor || buttonOptions.steamIcon.color,
                        }
                      });
                    }}
                    className="mt-1 block w-full border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="default">Default</option>
                    <option value="black">Black</option>
                    <option value="white">White</option>
                    <option value="gray">Gray</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200">Steam Icon Color</label>
                    <input
                      type="color"
                      value={buttonOptions.steamIcon.color || '#ffffff'}
                      onChange={(e) => setButtonOptions({ ...buttonOptions, steamIcon: { ...buttonOptions.steamIcon, color: e.target.value } })}
                      className="mt-1 block w-full h-10 border border-gray-600 bg-gray-800 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-200">Steam Icon Hover Color</label>
                    <input
                      type="color"
                      value={buttonOptions.steamIcon.hoverColor || '#ffffff'}
                      onChange={(e) => setButtonOptions({ ...buttonOptions, steamIcon: { ...buttonOptions.steamIcon, hoverColor: e.target.value } })}
                      className="mt-1 block w-full h-10 border border-gray-600 bg-gray-800 rounded-md"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={buttonOptions.image.display}
                onChange={(e) => setButtonOptions({ ...buttonOptions, image: { ...buttonOptions.image, display: e.target.checked } })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 bg-gray-700 rounded"
              />
              <label className="ml-2 block text-sm text-gray-200">Show Custom Image</label>
            </div>
            {buttonOptions.image.display && (
              <div className="space-y-3 pl-6">
                <div>
                  <label className="block text-sm font-medium text-gray-200">Image URL</label>
                  <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                    <input
                      type="text"
                      value={buttonOptions.image.src}
                      onChange={(e) => setButtonOptions({ ...buttonOptions, image: { ...buttonOptions.image, src: e.target.value } })}
                      placeholder="https://example.com/image.png"
                      className="mt-1 block w-full border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <MediaUrlPicker label="Pick" size="sm" mediaType="images" onPick={(url) => setButtonOptions({ ...buttonOptions, image: { ...buttonOptions.image, src: url } })} />
                  </div>
                </div>

                {/* Image Preview */}
                {buttonOptions.image.src && (
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Image Preview</label>
                    <div className="border border-gray-600 rounded-md p-4 bg-gray-700">
                      <img
                        src={buttonOptions.image.src}
                        alt={buttonOptions.image.alt || "Preview"}
                        style={{
                          width: `${buttonOptions.image.width}px`,
                          height: `${buttonOptions.image.height}px`,
                          objectFit: 'contain'
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
                          if (errorDiv) errorDiv.style.display = 'block';
                        }}
                        onLoad={(e) => {
                          e.currentTarget.style.display = 'block';
                          const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
                          if (errorDiv) errorDiv.style.display = 'none';
                        }}
                      />
                      <div style={{ display: 'none' }} className="text-red-400 text-sm">
                        Failed to load image. Please check the URL.
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-200">Image Width</label>
                  <input
                    type="number"
                    value={buttonOptions.image.width}
                    onChange={(e) => setButtonOptions({ ...buttonOptions, image: { ...buttonOptions.image, width: parseInt(e.target.value) } })}
                    className="mt-1 block w-full border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Image Height</label>
                  <input
                    type="number"
                    value={buttonOptions.image.height}
                    onChange={(e) => setButtonOptions({ ...buttonOptions, image: { ...buttonOptions.image, height: parseInt(e.target.value) } })}
                    className="mt-1 block w-full border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200">Image Position</label>
                  <select
                    value={buttonOptions.image.position}
                    onChange={(e) => setButtonOptions({ ...buttonOptions, image: { ...buttonOptions.image, position: e.target.value as 'left' | 'right' } })}
                    className="mt-1 block w-full border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Border & Effects (collapsible) */}
        <div className="border border-gray-600 bg-gray-700 rounded-md">
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-3"
            onClick={() => setIsBorderEffectsOpen((o) => !o)}
            aria-expanded={isBorderEffectsOpen}
            aria-controls="border-effects-panel"
          >
            <span className="font-medium text-gray-200">Border & Effects</span>
            <ChevronDownIcon className={`h-5 w-5 text-gray-300 transition-transform ${isBorderEffectsOpen ? 'rotate-180' : ''}`} />
          </button>
          {isBorderEffectsOpen && (
            <div id="border-effects-panel" className="px-4 pb-4 pt-0 space-y-6 border-t border-gray-600">
              <div>
                <label className="block text-sm font-medium text-gray-200">Border Width</label>
                <input
                  type="text"
                  value={buttonOptions.border.width}
                  onChange={(e) => setButtonOptions({ ...buttonOptions, border: { ...buttonOptions.border, width: e.target.value } })}
                  className="mt-1 block w-full border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              {/* Border Radius Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Border Radius: {borderRadiusValue}px
                  </label>
                  <button
                    type="button"
                    onClick={() => updateBorderRadius(8)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Reset to Default
                  </button>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={borderRadiusValue}
                  onChange={(e) => updateBorderRadius(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(borderRadiusValue / 50) * 100}%, #4b5563 ${(borderRadiusValue / 50) * 100}%, #4b5563 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0px (Square)</span>
                  <span>25px</span>
                  <span>50px (Rounded)</span>
                </div>
              </div>

              {/* Padding Sliders */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-200">Padding</label>
                  <button
                    type="button"
                    onClick={() => updatePadding({ top: 8, right: 16, bottom: 8, left: 16 })}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Reset to Default
                  </button>
                </div>
                <div className="mb-3">
                  <div className="text-xs text-gray-400 mb-2">Visual representation:</div>
                  <div className="flex justify-center">
                    <div
                      className="bg-blue-100 border-2 border-blue-300 rounded-md flex items-center justify-center"
                      style={{
                        padding: `${paddingValues.top}px ${paddingValues.right}px ${paddingValues.bottom}px ${paddingValues.left}px`,
                        minWidth: '80px',
                        minHeight: '40px'
                      }}
                    >
                      <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Button
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Top: {paddingValues.top}px</label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={paddingValues.top}
                      onChange={(e) => updatePadding({ ...paddingValues, top: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(paddingValues.top / 50) * 100}%, #4b5563 ${(paddingValues.top / 50) * 100}%, #4b5563 100%)`
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Right: {paddingValues.right}px</label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={paddingValues.right}
                      onChange={(e) => updatePadding({ ...paddingValues, right: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(paddingValues.right / 50) * 100}%, #4b5563 ${(paddingValues.right / 50) * 100}%, #4b5563 100%)`
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Bottom: {paddingValues.bottom}px</label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={paddingValues.bottom}
                      onChange={(e) => updatePadding({ ...paddingValues, bottom: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(paddingValues.bottom / 50) * 100}%, #4b5563 ${(paddingValues.bottom / 50) * 100}%, #4b5563 100%)`
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Left: {paddingValues.left}px</label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={paddingValues.left}
                      onChange={(e) => updatePadding({ ...paddingValues, left: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(paddingValues.left / 50) * 100}%, #4b5563 ${(paddingValues.left / 50) * 100}%, #4b5563 100%)`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Margin Sliders */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-200">Margin</label>
                  <button
                    type="button"
                    onClick={() => updateMargin({ top: 0, right: 0, bottom: 0, left: 0 })}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Reset to Default
                  </button>
                </div>
                <div className="mb-3">
                  <div className="text-xs text-gray-400 mb-2">Visual representation:</div>
                  <div className="flex justify-center">
                    <div
                      className="bg-green-100 border-2 border-green-300 rounded-md flex items-center justify-center"
                      style={{
                        margin: `${marginValues.top}px ${marginValues.right}px ${marginValues.bottom}px ${marginValues.left}px`,
                        minWidth: '80px',
                        minHeight: '40px'
                      }}
                    >
                      <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Button
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Top: {marginValues.top}px</label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={marginValues.top}
                      onChange={(e) => updateMargin({ ...marginValues, top: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #10b981 0%, #10b981 ${(marginValues.top / 50) * 100}%, #4b5563 ${(marginValues.top / 50) * 100}%, #4b5563 100%)`
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Right: {marginValues.right}px</label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={marginValues.right}
                      onChange={(e) => updateMargin({ ...marginValues, right: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #10b981 0%, #10b981 ${(marginValues.right / 50) * 100}%, #4b5563 ${(marginValues.right / 50) * 100}%, #4b5563 100%)`
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Bottom: {marginValues.bottom}px</label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={marginValues.bottom}
                      onChange={(e) => updateMargin({ ...marginValues, bottom: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #10b981 0%, #10b981 ${(marginValues.bottom / 50) * 100}%, #4b5563 ${(marginValues.bottom / 50) * 100}%, #4b5563 100%)`
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Left: {marginValues.left}px</label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={marginValues.left}
                      onChange={(e) => updateMargin({ ...marginValues, left: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #10b981 0%, #10b981 ${(marginValues.left / 50) * 100}%, #4b5563 ${(marginValues.left / 50) * 100}%, #4b5563 100%)`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Shadow Effects */}
              <div>
                <h5 className="text-sm font-medium text-gray-300 mb-3">Shadow Effects</h5>
                <div className="space-y-4">
                  {/* Shadow Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400">Box Shadow</span>
                    <ToggleSwitch
                      leftLabel="Off"
                      rightLabel="On"
                      leftValue="off"
                      rightValue="on"
                      value={buttonOptions.shadow && buttonOptions.shadow !== 'none' ? 'on' : 'off'}
                      onToggle={(val) => {
                        if (val === 'on') {
                          const intensity = buttonOptions.shadowIntensity ?? 0.25;
                          setButtonOptions({
                            ...buttonOptions,
                            shadow: `0 4px 14px rgba(0,0,0,${intensity})`,
                            shadowIntensity: intensity
                          });
                        } else {
                          setButtonOptions({ ...buttonOptions, shadow: 'none' });
                        }
                      }}
                    />
                  </div>

                  {/* Shadow Intensity */}
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <label className="col-span-5 text-xs font-medium text-gray-400">Shadow Intensity</label>
                    <input
                      className="col-span-6 w-full"
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={buttonOptions.shadowIntensity ?? 0.25}
                      onChange={(e) => {
                        const intensity = parseFloat(e.target.value);
                        setButtonOptions({
                          ...buttonOptions,
                          shadowIntensity: intensity,
                          shadow: buttonOptions.shadow && buttonOptions.shadow !== 'none'
                            ? `0 4px 14px rgba(0,0,0,${intensity})`
                            : buttonOptions.shadow
                        });
                      }}
                      disabled={!buttonOptions.shadow || buttonOptions.shadow === 'none'}
                    />
                    <span className="col-span-1 text-right text-xs text-gray-300">
                      {Math.round(((buttonOptions.shadowIntensity ?? 0.25) * 100))}%
                    </span>
                  </div>

                  {/* Hover Shadow Intensity */}
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <label className="col-span-5 text-xs font-medium text-gray-400">Hover Shadow Intensity</label>
                    <input
                      className="col-span-6 w-full"
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={buttonOptions.hoverShadowIntensity ?? 0.35}
                      onChange={(e) => {
                        const intensity = parseFloat(e.target.value);
                        setButtonOptions({
                          ...buttonOptions,
                          hoverShadowIntensity: intensity,
                          hoverShadow: buttonOptions.shadow && buttonOptions.shadow !== 'none'
                            ? `0 6px 20px rgba(0,0,0,${intensity})`
                            : buttonOptions.hoverShadow
                        });
                      }}
                      disabled={!buttonOptions.shadow || buttonOptions.shadow === 'none'}
                    />
                    <span className="col-span-1 text-right text-xs text-gray-300">
                      {Math.round(((buttonOptions.hoverShadowIntensity ?? 0.35) * 100))}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Preview */}
        <div className="mt-6 p-4 bg-gray-700 rounded-md">
          <h4 className="font-medium text-gray-200 mb-3">Button Preview</h4>
          <div className="space-y-4">
            {/* Interactive Preview with Hover */}
            <div className="flex justify-center">
              <div
                className="cursor-pointer transition-all duration-200 select-none"
                style={{
                  fontFamily: buttonOptions.font.family,
                  fontSize: buttonOptions.font.size,
                  fontWeight: buttonOptions.font.weight,
                  color: buttonOptions.font.color,
                  backgroundColor: buttonOptions.backgroundColor,
                  border: `${buttonOptions.border.width} ${buttonOptions.border.style} ${buttonOptions.border.color}`,
                  borderRadius: buttonOptions.border.radius,
                  padding: buttonOptions.padding,
                  margin: buttonOptions.margin,
                  boxShadow: buttonOptions.shadow,
                  transition: previewTransition,
                  width: buttonOptions.fullWidth ? '100%' : buttonOptions.width,
                  height: buttonOptions.height,
                  opacity: buttonOptions.disabled ? 0.6 : 1,
                  textAlign: 'center' as const,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!buttonOptions.disabled) {
                    e.currentTarget.style.backgroundColor = buttonOptions.hoverBackgroundColor || buttonOptions.backgroundColor;
                    e.currentTarget.style.color = buttonOptions.font.hoverColor || buttonOptions.font.color;
                    e.currentTarget.style.borderColor = buttonOptions.border.hoverColor || buttonOptions.border.color || 'transparent';
                    e.currentTarget.style.boxShadow = buttonOptions.hoverShadow || buttonOptions.shadow || 'none';
                    const icon = e.currentTarget.querySelector('.steam-icon-image') as HTMLElement | null;
                    if (icon) icon.style.backgroundColor = buttonOptions.steamIcon.hoverColor || buttonOptions.steamIcon.color || '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!buttonOptions.disabled) {
                    e.currentTarget.style.backgroundColor = buttonOptions.backgroundColor;
                    e.currentTarget.style.color = buttonOptions.font.color;
                    e.currentTarget.style.borderColor = buttonOptions.border.color || 'transparent';
                    e.currentTarget.style.boxShadow = buttonOptions.shadow || 'none';
                    const icon = e.currentTarget.querySelector('.steam-icon-image') as HTMLElement | null;
                    if (icon) icon.style.backgroundColor = buttonOptions.steamIcon.color || '#ffffff';
                  }
                }}
              >
                {buttonOptions.steamIcon.display && (
                  <span
                    aria-label="Steam Icon"
                    style={{
                      width: buttonOptions.steamIcon.size || '20px',
                      height: buttonOptions.steamIcon.size || '20px',
                      WebkitMaskImage: `url(${buttonOptions.steamIcon.variant === 'black'
                        ? 'https://imagedelivery.net/demo-media-account/0b5a96d6-19b6-4d93-dbaf-72390ab96500/public'
                        : buttonOptions.steamIcon.variant === 'white'
                          ? 'https://imagedelivery.net/demo-media-account/4e799823-5f62-4c32-e7f4-778eb6143300/public'
                          : buttonOptions.steamIcon.variant === 'gray'
                            ? 'https://imagedelivery.net/demo-media-account/3d17b728-bf48-46b7-601c-9cfe12b17800/public'
                            : 'https://imagedelivery.net/demo-media-account/d01541ec-c5b8-4a45-7792-e9e28e3ccd00/public'})`,
                      maskImage: `url(${buttonOptions.steamIcon.variant === 'black'
                        ? 'https://imagedelivery.net/demo-media-account/0b5a96d6-19b6-4d93-dbaf-72390ab96500/public'
                        : buttonOptions.steamIcon.variant === 'white'
                          ? 'https://imagedelivery.net/demo-media-account/4e799823-5f62-4c32-e7f4-778eb6143300/public'
                          : buttonOptions.steamIcon.variant === 'gray'
                            ? 'https://imagedelivery.net/demo-media-account/3d17b728-bf48-46b7-601c-9cfe12b17800/public'
                            : 'https://imagedelivery.net/demo-media-account/d01541ec-c5b8-4a45-7792-e9e28e3ccd00/public'})`,
                      WebkitMaskRepeat: 'no-repeat',
                      maskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskPosition: 'center',
                      WebkitMaskSize: 'contain',
                      maskSize: 'contain',
                      backgroundColor: buttonOptions.steamIcon.color || '#ffffff',
                      transition: previewTransition,
                      display: 'inline-block',
                    }}
                    className="steam-icon-image"
                  />
                )}
                {buttonOptions.image.display && buttonOptions.image.position === 'left' && buttonOptions.image.src && (
                  <img
                    src={buttonOptions.image.src}
                    alt={buttonOptions.image.alt}
                    style={{
                      width: `${buttonOptions.image.width}px`,
                      height: `${buttonOptions.image.height}px`
                    }}
                  />
                )}
                <span
                  className="button-text"
                  style={{
                    color: 'inherit',
                    transition: previewTransition,
                  }}
                >
                  {buttonOptions.buttonText}
                </span>
                {buttonOptions.image.display && buttonOptions.image.position === 'right' && buttonOptions.image.src && (
                  <img
                    src={buttonOptions.image.src}
                    alt={buttonOptions.image.alt}
                    style={{
                      width: `${buttonOptions.image.width}px`,
                      height: `${buttonOptions.image.height}px`
                    }}
                  />
                )}
              </div>
            </div>

            <div className="text-center text-xs text-gray-400 italic">
              Hover over the button above to see the hover effect
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default ButtonSettings;
