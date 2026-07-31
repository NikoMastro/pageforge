// Reuse HtmlGeneratorConfig from builderLandingPages to avoid duplication/divergence
export type { HtmlGeneratorConfig } from '@builders/landingPages/api.types';

// API Response generic type (PageForge-specific)
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
