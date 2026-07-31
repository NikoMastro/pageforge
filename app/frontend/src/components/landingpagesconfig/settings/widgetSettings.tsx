import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import type { WidgetOptions } from '../../../types/ui.types';
import ToggleSwitch from '../../ui/toggleSwitch';

// Import Steam Widget components from Flows
import {
  WidgetFull,
  SteamWidgetCropBuy,
  SteamWidgetCropInstall,
  SteamWidgetCropWishlist,
  type UtmParams as StaticUtmParams,
} from '@pageforge/static-websites';

// Conversion function from PageForge UTM format to Static Websites UTM format
const convertUtmParams = (pageforgeUtm: any): StaticUtmParams | undefined => {
  if (!pageforgeUtm) return undefined;
  return {
    utm_source: pageforgeUtm.source,
    utm_medium: pageforgeUtm.medium,
    utm_campaign: pageforgeUtm.campaign,
    utm_content: pageforgeUtm.content,
    utm_term: pageforgeUtm.term,
  };
};

interface WidgetInputsProps {
  onWidgetChange: (widgetData: WidgetOptions) => void;
  initialData?: WidgetOptions;
  className?: string;
}

const WidgetInputs: React.FC<WidgetInputsProps> = ({
  onWidgetChange,
  initialData,
  className = ''
}) => {
  const [widgetData, setWidgetData] = useState<WidgetOptions>({
    gameId: initialData?.gameId || '',
    width: initialData?.width || 646,
    height: initialData?.height || 190,
    enabled: initialData?.enabled ?? false,
    type: initialData?.type || 'full',
    scale: initialData?.scale || 1,
    language: initialData?.language, // Use provided language or undefined for auto-detection
    alignX: initialData?.alignX || 'center',
    alignY: initialData?.alignY || 'middle',
    positionX: initialData?.positionX ?? 0,
    positionY: initialData?.positionY ?? 0,
    addToNavbar: initialData?.addToNavbar || false,
    utm: initialData?.utm || {
      source: 'pageforge',
      campaign: '',
      medium: '',
      content: '',
      term: ''
    }
  });

  const [isValidGameId, setIsValidGameId] = useState<boolean>(true);
  // Stage container ref to compute percentage-based slider ranges
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageSize, setStageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Validate Steam Game ID (should be numeric)
  const validateGameId = (gameId: string): boolean => {
    return /^\d+$/.test(gameId) && gameId.length > 0;
  };

  const handleInputChange = (field: keyof WidgetOptions, value: string | number | boolean) => {
    const updatedData = { ...widgetData, [field]: value };

    if (field === 'gameId') {
      const isValid = validateGameId(value as string);
      setIsValidGameId(isValid);
    }

    setWidgetData(updatedData);
    onWidgetChange(updatedData);
  };

  const handleUtmChange = (utmField: keyof NonNullable<WidgetOptions['utm']>, value: string) => {
    const updatedData = {
      ...widgetData,
      utm: {
        ...widgetData.utm,
        [utmField]: value
      }
    };
    setWidgetData(updatedData);
    onWidgetChange(updatedData);
  };

  // Compute content min height and stage height consistently (used for preview and slider vertical range)
  const contentMinH = useMemo(() => {
    return widgetData.type === 'full' ? (widgetData.height || 190) : Math.round(34 * (widgetData.scale || 1));
  }, [widgetData.type, widgetData.height, widgetData.scale]);

  const stageHeight = useMemo(() => {
    // Give some headroom so translating doesn’t clip immediately; container is responsive width, fixed-ish height
    return Math.max(contentMinH + 160, 280);
  }, [contentMinH]);

  // Observe preview stage size to convert between % slider values and stored pixel offsets
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const update = () => setStageSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, [stageRef]);

  // Helpers to convert between px offsets and percentage of stage size
  const getPercentX = (px: number) => {
    // Use stage measured width when available; otherwise fall back to widget's configured width to avoid 0% until measured
    const refW = stageSize.width || widgetData.width || 646;
    if (!refW) return 0;
    return (px / refW) * 100;
  };
  const getPercentY = (py: number) => {
    // Use measured stage height when available; otherwise fall back to computed stageHeight
    const refH = stageSize.height || stageHeight || 0;
    if (!refH) return 0;
    return (py / refH) * 100;
  };

  const clampedPercentX = (() => {
    const pct = getPercentX(widgetData.positionX ?? 0);
    return Math.max(-50, Math.min(50, Math.round(pct)));
  })();

  const clampedPercentY = (() => {
    const pct = getPercentY(widgetData.positionY ?? 0);
    return Math.max(-30, Math.min(30, Math.round(pct)));
  })();

  useEffect(() => {
    if (initialData) {
      setWidgetData({
        ...initialData,
        enabled: initialData.enabled ?? false,
        type: initialData.type || 'full',
        scale: initialData.scale || 1,
        language: initialData.language, // Keep provided language or undefined
        alignX: initialData.alignX || 'center',
        alignY: initialData.alignY || 'middle',
        positionX: initialData.positionX ?? 0,
        positionY: initialData.positionY ?? 0,
        addToNavbar: initialData.addToNavbar || false,
        utm: initialData.utm || {
          source: 'pageforge',
          campaign: '',
          medium: '',
          content: '',
          term: ''
        }
      });
      setIsValidGameId(validateGameId(initialData.gameId));
    }
  }, [initialData]);

  return (
    <div className={`pt-8 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <DocumentTextIcon className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-200">Steam Widget Configuration</h3>
      </div>

      <div className="space-y-4">

        {/* Game ID Input */}
        <div>
          <label htmlFor="game-id" className="block text-sm font-medium text-gray-300 mb-1">
            Steam Game ID *
          </label>
          <input
            type="text"
            id="game-id"
            value={widgetData.gameId}
            onChange={(e) => handleInputChange('gameId', e.target.value)}
            placeholder="Ex: 544810"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-400 ${!isValidGameId && widgetData.gameId ? 'border-red-500' : 'border-gray-600'
              }`}
            disabled={!widgetData.enabled}
          />
          {!isValidGameId && widgetData.gameId && (
            <p className="mt-1 text-sm text-red-400">
              The game ID must contain only numbers
            </p>
          )}
          <p className="mt-1 text-xs text-gray-400">
            You can find the Steam ID in the URL of the game page on Steam
          </p>
        </div>

        {/* Widget Type Selection */}
        <div>
          <label htmlFor="widget-type" className="block text-sm font-medium text-gray-300 mb-1">
            Widget Type
          </label>
          <select
            id="widget-type"
            value={widgetData.type}
            onChange={(e) => handleInputChange('type', e.target.value as 'full' | 'buy' | 'install' | 'wishlist')}
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white border-gray-600"
            disabled={!widgetData.enabled}
          >
            <option value="full">Full Widget (646x190)</option>
            <option value="buy">Buy Button Only</option>
            <option value="install">Install Button Only</option>
            <option value="wishlist">Wishlist Button Only</option>
          </select>
          <p className="mt-1 text-xs text-gray-400">
            Cropped buttons extract only the specific button from the Steam widget.<br />
            <strong>Language automatically detected</strong> from the user's browser (no need to specify language).
          </p>
        </div>

        {/* Scale for Crop Widgets */}
        {widgetData.type !== 'full' && (
          <div>
            <label htmlFor="widget-scale" className="block text-sm font-medium text-gray-300 mb-1">
              Button Scale
            </label>
            <select
              id="widget-scale"
              value={widgetData.scale}
              onChange={(e) => handleInputChange('scale', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white border-gray-600"
              disabled={!widgetData.enabled}
            >
              <option value={0.5}>0.5x (Small)</option>
              <option value={0.75}>0.75x</option>
              <option value={1}>1x (Normal)</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x (Large)</option>
              <option value={2}>2x (Very Large)</option>
              <option value={3}>3x (Extra Large)</option>
              <option value={4}>4x (Maximum)</option>
            </select>
          </div>
        )}

        {/* Dimensions - only for full widget */}
        {widgetData.type === 'full' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="widget-width" className="block text-sm font-medium text-gray-300 mb-1">
                Width (px)
              </label>
              <input
                type="number"
                id="widget-width"
                value={widgetData.width}
                onChange={(e) => handleInputChange('width', parseInt(e.target.value) || 646)}
                min="300"
                max="1200"
                className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                disabled={!widgetData.enabled}
              />
            </div>
            <div>
              <label htmlFor="widget-height" className="block text-sm font-medium text-gray-300 mb-1">
                Height (px)
              </label>
              <input
                type="number"
                id="widget-height"
                value={widgetData.height}
                onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 190)}
                min="150"
                max="500"
                className="w-full px-3 py-2  rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                disabled={!widgetData.enabled}
              />
            </div>
          </div>
        )}

        {/* Fine-grained position sliders (X/Y offsets as percentages of preview area) */}
        {widgetData.enabled && (
          <div className="p-4 bg-gray-700 rounded-md border border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300">Widget Position</h4>
              {(() => {
                const isCentered = (widgetData.positionX ?? 0) === 0 && (widgetData.positionY ?? 0) === 0;
                return (
                  <button
                    type="button"
                    onClick={() => {
                      const updated: WidgetOptions = { ...widgetData, positionX: 0, positionY: 0 } as WidgetOptions;
                      setWidgetData(updated);
                      onWidgetChange(updated);
                    }}
                    disabled={isCentered}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${isCentered ? 'opacity-50 cursor-not-allowed border-gray-600 text-gray-400' : 'border-blue-500 text-blue-300 hover:bg-blue-600/10'}`}
                    aria-label="Reset widget position to center"
                  >
                    Reset to center
                  </button>
                );
              })()}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Horizontal (X) — up to ±50%</label>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  step={1}
                  value={clampedPercentX}
                  onChange={(e) => {
                    const pct = parseInt(e.target.value, 10) || 0;
                    const w = stageSize.width || widgetData.width || 646;
                    const nx = w ? Math.round((Math.max(-50, Math.min(50, pct)) / 100) * w) : 0;
                    const updated: WidgetOptions = { ...widgetData, positionX: nx } as WidgetOptions;
                    setWidgetData(updated);
                    onWidgetChange(updated);
                  }}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-300 mt-1">
                  <span>Left</span><span>{clampedPercentX}%</span><span>Right</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Vertical (Y) — up to ±30%</label>
                <input
                  type="range"
                  min={-30}
                  max={30}
                  step={1}
                  value={clampedPercentY}
                  onChange={(e) => {
                    const pct = parseInt(e.target.value, 10) || 0;
                    const h = stageSize.height || stageHeight || 0;
                    const ny = h ? Math.round((Math.max(-30, Math.min(30, pct)) / 100) * h) : 0;
                    const updated: WidgetOptions = { ...widgetData, positionY: ny } as WidgetOptions;
                    setWidgetData(updated);
                    onWidgetChange(updated);
                  }}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-300 mt-1">
                  <span>Up</span><span>{clampedPercentY}%</span><span>Down</span>
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-400">0% is centered. Negative X moves left, positive right. Negative Y moves up, positive down.</p>
          </div>
        )}

        {/* Shadow Effects Section */}
        {widgetData.enabled && (
          <div className="p-4 bg-gray-700 rounded-md border border-gray-600">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Shadow Effects</h4>
            <div className="space-y-4">
              {/* Shadow Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Widget Shadow</span>
                <ToggleSwitch
                  leftLabel="Off"
                  rightLabel="On"
                  leftValue="off"
                  rightValue="on"
                  value={(widgetData.shadowIntensity ?? 0) > 0 ? 'on' : 'off'}
                  onToggle={(val) => {
                    const intensity = val === 'on' ? 0.3 : 0;
                    const updated = { ...widgetData, shadowIntensity: intensity };
                    setWidgetData(updated);
                    onWidgetChange(updated);
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
                  value={widgetData.shadowIntensity ?? 0}
                  onChange={(e) => {
                    const intensity = parseFloat(e.target.value);
                    const updated = { ...widgetData, shadowIntensity: intensity };
                    setWidgetData(updated);
                    onWidgetChange(updated);
                  }}
                  disabled={(widgetData.shadowIntensity ?? 0) === 0}
                />
                <span className="col-span-1 text-right text-xs text-gray-300">
                  {Math.round(((widgetData.shadowIntensity ?? 0) * 100))}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* UTM Parameters Section */}
        <div className="p-4 bg-gray-700 rounded-md border border-gray-600">
          <h4 className="text-sm font-medium text-gray-300 mb-3">UTM Tracking Parameters</h4>
          <p className="text-xs text-gray-400 mb-4">
            Configure UTM parameters for tracking Steam widget clicks and conversions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="utm-source" className="block text-xs font-medium text-gray-300 mb-1">
                UTM Source
              </label>
              <input
                type="text"
                id="utm-source"
                value={widgetData.utm?.source || ''}
                onChange={(e) => handleUtmChange('source', e.target.value)}
                placeholder="pageforge (default)"
                className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white border border-gray-600 placeholder-gray-400 text-sm"
                disabled={!widgetData.enabled}
              />
            </div>

            <div>
              <label htmlFor="utm-campaign" className="block text-xs font-medium text-gray-300 mb-1">
                UTM Campaign
              </label>
              <input
                type="text"
                id="utm-campaign"
                value={widgetData.utm?.campaign || ''}
                onChange={(e) => handleUtmChange('campaign', e.target.value)}
                placeholder="e.g., summer_sale"
                className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white border border-gray-600 placeholder-gray-400 text-sm"
                disabled={!widgetData.enabled}
              />
            </div>

            <div>
              <label htmlFor="utm-medium" className="block text-xs font-medium text-gray-300 mb-1">
                UTM Medium
              </label>
              <input
                type="text"
                id="utm-medium"
                value={widgetData.utm?.medium || ''}
                onChange={(e) => handleUtmChange('medium', e.target.value)}
                placeholder="e.g., landing_page"
                className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white border border-gray-600 placeholder-gray-400 text-sm"
                disabled={!widgetData.enabled}
              />
            </div>

            <div>
              <label htmlFor="utm-content" className="block text-xs font-medium text-gray-300 mb-1">
                UTM Content
              </label>
              <input
                type="text"
                id="utm-content"
                value={widgetData.utm?.content || ''}
                onChange={(e) => handleUtmChange('content', e.target.value)}
                placeholder="e.g., header_widget"
                className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white border border-gray-600 placeholder-gray-400 text-sm"
                disabled={!widgetData.enabled}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="utm-term" className="block text-xs font-medium text-gray-300 mb-1">
                UTM Term
              </label>
              <input
                type="text"
                id="utm-term"
                value={widgetData.utm?.term || ''}
                onChange={(e) => handleUtmChange('term', e.target.value)}
                placeholder="e.g., gaming_keywords"
                className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white border border-gray-600 placeholder-gray-400 text-sm"
                disabled={!widgetData.enabled}
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        {widgetData.enabled && widgetData.gameId && isValidGameId && (
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-medium text-gray-300">Widget Preview:</h4>

            {/* Widget Preview inside a responsive stage (contained, overflow-hidden) */}
            {(() => {
              const px = widgetData.positionX ?? 0;
              const py = widgetData.positionY ?? 0;
              const justifyClass = widgetData.alignX === 'left' ? 'justify-start' : widgetData.alignX === 'right' ? 'justify-end' : 'justify-center';
              const itemsClass = widgetData.alignY === 'top' ? 'items-start' : 'items-center';
              return (
                <div className="rounded-md border border-gray-700 bg-gray-900 p-3">
                  <div ref={stageRef} className="relative w-full overflow-hidden rounded-md bg-gray-800" style={{ height: stageHeight }}>
                    {/* Stage content area fills container, widget is translated within this area */}
                    <div className={`h-full w-full flex ${justifyClass} ${itemsClass}`}>
                      <div style={{ transform: `translate(${px}px, ${py}px)` }} className="will-change-transform">
                        {widgetData.type === 'full' && (
                          <WidgetFull
                            gameId={widgetData.gameId}
                            width={widgetData.width}
                            height={widgetData.height}
                            className="steam-widget"
                            utm={convertUtmParams(widgetData.utm)}
                          />
                        )}
                        {widgetData.type === 'buy' && (
                          <SteamWidgetCropBuy
                            gameId={widgetData.gameId}
                            scale={widgetData.scale || 1}
                            className="steam-widget-crop"
                            utm={convertUtmParams(widgetData.utm)}
                          />
                        )}
                        {widgetData.type === 'install' && (
                          <SteamWidgetCropInstall
                            gameId={widgetData.gameId}
                            scale={widgetData.scale || 1}
                            className="steam-widget-crop"
                            utm={convertUtmParams(widgetData.utm)}
                          />
                        )}
                        {widgetData.type === 'wishlist' && (
                          <SteamWidgetCropWishlist
                            gameId={widgetData.gameId}
                            scale={widgetData.scale || 1}
                            className="steam-widget-crop"
                            utm={convertUtmParams(widgetData.utm)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Widget Info */}
            <div className="p-3 bg-gray-700 rounded-md">
              <p className="text-sm font-medium text-gray-300 mb-1">
                {widgetData.type === 'full' ? 'Full widget URL:' : `${widgetData.type} button URL:`}
              </p>
              {widgetData.type === 'full' ? (
                <div className="space-y-2">
                  <code className="text-xs text-blue-400 break-all block">
                    {(() => {
                      let url = `https://store.steampowered.com/widget/${widgetData.gameId}/`;
                      const params = new URLSearchParams();

                      const utmSource = widgetData.utm?.source || 'pageforge';
                      params.append('utm_source', utmSource);

                      if (widgetData.utm?.campaign) params.append('utm_campaign', widgetData.utm.campaign);
                      if (widgetData.utm?.medium) params.append('utm_medium', widgetData.utm.medium);
                      if (widgetData.utm?.content) params.append('utm_content', widgetData.utm.content);
                      if (widgetData.utm?.term) params.append('utm_term', widgetData.utm.term);

                      const paramString = params.toString();
                      if (paramString) url += `?${paramString}`;

                      return url;
                    })()}
                  </code>
                  {(widgetData.utm?.campaign || widgetData.utm?.medium || widgetData.utm?.content || widgetData.utm?.term) && (
                    <div className="text-xs text-green-400">
                      ✓ UTM tracking enabled
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-blue-400 space-y-1">
                  <div>Type: {widgetData.type}</div>
                  <div>Scale: {widgetData.scale}x</div>
                  <div>Game ID: {widgetData.gameId}</div>
                  <div className="mt-2">
                    <div className="text-gray-300">UTM Parameters:</div>
                    <div>Source: {widgetData.utm?.source || 'pageforge'}</div>
                    {widgetData.utm?.campaign && <div>Campaign: {widgetData.utm.campaign}</div>}
                    {widgetData.utm?.medium && <div>Medium: {widgetData.utm.medium}</div>}
                    {widgetData.utm?.content && <div>Content: {widgetData.utm.content}</div>}
                    {widgetData.utm?.term && <div>Term: {widgetData.utm.term}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WidgetInputs;
