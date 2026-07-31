import { useLandingPages } from './useLandingPages';
import type { LandingPageConfig } from '../../types/config.types';

export interface UseConfigManagerResult {
  configs: LandingPageConfig[];
  loading: boolean;
  error: string | null;
  refreshConfigs: () => Promise<void>;
  deleteConfig: (id: string) => Promise<void>;
  duplicateConfig: (id: string, newName: string) => Promise<LandingPageConfig>;
  updateConfigTitle: (id: string, newName: string) => Promise<void>;
}

export const useConfigManager = (): UseConfigManagerResult => {
  const lp = useLandingPages();
  return {
    configs: lp.pages,
    loading: lp.loading,
    error: lp.error,
    refreshConfigs: lp.refresh,
    deleteConfig: async (id: string) => {
      await lp.remove(id);
    },
    duplicateConfig: async (id: string, newName: string) => {
      const res = await lp.duplicate(id, newName);
      if (!res) throw new Error('Duplicate failed');
      return res;
    },
    updateConfigTitle: async (id: string, newName: string) => {
      await (lp as any).rename(id, newName);
    },
  };
};
