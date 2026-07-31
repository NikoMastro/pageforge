import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { ExperimentConfig, ExperimentStats } from '../../../components/ui/experiments';
import { useExperiments, useLandingPages } from '../../../hooks/hooksPages';
import { useNotifications } from '../../../components/ui';
import type { Experiment, ExperimentFormPayload } from '../../../types/experiments';

const ExperimentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getExperiment, updateExperiment, toggleExperimentStatus } = useExperiments();
  const { pages: landingPages } = useLandingPages();
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { success: notifySuccess, error: notifyError } = useNotifications();

  const availableLandingPages = landingPages.map(lp => lp.backend.page_name);

  const loadExperiment = useCallback(async () => {
    if (!id) {
      setError('No experiment ID provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const exp = await getExperiment(id);
    if (exp) {
      setExperiment(exp);
    } else {
      setError('Experiment not found');
    }
    setLoading(false);
  }, [id, getExperiment]);

  useEffect(() => {
    loadExperiment();
  }, [loadExperiment]);

  const handleUpdateExperiment = async (payload: ExperimentFormPayload) => {
    if (!experiment) return;

    try {
      const updated = await updateExperiment(payload, { hashid: experiment.hashid });
      if (!updated) {
        throw new Error('Failed to update experiment');
      }
      setExperiment(updated);
      notifySuccess('Experiment updated', { title: 'Saved' });
    } catch (updateError) {
      notifyError('Failed to update experiment', { title: 'Update Error' });
      throw updateError;
    }
  };

  const handleToggleStatus = async () => {
    if (!experiment) return;

    const toggled = await toggleExperimentStatus(experiment.id);
    if (toggled) {
      await loadExperiment();
      notifySuccess(experiment.active ? 'Experiment disabled' : 'Experiment enabled', { title: 'Status Updated' });
    } else {
      notifyError('Unable to toggle experiment status', { title: 'Status Error' });
    }
  };

  const handleResetForm = () => {
    void loadExperiment();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !experiment) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="rounded-lg border border-red-700 bg-red-900/50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-200">Error</h2>
          <p className="text-red-300">{error || 'Experiment not found'}</p>
          <button
            onClick={() => navigate('/experiments')}
            className="mt-4 text-red-400 underline transition hover:text-red-300"
          >
            Back to Experiments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <button
        onClick={() => navigate('/experiments')}
        className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-gray-200"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        Back to Experiments
      </button>

      <ExperimentConfig
        mode="edit"
        isOpen
        experiment={experiment}
        availableLandingPages={availableLandingPages}
        onSubmit={handleUpdateExperiment}
        onClose={handleResetForm}
        headerActions={(
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleStatus}
              className="inline-flex items-center gap-2 rounded-md border border-gray-700 px-3 py-2 text-sm font-medium text-gray-200 transition hover:border-gray-500 hover:text-white"
            >
              {experiment.active ? (
                <>
                  <CheckCircleIcon className="h-4 w-4" />
                  Disable
                </>
              ) : (
                <>
                  <XCircleIcon className="h-4 w-4" />
                  Enable
                </>
              )}
            </button>
          </div>
        )}
        allowClose={false}
        defaultCommit="update-experiment"
        isOverlay={false}
      />

      <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6">
        <div className="mb-4 flex flex-col gap-4 text-sm text-gray-400 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <span>Created: {formatDate(experiment.createdAt)}</span>
            {experiment.updatedAt && <span>Updated: {formatDate(experiment.updatedAt)}</span>}
          </div>
        </div>
        {experiment.active ? (
          <ExperimentStats experiment={experiment} />
        ) : (
          <p className="text-sm text-gray-500">
            Activate this experiment to start collecting performance statistics.
          </p>
        )}
      </div>
    </div>
  );
};

export default ExperimentDetailPage;
