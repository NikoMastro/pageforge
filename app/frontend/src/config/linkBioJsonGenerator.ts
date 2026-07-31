

export interface LinkBioPixelConfig {
  enabled: boolean;
  mode: 'none' | 'full' | 'global' | 'custom';
  gameId?: string;
  partnerId?: string;
  customPixelUrl?: string;
  isTest?: boolean;
  detectionType?: string; // for global
  mainUrl?: string;
  fallbackUrl?: string;
  customPixelVars?: Array<{ key: string; value: string }>; // for custom mode
}

export interface LinkBioGeneralConfig {
  configName: string;
  pageTitle: string;
  gameDescription: string;
  background: {
    type: 'solid' | 'gradient';
    value: string;
  };
}

export interface LinkBioLinkConfig {
  slug: string;
  profileImageUrl?: string;
  faviconUrl?: string;
  illustrationUrl?: string;
}

export interface LinkBioLinkItem {
  url: string;
  label?: string; // Preferred for consistency with custom links
  cta?: string;   // Legacy support, fallback to label
  'az-data-platform'?: string;
  dataLabel?: string;
  className?: string;
  logoUrl?: string;
}

export interface LinkBioStoresConfig {
  steam?: LinkBioLinkItem;
  epic?: LinkBioLinkItem;
  custom?: Array<LinkBioLinkItem & { label: string }>;
  order?: string[]; // Array of store names defining order: ['steam', 'epic', 'custom']
}

export interface LinkBioConsoleConfig {
  playstation?: LinkBioLinkItem;
  xbox?: LinkBioLinkItem;
  switch?: LinkBioLinkItem;
  custom?: Array<LinkBioLinkItem & { label: string }>;
  order?: string[]; // Array of console names defining order: ['playstation', 'xbox', 'switch', 'custom']
}

export interface LinkBioMobileConfig {
  ios?: LinkBioLinkItem;
  android?: LinkBioLinkItem;
  order?: string[]; // Array of mobile platform names defining order: ['ios', 'android']
}

export interface LinkBioSocialConfig {
  x?: string;
  instagram?: string;
  discord?: string;
  youtube?: string;
  custom?: Array<{ logoUrl: string; url: string }>;
  order?: string[]; // Array of platform names defining horizontal order
}

export interface LinkBioFooterConfig {
  privacyUrl?: string;
  termsUrl?: string;
  custom?: Array<{ label: string; url: string; id?: string; dataLabel?: string; className?: string }>;
  order?: string[]; // Array of footer link names defining order: ['privacy', 'terms', 'custom']
}

export interface RawLinkBioState {
  general: {
    configName: string;
    pageTitle: string;
    gameDescription: string;
    backgroundType: 'solid' | 'gradient';
    backgroundValue: string;
  };
  link: {
    slug: string;
    profileImageUrl: string;
    faviconUrl: string;
    illustrationUrl: string;
  };
  pixel: {
    usePixelScript: boolean;
    pixelMode: 'none' | 'global' | 'custom';
    gameId: string;
    partnerId: string;
    customPixelUrl: string;
    isTest: boolean;
  };
  stores: { steam: string; epic: string; epicCta: string };
  consoles: { playstation: string; xbox: string; switch: string };
  mobile: { ios: string; android: string };
  social: { x: string; instagram: string; discord: string; youtube: string };
  footer: { privacyUrl: string; termsUrl: string };
}

export interface LinkBioJson {
  version: 1;
  kind: 'LinkBio';
  id: string; // configName or slug fallback
  meta: {
    title: string;
    description: string;
    slug: string;
    createdAt: string; // ISO
    updatedAt: string; // ISO
  };
  appearance: {
    background: LinkBioGeneralConfig['background'];
    profileImageUrl?: string;
    faviconUrl?: string;
    illustrationUrl?: string;
  };
  links: {
    stores: LinkBioStoresConfig;
    consoles: LinkBioConsoleConfig;
    mobile: LinkBioMobileConfig;
    social: LinkBioSocialConfig;
    footer: LinkBioFooterConfig;
    order?: string[]; // Array of section names defining vertical order: ['social', 'stores', 'consoles', 'mobile', 'footer']
  };
  pixel?: LinkBioPixelConfig; // omitted if disabled
}

export interface GenerateLinkBioJsonOptions {
  state: RawLinkBioState;
  now?: Date;
  previous?: LinkBioJson;
}

export function generateLinkBioJson(opts: GenerateLinkBioJsonOptions): LinkBioJson {
  const { state, now = new Date(), previous } = opts;
  const id = (state.general.configName || state.link.slug || previous?.id || 'untitled').trim();
  const createdAt = previous?.meta.createdAt || now.toISOString();
  const updatedAt = now.toISOString();
  const pixel: LinkBioPixelConfig = state.pixel.usePixelScript && state.pixel.pixelMode !== 'none'
    ? {
      enabled: true,
      mode: state.pixel.pixelMode,
      gameId: state.pixel.gameId || undefined,
      partnerId: state.pixel.partnerId || undefined,
      customPixelUrl: state.pixel.pixelMode === 'custom' ? (state.pixel.customPixelUrl || undefined) : undefined,
      isTest: state.pixel.isTest,
    }
    : {
      enabled: false,
      mode: 'none'
    } as LinkBioPixelConfig;

  const json: LinkBioJson = {
    version: 1,
    kind: 'LinkBio',
    id,
    meta: {
      title: state.general.pageTitle || id,
      description: state.general.gameDescription || '',
      slug: state.link.slug || id,
      createdAt,
      updatedAt
    },
    appearance: {
      background: { type: state.general.backgroundType, value: state.general.backgroundValue },
      profileImageUrl: state.link.profileImageUrl || undefined,
      faviconUrl: state.link.faviconUrl || undefined,
      illustrationUrl: state.link.illustrationUrl || undefined
    },
    links: {
      stores: {
        steam: (state.stores.steam || (state as any).stores?.steam?.url) ? {
          url: (state as any).stores?.steam?.url || state.stores.steam,
          cta: (state as any).stores?.steam?.cta || (state as any).stores?.steamCta,
          'az-data-platform': (state as any).stores?.steam?.['az-data-platform'] || (state as any).stores?.steamId,
          dataLabel: (state as any).stores?.steam?.dataLabel || (state as any).stores?.steamLabel,
          className: (state as any).stores?.steam?.className || (state as any).stores?.steamClassName,
          logoUrl: (state as any).stores?.steam?.logoUrl
        } : undefined,
        epic: (state.stores.epic || (state as any).stores?.epic?.url) ? {
          url: (state as any).stores?.epic?.url || state.stores.epic,
          cta: (state as any).stores?.epic?.cta || (state as any).stores?.epicCta || state.stores.epicCta,
          'az-data-platform': (state as any).stores?.epic?.['az-data-platform'] || (state as any).stores?.epicId,
          dataLabel: (state as any).stores?.epic?.dataLabel || (state as any).stores?.epicLabel,
          className: (state as any).stores?.epic?.className || (state as any).stores?.epicClassName,
          logoUrl: (state as any).stores?.epic?.logoUrl
        } : undefined,
        custom: (state as any).stores?.custom?.filter((s: any) => s && (s.label || s.url || s.logoUrl)) || undefined,
        order: (state as any).stores?.order || undefined
      },
      consoles: {
        playstation: (state.consoles.playstation || (state as any).consoles?.playstation?.url) ? {
          url: (state as any).consoles?.playstation?.url || state.consoles.playstation,
          cta: (state as any).consoles?.playstation?.cta || (state as any).consoles?.playstationCta,
          'az-data-platform': (state as any).consoles?.playstation?.['az-data-platform'] || (state as any).consoles?.playstationId,
          dataLabel: (state as any).consoles?.playstation?.dataLabel || (state as any).consoles?.playstationLabel,
          className: (state as any).consoles?.playstation?.className || (state as any).consoles?.playstationClassName,
          logoUrl: (state as any).consoles?.playstation?.logoUrl
        } : undefined,
        xbox: (state.consoles.xbox || (state as any).consoles?.xbox?.url) ? {
          url: (state as any).consoles?.xbox?.url || state.consoles.xbox,
          cta: (state as any).consoles?.xbox?.cta || (state as any).consoles?.xboxCta,
          'az-data-platform': (state as any).consoles?.xbox?.['az-data-platform'] || (state as any).consoles?.xboxId,
          dataLabel: (state as any).consoles?.xbox?.dataLabel || (state as any).consoles?.xboxLabel,
          className: (state as any).consoles?.xbox?.className || (state as any).consoles?.xboxClassName,
          logoUrl: (state as any).consoles?.xbox?.logoUrl
        } : undefined,
        switch: (state.consoles.switch || (state as any).consoles?.switch?.url) ? {
          url: (state as any).consoles?.switch?.url || state.consoles.switch,
          cta: (state as any).consoles?.switch?.cta || (state as any).consoles?.switchCta,
          'az-data-platform': (state as any).consoles?.switch?.['az-data-platform'] || (state as any).consoles?.switchId,
          dataLabel: (state as any).consoles?.switch?.dataLabel || (state as any).consoles?.switchLabel,
          className: (state as any).consoles?.switch?.className || (state as any).consoles?.switchClassName,
          logoUrl: (state as any).consoles?.switch?.logoUrl
        } : undefined,
        custom: (state as any).consoles?.custom?.filter((s: any) => s && (s.label || s.url || s.logoUrl)) || undefined,
        order: (state as any).consoles?.order || undefined
      },
      mobile: {
        ios: (state.mobile.ios || (state as any).mobile?.ios?.url) ? {
          url: (state as any).mobile?.ios?.url || state.mobile.ios,
          cta: (state as any).mobile?.ios?.cta || (state as any).mobile?.iosCta,
          'az-data-platform': (state as any).mobile?.ios?.['az-data-platform'] || (state as any).mobile?.iosId,
          dataLabel: (state as any).mobile?.ios?.dataLabel || (state as any).mobile?.iosLabel,
          className: (state as any).mobile?.ios?.className || (state as any).mobile?.iosClassName,
          logoUrl: (state as any).mobile?.ios?.logoUrl
        } : undefined,
        android: (state.mobile.android || (state as any).mobile?.android?.url) ? {
          url: (state as any).mobile?.android?.url || state.mobile.android,
          cta: (state as any).mobile?.android?.cta || (state as any).mobile?.androidCta,
          'az-data-platform': (state as any).mobile?.android?.['az-data-platform'] || (state as any).mobile?.androidId,
          dataLabel: (state as any).mobile?.android?.dataLabel || (state as any).mobile?.androidLabel,
          className: (state as any).mobile?.android?.className || (state as any).mobile?.androidClassName,
          logoUrl: (state as any).mobile?.android?.logoUrl
        } : undefined,
        order: (state as any).mobile?.order || undefined
      },
      social: {
        x: state.social.x || undefined,
        instagram: state.social.instagram || undefined,
        discord: state.social.discord || undefined,
        youtube: state.social.youtube || undefined,
        custom: (state as any).social?.custom?.filter((s: any) => s && (s.logoUrl || s.url)) || undefined,
        order: (state as any).social?.order || undefined
      },
      footer: {
        privacyUrl: state.footer.privacyUrl || undefined,
        termsUrl: state.footer.termsUrl || undefined,
        custom: (state as any).footer?.custom?.filter((f: any) => f && (f.label || f.url)) || undefined,
        order: (state as any).footer?.order || undefined
      },
      order: (state as any).linksOrder || undefined
    },
    pixel
  };

  return json;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const buildLinkBioJson = (...args: any[]) => generateLinkBioJson(args[0]);

export function validateLinkBioJson(json: LinkBioJson): string[] {
  const issues: string[] = [];
  if (!json.id) issues.push('id missing');
  if (!json.meta.slug) issues.push('slug missing');
  if (!/^[a-z0-9-_]+$/.test(json.meta.slug)) issues.push('slug invalid format');
  if (!json.meta.title) issues.push('title missing');
  if (!json.meta.description) issues.push('description missing');
  if (!json.appearance.faviconUrl) issues.push('favicon missing');
  if (json.pixel && json.pixel.mode !== 'none' && !json.pixel.gameId && json.pixel.mode !== 'global') {
    issues.push('pixel.gameId required for selected pixel mode');
  }
  return issues;
}
