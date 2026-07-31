import React from 'react';
import { MediaUrlPicker } from '../../ui/library';
import DragDropReorder from '../../ui/dragDropReorder';

export interface LinkBioSocialSettingsValue {
  x: string; // Twitter/X
  instagram: string;
  discord: string;
  youtube: string;
  custom?: Array<{ logoUrl: string; url: string }>;
  order?: string[]; // Array of platform names defining horizontal order
}
export interface LinkBioSocialSettingsProps {
  value: LinkBioSocialSettingsValue;
  onChange: (patch: Partial<LinkBioSocialSettingsValue>) => void;
}

const SocialSettings: React.FC<LinkBioSocialSettingsProps> = ({ value, onChange }) => {
  const custom = value.custom || [];
  const updateCustom = (index: number, patch: Partial<{ logoUrl: string; url: string }>) => {
    const next = [...custom];
    next[index] = { ...next[index], ...patch };
    onChange({ custom: next });
  };
  const addCustom = () => {
    onChange({ custom: [...custom, { logoUrl: '', url: '' }] });
  };
  const removeCustom = (index: number) => {
    const next = custom.filter((_, i) => i !== index);
    onChange({ custom: next });
  };

  // Build ordered social platforms
  const socialPlatforms = [
    { key: 'x', label: 'X (Twitter)', value: value.x, placeholder: 'https://x.com/yourhandle' },
    { key: 'instagram', label: 'Instagram', value: value.instagram, placeholder: 'https://instagram.com/yourhandle' },
    { key: 'discord', label: 'Discord Invite', value: value.discord, placeholder: 'https://discord.gg/...' },
    { key: 'youtube', label: 'YouTube Channel / Video', value: value.youtube, placeholder: 'https://youtube.com/@...' },
  ];

  const currentOrder = value.order || socialPlatforms.map(p => p.key);
  const orderedPlatforms = currentOrder
    .map(key => socialPlatforms.find(p => p.key === key))
    .filter(Boolean) as typeof socialPlatforms;

  // Add any new platforms not in the order
  socialPlatforms.forEach(platform => {
    if (!orderedPlatforms.find(p => p.key === platform.key)) {
      orderedPlatforms.push(platform);
    }
  });

  const handleReorderPlatforms = (newItems: typeof orderedPlatforms) => {
    const newOrder = newItems.map(item => item.key);
    onChange({ order: newOrder });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-200">Social Links</h3>
      <p className="text-xs text-gray-400 mb-2">Drag rows to reorder how social icons appear</p>

      <DragDropReorder
        items={orderedPlatforms}
        onReorder={handleReorderPlatforms}
        keyExtractor={(item) => item.key}
        renderItem={(item) => (
          <div className="p-3 bg-gray-800/50 border border-gray-600 rounded-md mb-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300">{item.label}</label>
                <input
                  type="url"
                  value={item.value}
                  onChange={e => onChange({ [item.key]: e.target.value } as any)}
                  placeholder={item.placeholder}
                  className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {!item.value && <p className="mt-1 text-xs text-gray-500">Not configured</p>}
              </div>
              <div className="flex items-center justify-center md:justify-end text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
            </div>
          </div>
        )}
        className="space-y-1"
      />

      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-300">Custom Social Links</h4>
          <button
            type="button"
            onClick={addCustom}
            className="px-2 py-1 text-xs rounded-md bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-600"
          >Add</button>
        </div>
        <p className="text-xs text-gray-400 mb-2">Drag rows to reorder custom links</p>
        {custom.length > 0 ? (
          <DragDropReorder
            items={custom}
            onReorder={(newItems) => onChange({ custom: newItems })}
            keyExtractor={(_, idx) => `custom-${idx}`}
            renderItem={(item, idx) => (
              <div className="p-3 bg-gray-800/50 border border-gray-600 rounded-md mb-2">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                  <div>
                    <label className="block text-xs font-medium text-gray-400">Logo URL</label>
                    <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                      <input
                        type="url"
                        value={item.logoUrl}
                        onChange={e => updateCustom(idx, { logoUrl: e.target.value })}
                        placeholder="https://.../logo.png"
                        className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <MediaUrlPicker label="Pick" size="sm" mediaType="images" onPick={(url) => updateCustom(idx, { logoUrl: url })} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400">Link URL</label>
                    <input
                      type="url"
                      value={item.url}
                      onChange={e => updateCustom(idx, { url: e.target.value })}
                      placeholder="https://example.com/your-page"
                      className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      type="button"
                      onClick={() => removeCustom(idx)}
                      className="px-2 py-2 text-xs rounded-md bg-red-600 hover:bg-red-500 text-white border border-red-500"
                    >Remove</button>
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
            className="space-y-1"
          />
        ) : (
          <p className="text-xs text-gray-500">No custom social links. Click Add to create one.</p>
        )}
      </div>
    </div>
  );
};

export default SocialSettings;
