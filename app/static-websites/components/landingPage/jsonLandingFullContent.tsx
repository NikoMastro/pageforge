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
  LayoutCarousel,
  LayoutSteamReviews,
  CookiesBanner,
  BackgroundMedia,
  VideoPlayer,
  TitleTxt,
  ColumnTxt,
} from '..';
import MediaShowcase from './sections/mediaShowCaseSection';
import FaqSection from './sections/faqSection';
import type {
  LandingPageData,
  Section
} from '../types';

interface JsonLandingFullContentProps {
  content: LandingPageData;
  isPreview?: boolean;
}

const JsonLandingFullContent: React.FC<JsonLandingFullContentProps> = ({ content, isPreview = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layoutMode, setLayoutMode] = useState<'desktop' | 'phone'>('desktop');

  // Detect layout mode based on container/window width
  useEffect(() => {
    const checkLayoutMode = () => {
      const containerWidth = containerRef.current?.offsetWidth;
      const width = containerWidth && containerWidth > 0 ? containerWidth : window.innerWidth;
      setLayoutMode(width < 768 ? 'phone' : 'desktop'); // Use md breakpoint (768px)
    };

    checkLayoutMode();

    // Use ResizeObserver to detect container size changes (works in iframes)
    const resizeObserver = new ResizeObserver(checkLayoutMode);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Also listen to window resize as fallback
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

  const validSections = content.sections.filter((section): section is Section =>
    section != null && typeof section === 'object' && 'type' in section
  );

  // Find sections by type
  const navbarSection = validSections.find((section: Section) => section.type === "navbar");
  const heroSection = validSections.find((section: Section) => section.type === "hero");
  const carouselSection = validSections.find((section: Section) => section.type === "carousel");
  const steamReviewsSection = validSections.find((section: Section) => section.type === "steamReviews");
  const videoPlayerSection = validSections.find((section: Section) => section.type === "videoPlayer");
  const titleTxtSection = validSections.find((section: Section) => section.type === "titleTxt");
  const columnTxtSection = validSections.find((section: Section) => section.type === "columnTxt");
  const mediaShowcaseSection = validSections.find((section: Section) => section.type === "mediaShowcase");
  const faqSection = validSections.find((section: Section) => section.type === "faq");
  const footerSection = validSections.find((section: Section) => section.type === "footer");
  const cookiesBannerSection = validSections.find((section: Section) => section.type === "cookiesBanner");
  const backgroundSection = validSections.find((section: Section) => section.type === "background");
  const buttonSection = validSections.find((section: Section) => section.type === "button");
  const widgetSection = validSections.find((section: Section) => section.type === "widget");

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

  const cookiesBannerProps = {
    ...cookiesBannerSection?.props,
    display: cookiesBannerSection?.props?.display !== false
  };

  const buttonProps = {
    ...buttonSection?.props,
    display: buttonSection?.props?.display !== false
  };

  const widgetProps = {
    ...widgetSection?.props,
    display: widgetSection?.props?.display !== false
  };

  const backgroundUrl = backgroundSection?.props?.src;
  const phoneBackgroundUrl = (backgroundSection as any)?.props?.phoneSrc;
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

  // Build array of visible content sections (screens 2+)
  const contentSections = [];

  // TitleTxt section (appears between Hero and VideoPlayer)
  if (titleTxtSection && titleTxtSection.props?.display !== false) {
    contentSections.push({
      type: 'titleTxt',
      section: titleTxtSection
    });
  }

  // VideoPlayer section
  if (videoPlayerSection && videoPlayerSection.props?.display !== false) {
    contentSections.push({
      type: 'videoPlayer',
      section: videoPlayerSection
    });
  }

  // ColumnTxt section
  if (columnTxtSection && columnTxtSection.props?.display !== false) {
    contentSections.push({
      type: 'columnTxt',
      section: columnTxtSection
    });
  }

  // MediaShowcase section (appears after columnTxt)
  if (mediaShowcaseSection && mediaShowcaseSection.props?.display !== false) {
    contentSections.push({
      type: 'mediaShowcase',
      section: mediaShowcaseSection
    });
  }

  // Carousel section (appears after MediaShowcase)
  if (carouselSection && carouselSection.props?.display !== false) {
    contentSections.push({
      type: 'carousel',
      section: carouselSection
    });
  }

  // Steam Reviews section (appears after Carousel)
  if (steamReviewsSection && steamReviewsSection.props?.display !== false) {
    contentSections.push({
      type: 'steamReviews',
      section: steamReviewsSection
    });
  }

  // FAQ section (appears after steamReviews)
  if (faqSection && faqSection.props?.display !== false) {
    contentSections.push({
      type: 'faq',
      section: faqSection,
      showFooter: true // Footer appears on the last content section
    });
  }

  // Add more sections here in the future
  // Example:
  // if (customSection && customSection.props?.display !== false) {
  //   contentSections.push({
  //     type: 'custom',
  //     section: customSection
  //   });
  // }

  const hasMoreContent = contentSections.length > 0;

  return (
    <div
      ref={containerRef}
      className={`w-full relative ${shouldDisplayBackground ? 'bg-transparent' : 'bg-[#111924]'}`}
      style={{
        ...(isPreview
          ? { height: '100vh', overflow: 'auto' }
          : { WebkitTapHighlightColor: 'transparent' }
        )
      }}
    >
      {shouldDisplayBackground && (
        <>
          {phoneBackgroundUrl && (
            <BackgroundMedia
              src={phoneBackgroundUrl}
              lazy
              pinToViewport
              autoPlay
              loop
              muted
              className="sm:hidden z-0"
            />
          )}
          {backgroundUrl && (
            <BackgroundMedia
              src={backgroundUrl}
              lazy
              pinToViewport
              autoPlay
              loop
              muted
              className={phoneBackgroundUrl ? 'hidden sm:block z-0' : 'z-0'}
            />
          )}
        </>
      )}

      {/* Screen 1: Navbar, Hero, CTA, Scroll Down */}
      <section
        className="relative z-10 w-full flex flex-col"
        style={{
          height: isPreview ? '100%' : '100dvh',
          minHeight: isPreview ? '100%' : '100dvh',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        <div className="px-4 sm:px-6 lg:px-8 shrink-0">
          {navbarSection && navbarProps.display && (
            <Navbar {...navbarProps} layout={layoutMode} />
          )}
        </div>

        <div className="flex-1 w-full flex flex-col justify-center items-center">
          {heroSection && heroProps.display && (
            <div className="w-full">
              <Hero {...heroProps} layout={layoutMode} />
            </div>
          )}

          {buttonSection && buttonProps.display && (
            <div className="flex justify-center my-4">
              <Button {...buttonProps} layout={layoutMode} />
            </div>
          )}

          {widgetSection && widgetProps.display && widgetProps.enabled && widgetProps.gameId && (
            (() => {
              const { justify, items } = resolveAlignClasses(widgetProps);
              const minH = computeWidgetMinHeight(widgetProps);
              const px = widgetProps.positionX ?? 0;
              const py = widgetProps.positionY ?? 0;
              const verticalClass = '';
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
                <div className={`my-4 w-full flex ${verticalClass} ${justify} ${items}`} style={containerStyle}>
                  <div className="flex-shrink-0" style={widgetWrapperStyle}>
                    {widgetProps.type === 'full' ? (
                      <WidgetFull
                        gameId={widgetProps.gameId}
                        width={widgetProps.width}
                        height={widgetProps.height}
                        className="steam-widget"
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
                      />
                    )}
                  </div>
                </div>
              );
            })()
          )}
        </div>

        {/* Scroll Down Indicator */}
        {hasMoreContent && (
          <div className="shrink-0 flex justify-center pb-8 mb-4 animate-bounce">
            <svg
              className="w-8 h-8 text-white opacity-80"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        )}
      </section>

      {/* Dynamic Content Sections (Screen 2+) */}
      {contentSections.map((contentSection, index) => {
        const isLastSection = index === contentSections.length - 1;
        const isVideoOrMedia = contentSection.type === 'videoPlayer' || contentSection.type === 'mediaShowcase';

        return (
          <section
            key={`content-section-${contentSection.type}-${index}`}
            className="relative z-10 w-full flex flex-col"
            style={{
              minHeight: isPreview
                ? (isVideoOrMedia ? 'auto' : '100%')
                : (isLastSection ? 'auto' : (isVideoOrMedia ? 'auto' : '100vh')),
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)'
            }}
          >
            {contentSection.type !== 'videoPlayer' && contentSection.type !== 'mediaShowcase' && (
              <div className="flex-1 flex flex-col justify-center items-center w-full">
                {contentSection.type === 'carousel' && (
                  <div className="relative w-full h-full min-h-screen">
                    {/* Background layer - absolute positioning for all background types */}
                    {(() => {
                      const bgProps = contentSection.section.props?.background;
                      if (!bgProps) return null;

                      if (bgProps.type === 'video' && bgProps.video?.url) {
                        return (
                          <div className="absolute inset-0 w-full h-full overflow-hidden">
                            <video
                              className="absolute inset-0 w-full h-full object-cover"
                              src={bgProps.video.url}
                              autoPlay
                              loop
                              muted
                              playsInline
                            />
                          </div>
                        );
                      }

                      if (bgProps.type === 'image' && bgProps.image?.url) {
                        return (
                          <div
                            className="absolute inset-0 w-full h-full"
                            style={{
                              backgroundImage: `url(${bgProps.image.url})`,
                              backgroundSize: 'cover',
                              backgroundPosition: bgProps.image.position || 'center',
                            }}
                          />
                        );
                      }

                      if (bgProps.type === 'solid') {
                        return (
                          <div
                            className="absolute inset-0 w-full h-full"
                            style={{
                              backgroundColor: bgProps.color || '#000000',
                            }}
                          />
                        );
                      }

                      if (bgProps.type === 'gradient' && bgProps.gradient) {
                        const { type, colors, direction } = bgProps.gradient;
                        const gradientDirection = direction || (type === 'linear' ? '180deg' : 'circle');
                        const colorStops = colors.join(', ');
                        const gradientStyle = type === 'linear'
                          ? `linear-gradient(${gradientDirection}, ${colorStops})`
                          : `radial-gradient(${gradientDirection}, ${colorStops})`;

                        return (
                          <div
                            className="absolute inset-0 w-full h-full"
                            style={{
                              background: gradientStyle,
                            }}
                          />
                        );
                      }

                      return null;
                    })()}

                    {/* Content layer - centered in viewport */}
                    <div className="relative z-10 w-full min-h-screen flex flex-col justify-center items-center">
                      <div className={`w-full flex flex-col items-center px-4 ${(contentSection.section.props?.button?.display || contentSection.section.props?.widget?.display)
                        ? 'py-8'
                        : ''
                        }`}>
                        <div className="w-full flex items-center justify-center">
                          <LayoutCarousel
                            images={contentSection.section.props?.images || []}
                            autoPlay={contentSection.section.props?.autoPlay}
                            autoScrollInterval={contentSection.section.props?.autoScrollInterval}
                            showDots={contentSection.section.props?.showDots}
                            showArrows={contentSection.section.props?.showArrows}
                            orientation={contentSection.section.props?.orientation || 'horizontal'}
                            {...(contentSection.section.props?.height ? { height: contentSection.section.props.height } : {})}
                            {...(contentSection.section.props?.width ? { width: contentSection.section.props.width } : {})}
                            {...(contentSection.section.props?.imageHeight ? { imageHeight: contentSection.section.props.imageHeight } : {})}
                            {...(contentSection.section.props?.imageWidth ? { imageWidth: contentSection.section.props.imageWidth } : {})}
                            display={contentSection.section.props?.display !== false}
                          />
                        </div>
                        {contentSection.section.props?.button?.display && (
                          <div className="flex-shrink-0 mt-6">
                            <Button
                              text={contentSection.section.props.button.text}
                              onClick={contentSection.section.props.button.onClick}
                              buttonSize={contentSection.section.props.button.buttonSize}
                              backgroundColor={contentSection.section.props.button.backgroundColor}
                              hoverBackgroundColor={contentSection.section.props.button.hoverBackgroundColor}
                              font={contentSection.section.props.button.font}
                              border={contentSection.section.props.button.border}
                              padding={contentSection.section.props.button.padding}
                              margin={contentSection.section.props.button.margin}
                              shadow={contentSection.section.props.button.shadow}
                              hoverShadow={contentSection.section.props.button.hoverShadow}
                              transition={contentSection.section.props.button.transition}
                              steamIcon={contentSection.section.props.button.steamIcon}
                              image={contentSection.section.props.button.image}
                            />
                          </div>
                        )}
                        {contentSection.section.props?.widget?.display && contentSection.section.props.widget.type === 'buy' && (
                          <div className="flex-shrink-0">
                            <SteamWidgetCropBuy
                              gameId={contentSection.section.props.widget.gameId}
                              scale={contentSection.section.props.widget.scale || 1}
                              utm={contentSection.section.props.widget.utm}
                            />
                          </div>
                        )}
                        {contentSection.section.props?.widget?.display && contentSection.section.props.widget.type === 'install' && (
                          <div className="flex-shrink-0">
                            <SteamWidgetCropInstall
                              gameId={contentSection.section.props.widget.gameId}
                              scale={contentSection.section.props.widget.scale || 1}
                              utm={contentSection.section.props.widget.utm}
                            />
                          </div>
                        )}
                        {contentSection.section.props?.widget?.display && contentSection.section.props.widget.type === 'wishlist' && (
                          <div className="flex-shrink-0">
                            <SteamWidgetCropWishlist
                              gameId={contentSection.section.props.widget.gameId}
                              scale={contentSection.section.props.widget.scale || 1}
                              utm={contentSection.section.props.widget.utm}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {contentSection.type === 'titleTxt' && (
                  <TitleTxt
                    title={contentSection.section.props?.title}
                    subtext={contentSection.section.props?.subtext || contentSection.section.props?.subtitle}
                    background={contentSection.section.props?.background}
                    backgroundColor={contentSection.section.props?.backgroundColor}
                    titleColor={contentSection.section.props?.titleColor}
                    subtextColor={contentSection.section.props?.subtextColor}
                    titleFontSize={contentSection.section.props?.titleFontSize}
                    subtextFontSize={contentSection.section.props?.subtextFontSize}
                    fontFamily={contentSection.section.props?.fontFamily}
                    fontWeight={contentSection.section.props?.fontWeight}
                    display={contentSection.section.props?.display !== false}
                  >
                    {contentSection.section.props?.button?.display && (
                      <Button
                        text={contentSection.section.props.button.text}
                        onClick={contentSection.section.props.button.onClick}
                        buttonSize={contentSection.section.props.button.buttonSize}
                        backgroundColor={contentSection.section.props.button.backgroundColor}
                        hoverBackgroundColor={contentSection.section.props.button.hoverBackgroundColor}
                        font={contentSection.section.props.button.font}
                        border={contentSection.section.props.button.border}
                        padding={contentSection.section.props.button.padding}
                        margin={contentSection.section.props.button.margin}
                        shadow={contentSection.section.props.button.shadow}
                        hoverShadow={contentSection.section.props.button.hoverShadow}
                        transition={contentSection.section.props.button.transition}
                        steamIcon={contentSection.section.props.button.steamIcon}
                        image={contentSection.section.props.button.image}
                      />
                    )}
                    {contentSection.section.props?.widget?.display && contentSection.section.props.widget.type === 'buy' && (
                      <SteamWidgetCropBuy
                        gameId={contentSection.section.props.widget.gameId}
                        scale={contentSection.section.props.widget.scale || 1}
                        utm={contentSection.section.props.widget.utm}
                      />
                    )}
                    {contentSection.section.props?.widget?.display && contentSection.section.props.widget.type === 'install' && (
                      <SteamWidgetCropInstall
                        gameId={contentSection.section.props.widget.gameId}
                        scale={contentSection.section.props.widget.scale || 1}
                        utm={contentSection.section.props.widget.utm}
                      />
                    )}
                    {contentSection.section.props?.widget?.display && contentSection.section.props.widget.type === 'wishlist' && (
                      <SteamWidgetCropWishlist
                        gameId={contentSection.section.props.widget.gameId}
                        scale={contentSection.section.props.widget.scale || 1}
                        utm={contentSection.section.props.widget.utm}
                      />
                    )}
                  </TitleTxt>
                )}

                {contentSection.type === 'columnTxt' && (
                  <div className="relative w-full min-h-screen overflow-hidden">
                    {/* Background layer - fixed positioning to prevent stretching */}
                    {(() => {
                      const bgProps = contentSection.section.props?.background;
                      if (!bgProps) return null;

                      if (bgProps.type === 'video' && bgProps.video?.url) {
                        return (
                          <div className="absolute inset-0 w-full h-full overflow-hidden">
                            <video
                              className="absolute inset-0 w-full h-full object-cover"
                              src={bgProps.video.url}
                              autoPlay
                              loop
                              muted
                              playsInline
                            />
                          </div>
                        );
                      }

                      if (bgProps.type === 'image' && bgProps.image?.url) {
                        return (
                          <div
                            className="absolute inset-0 w-full h-full"
                            style={{
                              backgroundImage: `url(${bgProps.image.url})`,
                              backgroundSize: 'cover',
                              backgroundPosition: bgProps.image.position || 'center',
                              backgroundAttachment: 'scroll',
                            }}
                          />
                        );
                      }

                      if (bgProps.type === 'solid') {
                        return (
                          <div
                            className="absolute inset-0 w-full h-full"
                            style={{
                              backgroundColor: bgProps.color || contentSection.section.props?.backgroundColor || '#ffffff',
                            }}
                          />
                        );
                      }

                      if (bgProps.type === 'gradient' && bgProps.gradient) {
                        const { type, colors, direction } = bgProps.gradient;
                        const gradientDirection = direction || (type === 'linear' ? '180deg' : 'circle');
                        const colorStops = colors.join(', ');
                        const gradientStyle = type === 'linear'
                          ? `linear-gradient(${gradientDirection}, ${colorStops})`
                          : `radial-gradient(${gradientDirection}, ${colorStops})`;

                        return (
                          <div
                            className="absolute inset-0 w-full h-full"
                            style={{
                              background: gradientStyle,
                            }}
                          />
                        );
                      }

                      return null;
                    })()}

                    {/* Content layer - relative positioning on top */}
                    <div className="relative z-10 w-full h-full flex flex-col">
                      <div className={`w-full h-full flex flex-col items-center px-4 sm:px-6 lg:px-8 gap-6 md:gap-8 ${(contentSection.section.props?.button?.display || contentSection.section.props?.widget?.display)
                        ? 'justify-between py-12 md:py-16 lg:py-20'
                        : 'justify-center py-12 md:py-16 lg:py-20'
                        }`}>
                        <div className={`w-full flex items-center justify-center ${(contentSection.section.props?.button?.display || contentSection.section.props?.widget?.display)
                          ? 'flex-1 min-h-0'
                          : ''
                          }`}>
                          <ColumnTxt
                            rows={contentSection.section.props?.rows || []}
                            background={{ type: 'solid', color: 'transparent' }}
                            backgroundColor="transparent"
                            textColor={contentSection.section.props?.textColor}
                            fontSize={contentSection.section.props?.fontSize}
                            fontFamily={contentSection.section.props?.fontFamily}
                            fontWeight={contentSection.section.props?.fontWeight}
                            imageWidth={contentSection.section.props?.imageWidth}
                            imageHeight={contentSection.section.props?.imageHeight}
                            gap={contentSection.section.props?.gap}
                            padding={contentSection.section.props?.padding}
                            display={contentSection.section.props?.display !== false}
                          />
                        </div>
                        {contentSection.section.props?.button?.display && (
                          <div className="flex-shrink-0 mt-6">
                            <Button
                              text={contentSection.section.props.button.text}
                              onClick={contentSection.section.props.button.onClick}
                              buttonSize={contentSection.section.props.button.buttonSize}
                              backgroundColor={contentSection.section.props.button.backgroundColor}
                              hoverBackgroundColor={contentSection.section.props.button.hoverBackgroundColor}
                              font={contentSection.section.props.button.font}
                              border={contentSection.section.props.button.border}
                              padding={contentSection.section.props.button.padding}
                              margin={contentSection.section.props.button.margin}
                              shadow={contentSection.section.props.button.shadow}
                              hoverShadow={contentSection.section.props.button.hoverShadow}
                              transition={contentSection.section.props.button.transition}
                              steamIcon={contentSection.section.props.button.steamIcon}
                              image={contentSection.section.props.button.image}
                            />
                          </div>
                        )}
                        {contentSection.section.props?.widget?.display && contentSection.section.props.widget.type === 'buy' && (
                          <div className="flex-shrink-0">
                            <SteamWidgetCropBuy
                              gameId={contentSection.section.props.widget.gameId}
                              scale={contentSection.section.props.widget.scale || 1}
                              utm={contentSection.section.props.widget.utm}
                            />
                          </div>
                        )}
                        {contentSection.section.props?.widget?.display && contentSection.section.props.widget.type === 'install' && (
                          <div className="flex-shrink-0">
                            <SteamWidgetCropInstall
                              gameId={contentSection.section.props.widget.gameId}
                              scale={contentSection.section.props.widget.scale || 1}
                              utm={contentSection.section.props.widget.utm}
                            />
                          </div>
                        )}
                        {contentSection.section.props?.widget?.display && contentSection.section.props.widget.type === 'wishlist' && (
                          <div className="flex-shrink-0">
                            <SteamWidgetCropWishlist
                              gameId={contentSection.section.props.widget.gameId}
                              scale={contentSection.section.props.widget.scale || 1}
                              utm={contentSection.section.props.widget.utm}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {contentSection.type === 'steamReviews' && (
                  <div className="relative w-full h-full min-h-screen">
                    {/* Background layer - absolute positioning for all background types */}
                    {(() => {
                      const bgProps = contentSection.section.props?.background;
                      if (!bgProps) return null;

                      if (bgProps.type === 'video' && bgProps.video?.url) {
                        return (
                          <div className="absolute inset-0 w-full h-full overflow-hidden">
                            <video
                              className="absolute inset-0 w-full h-full object-cover"
                              src={bgProps.video.url}
                              autoPlay
                              loop
                              muted
                              playsInline
                            />
                          </div>
                        );
                      }

                      if (bgProps.type === 'image' && bgProps.image?.url) {
                        return (
                          <div
                            className="absolute inset-0 w-full h-full"
                            style={{
                              backgroundImage: `url(${bgProps.image.url})`,
                              backgroundSize: 'cover',
                              backgroundPosition: bgProps.image.position || 'center',
                            }}
                          />
                        );
                      }

                      if (bgProps.type === 'solid') {
                        return (
                          <div
                            className="absolute inset-0 w-full h-full"
                            style={{
                              backgroundColor: bgProps.color || '#000000',
                            }}
                          />
                        );
                      }

                      if (bgProps.type === 'gradient' && bgProps.gradient) {
                        const { type, colors, direction } = bgProps.gradient;
                        const gradientDirection = direction || (type === 'linear' ? '180deg' : 'circle');
                        const colorStops = colors.join(', ');
                        const gradientStyle = type === 'linear'
                          ? `linear-gradient(${gradientDirection}, ${colorStops})`
                          : `radial-gradient(${gradientDirection}, ${colorStops})`;

                        return (
                          <div
                            className="absolute inset-0 w-full h-full"
                            style={{
                              background: gradientStyle,
                            }}
                          />
                        );
                      }

                      return null;
                    })()}

                    {/* Content layer - centered in viewport */}
                    <div className="relative z-10 w-full min-h-screen flex flex-col justify-center items-center">
                      <div className={`w-full max-w-6xl mx-auto flex flex-col items-center px-4 sm:px-6 lg:px-8 ${(contentSection.section.props?.button?.display || contentSection.section.props?.widget?.display)
                        ? 'py-12 md:py-16 lg:py-20 gap-6 md:gap-8'
                        : 'py-12 md:py-16 lg:py-20'
                        }`}>
                        <div className="w-full flex items-center justify-center">
                          <LayoutSteamReviews
                            images={contentSection.section.props?.images || []}
                            orientation={contentSection.section.props?.orientation}
                            scrollSpeed={contentSection.section.props?.scrollSpeed}
                            width={contentSection.section.props?.width}
                            height={contentSection.section.props?.height}
                            maxWidth={contentSection.section.props?.maxWidth}
                            imageHeight={contentSection.section.props?.imageHeight}
                            imageWidth={contentSection.section.props?.imageWidth}
                            gap={contentSection.section.props?.gap}
                            display={contentSection.section.props?.display !== false}
                          />
                        </div>
                        {contentSection.section.props?.button?.display && (
                          <div className="flex-shrink-0 mt-6">
                            <Button
                              text={contentSection.section.props.button.text}
                              onClick={contentSection.section.props.button.onClick}
                              buttonSize={contentSection.section.props.button.buttonSize}
                              backgroundColor={contentSection.section.props.button.backgroundColor}
                              hoverBackgroundColor={contentSection.section.props.button.hoverBackgroundColor}
                              font={contentSection.section.props.button.font}
                              border={contentSection.section.props.button.border}
                              padding={contentSection.section.props.button.padding}
                              margin={contentSection.section.props.button.margin}
                              shadow={contentSection.section.props.button.shadow}
                              hoverShadow={contentSection.section.props.button.hoverShadow}
                              transition={contentSection.section.props.button.transition}
                              steamIcon={contentSection.section.props.button.steamIcon}
                              image={contentSection.section.props.button.image}
                            />
                          </div>
                        )}
                        {contentSection.section.props?.widget?.display && contentSection.section.props.widget.type === 'buy' && (
                          <div className="flex-shrink-0 mt-6">
                            <SteamWidgetCropBuy
                              gameId={contentSection.section.props.widget.gameId}
                              scale={contentSection.section.props.widget.scale || 1}
                              utm={contentSection.section.props.widget.utm}
                            />
                          </div>
                        )}
                        {contentSection.section.props?.widget?.display && contentSection.section.props.widget.type === 'install' && (
                          <div className="flex-shrink-0 mt-6">
                            <SteamWidgetCropInstall
                              gameId={contentSection.section.props.widget.gameId}
                              scale={contentSection.section.props.widget.scale || 1}
                              utm={contentSection.section.props.widget.utm}
                            />
                          </div>
                        )}
                        {contentSection.section.props?.widget?.display && contentSection.section.props.widget.type === 'wishlist' && (
                          <div className="flex-shrink-0 mt-6">
                            <SteamWidgetCropWishlist
                              gameId={contentSection.section.props.widget.gameId}
                              scale={contentSection.section.props.widget.scale || 1}
                              utm={contentSection.section.props.widget.utm}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {contentSection.type === 'faq' && (
                  <div className="relative w-full h-full">
                    <FaqSection
                      items={contentSection.section.props?.items || []}
                      title={contentSection.section.props?.title}
                      background={contentSection.section.props?.background}
                      backgroundColor={contentSection.section.props?.backgroundColor}
                      textColor={contentSection.section.props?.textColor}
                      questionFontSize={contentSection.section.props?.questionFontSize}
                      answerFontSize={contentSection.section.props?.answerFontSize}
                      fontFamily={contentSection.section.props?.fontFamily}
                      fontWeight={contentSection.section.props?.fontWeight}
                      padding={contentSection.section.props?.padding}
                      maxWidth={contentSection.section.props?.maxWidth}
                      separatorColor={contentSection.section.props?.separatorColor}
                      iconColor={contentSection.section.props?.iconColor}
                      display={contentSection.section.props?.display !== false}
                    />
                  </div>
                )}
              </div>
            )}

            {contentSection.type === 'videoPlayer' && (
              <>
                {/* Background layer - absolute positioning */}
                {contentSection.section.props?.background?.type === 'solid' && (
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{ backgroundColor: contentSection.section.props.background.color || '#000000' }}
                  />
                )}
                {contentSection.section.props?.background?.type === 'gradient' && contentSection.section.props.background.gradient && (
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                      background: contentSection.section.props.background.gradient.type === 'linear'
                        ? `linear-gradient(${contentSection.section.props.background.gradient.direction || '180deg'}, ${contentSection.section.props.background.gradient.colors.join(', ')})`
                        : `radial-gradient(circle, ${contentSection.section.props.background.gradient.colors.join(', ')})`
                    }}
                  />
                )}
                {(contentSection.section.props?.background?.type === 'image' ||
                  contentSection.section.props?.background?.type === 'video') && (
                    <div className="absolute inset-0 w-full h-full">
                      <VideoPlayer
                        background={contentSection.section.props.background}
                        videoSource={{ type: 'url', url: '' }} // Dummy video source, we only want the background
                        display={true}
                        containerClassName="!absolute !inset-0 !p-0"
                        className="hidden" // Hide the video player content, only show background
                      />
                    </div>
                  )}

                {/* Content layer - relative positioning on top */}
                <div
                  className="relative z-10 w-full flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20"
                  style={{
                    minHeight: isPreview ? 'fit-content' : 'auto',
                  }}
                >
                  {/* Video and CTA container - grouped together for better mobile spacing */}
                  <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6 md:gap-8">
                    {/* Video container */}
                    <div className="w-full flex items-center justify-center">
                      <VideoPlayer
                        background={{ type: 'solid', color: 'transparent' }}
                        videoSource={contentSection.section.props?.videoSource}
                        videoWidth={contentSection.section.props?.videoWidth}
                        videoHeight={contentSection.section.props?.videoHeight}
                        aspectRatio={contentSection.section.props?.aspectRatio}
                        autoPlay={contentSection.section.props?.autoPlay}
                        loop={contentSection.section.props?.loop}
                        muted={contentSection.section.props?.muted}
                        controls={contentSection.section.props?.controls}
                        playsInline={contentSection.section.props?.playsInline}
                        poster={contentSection.section.props?.poster}
                        display={contentSection.section.props?.display !== false}
                      />
                    </div>

                    {/* CTA container - now in same parent as video */}
                    {(contentSection.section.props?.button?.display || contentSection.section.props?.widget?.display) && (
                      <div className="flex-shrink-0 w-full flex justify-center">
                        {contentSection.section.props?.button?.display && (
                          <Button
                            text={contentSection.section.props.button.text}
                            onClick={contentSection.section.props.button.onClick}
                            buttonSize={contentSection.section.props.button.buttonSize}
                            backgroundColor={contentSection.section.props.button.backgroundColor}
                            hoverBackgroundColor={contentSection.section.props.button.hoverBackgroundColor}
                            font={contentSection.section.props.button.font}
                            border={contentSection.section.props.button.border}
                            padding={contentSection.section.props.button.padding}
                            margin={contentSection.section.props.button.margin}
                            shadow={contentSection.section.props.button.shadow}
                            hoverShadow={contentSection.section.props.button.hoverShadow}
                            transition={contentSection.section.props.button.transition}
                            steamIcon={contentSection.section.props.button.steamIcon}
                            image={contentSection.section.props.button.image}
                          />
                        )}
                        {contentSection.section.props?.widget?.display && contentSection.section.props.widget.type === 'full' && (
                          <WidgetFull
                            gameId={contentSection.section.props.widget.gameId}
                            utm={contentSection.section.props.widget.utm}
                          />
                        )}
                        {contentSection.section.props?.widget?.display && contentSection.section.props.widget.type === 'buy' && (
                          <SteamWidgetCropBuy
                            gameId={contentSection.section.props.widget.gameId}
                            scale={contentSection.section.props.widget.scale || 1}
                            utm={contentSection.section.props.widget.utm}
                          />
                        )}
                        {contentSection.section.props?.widget?.display && contentSection.section.props.widget.type === 'install' && (
                          <SteamWidgetCropInstall
                            gameId={contentSection.section.props.widget.gameId}
                            scale={contentSection.section.props.widget.scale || 1}
                            utm={contentSection.section.props.widget.utm}
                          />
                        )}
                        {contentSection.section.props?.widget?.display && contentSection.section.props.widget.type === 'wishlist' && (
                          <SteamWidgetCropWishlist
                            gameId={contentSection.section.props.widget.gameId}
                            scale={contentSection.section.props.widget.scale || 1}
                            utm={contentSection.section.props.widget.utm}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {contentSection.type === 'mediaShowcase' && (
              <>
                {/* Background layer - absolute positioning for all background types */}
                {(() => {
                  const bgProps = contentSection.section.props?.background;
                  if (!bgProps) return null;

                  if (bgProps.type === 'video' && bgProps.video?.url) {
                    return (
                      <div className="absolute inset-0 w-full h-full overflow-hidden">
                        <video
                          className="absolute inset-0 w-full h-full object-cover"
                          src={bgProps.video.url}
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                      </div>
                    );
                  }

                  if (bgProps.type === 'image' && bgProps.image?.url) {
                    return (
                      <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                          backgroundImage: `url(${bgProps.image.url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: bgProps.image.position || 'center',
                        }}
                      />
                    );
                  }

                  if (bgProps.type === 'solid') {
                    return (
                      <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                          backgroundColor: bgProps.color || contentSection.section.props?.backgroundColor || '#000000',
                        }}
                      />
                    );
                  }

                  if (bgProps.type === 'gradient' && bgProps.gradient) {
                    const { type, colors, direction } = bgProps.gradient;
                    const gradientDirection = direction || (type === 'linear' ? '180deg' : 'circle');
                    const colorStops = colors.join(', ');
                    const gradientStyle = type === 'linear'
                      ? `linear-gradient(${gradientDirection}, ${colorStops})`
                      : `radial-gradient(${gradientDirection}, ${colorStops})`;

                    return (
                      <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                          background: gradientStyle,
                        }}
                      />
                    );
                  }

                  return null;
                })()}

                {/* Content layer - relative positioning on top */}
                <div
                  className="relative z-10 w-full flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20"
                  style={{
                    minHeight: isPreview ? 'fit-content' : 'auto',
                  }}
                >
                  <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6 md:gap-8">
                    <div className="w-full flex items-center justify-center">
                      <MediaShowcase
                        items={contentSection.section.props?.items || []}
                        title={contentSection.section.props?.title}
                        background={{ type: 'solid', color: 'transparent' }}
                        rows={contentSection.section.props?.rows || 2}
                        columns={contentSection.section.props?.columns || 3}
                        gap={contentSection.section.props?.gap}
                        backgroundColor="transparent"
                        padding={contentSection.section.props?.padding}
                        cellHeight={contentSection.section.props?.cellHeight}
                        fontFamily={contentSection.section.props?.fontFamily}
                        fontWeight={contentSection.section.props?.fontWeight}
                        display={contentSection.section.props?.display !== false}
                        noPadding={true}
                      />
                    </div>
                    {(contentSection.section.props?.button?.display || contentSection.section.props?.widget?.display) && (
                      <div className="flex-shrink-0 w-full flex justify-center">
                        {contentSection.section.props?.button?.display && (
                          <Button
                            text={contentSection.section.props.button.text}
                            onClick={contentSection.section.props.button.onClick}
                            buttonSize={contentSection.section.props.button.buttonSize}
                            backgroundColor={contentSection.section.props.button.backgroundColor}
                            hoverBackgroundColor={contentSection.section.props.button.hoverBackgroundColor}
                            font={contentSection.section.props.button.font}
                            border={contentSection.section.props.button.border}
                            padding={contentSection.section.props.button.padding}
                            margin={contentSection.section.props.button.margin}
                            shadow={contentSection.section.props.button.shadow}
                            hoverShadow={contentSection.section.props.button.hoverShadow}
                            transition={contentSection.section.props.button.transition}
                            steamIcon={contentSection.section.props.button.steamIcon}
                            image={contentSection.section.props.button.image}
                          />
                        )}
                        {contentSection.section.props?.widget?.display && contentSection.section.props.widget.type === 'buy' && (
                          <SteamWidgetCropBuy
                            gameId={contentSection.section.props.widget.gameId}
                            scale={contentSection.section.props.widget.scale || 1}
                            utm={contentSection.section.props.widget.utm}
                          />
                        )}
                        {contentSection.section.props?.widget?.display && contentSection.section.props.widget.type === 'install' && (
                          <SteamWidgetCropInstall
                            gameId={contentSection.section.props.widget.gameId}
                            scale={contentSection.section.props.widget.scale || 1}
                            utm={contentSection.section.props.widget.utm}
                          />
                        )}
                        {contentSection.section.props?.widget?.display && contentSection.section.props.widget.type === 'wishlist' && (
                          <SteamWidgetCropWishlist
                            gameId={contentSection.section.props.widget.gameId}
                            scale={contentSection.section.props.widget.scale || 1}
                            utm={contentSection.section.props.widget.utm}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Footer appears on the last content section */}
            {isLastSection && footerSection && footerProps.display && (
              <div className="shrink-0">
                <Footer {...footerProps} layoutMode={layoutMode} />
              </div>
            )}
          </section>
        );
      })}

      {cookiesBannerSection && cookiesBannerProps.display && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <CookiesBanner {...cookiesBannerProps} />
        </div>
      )}
    </div>
  );
};

export default JsonLandingFullContent;
