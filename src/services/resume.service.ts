import type { Resume } from '@/types';
import { USE_MOCK } from './api';
import * as mockResume from '@/mocks/handlers/resume.mock';
import { apiClient } from './api';

function unwrap<T>(res: unknown): T {
  const obj = res as { data?: T };
  return (obj?.data ?? res) as T;
}

function mapResumeFromBE(item: {
  resumeId: number;
  resumeName: string;
  resumeUrl: string;
  summary?: string | null;
  templateKey?: string | null;
  uploadedAt: string;
  isPrimary?: boolean;
}): Resume {
  return {
    resumeId: item.resumeId,
    resumeName: item.resumeName,
    resumeUrl: item.resumeUrl,
    summary: item.summary ?? null,
    templateKey: item.templateKey ?? undefined,
    uploadedAt: item.uploadedAt,
    id: String(item.resumeId),
    file_name: item.resumeName,
    file_url: item.resumeUrl,
    created_at: item.uploadedAt,
    is_default: item.isPrimary ?? false,
  };
}

export async function getResumes(userId: string): Promise<Resume[]> {
  if (USE_MOCK) {
    return mockResume.mockGetResumes(userId);
  }
  const profileRes = await apiClient.get(`/profile/user/${userId}`);
  const profile = unwrap<{ profileId: number }>(profileRes);
  if (!profile?.profileId) return [];
  const listRes = await apiClient.get(`/resume/profile/${profile.profileId}`);
  const list = unwrap<{ resumeId: number; resumeName: string; resumeUrl: string; summary?: string | null; templateKey?: string | null; uploadedAt: string; isPrimary?: boolean }[]>(listRes);
  if (!Array.isArray(list)) return [];
  return list.map(mapResumeFromBE);
}

export async function uploadResume(userId: string, file: File, resumeName?: string): Promise<Resume> {
  if (USE_MOCK) {
    return mockResume.mockUploadResume(userId, file);
  }
  const profileRes = await apiClient.get(`/profile/user/${userId}`);
  const profile = unwrap<{ profileId: number }>(profileRes);
  if (!profile?.profileId) throw new Error('Profile not found');
  const formData = new FormData();
  formData.append('resumeName', resumeName ?? file.name ?? 'CV');
  formData.append('resume', file);
  const res = await apiClient.post(`/resume/create/${profile.profileId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  unwrap(res);
  const list = await getResumes(userId);
  const created = list.find((r) => r.resumeName === (resumeName ?? file.name));
  return created ?? mapResumeFromBE({ resumeId: 0, resumeName: file.name, resumeUrl: '', uploadedAt: new Date().toISOString(), isPrimary: false });
}

export async function setDefaultResume(userId: string, resumeId: string): Promise<Resume | void> {
  if (USE_MOCK) {
    return mockResume.mockSetDefaultResume(userId, resumeId);
  }
  const profileRes = await apiClient.get(`/profile/user/${userId}`);
  const profile = unwrap<{ profileId: number }>(profileRes);
  if (!profile?.profileId) throw new Error('Profile not found');
  await apiClient.put(`/resume/${resumeId}/set-primary`, null, {
    params: { profileId: profile.profileId },
  });
  const list = await getResumes(userId);
  return list.find((r) => String(r.resumeId) === resumeId);
}

export async function updateResume(
  resumeId: string,
  data: { resumeName?: string; summary?: string | null; templateKey?: string }
): Promise<Resume> {
  if (USE_MOCK) {
    return mockResume.mockUpdateResume(resumeId, data);
  }
  const res = await apiClient.put(`/resume/${resumeId}`, data);
  const dto = unwrap<{ resumeId: number; resumeName: string; resumeUrl: string; summary?: string | null; templateKey?: string | null; uploadedAt: string; isPrimary?: boolean }>(res);
  return mapResumeFromBE(dto);
}

export async function deleteResume(userId: string, resumeId: string): Promise<void> {
  if (USE_MOCK) {
    return mockResume.mockDeleteResume(userId, resumeId);
  }
  await apiClient.delete(`/resume/delete/${resumeId}`);
}

export async function initResume(userId: string, resumeName: string, templateKey?: string): Promise<Resume> {
  const profileRes = await apiClient.get(`/profile/user/${userId}`);
  const profile = unwrap<{ profileId: number }>(profileRes);
  if (!profile?.profileId) throw new Error('Profile not found');
  const payload = templateKey ? { resumeName, templateKey } : { resumeName };
  const res = await apiClient.post(`/resume/init/${profile.profileId}`, payload);
  const data = unwrap<{ resumeId: number; resumeName: string; resumeUrl: string; templateKey?: string | null; uploadedAt: string; isPrimary?: boolean }>(res);
  return mapResumeFromBE(data);
}
