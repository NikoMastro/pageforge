import React from 'react';
import { MediaUrlPicker } from '../../ui/library';

export interface LinkBioBackgroundValue {
  backgroundType: 'solid' | 'gradient';
  backgroundValue: string; // hex or css gradient
  secondaryBackgroundType: 'solid' | 'gradient';
  secondaryBackgroundValue: string; // hex or css gradient for outside phone frame
}

export interface BackgroundSettingsProps {
  value: LinkBioBackgroundValue;
  onChange: (patch: Partial<LinkBioBackgroundValue>) => void;
}

const SOLID_SWATCHES = [
  '#000000', '#111827', '#1F2937', '#374151', '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB', '#FFFFFF',
  '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', // blues
  '#0EA5E9', '#0891B2', '#06B6D4', // cyans
  '#10B981', '#059669', '#047857', // greens
  '#F59E0B', '#D97706', '#B45309', // ambers
  '#EF4444', '#DC2626', '#B91C1C', // reds
  '#EC4899', '#DB2777', '#BE185D', // pinks
  '#8B5CF6', '#7C3AED', '#6D28D9'  // violets
];

const GRADIENT_PRESETS: Array<{ name: string; css: string }> = [
  // Dark / Neutral
  { name: 'Midnight', css: 'linear-gradient(135deg,#0f172a,#1e293b,#334155)' },
  { name: 'Mono Glow', css: 'linear-gradient(135deg,#000000,#111827,#374151)' },
  { name: 'Slate Fade', css: 'linear-gradient(135deg,#0f172a,#1f2937,#475569)' },
  { name: 'Charcoal', css: 'linear-gradient(135deg,#0f0f0f,#1f1f1f,#2f2f2f)' },

  // Vibrant / Brand
  { name: 'Sunset', css: 'linear-gradient(135deg,#1e3a8a,#9333ea,#f43f5e)' },
  { name: 'Candy', css: 'linear-gradient(135deg,#db2777,#f472b6,#fb7185)' },
  { name: 'Voltage', css: 'linear-gradient(135deg,#4c1d95,#7e22ce,#d946ef)' },
  { name: 'Acid Pop', css: 'linear-gradient(135deg,#9333ea,#f59e0b,#10b981)' },

  // Nature / Cool
  { name: 'Aurora', css: 'linear-gradient(135deg,#0f766e,#16a34a,#65a30d)' },
  { name: 'Forest', css: 'linear-gradient(135deg,#052e16,#065f46,#047857)' },
  { name: 'Ocean', css: 'linear-gradient(135deg,#0ea5e9,#2563eb,#312e81)' },
  { name: 'Ice Drift', css: 'linear-gradient(135deg,#0ea5e9,#38bdf8,#6366f1)' },

  // Warm / Heat
  { name: 'Heat', css: 'linear-gradient(135deg,#f59e0b,#ef4444,#be123c)' },
  { name: 'Lava', css: 'linear-gradient(135deg,#7f1d1d,#dc2626,#f87171)' },
  { name: 'Desert', css: 'linear-gradient(135deg,#78350f,#b45309,#f59e0b)' },
  { name: 'Magma', css: 'linear-gradient(135deg,#1c1917,#7c2d12,#b45309,#f97316)' },

  // Pastels / Soft
  { name: 'Soft Sky', css: 'linear-gradient(135deg,#bfdbfe,#c7d2fe,#e0e7ff)' },
  { name: 'Peach Cloud', css: 'linear-gradient(135deg,#fed7aa,#fbcfe8,#fde68a)' },
  { name: 'Mint Cream', css: 'linear-gradient(135deg,#d1fae5,#a7f3d0,#6ee7b7)' },
  { name: 'Lilac Mist', css: 'linear-gradient(135deg,#ede9fe,#ddd6fe,#c4b5fd)' },
];

const BackgroundSettings: React.FC<BackgroundSettingsProps> = ({ value, onChange }) => {
  const isSolid = value.backgroundType === 'solid';
  const isSecondarySolid = value.secondaryBackgroundType === 'solid';

  const handleColorInput = (val: string) => {
    onChange({ backgroundValue: val });
  };
  const handleGradientSelect = (css: string) => {
    onChange({ backgroundValue: css, backgroundType: 'gradient' });
  };

  const handleSecondaryColorInput = (val: string) => {
    onChange({ secondaryBackgroundValue: val });
  };
  const handleSecondaryGradientSelect = (css: string) => {
    onChange({ secondaryBackgroundValue: css, secondaryBackgroundType: 'gradient' });
  };

  return (
    <div className="space-y-8">
      {/* Main Background */}
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-lg font-semibold text-gray-200">Main Background</h3>
          <div className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="zt-bg-type"
                value="solid"
                checked={isSolid}
                onChange={() => onChange({ backgroundType: 'solid', backgroundValue: value.backgroundValue.startsWith('linear-gradient') ? '#111827' : value.backgroundValue })}
                className="h-4 w-4 text-indigo-500 focus:ring-indigo-500 border-gray-600 bg-gray-800"
              />
              <span className="text-gray-300">Solid</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="zt-bg-type"
                value="gradient"
                checked={!isSolid}
                onChange={() => onChange({ backgroundType: 'gradient', backgroundValue: value.backgroundType === 'gradient' ? value.backgroundValue : GRADIENT_PRESETS[0].css })}
                className="h-4 w-4 text-indigo-500 focus:ring-indigo-500 border-gray-600 bg-gray-800"
              />
              <span className="text-gray-300">Gradient</span>
            </label>
          </div>
        </div>

        {isSolid && (
          <div className="space-y-3">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <input
                  aria-label="Pick main background color"
                  type="color"
                  value={/^#[0-9a-fA-F]{6}$/.test(value.backgroundValue) ? value.backgroundValue : '#111827'}
                  onChange={e => handleColorInput(e.target.value)}
                  className="h-10 w-10 rounded-md bg-transparent border border-gray-600 p-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={value.backgroundValue}
                  onChange={e => handleColorInput(e.target.value)}
                  placeholder="#111827"
                  className="w-32 rounded-md border border-gray-600 bg-gray-800 px-2 py-1 text-gray-200 text-sm font-mono focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              {/* Pick image from media library for background */}
              <div className="flex items-center gap-2">
                <MediaUrlPicker
                  label="Image"
                  size="sm"
                  mediaType="images"
                  onPick={(url) => onChange({ backgroundType: 'solid', backgroundValue: `url('${url}') center / cover no-repeat` })}
                />
              </div>
              <div className="flex-1 min-w-[220px]">
                <div className="grid grid-cols-12 gap-1">
                  {SOLID_SWATCHES.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleColorInput(c)}
                      title={c}
                      className={`h-6 rounded border ${c.toLowerCase() === value.backgroundValue.toLowerCase() ? 'ring-2 ring-indigo-400 border-indigo-400' : 'border-gray-700 hover:border-gray-500'} transition`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {!isSolid && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {GRADIENT_PRESETS.map(g => (
                <button
                  type="button"
                  key={g.name}
                  onClick={() => handleGradientSelect(g.css)}
                  className={`relative h-16 rounded-md border text-left px-3 py-2 flex items-end text-xs font-medium tracking-wide ${value.backgroundValue === g.css ? 'border-indigo-400 ring-2 ring-indigo-400' : 'border-gray-600 hover:border-gray-500'}`}
                  style={{ backgroundImage: g.css }}
                >
                  <span className="drop-shadow">{g.name}</span>
                </button>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Custom Gradient CSS</label>
              <input
                type="text"
                value={value.backgroundValue}
                onChange={e => handleGradientSelect(e.target.value)}
                placeholder="linear-gradient(135deg,#0f172a,#1e293b,#334155)"
                className="w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm font-mono focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">Provide full CSS gradient syntax. Click a preset to start.</p>
              <div className="mt-2">
                <MediaUrlPicker
                  label="Use image instead"
                  size="sm"
                  mediaType="images"
                  onPick={(url) => onChange({ backgroundType: 'solid', backgroundValue: `url('${url}') center / cover no-repeat` })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Secondary Background */}
      <div className="space-y-5 border-t border-gray-700 pt-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-lg font-semibold text-gray-200">Secondary Background</h3>
          <div className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="zt-secondary-bg-type"
                value="solid"
                checked={isSecondarySolid}
                onChange={() => onChange({ secondaryBackgroundType: 'solid', secondaryBackgroundValue: value.secondaryBackgroundValue.startsWith('linear-gradient') ? '#000000' : value.secondaryBackgroundValue })}
                className="h-4 w-4 text-indigo-500 focus:ring-indigo-500 border-gray-600 bg-gray-800"
              />
              <span className="text-gray-300">Solid</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="zt-secondary-bg-type"
                value="gradient"
                checked={!isSecondarySolid}
                onChange={() => onChange({ secondaryBackgroundType: 'gradient', secondaryBackgroundValue: value.secondaryBackgroundType === 'gradient' ? value.secondaryBackgroundValue : GRADIENT_PRESETS[0].css })}
                className="h-4 w-4 text-indigo-500 focus:ring-indigo-500 border-gray-600 bg-gray-800"
              />
              <span className="text-gray-300">Gradient</span>
            </label>
          </div>
        </div>

        {isSecondarySolid && (
          <div className="space-y-3">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <input
                  aria-label="Pick secondary background color"
                  type="color"
                  value={/^#[0-9a-fA-F]{6}$/.test(value.secondaryBackgroundValue) ? value.secondaryBackgroundValue : '#000000'}
                  onChange={e => handleSecondaryColorInput(e.target.value)}
                  className="h-10 w-10 rounded-md bg-transparent border border-gray-600 p-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={value.secondaryBackgroundValue}
                  onChange={e => handleSecondaryColorInput(e.target.value)}
                  placeholder="#000000"
                  className="w-32 rounded-md border border-gray-600 bg-gray-800 px-2 py-1 text-gray-200 text-sm font-mono focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              {/* Pick image from media library for secondary background */}
              <div className="flex items-center gap-2">
                <MediaUrlPicker
                  label="Image"
                  size="sm"
                  mediaType="images"
                  onPick={(url) => onChange({ secondaryBackgroundType: 'solid', secondaryBackgroundValue: `url('${url}') center / cover no-repeat` })}
                />
              </div>
              <div className="flex-1 min-w-[220px]">
                <div className="grid grid-cols-12 gap-1">
                  {SOLID_SWATCHES.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleSecondaryColorInput(c)}
                      title={c}
                      className={`h-6 rounded border ${c.toLowerCase() === value.secondaryBackgroundValue.toLowerCase() ? 'ring-2 ring-indigo-400 border-indigo-400' : 'border-gray-700 hover:border-gray-500'} transition`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {!isSecondarySolid && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {GRADIENT_PRESETS.map(g => (
                <button
                  type="button"
                  key={`secondary-${g.name}`}
                  onClick={() => handleSecondaryGradientSelect(g.css)}
                  className={`relative h-16 rounded-md border text-left px-3 py-2 flex items-end text-xs font-medium tracking-wide ${value.secondaryBackgroundValue === g.css ? 'border-indigo-400 ring-2 ring-indigo-400' : 'border-gray-600 hover:border-gray-500'}`}
                  style={{ backgroundImage: g.css }}
                >
                  <span className="drop-shadow">{g.name}</span>
                </button>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Custom Secondary Gradient CSS</label>
              <input
                type="text"
                value={value.secondaryBackgroundValue}
                onChange={e => handleSecondaryGradientSelect(e.target.value)}
                placeholder="linear-gradient(135deg,#000000,#111827,#374151)"
                className="w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-gray-200 text-sm font-mono focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">Background for outside the phone frame. Provide full CSS gradient syntax.</p>
              <div className="mt-2">
                <MediaUrlPicker
                  label="Use image instead"
                  size="sm"
                  mediaType="images"
                  onPick={(url) => onChange({ secondaryBackgroundType: 'solid', secondaryBackgroundValue: `url('${url}') center / cover no-repeat` })}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackgroundSettings;
