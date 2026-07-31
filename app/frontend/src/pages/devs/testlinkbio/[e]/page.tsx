import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LinkBioPage, type LinkBioJson } from '@pageforge/static-websites';
import { pageforgeApi } from '../../../../api';
import { parseLinkBioFromServer } from '@builders/linkbio/parse';

export default function LinkBioViewer() {
  const { name, e } = useParams<{ name?: string; e?: string }>();
  const id = name || e || null;

  const [linkBioData, setLinkBioData] = useState<LinkBioJson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinkBioData = async () => {
      try {
        if (id) {
          const latest = await pageforgeApi.getLinkBioLatest(id);
          const candidate = (latest as any)?.value ?? latest;
          const parsed = parseLinkBioFromServer(candidate);
          setLinkBioData(parsed.json as unknown as LinkBioJson);
          return;
        }

        throw new Error('No LinkBio configuration found');
      } catch (err) {
        console.warn('Failed to fetch LinkBio data:', err);
        setLinkBioData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLinkBioData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12"></div>
      </div>
    );
  }

  if (!linkBioData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No LinkBio Data Available</h1>
          <p className="text-gray-600">Unable to load LinkBio configuration{id ? ` for "${id}".` : '.'}</p>
        </div>
      </div>
    );
  }

  const outerBg =
    linkBioData.appearance.secondaryBackground?.value ||
    linkBioData.appearance.background.value ||
    '#000';

  return (
    <div style={{ background: outerBg, minHeight: '100vh', width: '100%' }}>
      <LinkBioPage json={linkBioData} />
    </div>
  );
}
