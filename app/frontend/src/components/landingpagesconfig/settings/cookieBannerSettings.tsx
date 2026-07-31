import React from 'react';
import type { CookieBannerOptions } from '../../../types';

export interface CookieBannerSettingsProps {
  enabled: boolean;
  onToggle: (v: boolean) => void;
  options: CookieBannerOptions;
  onChange: (opts: CookieBannerOptions) => void;
}

const CookieBannerSettings: React.FC<CookieBannerSettingsProps> = ({ enabled, onToggle, options, onChange }) => {
  // Helper function to convert hex color to rgba
  const hexToRgba = (hex: string, alpha: number): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return hex; // fallback if hex parsing fails
  };

  return (
    <div className="pt-8">
      <h3 className="font-medium text-white mb-3">Cookie Banner Settings</h3>

      <div className="space-y-6">
        {/* Enable/Disable Section */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">Enable Cookie Banner</label>
            <button
              type="button"
              onClick={() => onToggle(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${enabled ? 'bg-indigo-600' : 'bg-gray-600'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>
        </div>

        {enabled && (
          <>
            {/* Appearance Section */}
            <div className="p-4 border border-gray-600 bg-gray-700 rounded-md">
              <h4 className="font-medium text-white mb-4">Appearance</h4>
              <div className="space-y-4">
                {/* Background Color Row */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Background Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={options.backgroundColor}
                      onChange={(e) => onChange({ ...options, backgroundColor: e.target.value })}
                      className="h-10 w-16 p-1 bg-gray-800 border border-gray-600 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={options.backgroundColor}
                      onChange={(e) => onChange({ ...options, backgroundColor: e.target.value })}
                      className="flex-1 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
                      placeholder="#111827"
                    />
                  </div>
                </div>

                {/* Text Color Row */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Text Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={options.textColor}
                      onChange={(e) => onChange({ ...options, textColor: e.target.value })}
                      className="h-10 w-16 p-1 bg-gray-800 border border-gray-600 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={options.textColor}
                      onChange={(e) => onChange({ ...options, textColor: e.target.value })}
                      className="flex-1 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                {/* Background Opacity Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Background Opacity: {Math.round((options.backgroundOpacity || 0.95) * 100)}%
                    </label>
                    <button
                      type="button"
                      onClick={() => onChange({ ...options, backgroundOpacity: 0.95 })}
                      className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                    >
                      Reset to Default
                    </button>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={options.backgroundOpacity || 0.95}
                    onChange={(e) => onChange({ ...options, backgroundOpacity: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((options.backgroundOpacity || 0.95) * 100)}%, #4b5563 ${((options.backgroundOpacity || 0.95) * 100)}%, #4b5563 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0% (Transparent)</span>
                    <span>50%</span>
                    <span>100% (Opaque)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-4 border border-gray-600 bg-gray-700 rounded-md">
              <h4 className="font-medium text-white mb-4">Content</h4>
              <div className="space-y-4">
                <div>
                  <label htmlFor="cb-header" className="block text-sm font-medium text-gray-300 mb-2">
                    Header Text
                  </label>
                  <input
                    id="cb-header"
                    type="text"
                    value={options.headerText}
                    onChange={(e) => onChange({ ...options, headerText: e.target.value })}
                    className="block w-full border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
                    placeholder="This website uses cookies"
                  />
                </div>
                <div>
                  <label htmlFor="cb-body" className="block text-sm font-medium text-gray-300 mb-2">
                    Body Text
                  </label>
                  <textarea
                    id="cb-body"
                    rows={4}
                    value={options.bodyText}
                    onChange={(e) => onChange({ ...options, bodyText: e.target.value })}
                    className="block w-full border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
                    placeholder="We use cookies to enhance your browsing experience and analyze our traffic. By continuing to browse this site, you agree to our use of cookies."
                  />
                </div>
                <div>
                  <label htmlFor="cb-policy" className="block text-sm font-medium text-gray-300 mb-2">
                    Cookie Policy URL
                  </label>
                  <input
                    id="cb-policy"
                    type="url"
                    value={options.policyUrl}
                    onChange={(e) => onChange({ ...options, policyUrl: e.target.value })}
                    className="block w-full border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
                    placeholder="https://example.com/cookie-policy"
                  />
                </div>
              </div>
            </div>

            {/* Button Settings Section */}
            <div className="p-4 border border-gray-600 bg-gray-700 rounded-md">
              <h4 className="font-medium text-white mb-4">Button Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cb-accept" className="block text-sm font-medium text-gray-300 mb-2">
                    Accept Button Text <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="cb-accept"
                    type="text"
                    value={options.acceptText}
                    onChange={(e) => onChange({ ...options, acceptText: e.target.value })}
                    className="block w-full border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
                    placeholder="Accept All"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="cb-customize" className="block text-sm font-medium text-gray-300 mb-2">
                    Customize Button Text
                  </label>
                  <input
                    id="cb-customize"
                    type="text"
                    value={options.customizeText}
                    onChange={(e) => onChange({ ...options, customizeText: e.target.value })}
                    className="block w-full border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
                    placeholder="Customize"
                  />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">Show "Reject All" Button</label>
                  <button
                    type="button"
                    onClick={() => onChange({ ...options, showReject: !options.showReject })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${options.showReject ? 'bg-indigo-600' : 'bg-gray-600'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${options.showReject ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Preview Section */}
        {enabled && (
          <div className="p-4 border border-gray-600 bg-gray-700 rounded-md">
            <h4 className="font-medium text-white mb-4">Cookie Banner Preview</h4>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
              {/* Preview Container */}
              <div className="relative">
                {/* Simulated browser/page background */}
                <div className="bg-gray-500 rounded-t-md h-32 flex items-center justify-center text-gray-300 text-sm">
                  Your Landing Page Content
                </div>

                {/* Cookie Banner Preview */}
                <div className="relative">
                  <div
                    className="rounded-t-lg shadow-xl overflow-hidden"
                    style={{
                      backgroundColor: hexToRgba(options.backgroundColor, options.backgroundOpacity || 0.95),
                      color: options.textColor
                    }}
                  >
                    {/* Compact bar */}
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1">
                        <div className="font-semibold text-base">
                          {options.headerText || 'This website uses cookies'}
                        </div>
                        <p className="text-sm opacity-90 mt-1">
                          {options.bodyText || 'We use cookies and other technologies to improve your experience. By clicking "Accept All" you agree to our use of cookies.'}
                          {options.policyUrl && (
                            <span>
                              {' '}
                              <span className="underline opacity-100">Cookie Policy</span>
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        {options.showReject && (
                          <button
                            type="button"
                            className="px-3 py-2 rounded-md text-xs sm:text-sm border border-white/30 hover:bg-white/10 transition"
                            style={{ borderColor: `${options.textColor}30` }}
                          >
                            Reject All
                          </button>
                        )}
                        <button
                          type="button"
                          className="px-3 py-2 rounded-md text-xs sm:text-sm bg-white text-black font-medium hover:opacity-90 transition"
                        >
                          {options.acceptText || 'Accept All'}
                        </button>
                        <button
                          type="button"
                          className="px-3 py-2 rounded-md text-xs sm:text-sm border border-white/30 hover:bg-white/10 transition"
                          style={{ borderColor: `${options.textColor}30` }}
                        >
                          {options.customizeText || 'Customize'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center text-xs text-gray-400 italic mt-3">
                This is how your cookie banner will appear at the bottom of your landing page
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieBannerSettings;
