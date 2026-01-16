import type { Job, JobListParams, PaginatedResponse } from '@/types';
import { USE_MOCK } from './api';
import * as mockJobs from '@/mocks/handlers/jobs.mock';
import { apiClient } from './api';

export async function getJobs(params?: JobListParams): Promise<PaginatedResponse<Job>> {
  if (USE_MOCK) {
    return mockJobs.mockGetJobs(params);
  }
  
  const response = await apiClient.get('/jobs', { params });
  return response.data;
}

export async function getJobDetail(jobId: string): Promise<Job> {
  if (USE_MOCK) {
    return mockJobs.mockGetJobDetail(jobId);
  }
  
  const response = await apiClient.get(`/jobs/${jobId}`);
  return response.data;
}

export async function createJob(data: Partial<Job>): Promise<Job> {
  if (USE_MOCK) {
    return mockJobs.mockCreateJob(data);
  }
  
  const response = await apiClient.post('/jobs', data);
  return response.data;
}

export async function updateJob(jobId: string, data: Partial<Job>): Promise<Job> {
  if (USE_MOCK) {
    return mockJobs.mockUpdateJob(jobId, data);
  }
  
  const response = await apiClient.put(`/jobs/${jobId}`, data);
  return response.data;
}

export async function deleteJob(jobId: string): Promise<void> {
  if (USE_MOCK) {
    return mockJobs.mockDeleteJob(jobId);
  }
  
  await apiClient.delete(`/jobs/${jobId}`);
}

