/**
 * Capture Services Module
 * Handles S2S (server-to-server), Game, and Redirect capture logic.
 */

import type { Page, Request as PWRequest, Response as PWResponse } from 'playwright-core';
import { BUTTON_CSS_SELECTORS } from '../shared/index.js';
import type { GghstInfo, RedirectInfo, CombinedButtonClickResult } from './types.js';

/**
 * Click the first visible button and capture Gghst and Redirect info in one go.
 * This avoids multiple clicks on the same button which could cause navigation issues.
 *
 * Important order:
 * 1. Gghst triggers on button click (captured immediately)
 * 2. Redirect happens after a delay
 */
export async function clickButtonAndCaptureAll(page: Page): Promise<CombinedButtonClickResult> {
  const result: CombinedButtonClickResult = {
    gghst: { found: false },
    redirect: { occurred: false }
  };

  try {
    // Set up listeners BEFORE clicking
    let gghstResolved = false;

    // Helper to create response listener with timeout
    const createResponseListener = <T extends { found: boolean }>(
      urlPattern: RegExp,
      timeoutMs: number,
      logPrefix: string,
      onMatch: (response: any) => Promise<T> | T
    ): Promise<T> => {
      return new Promise<T>((resolve) => {
        let resolved = false;

        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve({ found: false } as T);
          }
        }, timeoutMs);

        const responseHandler = async (response: any) => {
          if (resolved) return;
          try {
            const url = response.url();
            if (urlPattern.test(url)) {
              resolved = true;
              clearTimeout(timeout);
              page.off('response', responseHandler);

              const info = await onMatch(response);
              console.log(`${logPrefix}: ${url} - Status: ${response.status()}`);
              resolve(info);
            }
          } catch { }
        };

        page.on('response', responseHandler);
      });
    };

    // Gghst listener - triggers on click (combines previous s2s and games tests)
    const gghstPromise = createResponseListener<GghstInfo>(
      /gghst\.cc/i,
      4000,
      'Gghst response captured',
      async (response) => {
        const gghstInfo: GghstInfo = {
          found: true,
          url: response.url(),
          method: response.request().method(),
          status: response.status(),
          ok: response.ok()
        };

        // Extract script name from the URL path
        try {
          const urlObj = new URL(response.url());
          const pathParts = urlObj.pathname.split('/').filter(Boolean);
          if (pathParts.length >= 2 && pathParts[0] === 'ingest') {
            gghstInfo.scriptName = pathParts[1];
          }
        } catch (e) {
          // URL parsing failed, ignore
        }

        try {
          const body = await response.text();
          gghstInfo.bigQueryMessage = body;
        } catch { }

        return gghstInfo;
      }
    );

    // Find and click the first visible button
    const buttons = await page.locator(BUTTON_CSS_SELECTORS).all();
    const beforeClickUrl = page.url();
    let buttonClicked = false;

    for (const button of buttons) {
      try {
        const isVisible = await button.isVisible({ timeout: 1000 });
        if (isVisible) {
          console.log('Clicking button to capture Gghst and Redirect...');

          // Try normal click first, then force click if needed
          try {
            await button.click({ timeout: 5000 });
          } catch {
            await button.click({ force: true, timeout: 3000 }).catch(() => { });
          }

          buttonClicked = true;
          break; // Only click the first button
        }
      } catch (e) {
        console.log('Failed to click button:', e instanceof Error ? e.message : String(e));
      }
    }

    if (!buttonClicked) {
      console.log('No visible buttons found');
      return result;
    }

    // IMPORTANT: Wait for Gghst to resolve FIRST (before checking redirect)
    // This is because Gghst request happens BEFORE the redirect
    console.log('Waiting for Gghst request (before redirect)...');
    const gghstResult = await gghstPromise;

    result.gghst = gghstResult;
    console.log(`Gghst found: ${gghstResult.found}`);

    // NOW check for redirect (after S2S and Game have been captured)
    console.log(`URL before checking redirect: ${beforeClickUrl}`);

    // Wait for potential URL change (redirect)
    try {
      await page.waitForURL((url) => url.toString() !== beforeClickUrl, { timeout: 10000 });
    } catch {
      // Timeout or no redirect - will check URL below
    }

    // Give it a moment to stabilize after navigation
    await page.waitForTimeout(500);

    // Check if URL changed (redirect occurred)
    const afterClickUrl = page.url();

    if (beforeClickUrl !== afterClickUrl) {
      result.redirect = {
        occurred: true,
        fromUrl: beforeClickUrl,
        toUrl: afterClickUrl
      };
      console.log(`✓ Redirect detected: ${beforeClickUrl} -> ${afterClickUrl}`);
    } else {
      console.log(`✗ No redirect detected`);
    }
  } catch (e) {
    console.log('Error in clickButtonAndCaptureAll:', e instanceof Error ? e.message : String(e));
  }

  return result;
}

/**
 * Listen for requests whose URL includes "gghst.cc" (combines previous s2s and games tests).
 * Expected URL pattern: https://[preprod|prod].gghst.cc/ingest/p
 * Script name: "p"
 */
export async function captureGghst(page: Page): Promise<GghstInfo> {
  const result: GghstInfo = { found: false };
  const allRequests: string[] = [];

  return await new Promise<GghstInfo>((resolve) => {
    const timeout = setTimeout(() => {
      console.log('Gghst timeout reached. All requests captured:');
      console.log(allRequests.join('\n'));
      cleanup();
      resolve(result);
    }, 8000);

    const onRequest = (req: PWRequest) => {
      const url = req.url();
      const method = req.method();
      allRequests.push(`${method} ${url}`);

      if (!result.found && url.toLowerCase().includes('gghst.cc')) {
        console.log(`Gghst request detected: ${method} ${url}`);
        result.found = true;
        result.url = url;
        result.method = method;

        // Extract script name from the URL path (e.g., /ingest/p -> "p")
        try {
          const urlObj = new URL(url);
          const pathParts = urlObj.pathname.split('/').filter(Boolean);
          if (pathParts.length >= 2 && pathParts[0] === 'ingest') {
            result.scriptName = pathParts[1];
          }
        } catch (e) {
          // URL parsing failed, ignore
        }
      }
    };

    const onResponse = async (res: PWResponse) => {
      try {
        const req = res.request();
        const url = req.url();
        const method = req.method();
        if (url.toLowerCase().includes('gghst.cc')) {
          console.log(`Gghst response received: ${method} ${url} - Status: ${res.status()}`);
          result.found = true;
          result.url = url;
          result.method = method;
          result.status = res.status();
          result.ok = res.ok();

          // Extract script name from the URL path
          try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/').filter(Boolean);
            if (pathParts.length >= 2 && pathParts[0] === 'ingest') {
              result.scriptName = pathParts[1];
            }
          } catch (e) {
            // URL parsing failed, ignore
          }

          cleanup();
          clearTimeout(timeout);
          resolve(result);
        }
      } catch (err) {
        // ignore
      }
    };

    const onRequestFailed = (req: PWRequest) => {
      const url = req.url();
      const method = req.method();
      if (url.toLowerCase().includes('gghst.cc')) {
        console.log(`Gghst request failed: ${method} ${url}`);
        result.found = true;
        result.url = url;
        result.method = method;
        result.error = req.failure()?.errorText || 'Request failed';

        // Extract script name from the URL path
        try {
          const urlObj = new URL(url);
          const pathParts = urlObj.pathname.split('/').filter(Boolean);
          if (pathParts.length >= 2 && pathParts[0] === 'ingest') {
            result.scriptName = pathParts[1];
          }
        } catch (e) {
          // URL parsing failed, ignore
        }

        cleanup();
        clearTimeout(timeout);
        resolve(result);
      }
    };

    function cleanup() {
      page.off('request', onRequest);
      page.off('response', onResponse);
      page.off('requestfailed', onRequestFailed);
    }

    page.on('request', onRequest);
    page.on('response', onResponse);
    page.on('requestfailed', onRequestFailed);
  });
}
