import { useState, useEffect } from 'react';
import { LinkBioPage, type LinkBioJson } from '@pageforge/static-websites';
import { parseLinkBioFromServer } from '@builders/linkbio/parse';
import testLinkBioData from './test.json';

export default function LinkBioSandbox() {
  const [linkBioData, setLinkBioData] = useState<LinkBioJson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load the test data directly from the imported JSON
    const loadTestData = async () => {
      try {
        // Cast the imported JSON to the correct type
        const parsed = parseLinkBioFromServer(testLinkBioData);
        setLinkBioData(parsed.json as unknown as LinkBioJson);
      } catch (err) {
        console.warn('Failed to load test LinkBio data:', err);
        setLinkBioData(null);
      } finally {
        setLoading(false);
      }
    };

    loadTestData();
  }, []);

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
          <p className="text-gray-600">Unable to load test LinkBio configuration.</p>
        </div>
      </div>
    );
  }

  // Outer background: prefer secondaryBackground if provided, else fallback to primary background
  const outerBg = linkBioData.appearance.secondaryBackground?.value
    || linkBioData.appearance.background.value
    || '#000';
  const bgStyle: React.CSSProperties = { background: outerBg };

  return (
    <div className="min-h-screen w-full" style={bgStyle}>
      <div className="relative mx-auto grid w-full max-w-profileContainer grid-rows-[1fr_auto] min-h-[100lvh] sm:min-h-[calc(100lvh-2.5rem)]">
        <div
          className="absolute h-full w-full hidden sm:block"
          style={{
            background: 'inherit',
            clipPath: 'inset(0px calc(50% - min(50%, 290px)) 0px calc(50% - min(50%, 290px)) round 24px 24px 0 0)'
          }}
        />
        {/** Removed decorative border overlay for seamless transition between backgrounds **/}

        <div className="relative flex flex-col">
          <div className="flex-1 flex flex-col items-center px-4 py-10 md:py-16 sm:px-0">
            <LinkBioPage json={linkBioData} />
          </div>
        </div>
      </div>
    </div>
  );
}
