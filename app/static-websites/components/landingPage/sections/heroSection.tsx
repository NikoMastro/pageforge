import React from "react";
import Button from "./buttonSection/button";
import type { HeroProps } from '../../types';

const Hero: React.FC<HeroProps & { layout?: 'desktop' | 'phone' }> = ({
  heading,
  subheading,
  ctaLabel,
  ctaOnClick,
  buttonStyled,
  className = "",
  headingClassName = "",
  subheadingClassName = "",
  headingStyle = {},
  subheadingStyle = {},
  display = true,
  layout = 'desktop',
}) => {
  if (!display) return null;

  const isPhone = layout === 'phone';

  return (
    <section className={`${isPhone ? 'py-8' : 'py-12 md:py-20'} text-center overflow-x-hidden ${className}`}>
      <div className={`${isPhone ? 'w-full' : 'max-w-4xl w-full'} mx-auto px-4`}>
        {(() => {
          const hasSizeClass = /(?:^|\s)(text-(?:xs|sm|base|lg|xl|[2-9]xl)|text-\[[^\]]+\])/g.test(
            `${isPhone ? '' : 'text-3xl md:text-5xl'} ${headingClassName}`
          );
          const mergedHeadingStyle: React.CSSProperties = {
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
            hyphens: 'auto',
            whiteSpace: (headingStyle as any)?.whiteSpace ?? 'pre-line',
            ...headingStyle,
          };
          if (!mergedHeadingStyle.fontSize && !hasSizeClass) {
            mergedHeadingStyle.fontSize = isPhone ? 'clamp(24px, 7vw, 40px)' : 'clamp(24px, 8vw, 48px)';
          }
          return (
            <h1
              className={`${isPhone ? '' : 'text-3xl md:text-5xl'} font-bold ${isPhone ? 'mb-3 leading-tight' : 'mb-4 leading-tight'} break-words whitespace-pre-line ${headingClassName}`}
              style={mergedHeadingStyle}
            >
              {heading}
            </h1>
          );
        })()}

        {subheading && (
          (() => {
            const hasSizeClass = /(?:^|\s)(text-(?:xs|sm|base|lg|xl|[2-9]xl)|text-\[[^\]]+\])/g.test(
              `${isPhone ? '' : 'text-lg md:text-2xl'} ${subheadingClassName}`
            );
            const mergedSubStyle: React.CSSProperties = {
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              hyphens: 'auto',
              whiteSpace: (subheadingStyle as any)?.whiteSpace ?? 'pre-line',
              ...subheadingStyle,
            };
            if (!mergedSubStyle.fontSize && !hasSizeClass) {
              mergedSubStyle.fontSize = isPhone ? 'clamp(14px, 4.5vw, 20px)' : 'clamp(14px, 5.5vw, 24px)';
            }
            return (
              <p
                className={`${isPhone ? '' : 'text-lg md:text-2xl'} ${isPhone ? 'mb-6 leading-snug' : 'mb-8 leading-snug'} break-words whitespace-pre-line ${subheadingClassName}`}
                style={mergedSubStyle}
              >
                {subheading}
              </p>
            );
          })()
        )}

        <div className="flex justify-center">
          {buttonStyled && typeof buttonStyled === 'object' && buttonStyled !== null ? (
            <Button {...(buttonStyled as any)} layout={layout} />
          ) : (
            ctaLabel && (
              <Button
                text={ctaLabel}
                onClick={ctaOnClick}
                variant="primary"
                size={isPhone ? undefined : "lg"}
                buttonSize={isPhone ? "big" : undefined}
                layout={layout}
                className={isPhone ? "mt-2" : "mt-4"}
              />
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
