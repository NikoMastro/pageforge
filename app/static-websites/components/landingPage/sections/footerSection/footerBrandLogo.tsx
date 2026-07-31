import React from "react";
import type { FooterBrandLogoProps } from '../../../types';

const DEFAULT_FOOTER_BRAND_LOGO_URL = "https://imagedelivery.net/demo-media-account/52ebb63d-4056-4f7f-442c-3eef7e094e00/public";

const FooterBrandLogo: React.FC<FooterBrandLogoProps> = ({ logo, src, className = "" }) => {
  const logoData = logo || {};
  const rawPath: unknown = logoData.path ?? src;
  const path = typeof rawPath === 'string' && rawPath.trim() !== '' ? rawPath.trim() : DEFAULT_FOOTER_BRAND_LOGO_URL;
  const alt = (typeof logoData.alt === 'string' && logoData.alt.trim() !== '' ? logoData.alt : undefined) || 'FooterBrandLogo';
  const providedWidth = (logoData as any).width;
  const providedHeight = (logoData as any).height;
  const imgStyle: React.CSSProperties = {};
  const toCss = (v: string | number) => (typeof v === 'number' ? `${v}px` : v);

  if (providedWidth && providedHeight) {
    imgStyle.width = toCss(providedWidth);
    imgStyle.height = toCss(providedHeight);
  } else if (providedHeight && !providedWidth) {
    imgStyle.height = toCss(providedHeight);
    imgStyle.width = 'auto';
  } else if (providedWidth && !providedHeight) {
    imgStyle.width = toCss(providedWidth);
    imgStyle.height = 'auto';
  } else {
    imgStyle.width = 'auto';
    imgStyle.height = 'auto';
  }
  return (
    <div className={`footer__brand-logo inline-flex items-center ${className}`}>
      <img
        src={path}
        alt={alt}
        className="footer__brand-logo-img object-contain max-h-full max-w-full"
        style={imgStyle}
      />
    </div>
  );
};

export default FooterBrandLogo;
