import React from 'react';
import type { ButtonProps } from '../../../types';

const Button: React.FC<ButtonProps & { layout?: 'desktop' | 'phone' }> = ({
  text = "Button",
  children,
  disabled = false,
  type = "button",
  className = "",
  style = {},

  // Layout mode (desktop or phone)
  layout = "desktop",

  // Legacy compatibility props (deprecated)
  variant,
  size,

  // New size property
  buttonSize = "default",

  // Display properties
  display = { text: true },

  // Layout and sizing
  width,
  height,
  padding,
  margin,
  fullWidth = false,

  // Typography
  font,

  // Background and colors
  backgroundColor,
  hoverBackgroundColor,

  // Border properties
  border,

  // Icon/Image properties
  image,

  // Steam icon
  steamIcon,

  // Animation and effects
  transition = "all 0.2s ease-in-out",
  shadow = (buttonSize === 'big' || size === 'lg') ? "0 6px 20px rgba(0, 0, 0, 0.15)" : "0 2px 4px rgba(0, 0, 0, 0.1)",
  hoverShadow = (buttonSize === 'big' || size === 'lg') ? "0 8px 25px rgba(0, 0, 0, 0.25)" : "0 4px 8px rgba(0, 0, 0, 0.15)",
}) => {

  // Handle legacy variant and size props
  const legacyVariantStyles = variant ? {
    primary: { backgroundColor: "#3b82f6", hoverBackgroundColor: "#2563eb", color: "#ffffff" },
    secondary: { backgroundColor: "#6b7280", hoverBackgroundColor: "#4b5563", color: "#ffffff" },
    outline: { backgroundColor: "transparent", hoverBackgroundColor: "#3b82f6", color: "#3b82f6", borderColor: "#3b82f6" },
    text: { backgroundColor: "transparent", hoverBackgroundColor: "#3b82f6", color: "#3b82f6" },
    whiteOutline: { backgroundColor: "transparent", hoverBackgroundColor: "#ffffff", color: "#ffffff", borderColor: "#ffffff" }
  }[variant] : {};

  const legacySizeStyles = size ? {
    sm: { padding: "4px 12px", fontSize: "14px" },
    md: { padding: "8px 16px", fontSize: "16px" },
    lg: { padding: "20px 40px", fontSize: "24px" }
  }[size] : {};

  // Size styles - phone has slightly larger touch targets
  const desktopSizeStyles = {
    small: { padding: "6px 12px", fontSize: "14px", iconSize: "16px" },
    default: { padding: "8px 16px", fontSize: "16px", iconSize: "20px" },
    big: { padding: "20px 40px", fontSize: "24px", iconSize: "32px" }
  };

  const phoneSizeStyles = {
    small: { padding: "8px 14px", fontSize: "14px", iconSize: "16px" },
    default: { padding: "12px 20px", fontSize: "16px", iconSize: "20px" },
    big: { padding: "16px 32px", fontSize: "20px", iconSize: "28px" }
  };

  const sizeStyles = layout === 'phone' ? phoneSizeStyles : desktopSizeStyles;
  const newSizeStyles = buttonSize ? sizeStyles[buttonSize] : sizeStyles.default;

  // Merge legacy styles with new props (new props take precedence)
  const finalFont = {
    family: 'inherit',
    size: newSizeStyles.fontSize || legacySizeStyles.fontSize || '16px',
    weight: (buttonSize === 'big' || size === 'lg') ? '700' : '500',
    color: legacyVariantStyles.color || '#ffffff',
    hoverColor: legacyVariantStyles.color || '#ffffff',
    ...font
  };

  const finalBackgroundColor = backgroundColor || legacyVariantStyles.backgroundColor || "#3b82f6";
  const finalHoverBackgroundColor = hoverBackgroundColor || legacyVariantStyles.hoverBackgroundColor || "#2563eb";
  const finalPadding = padding || newSizeStyles.padding || legacySizeStyles.padding || "8px 16px";

  const finalBorder = {
    width: '2px',
    style: 'solid',
    color: legacyVariantStyles.borderColor || 'transparent',
    radius: '8px',
    hoverColor: 'transparent',
    ...border
  };

  const finalSteamIcon = {
    display: false,
    size: newSizeStyles.iconSize || '20px',
    color: '#ffffff',
    hoverColor: '#ffffff',
    variant: 'default' as const,
    ...steamIcon
  };

  // Define Steam icon URLs based on variant
  const steamIconUrls = {
    default: 'https://imagedelivery.net/demo-media-account/d01541ec-c5b8-4a45-7792-e9e28e3ccd00/public',
    black: 'https://imagedelivery.net/demo-media-account/0b5a96d6-19b6-4d93-dbaf-72390ab96500/public',
    white: 'https://imagedelivery.net/demo-media-account/4e799823-5f62-4c32-e7f4-778eb6143300/public',
    gray: 'https://imagedelivery.net/demo-media-account/3d17b728-bf48-46b7-601c-9cfe12b17800/public'
  };

  // Get the appropriate Steam icon URL
  const steamIconSrc = finalSteamIcon.imageSrc || steamIconUrls[finalSteamIcon.variant as keyof typeof steamIconUrls] || steamIconUrls.default;

  // Handle display property - support both boolean and object format
  const finalDisplay = typeof display === 'boolean'
    ? { text: display }
    : { ...display };

  // Build custom styles
  const customStyles: React.CSSProperties = {
    // Layout
    width: fullWidth ? '100%' : width,
    height,
    padding: finalPadding,
    margin,

    // Typography
    fontFamily: finalFont.family,
    fontSize: finalFont.size,
    fontWeight: finalFont.weight,
    color: finalFont.color,

    // Background and border
    backgroundColor: finalBackgroundColor,
    borderWidth: finalBorder.width,
    borderStyle: finalBorder.style,
    borderColor: finalBorder.color,
    borderRadius: finalBorder.radius,

    // Effects
    transition,
    boxShadow: shadow,

    // Default button properties
    cursor: disabled ? 'not-allowed' : 'pointer',
    outline: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',

    // Merge with provided styles
    ...style,
  };

  // Hover styles (will be applied via CSS-in-JS)
  const hoverStyles = `
    .custom-button .steam-icon-image,
    .custom-button .button-text {
      transition: ${transition};
    }

    .custom-button:hover:not(:disabled) {
      background-color: ${finalHoverBackgroundColor} !important;
      color: ${finalFont.hoverColor} !important;
      border-color: ${finalBorder.hoverColor} !important;
      box-shadow: ${hoverShadow} !important;
    }

    .custom-button:hover:not(:disabled) .steam-icon-image {
      background-color: ${finalSteamIcon.hoverColor || finalSteamIcon.color || '#ffffff'} !important;
    }

    .custom-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .custom-button:focus {
      outline: 2px solid ${finalBackgroundColor};
      outline-offset: 2px;
    }
  `;

  return (
    <>
      <style>{hoverStyles}</style>
      <div className="button-placeholder">
        <button
          type={type}
          className={`custom-button ${className}`}
          style={customStyles}
          disabled={disabled}
          data-pf-platform="pf-steam-desktop"
        >
          {/* Custom image */}
          {image?.display && image?.src && (
            <img
              src={image.src}
              alt={image.alt || "Button image"}
              style={{
                width: image.width ? `${image.width}px` : 'auto',
                height: image.height ? `${image.height}px` : 'auto',
                order: image.position === 'right' ? 2 : image.position === 'center' ? 1 : 0,
              }}
              className="button-image"
            />
          )}

          {/* Steam icon */}
          {finalSteamIcon?.display && (
            <span
              aria-label={finalSteamIcon.imageAlt || "Steam"}
              style={{
                width: finalSteamIcon.size,
                height: finalSteamIcon.size,
                order: 0,
                // Use mask to colorize SVG
                WebkitMaskImage: `url(${steamIconSrc})`,
                maskImage: `url(${steamIconSrc})`,
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                backgroundColor: finalSteamIcon.color || '#ffffff',
                transition,
                display: 'inline-block',
              } as React.CSSProperties}
              className="steam-icon-image"
            />
          )}

          {/* Button text */}
          {finalDisplay.text && (
            <span
              className="button-text"
              style={{
                order: 1,
              }}
            >
              {children || text}
            </span>
          )}
        </button>
      </div>
    </>
  );
};

export default Button;
