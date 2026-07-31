import React from 'react';
// import { Link } from 'react-router-dom';
import { pageforgeApi } from '../../../api';
import { useAuth } from '../../../components/layout/authContext';
import { useNotifications } from '../../../components/layout/notifiations';
import { computeHashHex } from '../../../utils/backendPayload';
import { parseLinkBioFromServer } from '../../../builders/linkbio/parse';
import PreviewHistoryList from '../../../components/ui/preview/previewHistoryList';
import PreviewJsonHistory from '../../../components/ui/preview/previewJsonHistory';
import {
  GeneralSettings,
  BackgroundSettings,
  LinkSettings,
  PixelSettings,
  LinksSettings,
  ConsoleSettings,
  MobileSettings,
  SocialSettings,
  FooterSettings,
  LinkBioList,
  LinkBioPreview
} from '../../../components/linkbioconfig';
import type {
  LinkBioGeneralSettingsProps,
  LinkBioLinkSettingsProps,
  LinkBioPixelSettingsProps,
  LinkBioLinksSettingsProps,
  LinkBioConsoleSettingsProps,
  LinkBioMobileSettingsProps,
  LinkBioSocialSettingsProps,
  LinkBioFooterSettingsProps
} from '../../../components/linkbioconfig';
// Import the background interface
import type { LinkBioBackgroundValue } from '../../../components/linkbioconfig/settings/backgroundSettings';

// Temporary local types (re-exported from component props) for assembling a single state object
interface LinkBioState {
  general: LinkBioGeneralSettingsProps['value'];
  link: LinkBioLinkSettingsProps['value'];
  pixel: LinkBioPixelSettingsProps['value'];
  stores: LinkBioLinksSettingsProps['value'];
  consoles: LinkBioConsoleSettingsProps['value'];
  mobile: LinkBioMobileSettingsProps['value'];
  social: LinkBioSocialSettingsProps['value'];
  footer: LinkBioFooterSettingsProps['value'];
  backgrounds: LinkBioBackgroundValue; // Background settings (main and secondary)
  linksOrder?: string[]; // Array of section names defining vertical order: ['social', 'stores', 'consoles', 'mobile', 'footer']
}

const initialState: LinkBioState = {
  general: { configName: '', pageTitle: '', gameDescription: '', backgroundType: 'solid', backgroundValue: '#000000' },
  link: { slug: '', profileImageUrl: '', faviconUrl: '/favicon.ico', illustrationUrl: '' },
  pixel: { usePixelScript: false, pixelMode: 'none', gameId: '', partnerId: '', customPixelUrl: '', isTest: true, detectionType: '', mainUrl: '', fallbackUrl: '', customPixelVars: '[]' },
  stores: { steam: '', epic: '', epicCta: 'Get on Epic' },
  consoles: { playstation: '', xbox: '', switch: '' },
  mobile: { ios: '', android: '' },
  social: { x: '', instagram: '', discord: '', youtube: '' },
  footer: { privacyUrl: '', termsUrl: '' },
  linksOrder: ['social', 'stores', 'consoles', 'mobile', 'footer'],
  // Background settings (main and secondary)
  backgrounds: {
    backgroundType: 'solid',
    backgroundValue: '#000000',
    secondaryBackgroundType: 'solid',
    secondaryBackgroundValue: '#111827'
  }
};

// Normalize potentially partial/mismatched remote JSON into our editor state shape
function normalizeLinkBioState(remote: any): LinkBioState {
  const safe = (v: any, d: any) => (v !== undefined && v !== null ? v : d);
  const r = remote || {};

  // Helper to extract URL from either flat format (string) or object format ({ url: string, ... })
  const extractUrl = (val: any) => {
    if (typeof val === 'string') return val;
    if (val && typeof val === 'object' && val.url) return val.url;
    return '';
  };

  // Helper to extract a property from object format, with fallback to flat format
  const extractProp = (obj: any, platform: string, prop: string) => {
    // Check object format first
    if (obj && typeof obj[platform] === 'object') {
      // Special handling for 'cta' - check both 'label' (new) and 'cta' (legacy)
      if (prop === 'cta') {
        return obj[platform]['label'] || obj[platform]['cta'];
      }
      // Special handling for 'az-data-platform' property
      if (prop === 'az-data-platform' && obj[platform]['az-data-platform']) {
        return obj[platform]['az-data-platform'];
      } else if (obj[platform][prop]) {
        return obj[platform][prop];
      }
    }
    // Check flat format
    const flatKey = `${platform}${prop.charAt(0).toUpperCase() + prop.slice(1)}`;
    if (obj && obj[flatKey]) {
      return obj[flatKey];
    }
    return undefined;
  };

  return {
    general: {
      configName: safe(r.general?.configName, initialState.general.configName),
      pageTitle: safe(r.general?.pageTitle, initialState.general.pageTitle),
      gameDescription: safe(r.general?.gameDescription, initialState.general.gameDescription),
      backgroundType: safe(r.general?.backgroundType, initialState.general.backgroundType),
      backgroundValue: safe(r.general?.backgroundValue, initialState.general.backgroundValue),
    },
    link: {
      slug: safe(r.link?.slug, initialState.link.slug),
      profileImageUrl: safe(r.link?.profileImageUrl, initialState.link.profileImageUrl),
      faviconUrl: safe(r.link?.faviconUrl, initialState.link.faviconUrl),
      illustrationUrl: safe(r.link?.illustrationUrl, initialState.link.illustrationUrl),
    },
    pixel: {
      usePixelScript: safe(r.pixel?.usePixelScript, initialState.pixel.usePixelScript),
      pixelMode: safe(r.pixel?.pixelMode, initialState.pixel.pixelMode),
      gameId: safe(r.pixel?.gameId, initialState.pixel.gameId),
      partnerId: safe(r.pixel?.partnerId, initialState.pixel.partnerId),
      customPixelUrl: safe(r.pixel?.customPixelUrl, initialState.pixel.customPixelUrl),
      isTest: safe(r.pixel?.isTest, initialState.pixel.isTest),
      detectionType: safe(r.pixel?.detectionType, initialState.pixel.detectionType),
      mainUrl: safe(r.pixel?.mainUrl, initialState.pixel.mainUrl),
      fallbackUrl: safe(r.pixel?.fallbackUrl, initialState.pixel.fallbackUrl),
      customPixelVars: safe(r.pixel?.customPixelVars, initialState.pixel.customPixelVars),
    },
    stores: {
      // Store the complete object instead of just the URL
      steam: (() => {
        const platform = r.stores?.steam;
        if (typeof platform === 'object' && platform !== null) {
          return platform; // Already an object, return as-is
        }
        // If it's a string (legacy flat format), extract all properties
        const url = extractUrl(platform);
        if (url) {
          return {
            url,
            label: extractProp(r.stores, 'steam', 'cta'),
            'az-data-platform': extractProp(r.stores, 'steam', 'az-data-platform'),
            dataLabel: extractProp(r.stores, 'steam', 'dataLabel'),
            className: extractProp(r.stores, 'steam', 'className'),
          };
        }
        return initialState.stores.steam;
      })(),
      epic: (() => {
        const platform = r.stores?.epic;
        if (typeof platform === 'object' && platform !== null) {
          return platform; // Already an object, return as-is
        }
        // If it's a string (legacy flat format), extract all properties
        const url = extractUrl(platform);
        if (url) {
          return {
            url,
            label: extractProp(r.stores, 'epic', 'cta'),
            'az-data-platform': extractProp(r.stores, 'epic', 'az-data-platform'),
            dataLabel: extractProp(r.stores, 'epic', 'dataLabel'),
            className: extractProp(r.stores, 'epic', 'className'),
          };
        }
        return initialState.stores.epic;
      })(),
      // Keep legacy flat fields for backward compatibility
      epicCta: extractProp(r.stores, 'epic', 'cta') || safe(r.stores?.epicCta, initialState.stores.epicCta),
      steamCta: extractProp(r.stores, 'steam', 'cta') || safe(r.stores?.steamCta, (initialState as any).stores?.steamCta),
      steamId: extractProp(r.stores, 'steam', 'az-data-platform') || safe(r.stores?.steamId, (initialState as any).stores?.steamId),
      epicId: extractProp(r.stores, 'epic', 'az-data-platform') || safe(r.stores?.epicId, (initialState as any).stores?.epicId),
      steamLabel: extractProp(r.stores, 'steam', 'dataLabel') || safe(r.stores?.steamLabel, (initialState as any).stores?.steamLabel),
      epicLabel: extractProp(r.stores, 'epic', 'dataLabel') || safe(r.stores?.epicLabel, (initialState as any).stores?.epicLabel),
      steamClassName: extractProp(r.stores, 'steam', 'className') || safe(r.stores?.steamClassName, (initialState as any).stores?.steamClassName),
      epicClassName: extractProp(r.stores, 'epic', 'className') || safe(r.stores?.epicClassName, (initialState as any).stores?.epicClassName),
      custom: Array.isArray(r.stores?.custom) ? r.stores.custom : (initialState as any).stores?.custom,
      order: Array.isArray(r.stores?.order) ? r.stores.order : (initialState as any).stores?.order,
    },
    consoles: {
      // Store the complete object instead of just the URL
      playstation: (() => {
        const platform = r.consoles?.playstation;
        if (typeof platform === 'object' && platform !== null) {
          return platform;
        }
        const url = extractUrl(platform);
        if (url) {
          return {
            url,
            label: extractProp(r.consoles, 'playstation', 'cta'),
            'az-data-platform': extractProp(r.consoles, 'playstation', 'az-data-platform'),
            dataLabel: extractProp(r.consoles, 'playstation', 'dataLabel'),
            className: extractProp(r.consoles, 'playstation', 'className'),
          };
        }
        return initialState.consoles.playstation;
      })(),
      xbox: (() => {
        const platform = r.consoles?.xbox;
        if (typeof platform === 'object' && platform !== null) {
          return platform;
        }
        const url = extractUrl(platform);
        if (url) {
          return {
            url,
            label: extractProp(r.consoles, 'xbox', 'cta'),
            'az-data-platform': extractProp(r.consoles, 'xbox', 'az-data-platform'),
            dataLabel: extractProp(r.consoles, 'xbox', 'dataLabel'),
            className: extractProp(r.consoles, 'xbox', 'className'),
          };
        }
        return initialState.consoles.xbox;
      })(),
      switch: (() => {
        const platform = r.consoles?.switch;
        if (typeof platform === 'object' && platform !== null) {
          return platform;
        }
        const url = extractUrl(platform);
        if (url) {
          return {
            url,
            label: extractProp(r.consoles, 'switch', 'cta'),
            'az-data-platform': extractProp(r.consoles, 'switch', 'az-data-platform'),
            dataLabel: extractProp(r.consoles, 'switch', 'dataLabel'),
            className: extractProp(r.consoles, 'switch', 'className'),
          };
        }
        return initialState.consoles.switch;
      })(),
      // Keep legacy flat fields for backward compatibility
      playstationCta: extractProp(r.consoles, 'playstation', 'cta') || safe(r.consoles?.playstationCta, (initialState as any).consoles?.playstationCta),
      xboxCta: extractProp(r.consoles, 'xbox', 'cta') || safe(r.consoles?.xboxCta, (initialState as any).consoles?.xboxCta),
      switchCta: extractProp(r.consoles, 'switch', 'cta') || safe(r.consoles?.switchCta, (initialState as any).consoles?.switchCta),
      playstationId: extractProp(r.consoles, 'playstation', 'az-data-platform') || safe(r.consoles?.playstationId, (initialState as any).consoles?.playstationId),
      xboxId: extractProp(r.consoles, 'xbox', 'az-data-platform') || safe(r.consoles?.xboxId, (initialState as any).consoles?.xboxId),
      switchId: extractProp(r.consoles, 'switch', 'az-data-platform') || safe(r.consoles?.switchId, (initialState as any).consoles?.switchId),
      playstationLabel: extractProp(r.consoles, 'playstation', 'dataLabel') || safe(r.consoles?.playstationLabel, (initialState as any).consoles?.playstationLabel),
      xboxLabel: extractProp(r.consoles, 'xbox', 'dataLabel') || safe(r.consoles?.xboxLabel, (initialState as any).consoles?.xboxLabel),
      switchLabel: extractProp(r.consoles, 'switch', 'dataLabel') || safe(r.consoles?.switchLabel, (initialState as any).consoles?.switchLabel),
      playstationClassName: extractProp(r.consoles, 'playstation', 'className') || safe(r.consoles?.playstationClassName, (initialState as any).consoles?.playstationClassName),
      xboxClassName: extractProp(r.consoles, 'xbox', 'className') || safe(r.consoles?.xboxClassName, (initialState as any).consoles?.xboxClassName),
      switchClassName: extractProp(r.consoles, 'switch', 'className') || safe(r.consoles?.switchClassName, (initialState as any).consoles?.switchClassName),
      custom: Array.isArray(r.consoles?.custom) ? r.consoles.custom : (initialState as any).consoles?.custom,
      order: Array.isArray(r.consoles?.order) ? r.consoles.order : (initialState as any).consoles?.order,
    },
    mobile: {
      // Store the complete object instead of just the URL
      ios: (() => {
        const platform = r.mobile?.ios;
        if (typeof platform === 'object' && platform !== null) {
          return platform;
        }
        const url = extractUrl(platform);
        if (url) {
          return {
            url,
            label: extractProp(r.mobile, 'ios', 'cta'),
            'az-data-platform': extractProp(r.mobile, 'ios', 'az-data-platform'),
            dataLabel: extractProp(r.mobile, 'ios', 'dataLabel'),
            className: extractProp(r.mobile, 'ios', 'className'),
          };
        }
        return initialState.mobile.ios;
      })(),
      android: (() => {
        const platform = r.mobile?.android;
        if (typeof platform === 'object' && platform !== null) {
          return platform;
        }
        const url = extractUrl(platform);
        if (url) {
          return {
            url,
            label: extractProp(r.mobile, 'android', 'cta'),
            'az-data-platform': extractProp(r.mobile, 'android', 'az-data-platform'),
            dataLabel: extractProp(r.mobile, 'android', 'dataLabel'),
            className: extractProp(r.mobile, 'android', 'className'),
          };
        }
        return initialState.mobile.android;
      })(),
      // Keep legacy flat fields for backward compatibility
      iosCta: extractProp(r.mobile, 'ios', 'cta') || safe(r.mobile?.iosCta, (initialState as any).mobile?.iosCta),
      androidCta: extractProp(r.mobile, 'android', 'cta') || safe(r.mobile?.androidCta, (initialState as any).mobile?.androidCta),
      iosId: extractProp(r.mobile, 'ios', 'az-data-platform') || safe(r.mobile?.iosId, (initialState as any).mobile?.iosId),
      androidId: extractProp(r.mobile, 'android', 'az-data-platform') || safe(r.mobile?.androidId, (initialState as any).mobile?.androidId),
      iosLabel: extractProp(r.mobile, 'ios', 'dataLabel') || safe(r.mobile?.iosLabel, (initialState as any).mobile?.iosLabel),
      androidLabel: extractProp(r.mobile, 'android', 'dataLabel') || safe(r.mobile?.androidLabel, (initialState as any).mobile?.androidLabel),
      iosClassName: extractProp(r.mobile, 'ios', 'className') || safe(r.mobile?.iosClassName, (initialState as any).mobile?.iosClassName),
      androidClassName: extractProp(r.mobile, 'android', 'className') || safe(r.mobile?.androidClassName, (initialState as any).mobile?.androidClassName),
      order: Array.isArray(r.mobile?.order) ? r.mobile.order : (initialState as any).mobile?.order,
    },
    social: {
      x: safe(r.social?.x, initialState.social.x),
      instagram: safe(r.social?.instagram, initialState.social.instagram),
      discord: safe(r.social?.discord, initialState.social.discord),
      youtube: safe(r.social?.youtube, initialState.social.youtube),
      custom: Array.isArray(r.social?.custom) ? r.social.custom : (initialState as any).social?.custom,
      order: Array.isArray(r.social?.order) ? r.social.order : (initialState as any).social?.order,
    },
    footer: {
      privacyUrl: safe(r.footer?.privacyUrl, initialState.footer.privacyUrl),
      termsUrl: safe(r.footer?.termsUrl, initialState.footer.termsUrl),
      custom: Array.isArray(r.footer?.custom) ? r.footer.custom : (initialState as any).footer?.custom,
      order: Array.isArray(r.footer?.order) ? r.footer.order : (initialState as any).footer?.order,
    },
    backgrounds: {
      backgroundType: safe(r.backgrounds?.backgroundType, initialState.backgrounds.backgroundType),
      backgroundValue: safe(r.backgrounds?.backgroundValue, initialState.backgrounds.backgroundValue),
      secondaryBackgroundType: safe(r.backgrounds?.secondaryBackgroundType, initialState.backgrounds.secondaryBackgroundType),
      secondaryBackgroundValue: safe(r.backgrounds?.secondaryBackgroundValue, initialState.backgrounds.secondaryBackgroundValue),
    },
    linksOrder: safe(r.linksOrder, initialState.linksOrder),
  };
}

const Section: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 space-y-4">
    {title && <h2 className="text-xl font-semibold text-gray-100 tracking-wide">{title}</h2>}
    {children}
  </section>
);

const STORAGE_KEY = 'linkbio-configs';

interface StoredLinkBioRecord {
  id: string; // configName or slug fallback
  updatedAt: string;
  data: LinkBioState;
}

// Helper: identify test configs by name (same rule as main page)
function isTestConfig(name?: string | null): boolean {
  if (!name) return false;
  const s = String(name).trim().toLowerCase();
  if (!s) return false;
  return s === 'test' || s.startsWith('test-') || s.endsWith('-test');
}

const LinkBioPage: React.FC = () => {
  const [state, setState] = React.useState<LinkBioState>(initialState);
  const [saving, setSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const [list, setList] = React.useState<StoredLinkBioRecord[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<string[]>([]);

  // Clean up pixel fields that are not required by current pixelMode/detectionType
  React.useEffect(() => {
    const pixelMode = state.pixel.pixelMode;
    const detectionType = state.pixel.detectionType;
    const mainUrl = state.pixel.mainUrl;
    const fallbackUrl = state.pixel.fallbackUrl;

    // Only clean if we're in pftag mode and have a detectionType
    if ((pixelMode === 'pftag_prod' || pixelMode === 'pftag_preprod') && detectionType) {
      const { DETECTION_TYPE_MAP } = require('../../utils/pftagValidation');
      if (DETECTION_TYPE_MAP[detectionType]) {
        const [, requireMainUrl, requireFallbackUrl] = DETECTION_TYPE_MAP[detectionType];

        const needsCleanup =
          (!requireMainUrl && mainUrl) ||
          (!requireFallbackUrl && fallbackUrl);

        if (needsCleanup) {
          setState(prev => {
            const cleaned = { ...prev, pixel: { ...prev.pixel } };
            if (!requireMainUrl) {
              delete (cleaned.pixel as any).mainUrl;
            }
            if (!requireFallbackUrl) {
              delete (cleaned.pixel as any).fallbackUrl;
            }
            return cleaned;
          });
        }
      }
    }
  }, [state.pixel]);
  // History state for selected LinkBio
  const [history, setHistory] = React.useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = React.useState<boolean>(false);
  const [historyError, setHistoryError] = React.useState<string | null>(null);
  const [selectedHistoryKey, setSelectedHistoryKey] = React.useState<string>('');
  const [activeLeftTab, setActiveLeftTab] = React.useState<'config' | 'history'>('config');
  const [activeRightTab, setActiveRightTab] = React.useState<'preview' | 'history'>('preview');
  const { user } = useAuth();
  const { deploymentSuccess, success, error: notifyError } = useNotifications();
  // Remote (posted) LinkBios
  const [remoteItems, setRemoteItems] = React.useState<{ id: string; title: string; updatedAt: string; slug?: string }[]>([]);
  const [loadingRemote, setLoadingRemote] = React.useState(false);

  const loadList = React.useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) { setList([]); return; }
      const arr = JSON.parse(raw) as StoredLinkBioRecord[];
      setList(Array.isArray(arr) ? arr : []);
    } catch { setList([]); }
  }, []);

  React.useEffect(() => { loadList(); }, [loadList]);

  // Fetch posted LinkBios from backend
  const loadRemotePosted = React.useCallback(async () => {
    setLoadingRemote(true);
    try {
      const raw = await pageforgeApi.listLinkBios();
      // Expected shape from backend list: [{ page_name: string, latest_timestamp: { _seconds, _nanoseconds } | string }]
      const items = (Array.isArray(raw) ? raw : []).map((r: any) => {
        const name: string = r?.page_name || '';
        const ts: any = r?.latest_timestamp;
        let iso = '';
        if (typeof ts === 'string') {
          iso = ts;
        } else if (ts && typeof ts._seconds === 'number') {
          iso = new Date(ts._seconds * 1000).toISOString();
        } else if (typeof r?.Timestamp === 'string') {
          iso = r.Timestamp;
        } else {
          iso = new Date().toISOString();
        }
        return { id: name, title: name || 'untitled', updatedAt: iso };
      });
      setRemoteItems(items);
    } catch (e) {
      console.warn('Failed to load posted LinkBios:', e);
      setRemoteItems([]);
    } finally {
      setLoadingRemote(false);
    }
  }, []);

  React.useEffect(() => { loadRemotePosted(); }, [loadRemotePosted]);

  // Build ordered state for JSON output (mirror of main page)
  const buildOrderedLinkBioState = React.useCallback((s: LinkBioState): LinkBioState => {
    const orderOr = (order: string[] | undefined, fallback: string[]) => (Array.isArray(order) && order.length ? order : fallback);

    // Social: x, instagram, discord, youtube (then custom/order)
    const socialOrder = orderOr((s as any).social?.order, ['x', 'instagram', 'discord', 'youtube']);
    const socialSrc: any = (s as any).social || {};
    const socialOrdered: any = {};
    socialOrder.forEach(k => { if (k in socialSrc && socialSrc[k] !== undefined) socialOrdered[k] = socialSrc[k]; });
    ['x', 'instagram', 'discord', 'youtube'].forEach(k => { if (!(k in socialOrdered) && k in socialSrc && socialSrc[k] !== undefined) socialOrdered[k] = socialSrc[k]; });
    if (socialSrc.custom !== undefined) socialOrdered.custom = socialSrc.custom;

    // Helper to extract URL from either flat format (string) or object format ({ url: string, ... })
    const extractUrl = (val: any) => {
      if (typeof val === 'string') return val;
      if (val && typeof val === 'object' && val.url) return val.url;
      return '';
    };

    // Helper to extract a property from object or flat format
    const extractProp = (src: any, platform: string, prop: string) => {
      const val = src[platform];
      // First check if platform value is an object with the property
      if (val && typeof val === 'object') {
        // Special handling for 'cta' - check both 'label' (new) and 'cta' (legacy)
        if (prop === 'cta') {
          return val['label'] || val['cta'];
        }
        if (val[prop]) {
          return val[prop];
        }
      }
      // Check flat format - handle special cases
      let flatKey: string;
      if (prop === 'cta') {
        flatKey = `${platform}Cta`;
      } else if (prop === 'az-data-platform') {
        flatKey = `${platform}Id`; // Flat format stores az-data-platform as {platform}Id
      } else if (prop === 'dataLabel') {
        flatKey = `${platform}Label`;
      } else if (prop === 'className') {
        flatKey = `${platform}ClassName`;
      } else {
        flatKey = `${platform}${prop.charAt(0).toUpperCase() + prop.slice(1)}`;
      }
      if (src[flatKey]) {
        return src[flatKey];
      }
      return undefined;
    };

    // Mobile: ios, android - Convert flat structure to object structure
    const mobileSrc: any = (s as any).mobile || {};
    const mobileOrdered: any = {};

    // Convert each platform to object format
    ['ios', 'android'].forEach(platform => {
      const url = extractUrl(mobileSrc[platform]);
      const cta = extractProp(mobileSrc, platform, 'cta');
      const azDataPlatform = extractProp(mobileSrc, platform, 'az-data-platform');
      const dataLabel = extractProp(mobileSrc, platform, 'dataLabel');
      const className = extractProp(mobileSrc, platform, 'className');

      // Only include platform if URL exists
      if (url) {
        const platformObj: any = { url };
        if (cta) platformObj.label = cta; // Changed from 'cta' to 'label' for consistency
        platformObj['az-data-platform'] = azDataPlatform || platform;
        if (dataLabel) platformObj.dataLabel = dataLabel;
        if (className) platformObj.className = className;
        mobileOrdered[platform] = platformObj;
      }
    });

    if (mobileSrc.order !== undefined) mobileOrdered.order = mobileSrc.order;

    // Stores: steam, epic - Convert flat structure to object structure
    const storesSrc: any = (s as any).stores || {};
    const storesOrdered: any = {};

    // Convert each platform to object format
    ['steam', 'epic'].forEach(platform => {
      const url = extractUrl(storesSrc[platform]);
      const cta = extractProp(storesSrc, platform, 'cta');
      const azDataPlatform = extractProp(storesSrc, platform, 'az-data-platform');
      const dataLabel = extractProp(storesSrc, platform, 'dataLabel');
      const className = extractProp(storesSrc, platform, 'className');

      // Only include platform if URL exists
      if (url) {
        const platformObj: any = { url };
        if (cta) platformObj.label = cta; // Changed from 'cta' to 'label' for consistency
        platformObj['az-data-platform'] = azDataPlatform || platform;
        if (dataLabel) platformObj.dataLabel = dataLabel;
        if (className) platformObj.className = className;
        storesOrdered[platform] = platformObj;
      }
    });

    if (storesSrc.custom !== undefined) storesOrdered.custom = storesSrc.custom;
    if (storesSrc.order !== undefined) storesOrdered.order = storesSrc.order;

    // Consoles: playstation, xbox - Convert flat structure to object structure
    const consolesSrc: any = (s as any).consoles || {};
    const consolesOrdered: any = {};

    // Convert each platform to object format
    ['playstation', 'xbox', 'switch'].forEach(platform => {
      const url = extractUrl(consolesSrc[platform]);
      const cta = extractProp(consolesSrc, platform, 'cta');
      const azDataPlatform = extractProp(consolesSrc, platform, 'az-data-platform');
      const dataLabel = extractProp(consolesSrc, platform, 'dataLabel');
      const className = extractProp(consolesSrc, platform, 'className');

      // Only include platform if URL exists
      if (url) {
        const platformObj: any = { url };
        if (cta) platformObj.label = cta; // Changed from 'cta' to 'label' for consistency
        platformObj['az-data-platform'] = azDataPlatform || platform;
        if (dataLabel) platformObj.dataLabel = dataLabel;
        if (className) platformObj.className = className;
        consolesOrdered[platform] = platformObj;
      }
    });

    if (consolesSrc.custom !== undefined) consolesOrdered.custom = consolesSrc.custom;
    if (consolesSrc.order !== undefined) consolesOrdered.order = consolesSrc.order;

    // Footer: privacyUrl, termsUrl (then custom/order)
    const footerOrder = orderOr((s as any).footer?.order, ['privacyUrl', 'termsUrl']);
    const footerSrc: any = (s as any).footer || {};
    const footerOrdered: any = {};
    footerOrder.forEach(k => { if (k in footerSrc && footerSrc[k] !== undefined) footerOrdered[k] = footerSrc[k]; });
    ['privacyUrl', 'termsUrl'].forEach(k => { if (!(k in footerOrdered) && k in footerSrc && footerSrc[k] !== undefined) footerOrdered[k] = footerSrc[k]; });
    if (footerSrc.custom !== undefined) footerOrdered.custom = footerSrc.custom;

    // Top-level sections order: use s.linksOrder if available, else keep existing default
    const defaultSections = (initialState.linksOrder || ['social', 'stores', 'consoles', 'mobile', 'footer']);
    const sectionsOrder = orderOr((s as any).linksOrder, defaultSections);

    // Clean up pixel mode-specific fields
    const cleanPixel = { ...s.pixel };
    const pixelMode = cleanPixel.pixelMode;

    if (pixelMode === 'none') {
      // Remove all pixel-related fields
      delete (cleanPixel as any).customPixelUrl;
      delete (cleanPixel as any).customPixelVars;
      delete (cleanPixel as any).detectionType;
      delete (cleanPixel as any).mainUrl;
      delete (cleanPixel as any).fallbackUrl;
    } else if (pixelMode === 'global') {
      // Remove custom and pftag mode fields
      delete (cleanPixel as any).customPixelUrl;
      delete (cleanPixel as any).customPixelVars;
      // Keep detectionType, mainUrl, and fallbackUrl for global mode
    } else if (pixelMode === 'custom') {
      // Remove global mode fields
      delete (cleanPixel as any).detectionType;
      delete (cleanPixel as any).mainUrl;
      delete (cleanPixel as any).fallbackUrl;
    } else if (pixelMode === 'pftag_prod' || pixelMode === 'pftag_preprod') {
      // Remove custom mode fields for pftag
      delete (cleanPixel as any).customPixelUrl;
      delete (cleanPixel as any).customPixelVars;
      // Clean up mainUrl and fallbackUrl based on detectionType requirements
      const { DETECTION_TYPE_MAP } = require('../../utils/pftagValidation');
      const detType = (cleanPixel as any).detectionType;
      if (detType && DETECTION_TYPE_MAP[detType]) {
        const [, requireMainUrl, requireFallbackUrl] = DETECTION_TYPE_MAP[detType];
        if (!requireMainUrl) {
          delete (cleanPixel as any).mainUrl;
        }
        if (!requireFallbackUrl) {
          delete (cleanPixel as any).fallbackUrl;
        }
      }
    }

    // Assemble new object with desired top-level order and without the linksOrder field
    const result: any = {
      general: s.general,
      link: s.link,
      pixel: cleanPixel,
    };
    sectionsOrder.forEach((sec) => {
      if (sec === 'social') result.social = socialOrdered;
      if (sec === 'stores') result.stores = storesOrdered;
      if (sec === 'consoles') result.consoles = consolesOrdered;
      if (sec === 'mobile') result.mobile = mobileOrdered;
      if (sec === 'footer') result.footer = footerOrdered;
    });
    result.backgrounds = s.backgrounds;

    return result as LinkBioState;
  }, []);

  // Load history whenever a LinkBio is selected
  React.useEffect(() => {
    let cancelled = false;
    const loadHistory = async () => {
      if (!selectedId) { setHistory([]); setHistoryError(null); return; }
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const hist = await pageforgeApi.getLinkBioHistory(selectedId);
        if (!cancelled) {
          const list = Array.isArray(hist) ? hist : [];
          const getTs = (e: any) => {
            const t: string | undefined = e?.timestamp || e?.Timestamp;
            if (!t) return 0;
            const n = Date.parse(t);
            return Number.isNaN(n) ? 0 : n;
          };
          const sorted = [...list].sort((a, b) => getTs(a) - getTs(b));
          setHistory(sorted);
          // Auto-select the latest (most recent) entry to show diff between current and DB by default
          const latest = sorted[sorted.length - 1];
          const makeKey = (e?: any) => e ? [e.hashid, e.timestamp || e.Timestamp, e.commit].filter(Boolean).join('|') : '';
          setSelectedHistoryKey(makeKey(latest));
        }
      } catch (e: any) {
        if (!cancelled) setHistoryError(e?.message || 'Failed to load history');
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };
    loadHistory();
    return () => { cancelled = true; };
  }, [selectedId]);

  const persistList = (records: StoredLinkBioRecord[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch { /* ignore quota */ }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validate mandatory fields before saving/posting
      const problems: string[] = [];
      if (!state.general.configName?.trim()) problems.push('Configuration name is required');
      if (!/^[a-z0-9-_]+$/.test(state.general.configName || '')) problems.push('Configuration name must contain only lowercase letters, numbers, hyphens or underscores');
      if (!state.general.pageTitle?.trim()) problems.push('Page title is required');
      if (!state.general.gameDescription?.trim()) problems.push('Game description is required');
      if (!state.link.faviconUrl?.trim()) problems.push('Favicon is required');
      setErrors(problems);
      if (problems.length) { return; }

      // Save locally (keeps quick drafts/history)
      const idBase = state.general.configName || state.link.slug || `untitled-${Date.now()}`;
      const id = idBase.trim() || `untitled-${Date.now()}`;
      const record: StoredLinkBioRecord = { id, updatedAt: new Date().toISOString(), data: state };
      setList(prev => {
        const existingIdx = prev.findIndex(r => r.id === id);
        let next: StoredLinkBioRecord[];
        if (existingIdx >= 0) {
          next = [...prev];
          next[existingIdx] = record;
        } else {
          next = [record, ...prev];
        }
        persistList(next);
        return next;
      });
      setSelectedId(id);

      // Build backend metadata and POST to backend
      const metadata = await buildBackendMetadata();
      if (!metadata) return; // validation already surfaced
      await pageforgeApi.saveLinkBio({ metadata });

      setLastSaved(new Date());
      setErrors([]);
      // Refresh remote list so the new/updated item shows up
      await loadRemotePosted();
    } catch (e: any) {
      console.error('LinkBio save (POST) failed', e);
      alert(e?.message || 'Failed to save LinkBio to backend');
    } finally { setSaving(false); }
  };

  const buildBackendMetadata = async (): Promise<any | null> => {
    const problems: string[] = [];
    if (!state.general.configName?.trim()) problems.push('Configuration name is required');
    if (!/^[a-z0-9-_]+$/.test(state.general.configName || '')) problems.push('Configuration name must contain only lowercase letters, numbers, hyphens or underscores');
    if (!state.general.pageTitle?.trim()) problems.push('Page title is required');
    if (!state.general.gameDescription?.trim()) problems.push('Game description is required');
    if (!state.link.faviconUrl?.trim()) problems.push('Favicon is required');
    setErrors(problems);
    if (problems.length) return null;

    const page_name = state.general.configName.trim();
    const ordered = buildOrderedLinkBioState(state);
    const builderStateValue = { linkbio: ordered };
    const parsed = parseLinkBioFromServer(builderStateValue);
    const normalizedJson = parsed.json;

    const timestamp = new Date().toISOString();
    const hashSource = JSON.stringify({ page_name, value: normalizedJson });
    const hashid = await computeHashHex(hashSource);
    const metadata = {
      page_name,
      description: state.general.pageTitle.trim(),
      active: false,
      type: 'linkbio',
      type_value: state.link.slug.trim(),
      value: normalizedJson,
      Timestamp: timestamp,
      timestamp,
      lp_json: JSON.stringify(normalizedJson),
      hashid,
      user: user?.email || 'unknown',
      commit: 'create-linkbio',
    };
    return metadata;
  };

  // Posting handled within handleSave; no separate button/action anymore.

  // JSON preview helper removed as unused

  const handleSelect = async (id: string) => {
    setSelectedId(id);
    // Prefer local match first
    const localRec = list.find(r => r.id === id);
    if (localRec) {
      setState(normalizeLinkBioState(localRec.data));
      return;
    }
    // Otherwise fetch latest posted config by name
    try {
      const data: any = await pageforgeApi.getLinkBioLatest(id);
      const val = data?.value;
      const zt = val?.linkbio || val?.value?.linkbio || val; // be tolerant to nesting
      if (zt) {
        const norm = normalizeLinkBioState(zt);
        if (!norm.general.configName) { norm.general.configName = id; }
        setState(norm);
      } else {
        // Minimal fallback: map a subset if available
        console.warn('No linkbio state found in backend record; keeping current editor state');
      }
    } catch (e) {
      console.error('Failed to load LinkBio from backend:', e);
    }
  };

  const handleNew = () => {
    setSelectedId(null);
    setState(initialState);
  };

  const handleDeploy = async (id: string) => {
    try {
      const res = await pageforgeApi.deployLinkBio(id);
      // Notify similar to Landing Pages: clickable URL when available
      const deployedUrl = res?.url;
      if (deployedUrl) {
        try { deploymentSuccess(id, deployedUrl); } catch { }
      } else {
        try { success(`Deployment started for "${id}"`, { title: 'Deployment' }); } catch { }
      }
      await loadRemotePosted();
    } catch (e: any) {
      try { notifyError(e?.message || 'Deploy failed'); } catch { }
    }
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden min-h-0">
      {/* Top toolbar removed in favor of sticky footer controls */}
      {errors.length > 0 && (
        <div className="mb-4 p-3 rounded border border-red-500/50 bg-red-900/20 text-red-300 text-sm">
          <ul className="list-disc list-inside space-y-1">
            {errors.map((e, i) => (<li key={i}>{e}</li>))}
          </ul>
        </div>
      )}
      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-3 gap-8 items-stretch overflow-hidden">
        {/* Left: Settings + History (span 2) with tabs */}
        <div className="xl:col-span-2 h-full overflow-y-auto pr-2 rounded flex flex-col min-h-0">
          {/* Left tabs */}
          <div className="shrink-0 mb-4">
            <div className="flex items-center gap-4">
              {(['config', 'history'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveLeftTab(tab)}
                  className={`text-sm font-medium pb-1 border-b-2 ${activeLeftTab === tab ? 'border-indigo-500 text-indigo-300' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                >{tab.toUpperCase()}</button>
              ))}
            </div>
          </div>
          {/* Tab content */}
          {activeLeftTab === 'config' ? (
            <div className="space-y-8">
              <Section>
                <GeneralSettings
                  value={state.general}
                  onChange={patch => setState(s => ({ ...s, general: { ...s.general, ...patch } }))}
                />
              </Section>
              <Section>
                <BackgroundSettings
                  value={state.backgrounds}
                  onChange={patch => setState(s => ({ ...s, backgrounds: { ...s.backgrounds, ...patch } }))}
                />
              </Section>
              <Section>
                <LinkSettings
                  value={state.link}
                  onChange={patch => setState(s => ({ ...s, link: { ...s.link, ...patch } }))}
                />
              </Section>
              <Section>
                <PixelSettings
                  value={state.pixel}
                  onChange={patch => setState(s => {
                    const updatedPixel = { ...s.pixel, ...patch };

                    // Clean up mode-specific fields when pixelMode changes
                    if ('pixelMode' in patch) {
                      const newMode = patch.pixelMode;

                      if (newMode === 'none') {
                        // Remove all pixel-related fields
                        delete (updatedPixel as any).customPixelUrl;
                        delete (updatedPixel as any).customPixelVars;
                        delete (updatedPixel as any).detectionType;
                        delete (updatedPixel as any).mainUrl;
                        delete (updatedPixel as any).fallbackUrl;
                      } else if (newMode === 'global') {
                        // Remove custom mode fields
                        delete (updatedPixel as any).customPixelUrl;
                        delete (updatedPixel as any).customPixelVars;
                      } else if (newMode === 'custom') {
                        // Remove global mode fields
                        delete (updatedPixel as any).detectionType;
                        delete (updatedPixel as any).mainUrl;
                        delete (updatedPixel as any).fallbackUrl;
                      } else if (newMode === 'pftag_prod' || newMode === 'pftag_preprod') {
                        // Remove custom mode fields for pftag
                        delete (updatedPixel as any).customPixelUrl;
                        delete (updatedPixel as any).customPixelVars;
                        // Keep detectionType, mainUrl, and fallbackUrl for pftag
                      }
                    }

                    // Clean up mainUrl and fallbackUrl when detectionType changes to one that doesn't require them
                    if ('detectionType' in patch && (updatedPixel.pixelMode === 'pftag_prod' || updatedPixel.pixelMode === 'pftag_preprod')) {
                      const { DETECTION_TYPE_MAP } = require('../../utils/pftagValidation');
                      const detType = patch.detectionType;
                      if (detType && DETECTION_TYPE_MAP[detType]) {
                        const [, requireMainUrl, requireFallbackUrl] = DETECTION_TYPE_MAP[detType];
                        if (!requireMainUrl) {
                          delete (updatedPixel as any).mainUrl;
                        }
                        if (!requireFallbackUrl) {
                          delete (updatedPixel as any).fallbackUrl;
                        }
                      }
                    }

                    return { ...s, pixel: updatedPixel };
                  })}
                />
              </Section>
              <Section>
                <LinksSettings
                  value={state.stores}
                  onChange={patch => setState(s => ({ ...s, stores: { ...s.stores, ...patch } }))}
                />
              </Section>
              <Section>
                <ConsoleSettings
                  value={state.consoles}
                  onChange={patch => setState(s => ({ ...s, consoles: { ...s.consoles, ...patch } }))}
                />
              </Section>
              <Section>
                <MobileSettings
                  value={state.mobile}
                  onChange={patch => setState(s => ({ ...s, mobile: { ...s.mobile, ...patch } }))}
                />
              </Section>
              <Section>
                <SocialSettings
                  value={state.social}
                  onChange={patch => setState(s => ({ ...s, social: { ...s.social, ...patch } }))}
                />
              </Section>
              <Section>
                <FooterSettings
                  value={state.footer}
                  onChange={patch => setState(s => ({ ...s, footer: { ...s.footer, ...patch } }))}
                />
              </Section>
              {/* sticky footer with Reset/Save (simple, no blur) */}
              <div className="sticky bottom-0 z-10">
                <div className="bg-gray-900 border-t border-gray-700 p-3 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {lastSaved ? `Last saved ${lastSaved.toLocaleTimeString()}` : 'Unsaved changes'}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleNew}
                      type="button"
                      className="px-3 py-2 rounded-md text-xs font-medium bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-600"
                    >Reset</button>
                    <button
                      onClick={handleSave}
                      type="button"
                      disabled={saving}
                      className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow"
                    >{saving ? 'Saving...' : 'Save'}</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              {selectedId ? (
                historyLoading ? (
                  <div className="text-xs text-gray-400">Loading history…</div>
                ) : historyError ? (
                  <div className="text-xs text-red-400">{historyError}</div>
                ) : (
                  <div className="flex-1 min-h-[300px]">
                    <PreviewJsonHistory
                      history={history as any}
                      className="h-full"
                      initialKey={selectedHistoryKey}
                      currentOverrideJson={(() => {
                        try { return JSON.stringify({ linkbio: buildOrderedLinkBioState(state) }, null, 2); } catch { return undefined; }
                      })()}
                    />
                  </div>
                )
              ) : (
                <div className="text-xs text-gray-400">Select a LinkBio to view history</div>
              )}
            </div>
          )}
        </div>
        {/* Right: List */}
        <div className="xl:col-span-1 flex flex-col h-full min-h-0">
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="shrink-0">
              <LinkBioList
                // Show only test pages in Dev > Test-LinkBio
                items={remoteItems.filter(it => isTestConfig(it.id))}
                selectedId={selectedId}
                onSelect={handleSelect}
                onRefresh={loadRemotePosted}
                onDeploy={handleDeploy}
                onDuplicate={() => { try { success('Duplicate feature coming soon', { title: 'Duplicate' }); } catch { } }}
              />
              {loadingRemote && (
                <div className="mt-2 text-xs text-gray-400">Loading posted configs…</div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700 flex-1 min-h-0 overflow-auto">
              {/* Tabs: Preview | History (list) */}
              <div className="flex items-center gap-4 mb-3">
                {(['preview', 'history'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveRightTab(tab)}
                    className={`text-xs font-medium pb-1 border-b-2 ${activeRightTab === tab ? 'border-indigo-500 text-indigo-300' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                  >{tab.toUpperCase()}</button>
                ))}
              </div>

              {activeRightTab === 'preview' ? (
                <div>
                  {selectedId && (
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-gray-300 truncate">Preview: {selectedId}</div>
                    </div>
                  )}
                  {selectedId ? (
                    <LinkBioPreview
                      key={`${selectedId}-${lastSaved?.getTime() || 0}`}
                      name={selectedId}
                      fullHeight={false}
                    />
                  ) : (
                    <div className="text-xs text-gray-400">Select a LinkBio from the list to preview</div>
                  )}
                </div>
              ) : (
                <div>
                  {selectedId ? (
                    historyLoading ? (
                      <div className="text-xs text-gray-400">Loading history…</div>
                    ) : historyError ? (
                      <div className="text-xs text-red-400">{historyError}</div>
                    ) : (
                      <PreviewHistoryList
                        entries={history as any}
                        selectedKey={selectedHistoryKey}
                        onSelect={setSelectedHistoryKey}
                        latest={history[history.length - 1] as any}
                      />
                    )
                  ) : (
                    <div className="text-xs text-gray-400">Select a LinkBio to view history</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkBioPage;
