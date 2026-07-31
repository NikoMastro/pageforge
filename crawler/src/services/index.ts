// Export original crawler (contains all functions for backward compatibility)
export * from './crawler.js';
export * from './lighthouse.js';

// Export network interceptor for CDP monitoring
export * from './network-interceptor.js';

// NOTE: New modular components are available for direct import:
// - './types.js' - All TypeScript interfaces
// - './browser-manager.js' - Browser launch/close functions
// - './page-interactions.js' - Page navigation and interactions
// - './iframe-analyzer.js' - Iframe analysis
// - './capture-services.js' - S2S, Game, Redirect capture
// - './pixel-trackers/index.js' - Pixel tracking functions
// - './network-interceptor.js' - CDP network interception
// See src/REFACTORING.md for details
