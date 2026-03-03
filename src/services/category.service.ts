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
