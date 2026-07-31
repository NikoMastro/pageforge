import React from 'react';
import type { CarouselProps } from '../../../types';

export interface CarouselCardData {
  src?: string;
  sources?: string[];
  alt?: string;
  path?: string;
  title?: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  type?: 'image' | 'video';
}

const Carousel: React.FC<Partial<CarouselProps>> = ({
  images = [],
  autoPlay = true,
  interval = 5000,
  autoScrollInterval,
  orientation = 'horizontal',
  height = 'auto',
  width = '100%',
  maxWidth = 960,
}) => {
  const effInterval = autoScrollInterval ?? interval;
  const [index, setIndex] = React.useState(1);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const timerRef = React.useRef<number | null>(null);
  const isHorizontal = orientation === 'horizontal';
  const slides = React.useMemo(() => {
    if (!Array.isArray(images)) return [];
    const normalized = images
      .map((it: any) => {
        if (typeof it === 'string') return { src: it };
        const raw = it?.path || it?.src || '';
        return { ...it, src: raw };
      })
      .filter(s => s.src);

    return normalized;
  }, [images]);

  const count = slides.length;

  const infiniteSlides = React.useMemo(() => {
    if (count === 0) return [];
    if (count === 1) return slides;
    // Clone: [last, ...originals, first]
    return [slides[count - 1], ...slides, slides[0]];
  }, [slides, count]);

  const totalSlides = infiniteSlides.length;

  // Clamp index if images prop changes
  React.useEffect(() => {
    if (count === 0) {
      setIndex(0);
    } else if (count === 1) {
      setIndex(0);
    } else {
      // Reset to first real slide when slides change
      setIndex(1);
    }
  }, [count]);

  // Navigation functions with infinite looping
  const next = React.useCallback(() => {
    if (count <= 1) return;
    setIsTransitioning(true);
    setIndex(i => i + 1);
  }, [count]);

  // Handle infinite loop reset after transition
  React.useEffect(() => {
    if (!isTransitioning || count <= 1) return;

    const transitionTimeout = setTimeout(() => {
      setIsTransitioning(false);

      // Jump to real slide without transition
      if (index >= totalSlides - 1) {
        // We're at the cloned first slide, jump to real first
        setIndex(1);
      } else if (index <= 0) {
        // We're at the cloned last slide, jump to real last
        setIndex(totalSlides - 2);
      }
    }, 600); // Match transition duration

    return () => clearTimeout(transitionTimeout);
  }, [index, isTransitioning, totalSlides, count]);

  // Autoplay logic
  React.useEffect(() => {
    if (!autoPlay || count <= 1) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(next, effInterval);
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [autoPlay, effInterval, index, count, next]);

  // Infer media type from URL
  const inferType = (src: string): 'image' | 'video' => {
    if (!src) return 'image';
    const lower = src.split('?')[0].toLowerCase();
    if (/(\.mp4|\.webm|\.m3u8|\.mpd)$/.test(lower)) return 'video';
    return 'image';
  };

  // Container styling - responsive 16:9 ratio
  const containerStyle = React.useMemo(() => {
    // Use 100% width on mobile, fixed width on larger screens
    const style = {
      width: '100%',
      maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth || '960px',
      aspectRatio: '16 / 9',
      marginInline: 'auto',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      alignItems: 'stretch',
    } as React.CSSProperties;

    // Only set explicit height if provided (override aspect-ratio)
    if (height) {
      style.height = typeof height === 'number' ? `${height}px` : height;
      delete (style as any).aspectRatio;
    }

    return style;
  }, [maxWidth, height, count]);

  // Track transform for infinite sliding
  const trackStyle = React.useMemo(() => {
    if (count === 0) return {};
    const slideCount = count === 1 ? 1 : totalSlides;

    if (isHorizontal) {
      return {
        display: 'flex',
        flexDirection: 'row',
        height: '100%',
        width: `${slideCount * 100}%`,
        transform: `translateX(-${index * (100 / slideCount)}%)`,
        transition: isTransitioning ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        willChange: 'transform'
      } as React.CSSProperties;
    }
    return {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: `${slideCount * 100}%`,
      transform: `translateY(-${index * (100 / slideCount)}%)`,
      transition: isTransitioning ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
      willChange: 'transform'
    } as React.CSSProperties;
  }, [index, count, totalSlides, isHorizontal, isTransitioning]);

  // Render individual slide card
  const renderSlideCard = (slide: CarouselCardData) => {
    const raw = slide.path || slide.src || '';
    const explicitSources = Array.isArray(slide.sources) ? slide.sources.filter(Boolean) : [];
    const splitSources = typeof raw === 'string' && raw.includes(',') ? raw.split(/[,;]\s*/).filter(Boolean) : [];
    const candidates = [...explicitSources, ...splitSources, raw].filter(Boolean);
    const primary = candidates[0] || '';
    const alt = slide.alt || slide.title || 'Carousel image';
    const mediaType = slide.type || inferType(primary);

    const cardContent = (
      <div
        className="relative group w-full h-full flex items-center justify-center"
        style={{ width: '100%', height: '100%' }}
      >
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg">
          {primary ? (
            mediaType === 'video' ? (
              <video
                src={primary}
                className="w-full h-full object-contain rounded-lg"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <picture>
                {/* Multiple source support for better formats */}
                {candidates.slice(1).map((c, i) => {
                  const lower = c.toLowerCase();
                  const type = lower.endsWith('.webp') ? 'image/webp' :
                    lower.endsWith('.avif') ? 'image/avif' : undefined;
                  return type ? <source key={c + i} srcSet={c} type={type} /> : null;
                })}
                <img
                  src={primary}
                  alt={alt}
                  className="w-full h-full object-contain rounded-lg"
                  draggable={false}
                  loading="eager"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error('Failed to load carousel image:', primary);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </picture>
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center w-full h-full bg-gray-800 text-gray-400 text-sm">
              No media
            </div>
          )}

          {/* Overlay with title and description */}
          {(slide.title || slide.description) && (
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/10 to-transparent p-4">
              {slide.title && (
                <h4 className="text-white font-semibold text-sm md:text-base mb-1 line-clamp-2">
                  {slide.title}
                </h4>
              )}
              {slide.description && (
                <p className="text-gray-200 text-xs md:text-sm line-clamp-3">
                  {slide.description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );

    // Wrap in link if href provided
    if (slide.href) {
      return (
        <a
          href={slide.href}
          onClick={(e) => { if (slide.onClick) { e.preventDefault(); slide.onClick(); } }}
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
          target={slide.href.startsWith('http') ? '_blank' : undefined}
          rel={slide.href.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          {cardContent}
        </a>
      );
    }

    return cardContent;
  };

  if (count === 0) return null;

  return (
    <div
      className="relative"
      style={containerStyle}
      data-slides={count}
      role="region"
      aria-roledescription="carousel"
    >
      <div className="w-full h-full overflow-hidden" aria-live={autoPlay ? 'off' : 'polite'}>
        <div style={trackStyle}>
          {infiniteSlides.map((slide, i) => {
            const slideCount = count === 1 ? 1 : totalSlides;
            const basis = `${100 / slideCount}%`;
            const slideStyle: React.CSSProperties = isHorizontal
              ? { width: basis, height: '100%', display: 'flex', alignItems: 'stretch', justifyContent: 'center' }
              : { height: basis, width: '100%', display: 'flex', alignItems: 'stretch', justifyContent: 'center' };

            return (
              <div
                key={`slide-${i}`}
                className="flex-shrink-0 flex-grow-0"
                style={slideStyle}
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${i + 1} of ${count}`}
              >
                {renderSlideCard(slide)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
