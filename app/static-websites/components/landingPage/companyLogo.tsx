import React from "react";
import type { CompanyLogotypeProps } from '../types';

const DEFAULT_LOGO_URL = "https://imagedelivery.net/demo-media-account/52ebb63d-4056-4f7f-442c-3eef7e094e00/public";

const Logotype: React.FC<CompanyLogotypeProps> = ({ logo, src, className = "" }) => {
  const logoData = logo || {};
  const rawPath: unknown = logoData.path ?? src;
  const path = typeof rawPath === 'string' && rawPath.trim() !== '' ? rawPath.trim() : DEFAULT_LOGO_URL;
  const alt = (typeof logoData.alt === 'string' && logoData.alt.trim() !== '' ? logoData.alt : undefined) || 'CompanyLogo';
  const parseDim = (v: unknown, fallback: number) => {
    if (typeof v === 'number' && v > 0) return v;
    if (typeof v === 'string') { const n = parseInt(v, 10); if (!isNaN(n) && n > 0) return n; }
    return fallback;
  };
  const width = parseDim((logoData as any).width, 50);
  const height = parseDim((logoData as any).height, 50);
  return (
    <div className={`inline-flex items-center ${className}`}>
      <img src={path} alt={alt} width={width} height={height} className="object-contain max-h-full max-w-full" />
    </div>
  );
};

export default Logotype;
