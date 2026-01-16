import type { SavedJob } from '@/types';
import { USE_MOCK } from './api';
import * as mockSavedJobs from '@/mocks/handlers/savedJobs.mock';
import { apiClient } from './api';

export async function getSavedJobs(userId: string): Promise<SavedJob[]> {
  if (USE_MOCK) {
    return mockSavedJobs.mockGetSavedJobs(userId);
  }
  
  const response = await apiClient.get(`/saved-jobs?user_id=${userId}`);
  return response.data;
}

export async function saveJob(userId: string, jobId: string): Promise<SavedJob> {
  if (USE_MOCK) {
    return mockSavedJobs.mockSaveJob(userId, jobId);
  }
  
  const response = await apiClient.post('/saved-jobs', {
    user_id: userId,
    job_id: jobId
  });
  return response.data;
}

export async function unsaveJob(userId: string, jobId: string): Promise<void> {
  if (USE_MOCK) {
    return mockSavedJobs.mockUnsaveJob(userId, jobId);
  }
  
  await apiClient.delete(`/saved-jobs?user_id=${userId}&job_id=${jobId}`);
}

