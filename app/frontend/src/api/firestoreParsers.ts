import { parseServerResponse } from '@builders/landingPages/parse';

const loggedParseFailures = new Set<string>();

export function parseJsonWithFallback<T = any>(
  raw: unknown,
  context: string,
  fallback: T = {} as T
): T {
  if (raw == null || raw === '') return fallback;
  if (typeof raw === 'object') return raw as T;
  if (typeof raw !== 'string') return fallback;
  const key = `${context}|${raw.slice(0, 20)}`;
  try {
    return JSON.parse(raw) as T;
  } catch (error: any) {
    if (!loggedParseFailures.has(key)) {
      loggedParseFailures.add(key);
      if (import.meta?.env?.DEV) {
        console.warn(
          `[parseJsonWithFallback] Failed in ${context}: ${error?.message || error}. snippet="${raw.slice(0, 60)}"`
        );
      }
    }
    return fallback;
  }
}

export function parseLpJson(raw: string | null | undefined, context: string) {
  if (!raw) return {} as any;
  const trimmed = raw.trim();
  if (trimmed === '' || /^jsonTemp/.test(trimmed)) {
    const sentinelKey = `sentinel|${context}`;
    if (!loggedParseFailures.has(sentinelKey)) {
      loggedParseFailures.add(sentinelKey);
      if (import.meta?.env?.DEV) {
        console.warn(
          `[parseLpJson] Sentinel/temporary value detected in ${context}. valueStart="${trimmed.slice(0, 50)}"`
        );
      }
    }
    return {} as any;
  }
  try {
    const parsed = parseServerResponse({ lp_json: trimmed });
    return parsed;
  } catch (error: any) {
    const builderKey = `builderLandingPages|${context}`;
    if (!loggedParseFailures.has(builderKey)) {
      loggedParseFailures.add(builderKey);
      if (import.meta?.env?.DEV) {
        console.warn(
          `[parseLpJson] builderLandingPages.parseServerResponse failed in ${context}: ${error?.message || error}`
        );
      }
    }
    return parseJsonWithFallback(trimmed, `lp_json:${context}`, {});
  }
}
