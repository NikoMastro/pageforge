import { useLandingPages } from './useLandingPages';
import type { CreateConfigRequest, LandingPageConfig } from '../../types/config.types';

export interface UseConfigReturn {
  saving: boolean;
  error: string | null;
  lastSavedConfig: LandingPageConfig | null;
  saveConfig: (request: CreateConfigRequest) => Promise<boolean>;
  updateConfig: (id: string, updates: Partial<CreateConfigRequest>) => Promise<boolean>;
  clearError: () => void;
}

export const useConfig = (): UseConfigReturn => {
  const lp = useLandingPages();
  let last: LandingPageConfig | null = null;
  return {
    saving: lp.loading,
    error: lp.error,
    lastSavedConfig: last,
    saveConfig: async (req) => {
      const created = await lp.create(req);
      last = created;
      return !!created;
    },
    updateConfig: async (id, updates) => (lp as any).rename(id, updates.page_name || ''),
    clearError: () => {
      // no-op placeholder for backwards compatibility
    },
  };
};
