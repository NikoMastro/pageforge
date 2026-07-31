import type { HtmlGeneratorConfig } from './api.types.js';

export interface BackendMetadata {
  user: string;        // author / actor
  type: string;        // change type (e.g. "draft" / "publish")
  commit: string;      // commit / message string
  timestamp: string;   // ISO timestamp
  page_name: string;   // landing page name (unique key)
  lp_json: string;     // serialized JSON payload (hash subject)
  hashid: string;      // content hash
}

export interface LandingPageConfig {
  id: string;                 // mirrors backend.hashid
  backend: BackendMetadata;   // required backend metadata
  htmlConfig?: HtmlGeneratorConfig; // optional html generation config
  generatedHtml?: string;     // optional embedded html snapshot
  kind: 'unified';
}
