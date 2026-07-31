import React from 'react';

export interface Section {
  type: string;
  props: any;
}

export interface LandingPageData {
  metadata?: Record<string, any>;
  settings?: Record<string, any>;
  sections: Section[];
}
export interface HeroProps {
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaOnClick?: () => void;
  buttonStyled?: boolean;
  className?: string;
  headingClassName?: string;
  subheadingClassName?: string;
  headingStyle?: React.CSSProperties;
  subheadingStyle?: React.CSSProperties;
  display?: boolean;
  backgroundImage?: string;
  overlayOpacity?: number;
  textAlignment?: "left" | "center" | "right";
}

export interface MainBodyProps {
  children?: React.ReactNode;
  items?: any[];
  backgroundColor?: string;
  padding?: string;
  maxWidth?: string;
  className?: string;
  display?: boolean;
}

export interface FooterProps {
  backgroundColor?: string;
  textColor?: string;
  links?: FooterLinksProps | never[];
  socialIcons?: FooterSocialIconsProps;
  brandLogo?: FooterBrandLogoProps;
  footerText?: FooterTextProps;
  layout?: any;
  branding?: any;
  content?: any;
  social?: any;
  copyright?: { text: string; year: boolean };
  logo?: any;
  socialIconsDisplay?: boolean;
  className?: string;
  display?: boolean;
}

export interface NavbarProps {
  logo?: string | {
    path?: string;
    alt?: string;
    width?: string | number;
    height?: string | number;
  };
  logoAlt?: string;
  menuItems?: NavMenuItem[];
  backgroundColor?: string;
  textColor?: string;
  position?: Position;
  button?: any;
  widget?: any;
  hamburger?: any;
  logoPosition?: Position;
  buttonPosition?: Position;
  className?: string;
  display?: boolean;
}

export interface ButtonProps {
  label?: string;
  text?: string;
  url?: string;
  onClick?: (e?: any) => void;
  styled?: boolean;
  className?: string;
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "text" | "whiteOutline";
  size?: "sm" | "md" | "lg";
  buttonSize?: "small" | "default" | "big";
  buttonStyled?: boolean | any;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  gameId?: string;
  steamAction?: "buy" | "install" | "wishlist";
  style?: React.CSSProperties;
  display?: { text: boolean };
  width?: string | number;
  height?: string | number;
  padding?: string;
  margin?: string;
  fullWidth?: boolean;
  font?: any;
  backgroundColor?: string;
  hoverBackgroundColor?: string;
  border?: any;
  image?: any;
  steamIcon?: any;
  transition?: string;
  shadow?: string;
  hoverShadow?: string;
}

export interface CarouselProps {
  images: Array<{ src: string; alt?: string; path?: string; }>;
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  orientation?: 'horizontal' | 'vertical';
  autoScrollInterval?: number;
  height?: number | string;
  width?: number | string;
  maxWidth?: number | string;
  imageHeight?: number | string;
  imageWidth?: number | string;
  showControls?: boolean;
}

export interface SteamReviewsProps {
  images: Array<{ src: string; alt?: string; path?: string; }>;
  orientation?: 'horizontal' | 'vertical';
  scrollSpeed?: number; // pixels per second (default: 50)
  height?: number | string;
  width?: number | string;
  maxWidth?: number | string;
  imageHeight?: number | string; // default: '150px' (typical Steam review height)
  imageWidth?: number | string; // default: '600px' (typical Steam review width)
  gap?: number; // gap between images in pixels (default: 16)
}

export interface CompanyLogotypeProps {
  logo?: {
    path?: string;
    alt?: string;
    width?: string;
    height?: string;
  };
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
  className?: string;
}

export interface LogotypeProps {
  logo?: {
    path?: string;
    alt?: string;
    width?: string;
    height?: string;
  };
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
  className?: string;
}

export interface FooterBrandLogoProps {
  logo?: {
    path?: string;
    alt?: string;
    width?: string;
    height?: string;
  };
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
  className?: string;
}

export interface FooterLinksProps {
  title?: string;
  links: Array<{
    label: string;
    text?: string;
    url: string;
    target?: "_blank" | "_self";
    className?: string;
  }>;
  separator?: string;
  wrapperClass?: string;
  linkClass?: string;
  hoverClass?: string;
  display?: boolean;
}

export interface FooterSocialIconsProps {
  icons?: SocialIconData[];
  layout?: 'horizontal' | 'vertical' | 'grid';
  iconSize?: 'small' | 'medium' | 'large' | string;
  customSize?: { width: string; height: string };
  spacing?: string;
  wrapperClass?: string;
  iconClass?: string;
  hoverEffects?: boolean;
  iconOverrides?: { [key: string]: any };
  className?: string;
  display?: boolean;
}

export interface SocialIconData {
  platform?: string;
  url: string;
  src?: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
  iconComponent?: React.ComponentType;
}

export interface FooterTextProps {
  text: string;
  className?: string;
  fontSize?: string;
  color?: string;
}

export type Position = "start" | "center" | "end";

export interface NavMenuItem {
  label: string;
  url: string;
  target?: "_blank" | "_self";
}

// Steam Widget Utils
export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export const buildSteamWidgetUrl = (
  appId: string,
  cc?: "buy" | "install" | "wishlist" | string | null,
  utmParams?: UtmParams
): string => {
  const baseUrl = `https://store.steampowered.com/widget/${appId}`;
  const params = new URLSearchParams();

  // Add country code if provided (for language localization)
  if (cc && cc !== 'null' && cc !== 'undefined') {
    params.append('cc', cc);
  }

  // Add UTM parameters
  if (utmParams) {
    Object.entries(utmParams).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

// Cookie Banner
export interface CookieBannerProps {
  display?: boolean;
  backgroundColor?: string;
  backgroundOpacity?: number;
  textColor?: string;
  headerText?: string;
  bodyText?: string;
  policyUrl?: string;
  acceptText?: string;
  rejectText?: string;
  customizeText?: string;
  showReject?: boolean;
  className?: string;
}
