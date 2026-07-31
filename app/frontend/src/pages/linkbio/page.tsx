import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTopNavigation } from '../../components/layout/topNavigationContext';
import { pageforgeApi } from '../../api';
import { useNotifications } from '../../components/layout/notifiations';
import { LinkBioList } from '../../components/linkbioconfig';
import { parseLinkBioFromServer } from '../../builders/linkbio/parse';

interface LinkBioSummary {
  id: string;
  title: string;
  pageTitle?: string;
  updatedAt: string;
  createdBy?: string;
  slug?: string;
}

const LinkBioPage: React.FC = () => {
  const navigate = useNavigate();
  const { searchQuery, setRefreshCallback } = useTopNavigation();
  const { deploymentSuccess, success, error: notifyError } = useNotifications();

  const [linkBios, setLinkBios] = useState<LinkBioSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLinkBios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await pageforgeApi.listLinkBios();
      const pageNames = (Array.isArray(raw) ? raw : []).map((r: any) => r?.page_name).filter(Boolean);

      // Fetch full data for each page to get user information
      const itemsPromises = pageNames.map(async (name: string) => {
        try {
          const fullData: any = await pageforgeApi.getLinkBioLatest(name);
          const ts: any = fullData?.timestamp || fullData?.Timestamp;
          let iso = '';
          if (typeof ts === 'string') {
            iso = ts;
          } else if (ts && typeof ts._seconds === 'number') {
            iso = new Date(ts._seconds * 1000).toISOString();
          } else {
            iso = new Date().toISOString();
          }
          const createdBy: string = fullData?.user || 'unknown';

          // Extract pageTitle from linkbio data
          const val = fullData?.value;
          const zt = val?.linkbio || val?.value?.linkbio || val;
          const pageTitle: string = zt?.general?.pageTitle || '';

          return { id: name, title: name || 'untitled', pageTitle, updatedAt: iso, createdBy };
        } catch (e) {
          console.warn(`Failed to load LinkBio ${name}:`, e);
          return { id: name, title: name || 'untitled', pageTitle: '', updatedAt: new Date().toISOString(), createdBy: 'unknown' };
        }
      });

      const items = await Promise.all(itemsPromises);

      // Filter out test configs
      const filtered = items.filter((item: LinkBioSummary) => {
        const name = item.id?.toLowerCase() || '';
        return !name.includes('test');
      });

      setLinkBios(filtered);
    } catch (e) {
      console.warn('Failed to load LinkBios:', e);
      setError('Failed to load LinkBios');
      setLinkBios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Register refresh callback in context
  useEffect(() => {
    setRefreshCallback(loadLinkBios);
    return () => setRefreshCallback(undefined);
  }, [loadLinkBios, setRefreshCallback]);

  useEffect(() => {
    loadLinkBios();
  }, [loadLinkBios]);

  // Listen for save events to refresh the list
  useEffect(() => {
    const handler = () => {
      void loadLinkBios();
    };
    window.addEventListener('pageforge:linkbio-saved', handler as EventListener);
    return () => {
      window.removeEventListener('pageforge:linkbio-saved', handler as EventListener);
    };
  }, [loadLinkBios]);

  const filteredLinkBios = useMemo(() => {
    if (!searchQuery.trim()) {
      return linkBios;
    }

    const needle = searchQuery.toLowerCase();

    return linkBios.filter((linkBio) => {
      const matches: string[] = [
        linkBio.title,
        linkBio.id,
      ]
        .map((value) => (typeof value === 'string' ? value.toLowerCase() : ''))
        .filter(Boolean);

      return matches.some((segment) => segment.includes(needle));
    });
  }, [linkBios, searchQuery]);

  const handleSelect = (id: string) => {
    navigate(`/linkbio/${encodeURIComponent(id)}`);
  };

  const handleDeploy = async (id: string) => {
    try {
      const res = await pageforgeApi.deployLinkBio(id);
      const deployedUrl = res?.url;
      if (deployedUrl) {
        deploymentSuccess(id, deployedUrl);
      } else {
        success(`Deployment started for "${id}"`, { title: 'Deployment' });
      }
      await loadLinkBios();
    } catch (e: any) {
      notifyError(e?.message || 'Deploy failed');
    }
  };

  const handleDuplicate = async (id: string) => {
    const newName = prompt('Enter a name for the duplicated LinkBio:', `${id} (Copy)`);
    if (!newName || !newName.trim()) return;

    const trimmedName = newName.trim();
    if (!/^[a-z0-9-_]+$/.test(trimmedName)) {
      notifyError('Configuration name must contain only lowercase letters, numbers, hyphens or underscores');
      return;
    }

    try {
      const data: any = await pageforgeApi.getLinkBioLatest(id);
      const val = data?.value;
      const zt = val?.linkbio || val?.value?.linkbio || val;

      if (!zt) {
        throw new Error('Could not load LinkBio data for duplication');
      }

      // Import the utilities for creating the metadata
      const { computeHashHex } = await import('../../utils/backendPayload');

      // Build backend metadata with new name
      const builderStateValue = { linkbio: zt };
      const parsed = parseLinkBioFromServer(builderStateValue);
      const normalizedJson = parsed.json;

      const timestamp = new Date().toISOString();
      const hashSource = JSON.stringify({ page_name: trimmedName, value: normalizedJson });
      const hashid = await computeHashHex(hashSource);

      const metadata = {
        page_name: trimmedName,
        description: zt?.general?.pageTitle || trimmedName,
        active: false,
        type: 'linkbio',
        type_value: zt?.link?.slug || '',
        value: normalizedJson,
        Timestamp: timestamp,
        timestamp,
        lp_json: JSON.stringify(normalizedJson),
        hashid,
        user: 'unknown', // Will be set by backend
        commit: 'duplicate',
      };

      await pageforgeApi.saveLinkBio({ metadata });
      await loadLinkBios();
      success(`LinkBio duplicated successfully as "${trimmedName}"`, { title: 'Duplicate' });
    } catch (e: any) {
      console.error('Error duplicating LinkBio:', e);
      notifyError(e?.message || 'Failed to duplicate LinkBio');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await pageforgeApi.deleteLinkBio(id);
      await loadLinkBios();
      success(`LinkBio "${id}" deleted successfully`, { title: 'Deleted' });
    } catch (e: any) {
      console.error('Error deleting LinkBio:', e);
      notifyError(e?.message || 'Failed to delete LinkBio');
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="mx-auto w-full max-w-7xl px-4 pt-2 h-full flex flex-col">
          <LinkBioList
            items={filteredLinkBios}
            selectedId={null}
            onSelect={handleSelect}
            onDeploy={handleDeploy}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};

export default LinkBioPage;
