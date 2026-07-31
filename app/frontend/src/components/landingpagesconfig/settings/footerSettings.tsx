import React from 'react';
import type { FooterOptions } from '../../../types/ui.types';
import { Footer as StaticFooter } from '@pageforge/static-websites';
import { MediaUrlPicker } from '../../ui/library';

interface FooterSettingsProps {
  footerOptions: FooterOptions;
  setFooterOptions: (options: FooterOptions) => void;
  layoutMode?: 'desktop' | 'phone';
}

const FooterSettings: React.FC<FooterSettingsProps> = ({
  footerOptions,
  setFooterOptions,
  layoutMode = 'phone'
}) => {
  // Single source of truth for available social platforms
  const allSocialPlatforms = ['discord', 'facebook', 'steam', 'x', 'vk', 'youtube', 'instagram', 'reddit', 'tiktok', 'twitch'] as const;

  // Build props exactly like jsonGenerator.ts to ensure parity with generated JSON
  const buildFooterProps = React.useMemo(() => {
    // Social icons mapping (same as jsonGenerator)
    const socialIconsMap: Record<string, { src: string; alt: string; url: string }> = {
      discord: { src: 'https://imagedelivery.net/demo-media-account/9a1ad639-3adb-48c4-c400-dc68813f6a00/public', alt: 'Discord', url: '' },
      facebook: { src: 'https://imagedelivery.net/demo-media-account/8dc40789-7142-4b3d-bafa-9ca6a4aa4e00/public', alt: 'Facebook', url: '' },
      steam: { src: 'https://imagedelivery.net/demo-media-account/8e981130-ebd3-4132-a394-459b58a15900/public', alt: 'Steam', url: '' },
      x: { src: 'https://imagedelivery.net/demo-media-account/52804243-13c8-4ffc-cd5b-f868506f8e00/public', alt: 'X', url: '' },
      vk: { src: 'https://imagedelivery.net/demo-media-account/b05c09fb-ef07-48e5-1c47-f18a165f7f00/public', alt: 'VK', url: '' },
      youtube: { src: 'https://imagedelivery.net/demo-media-account/2b3c539d-212d-44b9-42a0-d90f6892ab00/public', alt: 'YouTube', url: '' },
      instagram: { src: 'https://imagedelivery.net/demo-media-account/9a058dc8-b12d-4849-3898-dc1f6f554d00/public', alt: 'Instagram', url: '' },
      reddit: { src: 'https://imagedelivery.net/demo-media-account/969462b1-a2cf-4c0e-3b78-04e58a783e00/public', alt: 'Reddit', url: '' },
      tiktok: { src: 'https://imagedelivery.net/demo-media-account/067d46c5-750f-4d25-595b-05bf19301900/public', alt: 'TikTok', url: '' },
      twitch: { src: 'https://imagedelivery.net/demo-media-account/20a3ca3d-cca0-4599-10e3-6fb33daa0800/public', alt: 'Twitch', url: '' }
    };

    const socialIcons = footerOptions.includeSocialIcons && footerOptions.selectedSocialIcons.length > 0
      ? footerOptions.selectedSocialIcons.map((key) => {
        const icon = socialIconsMap[key] || { src: '', alt: key, url: '' };
        const customUrl = (footerOptions.customSocialUrls || {})[key];
        const size = footerOptions.socialIconSize === 'small' ? 16 : footerOptions.socialIconSize === 'large' ? 32 : 24;
        return {
          src: icon.src,
          alt: icon.alt,
          width: size,
          height: size,
          url: customUrl || ''
        };
      })
      : [];

    const linksItems = [
      ...(footerOptions.termsUrl ? [{ text: 'Terms of Service', url: footerOptions.termsUrl, target: '_blank' as const }] : []),
      ...(footerOptions.privacyUrl ? [{ text: 'Privacy Policy', url: footerOptions.privacyUrl, target: '_blank' as const }] : []),
      ...(footerOptions.refundUrl ? [{ text: 'Refund Policy', url: footerOptions.refundUrl, target: '_blank' as const }] : []),
      ...(footerOptions.eulaUrl ? [{ text: 'EULA', url: footerOptions.eulaUrl, target: '_blank' as const }] : []),
      ...(footerOptions.contactUrl ? [{ text: 'Contact Us', url: footerOptions.contactUrl, target: '_blank' as const }] : []),
    ];

    return {
      layout: {
        containerClass: footerOptions.layout?.containerClass,
        gridClass: 'grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-12 items-end sm:items-center gap-y-2 place-items-center sm:place-items-stretch',
        brandColumn: { span: 'col-span-1 sm:col-span-3', alignment: 'center', className: 'text-center sm:text-left' },
        contentColumn: { span: 'col-span-1 sm:col-span-6', alignment: 'center', className: 'text-center' },
        socialColumn: { span: 'col-span-1 sm:col-span-3', alignment: 'center', className: 'text-center sm:text-right' },
        padding: {
          container: footerOptions.layout?.containerPadding,
          sections: footerOptions.layout?.sectionPadding,
          vertical: footerOptions.layout?.verticalPadding,
          horizontal: footerOptions.layout?.horizontalPadding,
        },
        margin: {
          left: footerOptions.layout?.leftMargin,
          right: footerOptions.layout?.rightMargin,
        },
        responsive: {
          mobile: footerOptions.layout?.mobileLayout,
          mobileOrder: footerOptions.layout?.mobileOrder,
        },
      },
      branding: {
        logo: footerOptions.logoUrl ? {
          path: footerOptions.logoUrl,
          alt: 'Logo',
          height: footerOptions.logoHeight ?? footerOptions.logoSize ?? 48,
          className: ''
        } : undefined,
        additionalLogo: footerOptions.hasAdditionalLogo && footerOptions.additionalLogoUrl ? {
          path: footerOptions.additionalLogoUrl,
          alt: 'Additional Logo',
          height: footerOptions.additionalLogoHeight ?? footerOptions.additionalLogoSize ?? 48,
          className: '',
          position: footerOptions.additionalLogoPosition
        } : undefined,
        display: !!(footerOptions.logoUrl || (footerOptions.hasAdditionalLogo && footerOptions.additionalLogoUrl)),
        wrapperClass: ''
      },
      content: {
        copyright: { text: footerOptions.footerText, year: false, display: false, position: 'after', className: '' },
        links: {
          items: linksItems,
          display: linksItems.length > 0,
          separator: ' | ',
          wrapperClass: '',
          linkClass: 'text-gray-300',
          hoverClass: 'text-white hover:underline'
        },
      },
      social: {
        icons: socialIcons,
        display: footerOptions.includeSocialIcons,
        layout: 'horizontal',
        iconSize: footerOptions.socialIconSize || 'medium',
        spacing: '4px',
        wrapperClass: '',
        iconClass: '',
        hoverEffects: true,
        iconOverrides: {}
      },
      backgroundColor: footerOptions.backgroundColor,
      textColor: footerOptions.textColor,
      className: '',
      display: true
    } as const;
  }, [footerOptions]);

  return (
    <div className="pt-8">
      <h3 className="font-medium text-white mb-3">Footer Settings</h3>
      <p className="text-sm text-gray-300 mb-4">Configure your footer layout, content, and social icons</p>

      <div className="space-y-6">
        {/* Basic Content (logos only) */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md">
          <h4 className="font-medium text-gray-200 mb-4">Basic Content</h4>
          <div className="space-y-3">
            <div>
              <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-200">
                Logo URL
              </label>
              <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                <input
                  type="text"
                  id="logoUrl"
                  value={footerOptions.logoUrl}
                  onChange={(e) => setFooterOptions({ ...footerOptions, logoUrl: e.target.value })}
                  className="mt-1 block w-full border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter URL for footer logo"
                />
                <MediaUrlPicker
                  size="md"
                  label="Library"
                  mediaType="images"
                  onPick={(url) => setFooterOptions({ ...footerOptions, logoUrl: url })}
                />
              </div>
            </div>

            {footerOptions.logoUrl && (
              <SingleSizeControl
                label="Primary logo size"
                size={footerOptions.logoHeight ?? footerOptions.logoSize ?? 48}
                onChange={(s) => setFooterOptions({ ...footerOptions, logoHeight: s, logoSize: s, logoWidth: undefined })}
                min={16}
                max={320}
              />
            )}

            {/* Additional Logo Section */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasAdditionalLogo"
                checked={footerOptions.hasAdditionalLogo}
                onChange={(e) => setFooterOptions({ ...footerOptions, hasAdditionalLogo: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 bg-gray-700 rounded"
              />
              <label htmlFor="hasAdditionalLogo" className="ml-2 block text-sm font-medium text-gray-200">
                Add second logotype
              </label>
            </div>

            {footerOptions.hasAdditionalLogo && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="additionalLogoUrl" className="block text-sm font-medium text-gray-200 mb-1">
                      Second Logo URL
                    </label>
                    <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                      <input
                        type="text"
                        id="additionalLogoUrl"
                        value={footerOptions.additionalLogoUrl}
                        onChange={(e) => setFooterOptions({ ...footerOptions, additionalLogoUrl: e.target.value })}
                        className="block w-full border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="https://example.com/second-logo.png"
                      />
                      <MediaUrlPicker
                        size="md"
                        label="Library"
                        mediaType="images"
                        onPick={(url) => setFooterOptions({ ...footerOptions, additionalLogoUrl: url })}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="additionalLogoPosition" className="block text-sm font-medium text-gray-200 mb-1">
                      Second Logo Position
                    </label>
                    <select
                      id="additionalLogoPosition"
                      value={footerOptions.additionalLogoPosition}
                      onChange={(e) => setFooterOptions({ ...footerOptions, additionalLogoPosition: e.target.value as 'above' | 'below' | 'beside' })}
                      className="block w-full border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="above">Above primary logo</option>
                      <option value="below">Below primary logo</option>
                      <option value="beside">Beside primary logo</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-400">
                      Choose where the second logo appears relative to the primary logo
                    </p>
                  </div>
                </div>

                {footerOptions.additionalLogoUrl && (
                  <SingleSizeControl
                    label="Second logo size"
                    size={footerOptions.additionalLogoHeight ?? footerOptions.additionalLogoSize ?? 48}
                    onChange={(s) => setFooterOptions({ ...footerOptions, additionalLogoHeight: s, additionalLogoSize: s, additionalLogoWidth: undefined })}
                    min={16}
                    max={320}
                  />
                )}
              </div>
            )}

            {/* Logo Preview Section: visible as soon as a primary logo URL is provided */}
            {(footerOptions.logoUrl || (footerOptions.hasAdditionalLogo && footerOptions.additionalLogoUrl)) && (
              <div className="mt-4 p-4 bg-gray-600 rounded-md">
                <label className="block text-sm font-medium text-gray-200 mb-2">Logo Preview</label>
                <div className="flex flex-col items-center space-y-2">
                  {footerOptions.hasAdditionalLogo && footerOptions.additionalLogoPosition === 'above' && footerOptions.additionalLogoUrl && (
                    <img
                      src={footerOptions.additionalLogoUrl}
                      alt="Second Logo Preview"
                      style={{ height: `${footerOptions.additionalLogoHeight ?? footerOptions.additionalLogoSize ?? 48}px`, width: 'auto' }}
                      className="object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}

                  <div className={`flex items-center ${footerOptions.hasAdditionalLogo && footerOptions.additionalLogoPosition === 'beside' ? 'space-x-4' : ''}`}>
                    {footerOptions.logoUrl && (
                      <img
                        src={footerOptions.logoUrl}
                        alt="Primary Logo Preview"
                        style={{ height: `${footerOptions.logoHeight ?? footerOptions.logoSize ?? 48}px`, width: 'auto' }}
                        className="object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}

                    {footerOptions.hasAdditionalLogo && footerOptions.additionalLogoPosition === 'beside' && footerOptions.additionalLogoUrl && (
                      <img
                        src={footerOptions.additionalLogoUrl}
                        alt="Second Logo Preview"
                        style={{ height: `${footerOptions.additionalLogoHeight ?? footerOptions.additionalLogoSize ?? 48}px`, width: 'auto' }}
                        className="object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>

                  {footerOptions.hasAdditionalLogo && footerOptions.additionalLogoPosition === 'below' && footerOptions.additionalLogoUrl && (
                    <img
                      src={footerOptions.additionalLogoUrl}
                      alt="Second Logo Preview"
                      style={{ height: `${footerOptions.additionalLogoHeight ?? footerOptions.additionalLogoSize ?? 48}px`, width: 'auto' }}
                      className="object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Links */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md">
          <h4 className="font-medium text-gray-200 mb-4">Links</h4>
          <div className="space-y-3">
            <div>
              <label htmlFor="termsUrl" className="block text-sm font-medium text-gray-200">
                Terms of Service URL
              </label>
              <input
                type="text"
                id="termsUrl"
                value={footerOptions.termsUrl}
                onChange={(e) => setFooterOptions({ ...footerOptions, termsUrl: e.target.value })}
                className="mt-1 block w-full border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="https://example.com/terms"
              />
            </div>

            <div>
              <label htmlFor="privacyUrl" className="block text-sm font-medium text-gray-200">
                Privacy Policy URL
              </label>
              <input
                type="text"
                id="privacyUrl"
                value={footerOptions.privacyUrl}
                onChange={(e) => setFooterOptions({ ...footerOptions, privacyUrl: e.target.value })}
                className="mt-1 block w-full border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="https://example.com/privacy"
              />
            </div>

            <div>
              <label htmlFor="refundUrl" className="block text-sm font-medium text-gray-200">
                Refund Policy URL
              </label>
              <input
                type="text"
                id="refundUrl"
                value={footerOptions.refundUrl}
                onChange={(e) => setFooterOptions({ ...footerOptions, refundUrl: e.target.value })}
                className="mt-1 block w-full border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="https://example.com/refund-policy"
              />
            </div>

            <div>
              <label htmlFor="eulaUrl" className="block text-sm font-medium text-gray-200">
                End User License Agreement (EULA) URL
              </label>
              <input
                type="text"
                id="eulaUrl"
                value={footerOptions.eulaUrl}
                onChange={(e) => setFooterOptions({ ...footerOptions, eulaUrl: e.target.value })}
                className="mt-1 block w-full border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="https://example.com/eula"
              />
            </div>

            <div>
              <label htmlFor="contactUrl" className="block text-sm font-medium text-gray-200">
                Contact Us URL
              </label>
              <input
                type="text"
                id="contactUrl"
                value={footerOptions.contactUrl}
                onChange={(e) => setFooterOptions({ ...footerOptions, contactUrl: e.target.value })}
                className="mt-1 block w-full border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="https://example.com/contact"
              />
            </div>
          </div>
        </div>

        {/* Footer Text (moved below Links) */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md">
          <h4 className="font-medium text-gray-200 mb-4">Footer Text</h4>
          <div className="space-y-3">
            <div>
              <label htmlFor="footerText" className="block text-sm font-medium text-gray-200">
                Footer Text
              </label>
              <textarea
                id="footerText"
                rows={3}
                value={footerOptions.footerText}
                onChange={(e) => setFooterOptions({ ...footerOptions, footerText: e.target.value })}
                className="mt-1 block w-full border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Write your footer text..."
              />
              <p className="mt-1 text-xs text-gray-400">Long text is supported and will wrap on small screens.</p>
            </div>
          </div>
        </div>

        {/* Social Icons */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md">
          <h4 className="font-medium text-gray-200 mb-4">Social Icons</h4>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeSocialIcons"
                checked={footerOptions.includeSocialIcons}
                onChange={(e) =>
                  setFooterOptions({
                    ...footerOptions,
                    includeSocialIcons: e.target.checked,
                    // When enabling social icons, automatically select all platforms
                    selectedSocialIcons: e.target.checked
                      ? [...allSocialPlatforms]
                      : footerOptions.selectedSocialIcons
                  })
                }
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 bg-gray-700 rounded"
              />
              <label htmlFor="includeSocialIcons" className="ml-2 block text-sm text-gray-200">
                Include social icons
              </label>
            </div>

            {footerOptions.includeSocialIcons && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Select Social Platforms
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {allSocialPlatforms.map((platform) => (
                      <label key={platform} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={footerOptions.selectedSocialIcons.includes(platform)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFooterOptions({
                                ...footerOptions,
                                selectedSocialIcons: [...footerOptions.selectedSocialIcons, platform]
                              });
                            } else {
                              setFooterOptions({
                                ...footerOptions,
                                selectedSocialIcons: footerOptions.selectedSocialIcons.filter(p => p !== platform)
                              });
                            }
                          }}
                          className="form-checkbox h-4 w-4 text-indigo-600 border-gray-600 bg-gray-700"
                        />
                        <span className="ml-2 capitalize text-gray-200">{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Icon Size
                  </label>
                  <select
                    value={footerOptions.socialIconSize}
                    onChange={(e) => setFooterOptions({
                      ...footerOptions,
                      socialIconSize: e.target.value as 'small' | 'medium' | 'large'
                    })}
                    className="mt-1 block w-full border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                {/* Custom URLs for selected social icons */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Custom URLs for Social Icons
                  </label>
                  {footerOptions.selectedSocialIcons.map((platform) => (
                    <div key={platform}>
                      <label htmlFor={`${platform}Url`} className="block text-xs font-medium text-gray-400 capitalize">
                        {platform} URL
                      </label>
                      <input
                        type="text"
                        id={`${platform}Url`}
                        value={footerOptions.customSocialUrls?.[platform as keyof typeof footerOptions.customSocialUrls] || ''}
                        onChange={(e) => setFooterOptions({
                          ...footerOptions,
                          customSocialUrls: {
                            ...footerOptions.customSocialUrls,
                            [platform]: e.target.value
                          }
                        })}
                        className="mt-1 block w-full border border-gray-600 bg-gray-800 text-white rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        placeholder={`https://${platform}.com/yourprofile`}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Colors */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md">
          <h4 className="font-medium text-gray-200 mb-4">Colors</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Background Color
              </label>
              <input
                type="color"
                value={footerOptions.backgroundColor}
                onChange={(e) => setFooterOptions({ ...footerOptions, backgroundColor: e.target.value })}
                className="w-16 h-10 border border-gray-600 bg-gray-800 rounded-md cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Text Color
              </label>
              <input
                type="color"
                value={footerOptions.textColor}
                onChange={(e) => setFooterOptions({ ...footerOptions, textColor: e.target.value })}
                className="w-16 h-10 border border-gray-600 bg-gray-800 rounded-md cursor-pointer"
              />
            </div>
          </div>
        </div>



        {/* Footer Preview (powered by Static Websites Footer, matching json output) */}
        <div className="mt-6 p-4 bg-gray-700 rounded-md">
          <h4 className="font-medium text-gray-200 mb-3">
            Footer Preview {layoutMode === 'phone' && <span className="text-xs text-gray-400 ml-2">(Phone Layout - 430px)</span>}
          </h4>
          <div className="space-y-2">
            <div
              className={`border border-gray-600 rounded-md overflow-hidden ${layoutMode === 'phone' ? 'mx-auto' : ''}`}
              style={layoutMode === 'phone' ? { maxWidth: '430px' } : undefined}
            >
              <StaticFooter {...buildFooterProps} layoutMode={layoutMode} />
            </div>
            <div className="text-center text-xs text-gray-400 italic">
              This preview uses the same data mapping as the generated JSON
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterSettings;

// Single size slider (controls height); width will auto-scale to preserve aspect ratio
const SingleSizeControl: React.FC<{
  label: string;
  size: number;
  min?: number;
  max?: number;
  onChange: (size: number) => void;
}> = ({ label, size, min = 16, max = 320, onChange }) => {
  return (
    <div className="p-3 border border-gray-600 bg-gray-700 rounded-md space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-200">{label}</span>
        <span className="text-xs text-gray-300">{size}px</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={size}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
};
