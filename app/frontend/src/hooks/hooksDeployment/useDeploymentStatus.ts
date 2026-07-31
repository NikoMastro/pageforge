import { useCallback, useEffect, useState } from 'react';
import { deploymentCacheService } from '../../services/deploymentCache.service';

export interface DeploymentStatusBasic {
  deployed: boolean;
  folderName?: string;
  deployPath?: string;
  estimatedUrl?: string;
  message: string;
  lastChecked?: number;
}

export interface UseDeploymentStatusReturn {
  deploymentStatuses: Record<string, DeploymentStatusBasic>;
  isLoading: boolean;
  error: string | null;
  checkSingleDeployment: (configName: string) => Promise<DeploymentStatusBasic>;
  refreshStatuses: () => Promise<void>;
  openDeployedPage: (url: string) => void;
  copyDeploymentUrl: (url: string) => Promise<void>;
}

export const useDeploymentStatus = (configNames: string[] = []): UseDeploymentStatusReturn => {
  const [deploymentStatuses, setDeploymentStatuses] = useState<Record<string, DeploymentStatusBasic>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkSingleDeployment = async (configName: string): Promise<DeploymentStatusBasic> => {
    try {
      const status = await deploymentCacheService.checkDeploymentStatus(configName);
      setDeploymentStatuses((prev) => ({ ...prev, [configName]: status }));
      return status;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  };

  const refreshStatuses = useCallback(async () => {
    if (configNames.length === 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const statuses = await deploymentCacheService.checkMultipleDeployments(configNames);
      setDeploymentStatuses(statuses);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check deployment statuses';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [configNames]);

  const openDeployedPage = async (url: string) => {
    deploymentCacheService.openDeployedPage(url);
  };

  const copyDeploymentUrl = async (url: string) => {
    try {
      await deploymentCacheService.copyDeploymentUrl(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to copy URL';
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    void refreshStatuses();
  }, [refreshStatuses]);

  return {
    deploymentStatuses,
    isLoading,
    error,
    checkSingleDeployment,
    refreshStatuses,
    openDeployedPage,
    copyDeploymentUrl,
  };
};
