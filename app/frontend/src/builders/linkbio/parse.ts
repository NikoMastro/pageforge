import type { ParsedLinkBio, LinkBioJson, LinkBioServerShape } from './types.js';
import { validateLinkBioJson } from './types.js';

function isValidLinkBioJson(obj: any): obj is LinkBioJson {
  return obj && typeof obj === 'object' && obj.kind === 'LinkBio' && typeof obj.version === 'number';
}
export function parseLinkBioFromServer(raw: LinkBioServerShape): ParsedLinkBio {
  const root = raw as any;
  let candidate: any = raw;

  if (!isValidLinkBioJson(candidate) && candidate?.linkbio) candidate = candidate.linkbio;
  if (!isValidLinkBioJson(candidate) && candidate?.data?.kind === 'LinkBio') candidate = candidate.data;
  if (!isValidLinkBioJson(candidate) && candidate?.json) {
    let jsonPayload = candidate.json;
    if (typeof jsonPayload === 'string') { try { jsonPayload = JSON.parse(jsonPayload); } catch {/* ignore */ } }
    if (isValidLinkBioJson(jsonPayload)) candidate = jsonPayload;
  }
  // Check for 'value' field (Firestore document format)
  if (!isValidLinkBioJson(candidate) && candidate?.value) {
    let valuePayload = candidate.value;
    if (typeof valuePayload === 'string') { try { valuePayload = JSON.parse(valuePayload); } catch {/* ignore */ } }
    if (isValidLinkBioJson(valuePayload)) {
      candidate = valuePayload;
    } else if (valuePayload && typeof valuePayload === 'object') {
      // If value contains a nested structure, check for common patterns
      if (valuePayload.linkbio) candidate = valuePayload.linkbio;
      else if (valuePayload.data?.kind === 'LinkBio') candidate = valuePayload.data;
      else candidate = valuePayload; // Use value as-is if it might be builder state
    }
  }
  if (!isValidLinkBioJson(candidate) && candidate?.kind === 'LinkBio') candidate = candidate;

  const isBuilderState = (obj: any) => obj && typeof obj === 'object'
    && obj.general && obj.link
    && (obj.stores || obj.consoles || obj.mobile || obj.social || obj.footer || obj.backgrounds);

  if (!isValidLinkBioJson(candidate) && isBuilderState(candidate)) {
    const builderState = candidate;

    const tsString: string | undefined = (typeof root?.Timestamp === 'string' ? root.Timestamp : undefined)
      || (typeof root?.timestamp === 'string' ? root.timestamp : undefined);
    const tsSeconds: number | undefined = (root?.serverTimestamp && typeof root.serverTimestamp._seconds === 'number')
      ? root.serverTimestamp._seconds : undefined;
    const isoNow = new Date().toISOString();
    const isoTs = tsString || (typeof tsSeconds === 'number' ? new Date(tsSeconds * 1000).toISOString() : isoNow);

    // Backgrounds: prefer explicit backgrounds block, fallback to general.* kept for compatibility
    const bgType = builderState.backgrounds?.backgroundType || builderState.general.backgroundType || 'solid';
    const bgValue = builderState.backgrounds?.backgroundValue || builderState.general.backgroundValue || '#000000';
    const hasSecondary = !!(builderState.backgrounds && builderState.backgrounds.secondaryBackgroundValue);
    const secondaryBg = hasSecondary ? {
      type: builderState.backgrounds.secondaryBackgroundType || 'solid',
      value: builderState.backgrounds.secondaryBackgroundValue || bgValue,
    } : undefined;

    // Helper to extract URL from either flat format (string) or object format ({ url: string, ... })
    const extractUrl = (val: any) => {
      if (typeof val === 'string') return val;
      if (val && typeof val === 'object' && val.url) return val.url;
      return '';
    };

    // Helper to validate if URL is actually usable (not a placeholder)
    const isValidUrl = (url: string | undefined): boolean => {
      if (!url || typeof url !== 'string') return false;
      const trimmed = url.trim().toLowerCase();
      // Reject common placeholders
      if (trimmed === '' || trimmed === 'here' || trimmed === 'tbd' || trimmed === 'todo') return false;
      // Could add more validation like checking for http/https, but keeping simple for now
      return true;
    };

    // Helper to extract a property from object or flat format
    const extractProp = (src: any, platform: string, prop: string) => {
      const val = src?.[platform];
      if (val && typeof val === 'object' && val[prop]) {
        return val[prop];
      }
      // Check flat format - handle special cases
      let flatKey: string;
      if (prop === 'cta' || prop === 'label') {
        flatKey = `${platform}Cta`; // Flat format uses 'Cta' for both cta and label
      } else if (prop === 'pf-data-platform') {
        flatKey = `${platform}Id`; // Flat format stores pf-data-platform as {platform}Id
      } else if (prop === 'dataLabel') {
        flatKey = `${platform}Label`;
      } else if (prop === 'className') {
        flatKey = `${platform}ClassName`;
      } else {
        flatKey = `${platform}${prop.charAt(0).toUpperCase() + prop.slice(1)}`;
      }
      if (src?.[flatKey]) {
        return src[flatKey];
      }
      return undefined;
    };

    // Helper to extract label/cta with priority: label > cta (for backward compatibility)
    const extractLabel = (src: any, platform: string) => {
      const val = src?.[platform];
      if (val && typeof val === 'object') {
        return val.label || val.cta; // Prefer label, fallback to cta
      }
      // Flat format: check for {platform}Cta
      return src?.[`${platform}Cta`];
    };

    const linkBioJson: LinkBioJson = {
      version: 1,
      kind: 'LinkBio',
      id: builderState.general?.configName || builderState.link?.slug || 'linkbio',
      meta: {
        title: builderState.general?.pageTitle || builderState.general?.configName || 'Untitled',
        description: builderState.general?.gameDescription || '',
        slug: builderState.link?.slug || (builderState.general?.configName || 'linkbio'),
        createdAt: isoTs,
        updatedAt: isoTs,
      },
      appearance: {
        background: { type: bgType, value: bgValue },
        secondaryBackground: secondaryBg,
        profileImageUrl: builderState.link?.profileImageUrl,
        faviconUrl: builderState.link?.faviconUrl,
        illustrationUrl: builderState.link?.illustrationUrl,
      },
      links: {
        stores: {
          steam: (() => {
            const steamRaw = (builderState.stores as any)?.steam;
            const url = extractUrl(steamRaw);
            const label = extractLabel(builderState.stores, 'steam');
            const pfDataPlatform = extractProp(builderState.stores, 'steam', 'pf-data-platform') || 'steam';

            return isValidUrl(url) ? {
              url: url,
              label: label,
              'pf-data-platform': pfDataPlatform,
              dataLabel: extractProp(builderState.stores, 'steam', 'dataLabel'),
              className: extractProp(builderState.stores, 'steam', 'className'),
            } : undefined;
          })(),
          epic: (() => {
            const url = extractUrl((builderState.stores as any)?.epic);
            return isValidUrl(url) ? {
              url,
              label: extractLabel(builderState.stores, 'epic'),
              'pf-data-platform': extractProp(builderState.stores, 'epic', 'pf-data-platform') || 'epic',
              dataLabel: extractProp(builderState.stores, 'epic', 'dataLabel'),
              className: extractProp(builderState.stores, 'epic', 'className'),
            } : undefined;
          })(),
          custom: (builderState.stores as any)?.custom,
          order: (builderState.stores as any)?.order,
        },
        consoles: {
          playstation: (() => {
            const url = extractUrl((builderState.consoles as any)?.playstation);
            return isValidUrl(url) ? {
              url,
              label: extractLabel(builderState.consoles, 'playstation'),
              'pf-data-platform': extractProp(builderState.consoles, 'playstation', 'pf-data-platform') || 'playstation',
              dataLabel: extractProp(builderState.consoles, 'playstation', 'dataLabel'),
              className: extractProp(builderState.consoles, 'playstation', 'className'),
            } : undefined;
          })(),
          xbox: (() => {
            const url = extractUrl((builderState.consoles as any)?.xbox);
            return isValidUrl(url) ? {
              url,
              label: extractLabel(builderState.consoles, 'xbox'),
              'pf-data-platform': extractProp(builderState.consoles, 'xbox', 'pf-data-platform') || 'xbox',
              dataLabel: extractProp(builderState.consoles, 'xbox', 'dataLabel'),
              className: extractProp(builderState.consoles, 'xbox', 'className'),
            } : undefined;
          })(),
          switch: (() => {
            const url = extractUrl((builderState.consoles as any)?.switch);
            return isValidUrl(url) ? {
              url,
              label: extractLabel(builderState.consoles, 'switch'),
              'pf-data-platform': extractProp(builderState.consoles, 'switch', 'pf-data-platform') || 'switch',
              dataLabel: extractProp(builderState.consoles, 'switch', 'dataLabel'),
              className: extractProp(builderState.consoles, 'switch', 'className'),
            } : undefined;
          })(),
          custom: (builderState.consoles as any)?.custom,
          order: (builderState.consoles as any)?.order,
        },
        mobile: {
          ios: (() => {
            const url = extractUrl((builderState.mobile as any)?.ios);
            return isValidUrl(url) ? {
              url,
              label: extractLabel(builderState.mobile, 'ios'),
              'pf-data-platform': extractProp(builderState.mobile, 'ios', 'pf-data-platform') || 'ios',
              dataLabel: extractProp(builderState.mobile, 'ios', 'dataLabel'),
            } : undefined;
          })(),
          android: (() => {
            const url = extractUrl((builderState.mobile as any)?.android);
            return isValidUrl(url) ? {
              url,
              label: extractLabel(builderState.mobile, 'android'),
              'pf-data-platform': extractProp(builderState.mobile, 'android', 'pf-data-platform') || 'android',
              dataLabel: extractProp(builderState.mobile, 'android', 'dataLabel'),
            } : undefined;
          })(),
          order: (builderState.mobile as any)?.order,
        },
        social: {
          x: builderState.social?.x,
          instagram: builderState.social?.instagram,
          discord: builderState.social?.discord,
          youtube: builderState.social?.youtube,
          custom: builderState.social?.custom,
          order: builderState.social?.order,
        },
        footer: {
          privacyUrl: builderState.footer?.privacyUrl,
          termsUrl: builderState.footer?.termsUrl,
          custom: builderState.footer?.custom,
          order: builderState.footer?.order,
        },
        order: builderState.linksOrder,
      },
      pixel: builderState.pixel?.usePixelScript ? {
        enabled: !!builderState.pixel.usePixelScript,
        mode: (builderState.pixel.pixelMode || 'none') as any,
        gameId: builderState.pixel.gameId,
        partnerId: builderState.pixel.partnerId,
        customPixelUrl: builderState.pixel.customPixelUrl,
        isTest: builderState.pixel.isTest,
        detectionType: (builderState.pixel as any).detectionType,
        mainUrl: (builderState.pixel as any).mainUrl,
        fallbackUrl: (builderState.pixel as any).fallbackUrl,
        customPixelVars: (() => {
          const raw = (builderState.pixel as any).customPixelVars;
          if (!raw) return undefined;
          try { const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw; return Array.isArray(parsed) ? parsed : undefined; } catch { return undefined; }
        })(),
      } : undefined,
    };

    const issues = validateLinkBioJson(linkBioJson);
    if (issues.length) {
      console.warn('[parseLinkBioFromServer] validation issues:', issues.join(', '));
    }
    return { kind: 'LinkBio', json: linkBioJson };
  }

  if (!isValidLinkBioJson(candidate)) {
    throw new Error('LinkBio JSON not found in server response');
  }

  // Normalize links structure to ensure all required properties exist
  candidate.links = candidate.links || {};
  candidate.links.stores = candidate.links.stores || {};
  candidate.links.consoles = candidate.links.consoles || {};
  candidate.links.mobile = candidate.links.mobile || {};
  candidate.links.social = candidate.links.social || {};
  candidate.links.footer = candidate.links.footer || {};
  candidate.links.order = candidate.links.order || [];

  // Normalize appearance
  candidate.appearance = candidate.appearance || { background: { type: 'solid', value: '#000' } };
  if (!candidate.appearance.background) {
    candidate.appearance.background = { type: 'solid', value: '#000' };
  }

  const issues = validateLinkBioJson(candidate);
  if (issues.length) {
    console.warn('[parseLinkBioFromServer] validation issues:', issues.join(', '));
  }

  return { kind: 'LinkBio', json: candidate };
}

export type { LinkBioJson };
