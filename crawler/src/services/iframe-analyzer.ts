/**
 * Iframe Analyzer Module
 * Handles detection and analysis of iframes on the page.
 */

import type { Page } from 'playwright-core';
import type { IframeAnalysis } from './types.js';

/**
 * Capture basic information about iframes on the page.
 * Detects widget properties, visibility, dimensions, and more.
 */
export async function analyzeIframes(page: Page): Promise<IframeAnalysis> {
  try {
    const analysis = await page.evaluate(() => {
      const frames = Array.from(document.querySelectorAll('iframe'));
      const details = frames.map((iframe) => {
        const rect = iframe.getBoundingClientRect();
        const style = window.getComputedStyle(iframe);
        const opacity = Number.parseFloat(style.opacity || '1');
        const withinViewport = rect.bottom >= 0 &&
          rect.right >= 0 &&
          rect.top <= window.innerHeight &&
          rect.left <= window.innerWidth;
        const isVisible = rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== 'hidden' &&
          style.display !== 'none' &&
          opacity > 0 &&
          withinViewport;

        // Extract widget props if this is a /widget iframe
        let widgetProps: any = null;
        const src = iframe.getAttribute('src') || '';

        if (src.includes('/widget')) {
          // Try to find widget configuration in various locations

          // 1. Check for data attributes on the iframe
          const dataConfig = iframe.getAttribute('data-config') || iframe.getAttribute('data-widget-config');
          if (dataConfig) {
            try {
              const config = JSON.parse(dataConfig);
              if (config.props) {
                widgetProps = {
                  gameId: config.props.gameId,
                  enabled: config.props.enabled,
                  type: config.props.type,
                  utm: config.props.utm ? {
                    source: config.props.utm.source,
                    campaign: config.props.utm.campaign,
                    medium: config.props.utm.medium,
                    content: config.props.utm.content,
                    term: config.props.utm.term,
                  } : undefined,
                };
              }
            } catch (e) {
              console.warn('Failed to parse widget config from data attribute:', e);
            }
          }

          // 2. Check window-level widget configurations
          if (!widgetProps && (window as any).__widgetConfigs) {
            try {
              const configs = (window as any).__widgetConfigs;
              // Try to match by iframe id, name, or index
              const iframeId = iframe.id || iframe.name;
              if (iframeId && configs[iframeId]) {
                const config = configs[iframeId];
                if (config.type === 'widget' && config.props) {
                  widgetProps = {
                    gameId: config.props.gameId,
                    enabled: config.props.enabled,
                    type: config.props.type,
                    utm: config.props.utm ? {
                      source: config.props.utm.source,
                      campaign: config.props.utm.campaign,
                      medium: config.props.utm.medium,
                      content: config.props.utm.content,
                      term: config.props.utm.term,
                    } : undefined,
                  };
                }
              }
            } catch (e) {
              console.warn('Failed to extract widget config from window:', e);
            }
          }

          // 3. Try to extract from URL parameters
          if (!widgetProps) {
            try {
              const url = new URL(src, window.location.href);
              const params = url.searchParams;
              if (params.has('gameId') || params.has('game_id')) {
                widgetProps = {
                  gameId: params.get('gameId') || params.get('game_id') || undefined,
                  enabled: params.has('enabled') ? params.get('enabled') === 'true' : undefined,
                  type: params.get('type') || undefined,
                  utm: {
                    source: params.get('utm_source') || params.get('utmSource') || undefined,
                    campaign: params.get('utm_campaign') || params.get('utmCampaign') || undefined,
                    medium: params.get('utm_medium') || params.get('utmMedium') || undefined,
                    content: params.get('utm_content') || params.get('utmContent') || undefined,
                    term: params.get('utm_term') || params.get('utmTerm') || undefined,
                  },
                };
                // Clean up empty utm object
                if (widgetProps.utm && !Object.values(widgetProps.utm).some(v => v)) {
                  widgetProps.utm = undefined;
                }
              }
            } catch (e) {
              console.warn('Failed to parse widget config from URL:', e);
            }
          }

          // 4. Look for widget config in script tags
          if (!widgetProps) {
            try {
              const scripts = Array.from(document.querySelectorAll('script[type="application/json"]'));
              for (const script of scripts) {
                try {
                  const data = JSON.parse(script.textContent || '');
                  if (data.type === 'widget' && data.props) {
                    widgetProps = {
                      gameId: data.props.gameId,
                      enabled: data.props.enabled,
                      type: data.props.type,
                      utm: data.props.utm ? {
                        source: data.props.utm.source,
                        campaign: data.props.utm.campaign,
                        medium: data.props.utm.medium,
                        content: data.props.utm.content,
                        term: data.props.utm.term,
                      } : undefined,
                    };
                    break;
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            } catch (e) {
              console.warn('Failed to extract widget config from scripts:', e);
            }
          }
        }

        return {
          id: iframe.id || null,
          name: iframe.name || null,
          src: iframe.getAttribute('src') || null,
          title: iframe.getAttribute('title') || null,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          isVisible,
          widgetProps: widgetProps || undefined,
        };
      });

      const visible = details.filter(detail => detail.isVisible).length;
      return {
        total: details.length,
        visible,
        details: details,
      };
    });

    return analysis;
  } catch (error) {
    console.warn('Error analyzing iframes:', error);
    return { total: 0, visible: 0, details: [] };
  }
}
