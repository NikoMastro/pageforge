import React from 'react';
import { MediaUrlPicker } from '../../ui/library';

export interface LinkBioLinkSettingsValue {
  slug: string; // playrl.ink/[slug]
  profileImageUrl: string;
  faviconUrl: string;
  illustrationUrl: string; // Open Graph image
}
export interface LinkBioLinkSettingsProps {
  value: LinkBioLinkSettingsValue;
  onChange: (patch: Partial<LinkBioLinkSettingsValue>) => void;
}

const LinkSettings: React.FC<LinkBioLinkSettingsProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-200">Link Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Profile Image</label>
          <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
            <input
              type="text"
              value={value.profileImageUrl}
              onChange={e => onChange({ profileImageUrl: e.target.value })}
              placeholder="https://...profile.png"
              className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <MediaUrlPicker label="Library" size="md" mediaType="images" onPick={(url) => onChange({ profileImageUrl: url })} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Favicon</label>
          <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
            <input
              type="text"
              value={value.faviconUrl}
              onChange={e => onChange({ faviconUrl: e.target.value })}
              placeholder="/favicon.ico or https://..."
              className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <MediaUrlPicker label="Library" size="md" mediaType="images" onPick={(url) => onChange({ faviconUrl: url })} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Illustration / Open Graph Image</label>
          <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
            <input
              type="text"
              value={value.illustrationUrl}
              onChange={e => onChange({ illustrationUrl: e.target.value })}
              placeholder="https://.../og-image.jpg"
              className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <MediaUrlPicker label="Library" size="md" mediaType="images" onPick={(url) => onChange({ illustrationUrl: url })} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkSettings;
