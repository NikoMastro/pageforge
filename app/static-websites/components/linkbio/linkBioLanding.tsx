import React from 'react';
export interface LinkBioPixelConfig {
  enabled: boolean;
  mode: 'none' | 'full' | 'global' | 'custom' | 'pftag_prod' | 'pftag_preprod';
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

export interface LinkBioBackground { type: 'solid' | 'gradient'; value: string; }

export interface LinkBioAppearance {
  background: LinkBioBackground;
  secondaryBackground?: LinkBioBackground;
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
  order?: string[]; // Array of platform names defining horizontal order: ['x', 'instagram', 'discord', 'youtube', 'custom']
}
export interface LinkBioFooterConfig {
  privacyUrl?: string;
  termsUrl?: string;
  custom?: Array<{ label: string; url: string; id?: string; dataLabel?: string; className?: string }>;
  order?: string[]; // Array of footer link names defining order: ['privacy', 'terms', 'custom']
}

export interface LinkBioLinksGroup {
  stores: LinkBioStoresConfig;
  consoles: LinkBioConsoleConfig;
  mobile: LinkBioMobileConfig;
  social: LinkBioSocialConfig;
  footer: LinkBioFooterConfig;
  order?: string[]; // Array of section names defining vertical order: ['social', 'stores', 'consoles', 'mobile', 'footer']
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
import ProfileCard from './profileCard';
import LinkButton from './linkButton';
import SocialIcons from './socialIcons';
import Illustration from './illustration';
import BioFooter from './bioFooter';

export interface LinkBioPageProps { json: LinkBioJson; }

const renderStoreLinks = (stores: LinkBioStoresConfig) => {
  const elementMap: Record<string, React.ReactNode> = {};

  if (stores?.steam) {
    elementMap.steam = (
      <LinkButton
        key="steam"
        href={stores.steam.url}
        platform="steam"
        az-data-platform={stores.steam['az-data-platform']}
        dataLabel={stores.steam.dataLabel}
        className={stores.steam.className}
      >
        {stores.steam.label || stores.steam.cta || 'Steam'}
      </LinkButton>
    );
  }

  if (stores?.epic) {
    elementMap.epic = (
      <LinkButton
        key="epic"
        href={stores.epic.url}
        platform="epic"
        az-data-platform={stores.epic['az-data-platform']}
        dataLabel={stores.epic.dataLabel}
        className={stores.epic.className}
      >
        {stores.epic.label || stores.epic.cta || 'Epic Games'}
      </LinkButton>
    );
  }

  (stores?.custom || []).forEach((s, idx) => {
    elementMap[`custom-${idx}`] = (
      <LinkButton
        key={`store-custom-${idx}`}
        href={s.url}
        az-data-platform={s['az-data-platform']}
        dataLabel={s.dataLabel}
        className={s.className}
        logoUrl={s.logoUrl}
      >
        {s.label || 'Store'}
      </LinkButton>
    );
  });

  // Apply ordering if specified
  if (stores?.order && stores.order.length > 0) {
    const orderedElements: React.ReactNode[] = [];
    const customKeys = Object.keys(elementMap).filter(k => k.startsWith('custom-'));
    stores.order.forEach(itemName => {
      if (itemName === 'custom') {
        // Insert all custom items at this position
        customKeys.forEach(k => {
          if (elementMap[k]) orderedElements.push(elementMap[k]);
        });
      } else if (elementMap[itemName]) {
        orderedElements.push(elementMap[itemName]);
      }
    });
    // Add any remaining elements not already included (fallback)
    Object.keys(elementMap).forEach(itemName => {
      const alreadyIncluded = orderedElements.includes(elementMap[itemName]);
      if (!alreadyIncluded) {
        orderedElements.push(elementMap[itemName]);
      }
    });
    return orderedElements;
  }
  return Object.values(elementMap);
};

const renderConsoleLinks = (consoles: LinkBioConsoleConfig) => {
  const elementMap: Record<string, React.ReactNode> = {};

  if (consoles?.playstation) {
    elementMap.playstation = (
      <LinkButton
        key="playstation"
        href={consoles.playstation.url}
        platform="playstation"
        az-data-platform={consoles.playstation['az-data-platform']}
        dataLabel={consoles.playstation.dataLabel}
        className={consoles.playstation.className}
      >
        {consoles.playstation.label || consoles.playstation.cta || 'PlayStation'}
      </LinkButton>
    );
  }

  if (consoles?.xbox) {
    elementMap.xbox = (
      <LinkButton
        key="xbox"
        href={consoles.xbox.url}
        platform="xbox"
        az-data-platform={consoles.xbox['az-data-platform']}
        dataLabel={consoles.xbox.dataLabel}
        className={consoles.xbox.className}
      >
        {consoles.xbox.label || consoles.xbox.cta || 'Xbox'}
      </LinkButton>
    );
  }

  if (consoles?.switch) {
    elementMap.switch = (
      <LinkButton
        key="switch"
        href={consoles.switch.url}
        platform="switch"
        az-data-platform={consoles.switch['az-data-platform']}
        dataLabel={consoles.switch.dataLabel}
        className={consoles.switch.className}
      >
        {consoles.switch.label || consoles.switch.cta || 'Nintendo Switch'}
      </LinkButton>
    );
  }

  (consoles?.custom || []).forEach((c, idx) => {
    elementMap[`custom-${idx}`] = (
      <LinkButton
        key={`console-custom-${idx}`}
        href={c.url}
        az-data-platform={c['az-data-platform']}
        dataLabel={c.dataLabel}
        className={c.className}
        logoUrl={c.logoUrl}
      >
        {c.label || 'Console'}
      </LinkButton>
    );
  });

  if (consoles?.order && consoles.order.length > 0) {
    const orderedElements: React.ReactNode[] = [];
    const customKeys = Object.keys(elementMap).filter(k => k.startsWith('custom-'));
    consoles.order.forEach(itemName => {
      if (itemName === 'custom') {
        customKeys.forEach(k => {
          if (elementMap[k]) orderedElements.push(elementMap[k]);
        });
      } else if (elementMap[itemName]) {
        orderedElements.push(elementMap[itemName]);
      }
    });
    Object.keys(elementMap).forEach(itemName => {
      const alreadyIncluded = orderedElements.includes(elementMap[itemName]);
      if (!alreadyIncluded) {
        orderedElements.push(elementMap[itemName]);
      }
    });
    return orderedElements;
  }
  return Object.values(elementMap);
};

const renderMobileLinks = (mobile: LinkBioMobileConfig) => {
  const elementMap: Record<string, React.ReactNode> = {};

  if (mobile?.ios) {
    elementMap.ios = (
      <LinkButton
        key="ios"
        href={mobile.ios.url}
        platform="ios"
        az-data-platform={mobile.ios['az-data-platform']}
        dataLabel={mobile.ios.dataLabel}
        className={mobile.ios.className}
      >
        {mobile.ios.label || mobile.ios.cta || 'iOS'}
      </LinkButton>
    );
  }

  if (mobile?.android) {
    elementMap.android = (
      <LinkButton
        key="android"
        href={mobile.android.url}
        platform="android"
        az-data-platform={mobile.android['az-data-platform']}
        dataLabel={mobile.android.dataLabel}
        className={mobile.android.className}
      >
        {mobile.android.label || mobile.android.cta || 'Android'}
      </LinkButton>
    );
  }

  if (mobile?.order && mobile.order.length > 0) {
    const orderedElements: React.ReactNode[] = [];
    mobile.order.forEach(itemName => {
      if (elementMap[itemName]) {
        orderedElements.push(elementMap[itemName]);
      }
    });
    Object.keys(elementMap).forEach(itemName => {
      if (!mobile.order!.includes(itemName)) {
        orderedElements.push(elementMap[itemName]);
      }
    });
    return orderedElements;
  }

  return Object.values(elementMap);
};

export const LinkBioPage: React.FC<LinkBioPageProps> = ({ json }) => {
  const { meta, appearance, links } = json;
  const hasSecondaryBg = !!appearance?.secondaryBackground;

  const innerStyle: React.CSSProperties | undefined = hasSecondaryBg
    ? { background: appearance?.background?.value || '#000' }
    : undefined;

  const sectionComponents = {
    stores: () => <React.Fragment key="stores">{renderStoreLinks(links.stores)}</React.Fragment>,
    consoles: () => <React.Fragment key="consoles">{renderConsoleLinks(links.consoles)}</React.Fragment>,
    mobile: () => <React.Fragment key="mobile">{renderMobileLinks(links.mobile)}</React.Fragment>
  };

  let orderedSections: React.ReactNode[];
  if (links.order && links.order.length > 0) {
    orderedSections = [];
    links.order.forEach(sectionName => {
      if (sectionName !== 'footer' && sectionName !== 'social' && sectionName in sectionComponents) {
        orderedSections.push(sectionComponents[sectionName as keyof typeof sectionComponents]());
      }
    });
    Object.keys(sectionComponents).forEach(sectionName => {
      if (!links.order!.includes(sectionName)) {
        orderedSections.push(sectionComponents[sectionName as keyof typeof sectionComponents]());
      }
    });
  } else {
    // Default order: stores, consoles, mobile (footer and social will be rendered separately)
    orderedSections = [
      sectionComponents.stores(),
      sectionComponents.consoles(),
      sectionComponents.mobile()
    ];
  }

  return (
    <div className="py-8 flex flex-col min-h-[calc(100vh-4rem)]">
      <div
        className={`w-full max-w-xl mx-auto p-6 flex flex-col gap-3 animate-in fade-in zt-fade-in ${hasSecondaryBg ? 'rounded-2xl' : ''}`}
        style={innerStyle}
      >
        <ProfileCard meta={meta} appearance={appearance} />
        {orderedSections}
        <Illustration illustrationUrl={appearance.illustrationUrl} alt={meta.title} />
        <SocialIcons socialLinks={links.social} />
        <BioFooter key="footer" footer={links.footer} />
      </div>
    </div>
  );
};

export default LinkBioPage;
