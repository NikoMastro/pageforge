import { useEffect, useState, useCallback, useRef } from 'react';
import type { LandingPageData } from '../../types/shared.types';
import type { HtmlGeneratorConfig } from '../../types/api.types';
import { ConfigEditor, generateLandingPageData, parseCSSValue, formatCSSValue } from './settings';
import {
  useComponentDisplay,
  useGeneralOptions,
  useNavbarOptions,
  useHeroOptions,
  useButtonOptions,
  useCarouselOptions,
  useSteamReviewsOptions,
  useVideoPlayerOptions,
  useTitleTxtOptions,
  useColumnTxtOptions,
  useMediaShowcaseOptions,
  useFaqOptions,
  useFooterOptions,
  useWidgetOptions,
  useCookieBannerOptions,
} from '../../hooks';
import { buildBackendPayload } from '../../utils/backendPayload';
import { collectInvalidUrls } from '../../utils';
import { pageforgeApi } from '../../api';
import { useAuth } from '../layout/authContext';
import { DETECTION_TYPE_MAP } from '../../utils/pftagValidation';
import LpTabsConfig from './lpTabsConfig';

interface JsonEditConfiguratorProps {
  pageName: string;
  initialData: LandingPageData;
  initialHtmlConfig?: HtmlGeneratorConfig;
  className?: string;
  onSaved?: (updated: { landingPageData: LandingPageData; htmlConfig?: HtmlGeneratorConfig }) => void;
  onTempDataChange?: (data: { landingPageData: LandingPageData; htmlConfig?: HtmlGeneratorConfig }) => void;
}

export default function JsonEditConfigurator({ pageName, initialData, initialHtmlConfig, className = '', onSaved, onTempDataChange }: JsonEditConfiguratorProps) {
  const { user: authUser } = useAuth();
  const currentUserEmail = authUser?.email || 'unknown';
  const { componentDisplay, setComponentDisplay, handleComponentToggle, setPresetComponents } = useComponentDisplay();
  const { generalOptions, setGeneralOptions } = useGeneralOptions();
  const { navbarOptions, setNavbarOptions } = useNavbarOptions();
  const { heroOptions, setHeroOptions } = useHeroOptions();
  const { buttonOptions, setButtonOptions } = useButtonOptions();
  const { carouselOptions, setCarouselOptions } = useCarouselOptions();
  const { steamReviewsOptions, setSteamReviewsOptions } = useSteamReviewsOptions();
  const { videoPlayerOptions, setVideoPlayerOptions } = useVideoPlayerOptions();
  const { titleTxtOptions, setTitleTxtOptions } = useTitleTxtOptions();
  const { columnTxtOptions, setColumnTxtOptions } = useColumnTxtOptions();
  const { mediaShowcaseOptions, setMediaShowcaseOptions } = useMediaShowcaseOptions();
  const { faqOptions, setFaqOptions } = useFaqOptions();
  const { footerOptions, setFooterOptions } = useFooterOptions();
  const { widgetOptions, setWidgetOptions } = useWidgetOptions();
  const { cookieBannerOptions, setCookieBannerOptions } = useCookieBannerOptions();

  const [name] = useState(pageName);
  const [preset, setPreset] = useState<'Basic' | 'Widget' | 'Full-Content'>(
    (() => {
      const p = (initialData as any)?.metadata?.preset;
      const normalizedPreset = typeof p === 'string' ?
        p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : p;
      // - fallback to Full-Content in case of preset Custom on old page are upadated
      if (normalizedPreset === 'Custom') return 'Full-Content';
      return normalizedPreset === 'Basic' || normalizedPreset === 'Widget' || normalizedPreset === 'Full-content' ?
        (normalizedPreset === 'Full-content' ? 'Full-Content' : normalizedPreset) : 'Full-Content';
    })()
  );
  const [layoutMode] = useState<'desktop' | 'phone'>('phone');
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [phoneBackgroundUrl, setPhoneBackgroundUrl] = useState('');
  const [htmlConfig, setHtmlConfig] = useState<HtmlGeneratorConfig>(() => {
    const pixelMode = (initialHtmlConfig?.pixelMode as any) ?? 'none';
    const config: any = {
      title: initialHtmlConfig?.title ?? pageName,
      faviconLink: initialHtmlConfig?.faviconLink ?? '/favicon.ico',
      tagline: initialHtmlConfig?.tagline ?? '',
      usePixelScript: initialHtmlConfig?.usePixelScript ?? false,
      pixelMode,
      gameId: initialHtmlConfig?.gameId ?? '',
      partnerId: initialHtmlConfig?.partnerId ?? '',
      isTest: initialHtmlConfig?.isTest ?? false,
    };

    const pixelExperimentName = typeof initialHtmlConfig?.pixelExperimentName === 'string'
      ? initialHtmlConfig.pixelExperimentName.trim()
      : '';
    if (pixelExperimentName) {
      config.pixelExperimentName = pixelExperimentName;
    }

    // Only include mode-specific fields if they exist in the initial config
    if (pixelMode === 'global') {
      if ((initialHtmlConfig as any)?.detectionType !== undefined) config.detectionType = (initialHtmlConfig as any).detectionType;
      if ((initialHtmlConfig as any)?.mainUrl !== undefined) config.mainUrl = (initialHtmlConfig as any).mainUrl;
      if ((initialHtmlConfig as any)?.fallbackUrl !== undefined) config.fallbackUrl = (initialHtmlConfig as any).fallbackUrl;
    } else if (pixelMode === 'custom') {
      if (initialHtmlConfig?.customPixelUrl !== undefined) config.customPixelUrl = initialHtmlConfig.customPixelUrl;
      if ((initialHtmlConfig as any)?.customPixelVars !== undefined) config.customPixelVars = (initialHtmlConfig as any).customPixelVars;
    } else if (pixelMode === 'pftag_prod' || pixelMode === 'pftag_preprod') {
      if ((initialHtmlConfig as any)?.detectionType !== undefined) config.detectionType = (initialHtmlConfig as any).detectionType;
      if ((initialHtmlConfig as any)?.mainUrl !== undefined) config.mainUrl = (initialHtmlConfig as any).mainUrl;
      if ((initialHtmlConfig as any)?.fallbackUrl !== undefined) config.fallbackUrl = (initialHtmlConfig as any).fallbackUrl;
    }

    return config;
  });

  // Clean up pixel fields that are not required by current pixelMode/detectionType
  useEffect(() => {
    const pixelMode = htmlConfig.pixelMode;
    const detectionType = (htmlConfig as any).detectionType;
    const mainUrl = (htmlConfig as any).mainUrl;
    const fallbackUrl = (htmlConfig as any).fallbackUrl;

    // Only clean if we're in pftag mode and have a detectionType
    if ((pixelMode === 'pftag_prod' || pixelMode === 'pftag_preprod') && detectionType) {
      if (DETECTION_TYPE_MAP[detectionType]) {
        const [, requireMainUrl, requireFallbackUrl] = DETECTION_TYPE_MAP[detectionType];

        const needsCleanup =
          (!requireMainUrl && mainUrl) ||
          (!requireFallbackUrl && fallbackUrl);

        if (needsCleanup) {
          setHtmlConfig(prev => {
            const cleaned = { ...prev };
            if (!requireMainUrl) {
              delete (cleaned as any).mainUrl;
            }
            if (!requireFallbackUrl) {
              delete (cleaned as any).fallbackUrl;
            }
            return cleaned;
          });
        }
      }
    }
  }, [htmlConfig]);

  const [paddingValues, setPaddingValues] = useState({ top: 8, right: 16, bottom: 8, left: 16 });
  const [marginValues, setMarginValues] = useState({ top: 0, right: 0, bottom: 0, left: 0 });
  const [borderRadiusValue, setBorderRadiusValue] = useState(8);
  const [urlErrors, setUrlErrors] = useState<string[]>([]);
  const presetDraftRef = useRef<Record<'Basic' | 'Widget' | 'Full-Content', any>>({} as any);

  // Track if we've already initialized from props to avoid resetting on prop changes
  const initializedRef = useRef(false);
  const lastPageNameRef = useRef(pageName);
  const lastInitialDataRef = useRef<any>(null);
  const lastInitialHtmlConfigRef = useRef<any>(null);

  // Reset initialization flag when pageName changes (loading a different page) or when initialData/initialHtmlConfig changes (e.g., after rollback)
  useEffect(() => {
    const dataChanged = lastInitialDataRef.current !== initialData;
    const htmlConfigChanged = lastInitialHtmlConfigRef.current !== initialHtmlConfig;
    const pageChanged = lastPageNameRef.current !== pageName;

    if (pageChanged || dataChanged || htmlConfigChanged) {
      initializedRef.current = false;
      lastPageNameRef.current = pageName;
      lastInitialDataRef.current = initialData;
      lastInitialHtmlConfigRef.current = initialHtmlConfig;
    }
  }, [pageName, initialData, initialHtmlConfig]);

  useEffect(() => {
    // Only run initialization once when component first mounts or when pageName/initialData changes
    if (initializedRef.current) return;
    initializedRef.current = true; try {
      let sections = initialData?.sections || [];
      const settings = initialData?.settings || {};
      if (initialHtmlConfig) {
        setHtmlConfig((prev: any) => {
          const pixelMode = initialHtmlConfig.pixelMode ?? prev.pixelMode;
          const updated: any = {
            title: initialHtmlConfig.title ?? prev.title,
            faviconLink: initialHtmlConfig.faviconLink ?? prev.faviconLink,
            tagline: initialHtmlConfig.tagline ?? prev.tagline,
            usePixelScript: initialHtmlConfig.usePixelScript ?? prev.usePixelScript,
            pixelMode,
            gameId: initialHtmlConfig.gameId ?? prev.gameId,
            partnerId: initialHtmlConfig.partnerId ?? prev.partnerId,
            isTest: initialHtmlConfig.isTest ?? prev.isTest,
          };

          const pixelExperimentName = typeof initialHtmlConfig.pixelExperimentName === 'string'
            ? initialHtmlConfig.pixelExperimentName.trim()
            : '';
          if (pixelExperimentName) {
            updated.pixelExperimentName = pixelExperimentName;
          }

          // Only include mode-specific fields if they exist in the initial config
          if (pixelMode === 'global') {
            if ((initialHtmlConfig as any).detectionType !== undefined) updated.detectionType = (initialHtmlConfig as any).detectionType;
            if ((initialHtmlConfig as any).mainUrl !== undefined) updated.mainUrl = (initialHtmlConfig as any).mainUrl;
            if ((initialHtmlConfig as any).fallbackUrl !== undefined) updated.fallbackUrl = (initialHtmlConfig as any).fallbackUrl;
          } else if (pixelMode === 'custom') {
            if (initialHtmlConfig.customPixelUrl !== undefined) updated.customPixelUrl = initialHtmlConfig.customPixelUrl;
            if ((initialHtmlConfig as any).customPixelVars !== undefined) updated.customPixelVars = (initialHtmlConfig as any).customPixelVars;
          } else if (pixelMode === 'pftag_prod' || pixelMode === 'pftag_preprod') {
            if ((initialHtmlConfig as any).detectionType !== undefined) updated.detectionType = (initialHtmlConfig as any).detectionType;
            if ((initialHtmlConfig as any).mainUrl !== undefined) updated.mainUrl = (initialHtmlConfig as any).mainUrl;
            if ((initialHtmlConfig as any).fallbackUrl !== undefined) updated.fallbackUrl = (initialHtmlConfig as any).fallbackUrl;
          }

          return updated;
        });
      }

      // General options from settings
      const theme = (settings as any).theme || {};
      if (theme?.fontFamily || theme?.headingFontFamily || theme?.fontWeight || theme?.customFontUrl) {
        setGeneralOptions({
          font: {
            family: theme.fontFamily || theme.headingFontFamily || 'Inter, sans-serif',
            weight: theme.fontWeight || '400',
            customUrl: theme.customFontUrl // Restore custom font URL for editing
          }
        } as any);
      }

      // Component display flags inferred purely from JSON sections.
      // Start with everything unchecked so only components actually present in the JSON get enabled.
      const inferredComponentDisplay: any = Object.fromEntries(
        Object.keys(componentDisplay).map(k => [k, false])
      );
      sections.forEach(s => {
        const sectionDisplay = (s as any)?.props?.display;
        if (s.type === 'background') inferredComponentDisplay.background = sectionDisplay !== false;
        if (s.type === 'navbar') {
          inferredComponentDisplay.navbar = sectionDisplay !== false;
          const navProps: any = (s as any).props || {};
          if (navProps.button && navProps.button.display !== false) inferredComponentDisplay.button = true;
          if (navProps.widget && navProps.widget.display !== false) inferredComponentDisplay.widget = true;
        }
        if (s.type === 'hero') inferredComponentDisplay.hero = sectionDisplay !== false;
        if (s.type === 'button') inferredComponentDisplay.button = sectionDisplay !== false;
        if (s.type === 'footer') inferredComponentDisplay.footer = sectionDisplay !== false;
        if (s.type === 'carousel') inferredComponentDisplay.carousel = sectionDisplay !== false;
        if (s.type === 'steamReviews') inferredComponentDisplay.steamReviews = sectionDisplay !== false;
        if (s.type === 'videoPlayer') inferredComponentDisplay.videoPlayer = sectionDisplay !== false;
        if (s.type === 'titleTxt') inferredComponentDisplay.titleTxt = sectionDisplay !== false;
        if (s.type === 'columnTxt') inferredComponentDisplay.columnTxt = sectionDisplay !== false;
        if (s.type === 'mediaShowcase') inferredComponentDisplay.mediaShowcase = sectionDisplay !== false;
        if (s.type === 'faq') inferredComponentDisplay.faq = sectionDisplay !== false;
        if (s.type === 'widget') inferredComponentDisplay.widget = sectionDisplay !== false;
        if (s.type === 'cookiesBanner') inferredComponentDisplay.cookiesBanner = sectionDisplay !== false;
      });

      // Apply preset restrictions: override inferred display based on the saved preset
      const savedPreset = (initialData as any)?.metadata?.preset;
      const savedPresetLower = typeof savedPreset === 'string' ? savedPreset.toLowerCase() : '';

      if (savedPresetLower === 'basic') {
        // Basic preset should not show these sections regardless of JSON data
        inferredComponentDisplay.widget = false;
        inferredComponentDisplay.carousel = false;
        inferredComponentDisplay.steamReviews = false;
        inferredComponentDisplay.videoPlayer = false;
        inferredComponentDisplay.titleTxt = false;
        inferredComponentDisplay.columnTxt = false;
        inferredComponentDisplay.mediaShowcase = false;
        inferredComponentDisplay.faq = false;
      } else if (savedPresetLower === 'widget') {
        // Widget preset has same restrictions as Basic, but shows widget instead of button
        inferredComponentDisplay.button = false;
        inferredComponentDisplay.carousel = false;
        inferredComponentDisplay.steamReviews = false;
        inferredComponentDisplay.videoPlayer = false;
        inferredComponentDisplay.titleTxt = false;
        inferredComponentDisplay.columnTxt = false;
        inferredComponentDisplay.mediaShowcase = false;
        inferredComponentDisplay.faq = false;
      } else if (savedPresetLower === 'full-content') {
        inferredComponentDisplay.widget = false;
        inferredComponentDisplay.button = true;
        sections = sections.map((section: any) => {
          const cleanedSection = { ...section };
          const props = cleanedSection.props;
          if (props && props.widget && props.widget.display === true) {
            delete props.widget;
            if (props.button && typeof props.button === 'object') {
              props.button.display = true;
            } else if (props) {
              props.button = { display: true };
            }
          }
          return cleanedSection;
        });
      }

      setComponentDisplay(inferredComponentDisplay);
      // Cookie Banner hydrate
      const cookieBannerSection = sections.find(s => s.type === 'cookiesBanner') as any;
      if (cookieBannerSection?.props) {
        setCookieBannerOptions((prev: any) => ({
          ...prev,
          backgroundColor: cookieBannerSection.props.backgroundColor ?? prev.backgroundColor,
          backgroundOpacity: cookieBannerSection.props.backgroundOpacity ?? prev.backgroundOpacity,
          textColor: cookieBannerSection.props.textColor ?? prev.textColor,
          headerText: cookieBannerSection.props.headerText ?? prev.headerText,
          bodyText: cookieBannerSection.props.bodyText ?? prev.bodyText,
          policyUrl: cookieBannerSection.props.policyUrl ?? prev.policyUrl,
          acceptText: cookieBannerSection.props.acceptText ?? prev.acceptText,
          customizeText: cookieBannerSection.props.customizeText ?? prev.customizeText,
          showReject: cookieBannerSection.props.showReject ?? prev.showReject,
        }));
      }

      // Background
      const backgroundSection = sections.find(s => s.type === 'background') as any;
      if (backgroundSection?.props?.src) setBackgroundUrl(backgroundSection.props.src);
      if (backgroundSection?.props?.phoneSrc) setPhoneBackgroundUrl(backgroundSection.props.phoneSrc);
      try {
        const providedGameId = (initialHtmlConfig?.gameId || '').trim();
        if (!providedGameId) {
          const navbarSectionForInference: any = sections.find(s => s.type === 'navbar');
          const widgetSectionForInference: any = sections.find(s => s.type === 'widget');
          const inferredGameId = (navbarSectionForInference?.props?.widget?.gameId || widgetSectionForInference?.props?.gameId || '').trim();
          if (inferredGameId) {
            setHtmlConfig((prev: any) => ({ ...prev, gameId: inferredGameId }));
          }
        }
      } catch { }

      // Navbar + widget
      const navbarSection = sections.find(s => s.type === 'navbar') as any;
      if (navbarSection?.props) {
        const navbarProps = navbarSection.props;
        const rawLogoHeight = navbarProps.logo?.height;
        const parsedLogoHeight = (rawLogoHeight !== undefined && rawLogoHeight !== null)
          ? (typeof rawLogoHeight === 'string' ? parseInt(rawLogoHeight, 10) : Number(rawLogoHeight))
          : (navbarOptions as any)?.logoHeight;
        setNavbarOptions((prev: any) => ({
          ...prev,
          logoUrl: navbarProps.logo?.path || prev.logoUrl,
          logo: {
            src: navbarProps.logo?.path || prev.logo?.src || '',
            alt: navbarProps.logo?.alt || prev.logo?.alt || '',
            width: (navbarProps.logo?.width ? `${navbarProps.logo.width}` : (prev.logo?.width || '120px')),
            height: (parsedLogoHeight ? `${parsedLogoHeight}px` : (prev.logo?.height || 'auto')),
          },
          logoPosition: navbarProps.logoPosition || prev.logoPosition,
          logoHeight: (typeof parsedLogoHeight === 'number' && !Number.isNaN(parsedLogoHeight)) ? parsedLogoHeight : prev.logoHeight,
          position: navbarProps.position || prev.position,
          displayHamburger: navbarProps.hamburger?.display ?? prev.displayHamburger,
          links: Array.isArray(navbarProps.hamburger?.links) ? navbarProps.hamburger.links.map((l: any) => {
            const rawUrl: string | undefined = (typeof l.url === 'string' ? l.url : undefined) ?? (typeof l.href === 'string' ? l.href : undefined);
            const isSection = !!l.sectionId || (!!rawUrl && rawUrl.startsWith('#'));
            const href = !!rawUrl && !rawUrl.startsWith('#') ? rawUrl : undefined;
            const sectionId = l.sectionId || (rawUrl && rawUrl.startsWith('#') ? rawUrl.slice(1) : undefined);
            return {
              id: l.id,
              text: l.text,
              type: isSection ? 'section' : 'url',
              href,
              sectionId,
              target: l.target || '_self'
            };
          }) : prev.links,
          displayNavbarButton: navbarProps.button?.display ?? prev.displayNavbarButton,
          displayNavbarWidget: navbarProps.widget?.display ?? prev.displayNavbarWidget,
          navbarClassName: navbarProps.className || prev.navbarClassName
        }));
        if (navbarProps.widget) {
          setWidgetOptions((prev: any) => ({
            ...prev,
            enabled: !!navbarProps.widget.display,
            type: navbarProps.widget.type || prev.type,
            gameId: navbarProps.widget.gameId || prev.gameId,
            scale: navbarProps.widget.scale ?? prev.scale,
            utm: navbarProps.widget.utm || prev.utm,
            addToNavbar: !!navbarProps.widget.display,
            alignX: navbarProps.widget.alignX || prev.alignX,
            alignY: navbarProps.widget.alignY || prev.alignY,
          }));
        }
      }

      const widgetSection = sections.find(s => s.type === 'widget') as any;
      if (widgetSection?.props) {
        const widgetProps = widgetSection.props;
        setWidgetOptions((prev: any) => ({
          ...prev,
          enabled: widgetProps.enabled ?? widgetProps.display ?? prev.enabled,
          type: widgetProps.type || prev.type,
          gameId: widgetProps.gameId || prev.gameId,
          width: widgetProps.width ?? prev.width,
          height: widgetProps.height ?? prev.height,
          scale: widgetProps.scale ?? prev.scale,
          language: widgetProps.language || prev.language,
          alignX: widgetProps.alignX || prev.alignX || 'center',
          alignY: widgetProps.alignY || prev.alignY || 'middle',
          positionX: (typeof widgetProps.positionX === 'number' ? widgetProps.positionX : (typeof prev.positionX === 'number' ? prev.positionX : 0)),
          positionY: (typeof widgetProps.positionY === 'number' ? widgetProps.positionY : (typeof prev.positionY === 'number' ? prev.positionY : 0)),
          shadowIntensity: (typeof widgetProps.shadowIntensity === 'number' ? widgetProps.shadowIntensity : prev.shadowIntensity),
          utm: widgetProps.utm || prev.utm,
        }));
      }

      // Hero
      const heroSection = sections.find(s => s.type === 'hero') as any;
      if (heroSection?.props) {
        const heroProps = heroSection.props;
        const parseAlpha = (val: any): number | undefined => {
          if (!val || typeof val !== 'string') return undefined;
          // expect like: '2px 2px 4px rgba(0,0,0,0.3)'
          const m = val.match(/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*([0-9]*\.?[0-9]+)\s*\)/i);
          if (m) {
            const a = parseFloat(m[1]);
            if (!Number.isNaN(a)) return Math.min(Math.max(a, 0), 1);
          }
          return undefined;
        };
        setHeroOptions((prev: any) => ({
          ...prev,
          heading: (heroProps.heading !== undefined ? heroProps.heading : prev.heading),
          subheading: (heroProps.subheading !== undefined ? heroProps.subheading : prev.subheading),
          headingColor: heroProps.headingStyle?.color || prev.headingColor,
          subheadingColor: heroProps.subheadingStyle?.color || prev.subheadingColor,
          headingClassName: heroProps.headingClassName !== undefined ? heroProps.headingClassName : prev.headingClassName,
          subheadingClassName: heroProps.subheadingClassName !== undefined ? heroProps.subheadingClassName : prev.subheadingClassName,
          textShadow: (heroProps.headingStyle?.textShadow && heroProps.headingStyle.textShadow !== 'none')
            || (heroProps.subheadingStyle?.textShadow && heroProps.subheadingStyle.textShadow !== 'none')
            || prev.textShadow,
          textShadowIntensity: parseAlpha(heroProps.headingStyle?.textShadow) ?? parseAlpha(heroProps.subheadingStyle?.textShadow) ?? prev.textShadowIntensity,
          display: heroProps.display !== undefined ? heroProps.display : prev.display,
        }));
      }

      // Utility function to parse shadow alpha from CSS shadow value
      const parseShadowAlpha = (val: any): number | undefined => {
        if (!val || typeof val !== 'string') return undefined;
        // expect like: '0 4px 14px rgba(0,0,0,0.25)'
        const m = val.match(/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*([0-9]*\.?[0-9]+)\s*\)/i);
        if (m) {
          const a = parseFloat(m[1]);
          if (!Number.isNaN(a)) return Math.min(Math.max(a, 0), 1);
        }
        return undefined;
      };

      const buttonSection = sections.find(s => s.type === 'button') as any;
      let hydratedButtonPadding = '8px 16px';
      let hydratedButtonMargin = '0px';
      let hydratedButtonRadius = '8px';
      if (buttonSection?.props) {
        const buttonProps = buttonSection.props;
        setButtonOptions((prev: any) => {
          const mergedSteamIcon = buttonProps.steamIcon ? { ...prev.steamIcon, ...buttonProps.steamIcon } : prev.steamIcon;
          const steamVariant = mergedSteamIcon?.variant as 'black' | 'white' | 'gray' | 'default' | undefined;
          const steamVariantDefaultColors: Record<'black' | 'white' | 'gray', string> = {
            black: '#000000',
            white: '#ffffff',
            gray: '#787878',
          };
          const shouldAssignDefaultSteamColor = mergedSteamIcon && !mergedSteamIcon.color && (steamVariant === 'black' || steamVariant === 'white' || steamVariant === 'gray');
          const steamIconFinal = shouldAssignDefaultSteamColor ? { ...mergedSteamIcon, color: steamVariantDefaultColors[steamVariant as 'black' | 'white' | 'gray'] } : mergedSteamIcon;

          return {
            ...prev,
            buttonText: (buttonProps.text !== undefined ? buttonProps.text : prev.buttonText),
            buttonSize: buttonProps.buttonSize || prev.buttonSize || 'default',
            backgroundColor: buttonProps.backgroundColor || prev.backgroundColor,
            hoverBackgroundColor: buttonProps.hoverBackgroundColor || prev.hoverBackgroundColor,
            margin: (buttonProps.margin !== undefined ? buttonProps.margin : prev.margin),
            padding: (buttonProps.padding !== undefined ? buttonProps.padding : prev.padding),
            shadow: buttonProps.shadow !== undefined ? buttonProps.shadow : prev.shadow,
            hoverShadow: buttonProps.hoverShadow !== undefined ? buttonProps.hoverShadow : prev.hoverShadow,
            shadowIntensity: parseShadowAlpha(buttonProps.shadow) ?? prev.shadowIntensity,
            hoverShadowIntensity: parseShadowAlpha(buttonProps.hoverShadow) ?? prev.hoverShadowIntensity,
            fullWidth: buttonProps.fullWidth !== undefined ? buttonProps.fullWidth : prev.fullWidth,
            disabled: buttonProps.disabled !== undefined ? buttonProps.disabled : prev.disabled,
            font: {
              ...(prev.font || {}),
              family: buttonProps.font?.family || prev.font?.family || 'inherit',
              weight: buttonProps.font?.weight || prev.font?.weight || '500',
              size: buttonProps.font?.size || prev.font?.size || '16px',
              color: buttonProps.font?.color || prev.font?.color || '#ffffff',
              hoverColor: buttonProps.font?.hoverColor || prev.font?.hoverColor || '#ffffff',
            },
            border: {
              ...(prev.border || {}),
              radius: buttonProps.border?.radius || prev.border?.radius || '8px',
              width: buttonProps.border?.width || prev.border?.width || '2px',
              style: buttonProps.border?.style || prev.border?.style || 'solid',
              color: buttonProps.border?.color || prev.border?.color || 'transparent',
              hoverColor: buttonProps.border?.hoverColor || prev.border?.hoverColor || 'transparent',
            },
            steamIcon: steamIconFinal,
            image: buttonProps.image ? { ...prev.image, ...buttonProps.image } : prev.image,
          };
        });
        hydratedButtonPadding = buttonProps.padding || hydratedButtonPadding;
        hydratedButtonMargin = buttonProps.margin || hydratedButtonMargin;
        hydratedButtonRadius = buttonProps.border?.radius || hydratedButtonRadius;
      } else if (navbarSection?.props?.button) {
        const navbarButtonProps = navbarSection.props.button;
        setButtonOptions((prev: any) => {
          const mergedSteamIcon = navbarButtonProps.steamIcon ? { ...prev.steamIcon, ...navbarButtonProps.steamIcon } : prev.steamIcon;
          const steamVariant = mergedSteamIcon?.variant as 'black' | 'white' | 'gray' | 'default' | undefined;
          const steamVariantDefaultColors: Record<'black' | 'white' | 'gray', string> = {
            black: '#000000',
            white: '#ffffff',
            gray: '#787878',
          };
          const shouldAssignDefaultSteamColor = mergedSteamIcon && !mergedSteamIcon.color && (steamVariant === 'black' || steamVariant === 'white' || steamVariant === 'gray');
          const steamIconFinal = shouldAssignDefaultSteamColor ? { ...mergedSteamIcon, color: steamVariantDefaultColors[steamVariant as 'black' | 'white' | 'gray'] } : mergedSteamIcon;

          return {
            ...prev,
            buttonText: navbarButtonProps.text || prev.buttonText,
            buttonSize: navbarButtonProps.buttonSize || prev.buttonSize || 'default',
            backgroundColor: navbarButtonProps.backgroundColor || prev.backgroundColor,
            hoverBackgroundColor: navbarButtonProps.hoverBackgroundColor || prev.hoverBackgroundColor,
            margin: navbarButtonProps.margin || prev.margin,
            padding: navbarButtonProps.padding || prev.padding,
            shadow: navbarButtonProps.shadow !== undefined ? navbarButtonProps.shadow : prev.shadow,
            hoverShadow: navbarButtonProps.hoverShadow !== undefined ? navbarButtonProps.hoverShadow : prev.hoverShadow,
            shadowIntensity: parseShadowAlpha(navbarButtonProps.shadow) ?? prev.shadowIntensity,
            hoverShadowIntensity: parseShadowAlpha(navbarButtonProps.hoverShadow) ?? prev.hoverShadowIntensity,
            fullWidth: navbarButtonProps.fullWidth !== undefined ? navbarButtonProps.fullWidth : prev.fullWidth,
            disabled: navbarButtonProps.disabled !== undefined ? navbarButtonProps.disabled : prev.disabled,
            border: {
              ...(prev.border || {}),
              radius: navbarButtonProps.border?.radius || prev.border?.radius || '8px',
              width: navbarButtonProps.border?.width || prev.border?.width || '2px',
              style: navbarButtonProps.border?.style || prev.border?.style || 'solid',
              color: navbarButtonProps.border?.color || prev.border?.color || 'transparent',
              hoverColor: navbarButtonProps.border?.hoverColor || prev.border?.hoverColor || 'transparent',
            },
            font: {
              ...(prev.font || {}),
              family: navbarButtonProps.font?.family || prev.font?.family || 'inherit',
              weight: navbarButtonProps.font?.weight || prev.font?.weight || '500',
              size: navbarButtonProps.font?.size || prev.font?.size || '16px',
              color: navbarButtonProps.font?.color || prev.font?.color || '#ffffff',
              hoverColor: navbarButtonProps.font?.hoverColor || prev.font?.hoverColor || '#ffffff',
            },
            steamIcon: steamIconFinal,
            image: navbarButtonProps.image ? { ...prev.image, ...navbarButtonProps.image } : prev.image,
          };
        });
        hydratedButtonPadding = navbarButtonProps.padding || hydratedButtonPadding;
        hydratedButtonMargin = navbarButtonProps.margin || hydratedButtonMargin;
        hydratedButtonRadius = navbarButtonProps.border?.radius || hydratedButtonRadius;
      }

      // Carousel
      const carouselSection = sections.find(s => s.type === 'carousel') as any;
      if (carouselSection?.props) {
        const carouselProps = carouselSection.props; // renamed from generic 'c'
        setCarouselOptions((prev: any) => ({
          ...prev,
          images: Array.isArray(carouselProps.images) ? carouselProps.images.map((img: any) => ({
            src: img.path !== undefined && img.src === undefined ? (img.path || '') : (img.src || ''),
            alt: img.alt || ''
          })) : prev.images,
          autoPlay: carouselProps.autoPlay ?? carouselProps.carousel?.autoPlay ?? prev.autoPlay,
          interval: carouselProps.autoScrollInterval ?? carouselProps.interval ?? carouselProps.carousel?.interval ?? prev.interval,
          showDots: carouselProps.showDots ?? carouselProps.carousel?.showDots ?? prev.showDots,
          showArrows: (carouselProps.showControls !== undefined ? carouselProps.showControls : (carouselProps.showArrows ?? carouselProps.carousel?.showArrows)) ?? prev.showArrows,
          orientation: carouselProps.orientation || (prev as any).orientation || 'horizontal',
          width: carouselProps.width != null ? carouselProps.width : (prev as any).width,
          height: carouselProps.height != null ? carouselProps.height : (prev as any).height,
          imageHeight: carouselProps.imageHeight != null ? carouselProps.imageHeight : (prev as any).imageHeight,
          imageWidth: carouselProps.imageWidth != null ? carouselProps.imageWidth : (prev as any).imageWidth,
          displayCTA: savedPresetLower === 'full-content'
            ? (carouselProps.button?.display ?? prev.displayCTA ?? false)
            : ((carouselProps.button?.display || carouselProps.widget?.display) ?? prev.displayCTA ?? false),
          background: carouselProps.background || prev.background,
          // includeCarousel removed: display now controlled by componentDisplay.carousel
        }));
      }

      // Steam Reviews
      const steamReviewsSection = sections.find(s => s.type === 'steamReviews') as any;
      if (steamReviewsSection?.props) {
        const steamReviewsProps = steamReviewsSection.props;
        setSteamReviewsOptions((prev: any) => ({
          ...prev,
          images: Array.isArray(steamReviewsProps.images) ? steamReviewsProps.images.map((img: any) => ({
            src: img.path !== undefined && img.src === undefined ? (img.path || '') : (img.src || ''),
            alt: img.alt || ''
          })) : prev.images,
          orientation: steamReviewsProps.orientation || prev.orientation || 'horizontal',
          scrollSpeed: steamReviewsProps.scrollSpeed ?? prev.scrollSpeed ?? 50,
          width: steamReviewsProps.width != null ? steamReviewsProps.width : prev.width,
          height: steamReviewsProps.height != null ? steamReviewsProps.height : prev.height,
          maxWidth: steamReviewsProps.maxWidth != null ? steamReviewsProps.maxWidth : prev.maxWidth,
          imageHeight: steamReviewsProps.imageHeight != null ? steamReviewsProps.imageHeight : prev.imageHeight,
          imageWidth: steamReviewsProps.imageWidth != null ? steamReviewsProps.imageWidth : prev.imageWidth,
          gap: steamReviewsProps.gap ?? prev.gap ?? 16,
          displayCTA: savedPresetLower === 'full-content'
            ? (steamReviewsProps.button?.display ?? prev.displayCTA ?? false)
            : ((steamReviewsProps.button?.display || steamReviewsProps.widget?.display) ?? prev.displayCTA ?? false),
          background: steamReviewsProps.background || prev.background,
        }));
      }

      // VideoPlayer
      const videoPlayerSection = sections.find(s => s.type === 'videoPlayer') as any;
      if (videoPlayerSection?.props) {
        const videoPlayerProps = videoPlayerSection.props;
        setVideoPlayerOptions((prev: any) => ({
          ...prev,
          background: videoPlayerProps.background || prev.background || { type: 'solid', color: '#000000' },
          videoSource: videoPlayerProps.videoSource || prev.videoSource || { type: 'url', url: '' },
          videoWidth: videoPlayerProps.videoWidth ?? prev.videoWidth ?? '100%',
          videoHeight: videoPlayerProps.videoHeight ?? prev.videoHeight ?? 'auto',
          aspectRatio: videoPlayerProps.aspectRatio || prev.aspectRatio || '16/9',
          autoPlay: videoPlayerProps.autoPlay ?? prev.autoPlay ?? false,
          loop: videoPlayerProps.loop ?? prev.loop ?? false,
          muted: videoPlayerProps.muted ?? prev.muted ?? true,
          controls: videoPlayerProps.controls ?? prev.controls ?? true,
          playsInline: videoPlayerProps.playsInline ?? prev.playsInline ?? true,
          poster: videoPlayerProps.poster || prev.poster || '',
          displayCTA: savedPresetLower === 'full-content'
            ? (videoPlayerProps.button?.display ?? false)
            : ((videoPlayerProps.button?.display || videoPlayerProps.widget?.display) ?? false),
        }));
      }

      // TitleTxt
      const titleTxtSection = sections.find(s => s.type === 'titleTxt') as any;
      if (titleTxtSection?.props) {
        const titleTxtProps = titleTxtSection.props;
        setTitleTxtOptions((prev: any) => ({
          ...prev,
          title: titleTxtProps.title || prev.title || '',
          subtext: titleTxtProps.subtext || titleTxtProps.subtitle || prev.subtext || '',
          background: titleTxtProps.background || prev.background || { type: 'solid', color: '#ffffff' },
          backgroundColor: titleTxtProps.backgroundColor || prev.backgroundColor || '#ffffff',
          titleColor: titleTxtProps.titleColor || prev.titleColor || '#000000',
          subtextColor: titleTxtProps.subtextColor || prev.subtextColor || '#666666',
          titleFontSize: titleTxtProps.titleFontSize || prev.titleFontSize || '48px',
          subtextFontSize: titleTxtProps.subtextFontSize || prev.subtextFontSize || '24px',
          displayCTA: savedPresetLower === 'full-content'
            ? (titleTxtProps.button?.display ?? prev.displayCTA ?? false)
            : ((titleTxtProps.button?.display || titleTxtProps.widget?.display) ?? prev.displayCTA ?? false),
        }));
      }

      // ColumnTxt
      const columnTxtSection = sections.find(s => s.type === 'columnTxt') as any;
      if (columnTxtSection?.props) {
        const columnTxtProps = columnTxtSection.props;
        setColumnTxtOptions((prev: any) => ({
          ...prev,
          rows: columnTxtProps.rows || prev.rows || [],
          background: columnTxtProps.background || prev.background || { type: 'solid', color: '#ffffff' },
          backgroundColor: columnTxtProps.backgroundColor || prev.backgroundColor || '#ffffff',
          textColor: columnTxtProps.textColor || prev.textColor || '#000000',
          fontSize: columnTxtProps.fontSize || prev.fontSize || '16px',
          imageWidth: columnTxtProps.imageWidth || prev.imageWidth || '50%',
          imageHeight: columnTxtProps.imageHeight || prev.imageHeight || 'auto',
          gap: columnTxtProps.gap ?? prev.gap ?? 32,
          padding: columnTxtProps.padding || prev.padding || '40px 20px',
          displayCTA: savedPresetLower === 'full-content'
            ? (columnTxtProps.button?.display ?? prev.displayCTA ?? false)
            : ((columnTxtProps.button?.display || columnTxtProps.widget?.display) ?? prev.displayCTA ?? false),
        }));
      }

      // MediaShowcase
      const mediaShowcaseSection = sections.find(s => s.type === 'mediaShowcase') as any;
      if (mediaShowcaseSection?.props) {
        const mediaShowcaseProps = mediaShowcaseSection.props;
        setMediaShowcaseOptions((prev: any) => ({
          ...prev,
          title: mediaShowcaseProps.title ?? prev.title,
          items: mediaShowcaseProps.items || prev.items || [],
          background: mediaShowcaseProps.background || prev.background || { type: 'solid', color: '#000000' },
          rows: mediaShowcaseProps.rows ?? prev.rows ?? 2,
          columns: mediaShowcaseProps.columns ?? prev.columns ?? 3,
          gap: mediaShowcaseProps.gap ?? prev.gap ?? 10,
          backgroundColor: mediaShowcaseProps.backgroundColor || prev.backgroundColor || '#000000',
          padding: mediaShowcaseProps.padding || prev.padding || '0',
          cellHeight: mediaShowcaseProps.cellHeight || prev.cellHeight || '300px',
          displayCTA: savedPresetLower === 'full-content'
            ? (mediaShowcaseProps.button?.display ?? prev.displayCTA ?? false)
            : ((mediaShowcaseProps.button?.display || mediaShowcaseProps.widget?.display) ?? prev.displayCTA ?? false),
        }));
      }

      // FAQ
      const faqSection = sections.find(s => s.type === 'faq') as any;
      if (faqSection?.props) {
        const faqProps = faqSection.props;
        setFaqOptions((prev: any) => ({
          ...prev,
          items: faqProps.items || prev.items || [],
          title: faqProps.title || prev.title || 'Frequently Asked Questions',
          background: faqProps.background || prev.background || { type: 'solid', color: '#ffffff' },
          backgroundColor: faqProps.backgroundColor || prev.backgroundColor || '#ffffff',
          textColor: faqProps.textColor || prev.textColor || '#000000',
          questionFontSize: faqProps.questionFontSize || prev.questionFontSize || '18px',
          answerFontSize: faqProps.answerFontSize || prev.answerFontSize || '16px',
          padding: faqProps.padding || prev.padding || '60px 20px',
          maxWidth: faqProps.maxWidth || prev.maxWidth || '1000px',
          separatorColor: faqProps.separatorColor || prev.separatorColor || '#e5e7eb',
          iconColor: faqProps.iconColor || prev.iconColor || '#6b7280',
        }));
      }

      // Footer
      const footerSection = sections.find(s => s.type === 'footer') as any;
      if (footerSection?.props) {
        const footerProps = footerSection.props;
        setFooterOptions((prev: any) => ({
          ...prev,
          backgroundColor: footerProps.backgroundColor || prev.backgroundColor,
          textColor: footerProps.textColor || prev.textColor,
          footerText: (footerProps.content?.copyright?.text !== undefined ? footerProps.content.copyright.text : (footerProps.footerText || prev.footerText)),
          logoUrl: footerProps.branding?.logo?.path || footerProps.logoUrl || prev.logoUrl,
          logoWidth: footerProps.branding?.logo?.width ?? prev.logoWidth,
          logoHeight: footerProps.branding?.logo?.height ?? prev.logoHeight,
          logoSize: (footerProps.branding?.logo?.width || footerProps.branding?.logo?.height || prev.logoSize),
          hasAdditionalLogo: (footerProps.branding?.additionalLogo ? true : (!!footerProps.hasAdditionalLogo)),
          additionalLogoUrl: footerProps.branding?.additionalLogo?.path || footerProps.additionalLogoUrl || prev.additionalLogoUrl,
          additionalLogoPosition: footerProps.branding?.additionalLogo?.position || footerProps.additionalLogoPosition || prev.additionalLogoPosition,
          additionalLogoWidth: footerProps.branding?.additionalLogo ? (footerProps.branding.additionalLogo.width ?? prev.additionalLogoWidth) : prev.additionalLogoWidth,
          additionalLogoHeight: footerProps.branding?.additionalLogo ? (footerProps.branding.additionalLogo.height ?? prev.additionalLogoHeight) : prev.additionalLogoHeight,
          additionalLogoSize: footerProps.branding?.additionalLogo ? (footerProps.branding.additionalLogo.width || footerProps.branding.additionalLogo.height) : prev.additionalLogoSize,
          links: Array.isArray(footerProps.links) ? footerProps.links : prev.links,
          socialMedia: Array.isArray(footerProps.socialMedia) ? footerProps.socialMedia : prev.socialMedia,
          layout: { ...(prev as any).layout, ...(footerProps.layout || {}) },
          termsUrl: footerProps.content?.links?.items?.find((it: any) => /terms/i.test(it.text))?.url || prev.termsUrl,
          privacyUrl: footerProps.content?.links?.items?.find((it: any) => /privacy/i.test(it.text))?.url || prev.privacyUrl,
          refundUrl: footerProps.content?.links?.items?.find((it: any) => /refund/i.test(it.text))?.url || prev.refundUrl,
          eulaUrl: footerProps.content?.links?.items?.find((it: any) => /eula/i.test(it.text))?.url || prev.eulaUrl,
          contactUrl: footerProps.content?.links?.items?.find((it: any) => /contact/i.test(it.text))?.url || prev.contactUrl,
          includeSocialIcons: (footerProps.social?.display !== undefined ? !!footerProps.social.display : prev.includeSocialIcons),
          selectedSocialIcons: (() => {
            const icons = footerProps.social?.icons;
            if (!Array.isArray(icons)) return prev.selectedSocialIcons;
            const mapAltToKey = (alt: string) => {
              const a = (alt || '').trim().toLowerCase();
              if (a.includes('discord')) return 'discord';
              if (a.includes('facebook')) return 'facebook';
              if (a.includes('steam')) return 'steam';
              if (a.includes('twitter') || a.includes('x')) return 'x';
              if (a.includes('vk')) return 'vk';
              if (a.includes('youtube')) return 'youtube';
              if (a.includes('instagram')) return 'instagram';
              if (a.includes('reddit')) return 'reddit';
              if (a.includes('tiktok')) return 'tiktok';
              if (a.includes('twitch')) return 'twitch';
              return '';
            };
            const keys = icons.map((ic: any) => mapAltToKey(ic.alt)).filter(Boolean);
            return keys.length ? keys : prev.selectedSocialIcons;
          })(),
          customSocialUrls: (() => {
            const icons = footerProps.social?.icons;
            if (!Array.isArray(icons)) return prev.customSocialUrls;
            const out: Record<string, string> = { ...(prev.customSocialUrls || {}) };
            icons.forEach((ic: any) => {
              const key = (ic.alt || '').trim().toLowerCase();
              const map: Record<string, string> = {
                discord: 'discord', facebook: 'facebook', steam: 'steam', x: 'x', twitter: 'x',
                vk: 'vk', youtube: 'youtube', instagram: 'instagram', reddit: 'reddit', tiktok: 'tiktok', twitch: 'twitch'
              };
              const k = map[key] || (Object.keys(map).find(m => key.includes(m)) || '');
              if (k) out[k] = ic.url || '';
            });
            return out;
          })(),
          socialIconSize: footerProps.social?.iconSize || prev.socialIconSize,
        }));
      }

      const sourcePadding = hydratedButtonPadding || buttonOptions.padding || '8px 16px';
      const paddingTop = parseCSSValue((sourcePadding.split(' ')[0] || '8px'), 8);
      const paddingRight = parseCSSValue((sourcePadding.split(' ')[1] || '16px'), 16);
      const paddingBottom = parseCSSValue((sourcePadding.split(' ')[2] || `${paddingTop}px`), paddingTop);
      const paddingLeft = parseCSSValue((sourcePadding.split(' ')[3] || `${paddingRight}px`), paddingRight);
      setPaddingValues({ top: paddingTop, right: paddingRight, bottom: paddingBottom, left: paddingLeft });

      const sourceMargin = hydratedButtonMargin || buttonOptions.margin || '0px';
      const marginTop = parseCSSValue((sourceMargin.split(' ')[0] || '0px'), 0);
      const marginRight = parseCSSValue((sourceMargin.split(' ')[1] || '0px'), 0);
      const marginBottom = parseCSSValue((sourceMargin.split(' ')[2] || `${marginTop}px`), marginTop);
      const marginLeft = parseCSSValue((sourceMargin.split(' ')[3] || `${marginRight}px`), marginRight);
      setMarginValues({ top: marginTop, right: marginRight, bottom: marginBottom, left: marginLeft });

      const parsedBorderRadius = parseCSSValue(hydratedButtonRadius || buttonOptions.border?.radius || '8px', 8);
      setBorderRadiusValue(parsedBorderRadius);
      if (!(initialData as any)?.metadata?.preset) {
        setPreset((_prevPreset: 'Basic' | 'Widget' | 'Full-Content') => {
          // Full-Content: has carousel or videoPlayer or steamReviews or columnTxt
          if (inferredComponentDisplay.carousel || inferredComponentDisplay.videoPlayer || inferredComponentDisplay.steamReviews || inferredComponentDisplay.columnTxt) {
            return 'Full-Content';
          }

          // Widget preset: widget present, no button
          if (inferredComponentDisplay.widget && !inferredComponentDisplay.button) {
            return 'Widget';
          }

          // Basic preset: button present, no widget
          if (inferredComponentDisplay.button && !inferredComponentDisplay.widget) {
            return 'Basic';
          }

          // Both button AND widget present, or other combinations = (fallback from Custom)
          if (inferredComponentDisplay.widget && inferredComponentDisplay.button) {
            return 'Full-Content';
          }

          // Default to Basic
          return 'Basic';
        });
      }
    } catch (e) {
      console.warn('Hydration from LandingPageData failed (will use defaults):', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageName]); // Only re-run when pageName changes (different page loaded)

  // REMOVED: This useEffect was overriding the component display loaded from JSON
  // The componentDisplay is already set correctly from the JSON hydration above
  // No need to call setPresetComponents which would override the loaded state

  const updatePadding = useCallback((v: typeof paddingValues) => {
    setPaddingValues(v);
    const pad = `${formatCSSValue(v.top)} ${formatCSSValue(v.right)} ${formatCSSValue(v.bottom)} ${formatCSSValue(v.left)}`;
    setButtonOptions((prev: any) => ({ ...prev, padding: pad } as any));
  }, [setButtonOptions]);

  const updateMargin = useCallback((v: typeof marginValues) => {
    setMarginValues(v);
    const mar = `${formatCSSValue(v.top)} ${formatCSSValue(v.right)} ${formatCSSValue(v.bottom)} ${formatCSSValue(v.left)}`;
    setButtonOptions((prev: any) => ({ ...prev, margin: mar } as any));
  }, [setButtonOptions]);

  const updateBorderRadius = useCallback((value: number) => {
    setBorderRadiusValue(value);
    setButtonOptions((prev: any) => ({ ...prev, border: { ...(prev.border || {}), radius: formatCSSValue(value) } } as any));
  }, [setButtonOptions]);

  const updateHtmlField = (field: keyof HtmlGeneratorConfig, value: string | boolean) => {
    setHtmlConfig((prev: any) => {
      const updated = { ...prev, [field]: value };

      // Clean up mode-specific fields when pixelMode changes
      if (field === 'pixelMode') {
        const newMode = value as string;

        if (newMode === 'none') {
          // Remove all pixel-related fields
          delete updated.customPixelUrl;
          delete updated.customPixelVars;
          delete updated.detectionType;
          delete updated.mainUrl;
          delete updated.fallbackUrl;
          delete updated.pixelExperimentName;
        } else if (newMode === 'global') {
          // Remove custom mode fields
          delete updated.customPixelUrl;
          delete updated.customPixelVars;
          delete updated.pixelExperimentName;
        } else if (newMode === 'custom') {
          // Remove global mode fields
          delete updated.detectionType;
          delete updated.mainUrl;
          delete updated.fallbackUrl;
        } else if (newMode === 'pftag_prod' || newMode === 'pftag_preprod') {
          // Remove custom mode fields for pftag
          delete updated.customPixelUrl;
          delete updated.customPixelVars;
          delete updated.pixelExperimentName;
          // Keep detectionType, mainUrl, and fallbackUrl for pftag
        }
      }

      // Clean up mainUrl and fallbackUrl when detectionType changes to one that doesn't require them
      if (field === 'detectionType' && (updated.pixelMode === 'pftag_prod' || updated.pixelMode === 'pftag_preprod')) {
        const detType = value as string;
        if (detType && DETECTION_TYPE_MAP[detType]) {
          const [, requireMainUrl, requireFallbackUrl] = DETECTION_TYPE_MAP[detType];
          if (!requireMainUrl) {
            delete updated.mainUrl;
          }
          if (!requireFallbackUrl) {
            delete updated.fallbackUrl;
          }
        }
      }

      if (field === 'pixelExperimentName') {
        const nameValue = typeof value === 'string' ? value.trim() : '';
        if (nameValue) {
          updated.pixelExperimentName = nameValue;
        } else {
          delete updated.pixelExperimentName;
        }
      }

      return updated as any;
    });
  };
  const snapshotDraft = useCallback(() => ({
    componentDisplay,
    backgroundUrl,
    phoneBackgroundUrl,
    navbarOptions,
    heroOptions,
    buttonOptions,
    carouselOptions,
    footerOptions,
    widgetOptions,
    cookieBannerOptions,
    generalOptions,
    htmlConfig,
    paddingValues,
    marginValues,
    borderRadiusValue,
  }), [
    componentDisplay,
    backgroundUrl,
    phoneBackgroundUrl,
    navbarOptions,
    heroOptions,
    buttonOptions,
    carouselOptions,
    footerOptions,
    widgetOptions,
    cookieBannerOptions,
    generalOptions,
    htmlConfig,
    paddingValues,
    marginValues,
    borderRadiusValue,
  ]);
  const applyDraft = useCallback((d: any) => {
    if (!d) return;
    setComponentDisplay(d.componentDisplay);
    setBackgroundUrl(d.backgroundUrl || '');
    setPhoneBackgroundUrl(d.phoneBackgroundUrl || '');
    setNavbarOptions(d.navbarOptions);
    setHeroOptions(d.heroOptions);
    setButtonOptions(d.buttonOptions);
    setCarouselOptions(d.carouselOptions);
    setFooterOptions(d.footerOptions);
    setWidgetOptions(d.widgetOptions);
    setCookieBannerOptions(d.cookieBannerOptions);
    setGeneralOptions(d.generalOptions);
    setHtmlConfig(d.htmlConfig);
    setPaddingValues(d.paddingValues);
    setMarginValues(d.marginValues);
    setBorderRadiusValue(d.borderRadiusValue);
  }, [
    setComponentDisplay,
    setBackgroundUrl,
    setPhoneBackgroundUrl,
    setNavbarOptions,
    setHeroOptions,
    setButtonOptions,
    setCarouselOptions,
    setFooterOptions,
    setWidgetOptions,
    setCookieBannerOptions,
    setGeneralOptions,
    setHtmlConfig,
  ]);
  const handlePresetChange = (newPreset: 'Basic' | 'Widget' | 'Full-Content') => {
    presetDraftRef.current[preset] = snapshotDraft();
    setPreset(newPreset);
    try {
      if ((initialData as any).metadata) {
        (initialData as any).metadata.preset = newPreset.toLowerCase();
        (initialData as any).metadata.layoutMode = layoutMode;
      } else {
        (initialData as any).metadata = { title: '', description: '', preset: newPreset.toLowerCase(), group: '', layoutMode };
      }
    } catch { }

    const draft = presetDraftRef.current[newPreset];
    if (draft) {
      applyDraft(draft);
    } else {
      setPresetComponents(newPreset);
    }
    // Always enforce preset-specific component display rules after applying draft or setting preset
    if (newPreset === 'Widget') {
      setWidgetOptions(prev => ({ ...prev, width: prev.width ?? 646, height: prev.height ?? 190 }));
      // Widget has same restrictions as Basic, but shows widget instead of button
      setComponentDisplay(prev => ({
        ...prev,
        button: false,
        carousel: false,
        steamReviews: false,
        videoPlayer: false,
        titleTxt: false,
        columnTxt: false,
        mediaShowcase: false,
        faq: false,
      }));
    } else if (newPreset === 'Basic') {
      // Remove any navbar widget residue and disable non-basic sections when switching to Basic
      setNavbarOptions(prev => ({
        ...prev,
        displayNavbarWidget: false
      }));
      setWidgetOptions(prev => ({
        ...prev,
        addToNavbar: false
      }));
      setComponentDisplay(prev => ({
        ...prev,
        widget: false,
        carousel: false,
        steamReviews: false,
        videoPlayer: false,
        titleTxt: false,
        columnTxt: false,
        mediaShowcase: false,
        faq: false,
      }));
    }
  };

  useEffect(() => {
    if (preset === 'Widget' && componentDisplay.button) {
      setComponentDisplay((prev: any) => ({ ...prev, button: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, componentDisplay.button]);

  // Notify parent of temporary changes (without saving)
  useEffect(() => {
    if (!onTempDataChange) return;

    const timer = setTimeout(() => {
      const landingPageData = generateLandingPageData({
        page_name: pageName,
        componentDisplay,
        backgroundUrl,
        phoneBackgroundUrl,
        navbarOptions,
        heroOptions,
        buttonOptions,
        carouselOptions,
        steamReviewsOptions,
        footerOptions,
        widgetOptions,
        videoPlayerOptions,
        titleTxtOptions,
        columnTxtOptions,
        mediaShowcaseOptions,
        faqOptions,
        cookieBannerOptions,
        generalOptions,
        user: currentUserEmail,
        type: 'update',
        commit: 'temp-edit'
      } as any) as LandingPageData;

      // Add preset metadata
      try {
        if ((landingPageData as any).metadata) {
          (landingPageData as any).metadata.preset = preset.toLowerCase();
          (landingPageData as any).metadata.layoutMode = layoutMode;
        } else {
          (landingPageData as any).metadata = { title: '', description: '', preset: preset.toLowerCase(), group: '', layoutMode };
        }
      } catch { }

      // Preserve initial metadata
      try {
        if ((initialData as any).metadata) {
          const existingMeta = (landingPageData as any).metadata || {};
          const initialMeta = (initialData as any).metadata || {};
          (landingPageData as any).metadata = {
            title: initialMeta.title ?? existingMeta.title ?? '',
            description: initialMeta.description ?? existingMeta.description ?? '',
            preset: existingMeta.preset ?? initialMeta.preset ?? '',
            group: initialMeta.group ?? existingMeta.group ?? '',
            layoutMode: existingMeta.layoutMode ?? initialMeta.layoutMode ?? 'phone'
          };
        }
      } catch { }

      onTempDataChange({ landingPageData, htmlConfig });
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pageName,
    componentDisplay,
    backgroundUrl,
    phoneBackgroundUrl,
    navbarOptions,
    heroOptions,
    buttonOptions,
    carouselOptions,
    steamReviewsOptions,
    videoPlayerOptions,
    titleTxtOptions,
    columnTxtOptions,
    mediaShowcaseOptions,
    faqOptions,
    footerOptions,
    widgetOptions,
    cookieBannerOptions,
    generalOptions,
    htmlConfig,
    preset,
    currentUserEmail,
    initialData
  ]);

  const handleSave = async () => {
    setUrlErrors([]);
    const landingPageData = generateLandingPageData({
      page_name: pageName,
      componentDisplay,
      backgroundUrl,
      phoneBackgroundUrl,
      navbarOptions,
      heroOptions,
      buttonOptions,
      carouselOptions,
      steamReviewsOptions,
      footerOptions,
      widgetOptions,
      videoPlayerOptions,
      titleTxtOptions,
      columnTxtOptions,
      mediaShowcaseOptions,
      faqOptions,
      cookieBannerOptions,
      generalOptions,
      user: currentUserEmail,
      type: 'update',
      commit: 'edit-with-ui'
    } as any) as LandingPageData;

    try {
      if ((landingPageData as any).metadata) {
        (landingPageData as any).metadata.preset = preset.toLowerCase();
        (landingPageData as any).metadata.layoutMode = layoutMode;
      } else {
        (landingPageData as any).metadata = { title: '', description: '', preset: preset.toLowerCase(), group: '', layoutMode };
      }
    } catch { }

    // Preserve initial metadata with consistent property order
    try {
      if ((initialData as any).metadata) {
        const existingMeta = (landingPageData as any).metadata || {};
        const initialMeta = (initialData as any).metadata || {};
        (landingPageData as any).metadata = {
          title: initialMeta.title ?? existingMeta.title ?? '',
          description: initialMeta.description ?? existingMeta.description ?? '',
          preset: existingMeta.preset ?? initialMeta.preset ?? '',
          group: initialMeta.group ?? existingMeta.group ?? '',
          layoutMode: layoutMode
        };
      }
    } catch { }

    // Exclude pftag URLs from generic validation - they have their own validation logic
    const isPftagMode = htmlConfig.pixelMode === 'pftag_prod' || htmlConfig.pixelMode === 'pftag_preprod';

    const urlValidationCandidates = [
      ...(isPftagMode ? [] : [
        { label: 'HTML: Main URL', value: (htmlConfig as any).mainUrl },
        { label: 'HTML: Fallback URL', value: (htmlConfig as any).fallbackUrl },
      ]),
      { label: 'HTML: Custom Pixel URL', value: htmlConfig.customPixelUrl },
      { label: 'General: Custom Font URL', value: generalOptions.font?.customUrl },
      { label: 'Cookie Banner: Policy URL', value: cookieBannerOptions.policyUrl },
      { label: 'Navbar: Logo URL', value: navbarOptions.logoUrl },
      ...((navbarOptions.links || []).filter((l: any) => (l as any).type === 'url').map((l: any, i: number) => ({ label: `Navbar link #${i + 1} URL`, value: l.href, allowRelative: true }))),
      { label: 'Background: Desktop URL', value: backgroundUrl },
      { label: 'Background: Phone URL', value: phoneBackgroundUrl },
      { label: 'Button: Image URL', value: buttonOptions.image?.src },
      { label: 'Footer: Logo URL', value: footerOptions.logoUrl },
      { label: 'Footer: Second Logo URL', value: footerOptions.hasAdditionalLogo ? footerOptions.additionalLogoUrl : '' },
      { label: 'Footer: Terms URL', value: footerOptions.termsUrl },
      { label: 'Footer: Privacy URL', value: footerOptions.privacyUrl },
      { label: 'Footer: Refund URL', value: footerOptions.refundUrl },
      { label: 'Footer: EULA URL', value: footerOptions.eulaUrl },
      { label: 'Footer: Contact URL', value: footerOptions.contactUrl },
      ...((footerOptions.selectedSocialIcons || []).map((key: string) => ({
        label: `Footer: ${key} URL`,
        value: footerOptions.customSocialUrls?.[key as keyof typeof footerOptions.customSocialUrls] || ''
      })))
    ];
    const invalidUrlEntries = collectInvalidUrls(urlValidationCandidates);
    if (invalidUrlEntries.length) {
      setUrlErrors(invalidUrlEntries.map(i => `${i.label}`));
      return;
    }

    try {
      // Ensure generated HTML uses the selected global font if HTML font is unset/default
      // Clean up mode-specific fields before saving
      const effectiveHtmlConfig = { ...htmlConfig };
      const pixelMode = effectiveHtmlConfig.pixelMode;

      if (pixelMode === 'none') {
        // Remove all pixel-related fields
        delete (effectiveHtmlConfig as any).customPixelUrl;
        delete (effectiveHtmlConfig as any).customPixelVars;
        delete (effectiveHtmlConfig as any).detectionType;
        delete (effectiveHtmlConfig as any).mainUrl;
        delete (effectiveHtmlConfig as any).fallbackUrl;
        delete (effectiveHtmlConfig as any).pixelExperimentName;
      } else if (pixelMode === 'global') {
        // Remove custom mode fields
        delete (effectiveHtmlConfig as any).customPixelUrl;
        delete (effectiveHtmlConfig as any).customPixelVars;
        delete (effectiveHtmlConfig as any).pixelExperimentName;
      } else if (pixelMode === 'custom') {
        // Remove global mode fields
        delete (effectiveHtmlConfig as any).detectionType;
        delete (effectiveHtmlConfig as any).mainUrl;
        delete (effectiveHtmlConfig as any).fallbackUrl;
      } else if (pixelMode === 'pftag_prod' || pixelMode === 'pftag_preprod') {
        // Remove custom mode fields for pftag
        delete (effectiveHtmlConfig as any).customPixelUrl;
        delete (effectiveHtmlConfig as any).customPixelVars;
        delete (effectiveHtmlConfig as any).pixelExperimentName;
        // Clean up mainUrl and fallbackUrl based on detectionType requirements
        const { DETECTION_TYPE_MAP } = await import('../../utils/pftagValidation');
        const detType = (effectiveHtmlConfig as any).detectionType;
        if (detType && DETECTION_TYPE_MAP[detType]) {
          const [, requireMainUrl, requireFallbackUrl] = DETECTION_TYPE_MAP[detType];
          if (!requireMainUrl) {
            delete (effectiveHtmlConfig as any).mainUrl;
          }
          if (!requireFallbackUrl) {
            delete (effectiveHtmlConfig as any).fallbackUrl;
          }
        }
      }

      const pixelExperimentName = (effectiveHtmlConfig as any).pixelExperimentName;
      if (typeof pixelExperimentName === 'string') {
        const trimmed = pixelExperimentName.trim();
        if (trimmed) {
          (effectiveHtmlConfig as any).pixelExperimentName = trimmed;
        } else {
          delete (effectiveHtmlConfig as any).pixelExperimentName;
        }
      } else if (pixelExperimentName !== undefined) {
        delete (effectiveHtmlConfig as any).pixelExperimentName;
      }

      const { metadata } = await buildBackendPayload({
        page_name: pageName,
        landingPageData,
        htmlConfig: effectiveHtmlConfig,
        user: currentUserEmail,
        type: 'update',
        commit: 'edit-with-ui'
      } as any);
      await pageforgeApi.saveToFirestore({ metadata });
      onSaved?.({ landingPageData, htmlConfig: effectiveHtmlConfig });
      presetDraftRef.current = {} as any;
    } catch (e) {
      console.error('Failed to save updated configuration:', e);
    }
  };

  return (
    <div className={`h-full flex flex-col bg-gray-900 ${className}`}>
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-4">
        <ConfigEditor
          name={name}
          setName={() => { /* read-only in edit mode */ }}
          preset={preset}
          onPresetChange={handlePresetChange}
          componentDisplay={componentDisplay}
          onComponentToggle={handleComponentToggle}
          onPresetSelected={() => { }}
          selectedGroup=""
          setSelectedGroup={() => { }}
          newGroupName=""
          setNewGroupName={() => { }}
          isCreatingNewGroup={false}
          setIsCreatingNewGroup={() => { }}
          existingGroups={[]}
          isEditMode={true}
          layoutMode={layoutMode}
          setLayoutMode={() => { }}
          generalOptions={generalOptions}
          setGeneralOptions={setGeneralOptions as any}
          backgroundUrl={backgroundUrl}
          setBackgroundUrl={setBackgroundUrl}
          phoneBackgroundUrl={phoneBackgroundUrl}
          setPhoneBackgroundUrl={setPhoneBackgroundUrl}
          navbarOptions={navbarOptions as any}
          setNavbarOptions={setNavbarOptions as any}
          heroOptions={heroOptions as any}
          setHeroOptions={setHeroOptions as any}
          buttonOptions={buttonOptions as any}
          setButtonOptions={setButtonOptions as any}
          carouselOptions={carouselOptions as any}
          setCarouselOptions={setCarouselOptions as any}
          steamReviewsOptions={steamReviewsOptions as any}
          setSteamReviewsOptions={setSteamReviewsOptions as any}
          videoPlayerOptions={videoPlayerOptions as any}
          setVideoPlayerOptions={setVideoPlayerOptions as any}
          titleTxtOptions={titleTxtOptions as any}
          setTitleTxtOptions={setTitleTxtOptions as any}
          columnTxtOptions={columnTxtOptions as any}
          setColumnTxtOptions={setColumnTxtOptions as any}
          mediaShowcaseOptions={mediaShowcaseOptions as any}
          setMediaShowcaseOptions={setMediaShowcaseOptions as any}
          faqOptions={faqOptions as any}
          setFaqOptions={setFaqOptions as any}
          footerOptions={footerOptions as any}
          setFooterOptions={setFooterOptions as any}
          widgetOptions={widgetOptions as any}
          setWidgetOptions={setWidgetOptions as any}
          cookieBannerOptions={cookieBannerOptions as any}
          setCookieBannerOptions={setCookieBannerOptions as any}
          paddingValues={paddingValues}
          setPaddingValues={setPaddingValues}
          marginValues={marginValues}
          setMarginValues={setMarginValues}
          borderRadiusValue={borderRadiusValue}
          setBorderRadiusValue={setBorderRadiusValue}
          updatePadding={updatePadding}
          updateMargin={updateMargin}
          updateBorderRadius={updateBorderRadius}
          htmlConfig={htmlConfig}
          updateHtmlField={updateHtmlField}
          saved={false}
        />
      </div>
      <div className="border-t border-gray-800 p-3 bg-gray-900">
        <div className="flex items-center gap-4 min-w-0">
          {/* Tabs shrink first; horizontal scroll if needed */}
          <LpTabsConfig componentDisplay={componentDisplay as any} className="flex-1 min-w-0" />
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-md text-sm bg-indigo-600 text-white hover:bg-indigo-700 whitespace-nowrap shrink-0"
          >
            Save changes
          </button>
        </div>
        {urlErrors.length > 0 && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            <div className="font-semibold">Invalid URL{urlErrors.length > 1 ? 's' : ''}:</div>
            <ul className="list-disc list-inside">
              {urlErrors.map((u: string, i: number) => <li key={i}>{u}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
