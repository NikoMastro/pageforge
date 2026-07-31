import React from 'react';
import type { UrlTesterResult } from '../../../types/ui.types';

interface LhResultProps {
  data: UrlTesterResult;
}

const getScoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
  if (score >= 50) return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
  return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
};

const getScoreLabel = (score: number): string => {
  if (score >= 90) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  return 'Poor';
};

const formatMetric = (value: number, metric: string): string => {
  switch (metric) {
    case 'first-contentful-paint':
    case 'largest-contentful-paint':
    case 'speed-index':
      return `${(value / 1000).toFixed(2)}s`;
    case 'total-blocking-time':
      return `${value.toFixed(0)}ms`;
    case 'cumulative-layout-shift':
      return value.toFixed(3);
    default:
      return value.toString();
  }
};

const getMetricLabel = (metric: string): string => {
  const labels: Record<string, string> = {
    'first-contentful-paint': 'First Contentful Paint',
    'largest-contentful-paint': 'Largest Contentful Paint',
    'cumulative-layout-shift': 'Cumulative Layout Shift',
    'total-blocking-time': 'Total Blocking Time',
    'speed-index': 'Speed Index',
  };
  return labels[metric] || metric;
};

const LhResult: React.FC<LhResultProps> = ({ data }) => {
  const {
    lighthouse,
    buttonCount,
    iframes,
    gghst,
    xpixel,
    tiktokpixel,
    redditpixel,
    globalpixel,
    metapixel,
    googletag,
    redirect,
  } = data;

  const totalButtons = buttonCount ?? 0;
  const hasButtonInsights = totalButtons > 0;
  const hasIframeInsights = Boolean(iframes && iframes.total > 0);

  if (!lighthouse) {
    return null;
  }

  const { scores, audits } = lighthouse;

  return (
    <div className="space-y-6">
      {/* Page Analysis Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Page Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Buttons */}
          {hasButtonInsights && (
            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Buttons</div>
                <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                {totalButtons}
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {totalButtons === 1 ? 'button found' : 'buttons found'}
              </div>
            </div>
          )}

          {/* Iframes/Widgets */}
          {!hasButtonInsights && hasIframeInsights && iframes && (
            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Widgets</div>
                <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                {iframes.total}
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {iframes.visible} visible
              </div>
              {iframes.details?.length ? (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Details captured: {iframes.details.length}
                </div>
              ) : null}
            </div>
          )}

          {/* Gghst */}
          {gghst && (
            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Gghst</div>
                <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${gghst.found ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300'
                  }`}>
                  {gghst.found ? '✓ Found' : '✗ Not Found'}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                {gghst.scriptName && (
                  <div><span className="font-medium text-gray-600 dark:text-gray-300">Script:</span> {gghst.scriptName}</div>
                )}
                {typeof gghst.status === 'number' && (
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Status:</span> {gghst.status}
                    {gghst.ok === false && <span className="text-red-500 dark:text-red-400"> (Error)</span>}
                  </div>
                )}
                {gghst.url && (
                  <a
                    href={gghst.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-purple-600 dark:text-purple-300 hover:underline"
                  >
                    {gghst.url}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Redirect */}
          {redirect && (
            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Redirect</div>
                <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <div className="mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${redirect.occurred ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300'
                  }`}>
                  {redirect.occurred ? 'Redirected' : 'No Redirect'}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                {redirect.fromUrl && (
                  <a
                    href={redirect.fromUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate hover:underline"
                  >
                    <span className="font-medium text-gray-600 dark:text-gray-300">From:</span> {redirect.fromUrl}
                  </a>
                )}
                {redirect.toUrl && (
                  <a
                    href={redirect.toUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate hover:underline"
                  >
                    <span className="font-medium text-gray-600 dark:text-gray-300">To:</span> {redirect.toUrl}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pixels Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tracking Pixels</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* X Pixel */}
          {xpixel && (
            <div className={`rounded-lg border p-4 ${xpixel.found ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">X Pixel</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${xpixel.found ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}>
                    {xpixel.found ? 'Found' : 'Not Found'}
                  </span>
                </div>
              </div>
              {xpixel.found && xpixel.pixelId && (
                <div className="mt-2">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200">
                    {xpixel.pixelId}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TikTok Pixel */}
          {tiktokpixel && (
            <div className={`rounded-lg border p-4 ${tiktokpixel.found ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">TikTok Pixel</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${tiktokpixel.found ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}>
                    {tiktokpixel.found ? 'Found' : 'Not Found'}
                  </span>
                </div>
              </div>
              {tiktokpixel.pixels && tiktokpixel.pixels.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {tiktokpixel.pixels.map((pixel, index) => (
                    <span
                      key={pixel.pixelId || index}
                      className="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                    >
                      {pixel.pixelId}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Meta Pixel */}
          {metapixel && (
            <div className={`rounded-lg border p-4 ${metapixel.found ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">Meta Pixel</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${metapixel.found ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}>
                    {metapixel.found ? 'Found' : 'Not Found'}
                  </span>
                </div>
              </div>
              {metapixel.pixels && metapixel.pixels.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {metapixel.pixels.map((pixel, index) => (
                    <span
                      key={pixel.pixelId || index}
                      className="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                    >
                      {pixel.pixelId}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reddit Pixel */}
          {redditpixel && (
            <div className={`rounded-lg border p-4 ${redditpixel.found ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">Reddit Pixel</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${redditpixel.found ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}>
                    {redditpixel.found ? 'Found' : 'Not Found'}
                  </span>
                </div>
              </div>
              {redditpixel.pixels && redditpixel.pixels.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {redditpixel.pixels.map((pixel, index) => (
                    <span
                      key={pixel.pixelId || index}
                      className="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                    >
                      {pixel.pixelId}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Google Tag */}
          {googletag && (
            <div className={`rounded-lg border p-4 ${googletag.found ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">Google Tag</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${googletag.found ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}>
                    {googletag.found ? 'Found' : 'Not Found'}
                  </span>
                </div>
              </div>
              {googletag.tags && googletag.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {googletag.tags.map((tag, index) => (
                    <span
                      key={tag.tagId || index}
                      className="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                    >
                      {tag.tagId}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Global Pixel */}
          {globalpixel && (
            <div className={`rounded-lg border p-4 ${globalpixel.found ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">Global Pixel</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${globalpixel.found ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}>
                    {globalpixel.found ? 'Found' : 'Not Found'}
                  </span>
                </div>
              </div>
              {globalpixel.found && globalpixel.pixelId && (
                <div className="mt-2">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200">
                    {globalpixel.pixelId}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Iframes Details Section */}
      {iframes && iframes.details && iframes.details.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Iframe Details</h3>
          <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-600">
              {iframes.details.map((iframe, index) => (
                <div key={index} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {iframe.title || `Iframe ${index + 1}`}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${iframe.isVisible ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                        }`}>
                        {iframe.isVisible ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {iframe.width} × {iframe.height}
                    </div>
                  </div>
                  {iframe.src && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
                      <span className="font-medium">Source:</span> {iframe.src}
                    </div>
                  )}
                  {iframe.id && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium">ID:</span> {iframe.id}
                    </div>
                  )}
                  {iframe.name && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium">Name:</span> {iframe.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scores Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Lighthouse Scores</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(scores)
            .filter(([key]) => key !== 'pwa')
            .map(([key, value]) => {
              const scoreValue = Math.round(value as number);
              return (
                <div
                  key={key}
                  className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm"
                >
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 capitalize">
                    {key.replace('-', ' ')}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className={`text-3xl font-bold ${getScoreColor(scoreValue).split(' ')[0]}`}>
                      {scoreValue}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(scoreValue)}`}>
                      {getScoreLabel(scoreValue)}
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${scoreValue >= 90
                        ? 'bg-green-600 dark:bg-green-500'
                        : scoreValue >= 50
                          ? 'bg-orange-600 dark:bg-orange-500'
                          : 'bg-red-600 dark:bg-red-500'
                        }`}
                      style={{ width: `${scoreValue}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Audits Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Performance Metrics</h3>
        <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {Object.entries(audits).map(([key, value]) => (
              <div
                key={key}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {getMetricLabel(key)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {key}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {formatMetric(value as number, key)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LhResult;
