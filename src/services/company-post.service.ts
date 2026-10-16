import { apiClient } from './api';
import type { CompanyPostAdminPage, CompanyPostMine, CompanyPostMinePage } from '@/types/handbook';

function unwrap<T>(response: unknown): T {
  const r = response as { data?: T };
  return (r?.data ?? r) as T;
}

export interface CreateCompanyPostPayload {
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  featuredImageUrl?: string;
  categoryKey: string;
}

export interface UpdateCompanyPostPayload extends CreateCompanyPostPayload {}

export async function getMyCompanyPosts(page = 1, limit = 10): Promise<CompanyPostMinePage> {
  const res = await apiClient.get('/company/me/posts', { params: { page, limit } });
  return unwrap<CompanyPostMinePage>(res);
}

export async function getMyCompanyPost(postId: number): Promise<CompanyPostMine> {
  const res = await apiClient.get(`/company/me/posts/${postId}`);
  return unwrap<CompanyPostMine>(res);
}

export async function createCompanyPost(payload: CreateCompanyPostPayload): Promise<CompanyPostMine> {
  const res = await apiClient.post('/company/me/posts', payload);
  return unwrap<CompanyPostMine>(res);
}

export async function updateCompanyPost(
  postId: number,
  payload: UpdateCompanyPostPayload
): Promise<CompanyPostMine> {
  const res = await apiClient.put(`/company/me/posts/${postId}`, payload);
  return unwrap<CompanyPostMine>(res);
}

export async function submitCompanyPost(postId: number): Promise<CompanyPostMine> {
  const res = await apiClient.put(`/company/me/posts/${postId}/submit`);
  return unwrap<CompanyPostMine>(res);
}

export async function trashMyCompanyPost(postId: number): Promise<void> {
  await apiClient.put(`/company/me/posts/${postId}/trash`);
}

export async function getAdminPendingPosts(page = 1, limit = 10): Promise<CompanyPostAdminPage> {
  const res = await apiClient.get('/company/admin/posts/pending', { params: { page, limit } });
  return unwrap<CompanyPostAdminPage>(res);
}

export async function approveCompanyPost(postId: number): Promise<void> {
  await apiClient.put(`/company/admin/posts/${postId}/approve`);
}

export async function rejectCompanyPost(postId: number, rejectionNote: string): Promise<void> {
  await apiClient.put(`/company/admin/posts/${postId}/reject`, { rejectionNote });
}

export async function trashCompanyPostAdmin(postId: number): Promise<void> {
  await apiClient.put(`/company/admin/posts/${postId}/trash`);
}
