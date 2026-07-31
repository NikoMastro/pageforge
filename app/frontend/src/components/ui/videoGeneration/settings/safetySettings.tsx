import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { SafetySettings } from '../../../../api/videoGeneration.api';
import { safetyLevels } from '../constants';

type SafetySettingsSectionProps = {
  safetySettings: SafetySettings;
  onChange: (settings: SafetySettings) => void;
};

export const SafetySettingsSection: React.FC<SafetySettingsSectionProps> = ({
  safetySettings,
  onChange,
}) => {
  return (
    <section className="rounded-lg border border-gray-800 bg-gray-800 p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" />
        <div>
          <h3 className="text-lg font-semibold text-white">Safety Filters</h3>
          <p className="text-xs text-gray-400">Fine-tune moderation thresholds per content category.</p>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(safetySettings).map(([key, value]) => (
          <div key={key}>
            <label className="mb-2 block text-sm font-medium capitalize text-gray-300">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <select
              value={value}
              onChange={(e) => onChange({ ...safetySettings, [key]: e.target.value })}
              className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {safetyLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </section>
  );
};
