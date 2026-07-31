import React, { useState, useRef, useEffect } from 'react';

export interface MediaShowcaseItem {
  id?: string;
  url: string;
  type: 'image' | 'video';
  alt?: string;
  startRow: number;
  startCol: number;
  rowSpan: number;
  columnSpan: number;
}

export interface MediaShowcaseProps {
  items: MediaShowcaseItem[];
  title?: string;
  background?: {
    type: 'solid' | 'gradient' | 'image';
    color?: string;
    gradient?: {
      type: 'linear' | 'radial';
      colors: string[];
      direction?: string;
    };
    image?: {
      url: string;
      fit?: 'cover' | 'contain' | 'fill';
      position?: string;
    };
  };
  rows: number;
  columns: number;
  gap?: number;
  backgroundColor?: string;
  padding?: string;
  display?: boolean;
  cellHeight?: string;
  fontFamily?: string;
  fontWeight?: string;
  noPadding?: boolean;
  children?: React.ReactNode;
}

const MediaShowcase: React.FC<MediaShowcaseProps> = ({
  items = [],
  title,
  background,
  rows = 2,
  columns = 3,
  gap = 10,
  backgroundColor = '#000000',
  display = true,
  cellHeight = '300px',
  fontFamily,
  fontWeight,
  noPadding = false,
  children,
}) => {
  if (!display) return null;

  const validItems = (items || []).filter((item): item is MediaShowcaseItem =>
    item != null &&
    typeof item === 'object' &&
    'type' in item &&
    'url' in item &&
    (item.type === 'image' || item.type === 'video')
  );
  if (validItems.length === 0) return null;

  // Auto-generate IDs if missing
  const itemsWithIds = validItems.map((item, index) => ({
    ...item,
    id: item.id || `item-${index}-${Date.now()}`
  }));

  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect mobile based on container width (works correctly in iframes/previews)
  useEffect(() => {
    const checkMobile = () => {
      // Use container width if available (for iframe/preview support)
      // Fall back to window.innerWidth for production
      const containerWidth = containerRef.current?.offsetWidth;
      const width = containerWidth && containerWidth > 0 ? containerWidth : window.innerWidth;
      setIsMobile(width < 640); // Use Tailwind's sm breakpoint (640px)
    };

    checkMobile();

    // Use ResizeObserver to detect container size changes (works in iframes)
    const resizeObserver = new ResizeObserver(checkMobile);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Also listen to window resize as fallback
    window.addEventListener('resize', checkMobile);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Handle swipe for carousel
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swiped left, go to next image
        setCurrentIndex((prev) => (prev + 1) % itemsWithIds.length);
      } else {
        // Swiped right, go to previous image
        setCurrentIndex((prev) =>
          prev === 0 ? itemsWithIds.length - 1 : prev - 1
        );
      }
    }
  };

  // Generate background style
  const getBackgroundStyle = () => {
    if (!background) {
      return { backgroundColor };
    }

    if (background.type === 'solid') {
      return { backgroundColor: background.color || backgroundColor };
    }

    if (background.type === 'gradient' && background.gradient) {
      const { type, colors, direction } = background.gradient;
      const gradientDirection = direction || (type === 'linear' ? '180deg' : 'circle');
      const colorStops = colors.join(', ');

      return {
        background: type === 'linear'
          ? `linear-gradient(${gradientDirection}, ${colorStops})`
          : `radial-gradient(${gradientDirection}, ${colorStops})`,
      };
    }

    if (background.type === 'image' && background.image?.url) {
      return {
        backgroundImage: `url(${background.image.url})`,
        backgroundSize: 'cover',
        backgroundPosition: background.image.position || 'center',
        backgroundRepeat: 'no-repeat',
      };
    }

    return { backgroundColor };
  };

  const renderMedia = (item: MediaShowcaseItem, objectFit: 'cover' | 'contain' = 'cover') => {
    if (!item || !item.type || !item.url) return null;

    if (item.type === 'video') {
      return (
        <video
          src={item.url}
          controls
          className="w-full h-full transition-transform duration-300 hover:scale-105 rounded-lg"
          style={{ display: 'block', objectFit }}
        >
          Your browser does not support the video tag.
        </video>
      );
    }

    return (
      <img
        src={item.url}
        alt={item.alt || 'Media showcase item'}
        className="w-full h-full transition-transform duration-300 hover:scale-105 rounded-lg"
        style={{ display: 'block', objectFit }}
        loading="lazy"
      />
    );
  };

  // Mobile carousel content
  const carouselContent = (
    <div className="max-w-6xl mx-auto w-full">
      {title && (
        <h2
          className="text-4xl font-bold text-white text-center mb-8 mt-8"
          style={{
            ...(fontFamily && { fontFamily }),
            ...(fontWeight && { fontWeight }),
          }}
        >
          {title}
        </h2>
      )}
      <div className="flex flex-col items-center justify-center gap-4">
        {/* Carousel container */}
        <div
          className="w-full relative overflow-hidden rounded-lg"
          style={{
            height: cellHeight,
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Single image display */}
          <div className="w-full h-full">
            {renderMedia(itemsWithIds[currentIndex], 'contain')}
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex gap-3 justify-center">
          {itemsWithIds.map((_, index) => (
            <div
              key={index}
              className={`transition-all rounded-full ${index === currentIndex
                ? 'bg-white w-3 h-3'
                : 'bg-white/50 w-2.5 h-2.5'
                }`}
              aria-label={`Image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );

  // Desktop grid content
  const parseCellHeight = (height: string): number => {
    const match = height.match(/^(\d+(?:\.\d+)?)(px|rem|em|vh)?$/);
    if (match) {
      return parseFloat(match[1]);
    }
    return 300;
  };
  const cellHeightValue = parseCellHeight(cellHeight);
  const totalGridHeight = (cellHeightValue * rows) + (gap * (rows - 1));

  const gridContent = (
    <div className="max-w-6xl mx-auto w-full">
      {title && (
        <h2
          className="text-4xl font-bold text-white text-center mb-8 mt-8"
          style={{
            ...(fontFamily && { fontFamily }),
            ...(fontWeight && { fontWeight }),
          }}
        >
          {title}
        </h2>
      )}
      <div
        className="w-full"
        style={{
          display: 'grid',
          gridTemplateRows: `repeat(${rows}, ${cellHeight})`,
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px`,
          minHeight: `${totalGridHeight}px`,
        }}
      >
        {itemsWithIds.map((item) => (
          <div
            key={item.id}
            className="relative overflow-hidden"
            style={{
              gridRow: `${item.startRow} / span ${item.rowSpan}`,
              gridColumn: `${item.startCol} / span ${item.columnSpan}`,
              minHeight: cellHeight,
            }}
          >
            {renderMedia(item)}
          </div>
        ))}
      </div>
    </div>
  );

  // When noPadding is true (used inside jsonLandingFullContent), the parent handles padding
  if (noPadding) {
    return (
      <div
        ref={containerRef}
        className="w-full relative flex flex-col"
        style={{
          ...getBackgroundStyle(),
        }}
      >
        <div className="flex-1">
          {isMobile ? carouselContent : gridContent}
        </div>
        {children && (
          <div className="flex flex-col items-center justify-center pt-8">
            {children}
          </div>
        )}
      </div>
    );
  }

  return (
    <section
      ref={containerRef}
      className="w-full relative px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20 flex flex-col"
      style={{
        ...getBackgroundStyle(),
        minHeight: isMobile ? 'auto' : '100vh',
        alignItems: 'center',
      }}
    >
      <div className="flex-1 flex items-center">
        {isMobile ? carouselContent : gridContent}
      </div>
      {children && (
        <div className="flex flex-col items-center justify-center pt-8">
          {children}
        </div>
      )}
    </section>
  );
};

export default MediaShowcase;
