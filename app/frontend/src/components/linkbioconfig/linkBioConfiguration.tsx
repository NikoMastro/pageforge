import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { pageforgeApi } from '../../api';
import { useAuth } from '../layout/authContext';
import { useNotifications } from '../layout/notifiations';
import { computeHashHex } from '../../utils/backendPayload';
import { parseLinkBioFromServer } from '../../builders/linkbio/parse';
import PreviewHistoryList from '../ui/preview/previewHistoryList';
import PreviewJsonHistory from '../ui/preview/previewJsonHistory';
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
  LinkBioPreview
} from './index';
import type {
  LinkBioGeneralSettingsProps,
  LinkBioLinkSettingsProps,
  LinkBioPixelSettingsProps,
  LinkBioLinksSettingsProps,
  LinkBioConsoleSettingsProps,
  LinkBioMobileSettingsProps,
  LinkBioSocialSettingsProps,
  LinkBioFooterSettingsProps,
} from './index';
import type { LinkBioBackgroundValue } from './settings/backgroundSettings';

interface LinkBioState {
  general: LinkBioGeneralSettingsProps['value'];
  link: LinkBioLinkSettingsProps['value'];
  pixel: LinkBioPixelSettingsProps['value'];
  stores: LinkBioLinksSettingsProps['value'];
  consoles: LinkBioConsoleSettingsProps['value'];
  mobile: LinkBioMobileSettingsProps['value'];
  social: LinkBioSocialSettingsProps['value'];
  footer: LinkBioFooterSettingsProps['value'];
  backgrounds: LinkBioBackgroundValue;
  linksOrder?: string[];
}

const initialState: LinkBioState = {
  general: { configName: '', pageTitle: '', gameDescription: '', backgroundType: 'solid', backgroundValue: '#000000' },
  link: { slug: '', profileImageUrl: '', faviconUrl: '/favicon.ico', illustrationUrl: '' },
  pixel: { usePixelScript: false, pixelMode: 'none', gameId: '', partnerId: '', customPixelUrl: '', isTest: true },
  stores: { steam: '', epic: '', epicCta: 'Get on Epic' },
  consoles: { playstation: '', xbox: '', switch: '' },
  mobile: { ios: '', android: '' },
  social: { x: '', instagram: '', discord: '', youtube: '' },
  footer: { privacyUrl: '', termsUrl: '' },
  linksOrder: ['social', 'stores', 'consoles', 'mobile', 'footer'],
  backgrounds: {
    backgroundType: 'solid',
    backgroundValue: '#000000',
    secondaryBackgroundType: 'solid',
    secondaryBackgroundValue: '#111827'
  }
};

function normalizeLinkBioState(remote: any): LinkBioState {
  const safe = (v: any, d: any) => (v !== undefined && v !== null ? v : d);

  const extractUrl = (value: any): string => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object' && typeof value.url === 'string') return value.url;
    return '';
  };

  const extractProp = (parent: any, platform: string, prop: string): string | undefined => {
    const value = parent?.[platform];
    if (value && typeof value === 'object') {
      if (prop === 'cta') {
        return value['label'] || value['cta'];
      }
      return value[prop];
    }
    if (prop === 'az-data-platform') {
      return parent?.[`${platform}Id`];
    }
    if (prop === 'cta') {
      return parent?.[`${platform}Cta`];
    }
    if (prop === 'dataLabel') {
      return parent?.[`${platform}Label`];
    }
    if (prop === 'className') {
      return parent?.[`${platform}ClassName`];
    }
    return undefined;
  };

  const r = remote || {};
  const pixelMode = safe(r.pixel?.pixelMode, initialState.pixel.pixelMode);

  const pixel: any = {
    usePixelScript: safe(r.pixel?.usePixelScript, initialState.pixel.usePixelScript),
    pixelMode,
    gameId: safe(r.pixel?.gameId, initialState.pixel.gameId),
    partnerId: safe(r.pixel?.partnerId, initialState.pixel.partnerId),
    customPixelUrl: safe(r.pixel?.customPixelUrl, initialState.pixel.customPixelUrl),
    isTest: safe(r.pixel?.isTest, initialState.pixel.isTest),
  };

  if (pixelMode === 'global') {
    if (r.pixel?.detectionType !== undefined) pixel.detectionType = r.pixel.detectionType;
    if (r.pixel?.mainUrl !== undefined) pixel.mainUrl = r.pixel.mainUrl;
    if (r.pixel?.fallbackUrl !== undefined) pixel.fallbackUrl = r.pixel.fallbackUrl;
  } else if (pixelMode === 'custom') {
    if (r.pixel?.customPixelVars !== undefined) pixel.customPixelVars = r.pixel.customPixelVars;
  }

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
    pixel,
    stores: {
      steam: extractUrl(r.stores?.steam) || '',
      epic: extractUrl(r.stores?.epic) || '',
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
      playstation: extractUrl(r.consoles?.playstation) || '',
      xbox: extractUrl(r.consoles?.xbox) || '',
      switch: extractUrl(r.consoles?.switch) || '',
      playstationCta: extractProp(r.consoles, 'playstation', 'cta') || safe(r.consoles?.playstationCta, (initialState as any).consoles?.playstationCta),
      xboxCta: extractProp(r.consoles, 'xbox', 'cta') || safe(r.consoles?.xboxCta, (initialState as any).consoles?.xboxCta),
      switchCta: extractProp(r.consoles, 'switch', 'cta') || safe(r.consoles?.switchCta, (initialState as any).consoles?.switchCta),
      playstationId: extractProp(r.consoles, 'playstation', 'az-data-platform') || safe(r.consoles?.playstationId, (initialState as any).consoles?.playstationId),
      xboxId: extractProp(r.consoles, 'xbox', 'az-data-platform') || safe(r.consoles?.xboxId, (initialState as any).consoles?.xboxId),
      switchId: extractProp(r.consoles, 'switch', 'az-data-platform') || safe(r.consoles?.switchId, (initialState as any).consoles?.switchId),
      playstationLabel: extractProp(r.consoles, 'playstation', 'dataLabel') || safe(r.consoles?.playstationLabel, (initialState as any).consoles?.playstationLabel),
      xboxLabel: safe(r.consoles?.xboxLabel, (initialState as any).consoles?.xboxLabel),
      switchLabel: safe(r.consoles?.switchLabel, (initialState as any).consoles?.switchLabel),
      playstationClassName: safe(r.consoles?.playstationClassName, (initialState as any).consoles?.playstationClassName),
      xboxClassName: safe(r.consoles?.xboxClassName, (initialState as any).consoles?.xboxClassName),
      switchClassName: safe(r.consoles?.switchClassName, (initialState as any).consoles?.switchClassName),
      custom: Array.isArray(r.consoles?.custom) ? r.consoles.custom : (initialState as any).consoles?.custom,
      order: Array.isArray(r.consoles?.order) ? r.consoles.order : (initialState as any).consoles?.order,
    },
    mobile: {
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
      iosCta: extractProp(r.mobile, 'ios', 'cta') || safe(r.mobile?.iosCta, (initialState as any).mobile?.iosCta),
      androidCta: safe(r.mobile?.androidCta, (initialState as any).mobile?.androidCta),
      iosId: safe(r.mobile?.iosId, (initialState as any).mobile?.iosId),
      androidId: safe(r.mobile?.androidId, (initialState as any).mobile?.androidId),
      iosLabel: safe(r.mobile?.iosLabel, (initialState as any).mobile?.iosLabel),
      androidLabel: safe(r.mobile?.androidLabel, (initialState as any).mobile?.androidLabel),
      iosClassName: safe(r.mobile?.iosClassName, (initialState as any).mobile?.iosClassName),
      androidClassName: safe(r.mobile?.androidClassName, (initialState as any).mobile?.androidClassName),
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

interface LinkBioConfigurationProps {
  linkBioId?: string; // Optional: if provided, load existing LinkBio for editing
  onClose?: () => void; // Optional: callback when closing (for side panel)
}

const LinkBioConfiguration: React.FC<LinkBioConfigurationProps> = ({ linkBioId, onClose }) => {
  const navigate = useNavigate();
  const [state, setState] = useState<LinkBioState>(initialState);
  const [initialLoadedState, setInitialLoadedState] = useState<LinkBioState>(initialState);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [selectedHistoryKey, setSelectedHistoryKey] = useState<string>('');
  const [activeLeftTab, setActiveLeftTab] = useState<'config' | 'history'>('config');
  const [activeRightTab, setActiveRightTab] = useState<'preview' | 'history'>('preview');
  const { user } = useAuth();
  const { success, error: notifyError } = useNotifications();
  const isNewLinkBio = !linkBioId;

  // Load LinkBio if linkBioId is provided
  useEffect(() => {
    if (!linkBioId) {
      setState(initialState);
      setInitialLoadedState(initialState);
      return;
    }

    const loadLinkBio = async () => {
      try {
        const data: any = await pageforgeApi.getLinkBioLatest(linkBioId);
        const val = data?.value;
        const zt = val?.linkbio || val?.value?.linkbio || val;
        if (zt) {
          const norm = normalizeLinkBioState(zt);
          if (!norm.general.configName) {
            norm.general.configName = linkBioId;
          }
          setState(norm);
          setInitialLoadedState(norm);
        }
      } catch (e) {
        console.error('Failed to load LinkBio from backend:', e);
        notifyError('Failed to load LinkBio configuration');
      }
    };

    loadLinkBio();
  }, [linkBioId]);

  // Load history whenever linkBioId is provided
  useEffect(() => {
    if (!linkBioId) {
      setHistory([]);
      setHistoryError(null);
      return;
    }

    let cancelled = false;
    const loadHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const hist = await pageforgeApi.getLinkBioHistory(linkBioId);
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
          const latest = sorted[sorted.length - 1];
          const makeKey = (e?: any) => e ? [e.hashid, e.timestamp, e.commit].filter(Boolean).join('|') : '';
          setSelectedHistoryKey(makeKey(latest));
        }
      } catch (e: any) {
        if (!cancelled) setHistoryError(e?.message || 'Failed to load history');
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };
    loadHistory();
    return () => {
      cancelled = true;
    };
  }, [linkBioId]);

  // Clean up pixel fields based on mode
  useEffect(() => {
    const pixelMode = state.pixel.pixelMode;
    const detectionType = state.pixel.detectionType;
    const mainUrl = state.pixel.mainUrl;
    const fallbackUrl = state.pixel.fallbackUrl;

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

  const hasChanges = useMemo(() => {
    return JSON.stringify(state) !== JSON.stringify(initialLoadedState);
  }, [state, initialLoadedState]);

  const buildOrderedLinkBioState = useCallback((s: LinkBioState): LinkBioState => {
    const orderOr = (order: string[] | undefined, fallback: string[]) => (Array.isArray(order) && order.length ? order : fallback);

    const extractUrl = (val: any) => {
      if (typeof val === 'string') return val;
      if (val && typeof val === 'object' && val.url) return val.url;
      return '';
    };

    const extractProp = (src: any, platform: string, prop: string) => {
      const val = src[platform];
      if (val && typeof val === 'object') {
        if (prop === 'cta') {
          return val['label'] || val['cta'];
        }
        if (val[prop]) {
          return val[prop];
        }
      }
      let flatKey: string;
      if (prop === 'cta') {
        flatKey = `${platform}Cta`;
      } else if (prop === 'az-data-platform') {
        flatKey = `${platform}Id`;
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

    const socialOrder = orderOr((s as any).social?.order, ['x', 'instagram', 'discord', 'youtube']);
    const socialSrc: any = (s as any).social || {};
    const socialOrdered: any = {};
    socialOrder.forEach(k => { if (k in socialSrc && socialSrc[k] !== undefined) socialOrdered[k] = socialSrc[k]; });
    ['x', 'instagram', 'discord', 'youtube'].forEach(k => { if (!(k in socialOrdered) && k in socialSrc && socialSrc[k] !== undefined) socialOrdered[k] = socialSrc[k]; });
    if (socialSrc.custom !== undefined) socialOrdered.custom = socialSrc.custom;

    const mobileSrc: any = (s as any).mobile || {};
    const mobileOrdered: any = {};
    ['ios', 'android'].forEach(platform => {
      const url = extractUrl(mobileSrc[platform]);
      const cta = extractProp(mobileSrc, platform, 'cta');
      const azDataPlatform = extractProp(mobileSrc, platform, 'az-data-platform');
      const dataLabel = extractProp(mobileSrc, platform, 'dataLabel');
      const className = extractProp(mobileSrc, platform, 'className');

      if (url) {
        const platformObj: any = { url };
        if (cta) platformObj.label = cta;
        platformObj['az-data-platform'] = azDataPlatform || platform;
        if (dataLabel) platformObj.dataLabel = dataLabel;
        if (className) platformObj.className = className;
        mobileOrdered[platform] = platformObj;
      }
    });
    if (mobileSrc.order !== undefined) mobileOrdered.order = mobileSrc.order;

    const storesSrc: any = (s as any).stores || {};
    const storesOrdered: any = {};
    ['steam', 'epic'].forEach(platform => {
      const url = extractUrl(storesSrc[platform]);
      const cta = extractProp(storesSrc, platform, 'cta');
      const azDataPlatform = extractProp(storesSrc, platform, 'az-data-platform');
      const dataLabel = extractProp(storesSrc, platform, 'dataLabel');
      const className = extractProp(storesSrc, platform, 'className');

      if (url) {
        const platformObj: any = { url };
        if (cta) platformObj.label = cta;
        platformObj['az-data-platform'] = azDataPlatform || platform;
        if (dataLabel) platformObj.dataLabel = dataLabel;
        if (className) platformObj.className = className;
        storesOrdered[platform] = platformObj;
      }
    });
    if (storesSrc.custom !== undefined) storesOrdered.custom = storesSrc.custom;
    if (storesSrc.order !== undefined) storesOrdered.order = storesSrc.order;

    const consolesSrc: any = (s as any).consoles || {};
    const consolesOrdered: any = {};
    ['playstation', 'xbox', 'switch'].forEach(platform => {
      const url = extractUrl(consolesSrc[platform]);
      const cta = extractProp(consolesSrc, platform, 'cta');
      const azDataPlatform = extractProp(consolesSrc, platform, 'az-data-platform');
      const dataLabel = extractProp(consolesSrc, platform, 'dataLabel');
      const className = extractProp(consolesSrc, platform, 'className');

      if (url) {
        const platformObj: any = { url };
        if (cta) platformObj.label = cta;
        platformObj['az-data-platform'] = azDataPlatform || platform;
        if (dataLabel) platformObj.dataLabel = dataLabel;
        if (className) platformObj.className = className;
        consolesOrdered[platform] = platformObj;
      }
    });
    if (consolesSrc.custom !== undefined) consolesOrdered.custom = consolesSrc.custom;
    if (consolesSrc.order !== undefined) consolesOrdered.order = consolesSrc.order;

    const footerOrder = orderOr((s as any).footer?.order, ['privacyUrl', 'termsUrl']);
    const footerSrc: any = (s as any).footer || {};
    const footerOrdered: any = {};
    footerOrder.forEach(k => { if (k in footerSrc && footerSrc[k] !== undefined) footerOrdered[k] = footerSrc[k]; });
    ['privacyUrl', 'termsUrl'].forEach(k => { if (!(k in footerOrdered) && k in footerSrc && footerSrc[k] !== undefined) footerOrdered[k] = footerSrc[k]; });
    if (footerSrc.custom !== undefined) footerOrdered.custom = footerSrc.custom;

    const defaultSections = (initialState.linksOrder || ['social', 'stores', 'consoles', 'mobile', 'footer']);
    const sectionsOrder = orderOr((s as any).linksOrder, defaultSections);

    const cleanPixel = { ...s.pixel };
    const pixelMode = cleanPixel.pixelMode;

    if (pixelMode === 'none') {
      delete (cleanPixel as any).customPixelUrl;
      delete (cleanPixel as any).customPixelVars;
      delete (cleanPixel as any).detectionType;
      delete (cleanPixel as any).mainUrl;
      delete (cleanPixel as any).fallbackUrl;
    } else if (pixelMode === 'global') {
      delete (cleanPixel as any).customPixelUrl;
      delete (cleanPixel as any).customPixelVars;
    } else if (pixelMode === 'custom') {
      delete (cleanPixel as any).detectionType;
      delete (cleanPixel as any).mainUrl;
      delete (cleanPixel as any).fallbackUrl;
    } else if (pixelMode === 'pftag_prod' || pixelMode === 'pftag_preprod') {
      delete (cleanPixel as any).customPixelUrl;
      delete (cleanPixel as any).customPixelVars;
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const problems: string[] = [];
      if (!state.general.configName?.trim()) problems.push('Configuration name is required');
      if (!/^[a-z0-9-_]+$/.test(state.general.configName || '')) problems.push('Configuration name must contain only lowercase letters, numbers, hyphens or underscores');
      if (!state.general.pageTitle?.trim()) problems.push('Page title is required');
      if (!state.general.gameDescription?.trim()) problems.push('Game description is required');
      if (!state.link.faviconUrl?.trim()) problems.push('Favicon is required');

      if (state.pixel.pixelMode === 'pftag_prod' || state.pixel.pixelMode === 'pftag_preprod') {
        const { validatePfTagConfig } = await import('../../utils/pftagValidation');
        const isValid = validatePfTagConfig({
          detectionType: state.pixel.detectionType,
          mainUrl: state.pixel.mainUrl,
          fallbackUrl: state.pixel.fallbackUrl
        });
        if (!isValid) {
          problems.push('PfTag pixel configuration is invalid. Please check detection type and URL requirements.');
        }
      }

      setErrors(problems);
      if (problems.length) {
        return;
      }

      const page_name = state.general.configName.trim();
      const ordered = buildOrderedLinkBioState(state);
      const builderStateValue = { linkbio: ordered };

      // Parse builder state to normalized LinkBioJson format
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
        value: normalizedJson, // Save normalized JSON instead of builder state
        Timestamp: timestamp,
        timestamp,
        lp_json: JSON.stringify(normalizedJson), // Save normalized JSON string
        hashid,
        user: user?.email || 'unknown',
        commit: linkBioId ? 'edit-linkbio' : 'create-linkbio',
      };

      await pageforgeApi.saveLinkBio({ metadata });

      setLastSaved(new Date());
      setErrors([]);
      setInitialLoadedState(state);

      success(`LinkBio "${page_name}" saved successfully`, { title: 'LinkBio Saved' });

      // Trigger refresh event
      window.dispatchEvent(new CustomEvent('pageforge:linkbio-saved'));

      // If there's an onClose callback (side panel mode), close it
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        // Navigate back to list
        navigate('/linkbio');
      }
    } catch (e: any) {
      console.error('LinkBio save failed', e);
      notifyError(e?.message || 'Failed to save LinkBio to backend');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!linkBioId) {
      setState(initialState);
      setInitialLoadedState(initialState);
    } else {
      setState(initialLoadedState);
    }
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/linkbio');
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-800 bg-gray-900/70 px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-full border border-gray-700 bg-gray-800/80 p-2 text-gray-300 transition-colors hover:border-blue-500 hover:text-white"
            aria-label="Back to LinkBio list"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-white">
              {linkBioId ? `Edit LinkBio: ${linkBioId}` : 'Create New LinkBio'}
            </h1>
            <p className="text-sm text-gray-400">Configure your LinkBio landing page settings.</p>
          </div>
        </div>
      </header>

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="mx-6 mt-4 p-3 rounded border border-red-500/50 bg-red-900/20 text-red-300 text-sm">
          <ul className="list-disc list-inside space-y-1">
            {errors.map((e, i) => (<li key={i}>{e}</li>))}
          </ul>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-hidden p-6">
        <div className={`h-full grid grid-cols-1 ${isNewLinkBio ? '' : 'xl:grid-cols-3'} gap-8`}>
          {/* Left: Settings + History (span 2) with tabs */}
          <div className={`h-full flex flex-col min-h-0 ${isNewLinkBio ? '' : 'xl:col-span-2'}`}>
            {/* Left tabs */}
            {!isNewLinkBio && (
              <div className="mb-4 shrink-0">
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
            )}

            {/* Tab content */}
            {!isNewLinkBio && activeLeftTab === 'history' ? (
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {linkBioId ? (
                  historyLoading ? (
                    <div className="text-xs text-gray-400">Loading history…</div>
                  ) : historyError ? (
                    <div className="text-xs text-red-400">{historyError}</div>
                  ) : (
                    <div className="flex-1 min-h-0">
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
                  <div className="text-xs text-gray-400">Save the LinkBio first to view history</div>
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto scrollbar-hide pr-2 space-y-8">
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

                      if ('pixelMode' in patch) {
                        const newMode = patch.pixelMode;

                        if (newMode === 'none') {
                          delete (updatedPixel as any).customPixelUrl;
                          delete (updatedPixel as any).customPixelVars;
                          delete (updatedPixel as any).detectionType;
                          delete (updatedPixel as any).mainUrl;
                          delete (updatedPixel as any).fallbackUrl;
                        } else if (newMode === 'global') {
                          delete (updatedPixel as any).customPixelUrl;
                          delete (updatedPixel as any).customPixelVars;
                        } else if (newMode === 'custom') {
                          delete (updatedPixel as any).detectionType;
                          delete (updatedPixel as any).mainUrl;
                          delete (updatedPixel as any).fallbackUrl;
                        } else if (newMode === 'pftag_prod' || newMode === 'pftag_preprod') {
                          delete (updatedPixel as any).customPixelUrl;
                          delete (updatedPixel as any).customPixelVars;
                        }
                      }

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

                {/* Sticky footer with Reset/Save */}
                <div className="sticky bottom-0 z-10">
                  <div className="bg-gray-900 border-t border-gray-700 p-3 flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {lastSaved ? `Last saved ${lastSaved.toLocaleTimeString()}` : hasChanges ? 'Unsaved changes' : 'No changes'}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleReset}
                        type="button"
                        className="px-3 py-2 rounded-md text-xs font-medium bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-600"
                      >Reset</button>
                      <button
                        onClick={handleSave}
                        type="button"
                        disabled={saving || !hasChanges}
                        className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow"
                      >{saving ? 'Saving...' : 'Save'}</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Preview */}
          {!isNewLinkBio && (
            <div className="xl:col-span-1 flex flex-col h-full">
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 flex-1 flex flex-col overflow-hidden">
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
                  <div className="flex-1 overflow-auto">
                    {linkBioId && (
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-gray-300 truncate">Preview: {linkBioId}</div>
                      </div>
                    )}
                    {linkBioId ? (
                      <LinkBioPreview
                        key={`${linkBioId}-${lastSaved?.getTime() || 0}`}
                        name={linkBioId}
                        fullHeight={false}
                      />
                    ) : (
                      <div className="text-xs text-gray-400">Save the LinkBio first to preview</div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 overflow-auto">
                    {linkBioId ? (
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
                      <div className="text-xs text-gray-400">Save the LinkBio first to view history</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LinkBioConfiguration;
