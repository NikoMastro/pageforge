/**
 * Browser Management Module
 * Handles browser instance creation, configuration, and cleanup.
 */

import type { ChromiumBrowser } from 'playwright-core';
import chromium from '@sparticuz/chromium';
import { CHROMIUM_LAUNCH_ARGS } from '../shared/index.js';
import { spawn } from 'node:child_process';
import http from 'node:http';
import type { BrowserInstance } from './types.js';

/**
 * Resolve Playwright module (full or core version).
 * Prefers full Playwright when available (local dev), fallback to core (serverless).
 */
async function resolvePlaywright(): Promise<typeof import('playwright-core')> {
  try {
    // Prefer full Playwright when available (local dev)
    return (await import('playwright')) as unknown as typeof import('playwright-core');
  } catch {
    // Fallback to core (serverless / production)
    return await import('playwright-core');
  }
}

/**
 * Detect if running in a serverless environment.
 */
function isServerlessEnv(): boolean {
  // Detect Cloud Functions/Run or explicit override
  return Boolean(
    process.env.K_SERVICE ||
    process.env.FUNCTION_TARGET ||
    process.env.GCLOUD_PROJECT ||
    process.env.USE_SPARTICUZ === '1'
  );
}

/**
 * Wait for Chrome DevTools Protocol to be ready.
 */
async function waitForDevtools(baseUrl: string, timeoutMs: number): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise<void>((resolve, reject) => {
        const req = http.get(`${baseUrl}/json/version`, (res) => {
          res.resume();
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 500) {
            resolve();
          } else {
            reject(new Error(`Devtools status ${res.statusCode}`));
          }
        });
        req.on('error', reject);
        req.setTimeout(1000, () => {
          req.destroy(new Error('timeout'));
        });
      });
      return;
    } catch {
      await new Promise(r => setTimeout(r, 200));
    }
  }
  throw new Error(`Devtools endpoint not available at ${baseUrl}`);
}

/**
 * Launch headless Chromium with a random remote debugging port and a fresh context/page.
 */
export async function launchBrowser(): Promise<BrowserInstance> {
  const debuggingPort = 9222 + Math.floor(Math.random() * 1000);
  const playwright = await resolvePlaywright();

  const useServerlessChromium = isServerlessEnv();

  let executablePath: string | undefined;
  let extraArgs: string[] = [];
  let headless: boolean = true;
  let defaultViewport: { width: number; height: number } | null | undefined = undefined;

  if (useServerlessChromium) {
    // @sparticuz/chromium packs a compatible Chromium for serverless
    try {
      if (!chromium) {
        throw new Error('@sparticuz/chromium not available');
      }

      console.log('Configuring @sparticuz/chromium for serverless environment');
      console.log('Chromium object keys:', Object.keys(chromium));

      // Try the standard @sparticuz/chromium approach
      executablePath = await chromium.executablePath();
      extraArgs = chromium.args || [];
      headless = true; // Always use headless in serverless
      defaultViewport = chromium.defaultViewport || { width: 1280, height: 720 };

      console.log('Chromium configuration:', { executablePath, argsCount: extraArgs.length, headless });
    } catch (error) {
      console.error('Error configuring @sparticuz/chromium:', error);
      throw new Error(`Chromium configuration failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (useServerlessChromium) {
    // Spawn Chromium ourselves and connect via CDP to avoid Playwright pipe/port conflicts
    let args = [...extraArgs]
      .filter((a) => !a.startsWith('--remote-debugging-') && a !== '--single-process');
    args = args.map(a => (a.startsWith('--headless') ? '--headless' : a));
    args.push(`--remote-debugging-port=${debuggingPort}`);

    if (!executablePath) {
      throw new Error('Chromium executable path not resolved');
    }

    const chrome = spawn(executablePath, args, { env: { ...process.env }, stdio: 'ignore' });
    const endpointURL = `http://127.0.0.1:${debuggingPort}`;
    await waitForDevtools(endpointURL, 10000);
    const browser = (await (playwright.chromium as any).connectOverCDP({ endpointURL })) as ChromiumBrowser;
    const context = browser.contexts()[0] ?? await browser.newContext({
      viewport: defaultViewport ?? { width: 1200, height: 800 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'en-US',
      timezoneId: 'America/New_York',
      permissions: ['geolocation'],
      geolocation: { latitude: 40.7128, longitude: -74.0060 }, // NYC
    });
    const page = await context.newPage();
    return { browser, context, page, debuggingPort, chromeProcess: chrome };
  } else {
    // Local dev
    const browser = await playwright.chromium.launch({
      args: [...CHROMIUM_LAUNCH_ARGS, `--remote-debugging-port=${debuggingPort}`],
      headless,
    });
    const context = await browser.newContext({
      viewport: { width: 1200, height: 800 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'en-US',
      timezoneId: 'America/New_York',
      permissions: ['geolocation'],
      geolocation: { latitude: 40.7128, longitude: -74.0060 }, // NYC
    });
    const page = await context.newPage();
    return { browser, context, page, debuggingPort };
  }
}

/**
 * Best-effort browser cleanup.
 */
export async function closeBrowser(browserInstance: BrowserInstance): Promise<void> {
  try {
    await browserInstance.context.close();
    await browserInstance.browser.close();
    if (browserInstance.chromeProcess && !browserInstance.chromeProcess.killed) {
      browserInstance.chromeProcess.kill('SIGKILL');
    }
  } catch (error) {
    console.warn('Error closing browser:', error);
  }
}
