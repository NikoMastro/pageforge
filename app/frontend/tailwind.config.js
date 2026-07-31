import deploymentConfig from '../deployment-runtime/tailwind.config.js';

/**
 * Re-export the deployment runtime's Tailwind config verbatim so the editor
 * preview and the rendered/deployed pages share one identical compilation.
 * (Previously this file overrode `content` with a broken relative path,
 * which silently dropped every utility class used only by the shared
 * static-websites components — making the preview and the opened page
 * render differently.)
 */
export default deploymentConfig;
