// PAGEFORGE Flows - Component Library Export

// ===== LANDING PAGE COMPONENTS =====
// Main Landing Page Component
export { default as JsonLanding } from './landingPage/jsonLanding';
export { default as JsonLandingFullContent } from './landingPage/jsonLandingFullContent';
export { default as JsonLandingPhone } from './landingPage/jsonLandingPhone';

// Header Components
export { default as Navbar } from './landingPage/sections/headerSection/navbar';
export { default as Hamburger } from './landingPage/sections/headerSection/hamburger';

// Hero Section
export { default as Hero } from './landingPage/sections/heroSection';

// Button Components
export { default as Button } from './landingPage/sections/buttonSection/button';

// Widget Components
export { default as LayoutCarousel } from './landingPage/sections/carouselSection/carousel';
export { default as LayoutSteamReviews } from './landingPage/sections/widgetsSection/steamReviews';
export { default as Carousel } from './landingPage/sections/carouselSection/carouselContainer';
export { default as SteamReviews } from './landingPage/sections/widgetsSection/steamReviewsContainer';
export { default as SteamWidgetCropBuy } from './landingPage/sections/widgetsSection/steamWidgetCropBuy';
export { default as SteamWidgetCropInstall } from './landingPage/sections/widgetsSection/steamWidgetCropInstall';
export { default as SteamWidgetCropWishlist } from './landingPage/sections/widgetsSection/steamWidgetCropWishlist';
export { default as WidgetFull } from './landingPage/sections/widgetsSection/widgetFull';

// Content Components
export { default as ColumnTxt } from './landingPage/sections/columnTxtSection';
export { default as TitleTxt } from './landingPage/sections/titleTxtSection';
export { default as MediaShowcase } from './landingPage/sections/mediaShowCaseSection';
export { default as FaqSection } from './landingPage/sections/faqSection';

// Steam Widget Language Configuration
export {
  getAvailableLanguages,
  getLanguageConfig,
  getButtonWidth,
  detectLanguage,
  LANGUAGE_CONFIGS,
  BROWSER_LANG_MAPPING,
  DEFAULT_LANGUAGE
} from './landingPage/sections/widgetsSection/steamLanguageConfig';
export type { LanguageConfig } from './landingPage/sections/widgetsSection/steamLanguageConfig';

// Footer Components
export { default as Footer } from './landingPage/sections/footerSection/footer';
export { default as FooterBrandLogo } from './landingPage/sections/footerSection/footerBrandLogo';
export { default as FooterLinks } from './landingPage/sections/footerSection/footerLinks';
export { default as FooterSocialIcons } from './landingPage/sections/footerSection/footerSocialIcons';
export { default as FooterText } from './landingPage/sections/footerSection/footerText';

// Banner Components
export { default as CookiesBanner } from './landingPage/sections/cookiesBannerSection';

// Video Components
export { default as VideoPlayer } from './landingPage/sections/videoPlayerSection';

// Landing Page Assets
export { default as CompanyLogo } from './landingPage/companyLogo';
export { default as Logotype } from './landingPage/sections/headerSection/logotype';
export { default as BackgroundMedia } from './landingPage/backgroundMedia';

// ===== LINKBIO COMPONENTS =====
export { default as LinkBioLanding, LinkBioPage } from './linkbio/linkBioLanding';
export { default as LinkBioProfileCard } from './linkbio/profileCard';
export { default as LinkBioSectionCard } from './linkbio/sectionCard';
export { default as LinkBioLinkButton } from './linkbio/linkButton';
export { default as LinkBioFooter } from './linkbio/bioFooter';
export { default as LinkBioIllustration } from './linkbio/illustration';
export { default as LinkBioSocialIcons } from './linkbio/socialIcons';

// ===== SHARED TYPES =====
export * from './types';
