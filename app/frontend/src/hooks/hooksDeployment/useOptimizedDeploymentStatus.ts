import { useCallback, useEffect, useMemo, useState } from 'react';
import { deploymentCacheService } from '../../services/deploymentCache.service';
import type { DeploymentStatusBasic } from './useDeploymentStatus';

interface DeploymentCacheEntry {
  deployed: boolean;
  url?: string;
  deployPath?: string;
  lastChecked: number;
  deployedAt?: number;
}

export interface UseOptimizedDeploymentStatusReturn {
  deploymentStatuses: Record<string, DeploymentStatusBasic>;
  isLoading: boolean;
  error: string | null;
  refreshStatus: (configName: string) => Promise<void>;
  refreshAllStatuses: () => Promise<void>;
  openDeployedPage: (url: string) => void;
  markAsDeployed: (configName: string, url: string) => Promise<void>;
  markAsDeleted: (configName: string) => Promise<void>;
}

export const useOptimizedDeploymentStatus = (configNames: string[] = []): UseOptimizedDeploymentStatusReturn => {
  const [deploymentStatuses, setDeploymentStatuses] = useState<Record<string, DeploymentStatusBasic>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const memoizedConfigNames = useMemo(() => [...configNames].sort(), [configNames]);

  const convertCacheEntryToStatus = useCallback(
    (entry: DeploymentCacheEntry, configName: string): DeploymentStatusBasic => ({
      deployed: entry.deployed || false,
      estimatedUrl: entry.url,
      deployPath: entry.deployPath,
      folderName: configName,
      message: entry.deployed ? 'Page is deployed' : 'Page not deployed',
      lastChecked: entry.lastChecked,
    }),
    []
  );

  const refreshStatus = useCallback(
    async (configName: string) => {
      try {
        setError(null);
        const cacheEntry = await deploymentCacheService.getDeploymentStatus(configName);
        const status = convertCacheEntryToStatus(cacheEntry, configName);
        setDeploymentStatuses((prev) => ({ ...prev, [configName]: status }));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to check deployment status';
        setError(errorMessage);
        console.warn(`Error checking deployment status for ${configName}:`, err);
      }
    },
    [convertCacheEntryToStatus]
  );

  const refreshAllStatuses = useCallback(async () => {
    if (memoizedConfigNames.length === 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const cacheEntries = await deploymentCacheService.getMultipleDeploymentStatuses(memoizedConfigNames);
      const statuses: Record<string, DeploymentStatusBasic> = {};
      Object.entries(cacheEntries).forEach(([configName, entry]) => {
        statuses[configName] = convertCacheEntryToStatus(entry, configName);
      });
      setDeploymentStatuses(statuses);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check deployment statuses';
      setError(errorMessage);
      console.warn('Error checking multiple deployment statuses:', err);
    } finally {
      setIsLoading(false);
    }
  }, [memoizedConfigNames, convertCacheEntryToStatus]);

  const openDeployedPage = useCallback((url: string) => {
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Failed to open deployed page:', err);
    }
  }, []);

  const markAsDeployed = useCallback(async (configName: string, url: string) => {
    try {
      await deploymentCacheService.markAsDeployed(configName, url);
      setDeploymentStatuses((prev) => ({
        ...prev,
        [configName]: {
          deployed: true,
          estimatedUrl: url,
          folderName: configName,
          message: 'Page is deployed',
          lastChecked: Date.now(),
        },
      }));
    } catch (err) {
      console.error('Failed to mark as deployed:', err);
    }
  }, []);

  const markAsDeleted = useCallback(async (configName: string) => {
    try {
      await deploymentCacheService.markAsDeleted(configName);
      setDeploymentStatuses((prev) => {
        const next = { ...prev };
        delete next[configName];
        return next;
      });
    } catch (err) {
      console.error('Failed to mark as deleted:', err);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      void refreshAllStatuses();
    }, 300);
    return () => clearTimeout(id);
  }, [refreshAllStatuses]);

  return {
    deploymentStatuses,
    isLoading,
    error,
    refreshStatus,
    refreshAllStatuses,
    openDeployedPage,
    markAsDeployed,
    markAsDeleted,
  };
};
