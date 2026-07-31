import React from 'react';

import { JsonLanding, JsonLandingFullContent, JsonLandingPhone, LinkBioPage } from '@pageforge/static-websites';

export const CONTENT_TYPE: 'lp' | 'linkbio' = import.meta.env.VITE_CONTENT_TYPE;

declare global {
  interface Window {
    __PAGE_DATA__?: {
      type: 'lp' | 'linkbio';
      data: any;
      meta?: {
        title?: string;
        description?: string;
      };
    };
  }
}

export const App: React.FC = () => {
  const pageData = window.__PAGE_DATA__;

  if (!pageData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Error: No page data found</h1>
        <p>Please ensure the page configuration is properly loaded.</p>
      </div>
    );
  }

  // Route to appropriate component based on type
  if (pageData.type === 'lp') {
    const isFullContent = pageData.data?.metadata?.preset === 'full-content';
    const isPhoneLayout = true;
    if (isPhoneLayout && !isFullContent) {
      return <JsonLandingPhone content={pageData.data} />;
    }

    return isFullContent ? (
      <JsonLandingFullContent content={pageData.data} />
    ) : (
      <JsonLanding content={pageData.data} />
    );
  }

  if (pageData.type === 'linkbio') {
    const outerBg =
      pageData.data?.appearance?.secondaryBackground?.value ||
      pageData.data?.appearance?.background?.value ||
      '#000';

    return (
      <div style={{ background: outerBg, minHeight: '100vh', width: '100%' }}>
        <LinkBioPage json={pageData.data} />
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Error: Unknown page type "{pageData.type}"</h1>
    </div>
  );
};

export default App;
