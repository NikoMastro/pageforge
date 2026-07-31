import React, { useState, useEffect } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Experiment, ExperimentVariant, PixelConfig } from '../../../types/experiments';

interface PixelEditorProps {
  experiment: Experiment;
  onSave: (pixels: ExperimentVariant[]) => Promise<void>;
}

interface PixelVariantWithConfig {
  name: string;
  weight: number;
  config: PixelConfig;
}

const PixelEditor: React.FC<PixelEditorProps> = ({
  experiment,
  onSave,
}) => {
  const [selectedPixels, setSelectedPixels] = useState<PixelVariantWithConfig[]>(
    experiment.pixels.map((px) => ({
      name: px.name,
      weight: Math.round(px.weight),
      config: {
        name: px.name,
        pixelMode: 'global',
        gameId: '',
        partnerId: '',
        isTest: true,
      } as PixelConfig,
    }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedPixels(
      experiment.pixels.map((px) => ({
        name: px.name,
        weight: Math.round(px.weight),
        config: {
          name: px.name,
          pixelMode: 'global',
          gameId: '',
          partnerId: '',
          isTest: true,
        } as PixelConfig,
      }))
    );
  }, [experiment]);

  const createDefaultPixelConfig = (): PixelConfig => ({
    pixelMode: 'global',
    gameId: '',
    partnerId: '',
    isTest: true,
  });

  const handleAddPixel = () => {
    const newPixel: PixelVariantWithConfig = {
      name: `pixel-${selectedPixels.length + 1}`,
      weight: 0,
      config: createDefaultPixelConfig(),
    };
    setSelectedPixels([...selectedPixels, newPixel]);
    setError(null);
  };

  const handleRemovePixel = (index: number) => {
    if (selectedPixels.length <= 2) {
      setError('An experiment must have at least 2 pixel configurations');
      return;
    }
    setSelectedPixels(selectedPixels.filter((_, i) => i !== index));
    setError(null);
  };

  const handleWeightChange = (index: number, weight: string) => {
    if (weight === '' || /^\d+$/.test(weight)) {
      const numWeight = weight === '' ? 0 : parseInt(weight, 10);
      const newPixels = [...selectedPixels];
      newPixels[index].weight = numWeight;
      setSelectedPixels(newPixels);
      setError(null);
      setSuccessMessage(null);
    }
  };

  const getTotalWeight = () => {
    return selectedPixels.reduce((sum, pixel) => sum + pixel.weight, 0);
  };

  const distributeEvenly = () => {
    if (selectedPixels.length === 0) return;

    const evenWeight = Math.round(100 / selectedPixels.length);
    setSelectedPixels(
      selectedPixels.map(pixel => ({
        ...pixel,
        weight: evenWeight,
      }))
    );
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedPixels.length < 2) {
      setError('Please add at least 2 pixel configurations');
      return;
    }

    const total = getTotalWeight();
    if (total === 0) {
      setError('Total weight must be greater than 0');
      return;
    }

    // Normalize weights to percentages that sum to 100
    const normalizedPixels: ExperimentVariant[] = selectedPixels.map(pixel => ({
      name: pixel.name,
      weight: Math.round((pixel.weight / total) * 100),
      config: pixel.config,
    }));

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await onSave(normalizedPixels);
      setSuccessMessage('Experiment saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save experiment');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-900/50 border border-green-700 rounded-lg text-green-200 text-sm">
          {successMessage}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-300">
            Pixel Configurations Distribution
          </label>
          <button
            type="button"
            onClick={distributeEvenly}
            disabled={selectedPixels.length === 0}
            className="text-sm text-blue-500 hover:text-blue-400 disabled:text-gray-600"
          >
            Distribute Evenly
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <div className="space-y-4 mb-3">
            {selectedPixels.map((pixel, index) => (
              <div key={index} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Pixel Name
                    </label>
                    <input
                      type="text"
                      value={pixel.name}
                      onChange={(e) => {
                        const newPixels = [...selectedPixels];
                        newPixels[index].name = e.target.value;
                        setSelectedPixels(newPixels);
                      }}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                      placeholder="Pixel name"
                      disabled={experiment.active}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Weight
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      value={pixel.weight}
                      onChange={(e) => handleWeightChange(index, e.target.value)}
                      className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                      placeholder="0"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemovePixel(index)}
                    disabled={selectedPixels.length <= 2}
                    className="p-2 text-red-500 hover:bg-red-900/30 rounded disabled:text-gray-600 disabled:cursor-not-allowed"
                    title={selectedPixels.length <= 2 ? 'Minimum 2 configs required' : 'Remove config'}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>


              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddPixel}
            disabled={experiment.active}
            className="w-full py-2 border-2 border-dashed border-gray-700 rounded-lg text-gray-400 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="h-5 w-5" />
            Add Pixel Configuration
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
        <button
          type="submit"
          disabled={isSaving || experiment.active}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {experiment.active && (
        <div className="p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg text-yellow-200 text-sm">
          ⚠️ This experiment is currently active. Deactivate it to make changes.
        </div>
      )}
    </form>
  );
};

export default PixelEditor;
