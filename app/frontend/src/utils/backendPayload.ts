import type { CreateConfigRequest, LandingPageConfig, BackendMetadata } from '../types/config.types';
import { generateHtml } from '../config/htmlGenerator';

function stableStringify(value: any): string {
  const sortObj = (v: any): any => {
    if (Array.isArray(v)) return v.map(sortObj);
    if (v && typeof v === 'object') {
      return Object.keys(v).sort().reduce<Record<string, any>>((acc, k) => { acc[k] = sortObj(v[k]); return acc; }, {});
    }
    return v;
  };
  return JSON.stringify(sortObj(value));
}


export async function computeHashHex(input: string): Promise<string> {
  if (typeof window !== 'undefined' && (window as any).crypto?.subtle) {
    try {
      const data = new TextEncoder().encode(input);
      const digest = await (window as any).crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join(''); // full 64 hex chars
    } catch { /* fallback below */ }
  }
  let h1 = 0x811c9dc5; // FNV-1a base
  for (let i = 0; i < input.length; i++) { h1 ^= input.charCodeAt(i); h1 = (h1 * 0x01000193) >>> 0; }
  return ('00000000' + h1.toString(16)).slice(-8).repeat(8); // mimic 64 chars
}

export interface BackendPayloadBuildOptions {
  commit?: string;
  type?: string;
  user?: string;
  timestamp?: string; // override for deterministic tests
  existingId?: string; // reuse existing hashid (e.g., update)
  overrideHtml?: string; // when provided, store this HTML instead of generating
}

export interface BuiltBackendPayload {
  metadata: BackendMetadata;
  config: LandingPageConfig;
}

export async function buildBackendPayload(req: CreateConfigRequest, opts: BackendPayloadBuildOptions = {}): Promise<BuiltBackendPayload> {
  const base = {
    user: opts.user || req.user || 'system',
    type: opts.type || req.type || 'create',
    commit: opts.commit || req.commit || 'create',
    timestamp: opts.timestamp || new Date().toISOString(),
    page_name: req.page_name,
  };
  let generatedHtml: string;
  if (typeof opts.overrideHtml === 'string') {
    generatedHtml = opts.overrideHtml;
  } else {
    try {
      if (req.htmlConfig) {
        // Derive cookie banner enabled flag from landingPageData sections
        const cookieBannerEnabled = !!(req.landingPageData?.sections || []).some((s: any) => s?.type === 'cookiesBanner' && (s?.props?.display !== false));
        const effectiveHtmlCfg = { ...req.htmlConfig, cookieBannerEnabled } as any;
        generatedHtml = generateHtml(effectiveHtmlCfg, req.landingPageData);
      } else {
        generatedHtml = renderBasicHtml(req.landingPageData, req.htmlConfig);
      }
    } catch (e) {
      console.warn('[buildBackendPayload] generateHtml failed, fallback to basic renderer:', e);
      generatedHtml = renderBasicHtml(req.landingPageData, req.htmlConfig);
    }
  }
  const lp_json_obj = { landingPageData: req.landingPageData, htmlConfig: req.htmlConfig || {}, generatedHtml };
  const deterministicContent = { page_name: req.page_name, landingPageData: req.landingPageData, htmlConfig: req.htmlConfig || {}, generatedHtml };
  const hashSource = stableStringify(deterministicContent);
  const hashid = opts.existingId || await computeHashHex(hashSource);
  const lp_json = JSON.stringify(lp_json_obj);

  const metadata: BackendMetadata = { ...base, lp_json, hashid };

  const config: LandingPageConfig = {
    id: hashid,
    backend: metadata,
    landingPageData: req.landingPageData,
    htmlConfig: req.htmlConfig,
    generatedHtml,
    kind: 'unified'
  };

  return { metadata, config };
}

function renderBasicHtml(landingPageData: any, htmlConfig?: any): string {
  const title = (htmlConfig && htmlConfig.title) || landingPageData?.settings?.title || landingPageData?.metadata?.title || 'Landing Page';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>${escapeHtml(title)}</title></head><body><div id="app-root" data-lp='${escapeAttrJSON({ landingPageData })}'></div></body></html>`;
}

function escapeHtml(str: string): string { return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)); }
function escapeAttrJSON(obj: any): string { return JSON.stringify(obj).replace(/'/g, '&#39;'); }
