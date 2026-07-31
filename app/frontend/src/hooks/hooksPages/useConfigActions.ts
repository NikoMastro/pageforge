import { useCallback } from 'react';
import { useLandingPages } from './useLandingPages';

export interface UseConfigActionsReturn {
  deleteConfiguration: (config: { id: string }) => Promise<void>;
  deleteHtmlFile: (config: { id: string }) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useConfigActions = (): UseConfigActionsReturn => {
  const lp = useLandingPages();

  const deleteConfiguration = useCallback(
    async (config: { id: string }) => {
      try {
        await lp.remove(config.id);
      } catch (e) {
        console.error('Error deleting configuration:', e);
        throw e;
      }
    },
    [lp]
  );

  const deleteHtmlFile = useCallback(async () => {
    console.warn('[DEPRECATED] deleteHtmlFile called; HTML embedded.');
  }, []);

  const refreshData = useCallback(async () => {
    await lp.refresh();
  }, [lp]);

  return { deleteConfiguration, deleteHtmlFile, refreshData };
};
