// Types for JSON landing page sections
import type { ReactNode, CSSProperties } from "react";

// ==========================================
// COMMON INTERFACES
// ==========================================

// Default options interface that all components can extend
export interface DefaultOptions {
  display?: boolean;
  defaults?: Record<string, any>;
}

// Section interfaces for page structure
export interface Section {
  type: string;
  props: any;
}

export interface LandingPageMetadata {
  title?: string;
  description?: string;
  author?: string;
  version?: string;
  lastUpdated?: string;
  keywords?: string[];
  thumbnail?: string;
  preset?: string;
  group?: string;
}

export interface LandingPageSettings {
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    textColor?: string;
    textSecondaryColor?: string;
    backgroundColor?: string;
    backgroundSecondaryColor?: string;
    fontFamily?: string;
    headingFontFamily?: string;
    customFontUrl?: string; // Store original custom font URL for editing
    borderRadius?: string;
    borderColor?: string;
  };
  layout?: {
    maxWidth?: string;
    contentPadding?: string;
    sectionSpacing?: string;
    elementSpacing?: string;
    containerPadding?: string;
  };
  responsive?: {
    breakpoints?: {
      sm?: string;
      md?: string;
      lg?: string;
      xl?: string;
      "2xl"?: string;
    };
    defaultMobileFirst?: boolean;
  };
  animations?: {
    enableAnimations?: boolean;
    defaultDuration?: string;
    defaultEasing?: string;
  };
}

export interface LandingPageData {
  metadata?: LandingPageMetadata;
  settings?: LandingPageSettings;
  sections: Section[];
}

// Section union type
export type SectionProps =
  | { type: "navbar"; props: NavbarProps }
  | { type: "hero"; props: HeroProps }
  | { type: "MainBody"; props: MainBodyProps }
  | { type: "footer"; props: FooterProps }
  | { type: "button"; props: ButtonProps }
  | { type: "hamburger"; props: { links: Array<{ id: string; text: string; url?: string; sectionId?: string; target?: '_self' | '_blank' }>; onLinkClick?: (link: { id: string; text: string; url?: string; sectionId?: string; target?: '_self' | '_blank' }) => void } };

// ==========================================
// BUTTON COMPONENTS
// ==========================================

// Standard Button types - Fully Customizable
export interface ButtonProps {
  // Basic properties
  text?: string;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";

  // Legacy compatibility props (deprecated)
  variant?: "primary" | "secondary" | "outline" | "text" | "whiteOutline";
  size?: "sm" | "md" | "lg";

  // New size property
  buttonSize?: "small" | "default" | "big";

  // Text display properties
  display?: {
    text?: boolean;
  } | boolean; // Support both ButtonCustomProps style and DefaultOptions style

  // Game-specific properties
  gameId?: string;
  url?: string;

  // Custom classes and styles
  className?: string;
  style?: CSSProperties;

  // Layout and sizing
  width?: string;
  height?: string;
  padding?: string;
  margin?: string;
  fullWidth?: boolean;

  // Typography
  font?: ButtonFont;

  // Background and colors
  backgroundColor?: string;
  hoverBackgroundColor?: string;

  // Border properties
  border?: ButtonBorder;

  // Icon/Image properties
  image?: ButtonImage;

  // Steam icon specific
  steamIcon?: SteamIcon;

  // Animation and transitions
  transition?: string;

  // Shadow properties
  shadow?: string;
  hoverShadow?: string;

  // Default options
  defaults?: Record<string, any>;
}

// Button sub-interfaces for better organization
export interface ButtonFont {
  family?: string;
  size?: string;
  weight?: string;
  color?: string;
  hoverColor?: string;
}

export interface ButtonBorder {
  width?: string;
  style?: string;
  color?: string;
  radius?: string;
  hoverColor?: string;
}

export interface ButtonImage {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  display?: boolean;
  position?: 'left' | 'right' | 'center';
}

// Steam Icon interface for button components
export interface SteamIcon {
  display?: boolean;
  size?: string;
  color?: string;
  hoverColor?: string;
  variant?: 'default' | 'black' | 'white' | 'gray'; // Different Steam icon color variants
  imageSrc?: string; // Optional external image source for Steam logo (overrides default)
  imageAlt?: string; // Alt text for the image
}

// Custom Styled Button - Extended with additional properties
export interface ButtonCustomProps {
  // Text properties
  text?: string;
  display?: {
    text?: boolean;
  };
  font?: ButtonFont;

  // Layout & sizing
  width?: string;
  height?: string;
  padding?: string;
  margin?: string;
  fullWidth?: boolean;

  // Border properties
  border?: ButtonBorder;

  // Color properties
  backgroundColor?: string;
  hoverBackgroundColor?: string;

  // Image properties
  image?: ButtonImage;

  // Steam icon properties
  steamIcon?: SteamIcon;

  // Link properties
  url?: string;
  gameId?: string;

  // Effects & animation
  shadow?: string;
  hoverShadow?: string;
  transition?: string;

  // Additional props
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

// ==========================================
// NAVIGATION COMPONENTS
// ==========================================

// Navbar types
export interface NavbarProps extends DefaultOptions {
  logo?: {
    path: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  button?: ButtonProps;
  widget?: {
    type: 'buy' | 'install' | 'wishlist';
    gameId: string;
    scale?: number;
    display?: boolean;
    utm?: {
      source?: string;
      campaign?: string;
      medium?: string;
      content?: string;
      term?: string;
    };
  };
  hamburger?: {
    links?: Array<{
      id: string;
      text: string;
      url?: string;
      sectionId?: string;
      target?: '_self' | '_blank';
    }>;
    onLinkClick?: (link: { id: string; text: string; url?: string; sectionId?: string; target?: '_self' | '_blank' }) => void;
    display?: boolean;
  };
  logoPosition?: "start" | "center" | "end" | "custom";
  buttonPosition?: "start" | "center" | "end" | "custom";
  position?: "relative" | "absolute" | "fixed" | "sticky";
  className?: string;
}

// ==========================================
// CONTENT SECTION COMPONENTS
// ==========================================

// Hero section types
export interface HeroProps extends DefaultOptions {
  heading: string;
  subheading?: string;
  ctaLabel?: string;
  ctaOnClick?: () => void;
  className?: string;
  headingClassName?: string;
  subheadingClassName?: string;
  headingStyle?: React.CSSProperties;
  subheadingStyle?: React.CSSProperties;
  buttonStyled?: ButtonProps;
}

// Main body content types
export interface MainBodyItem {
  title: string;
  description: string;
  icon?: ReactNode;
}

export interface MainBodyProps extends DefaultOptions {
  items: MainBodyItem[];
  className?: string;
  carouselImages?: string[] | CarouselImageItem[];
  carouselProps?: Partial<CarouselProps>;
}

// ==========================================
// CAROUSEL COMPONENTS
// ==========================================

// Carousel types
export interface CarouselProps extends DefaultOptions {
  images: string[] | CarouselImageItem[];
  orientation?: 'vertical' | 'horizontal';
  autoScrollInterval?: number;
  height?: number;
  width?: number;
  maxWidth?: number; // keep numeric for builder simplicity
  imageHeight?: number;
  imageWidth?: number;
  showControls?: boolean;
}

// CarouselImageItem interface to be used in CarouselProps
export interface CarouselImageItem {
  path: string;
  alt?: string;
}

// ==========================================
// FOOTER COMPONENTS
// ==========================================

// Footer Layout Configuration
export interface FooterLayout {
  // Grid configuration
  containerClass?: string; // Container wrapper class
  gridClass?: string; // Grid system class (e.g., 'grid grid-cols-1 md:grid-cols-12')

  // Column spans for each section
  brandColumn?: {
    span?: string; // e.g., 'md:col-span-3'
    alignment?: 'left' | 'center' | 'right' | 'justify';
    className?: string;
  };
  contentColumn?: {
    span?: string; // e.g., 'md:col-span-6'
    alignment?: 'left' | 'center' | 'right' | 'justify';
    className?: string;
  };
  socialColumn?: {
    span?: string; // e.g., 'md:col-span-3'
    alignment?: 'left' | 'center' | 'right' | 'justify';
    className?: string;
  };

  // Spacing and padding
  padding?: {
    container?: string; // Container padding
    sections?: string; // Individual section padding
    vertical?: string; // Vertical padding
    horizontal?: string; // Horizontal padding
  };

  // Margin controls
  margin?: {
    left?: string; // Left margin for container
    right?: string; // Right margin for container
    container?: string; // Full container margin
  };

  // Responsive behavior
  responsive?: {
    mobile?: 'stack' | 'grid'; // How to display on mobile
    mobileOrder?: {
      brand?: number;
      content?: number;
      social?: number;
    };
  };
}

// Footer Content Configuration
export interface FooterContent {
  // Text content
  copyright?: {
    text?: string;
    year?: boolean;
    display?: boolean; // Whether to show copyright symbol (©) and year
    position?: 'before' | 'after' | 'separate'; // Position relative to other content
    className?: string;
  };

  // Links configuration
  links?: {
    items: Array<FooterLink>;
    display?: boolean;
    separator?: string; // Separator between links (e.g., '|', '•', ' ')
    wrapperClass?: string;
    linkClass?: string;
    hoverClass?: string;
  };

  // Additional text content
  additionalText?: {
    text?: string;
    position?: 'top' | 'bottom' | 'before-links' | 'after-links';
    className?: string;
  };
}

// Footer Branding Configuration
export interface FooterBranding {
  // Primary logo
  logo?: {
    path: string;
    alt?: string;
    width?: number;
    height?: number;
    className?: string;
  };

  // Additional logo (if needed)
  additionalLogo?: {
    path: string;
    alt?: string;
    width?: number;
    height?: number;
    className?: string;
    position?: 'above' | 'below' | 'beside'; // Position relative to main logo
  };

  // Branding section configuration
  display?: boolean;
  wrapperClass?: string;
}

// Footer Social Configuration
export interface FooterSocial {
  icons?: (SocialIconData | any)[]; // Allow both simple and complex structures
  display?: boolean;

  // Layout options
  layout?: 'horizontal' | 'vertical' | 'grid';
  iconSize?: 'small' | 'medium' | 'large' | 'custom';
  customSize?: {
    width?: number;
    height?: number;
  };

  // Spacing and styling
  spacing?: string; // Gap between icons
  wrapperClass?: string;
  iconClass?: string;
  hoverEffects?: boolean;

  // Icon customization
  iconOverrides?: {
    [key: string]: {
      src?: string;
      url?: string;
      className?: string;
    };
  };
}

// Main Footer Props Interface
export interface FooterProps extends DefaultOptions {
  // Layout configuration
  layout?: FooterLayout;

  // Content sections
  branding?: FooterBranding;
  content?: FooterContent;
  social?: FooterSocial;

  // Overall styling
  backgroundColor?: string;
  textColor?: string;
  className?: string;

  // Legacy support (will be deprecated)
  copyright?: {
    text?: string;
    year?: boolean;
  };
  links?: Array<FooterLink>;
  logo?: {
    path: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  socialIcons?: (SocialIconData | any)[];
  socialIconsDisplay?: boolean;
}

// FooterLink interface
export interface FooterLink {
  text: string;
  url: string;
  className?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
}

// Footer Text types
export interface FooterTextProps extends DefaultOptions {
  text?: string;
  className?: string;
  position?: 'before' | 'after' | 'separate';
}

// Footer Links Props
export interface FooterLinksProps extends DefaultOptions {
  links: FooterLink[];
  separator?: string;
  wrapperClass?: string;
  linkClass?: string;
  hoverClass?: string;
}

// Footer Social Icons Props
export interface FooterSocialIconsProps extends DefaultOptions {
  icons: (SocialIconData | any)[];
  layout?: 'horizontal' | 'vertical' | 'grid';
  iconSize?: 'small' | 'medium' | 'large' | 'custom';
  customSize?: { width?: number; height?: number; };
  spacing?: string;
  wrapperClass?: string;
  iconClass?: string;
  hoverEffects?: boolean;
  iconOverrides?: { [key: string]: { src?: string; url?: string; className?: string; }; };
  className?: string;
}

// ==========================================
// LOGO & IMAGE COMPONENTS
// ==========================================

// Company Logotype types
export interface CompanyLogotypeProps extends DefaultOptions {
  logo: {
    path: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  className?: string;
}

// Footer Brand Logotype types
export interface FooterBrandLogotypeProps extends DefaultOptions {
  logo: {
    path: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  className?: string;
}

// Logotype types
export interface LogotypeProps extends DefaultOptions {
  logo: {
    path: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  className?: string;
}

// Social Icon Data interface
export interface SocialIconData {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  url?: string;
}

// ==========================================
// PAGEFORGE INTERFACES (moved from pageforge/types.ts)
// ==========================================
export interface LpVersionMeta {
  timestamp: number;
  user_id: string;
  commit_message: string;
  storage_path: string;
  pageforge_version_hash: string;
  diff_summary: import('../types/config.types').DiffSummary;
}

export interface LpParentDoc {
  created_at: number;
  created_by: string;
  updated_at: number;
  latest_version_hash?: string;
  live_version_hash?: string;
  is_live?: boolean;
  group?: string;
  published_by?: string;
  published_at?: number;
}

export interface SaveDraftParams {
  pageName: string;
  lpJson: import('../types/config.types').LpJson;
  userId: string;
  commitMessage: string;
}

export interface SaveDraftResult {
  json_hash: string;
  storage_path: string;
  diff_summary: import('../types/config.types').DiffSummary;
}

export interface PublishParams {
  pageName: string;
  userId: string;
}

export interface ListVersionsItem extends LpVersionMeta {
  json_hash: string;
}
