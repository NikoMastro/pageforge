import React from "react";
import type { FooterProps } from '../../../types';
import FooterLinks from "./footerLinks";
import FooterBrandLogo from "./footerBrandLogo";
import FooterText from "./footerText";
import FooterSocialIcons from "./footerSocialIcons";

const Footer: React.FC<FooterProps & { fontFamily?: string; fontWeight?: string; layoutMode?: 'desktop' | 'phone' }> = ({
  layout,
  branding,
  content,
  social,
  copyright = { text: "", year: false },
  links = [],
  logo,
  socialIcons = [],
  socialIconsDisplay = true,
  backgroundColor = "bg-gray-800",
  textColor = "text-gray-100",
  className = "",
  display = true,
  fontFamily: _ignoredFontFamily,
  fontWeight,
  layoutMode = 'desktop',
}) => {
  if (!display) return null;

  const isPhone = layoutMode === 'phone';

  const FOOTER_FONT_STACK = 'Helvetica, Arial, sans-serif';
  const fontStyle = {
    fontFamily: FOOTER_FONT_STACK,
    fontWeight: fontWeight || 'inherit'
  } as const;

  // Phone layout: single column, everything centered
  const phoneLayout = {
    containerClass: "max-w-full mx-auto",
    gridClass: "grid grid-cols-1 items-center gap-y-4 place-items-center",
    brandColumn: { span: "col-span-1", alignment: "center", className: "text-center" },
    contentColumn: { span: "col-span-1", alignment: "center", className: "text-center" },
    socialColumn: { span: "col-span-1", alignment: "center", className: "text-center" },
    padding: {
      container: "pb-4 pt-2 px-4",
      vertical: "py-2",
      horizontal: "px-4"
    }
  };

  const footerLayout = isPhone ? phoneLayout : (layout || {
    containerClass: "max-w-[70%] mx-auto",
    gridClass: "grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-12 items-center sm:items-center gap-4 place-items-center sm:place-items-stretch",
    brandColumn: { span: "col-span-1 sm:col-span-3", alignment: "left" },
    contentColumn: { span: "col-span-1 sm:col-span-6", alignment: "center" },
    socialColumn: { span: "col-span-1 sm:col-span-3", alignment: "right" },
    padding: {
      container: "pb-4 pt-2 px-4",
      vertical: "py-2",
      horizontal: "px-4"
    }
  });

  const footerBranding = branding || (logo ? {
    logo,
    additionalLogo: undefined,
    display: true,
    wrapperClass: ""
  } : {
    logo: undefined,
    additionalLogo: undefined,
    display: false,
    wrapperClass: ""
  });

  const footerContent = content || {
    copyright: { text: copyright.text, year: copyright.year },
    links: { items: links, display: Array.isArray(links) ? links.length > 0 : !!links }
  };

  const footerSocial = social || {
    icons: socialIcons,
    display: socialIconsDisplay,
    layout: 'horizontal' as const,
    spacing: 'gap-2'
  };

  return (
    <footer
      id="footer"
      data-component="Footer"
      className={`footer w-full ${footerLayout.padding?.container || 'pb-4 pt-2 px-4'} text-sm ${className}`}
      style={{
        backgroundColor: backgroundColor.startsWith('#') ? backgroundColor : undefined,
        color: textColor.startsWith('#') ? textColor : undefined,
        ...fontStyle
      }}
    >
      <div
        className={`footer__container ${footerLayout.containerClass || "max-w-[70%] mx-auto"} ${!backgroundColor.startsWith('#') ? backgroundColor : ''} ${!textColor.startsWith('#') ? textColor : ''}`}
        style={{
          marginLeft: footerLayout.margin?.left,
          marginRight: footerLayout.margin?.right,
          margin: footerLayout.margin?.container
        }}
      >
        <div className={`footer__grid ${footerLayout.gridClass || "grid grid-cols-1 md:grid-cols-12 items-center gap-y-4"}`}>

          {/* Brand/Logo Column */}
          {footerBranding.display && (footerBranding.logo || footerBranding.additionalLogo) && (
            <div className={`footer__brand-col flex flex-col items-center ${isPhone ? '' : 'sm:flex-row'} ${footerLayout.brandColumn?.alignment === 'center' ? 'justify-center' :
              footerLayout.brandColumn?.alignment === 'right' ? 'justify-center' :
                footerLayout.brandColumn?.alignment === 'justify' ? 'justify-between' :
                  isPhone ? 'justify-center' : 'justify-center sm:justify-start'
              } ${footerLayout.brandColumn?.span || 'col-span-1 sm:col-span-3'} ${footerLayout.brandColumn?.className || ''}`}>

              <div className={`footer__brand-wrapper ${footerBranding.wrapperClass || ''} ${footerBranding.additionalLogo?.position === 'beside' ? 'flex items-center gap-4' : 'flex flex-col items-center gap-2'
                }`}>

                {/* Additional logo positioned above primary logo */}
                {footerBranding.additionalLogo?.position === 'above' && footerBranding.additionalLogo && (
                  <div className="footer__logo footer__logo--additional footer__logo--above">
                    <FooterBrandLogo
                      logo={footerBranding.additionalLogo}
                      className=""
                    />
                  </div>
                )}

                {/* Primary logo and additional logo positioned beside */}
                <div className={`${footerBranding.additionalLogo?.position === 'beside' ? 'flex items-center gap-4' : 'flex justify-center'} flex-wrap`}
                >
                  {footerBranding.logo && (
                    <div className="footer__logo footer__logo--primary">
                      <FooterBrandLogo
                        logo={footerBranding.logo}
                        className=""
                      />
                    </div>
                  )}

                  {footerBranding.additionalLogo?.position === 'beside' && footerBranding.additionalLogo && (
                    <div className="footer__logo footer__logo--additional footer__logo--beside">
                      <FooterBrandLogo
                        logo={footerBranding.additionalLogo}
                        className=""
                      />
                    </div>
                  )}
                </div>

                {/* Additional logo positioned below primary logo */}
                {footerBranding.additionalLogo?.position === 'below' && footerBranding.additionalLogo && (
                  <div className="footer__logo footer__logo--additional footer__logo--below">
                    <FooterBrandLogo
                      logo={footerBranding.additionalLogo}
                      className=""
                    />
                  </div>
                )}

              </div>

            </div>
          )}

          {/* Content Column */}
          <div className={`footer__content-col ${footerLayout.contentColumn?.alignment === 'left' ? 'text-left' :
            footerLayout.contentColumn?.alignment === 'right' ? 'text-right' :
              footerLayout.contentColumn?.alignment === 'justify' ? 'text-justify' :
                'text-center'
            } ${footerLayout.contentColumn?.span || 'col-span-1 sm:col-span-6'} ${footerLayout.contentColumn?.className || ''}`}>

            <div className={`footer__content flex flex-col gap-2 ${footerLayout.contentColumn?.alignment === 'left' ? 'items-start' :
              footerLayout.contentColumn?.alignment === 'right' ? 'items-end' :
                'items-center'
              }`}>

              {footerContent.links?.display && footerContent.links.items.length > 0 && (
                <div className="footer__links w-full">
                  <FooterLinks
                    links={footerContent.links.items}
                    wrapperClass={`footer-links ${footerLayout.contentColumn?.alignment === 'center' ? 'justify-center' :
                      footerLayout.contentColumn?.alignment === 'right' ? 'justify-end' :
                        'justify-start'
                      }`}
                  />
                </div>
              )}

              {/* Footer text (placed under links) */}
              {(footerContent.copyright?.text) && (
                <span className="footer__copyright block whitespace-pre-line break-words">
                  <FooterText text={footerContent.copyright?.text} style={fontStyle} />
                </span>
              )}

            </div>

          </div>

          {/* Social Icons Column */}
          {footerSocial.display && (
            <div className={`footer__social-col ${footerLayout.socialColumn?.alignment === 'left' ? (isPhone ? 'text-center' : 'text-center sm:text-left') :
              footerLayout.socialColumn?.alignment === 'center' ? 'text-center' :
                footerLayout.socialColumn?.alignment === 'justify' ? 'text-justify' :
                  isPhone ? 'text-center' : 'text-center sm:text-right'
              } ${footerLayout.socialColumn?.span || 'col-span-1 sm:col-span-3'} ${footerLayout.socialColumn?.className || ''}`}>

              <FooterSocialIcons
                icons={footerSocial.icons || []}
                display={footerSocial.display}
                className={`footer__social-icons flex flex-wrap justify-center ${footerSocial.spacing || 'gap-2'}`}
              />

            </div>
          )}

        </div>
      </div>
    </footer>
  );
};

export default Footer;
