import { requestJson } from './baseClient';
import type {
  ConfigData,
  ConfigRecordMetadata,
  ConfigSaveMetadata,
} from './configurations.api';

export type LinkBioSaveMetadata = ConfigSaveMetadata;
export type LinkBioRecordMetadata = ConfigRecordMetadata;
export type LinkBioData = ConfigData;

export async function saveLinkBio(data: {
  metadata: LinkBioSaveMetadata | LinkBioRecordMetadata;
}): Promise<{ message: string; docId?: string }> {
  return requestJson<{ message: string; docId?: string }>(`/linkbio/save`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getLinkBioLatest(name: string): Promise<LinkBioData> {
  return requestJson<LinkBioData>(`/linkbio/id/${encodeURIComponent(name)}`);
}

export async function getLinkBioHistory(name: string): Promise<LinkBioData[]> {
  const raw = await requestJson<LinkBioData | LinkBioData[]>(
    `/linkbio/history/${encodeURIComponent(name)}`
  );
  return Array.isArray(raw) ? raw : raw ? [raw] : [];
}

export async function listLinkBios(): Promise<LinkBioData[]> {
  const raw = await requestJson<any>(`/linkbio/all`);
  return Array.isArray(raw) ? raw : [];
}

export async function deployLinkBio(
  name: string
): Promise<{ url?: string; message?: string; buildtab?: string } | null> {
  const latest: any = await getLinkBioLatest(name);
  const page_name: string = latest?.page_name || name;
  const val = latest?.value || {};
  const zt = val?.linkbio || val?.value?.linkbio || {};
  const description: string =
    latest?.description || zt?.general?.pageTitle || page_name;
  const type_value: string =
    latest?.type_value || zt?.link?.slug || page_name;

  const isoNow = new Date().toISOString();
  const Timestamp: string = latest?.Timestamp || latest?.timestamp || isoNow;
  const timestamp: string =
    latest?.timestamp || latest?.Timestamp || Timestamp || isoNow;

  let lp_json: string = '';
  if (typeof latest?.lp_json === 'string' && latest.lp_json.trim()) {
    lp_json = latest.lp_json;
  } else if (typeof val === 'string' && val.trim()) {
    lp_json = val;
  } else {
    try {
      lp_json = JSON.stringify(
        Object.keys(val || {}).length ? val : { linkbio: zt }
      );
    } catch {
      lp_json = '{}';
    }
  }

  const payload = {
    metadata: {
      page_name,
      description,
      active: !!latest?.active,
      type: 'linkbio',
      type_value,
      value: Object.keys(val || {}).length ? val : { linkbio: zt },
      Timestamp,
      timestamp,
      hashid: latest?.hashid || `${page_name}-${Date.now()}`,
      user: (latest?.user as string) || 'pageforge',
      commit: 'deploy',
      lp_json,
    },
  };

  const endpoint = `/linkbio/deploy/${encodeURIComponent(page_name)}`;
  const response = await requestJson<{
    url?: string;
    message?: string;
    buildtab?: string;
  }>(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return response || null;
}

export interface DeleteLinkBioResponse {
  message: string;
  deletedCount: number;
  collection: string;
  pageName: string;
}

export async function deleteLinkBio(pageName: string): Promise<DeleteLinkBioResponse> {
  return requestJson<DeleteLinkBioResponse>(`/common/delete/linkbio/${encodeURIComponent(pageName)}`, {
    method: 'DELETE',
  });
}
