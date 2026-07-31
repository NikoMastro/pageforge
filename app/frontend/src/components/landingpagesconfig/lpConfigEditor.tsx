import React from 'react';
import type { ComponentDisplay, GeneralOptions, NavbarOptions, HeroOptions, ButtonOptions, CarouselOptions, SteamReviewsOptions, VideoPlayerOptions, TitleTxtOptions, ColumnTxtOptions, MediaShowcaseOptions, FaqOptions, FooterOptions, WidgetOptions, CookieBannerOptions } from '../../types/ui.types';
import type { HtmlGeneratorConfig } from '../../types';
import HtmlSettings from './settings/htmlSettings';
import GeneralSettings from './settings/generalSettings';
import BackgroundSettings from './settings/backgroundSettings';
import NavbarSettings from './settings/navbarSettings';
import HeroSettings from './settings/heroSettings';
import ButtonSettings from './settings/buttonSettings';
import CarouselSettings from './settings/carouselSettings';
import SteamReviewsSettings from './settings/steamReviewsSettings';
import VideoPlayerSettings from './settings/videoPlayerSettings';
import TitleTxtSettings from './settings/titleTxtSettings';
import ColumnTxtSettings from './settings/columnTxtSettings';
import MediaShowcaseSettings from './settings/mediaShowcaseSettings';
import FaqSettings from './settings/faqSettings';
import FooterSettings from './settings/footerSettings';
import WidgetInputs from './settings/widgetSettings';
import CookieBannerSettings from './settings/cookieBannerSettings';

export interface ConfigEditorProps {
  name: string;
  setName: (v: string) => void;
  preset: 'Basic' | 'Widget' | 'Full-Content';
  onPresetChange: (p: 'Basic' | 'Widget' | 'Full-Content') => void;
  componentDisplay: ComponentDisplay;
  onComponentToggle: (key: keyof ComponentDisplay) => void;
  onPresetSelected: (p: 'Basic' | 'Widget' | 'Full-Content') => void;
  selectedGroup: string;
  setSelectedGroup: (group: string) => void;
  newGroupName: string;
  setNewGroupName: (name: string) => void;
  isCreatingNewGroup: boolean;
  setIsCreatingNewGroup: (creating: boolean) => void;
  existingGroups: string[];
  isEditMode?: boolean;
  layoutMode: 'desktop' | 'phone';
  setLayoutMode: (mode: 'desktop' | 'phone') => void;
  generalOptions: GeneralOptions; setGeneralOptions: (o: GeneralOptions) => void;
  backgroundUrl: string; setBackgroundUrl: (u: string) => void;
  phoneBackgroundUrl?: string; setPhoneBackgroundUrl?: (u: string) => void;
  navbarOptions: NavbarOptions; setNavbarOptions: (o: NavbarOptions) => void;
  heroOptions: HeroOptions; setHeroOptions: (o: HeroOptions) => void;
  buttonOptions: ButtonOptions; setButtonOptions: (o: ButtonOptions) => void;
  carouselOptions: CarouselOptions; setCarouselOptions: (o: CarouselOptions) => void;
  steamReviewsOptions: SteamReviewsOptions; setSteamReviewsOptions: (o: SteamReviewsOptions) => void;
  videoPlayerOptions: VideoPlayerOptions; setVideoPlayerOptions: (o: VideoPlayerOptions) => void;
  titleTxtOptions: TitleTxtOptions; setTitleTxtOptions: (o: TitleTxtOptions) => void;
  columnTxtOptions: ColumnTxtOptions; setColumnTxtOptions: (o: ColumnTxtOptions) => void;
  mediaShowcaseOptions: MediaShowcaseOptions; setMediaShowcaseOptions: (o: MediaShowcaseOptions) => void;
  faqOptions: FaqOptions; setFaqOptions: (o: FaqOptions) => void;
  footerOptions: FooterOptions; setFooterOptions: (o: FooterOptions) => void;
  widgetOptions: WidgetOptions; setWidgetOptions: (o: WidgetOptions) => void;
  cookieBannerOptions: CookieBannerOptions; setCookieBannerOptions: (o: CookieBannerOptions) => void;
  paddingValues: { top: number; right: number; bottom: number; left: number; };
  setPaddingValues: (v: { top: number; right: number; bottom: number; left: number; }) => void;
  marginValues: { top: number; right: number; bottom: number; left: number; };
  setMarginValues: (v: { top: number; right: number; bottom: number; left: number; }) => void;
  borderRadiusValue: number; setBorderRadiusValue: (v: number) => void;
  updatePadding: (v: { top: number; right: number; bottom: number; left: number; }) => void;
  updateMargin: (v: { top: number; right: number; bottom: number; left: number; }) => void;
  updateBorderRadius: (v: number) => void;
  htmlConfig: HtmlGeneratorConfig;
  updateHtmlField: (field: keyof HtmlGeneratorConfig, value: string | boolean) => void;
  saved?: boolean;
}

const ConfigEditor: React.FC<ConfigEditorProps> = (props) => {
  const {
    name, setName,
    preset, onPresetChange, componentDisplay, onComponentToggle, onPresetSelected,
    selectedGroup, setSelectedGroup, newGroupName, setNewGroupName,
    isCreatingNewGroup, setIsCreatingNewGroup, existingGroups, isEditMode = false,
    layoutMode, setLayoutMode: _setLayoutMode,
    generalOptions, setGeneralOptions, backgroundUrl, setBackgroundUrl,
    phoneBackgroundUrl, setPhoneBackgroundUrl,
    navbarOptions, setNavbarOptions, heroOptions, setHeroOptions,
    buttonOptions, setButtonOptions, carouselOptions, setCarouselOptions,
    steamReviewsOptions, setSteamReviewsOptions,
    videoPlayerOptions, setVideoPlayerOptions,
    titleTxtOptions, setTitleTxtOptions,
    columnTxtOptions, setColumnTxtOptions,
    mediaShowcaseOptions, setMediaShowcaseOptions,
    faqOptions, setFaqOptions,
    footerOptions, setFooterOptions, widgetOptions, setWidgetOptions,
    cookieBannerOptions, setCookieBannerOptions,
    paddingValues, setPaddingValues, marginValues, setMarginValues,
    borderRadiusValue, setBorderRadiusValue, updatePadding, updateMargin, updateBorderRadius,
    htmlConfig, updateHtmlField, saved
  } = props;

  // Define the order of numbered components (matches display order in jsonLandingFullContent.tsx)
  const numberedComponentsOrder: (keyof ComponentDisplay)[] = [
    'navbar', 'titleTxt', 'videoPlayer', 'columnTxt',
    'mediaShowcase', 'carousel', 'steamReviews', 'faq', 'footer'
  ];

  // Calculate dynamic section numbers based on enabled components
  const getSectionNumber = (componentKey: keyof ComponentDisplay): number => {
    let number = 0;
    for (const key of numberedComponentsOrder) {
      if (componentDisplay[key]) {
        number++;
      }
      if (key === componentKey) {
        return number;
      }
    }
    return number;
  };

  // Get display label for component
  const getComponentLabel = (componentKey: string): string => {
    if (componentKey === 'titleTxt') return 'Game Presentation';
    if (componentKey === 'columnTxt') return 'Game Features';
    return componentKey;
  };

  const handleWidgetOptionsChange = (updated: WidgetOptions) => {
    let newWidgetOptions = { ...updated } as WidgetOptions;

    if (newWidgetOptions.type === 'full' && navbarOptions.displayNavbarWidget) {
      setNavbarOptions({
        ...navbarOptions,
        displayNavbarWidget: false
      });
    }

    setWidgetOptions(newWidgetOptions);
  };

  const handleNavbarOptionsChange = (newNavbarOptions: NavbarOptions) => {
    setNavbarOptions(newNavbarOptions);
  };

  return (
    <div className="space-y-12">
      <section id="general">
        <div className="space-y-4">
          {!isEditMode && (
            <div>
              <label className="block text-sm font-medium text-gray-300">Configuration Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full border border-gray-600 rounded-md py-2 px-3 bg-gray-800 text-gray-200 focus:outline-none focus:ring-indigo-400 focus:border-indigo-400 sm:text-sm"
                placeholder="E.g., Marketing Landing Page"
              />
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(['Basic', 'Widget', 'Full-Content'] as const).map(presetOption => {
              const disabled = false;
              const active = preset === presetOption;
              const canClick = name.trim() && !disabled;
              return (
                <button
                  key={presetOption}
                  type="button"
                  disabled={!canClick}
                  onClick={() => { onPresetSelected(presetOption); onPresetChange(presetOption); }}
                  className={`px-3 py-2 rounded-md text-sm font-medium border transition ${active ? 'bg-indigo-600 border-indigo-500 text-white' : canClick ? 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700' : 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'}`}
                  title={disabled ? 'Coming soon' : presetOption}
                >{presetOption}</button>
              );
            })}
          </div>

          {/* Group selection - only in create mode */}
          {!isEditMode && (
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-sm font-medium text-gray-300 whitespace-nowrap">Group:</label>
              <select
                value={isCreatingNewGroup ? 'new' : selectedGroup}
                onChange={(e) => {
                  if (e.target.value === 'new') {
                    setIsCreatingNewGroup(true);
                    setSelectedGroup('');
                  } else {
                    setSelectedGroup(e.target.value);
                    setIsCreatingNewGroup(false);
                    setNewGroupName('');
                  }
                }}
                className="px-3 py-1 text-sm border border-gray-600 rounded-md bg-gray-800 text-gray-200 focus:outline-none focus:ring-indigo-400 focus:border-indigo-400"
              >
                <option value="">No group</option>
                {existingGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
                <option value="new">+ Create new group</option>
              </select>
              {isCreatingNewGroup && (
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Group name..."
                  className="flex-1 px-3 py-1 text-sm border border-gray-600 rounded-md bg-gray-800 text-gray-200 focus:outline-none focus:ring-indigo-400 focus:border-indigo-400"
                />
              )}
            </div>
          )}

          {preset === 'Full-Content' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Select Components</label>
              <div className="grid grid-cols-2 gap-2" style={{ gridAutoFlow: 'column', gridTemplateRows: 'repeat(5, minmax(0, 1fr))' }}>
                {['navbar', 'titleTxt', 'videoPlayer', 'columnTxt', 'mediaShowcase', 'carousel', 'steamReviews', 'faq', 'footer']
                  .filter(componentKey => componentKey in componentDisplay)
                  .map((componentKey) => {
                    const isWidget = componentKey === 'widget';
                    const isButton = componentKey === 'button';
                    const widgetSelected = !!componentDisplay.widget;
                    const buttonSelected = !!componentDisplay.button;
                    const disableButtonBecauseWidget = isButton && widgetSelected;
                    const disableWidgetBecauseButton = isWidget && buttonSelected;
                    const isDisabled = disableButtonBecauseWidget || disableWidgetBecauseButton;
                    const checked = componentDisplay[componentKey as keyof ComponentDisplay] && !isDisabled;
                    const handleChange = () => {
                      if (isDisabled) return;
                      if (isWidget) {
                        const willEnableWidget = !componentDisplay.widget;
                        if (!willEnableWidget && navbarOptions.displayNavbarWidget) {
                          // Disabling widget - clear navbar widget display
                          setNavbarOptions({
                            ...navbarOptions,
                            displayNavbarWidget: false
                          });
                        }
                      }
                      if (isButton) {
                        const willEnableButton = !componentDisplay.button;
                        if (!willEnableButton && navbarOptions.displayNavbarButton) {
                          // Disabling button - clear navbar button display
                          setNavbarOptions({
                            ...navbarOptions,
                            displayNavbarButton: false
                          });
                        }
                      }
                      onComponentToggle(componentKey as keyof ComponentDisplay);
                    };
                    const tooltipText = disableButtonBecauseWidget
                      ? 'Button disabled while Widget is active'
                      : disableWidgetBecauseButton
                        ? 'Widget disabled while Button is active'
                        : componentKey;
                    return (
                      <label
                        key={componentKey}
                        title={tooltipText}
                        className={`inline-flex items-center text-sm capitalize ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'text-gray-300'}`}>
                        <input
                          type="checkbox"
                          className="form-checkbox text-indigo-500 bg-gray-800 border-gray-600 focus:ring-indigo-400"
                          checked={checked}
                          disabled={isDisabled}
                          onChange={handleChange}
                        />
                        <span className="ml-2 flex items-center gap-2">
                          {checked && (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-indigo-600 text-white">{getSectionNumber(componentKey as keyof ComponentDisplay)}</span>
                          )}
                          {!checked && (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-gray-600 text-gray-400">-</span>
                          )}
                          {getComponentLabel(componentKey)}
                        </span>
                      </label>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* HTML Configuration Section */}
      <div className="mt-8 mb-8 flex items-center gap-4">
        <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
        <span className="text-sm font-semibold text-indigo-400 uppercase tracking-widest">HTML Configuration</span>
        <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
      </div>
      <section id="html">
        <HtmlSettings htmlConfig={htmlConfig} updateHtmlField={updateHtmlField} saved={!!saved} />
      </section>

      {/* General Settings Section */}
      <div className="mt-16 mb-8 flex items-center gap-4">
        <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
        <span className="text-sm font-semibold text-indigo-400 uppercase tracking-widest">General Settings</span>
        <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
      </div>
      <section>
        <div className="flex flex-col pb-6">
          <div id="general-options">
            <GeneralSettings generalOptions={generalOptions} setGeneralOptions={setGeneralOptions} />
          </div>

          {componentDisplay.background && (
            <>
              <div className="flex items-center gap-3 pt-12 pb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Background</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
              </div>
              <div id="background">
                <BackgroundSettings
                  backgroundUrl={backgroundUrl}
                  setBackgroundUrl={setBackgroundUrl}
                  phoneBackgroundUrl={phoneBackgroundUrl}
                  setPhoneBackgroundUrl={setPhoneBackgroundUrl}
                />
              </div>
            </>
          )}

          {componentDisplay.button && (
            <>
              <div className="flex items-center gap-3 pt-12 pb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Button</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
              </div>
              <div id="button">
                <ButtonSettings
                  buttonOptions={buttonOptions}
                  setButtonOptions={setButtonOptions}
                  paddingValues={paddingValues}
                  setPaddingValues={setPaddingValues}
                  marginValues={marginValues}
                  setMarginValues={setMarginValues}
                  borderRadiusValue={borderRadiusValue}
                  setBorderRadiusValue={setBorderRadiusValue}
                  updatePadding={updatePadding}
                  updateMargin={updateMargin}
                  updateBorderRadius={updateBorderRadius}
                />
              </div>
            </>
          )}

          {componentDisplay.widget && (
            <>
              <div className="flex items-center gap-3 pt-12 pb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Widget</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
              </div>
              <div id="widget">
                <WidgetInputs onWidgetChange={handleWidgetOptionsChange} initialData={widgetOptions} />
              </div>
            </>
          )}

          {/* Separator between global settings and content sections */}
          <div className="mt-16 mb-8 flex items-center gap-4">
            <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
            <span className="text-sm font-semibold text-indigo-400 uppercase tracking-widest">Content Sections</span>
            <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          </div>

          {componentDisplay.navbar && (
            <>
              <div className="flex items-center gap-3 pt-8 pb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                <span className="inline-flex items-center justify-center w-7 h-7 text-sm font-bold rounded-full bg-indigo-600 text-white">{getSectionNumber('navbar')}</span>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Navbar</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
              </div>
              <div id="navbar">
                <NavbarSettings
                  navbarOptions={navbarOptions}
                  setNavbarOptions={handleNavbarOptionsChange}
                  showWidgetOption={componentDisplay.widget && widgetOptions.enabled && widgetOptions.type !== 'full'}
                  widgetType={widgetOptions.type || ''}
                  preset={preset}
                  layoutMode={layoutMode}
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-3 pt-12 pb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Hero</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
          </div>
          <div id="hero">
            <HeroSettings heroOptions={heroOptions} setHeroOptions={setHeroOptions} backgroundUrl={backgroundUrl} generalOptions={generalOptions} />
          </div>

          {componentDisplay.titleTxt && (
            <>
              <div className="flex items-center gap-3 pt-12 pb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                <span className="inline-flex items-center justify-center w-7 h-7 text-sm font-bold rounded-full bg-indigo-600 text-white">{getSectionNumber('titleTxt')}</span>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Game Presentation</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
              </div>
              <div id="titleTxt">
                <TitleTxtSettings
                  titleTxtOptions={titleTxtOptions}
                  setTitleTxtOptions={setTitleTxtOptions}
                  buttonOptions={buttonOptions}
                  widgetOptions={widgetOptions}
                  componentDisplay={componentDisplay}
                  generalOptions={generalOptions}
                />
              </div>
            </>
          )}

          {componentDisplay.videoPlayer && (
            <>
              <div className="flex items-center gap-3 pt-12 pb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                <span className="inline-flex items-center justify-center w-7 h-7 text-sm font-bold rounded-full bg-indigo-600 text-white">{getSectionNumber('videoPlayer')}</span>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Video Player</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
              </div>
              <div id="videoPlayer">
                <VideoPlayerSettings
                  videoPlayerOptions={videoPlayerOptions}
                  setVideoPlayerOptions={setVideoPlayerOptions}
                  buttonOptions={buttonOptions}
                  widgetOptions={widgetOptions}
                  componentDisplay={componentDisplay}
                  generalOptions={generalOptions}
                />
              </div>
            </>
          )}

          {componentDisplay.columnTxt && (
            <>
              <div className="flex items-center gap-3 pt-12 pb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                <span className="inline-flex items-center justify-center w-7 h-7 text-sm font-bold rounded-full bg-indigo-600 text-white">{getSectionNumber('columnTxt')}</span>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Game Features</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
              </div>
              <div id="columnTxt">
                <ColumnTxtSettings
                  columnTxtOptions={columnTxtOptions}
                  setColumnTxtOptions={setColumnTxtOptions}
                  buttonOptions={buttonOptions}
                  widgetOptions={widgetOptions}
                  componentDisplay={componentDisplay}
                  generalOptions={generalOptions}
                />
              </div>
            </>
          )}

          {componentDisplay.mediaShowcase && (
            <>
              <div className="flex items-center gap-3 pt-12 pb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                <span className="inline-flex items-center justify-center w-7 h-7 text-sm font-bold rounded-full bg-indigo-600 text-white">{getSectionNumber('mediaShowcase')}</span>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Media Showcase</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
              </div>
              <div id="mediaShowcase">
                <MediaShowcaseSettings
                  mediaShowcaseOptions={mediaShowcaseOptions}
                  setMediaShowcaseOptions={setMediaShowcaseOptions}
                  buttonOptions={buttonOptions}
                  widgetOptions={widgetOptions}
                  componentDisplay={componentDisplay}
                  generalOptions={generalOptions}
                />
              </div>
            </>
          )}

          {componentDisplay.carousel && (
            <>
              <div className="flex items-center gap-3 pt-12 pb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                <span className="inline-flex items-center justify-center w-7 h-7 text-sm font-bold rounded-full bg-indigo-600 text-white">{getSectionNumber('carousel')}</span>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Carousel</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
              </div>
              <div id="carousel">
                <CarouselSettings
                  carouselOptions={carouselOptions}
                  setCarouselOptions={setCarouselOptions}
                  buttonOptions={buttonOptions}
                  widgetOptions={widgetOptions}
                  componentDisplay={componentDisplay}
                  generalOptions={generalOptions}
                />
              </div>
            </>
          )}

          {componentDisplay.steamReviews && (
            <>
              <div className="flex items-center gap-3 pt-12 pb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                <span className="inline-flex items-center justify-center w-7 h-7 text-sm font-bold rounded-full bg-indigo-600 text-white">{getSectionNumber('steamReviews')}</span>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Steam Reviews</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
              </div>
              <div id="steamReviews">
                <SteamReviewsSettings
                  steamReviewsOptions={steamReviewsOptions}
                  setSteamReviewsOptions={setSteamReviewsOptions}
                  buttonOptions={buttonOptions}
                  widgetOptions={widgetOptions}
                  componentDisplay={componentDisplay}
                  generalOptions={generalOptions}
                />
              </div>
            </>
          )}

          {componentDisplay.faq && (
            <>
              <div className="flex items-center gap-3 pt-12 pb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                <span className="inline-flex items-center justify-center w-7 h-7 text-sm font-bold rounded-full bg-indigo-600 text-white">{getSectionNumber('faq')}</span>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">FAQ</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
              </div>
              <div id="faq">
                <FaqSettings
                  faqOptions={faqOptions}
                  setFaqOptions={setFaqOptions}
                  generalOptions={generalOptions}
                />
              </div>
            </>
          )}

          {componentDisplay.footer && (
            <>
              <div className="flex items-center gap-3 pt-12 pb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                <span className="inline-flex items-center justify-center w-7 h-7 text-sm font-bold rounded-full bg-indigo-600 text-white">{getSectionNumber('footer')}</span>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Footer</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
              </div>
              <div id="footer">
                <FooterSettings footerOptions={footerOptions} setFooterOptions={setFooterOptions} layoutMode={layoutMode} />
              </div>
            </>
          )}

          <>
            <div className="flex items-center gap-3 pt-12 pb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Cookie Banner</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
            </div>
            <div id="banner">
              <CookieBannerSettings
                enabled={!!componentDisplay.cookiesBanner}
                onToggle={(v) => { if (!!componentDisplay.cookiesBanner !== v) onComponentToggle('cookiesBanner'); }}
                options={cookieBannerOptions}
                onChange={setCookieBannerOptions}
              />
            </div>
          </>
        </div>
      </section>
    </div>
  );
};

export default ConfigEditor;
