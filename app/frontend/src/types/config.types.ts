import type { LandingPageData } from './shared.types';
import type { HtmlGeneratorConfig } from './api.types';

// Source of truth types from builderLandingPages
export type { BackendMetadata } from '@builders/landingPages/config.types';
import type { LandingPageConfig as BuilderLandingPagesConfig } from '@builders/landingPages/config.types';

/**
 * Unified Landing Page Configuration for PageForge,
 * extending builderLandingPages' base model with the typed landingPageData field that PageForge uses widely.
 */
export interface LandingPageConfig extends Omit<BuilderLandingPagesConfig, 'landingPageData' | 'htmlConfig'> {
  landingPageData: LandingPageData;
  htmlConfig?: HtmlGeneratorConfig;
}

// Legacy JsonConfigItem removed – migrate to LandingPageConfig everywhere.
export type AnyLandingPageConfig = LandingPageConfig; // transitional alias collapsed

// Requests now focused on page_name + content; descriptive fields moved out.
export interface CreateConfigRequest {
  page_name: string; // previously name
  landingPageData: LandingPageData;
  htmlConfig?: HtmlGeneratorConfig;
  commit: string; // commit message
  user: string;   // author / actor
  type: string;   // change type
}

export interface UpdateConfigRequest {
  id: string; // maps to LandingPageConfig.id
  landingPageData?: Partial<LandingPageData>;
  htmlConfig?: Partial<HtmlGeneratorConfig>;
  generatedHtml?: string;
  commit?: string;
  type?: string;
}

export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  failedCount: number;
  errors: string[];
  details: {
    jsonFiles: string[];
    htmlFiles: string[];
    unifiedFiles: string[];
  };
}

// ==========================================
// PAGEFORGE TYPES (migrated from pageforge.types.ts)
// ==========================================
export type DiffSummary = { added: string[]; modified: string[]; removed: string[] };

export type LpJson = {
  page_name: string;
  schema_version: number;
  pageforge_version_hash: string;
  data: Record<string, any>;
};

// Utility type guards
export const isUnifiedConfig = (c: AnyLandingPageConfig): c is LandingPageConfig => (c as any).kind === 'unified';
export const isLegacyConfig = (_c: AnyLandingPageConfig): _c is never => false; // always unified now
