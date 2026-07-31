import React from 'react';
import { pageforgeApi, type LinkBioData } from '../../api';
import { parseLinkBioFromServer, type LinkBioJson } from '@builders/linkbio/parse';
import { LinkBioPage } from '@pageforge/static-websites';

export interface LinkBioPreviewProps {
  /** Page name to fetch from backend (preferred). */
  name?: string;
  /** Optional: raw backend record or value to render without fetching. */
  data?: LinkBioData | any;
  className?: string;
  style?: React.CSSProperties;
  /** When true, fills available viewport height. */
  fullHeight?: boolean;
  onError?: (err: Error) => void;
}

/**
 * LinkBioPreview
 * - Fetches a LinkBio page by name from backend and renders it using Flows components
 * - Or accepts pre-fetched server data via `data`
 *
 * This mirrors the Sandbox viewer but uses the DB instead of local storage.
 */
const LinkBioPreview: React.FC<LinkBioPreviewProps> = ({ name, data, className, style, fullHeight = false, onError }) => {
  const [json, setJson] = React.useState<LinkBioJson | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const parseToLinkBioJson = React.useCallback((raw: any): LinkBioJson => {
    // parseLinkBioFromServer normalizes legacy shapes into the latest schema
    const parsed = parseLinkBioFromServer(raw);
    return parsed.json as unknown as LinkBioJson;
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    const handle = (err: any) => {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e.message);
      onError?.(e);
    };

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        if (data) {
          // Accept either full record or nested value
          const candidate = (data && typeof data === 'object' && 'value' in data) ? (data as any).value : data;
          const j = parseToLinkBioJson(candidate);
          if (!cancelled) setJson(j);
          return;
        }

        if (!name) return;
        const record = await pageforgeApi.getLinkBioLatest(name);
        // Backends typically return { page_name, value, ... }
        const candidate = (record as any)?.value ?? record;
        const j = parseToLinkBioJson(candidate);
        if (!cancelled) setJson(j);
      } catch (err) {
        if (!cancelled) handle(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [name, data, onError, parseToLinkBioJson]);

  // Compute outer background: prefer secondary background if present
  const outerBg = json?.appearance?.secondaryBackground?.value || json?.appearance?.background?.value || '#000';
  const wrapperStyle: React.CSSProperties = { background: outerBg, ...(style || {}) };

  if (loading) {
    return (
      <div className={`w-full ${fullHeight ? 'min-h-[60vh] sm:min-h-[70vh]' : 'min-h-[320px]'} flex items-center justify-center ${className || ''}`} style={wrapperStyle}>
        <div className="text-center text-gray-300">
          <div className="w-8 h-8 border-2 border-gray-600 border-t-gray-300 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm">Loading LinkBio…</p>
        </div>
      </div>
    );
  }

  if (error || !json) {
    return (
      <div className={`w-full ${fullHeight ? 'min-h-[60vh] sm:min-h-[70vh]' : 'min-h-[320px]'} flex items-center justify-center ${className || ''}`} style={wrapperStyle}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-900/20 border border-red-700 flex items-center justify-center mx-auto mb-3">
            <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-sm text-red-400">{error || 'Failed to load LinkBio'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${fullHeight ? 'min-h-[60vh] sm:min-h-[70vh]' : ''} ${className || ''}`} style={wrapperStyle}>
      <div className="relative mx-auto grid w-full max-w-profileContainer grid-rows-[1fr_auto] min-h-[100%]">
        <div
          className="absolute h-full w-full hidden sm:block pointer-events-none"
          style={{
            background: 'inherit',
            clipPath: 'inset(0px calc(50% - min(50%, 290px)) 0px calc(50% - min(50%, 290px)) round 24px 24px 0 0)'
          }}
        />
        <div className="relative flex flex-col">
          <div className="flex-1 flex flex-col items-center px-4 py-6 sm:py-10 sm:px-0">
            <LinkBioPage json={json} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkBioPreview;
