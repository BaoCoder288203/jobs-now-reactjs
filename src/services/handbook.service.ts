import { apiClient } from './api';
import type { HandbookPage, HandbookPost, HandbookPostDetail } from '@/types/handbook';

function unwrap<T>(response: unknown): T {
  const r = response as { data?: T };
  return (r?.data ?? r) as T;
}

export async function getHandbookFeatured(limit = 12): Promise<HandbookPost[]> {
  const res = await apiClient.get('/handbook/featured', { params: { limit } });
  return unwrap<HandbookPost[]>(res);
}

export async function getHandbookExplore(limit = 9): Promise<HandbookPost[]> {
  const res = await apiClient.get('/handbook/explore', { params: { limit } });
  return unwrap<HandbookPost[]>(res);
}

export async function getHandbookList(
  page = 1,
  size = 12,
  categoryKey?: string
): Promise<HandbookPage> {
  const res = await apiClient.get('/handbook', {
    params: {
      page,
      size,
      ...(categoryKey && categoryKey.length > 0 ? { categoryKey } : {}),
    },
  });
  return unwrap<HandbookPage>(res);
}

export async function getHandbookBySlug(slug: string): Promise<HandbookPostDetail> {
  const res = await apiClient.get(`/handbook/${encodeURIComponent(slug)}`);
  return unwrap<HandbookPostDetail>(res);
}
