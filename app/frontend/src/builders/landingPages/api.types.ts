export interface HtmlGeneratorConfig {
  title?: string;
  faviconLink?: string;
  tagline?: string;
  usePixelScript?: boolean;
  pixelMode?: 'none' | 'global' | 'custom' | 'pftag_prod' | 'pftag_preprod';
  pixelExperimentName?: string;
  gameId?: string;
  partnerId?: string;
  isTest?: boolean;
  customPixelUrl?: string;
  detectionType?: '' | 'client_detection' | 'mobile_app_detection' | 'iframe_detection' | 'ios_app_detection' |
  'desktop' | 'desktop_deep_link' | 'desktop_iframe' |
  'meta_android' | 'applovin_android' | 'x_android' | 'reddit_android' | 'tiktok_android' |
  'meta_ios' | 'applovin_ios' | 'x_ios' | 'reddit_ios' | 'tiktok_ios';
  mainUrl?: string;
  fallbackUrl?: string;
  [key: string]: any;
}
