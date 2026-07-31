import type { HtmlGeneratorConfig } from './api.types.js';

export interface ServerReturnShape { [k: string]: any }
export type ParsedLandingPage = UnifiedPostBuild;

export interface UnifiedPostBuild {
  page_name?: string;
  landingPageData: any;
  htmlConfig: HtmlGeneratorConfig | undefined;
  generatedHtml?: string;
  hashid?: string;
}

// Parse a server response (like test.json) into a normalized structure
export function parseServerResponse(raw: ServerReturnShape): UnifiedPostBuild {
  // Accepted patterns:
  // 1. Unified direct shape: { landingPageData, htmlConfig?, generatedHtml? }
  // 2. Firestore doc shape: { user, page_name, lp_json: string | object }
  // 3. Legacy wrapped: { metadata: { lp_json: string | object, page_name } }
  // 4. Expanded: { lp_json: { landingPageData, htmlConfig, generatedHtml } }
  let landingPageData: any | undefined;
  let htmlConfig: any | undefined;
  let generatedHtml: string | undefined;
  const page_name = raw.page_name || raw.metadata?.page_name;
  const hashid = raw.hashid || raw.metadata?.hashid;

  const extract = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    if (obj.landingPageData !== undefined) landingPageData = obj.landingPageData;
    if (obj.htmlConfig !== undefined) htmlConfig = obj.htmlConfig;
    if (obj.generatedHtml !== undefined) generatedHtml = obj.generatedHtml;
  };

  // Case 1: unified direct
  if (raw.landingPageData) extract(raw);

  // Case 2/4: lp_json field present
  if (!landingPageData && raw.lp_json) {
    let lp: any = raw.lp_json;
    if (typeof lp === 'string') {
      try { lp = JSON.parse(lp); } catch { /* ignore parse failure */ }
    }
    extract(lp);
  }

  // Case 3: metadata.lp_json
  if (!landingPageData && raw.metadata?.lp_json) {
    let metaLp: any = raw.metadata.lp_json;
    if (typeof metaLp === 'string') {
      try { metaLp = JSON.parse(metaLp); } catch { /* ignore */ }
    }
    extract(metaLp);
  }

  if (!landingPageData) throw new Error('landingPageData not found in server response');
  return { page_name, landingPageData, htmlConfig, generatedHtml, hashid };
}
