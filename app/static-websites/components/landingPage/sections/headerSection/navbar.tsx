import React from "react";
import Logotype from "./logotype";
import Button from "../buttonSection/button";
import Hamburger from "./hamburger";
import SteamWidgetCropBuy from "../widgetsSection/steamWidgetCropBuy";
import SteamWidgetCropInstall from "../widgetsSection/steamWidgetCropInstall";
import SteamWidgetCropWishlist from "../widgetsSection/steamWidgetCropWishlist";
import type { NavbarProps } from '../../../types';

type Position = "start" | "center" | "end" | "custom";

const Navbar: React.FC<NavbarProps & { layout?: 'desktop' | 'phone' }> = ({
  logo,
  button,
  widget,
  hamburger,
  logoPosition = "start" as Position,
  position = "relative",
  className = "",
  display = true,
  layout: layoutMode = 'desktop',
}) => {
  // If display is false, don't render the component
  if (!display) return null;

  const isPhone = layoutMode === 'phone';

  // Check if button, widget and hamburger should be displayed
  const showButton = button && button.display !== false;
  const showWidget = widget && widget.display !== false && widget.gameId && widget.type;
  // No hamburger on phone layout
  const showHamburger = !isPhone && (hamburger === undefined || (hamburger && hamburger.display !== false));
  const showRightElements = showButton || showWidget || showHamburger;

  const renderLogo = () => {
    if (!logo) return null;
    // Support legacy string logo (URL) or object with path
    if (typeof logo === 'string') {
      const trimmed = logo.trim();
      if (!trimmed) return null;
      return <Logotype logo={{ path: trimmed }} />;
    }
    const { path, alt, width, height } = logo;
    const finalPath = typeof path === 'string' && path.trim() !== '' ? path.trim() : undefined;
    if (!finalPath) return null; // don't render if no usable path
    return <Logotype logo={{ path: finalPath, alt: alt, width: width as any, height: height as any }} />;
  };

  // Phone layout: simplified right elements (widget or button, no hamburger)
  // Note: CTA button is always hidden on small screens (sm breakpoint)
  const renderPhoneRightElements = () => {
    return (
      <div className="flex items-center gap-2">
        {showWidget && (
          <div className="navbar-widget flex-shrink-0" style={{ minWidth: 'fit-content' }}>
            {widget!.type === 'buy' && (
              <SteamWidgetCropBuy
                gameId={widget!.gameId}
                scale={(widget!.scale || 1) * 0.85}
                className="steam-widget-crop"
                utm={widget!.utm}
              />
            )}
            {widget!.type === 'install' && (
              <SteamWidgetCropInstall
                gameId={widget!.gameId}
                scale={(widget!.scale || 1) * 0.85}
                className="steam-widget-crop"
                utm={widget!.utm}
              />
            )}
            {widget!.type === 'wishlist' && (
              <SteamWidgetCropWishlist
                gameId={widget!.gameId}
                scale={(widget!.scale || 1) * 0.85}
                className="steam-widget-crop"
                utm={widget!.utm}
              />
            )}
          </div>
        )}
        {/* CTA button hidden on small screens */}
        {showButton && !showWidget && (
          <div className="hidden sm:block">
            <Button
              {...button}
              buttonSize="small"
              layout="phone"
            />
          </div>
        )}
      </div>
    );
  };

  const renderRightElements = () => {
    if (!showRightElements) return null;

    return (
      <div className="hidden sm:flex items-center gap-4">
        {showButton && (
          <Button
            {...button}
          />
        )}
        {showWidget && (
          <div className="navbar-widget flex-shrink-0" style={{ minWidth: 'fit-content' }}>
            {widget!.type === 'buy' && (
              <SteamWidgetCropBuy
                gameId={widget!.gameId}
                scale={widget!.scale || 1}
                className="steam-widget-crop"
                utm={widget!.utm}
              />
            )}
            {widget!.type === 'install' && (
              <SteamWidgetCropInstall
                gameId={widget!.gameId}
                scale={widget!.scale || 1}
                className="steam-widget-crop"
                utm={widget!.utm}
              />
            )}
            {widget!.type === 'wishlist' && (
              <SteamWidgetCropWishlist
                gameId={widget!.gameId}
                scale={widget!.scale || 1}
                className="steam-widget-crop"
                utm={widget!.utm}
              />
            )}
          </div>
        )}
        {showHamburger && (
          <Hamburger
            links={hamburger?.links || [
              { id: '1', text: 'Link 1', url: '#' },
              { id: '2', text: 'Link 2', url: '#' },
              { id: '3', text: 'Link 3', url: '#' }
            ]}
            onLinkClick={hamburger?.onLinkClick}
          />
        )}
      </div>
    );
  };

  // Handle different logo position layouts
  const getLayoutClasses = () => {
    if (logoPosition === "center") {
      return {
        container: "justify-center",
        leftSide: showRightElements ? "hidden sm:absolute sm:left-0" : "hidden",
        logoSection: "flex justify-center w-full",
        rightSide: showRightElements ? "hidden sm:absolute sm:right-0" : "hidden"
      };
    } else if (logoPosition === "end") {
      return {
        // Mobile center; desktop space-between
        container: "justify-center sm:justify-between",
        // When logo at end we render logo in right side; hide left side on mobile
        leftSide: showRightElements ? "hidden sm:flex" : "hidden",
        logoSection: "flex justify-center sm:justify-end w-full sm:w-auto",
        // Right side holds the logo (and possibly right elements if design ever changes)
        rightSide: "flex w-full justify-center sm:w-auto sm:justify-end"
      };
    } else { // start (default)
      return {
        container: "justify-center sm:justify-between",
        leftSide: "flex w-full justify-center sm:justify-start sm:w-auto",
        logoSection: "flex justify-start", // not used directly in this branch
        rightSide: showRightElements ? "hidden sm:flex" : "hidden"
      };
    }
  };

  const layout = getLayoutClasses();

  // Phone layout: logo always centered horizontally
  if (isPhone) {
    const hasLogo = !!renderLogo();

    return (
      <nav
        className={`w-full ${position} top-0 z-50 py-3 px-4 bg-transparent flex items-center ${className}`}
      >
        {hasLogo ? (
          <>
            {/* Left spacer for balance when logo is centered */}
            <div className="flex-1 flex items-center justify-start">
              {/* Empty spacer */}
            </div>

            {/* Center: Logo always centered */}
            <div className="flex items-center justify-center">
              {renderLogo()}
            </div>

            {/* Right: Widget or Button (matches left spacer width for centering) */}
            <div className="flex-1 flex items-center justify-end">
              {renderPhoneRightElements()}
            </div>
          </>
        ) : (
          <>
            {/* No logo: just right-align elements */}
            <div className="flex-1" />
            {renderPhoneRightElements()}
          </>
        )}
      </nav>
    );
  }

  // Desktop layout
  return (
    <nav
      className={`w-full ${position} top-0 z-50 py-4 px-6 bg-transparent flex items-center ${layout.container} ${className}`}
    >
      {logoPosition === "center" ? (
        <>
          {/* Left side for centered layout - empty space or can be used for other elements */}
          <div className={`${layout.leftSide} items-center`} />

          {/* Centered logo */}
          <div className={layout.logoSection}>
            {renderLogo()}
          </div>

          {/* Right side for centered layout */}
          <div className={`${layout.rightSide} items-center`}>
            {renderRightElements()}
          </div>
        </>
      ) : (
        <>
          {/* Left side */}
          <div className={`${layout.leftSide} items-center`}>
            {logoPosition === "start" && renderLogo()}
          </div>

          {/* Right side */}
          <div className={`${layout.rightSide} items-center`}>
            {logoPosition === "start" && renderRightElements()}
            {logoPosition === "end" && renderLogo()}
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
