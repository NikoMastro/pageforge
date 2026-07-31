import React, { useEffect, useState } from 'react';
import type { GeneralOptions } from '../../../types/ui.types';
import { FONT_OPTIONS, normalizeGoogleFontInput } from '../../../config/app';

interface GeneralSettingsProps {
  generalOptions: GeneralOptions;
  setGeneralOptions: (options: GeneralOptions) => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  generalOptions,
  setGeneralOptions
}) => {
  const [customFontUrl, setCustomFontUrl] = useState('');
  const [customFontError, setCustomFontError] = useState('');
  const [isCustomFont, setIsCustomFont] = useState(false);

  // Function to load Google Fonts dynamically
  const loadGoogleFont = (fontFamily: string) => {
    const selectedFont = FONT_OPTIONS.find(font => font.value === fontFamily);
    if (selectedFont?.import) {
      const linkId = `font-${fontFamily.replace(/[^a-zA-Z0-9]/g, '-')}`;

      // Check if font is already loaded
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';

        // Handle local fonts vs Google Fonts
        if (selectedFont.import.startsWith('/')) {
          // Local font - use relative path
          link.href = selectedFont.import;
        } else {
          // Google font - use full URL
          link.href = selectedFont.import;
          link.crossOrigin = 'anonymous';

          // Preconnect to Google Fonts for better performance
          if (!document.querySelector('link[href="https://fonts.gstatic.com"]')) {
            const preconnect = document.createElement('link');
            preconnect.rel = 'preconnect';
            preconnect.href = 'https://fonts.gstatic.com';
            preconnect.crossOrigin = 'anonymous';
            document.head.appendChild(preconnect);
          }
        }

        document.head.appendChild(link);
      }
    }
  };

  // Load the current selected font (predefined list)
  useEffect(() => {
    loadGoogleFont(generalOptions.font.family);
  }, [generalOptions.font.family]);

  // If current font isn't in predefined options, consider it custom
  useEffect(() => {
    const isInPredefinedOptions = FONT_OPTIONS.some(font => font.value === generalOptions.font.family);
    if (!isInPredefinedOptions && generalOptions.font.family !== 'system-ui, -apple-system, sans-serif') {
      setIsCustomFont(true);
      // Restore the custom font URL if it exists
      if (generalOptions.font.customUrl) {
        setCustomFontUrl(generalOptions.font.customUrl);
      }
    } else {
      setIsCustomFont(false);
      setCustomFontUrl('');
    }
  }, [generalOptions.font.family, generalOptions.font.customUrl]);

  // Function to load custom Google Font from URL
  const loadCustomGoogleFont = (url: string) => {
    const linkId = `custom-font-${url.replace(/[^a-zA-Z0-9]/g, '-')}`;

    // Check if font is already loaded
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = url;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);

      // Preconnect to Google Fonts for better performance
      if (!document.querySelector('link[href="https://fonts.gstatic.com"]')) {
        const preconnect = document.createElement('link');
        preconnect.rel = 'preconnect';
        preconnect.href = 'https://fonts.gstatic.com';
        preconnect.crossOrigin = 'anonymous';
        document.head.appendChild(preconnect);
      }
    }
  };

  // Handle custom font URL or name input
  const handleCustomFontUrl = (url: string) => {
    setCustomFontUrl(url);
    setCustomFontError('');

    if (!url.trim()) {
      setIsCustomFont(false);
      // Clear custom URL when input is empty
      setGeneralOptions({
        ...generalOptions,
        font: { ...generalOptions.font, customUrl: undefined }
      });
      return;
    }

    // Accept Google Fonts CSS URL, specimen URL, or just a family name like "Barlow"
    const normalized = normalizeGoogleFontInput(url);
    if (!normalized) {
      setCustomFontError('Please enter a Google Fonts URL or a font name (e.g., Barlow)');
      return;
    }

    // Load the normalized CSS URL and set CSS font-family
    loadCustomGoogleFont(normalized.cssUrl);
    setIsCustomFont(true);
    setGeneralOptions({
      ...generalOptions,
      font: {
        ...generalOptions.font,
        family: normalized.cssValue,
        customUrl: url.trim() // Store original input for editing
      }
    });
  };

  return (
    <div className="pt-8">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">General Settings</h3>
      {/* Single column layout: preview goes under settings */}
      <div className="space-y-6">
        {/* Settings */}
        <div className="space-y-4">
          <div>
            <label htmlFor="globalFont" className="block text-sm font-medium text-gray-300">
              Global Font Family
            </label>
            <select
              id="globalFont"
              value={isCustomFont ? 'custom' : generalOptions.font.family}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  // Don't change the font family yet, wait for custom URL input
                  return;
                } else {
                  setIsCustomFont(false);
                  setCustomFontUrl('');
                  setCustomFontError('');
                  setGeneralOptions({
                    ...generalOptions,
                    font: {
                      ...generalOptions.font,
                      family: e.target.value,
                      customUrl: undefined // Clear custom URL when selecting predefined font
                    }
                  });
                }
              }}
              className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm bg-gray-700 text-gray-200"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
              <option value="custom">Custom Google Font (paste URL below)</option>
            </select>
            <p className="mt-1 text-xs text-gray-400">
              This will be the default font for all text elements on your page
            </p>
          </div>

          {/* Custom Google Font URL Input */}
          <div>
            <label htmlFor="customFontUrl" className="block text-sm font-medium text-gray-300">
              Custom Google Font (URL or Name)
            </label>
            <input
              id="customFontUrl"
              type="url"
              value={customFontUrl}
              onChange={(e) => handleCustomFontUrl(e.target.value)}
              placeholder="https://fonts.googleapis.com/css2?family=Barlow or fonts.google.com/specimen/Barlow or Barlow"
              className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm bg-gray-700 text-gray-200 placeholder-gray-400"
            />
            {customFontError && (
              <p className="mt-1 text-xs text-red-400">
                {customFontError}
              </p>
            )}
            {!customFontError && customFontUrl && (
              <p className="mt-1 text-xs text-green-400">
                ✓ Custom font loaded successfully
              </p>
            )}
            <p className="mt-1 text-xs text-gray-400">Paste a Google Fonts URL (css or specimen) or just type a font name. We’ll auto-load the correct CSS.</p>
          </div>

          <div>
            <label htmlFor="globalFontWeight" className="block text-sm font-medium text-gray-300">
              Global Font Weight
            </label>
            <select
              id="globalFontWeight"
              value={generalOptions.font.weight}
              onChange={(e) => setGeneralOptions({
                ...generalOptions,
                font: { ...generalOptions.font, weight: e.target.value }
              })}
              className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm bg-gray-700 text-gray-200"
            >
              <option value="300">300 - Light (Thin appearance)</option>
              <option value="400">400 - Normal (Standard text)</option>
              <option value="500">500 - Medium (Slightly heavier)</option>
              <option value="600">600 - Semi Bold (Noticeable weight)</option>
              <option value="700">700 - Bold (Strong emphasis)</option>
              <option value="800">800 - Extra Bold (Very heavy)</option>
            </select>
            <p className="mt-1 text-xs text-gray-400">
              Default weight for text elements (some system fonts may not support all weights)
            </p>
          </div>
        </div>

        {/* Preview under settings */}
        <div className="p-4 bg-gray-700 rounded-md">
          <label className="block text-sm font-medium text-gray-300 mb-2">Font Preview</label>

          {/* Current Selection Preview */}
          <div
            className="text-lg text-gray-200 transition-all duration-300 mb-4 p-3 bg-gray-600 rounded"
            style={{
              fontFamily: generalOptions.font.family,
              fontWeight: generalOptions.font.weight
            }}
          >
            <p className="mb-2 text-xl">Sample Heading Text</p>
            <p className="mb-2 text-base">This is your selected font in regular text.</p>
            <p className="text-sm text-gray-300">
              The quick brown fox jumps over the lazy dog. 1234567890
            </p>
          </div>

          {/* Font Weight Comparison */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-400 mb-2">Weight Comparison:</h4>
            <div className="space-y-1 text-base">
              {['400', '500', '600', '700', '800'].map((weight) => (
                <div
                  key={weight}
                  className={`p-2 rounded text-gray-200 transition-all duration-200 ${weight === generalOptions.font.weight ? 'bg-indigo-600 border-2 border-indigo-400' : 'bg-gray-800 hover:bg-gray-750'
                    }`}
                  style={{
                    fontFamily: generalOptions.font.family,
                    fontWeight: weight
                  }}
                >
                  <span className="text-xs text-gray-400 mr-2">{weight}:</span>
                  Sample Text ABC 123 - The Quick Brown Fox
                </div>
              ))}
            </div>
          </div>          {/* Font Info */}
          <div className="text-xs text-gray-500 space-y-1 border-t border-gray-600 pt-2">
            <p>Font: {isCustomFont ? 'Custom Google Font' : (FONT_OPTIONS.find(f => f.value === generalOptions.font.family)?.label || generalOptions.font.family)}</p>
            <p>CSS Value: {generalOptions.font.family}</p>
            <p>Selected Weight: {generalOptions.font.weight}</p>
            {generalOptions.font.customUrl && (
              <p>Custom URL: {generalOptions.font.customUrl}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
