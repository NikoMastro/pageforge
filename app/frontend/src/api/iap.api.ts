import { requestJson } from './baseClient';

export function getIAPUserInfo(): Promise<{
  email: string;
  id: string;
}> {
  return requestJson<{ email: string; id: string }>('/iap/user');
}
