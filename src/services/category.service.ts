import { apiClient } from './api';
import type { PagedList } from '@/types/paged';

export interface JobCategoryDTO {
  categoryId?: number;
  categoryName?: string;
  industryId?: number;
  industryName?: string;
}

export async function getJobCategoriesAdminPage(page: number, limit: number): Promise<PagedList<JobCategoryDTO>> {
  const res = await apiClient.get('/admin/job-categories', { params: { page, limit } });
  const raw = (res as { data?: PagedList<JobCategoryDTO> }).data ?? (res as PagedList<JobCategoryDTO>);
  return {
    items: Array.isArray(raw.items) ? raw.items : [],
    totalCount: Number(raw.totalCount ?? 0),
    page: Number(raw.page ?? page),
    limit: Number(raw.limit ?? limit),
    hasNext: Boolean(raw.hasNext),
  };
}

export async function getJobCategories(): Promise<JobCategoryDTO[]> {
  const res = (await apiClient.get('/category/all')) as { data?: JobCategoryDTO[] };
  const list = res?.data ?? res;
  return Array.isArray(list) ? list : [];
}

export async function getJobCategoriesByIndustry(industryId: number): Promise<JobCategoryDTO[]> {
  const res = (await apiClient.get(`/category/industry/${industryId}`)) as { data?: JobCategoryDTO[] };
  const list = res?.data ?? res;
  return Array.isArray(list) ? list : [];
}

export async function createJobCategory(payload: { categoryName: string; industryId: number }): Promise<void> {
  await apiClient.post('/category/add', {
    categoryName: payload.categoryName.trim(),
    industryId: payload.industryId
  });
}

export async function updateJobCategory(payload: {
  categoryId: number;
  categoryName?: string;
  industryId?: number | null;
}): Promise<void> {
  await apiClient.put('/category/update', {
    categoryId: payload.categoryId,
    categoryName: payload.categoryName?.trim(),
    industryId: payload.industryId ?? undefined
  });
}

export async function deleteJobCategory(categoryId: number): Promise<void> {
  await apiClient.delete(`/category/delete/${categoryId}`);
}
