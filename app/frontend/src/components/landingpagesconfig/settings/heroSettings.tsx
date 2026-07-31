import React from 'react';
import type { HeroOptions, GeneralOptions } from '../../../types/ui.types';
import { generateHeroClasses } from '../../../utils/ui';
import ToggleSwitch from '../../ui/toggleSwitch';
import { BackgroundMedia } from '@pageforge/static-websites';

interface HeroSettingsProps {
  heroOptions: HeroOptions;
  setHeroOptions: (options: HeroOptions) => void;
  backgroundUrl?: string;
  generalOptions: GeneralOptions;
}

const HeroSettings: React.FC<HeroSettingsProps> = ({
  heroOptions,
  setHeroOptions,
  backgroundUrl,
  generalOptions
}) => {
  // Always keep background transparent and drop gradient per app policy
  React.useEffect(() => {
    if (heroOptions.backgroundColor !== 'transparent' || !!heroOptions.backgroundGradient) {
      setHeroOptions({ ...heroOptions, backgroundColor: 'transparent', backgroundGradient: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroOptions.backgroundColor, heroOptions.backgroundGradient]);
  return (
    <div className="pt-8">
      <h3 className="font-medium text-white mb-3">Hero Settings</h3>

      <div className="space-y-6">
        {/* Content Section */}
        <div className="p-4 border border-gray-600 bg-gray-700 rounded-md">
          <h4 className="font-medium text-white mb-4">Content</h4>
          <div className="space-y-3">
            <div>
              <label htmlFor="heroHeading" className="block text-sm font-medium text-gray-300">
                Heading
              </label>
              <textarea
                id="heroHeading"
                rows={2}
                value={heroOptions.heading}
                onChange={(e) => setHeroOptions({ ...heroOptions, heading: e.target.value })}
                className="mt-1 block w-full border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
                placeholder="Enter hero headline. Line breaks will be preserved."
              />
            </div>

            <div>
              <label htmlFor="heroSubheading" className="block text-sm font-medium text-gray-300">
                Subheading
              </label>
              <textarea
                id="heroSubheading"
                rows={3}
                value={heroOptions.subheading}
                onChange={(e) => setHeroOptions({ ...heroOptions, subheading: e.target.value })}
                className="mt-1 block w-full border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
                placeholder="Enter subheadline. Line breaks will be preserved."
              />
            </div>
          </div>
        </div>

        {/* Typography Styling */}
        <div className="space-y-6">
          {/* Typography Controls */}
          <div className="p-4 border border-gray-600 bg-gray-700 rounded-md">
            <h4 className="font-medium text-white mb-4">Typography Style</h4>
            <div className="space-y-4">
              {/* Heading Style */}
              <div>
                <h5 className="text-sm font-medium text-gray-300 mb-3">Heading</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">
                      Size
                    </label>
                    <select
                      value={heroOptions.headingSize || 'large'}
                      onChange={(e) => setHeroOptions({ ...heroOptions, headingSize: e.target.value as 'small' | 'medium' | 'large' | 'extra-large' })}
                      className="block w-full border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                      <option value="extra-large">Extra Large</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">
                      Color
                    </label>
                    <input
                      type="color"
                      value={heroOptions.headingColor || '#000000'}
                      onChange={(e) => setHeroOptions({ ...heroOptions, headingColor: e.target.value })}
                      className="w-full h-10 border border-gray-600 rounded-md cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Subheading Style */}
              <div>
                <h5 className="text-sm font-medium text-gray-300 mb-3">Subheading</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">
                      Size
                    </label>
                    <select
                      value={heroOptions.subheadingSize || 'medium'}
                      onChange={(e) => setHeroOptions({ ...heroOptions, subheadingSize: e.target.value as 'small' | 'medium' | 'large' })}
                      className="block w-full border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">
                      Color
                    </label>
                    <input
                      type="color"
                      value={heroOptions.subheadingColor || '#6b7280'}
                      onChange={(e) => setHeroOptions({ ...heroOptions, subheadingColor: e.target.value })}
                      className="w-full h-10 border border-gray-600 rounded-md cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Visual Effects */}
              <div>
                <h5 className="text-sm font-medium text-gray-300 mb-3">Visual Effects</h5>
                <div className="space-y-4">
                  {/* Text Shadow */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400">Text Shadow</span>
                    <ToggleSwitch
                      leftLabel="Off"
                      rightLabel="On"
                      leftValue="off"
                      rightValue="on"
                      value={heroOptions.textShadow ? 'on' : 'off'}
                      onToggle={(val) =>
                        setHeroOptions({ ...heroOptions, textShadow: val === 'on' })
                      }
                    />
                  </div>

                  {/* Shadow Intensity */}
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <label className="col-span-5 text-xs font-medium text-gray-400">Shadow Intensity</label>
                    <input
                      className="col-span-6 w-full"
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={heroOptions.textShadowIntensity ?? 0.3}
                      onChange={(e) => setHeroOptions({ ...heroOptions, textShadowIntensity: parseFloat(e.target.value) })}
                      disabled={!heroOptions.textShadow}
                    />
                    <span className="col-span-1 text-right text-xs text-gray-300">{Math.round(((heroOptions.textShadowIntensity ?? 0.3) * 100))}%</span>
                  </div>

                  {/* Background controls removed: always transparent, no gradient */}
                </div>
              </div>
            </div>
          </div>

          {/* Preview goes under Typography and above Advanced Options */}
          <div className="p-4 bg-gray-700 border border-gray-600 rounded-md">
            <h4 className="font-medium text-white mb-3">Preview</h4>
            <div className="relative rounded-md overflow-hidden">
              {backgroundUrl ? (
                <div className="absolute inset-0">
                  <BackgroundMedia src={backgroundUrl} lazy autoPlay loop muted />
                </div>
              ) : null}
              <div
                className={`relative z-10 p-8 text-center ${generateHeroClasses(heroOptions).className}`}
                style={{
                  fontFamily: generalOptions.font.family,
                  fontWeight: generalOptions.font.weight,
                  backgroundColor: heroOptions.backgroundColor !== 'transparent' && !backgroundUrl ? heroOptions.backgroundColor : undefined,
                  backgroundImage: !backgroundUrl ? heroOptions.backgroundGradient || undefined : undefined
                }}
              >
                <h1
                  className={`${generateHeroClasses(heroOptions).headingClassName} whitespace-pre-line break-words`}
                  style={{
                    color: heroOptions.headingColor || '#000000',
                    textShadow: heroOptions.textShadow ? `2px 2px 4px rgba(0,0,0,${heroOptions.textShadowIntensity ?? 0.3})` : 'none',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {heroOptions.heading}
                </h1>
                {heroOptions.subheading && (
                  <p
                    className={`${generateHeroClasses(heroOptions).subheadingClassName} whitespace-pre-line break-words`}
                    style={{
                      color: heroOptions.subheadingColor || '#6b7280',
                      textShadow: heroOptions.textShadow ? `1px 1px 2px rgba(0,0,0,${heroOptions.textShadowIntensity ?? 0.3})` : 'none',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {heroOptions.subheading}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSettings;
