import React from 'react';
import { validatePfTagConfig, DETECTION_TYPE_MAP } from '../../../utils/pftagValidation';
import { pixelBaseUrl, pixelPftagProduction, pixelPftagPreproduction } from '../../../config/config';

export interface LinkBioPixelSettingsValue {
  usePixelScript: boolean;
  pixelMode: 'none' | 'global' | 'custom' | 'pftag_prod' | 'pftag_preprod';
  gameId: string;
  partnerId: string;
  customPixelUrl: string;
  isTest: boolean;
  detectionType?: string;
  mainUrl?: string;
  fallbackUrl?: string;
  customPixelVars?: string;
}
export interface LinkBioPixelSettingsProps {
  value: LinkBioPixelSettingsValue;
  onChange: (patch: Partial<LinkBioPixelSettingsValue>) => void;
}

const PixelSettings: React.FC<LinkBioPixelSettingsProps> = ({ value, onChange }) => {
  const [showUrlTemplate, setShowUrlTemplate] = React.useState(false);

  // Validate pftag configuration
  const isPftagMode = value.pixelMode === 'pftag_prod' || value.pixelMode === 'pftag_preprod';
  const pftagValidationResult = isPftagMode ? validatePfTagConfig({
    detectionType: value.detectionType,
    mainUrl: value.mainUrl,
    fallbackUrl: value.fallbackUrl
  }) : true;

  // Get the pixel URL based on mode
  const getPixelUrl = (): string | null => {
    if (!value.usePixelScript || value.pixelMode === 'none') return null;

    switch (value.pixelMode) {
      case 'global':
        return `${pixelBaseUrl}/pixel_global.js`;
      case 'pftag_prod':
        return pixelPftagProduction;
      case 'pftag_preprod':
        return pixelPftagPreproduction;
      case 'custom':
        return value.customPixelUrl || null;
      default:
        // Default/full mode uses pixel_twitter.js
        return `${pixelBaseUrl}/pixel_twitter.js`;
    }
  };

  const pixelUrl = getPixelUrl();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-200">Pixel / Tracking</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 flex items-center space-x-2">
          <input
            id="usePixelScript"
            type="checkbox"
            checked={value.usePixelScript}
            onChange={e => onChange({ usePixelScript: e.target.checked })}
            className="h-4 w-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-800"
          />
          <label htmlFor="usePixelScript" className="text-sm font-medium text-gray-300">Enable Pixel</label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Mode</label>
          <select
            value={value.pixelMode}
            onChange={e => onChange({ pixelMode: e.target.value as any })}
            disabled={!value.usePixelScript}
            className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
          >
            <option value="none">None</option>
            <option value="global">Global</option>
            <option value="custom">Custom</option>
            <option value="pftag_prod">PfTag (Production)</option>
            <option value="pftag_preprod">PfTag (Pre-production)</option>
          </select>
        </div>
      </div>

      {/* Pixel URL Display */}
      {pixelUrl && (
        <div className="rounded-md bg-gray-900/50 border border-gray-700 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-400 mb-1">Pixel URL:</p>
              <code className="text-xs text-indigo-300 break-all">{pixelUrl}</code>
            </div>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(pixelUrl)}
              className="flex-shrink-0 px-2 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600"
              title="Copy to clipboard"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Game ID {value.pixelMode !== 'none' && value.usePixelScript ? '*' : ''}</label>
          {(() => {
            const mode: any = value.pixelMode; // allow comparison to 'none' without TS narrowing complaint
            const disabled = !value.usePixelScript || mode === 'none';
            return (
              <input
                type="text"
                value={value.gameId}
                onChange={e => onChange({ gameId: e.target.value })}
                disabled={disabled}
                className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
              />
            );
          })()}
        </div>
        {(value.pixelMode === 'global' || value.pixelMode === 'custom' || value.pixelMode === 'pftag_prod' || value.pixelMode === 'pftag_preprod') && (
          <div>
            <label className="block text-sm font-medium text-gray-300">Partner ID</label>
            {(() => {
              const mode: any = value.pixelMode;
              const disabled = !value.usePixelScript || mode === 'none';
              return (
                <input
                  type="text"
                  value={value.partnerId}
                  onChange={e => onChange({ partnerId: e.target.value })}
                  disabled={disabled}
                  className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                />
              );
            })()}
          </div>
        )}
        {value.pixelMode === 'global' && (
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Detection Type</label>
              <select
                value={value.detectionType || ''}
                onChange={e => onChange({ detectionType: e.target.value })}
                disabled={!value.usePixelScript}
                className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
              >
                <option value="">Classic - No Fallback</option>
                <option value="client_detection">Client detection</option>
                <option value="mobile_app_detection">Mobile app detection</option>
                <option value="ios_app_detection">iOS (app detection)</option>
                <option value="iframe_detection">Iframe detection</option>
              </select>
            </div>
            {(value.detectionType || '') !== 'iframe_detection' && (
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-300">Main URL</label>
                  <button
                    type="button"
                    onClick={() => setShowUrlTemplate(true)}
                    className="text-xs text-indigo-300 hover:text-indigo-200 underline"
                  >
                    ? template
                  </button>
                </div>
                <input
                  type="text"
                  value={value.mainUrl || ''}
                  onChange={e => onChange({ mainUrl: e.target.value })}
                  placeholder="https://... or custom://..."
                  disabled={!value.usePixelScript}
                  className={`mt-1 w-full rounded-md bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 border ${(!value.mainUrl || !value.mainUrl.trim()) ? 'border-gray-600' : 'border-gray-600'}`}
                />
                <p className="mt-1 text-xs text-gray-400">Required unless detection is "iframe_detection". For client/mobile/iOS detection, a fallback is also required.</p>
              </div>
            )}
            {(value.detectionType || '') !== '' && (
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-300">Fallback URL</label>
                  <button
                    type="button"
                    onClick={() => setShowUrlTemplate(true)}
                    className="text-xs text-indigo-300 hover:text-indigo-200 underline"
                  >
                    ? template
                  </button>
                </div>
                <input
                  type="text"
                  value={value.fallbackUrl || ''}
                  onChange={e => onChange({ fallbackUrl: e.target.value })}
                  placeholder="https://..."
                  disabled={!value.usePixelScript}
                  className={`mt-1 w-full rounded-md bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 border ${(['mobile_app_detection', 'client_detection', 'ios_app_detection'].includes(value.detectionType || '')) && !((value.fallbackUrl || '').trim()) ? 'border-red-500' : 'border-gray-600'}`}
                />
                <p className="mt-1 text-xs text-gray-400">Required when detection is mobile/client/iOS; otherwise optional.</p>
              </div>
            )}
          </div>
        )}
        {value.pixelMode === 'custom' && (
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-300">Custom Pixel URL</label>
              <input
                type="url"
                value={value.customPixelUrl}
                onChange={e => onChange({ customPixelUrl: e.target.value })}
                disabled={!value.usePixelScript}
                placeholder="https://example.com/pixel.js"
                className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
              />
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-300">Additional variables</label>
                <button
                  type="button"
                  onClick={() => {
                    const raw = value.customPixelVars || '[]';
                    let arr: Array<{ key: string; value: string }> = [];
                    try { const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw as any; arr = Array.isArray(parsed) ? parsed : []; } catch { }
                    const next = [...arr, { key: '', value: '' }];
                    onChange({ customPixelVars: JSON.stringify(next) });
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-600"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {(() => {
                  const raw = value.customPixelVars || '[]';
                  let rows: Array<{ key: string; value: string }> = [];
                  try { const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw as any; rows = Array.isArray(parsed) ? parsed : []; } catch { }
                  if (!rows.length) return <p className="text-xs text-gray-500">No variables added. Click “Add” to create one.</p>;
                  return rows.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        placeholder="key (e.g., user_id)"
                        value={row.key}
                        onChange={e => {
                          const next = [...rows]; next[idx] = { ...next[idx], key: e.target.value };
                          onChange({ customPixelVars: JSON.stringify(next) });
                        }}
                        className="col-span-5 rounded-md border border-gray-600 bg-gray-800 px-3 py-1.5 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="value (e.g., 12345)"
                        value={row.value}
                        onChange={e => {
                          const next = [...rows]; next[idx] = { ...next[idx], value: e.target.value };
                          onChange({ customPixelVars: JSON.stringify(next) });
                        }}
                        className="col-span-6 rounded-md border border-gray-600 bg-gray-800 px-3 py-1.5 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = rows.filter((_, i) => i !== idx);
                          onChange({ customPixelVars: JSON.stringify(next) });
                        }}
                        className="col-span-1 inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-200 h-9"
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  ));
                })()}
              </div>
              <p className="mt-1 text-xs text-gray-400">These variables will be exposed via a global object when the pixel loads (custom_pixel_extra).</p>
            </div>
          </div>
        )}
        {(value.pixelMode === 'pftag_prod' || value.pixelMode === 'pftag_preprod') && (
          <div className="md:col-span-3 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Detection Type *</label>
                <select
                  value={value.detectionType || ''}
                  onChange={e => onChange({ detectionType: e.target.value })}
                  disabled={!value.usePixelScript}
                  className={`mt-1 w-full rounded-md border bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 ${!pftagValidationResult ? 'border-red-500' : 'border-gray-600'
                    }`}
                >
                  <option value="">Select detection type</option>
                  <optgroup label="Desktop">
                    <option value="desktop">Desktop</option>
                    <option value="desktop_deep_link">Desktop Deep Link</option>
                    <option value="desktop_iframe">Desktop Iframe</option>
                  </optgroup>
                  <optgroup label="Android">
                    <option value="meta_android">Meta Android -  Currently not supported</option>
                    <option value="applovin_android">AppLovin Android</option>
                    <option value="x_android">X Android</option>
                    <option value="reddit_android">Reddit Android</option>
                    <option value="tiktok_android">TikTok Android -  Currently not supported</option>
                  </optgroup>
                  <optgroup label="iOS">
                    <option value="meta_ios">Meta iOS</option>
                    <option value="applovin_ios">AppLovin iOS</option>
                    <option value="x_ios">X iOS</option>
                    <option value="reddit_ios">Reddit iOS</option>
                    <option value="tiktok_ios">TikTok iOS -  Currently not supported</option>
                  </optgroup>
                </select>
                <p className="mt-1 text-xs text-gray-400">
                  Required. Determines URL requirements below.
                </p>
              </div>
              {(() => {
                const detType = value.detectionType;
                if (!detType) return null;
                const req = DETECTION_TYPE_MAP[detType];
                // Only show Main URL field if it's required for this detection type
                if (!req || !req[1]) return null;
                return (
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-300">
                        Main URL *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowUrlTemplate(true)}
                        className="text-xs text-indigo-300 hover:text-indigo-200 underline"
                      >
                        ? template
                      </button>
                    </div>
                    <input
                      type="text"
                      value={value.mainUrl || ''}
                      onChange={e => onChange({ mainUrl: e.target.value })}
                      placeholder={req[0] ? 'https://...' : 'custom://...'}
                      disabled={!value.usePixelScript}
                      className={`mt-1 w-full rounded-md bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 border ${!pftagValidationResult && value.detectionType ? 'border-red-500' : 'border-gray-600'
                        }`}
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      {req[0]
                        ? 'Required. Must be a universal link (http:// or https://)'
                        : 'Required. Must be a deep link (custom://)'}
                    </p>
                  </div>
                );
              })()}
            </div>
            {(() => {
              const detType = value.detectionType;
              if (!detType) return null;
              const req = DETECTION_TYPE_MAP[detType];
              if (!req || !req[2]) return null;
              return (
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-300">Fallback URL *</label>
                    <button
                      type="button"
                      onClick={() => setShowUrlTemplate(true)}
                      className="text-xs text-indigo-300 hover:text-indigo-200 underline"
                    >
                      ? template
                    </button>
                  </div>
                  <input
                    type="text"
                    value={value.fallbackUrl || ''}
                    onChange={e => onChange({ fallbackUrl: e.target.value })}
                    placeholder="https://..."
                    disabled={!value.usePixelScript}
                    className={`mt-1 w-full rounded-md bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 border ${!pftagValidationResult ? 'border-red-500' : 'border-gray-600'
                      }`}
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Required for this detection type. Must be a universal link (http:// or https://)
                  </p>
                </div>
              );
            })()}
            {!pftagValidationResult && value.detectionType && (
              <div className="rounded-md bg-red-900/20 border border-red-500 p-3">
                <p className="text-sm text-red-300">
                  ⚠️ Invalid configuration for detection type "{value.detectionType}". Please check the requirements above.
                </p>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center space-x-2">
          <input
            id="isTest"
            type="checkbox"
            checked={value.isTest}
            onChange={e => onChange({ isTest: e.target.checked })}
            disabled={!value.usePixelScript}
            className="h-4 w-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-800"
          />
          <label htmlFor="isTest" className="text-sm font-medium text-gray-300">Test Mode</label>
        </div>
      </div>
      {/* Optional URL Template helper (lightweight) */}
      {showUrlTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowUrlTemplate(false)} />
          <div className="relative z-10 w-[min(720px,92vw)] max-h-[80vh] overflow-auto rounded-lg border border-gray-600 bg-gray-800 p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h4 className="text-base font-semibold text-gray-100">Examples of URLs</h4>
              <button type="button" onClick={() => setShowUrlTemplate(false)} className="text-sm px-2 py-1 rounded-md bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200">Close</button>
            </div>
            <p className="mt-1 text-xs text-gray-300">Don’t forget to add UTM when you can.</p>
            <div className="mt-4 space-y-4 text-sm">
              <section>
                <h5 className="font-medium text-gray-200">PC Client</h5>
                <ul className="mt-2 space-y-2">
                  <li className="text-gray-300 text-xs">steam://openurl/https://store.steampowered.com/app/2705130/?utm_source=az</li>
                  <li className="text-gray-300 text-xs">steam://install/2705130</li>
                  <li className="text-gray-300 text-xs">com.epicgames.launcher://store/product/out-of-time-5a05f0</li>
                </ul>
              </section>
              <section>
                <h5 className="font-medium text-gray-200">Web</h5>
                <ul className="mt-2 space-y-2">
                  <li className="text-gray-300 text-xs">https://store.epicgames.com/en-US/p/out-of-time-5a05f0</li>
                  <li className="text-gray-300 text-xs">https://store.steampowered.com/app/480?utm_source=source</li>
                </ul>
              </section>
              <section>
                <h5 className="font-medium text-gray-200">Mobile</h5>
                <ul className="mt-2 space-y-2">
                  <li className="text-gray-300 text-xs">steammobile://store?appid=3817060</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PixelSettings;
