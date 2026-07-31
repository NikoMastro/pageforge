import { pixelPftagPreproduction, pixelPftagProduction, pixelBaseUrl } from './config';

export const FONT_IMPORTS = {
  'Roboto': 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700,800&display=swap',
  'Open Sans': 'https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,600,700,800&display=swap',
  'Montserrat': 'https://fonts.googleapis.com/css?family=Montserrat:300,400,500,600,700,800&display=swap',
  'Lato': 'https://fonts.googleapis.com/css?family=Lato:300,400,700,900&display=swap',
  'Poppins': 'https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700,800&display=swap',
  'Inter': 'https://fonts.googleapis.com/css?family=Inter:300,400,500,600,700,800&display=swap',
  'Nunito': 'https://fonts.googleapis.com/css?family=Nunito:300,400,500,600,700,800&display=swap',
  'Source Sans Pro': 'https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,500,600,700,800&display=swap',
  'Barlow': 'https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700;800&display=swap',
  'Motiva Sans': '/font/motiva-sans/motiva-sans.css'
} as const;

export const FONT_OPTIONS = [
  { value: 'Inter, sans-serif', label: 'Inter (Modern Sans-serif)', import: FONT_IMPORTS.Inter },
  { value: "'Motiva Sans', sans-serif", label: 'Motiva Sans (Custom Brand Font)', import: FONT_IMPORTS['Motiva Sans'] },
  { value: 'system-ui, sans-serif', label: 'System UI (Platform default)', import: null },
  { value: 'Arial, sans-serif', label: 'Arial (Classic Sans-serif)', import: null },
  { value: 'Roboto, sans-serif', label: 'Roboto (Google font)', import: FONT_IMPORTS.Roboto },
  { value: "'Open Sans', sans-serif", label: 'Open Sans (Popular web font)', import: FONT_IMPORTS['Open Sans'] },
  { value: 'Montserrat, sans-serif', label: 'Montserrat (Modern geometric)', import: FONT_IMPORTS.Montserrat },
  { value: 'Lato, sans-serif', label: 'Lato (Humanist sans-serif)', import: FONT_IMPORTS.Lato },
  { value: 'Poppins, sans-serif', label: 'Poppins (Modern sans-serif)', import: FONT_IMPORTS.Poppins },
  { value: 'Nunito, sans-serif', label: 'Nunito (Rounded sans-serif)', import: FONT_IMPORTS.Nunito },
  { value: "'Source Sans Pro', sans-serif", label: 'Source Sans Pro (Professional)', import: FONT_IMPORTS['Source Sans Pro'] },
  { value: "'Barlow', sans-serif", label: 'Barlow (Modern game UI sans-serif)', import: FONT_IMPORTS.Barlow },
  { value: 'Georgia, serif', label: 'Georgia (Serif)', import: null },
  { value: "'Times New Roman', serif", label: 'Times New Roman (Classic Serif)', import: null },
  { value: "'Courier New', monospace", label: 'Courier New (Monospace)', import: null },
  { value: 'Helvetica, sans-serif', label: 'Helvetica (Sans-serif)', import: null },
  { value: "'Segoe UI', sans-serif", label: 'Segoe UI (Windows style)', import: null },
] as const;

export const DEFAULT_CONFIG_VALUES = {
  author: 'PageForge User',
  version: '1.0.0',
  keywords: ['landing page', 'JSON', 'builder', 'PageForge'],
  thumbnail: 'https://imagedelivery.net/demo-media-account/52ebb63d-4056-4f7f-442c-3eef7e094e00/public'
} as const;

// Pixel script URLs - configurable via environment variables
export const PIXEL_SCRIPT_URLS = {
  BASE: pixelBaseUrl,
  PFTAG_PROD: pixelPftagProduction,
  PFTAG_PREPROD: pixelPftagPreproduction,
} as const;

export const THEME_DEFAULTS = {
  primaryColor: '#3B82F6',
  secondaryColor: '#8B5CF6',
  accentColor: '#10B981',
  textColor: '#1F2937',
  textSecondaryColor: '#6B7280',
  backgroundColor: '#FFFFFF',
  backgroundSecondaryColor: '#F9FAFB',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  headingFontFamily: 'system-ui, -apple-system, sans-serif',
  borderRadius: '0.25rem',
  borderColor: '#E5E7EB'
} as const;

export const LAYOUT_DEFAULTS = {
  maxWidth: '1200px',
  contentPadding: '1rem',
  sectionSpacing: '4rem'
} as const;

/**
 * Utility function to parse Google Font URL and extract font information
 */
export const parseGoogleFontUrl = (url: string): { fontFamily: string; fontName: string; cssValue: string } | null => {
  // Backwards-compatible helper: best-effort extract family from a Google Fonts CSS URL or specimen URL
  try {
    const urlObj = new URL(url);
    const host = urlObj.hostname;
    if (!host.includes('fonts.googleapis.com') && !host.includes('fonts.google.com')) return null;

    let fontFamily = '';

    // CSS endpoints (v1 or v2)
    const familyParam = urlObj.searchParams.get('family');
    if (familyParam) {
      fontFamily = familyParam.split(':')[0].replace(/\+/g, ' ');
    }

    // Specimen page like https://fonts.google.com/specimen/Barlow
    if (!fontFamily && host.includes('fonts.google.com')) {
      const parts = urlObj.pathname.split('/').filter(Boolean);
      const idx = parts.findIndex(p => p.toLowerCase() === 'specimen');
      if (idx !== -1 && parts[idx + 1]) {
        fontFamily = decodeURIComponent(parts[idx + 1]).replace(/[+_]/g, ' ').trim();
      }
    }

    if (!fontFamily) return null;

    const cssValue = fontFamily.includes(' ') ? `'${fontFamily}', sans-serif` : `${fontFamily}, sans-serif`;
    return { fontFamily, fontName: fontFamily, cssValue };
  } catch {
    // Not a URL, maybe just a font name like "Barlow"
    const name = (url || '').trim();
    if (!name) return null;
    const normalized = name.replace(/\s+/g, ' ').trim();
    const cssValue = normalized.includes(' ') ? `'${normalized}', sans-serif` : `${normalized}, sans-serif`;
    return { fontFamily: normalized, fontName: normalized, cssValue };
  }
};

export const isValidGoogleFontUrl = (url: string): boolean => {
  // Accepts: Google Fonts CSS URLs (css or css2), specimen URLs, or plain font names
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('fonts.googleapis.com')) {
      return urlObj.searchParams.has('family');
    }
    if (urlObj.hostname.includes('fonts.google.com')) {
      const parts = urlObj.pathname.split('/').filter(Boolean);
      return parts.some(p => p.toLowerCase() === 'specimen') && parts.length >= 2;
    }
    return false;
  } catch {
    // Not a URL: treat as a potential font family name (letters, spaces, +, -)
    const name = (url || '').trim();
    return !!name && /[a-z]/i.test(name);
  }
};

/**
 * Normalize a font input (name, specimen URL, or CSS URL) into a usable Google Fonts CSS URL and CSS font-family value
 */
export const normalizeGoogleFontInput = (input: string): { cssUrl: string; fontFamily: string; cssValue: string } | null => {
  if (!input || !input.trim()) return null;

  const DEFAULT_WEIGHTS = '300;400;500;600;700;800';
  const toCss2 = (familyName: string) => {
    const familyParam = familyName.trim().replace(/\s+/g, '+');
    return `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${DEFAULT_WEIGHTS}&display=swap`;
  };

  // Try URL paths first
  try {
    const urlObj = new URL(input);
    const host = urlObj.hostname;
    if (host.includes('fonts.googleapis.com')) {
      const fam = urlObj.searchParams.get('family');
      if (!fam) return null;
      const fontFamily = fam.split(':')[0].replace(/\+/g, ' ');
      const cssValue = fontFamily.includes(' ') ? `'${fontFamily}', sans-serif` : `${fontFamily}, sans-serif`;
      // Normalize to css2 format with common weights
      const cssUrl = toCss2(fontFamily);
      return { cssUrl, fontFamily, cssValue };
    }
    if (host.includes('fonts.google.com')) {
      const parts = urlObj.pathname.split('/').filter(Boolean);
      const idx = parts.findIndex(p => p.toLowerCase() === 'specimen');
      if (idx !== -1 && parts[idx + 1]) {
        const familyName = decodeURIComponent(parts[idx + 1]).replace(/[+_]/g, ' ').trim();
        const cssUrl = toCss2(familyName);
        const cssValue = familyName.includes(' ') ? `'${familyName}', sans-serif` : `${familyName}, sans-serif`;
        return { cssUrl, fontFamily: familyName, cssValue };
      }
    }
  } catch {
    // Not a URL, continue below
  }

  // Treat as a family name
  const raw = input.trim();
  if (!raw) return null;
  const familyName = raw.replace(/[+_]/g, ' ').replace(/\s+/g, ' ').trim();
  const cssUrl = toCss2(familyName);
  const cssValue = familyName.includes(' ') ? `'${familyName}', sans-serif` : `${familyName}, sans-serif`;
  return { cssUrl, fontFamily: familyName, cssValue };
};
