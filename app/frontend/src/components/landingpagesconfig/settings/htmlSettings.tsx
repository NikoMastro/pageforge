import React from 'react';
import { ArrowPathIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { HtmlGeneratorConfig } from '../../../types';
import { validatePfTagConfig, DETECTION_TYPE_MAP } from '../../../utils/pftagValidation';
import { useExperiments } from '../../../hooks/hooksLandingPages/useExperiments';
import { pixelBaseUrl, pixelPftagProduction, pixelPftagPreproduction } from '../../../config/config';
import { MediaUrlPicker } from '../../ui/library';
import { EmojiPicker } from '../../ui/emojiPicker';

interface HtmlSettingsProps {
  htmlConfig: HtmlGeneratorConfig;
  updateHtmlField: (field: keyof HtmlGeneratorConfig, value: string | boolean) => void;
  saved?: boolean;
}

const HtmlSettings: React.FC<HtmlSettingsProps> = ({ htmlConfig, updateHtmlField, saved }) => {
  const [showUrlTemplate, setShowUrlTemplate] = React.useState(false);
  const {
    experiments,
    loading: experimentsLoading,
    refresh: refreshExperiments
  } = useExperiments(200);

  const pixelMode = htmlConfig.pixelMode || 'none';
  const selectedPixelExperimentRaw = (htmlConfig as any).pixelExperimentName;
  const selectedPixelExperiment = typeof selectedPixelExperimentRaw === 'string'
    ? selectedPixelExperimentRaw.trim()
    : '';

  const pixelExperiments = React.useMemo(() => (
    experiments.filter(exp => exp.variantType === 'pixels')
  ), [experiments]);

  const experimentOptions = React.useMemo(() => {
    const base = pixelExperiments.map(exp => ({
      value: exp.experimentName,
      label: exp.experimentName
    }));

    if (selectedPixelExperiment && !base.some(option => option.value === selectedPixelExperiment)) {
      base.unshift({
        value: selectedPixelExperiment,
        label: `${selectedPixelExperiment} (not found)`
      });
    }

    return base;
  }, [pixelExperiments, selectedPixelExperiment]);

  const missingSelectedExperiment = Boolean(
    selectedPixelExperiment && !pixelExperiments.some(exp => exp.experimentName === selectedPixelExperiment)
  );

  // Validate pftag configuration
  const isPftagMode = pixelMode === 'pftag_prod' || pixelMode === 'pftag_preprod';
  const pftagValidationResult = isPftagMode ? validatePfTagConfig({
    detectionType: (htmlConfig as any).detectionType,
    mainUrl: (htmlConfig as any).mainUrl,
    fallbackUrl: (htmlConfig as any).fallbackUrl
  }) : true;

  // Get the pixel URL based on mode
  const getPixelUrl = (): string | null => {
    if (pixelMode === 'none') return null;

    switch (pixelMode) {
      case 'global':
        return `${pixelBaseUrl}/pixel_global.js`;
      case 'pftag_prod':
        return pixelPftagProduction;
      case 'pftag_preprod':
        return pixelPftagPreproduction;
      case 'custom':
        return htmlConfig.customPixelUrl || null;
      default:
        // Default/full mode uses pixel_twitter.js
        return `${pixelBaseUrl}/pixel_twitter.js`;
    }
  };

  const pixelUrl = getPixelUrl();

  return (
    <div className="pt-4">
      <p className="text-sm text-gray-400 mb-6">Configure the HTML settings. The HTML file will be generated automatically when you save the configuration.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300">Page Title</label>
          <input
            type="text"
            value={htmlConfig.title}
            onChange={e => updateHtmlField('title', e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Favicon</label>
          {/* Favicon type selector */}
          <div className="flex items-center gap-4 mt-1 mb-2">
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <input
                type="radio"
                name="faviconType"
                checked={!htmlConfig.faviconLink?.match(/^\p{Emoji}$/u)}
                onChange={() => updateHtmlField('faviconLink', '/favicon.ico')}
                className="text-indigo-500 focus:ring-indigo-500"
              />
              URL / Image
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <input
                type="radio"
                name="faviconType"
                checked={!!htmlConfig.faviconLink?.match(/^\p{Emoji}$/u)}
                onChange={() => updateHtmlField('faviconLink', '🚀')}
                className="text-indigo-500 focus:ring-indigo-500"
              />
              Emoji
            </label>
          </div>
          {/* Conditional input based on type */}
          {htmlConfig.faviconLink?.match(/^\p{Emoji}$/u) ? (
            <div className="flex items-center gap-3">
              <EmojiPicker
                value={htmlConfig.faviconLink}
                onChange={(emoji: string) => updateHtmlField('faviconLink', emoji || '🚀')}
                label="Choose Emoji"
                size="md"
              />
              <span className="text-3xl">{htmlConfig.faviconLink}</span>
            </div>
          ) : (
            <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
              <input
                type="text"
                value={htmlConfig.faviconLink}
                onChange={e => updateHtmlField('faviconLink', e.target.value)}
                className="w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <MediaUrlPicker label="Library" size="md" mediaType="images" onPick={(url) => updateHtmlField('faviconLink', url)} />
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Tagline</label>
          <input
            type="text"
            value={htmlConfig.tagline}
            onChange={e => updateHtmlField('tagline', e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Pixel Mode</label>
          <select
            value={htmlConfig.pixelMode || 'none'}
            onChange={e => updateHtmlField('pixelMode', e.target.value as any)}
            className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
        <div className="rounded-md bg-gray-900/50 border border-gray-700 p-3 mt-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pixelMode === 'custom' && (
          <div className="md:col-span-2 opacity-50 pointer-events-none">
            <label className="block text-sm font-medium text-gray-300">Pixel Experiment</label>
            <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={selectedPixelExperiment}
                onChange={e => updateHtmlField('pixelExperimentName', e.target.value)}
                disabled={true}
                className="w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-60"
              >
                <option value="">No experiment linked</option>
                {experimentOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => refreshExperiments()}
                disabled={true}
                className="inline-flex items-center justify-center gap-1 rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-200 transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ArrowPathIcon className={`h-4 w-4 ${experimentsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
            {experimentsLoading && (
              <p className="mt-1 text-xs text-gray-400">Loading pixel experiments…</p>
            )}
            {!experimentsLoading && pixelExperiments.length === 0 && (
              <p className="mt-1 text-xs text-gray-500">No pixel experiments found. Create one from the Experiments section.</p>
            )}
            {!experimentsLoading && pixelExperiments.length > 0 && (
              <p className="mt-1 text-xs text-gray-400">Link this configuration to a pixel experiment to keep settings in sync.</p>
            )}
            {missingSelectedExperiment && (
              <p className="mt-1 text-xs text-amber-400">Previously linked experiment "{selectedPixelExperiment}" is no longer available.</p>
            )}
          </div>
        )}
        {(htmlConfig.pixelMode || 'none') === 'global' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300">Detection Type</label>
              <select
                value={(htmlConfig as any).detectionType || ''}
                onChange={e => updateHtmlField('detectionType' as any, e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Classic - No Fallback</option>
                <option value="client_detection">Client detection</option>
                <option value="mobile_app_detection">Mobile app detection</option>
                <option value="ios_app_detection">iOS (app detection)</option>
                <option value="iframe_detection">Iframe detection</option>
              </select>
            </div>
            {(((htmlConfig as any).detectionType || '') !== 'iframe_detection') && (
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
                  value={(htmlConfig as any).mainUrl || ''}
                  onChange={e => updateHtmlField('mainUrl' as any, e.target.value)}
                  placeholder="https://... or custom://..."
                  required={(htmlConfig.pixelMode === 'global') && ((htmlConfig as any).detectionType !== 'iframe_detection')}
                  className={`mt-1 w-full rounded-md bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 border ${(htmlConfig.pixelMode === 'global') && ((htmlConfig as any).detectionType !== 'iframe_detection') && !((htmlConfig as any).mainUrl || '').trim() ? 'border-red-500' : 'border-gray-600'}`}
                />
                <p className="mt-1 text-xs text-gray-400">Required unless detection is "iframe_detection". For "client_detection" or "mobile_app_detection", a fallback is also required.</p>
              </div>
            )}
            {(((htmlConfig as any).detectionType || '') !== '') && (
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
                  value={(htmlConfig as any).fallbackUrl || ''}
                  onChange={e => updateHtmlField('fallbackUrl' as any, e.target.value)}
                  placeholder="https://..."
                  required={(htmlConfig.pixelMode === 'global') && (['mobile_app_detection', 'client_detection', 'ios_app_detection'].includes(((htmlConfig as any).detectionType)))}
                  className={`mt-1 w-full rounded-md bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 border ${(['mobile_app_detection', 'client_detection', 'ios_app_detection'].includes(((htmlConfig as any).detectionType))) && !((htmlConfig as any).fallbackUrl || '').trim() ? 'border-red-500' : 'border-gray-600'}`}
                />
                <p className="mt-1 text-xs text-gray-400">Required when detection is "mobile_app_detection", "client_detection" or "ios_app_detection"; otherwise optional.</p>
              </div>
            )}
          </div>
        )}
        {(htmlConfig.pixelMode || 'none') === 'custom' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300">Custom Pixel URL</label>
              <input
                type="url"
                value={htmlConfig.customPixelUrl || ''}
                onChange={e => updateHtmlField('customPixelUrl', e.target.value)}
                placeholder="https://example.com/pixel.js"
                className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-400">Paste the pixel script URL (JS). It will be inserted into the generated HTML.</p>
            </div>

            {/* Extras key/value pairs */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-300">Additional variables</label>
                <button
                  type="button"
                  onClick={() => {
                    const raw = (htmlConfig as any).customPixelVars || '[]';
                    let arr: Array<{ key: string; value: string }>;
                    try { const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw; arr = Array.isArray(parsed) ? parsed : []; } catch { arr = []; }
                    const next = [...arr, { key: '', value: '' }];
                    updateHtmlField('customPixelVars' as any, JSON.stringify(next));
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-600"
                  title="Add variable"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add
                </button>
              </div>

              {/* Rows */}
              <div className="mt-2 space-y-2">
                {(() => {
                  const raw = (htmlConfig as any).customPixelVars || '[]';
                  let rows: Array<{ key: string; value: string }> = [];
                  try {
                    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
                    rows = Array.isArray(parsed) ? parsed : [];
                  } catch { }
                  if (!rows.length) return <p className="text-xs text-gray-500">No variables added. Click “Add” to create one.</p>;
                  return rows.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        placeholder="key (e.g., user_id)"
                        value={row.key}
                        onChange={e => {
                          const next = [...rows]; next[idx] = { ...next[idx], key: e.target.value };
                          updateHtmlField('customPixelVars' as any, JSON.stringify(next));
                        }}
                        className="col-span-5 rounded-md border border-gray-600 bg-gray-800 px-3 py-1.5 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="value (e.g., 12345)"
                        value={row.value}
                        onChange={e => {
                          const next = [...rows]; next[idx] = { ...next[idx], value: e.target.value };
                          updateHtmlField('customPixelVars' as any, JSON.stringify(next));
                        }}
                        className="col-span-6 rounded-md border border-gray-600 bg-gray-800 px-3 py-1.5 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = rows.filter((_, i) => i !== idx);
                          updateHtmlField('customPixelVars' as any, JSON.stringify(next));
                        }}
                        className="col-span-1 inline-flex items-center justify-center rounded-md border border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-200 h-9"
                        title="Remove"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ));
                })()}
              </div>
              <p className="mt-1 text-xs text-gray-400">These variables will be exposed via a global object when the pixel loads (custom_pixel_extra).</p>
            </div>
          </div>
        )}
        {(htmlConfig.pixelMode === 'pftag_prod' || htmlConfig.pixelMode === 'pftag_preprod') && (
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Detection Type *</label>
                <select
                  value={(htmlConfig as any).detectionType || ''}
                  onChange={e => updateHtmlField('detectionType' as any, e.target.value)}
                  className={`mt-1 w-full rounded-md border bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${!pftagValidationResult ? 'border-red-500' : 'border-gray-600'
                    }`}
                >
                  <option value="">Select detection type</option>
                  <optgroup label="Desktop">
                    <option value="desktop">Desktop</option>
                    <option value="desktop_deep_link">Desktop Deep Link</option>
                    <option value="desktop_iframe">Desktop Iframe</option>
                  </optgroup>
                  <optgroup label="Android">
                    <option value="meta_android">Meta Android - ⚠️ Currently not supported</option>
                    <option value="applovin_android">AppLovin Android</option>
                    <option value="x_android">X Android</option>
                    <option value="reddit_android">Reddit Android</option>
                    <option value="tiktok_android">TikTok Android - ⚠️ Currently not supported</option>
                  </optgroup>
                  <optgroup label="iOS">
                    <option value="meta_ios">Meta iOS</option>
                    <option value="applovin_ios">AppLovin iOS</option>
                    <option value="x_ios">X iOS</option>
                    <option value="reddit_ios">Reddit iOS</option>
                    <option value="tiktok_ios">TikTok iOS - ⚠️ Currently not supported</option>
                  </optgroup>
                </select>
                <p className="mt-1 text-xs text-gray-400">
                  Required. Determines URL requirements below.
                </p>
              </div>
              {(() => {
                const detType = (htmlConfig as any).detectionType;
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
                      value={(htmlConfig as any).mainUrl || ''}
                      onChange={e => updateHtmlField('mainUrl' as any, e.target.value)}
                      placeholder={req[0] ? 'https://...' : 'custom://...'}
                      className={`mt-1 w-full rounded-md bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 border ${!pftagValidationResult && (htmlConfig as any).detectionType ? 'border-red-500' : 'border-gray-600'
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
              const detType = (htmlConfig as any).detectionType;
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
                    value={(htmlConfig as any).fallbackUrl || ''}
                    onChange={e => updateHtmlField('fallbackUrl' as any, e.target.value)}
                    placeholder="https://..."
                    className={`mt-1 w-full rounded-md bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 border ${!pftagValidationResult ? 'border-red-500' : 'border-gray-600'
                      }`}
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Required for this detection type. Must be a universal link (http:// or https://)
                  </p>
                </div>
              );
            })()}
            {!pftagValidationResult && (htmlConfig as any).detectionType && (
              <div className="rounded-md bg-red-900/20 border border-red-500 p-3">
                <p className="text-sm text-red-300">
                  ⚠️ Invalid configuration for detection type "{(htmlConfig as any).detectionType}". Please check the requirements above.
                </p>
              </div>
            )}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-300">Game ID {htmlConfig.pixelMode !== 'none' ? '*' : ''}</label>
          <input
            type="text"
            value={htmlConfig.gameId}
            onChange={e => updateHtmlField('gameId', e.target.value)}
            disabled={htmlConfig.pixelMode === 'none'}
            required={htmlConfig.pixelMode !== 'none'}
            className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Partner ID</label>
          <input
            type="text"
            value={htmlConfig.partnerId}
            onChange={e => updateHtmlField('partnerId', e.target.value)}
            disabled={htmlConfig.pixelMode === 'none'}
            className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
          />
        </div>
        <div className="flex items-center space-x-2 pt-2">
          <input
            id="isTest"
            type="checkbox"
            checked={htmlConfig.isTest ?? false}
            onChange={e => updateHtmlField('isTest', e.target.checked)}
            className="h-4 w-4 text-indigo-500 focus:ring-indigo-500 border-gray-600 rounded bg-gray-800"
          />
          <label htmlFor="isTest" className="text-sm text-gray-300">Test Mode</label>
        </div>
      </div>

      {saved && (
        <div className="mt-4 p-3 bg-green-800 border border-green-600 rounded-md">
          <p className="text-sm text-green-200">
            ✅ Configuration saved successfully with auto-generated HTML
          </p>
        </div>
      )}

      {/* URL Template Modal */}
      {showUrlTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowUrlTemplate(false)} />
          <div className="relative z-10 w-[min(720px,92vw)] max-h-[80vh] overflow-auto rounded-lg border border-gray-600 bg-gray-800 p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h4 className="text-base font-semibold text-gray-100">Examples of URLs</h4>
              <button
                type="button"
                onClick={() => setShowUrlTemplate(false)}
                className="text-sm px-2 py-1 rounded-md bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200"
              >
                Close
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-300">Don’t forget to add UTM when you can.</p>

            <div className="mt-4 space-y-4 text-sm">
              <section>
                <h5 className="font-medium text-gray-200">PC Client</h5>
                <ul className="mt-2 space-y-2">
                  <UrlExample text="steam://openurl/https://store.steampowered.com/app/2705130/?utm_source=az" note="opens Steam client" />
                  <UrlExample text="steam://install/2705130" note="install the game on Steam" />
                  <UrlExample text="com.epicgames.launcher://store/product/out-of-time-5a05f0" note="open Epic client" />
                </ul>
              </section>

              <section>
                <h5 className="font-medium text-gray-200">Web</h5>
                <ul className="mt-2 space-y-2">
                  <UrlExample text="https://store.epicgames.com/en-US/p/out-of-time-5a05f0" />
                  <UrlExample text="https://store.steampowered.com/app/480?utm_source=source" />
                </ul>
              </section>

              <section>
                <h5 className="font-medium text-gray-200">Mobile</h5>
                <ul className="mt-2 space-y-2">
                  <UrlExample text="steammobile://store?appid=3817060" note="open steam mobile app" />
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HtmlSettings;

// Small helper component to render a copyable URL row
const UrlExample: React.FC<{ text: string; note?: string }> = ({ text, note }) => {
  const [copied, setCopied] = React.useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch { }
  };
  return (
    <li className="flex items-center gap-2">
      <code className="flex-1 rounded bg-gray-900/60 px-2 py-1 text-gray-100 break-all border border-gray-700">{text}</code>
      {note && <span className="text-xs text-gray-400">({note})</span>}
      <button
        type="button"
        onClick={onCopy}
        className="text-xs px-2 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </li>
  );
};
