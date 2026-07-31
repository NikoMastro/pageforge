import React, { useState, useEffect, useRef } from 'react';
import {
  Navbar,
  Hero,
  Footer,
  Button,
  WidgetFull,
  SteamWidgetCropBuy,
  SteamWidgetCropInstall,
  SteamWidgetCropWishlist,
  BackgroundMedia,
} from '..';
import type {
  LandingPageData,
  Section
} from '../types';

interface JsonLandingPhoneProps {
  content: LandingPageData;
  isPreview?: boolean;
}

const JsonLandingPhone: React.FC<JsonLandingPhoneProps> = ({ content, isPreview = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layoutMode, setLayoutMode] = useState<'desktop' | 'phone'>('desktop');

  useEffect(() => {
    const checkLayoutMode = () => {
      const containerWidth = containerRef.current?.offsetWidth;
      const width = containerWidth && containerWidth > 0 ? containerWidth : window.innerWidth;
      setLayoutMode(width < 768 ? 'phone' : 'desktop'); // Use md breakpoint (768px)
    };

    checkLayoutMode();

    const resizeObserver = new ResizeObserver(checkLayoutMode);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', checkLayoutMode);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', checkLayoutMode);
    };
  }, []);

  if (!content || !content.sections || !Array.isArray(content.sections)) {
    return (
      <div className="error-message p-4 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Content</h2>
        <p className="text-gray-600">Invalid or missing content structure.</p>
      </div>
    );
  }

  // Find sections by type
  const navbarSection = content.sections.find((section: Section) => section.type === "navbar");
  const heroSection = content.sections.find((section: Section) => section.type === "hero");
  const footerSection = content.sections.find((section: Section) => section.type === "footer");
  const backgroundSection = content.sections.find((section: Section) => section.type === "background");
  const buttonSection = content.sections.find((section: Section) => section.type === "button");
  const widgetSection = content.sections.find((section: Section) => section.type === "widget");

  // Set default display status to true if not specified
  const navbarProps = {
    ...navbarSection?.props,
    display: navbarSection?.props?.display !== false
  };

  const heroProps = {
    ...heroSection?.props,
    display: heroSection?.props?.display !== false
  };

  const footerProps = {
    ...footerSection?.props,
    display: footerSection?.props?.display !== false
  };

  const buttonProps = {
    ...buttonSection?.props,
    display: buttonSection?.props?.display !== false
  };

  const widgetProps = {
    ...widgetSection?.props,
    display: widgetSection?.props?.display !== false
  };

  // For phone layout: prefer phoneSrc, fallback to desktop src
  const phoneBackgroundUrl = (backgroundSection as any)?.props?.phoneSrc;
  const desktopBackgroundUrl = backgroundSection?.props?.src;
  const shouldDisplayBackground = backgroundSection?.props?.display !== false;

  const computeWidgetMinHeight = (props: any): number | undefined => {
    if (!props) return undefined;
    if (props.type === 'full') return props.height || 190;
    const scale = props.scale || 1;
    return Math.round(34 * scale);
  };

  const resolveAlignClasses = (props: any): { justify: string; items: string } => {
    const ax = props?.alignX || 'center';
    const ay = props?.alignY || 'middle';
    const justify = ax === 'left' ? 'justify-start' : ax === 'right' ? 'justify-end' : 'justify-center';
    const items = ay === 'top' ? 'items-start' : 'items-center';
    return { justify, items };
  };

  const isHeroEmpty = (
    (!heroProps?.heading || String(heroProps.heading).trim() === '') &&
    (!heroProps?.subheading || String(heroProps.subheading).trim() === '')
  );

  return (
    <div
      ref={containerRef}
      className={`w-full relative ${shouldDisplayBackground ? 'bg-transparent' : 'bg-[#111924]'}`}
      style={!isPreview ? { WebkitTapHighlightColor: 'transparent' } : undefined}
    >
      {/* Responsive backgrounds: separate for phone and desktop */}
      {shouldDisplayBackground && (
        <>
          {phoneBackgroundUrl && (
            <BackgroundMedia
              src={phoneBackgroundUrl}
              lazy
              autoPlay
              loop
              muted
              className="sm:hidden z-0"
            />
          )}
          {desktopBackgroundUrl && (
            <BackgroundMedia
              src={desktopBackgroundUrl}
              lazy
              autoPlay
              loop
              muted
              className={phoneBackgroundUrl ? 'hidden sm:block z-0' : 'z-0'}
            />
          )}
        </>
      )}

      {/* Hero Section: Navbar + Content + CTA - takes full viewport height */}
      {/* Using 100dvh for mobile browsers with dynamic address bars (fallback to 100vh) */}
      <div
        className="relative z-10 flex flex-col w-full"
        style={{
          height: isPreview ? '100%' : '100dvh',
          minHeight: isPreview ? '100%' : '100dvh',
          paddingTop: 'env(safe-area-inset-top)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)'
        }}
      >
        {/* Navbar - at top */}
        <div className="px-4 shrink-0">
          {navbarSection && navbarProps.display && <Navbar {...navbarProps} layout={layoutMode} />}
        </div>

        {/* Main content area - vertically centered, takes remaining space */}
        <div className="flex-1 w-full flex flex-col justify-center items-center px-4">
          {/* Hero section */}
          {heroSection && heroProps.display && (
            <div className={isHeroEmpty ? 'w-full min-h-[30vh]' : 'w-full'}>
              <Hero {...heroProps} layout="phone" />
            </div>
          )}

          {/* Button - phone-optimized with larger touch target */}
          {buttonSection && buttonProps.display && (
            <div className={`flex justify-center w-full ${isHeroEmpty ? 'mt-8 mb-4' : 'my-4'}`}>
              <Button {...buttonProps} layout="phone" />
            </div>
          )}

          {/* Widget - phone-optimized */}
          {widgetSection && widgetProps.display && widgetProps.enabled && widgetProps.gameId && (
            (() => {
              const { justify, items } = resolveAlignClasses(widgetProps);
              const minH = computeWidgetMinHeight(widgetProps);
              const px = widgetProps.positionX ?? 0;
              const py = widgetProps.positionY ?? 0;
              const containerStyle = {
                ...(minH ? { minHeight: `${minH}px` } : {}),
                transform: `translate(${px}px, ${py}px)`
              } as React.CSSProperties;
              const widgetWrapperStyle = {
                minWidth: 'fit-content',
                display: 'flex',
                lineHeight: 0,
                borderRadius: widgetProps.type === 'full' ? '16px' : '8px',
                ...(widgetProps.shadowIntensity && widgetProps.shadowIntensity > 0
                  ? { boxShadow: `0 4px 14px rgba(0,0,0,${widgetProps.shadowIntensity})` }
                  : {})
              } as React.CSSProperties;
              return (
                <div className={`${isHeroEmpty ? 'mt-8 mb-4' : 'my-4'} w-full flex ${justify} ${items}`} style={containerStyle}>
                  <div className="flex-shrink-0" style={widgetWrapperStyle}>
                    {widgetProps.type === 'full' ? (
                      <WidgetFull
                        gameId={widgetProps.gameId}
                        width={widgetProps.width}
                        height={widgetProps.height}
                        className="steam-widget"
                        layout="phone"
                      />
                    ) : widgetProps.type === 'buy' ? (
                      <SteamWidgetCropBuy
                        key={`widget-buy-${widgetProps.gameId}-${widgetProps.language || 'auto'}`}
                        gameId={widgetProps.gameId}
                        scale={widgetProps.scale || 1}
                        className="steam-widget-crop"
                        utm={widgetProps.utm}
                      />
                    ) : widgetProps.type === 'install' ? (
                      <SteamWidgetCropInstall
                        key={`widget-install-${widgetProps.gameId}-${widgetProps.language || 'auto'}`}
                        gameId={widgetProps.gameId}
                        scale={widgetProps.scale || 1}
                        className="steam-widget-crop"
                        utm={widgetProps.utm}
                      />
                    ) : widgetProps.type === 'wishlist' ? (
                      <SteamWidgetCropWishlist
                        key={`widget-wishlist-${widgetProps.gameId}-${widgetProps.language || 'auto'}`}
                        gameId={widgetProps.gameId}
                        scale={widgetProps.scale || 1}
                        className="steam-widget-crop"
                        utm={widgetProps.utm}
                      />
                    ) : (
                      <WidgetFull
                        gameId={widgetProps.gameId}
                        width={widgetProps.width}
                        height={widgetProps.height}
                        className="steam-widget"
                        layout="phone"
                      />
                    )}
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>

      {/* Footer Section - separate section below hero, must scroll to see */}
      {footerSection && footerProps.display && (
        <div
          className="relative z-10 w-full px-4"
          style={{
            paddingBottom: 'env(safe-area-inset-bottom)',
            paddingLeft: 'env(safe-area-inset-left)',
            paddingRight: 'env(safe-area-inset-right)'
          }}
        >
          <Footer {...footerProps} />
        </div>
      )}
    </div>
  );
};

export default JsonLandingPhone;
