import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import JsonCardsGroup from '../../components/ui/cards/jsonCardsGroup';
import type { LandingPageConfig, LandingPageData } from '../../types';
import EditTitleModal from '../../components/ui/modals/editTitleModal';
import { useLandingPages, usePagination } from '../../hooks';
import { useTopNavigation } from '../../components/layout/topNavigationContext';
import { pageforgeApi } from '../../api';
import Pagination from '../../components/ui/pagination';

const LandingPagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { pages: configs, loading: configLoading, error: configError, refresh: refreshConfigs, updateTitle: updateConfigTitle, duplicate: duplicateConfig, deploy } = useLandingPages();
  // HTML status legacy removed (HTML always embedded)
  type SimpleConfig = { id: string; name: string; path: string; hasHtml?: boolean; kind: 'unified'; lastUpdated: string; createdBy?: string; landingPageData?: LandingPageData; htmlConfig?: any };
  const [jsonConfigs, setJsonConfigs] = useState<SimpleConfig[]>([]);
  const [filteredConfigs, setFilteredConfigs] = useState<SimpleConfig[]>([]);
  const { searchQuery } = useTopNavigation();
  const adaptedJsonConfigs: SimpleConfig[] = useMemo(() => {
    return configs
      .map((c: LandingPageConfig): SimpleConfig => ({
        id: c.id,
        name: c.backend.page_name,
        path: c.id,
        hasHtml: !!c.generatedHtml,
        kind: 'unified',
        lastUpdated: c.backend.timestamp,
        createdBy: c.backend.user,
        landingPageData: c.landingPageData,
        htmlConfig: c.htmlConfig
      }))
      // Exclude dev/test pages from main listing
      .filter(cfg => !(cfg.name?.toLowerCase().startsWith('test-')));
  }, [configs]);

  // Title Edit Modal states
  const [titleEditModalOpen, setTitleEditModalOpen] = useState(false);
  const [editingTitleConfig, setEditingTitleConfig] = useState<SimpleConfig | null>(null);

  // Deployment overlay removed: direct deploy action

  // Sync adapted configs into local state
  useEffect(() => {
    setJsonConfigs(adaptedJsonConfigs);
    setFilteredConfigs(adaptedJsonConfigs);
  }, [adaptedJsonConfigs]);

  // Filter configs based on search query
  useEffect(() => {
    if (!searchQuery.trim()) return setFilteredConfigs(jsonConfigs);
    setFilteredConfigs(jsonConfigs.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())));
  }, [jsonConfigs, searchQuery]);

  // Auto-refresh when a new config is created from the New LP flow
  useEffect(() => {
    const handler = () => { void handleRefresh(); };
    window.addEventListener('pageforge:config-created', handler as EventListener);
    return () => { window.removeEventListener('pageforge:config-created', handler as EventListener); };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshConfigs();
    setRefreshing(false);
  };

  const [refreshing, setRefreshing] = useState<boolean>(false);

  const handlePreview = (config: SimpleConfig) => {
    // Navigate to the preview page with the config name
    navigate(`/landing-pages/${encodeURIComponent(config.name)}`);
  };

  const handleOpenLp = (config: SimpleConfig) => {
    // Open the actual landing page (deployment view)
    window.open(`/landing/${config.name}`, '_blank');
  };

  const handleDeploy = async (config: SimpleConfig) => {
    try {
      const url = await deploy(config.id);
      if (url) {
        await refreshConfigs();
      } else {
        console.warn('Deployment triggered but no URL returned');
      }
    } catch (e) {
      console.error('Error during deployment:', e);
    }
  };

  const handleSaveTitle = async (newTitle: string) => {
    if (!editingTitleConfig) return;

    try {
      await updateConfigTitle(editingTitleConfig.id, newTitle);
      await refreshConfigs();
    } catch (error) {
      console.error('Error updating title:', error);
      throw error;
    }
  };

  const handleCloseTitleModal = () => {
    setTitleEditModalOpen(false);
    setEditingTitleConfig(null);
  };

  const handleEditTitle = async (config: SimpleConfig, newTitle: string) => {
    try {
      await updateConfigTitle(config.id, newTitle);
      await refreshConfigs();
    } catch (error) {
      console.error('Error updating title:', error);
      throw error;
    }
  };

  const handleDuplicate = async (config: SimpleConfig) => {
    const newName = prompt(`Enter a name for the duplicated configuration:`, `${config.name} (Copy)`);

    if (newName && newName.trim()) {
      try {
        await duplicateConfig(config.id, newName.trim());
        await refreshConfigs();
        alert('Configuration duplicated successfully!');
      } catch (error) {
        console.error('Error duplicating configuration:', error);
        alert(`Failed to duplicate configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleDelete = async (config: SimpleConfig) => {
    try {
      await pageforgeApi.deleteLandingPage(config.name);
      await refreshConfigs();
    } catch (error) {
      console.error('Error deleting landing page:', error);
      alert(`Failed to delete landing page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const { currentItems, currentPage, goToPage } = usePagination({
    items: filteredConfigs,
    itemsPerPage: 100,
  });

  const renderMainContent = () => {
    return (
      <>
        <JsonCardsGroup
          jsonConfigs={currentItems}
          loading={configLoading}
          refreshing={refreshing}
          error={configError}
          showAll={true}
          onRefresh={handleRefresh}
          onPreview={(c) => handlePreview(filteredConfigs.find(f => f.id === c.id) as SimpleConfig)}
          onOpenLp={(c) => handleOpenLp(filteredConfigs.find(f => f.id === c.id) as SimpleConfig)}
          onDeploy={(c) => handleDeploy(filteredConfigs.find(f => f.id === c.id) as SimpleConfig)}
          onEditTitle={(c, t) => handleEditTitle(filteredConfigs.find(f => f.id === c.id) as SimpleConfig, t)}
          onDuplicate={(c) => handleDuplicate(filteredConfigs.find(f => f.id === c.id) as SimpleConfig)}
          onDelete={(c) => handleDelete(filteredConfigs.find(f => f.id === c.id) as SimpleConfig)}
        />
        {filteredConfigs.length > 100 && (
          <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 z-10">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredConfigs.length}
              itemsPerPage={100}
              onPageChange={goToPage}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-0 py-0 flex flex-col h-full">
        {/* Main Content with JsonCardsGroup */}
        <div className="mx-auto w-full max-w-7xl px-4 pt-2 h-full flex flex-col">
          {renderMainContent()}
        </div>
      </div>

      {/* Title Edit Modal */}
      <EditTitleModal
        isOpen={titleEditModalOpen}
        config={editingTitleConfig}
        onSave={handleSaveTitle}
        onClose={handleCloseTitleModal}
      />
    </div>
  );
};

export default LandingPagesPage;
