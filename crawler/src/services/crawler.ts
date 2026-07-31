/**
 * CRAWLER SERVICE - Refactored
 *
 * This file now focuses on pixel analysis functions while re-exporting
 * modular components for browser management, page interactions, iframe analysis,
 * and capture services.
 *
 * See src/REFACTORING.md for the complete modular structure.
 */

import type { Page } from 'playwright-core';
import { BUTTON_CSS_SELECTORS } from '../shared/index.js';
import { dismissModals } from './page-interactions.js';

// ============================================================================
// RE-EXPORTS - Modular components
// ============================================================================

// Re-export types
export * from './types.js';

// Re-export browser management
export { launchBrowser, closeBrowser } from './browser-manager.js';

// Re-export page interactions
export { gotoAndWait, countButtons, dismissModals } from './page-interactions.js';

// Re-export iframe analysis
export { analyzeIframes } from './iframe-analyzer.js';

// Re-export capture services
export { captureGghst, clickButtonAndCaptureAll } from './capture-services.js';

// ============================================================================
// PIXEL ANALYSIS - Types and Functions
// ============================================================================

export interface XPixelEvent {
  eventType: string;
  timestamp: number;
  parameters?: Record<string, any>;
  source?: string;
}

export interface XPixelInfo {
  found: boolean;
  pixelId?: string;
  loadTime?: number;
  pageUrl?: string;
  events?: XPixelEvent[];
  errors?: string[];
}

export interface TikTokPixelEvent {
  eventType: string;
  timestamp: number;
  parameters?: Record<string, any>;
  source?: string;
  eventId?: string;
}

export interface TikTokPixelData {
  pixelId: string;
  loadTime?: number;
  pageUrl?: string;
  events?: TikTokPixelEvent[];
  // Raw payloads captured from network or ttq mirror, when available
  payloads?: Array<Record<string, any>>;
  // Optional detection method when pixel is found via alternative means
  detectionMethod?: 'code_inspection' | 'network' | 'ttq_object';
}

export interface TikTokPixelInfo {
  found: boolean;
  pixels?: TikTokPixelData[];
  errors?: string[];
}

export interface RedditPixelEvent {
  eventType: string;
  timestamp: number;
  parameters?: Record<string, any>;
  source?: string;
  eventId?: string;
}

export interface RedditPixelData {
  pixelId: string;
  loadTime?: number;
  pageUrl?: string;
  events?: RedditPixelEvent[];
}

export interface RedditPixelInfo {
  found: boolean;
  pixels?: RedditPixelData[];
  errors?: string[];
}

/**
 * Analyze the page for X Pixel (Twitter/X tracking pixel) implementation and capture events.
 * This function simulates what the X Pixel Helper extension would detect.
 */
export async function analyzeXPixel(page: Page, networkPixelIds: string[] = []): Promise<XPixelInfo> {
  const result: XPixelInfo = { found: false, events: [], errors: [] };
  const startTime = Date.now();

  try {
    // Check if we have network-detected pixel IDs
    if (networkPixelIds && networkPixelIds.length > 0) {
      result.found = true;
      result.pixelId = networkPixelIds[0]; // Use the first one
      result.pageUrl = page.url();
      result.loadTime = Date.now() - startTime;
      result.errors = [`Debug: Found ${networkPixelIds.length} pixel ID(s) from network requests: ${networkPixelIds.join(', ')}`];
      return result;
    }

    // Check if the X Pixel base script is loaded
    const pixelCheck = await page.evaluate(() => {
      // Check for twq function and Twitter tracking
      const win = window as any;

      // Check for uwt.js script in the DOM
      const uwtScript = Array.from(document.querySelectorAll('script')).find(
        (s) => s.src && s.src.includes('uwt.js')
      );

      if (typeof win.twq !== 'undefined' || uwtScript) {
        return {
          found: true,
          hasQueue: Array.isArray(win.twq?.queue),
          version: win.twq?.version,
          scriptSrc: uwtScript?.src
        };
      }
      return { found: false };
    });

    if (!pixelCheck.found) {
      return result;
    }

    result.found = true;
    result.pageUrl = page.url();
    result.loadTime = Date.now() - startTime;

    // Intercept X Pixel network requests to capture pixel ID and events
    const pixelRequests: any[] = [];

    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('ads-twitter.com') || url.includes('twitter.com/i/adsct') || url.includes('t.co/i/adsct')) {
        pixelRequests.push({
          url,
          method: request.method(),
          timestamp: Date.now(),
          postData: request.postData()
        });
      }
    });

    // Extract pixel configuration and events from the page
    const pixelData = await page.evaluate(() => {
      const events: XPixelEvent[] = [];
      const errors: string[] = [];
      let pixelId: string | undefined;

      try {
        const win = window as any;

        // First, check if we have captured events from the init script
        if (Array.isArray(win.__xPixelCaptured)) {
          win.__xPixelCaptured.forEach((captured: any) => {
            if (captured.command === 'config' && captured.eventName) {
              pixelId = captured.eventName;
            } else if (captured.command === 'event' && captured.eventName) {
              events.push({
                eventType: captured.eventName,
                timestamp: captured.timestamp,
                parameters: captured.parameters || {},
                source: 'Pixel Code'
              });
            }
          });
        }

        // Fallback: check the twq queue for any events that weren't captured
        if (win.twq && Array.isArray(win.twq.queue)) {
          win.twq.queue.forEach((queueItem: any[]) => {
            const [command, eventName, parameters] = queueItem;
            if (command === 'config' && eventName && !pixelId) {
              pixelId = eventName;
            } else if (command === 'event' && eventName) {
              // Only add if not already captured
              const alreadyCaptured = events.some(e =>
                e.eventType === eventName &&
                Math.abs(e.timestamp - Date.now()) < 5000
              );
              if (!alreadyCaptured) {
                events.push({
                  eventType: eventName,
                  timestamp: Date.now(),
                  parameters: parameters || {},
                  source: 'Pixel Code'
                });
              }
            }
          });
        }

      } catch (error) {
        errors.push(`X Pixel analysis error: ${error instanceof Error ? error.message : String(error)}`);
      }

      return {
        pixelId,
        events,
        errors
      };
    }); result.pixelId = pixelData.pixelId;
    result.events = pixelData.events || [];
    result.errors = pixelData.errors || [];

    // Wait a bit for any async pixel events to fire
    await page.waitForTimeout(2000);

    // Check for additional events that may have been triggered
    const additionalEvents = await page.evaluate(() => {
      const moreEvents: XPixelEvent[] = [];

      // Look for any additional tracking calls that might have been made
      const win = window as any;
      if (win.twq && Array.isArray(win.twq.queue)) {
        win.twq.queue.forEach((queueItem: any[]) => {
          const [command, eventName, parameters] = queueItem;
          if (command === 'event' && eventName) {
            const existing = moreEvents.find(e =>
              e.eventType === eventName &&
              Math.abs(e.timestamp - Date.now()) < 5000
            );

            if (!existing) {
              moreEvents.push({
                eventType: eventName,
                timestamp: Date.now(),
                parameters: parameters || {},
                source: 'Pixel Code'
              });
            }
          }
        });
      }

      return moreEvents;
    });    // Merge additional events
    additionalEvents.forEach(event => {
      const existing = result.events?.find(e =>
        e.eventType === event.eventType &&
        Math.abs(e.timestamp - event.timestamp) < 1000
      );
      if (!existing) {
        result.events?.push(event);
      }
    });

    // Update final load time
    result.loadTime = Date.now() - startTime;

    // Infer pixelId from event naming convention if still undefined.
    // Typical pattern observed: tw-<pixelidlowercase>-<event>
    if (!result.pixelId && result.events && result.events.length) {
      for (const ev of result.events) {
        const m = /^tw-([a-z0-9]+)-[a-z0-9_]+$/i.exec(ev.eventType.trim());
        if (m) {
          result.pixelId = m[1].toUpperCase();
          break;
        }
      }
    }

  } catch (error) {
    result.errors?.push(`X Pixel analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    console.error('X Pixel analysis error:', error);
  }

  return result;
}

/**
 * Analyze X Pixel and capture events triggered by button clicks.
 */
export async function analyzeXPixelWithClicks(page: Page, networkPixelIds: string[] = []): Promise<XPixelInfo> {
  // First get baseline X Pixel info
  const baselineResult = await analyzeXPixel(page, networkPixelIds);

  // If we already have network-detected pixel IDs, return early without clicking buttons
  // since we already have what we need and button clicks might cause navigation issues
  if (networkPixelIds && networkPixelIds.length > 0) {
    return baselineResult;
  }

  // Ensure early hook (idempotent)
  try {
    await page.addInitScript(() => {
      try {
        const w: any = window;
        if (w.__ttCapturedInstalled) return;
        w.__ttCapturedInstalled = true;
        w.__ttCaptured = [];
        const ttq: any[] = (w as any).ttq || [];
        const originalPush = ttq.push.bind(ttq);
        ttq.push = function () { const args = Array.from(arguments); try { const arr = args[0]; if (Array.isArray(arr) && (arr[0] === 'track' || arr[0] === 'page')) { w.__ttCaptured.push({ raw: arr, ts: Date.now() }); } } catch { }; return originalPush.apply(this, args); };
        (w as any).ttq = ttq;
      } catch { }
    });
  } catch { }

  if (!baselineResult.found) {
    return baselineResult;
  }

  const initialEventCount = baselineResult.events?.length || 0;

  try {
    // Dismiss any modal overlays before clicking buttons
    await dismissModals(page);

    // Find and click buttons to trigger additional X Pixel events
    const buttons = await page.locator(BUTTON_CSS_SELECTORS).all();

    for (const button of buttons) {
      try {
        const isVisible = await button.isVisible();
        if (isVisible) {
          console.log('Clicking button for X Pixel event detection...');

          // Set up event listener before clicking
          const eventCapture = page.evaluate(() => {
            return new Promise<XPixelEvent[]>((resolve) => {
              const capturedEvents: XPixelEvent[] = [];
              const timeout = setTimeout(() => resolve(capturedEvents), 3000);

              // Monitor for new twq calls
              const win = window as any;
              if (win.twq) {
                const originalTwq = win.twq;
                win.twq = function (...args: any[]) {
                  const [command, eventName, parameters] = args;
                  if (command === 'event' && eventName) {
                    capturedEvents.push({
                      eventType: eventName,
                      timestamp: Date.now(),
                      parameters: parameters || {},
                      source: 'Pixel Code'
                    });
                  }
                  return originalTwq.apply(this, args);
                };

                // Copy properties
                Object.keys(originalTwq).forEach(key => {
                  if (key !== 'apply' && key !== 'call') {
                    win.twq[key] = originalTwq[key];
                  }
                });
              }

              // Resolve after a short timeout
              setTimeout(() => {
                clearTimeout(timeout);
                resolve(capturedEvents);
              }, 1500);
            });
          });

          // Click the button
          try {
            await button.click({ timeout: 5000 });
          } catch (clickError) {
            console.log('Normal click failed, trying force click...');
            await button.click({ force: true, timeout: 5000 });
          }

          // Wait for events to be captured
          const newEvents = await eventCapture;

          // Add new events to result
          newEvents.forEach(event => {
            const existing = baselineResult.events?.find(e =>
              e.eventType === event.eventType &&
              Math.abs(e.timestamp - event.timestamp) < 1000
            );
            if (!existing) {
              baselineResult.events?.push(event);
            }
          });

          // Wait a bit before next button
          await page.waitForTimeout(1000);
        }
      } catch (e) {
        console.log('Failed to click button for X Pixel detection:', e instanceof Error ? e.message : String(e));
      }
    }

    // Log summary
    const finalEventCount = baselineResult.events?.length || 0;
    if (finalEventCount > initialEventCount) {
      console.log(`X Pixel: Found ${finalEventCount - initialEventCount} additional events from button clicks`);
    }

  } catch (error) {
    baselineResult.errors?.push(`X Pixel click analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    console.error('X Pixel click analysis error:', error);
  }

  return baselineResult;
}

/**
 * Analyze the page for TikTok Pixel implementation and capture events.
 * This function simulates what the TikTok Pixel Helper extension would detect.
 * TikTok can have multiple pixels on a single page.
 */
export async function analyzeTikTokPixel(page: Page, networkPixelIds: string[] = []): Promise<TikTokPixelInfo> {
  const result: TikTokPixelInfo = { found: false, pixels: [], errors: [] };
  const startTime = Date.now();
  try {
    // Check if TikTok is in the HTML source first
    const htmlHasTikTok = await page.evaluate(() => {
      const html = document.documentElement.outerHTML;
      return {
        hasTtq: /ttq|tiktok/i.test(html),
        hasAnalyticsTiktok: /analytics\.tiktok\.com/i.test(html),
        scriptCount: document.scripts.length,
      };
    });
    console.log('TikTok in HTML source:', htmlHasTikTok);

    // Wait for TikTok pixel to load (can be loaded dynamically by JS bundles)
    // First, wait for ttq object to exist
    try {
      await page.waitForFunction(() => {
        const w: any = window;
        return w.ttq && typeof w.ttq === 'object';
      }, { timeout: 3000 });
      console.log('TikTok ttq object detected');
    } catch {
      console.log('TikTok ttq object not found after 3s');
    }

    // Additional wait for events to fire and network requests to complete
    await page.waitForTimeout(2000);
    console.log('Waiting complete, analyzing TikTok pixel...');

    const data = await page.evaluate(async (networkPixelIdsParam: string[]) => {
      const w: any = window;
      const debugData: string[] = [];
      let pixelIds: string[] = [];
      let detectedViaCode = false;

      // FIRST: Use pixel IDs passed from network interception (highest priority)
      if (networkPixelIdsParam && networkPixelIdsParam.length > 0) {
        pixelIds.push(...networkPixelIdsParam);
        debugData.push(`Found ${networkPixelIdsParam.length} pixel ID(s) from network SDK URLs: ${networkPixelIdsParam.join(', ')}`);
        detectedViaCode = false; // Found real IDs from network
      }

      // If no network IDs and no ttq object, return early
      if (pixelIds.length === 0 && !w.ttq) {
        debugData.push('ttq not found on window and no network pixel IDs');
        return { pixelIds: [] as string[], events: [] as any[], debug: debugData, payloadsByPixel: {} as Record<string, any[]>, detectedViaCode: false };
      }

      // If ttq exists, try to extract from it
      if (w.ttq) {
        debugData.push(`ttq exists: ${typeof w.ttq}, _i: ${w.ttq._i ? Object.keys(w.ttq._i).length + ' keys' : 'none'}`);

        // Try to extract pixel IDs from ttq._i if we don't have network IDs yet
        if (pixelIds.length === 0 && w.ttq._i) {
          pixelIds = Object.keys(w.ttq._i);
        }
      }

      // Method 1: Check if TikTok pixel script is loaded
      if (pixelIds.length === 0) {
        const scripts = Array.from(document.scripts);
        for (const script of scripts as HTMLScriptElement[]) {
          const src = script.src || '';
          // TikTok pixel scripts: events.js, pixel/sdk
          if (/tiktok/i.test(src) && /(events\.js|pixel|sdk|i18n)/i.test(src)) {
            debugData.push(`Found TikTok script: ${src.substring(0, 80)}`);
            detectedViaCode = true;

            // Try to extract pixel ID from script URL (e.g., ?sdkid=XXXX)
            const match = src.match(/[?&]sdkid=([A-Z0-9_]+)/i);
            if (match) {
              pixelIds.push(match[1]);
              debugData.push(`Extracted pixel ID from script: ${match[1]}`);
            }
          }
        }
      }

      // Method 2: Check ttq configuration/options
      if (pixelIds.length === 0 && w.ttq._o) {
        const configKeys = Object.keys(w.ttq._o || {});
        if (configKeys.length > 0) {
          pixelIds = configKeys;
          debugData.push(`Found pixel IDs in ttq._o: ${configKeys.join(', ')}`);
          detectedViaCode = true;
        }
      }

      // Method 2b: Deep inspection of ttq object to find pixel IDs
      if (pixelIds.length === 0 && w.ttq && typeof w.ttq === 'object') {
        debugData.push(`Inspecting ttq object properties: ${Object.keys(w.ttq).join(', ')}`);

        // If ttq is an array (queue pattern), inspect commands for 'init' calls with pixel IDs
        if (Array.isArray(w.ttq)) {
          debugData.push(`ttq is an array with ${w.ttq.length} commands`);
          for (const cmd of w.ttq) {
            if (Array.isArray(cmd) && cmd[0] === 'init' && typeof cmd[1] === 'string') {
              // Found an init command: ['init', 'PIXEL_ID', {...options}]
              const pixelId = cmd[1];
              if (/^[A-Z0-9]{15,25}$/.test(pixelId)) {
                pixelIds.push(pixelId);
                debugData.push(`Found pixel ID in ttq array init: ${pixelId}`);
                detectedViaCode = true;
              }
            }
          }
        }

        // Check all properties of ttq for pixel-like IDs (format: uppercase alphanumeric)
        const ttqKeys = Object.keys(w.ttq);
        for (const key of ttqKeys) {
          // TikTok pixel IDs are typically uppercase alphanumeric strings like D2NE1ORC77U6K3O88MNG
          if (/^[A-Z0-9]{15,25}$/.test(key)) {
            pixelIds.push(key);
            debugData.push(`Found pixel ID as property: ${key}`);
            detectedViaCode = true;
          }

          // Check nested objects
          const val = w.ttq[key];
          if (val && typeof val === 'object') {
            const nestedKeys = Object.keys(val);
            for (const nkey of nestedKeys) {
              if (/^[A-Z0-9]{15,25}$/.test(nkey)) {
                pixelIds.push(nkey);
                debugData.push(`Found pixel ID in ttq.${key}: ${nkey}`);
                detectedViaCode = true;
              }
            }
          }
        }

        // Check ttq.instance or ttq.instances (common TikTok pattern)
        if (w.ttq.instance) {
          const inst = w.ttq.instance;
          if (inst.pixel_code || inst.pixelCode) {
            const pc = inst.pixel_code || inst.pixelCode;
            pixelIds.push(pc);
            debugData.push(`Found pixel code in ttq.instance: ${pc}`);
            detectedViaCode = true;
          }
        }

        if (w.ttq.instances && typeof w.ttq.instances === 'object') {
          const instKeys = Object.keys(w.ttq.instances);
          for (const ikey of instKeys) {
            if (/^[A-Z0-9]{15,25}$/.test(ikey)) {
              pixelIds.push(ikey);
              debugData.push(`Found pixel ID in ttq.instances: ${ikey}`);
              detectedViaCode = true;
            }
          }
        }
      }

      // Method 3: Check if ttq exists at all (object or function) when _i is empty
      if (pixelIds.length === 0 && w.ttq) {
        debugData.push(`ttq exists (${typeof w.ttq}), pixel is present but _i is empty - marking as detected`);
        // If ttq exists, pixel is at least present on the page
        detectedViaCode = true;
        pixelIds.push('detected_but_not_loaded');
      }

      const events: any[] = [];
      const mirror: any[] = w.__ttEventsMirror || [];
      const captured: any[] = w.__ttCaptured || [];
      const q: any[] = Array.isArray(w.ttq) ? w.ttq : [];

      const npCount = Array.isArray(w.__ttNetworkPayloads) ? w.__ttNetworkPayloads.length : 0;
      debugData.push(`mirror: ${mirror.length}, captured: ${captured.length}, queue: ${q.length}`);
      debugData.push(`networkPayloads: ${npCount}`);

      // Extract pixel IDs from captured init commands FIRST (before detectedViaCode fallback)
      if (pixelIds.length === 0) {
        for (const cap of captured) {
          const raw = cap.raw;
          if (Array.isArray(raw) && raw[0] === 'init' && typeof raw[1] === 'string') {
            const pixelId = raw[1];
            if (/^[A-Z0-9]{15,25}$/.test(pixelId)) {
              pixelIds.push(pixelId);
              debugData.push(`Found pixel ID from captured init: ${pixelId}`);
              detectedViaCode = false; // Found real IDs, not just code detection
            }
          }
        }
      }

      const seen = new Set<string>();
      function add(evType: string, params: any, source: string) {
        const id = (params?.event_id || '') + '|' + evType + '|' + source + '|' + JSON.stringify(params || {});
        if (seen.has(id)) return; seen.add(id);
        events.push({ type: evType, params: params || {}, eventId: params?.event_id });
      }
      // Mirror events (patched in fixture)
      for (const m of mirror) {
        if (!Array.isArray(m)) continue;
        if (m[0] === 'track') add(m[1], m[2] || {}, 'mirror');
        if (m[0] === 'page') add('Page', {}, 'mirror');
      }
      // Captured push overrides (init script hook)
      for (const cap of captured) {
        const raw = cap.raw;
        if (Array.isArray(raw)) {
          if (raw[0] === 'track') add(raw[1], raw[2] || {}, 'captured');
          if (raw[0] === 'page') add('Page', {}, 'captured');
        }
      }
      // Raw queue fallback
      for (const qi of q) {
        if (!Array.isArray(qi)) continue;
        const [cmd, a1, a2] = qi;
        if (cmd === 'track') add(a1, a2 || {}, 'queue');
        else if (cmd === 'page') add('Page', {}, 'queue');
      }
      // Try to parse network payloads captured by early hooks (fetch/xhr)
      const payloadsByPixel: Record<string, any[]> = {};
      try {
        const arr: any[] = Array.isArray(w.__ttNetworkPayloads) ? w.__ttNetworkPayloads : [];
        debugData.push(`Processing ${arr.length} network payloads`);

        for (const item of arr) {
          const body = item && typeof item.body === 'string' ? item.body : null;
          if (!body) continue;

          debugData.push(`Payload via ${item.via}: ${body.substring(0, 100)}...`);

          let json: any = null;
          try { json = JSON.parse(body); } catch {
            // Some TikTok payloads may be sent as application/x-www-form-urlencoded with a 'data' field
            try {
              const usp = new URLSearchParams(body);
              const dataField = usp.get('data');
              if (dataField) json = JSON.parse(dataField);
            } catch { }
          }
          if (json && typeof json === 'object') {
            // Two common shapes:
            // 1. { pixel: {...}, context: {...}, event: ..., ... }
            // 2. { events: [ { pixel: {...}, context: {...}, ... } ] }
            // 3. API v2: { pixel_code: "XXX", event: "PageView", ... }
            const records: any[] = Array.isArray(json.events) ? json.events : [json];
            for (const rec of records) {
              // Try multiple ways to extract pixel ID
              let code: string | undefined;

              // Method 1: pixel.code or pixel_code at root level
              code = rec.pixel_code || rec.pixelCode;

              // Method 2: Nested in pixel object
              if (!code) {
                const pixelBlock = rec.pixel || rec.context?.pixel || rec.pix || null;
                code = pixelBlock && typeof pixelBlock.code === 'string' ? pixelBlock.code : undefined;
              }

              // Method 3: Extract from event_id pattern (e.g., sb4lnkmlyz09mwmhqs1dq1mxz)
              if (!code && rec.event_id) {
                code = 'detected_via_event';
              }

              const key = code || 'unknown';
              payloadsByPixel[key] = payloadsByPixel[key] || [];
              payloadsByPixel[key].push(rec);

              if (code) {
                debugData.push(`Found pixel code: ${code} (event: ${rec.event || 'unknown'})`);
              }
            }
          }
        }

        debugData.push(`Pixel codes found: ${Object.keys(payloadsByPixel).join(', ')}`);
      } catch (e) {
        debugData.push(`payload parse err: ${e instanceof Error ? e.message : String(e)}`);
      }

      return { pixelIds, events, debug: debugData, payloadsByPixel, detectedViaCode };
    }, networkPixelIds);

    if (data.pixelIds.length) {
      result.found = true;
      result.pixels = data.pixelIds.map(pid => ({
        pixelId: pid,
        loadTime: Date.now() - startTime,
        pageUrl: page.url(),
        events: data.events.map((ev: any) => ({
          eventType: ev.type,
          timestamp: Date.now(),
          parameters: ev.params,
          source: 'Pixel Code',
          eventId: ev.eventId || ev.params?.event_id
        })),
        payloads: (() => {
          // Prefer exact match by pixel code when available; fallback to any 'unknown' bucket
          const byKey = data.payloadsByPixel || {};
          const arr = byKey[pid] || byKey[pid.toUpperCase?.() as any] || byKey[pid.toLowerCase?.() as any] || byKey['unknown'] || [];
          return arr as Array<Record<string, any>>;
        })()
      }));
    }

    // If no pixelIds via ttq._i, check if detected via code inspection
    if (!result.found && (data as any).detectedViaCode && data.pixelIds.length > 0) {
      result.found = true;
      result.pixels = data.pixelIds.map(pid => ({
        pixelId: pid,
        loadTime: Date.now() - startTime,
        pageUrl: page.url(),
        events: [],
        payloads: [],
        detectionMethod: 'code_inspection'
      }));
      console.log(`TikTok Pixel detected via code inspection: ${data.pixelIds.join(', ')}`);
    }

    // If still not found, fallback to network payloads
    if (!result.found) {
      const byKey: Record<string, any[]> = (data as any).payloadsByPixel || {};
      const keys = Object.keys(byKey).filter(k => (byKey as any)[k] && (byKey as any)[k].length);
      if (keys.length) {
        result.found = true;
        result.pixels = keys.map(k => ({
          pixelId: k === 'unknown' ? 'unknown' : k,
          loadTime: Date.now() - startTime,
          pageUrl: page.url(),
          events: [],
          payloads: byKey[k] as Array<Record<string, any>>,
        }));
      }
    }

    // Add debug information
    if (data.debug) {
      result.errors = result.errors || [];
      const debugMsg = `TikTok Debug: ${data.debug.join('; ')}`;
      result.errors.push(debugMsg);
      console.log(debugMsg);
    }

    // Log final result
    if (result.found) {
      console.log(`TikTok Pixel analysis complete: ${result.pixels?.length || 0} pixel(s) found`);
    } else {
      console.log('TikTok Pixel analysis complete: No pixels found');
    }
  } catch (e) {
    const errorMsg = `TikTok Pixel analysis failed: ${e instanceof Error ? e.message : String(e)}`;
    result.errors?.push(errorMsg);
    console.error(errorMsg, e);
  }
  return result;
}

/**
 * Analyze TikTok Pixel and capture events triggered by button clicks.
 */
export async function analyzeTikTokPixelWithClicks(page: Page): Promise<TikTokPixelInfo> {
  const baseline = await analyzeTikTokPixel(page);
  try {
    await dismissModals(page);
    const buttons = await page.locator(BUTTON_CSS_SELECTORS).all();
    // Track existing event signatures to avoid duplicates
    const existingKeys = new Set<string>();
    baseline.pixels?.forEach(p => p.events?.forEach(ev => existingKeys.add(ev.eventType + '|' + (ev.eventId || ''))));
    for (const button of buttons) {
      try {
        if (await button.isVisible()) {
          console.log('Clicking button for TikTok Pixel event detection...');
          try { await button.click({ timeout: 3000 }); } catch { await button.click({ force: true, timeout: 3000 }); }
          // Short wait to let synchronous track calls execute
          await page.waitForTimeout(50);
          // Capture any new events immediately (avoids second full 650ms wait)
          const newEvents = await page.evaluate(() => {
            const w: any = window;
            const out: { type: string; params: any; eventId?: string }[] = [];
            const mirror: any[] = w.__ttEventsMirror || [];
            for (const m of mirror) {
              if (Array.isArray(m) && m[0] === 'track') {
                out.push({ type: m[1], params: m[2] || {}, eventId: (m[2] && m[2].event_id) || undefined });
              }
            }
            return out;
          });
          // Merge only brand new click-related events
          if (newEvents && baseline.pixels) {
            for (const p of baseline.pixels) {
              p.events = p.events || [];
              for (const ev of newEvents) {
                const key = ev.type + '|' + (ev.eventId || '');
                if (!existingKeys.has(key) && (ev.type === 'ClickButton' || ev.type === 'Purchase')) {
                  p.events.push({
                    eventType: ev.type,
                    timestamp: Date.now(),
                    parameters: ev.params,
                    source: 'Pixel Code',
                    eventId: ev.eventId
                  });
                  existingKeys.add(key);
                }
              }
            }
          }
        }
      } catch { /* ignore */ }
    }
  } catch { /* ignore */ }
  // Re-scan queue for new events after interactions
  const after = await analyzeTikTokPixel(page);
  if (after.found && after.pixels?.length) {
    // Merge events per pixelId
    after.pixels.forEach(ap => {
      const existing = baseline.pixels?.find(bp => bp.pixelId === ap.pixelId);
      if (!existing) {
        baseline.pixels?.push(ap);
      } else {
        ap.events?.forEach(ev => {
          if (!existing.events?.some(e => e.eventType === ev.eventType && e.eventId === ev.eventId)) {
            existing.events = existing.events || [];
            existing.events.push(ev);
          }
        });
      }
    });
    baseline.found = true;
  }
  return baseline;
}

/**
 * Analyze the page for Reddit Pixel implementation and capture events (supports multiple pixels).
 * Mimics Reddit Pixel Helper: detects rdt('init', pixelId) and rdt('track', event,...)
 */
export async function analyzeRedditPixel(page: Page, networkPixelIds: string[] = []): Promise<RedditPixelInfo> {
  const result: RedditPixelInfo = { found: false, pixels: [], errors: [] };
  const startTime = Date.now();

  try {
    // Check if we have network-detected pixel IDs from CDP
    if (networkPixelIds && networkPixelIds.length > 0) {
      result.found = true;
      result.pixels = networkPixelIds.map(id => ({
        pixelId: id,
        events: [],
        loadTime: Date.now() - startTime,
        pageUrl: page.url()
      }));
      result.errors = [`Debug: Found ${networkPixelIds.length} pixel ID(s) from network requests: ${networkPixelIds.join(', ')}`];
      return result;
    }

    // 1. Early hook to capture calls even before we start polling
    try {
      await page.addInitScript(() => {
        try {
          const w: any = window;
          if (w.__rdtHookInstalled) return; w.__rdtHookInstalled = true;
          const original = w.rdt;
          function capture(args: any[]) { try { w.__redditEventsMirror = w.__redditEventsMirror || []; w.__redditEventsMirror.push(args); } catch { } }
          const stub = function (this: any) { const args = Array.prototype.slice.call(arguments); capture(args); if (typeof original === 'function') return original.apply(this, args); } as any;
          stub.q = (original && original.q) || [];
          if (Array.isArray(stub.q)) { try { stub.q.forEach((c: any) => capture(c)); } catch { } }
          w.rdt = stub;
        } catch { }
      });
    } catch { /* ignore */ }

    // 2. Network listener for pixel script & potential id params
    const networkIds = new Set<string>();
    const networkRequests: { url: string; postData?: string; headers?: any }[] = [];
    let pixelScriptLoaded = false;

    // Also listen to responses to capture pixel ID from response bodies
    const responseListener = async (res: any) => {
      try {
        const url = res.url();
        // Check Reddit tracking endpoints in responses
        if (/(alb\.)?reddit\.com\/(rp\.gif|ads|pixel)/i.test(url) || /redditstatic\.com\/ads\/pixel\.js/.test(url)) {
          try {
            const body = await res.text().catch(() => '');
            if (body) {
              // Look for a2_ pattern in response body
              const a2Matches = body.match(/["']?(a2_[a-z0-9_]{5,})["']?/gi);
              if (a2Matches) {
                a2Matches.forEach((match: string) => {
                  const cleaned = match.replace(/["']/g, '');
                  if (cleaned.startsWith('a2_')) {
                    networkIds.add(cleaned);
                  }
                });
              }
            }
          } catch { }
        }
      } catch { }
    };

    const reqListener = (req: any) => {
      try {
        const url = req.url();
        const headers = req.headers();

        // Detect Reddit pixel script
        if (/redditstatic\.com\/ads\/pixel\.js/.test(url)) {
          pixelScriptLoaded = true;
          networkRequests.push({ url, headers });
        }
        // Detect Reddit tracking endpoints (rp.gif, etc.)
        if (/(alb\.)?reddit\.com\/(rp\.gif|ads|pixel)/i.test(url)) {
          const postData = req.postData();
          networkRequests.push({ url, postData, headers });

          // Try to extract pixel ID from POST data
          if (postData) {
            try {
              // Check if it's JSON
              const jsonData = JSON.parse(postData);
              // Look for pixel ID fields
              const possibleIds = [jsonData.pixel_id, jsonData.id, jsonData.a2, jsonData.advertiserId];
              possibleIds.forEach(id => {
                if (id && typeof id === 'string' && /^a2_[a-z0-9_]{5,}$/i.test(id)) {
                  networkIds.add(id);
                }
              });
              // Also check nested objects
              if (jsonData.data && typeof jsonData.data === 'object') {
                Object.values(jsonData.data).forEach((val: any) => {
                  if (typeof val === 'string' && /^a2_[a-z0-9_]{5,}$/i.test(val)) {
                    networkIds.add(val);
                  }
                });
              }
            } catch {
              // Not JSON, try to find a2_ pattern in raw POST data
              const a2Match = postData.match(/a2_[a-z0-9_]{5,}/i);
              if (a2Match) networkIds.add(a2Match[0]);
            }
          }

          try {
            const u = new URL(url);
            // Check URL params for pixel ID
            for (const key of ['id', 'pixel_id', 'reddit_pixel', 'rdt_id', 'a2', 'advertiser_id']) {
              const v = u.searchParams.get(key);
              if (v && /^[a-zA-Z0-9_-]{10,}$/.test(v)) networkIds.add(v);
            }
            // Check for a2_ pattern in URL path and query
            const a2Match = url.match(/a2_[a-z0-9_]{5,}/gi);
            if (a2Match) {
              a2Match.forEach((id: string) => networkIds.add(id));
            }
          } catch { }
        }
      } catch { }
    };

    page.on('request', reqListener);
    page.on('response', responseListener);

    // 3. Poll for up to ~2500ms for initialization
    let aggregated: { pixelIds: string[]; events: any[] } = { pixelIds: [], events: [] };
    const debugInfo: string[] = [];

    // First, try to find pixel ID in scripts and force initialization if needed
    const forceInitResult = await page.evaluate(() => {
      const w: any = window;
      const debugData: string[] = [];

      try {
        // Check if rdt exists
        if (typeof w.rdt !== 'function') {
          debugData.push('rdt function not found');
          return { success: false, debug: debugData };
        }

        // Try to find pixel ID in multiple places
        const pixelIds = new Set<string>();

        // 1. Check rdt object properties directly
        if (typeof w.rdt === 'function') {
          // Check common property names where pixel ID might be stored
          const rdtObj = w.rdt as any;
          const possibleProps = ['advertiserId', 'pixelId', 'id', '_id', 'advId', 'a2'];
          possibleProps.forEach(prop => {
            if (rdtObj[prop] && typeof rdtObj[prop] === 'string' && /^a2_[a-z0-9_]{5,}$/i.test(rdtObj[prop])) {
              pixelIds.add(rdtObj[prop]);
              debugData.push(`Found pixel ID in rdt.${prop}: ${rdtObj[prop]}`);
            }
          });

          // Check if there's a queue with init call
          if (Array.isArray(rdtObj.q)) {
            rdtObj.q.forEach((item: any) => {
              if (Array.isArray(item) && item[0] === 'init' && typeof item[1] === 'string' && /^a2_/.test(item[1])) {
                pixelIds.add(item[1]);
                debugData.push(`Found pixel ID in rdt.q: ${item[1]}`);
              }
            });
          }
        }

        // 2. Check window properties for Reddit pixel config
        const windowProps = Object.keys(w);
        windowProps.forEach(key => {
          if (/reddit|rdt|pixel/i.test(key) && typeof w[key] === 'object' && w[key]) {
            try {
              const obj = w[key];
              if (obj.advertiserId && typeof obj.advertiserId === 'string' && /^a2_/.test(obj.advertiserId)) {
                pixelIds.add(obj.advertiserId);
                debugData.push(`Found pixel ID in window.${key}.advertiserId`);
              }
              if (obj.pixelId && typeof obj.pixelId === 'string' && /^a2_/.test(obj.pixelId)) {
                pixelIds.add(obj.pixelId);
                debugData.push(`Found pixel ID in window.${key}.pixelId`);
              }
            } catch { }
          }
        });

        // 3. Check scripts for pixel ID patterns
        const scripts = Array.from(document.getElementsByTagName('script'));
        scripts.forEach(script => {
          // Check src attribute for pixel ID
          if (script.src && /a2_[a-z0-9_]{5,}/i.test(script.src)) {
            const match = script.src.match(/a2_[a-z0-9_]{5,}/i);
            if (match) {
              pixelIds.add(match[0]);
              debugData.push(`Found pixel ID in script src`);
            }
          }

          // Check script content
          const txt = script.textContent || '';
          if (txt) {
            // Look for rdt('init', 'pixelId') patterns
            const initPatterns = [
              /rdt\s*\(\s*["']init["']\s*,\s*["']([a-zA-Z0-9_:-]+)["']\s*\)/g,
              /["'](a2_[a-z0-9_]{5,})['"]/gi,
            ];

            initPatterns.forEach(pattern => {
              let match;
              while ((match = pattern.exec(txt))) {
                if (match[1] && /^a2_/.test(match[1])) {
                  pixelIds.add(match[1]);
                  debugData.push(`Found pixel ID in script content`);
                }
              }
            });
          }
        });

        debugData.push(`Total pixel IDs found: ${pixelIds.size}`);

        // If we found pixel IDs and rdt exists but hasn't been initialized, force init
        if (pixelIds.size > 0 && typeof w.rdt === 'function') {
          const pixelIdArray = Array.from(pixelIds);
          debugData.push(`Attempting to force init with IDs: ${pixelIdArray.join(', ')}`);

          // Try to call init for each found pixel ID
          pixelIdArray.forEach(pid => {
            try {
              w.rdt('init', pid);
              debugData.push(`Called rdt('init', '${pid}')`);

              // Also try to trigger a PageVisit event
              w.rdt('track', 'PageVisit');
              debugData.push(`Called rdt('track', 'PageVisit')`);
            } catch (e) {
              debugData.push(`Error calling rdt: ${e}`);
            }
          });

          return { success: true, pixelIds: pixelIdArray, debug: debugData };
        }

        debugData.push(`rdt exists but no pixel IDs found to force init`);
        return { success: false, debug: debugData };
      } catch (e) {
        debugData.push(`Force init error: ${e}`);
        return { success: false, debug: debugData };
      }
    });

    if (forceInitResult.debug) {
      debugInfo.push(...forceInitResult.debug);
    }

    // Wait a bit after forcing init to let events fire
    if (forceInitResult.success) {
      await page.waitForTimeout(500);
    }

    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(i === 0 ? 300 : 250);
      const data = await page.evaluate(() => {
        const w: any = window;
        const calls: any[] = (w.rdt && (w.rdt.q || [])) || [];
        const mirror: any[] = w.__redditEventsMirror || [];
        const debugData: string[] = [];

        // Debug: Check what's available
        if (w.rdt) debugData.push(`rdt exists: ${typeof w.rdt}, queue: ${Array.isArray(w.rdt.q) ? w.rdt.q.length : 'none'}`);
        if (mirror.length) debugData.push(`mirror events: ${mirror.length}`);

        // Debug: Check for other tracking pixels on the page
        const trackers = [];
        if (w.ttq) trackers.push('ttq');
        if (w.twq) trackers.push('twq');
        if (w.fbq) trackers.push('fbq');
        if (w.apxl) trackers.push('apxl');
        if (w.gtag) trackers.push('gtag');
        if (trackers.length) debugData.push(`Other trackers found: ${trackers.join(', ')}`);

        // Debug: Check script count
        const scriptCount = document.getElementsByTagName('script').length;
        debugData.push(`Total scripts on page: ${scriptCount}`);

        // Always check scripts for pixel IDs, even if we have calls
        try {
          const scripts = Array.from(document.getElementsByTagName('script')).map(s => s.textContent || '');
          const ids = new Set<string>();

          // Enhanced regex patterns for Reddit pixel detection
          scripts.forEach(txt => {
            // Standard rdt init pattern: rdt('init', 'pixelId') - with various quote styles
            const patterns = [
              // Single quotes with optional whitespace
              /rdt\s*\(\s*'init'\s*,\s*'([a-zA-Z0-9_:-]+)'\s*\)/g,
              // Double quotes with optional whitespace
              /rdt\s*\(\s*"init"\s*,\s*"([a-zA-Z0-9_:-]+)"\s*\)/g,
              // Mixed quotes
              /rdt\s*\(\s*["']init["']\s*,\s*["']([a-zA-Z0-9_:-]+)["']\s*\)/g,
              // With line breaks (multiline mode)
              /rdt\s*\(\s*["']init["']\s*,\s*["']([a-zA-Z0-9_:-]+)["']/gs,
            ];

            patterns.forEach(pattern => {
              let match;
              while ((match = pattern.exec(txt))) {
                if (match[1] && !ids.has(match[1])) {
                  ids.add(match[1]);
                  debugData.push(`Found rdt init: ${match[1]}`);
                }
              }
            });

            // Look for a2_ pattern (Reddit's pixel ID format) - more specific
            // This pattern looks for a2_ followed by alphanumeric/underscore
            const a2Pattern = /["'](a2_[a-z0-9_]{5,})['"]/gi;
            let m;
            while ((m = a2Pattern.exec(txt))) {
              if (m[1] && !ids.has(m[1])) {
                ids.add(m[1]);
                debugData.push(`Found a2_ pattern: ${m[1]}`);
              }
            }

            // Look for direct assignment patterns: window.redditPixelId = 'xxx' or similar
            const assignPattern = /(?:reddit.*?pixel.*?id|pixel.*?id).*?["']([a-z0-9_]{10,})["']/gi;
            while ((m = assignPattern.exec(txt))) {
              if (m[1] && m[1].startsWith('a2_') && !ids.has(m[1])) {
                ids.add(m[1]);
                debugData.push(`Found assignment pattern: ${m[1]}`);
              }
            }
          });

          // If we found IDs in scripts but not in mirror, add them
          if (ids.size > 0) {
            ids.forEach(id => {
              if (!mirror.some((arr: any) => arr[0] === 'init' && arr[1] === id)) {
                mirror.push(['init', id]);
              }
            });
          }
        } catch (e) {
          debugData.push(`Script parsing error: ${e}`);
        }
        const pixelIds = new Set<string>();
        const collected: any[] = [];
        function processCall(arr: any[]) {
          if (!Array.isArray(arr)) return;
          const [cmd, a1, a2] = arr;
          if (cmd === 'init' && typeof a1 === 'string') pixelIds.add(a1);
          else if (cmd === 'track' && typeof a1 === 'string') {
            collected.push({ type: a1, params: (typeof a2 === 'object' && a2) ? a2 : {}, eventId: a2?.event_id });
          }
        }
        calls.forEach(processCall);
        mirror.forEach(processCall);
        try { const wAny: any = w.rdt; if (wAny && !pixelIds.size) { if (typeof wAny.id === 'string') pixelIds.add(wAny.id); if (typeof wAny._id === 'string') pixelIds.add(wAny._id); } } catch { }
        return { pixelIds: Array.from(pixelIds), events: collected, debug: debugData };
      });
      if (data.debug) debugInfo.push(...data.debug);
      if (data.pixelIds.length || networkIds.size) {
        aggregated = { pixelIds: Array.from(new Set([...data.pixelIds, ...Array.from(networkIds)])), events: data.events };
        if (aggregated.pixelIds.length) break;
      }
    }
    page.off('request', reqListener);
    page.off('response', responseListener);

    // Add network request info to debug
    if (networkRequests.length > 0) {
      debugInfo.push(`Network requests captured: ${networkRequests.length}`);
      networkRequests.forEach((req, idx) => {
        const preview = req.url.length > 100 ? req.url.substring(0, 100) + '...' : req.url;
        debugInfo.push(`  Request ${idx + 1}: ${preview}${req.postData ? ' (has POST data)' : ''}`);
      });
    }
    if (networkIds.size > 0) {
      debugInfo.push(`Network pixel IDs captured: ${Array.from(networkIds).join(', ')}`);
    } else {
      debugInfo.push(`No pixel IDs found in network requests`);
    }

    if (pixelScriptLoaded) {
      debugInfo.push(`Reddit pixel.js script was loaded`);
    }

    // 4. Build result
    if (aggregated.pixelIds.length || pixelScriptLoaded) {
      result.found = true;
      const ids = aggregated.pixelIds.length ? aggregated.pixelIds : ['unknown'];
      result.pixels = ids.map(pid => ({
        pixelId: pid,
        loadTime: Date.now() - startTime,
        pageUrl: page.url(),
        events: aggregated.events.map((ev: any) => ({
          eventType: ev.type,
          timestamp: Date.now(),
          parameters: ev.params,
          source: 'Pixel Code',
          eventId: ev.eventId
        }))
      }));
    }

    // Add debug information to help troubleshoot
    result.errors = result.errors || [];
    if (debugInfo.length > 0) {
      result.errors.push(`Debug info: ${debugInfo.join('; ')}`);
    } else {
      result.errors.push(`No Reddit pixel patterns found. Checked for rdt() calls and script patterns.`);
    }
  } catch (e) {
    result.errors?.push(`Reddit Pixel analysis failed: ${e instanceof Error ? e.message : String(e)}`);
  }
  return result;
}

/**
 * Analyze Reddit Pixel and capture extra events triggered by button clicks.
 */
export async function analyzeRedditPixelWithClicks(page: Page): Promise<RedditPixelInfo> {
  const baseline = await analyzeRedditPixel(page);
  if (!baseline.found) return baseline;
  try {
    await dismissModals(page);
    const buttons = await page.locator(BUTTON_CSS_SELECTORS).all();
    const existingKeys = new Set<string>();
    baseline.pixels?.forEach(p => p.events?.forEach(ev => existingKeys.add(ev.eventType + '|' + (ev.eventId || ''))));
    for (const button of buttons) {
      try {
        if (await button.isVisible()) {
          const capturePromise = page.evaluate(() => {
            return new Promise<any[]>(resolve => {
              const w: any = window; const before = (w.__redditEventsMirror || []).length; setTimeout(() => {
                const arr = w.__redditEventsMirror || []; resolve(arr.slice(before));
              }, 600);
            });
          });
          try { await button.click({ timeout: 3000 }); } catch { await button.click({ force: true, timeout: 3000 }); }
          // Short wait
          const mirrorCalls = await capturePromise;
          const newData = mirrorCalls.filter((m: any) => Array.isArray(m) && m[0] === 'track').map((m: any) => ({ type: m[1], params: m[2] || {}, eventId: m[2]?.event_id }));
          if (newData && baseline.pixels) {
            for (const p of baseline.pixels) {
              p.events = p.events || [];
              for (const ev of newData) {
                const key = ev.type + '|' + (ev.eventId || '');
                if (!existingKeys.has(key) && (ev.type === 'ButtonClick' || ev.type === 'SignUp')) {
                  p.events.push({ eventType: ev.type, timestamp: Date.now(), parameters: ev.params, source: 'Pixel Code', eventId: ev.eventId });
                  existingKeys.add(key);
                }
              }
            }
          }
        }
      } catch { /* ignore */ }
    }
  } catch { /* ignore */ }
  // Re-scan to merge any new events
  const after = await analyzeRedditPixel(page);
  if (after.found && after.pixels?.length) {
    after.pixels.forEach(ap => {
      const existing = baseline.pixels?.find(bp => bp.pixelId === ap.pixelId);
      if (!existing) baseline.pixels?.push(ap);
      else ap.events?.forEach(ev => { if (!existing.events?.some(e => e.eventType === ev.eventType && e.eventId === ev.eventId)) { existing.events = existing.events || []; existing.events.push(ev); } });
    });
    baseline.found = true;
  }
  return baseline;
}

/**
 * Global Pixel Info interface
 * Tracks pixel_global.js?t=TIMESTAMP requests
 */
export interface GlobalPixelInfo {
  found: boolean;
  scriptUrl?: string;
  pixelId?: string; // The timestamp after ?t=
  loadTime?: number;
  pageUrl?: string;
  responseHeaders?: Record<string, string>;
  errors?: string[];
}

/**
 * Meta Pixel (Facebook Pixel) event interface
 */
export interface MetaPixelEvent {
  eventType: string;
  timestamp: number;
  parameters?: Record<string, any>;
  source?: string;
}

/**
 * Meta Pixel (Facebook Pixel) data per pixel ID
 */
export interface MetaPixelData {
  pixelId: string;
  loadTime?: number;
  pageUrl?: string;
  events?: MetaPixelEvent[];
}

/**
 * Meta Pixel Info interface
 * Tracks fbevents.js and /tr/ requests for Facebook pixels
 */
export interface MetaPixelInfo {
  found: boolean;
  pixels?: MetaPixelData[];
  errors?: string[];
}

/**
 * Analyze the page for Global Pixel implementation (pixel_global.js?t=TIMESTAMP)
 * This detects script tags or network requests matching the pattern.
 */
export async function analyzeGlobalPixel(
  page: Page,
  networkScriptUrl?: string,
  networkPixelId?: string
): Promise<GlobalPixelInfo> {
  const result: GlobalPixelInfo = { found: false, errors: [] };
  const startTime = Date.now();

  try {
    // Check if we have network-detected pixel info from CDP
    if (networkScriptUrl && networkPixelId) {
      result.found = true;
      result.scriptUrl = networkScriptUrl;
      result.pixelId = networkPixelId;
      result.loadTime = Date.now() - startTime;
      result.pageUrl = page.url();
      console.log(`Global Pixel detected from network: ${networkScriptUrl} (ID: ${networkPixelId})`);
      return result;
    }

    // Wait a bit for page to load
    await page.waitForTimeout(500);

    // Check for global pixel script in the page
    const pixelData = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const globalPixelScript = scripts.find(script => {
        const src = (script as HTMLScriptElement).src;
        return src.includes('pixel_global.js');
      });

      if (globalPixelScript) {
        const src = (globalPixelScript as HTMLScriptElement).src;
        const match = src.match(/pixel_global\.js\?t=(\d+)/);
        return {
          found: true,
          scriptUrl: src,
          pixelId: match ? match[1] : undefined
        };
      }

      // Also check window object for loaded pixel
      const win = window as any;
      if (win.__globalPixelLoaded && win.__globalPixelId) {
        return {
          found: true,
          scriptUrl: `pixel_global.js?t=${win.__globalPixelId}`,
          pixelId: win.__globalPixelId
        };
      }

      return { found: false };
    });

    if (pixelData.found) {
      result.found = true;
      result.scriptUrl = pixelData.scriptUrl;
      result.pixelId = pixelData.pixelId;
      result.loadTime = Date.now() - startTime;
      result.pageUrl = page.url();
    }
  } catch (e) {
    result.errors?.push(`Global Pixel analysis failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  return result;
}

/**
 * Analyze the page for Meta Pixel (Facebook Pixel) implementation
 * Detects fbevents.js script and extracts pixel IDs from /tr/ requests
 */
export async function analyzeMetaPixel(
  page: Page,
  networkPixelIds: Set<string> = new Set()
): Promise<MetaPixelInfo> {
  const result: MetaPixelInfo = { found: false, errors: [] };
  const startTime = Date.now();

  try {
    // If we have pixel IDs from network interception, use them directly
    if (networkPixelIds.size > 0) {
      console.log(`Using ${networkPixelIds.size} Meta Pixel ID(s) detected from network: ${Array.from(networkPixelIds).join(', ')}`);

      result.found = true;
      result.pixels = Array.from(networkPixelIds).map(pixelId => ({
        pixelId,
        loadTime: Date.now() - startTime,
        pageUrl: page.url(),
        events: []
      }));

      result.errors?.push(`Debug: Found ${networkPixelIds.size} pixel ID(s) from network requests: ${Array.from(networkPixelIds).join(', ')}`);
      return result;
    }

    // Fallback: Check page for fbevents.js script and fbq object
    const pixelData = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      const hasFbEvents = scripts.some(s => s.src && s.src.includes('fbevents.js'));

      // Check for fbq object (Facebook Pixel base code)
      const win = window as any;
      const hasFbq = typeof win.fbq === 'function';

      // Try to extract pixel IDs from fbq calls if available
      const pixelIds: string[] = [];

      // Check if fbq has been initialized with pixel IDs
      if (win._fbq?.instance?.pixelsByID) {
        const pixels = win._fbq.instance.pixelsByID;
        Object.keys(pixels).forEach(id => pixelIds.push(id));
      }

      return {
        found: hasFbEvents || hasFbq,
        hasFbEvents,
        hasFbq,
        pixelIds
      };
    });

    if (pixelData.found) {
      result.found = true;

      if (pixelData.pixelIds.length > 0) {
        result.pixels = pixelData.pixelIds.map(pixelId => ({
          pixelId,
          loadTime: Date.now() - startTime,
          pageUrl: page.url(),
          events: []
        }));
      }

      const debugInfo = `Meta Pixel detected - fbevents.js: ${pixelData.hasFbEvents}, fbq object: ${pixelData.hasFbq}, Pixel IDs: ${pixelData.pixelIds.length}`;
      result.errors?.push(debugInfo);
      console.log(debugInfo);
    }
  } catch (e) {
    result.errors?.push(`Meta Pixel analysis failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  return result;
}

/**
 * Google Tag Manager tag data per tag ID
 */
export interface GoogleTagData {
  tagId: string;
  loadTime?: number;
  pageUrl?: string;
}

/**
 * Google Tag Manager Info interface
 * Tracks gtag.js?id= requests (e.g., G-LM8X8SL3S5, AW-16919438481)
 */
export interface GoogleTagInfo {
  found: boolean;
  tags?: GoogleTagData[];
  errors?: string[];
}

/**
 * Analyze the page for Google Tag Manager implementation
 * Detects gtag.js script and extracts tag IDs from ?id= parameter
 */
export async function analyzeGoogleTag(
  page: Page,
  networkTagIds: Set<string> = new Set()
): Promise<GoogleTagInfo> {
  const result: GoogleTagInfo = { found: false, errors: [] };
  const startTime = Date.now();

  try {
    // If we have tag IDs from network interception, use them directly
    if (networkTagIds.size > 0) {
      console.log(`Using ${networkTagIds.size} Google Tag ID(s) detected from network: ${Array.from(networkTagIds).join(', ')}`);

      result.found = true;
      result.tags = Array.from(networkTagIds).map(tagId => ({
        tagId,
        loadTime: Date.now() - startTime,
        pageUrl: page.url()
      }));

      result.errors?.push(`Debug: Found ${networkTagIds.size} tag ID(s) from network requests: ${Array.from(networkTagIds).join(', ')}`);
      return result;
    }

    // Fallback: Check page for gtag.js script and gtag/dataLayer objects
    const tagData = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      const hasGtag = scripts.some(s => s.src && s.src.includes('googletagmanager.com/gtag/js'));

      // Check for gtag function or dataLayer
      const win = window as any;
      const hasGtagFunction = typeof win.gtag === 'function';
      const hasDataLayer = Array.isArray(win.dataLayer);

      // Try to extract tag IDs from script src URLs
      const tagIds: string[] = [];
      scripts.forEach(s => {
        if (s.src && s.src.includes('googletagmanager.com/gtag/js')) {
          try {
            const url = new URL(s.src);
            const id = url.searchParams.get('id');
            if (id) tagIds.push(id);
          } catch { }
        }
      });

      return {
        found: hasGtag || hasGtagFunction || hasDataLayer,
        hasGtag,
        hasGtagFunction,
        hasDataLayer,
        tagIds
      };
    });

    if (tagData.found) {
      result.found = true;

      if (tagData.tagIds.length > 0) {
        result.tags = tagData.tagIds.map(tagId => ({
          tagId,
          loadTime: Date.now() - startTime,
          pageUrl: page.url()
        }));
      }

      const debugInfo = `Google Tag detected - gtag.js: ${tagData.hasGtag}, gtag function: ${tagData.hasGtagFunction}, dataLayer: ${tagData.hasDataLayer}, Tag IDs: ${tagData.tagIds.length}`;
      result.errors?.push(debugInfo);
      console.log(debugInfo);
    }
  } catch (e) {
    result.errors?.push(`Google Tag analysis failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  return result;
}
