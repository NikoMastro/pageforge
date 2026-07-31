import React, { useState } from 'react';
import type { FooterSocialIconsProps, SocialIconData } from '../../../types';

// Default icon definitions for the footer social section
const FOOTER_SOCIAL_ICON_DEFAULTS = {
  discord: {
    src: '',
    alt: 'Discord',
    url: ''
  },
  facebook: {
    src: '',
    alt: 'Facebook',
    url: ''
  },
  steam: {
    src: '',
    alt: 'Steam',
    url: ''
  },
  x: {
    src: '',
    alt: 'X',
    url: ''
  },
  vk: {
    src: '',
    alt: 'VK',
    url: ''
  },
  youtube: {
    src: '',
    alt: 'YouTube',
    url: ''
  },
  instagram: {
    src: '',
    alt: 'Instagram',
    url: ''
  },
  reddit: {
    src: '',
    alt: 'Reddit',
    url: ''
  },
  tiktok: {
    src: '',
    alt: 'TikTok',
    url: ''
  },
  twitch: {
    src: '',
    alt: 'Twitch',
    url: ''
  },
};

const FooterSocialIcons: React.FC<FooterSocialIconsProps> = ({
  icons = [],
  layout = 'horizontal',
  iconSize = 'medium',
  customSize,
  spacing = 'gap-2',
  wrapperClass = '',
  iconClass = '',
  hoverEffects = true,
  iconOverrides = {},
  className = '',
  display = true,
}) => {
  if (!display) {
    return null;
  }

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Get icon size values
  const getIconSize = () => {
    if (iconSize === 'custom' && customSize) {
      return { width: customSize.width || 24, height: customSize.height || 24 };
    }
    switch (iconSize) {
      case 'small': return { width: 16, height: 16 };
      case 'large': return { width: 32, height: 32 };
      default: return { width: 24, height: 24 }; // medium
    }
  };

  const iconSizeValues = getIconSize();

  // Function to normalize icon data - handles both simple and complex structures
  const normalizeIconData = (iconItem: any): SocialIconData => {
    // Check if it's the complex structure with nested 'icon' object
    if (iconItem.icon && typeof iconItem.icon === 'object') {
      return {
        platform: iconItem.platform || '',
        src: iconItem.icon.src,
        alt: iconItem.icon.alt,
        width: iconItem.icon.width || iconSizeValues.width,
        height: iconItem.icon.height || iconSizeValues.height,
        url: iconItem.url || ''
      };
    }

    // Otherwise handle as simple structure
    return {
      platform: iconItem.platform || '',
      src: iconItem.src,
      alt: iconItem.alt,
      width: iconItem.width || iconSizeValues.width,
      height: iconItem.height || iconSizeValues.height,
      url: iconItem.url || ''
    };
  };

  // If no icons are provided, use default social icons
  const defaultIcons: SocialIconData[] = !icons.length
    ? Object.entries(FOOTER_SOCIAL_ICON_DEFAULTS)
      .filter(([key]) => ['discord', 'facebook', 'steam', 'x', 'youtube', 'vk', 'instagram', 'reddit', 'tiktok', 'twitch'].includes(key))
      .map(([_, iconData]) => ({
        platform: '',
        src: iconData.src,
        url: iconData.url,
        alt: iconData.alt,
        width: iconSizeValues.width,
        height: iconSizeValues.height
      }))
    : [];

  // Normalize the provided icons to handle both data structures
  const normalizedIcons = icons.length > 0 ? icons.map(normalizeIconData) : defaultIcons;
  const iconsToRender = normalizedIcons;

  // Default hover style
  const defaultHoverStyle: React.CSSProperties = hoverEffects ? {
    opacity: 0.7,
    transform: 'scale(1.09)',
    transition: 'all 0.2s ease-in-out',
  } : {};

  // Determine layout classes
  const getLayoutClasses = () => {
    const baseClass = `footer__social footer-social-icons ${wrapperClass} ${className}`;
    switch (layout) {
      case 'vertical':
        return `${baseClass} flex flex-col items-center sm:items-start ${spacing}`;
      case 'grid':
        return `${baseClass} grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3`;
      default: // horizontal
        return `${baseClass} flex flex-row flex-wrap justify-center ${spacing}`;
    }
  };

  return (
    <div className={getLayoutClasses()}>
      {iconsToRender.map((icon, index) => {
        const isHovered = hoveredIndex === index;

        // Extract icon data (icon is already SocialIconData type)
        const iconData = icon;
        let iconUrl = iconData.url || '';

        // Apply icon overrides if provided
        const overrideKey = Object.keys(iconOverrides).find(key =>
          (iconData.src && iconData.src.includes(key)) || iconData.alt?.toLowerCase().includes(key.toLowerCase())
        );

        if (overrideKey && iconOverrides[overrideKey]) {
          const override = iconOverrides[overrideKey];
          if (override.src) iconData.src = override.src;
          if (override.url) iconUrl = override.url;
        }

        // Combine default styles with hover effect
        const imageStyle: React.CSSProperties = {
          width: iconData.width || iconSizeValues.width,
          height: iconData.height || iconSizeValues.height,
          display: 'block',
          ...(isHovered && hoverEffects ? defaultHoverStyle : {
            transition: hoverEffects ? 'all 0.2s ease-in-out' : 'none'
          })
        };

        const wrapperStyle = layout === 'vertical' ?
          { display: 'block', margin: '4px 0' } :
          { display: 'inline-block', margin: '0 4px' };

        return (
          <div
            key={`social-icon-${index}`}
            className={`footer__social-item social-icon-wrapper ${iconClass}`}
            style={wrapperStyle}
          >
            {iconUrl ? (
              <a
                href={iconUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link social-icon-link footer-links__link"
                onMouseEnter={() => hoverEffects && setHoveredIndex(index)}
                onMouseLeave={() => hoverEffects && setHoveredIndex(null)}
                aria-label={iconData.alt || 'Social media icon'}
                style={{ display: 'block', cursor: 'pointer' }}
              >
                <img
                  src={iconData.src}
                  alt={iconData.alt || 'Social media icon'}
                  width={iconData.width || iconSizeValues.width}
                  height={iconData.height || iconSizeValues.height}
                  style={imageStyle}
                />
              </a>
            ) : (
              <div
                className="footer__social-icon social-icon"
                onMouseEnter={() => hoverEffects && setHoveredIndex(index)}
                onMouseLeave={() => hoverEffects && setHoveredIndex(null)}
                aria-label={iconData.alt || 'Social media icon'}
              >
                <img
                  src={iconData.src}
                  alt={iconData.alt || 'Social media icon'}
                  width={iconData.width || iconSizeValues.width}
                  height={iconData.height || iconSizeValues.height}
                  style={imageStyle}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FooterSocialIcons;
