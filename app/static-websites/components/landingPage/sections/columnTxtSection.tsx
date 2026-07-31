import React from 'react';

export interface ColumnTxtRow {
  id: string;
  title?: string;
  text: string;
  imageUrl: string;
  imageAlt?: string;
  layout: 'text-left' | 'text-right';
  hasTextBackground?: boolean;
  textBackgroundColor?: string;
  textBackgroundOpacity?: number;
}

export interface ColumnTxtProps {
  rows: ColumnTxtRow[];
  background?: {
    type: 'solid' | 'gradient' | 'image' | 'video';
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
    video?: {
      url: string;
      fit?: 'cover' | 'contain';
      position?: string;
    };
  };
  backgroundColor?: string;
  textColor?: string;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  imageWidth?: string;
  imageHeight?: string;
  gap?: number;
  padding?: string;
  display?: boolean;
  children?: React.ReactNode;
}

const ColumnTxt: React.FC<ColumnTxtProps> = ({
  rows = [],
  background,
  backgroundColor = '#ffffff',
  textColor = '#000000',
  fontSize = '16px',
  fontFamily,
  fontWeight,
  imageHeight = 'auto',
  gap = 32,
  display = true,
  children,
}) => {
  if (!display || rows.length === 0) return null;

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

    if (background.type === 'video' && background.video?.url) {
      return {
        position: 'relative' as const,
        overflow: 'hidden',
      };
    }

    return { backgroundColor };
  };

  // Convert hex to rgba for text background
  const getTextBackgroundColor = (color: string, opacity?: number) => {
    const hex = color;
    const opacityValue = (opacity ?? 15) / 100;

    // Convert hex to rgb
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacityValue})`;
  };

  // Render image component
  const renderImage = (row: ColumnTxtRow) => (
    <img
      src={row.imageUrl}
      alt={row.imageAlt || 'Column image'}
      className="w-full object-cover rounded-lg"
      style={{
        height: imageHeight,
        aspectRatio: imageHeight === 'auto' ? '16/9' : undefined,
      }}
      loading="eager"
    />
  );

  // Render text component
  const renderText = (row: ColumnTxtRow) => (
    <div
      style={{
        ...(row.hasTextBackground && row.textBackgroundColor ? {
          backgroundColor: getTextBackgroundColor(row.textBackgroundColor, row.textBackgroundOpacity),
          padding: '20px',
          borderRadius: '8px',
        } : {}),
      }}
    >
      {row.title && (
        <h3
          style={{
            color: textColor,
            fontSize: `calc(${fontSize} * 1.5)`,
            fontWeight: fontWeight || 700,
            lineHeight: '1.3',
            marginBottom: '16px',
            ...(fontFamily && { fontFamily }),
          }}
        >
          {row.title}
        </h3>
      )}
      <div
        style={{
          color: textColor,
          fontSize,
          lineHeight: '1.6',
          ...(fontFamily && { fontFamily }),
          ...(fontWeight && { fontWeight }),
        }}
        dangerouslySetInnerHTML={{ __html: row.text }}
      />
    </div>
  );

  const backgroundStyle = getBackgroundStyle();
  const hasVideoBackground = background?.type === 'video' && background.video?.url;

  return (
    <section
      className="w-full h-full relative px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20"
      style={{
        ...backgroundStyle,
      }}
    >
      {/* Video Background */}
      {hasVideoBackground && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            objectFit: background.video?.fit || 'cover',
            objectPosition: background.video?.position || 'center',
            zIndex: 0,
          }}
        >
          <source src={background.video!.url} type="video/mp4" />
        </video>
      )}

      <div
        className="max-w-6xl mx-auto space-y-8 h-full flex flex-col justify-center relative"
        style={{ zIndex: hasVideoBackground ? 1 : 'auto' }}
      >
        {rows.map((row) => {
          const isTextLeft = row.layout === 'text-left';

          const desktopStyles = `
            @media (min-width: 768px) {
              #column-row-${row.id} {
                flex-direction: row !important;
              }
              #column-row-${row.id} > .column-image {
                order: ${isTextLeft ? 2 : 1} !important;
                flex: 1;
              }
              #column-row-${row.id} > .column-text {
                order: ${isTextLeft ? 1 : 2} !important;
                flex: 1;
              }
            }
          `;

          return (
            <div key={row.id}>
              <style>{desktopStyles}</style>
              <div
                id={`column-row-${row.id}`}
                className="flex flex-col items-center w-full"
                style={{ gap: `${gap}px` }}
              >
                {/* Image first in DOM - Always shows first on mobile */}
                <div className="column-image w-full">
                  {renderImage(row)}
                </div>

                {/* Text second in DOM - Always shows second on mobile */}
                <div className="column-text w-full">
                  {renderText(row)}
                </div>
              </div>
            </div>
          );
        })}
        {children && (
          <div className="flex flex-col items-center justify-center pt-8">
            {children}
          </div>
        )}
      </div>
    </section>
  );
};

export default ColumnTxt;
