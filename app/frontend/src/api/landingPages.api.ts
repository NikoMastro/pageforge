import { requestJson } from './baseClient';
import { parseLpJson } from './firestoreParsers';

export interface LandingPageMetadata {
  user: string;
  type: string;
  commit: string;
  timestamp: string;
  page_name: string;
  lp_json: string;
  hashid: string;
}

export interface SaveToFirestoreRequest {
  metadata: LandingPageMetadata;
}

export interface SaveToFirestoreResponse {
  message: string;
}

export interface DeployToGCSRequest {
  metadata: LandingPageMetadata;
}

export interface DeployToGCSLegacyResponse {
  message: string;
  url?: string;
}

export interface DeployToGCSExtendedResponse {
  accepted: boolean;
  name?: string;
  expectedUrl?: string;
  buildId?: string;
  message?: string;
  url?: string;
}

export type DeployToGCSResponse =
  | DeployToGCSExtendedResponse
  | DeployToGCSLegacyResponse
  | (DeployToGCSExtendedResponse & DeployToGCSLegacyResponse);

export interface LandingPageRecord {
  user: string;
  type: string;
  commit: string;
  timestamp: string;
  page_name: string;
  lp_json: string;
  hashid: string;
}

export interface LandingPageNameRecord {
  page_name: string;
  latest_timestamp?: string;
}

export async function saveToFirestore(
  data: SaveToFirestoreRequest
): Promise<SaveToFirestoreResponse> {
  return requestJson<SaveToFirestoreResponse>('/lp/save', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deployToGCS(
  data: DeployToGCSRequest
): Promise<DeployToGCSExtendedResponse> {
  const name = encodeURIComponent(data.metadata.page_name);
  const raw = await requestJson<DeployToGCSResponse>(`/lp/deploy/${name}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if ('accepted' in raw || 'expectedUrl' in raw || 'buildId' in raw) {
    return {
      accepted: (raw as DeployToGCSExtendedResponse).accepted ?? true,
      name: (raw as DeployToGCSExtendedResponse).name || data.metadata.page_name,
      expectedUrl:
        (raw as DeployToGCSExtendedResponse).expectedUrl || (raw as any).url,
      buildId: (raw as DeployToGCSExtendedResponse).buildId,
      message:
        (raw as DeployToGCSExtendedResponse).message || (raw as any).message,
      url: (raw as any).url,
    };
  }

  const legacy = raw as DeployToGCSLegacyResponse;
  return {
    accepted: true,
    name: data.metadata.page_name,
    expectedUrl: legacy.url,
    buildId: undefined,
    message: legacy.message,
    url: legacy.url,
  };
}

export async function getLandingPageNames(
  limit: number = 100
): Promise<LandingPageNameRecord[]> {
  try {
    return await requestJson<LandingPageNameRecord[]>(`/lp/all?limit=${limit}`);
  } catch (error: any) {
    if (/(404)/.test(error?.message || '')) {
      return [];
    }
    throw error;
  }
}

export function getLandingPageLatest(
  name: string
): Promise<LandingPageRecord> {
  return requestJson<LandingPageRecord>(`/lp/id/${encodeURIComponent(name)}`);
}

export async function getLandingPageHistory(
  name: string
): Promise<LandingPageRecord[]> {
  const result = await requestJson<LandingPageRecord[] | LandingPageRecord>(
    `/lp/history/${encodeURIComponent(name)}`
  );

  if (Array.isArray(result)) {
    return result;
  }

  if (result && typeof result === 'object') {
    const hasExpectedProps =
      'hashid' in result || 'page_name' in result || 'timestamp' in result;
    if (hasExpectedProps) {
      return [result as LandingPageRecord];
    }
  }

  return [];
}

export async function getJsonFromFirestore(name?: string): Promise<{
  landingPageData: any;
  htmlConfig?: any;
  generatedHtml?: string;
  raw?: LandingPageRecord;
}> {
  let record: LandingPageRecord | null = null;

  if (name) {
    record = await getLandingPageLatest(name);
  } else {
    const names = await getLandingPageNames(100);
    if (names.length === 0) throw new Error('No landing pages found');
    record = await getLandingPageLatest(names[0].page_name);
  }

  const parsed =
    parseLpJson(
      record.lp_json,
      `getJsonFromFirestore-${record.page_name}-${record.hashid}`
    ) || {};

  return {
    landingPageData: parsed.landingPageData,
    htmlConfig: parsed.htmlConfig,
    generatedHtml: parsed.generatedHtml,
    raw: record,
  };
}

export interface DeletePageResponse {
  message: string;
  deletedCount: number;
  collection: string;
  pageName: string;
}

export async function deleteLandingPage(pageName: string): Promise<DeletePageResponse> {
  return requestJson<DeletePageResponse>(`/common/delete/lps/${encodeURIComponent(pageName)}`, {
    method: 'DELETE',
  });
}
