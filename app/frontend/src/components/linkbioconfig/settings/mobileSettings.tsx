import React from 'react';
import DragDropReorder from '../../ui/dragDropReorder';
import type { LinkBioLinkItem } from '../../../config/linkBioJsonGenerator';

export interface LinkBioMobileSettingsValue {
  // Support both flat structure (legacy) and object structure (new)
  ios: string | LinkBioLinkItem;
  android: string | LinkBioLinkItem; // Google Play
  // Legacy flat fields - will be phased out
  iosCta?: string;
  androidCta?: string;
  iosId?: string; // optional DOM id
  androidId?: string; // optional DOM id
  iosLabel?: string; // optional data-label attribute
  androidLabel?: string; // optional data-label attribute
  iosClassName?: string; // optional additional className
  androidClassName?: string; // optional additional className
  order?: string[]; // Array of mobile platform names defining order: ['ios', 'android']
}
export interface LinkBioMobileSettingsProps {
  value: LinkBioMobileSettingsValue;
  onChange: (patch: Partial<LinkBioMobileSettingsValue>) => void;
}

const MobileSettings: React.FC<LinkBioMobileSettingsProps> = ({ value, onChange }) => {
  // State to track which items have advanced options expanded
  const [expandedPlatforms, setExpandedPlatforms] = React.useState<Record<string, boolean>>({});

  // Helper function to normalize platform data (handle both string and object formats)
  const normalizePlatform = (val: string | LinkBioLinkItem | undefined): { url: string; cta: string; 'az-data-platform': string; dataLabel: string; className: string } => {
    if (!val) {
      return { url: '', cta: '', 'az-data-platform': '', dataLabel: '', className: '' };
    }
    if (typeof val === 'string') {
      return { url: val, cta: '', 'az-data-platform': '', dataLabel: '', className: '' };
    }
    return {
      url: val.url || '',
      cta: val.label || val.cta || '', // Check 'label' first (new format), then 'cta' (legacy)
      'az-data-platform': val['az-data-platform'] || '',
      dataLabel: val.dataLabel || '',
      className: val.className || ''
    };
  };

  // Helper function to get CTA/Label from legacy field or object
  const getCta = (platform: string | LinkBioLinkItem | undefined, legacyCta: string | undefined): string => {
    if (typeof platform === 'object') {
      // Check 'label' first (new format), then 'cta' (legacy)
      return platform.label || platform.cta || '';
    }
    return legacyCta || '';
  };

  // Normalize platform data
  const iosData = normalizePlatform(value.ios);
  iosData.cta = getCta(value.ios, value.iosCta);
  iosData['az-data-platform'] = value.iosId || iosData['az-data-platform'];
  iosData.dataLabel = value.iosLabel || iosData.dataLabel;
  iosData.className = value.iosClassName || iosData.className;

  const androidData = normalizePlatform(value.android);
  androidData.cta = getCta(value.android, value.androidCta);
  androidData['az-data-platform'] = value.androidId || androidData['az-data-platform'];
  androidData.dataLabel = value.androidLabel || androidData.dataLabel;
  androidData.className = value.androidClassName || androidData.className;

  // Build ordered mobile platforms
  const mobilePlatforms = [
    {
      key: 'ios',
      label: 'iOS App Store',
      data: iosData,
      placeholder: 'https://apps.apple.com/app/id...',
      ctaPlaceholder: 'iOS'
    },
    {
      key: 'android',
      label: 'Google Play',
      data: androidData,
      placeholder: 'https://play.google.com/store/apps/details?id=...',
      ctaPlaceholder: 'Android'
    },
  ];

  const currentOrder = value.order || mobilePlatforms.map(p => p.key);
  const orderedPlatforms = currentOrder
    .map(key => mobilePlatforms.find(p => p.key === key))
    .filter(Boolean) as typeof mobilePlatforms;

  // Add any new platforms not in the order
  mobilePlatforms.forEach(platform => {
    if (!orderedPlatforms.find(p => p.key === platform.key)) {
      orderedPlatforms.push(platform);
    }
  });

  const handleReorderPlatforms = (newItems: typeof orderedPlatforms) => {
    const newOrder = newItems.map(item => item.key);
    onChange({ order: newOrder });
  };

  // Helper to update platform data - creates proper object structure
  const updatePlatform = (platformKey: 'ios' | 'android', patch: Partial<typeof iosData>) => {
    const currentData = platformKey === 'ios' ? iosData : androidData;
    const updated = { ...currentData, ...patch };

    // For now, update using flat structure for backward compatibility
    const updates: any = {};
    updates[platformKey] = updated.url || undefined;
    updates[`${platformKey}Cta`] = updated.cta || undefined;
    updates[`${platformKey}Id`] = updated['az-data-platform'] || undefined;
    updates[`${platformKey}Label`] = updated.dataLabel || undefined;
    updates[`${platformKey}ClassName`] = updated.className || undefined;

    onChange(updates);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-200">Mobile Links</h3>
      <p className="text-xs text-gray-400 mb-2">Drag rows to reorder how mobile links appear</p>

      <DragDropReorder
        items={orderedPlatforms}
        onReorder={handleReorderPlatforms}
        keyExtractor={(item) => item.key}
        renderItem={(item) => {
          const showAdvanced = expandedPlatforms[item.key] || false;
          const toggleAdvanced = () => {
            setExpandedPlatforms(prev => ({
              ...prev,
              [item.key]: !prev[item.key]
            }));
          };

          return (
            <div className="p-3 bg-gray-800/50 border border-gray-600 rounded-md mb-2">
              <div className="grid grid-cols-1 gap-3">
                {/* 1. Label */}
                <div>
                  <label className="block text-sm font-medium text-gray-300">{item.label} Label</label>
                  <input
                    type="text"
                    value={item.data.cta}
                    onChange={e => updatePlatform(item.key as 'ios' | 'android', { cta: e.target.value })}
                    placeholder={item.ctaPlaceholder}
                    className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* 2. URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-300">{item.label} URL</label>
                  <input
                    type="url"
                    value={item.data.url}
                    onChange={e => updatePlatform(item.key as 'ios' | 'android', { url: e.target.value })}
                    placeholder={item.placeholder}
                    className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {!item.data.url && <p className="mt-1 text-xs text-gray-500">Not configured</p>}
                </div>

                {/* 3. Logo URL - Note: Built-in platforms use default icons */}
                <div className="text-xs text-gray-500 italic">
                  Built-in platform icons are used automatically
                </div>

                {/* Drag handle icon */}
                <div className="flex justify-end text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
              </div>

              {/* 4. Advanced Options Toggle */}
              <button
                type="button"
                onClick={toggleAdvanced}
                className="mt-2 text-xs text-gray-400 hover:text-gray-300 flex items-center gap-1"
              >
                <svg className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Advanced Options
              </button>

              {showAdvanced && (
                <div className="mt-3 pt-3 border-t border-gray-600 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400">az-data-platform</label>
                    <input
                      type="text"
                      value={item.data['az-data-platform']}
                      onChange={e => updatePlatform(item.key as 'ios' | 'android', { 'az-data-platform': e.target.value })}
                      placeholder="e.g. az-steam-app"
                      className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400">Data Label</label>
                    <input
                      type="text"
                      value={item.data.dataLabel}
                      onChange={e => updatePlatform(item.key as 'ios' | 'android', { dataLabel: e.target.value })}
                      placeholder="e.g. ios-download"
                      className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400">Custom Class</label>
                    <input
                      type="text"
                      value={item.data.className}
                      onChange={e => updatePlatform(item.key as 'ios' | 'android', { className: e.target.value })}
                      placeholder="e.g. my-custom-class"
                      className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        }}
        className="space-y-1"
      />
    </div>
  );
};

export default MobileSettings;
