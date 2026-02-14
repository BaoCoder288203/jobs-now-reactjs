import type { Resume } from '@/types';
import { USE_MOCK } from './api';
import * as mockResume from '@/mocks/handlers/resume.mock';
import { apiClient } from './api';

export async function getResumes(userId: string): Promise<Resume[]> {
  if (USE_MOCK) {
    return mockResume.mockGetResumes(userId);
  }
  
  const response = await apiClient.get(`/resumes?user_id=${userId}`);
  return response.data;
}

export async function uploadResume(
  userId: string,
  file: File
): Promise<Resume> {
  if (USE_MOCK) {
    return mockResume.mockUploadResume(userId, file);
  }
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_id', userId);
  
  const response = await apiClient.post('/resumes/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}

export async function setDefaultResume(
  userId: string,
  resumeId: string
): Promise<Resume> {
  if (USE_MOCK) {
    return mockResume.mockSetDefaultResume(userId, resumeId);
  }
  
  const response = await apiClient.patch(`/resumes/${resumeId}/set-default`);
  return response.data;
}

export async function deleteResume(
  userId: string,
  resumeId: string
): Promise<void> {
  if (USE_MOCK) {
    return mockResume.mockDeleteResume(userId, resumeId);
  }
  
  await apiClient.delete(`/resumes/${resumeId}`);
}

