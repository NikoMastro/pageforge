import React from 'react';
import { MediaUrlPicker } from '../../ui/library';
import type { NavbarOptions } from '../../../types/ui.types';

interface NavbarSettingsProps {
  navbarOptions: NavbarOptions;
  setNavbarOptions: (options: NavbarOptions) => void;
  showWidgetOption?: boolean;
  widgetType?: string;
  preset?: 'Basic' | 'Widget' | 'Full-Content';
  layoutMode?: 'desktop' | 'phone';
}

const NavbarSettings: React.FC<NavbarSettingsProps> = ({
  navbarOptions,
  setNavbarOptions,
  showWidgetOption = false,
  widgetType = '',
  preset: _preset,
  layoutMode = 'phone'
}) => {
  // Note: Position enforcement removed to preserve user's position choice
  // Users can now choose between 'relative', 'sticky', 'fixed', or 'absolute'

  const updateLink = (index: number, field: string, value: any) => {
    const links = [...(navbarOptions.links || [])];
    const current = { ...(links[index] || {}) } as any;
    // Switch type resets the opposite field
    if (field === 'type') {
      if (value === 'url') {
        delete current.sectionId;
        if (!current.href) current.href = '';
      } else {
        delete current.href;
        if (!current.sectionId) current.sectionId = '';
      }
    }
    current[field] = value;
    links[index] = current;
    setNavbarOptions({ ...navbarOptions, links });
  };

  const addLink = () => {
    const links = [...(navbarOptions.links || [])];
    links.push({ text: 'New link', type: 'url', href: '', target: '_self' } as any);
    setNavbarOptions({ ...navbarOptions, links });
  };

  const removeLink = (index: number) => {
    const links = [...(navbarOptions.links || [])];
    links.splice(index, 1);
    setNavbarOptions({ ...navbarOptions, links });
  };

  return (
    <div className="pt-8">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">Navbar Settings</h3>
      <div className="space-y-3">
        {/* Logo URL */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-4">
            <label htmlFor="navLogoUrl" className="block text-sm font-medium text-gray-300">
              Logo URL
            </label>
            <input
              type="text"
              id="navLogoUrl"
              value={navbarOptions.logoUrl}
              onChange={(e) => setNavbarOptions({ ...navbarOptions, logoUrl: e.target.value })}
              className="mt-1 block w-full border border-gray-600 bg-gray-700 text-gray-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
              placeholder="Enter URL for navbar logo"
            />
          </div>
          <div className="md:col-span-1 flex items-end">
            <MediaUrlPicker
              size="md"
              label="Library"
              mediaType="images"
              onPick={(url) => setNavbarOptions({ ...navbarOptions, logoUrl: url })}
            />
          </div>
        </div>

        {/* Logo preview between URL and size */}
        {navbarOptions.logoUrl && (
          <div className="p-2 bg-gray-700 rounded-md flex items-center justify-center">
            <img
              src={navbarOptions.logoUrl}
              alt="Logo preview"
              className="max-h-24 max-w-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const errorMsg = target.nextElementSibling as HTMLElement;
                if (errorMsg) errorMsg.style.display = 'block';
              }}
              onLoad={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'block';
                const errorMsg = target.nextElementSibling as HTMLElement;
                if (errorMsg) errorMsg.style.display = 'none';
              }}
              style={{ width: 'auto', height: `${parseInt((navbarOptions as any).logoHeight as any || '40', 10)}px` }}
            />
            <p className="text-xs text-red-400 mt-1" style={{ display: 'none' }}>
              ⚠️ Unable to load image. Please check the URL.
            </p>
          </div>
        )}

        {/* Single size control (height) for logo */}
        {navbarOptions.logoUrl && (
          <div className="p-3 bg-gray-700 border border-gray-600 rounded-md">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-200">Logo size</label>
              <span className="text-xs text-gray-300">{parseInt(((navbarOptions as any).logoHeight as any) || '40', 10)}px</span>
            </div>
            <input
              type="range"
              min={16}
              max={240}
              step={1}
              value={parseInt(((navbarOptions as any).logoHeight as any) || '40', 10)}
              onChange={(e) => setNavbarOptions({ ...navbarOptions, logo: { ...navbarOptions.logo, height: `${e.target.value}px`, width: 'auto', alt: navbarOptions.logo.alt, src: navbarOptions.logo.src }, ...({ logoHeight: Number(e.target.value) } as any) })}
              className="w-full mt-2"
            />
            <p className="text-[11px] text-gray-400 mt-1">Width auto-scales to keep the image’s aspect ratio.</p>
          </div>
        )}

        {/* Hamburger menu - not available in phone layout */}
        {layoutMode !== 'phone' && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="navDisplayHamburger"
              checked={navbarOptions.displayHamburger}
              onChange={(e) => setNavbarOptions({ ...navbarOptions, displayHamburger: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="navDisplayHamburger" className="ml-2 block text-sm text-gray-300">
              Display hamburger menu
            </label>
          </div>
        )}

        {layoutMode !== 'phone' && navbarOptions.displayHamburger && (
          <div className="mt-2 p-3 bg-gray-700 rounded-md space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-200">Hamburger Links</h4>
              <button
                type="button"
                onClick={addLink}
                className="px-2 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-500"
              >Add link</button>
            </div>

            {(navbarOptions.links || []).length === 0 && (
              <p className="text-xs text-gray-300">No links yet. Click "Add link" to create one.</p>
            )}

            <div className="space-y-3">
              {(navbarOptions.links || []).map((link, idx) => (
                <div key={idx} className="p-3 bg-gray-800 border border-gray-600 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium text-gray-300">Link name</label>
                      <input
                        type="text"
                        value={link.text || ''}
                        onChange={(e) => updateLink(idx, 'text', e.target.value)}
                        className="mt-1 block w-full border border-gray-600 bg-gray-700 text-gray-200 rounded-md py-1.5 px-2 text-sm"
                        placeholder="e.g., Features"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-300">Type</label>
                      <select
                        value={(link as any).type || (link.sectionId ? 'section' : 'url')}
                        onChange={(e) => updateLink(idx, 'type', e.target.value)}
                        className="mt-1 block w-full border border-gray-600 bg-gray-700 text-gray-200 rounded-md py-1.5 px-2 text-sm"
                      >
                        <option value="url">URL</option>
                        <option value="section">Section</option>
                      </select>
                    </div>
                    {(((link as any).type || (link.sectionId ? 'section' : 'url')) === 'url') ? (
                      <>
                        <div className="md:col-span-5">
                          <label className="block text-xs font-medium text-gray-300">URL</label>
                          <input
                            type="text"
                            value={link.href || ''}
                            onChange={(e) => updateLink(idx, 'href', e.target.value)}
                            className="mt-1 block w-full border border-gray-600 bg-gray-700 text-gray-200 rounded-md py-1.5 px-2 text-sm"
                            placeholder="https://example.com or /path"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-300">Target</label>
                          <select
                            value={link.target || '_self'}
                            onChange={(e) => updateLink(idx, 'target', e.target.value)}
                            className="mt-1 block w-full border border-gray-600 bg-gray-700 text-gray-200 rounded-md py-1.5 px-2 text-sm"
                          >
                            <option value="_self">Same tab</option>
                            <option value="_blank">New tab</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="md:col-span-7">
                          <label className="block text-xs font-medium text-gray-300">Section ID</label>
                          <input
                            type="text"
                            value={link.sectionId || ''}
                            onChange={(e) => updateLink(idx, 'sectionId', e.target.value)}
                            className="mt-1 block w-full border border-gray-600 bg-gray-700 text-gray-200 rounded-md py-1.5 px-2 text-sm"
                            placeholder="e.g., features"
                          />
                          <p className="text-[11px] text-gray-400 mt-1">Scrolls to element with id="your-section" on the page.</p>
                        </div>
                      </>
                    )}
                    <div className="md:col-span-12 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeLink(idx)}
                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-500"
                      >Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show CTA in navbar - unified control - not available in phone layout */}
        {layoutMode !== 'phone' && (
          <>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="displayNavbarCta"
                checked={showWidgetOption ? navbarOptions.displayNavbarWidget : navbarOptions.displayNavbarButton}
                onChange={(e) => {
                  if (showWidgetOption) {
                    // Widget mode: toggle widget in navbar, ensure button is off
                    setNavbarOptions({
                      ...navbarOptions,
                      displayNavbarWidget: e.target.checked,
                      displayNavbarButton: false
                    });
                  } else {
                    // Button mode: toggle button in navbar, ensure widget is off
                    setNavbarOptions({
                      ...navbarOptions,
                      displayNavbarButton: e.target.checked,
                      displayNavbarWidget: false
                    });
                  }
                }}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="displayNavbarCta" className="ml-2 block text-sm text-gray-300">
                Show CTA in navbar {showWidgetOption ? `(${widgetType} widget)` : '(button)'}
              </label>
            </div>
            {((showWidgetOption && navbarOptions.displayNavbarWidget) || (!showWidgetOption && navbarOptions.displayNavbarButton)) && (
              <div className="mt-2 p-3 bg-gray-700 rounded-md">
                <p className="text-xs text-blue-300">
                  {showWidgetOption
                    ? `This will display the cropped ${widgetType} widget from your widget section in the navbar.`
                    : 'This will copy all settings from your main CTA button but display it as small size in the navbar.'
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NavbarSettings;
