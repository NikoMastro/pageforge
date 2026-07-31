/**
 * Utility functions for Steam Widget URL construction
 */

export interface UtmParams {
  source?: string;
  campaign?: string;
  medium?: string;
  content?: string;
  term?: string;
}

/**
 * Builds Steam widget URL with optional country code and UTM parameters
 * @param gameId - Steam game ID
 * @param cc - Country code (e.g., 'br', 'es', 'fr')
 * @param utm - UTM parameters for tracking
 * @returns Complete Steam widget URL
 */
export const buildSteamWidgetUrl = (
  gameId: string,
  cc: string | null = null,
  utm: UtmParams = {}
): string => {
  let url = `https://store.steampowered.com/widget/${gameId}/`;
  const params = new URLSearchParams();

  // Add country code if provided
  if (cc) {
    params.append('cc', cc);
  }

  // Add UTM parameters with default source
  const utmSource = utm.source || 'pageforge';
  params.append('utm_source', utmSource);

  // Add other UTM parameters only if they have values
  if (utm.campaign) {
    params.append('utm_campaign', utm.campaign);
  }
  if (utm.medium) {
    params.append('utm_medium', utm.medium);
  }
  if (utm.content) {
    params.append('utm_content', utm.content);
  }
  if (utm.term) {
    params.append('utm_term', utm.term);
  }

  // Add parameters to URL if any exist
  const paramString = params.toString();
  if (paramString) {
    url += `?${paramString}`;
  }

  return url;
};
