import React from 'react';
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
} from '..';
import type {
  LandingPageData,
  Section
} from '../types';

interface JsonLandingProps {
  content: LandingPageData;
  isPreview?: boolean;
}

const JsonLanding: React.FC<JsonLandingProps> = ({ content, isPreview = false }) => {
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
  const carouselSection = content.sections.find((section: Section) => section.type === "carousel");
  const steamReviewsSection = content.sections.find((section: Section) => section.type === "steamReviews");
  const footerSection = content.sections.find((section: Section) => section.type === "footer");
  const cookiesBannerSection = content.sections.find((section: Section) => section.type === "cookiesBanner");
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

  const isHeroEmpty = (
    (!heroProps?.heading || String(heroProps.heading).trim() === '') &&
    (!heroProps?.subheading || String(heroProps.subheading).trim() === '')
  );

  return (
    <div
      className={`${isPreview ? 'min-h-full' : 'min-h-screen'} w-full flex flex-col relative overflow-auto sm:overflow-hidden ${shouldDisplayBackground ? 'bg-transparent' : 'bg-[#111924]'}`}
      style={!isPreview ? { WebkitTapHighlightColor: 'transparent' } : undefined}
    >
      {shouldDisplayBackground && (
        <>
          {phoneBackgroundUrl && (
            <BackgroundMedia
              src={phoneBackgroundUrl}
              lazy
              autoPlay
              loop
              muted
              className="sm:hidden"
            />
          )}
          {backgroundUrl && (
            <BackgroundMedia
              src={backgroundUrl}
              lazy
              autoPlay
              loop
              muted
              className={phoneBackgroundUrl ? 'hidden sm:block' : ''}
            />
          )}
        </>
      )}
      <div
        className={`relative z-10 flex flex-col ${isPreview ? 'min-h-full' : 'min-h-screen'} w-full`}
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        <div className="px-4 sm:px-6 lg:px-8 shrink-0">
          {navbarSection && navbarProps.display && <Navbar {...navbarProps} />}
        </div>

        <div className="flex-1 w-full flex flex-col justify-center items-center mt-4 sm:mt-0">
          {heroSection && heroProps.display && (
            <div className={isHeroEmpty ? 'w-full min-h-[40vh] sm:min-h-0' : 'w-full'}>
              <Hero {...heroProps} />
            </div>
          )}
          {carouselSection && carouselSection.props?.display !== false && (
            <LayoutCarousel
              images={carouselSection.props?.images || []}
              autoPlay={carouselSection.props?.autoPlay}
              autoScrollInterval={carouselSection.props?.autoScrollInterval}
              showDots={carouselSection.props?.showDots}
              showArrows={carouselSection.props?.showArrows}
              orientation={carouselSection.props?.orientation || 'horizontal'}
              {...(carouselSection.props?.height ? { height: carouselSection.props.height } : {})}
              {...(carouselSection.props?.width ? { width: carouselSection.props.width } : {})}
              {...(carouselSection.props?.imageHeight ? { imageHeight: carouselSection.props.imageHeight } : {})}
              {...(carouselSection.props?.imageWidth ? { imageWidth: carouselSection.props.imageWidth } : {})}
              display={carouselSection.props?.display !== false}
            />
          )}

          {steamReviewsSection && steamReviewsSection.props?.display !== false && (
            <LayoutSteamReviews
              images={steamReviewsSection.props?.images || []}
              orientation={steamReviewsSection.props?.orientation || 'horizontal'}
              scrollSpeed={steamReviewsSection.props?.scrollSpeed ?? 50}
              height={steamReviewsSection.props?.height ?? 400}
              width={steamReviewsSection.props?.width ?? '100%'}
              maxWidth={steamReviewsSection.props?.maxWidth ?? 960}
              imageHeight={steamReviewsSection.props?.imageHeight ?? '300px'}
              imageWidth={steamReviewsSection.props?.imageWidth ?? 'auto'}
              gap={steamReviewsSection.props?.gap ?? 16}
              display={steamReviewsSection.props?.display !== false}
            />
          )}

          {buttonSection && buttonProps.display && (
            <div className={`flex justify-center ${isHeroEmpty ? 'mt-12 sm:mt-4 mb-4' : 'my-4'}`}>
              <Button {...buttonProps} />
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
                <div className={`${isHeroEmpty ? 'mt-12 sm:mt-4 mb-4' : 'my-4'} w-full flex ${verticalClass} ${justify} ${items}`} style={containerStyle}>
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

        <div className="h-116 sm:h-0"></div>

        {footerSection && footerProps.display && (
          <div className="shrink-0">
            <Footer {...footerProps} />
          </div>
        )}
      </div>

      {cookiesBannerSection && cookiesBannerProps.display && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <CookiesBanner {...cookiesBannerProps} />
        </div>
      )}
    </div>
  );
};

export default JsonLanding;
