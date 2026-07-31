import { useCallback, useState } from 'react';

export interface UseDeploymentReturn {
  deploymentOverlayOpen: boolean;
  deployingConfig: { id: string; name: string } | null;
  openDeployment: (config: { id: string; name: string }) => void;
  closeDeployment: () => void;
}

export const useDeployment = (): UseDeploymentReturn => {
  const [deploymentOverlayOpen, setDeploymentOverlayOpen] = useState(false);
  const [deployingConfig, setDeployingConfig] = useState<{ id: string; name: string } | null>(null);

  const openDeployment = useCallback((config: { id: string; name: string }) => {
    setDeployingConfig(config);
    setDeploymentOverlayOpen(true);
  }, []);

  const closeDeployment = useCallback(() => {
    setDeploymentOverlayOpen(false);
    setDeployingConfig(null);
  }, []);

  return { deploymentOverlayOpen, deployingConfig, openDeployment, closeDeployment };
};
