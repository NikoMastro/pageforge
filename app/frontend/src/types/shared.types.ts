import type {
  DefaultOptions,
  Section,
  LandingPageMetadata,
  LandingPageSettings,
  LandingPageData,
  ButtonProps,
  NavbarProps,
  HeroProps,
  MainBodyProps,
  CarouselProps,
  FooterProps,
  FooterLink,
  FooterTextProps,
  CompanyLogotypeProps,
  FooterBrandLogotypeProps,
  LogotypeProps,
  SocialIconData
} from '../utils/interfaces';

export type {
  DefaultOptions,
  Section,
  LandingPageMetadata,
  LandingPageSettings,
  LandingPageData,
  ButtonProps,
  NavbarProps,
  HeroProps,
  MainBodyProps,
  CarouselProps,
  FooterProps,
  FooterLink,
  FooterTextProps,
  CompanyLogotypeProps,
  FooterBrandLogotypeProps,
  LogotypeProps,
  SocialIconData
};

export interface MainBodyItem {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export interface CarouselImageItem {
  path: string;
  alt?: string;
}

export type SectionProps =
  | { type: "navbar"; props: NavbarProps }
  | { type: "hero"; props: HeroProps }
  | { type: "MainBody"; props: MainBodyProps }
  | { type: "footer"; props: FooterProps }
  | { type: "button"; props: ButtonProps }
  | { type: "hamburger"; props: { links: Array<{ id: string; text: string; url?: string; sectionId?: string; target?: '_self' | '_blank' }>; onLinkClick?: (link: { id: string; text: string; url?: string; sectionId?: string; target?: '_self' | '_blank' }) => void } };
