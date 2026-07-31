import type { LandingPageConfig } from '../types/config.types';
import type { LandingPageRecord } from './landingPages.api';
import { parseLpJson } from './firestoreParsers';

export function mapRecordToLandingPageConfig(rec: LandingPageRecord): LandingPageConfig {
  const parsed = parseLpJson(rec.lp_json, `mapRecordToLandingPageConfig-${rec.page_name}-${rec.hashid}`) || {};

  return {
    id: rec.hashid,
    backend: {
      user: rec.user,
      type: rec.type,
      commit: rec.commit,
      timestamp: rec.timestamp,
      page_name: rec.page_name,
      lp_json: rec.lp_json,
      hashid: rec.hashid,
    },
    landingPageData: parsed.landingPageData || { metadata: {}, settings: {}, sections: [] },
    htmlConfig: parsed.htmlConfig || {},
    generatedHtml: parsed.generatedHtml || '',
    kind: 'unified'
  };
}
