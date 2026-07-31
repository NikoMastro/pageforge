import React from 'react';
import DragDropReorder from '../../ui/dragDropReorder';

export interface LinkBioFooterSettingsValue {
  privacyUrl: string;
  termsUrl: string;
  custom?: Array<{ label: string; url: string }>;
  order?: string[]; // Array of footer link names defining order: ['privacy', 'terms', 'custom-0', etc.]
}
export interface LinkBioFooterSettingsProps {
  value: LinkBioFooterSettingsValue;
  onChange: (patch: Partial<LinkBioFooterSettingsValue>) => void;
}

const FooterSettings: React.FC<LinkBioFooterSettingsProps> = ({ value, onChange }) => {
  const custom = value.custom || [];
  const updateCustom = (index: number, patch: Partial<{ label: string; url: string }>) => {
    const next = [...custom];
    next[index] = { ...next[index], ...patch };
    onChange({ custom: next });
  };
  const addCustom = () => onChange({ custom: [...custom, { label: '', url: '' }] });
  const removeCustom = (idx: number) => onChange({ custom: custom.filter((_, i) => i !== idx) });
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-200">Footer Links</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Privacy Policy URL</label>
          <input
            type="url"
            value={value.privacyUrl}
            onChange={e => onChange({ privacyUrl: e.target.value })}
            placeholder="https://example.com/privacy"
            className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {!value.privacyUrl && <p className="mt-1 text-xs text-gray-500">false</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Terms of Service URL</label>
          <input
            type="url"
            value={value.termsUrl}
            onChange={e => onChange({ termsUrl: e.target.value })}
            placeholder="https://example.com/terms"
            className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {!value.termsUrl && <p className="mt-1 text-xs text-gray-500">false</p>}
        </div>
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-300">Custom Footer Links</h4>
          <button
            type="button"
            onClick={addCustom}
            className="px-2 py-1 text-xs rounded-md bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-600"
          >Add</button>
        </div>
        <div className="space-y-3">
          {custom.map((item, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-400">Label</label>
                <input
                  type="text"
                  value={item.label}
                  onChange={e => updateCustom(idx, { label: e.target.value })}
                  placeholder="Imprint / Support / Careers"
                  className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400">URL</label>
                <input
                  type="url"
                  value={item.url}
                  onChange={e => updateCustom(idx, { url: e.target.value })}
                  placeholder="https://example.com/your-page"
                  className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex md:justify-end">
                <button
                  type="button"
                  onClick={() => removeCustom(idx)}
                  className="px-2 py-2 text-xs rounded-md bg-red-600 hover:bg-red-500 text-white border border-red-500"
                >Remove</button>
              </div>
            </div>
          ))}
          {custom.length === 0 && (
            <p className="text-xs text-gray-500">No custom footer links. Click Add to create one.</p>
          )}
        </div>
      </div>

      {/* Footer Links Order */}
      <div className="pt-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Footer Links Order</label>
        <DragDropReorder
          items={value.order || ['privacy', 'terms', ...custom.map((_, idx) => `custom-${idx}`)]}
          onReorder={(newOrder) => onChange({ order: newOrder })}
          keyExtractor={(item) => item}
          renderItem={(item) => {
            if (item === 'privacy') {
              return (
                <div className="flex items-center space-x-2">
                  <span>Privacy Policy</span>
                  {!value.privacyUrl && <span className="text-xs text-gray-500">(not set)</span>}
                </div>
              );
            }
            if (item === 'terms') {
              return (
                <div className="flex items-center space-x-2">
                  <span>Terms of Service</span>
                  {!value.termsUrl && <span className="text-xs text-gray-500">(not set)</span>}
                </div>
              );
            }
            if (item.startsWith('custom-')) {
              const idx = parseInt(item.split('-')[1]);
              const customItem = custom[idx];
              return (
                <div className="flex items-center space-x-2">
                  <span>{customItem?.label || `Custom Link ${idx + 1}`}</span>
                  {(!customItem?.label || !customItem?.url) && (
                    <span className="text-xs text-gray-500">(incomplete)</span>
                  )}
                </div>
              );
            }
            return <span>{item}</span>;
          }}
        />
      </div>
    </div>
  );
};

export default FooterSettings;
