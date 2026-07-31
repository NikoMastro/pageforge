import React, { useState, useEffect } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Experiment, ExperimentVariant } from '../../../types/experiments';

interface ExperimentEditorProps {
  experiment: Experiment;
  availableLandingPages: string[];
  onSave: (landingPages: ExperimentVariant[]) => Promise<void>;
}

const ExperimentEditor: React.FC<ExperimentEditorProps> = ({
  experiment,
  availableLandingPages,
  onSave,
}) => {
  const [selectedPages, setSelectedPages] = useState<Array<{ name: string; weight: number }>>(
    experiment.landingPages.map(lp => ({ name: lp.name, weight: Math.round(lp.weight) }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isPixelMode = experiment.variantType === 'pixels';

  useEffect(() => {
    const variants = isPixelMode ? experiment.pixels : experiment.landingPages;
    setSelectedPages(
      variants.map(lp => ({ name: lp.name, weight: Math.round(lp.weight) }))
    );
  }, [experiment, isPixelMode]);

  const handleAddPage = () => {
    if (isPixelMode) {
      setSelectedPages([...selectedPages, { name: '', weight: 0 }]);
      setError(null);
      return;
    }

    const availablePages = availableLandingPages.filter(
      page => !selectedPages.find(sp => sp.name === page)
    );

    if (availablePages.length === 0) {
      setError('No more landing pages available');
      return;
    }

    setSelectedPages([...selectedPages, { name: availablePages[0], weight: 0 }]);
    setError(null);
  };

  const handleRemovePage = (index: number) => {
    if (selectedPages.length <= 1) {
      setError('An experiment must have at least 1 landing page');
      return;
    }
    setSelectedPages(selectedPages.filter((_, i) => i !== index));
    setError(null);
  };

  const handlePageChange = (index: number, lp: string) => {
    const newPages = [...selectedPages];
    newPages[index].name = lp;
    setSelectedPages(newPages);
  };

  const handleWeightChange = (index: number, weight: string) => {
    if (weight === '' || /^\d+$/.test(weight)) {
      const numWeight = weight === '' ? 0 : parseInt(weight, 10);
      const newPages = [...selectedPages];
      newPages[index].weight = numWeight;
      setSelectedPages(newPages);
      setError(null);
      setSuccessMessage(null);
    }
  };

  const getTotalWeight = () => {
    return selectedPages.reduce((sum, page) => sum + page.weight, 0);
  };

  const distributeEvenly = () => {
    if (selectedPages.length === 0) return;

    const evenWeight = Math.round(100 / selectedPages.length);
    setSelectedPages(
      selectedPages.map(page => ({
        ...page,
        weight: evenWeight,
      }))
    );
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedPages.length < 1) {
      setError('Please add at least 1 landing page');
      return;
    }

    const total = getTotalWeight();
    if (total === 0) {
      setError('Total weight must be greater than 0');
      return;
    }

    // Normalize weights to percentages that sum to 100
    const normalizedPages: ExperimentVariant[] = selectedPages.map(page => ({
      name: page.name,
      weight: Math.round((page.weight / total) * 100),
    }));

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await onSave(normalizedPages);
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
            {isPixelMode ? 'Pixels Distribution' : 'Landing Pages Distribution'}
          </label>
          <button
            type="button"
            onClick={distributeEvenly}
            disabled={selectedPages.length === 0}
            className="text-sm text-blue-500 hover:text-blue-400 disabled:text-gray-600"
          >
            Distribute Evenly
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <div className="space-y-3 mb-3">
            {selectedPages.map((page, index) => (
              <div key={index} className="flex gap-2 items-center p-3 bg-gray-800 rounded-lg border border-gray-700">
                {isPixelMode ? (
                  <input
                    type="text"
                    value={page.name}
                    onChange={(e) => handlePageChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-900 text-white"
                    placeholder="Pixel name"
                    disabled={experiment.active}
                  />
                ) : (
                  <select
                    value={page.name}
                    onChange={(e) => handlePageChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-900 text-white"
                    disabled={experiment.active}
                  >
                    {availableLandingPages
                      .filter(lp => lp === page.name || !selectedPages.find(sp => sp.name === lp))
                      .map(lp => (
                        <option key={lp} value={lp}>
                          {lp}
                        </option>
                      ))}
                  </select>
                )}

                <div className="flex items-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    value={page.weight}
                    onChange={(e) => handleWeightChange(index, e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-900 text-white"
                    placeholder="0"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemovePage(index)}
                  disabled={selectedPages.length <= 1}
                  className="p-2 text-red-500 hover:bg-red-900/30 rounded-lg disabled:text-gray-600 disabled:cursor-not-allowed"
                  title={selectedPages.length <= 1 ? 'Minimum 1 page required' : 'Remove page'}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddPage}
            disabled={experiment.active}
            className="w-full py-2 border-2 border-dashed border-gray-700 rounded-lg text-gray-400 hover:border-blue-500 hover:text-blue-500 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="h-5 w-5" />
            {isPixelMode ? 'Add Pixel' : 'Add Landing Page'}
          </button>
        </div>

        {experiment.active && (
          <p className="mt-2 text-sm text-amber-400">
            ⚠️ This experiment is active. Some modifications are restricted.
          </p>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-700">
        <button
          type="submit"
          disabled={isSaving || getTotalWeight() === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default ExperimentEditor;
