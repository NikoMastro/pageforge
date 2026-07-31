import React, { useState, useMemo, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import JsonGenerator from "../landingpagesconfig/newLpConfiguration";
import Searchbar from "./searchbar";
import type { LandingPageData } from "../../types";
import {
  BellIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  ArrowRightStartOnRectangleIcon,
  WrenchScrewdriverIcon,
  BeakerIcon,
  PhotoIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  ChartBarIcon,
  VideoCameraIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowPathIcon,
  BookmarkIcon,
  FolderOpenIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "./authContext";
import { useNotifications } from "../ui";
import { useTopNavigation } from "./topNavigationContext";
import { backendUrl } from "../../config/config";

interface NavigationItem {
  name: string;
  href: string;
  current: boolean;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  disabled?: boolean;
  separator?: boolean;
}

const navigation: NavigationItem[] = [
  // { name: "Dashboard", href: "/dashboard", current: false, icon: HomeIcon },
  {
    name: "Landing Pages",
    href: "/",
    current: false,
    icon: DocumentTextIcon,
  },
  {
    name: "LinkBio Pages",
    href: "/linkbio",
    current: false,
    icon: DocumentTextIcon,
    separator: true,
  },
  {
    name: "Library",
    href: "/library",
    current: false,
    icon: PhotoIcon,
  },
  {
    name: "Video Generator",
    href: "/vidGen",
    current: false,
    icon: VideoCameraIcon,
    separator: true,
  },
  {
    name: "Configs",
    href: "/configs",
    current: false,
    icon: WrenchScrewdriverIcon,
  },
  {
    name: "Experiments",
    href: "/experiments",
    current: false,
    icon: WrenchScrewdriverIcon,
    separator: true,
  },
  {
    name: "URL Tester",
    href: "/url-tester",
    current: false,
    icon: ChartBarIcon,
  },
];

const devNavigation: NavigationItem[] = [
  { name: "Components", href: "/dev_components", current: false, icon: CodeBracketIcon },
  { name: "Test-LPs", href: "/dev_lps", current: false, icon: DocumentTextIcon },
  { name: "Test-LinkBio", href: "/dev_testlinkbio", current: false, icon: DocumentTextIcon },
  { name: "Sandbox", href: "/dev_sandbox", current: false, icon: BeakerIcon },
];


function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

function Navigation() {
  const [showJsonGenerator, setShowJsonGenerator] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [collapsed] = useState(false);
  const [isDevSectionOpen, setIsDevSectionOpen] = useState(false);
  const [isExperimentsCreateOpen, setIsExperimentsCreateOpen] = useState(false);
  const [showInvalidateCacheDialog, setShowInvalidateCacheDialog] = useState(false);
  const [isInvalidatingCache, setIsInvalidatingCache] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { info } = useNotifications();

  // Get navigation context
  const ctx = useTopNavigation();

  const handleSearch = (query: string) => {
    if (ctx) {
      ctx.setSearchQuery(query);
    }
  };

  const handleSearchClear = () => {
    if (ctx) {
      ctx.setSearchQuery('');
    }
  };

  const handleAddConfig = (
    _name: string,
    _jsonConfig: LandingPageData
  ) => {
    closeSidePanel();
    closeModal();
  };

  const closeSidePanel = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowSidePanel(false);
      setShowJsonGenerator(false);
      setIsClosing(false);
    }, 200);
  };

  const toggleSidePanel = () => {
    if (showSidePanel) {
      closeSidePanel();
    } else {
      setShowSidePanel(true);
      setShowJsonGenerator(true);
      setIsOpening(true);
      setTimeout(() => {
        setIsOpening(false);
      }, 50);
    }
  };

  useEffect(() => {
    const handleExperimentsOpened = () => setIsExperimentsCreateOpen(true);
    const handleExperimentsClosed = () => setIsExperimentsCreateOpen(false);

    window.addEventListener("experiments:create-modal-opened", handleExperimentsOpened);
    window.addEventListener("experiments:open-create-modal", handleExperimentsOpened);
    window.addEventListener("experiments:create-modal-closed", handleExperimentsClosed);
    window.addEventListener("experiments:close-create-modal", handleExperimentsClosed);

    return () => {
      window.removeEventListener("experiments:create-modal-opened", handleExperimentsOpened);
      window.removeEventListener("experiments:open-create-modal", handleExperimentsOpened);
      window.removeEventListener("experiments:create-modal-closed", handleExperimentsClosed);
      window.removeEventListener("experiments:close-create-modal", handleExperimentsClosed);
    };
  }, []);

  useEffect(() => {
    if (!location.pathname.startsWith("/experiments")) {
      setIsExperimentsCreateOpen(false);
    }
  }, [location.pathname]);

  // Determine which page we're on and configure button accordingly
  const buttonConfig = useMemo(() => {
    const path = location.pathname;

    // Landing Pages
    if (path === '/' || path.startsWith('/landing-pages/') || path.startsWith('/LandingPages/') || path.startsWith('/json/')) {
      const isOnEditPage = path.startsWith('/landing-pages/') || path.startsWith('/LandingPages/') || path.startsWith('/json/');
      return {
        newLabel: 'New LP',
        closeLabel: 'Close',
        isInEditMode: showSidePanel || isOnEditPage,
        action: () => {
          if (showSidePanel) {
            closeSidePanel();
          } else if (isOnEditPage) {
            navigate('/');
          } else {
            toggleSidePanel();
          }
        },
        showButton: true
      };
    }

    // LinkBio
    if (path.startsWith('/linkbio')) {
      const isOnEditPage = path.includes('/linkbio/') && path !== '/linkbio';
      return {
        newLabel: 'New LinkBio',
        closeLabel: 'Close',
        isInEditMode: isOnEditPage,
        action: () => {
          if (isOnEditPage) {
            navigate('/linkbio');
          } else {
            navigate('/linkbio/new');
          }
        },
        showButton: true
      };
    }

    // Video Gen
    if (path.startsWith('/vidGen')) {
      const isOnEditPage = path.includes('/vidGen/') && path !== '/vidGen';
      return {
        newLabel: 'New Video',
        closeLabel: 'Close',
        isInEditMode: isOnEditPage,
        action: () => {
          if (isOnEditPage) {
            navigate('/vidGen');
          } else {
            navigate('/vidGen/new');
          }
        },
        showButton: true,
        showConfigButtons: isOnEditPage, // Show config buttons only on edit page
      };
    }

    // Configs
    if (path.startsWith('/configs')) {
      const isOnEditPage = path.includes('/configs/') && path !== '/configs';
      return {
        newLabel: 'New Config',
        closeLabel: 'Close',
        isInEditMode: isOnEditPage,
        action: () => {
          if (isOnEditPage) {
            navigate('/configs');
          } else {
            navigate('/configs/new');
          }
        },
        showButton: true
      };
    }

    // Library
    if (path.startsWith('/library')) {
      return {
        newLabel: 'Upload',
        closeLabel: 'Upload',
        isInEditMode: false,
        icon: ArrowUpTrayIcon,
        action: () => {
          // Dispatch event to open the upload modal in the Library page
          window.dispatchEvent(new Event('library:open-upload-modal'));
        },
        showButton: true
      };
    }

    // Experiments
    if (path.startsWith('/experiments')) {
      const isOnEditPage = path.includes('/experiments/') && path !== '/experiments';
      const isCreatePanelOpen = !isOnEditPage && isExperimentsCreateOpen;
      return {
        newLabel: 'New Exp',
        closeLabel: 'Close',
        isInEditMode: isOnEditPage || isCreatePanelOpen,
        icon: isOnEditPage || isCreatePanelOpen ? XMarkIcon : PlusIcon,
        action: () => {
          if (isOnEditPage) {
            navigate('/experiments');
          } else if (isCreatePanelOpen) {
            window.dispatchEvent(new Event('experiments:close-create-modal'));
          } else {
            window.dispatchEvent(new Event('experiments:open-create-modal'));
          }
        },
        showButton: true
      };
    }

    // URL Tester
    if (path.startsWith('/url-tester')) {
      return {
        newLabel: 'Scan URL',
        closeLabel: 'Close',
        isInEditMode: false,
        action: () => {
          // Dispatch event to open the scan modal in the URL Tester page
          window.dispatchEvent(new Event('url-tester:open-scan-modal'));
        },
        showButton: true
      };
    }

    // Default - hide button for other pages
    return {
      newLabel: '',
      closeLabel: '',
      isInEditMode: false,
      action: () => { },
      showButton: false
    };
  }, [location.pathname, navigate, showSidePanel, closeSidePanel, toggleSidePanel]);

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowJsonGenerator(false);
      setIsClosing(false);
    }, 200);
  };

  // Close any open LP creation UI when navigating to another route
  const handleNavigateAway = () => {
    if (showSidePanel) {
      // Use existing animated closer
      closeSidePanel();
    } else if (showJsonGenerator) {
      closeModal();
    }
  };

  const handleInvalidateCache = async () => {
    setShowInvalidateCacheDialog(false);
    setIsInvalidatingCache(true);
    info('Invalidation in progress');
    
    try {
      const response = await fetch(`${backendUrl}/edge-purge/invalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        info('Cache invalidated successfully');
      } else {
        info('Failed to invalidate cache');
      }
    } catch (error) {
      console.error('Error invalidating cache:', error);
      info('Error invalidating cache');
    } finally {
      setIsInvalidatingCache(false);
    }
  };

  return (
    <>
      <nav
        className={classNames(
          "bg-gray-900 h-screen pt-4 flex flex-col relative z-[80] transition-[width] duration-200 overflow-hidden",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Header section with PageForge title and logo (expanded) or compact logo (collapsed) */}
        {!collapsed ? (
          <div className="px-6 pb-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white font-['Chakra_Petch'] text-center">
                PageForge
              </h1>
              <div className="flex items-center justify-center space-x-2">
                <p className="text-gray-300 text-sm">landing page studio</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-2 pb-4 flex items-center justify-center">
            <img
              alt="PageForge logo"
              src="https://imagedelivery.net/demo-media-account/9e699f20-0462-463a-d06a-e86d5f95a000/public"
              className="h-10 w-auto"
            />
          </div>
        )}

        {/* Searchbar */}
        {!collapsed && (
          <div className="px-6 mb-4">
            <Searchbar
              placeholder="Search..."
              value={ctx?.searchQuery || ''}
              onSearch={handleSearch}
              onClear={handleSearchClear}
              className="w-full"
            />
          </div>
        )}

        <div className={classNames("mb-6", collapsed ? "px-2" : "px-6")}>
          {/* Dynamic button based on current route */}
          {buttonConfig.showButton && (
            collapsed ? (
              <button
                type="button"
                onClick={buttonConfig.action}
                className="w-full flex items-center justify-center rounded-md bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors duration-200"
                aria-label={buttonConfig.isInEditMode ? buttonConfig.closeLabel : buttonConfig.newLabel}
                title={buttonConfig.isInEditMode ? buttonConfig.closeLabel : buttonConfig.newLabel}
              >
                {buttonConfig.icon ? (
                  <buttonConfig.icon className="h-5 w-5" />
                ) : (
                  <PlusIcon className="h-5 w-5" />
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={buttonConfig.action}
                className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {buttonConfig.icon && (
                  <buttonConfig.icon className="h-5 w-5" />
                )}
                {buttonConfig.isInEditMode ? buttonConfig.closeLabel : buttonConfig.newLabel}
              </button>
            )
          )}

        </div>
        {/* Navigation menu - flex-1 with overflow-y-auto to enable scrolling */}
        <div className={classNames("flex-1 overflow-y-auto", collapsed ? "px-2" : "px-4")}>
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const IconComponent = item.icon;
              const isDisabled = item.disabled;

              return (
                <li key={item.name}>
                  {isDisabled ? (
                    <div
                      className={classNames(
                        "text-gray-500 cursor-not-allowed opacity-50",
                        "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                        collapsed ? "justify-center" : ""
                      )}
                      title="Coming soon"
                    >
                      <IconComponent
                        className={classNames("h-5 w-5", collapsed ? "" : "mr-3")}
                        aria-hidden="true"
                      />
                      {!collapsed && item.name}
                    </div>
                  ) : (
                    <>
                      <Link
                        to={item.href}
                        className={classNames(
                          isActive
                            ? "bg-gray-700 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white",
                          "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                          collapsed ? "justify-center" : ""
                        )}
                        title={item.name}
                        onClick={handleNavigateAway}
                      >
                        <IconComponent
                          className={classNames("h-5 w-5", collapsed ? "" : "mr-3")}
                          aria-hidden="true"
                        />
                        {!collapsed && item.name}
                      </Link>
                      {item.separator && (
                        <div className="my-2 border-t border-gray-700" />
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Page-specific filters and view modes in 2-column grid */}
        {!collapsed && ctx && (
          <div className={classNames("px-4 mb-4")}>
            {/* Library Filters and View Mode */}
            {location.pathname.startsWith('/library') && (
              <div className="space-y-2 mb-3">
                {/* Media Type Filters */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'all', label: 'All', Icon: Squares2X2Icon },
                    { value: 'images', label: 'Images', Icon: PhotoIcon },
                    { value: 'videos', label: 'Videos', Icon: VideoCameraIcon },
                  ].map(({ value, label, Icon }) => {
                    const isActive = (ctx.filters.mediaType || 'all') === value;
                    return (
                      <button
                        key={value}
                        onClick={() => ctx.setFilters({ ...ctx.filters, mediaType: value as any })}
                        className={`
                          px-2 py-2 rounded-md text-xs font-medium transition-colors
                          flex items-center justify-center gap-1.5
                          ${isActive
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}
                        `}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Separator */}
                <div className="border-t border-gray-700" />

                {/* View Mode */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'list', label: 'List', Icon: ListBulletIcon },
                    { value: 'cards', label: 'Grid', Icon: Squares2X2Icon },
                  ].map(({ value, label, Icon }) => {
                    const isActive = ctx.viewMode === value;
                    return (
                      <button
                        key={value}
                        onClick={() => ctx.setViewMode(value as any)}
                        className={`
                          px-2 py-2 rounded-md text-xs font-medium transition-colors
                          flex items-center justify-center gap-1.5
                          ${isActive
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}
                        `}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Landing Pages View Mode */}
            {location.pathname === '/' && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { value: 'list', label: 'List', Icon: ListBulletIcon },
                  { value: 'cards', label: 'Cards', Icon: Squares2X2Icon }
                ].map(({ value, label, Icon }) => {
                  const isActive = ctx.viewMode === value;
                  return (
                    <button
                      key={value}
                      onClick={() => ctx.setViewMode(value as any)}
                      className={`
                        px-2 py-2 rounded-md text-xs font-medium transition-colors
                        flex items-center justify-center gap-1.5
                        ${isActive
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}
                      `}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Configs View Mode */}
            {location.pathname === '/configs' && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { value: 'list', label: 'List', Icon: ListBulletIcon },
                  { value: 'cards', label: 'Cards', Icon: Squares2X2Icon }
                ].map(({ value, label, Icon }) => {
                  const isActive = ctx.viewMode === value;
                  return (
                    <button
                      key={value}
                      onClick={() => ctx.setViewMode(value as any)}
                      className={`
                        px-2 py-2 rounded-md text-xs font-medium transition-colors
                        flex items-center justify-center gap-1.5
                        ${isActive
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}
                      `}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Configuration buttons for Video Gen */}
            {buttonConfig.showConfigButtons && (
              <div className="mb-3 flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (ctx.onLoadConfiguration) {
                      ctx.onLoadConfiguration();
                    }
                  }}
                  className="flex-1 rounded-md bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-300 shadow-sm hover:bg-gray-700 border border-gray-700 transition-colors duration-200 flex items-center justify-center gap-1.5"
                  title="Load Configuration"
                >
                  <FolderOpenIcon className="h-4 w-4" />
                  Load
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (ctx.onSaveConfiguration) {
                      ctx.onSaveConfiguration();
                    }
                  }}
                  className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors duration-200 flex items-center justify-center gap-1.5"
                  title="Save Configuration"
                >
                  <BookmarkIcon className="h-4 w-4" />
                  Save
                </button>
              </div>
            )}

            {/* Refresh Button */}
            {ctx.refreshCallback && typeof ctx.refreshCallback === 'function' && (
              <div>
                <button
                  onClick={async () => {
                    if (ctx.refreshCallback && typeof ctx.refreshCallback === 'function') {
                      ctx.setIsRefreshing(true);
                      try {
                        await ctx.refreshCallback();
                      } finally {
                        ctx.setIsRefreshing(false);
                      }
                    }
                  }}
                  disabled={ctx.isRefreshing}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:cursor-not-allowed text-gray-300 border border-gray-700 rounded-md transition-colors text-sm font-medium"
                >
                  <ArrowPathIcon className={`w-4 h-4 ${ctx.isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Profile section at bottom */}
        <div className={classNames("pb-4 mt-auto", collapsed ? "px-2" : "px-4")}>
          <div
            className={classNames(
              "gap-2",
              collapsed ? "flex flex-col items-center" : "flex items-center justify-end"
            )}
          >
            {/* Dev dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDevSectionOpen(!isDevSectionOpen)}
                className="relative shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
                title="Dev"
                aria-label="Dev tools"
              >
                <span className="absolute -inset-1.5" />
                <CodeBracketIcon className="size-6" aria-hidden="true" />
              </button>
              {isDevSectionOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsDevSectionOpen(false)}
                  />
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 w-48 rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 border border-gray-700">
                    <div className="py-1">
                      {devNavigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        const IconComponent = item.icon;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            className={classNames(
                              isActive
                                ? "bg-gray-700 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white",
                              "group flex items-center px-4 py-2 text-sm"
                            )}
                            onClick={() => {
                              setIsDevSectionOpen(false);
                              handleNavigateAway();
                            }}
                          >
                            <IconComponent
                              className="mr-3 h-5 w-5"
                              aria-hidden="true"
                            />
                            {item.name}
                          </Link>
                        );
                      })}
                      <div className="border-t border-gray-700 my-1" />
                      <button
                        onClick={() => {
                          setIsDevSectionOpen(false);
                          setShowInvalidateCacheDialog(true);
                        }}
                        disabled={isInvalidatingCache}
                        className="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-4 py-2 text-sm w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowPathIcon
                          className={`mr-3 h-5 w-5 ${isInvalidatingCache ? 'animate-spin' : ''}`}
                          aria-hidden="true"
                        />
                        Invalidate Cache
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            {/* Notifications (Bell) */}
            <button
              type="button"
              aria-label="Open notifications"
              className="relative shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
              onClick={() => info("No new notifications")}
            >
              <span className="absolute -inset-1.5" />
              <BellIcon aria-hidden="true" className="size-6" />
            </button>
            {/* Logout button */}
            <button
              type="button"
              aria-label="Log out"
              title="Log out"
              className="relative shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white hover:bg-red-600 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden transition-colors duration-200"
              onClick={() => void signOut()}
            >
              <span className="absolute -inset-1.5" />
              <ArrowRightStartOnRectangleIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Side Panel for JsonGenerator */}
      {showSidePanel && (
        <>
          <div
            className={`fixed top-0 right-0 bottom-0 z-[60] transition-all duration-200 ease-out ${isClosing
              ? "opacity-0"
              : isOpening
                ? "opacity-0 animate-pulse"
                : "opacity-25"
              }`}
            style={{ left: collapsed ? "5rem" : "16rem" }}
            onClick={closeSidePanel}
          />

          {/* Side Panel */}
          <div
            className={`fixed top-0 h-full shadow-2xl z-[70] transform transition-all duration-200 ease-out ${isClosing
              ? "-translate-x-full opacity-90 scale-95"
              : isOpening
                ? "-translate-x-full opacity-0 scale-98"
                : "translate-x-0 opacity-100 scale-100"
              }`}
            style={{
              left: collapsed ? "5rem" : "16rem",
              width: collapsed ? "calc(100vw - 5rem)" : "calc(100vw - 16rem)",
              boxShadow:
                isClosing || isOpening
                  ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  : "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
            }}
          >
            {/* Panel Content */}
            <div
              className={`h-full overflow-hidden transition-all duration-200 ${isClosing
                ? "opacity-0 translate-x-4 delay-0"
                : isOpening
                  ? "opacity-0 -translate-x-4 delay-0"
                  : "opacity-100 translate-x-0 delay-75"
                }`}
            >
              <JsonGenerator onAddConfig={handleAddConfig} isInSidePanel={true} />
            </div>
          </div>
        </>
      )}

      {showJsonGenerator && !showSidePanel && (
        <div
          className="fixed inset-0 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
          style={{
            backgroundColor: "rgba(75, 85, 99, 0.4)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            opacity: isClosing ? 0 : 1,
            transition: "opacity 200ms ease-in-out",
          }}
          onClick={closeModal}
        >
          <div
            className="relative bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[95vh] overflow-hidden"
            style={{
              transform: isClosing ? "scale(0.95)" : "scale(1)",
              opacity: isClosing ? 0 : 1,
              transition: "all 200ms ease-in-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Configure Landing Page
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
              <JsonGenerator onAddConfig={handleAddConfig} isInSidePanel={false} />
            </div>
          </div>
        </div>
      )}

      {/* Invalidate Cache Confirmation Dialog */}
      {showInvalidateCacheDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
          onClick={() => setShowInvalidateCacheDialog(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Invalidate Cache
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to invalidate the cache?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowInvalidateCacheDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInvalidateCache}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Yes, Invalidate
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navigation;
export { Navigation };
