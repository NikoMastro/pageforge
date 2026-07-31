// Explicitly named Chromium launch arguments
export const CHROMIUM_LAUNCH_ARGS = [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-dev-shm-usage',
  '--disable-setuid-sandbox',
  '--no-first-run',
  '--no-zygote',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
  '--disable-features=TranslateUI',
  '--disable-ipc-flooding-protection',
  '--disable-web-security',
  '--disable-features=VizDisplayCompositor',
] as const;

// Lighthouse category keys to collect
export const LIGHTHOUSE_CATEGORY_KEYS = [
  'performance',
  'accessibility',
  'best-practices',
  'seo',
  'pwa',
] as const;

// Lighthouse core audit metric keys to extract
export const LIGHTHOUSE_AUDIT_METRIC_KEYS = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'cumulative-layout-shift',
  'total-blocking-time',
  'speed-index',
] as const;

// Default timeouts (milliseconds)
export const TIMEOUTS_MS = {
  NAVIGATION_MS: 30000,
  LIGHTHOUSE_MS: 60000,
  FUNCTION_MS: 540000,
} as const;

// CSS selector used to detect UI elements that function as buttons
export const BUTTON_CSS_SELECTORS = [
  'button',
  '[role="button"]',
  'input[type="button"]',
  'input[type="submit"]',
].join(', ');

// Backwards-compatible aliases (to be removed in a future major release)
export const CHROMIUM_ARGS = CHROMIUM_LAUNCH_ARGS;
export const LIGHTHOUSE_CATEGORIES = LIGHTHOUSE_CATEGORY_KEYS;
export const LIGHTHOUSE_AUDITS = LIGHTHOUSE_AUDIT_METRIC_KEYS;
export const DEFAULT_TIMEOUTS = {
  NAVIGATION: TIMEOUTS_MS.NAVIGATION_MS,
  LIGHTHOUSE: TIMEOUTS_MS.LIGHTHOUSE_MS,
  FUNCTION: TIMEOUTS_MS.FUNCTION_MS,
} as const;
export const BUTTON_SELECTORS = BUTTON_CSS_SELECTORS;
