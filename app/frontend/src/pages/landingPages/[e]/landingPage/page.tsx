import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { JsonLanding, JsonLandingFullContent, JsonLandingPhone } from '../../../../components/landingpagesconfig';
import type { LandingPageData } from '../../../../types/shared.types';
import { pageforgeApi } from '../../../../api';
import { FONT_IMPORTS } from '../../../../config/app';

// Extract styles from generated HTML
function extractStylesFromHtml(html: string): string | null {
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  return styleMatch ? styleMatch[1] : null;
}

// Extract link tags (fonts) from generated HTML
function extractLinksFromHtml(html: string): string[] {
  const linkMatches = html.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || [];
  return linkMatches.map(link => {
    const hrefMatch = link.match(/href=["']([^"']+)["']/i);
    return hrefMatch ? hrefMatch[1] : '';
  }).filter(Boolean);
}

export default function LandingPageViewer() {
  const { name } = useParams<{ name: string }>();
  const [landingPageData, setLandingPageData] = useState<LandingPageData | null>(null);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const injectedStyleRef = useRef<HTMLStyleElement | null>(null);
  const injectedLinksRef = useRef<HTMLLinkElement[]>([]);

  // Inject styles from generatedHtml to match build output exactly
  useEffect(() => {
    if (!generatedHtml) return;

    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');

    // Store original styles
    const originalHtmlStyle = html.getAttribute('style') || '';
    const originalBodyStyle = body.getAttribute('style') || '';
    const originalRootStyle = root?.getAttribute('style') || '';

    // Extract and inject styles from generatedHtml
    const extractedStyles = extractStylesFromHtml(generatedHtml);
    if (extractedStyles) {
      const styleEl = document.createElement('style');
      styleEl.id = 'lp-preview-styles';
      styleEl.textContent = extractedStyles;
      document.head.appendChild(styleEl);
      injectedStyleRef.current = styleEl;
    }

    // Extract and inject font links from generatedHtml
    const fontLinks = extractLinksFromHtml(generatedHtml);
    fontLinks.forEach(href => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        if (!href.startsWith('/')) {
          link.crossOrigin = 'anonymous';
        }
        document.head.appendChild(link);
        injectedLinksRef.current.push(link);
      }
    });

    return () => {
      // Restore original styles on unmount
      html.style.cssText = originalHtmlStyle;
      body.style.cssText = originalBodyStyle;
      if (root) {
        root.style.cssText = originalRootStyle;
      }

      // Remove injected style
      if (injectedStyleRef.current) {
        injectedStyleRef.current.remove();
        injectedStyleRef.current = null;
      }

      // Remove injected links
      injectedLinksRef.current.forEach(link => link.remove());
      injectedLinksRef.current = [];
    };
  }, [generatedHtml]);

  useEffect(() => {
    const fetchLandingPageData = async () => {
      try {
        if (name) {
          // Use PageforgeApi to fetch the data
          const result = await pageforgeApi.getJsonFromFirestore(name);
          setLandingPageData(result.landingPageData as LandingPageData);
          if (result.generatedHtml) {
            setGeneratedHtml(result.generatedHtml);
          }
        } else {
          // Fallback: load the default configuration via PageforgeApi
          const result = await pageforgeApi.getJsonFromFirestore();
          if (result.landingPageData) {
            setLandingPageData(result.landingPageData);
            if (result.generatedHtml) {
              setGeneratedHtml(result.generatedHtml);
            }
          } else {
            throw new Error('No configurations available');
          }
        }
      } catch (err) {
        console.warn('Failed to fetch unified landing page:', err);
        setLandingPageData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingPageData();
  }, [name]);

  // Ensure the selected font is actually loaded on the live/previewed page
  useEffect(() => {
    const cssValue = landingPageData?.settings?.theme?.fontFamily || landingPageData?.settings?.theme?.headingFontFamily;
    if (!cssValue || typeof cssValue !== 'string') return;

    // Extract primary family from CSS value like: "'Barlow', sans-serif" => Barlow
    let primary = cssValue.split(',')[0].trim();
    if ((primary.startsWith('"') && primary.endsWith('"')) || (primary.startsWith("'") && primary.endsWith("'"))) {
      primary = primary.slice(1, -1).trim();
    }
    if (!primary) return;

    const lower = primary.toLowerCase();
    const GENERIC_OR_SYSTEM = new Set([
      'system-ui', '-apple-system', 'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'ui-sans-serif', 'ui-serif', 'ui-monospace', 'ui-rounded', 'emoji', 'math', 'fangsong',
      'arial', 'helvetica', 'georgia', 'times new roman', 'segoe ui', 'courier new'
    ]);
    if (GENERIC_OR_SYSTEM.has(lower)) return; // no external font needed

    // Resolve href via presets (handles local CSS like Motiva Sans) or Google Fonts css2 URL
    let href: string | undefined = (FONT_IMPORTS as Record<string, string | undefined>)[primary];
    if (!href) {
      const familyParam = primary.replace(/\s+/g, '+');
      const WEIGHTS = '300;400;500;600;700;800';
      href = `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${WEIGHTS}&display=swap`;
    }

    const id = `lp-font-${primary.replace(/[^a-zA-Z0-9]/g, '-')}`;
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = href;

      if (!href.startsWith('/')) {
        // Google Fonts: add preconnect and CORS
        link.crossOrigin = 'anonymous';
        if (!document.querySelector('link[href="https://fonts.gstatic.com"]')) {
          const pre = document.createElement('link');
          pre.rel = 'preconnect';
          pre.href = 'https://fonts.gstatic.com';
          pre.crossOrigin = 'anonymous';
          document.head.appendChild(pre);
        }
      }
      document.head.appendChild(link);
    }
  }, [landingPageData?.settings?.theme?.fontFamily, landingPageData?.settings?.theme?.headingFontFamily]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!landingPageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Landing Page Data Available</h1>
          <p className="text-gray-600">Unable to load landing page configuration.</p>
        </div>
      </div>
    );
  }

  const metadata = (landingPageData as any)?.metadata;
  const preset = metadata?.preset;

  if (preset === 'full-content') {
    return <JsonLandingFullContent content={landingPageData} />;
  }

  if (preset === 'basic' || preset === 'widget') {
    return <JsonLandingPhone content={landingPageData} />;
  }

  return <JsonLanding content={landingPageData} />;
}
