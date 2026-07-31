// Main exports for builderLandingPages - parsing only
// Rendering is now handled by @pageforge/static-websites components
export { parseServerResponse as parseLandingPageFromServer } from './parse.js';
export { parseServerResponse } from './parse.js'; // Alias for backward compatibility

// Types
export type { ServerReturnShape, UnifiedPostBuild, ParsedLandingPage } from './parse.js';
export type { HtmlGeneratorConfig } from './api.types.js';
export type { BackendMetadata, LandingPageConfig } from './config.types.js';
