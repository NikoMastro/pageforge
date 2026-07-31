import { useLandingPages } from './useLandingPages';
import type { LandingPageConfig } from '../../types/config.types';

export interface UseConfigDeploymentResult {
  deploying: boolean;
  error: string | null;
  lastDeployment: { liveUrl?: string } | null;
  deployConfig: (config: { configId: string; configName: string }) => Promise<boolean>;
  deployLandingPageConfig: (config: LandingPageConfig) => Promise<boolean>;
  deployLegacyConfig: (_config: any) => Promise<boolean>;
  batchDeploy: () => Promise<{ succeeded: number; failed: number; results: any[] }>;
  listDeployments: () => Promise<string[]>;
  removeDeployment: (_folder: string) => Promise<boolean>;
  clearError: () => void;
}

export const useConfigDeployment = (): UseConfigDeploymentResult => {
  const lp = useLandingPages();
  let last: { liveUrl?: string } | null = null;
  return {
    deploying: lp.deploying,
    error: lp.error,
    lastDeployment: last,
    deployConfig: async ({ configId }) => {
      const url = await lp.deploy(configId);
      last = { liveUrl: url || undefined };
      return !!url;
    },
    deployLandingPageConfig: async (cfg) => {
      const url = await lp.deploy(cfg.backend?.page_name || cfg.id);
      last = { liveUrl: url || undefined };
      return !!url;
    },
    deployLegacyConfig: async () => false,
    batchDeploy: async () => ({ succeeded: 0, failed: 0, results: [] }),
    listDeployments: async () => [],
    removeDeployment: async () => false,
    clearError: () => {
      // no-op placeholder for backwards compatibility
    },
  };
};
