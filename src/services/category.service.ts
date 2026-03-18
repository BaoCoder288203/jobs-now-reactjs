import { apiClient } from './api';

export interface JobCategoryDTO {
  categoryId?: number;
  categoryName?: string;
  industryId?: number;
  industryName?: string;
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
