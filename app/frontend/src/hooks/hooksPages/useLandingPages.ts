import { useCallback, useEffect, useState } from 'react';
import { pageforgeApi, mapRecordToLandingPageConfig } from '../../api';
import type { LandingPageNameRecord, LandingPageRecord } from '../../api';
import type { CreateConfigRequest, LandingPageConfig } from '../../types/config.types';
import { buildBackendPayload } from '../../utils/backendPayload';
import { isValidSlug } from '../../utils/slug';
import { useNotifications } from '../../components/layout/notifiations';
import { useAuth } from '../../components/layout/authContext';

export interface UseLandingPagesResult {
  pages: LandingPageConfig[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (req: CreateConfigRequest) => Promise<LandingPageConfig | null>;
  rename: (id: string, newName: string) => Promise<boolean>;
  updateTitle: (id: string, newName: string) => Promise<boolean>;
  duplicate: (id: string, newName: string) => Promise<LandingPageConfig | null>;
  remove: (id: string) => Promise<boolean>;
  deploying: boolean;
  deploy: (idOrName: string) => Promise<string | null>;
}

export function useLandingPages(): UseLandingPagesResult {
  const [pages, setPages] = useState<LandingPageConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { backendFail, userCreatedLp, deploymentSuccess, success } = useNotifications();
  const { user: authUser } = useAuth();
  const actor = authUser?.email || 'unknown';

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const names: LandingPageNameRecord[] = await pageforgeApi.getLandingPageNames(250);
      const recs: LandingPageRecord[] = (
        await Promise.all(
          names.map((n) =>
            pageforgeApi
              .getLandingPageLatest(n.page_name)
              .catch(() => null)
          )
        )
      ).filter((r): r is LandingPageRecord => !!r);
      setPages(recs.map(mapRecordToLandingPageConfig));
    } catch (e: any) {
      setError(e.message || 'Failed to load landing pages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = useCallback(
    async (req: CreateConfigRequest) => {
      try {
        setError(null);
        if (!isValidSlug(req.page_name)) {
          throw new Error(
            'Invalid name. Use lowercase letters, numbers and hyphens only (no spaces or special characters).'
          );
        }
        const { metadata } = await buildBackendPayload(
          { ...req, user: req.user || actor, type: req.type || 'create', commit: req.commit || 'create' } as any,
          { user: req.user || actor, type: req.type || 'create', commit: req.commit || 'create' }
        );
        await pageforgeApi.saveToFirestore({ metadata });
        let createdRec: LandingPageRecord | null = null;
        try {
          createdRec = await pageforgeApi.getLandingPageLatest(req.page_name);
        } catch {
          createdRec = null;
        }
        await load();
        if (createdRec) {
          try {
            userCreatedLp(req.page_name, req.user || actor);
          } catch {
            // ignore notification failure
          }
          return mapRecordToLandingPageConfig(createdRec);
        }
        return {
          id: metadata.hashid,
          backend: metadata,
          landingPageData: req.landingPageData,
          htmlConfig: req.htmlConfig || {},
          generatedHtml: '',
          kind: 'unified',
        } as LandingPageConfig;
      } catch (e: any) {
        const msg = e?.message || 'Create failed';
        try {
          backendFail(msg);
        } catch {
          // ignore notification failure
        }
        return null;
      }
    },
    [load, actor, backendFail, userCreatedLp]
  );

  const rename = useCallback(
    async (id: string, newName: string) => {
      try {
        const existing = pages.find((p) => p.id === id);
        if (!existing) throw new Error('Config not found');
        if (!isValidSlug(newName)) {
          throw new Error(
            'Invalid name. Use lowercase letters, numbers and hyphens only (no spaces or special characters).'
          );
        }
        const req: CreateConfigRequest = {
          page_name: newName,
          landingPageData: existing.landingPageData,
          htmlConfig: existing.htmlConfig,
          commit: 'rename',
          user: actor || existing.backend.user,
          type: 'update',
        };
        const { metadata } = await buildBackendPayload(req, { existingId: existing.id });
        await pageforgeApi.saveToFirestore({ metadata });
        await load();
        return true;
      } catch {
        return false;
      }
    },
    [pages, load, actor]
  );

  const duplicate = useCallback(
    async (id: string, newName: string) => {
      try {
        const existing = pages.find((p) => p.id === id);
        if (!existing) throw new Error('Config not found');
        if (!isValidSlug(newName)) {
          throw new Error(
            'Invalid name. Use lowercase letters, numbers and hyphens only (no spaces or special characters).'
          );
        }
        const req: CreateConfigRequest = {
          page_name: newName,
          landingPageData: existing.landingPageData,
          htmlConfig: existing.htmlConfig,
          commit: 'duplicate',
          user: actor || existing.backend.user,
          type: 'duplicate',
        };
        const { metadata } = await buildBackendPayload(req);
        await pageforgeApi.saveToFirestore({ metadata });
        let dupRec: LandingPageRecord | null = null;
        try {
          dupRec = await pageforgeApi.getLandingPageLatest(newName);
        } catch {
          dupRec = null;
        }
        await load();
        if (!dupRec) throw new Error('Failed to create duplicate - record not found after save');
        return mapRecordToLandingPageConfig(dupRec);
      } catch (e) {
        throw e;
      }
    },
    [pages, load, actor]
  );

  const remove = useCallback(async (_id: string) => {
    setError('Delete not implemented');
    return false;
  }, []);

  const deploy = useCallback(
    async (idOrName: string) => {
      setDeploying(true);
      try {
        let cfg = pages.find(
          (p) => p.id === idOrName || p.backend?.page_name === idOrName
        );
        if (!cfg) {
          await load();
          cfg = pages.find(
            (p) => p.id === idOrName || p.backend?.page_name === idOrName
          );
          if (!cfg) {
            try {
              const record = await pageforgeApi.getLandingPageLatest(idOrName);
              if (record) cfg = mapRecordToLandingPageConfig(record);
            } catch {
              try {
                const data = await pageforgeApi.getJsonFromFirestore(idOrName);
                if (data?.raw) {
                  cfg = mapRecordToLandingPageConfig(data.raw);
                }
              } catch {
                // config not found
              }
            }
          }
        }
        if (!cfg) {
          throw new Error(
            'Config missing - unable to find configuration for deployment. Make sure the page is saved first.'
          );
        }
        const meta = {
          ...cfg.backend,
          user: actor || cfg.backend.user,
          type: 'deploy',
          commit: 'deployment',
          timestamp: new Date().toISOString(),
          lp_json: JSON.stringify({ configId: cfg.id }),
        };
        const result = await pageforgeApi.deployToGCS({ metadata: meta });
        const deployedUrl = result.url || result.expectedUrl || null;
        if (deployedUrl) {
          try {
            deploymentSuccess(cfg.backend.page_name, deployedUrl);
          } catch {
            // ignore notification failure
          }
        } else {
          try {
            success(`Deployment started for "${cfg.backend.page_name}"`, { title: 'Deployment' });
          } catch {
            // ignore notification failure
          }
        }
        return deployedUrl;
      } catch (e: any) {
        const msg = e?.message || 'Deploy failed';
        setError(msg);
        try {
          backendFail(msg);
        } catch {
          // ignore notification failure
        }
        return null;
      } finally {
        setDeploying(false);
      }
    },
    [pages, actor, load, backendFail, deploymentSuccess, success]
  );

  const updateTitle = rename;

  return {
    pages,
    loading,
    error,
    refresh: load,
    create,
    rename,
    updateTitle,
    duplicate,
    remove,
    deploying,
    deploy,
  };
}
