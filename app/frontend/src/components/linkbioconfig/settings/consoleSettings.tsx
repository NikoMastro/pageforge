import React from 'react';
import { MediaUrlPicker } from '../../ui/library';
import DragDropReorder from '../../ui/dragDropReorder';
import type { LinkBioLinkItem } from '../../../config/linkBioJsonGenerator';

export interface LinkBioConsoleSettingsValue {
  // Support both flat structure (legacy) and object structure (new)
  playstation: string | LinkBioLinkItem;
  xbox: string | LinkBioLinkItem;
  switch: string | LinkBioLinkItem;
  // Legacy flat fields - will be phased out
  playstationCta?: string;
  xboxCta?: string;
  switchCta?: string;
  playstationId?: string;
  xboxId?: string;
  switchId?: string;
  playstationLabel?: string;
  xboxLabel?: string;
  switchLabel?: string;
  playstationClassName?: string;
  xboxClassName?: string;
  switchClassName?: string;
  custom?: Array<{ label: string; url: string; logoUrl?: string; 'az-data-platform'?: string; dataLabel?: string; className?: string }>;
  order?: string[]; // Array of console names defining order: ['playstation', 'xbox', 'switch', 'custom']
}
export interface LinkBioConsoleSettingsProps {
  value: LinkBioConsoleSettingsValue;
  onChange: (patch: Partial<LinkBioConsoleSettingsValue>) => void;
}

const ConsoleSettings: React.FC<LinkBioConsoleSettingsProps> = ({ value, onChange }) => {
  // State to track which items have advanced options expanded
  const [expandedConsoles, setExpandedConsoles] = React.useState<Record<string, boolean>>({});
  const [expandedCustom, setExpandedCustom] = React.useState<Record<number, boolean>>({});

  const custom = value.custom || [];
  const updateCustom = (idx: number, patch: Partial<{ label: string; url: string; logoUrl?: string; 'az-data-platform'?: string; dataLabel?: string; className?: string }>) => {
    const next = [...custom];
    next[idx] = { ...next[idx], ...patch } as any;
    onChange({ custom: next });
  };
  const addCustom = () => onChange({ custom: [...custom, { label: '', url: '', logoUrl: '', 'az-data-platform': '', dataLabel: '', className: '' }] });
  const removeCustom = (idx: number) => {
    onChange({ custom: custom.filter((_, i) => i !== idx) });
    // Clean up expanded state for removed item
    const newExpandedCustom = { ...expandedCustom };
    delete newExpandedCustom[idx];
    setExpandedCustom(newExpandedCustom);
  };

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
  const playstationData = normalizePlatform(value.playstation);
  playstationData.cta = getCta(value.playstation, value.playstationCta);
  playstationData['az-data-platform'] = value.playstationId || playstationData['az-data-platform'];
  playstationData.dataLabel = value.playstationLabel || playstationData.dataLabel;
  playstationData.className = value.playstationClassName || playstationData.className;

  const xboxData = normalizePlatform(value.xbox);
  xboxData.cta = getCta(value.xbox, value.xboxCta);
  xboxData['az-data-platform'] = value.xboxId || xboxData['az-data-platform'];
  xboxData.dataLabel = value.xboxLabel || xboxData.dataLabel;
  xboxData.className = value.xboxClassName || xboxData.className;

  const switchData = normalizePlatform(value.switch);
  switchData.cta = getCta(value.switch, value.switchCta);
  switchData['az-data-platform'] = value.switchId || switchData['az-data-platform'];
  switchData.dataLabel = value.switchLabel || switchData.dataLabel;
  switchData.className = value.switchClassName || switchData.className;

  // Build ordered console platforms
  const consolePlatforms = [
    {
      key: 'playstation',
      label: 'PlayStation Store',
      data: playstationData,
      placeholder: 'https://store.playstation.com/...',
      ctaPlaceholder: 'PlayStation'
    },
    {
      key: 'xbox',
      label: 'Xbox Store',
      data: xboxData,
      placeholder: 'https://www.xbox.com/en-US/games/store/...',
      ctaPlaceholder: 'Xbox'
    },
    {
      key: 'switch',
      label: 'Nintendo Switch',
      data: switchData,
      placeholder: 'https://www.nintendo.com/store/products/...',
      ctaPlaceholder: 'Nintendo Switch'
    },
  ];

  const currentOrder = value.order || consolePlatforms.map(p => p.key);
  const orderedConsoles = currentOrder
    .map(key => consolePlatforms.find(p => p.key === key))
    .filter(Boolean) as typeof consolePlatforms;

  // Add any new consoles not in the order
  consolePlatforms.forEach(console => {
    if (!orderedConsoles.find(p => p.key === console.key)) {
      orderedConsoles.push(console);
    }
  });

  const handleReorderConsoles = (newItems: typeof orderedConsoles) => {
    const newOrder = newItems.map(item => item.key);
    onChange({ order: newOrder });
  };

  // Helper to update platform data - creates proper object structure
  const updatePlatform = (platformKey: 'playstation' | 'xbox' | 'switch', patch: Partial<typeof playstationData>) => {
    const currentData = platformKey === 'playstation' ? playstationData : platformKey === 'xbox' ? xboxData : switchData;
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
      <h3 className="text-lg font-semibold text-gray-200">Console Links</h3>
      <p className="text-xs text-gray-400 mb-2">Drag rows to reorder how console links appear</p>

      <DragDropReorder
        items={orderedConsoles}
        onReorder={handleReorderConsoles}
        keyExtractor={(item) => item.key}
        renderItem={(item) => {
          const showAdvanced = expandedConsoles[item.key] || false;
          const toggleAdvanced = () => {
            setExpandedConsoles(prev => ({
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
                    onChange={e => updatePlatform(item.key as 'playstation' | 'xbox' | 'switch', { cta: e.target.value })}
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
                    onChange={e => updatePlatform(item.key as 'playstation' | 'xbox' | 'switch', { url: e.target.value })}
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

              {/* 4. Advanced Options */}
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
                      onChange={e => updatePlatform(item.key as 'playstation' | 'xbox' | 'switch', { 'az-data-platform': e.target.value })}
                      placeholder="e.g. az-playstation"
                      className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400">Data Label</label>
                    <input
                      type="text"
                      value={item.data.dataLabel}
                      onChange={e => updatePlatform(item.key as 'playstation' | 'xbox' | 'switch', { dataLabel: e.target.value })}
                      placeholder="e.g. ps-download"
                      className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400">Custom Class</label>
                    <input
                      type="text"
                      value={item.data.className}
                      onChange={e => updatePlatform(item.key as 'playstation' | 'xbox' | 'switch', { className: e.target.value })}
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

      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-300">Custom Console Links</h4>
          <button
            type="button"
            onClick={addCustom}
            className="px-2 py-1 text-xs rounded-md bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-600"
          >Add</button>
        </div>
        <p className="text-xs text-gray-400 mb-2">Drag rows to reorder custom console links</p>
        {custom.length > 0 ? (
          <DragDropReorder
            items={custom}
            onReorder={(newItems) => onChange({ custom: newItems })}
            keyExtractor={(_, idx) => `custom-${idx}`}
            renderItem={(item, idx) => {
              const showAdvanced = expandedCustom[idx] || false;
              const toggleAdvanced = () => {
                setExpandedCustom(prev => ({
                  ...prev,
                  [idx]: !prev[idx]
                }));
              };

              return (
                <div className="p-3 bg-gray-800/50 border border-gray-600 rounded-md mb-2">
                  <div className="grid grid-cols-1 gap-3">
                    {/* 1. Label */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400">Label</label>
                      <input
                        type="text"
                        value={item.label}
                        onChange={e => updateCustom(idx, { label: e.target.value })}
                        placeholder="Console Name"
                        className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    {/* 2. URL */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400">URL</label>
                      <input
                        type="url"
                        value={item.url}
                        onChange={e => updateCustom(idx, { url: e.target.value })}
                        placeholder="https://example.com/console"
                        className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    {/* 3. Logo URL with Media Picker */}
                    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-end">
                      <div>
                        <label className="block text-xs font-medium text-gray-400">Logo URL</label>
                        <input
                          type="url"
                          value={item.logoUrl || ''}
                          onChange={e => updateCustom(idx, { logoUrl: e.target.value })}
                          placeholder="https://.../logo.png"
                          className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <MediaUrlPicker label="Pick" size="sm" mediaType="images" onPick={(url) => updateCustom(idx, { logoUrl: url })} />
                      <button
                        type="button"
                        onClick={() => removeCustom(idx)}
                        className="px-2 py-2 text-xs rounded-md bg-red-600 hover:bg-red-500 text-white border border-red-500"
                      >Remove</button>
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>

                    {/* 4. Advanced Options */}
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
                      <div className="pt-3 border-t border-gray-600 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-400">az-data-platform</label>
                          <input
                            type="text"
                            value={(item as any)['az-data-platform'] || ''}
                            onChange={e => updateCustom(idx, { 'az-data-platform': e.target.value })}
                            placeholder="e.g. az-custom-console"
                            className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400">Data Label</label>
                          <input
                            type="text"
                            value={(item as any).dataLabel || ''}
                            onChange={e => updateCustom(idx, { dataLabel: e.target.value })}
                            placeholder="e.g. custom-console"
                            className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400">Custom Class</label>
                          <input
                            type="text"
                            value={(item as any).className || ''}
                            onChange={e => updateCustom(idx, { className: e.target.value })}
                            placeholder="e.g. my-custom-class"
                            className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            }}
            className="space-y-1"
          />
        ) : (
          <p className="text-xs text-gray-500">No custom console links. Click Add to create one.</p>
        )}
      </div>
    </div>
  );
};

export default ConsoleSettings;
