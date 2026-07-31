import { RequestSchema, type SuccessResponse, type ErrorResponse } from '../shared/index.js';
import { launchBrowser, gotoAndWait, countButtons, analyzeIframes, closeBrowser, captureGghst, analyzeXPixelWithClicks, analyzeTikTokPixel, analyzeRedditPixel, analyzeGlobalPixel, analyzeMetaPixel, analyzeGoogleTag, clickButtonAndCaptureAll } from '../services/index.js';
import { runLighthouse } from '../services/index.js';
import type { Request, Response } from 'express';

/**
 * Cloud Function entry point.
 * - Accepts POST { url: string }
 * - Launches Playwright Chromium to load the page and count visible buttons
 * - Runs Lighthouse against the same Chromium via remote debugging
 * - Returns a typed SuccessResponse or ErrorResponse
 */
export const analyzeUrl = async (req: Request, res: Response) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Support GET requests with ?url=... to avoid JSON body parsing issues
  let requestUrl: string | null = null;
  if (req.method === 'GET') {
    const q = (req as any).query as { url?: string } | undefined;
    requestUrl = q?.url ?? null;
  }

  // For POST, expect application/json { url }
  if (req.method === 'POST' && !requestUrl) {
    const body = (req as any).body as unknown;
    // If body-parser failed, req.body may be undefined and the framework might have already returned 400.
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      const errorResponse: ErrorResponse = {
        ok: false,
        error: `Invalid request: ${parsed.error.issues.map(i => i.message).join(', ')}`,
      };
      res.status(400).json(errorResponse);
      return;
    }
    requestUrl = parsed.data.url;
  }

  // If neither valid POST nor GET provided, return 405/400 accordingly
  if (!requestUrl) {
    const msg = req.method === 'POST'
      ? 'Invalid request body. Expect JSON: { "url": "https://example.com" }'
      : 'URL parameter is required. Use: /?url=https://example.com';
    const errorResponse: ErrorResponse = { ok: false, error: msg };
    res.status(req.method === 'POST' ? 400 : 400).json(errorResponse);
    return;
  }

  let browserInstance: Awaited<ReturnType<typeof launchBrowser>> | null = null;

  try {
    // Final URL already validated for POST; re-validate for GET to ensure format
    const valid = RequestSchema.safeParse({ url: requestUrl });
    if (!valid.success) {
      const errorResponse: ErrorResponse = {
        ok: false,
        error: `Invalid URL: ${valid.error.issues.map(i => i.message).join(', ')}`,
      };
      res.status(400).json(errorResponse);
      return;
    }
    const { url } = valid.data;
    console.log(`Processing URL: ${url}`);

    // ==========================================
    // SESSION 1: Lighthouse in an isolated browser
    // ==========================================
    const generateHtmlReport = process.env.REPORT_HTML === '1';
    const skipLh = process.env.SKIP_LH === '1';
    let lighthouseData = {
      scores: {
        performance: 0,
        accessibility: 0,
        'best-practices': 0,
        seo: 0,
        pwa: 0,
      },
      audits: {
        'first-contentful-paint': 0,
        'largest-contentful-paint': 0,
        'cumulative-layout-shift': 0,
        'total-blocking-time': 0,
        'speed-index': 0,
      },
      rawReportHtmlPath: null as string | null,
    };

    if (!skipLh) {
      let lhInstance: Awaited<ReturnType<typeof launchBrowser>> | null = null;
      try {
        lhInstance = await launchBrowser();
        await lhInstance.page.goto('about:blank');
        lighthouseData = await runLighthouse({
          url,
          port: lhInstance.debuggingPort,
          generateHtmlReport,
        });
        console.log('Lighthouse analysis completed');
      } catch (e) {
        console.error('Lighthouse session error:', e);
        // keep default zeroed lighthouseData on failure
      } finally {
        if (lhInstance) await closeBrowser(lhInstance);
      }
    }

    // ==========================================
    // SESSION 2: Interactive tests and pixel analysis
    // ==========================================
    browserInstance = await launchBrowser();
    console.log(`Interactive browser launched on port ${browserInstance.debuggingPort}`);

    // Install early init script to capture TikTok pixel network calls and ttq pushes before any page scripts run
    try {
      await browserInstance.page.addInitScript(() => {
        try {
          const w: any = window;
          if (w.__ttHooksInstalled) return;
          w.__ttHooksInstalled = true;

          // Storage for captured TikTok network payloads and ttq calls
          w.__ttNetworkPayloads = [];
          w.__ttCaptured = [];

          // Intercept ttq definition to capture init/track/page calls
          let _ttq: any = undefined;
          Object.defineProperty(w, 'ttq', {
            get() {
              return _ttq;
            },
            set(value: any) {
              // When ttq is set, wrap its push method
              if (Array.isArray(value) && !(value as any).__ttqPatched) {
                const originalPush = value.push.bind(value);
                value.push = function (...args: any[]) {
                  try {
                    const arr = args[0];
                    // Capture init, track, page, and identify commands
                    if (Array.isArray(arr) && (arr[0] === 'init' || arr[0] === 'track' || arr[0] === 'page' || arr[0] === 'identify')) {
                      w.__ttCaptured.push({ raw: arr, ts: Date.now() });
                      // Log init commands for debugging
                      if (arr[0] === 'init') {
                        console.log('TikTok init captured:', arr[1]);
                      }
                    }
                  } catch { }
                  return originalPush.apply(this, args);
                };
                (value as any).__ttqPatched = true;
              }
              _ttq = value;
            },
            configurable: true
          });

          // Patch fetch to capture TikTok pixel/event POST bodies
          const origFetch = window.fetch.bind(window);
          window.fetch = async function (input: any, init?: RequestInit) {
            try {
              const url = typeof input === 'string' ? input : (input && input.url) || '';
              const method = (init && (init as any).method) ? String((init as any).method).toUpperCase() : 'GET';
              // Match TikTok analytics endpoints including API v2
              if (/tiktok\.com/i.test(url) && (/(pixel|events|track|api\/v2)/i.test(url)) && method === 'POST') {
                let bodyText: string | null = null;
                const body: any = init && (init as any).body;
                if (typeof body === 'string') bodyText = body;
                else if (body && typeof (body as any).text === 'function') {
                  try { bodyText = await (body as any).text(); } catch { }
                }
                try {
                  w.__ttNetworkPayloads.push({ url, body: bodyText, ts: Date.now(), via: 'fetch' });
                  console.log('TikTok fetch intercepted:', url.substring(0, 50));
                } catch { }
              }
            } catch { }
            return origFetch(input as any, init as any);
          };

          // Patch XHR to capture TikTok pixel/event POST bodies
          const origOpen = XMLHttpRequest.prototype.open;
          const origSend = XMLHttpRequest.prototype.send;
          XMLHttpRequest.prototype.open = function (this: XMLHttpRequest, method: string, url: string): void {
            try { (this as any).__tt_method = method; (this as any).__tt_url = url; } catch { }
            return origOpen.apply(this, arguments as any);
          } as any;

          // Patch navigator.sendBeacon to capture payloads as well
          try {
            const origBeacon = navigator.sendBeacon.bind(navigator);
            (navigator as any).sendBeacon = function (url: any, data?: any) {
              try {
                const u = String(url || '');
                if (/tiktok/i.test(u) && /(pixel|events|track|open_api)/i.test(u)) {
                  let bodyText: string | null = null;
                  if (typeof data === 'string') bodyText = data;
                  else if (data instanceof Blob) {
                    try {
                      const reader = new FileReader();
                      reader.onload = () => { try { w.__ttNetworkPayloads.push({ url: u, body: String(reader.result || ''), ts: Date.now(), via: 'beacon' }); } catch { } };
                      reader.readAsText(data);
                    } catch { }
                  }
                  try { if (bodyText !== null) w.__ttNetworkPayloads.push({ url: u, body: bodyText, ts: Date.now(), via: 'beacon' }); } catch { }
                }
              } catch { }
              return origBeacon(url, data);
            };
          } catch { }
          XMLHttpRequest.prototype.send = function (this: XMLHttpRequest, body?: Document | BodyInit | null): void {
            try {
              const method = String((this as any).__tt_method || '').toUpperCase();
              const url = String((this as any).__tt_url || '');
              // Match TikTok analytics endpoints including API v2
              if (method === 'POST' && /tiktok\.com/i.test(url) && (/(pixel|events|track|api\/v2)/i.test(url))) {
                let bodyText: string | null = null;
                if (typeof body === 'string') bodyText = body;
                else if (body instanceof Blob) {
                  try {
                    const reader = new FileReader();
                    reader.onload = () => { try { w.__ttNetworkPayloads.push({ url, body: String(reader.result || ''), ts: Date.now(), via: 'xhr' }); } catch { } };
                    reader.readAsText(body);
                  } catch { }
                }
                try {
                  if (bodyText !== null) {
                    w.__ttNetworkPayloads.push({ url, body: bodyText, ts: Date.now(), via: 'xhr' });
                    console.log('TikTok XHR intercepted:', url.substring(0, 50));
                  }
                } catch { }
              }
            } catch { }
            return origSend.apply(this, arguments as any);
          } as any;
        } catch { }
      });
    } catch { }

    // Set up X Pixel event monitoring BEFORE navigation
    const skipXPixel = process.env.SKIP_XPIXEL === '1';
    if (!skipXPixel) {
      try {
        await browserInstance.page.addInitScript(() => {
          (window as any).__xPixelCaptured = [];

          // Intercept twq function to capture all events
          Object.defineProperty(window, 'twq', {
            set(value: any) {
              const originalTwq = value;
              const capturedEvents = (window as any).__xPixelCaptured;

              // Wrap the function to capture calls
              const wrappedTwq: any = function (...args: any[]) {
                const [command, eventName, parameters] = args;

                // Capture config and event calls
                if (command === 'config' || command === 'event') {
                  capturedEvents.push({
                    command,
                    eventName,
                    parameters,
                    timestamp: Date.now()
                  });
                }

                // Call original twq
                if (typeof originalTwq === 'function') {
                  return originalTwq.apply(wrappedTwq, args);
                }
              };

              // Copy properties from original
              Object.keys(originalTwq || {}).forEach((key: string) => {
                try {
                  wrappedTwq[key] = originalTwq[key];
                } catch { }
              });

              // Store wrapped function
              (this as any)._twq = wrappedTwq;
              return wrappedTwq;
            },
            get() {
              return (this as any)._twq;
            },
            configurable: true
          });
        });
      } catch (err) {
        console.error('Failed to set up X Pixel monitoring:', err);
      }
    }    // Start listening for "gghst.cc" requests before navigation (combines previous s2s and games tests)
    const skipGghst = process.env.SKIP_GGHST === '1';
    const skipRedirect = process.env.SKIP_REDIRECT === '1';

    const gghstPromise = skipGghst ? Promise.resolve({ found: false } as const) : captureGghst(browserInstance.page);
    await browserInstance.page.goto('about:blank');

    // Configure network listeners for TikTok, X, Reddit, Global, Meta pixels, and Google Tag Manager JUST BEFORE navigating to the target URL
    // Use CDP (Chrome DevTools Protocol) for reliable network interception
    const tiktokPayloads: Array<{ url: string; body: string }> = [];
    const tiktokPixelIds: Set<string> = new Set();
    const xPixelIds: Set<string> = new Set();
    const redditPixelIds: Set<string> = new Set();
    const metaPixelIds: Set<string> = new Set();
    const googleTagIds: Set<string> = new Set();
    let globalPixelUrl: string | undefined;
    let globalPixelId: string | undefined;

    try {
      console.log('Setting up CDP network interception for TikTok, X, Reddit, Global, Meta pixels, and Google Tag Manager...');

      const client = await browserInstance.page.context().newCDPSession(browserInstance.page);
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
                  browserInstance!.page.evaluate((pixelId) => {
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
          console.error('[CDP Request] Error:', e);
        }
      });

      client.on('Network.requestWillBeSentExtraInfo', (params: any) => {
        try {
          const headers = params.headers || {};
          if (headers['content-type']?.includes('application/json')) {
            console.log('[CDP] Request with JSON content-type detected');
          }
        } catch { }
      });

      client.on('Network.responseReceived', async (params: any) => {
        try {
          const url = params.response?.url || '';
          const status = params.response?.status || 0;

          if (/tiktok\.com/i.test(url) && (/(pixel|events|track|api\/v2)/i.test(url))) {
            console.log(`[CDP Response] TikTok response: ${url.substring(0, 70)} - Status: ${status}`);

            // Try to get request body via CDP
            try {
              const requestId = params.requestId;
              const bodyResponse = await client.send('Network.getRequestPostData', { requestId });
              const body = bodyResponse.postData;

              if (body) {
                console.log(`[CDP] Captured body (${body.length} bytes): ${body.substring(0, 100)}`);
                tiktokPayloads.push({ url, body });

                // Extract pixel_code from body if present
                try {
                  const bodyObj = JSON.parse(body);
                  if (bodyObj.pixel_code && /^[A-Z0-9]{15,25}$/.test(bodyObj.pixel_code)) {
                    const pixelCode = bodyObj.pixel_code;
                    if (!tiktokPixelIds.has(pixelCode)) {
                      tiktokPixelIds.add(pixelCode);
                      console.log(`[CDP] TikTok Pixel ID extracted from request body: ${pixelCode}`);

                      // Inject pixel ID into page
                      await browserInstance!.page.evaluate((pixelId) => {
                        try {
                          (window as any).__ttPixelIdsFromNetwork = (window as any).__ttPixelIdsFromNetwork || [];
                          if (!(window as any).__ttPixelIdsFromNetwork.includes(pixelId)) {
                            (window as any).__ttPixelIdsFromNetwork.push(pixelId);
                          }
                        } catch { }
                      }, pixelCode).catch(() => { });
                    }
                  }
                } catch {
                  // Not JSON or no pixel_code, continue
                }

                // Inject into page
                await browserInstance!.page.evaluate(([u, b]) => {
                  try {
                    (window as any).__ttNetworkPayloads = (window as any).__ttNetworkPayloads || [];
                    (window as any).__ttNetworkPayloads.push({
                      url: u,
                      body: b,
                      ts: Date.now(),
                      via: 'cdp'
                    });
                  } catch { }
                }, [url, body]);
              }
            } catch (e) {
              console.log('[CDP] Could not get post data:', (e as Error).message);
            }
          }
        } catch (e) {
          console.error('[CDP Response] Error:', e);
        }
      });

      console.log('CDP network interception enabled for TikTok, X, Reddit, Global, Meta pixels, and Google Tag Manager');
    } catch (err) {
      console.error('Failed to set up CDP interception:', err);
    }

    await gotoAndWait(browserInstance.page, url);
    console.log('Page loaded successfully');

    // Wait additional time for delayed JavaScript to execute (like analytics, Gghst tracking)
    console.log('Waiting for delayed scripts to execute...');
    await browserInstance.page.waitForTimeout(5000); // Wait 5 seconds for delayed scripts and network requests

    const iframeInfo = await analyzeIframes(browserInstance.page);
    console.log(`Detected ${iframeInfo.total} iframe(s); ${iframeInfo.visible} visible within viewport`);
    const buttonCount = await countButtons(browserInstance.page);
    console.log(`Found ${buttonCount} visible buttons`);

    // Capture initial Gghst from page load listeners
    const gghstFromPageLoad = await gghstPromise;

    // Click button ONCE and capture Gghst and Redirect all together
    // This avoids multiple clicks on the same button which causes navigation issues
    let finalGghst = gghstFromPageLoad;
    let redirectInfo: { occurred: boolean; fromUrl?: string; toUrl?: string; statusCode?: number } = { occurred: false };

    // If gghst not found on page load, or we need to test redirect, click the button
    const needsButtonClick = !gghstFromPageLoad.found || !skipRedirect;

    if (needsButtonClick) {
      console.log('Clicking button to test for Gghst and Redirect...');
      const combined = await clickButtonAndCaptureAll(browserInstance.page);

      // Use results from button click if not found on page load
      if (!gghstFromPageLoad.found && combined.gghst.found) {
        finalGghst = combined.gghst;
        console.log(`Gghst response received during button click: ${combined.gghst.method} ${combined.gghst.url} - Status: ${combined.gghst.status}`);
      }

      redirectInfo = combined.redirect;
    } else {
      if (gghstFromPageLoad.found) {
        console.log(`Gghst found on page load: ${gghstFromPageLoad.url}`);
      }
    }

    // Test for X Pixel (Twitter/X tracking pixel) implementation and events
    let xpixelInfo: Awaited<ReturnType<typeof analyzeXPixelWithClicks>> = { found: false };
    if (!skipXPixel) {
      console.log('Analyzing X Pixel implementation and events...');
      const networkXPixelIds = Array.from(xPixelIds);
      if (networkXPixelIds.length > 0) {
        console.log(`Passing ${networkXPixelIds.length} network X pixel ID(s) to analyzer: ${networkXPixelIds.join(', ')}`);
      }
      xpixelInfo = await analyzeXPixelWithClicks(browserInstance.page, networkXPixelIds);
      if (xpixelInfo.found) {
        console.log(`X Pixel found: ID ${xpixelInfo.pixelId}, ${xpixelInfo.events?.length || 0} events captured`);
      }
    }

    // Test for TikTok Pixel implementation and events
    const skipTikTokPixel = process.env.SKIP_TIKTOKPIXEL === '1';
    let tiktokPixelInfo: Awaited<ReturnType<typeof analyzeTikTokPixel>> = { found: false };
    if (!skipTikTokPixel) {
      console.log('Analyzing TikTok Pixel implementation and events...');
      // Pass network-extracted pixel IDs to the analyzer
      const networkPixelIds = Array.from(tiktokPixelIds);
      if (networkPixelIds.length > 0) {
        console.log(`Passing ${networkPixelIds.length} network pixel ID(s) to analyzer: ${networkPixelIds.join(', ')}`);
      }
      tiktokPixelInfo = await analyzeTikTokPixel(browserInstance.page, networkPixelIds);
      if (tiktokPixelInfo.found && tiktokPixelInfo.pixels) {
        const totalEvents = tiktokPixelInfo.pixels.reduce((sum: number, pixel: any) => sum + (pixel.events?.length || 0), 0);
        console.log(`TikTok Pixel found: ${tiktokPixelInfo.pixels.length} pixel(s), ${totalEvents} events captured`);
        tiktokPixelInfo.pixels.forEach((pixel: any) => {
          console.log(`  - Pixel ID: ${pixel.pixelId}, Events: ${pixel.events?.length || 0}`);
        });
      }
    }

    // Test for Reddit Pixel implementation and events
    const skipRedditPixel = process.env.SKIP_REDDITPIXEL === '1';
    let redditPixelInfo: Awaited<ReturnType<typeof analyzeRedditPixel>> = { found: false };
    if (!skipRedditPixel) {
      console.log('Analyzing Reddit Pixel implementation and events...');
      const networkRedditPixelIds = Array.from(redditPixelIds);
      if (networkRedditPixelIds.length > 0) {
        console.log(`Passing ${networkRedditPixelIds.length} network Reddit pixel ID(s) to analyzer: ${networkRedditPixelIds.join(', ')}`);
      }
      redditPixelInfo = await analyzeRedditPixel(browserInstance.page, networkRedditPixelIds);
      if (redditPixelInfo.found && redditPixelInfo.pixels) {
        const totalEvents = redditPixelInfo.pixels.reduce((sum: number, pixel: any) => sum + (pixel.events?.length || 0), 0);
        console.log(`Reddit Pixel found: ${redditPixelInfo.pixels.length} pixel(s), ${totalEvents} events captured`);
        redditPixelInfo.pixels.forEach((pixel: any) => {
          console.log(`  - Pixel ID: ${pixel.pixelId}, Events: ${pixel.events?.length || 0}`);
        });
      }
    }

    // Test for Global Pixel implementation (pixel_global.js?t=TIMESTAMP)
    const skipGlobalPixel = process.env.SKIP_GLOBALPIXEL === '1';
    let globalPixelInfo: Awaited<ReturnType<typeof analyzeGlobalPixel>> = { found: false };
    if (!skipGlobalPixel) {
      console.log('Analyzing Global Pixel implementation...');
      if (globalPixelUrl && globalPixelId) {
        console.log(`Passing network-detected Global Pixel: ${globalPixelUrl}`);
      }
      globalPixelInfo = await analyzeGlobalPixel(browserInstance.page, globalPixelUrl, globalPixelId);
      if (globalPixelInfo.found) {
        console.log('Global Pixel detected from network:', globalPixelUrl, '(ID:', globalPixelId + ')');
        console.log('Global Pixel found:', globalPixelInfo.scriptUrl);
        console.log('  - Pixel ID:', globalPixelInfo.pixelId);
      }
    }

    // Test for Meta Pixel (Facebook Pixel) implementation
    const skipMetaPixel = process.env.SKIP_METAPIXEL === '1';
    let metaPixelInfo: Awaited<ReturnType<typeof analyzeMetaPixel>> = { found: false };
    if (!skipMetaPixel) {
      console.log('Analyzing Meta Pixel implementation...');
      if (metaPixelIds.size > 0) {
        console.log(`Passing ${metaPixelIds.size} network Meta pixel ID(s) to analyzer: ${Array.from(metaPixelIds).join(', ')}`);
      }
      metaPixelInfo = await analyzeMetaPixel(browserInstance.page, metaPixelIds);
      if (metaPixelInfo.found && metaPixelInfo.pixels) {
        const totalEvents = metaPixelInfo.pixels.reduce((sum: number, pixel: any) => sum + (pixel.events?.length || 0), 0);
        console.log(`Meta Pixel found: ${metaPixelInfo.pixels.length} pixel(s), ${totalEvents} events captured`);
        metaPixelInfo.pixels.forEach((pixel: any) => {
          console.log(`  - Pixel ID: ${pixel.pixelId}, Events: ${pixel.events?.length || 0}`);
        });
      }
    }

    // Test for Google Tag Manager implementation
    const skipGoogleTag = process.env.SKIP_GOOGLETAG === '1';
    let googleTagInfo: Awaited<ReturnType<typeof analyzeGoogleTag>> = { found: false };
    if (!skipGoogleTag) {
      console.log('Analyzing Google Tag Manager implementation...');
      if (googleTagIds.size > 0) {
        console.log(`Passing ${googleTagIds.size} network Google Tag ID(s) to analyzer: ${Array.from(googleTagIds).join(', ')}`);
      }
      googleTagInfo = await analyzeGoogleTag(browserInstance.page, googleTagIds);
      if (googleTagInfo.found && googleTagInfo.tags) {
        console.log(`Google Tag Manager found: ${googleTagInfo.tags.length} tag(s)`);
        googleTagInfo.tags.forEach((tag: any) => {
          console.log(`  - Tag ID: ${tag.tagId}`);
        });
      }
    }

    const successResponse: SuccessResponse = {
      ok: true,
      target: url,
      buttonCount,
      iframes: iframeInfo,
      gghst: finalGghst,
      redirect: redirectInfo,
      xpixel: xpixelInfo,
      tiktokpixel: tiktokPixelInfo,
      redditpixel: redditPixelInfo,
      globalpixel: globalPixelInfo,
      metapixel: metaPixelInfo,
      googletag: googleTagInfo,
      lighthouse: lighthouseData,
    } as SuccessResponse;

    res.status(200).json(successResponse);
  } catch (error) {
    console.error('Error processing request:', error);

    const errorResponse: ErrorResponse = {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };

    res.status(500).json(errorResponse);
  } finally {
    if (browserInstance) {
      await closeBrowser(browserInstance);
      console.log('Browser closed');
    }
  }
};
