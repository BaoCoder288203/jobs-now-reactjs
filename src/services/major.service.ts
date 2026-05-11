import { apiClient } from './api';
import type { PagedList } from '@/types/paged';

export interface MajorDTO {
  majorId?: number;
  name?: string;
}

export async function getMajorsAdminPage(page: number, limit: number): Promise<PagedList<MajorDTO>> {
  const res = await apiClient.get('/admin/majors', { params: { page, limit } });
  const raw = (res as { data?: { items?: MajorDTO[]; totalCount?: number; page?: number; limit?: number; hasNext?: boolean } })
    .data ?? (res as { items?: MajorDTO[]; totalCount?: number; page?: number; limit?: number; hasNext?: boolean });
  const list = Array.isArray(raw.items) ? raw.items : [];
  return {
    items: list.map((m) => ({ majorId: m.majorId, name: m.name })),
    totalCount: Number(raw.totalCount ?? 0),
    page: Number(raw.page ?? page),
    limit: Number(raw.limit ?? limit),
    hasNext: Boolean(raw.hasNext),
  };
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
