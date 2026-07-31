import React from "react";
import type { LogotypeProps } from '../../../types';

const DEFAULT_LOGO_URL = "https://imagedelivery.net/demo-media-account/52ebb63d-4056-4f7f-442c-3eef7e094e00/public";

const Logotype: React.FC<LogotypeProps> = ({ logo, src, className = "" }) => {
  const logoData = logo || {};

  const rawPath: unknown = logoData.path ?? src; // allow passing src prop too
  const path = typeof rawPath === 'string' && rawPath.trim() !== ''
    ? rawPath.trim()
    : DEFAULT_LOGO_URL;

  const alt = (typeof logoData.alt === 'string' && logoData.alt.trim() !== '' ? logoData.alt : undefined) || 'Logo';

  const providedWidth = (logoData as any).width as string | number | undefined;
  const providedHeight = (logoData as any).height as string | number | undefined;
  const toCss = (v: string | number) => (typeof v === 'number' ? `${v}px` : v);

  const style: React.CSSProperties = {};
  if (providedWidth && providedHeight) {
    style.width = toCss(providedWidth);
    style.height = toCss(providedHeight);
  } else if (providedHeight && !providedWidth) {
    style.height = toCss(providedHeight);
    style.width = 'auto';
  } else if (providedWidth && !providedHeight) {
    style.width = toCss(providedWidth);
    style.height = 'auto';
  } else {
    style.width = 'auto';
    style.height = 'auto';
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      <img
        src={path}
        alt={alt}
        className="object-contain max-h-full max-w-full"
        style={style}
      />
    </div>
  );
};

export default Logotype;
