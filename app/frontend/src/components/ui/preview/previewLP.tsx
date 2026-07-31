import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { LandingPageData } from '../../../types';
import { JsonLanding, JsonLandingFullContent, JsonLandingPhone } from '../../landingpagesconfig';
import { FONT_IMPORTS } from '../../../config/app';

interface PreviewViewProps {
  data: LandingPageData;
  editableJson: string;
}

const PreviewView: React.FC<PreviewViewProps> = ({
  data,
  editableJson
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [frameDoc, setFrameDoc] = useState<Document | null>(null);
  const [scale, setScale] = useState(1);

  // Phone device presets
  const PHONE_PRESETS = {
    // iPhones
    'iPhone SE': { width: 375, height: 667 },
    'iPhone 8': { width: 375, height: 667 },
    'iPhone 8 Plus': { width: 414, height: 736 },
    'iPhone X': { width: 375, height: 812 },
    'iPhone XR': { width: 414, height: 896 },
    'iPhone XS Max': { width: 414, height: 896 },
    'iPhone 11': { width: 414, height: 896 },
    'iPhone 11 Pro': { width: 375, height: 812 },
    'iPhone 11 Pro Max': { width: 414, height: 896 },
    'iPhone 12 mini': { width: 375, height: 812 },
    'iPhone 12': { width: 390, height: 844 },
    'iPhone 12 Pro': { width: 390, height: 844 },
    'iPhone 12 Pro Max': { width: 428, height: 926 },
    'iPhone 13 mini': { width: 375, height: 812 },
    'iPhone 13': { width: 390, height: 844 },
    'iPhone 13 Pro': { width: 390, height: 844 },
    'iPhone 13 Pro Max': { width: 428, height: 926 },
    'iPhone 14': { width: 390, height: 844 },
    'iPhone 14 Plus': { width: 428, height: 926 },
    'iPhone 14 Pro': { width: 393, height: 852 },
    'iPhone 14 Pro Max': { width: 430, height: 932 },
    'iPhone 15': { width: 393, height: 852 },
    'iPhone 15 Plus': { width: 430, height: 932 },
    'iPhone 15 Pro': { width: 393, height: 852 },
    'iPhone 15 Pro Max': { width: 430, height: 932 },
    'iPhone 16': { width: 393, height: 852 },
    'iPhone 16 Plus': { width: 430, height: 932 },
    'iPhone 16 Pro': { width: 402, height: 874 },
    'iPhone 16 Pro Max': { width: 440, height: 956 },
    // Samsung
    'Galaxy S21': { width: 360, height: 800 },
    'Galaxy S21+': { width: 384, height: 854 },
    'Galaxy S21 Ultra': { width: 384, height: 854 },
    'Galaxy S22': { width: 360, height: 780 },
    'Galaxy S22+': { width: 384, height: 832 },
    'Galaxy S22 Ultra': { width: 384, height: 848 },
    'Galaxy S23': { width: 360, height: 780 },
    'Galaxy S23+': { width: 384, height: 832 },
    'Galaxy S23 Ultra': { width: 384, height: 824 },
    'Galaxy S24': { width: 360, height: 780 },
    'Galaxy S24+': { width: 384, height: 832 },
    'Galaxy S24 Ultra': { width: 384, height: 824 },
    'Galaxy Z Fold5': { width: 373, height: 839 },
    'Galaxy Z Flip5': { width: 360, height: 748 },
    'Galaxy A54': { width: 360, height: 800 },
  } as const;

  type PhonePresetKey = keyof typeof PHONE_PRESETS;

  // Desktop/screen presets
  const PRESETS = {
    macbookPro: { width: 1728, height: 1117 },
    desktop: { width: 1727, height: 1440 },
    inch27: { width: 2560, height: 1440 }
  } as const;

  type PresetKey = keyof typeof PRESETS | 'phone';
  const [selectedPreset, setSelectedPreset] = useState<PresetKey>('macbookPro');
  const [selectedPhoneModel, setSelectedPhoneModel] = useState<PhonePresetKey>('iPhone 15 Pro Max');
  const [isPhoneDropdownOpen, setIsPhoneDropdownOpen] = useState(false);
  const phoneDropdownRef = useRef<HTMLDivElement>(null);
  const [contentDimensions, setContentDimensions] = useState<{ width: number; height: number }>({
    width: PRESETS.macbookPro.width,
    height: PRESETS.macbookPro.height
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(event.target as Node)) {
        setIsPhoneDropdownOpen(false);
      }
    };

    if (isPhoneDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPhoneDropdownOpen]);

  // Get current data for preview (use edited data if valid, otherwise original)
  const getCurrentData = (): LandingPageData => {
    try {
      if (editableJson) {
        const parsedData = JSON.parse(editableJson);
        // Ensure the parsed data has the required structure
        if (parsedData && parsedData.sections && Array.isArray(parsedData.sections)) {
          return parsedData;
        }
      }
    } catch {
      // JSON parsing failed, continue to fallback
    }

    // Fallback to original data, with safety check
    if (data && data.sections && Array.isArray(data.sections)) {
      return data;
    }

    // Ultimate fallback - return a basic structure to prevent crashes
    return {
      metadata: {
        title: "Error Loading Content",
        description: "Unable to load content data",
        author: "",
        version: "1.0.0",
        lastUpdated: "",
        keywords: [],
        thumbnail: ""
      },
      settings: {
        theme: {},
        layout: {},
        responsive: {},
        animations: {}
      },
      sections: []
    };
  };

  const currentData = getCurrentData();

  // Calculate scale to fit content in container
  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const baseWidth = contentDimensions.width;
      const baseHeight = contentDimensions.height;

      // Scale to fit while preserving aspect ratio, but don't exceed 1:1 scale
      const scaleX = containerWidth / baseWidth;
      const scaleY = containerHeight / baseHeight;
      const newScale = Math.min(scaleX, scaleY, 1);
      setScale(newScale);
    };

    calculateScale();

    // Recalculate on container resize
    const resizeObserver = new ResizeObserver(calculateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [contentDimensions.width, contentDimensions.height]); // Re-run when preset dimensions change

  const handlePresetChange = (preset: PresetKey) => {
    setSelectedPreset(preset);
    setIsPhoneDropdownOpen(false);
    if (preset === 'phone') {
      const dims = PHONE_PRESETS[selectedPhoneModel];
      setContentDimensions({ width: dims.width, height: dims.height });
    } else {
      const dims = PRESETS[preset];
      setContentDimensions({ width: dims.width, height: dims.height });
    }
  };

  const handlePhoneModelChange = (model: PhonePresetKey) => {
    setSelectedPhoneModel(model);
    setSelectedPreset('phone');
    const dims = PHONE_PRESETS[model];
    setContentDimensions({ width: dims.width, height: dims.height });
    setIsPhoneDropdownOpen(false);
  };

  // Setup iframe document and clone styles for proper Tailwind/responsive behavior
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const initializeFrame = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;

      doc.documentElement.innerHTML = `
        <!doctype html>
        <html>
          <head></head>
          <body><div id="root"></div></body>
        </html>
      `.trim();

      const parentHeadNodes = Array.from(document.head.querySelectorAll('link[rel="stylesheet"], style'));
      parentHeadNodes.forEach((node) => {
        try {
          doc.head.appendChild(node.cloneNode(true));
        } catch { }
      });

      setFrameDoc(doc);
    };

    if (iframe.contentDocument?.readyState === 'complete' || iframe.contentDocument?.readyState === 'interactive') {
      initializeFrame();
    } else {
      const onLoad = () => initializeFrame();
      iframe.addEventListener('load', onLoad, { passive: true });
      return () => iframe.removeEventListener('load', onLoad);
    }
  }, []);

  useEffect(() => {
    if (!frameDoc) return;

    // Check if this is a phone layout - don't dynamically resize for phone layouts
    // to avoid feedback loop with min-h-screen
    const metadata = (currentData as any)?.metadata;
    const layoutMode = metadata?.layoutMode;
    const isPhoneLayout = layoutMode === 'phone';

    const measure = () => {
      const presetDims = selectedPreset === 'phone'
        ? PHONE_PRESETS[selectedPhoneModel]
        : PRESETS[selectedPreset];
      const presetHeight = presetDims.height;

      // For phone layouts, always use the preset height to avoid feedback loop
      // with viewport-relative units like min-h-screen
      if (isPhoneLayout) {
        setContentDimensions((prev) => {
          const next = { width: presetDims.width, height: presetHeight };
          if (prev.width === next.width && prev.height === next.height) return prev;
          return next;
        });
        return;
      }

      const measured = Math.max(
        frameDoc.body?.scrollHeight || 0,
        frameDoc.documentElement?.scrollHeight || 0,
        presetHeight
      );
      const nextHeight = Math.max(presetHeight, measured);
      setContentDimensions((prev) => {
        const next = { width: presetDims.width, height: nextHeight };
        if (prev.width === next.width && prev.height === next.height) return prev;
        return next;
      });
    };

    const rafId = requestAnimationFrame(measure);
    const timeoutId = setTimeout(measure, 150);

    // Don't use ResizeObserver for phone layouts to avoid feedback loop
    let ro: ResizeObserver | null = null;
    if (!isPhoneLayout) {
      ro = new ResizeObserver(() => measure());
      ro.observe(frameDoc.documentElement);
      ro.observe(frameDoc.body);
    }

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
      ro?.disconnect();
    };
  }, [frameDoc, selectedPreset, selectedPhoneModel, currentData]);
  // Ensure the selected font is actually loaded on the preview (matching the landing page viewer)
  useEffect(() => {
    const cssValue = currentData?.settings?.theme?.fontFamily || currentData?.settings?.theme?.headingFontFamily;
    if (!cssValue || typeof cssValue !== 'string') return;

    let primary = cssValue.split(',')[0].trim();
    if ((primary.startsWith('"') && primary.endsWith('"')) || (primary.startsWith("'") && primary.endsWith("'"))) {
      primary = primary.slice(1, -1).trim();
    }
    if (!primary) return;

    const lower = primary.toLowerCase();
    const GENERIC_OR_SYSTEM = new Set([
      'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'ui-sans-serif', 'ui-serif', 'ui-monospace', 'ui-rounded', 'emoji', 'math', 'fangsong',
      'arial', 'helvetica', 'georgia', 'times new roman', 'segoe ui', 'courier new',
      'system-ui', '-apple-system', 'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'ui-sans-serif', 'ui-serif', 'ui-monospace', 'ui-rounded', 'emoji', 'math', 'fangsong',
      'arial', 'helvetica', 'georgia', 'times new roman', 'segoe ui', 'courier new'
    ]);
    if (GENERIC_OR_SYSTEM.has(lower)) return;

    let href: string | undefined = (FONT_IMPORTS as Record<string, string | undefined>)[primary];
    if (!href) {
      const familyParam = primary.replace(/\s+/g, '+');
      const WEIGHTS = '300;400;500;600;700;800';
      href = `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${WEIGHTS}&display=swap`;
    }

    // Only add if not already present
    const existingLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    const alreadyLoaded = existingLinks.some((link) => {
      const linkHref = (link as HTMLLinkElement).href;
      return linkHref.includes(href!) || linkHref.includes(primary.replace(/\s+/g, '+'));
    });

    if (!alreadyLoaded) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;

      if (href.includes('fonts.googleapis.com')) {
        const existingPreconnects = Array.from(document.querySelectorAll('link[rel="preconnect"]'));
        const hasGoogleFontsPreconnect = existingPreconnects.some(
          (pre) => (pre as HTMLLinkElement).href === 'https://fonts.googleapis.com'
        );
        const hasGstaticPreconnect = existingPreconnects.some(
          (pre) => (pre as HTMLLinkElement).href === 'https://fonts.gstatic.com'
        );

        if (!hasGoogleFontsPreconnect) {
          const pre = document.createElement('link');
          pre.rel = 'preconnect';
          pre.href = 'https://fonts.googleapis.com';
          document.head.appendChild(pre);
        }
        if (!hasGstaticPreconnect) {
          const pre = document.createElement('link');
          pre.rel = 'preconnect';
          pre.href = 'https://fonts.gstatic.com';
          pre.crossOrigin = 'anonymous';
          document.head.appendChild(pre);
        }
      }
      document.head.appendChild(link);
    }
  }, [currentData?.settings?.theme?.fontFamily, currentData?.settings?.theme?.headingFontFamily]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden flex items-center justify-center"
    >
      {/* Top toolbar for presets (shifted left to avoid covering phone preview) */}
      <div className="absolute top-2 left-4 md:left-2 z-10 flex items-center gap-2 bg-white/70 dark:bg-neutral-900/70 backdrop-blur px-2 py-1 rounded-md shadow border border-black/10 dark:border-white/10">
        {/* Phone dropdown */}
        <div className="relative" ref={phoneDropdownRef}>
          <button
            onClick={() => setIsPhoneDropdownOpen(!isPhoneDropdownOpen)}
            className={[
              'px-3 py-1 rounded text-sm border transition-colors flex items-center gap-1',
              selectedPreset === 'phone'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white/80 dark:bg-neutral-800/80 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-neutral-600 hover:bg-blue-50 dark:hover:bg-neutral-700'
            ].join(' ')}
            aria-expanded={isPhoneDropdownOpen}
          >
            {selectedPreset === 'phone' ? selectedPhoneModel : 'Phone'}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isPhoneDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 max-h-80 overflow-y-auto bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-md shadow-lg z-20">
              <div className="py-1">
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-neutral-700">iPhones</div>
                {Object.entries(PHONE_PRESETS)
                  .filter(([name]) => name.startsWith('iPhone'))
                  .map(([name, dims]) => (
                    <button
                      key={name}
                      onClick={() => handlePhoneModelChange(name as PhonePresetKey)}
                      className={[
                        'w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 dark:hover:bg-neutral-700 flex justify-between items-center',
                        selectedPhoneModel === name && selectedPreset === 'phone'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-800 dark:text-gray-200'
                      ].join(' ')}
                    >
                      <span>{name}</span>
                      <span className="text-xs text-gray-400">{dims.width}×{dims.height}</span>
                    </button>
                  ))}
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-neutral-700">Samsung</div>
                {Object.entries(PHONE_PRESETS)
                  .filter(([name]) => name.startsWith('Galaxy'))
                  .map(([name, dims]) => (
                    <button
                      key={name}
                      onClick={() => handlePhoneModelChange(name as PhonePresetKey)}
                      className={[
                        'w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 dark:hover:bg-neutral-700 flex justify-between items-center',
                        selectedPhoneModel === name && selectedPreset === 'phone'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-800 dark:text-gray-200'
                      ].join(' ')}
                    >
                      <span>{name}</span>
                      <span className="text-xs text-gray-400">{dims.width}×{dims.height}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
        {/* Desktop presets */}
        {([
          ['macbookPro', 'Macbook'],
          ['desktop', 'Desktop'],
          ['inch27', '27']
        ] as Array<[Exclude<PresetKey, 'phone'>, string]>).map(([key, label]) => (
          <button
            key={key}
            onClick={() => handlePresetChange(key)}
            className={[
              'px-3 py-1 rounded text-sm border transition-colors',
              selectedPreset === key
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white/80 dark:bg-neutral-800/80 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-neutral-600 hover:bg-blue-50 dark:hover:bg-neutral-700'
            ].join(' ')}
            aria-pressed={selectedPreset === key}
          >
            {label}
          </button>
        ))}
      </div>
      {/* Container that holds the scaled content */}
      <div className="relative">
        {/* Scaled content container */}
        <div
          ref={contentRef}
          className="overflow-hidden"
          style={{
            width: `${contentDimensions.width}px`,
            height: `${contentDimensions.height}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'center',
          }}
        >
          <iframe
            ref={iframeRef}
            title="preview-frame"
            style={{
              width: `${contentDimensions.width}px`,
              height: `${contentDimensions.height}px`,
              border: 'none',
              display: 'block'
            }}
          />
          {frameDoc && createPortal(
            (() => {
              const metadata = (currentData as any)?.metadata;
              const preset = metadata?.preset;

              if (preset === 'full-content') {
                return <JsonLandingFullContent content={currentData} isPreview={true} />;
              }

              if (preset === 'basic' || preset === 'widget') {
                return <JsonLandingPhone content={currentData} isPreview={true} />;
              }

              return <JsonLanding content={currentData} isPreview={true} />;
            })(),
            frameDoc.getElementById('root') as HTMLElement
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewView;
