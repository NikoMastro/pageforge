import type {
  ComponentDisplay,
  NavbarOptions,
  HeroOptions,
  ButtonOptions,
  CarouselOptions,
  SteamReviewsOptions,
  FooterOptions,
  WidgetOptions,
  CookieBannerOptions,
  VideoPlayerOptions,
  TitleTxtOptions,
  ColumnTxtOptions,
  MediaShowcaseOptions,
  FaqOptions,
  Section
} from "../types";
import { generateHeroClasses } from "../utils/ui";

interface JsonGeneratorOptions {
  page_name: string;
  componentDisplay: ComponentDisplay;
  backgroundUrl: string;
  phoneBackgroundUrl?: string;
  navbarOptions: NavbarOptions;
  heroOptions: HeroOptions;
  buttonOptions: ButtonOptions;
  carouselOptions: CarouselOptions;
  steamReviewsOptions?: SteamReviewsOptions;
  footerOptions: FooterOptions;
  widgetOptions: WidgetOptions;
  videoPlayerOptions?: VideoPlayerOptions;
  titleTxtOptions?: TitleTxtOptions;
  columnTxtOptions?: ColumnTxtOptions;
  mediaShowcaseOptions?: MediaShowcaseOptions;
  faqOptions?: FaqOptions;
  commit: string;
  user: string;
  type: string;
  generalOptions: { font: { family: string; weight: string; customUrl?: string } };
  cookieBannerOptions?: CookieBannerOptions;
}

/**
 * Generate landingPageData (sections + settings) free of legacy metadata.
 */
export function generateLandingPageData(opts: JsonGeneratorOptions) {
  const {
    componentDisplay,
    backgroundUrl,
    phoneBackgroundUrl,
    navbarOptions,
    heroOptions,
    buttonOptions,
    carouselOptions,
    footerOptions,
    widgetOptions,
    videoPlayerOptions,
    titleTxtOptions,
    columnTxtOptions,
    mediaShowcaseOptions,
    faqOptions,
    generalOptions,
    cookieBannerOptions
  } = opts;

  const getFooterOption = <T>(key: string, def: T): T => (
    ((footerOptions as unknown as Record<string, unknown>)[key] as T) ?? def
  );

  const baseJson: { settings: any; sections: Section[] } = {
    settings: {
      theme: {
        primaryColor: "#3B82F6",
        secondaryColor: "#8B5CF6",
        accentColor: "#10B981",
        textColor: "#1F2937",
        textSecondaryColor: "#6B7280",
        backgroundColor: "#FFFFFF",
        backgroundSecondaryColor: "#F9FAFB",
        fontFamily: generalOptions.font.family,
        headingFontFamily: generalOptions.font.family,
        fontWeight: generalOptions.font.weight,
        customFontUrl: generalOptions.font.customUrl, // Store original custom font URL
        borderRadius: "0.25rem",
        borderColor: "#E5E7EB",
      },
      layout: {
        maxWidth: "1200px",
        contentPadding: "1rem",
        sectionSpacing: "4rem",
        elementSpacing: "1rem",
        containerPadding: "2rem",
      },
      responsive: {
        breakpoints: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1536px",
        },
        defaultMobileFirst: true,
      },
      animations: {
        enableAnimations: true,
        defaultDuration: "300ms",
        defaultEasing: "ease-in-out",
      },
    },
    sections: [] as Section[],
  };

  // Templates for each component
  const templates: Record<string, Section> = {
    background: {
      type: "background",
      props: {
        src: backgroundUrl,
        phoneSrc: phoneBackgroundUrl,
        format: "image",
        alt: "Background Image",
        className: "bg-cover bg-center bg-no-repeat bg-fixed",
        display: componentDisplay.background,
      },
    },
    navbar: {
      type: "navbar",
      props: {
        // Only set height for logo; width will auto-scale to preserve ratio
        logo: {
          path: navbarOptions.logoUrl,
          alt: "NavLogo",
          height: (navbarOptions as any).logoHeight || 40,
        },
        button: navbarOptions.displayNavbarButton
          ? {
            text: buttonOptions.buttonText,
            onClick: null,
            buttonSize: "small",
            className: "hidden sm:inline-flex",
            backgroundColor: buttonOptions.backgroundColor,
            hoverBackgroundColor: buttonOptions.hoverBackgroundColor,
            font: {
              ...buttonOptions.font,
              size: "14px",
            },
            border: buttonOptions.border,
            padding: "6px 12px",
            margin: buttonOptions.margin,
            shadow: buttonOptions.shadow && buttonOptions.shadow !== 'none'
              ? `0 4px 14px rgba(0,0,0,${buttonOptions.shadowIntensity ?? 0.25})`
              : buttonOptions.shadow,
            hoverShadow: buttonOptions.shadow && buttonOptions.shadow !== 'none'
              ? `0 6px 20px rgba(0,0,0,${buttonOptions.hoverShadowIntensity ?? 0.35})`
              : buttonOptions.hoverShadow,
            transition: buttonOptions.transition,
            steamIcon: buttonOptions.steamIcon.display
              ? {
                ...buttonOptions.steamIcon,
                size: "16px",
              }
              : buttonOptions.steamIcon,
            image: buttonOptions.image.display
              ? {
                ...buttonOptions.image,
                width: 16,
                height: 16,
              }
              : buttonOptions.image,
            display: true,
          }
          : {
            display: false,
          },
        ...(navbarOptions.displayNavbarWidget && widgetOptions.enabled && widgetOptions.type !== "full"
          ? {
            widget: {
              type: widgetOptions.type,
              gameId: widgetOptions.gameId,
              scale: 1,
              utm: widgetOptions.utm || {
                source: "pageforge",
                campaign: "",
                medium: "",
                content: "",
                term: "",
              },
              display: true,
            }
          }
          : {}),
        hamburger: navbarOptions.displayHamburger ? {
          links: (navbarOptions.links && navbarOptions.links.length > 0)
            ? navbarOptions.links.map((l, idx) => ({
              id: l.id || String(idx + 1),
              text: l.text,
              url: l.type === 'section' ? (l.sectionId ? `#${l.sectionId}` : undefined) : (l.href || undefined),
              sectionId: l.type === 'section' ? (l.sectionId || (l.href?.startsWith('#') ? l.href.slice(1) : undefined)) : undefined,
              target: l.target || '_self',
            }))
            : [
              { id: "home", text: "Home", url: "/", target: '_self' },
              { id: "features", text: "Features", url: "#features", sectionId: 'features', target: '_self' },
              { id: "about", text: "About Us", url: "/about", target: '_self' },
              { id: "contact", text: "Contact", url: "#contact", sectionId: 'contact', target: '_self' },
            ],
          display: true,
          onLinkClick: null,
        } : { display: false },
        logoPosition: navbarOptions.logoPosition,
        buttonPosition: "end",
        position: navbarOptions.position,
        className: navbarOptions.navbarClassName,
        fontFamily: generalOptions.font.family,
        fontWeight: generalOptions.font.weight,
        display: componentDisplay.navbar,
      },
    },
    hero: {
      type: "hero",
      props: {
        heading: heroOptions.heading,
        subheading: heroOptions.subheading,
        ...generateHeroClasses(heroOptions),
        headingStyle: {
          color: heroOptions.headingColor || "#000000",
          fontFamily: generalOptions.font.family,
          fontWeight: generalOptions.font.weight,
          textShadow: heroOptions.textShadow
            ? `2px 2px 4px rgba(0,0,0,${heroOptions.textShadowIntensity ?? 0.3})`
            : 'none',
        },
        subheadingStyle: {
          color: heroOptions.subheadingColor || "#6b7280",
          fontFamily: generalOptions.font.family,
          fontWeight: generalOptions.font.weight,
          textShadow: heroOptions.textShadow
            ? `1px 1px 2px rgba(0,0,0,${heroOptions.textShadowIntensity ?? 0.3})`
            : 'none',
        },
        display: componentDisplay.hero,
      },
    },
    carousel: {
      type: "carousel",
      props: {
        // Persist current images as fallback (store using `path` for backward compat)
        images: (carouselOptions.images || []).map(img => ({
          path: (img as any).src || (img as any).path || "",
          alt: img.alt || ""
        })),
        orientation: (carouselOptions as any).orientation || "horizontal",
        autoScrollInterval: carouselOptions.interval,
        height: (carouselOptions as any).height ?? 400,
        width: (carouselOptions as any).width ?? null,
        imageHeight: (carouselOptions as any).imageHeight ?? 300,
        imageWidth: (carouselOptions as any).imageWidth ?? null,
        showControls: carouselOptions.showArrows,
        showDots: carouselOptions.showDots,
        fontFamily: generalOptions.font.family,
        fontWeight: generalOptions.font.weight,
        display: componentDisplay.carousel,
        background: (carouselOptions as any).background || undefined,
        button: carouselOptions?.displayCTA && componentDisplay.button
          ? {
            text: buttonOptions.buttonText,
            onClick: null,
            buttonSize: buttonOptions.buttonSize || "default",
            backgroundColor: buttonOptions.backgroundColor,
            hoverBackgroundColor: buttonOptions.hoverBackgroundColor,
            font: buttonOptions.font,
            border: buttonOptions.border,
            padding: buttonOptions.padding,
            margin: buttonOptions.margin,
            shadow: buttonOptions.shadow && buttonOptions.shadow !== 'none'
              ? `0 4px 14px rgba(0,0,0,${buttonOptions.shadowIntensity ?? 0.25})`
              : buttonOptions.shadow,
            hoverShadow: buttonOptions.shadow && buttonOptions.shadow !== 'none'
              ? `0 6px 20px rgba(0,0,0,${buttonOptions.hoverShadowIntensity ?? 0.35})`
              : buttonOptions.hoverShadow,
            transition: buttonOptions.transition,
            steamIcon: buttonOptions.steamIcon,
            image: buttonOptions.image,
            display: true,
          }
          : {
            display: false,
          },
        ...(carouselOptions?.displayCTA && componentDisplay.widget && widgetOptions.enabled && widgetOptions.type !== "full"
          ? {
            widget: {
              type: widgetOptions.type,
              gameId: widgetOptions.gameId,
              scale: widgetOptions.scale || 1,
              utm: widgetOptions.utm || {
                source: "pageforge",
                campaign: "",
                medium: "",
                content: "",
                term: "",
              },
              display: true,
            }
          }
          : {}),
      },
    },
    steamReviews: {
      type: "steamReviews",
      props: {
        images: (opts.steamReviewsOptions?.images || []).map(img => ({
          path: (img as any).src || (img as any).path || "",
          alt: img.alt || ""
        })),
        orientation: opts.steamReviewsOptions?.orientation || "horizontal",
        scrollSpeed: opts.steamReviewsOptions?.scrollSpeed ?? 50,
        height: opts.steamReviewsOptions?.height ?? 400,
        width: opts.steamReviewsOptions?.width ?? "100%",
        maxWidth: opts.steamReviewsOptions?.maxWidth ?? 960,
        imageHeight: opts.steamReviewsOptions?.imageHeight ?? "150px",
        imageWidth: opts.steamReviewsOptions?.imageWidth ?? "600px",
        gap: opts.steamReviewsOptions?.gap ?? 16,
        fontFamily: generalOptions.font.family,
        fontWeight: generalOptions.font.weight,
        display: componentDisplay.steamReviews,
        background: (opts.steamReviewsOptions as any)?.background || undefined,
        button: opts.steamReviewsOptions?.displayCTA && componentDisplay.button
          ? {
            text: buttonOptions.buttonText,
            onClick: null,
            buttonSize: buttonOptions.buttonSize || "default",
            backgroundColor: buttonOptions.backgroundColor,
            hoverBackgroundColor: buttonOptions.hoverBackgroundColor,
            font: buttonOptions.font,
            border: buttonOptions.border,
            padding: buttonOptions.padding,
            margin: buttonOptions.margin,
            shadow: buttonOptions.shadow && buttonOptions.shadow !== 'none'
              ? `0 4px 14px rgba(0,0,0,${buttonOptions.shadowIntensity ?? 0.25})`
              : buttonOptions.shadow,
            hoverShadow: buttonOptions.shadow && buttonOptions.shadow !== 'none'
              ? `0 6px 20px rgba(0,0,0,${buttonOptions.hoverShadowIntensity ?? 0.35})`
              : buttonOptions.hoverShadow,
            transition: buttonOptions.transition,
            steamIcon: buttonOptions.steamIcon,
            image: buttonOptions.image,
            display: true,
          }
          : {
            display: false,
          },
        ...(opts.steamReviewsOptions?.displayCTA && componentDisplay.widget && widgetOptions.enabled && widgetOptions.type !== "full"
          ? {
            widget: {
              type: widgetOptions.type,
              gameId: widgetOptions.gameId,
              scale: widgetOptions.scale || 1,
              utm: widgetOptions.utm || {
                source: "pageforge",
                campaign: "",
                medium: "",
                content: "",
                term: "",
              },
              display: true,
            }
          }
          : {}),
      },
    },
    mainBody: {
      type: "MainBody",
      props: {
        items: [
          {
            title: "JSON-Powered",
            description:
              "Create and modify landing pages using simple JSON structures without writing any code",
            icon: null,
          },
          {
            title: "Component-Based",
            description:
              "Modular components for ultimate flexibility and reusability",
            icon: null,
          },
          {
            title: "Fully Responsive",
            description:
              "Looks great on any device, any screen size with automatic mobile optimization",
            icon: null,
          },
        ],
        className: "py-16",
        // mainBody flag removed; display when hero is displayed (adjust as needed)
        display: componentDisplay.hero,
      },
    },
    button: {
      type: "button",
      props: {
        text: buttonOptions.buttonText,
        // If widget is displayed, suppress standalone main button even if componentDisplay.button true
        display: componentDisplay.button && !componentDisplay.widget,
        buttonSize: buttonOptions.buttonSize,
        font: {
          family: buttonOptions.font.family,
          size: buttonOptions.font.size,
          weight: buttonOptions.font.weight,
          color: buttonOptions.font.color,
          hoverColor: buttonOptions.font.hoverColor,
        },
        width: buttonOptions.width,
        height: buttonOptions.height,
        border: {
          width: buttonOptions.border.width,
          style: buttonOptions.border.style,
          color: buttonOptions.border.color,
          radius: buttonOptions.border.radius,
          hoverColor: buttonOptions.border.hoverColor,
        },
        backgroundColor: buttonOptions.backgroundColor,
        hoverBackgroundColor: buttonOptions.hoverBackgroundColor,
        image: buttonOptions.image.display
          ? {
            src: buttonOptions.image.src,
            alt: buttonOptions.image.alt,
            width: buttonOptions.image.width,
            height: buttonOptions.image.height,
            display: true,
            position: buttonOptions.image.position,
          }
          : {
            src: "",
            alt: "",
            width: 0,
            height: 0,
            display: false,
            position: "left" as const,
          },
        steamIcon: buttonOptions.steamIcon.display
          ? {
            display: true,
            size: buttonOptions.steamIcon.size,
            color: buttonOptions.steamIcon.color,
            hoverColor: (buttonOptions.steamIcon as any).hoverColor,
            variant: buttonOptions.steamIcon.variant,
          }
          : {
            display: false,
          },
        onClick: null,
        className: buttonOptions.fullWidth
          ? "w-full mx-auto mt-8"
          : "mx-auto mt-8",
        disabled: buttonOptions.disabled,
        padding: buttonOptions.padding,
        margin: buttonOptions.margin,
        shadow: buttonOptions.shadow && buttonOptions.shadow !== 'none'
          ? `0 4px 14px rgba(0,0,0,${buttonOptions.shadowIntensity ?? 0.25})`
          : buttonOptions.shadow,
        hoverShadow: buttonOptions.shadow && buttonOptions.shadow !== 'none'
          ? `0 6px 20px rgba(0,0,0,${buttonOptions.hoverShadowIntensity ?? 0.35})`
          : buttonOptions.hoverShadow,
        transition: buttonOptions.transition,
      },
    },
    companyLogo: {
      type: "companyLogo",
      props: {
        logo: {
          path: "",
          alt: "Company Logo",
          width: 180,
          height: 70,
        },
        className: "py-12 bg-white flex justify-center",
        display: (componentDisplay as any).companyLogo,
      },
    },
    logotype: {
      type: "logotype",
      props: {
        logo: {
          path: "",
          alt: "Logotype",
          width: 60,
          height: 60,
        },
        className: "py-6 flex justify-center",
        display: (componentDisplay as any).logotype,
      },
    },
    socialIcons: {
      type: "socialIcons",
      props: {
        icons: [
          {
            icon: { src: "", alt: "Facebook", width: 24, height: 24 },
            onClick: null,
            hoverStyle: { opacity: 0.7, transform: "scale(1.1)" },
          },
          {
            icon: { src: "", alt: "X", width: 24, height: 24 },
            onClick: null,
            hoverStyle: { opacity: 0.7, transform: "scale(1.1)" },
          },
          {
            icon: { src: "", alt: "YouTube", width: 24, height: 24 },
            onClick: null,
            hoverStyle: { opacity: 0.7, transform: "scale(1.1)" },
          },
          {
            icon: { src: "", alt: "Steam", width: 24, height: 24 },
            onClick: null,
            hoverStyle: { opacity: 0.7, transform: "scale(1.1)" },
          },
        ],
        className: "flex gap-6 justify-center py-8",
        display: (componentDisplay as any).socialIcons,
      },
    },
    footerLinks: {
      type: "footerLinks",
      props: {
        links: [
          { text: "Privacy Policy", url: "/privacy" },
          { text: "Terms of Service", url: "/terms" },
          { text: "FAQ", url: "/faq" },
          { text: "Support", url: "/support" },
          { text: "Blog", url: "/blog" },
        ],
        className:
          "flex gap-6 flex-wrap justify-center text-sm text-gray-600 py-4",
        display: (componentDisplay as any).footerLinks,
      },
    },
    footerBrandLogo: {
      type: "footerBrandLogo",
      props: {
        logo: {
          path: "",
          alt: "Footer Brand Logo",
          width: 80,
          height: 30,
        },
        className: "mx-auto py-6 flex justify-center",
        display: (componentDisplay as any).footerBrandLogo,
      },
    },
    footer: {
      type: "footer",
      props: {
        layout: {
          containerClass: footerOptions.layout.containerClass,
          gridClass: "grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-12 items-end sm:items-center gap-y-2 place-items-center sm:place-items-stretch",
          brandColumn: {
            span: "col-span-1 sm:col-span-3",
            alignment: "center",
            className: "text-center sm:text-left",
          },
          contentColumn: {
            span: "col-span-1 sm:col-span-6",
            alignment: "center",
            className: "text-center",
          },
          socialColumn: {
            span: "col-span-1 sm:col-span-3",
            alignment: "center",
            className: "text-center sm:text-right",
          },
          padding: {
            container: footerOptions.layout.containerPadding,
            sections: footerOptions.layout.sectionPadding,
            vertical: footerOptions.layout.verticalPadding,
            horizontal: footerOptions.layout.horizontalPadding,
          },
          margin: {
            left: footerOptions.layout.leftMargin,
            right: footerOptions.layout.rightMargin,
          },
          responsive: {
            mobile: footerOptions.layout.mobileLayout,
            mobileOrder: footerOptions.layout.mobileOrder,
          },
        },
        branding: {
          logo: footerOptions.logoUrl
            ? {
              path: footerOptions.logoUrl,
              alt: "Logo",
              height: ((footerOptions as any).logoHeight ?? footerOptions.logoSize) || 48,
              className: "",
            }
            : undefined,
          additionalLogo:
            footerOptions.hasAdditionalLogo && footerOptions.additionalLogoUrl
              ? {
                path: footerOptions.additionalLogoUrl,
                alt: "Additional Logo",
                height: ((footerOptions as any).additionalLogoHeight ?? footerOptions.additionalLogoSize) || 48,
                className: "",
                position: footerOptions.additionalLogoPosition,
              }
              : undefined,
          display: !!(
            footerOptions.logoUrl ||
            (footerOptions.hasAdditionalLogo && footerOptions.additionalLogoUrl)
          ),
          wrapperClass: "",
        },
        content: {
          copyright: {
            text: footerOptions.footerText,
            year: false,
            display: false,
            position: 'after',
            className: "",
          },
          links: {
            items: [
              ...(footerOptions.termsUrl
                ? [
                  {
                    text: "Terms of Service",
                    url: footerOptions.termsUrl,
                    target: "_blank" as const,
                  },
                ]
                : []),
              ...(getFooterOption("privacyUrl", "")
                ? [
                  {
                    text: "Privacy Policy",
                    url: getFooterOption("privacyUrl", ""),
                    target: "_blank" as const,
                  },
                ]
                : []),
              ...(getFooterOption("refundUrl", "")
                ? [
                  {
                    text: "Refund Policy",
                    url: getFooterOption("refundUrl", ""),
                    target: "_blank" as const,
                  },
                ]
                : []),
              ...(getFooterOption("eulaUrl", "")
                ? [
                  {
                    text: "EULA",
                    url: getFooterOption("eulaUrl", ""),
                    target: "_blank" as const,
                  },
                ]
                : []),
              ...(getFooterOption("contactUrl", "")
                ? [
                  {
                    text: "Contact Us",
                    url: getFooterOption("contactUrl", ""),
                    target: "_blank" as const,
                  },
                ]
                : []),
              ...getFooterOption("customLinks", []),
            ],
            display: !!(
              footerOptions.termsUrl ||
              getFooterOption("privacyUrl", "") ||
              getFooterOption("refundUrl", "") ||
              getFooterOption("eulaUrl", "") ||
              getFooterOption("contactUrl", "") ||
              getFooterOption("customLinks", []).length > 0
            ),
            separator: getFooterOption("linkSeparator", " | "),
            wrapperClass: "",
            linkClass: getFooterOption("linkColor", "text-gray-300"),
            hoverClass: `${getFooterOption(
              "linkHoverColor",
              "text-white"
            )} hover:underline`,
          },
          additionalText: getFooterOption("additionalText", "")
            ? {
              text: getFooterOption("additionalText", ""),
              position: getFooterOption("additionalTextPosition", "bottom"),
              className: "",
            }
            : undefined,
        },
        social: {
          icons:
            footerOptions.includeSocialIcons &&
              footerOptions.selectedSocialIcons.length > 0
              ? footerOptions.selectedSocialIcons.map((iconKey: string) => {
                const socialIconsMap: Record<
                  string,
                  { src: string; alt: string; url: string }
                > = {
                  discord: {
                    src: "https://imagedelivery.net/demo-media-account/9a1ad639-3adb-48c4-c400-dc68813f6a00/public",
                    alt: "Discord",
                    url: "",
                  },
                  facebook: {
                    src: "https://imagedelivery.net/demo-media-account/8dc40789-7142-4b3d-bafa-9ca6a4aa4e00/public",
                    alt: "Facebook",
                    url: "",
                  },
                  steam: {
                    src: "https://imagedelivery.net/demo-media-account/8e981130-ebd3-4132-a394-459b58a15900/public",
                    alt: "Steam",
                    url: "",
                  },
                  x: {
                    src: "https://imagedelivery.net/demo-media-account/52804243-13c8-4ffc-cd5b-f868506f8e00/public",
                    alt: "X",
                    url: "",
                  },
                  vk: {
                    src: "https://imagedelivery.net/demo-media-account/b05c09fb-ef07-48e5-1c47-f18a165f7f00/public",
                    alt: "VK",
                    url: "",
                  },
                  youtube: {
                    src: "https://imagedelivery.net/demo-media-account/2b3c539d-212d-44b9-42a0-d90f6892ab00/public",
                    alt: "YouTube",
                    url: "",
                  },
                  instagram: {
                    src: "https://imagedelivery.net/demo-media-account/9a058dc8-b12d-4849-3898-dc1f6f554d00/public",
                    alt: "Instagram",
                    url: "",
                  },
                  reddit: {
                    src: "https://imagedelivery.net/demo-media-account/969462b1-a2cf-4c0e-3b78-04e58a783e00/public",
                    alt: "Reddit",
                    url: "",
                  },
                  tiktok: {
                    src: "https://imagedelivery.net/demo-media-account/067d46c5-750f-4d25-595b-05bf19301900/public",
                    alt: "TikTok",
                    url: "",
                  },
                  twitch: {
                    src: "https://imagedelivery.net/demo-media-account/20a3ca3d-cca0-4599-10e3-6fb33daa0800/public",
                    alt: "Twitch",
                    url: "",
                  },
                };

                const icon = socialIconsMap[iconKey];
                const customSocialUrls = getFooterOption(
                  "customSocialUrls",
                  {}
                );
                const customUrl =
                  customSocialUrls[iconKey as keyof typeof customSocialUrls];
                const socialIconSize = getFooterOption(
                  "socialIconSize",
                  "medium"
                ) as "small" | "medium" | "large";
                return {
                  src: icon.src,
                  alt: icon.alt,
                  width:
                    socialIconSize === "small"
                      ? 16
                      : socialIconSize === "large"
                        ? 32
                        : 24,
                  height:
                    socialIconSize === "small"
                      ? 16
                      : socialIconSize === "large"
                        ? 32
                        : 24,
                  url: customUrl || "",
                };
              })
              : [],
          display: footerOptions.includeSocialIcons,
          layout: getFooterOption("socialIconLayout", "horizontal"),
          iconSize: getFooterOption("socialIconSize", "medium"),
          spacing: getFooterOption("socialIconSpacing", "4px"),
          wrapperClass: "",
          iconClass: "",
          hoverEffects: getFooterOption("socialIconHoverEffects", true),
          iconOverrides: {},
        },
        backgroundColor: footerOptions.backgroundColor,
        textColor: footerOptions.textColor,
        fontFamily: generalOptions.font.family,
        className: getFooterOption("customClassName", ""),
        display: componentDisplay.footer,
      },
    },
    widget: {
      type: "widget",
      props: {
        gameId: widgetOptions.gameId || "",
        width: widgetOptions.width || 646,
        height: widgetOptions.height || 190,
        enabled: widgetOptions.enabled || false,
        type: widgetOptions.type || "full",
        scale: widgetOptions.scale || 1,
        alignX: widgetOptions.alignX || 'center',
        alignY: widgetOptions.alignY || 'middle',
        positionX: widgetOptions.positionX ?? 0,
        positionY: widgetOptions.positionY ?? 0,
        shadowIntensity: widgetOptions.shadowIntensity ?? 0,
        utm: widgetOptions.utm || {
          source: "pageforge",
          campaign: "",
          medium: "",
          content: "",
          term: "",
        },
        display: componentDisplay.widget,
      },
    },
    cookiesBanner: {
      type: "cookiesBanner",
      props: {
        backgroundColor: cookieBannerOptions?.backgroundColor || '#111827',
        backgroundOpacity: cookieBannerOptions?.backgroundOpacity ?? 0.95,
        textColor: cookieBannerOptions?.textColor || '#ffffff',
        headerText: cookieBannerOptions?.headerText || '',
        bodyText: cookieBannerOptions?.bodyText || '',
        policyUrl: cookieBannerOptions?.policyUrl || '',
        acceptText: cookieBannerOptions?.acceptText || 'Accept All',
        customizeText: cookieBannerOptions?.customizeText || 'Customize',
        showReject: cookieBannerOptions?.showReject !== false,
        display: (componentDisplay as any).cookiesBanner === true,
      },
    },
    videoPlayer: {
      type: "videoPlayer",
      props: {
        background: videoPlayerOptions?.background || { type: 'solid', color: '#000000' },
        videoSource: videoPlayerOptions?.videoSource || { type: 'url', url: '' },
        videoWidth: videoPlayerOptions?.videoWidth || '100%',
        videoHeight: videoPlayerOptions?.videoHeight || 'auto',
        aspectRatio: videoPlayerOptions?.aspectRatio || '16/9',
        autoPlay: videoPlayerOptions?.autoPlay ?? false,
        loop: videoPlayerOptions?.loop ?? false,
        muted: videoPlayerOptions?.muted ?? true,
        controls: videoPlayerOptions?.controls ?? true,
        playsInline: videoPlayerOptions?.playsInline ?? true,
        poster: videoPlayerOptions?.poster || '',
        fontFamily: generalOptions.font.family,
        fontWeight: generalOptions.font.weight,
        display: componentDisplay.videoPlayer,
        button: videoPlayerOptions?.displayCTA && componentDisplay.button
          ? {
            text: buttonOptions.buttonText,
            onClick: null,
            buttonSize: buttonOptions.buttonSize || "default",
            backgroundColor: buttonOptions.backgroundColor,
            hoverBackgroundColor: buttonOptions.hoverBackgroundColor,
            font: buttonOptions.font,
            border: buttonOptions.border,
            padding: buttonOptions.padding,
            margin: buttonOptions.margin,
            shadow: buttonOptions.shadow && buttonOptions.shadow !== 'none'
              ? `0 4px 14px rgba(0,0,0,${buttonOptions.shadowIntensity ?? 0.25})`
              : buttonOptions.shadow,
            hoverShadow: buttonOptions.shadow && buttonOptions.shadow !== 'none'
              ? `0 6px 20px rgba(0,0,0,${buttonOptions.hoverShadowIntensity ?? 0.35})`
              : buttonOptions.hoverShadow,
            transition: buttonOptions.transition,
            steamIcon: buttonOptions.steamIcon,
            image: buttonOptions.image,
            display: true,
          }
          : {
            display: false,
          },
        ...(videoPlayerOptions?.displayCTA && componentDisplay.widget && widgetOptions.enabled && widgetOptions.type !== "full"
          ? {
            widget: {
              type: widgetOptions.type,
              gameId: widgetOptions.gameId,
              scale: widgetOptions.scale || 1,
              utm: widgetOptions.utm || {
                source: "pageforge",
                campaign: "",
                medium: "",
                content: "",
                term: "",
              },
              display: true,
            }
          }
          : {}),
      },
    },
    titleTxt: {
      type: "titleTxt",
      props: {
        title: titleTxtOptions?.title || 'Title',
        subtext: titleTxtOptions?.subtext || 'Subtitle text',
        background: titleTxtOptions?.background || { type: 'solid', color: '#ffffff' },
        backgroundColor: titleTxtOptions?.backgroundColor || '#ffffff',
        titleColor: titleTxtOptions?.titleColor || '#000000',
        subtextColor: titleTxtOptions?.subtextColor || '#666666',
        titleFontSize: titleTxtOptions?.titleFontSize || '48px',
        subtextFontSize: titleTxtOptions?.subtextFontSize || '24px',
        fontFamily: generalOptions.font.family,
        fontWeight: generalOptions.font.weight,
        display: componentDisplay.titleTxt,
        button: titleTxtOptions?.displayCTA && componentDisplay.button
          ? {
            text: buttonOptions.buttonText,
            onClick: null,
            buttonSize: buttonOptions.buttonSize || "default",
            backgroundColor: buttonOptions.backgroundColor,
            hoverBackgroundColor: buttonOptions.hoverBackgroundColor,
            font: buttonOptions.font,
            border: buttonOptions.border,
            padding: buttonOptions.padding,
            margin: buttonOptions.margin,
            shadow: buttonOptions.shadow && buttonOptions.shadow !== 'none'
              ? `0 4px 14px rgba(0,0,0,${buttonOptions.shadowIntensity ?? 0.25})`
              : buttonOptions.shadow,
            hoverShadow: buttonOptions.shadow && buttonOptions.shadow !== 'none'
              ? `0 6px 20px rgba(0,0,0,${buttonOptions.hoverShadowIntensity ?? 0.35})`
              : buttonOptions.hoverShadow,
            transition: buttonOptions.transition,
            steamIcon: buttonOptions.steamIcon,
            image: buttonOptions.image,
            display: true,
          }
          : {
            display: false,
          },
        ...(titleTxtOptions?.displayCTA && componentDisplay.widget && widgetOptions.enabled && widgetOptions.type !== "full"
          ? {
            widget: {
              type: widgetOptions.type,
              gameId: widgetOptions.gameId,
              scale: widgetOptions.scale || 1,
              utm: widgetOptions.utm || {
                source: "pageforge",
                campaign: "",
                medium: "",
                content: "",
                term: "",
              },
              display: true,
            }
          }
          : {}),
      },
    },
    columnTxt: {
      type: "columnTxt",
      props: {
        rows: columnTxtOptions?.rows || [],
        background: columnTxtOptions?.background || { type: 'solid', color: '#ffffff' },
        backgroundColor: columnTxtOptions?.backgroundColor || '#ffffff',
        textColor: columnTxtOptions?.textColor || '#000000',
        fontSize: columnTxtOptions?.fontSize || '16px',
        fontFamily: generalOptions.font.family,
        fontWeight: generalOptions.font.weight,
        imageWidth: columnTxtOptions?.imageWidth || '50%',
        imageHeight: columnTxtOptions?.imageHeight || 'auto',
        gap: columnTxtOptions?.gap || 32,
        padding: columnTxtOptions?.padding || '40px 20px',
        display: componentDisplay.columnTxt,
        button: columnTxtOptions?.displayCTA && componentDisplay.button
          ? {
            text: buttonOptions.buttonText,
            onClick: null,
            buttonSize: buttonOptions.buttonSize || "default",
            backgroundColor: buttonOptions.backgroundColor,
            hoverBackgroundColor: buttonOptions.hoverBackgroundColor,
            font: buttonOptions.font,
            border: buttonOptions.border,
            padding: buttonOptions.padding,
            margin: buttonOptions.margin,
            shadow: buttonOptions.shadow && buttonOptions.shadow !== 'none'
              ? `0 4px 14px rgba(0,0,0,${buttonOptions.shadowIntensity ?? 0.25})`
              : buttonOptions.shadow,
            hoverShadow: buttonOptions.shadow && buttonOptions.shadow !== 'none'
              ? `0 6px 20px rgba(0,0,0,${buttonOptions.hoverShadowIntensity ?? 0.35})`
              : buttonOptions.hoverShadow,
            transition: buttonOptions.transition,
            steamIcon: buttonOptions.steamIcon,
            image: buttonOptions.image,
            display: true,
          }
          : {
            display: false,
          },
        ...(columnTxtOptions?.displayCTA && componentDisplay.widget && widgetOptions.enabled && widgetOptions.type !== "full"
          ? {
            widget: {
              type: widgetOptions.type,
              gameId: widgetOptions.gameId,
              scale: widgetOptions.scale || 1,
              utm: widgetOptions.utm || {
                source: "pageforge",
                campaign: "",
                medium: "",
                content: "",
                term: "",
              },
              display: true,
            }
          }
          : {}),
      },
    },
    mediaShowcase: {
      type: "mediaShowcase",
      props: {
        items: mediaShowcaseOptions?.items || [],
        title: mediaShowcaseOptions?.title || 'Media Showcase',
        background: mediaShowcaseOptions?.background || { type: 'solid', color: '#000000' },
        rows: mediaShowcaseOptions?.rows || 2,
        columns: mediaShowcaseOptions?.columns || 3,
        gap: mediaShowcaseOptions?.gap ?? 10,
        backgroundColor: mediaShowcaseOptions?.backgroundColor || '#000000',
        padding: mediaShowcaseOptions?.padding || '0',
        cellHeight: mediaShowcaseOptions?.cellHeight || '300px',
        fontFamily: generalOptions.font.family,
        fontWeight: generalOptions.font.weight,
        display: componentDisplay.mediaShowcase,
        ...(mediaShowcaseOptions?.displayCTA
          ? {
            button: componentDisplay.button
              ? {
                display: true,
                text: buttonOptions.buttonText,
                buttonSize: buttonOptions.buttonSize,
                backgroundColor: buttonOptions.backgroundColor,
                hoverBackgroundColor: buttonOptions.hoverBackgroundColor,
                font: buttonOptions.font,
                border: buttonOptions.border,
                padding: buttonOptions.padding,
                margin: buttonOptions.margin,
                shadow: buttonOptions.shadow,
                hoverShadow: buttonOptions.hoverShadow,
                shadowIntensity: buttonOptions.shadowIntensity,
                hoverShadowIntensity: buttonOptions.hoverShadowIntensity,
                transition: buttonOptions.transition,
                steamIcon: buttonOptions.steamIcon,
                image: buttonOptions.image,
              }
              : { display: false },
            widget: componentDisplay.widget && widgetOptions.enabled
              ? {
                display: true,
                type: widgetOptions.type,
                gameId: widgetOptions.gameId,
                scale: widgetOptions.scale,
                utm: widgetOptions.utm,
              }
              : { display: false },
          }
          : {}),
      },
    },
    faq: {
      type: "faq",
      props: {
        items: faqOptions?.items || [],
        title: faqOptions?.title || 'Frequently Asked Questions',
        background: faqOptions?.background || { type: 'solid', color: '#ffffff' },
        backgroundColor: faqOptions?.backgroundColor || '#ffffff',
        textColor: faqOptions?.textColor || '#000000',
        questionFontSize: faqOptions?.questionFontSize || '18px',
        answerFontSize: faqOptions?.answerFontSize || '16px',
        fontFamily: generalOptions.font.family,
        fontWeight: generalOptions.font.weight,
        padding: faqOptions?.padding || '60px 20px',
        maxWidth: faqOptions?.maxWidth || '1000px',
        separatorColor: faqOptions?.separatorColor || '#e5e7eb',
        iconColor: faqOptions?.iconColor || '#6b7280',
        display: componentDisplay.faq,
      },
    },
  };

  const finalJson = { ...baseJson };
  // Build sections from enabled components
  const enabledKeys = Object.keys(componentDisplay)
    .filter((key) => {
      const enabled = componentDisplay[key as keyof ComponentDisplay];
      if (!enabled) return false;
      // Prevent adding button section when widget active (navbar button still handled inside navbar template)
      if (key === 'button' && componentDisplay.widget) return false;
      return true;
    });
  const sections = enabledKeys
    .map((key) => templates[key])
    .filter((section): section is Section => !!section);

  // Always include cookiesBanner section with its display flag, so its state persists across saves
  if (templates.cookiesBanner) {
    const hasCookieBanner = sections.some((s) => s.type === 'cookiesBanner');
    if (!hasCookieBanner) sections.push(templates.cookiesBanner);
  }

  finalJson.sections = sections;
  return finalJson;
}

// Deprecated legacy export name retained briefly for compatibility.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const generateJson = (...args: any[]) => {
  console.warn('[deprecated] generateJson -> use generateLandingPageData');
  return generateLandingPageData.apply(null, args as any);
};
