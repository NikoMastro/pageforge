import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JsonCardsGroup from '../../../components/ui/cards/jsonCardsGroup';
import type { LandingPageConfig, LandingPageData } from '../../../types';
import { useLandingPages } from '../../../hooks';
import { useTopNavigation } from '../../../components/layout/topNavigationContext';

// Dev page: shows only LPs whose name starts with "test-"
const TestLpsPage: React.FC = () => {
  const navigate = useNavigate();
  const { pages, loading, error, refresh, duplicate, deploy, updateTitle } = useLandingPages();
  type SimpleConfig = { id: string; name: string; path: string; hasHtml?: boolean; kind: 'unified'; lastUpdated: string; createdBy?: string; landingPageData?: LandingPageData };

  const { searchQuery } = useTopNavigation();

  // Adapt API shape
  const adaptedJsonConfigs: SimpleConfig[] = useMemo(() => {
    return pages
      .map((c: LandingPageConfig): SimpleConfig => ({
        id: c.id,
        name: c.backend.page_name,
        path: c.id,
        hasHtml: !!c.generatedHtml,
        kind: 'unified',
        lastUpdated: c.backend.timestamp,
        createdBy: c.backend.user,
        landingPageData: c.landingPageData
      }))
      .filter(cfg => cfg.name?.toLowerCase().startsWith('test-'));
  }, [pages]);

  const [jsonConfigs, setJsonConfigs] = useState<SimpleConfig[]>([]);
  const [filteredConfigs, setFilteredConfigs] = useState<SimpleConfig[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Sync base list
  useEffect(() => {
    setJsonConfigs(adaptedJsonConfigs);
    setFilteredConfigs(adaptedJsonConfigs);
  }, [adaptedJsonConfigs]);

  // Apply search on top of filtered test-* set
  useEffect(() => {
    if (!searchQuery.trim()) return setFilteredConfigs(jsonConfigs);
    setFilteredConfigs(jsonConfigs.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())));
  }, [jsonConfigs, searchQuery]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handlePreview = (config: SimpleConfig) => {
    navigate(`/landing-pages/${encodeURIComponent(config.name)}`);
  };

  const handleOpenLp = (config: SimpleConfig) => {
    window.open(`/landing/${config.name}`, '_blank');
  };

  const handleDeploy = async (config: SimpleConfig) => {
    try {
      const url = await deploy(config.id);
      if (url) await refresh();
    } catch (e) {
      console.error('Error during deployment:', e);
    }
  };

  const handleEditTitle = async (config: SimpleConfig, newTitle: string) => {
    try {
      await updateTitle(config.id, newTitle);
      await refresh();
    } catch (error) {
      console.error('Error updating title:', error);
      throw error;
    }
  };

  const handleDuplicate = async (config: SimpleConfig) => {
    const newName = prompt('Enter a name for the duplicated configuration:', `${config.name} (Copy)`);
    if (newName && newName.trim()) {
      try {
        await duplicate(config.id, newName.trim());
        await refresh();
        alert('Configuration duplicated successfully!');
      } catch (error) {
        console.error('Error duplicating configuration:', error);
        alert(`Failed to duplicate configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-0 py-0 flex flex-col h-full">
        <div className="flex-1 flex flex-col min-h-0">
          <JsonCardsGroup
            jsonConfigs={filteredConfigs}
            loading={loading}
            refreshing={refreshing}
            error={error}
            showAll={true}
            onRefresh={handleRefresh}
            onPreview={(c) => handlePreview(filteredConfigs.find(f => f.id === c.id) as SimpleConfig)}
            onOpenLp={(c) => handleOpenLp(filteredConfigs.find(f => f.id === c.id) as SimpleConfig)}
            onDeploy={(c) => handleDeploy(filteredConfigs.find(f => f.id === c.id) as SimpleConfig)}
            onEditTitle={(c, t) => handleEditTitle(filteredConfigs.find(f => f.id === c.id) as SimpleConfig, t)}
            onDuplicate={(c) => handleDuplicate(filteredConfigs.find(f => f.id === c.id) as SimpleConfig)}
          />
        </div>
      </div>
    </div>
  );
};

export default TestLpsPage;
