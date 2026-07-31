import React from 'react';
import { MediaUrlPicker } from '../../ui/library';
import DragDropReorder from '../../ui/dragDropReorder';

export interface LinkBioLinkItem {
  url: string;
  label?: string; // Preferred for consistency with custom links
  cta?: string;   // Legacy support, fallback to label
  'pf-data-platform'?: string;
  dataLabel?: string;
  className?: string;
  logoUrl?: string;
}

export interface LinkBioLinksSettingsValue {
  steam?: string | LinkBioLinkItem;
  epic?: string | LinkBioLinkItem;
  epicCta?: string; // legacy support
  steamCta?: string; // legacy support
  steamId?: string; // legacy support
  epicId?: string; // legacy support
  steamLabel?: string; // legacy support
  epicLabel?: string; // legacy support
  steamClassName?: string; // legacy support
  epicClassName?: string; // legacy support
  custom?: Array<LinkBioLinkItem & { label: string }>;
  order?: string[]; // Array of store names defining order: ['steam', 'epic', 'custom']
}
export interface LinkBioLinksSettingsProps {
  value: LinkBioLinksSettingsValue;
  onChange: (patch: Partial<LinkBioLinksSettingsValue>) => void;
}

const LinksSettings: React.FC<LinkBioLinksSettingsProps> = ({ value, onChange }) => {
  // State to track which items have advanced options expanded
  const [expandedStores, setExpandedStores] = React.useState<Record<string, boolean>>({});
  const [expandedCustom, setExpandedCustom] = React.useState<Record<number, boolean>>({});

  const custom = value.custom || [];
  const updateCustom = (idx: number, patch: Partial<{ label: string; url: string; logoUrl?: string; 'pf-data-platform'?: string; dataLabel?: string; className?: string }>) => {
    const next = [...custom];
    next[idx] = { ...next[idx], ...patch } as any;
    onChange({ custom: next });
  };
  const addCustom = () => onChange({ custom: [...custom, { label: '', url: '', logoUrl: '', 'pf-data-platform': '', dataLabel: '', className: '' }] });
  const removeCustom = (idx: number) => {
    onChange({ custom: custom.filter((_, i) => i !== idx) });
    // Clean up expanded state for removed item
    const newExpandedCustom = { ...expandedCustom };
    delete newExpandedCustom[idx];
    setExpandedCustom(newExpandedCustom);
  };

  // Helper function to normalize platform data (handle both string and object formats)
  const normalizePlatform = (val: string | LinkBioLinkItem | undefined): { url: string; cta: string; 'pf-data-platform': string; dataLabel: string; className: string } => {
    if (!val) {
      return { url: '', cta: '', 'pf-data-platform': '', dataLabel: '', className: '' };
    }
    if (typeof val === 'string') {
      return { url: val, cta: '', 'pf-data-platform': '', dataLabel: '', className: '' };
    }
    return {
      url: val.url || '',
      cta: val.label || val.cta || '', // Check 'label' first (new format), then 'cta' (legacy)
      'pf-data-platform': val['pf-data-platform'] || '',
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
  const steamData = normalizePlatform(value.steam);
  steamData.cta = getCta(value.steam, value.steamCta);
  steamData['pf-data-platform'] = value.steamId || steamData['pf-data-platform'];
  steamData.dataLabel = value.steamLabel || steamData.dataLabel;
  steamData.className = value.steamClassName || steamData.className;

  const epicData = normalizePlatform(value.epic);
  epicData.cta = getCta(value.epic, value.epicCta);
  epicData['pf-data-platform'] = value.epicId || epicData['pf-data-platform'];
  epicData.dataLabel = value.epicLabel || epicData.dataLabel;
  epicData.className = value.epicClassName || epicData.className;

  const storePlatforms = [
    {
      key: 'steam',
      label: 'Steam',
      data: steamData,
      placeholder: 'https://store.steampowered.com/app/...',
      ctaPlaceholder: 'Steam'
    },
    {
      key: 'epic',
      label: 'Epic Games Store',
      data: epicData,
      placeholder: 'https://store.epicgames.com/en-US/p/...',
      ctaPlaceholder: 'Wishlist / Get on Epic'
    },
  ];

  const currentOrder = value.order || storePlatforms.map(p => p.key);
  const orderedStores = currentOrder
    .map(key => storePlatforms.find(p => p.key === key))
    .filter(Boolean) as typeof storePlatforms;

  // Add any new stores not in the order
  storePlatforms.forEach(store => {
    if (!orderedStores.find(p => p.key === store.key)) {
      orderedStores.push(store);
    }
  });

  const handleReorderStores = (newItems: typeof orderedStores) => {
    const newOrder = newItems.map(item => item.key);
    onChange({ order: newOrder });
  };

  // Helper to update platform data - creates proper object structure
  const updatePlatform = (platformKey: 'steam' | 'epic', patch: Partial<typeof steamData>) => {
    const currentData = platformKey === 'steam' ? steamData : epicData;
    const updated = { ...currentData, ...patch };

    // For now, update using flat structure for backward compatibility
    const updates: any = {};
    updates[platformKey] = updated.url || undefined;
    updates[`${platformKey}Cta`] = updated.cta || undefined;
    updates[`${platformKey}Id`] = updated['pf-data-platform'] || undefined;
    updates[`${platformKey}Label`] = updated.dataLabel || undefined;
    updates[`${platformKey}ClassName`] = updated.className || undefined;

    onChange(updates);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-200">Store Links</h3>
      <p className="text-xs text-gray-400 mb-2">Drag rows to reorder how store links appear</p>

      <DragDropReorder
        items={orderedStores}
        onReorder={handleReorderStores}
        keyExtractor={(item) => item.key}
        renderItem={(item) => {
          const showAdvanced = expandedStores[item.key] || false;
          const toggleAdvanced = () => {
            setExpandedStores(prev => ({
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
                    onChange={e => updatePlatform(item.key as 'steam' | 'epic', { cta: e.target.value })}
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
                    onChange={e => updatePlatform(item.key as 'steam' | 'epic', { url: e.target.value })}
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
                    <label className="block text-xs font-medium text-gray-400">pf-data-platform</label>
                    <input
                      type="text"
                      value={item.data['pf-data-platform']}
                      onChange={e => updatePlatform(item.key as 'steam' | 'epic', { 'pf-data-platform': e.target.value })}
                      placeholder="e.g. pf-steam-app"
                      className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400">Data Label</label>
                    <input
                      type="text"
                      value={item.data.dataLabel}
                      onChange={e => updatePlatform(item.key as 'steam' | 'epic', { dataLabel: e.target.value })}
                      placeholder="e.g. steam-download"
                      className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400">Custom Class</label>
                    <input
                      type="text"
                      value={item.data.className}
                      onChange={e => updatePlatform(item.key as 'steam' | 'epic', { className: e.target.value })}
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
          <h4 className="text-sm font-medium text-gray-300">Custom Store Links</h4>
          <button
            type="button"
            onClick={addCustom}
            className="px-2 py-1 text-xs rounded-md bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-600"
          >Add</button>
        </div>
        <p className="text-xs text-gray-400 mb-2">Drag rows to reorder custom store links</p>
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
                        placeholder="Store Name"
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
                        placeholder="https://example.com/store"
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
                        className="px-3 py-2 text-xs rounded-md bg-red-600 hover:bg-red-500 text-white border border-red-500"
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
                          <label className="block text-xs font-medium text-gray-400">pf-data-platform</label>
                          <input
                            type="text"
                            value={(item as any)['pf-data-platform'] || ''}
                            onChange={e => updateCustom(idx, { 'pf-data-platform': e.target.value })}
                            placeholder="e.g. pf-custom-store"
                            className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400">Data Label</label>
                          <input
                            type="text"
                            value={(item as any).dataLabel || ''}
                            onChange={e => updateCustom(idx, { dataLabel: e.target.value })}
                            placeholder="e.g. custom-store"
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
          <p className="text-xs text-gray-500">No custom store links. Click Add to create one.</p>
        )}
      </div>
    </div>
  );
};

export default LinksSettings;
