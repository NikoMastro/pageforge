import React from 'react';
import type { SteamReviewsProps } from '../../../types';

export interface SteamReviewCardData {
  src?: string;
  sources?: string[];
  alt?: string;
  path?: string;
  type?: 'image' | 'video';
}

const SteamReviewsContainer: React.FC<Partial<SteamReviewsProps>> = ({
  images = [],
  orientation = 'horizontal',
  scrollSpeed = 50,
  height = 'auto',
  width = '100%',
  maxWidth = 960,
  imageHeight = '150px',
  imageWidth = '600px',
  gap = 16,
}) => {
  const [isPaused, setIsPaused] = React.useState(false);
  const [isSmallScreen, setIsSmallScreen] = React.useState(false);
  const [isHovering, setIsHovering] = React.useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const animationRef = React.useRef<number | null>(null);
  const scrollPositionRef = React.useRef(0);
  const lastTimestampRef = React.useRef<number | null>(null);

  // Detect small screen size based on container width (works in iframes/previews)
  React.useEffect(() => {
    const checkScreenSize = () => {
      // Use container width if available (for iframe/preview support)
      // Fall back to window.innerWidth for production
      const containerWidth = wrapperRef.current?.offsetWidth;
      const width = containerWidth && containerWidth > 0 ? containerWidth : window.innerWidth;
      setIsSmallScreen(width < 640); // Use Tailwind's sm breakpoint
    };

    checkScreenSize();

    // Use ResizeObserver to detect container size changes (works in iframes)
    const resizeObserver = new ResizeObserver(checkScreenSize);
    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    // Also listen to window resize as fallback
    window.addEventListener('resize', checkScreenSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const isHorizontal = orientation === 'horizontal';

  // Parse and normalize image inputs
  const reviews = React.useMemo(() => {
    if (!Array.isArray(images)) return [];
    const normalized = images
      .map((it: any) => {
        if (typeof it === 'string') return { src: it };
        const raw = it?.path || it?.src || '';
        return { ...it, src: raw };
      })
      .filter(r => r.src);

    return normalized;
  }, [images]);

  const count = reviews.length;

  // Duplicate reviews for infinite loop effect
  // We need at least 3 copies to ensure smooth infinite scrolling
  const infiniteReviews = React.useMemo(() => {
    if (count === 0) return [];
    if (count === 1) return [...reviews, ...reviews, ...reviews, ...reviews]; // Quadruple for single item
    return [...reviews, ...reviews, ...reviews]; // Triple for multiple items
  }, [reviews, count]);

  // Infer media type from URL
  const inferType = (src: string): 'image' | 'video' => {
    if (!src) return 'image';
    const lower = src.split('?')[0].toLowerCase();
    if (/(\.mp4|\.webm|\.m3u8|\.mpd)$/.test(lower)) return 'video';
    return 'image';
  };

  // Container styling
  const containerStyle = React.useMemo(() => {
    const defaultWidth = 960;
    const defaultHeight = 400;

    let finalWidth: string | number = width || defaultWidth;
    let finalHeight: string | number = height || defaultHeight;

    const style = {
      width: typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth,
      height: typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight,
      maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth || '960px',
      marginInline: 'auto',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    } as React.CSSProperties;

    return style;
  }, [width, maxWidth, height]);

  // Handle mouse enter: sync scroll position from container
  const handleMouseEnter = () => {
    setIsHovering(true);
    setIsPaused(true);
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      // Sync the ref with current scroll position
      scrollPositionRef.current = isHorizontal ? scrollContainer.scrollLeft : scrollContainer.scrollTop;
    }
  };

  // Handle mouse leave: resume auto-scroll from current position
  const handleMouseLeave = () => {
    setIsHovering(false);
    setIsPaused(false);
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      // Update ref with manual scroll position
      scrollPositionRef.current = isHorizontal ? scrollContainer.scrollLeft : scrollContainer.scrollTop;
    }
  };

  // Smooth continuous scroll animation
  React.useEffect(() => {
    if (count === 0 || isPaused) return;

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const animate = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const deltaTime = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      // Calculate scroll distance based on speed and time
      const scrollDistance = (scrollSpeed / 1000) * deltaTime;
      scrollPositionRef.current += scrollDistance;

      if (isHorizontal) {
        // Get the total width and the width of one set of reviews
        const totalScrollWidth = scrollContainer.scrollWidth;
        const singleSetWidth = totalScrollWidth / 3; // Third because we tripled

        // Reset seamlessly when we've scrolled through the first set
        if (scrollPositionRef.current >= singleSetWidth) {
          scrollPositionRef.current = scrollPositionRef.current - singleSetWidth;
        }

        scrollContainer.scrollLeft = scrollPositionRef.current;
      } else {
        // Get the total height and the height of one set of reviews
        const totalScrollHeight = scrollContainer.scrollHeight;
        const singleSetHeight = totalScrollHeight / 3; // Third because we tripled

        // Reset seamlessly when we've scrolled through the first set
        if (scrollPositionRef.current >= singleSetHeight) {
          scrollPositionRef.current = scrollPositionRef.current - singleSetHeight;
        }

        scrollContainer.scrollTop = scrollPositionRef.current;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      lastTimestampRef.current = null;
    };
  }, [count, isPaused, scrollSpeed, isHorizontal]);

  // Render individual review card
  const renderReviewCard = (review: SteamReviewCardData, index: number) => {
    const raw = review.path || review.src || '';
    const explicitSources = Array.isArray(review.sources) ? review.sources.filter(Boolean) : [];
    const splitSources = typeof raw === 'string' && raw.includes(',') ? raw.split(/[,;]\s*/).filter(Boolean) : [];
    const candidates = [...explicitSources, ...splitSources, raw].filter(Boolean);
    const primary = candidates[0] || '';
    const alt = review.alt || `Steam review ${index + 1}`;
    const mediaType = review.type || inferType(primary);

    // Adjust width for small screens
    const baseWidth = typeof imageWidth === 'number' ? imageWidth : parseInt(imageWidth) || 600;
    const adjustedWidth = isSmallScreen ? 400 : baseWidth;
    const reviewWidth = `${adjustedWidth}px`;

    // Adjust height for small screens
    const baseHeight = typeof imageHeight === 'number' ? imageHeight : parseInt(imageHeight) || 150;
    const adjustedHeight = isSmallScreen ? 110 : baseHeight;
    const reviewHeight = `${adjustedHeight}px`;

    return (
      <div
        key={`review-${index}`}
        className="flex-shrink-0"
        style={{
          width: isHorizontal ? reviewWidth : '100%',
          height: isHorizontal ? reviewHeight : reviewHeight,
          marginRight: isHorizontal ? `${gap}px` : 0,
          marginBottom: isHorizontal ? 0 : `${gap}px`,
        }}
      >
        <div
          className="relative rounded-lg overflow-hidden"
          style={{
            width: reviewWidth,
            height: reviewHeight,
          }}
        >
          {primary ? (
            mediaType === 'video' ? (
              <video
                src={primary}
                className="object-contain"
                style={{ width: reviewWidth, height: reviewHeight }}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <picture>
                {candidates.slice(1).map((c, i) => {
                  const lower = c.toLowerCase();
                  const type = lower.endsWith('.webp') ? 'image/webp' :
                    lower.endsWith('.avif') ? 'image/avif' : undefined;
                  return type ? <source key={c + i} srcSet={c} type={type} /> : null;
                })}
                <img
                  src={primary}
                  alt={alt}
                  className="object-contain"
                  style={{ width: reviewWidth, height: reviewHeight }}
                  draggable={false}
                  loading="eager"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error('Failed to load Steam review image:', primary);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </picture>
            )
          ) : (
            <div
              className="flex items-center justify-center bg-gray-800 text-gray-400 text-sm"
              style={{ width: reviewWidth, height: reviewHeight }}
            >
              No media
            </div>
          )}
        </div>
      </div>
    );
  };

  if (count === 0) return null;

  return (
    <div
      ref={wrapperRef}
      className="relative flex items-center justify-center"
      style={containerStyle}
      role="region"
      aria-label="Steam Reviews"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={scrollContainerRef}
        className="flex items-center"
        style={{
          display: 'flex',
          flexDirection: isHorizontal ? 'row' : 'column',
          alignItems: 'center',
          scrollBehavior: 'auto',
          WebkitOverflowScrolling: 'touch',
          height: '100%',
          overflowX: isHorizontal && isHovering ? 'auto' : 'hidden',
          overflowY: !isHorizontal && isHovering ? 'auto' : 'hidden',
          cursor: isHovering ? 'grab' : 'default',
        }}
      >
        {infiniteReviews.map((review, i) => renderReviewCard(review, i))}
      </div>
    </div>
  );
};

export default SteamReviewsContainer;
