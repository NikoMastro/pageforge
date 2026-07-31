import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LinkBioPage } from "@pageforge/static-websites";
import { pageforgeApi } from "../../../../api";
import { parseLinkBioFromServer, type LinkBioJson } from '@builders/linkbio/parse';

export default function LinkBioViewer() {
  const { e } = useParams<{ e?: string }>();
  const id = e;

  const [linkBioData, setLinkBioData] = useState<LinkBioJson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLinkBioData = async () => {
      try {
        if (!id) {
          throw new Error('No LinkBio ID provided');
        }

        const latest = await pageforgeApi.getLinkBioLatest(id);
        const candidate = (latest as any)?.value ?? latest;
        const parsed = parseLinkBioFromServer(candidate);

        setLinkBioData(parsed.json);
      } catch (err: any) {
        setError(err?.message || 'Failed to load LinkBio');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-100 mb-4">No LinkBio Data Available</h1>
          <p className="text-gray-400">Unable to load LinkBio configuration{id ? ` for "${id}".` : '.'}</p>
          {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
          <p className="text-gray-500 mt-4 text-xs">Check the browser console for more details.</p>
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
