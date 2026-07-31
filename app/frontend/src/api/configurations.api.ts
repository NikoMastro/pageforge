import { requestJson } from './baseClient';

export interface ConfigCore {
  page_name?: string;
  description?: string;
  type: string;
  active: boolean;
  type_value?: string;
  value: any;
}

export interface ConfigAudit {
  Timestamp: string;
  hashid: string;
  user: string;
  commit: string;
}

export type ConfigRecordMetadata = ConfigCore & ConfigAudit;
export type ConfigSaveMetadata = ConfigCore & { commit: string };

type ConfigDataBase = Omit<ConfigCore, 'page_name'> & { page_name: string };
export type ConfigData = ConfigDataBase & Partial<ConfigAudit>;

export interface ConfigHistoryRecord {
  name: string;
  data: ConfigData;
  timestamp: string;
  version: number;
}

export async function saveConfig(data: {
  metadata: ConfigSaveMetadata | ConfigRecordMetadata;
}): Promise<{ message: string }> {
  const metaIn = data.metadata as any;
  const { type_value, typevalue, ...rest } = metaIn ?? {};
  const normalized = {
    ...rest,
    type_value: typeof type_value !== 'undefined' ? type_value : typevalue,
  };
  const payload = { metadata: normalized };
  return requestJson<{ message: string }>(`/config/save`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getAllConfigs(): Promise<ConfigData[]> {
  try {
    return await requestJson<ConfigData[]>('/config/all?limit=100');
  } catch (error: any) {
    if (/(404)/.test(error?.message || '')) {
      return [];
    }
    throw error;
  }
}

export function getConfig(name: string): Promise<ConfigData> {
  return requestJson<ConfigData>(`/config/id/${encodeURIComponent(name)}`);
}

const normalizeHistoryRecord = (
  item: any,
  idx: number,
  name: string
): ConfigHistoryRecord | null => {
  if (!item || typeof item !== 'object') return null;

  if ('name' in item && 'data' in item) {
    const record = item as ConfigHistoryRecord;
    const ts =
      record.timestamp ||
      (record.data as any)?.Timestamp ||
      (item as any)?.Timestamp ||
      '';
    return { ...record, timestamp: ts };
  }

  const page_name: string = item.page_name || item.name || name;
  const ts: string = item.Timestamp || item.timestamp || '';
  const data: ConfigData = {
    page_name,
    description: item.description,
    type: item.type,
    active: !!item.active,
    type_value:
      typeof item.type_value !== 'undefined' ? item.type_value : item.typevalue,
    value: typeof item.value === 'undefined' ? {} : item.value,
    Timestamp: ts,
    hashid: item.hashid,
    user: item.user,
    commit: item.commit,
  } as any;
  const versionRaw =
    item.version ?? (item.serverTimestamp && item.serverTimestamp._seconds);
  const version = typeof versionRaw === 'number' ? versionRaw : idx;
  return { name: page_name, data, timestamp: ts, version };
};

export async function getConfigHistory(
  name: string
): Promise<ConfigHistoryRecord[]> {
  const raw = await requestJson<any>(
    `/config/history/${encodeURIComponent(name)}`
  );

  if (Array.isArray(raw)) {
    return raw
      .map((item, idx) => normalizeHistoryRecord(item, idx, name))
      .filter(Boolean) as ConfigHistoryRecord[];
  }

  if (raw && typeof raw === 'object') {
    const single = normalizeHistoryRecord(raw, 0, name);
    return single ? [single] : [];
  }

  return [];
}

export interface DeleteConfigResponse {
  message: string;
  deletedCount: number;
  collection: string;
  pageName: string;
}

export async function deleteConfigByName(configName: string): Promise<DeleteConfigResponse> {
  return requestJson<DeleteConfigResponse>(`/common/delete/configs/${encodeURIComponent(configName)}`, {
    method: 'DELETE',
  });
}

export function deleteConfig(name: string): Promise<DeleteConfigResponse> {
  return deleteConfigByName(name);
}
