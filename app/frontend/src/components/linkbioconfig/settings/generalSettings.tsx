import React from 'react';

export interface LinkBioGeneralSettingsProps {
  value: {
    configName: string;
    pageTitle: string;
    gameDescription: string;
    backgroundType: 'solid' | 'gradient'; // kept for backward compatibility, edited via BackgroundSettings
    backgroundValue: string; // kept for backward compatibility
  };
  onChange: (patch: Partial<LinkBioGeneralSettingsProps['value']>) => void;
}

const GeneralSettings: React.FC<LinkBioGeneralSettingsProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-200">General Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Configuration Name</label>
          <input
            type="text"
            value={value.configName}
            onChange={e => onChange({ configName: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') })}
            placeholder="my-game-tree"
            className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-400">Use lowercase letters, numbers, hyphens and underscores only.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Page Title</label>
          <input
            type="text"
            value={value.pageTitle}
            onChange={e => onChange({ pageTitle: e.target.value })}
            placeholder="Game Title"
            className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300">Game Description</label>
          <textarea
            value={value.gameDescription}
            onChange={e => onChange({ gameDescription: e.target.value })}
            rows={3}
            placeholder="Short game description used for social sharing and SEO"
            className="mt-1 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        {/* Background moved to dedicated BackgroundSettings component */}
      </div>
    </div>
  );
};

export default GeneralSettings;
