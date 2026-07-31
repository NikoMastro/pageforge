import type { LandingPageData } from './shared.types';

// URL Tester types
export interface IframeDetail {
  id: string | null;
  name: string | null;
  src: string | null;
  title: string | null;
  width: number;
  height: number;
  isVisible: boolean;
}

export interface IframesData {
  total: number;
  visible: number;
  details: IframeDetail[];
}

interface PixelCheckBase {
  found: boolean;
  errors?: string[];
}

export interface PixelDetail {
  pixelId: string;
  loadTime?: number;
  pageUrl?: string;
  events?: unknown[];
  payloads?: unknown[];
}

export interface TagDetail {
  tagId: string;
  loadTime?: number;
  pageUrl?: string;
}

export interface XPixelResult extends PixelCheckBase {
  pixelId?: string;
  pageUrl?: string;
  loadTime?: number;
  events?: unknown[];
}

export interface TikTokPixelResult extends PixelCheckBase {
  pixels?: PixelDetail[];
}

export interface RedditPixelResult extends PixelCheckBase {
  pixels?: PixelDetail[];
}

export interface MetaPixelResult extends PixelCheckBase {
  pixels?: PixelDetail[];
}

export interface GlobalPixelResult extends PixelCheckBase {
  scriptUrl?: string;
  pixelId?: string;
  loadTime?: number;
  pageUrl?: string;
}

export interface GoogleTagResult extends PixelCheckBase {
  tags?: TagDetail[];
}

export interface GghstResult {
  found: boolean;
  url?: string;
  scriptName?: string;
  method?: string;
  status?: number;
  ok?: boolean;
  error?: string;
  bigQueryMessage?: string;
}

export interface RedirectInfo {
  occurred: boolean;
  fromUrl?: string;
  toUrl?: string;
}

export interface LighthouseScores {
  performance: number;
  accessibility: number;
  'best-practices': number;
  seo: number;
  pwa: number;
}

export interface LighthouseAudits {
  'first-contentful-paint': number;
  'largest-contentful-paint': number;
  'cumulative-layout-shift': number;
  'total-blocking-time': number;
  'speed-index': number;
}

export interface LighthouseData {
  scores: LighthouseScores;
  audits: LighthouseAudits;
  rawReportHtmlPath: string | null;
}

export interface UrlTesterResult {
  ok: boolean;
  target?: string;
  buttonCount?: number;
  iframes?: IframesData;
  gghst?: GghstResult;
  redirect?: RedirectInfo;
  xpixel?: XPixelResult;
  tiktokpixel?: TikTokPixelResult;
  redditpixel?: RedditPixelResult;
  metapixel?: MetaPixelResult;
  globalpixel?: GlobalPixelResult;
  googletag?: GoogleTagResult;
  lighthouse?: LighthouseData;
}

// Library types
export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  size?: number;
  createdAt: Date;
  filename?: string;
  variants?: string[];
  requireSignedURLs?: boolean;
}

export interface UploadProgress {
  id: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface ComponentDisplay {
  background: boolean;
  navbar: boolean;
  hero: boolean;
  carousel: boolean;
  steamReviews: boolean;
  widget: boolean;
  button: boolean;
  videoPlayer: boolean;
  titleTxt: boolean;
  columnTxt: boolean;
  mediaShowcase: boolean;
  faq: boolean;
  cookiesBanner?: boolean;
  footer: boolean;
}

export interface GeneralOptions {
  font: {
    family: string;
    weight: string;
    customUrl?: string; // Store original custom font URL for editing
  };
}

export interface NavbarOptions {
  logo: {
    src: string;
    alt: string;
    width: string;
    height: string;
  };
  logoUrl: string;
  logoHeight?: number;
  logoPosition?: 'start' | 'center' | 'end' | 'custom';
  links: Array<{
    id?: string;
    text: string;
    type?: 'url' | 'section';
    href?: string;
    sectionId?: string;
    target?: '_self' | '_blank';
  }>;
  backgroundColor: string;
  textColor: string;
  position: 'fixed' | 'sticky' | 'relative' | 'absolute';
  displayHamburger: boolean;
  displayNavbarButton: boolean;
  displayNavbarWidget: boolean;
  navbarClassName: string;
}

export interface HeroOptions {
  title: string;
  heading: string;
  subtitle: string;
  subheading: string;
  backgroundImage: string;
  backgroundOverlay: string;
  backgroundColor: string;
  backgroundGradient?: string;
  textAlignment: 'left' | 'center' | 'right';
  titleColor: string;
  subtitleColor: string;
  headingSize: 'small' | 'medium' | 'large' | 'extra-large';
  headingColor: string;
  subheadingSize: 'small' | 'medium' | 'large';
  subheadingColor: string;
  textShadow: boolean;
  /** 0.0 - 1.0 opacity for text/drop shadow when enabled */
  textShadowIntensity?: number;
  className?: string;
  headingClassName?: string;
  subheadingClassName?: string;
}

export interface ButtonOptions {
  text: string;
  buttonText: string;
  href: string;
  gameId: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: string;
  padding: string;
  margin: string;
  fontSize: string;
  fontWeight: string;
  hoverBackgroundColor: string;
  hoverTextColor: string;
  buttonSize: 'small' | 'default' | 'big';
  disabled: boolean;
  fullWidth: boolean;
  shadow: string;
  width?: string;
  height?: string;
  hoverShadow?: string;
  transition?: string;
  shadowIntensity?: number;
  hoverShadowIntensity?: number;
  font: {
    family: string;
    weight: string;
    size: string;
    color: string;
    hoverColor: string;
  };
  border: {
    radius: string;
    width: string;
    style?: string;
    color?: string;
    hoverColor?: string;
  };
  steamIcon: {
    display: boolean;
    size: string;
    variant: 'default' | 'black' | 'white' | 'gray';
    color?: string;
    hoverColor?: string;
  };
  image: {
    display: boolean;
    src: string;
    alt?: string;
    width?: number;
    height?: number;
    position?: 'left' | 'right';
  };
}

export interface CarouselOptions {
  images: Array<{
    src: string;
    alt: string;
  }>;
  autoPlay: boolean;
  interval: number;
  showDots: boolean;
  showArrows: boolean;
  displayCTA?: boolean;
  background?: {
    type: 'solid' | 'gradient' | 'image' | 'video';
    color?: string;
    gradient?: {
      type: 'linear' | 'radial';
      colors: string[];
      direction?: string;
    };
    image?: {
      url: string;
      fit?: 'cover' | 'contain' | 'fill';
      position?: string;
    };
    video?: {
      url: string;
      fit?: 'cover' | 'contain';
      position?: string;
    };
  };
}

export interface SteamReviewsOptions {
  images: Array<{
    src: string;
    alt: string;
  }>;
  orientation: 'horizontal' | 'vertical';
  scrollSpeed?: number; // pixels per second
  height?: number | string;
  width?: number | string;
  maxWidth?: number | string;
  imageHeight?: number | string;
  imageWidth?: number | string;
  gap?: number;
  displayCTA?: boolean;
  background?: {
    type: 'solid' | 'gradient' | 'image' | 'video';
    color?: string;
    gradient?: {
      type: 'linear' | 'radial';
      colors: string[];
      direction?: string;
    };
    image?: {
      url: string;
      fit?: 'cover' | 'contain' | 'fill';
      position?: string;
    };
    video?: {
      url: string;
      fit?: 'cover' | 'contain';
      position?: string;
    };
  };
}

export interface FooterOptions {
  backgroundColor: string;
  textColor: string;
  footerText: string;
  logoUrl: string;
  logoWidth?: number;
  logoHeight?: number;
  logoLinked?: boolean;
  logoSize?: number;
  hasAdditionalLogo: boolean;
  additionalLogoUrl: string;
  additionalLogoPosition: 'above' | 'below' | 'beside';
  additionalLogoWidth?: number;
  additionalLogoHeight?: number;
  additionalLogoLinked?: boolean;
  additionalLogoSize?: number;
  links: Array<{
    text: string;
    href: string;
  }>;
  socialMedia: Array<{
    platform: string;
    url: string;
    icon: string;
  }>;
  copyrightText: string;
  termsUrl?: string;
  privacyUrl?: string;
  refundUrl?: string;
  eulaUrl?: string;
  contactUrl?: string;
  includeSocialIcons: boolean;
  selectedSocialIcons: string[];
  socialIconSize?: 'small' | 'medium' | 'large';
  customSocialUrls?: Record<string, string>;
  layout: {
    containerClass: string;
    brandColumnSpan: string;
    brandColumnAlignment: string;
    contentColumnSpan: string;
    contentColumnAlignment: string;
    socialColumnSpan: string;
    socialColumnAlignment: string;
    containerPadding: string;
    sectionPadding: string;
    verticalPadding: string;
    horizontalPadding: string;
    leftMargin: string;
    rightMargin: string;
    mobileLayout: string;
    mobileOrder: string;
  };
}

export interface WidgetOptions {
  gameId: string;
  width: number;
  height: number;
  enabled: boolean;
  type?: 'full' | 'buy' | 'install' | 'wishlist';
  scale?: number;
  language?: string;
  addToNavbar?: boolean;
  alignX?: 'left' | 'center' | 'right';
  alignY?: 'top' | 'middle';
  positionX?: number; // pixels, negative = left, positive = right
  positionY?: number; // pixels, negative = up, positive = down
  /** 0.0 - 1.0 opacity for widget shadow when enabled */
  shadowIntensity?: number;
  utm?: {
    source?: string;
    campaign?: string;
    medium?: string;
    content?: string;
    term?: string;
  };
}

// Cookie Banner Options (for PageForge Generator UI)
export interface CookieBannerOptions {
  backgroundColor: string;
  backgroundOpacity: number;
  textColor: string;
  headerText: string;
  bodyText: string;
  policyUrl: string;
  acceptText: string;
  customizeText: string;
  showReject: boolean;
}

export interface VideoPlayerOptions {
  background?: {
    type: 'solid' | 'gradient' | 'image' | 'video';
    color?: string;
    gradient?: string;
    src?: string;
  };
  videoSource: {
    type: 'url' | 'embed' | 'cloudflare';
    url?: string;
    embedCode?: string;
    src?: string;
  };
  videoWidth?: string | number;
  videoHeight?: string | number;
  aspectRatio?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  poster?: string;
  displayCTA?: boolean;
}

export interface ColumnTxtRow {
  id: string;
  title?: string;
  text: string;
  imageUrl: string;
  imageAlt?: string;
  layout: 'text-left' | 'text-right'; hasTextBackground?: boolean;
  textBackgroundColor?: string;
  textBackgroundOpacity?: number;
}

export interface ColumnTxtOptions {
  rows: ColumnTxtRow[]; background: {
    type: 'solid' | 'gradient' | 'image' | 'video';
    color?: string;
    gradient?: {
      type: 'linear' | 'radial';
      colors: string[];
      direction?: string;
    };
    image?: {
      url: string;
      fit?: 'cover' | 'contain' | 'fill';
      position?: string;
    };
    video?: {
      url: string;
      fit?: 'cover' | 'contain';
      position?: string;
    };
  }; backgroundColor?: string;
  textColor?: string;
  fontSize?: string;
  imageWidth?: string;
  imageHeight?: string;
  gap?: number;
  padding?: string;
  displayCTA?: boolean;
}

export interface TitleTxtOptions {
  title?: string;
  subtext?: string;
  subtitle?: string; // Deprecated: kept for backward compatibility, use subtext instead
  background?: {
    type: 'solid' | 'gradient' | 'image' | 'video';
    color?: string;
    gradient?: {
      type: 'linear' | 'radial';
      colors: string[];
      direction?: string;
    };
    image?: {
      url: string;
      fit?: 'cover' | 'contain' | 'fill';
      position?: string;
    };
    video?: {
      url: string;
      fit?: 'cover' | 'contain';
      position?: string;
    };
  };
  backgroundColor?: string;
  titleColor?: string;
  subtextColor?: string;
  titleFontSize?: string;
  subtextFontSize?: string;
  display?: boolean;
  displayCTA?: boolean;
}

export interface MediaShowcaseItem {
  id?: string;
  url: string;
  type: 'image' | 'video';
  alt?: string;
  startRow: number;
  startCol: number;
  rowSpan: number;
  columnSpan: number;
}

export interface MediaShowcaseOptions {
  items: MediaShowcaseItem[];
  title?: string;
  background?: {
    type: 'solid' | 'gradient' | 'image';
    color?: string;
    gradient?: {
      type: 'linear' | 'radial';
      colors: string[];
      direction?: string;
    };
    image?: {
      url: string;
      fit?: 'cover' | 'contain' | 'fill';
      position?: string;
    };
  };
  rows: number;
  columns: number;
  gap?: number;
  backgroundColor?: string;
  padding?: string;
  cellHeight?: string;
  display?: boolean;
  displayCTA?: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqOptions {
  items: FaqItem[];
  title?: string;
  background?: {
    type: 'solid' | 'gradient' | 'image' | 'video';
    color?: string;
    gradient?: {
      type: 'linear' | 'radial';
      colors: string[];
      direction?: string;
    };
    image?: {
      url: string;
      fit?: 'cover' | 'contain' | 'fill';
      position?: string;
    };
    video?: {
      url: string;
      fit?: 'cover' | 'contain';
      position?: string;
    };
  };
  backgroundColor?: string;
  textColor?: string;
  questionFontSize?: string;
  answerFontSize?: string;
  padding?: string;
  maxWidth?: string;
  display?: boolean;
  separatorColor?: string;
  iconColor?: string;
}

export interface ConfigFormProps {
  onAddConfig: (name: string, jsonConfig: LandingPageData) => void;
  initialConfig?: LandingPageData;
  isEditing?: boolean;
  onCancel?: () => void;
  isInSidePanel?: boolean;
  onPresetSelected?: (preset: 'Basic' | 'Widget' | 'Full-Content') => void;
}
