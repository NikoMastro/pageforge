/**
 * CDP NETWORK INTERCEPTOR
 *
 * Sets up Chrome DevTools Protocol (CDP) network monitoring to intercept
 * and capture pixel tracking requests from various analytics platforms.
 *
 * Supports:
 * - TikTok Pixel (analytics.tiktok.com)
 * - X Pixel / Twitter (ads-twitter.com, twitter.com/adsct)
 * - Reddit Pixel (redditstatic.com, alb.reddit.com)
 * - Global Pixel (pixel_global.js)
 * - Meta Pixel / Facebook (facebook.com/tr, fbevents.js)
 * - Google Tag Manager (googletagmanager.com)
 */

import type { Page } from 'playwright-core';

export interface NetworkInterceptorResult {
  tiktokPixelIds: Set<string>;
  xPixelIds: Set<string>;
  redditPixelIds: Set<string>;
  metaPixelIds: Set<string>;
  googleTagIds: Set<string>;
  globalPixelUrl: string | null;
  globalPixelId: string | null;
}

/**
 * Set up CDP network interception to capture pixel tracking requests
 * and extract pixel IDs from network traffic.
 */
export async function setupNetworkInterception(
  page: Page
): Promise<NetworkInterceptorResult> {
  const tiktokPixelIds = new Set<string>();
  const xPixelIds = new Set<string>();
  const redditPixelIds = new Set<string>();
  const metaPixelIds = new Set<string>();
  const googleTagIds = new Set<string>();
  let globalPixelUrl: string | null = null;
  let globalPixelId: string | null = null;

  try {
    console.log('Setting up CDP network interception for TikTok, X, Reddit, Global, Meta pixels, and Google Tag Manager...');

    const client = await page.context().newCDPSession(page);
    await client.send('Network.enable');

    client.on('Network.requestWillBeSent', (params: any) => {
      try {
        const url = params.request?.url || '';

        // TikTok pixel detection
        if (/tiktok\.com/i.test(url) && (/(pixel|events|track|api\/v2)/i.test(url))) {
          console.log(`[CDP Request] TikTok request detected: ${url.substring(0, 70)}`);

          // Extract pixel ID from SDK URL (e.g., ?sdkid=D2NE1ORC77U6K3O88MNG)
          try {
            const urlObj = new URL(url);
            const sdkid = urlObj.searchParams.get('sdkid');
            if (sdkid && /^[A-Z0-9]{15,25}$/.test(sdkid)) {
              if (!tiktokPixelIds.has(sdkid)) {
                tiktokPixelIds.add(sdkid);
                console.log(`[CDP] TikTok Pixel ID extracted from SDK URL: ${sdkid}`);

                // Inject pixel ID into page for crawler to find
                page.evaluate((pixelId) => {
                  try {
                    (window as any).__ttPixelIdsFromNetwork = (window as any).__ttPixelIdsFromNetwork || [];
                    if (!(window as any).__ttPixelIdsFromNetwork.includes(pixelId)) {
                      (window as any).__ttPixelIdsFromNetwork.push(pixelId);
                    }
                  } catch { }
                }, sdkid).catch(() => { });
              }
            }
          } catch (e) {
            // URL parsing error, continue
          }
        }

        // X (Twitter) pixel detection
        if (/(ads-twitter\.com|twitter\.com|t\.co).*\/(adsct|1\/i\/adsct)/i.test(url)) {
          console.log(`[CDP Request] X Pixel request detected: ${url.substring(0, 70)}`);

          // Extract pixel ID from txn_id parameter
          try {
            const urlObj = new URL(url);
            const txnId = urlObj.searchParams.get('txn_id');
            if (txnId && /^[a-z0-9]{5,}$/i.test(txnId)) {
              if (!xPixelIds.has(txnId)) {
                xPixelIds.add(txnId);
                console.log(`[CDP] X Pixel ID extracted: ${txnId}`);
              }
            }
          } catch (e) {
            // URL parsing error, continue
          }
        }

        // Reddit pixel detection
        if (/(redditstatic\.com|reddit\.com|alb\.reddit\.com).*\/(pixel|rp\.gif)/i.test(url)) {
          console.log(`[CDP Request] Reddit Pixel request detected: ${url.substring(0, 70)}`);

          // Extract pixel ID from 'id=' parameter
          try {
            const urlObj = new URL(url);
            const pixelId = urlObj.searchParams.get('id');
            if (pixelId && /^[a-z0-9_]{10,}$/i.test(pixelId)) {
              if (!redditPixelIds.has(pixelId)) {
                redditPixelIds.add(pixelId);
                console.log(`[CDP] Reddit Pixel ID extracted: ${pixelId}`);
              }
            }
          } catch (e) {
            // URL parsing error, continue
          }
        }

        // Global pixel detection (pixel_global.js?t=TIMESTAMP)
        if (/pixel_global\.js/i.test(url)) {
          console.log(`[CDP Request] Global Pixel request detected: ${url.substring(0, 70)}`);

          try {
            const urlObj = new URL(url);
            const timestamp = urlObj.searchParams.get('t');
            if (timestamp && /^\d{10,13}$/.test(timestamp)) {
              globalPixelUrl = url;
              globalPixelId = timestamp;
              console.log(`[CDP] Global Pixel detected with timestamp: ${timestamp}`);
            }
          } catch (e) {
            // URL parsing error, continue
          }
        }

        // Meta pixel detection (Facebook - fbevents.js and /tr/)
        if (/facebook\.com\/tr/i.test(url) || /fbevents\.js/i.test(url)) {
          console.log(`[CDP Request] Meta Pixel request detected: ${url.substring(0, 100)}`);

          // Extract pixel ID from 'id=' parameter in /tr/ URLs
          if (/facebook\.com\/tr/i.test(url)) {
            try {
              const urlObj = new URL(url);
              const pixelId = urlObj.searchParams.get('id');
              if (pixelId && /^\d{10,20}$/.test(pixelId)) {
                if (!metaPixelIds.has(pixelId)) {
                  metaPixelIds.add(pixelId);
                  console.log(`[CDP] Meta Pixel ID extracted: ${pixelId}`);
                }
              }
            } catch (e) {
              // URL parsing error, continue
            }
          }
        }

        // Google Tag Manager detection (gtag/js?id=)
        if (/googletagmanager\.com\/gtag\/js/i.test(url)) {
          console.log(`[CDP Request] Google Tag Manager request detected: ${url.substring(0, 100)}`);

          // Extract tag ID from 'id=' parameter (e.g., G-LM8X8SL3S5, AW-16919438481)
          try {
            const urlObj = new URL(url);
            const tagId = urlObj.searchParams.get('id');
            if (tagId && /^[A-Z]{1,3}-[A-Z0-9-]+$/i.test(tagId)) {
              if (!googleTagIds.has(tagId)) {
                googleTagIds.add(tagId);
                console.log(`[CDP] Google Tag ID extracted: ${tagId}`);
              }
            }
          } catch (e) {
            // URL parsing error, continue
          }
        }
      } catch (e) {
        console.error('CDP Network.requestWillBeSent handler error:', e);
      }
    });

    // Handle TikTok pixel POST request/response bodies via CDP
    client.on('Network.responseReceived', async (params: any) => {
      try {
        const url = params.response?.url || '';
        const requestId = params.requestId;

        // Capture TikTok pixel POST body from API endpoints
        if (/tiktok\.com\/api\/v2\/pixel/i.test(url)) {
          console.log(`[CDP Response] TikTok response: ${url.substring(0, 70)} - Status: ${params.response.status}`);

          // Try to get the request body to extract pixel ID and event data
          try {
            const postData = await client.send('Network.getRequestPostData', { requestId });
            if (postData && postData.postData) {
              const bodyText = postData.postData;
              console.log(`[CDP] Captured body (${bodyText.length} bytes): ${bodyText.substring(0, 100)}`);

              // Store in page context for analyzer to access
              await page.evaluate((body) => {
                try {
                  (window as any).__ttNetworkPayloads = (window as any).__ttNetworkPayloads || [];
                  (window as any).__ttNetworkPayloads.push({ body, ts: Date.now(), via: 'cdp' });
                } catch { }
              }, bodyText).catch(() => { });
            }
          } catch (e: any) {
            // Some requests may not have post data (GET requests)
            if (e.message && !e.message.includes('No post data')) {
              console.log(`[CDP] Could not get post data: ${e.message}`);
            }
          }
        }
      } catch (e) {
        console.error('CDP Network.responseReceived handler error:', e);
      }
    });

    console.log('CDP network interception enabled for TikTok, X, Reddit, Global, Meta pixels, and Google Tag Manager');
  } catch (e) {
    console.error('Failed to set up CDP network interception:', e);
  }

  return {
    tiktokPixelIds,
    xPixelIds,
    redditPixelIds,
    metaPixelIds,
    googleTagIds,
    globalPixelUrl,
    globalPixelId,
  };
}
