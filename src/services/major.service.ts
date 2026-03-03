import { apiClient } from './api';

export interface MajorDTO {
  majorId?: number;
  name?: string;
}

export async function getMajors(): Promise<MajorDTO[]> {
  const res = (await apiClient.get('/major')) as { data?: MajorDTO[] };
  const list = res?.data ?? res;
  return Array.isArray(list) ? list : [];
}
