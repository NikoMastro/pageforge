import React, { useState, useEffect } from 'react';
import { useExperiments, useLandingPages } from '../../hooks/hooksPages';
import type { ExperimentFormPayload } from '../../types/experiments';
import { ExperimentList, ExperimentConfig } from '../../components/ui/experiments';
import { useNotifications } from '../../components/ui';

const ExperimentsPage: React.FC = () => {
  const { experiments, loading, error, createExperiment, deleteExperiment, toggleExperimentStatus } = useExperiments();
  const { pages: landingPages } = useLandingPages();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const { success, error: notifyError } = useNotifications();

  const availableLandingPages = landingPages.map(lp => lp.backend.page_name);

  // Listen for the event from navigation to open the configuration pane
  useEffect(() => {
    const handleOpenModal = () => {
      setIsConfigOpen(true);
    };

    const handleCloseModal = () => {
      setIsConfigOpen(false);
    };

    window.addEventListener('experiments:open-create-modal', handleOpenModal);
    window.addEventListener('experiments:close-create-modal', handleCloseModal);

    return () => {
      window.removeEventListener('experiments:open-create-modal', handleOpenModal);
      window.removeEventListener('experiments:close-create-modal', handleCloseModal);
    };
  }, []);

  useEffect(() => {
    const eventName = isConfigOpen ? 'experiments:create-modal-opened' : 'experiments:create-modal-closed';
    window.dispatchEvent(new Event(eventName));
  }, [isConfigOpen]);

  const handleCreateExperiment = async (payload: ExperimentFormPayload) => {
    try {
      await createExperiment(payload);
      success(`Experiment "${payload.experimentName}" created successfully`, { title: 'Experiment Created' });
      setIsConfigOpen(false);
    } catch (creationError) {
      notifyError('Failed to create experiment', { title: 'Create Error' });
      throw creationError;
    }
  };

  const handleDeleteExperiment = async (id: string) => {
    const result = await deleteExperiment(id);
    if (result) {
      success(`Experiment "${id}" deleted successfully`, { title: 'Deleted' });
    } else {
      notifyError('Failed to delete experiment', { title: 'Delete Error' });
    }
  };

  const handleToggleStatus = async (id: string) => {
    await toggleExperimentStatus(id);
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

  return (
    <div className="relative">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Experiments</h1>
          <p className="text-gray-400">
            Create and manage your A/B tests and traffic distribution experiments
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-700 bg-red-900/50 p-4 text-red-200">
            {error}
          </div>
        )}

        {/* Experiments List */}
        <ExperimentList
          experiments={experiments}
          onDelete={handleDeleteExperiment}
          onToggleStatus={handleToggleStatus}
        />
      </div>

      <ExperimentConfig
        mode="create"
        isOpen={isConfigOpen}
        availableLandingPages={availableLandingPages}
        onClose={() => setIsConfigOpen(false)}
        onSubmit={handleCreateExperiment}
        allowClose
        defaultCommit="create-experiment"
        isOverlay={true}
      />
    </div>
  );
};

export default ExperimentsPage;
