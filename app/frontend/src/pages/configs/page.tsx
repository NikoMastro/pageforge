import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import pageforgeApi, { type ConfigData } from '../../api';
import ConfigCardsPanel from '../../components/ui/cards/configCardsPanel';
import ConfirmDeleteModal from '../../components/ui/modals/configDeleteModal';
import { useTopNavigation } from '../../components/layout/topNavigationContext';
import { useNotifications } from '../../components/ui';
import Pagination from '../../components/ui/pagination';
import { usePagination } from '../../hooks/hooksPages';

const ConfigsListPage: React.FC = () => {
  const [configList, setConfigList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [configPendingDeletion, setConfigPendingDeletion] = useState<{ id: string; name: string } | null>(null);
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotifications();

  const coerceToBooleanFlag = (v: any): boolean => {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v !== 0;
    if (typeof v === 'string') {
      const s = v.trim().toLowerCase();
      return s === 'true' || s === '1' || s === 'active' || s === 'yes' || s === 'on';
    }
    return false;
  };

  const resolveConfigDescription = (config: any): string | undefined => {
    if (config?.description) return config.description;
    if (config?.desc) return config.desc;
    const value = (config as any)?.value;
    if (Array.isArray(value)) return value.map((entry) => String(entry)).join(', ');
    if (value && typeof value === 'object') {
      try {
        // Show a compact summary of the object
        const keys = Object.keys(value);
        if (keys.length === 0) return undefined;
        // Prefer common fields for readability
        const preferred = ['title', 'name', 'type', 'status', 'kind', 'env'];
        const found = preferred.find(fieldName => fieldName in value);
        if (found) {
          const fieldValue = value[found];
          return `${found}: ${typeof fieldValue === 'object' ? JSON.stringify(fieldValue) : String(fieldValue)}`;
        }
        // Fallback: first 2 entries
        const firstTwo = keys.slice(0, 2).map(key => `${key}: ${typeof value[key] === 'object' ? JSON.stringify(value[key]) : String(value[key])}`);
        return firstTwo.join(', ');
      } catch { /* ignore */ }
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
    return (config as any)?.type_value || (config as any)?.typevalue || undefined;
  };

  const resolveConfigAuthor = (config: any): string | undefined =>
    config?.user || config?.updatedBy || config?.createdBy || config?.author || undefined;

  const configHasActiveField = (config: any): boolean =>
    config != null && (("active" in config) || ("Active" in config) || ("isActive" in config) || ("status" in config));

  const fetchConfigs = useCallback(async (opts?: { isRefresh?: boolean }) => {
    const isRefresh = !!opts?.isRefresh;
    let mounted = true;
    try {
      if (isRefresh) setIsRefreshing(true); else setIsLoading(true);
      const data = await pageforgeApi.getAllConfigs();
      if (mounted) {
        setConfigList(data ?? []);
        setLoadError(null);
      }
    } catch (e: any) {
      if (mounted) setLoadError(e?.message || 'Failed to load configs');
    } finally {
      if (mounted) {
        if (isRefresh) setIsRefreshing(false); else setIsLoading(false);
      }
    }
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const configRows = useMemo(() => (configList as any[]) || [], [configList]);

  const handleDelete = (config: { id: string; name: string }) => {
    setConfigPendingDeletion(config);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!configPendingDeletion) return;

    try {
      await pageforgeApi.deleteConfig(configPendingDeletion.name);
      success(`Configuration "${configPendingDeletion.name}" has been deleted`, { title: 'Configuration Deleted' });

      // Remove the deleted config from the local state
      setConfigList(prev => prev.filter(existingConfig => existingConfig.page_name !== configPendingDeletion.name));

      setIsDeleteModalOpen(false);
      setConfigPendingDeletion(null);
    } catch (e: any) {
      console.error('Delete failed', e);
      notifyError(e?.message || 'Failed to delete configuration', { title: 'Delete Error' });
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setConfigPendingDeletion(null);
  };

  // Search integration with TopNavigation
  const { searchQuery } = useTopNavigation();
  const normalizedQuery = (searchQuery || '').trim().toLowerCase();

  // Enrich missing fields (author/description/active) best-effort for a limited number of items to avoid too many requests
  useEffect(() => {
    let cancelled = false;
    const configsRequiringEnrichment = configRows
      .filter((config) => !!config.page_name && (!resolveConfigAuthor(config) || !resolveConfigDescription(config) || !configHasActiveField(config)))
      .slice(0, 12);
    if (configsRequiringEnrichment.length === 0) return;
    (async () => {
      try {
        const enrichmentPromises = configsRequiringEnrichment.map(async (config) => {
          const pageName = config.page_name;
          if (!pageName || typeof pageName !== 'string') return null; // cannot enrich without a valid key
          try {
            const detail = await pageforgeApi.getConfig(pageName);
            const enriched: { name: string; user?: string; description?: string; active?: boolean } = {
              name: pageName,
              user: resolveConfigAuthor(detail),
              description: resolveConfigDescription(detail),
            };
            if (configHasActiveField(detail)) {
              enriched.active = coerceToBooleanFlag((detail as any)?.active ?? (detail as any)?.Active ?? (detail as any)?.isActive ?? (detail as any)?.status);
            }
            return enriched;
          } catch {
            return { name: pageName } as { name: string; user?: string; description?: string; active?: boolean };
          }
        });
        const results = (await Promise.all(enrichmentPromises)).filter(Boolean) as { name: string; user?: string; description?: string; active?: boolean }[];
        if (cancelled) return;
        // Build a merge map keyed by name with any enriched fields present
        const mergeByName = new Map<string, Partial<ConfigData>>();
        for (const r of results) {
          if (!r.name) continue;
          const patch: Partial<ConfigData> = {};
          if (r.user) patch.user = r.user;
          if (typeof r.description !== 'undefined') patch.description = r.description as any;
          if (typeof r.active !== 'undefined') (patch as any).active = r.active;
          if (Object.keys(patch).length > 0) mergeByName.set(r.name, patch);
        }
        if (mergeByName.size > 0) {
          setConfigList((prev) => prev.map((config) => {
            const key = config.page_name;
            if (!key || typeof key !== 'string') return config;
            return mergeByName.has(key) ? { ...config, ...mergeByName.get(key)! } : config;
          }));
        }
      } catch {
        // ignore enrichment failures
      }
    })();
    return () => { cancelled = true; };
  }, [configRows]);

  const filteredCardItems = useMemo(() => {
    const cardItems = configRows
      .filter((config) => config.page_name && typeof config.page_name === 'string')
      .map((config) => ({
        id: config.page_name!,
        name: config.page_name!,
        description: resolveConfigDescription(config),
        active: coerceToBooleanFlag((config as any)?.active ?? (config as any)?.Active ?? (config as any)?.isActive ?? (config as any)?.status),
        author: resolveConfigAuthor(config),
      }));
    if (!normalizedQuery) return cardItems;
    return cardItems.filter((it) =>
      it.name.toLowerCase().includes(normalizedQuery) ||
      (it.description && it.description.toLowerCase().includes(normalizedQuery)) ||
      (it.author && it.author.toLowerCase().includes(normalizedQuery))
    );
  }, [configRows, normalizedQuery]);

  const { currentItems, currentPage, goToPage } = usePagination({
    items: filteredCardItems,
    itemsPerPage: 100,
  });

  return (
    <div className="p-4 text-white relative flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <ConfigCardsPanel
          title=""
          configs={currentItems}
          loading={isLoading}
          refreshing={isRefreshing}
          error={loadError}
          showAll
          onRefresh={() => fetchConfigs({ isRefresh: true })}
          onOpen={({ name }) => navigate(`/configs/${encodeURIComponent(name)}`)}
          onDelete={handleDelete}
        />
      </div>

      {/* Sticky pagination at bottom */}
      {filteredCardItems.length > 100 && (
        <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 z-10">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredCardItems.length}
            itemsPerPage={100}
            onPageChange={goToPage}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        title="Are you sure?"
        message="This action cannot be undone. The configuration will be permanently deleted."
        itemName={configPendingDeletion?.name}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default ConfigsListPage;
