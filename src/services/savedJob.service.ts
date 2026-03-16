import type { SavedJob } from '@/types';
import { USE_MOCK } from './api';
import * as mockSavedJobs from '@/mocks/handlers/savedJobs.mock';
import { apiClient } from './api';

export async function getSavedJobs(profileId: string): Promise<SavedJob[]> {
  if (USE_MOCK) {
    return mockSavedJobs.mockGetSavedJobs(profileId);
  }
  const response = await apiClient.get(`/savedJob/${profileId}`);
  return response.data;
}

export async function saveJob(profileId: string, jobId: string): Promise<SavedJob> {
  if (USE_MOCK) {
    return mockSavedJobs.mockSaveJob(profileId, jobId);
  }
  const response = await apiClient.post(`/savedJob/${profileId}/job/${jobId}`);
  return response.data;
}

export async function unsaveJob(profileId: string, jobId: string): Promise<void> {
  if (USE_MOCK) {
    return mockSavedJobs.mockUnsaveJob(profileId, jobId);
  }
  await apiClient.delete(`/savedJob/${profileId}/job/${jobId}`);
}

export async function isJobSaved(profileId: string, jobId: string): Promise<boolean> {
  const response = await apiClient.get(`/savedJob/${profileId}/job/${jobId}`);
  return response.data;
}
