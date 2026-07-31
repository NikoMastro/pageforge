import React, { useState } from 'react';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqProps {
  items: FaqItem[];
  title?: string;
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
  questionFontSize?: string;
  answerFontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  padding?: string;
  maxWidth?: string;
  display?: boolean;
  separatorColor?: string;
  iconColor?: string;
}

const FaqSection: React.FC<FaqProps> = ({
  items = [],
  title = 'Frequently Asked Questions',
  background,
  backgroundColor = '#ffffff',
  textColor = '#000000',
  questionFontSize = '18px',
  answerFontSize = '16px',
  fontFamily,
  fontWeight,
  maxWidth = '72rem',
  display = true,
  separatorColor = '#e5e7eb',
  iconColor = '#6b7280',
}) => {
  if (!display || items.length === 0) return null;

  const [openItemId, setOpenItemId] = useState<string | null>(null);

  // Toggle FAQ item
  const toggleItem = (id: string) => {
    setOpenItemId(openItemId === id ? null : id);
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
      className="w-full relative flex items-center px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20"
      style={{
        ...backgroundStyle,
        color: textColor,
        minHeight: '90vh',
        height: 'auto',
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
        className="relative mx-auto w-full"
        style={{
          maxWidth,
          zIndex: hasVideoBackground ? 1 : 'auto',
        }}
      >
        {/* Title */}
        {title && (
          <h2
            className="text-center font-bold mb-12"
            style={{
              fontSize: '32px',
              color: textColor,
              ...(fontFamily && { fontFamily }),
              ...(fontWeight && { fontWeight }),
            }}
          >
            {title}
          </h2>
        )}

        {/* FAQ Items */}
        <div className="space-y-0">
          {items.map((item, index) => {
            const isOpen = openItemId === item.id;
            const isLast = index === items.length - 1;

            return (
              <div key={item.id}>
                {/* FAQ Item */}
                <div
                  className="cursor-pointer transition-colors duration-200 hover:opacity-80"
                  onClick={() => toggleItem(item.id)}
                  style={{
                    paddingTop: index === 0 ? '0' : '24px',
                    paddingBottom: '24px',
                  }}
                >
                  {/* Question Row */}
                  <div className="flex items-center justify-between gap-4">
                    <h3
                      className="font-medium flex-1"
                      style={{
                        fontSize: questionFontSize,
                        color: textColor,
                        ...(fontFamily && { fontFamily }),
                        ...(fontWeight && { fontWeight }),
                      }}
                    >
                      {item.question}
                    </h3>
                    {/* Dropdown Icon */}
                    <div
                      className="flex-shrink-0 transition-transform duration-200 ease-out"
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        color: iconColor,
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>

                  {/* Answer (Collapsible) - using grid for smooth animation */}
                  <div
                    className="grid transition-all duration-200 ease-out"
                    style={{
                      gridTemplateRows: isOpen ? '1fr' : '0fr',
                    }}
                  >
                    <div className="overflow-hidden">
                      <div
                        className="pt-4"
                        style={{
                          fontSize: answerFontSize,
                          color: textColor,
                          opacity: 0.8,
                          ...(fontFamily && { fontFamily }),
                          ...(fontWeight && { fontWeight }),
                        }}
                      >
                        {item.answer}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Separator */}
                {!isLast && (
                  <div
                    style={{
                      height: '1px',
                      backgroundColor: separatorColor,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
