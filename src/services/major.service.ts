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

export async function createMajor(name: string): Promise<void> {
  await apiClient.post('/major', null, {
    params: { majorName: name.trim() }
  });
}

export async function updateMajor(id: number, name: string): Promise<void> {
  await apiClient.put(`/major/${id}`, null, {
    params: { majorName: name.trim() }
  });
}

export async function deleteMajor(id: number): Promise<void> {
  await apiClient.delete(`/major/${id}`);
}
