import React, { useState } from 'react';
import type { ConfigFormProps, HtmlGeneratorConfig } from '../../types';
import { useConfig, useCookieBannerOptions, useLandingPages } from '../../hooks';
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
  ConfigEditor,
  generateLandingPageData,
  parseCSSValue,
  formatCSSValue
} from './settings';
import { useAuth } from '../layout/authContext';
import { collectInvalidUrls } from '../../utils';
import { DETECTION_TYPE_MAP } from '../../utils/pftagValidation';
import LpTabsConfig from './lpTabsConfig';

const ConfigForm: React.FC<ConfigFormProps> = ({ onAddConfig, isInSidePanel = false, onPresetSelected }) => {
  const [name, setName] = useState('');
  const [description] = useState('');
  const [preset, setPreset] = useState<'Basic' | 'Widget' | 'Full-Content'>('Basic');
  const [layoutMode] = useState<'desktop' | 'phone'>('phone');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [isCreatingNewGroup, setIsCreatingNewGroup] = useState<boolean>(false);
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [phoneBackgroundUrl, setPhoneBackgroundUrl] = useState('');
  const [lastSavedName, setLastSavedName] = useState<string | null>(null);
  const { saving, error, lastSavedConfig, saveConfig } = useConfig();
  const { pages } = useLandingPages();
  const { user: authUser } = useAuth();

  // Get unique groups from existing pages
  const existingGroups = Array.from(new Set(pages.map(page => page.landingPageData?.metadata?.group).filter(Boolean))) as string[];
  const actor = authUser?.email || 'unknown';
  React.useEffect(() => { /* no-op: used to recompute actor */ }, [authUser]);
  const [nameError, setNameError] = useState<string | null>(null);
  const [urlErrors, setUrlErrors] = useState<string[]>([]);
  const [htmlConfig, setHtmlConfig] = useState<HtmlGeneratorConfig>({
    title: '',
    faviconLink: '/favicon.ico',
    tagline: 'Your Landing Page Title',
    usePixelScript: false,
    pixelMode: 'none',
    gameId: '',
    partnerId: '',
    isTest: true,
    customPixelUrl: '',
  });

  // Clean up pixel fields that are not required by current pixelMode/detectionType
  React.useEffect(() => {
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

  const presetDraftRef = React.useRef<Record<'Basic' | 'Widget' | 'Full-Content', any>>({} as any);
  const { componentDisplay, handleComponentToggle, setPresetComponents, setComponentDisplay } = useComponentDisplay();
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
  const [paddingValues, setPaddingValues] = useState({
    top: parseCSSValue(buttonOptions.padding.split(' ')[0] || '8px', 8),
    right: parseCSSValue(buttonOptions.padding.split(' ')[1] || '16px', 16),
    bottom: parseCSSValue(buttonOptions.padding.split(' ')[2] || buttonOptions.padding.split(' ')[0] || '8px', 8),
    left: parseCSSValue(buttonOptions.padding.split(' ')[3] || buttonOptions.padding.split(' ')[1] || '16px', 16)
  });

  const [marginValues, setMarginValues] = useState({
    top: parseCSSValue(buttonOptions.margin.split(' ')[0] || '0px', 0),
    right: parseCSSValue(buttonOptions.margin.split(' ')[1] || '0px', 0),
    bottom: parseCSSValue(buttonOptions.margin.split(' ')[2] || buttonOptions.margin.split(' ')[0] || '0px', 0),
    left: parseCSSValue(buttonOptions.margin.split(' ')[3] || buttonOptions.margin.split(' ')[1] || '0px', 0)
  });

  const [borderRadiusValue, setBorderRadiusValue] = useState(
    parseCSSValue(buttonOptions.border.radius, 8)
  );
  const updatePadding = (newValues: typeof paddingValues) => {
    setPaddingValues(newValues);
    const paddingString = `${formatCSSValue(newValues.top)} ${formatCSSValue(newValues.right)} ${formatCSSValue(newValues.bottom)} ${formatCSSValue(newValues.left)}`;
    setButtonOptions({ ...buttonOptions, padding: paddingString });
  };
  const updateMargin = (newValues: typeof marginValues) => {
    setMarginValues(newValues);
    const marginString = `${formatCSSValue(newValues.top)} ${formatCSSValue(newValues.right)} ${formatCSSValue(newValues.bottom)} ${formatCSSValue(newValues.left)}`;
    setButtonOptions({ ...buttonOptions, margin: marginString });
  };
  const updateBorderRadius = (value: number) => {
    setBorderRadiusValue(value);
    setButtonOptions({
      ...buttonOptions,
      border: { ...buttonOptions.border, radius: formatCSSValue(value) }
    });
  };
  const snapshotDraft = (): any => ({
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
    paddingValues,
    marginValues,
    borderRadiusValue,
    layoutMode,
  });
  const applyDraft = (d: any) => {
    if (!d) return;
    setComponentDisplay(d.componentDisplay);
    setBackgroundUrl(d.backgroundUrl || '');
    setPhoneBackgroundUrl(d.phoneBackgroundUrl || '');
    setNavbarOptions(d.navbarOptions);
    setHeroOptions(d.heroOptions);
    setButtonOptions(d.buttonOptions);
    setCarouselOptions(d.carouselOptions);
    if (d.steamReviewsOptions) setSteamReviewsOptions(d.steamReviewsOptions);
    if (d.videoPlayerOptions) setVideoPlayerOptions(d.videoPlayerOptions);
    if (d.titleTxtOptions) setTitleTxtOptions(d.titleTxtOptions);
    if (d.columnTxtOptions) setColumnTxtOptions(d.columnTxtOptions);
    if (d.mediaShowcaseOptions) setMediaShowcaseOptions(d.mediaShowcaseOptions);
    if (d.faqOptions) setFaqOptions(d.faqOptions);
    setFooterOptions(d.footerOptions);
    setWidgetOptions(d.widgetOptions);
    setCookieBannerOptions(d.cookieBannerOptions);
    setGeneralOptions(d.generalOptions);
    setHtmlConfig(d.htmlConfig);
    setPaddingValues(d.paddingValues);
    setMarginValues(d.marginValues);
    setBorderRadiusValue(d.borderRadiusValue);
    // layoutMode is always 'phone' now, no need to apply from draft
  };
  const handlePresetChange = (newPreset: 'Basic' | 'Widget' | 'Full-Content') => {
    presetDraftRef.current[preset] = snapshotDraft();
    setPreset(newPreset);
    const existing = presetDraftRef.current[newPreset];
    if (existing) {
      applyDraft(existing);
    } else {
      setPresetComponents(newPreset);
      if (newPreset === 'Widget') {
        setWidgetOptions(prev => ({
          ...prev,
          enabled: true,
          width: 646,
          height: 190,
          alignX: prev.alignX || 'center',
          alignY: prev.alignY || 'middle',
        }));
        setComponentDisplay(prev => ({ ...prev, button: false }));
      } else if (newPreset === 'Basic') {
        setNavbarOptions(prev => ({
          ...prev,
          displayNavbarWidget: false
        }));
        setWidgetOptions(prev => ({
          ...prev,
          addToNavbar: false
        }));
      }
    }
  };

  React.useEffect(() => {
    if (preset === 'Widget' && componentDisplay.button) setComponentDisplay(prev => ({ ...prev, button: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, componentDisplay.button]);

  React.useEffect(() => {
    if (preset === 'Basic' && !presetDraftRef.current['Basic']) {
      setPresetComponents('Basic');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setNameError(null);
    setUrlErrors([]);
    if (!name.trim()) { setNameError('Name is required'); return; }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
      setNameError('Use only lowercase letters, numbers and hyphens (no spaces or special characters).');
      return;
    }

    // Exclude pftag URLs from generic validation - they have their own validation logic
    const isPftagMode = htmlConfig.pixelMode === 'pftag_prod' || htmlConfig.pixelMode === 'pftag_preprod';

    const urlCandidates = [
      ...(isPftagMode ? [] : [
        { label: 'HTML: Main URL', value: (htmlConfig as any).mainUrl },
        { label: 'HTML: Fallback URL', value: (htmlConfig as any).fallbackUrl },
      ]),
      { label: 'HTML: Custom Pixel URL', value: htmlConfig.customPixelUrl },
      { label: 'General: Custom Font URL', value: generalOptions.font?.customUrl },
      { label: 'Cookie Banner: Policy URL', value: cookieBannerOptions.policyUrl },
      { label: 'Navbar: Logo URL', value: navbarOptions.logoUrl },
      ...((navbarOptions.links || []).filter(l => (l as any).type === 'url').map((l, i) => ({ label: `Navbar link #${i + 1} URL`, value: l.href, allowRelative: true }))),
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
      ...((footerOptions.selectedSocialIcons || []).map((key) => ({
        label: `Footer: ${key} URL`,
        value: footerOptions.customSocialUrls?.[key as keyof typeof footerOptions.customSocialUrls] || ''
      })))
    ];
    const invalids = collectInvalidUrls(urlCandidates);
    if (invalids.length) {
      setUrlErrors(invalids.map(i => `${i.label}`));
      return;
    }
    const landingPageData = generateLandingPageData({
      page_name: name,
      commit: 'create',
      user: 'generator',
      type: 'create',
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
      generalOptions
    } as any);
    const titleForMetadata = htmlConfig.title || name;
    const lpAny: any = landingPageData as any;
    const groupToAssign = isCreatingNewGroup ? newGroupName : selectedGroup;

    if (!lpAny.metadata) {
      lpAny.metadata = { title: titleForMetadata, description: description || '', preset: preset.toLowerCase(), group: groupToAssign, layoutMode };
    } else if (typeof lpAny.metadata === 'object') {
      if (!lpAny.metadata.title) lpAny.metadata.title = titleForMetadata;
      if (lpAny.metadata.description === undefined) lpAny.metadata.description = description || '';
      lpAny.metadata.preset = preset.toLowerCase();
      lpAny.metadata.group = groupToAssign;
      lpAny.metadata.layoutMode = layoutMode;
    }

    // Clean up mode-specific fields before saving
    const cleanHtmlConfig = { ...htmlConfig };
    const pixelMode = cleanHtmlConfig.pixelMode;

    if (pixelMode === 'none') {
      // Remove all pixel-related fields
      delete (cleanHtmlConfig as any).customPixelUrl;
      delete (cleanHtmlConfig as any).customPixelVars;
      delete (cleanHtmlConfig as any).detectionType;
      delete (cleanHtmlConfig as any).mainUrl;
      delete (cleanHtmlConfig as any).fallbackUrl;
      delete (cleanHtmlConfig as any).pixelExperimentName;
    } else if (pixelMode === 'global') {
      // Remove custom and pftag mode fields
      delete (cleanHtmlConfig as any).customPixelUrl;
      delete (cleanHtmlConfig as any).customPixelVars;
      delete (cleanHtmlConfig as any).pixelExperimentName;
      // Keep detectionType, mainUrl, and fallbackUrl for global mode
    } else if (pixelMode === 'custom') {
      // Remove global mode fields
      delete (cleanHtmlConfig as any).detectionType;
      delete (cleanHtmlConfig as any).mainUrl;
      delete (cleanHtmlConfig as any).fallbackUrl;
    } else if (pixelMode === 'pftag_prod' || pixelMode === 'pftag_preprod') {
      // Remove custom mode fields for pftag
      delete (cleanHtmlConfig as any).customPixelUrl;
      delete (cleanHtmlConfig as any).customPixelVars;
      delete (cleanHtmlConfig as any).pixelExperimentName;
      // Clean up mainUrl and fallbackUrl based on detectionType requirements
      const { DETECTION_TYPE_MAP } = await import('../../utils/pftagValidation');
      const detType = (cleanHtmlConfig as any).detectionType;
      if (detType && DETECTION_TYPE_MAP[detType]) {
        const [, requireMainUrl, requireFallbackUrl] = DETECTION_TYPE_MAP[detType];
        if (!requireMainUrl) {
          delete (cleanHtmlConfig as any).mainUrl;
        }
        if (!requireFallbackUrl) {
          delete (cleanHtmlConfig as any).fallbackUrl;
        }
      }
    }

    const pixelExperimentName = (cleanHtmlConfig as any).pixelExperimentName;
    if (typeof pixelExperimentName === 'string') {
      const trimmed = pixelExperimentName.trim();
      if (trimmed) {
        (cleanHtmlConfig as any).pixelExperimentName = trimmed;
      } else {
        delete (cleanHtmlConfig as any).pixelExperimentName;
      }
    } else if (pixelExperimentName !== undefined) {
      delete (cleanHtmlConfig as any).pixelExperimentName;
    }

    const success = await saveConfig({
      page_name: name,
      landingPageData,
      htmlConfig: cleanHtmlConfig,
      user: actor,
      type: 'create',
      commit: 'create'
    } as any);

    if (success) {
      try {
        window.dispatchEvent(new CustomEvent('pageforge:config-created', { detail: { name } }));
      } catch { }
      onAddConfig(name, landingPageData);
      setLastSavedName(name);
      presetDraftRef.current = {} as any;
    }
  };

  const updateHtmlField = (field: keyof HtmlGeneratorConfig, value: string | boolean) => {
    setHtmlConfig(prev => {
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

      return updated;
    });
  };
  return (
    <div className={isInSidePanel ? "h-full flex flex-col bg-gray-900" : "max-w-4xl mx-auto p-6"}>
      <div className={isInSidePanel ? "flex-1 flex flex-col min-h-0" : "bg-white rounded-lg shadow-md flex flex-col h-[80vh]"}>
        <div className={isInSidePanel ? "flex-1 overflow-y-auto p-6 space-y-10" : "flex-1 overflow-y-auto p-6 space-y-10"}>
          <form onSubmit={handleSubmit}>
            {(error || nameError || urlErrors.length > 0) && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <div>{nameError || error}</div>
                {urlErrors.length > 0 && (
                  <div className="mt-2 text-sm">
                    <div className="font-semibold">Invalid URL{urlErrors.length > 1 ? 's' : ''}:</div>
                    <ul className="list-disc list-inside">
                      {urlErrors.map((u, idx) => (
                        <li key={idx}>{u}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <ConfigEditor
              name={name}
              setName={setName}
              preset={preset}
              onPresetChange={handlePresetChange}
              componentDisplay={componentDisplay}
              onComponentToggle={handleComponentToggle}
              onPresetSelected={onPresetSelected || (() => { })}
              selectedGroup={selectedGroup}
              setSelectedGroup={setSelectedGroup}
              newGroupName={newGroupName}
              setNewGroupName={setNewGroupName}
              isCreatingNewGroup={isCreatingNewGroup}
              setIsCreatingNewGroup={setIsCreatingNewGroup}
              existingGroups={existingGroups}
              isEditMode={false}
              layoutMode={layoutMode}
              setLayoutMode={() => { }}
              generalOptions={generalOptions}
              setGeneralOptions={setGeneralOptions}
              backgroundUrl={backgroundUrl}
              setBackgroundUrl={setBackgroundUrl}
              phoneBackgroundUrl={phoneBackgroundUrl}
              setPhoneBackgroundUrl={setPhoneBackgroundUrl}
              navbarOptions={navbarOptions}
              setNavbarOptions={setNavbarOptions}
              heroOptions={heroOptions}
              setHeroOptions={setHeroOptions}
              buttonOptions={buttonOptions}
              setButtonOptions={setButtonOptions}
              carouselOptions={carouselOptions}
              setCarouselOptions={setCarouselOptions}
              steamReviewsOptions={steamReviewsOptions}
              setSteamReviewsOptions={setSteamReviewsOptions}
              videoPlayerOptions={videoPlayerOptions}
              setVideoPlayerOptions={setVideoPlayerOptions}
              titleTxtOptions={titleTxtOptions}
              setTitleTxtOptions={setTitleTxtOptions}
              columnTxtOptions={columnTxtOptions}
              setColumnTxtOptions={setColumnTxtOptions}
              mediaShowcaseOptions={mediaShowcaseOptions}
              setMediaShowcaseOptions={setMediaShowcaseOptions}
              faqOptions={faqOptions}
              setFaqOptions={setFaqOptions}
              footerOptions={footerOptions}
              setFooterOptions={setFooterOptions}
              widgetOptions={widgetOptions}
              setWidgetOptions={setWidgetOptions}
              cookieBannerOptions={cookieBannerOptions}
              setCookieBannerOptions={setCookieBannerOptions}
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
              saved={!!lastSavedConfig}
            />
          </form>
        </div>
        <div className={`${isInSidePanel ? 'bg-gray-900 border-t border-gray-800' : 'bg-gray-50 border-t border-gray-200'} p-4`}>
          <div className="flex items-center gap-4 min-w-0">
            <LpTabsConfig componentDisplay={componentDisplay as any} className="flex-1 min-w-0" />
            {(() => {
              const pm = htmlConfig.pixelMode || 'none';
              const det: any = (htmlConfig as any).detectionType || '';
              const mainRequired = pm === 'global' && det !== 'iframe_detection';
              const fallbackRequired = pm === 'global' && ['mobile_app_detection', 'client_detection', 'ios_app_detection'].includes(det);
              const missingGlobal = (mainRequired && !(((htmlConfig as any).mainUrl || '').trim())) || (fallbackRequired && !(((htmlConfig as any).fallbackUrl || '').trim()));
              const disabledSave = saving || !name.trim() || ((pm !== 'none' && !htmlConfig.gameId)) || missingGlobal;
              return (
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={disabledSave}
                  className={`inline-flex justify-center items-center px-6 py-2 rounded-md text-sm font-medium border whitespace-nowrap shrink-0 ${disabledSave
                    ? 'bg-gray-600 border-gray-500 text-gray-300 cursor-not-allowed'
                    : 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-700'
                    } transition`}
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    lastSavedName === name ? 'Update Configuration' : 'Create Configuration'
                  )}
                </button>
              );
            })()}
          </div>
          {error && (
            <div className="mt-3 text-sm text-red-400 text-right">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigForm;
