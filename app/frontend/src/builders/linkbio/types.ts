// LinkBioBuilder: Core public types

export interface LinkBioPixelConfig {
  enabled: boolean;
  mode: 'none' | 'global' | 'custom' | 'pftag_prod' | 'pftag_preprod';
  gameId?: string;
  partnerId?: string;
  customPixelUrl?: string;
  isTest?: boolean;
  detectionType?: string;
  mainUrl?: string;
  fallbackUrl?: string;
  customPixelVars?: Array<{ key: string; value: string }>;
}

export interface LinkBioJsonMeta {
  title: string;
  description: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface LinkBioBackground {
  type: 'solid' | 'gradient';
  value: string;
}

export interface LinkBioAppearance {
  background: LinkBioBackground;
  secondaryBackground?: LinkBioBackground;
  profileImageUrl?: string;
  faviconUrl?: string;
  illustrationUrl?: string;
}
export interface LinkBioLinkItem {
  url: string;
  label?: string;
  cta?: string;
  'pf-data-platform'?: string;
  dataLabel?: string;
  className?: string;
  logoUrl?: string;
}

export interface LinkBioStoresConfig {
  steam?: LinkBioLinkItem;
  epic?: LinkBioLinkItem;
  epicCta?: string;
  steamCta?: string;
  custom?: Array<{ label: string; url: string; logoUrl?: string; }>;
  order?: string[];
}
export interface LinkBioConsoleConfig {
  playstation?: LinkBioLinkItem;
  xbox?: LinkBioLinkItem;
  switch?: LinkBioLinkItem;
  custom?: Array<LinkBioLinkItem & { label: string }>;
  order?: string[];
}
export interface LinkBioMobileConfig {
  ios?: LinkBioLinkItem;
  android?: LinkBioLinkItem;
  iosCta?: string;
  androidCta?: string;
  order?: string[];
}
export interface LinkBioSocialConfig {
  x?: string;
  instagram?: string;
  discord?: string;
  youtube?: string;
  custom?: Array<{ logoUrl: string; url: string }>;
  order?: string[];
}
export interface LinkBioFooterConfig {
  privacyUrl?: string;
  termsUrl?: string;
  custom?: Array<{ label: string; url: string }>;
  order?: string[];
}

export interface LinkBioLinksGroup {
  stores: LinkBioStoresConfig;
  consoles: LinkBioConsoleConfig;
  mobile: LinkBioMobileConfig;
  social: LinkBioSocialConfig;
  footer: LinkBioFooterConfig;
  order?: string[];
}

export interface LinkBioJson {
  version: number;
  kind: 'LinkBio';
  id: string;
  meta: LinkBioJsonMeta;
  appearance: LinkBioAppearance;
  links: LinkBioLinksGroup;
  pixel?: LinkBioPixelConfig;
}

// Alias for consistency with LandingPage naming
export type LinkBioFromServer = LinkBioServerShape;

export interface ParsedLinkBio {
  kind: 'LinkBio';
  json: LinkBioJson;
}

export interface GenerateReactArtifacts {
  appTsx: string;
  mainTsx: string;
  indexHtml: string;
  stylesCss: string;
}

export type LinkBioServerShape = any;

export interface HtmlShellOptions {
  inlineCss?: string;
}

export interface HtmlShellResult { html: string; }

export function validateLinkBioJson(json: LinkBioJson): string[] {
  const issues: string[] = [];
  if (!json.id) issues.push('id missing');
  if (!json.meta.slug) issues.push('slug missing');
  if (!/^[a-z0-9-_]+$/i.test(json.meta.slug)) issues.push('slug invalid format');
  if (!json.meta.title) issues.push('title missing');
  if (!json.meta.description) issues.push('description missing');
  if (!json.appearance.faviconUrl) issues.push('favicon missing');
  if (json.pixel && json.pixel.mode !== 'none' && !json.pixel.gameId && json.pixel.mode !== 'global') {
    issues.push('pixel.gameId required for pixel mode');
  }
  return issues;
}
