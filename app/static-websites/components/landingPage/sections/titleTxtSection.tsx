import React from 'react';

export interface TitleTxtProps {
  title?: string;
  subtext?: string;
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
  titleColor?: string;
  subtextColor?: string;
  titleFontSize?: string;
  subtextFontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  display?: boolean;
  children?: React.ReactNode;
}

const TitleTxt: React.FC<TitleTxtProps> = ({
  title = 'Title',
  subtext = 'Subtitle text',
  background,
  backgroundColor = '#ffffff',
  titleColor = '#000000',
  subtextColor = '#666666',
  titleFontSize = '48px',
  subtextFontSize = '24px',
  fontFamily,
  fontWeight,
  display = true,
  children,
}) => {
  if (!display) return null;

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
        backgroundSize: background.image.fit || 'cover',
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

  const backgroundStyle = getBackgroundStyle();
  const hasVideoBackground = background?.type === 'video' && background.video?.url;

  return (
    <section
      className="w-full min-h-screen relative flex flex-col items-center px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20"
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

      {/* Content Overlay */}
      <div
        className="max-w-6xl mx-auto text-center pt-12 md:pt-16 relative"
        style={{ zIndex: hasVideoBackground ? 1 : 'auto' }}
      >
        {title && (
          <h1
            className="font-bold mb-4"
            style={{
              color: titleColor,
              fontSize: titleFontSize,
              ...(fontFamily && { fontFamily }),
              ...(fontWeight && { fontWeight }),
            }}
          >
            {title}
          </h1>
        )}
        {subtext && (
          <p
            className="max-w-3xl mx-auto"
            style={{
              color: subtextColor,
              fontSize: subtextFontSize,
              ...(fontFamily && { fontFamily }),
              ...(fontWeight && { fontWeight }),
            }}
            dangerouslySetInnerHTML={{ __html: subtext }}
          />
        )}
      </div>
      {children && (
        <div
          className="flex-1 flex items-center pb-8 pt-8 relative"
          style={{ zIndex: hasVideoBackground ? 1 : 'auto' }}
        >
          <div className="flex-shrink-0">
            {children}
          </div>
        </div>
      )}
    </section>
  );
};

export default TitleTxt;
