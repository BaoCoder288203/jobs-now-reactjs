import type { Application } from '@/types';
import { USE_MOCK } from './api';
import * as mockApps from '@/mocks/handlers/applications.mock';
import { apiClient } from './api';

export async function applyJob(
  userId: string,
  jobId: string,
  resumeId?: string,
  coverLetter?: string
): Promise<Application> {
  if (USE_MOCK) {
    return mockApps.mockApplyJob(userId, jobId, resumeId, coverLetter);
  }
  
  const response = await apiClient.post('/applications', {
    job_id: jobId,
    resume_id: resumeId,
    cover_letter: coverLetter
  });
  return response.data;
}

export async function getMyApplications(userId: string): Promise<Application[]> {
  if (USE_MOCK) {
    return mockApps.mockGetMyApplications(userId);
  }
  
  const response = await apiClient.get('/applications/me');
  return response.data;
}

export async function getJobApplications(jobId: string): Promise<Application[]> {
  if (USE_MOCK) {
    return mockApps.mockGetJobApplications(jobId);
  }
  
  const response = await apiClient.get(`/applications/job/${jobId}`);
  return response.data;
}

export async function updateApplicationStatus(
  applicationId: string,
  status: string
): Promise<Application> {
  if (USE_MOCK) {
    return mockApps.mockUpdateApplicationStatus(applicationId, status);
  }
  
  const response = await apiClient.patch(`/applications/${applicationId}/status`, {
    status
  });
  return response.data;
}

export async function getApplicationDetail(applicationId: string): Promise<Application> {
  if (USE_MOCK) {
    return mockApps.mockGetApplicationDetail(applicationId);
  }
  
  const response = await apiClient.get(`/applications/${applicationId}`);
  return response.data;
}

export async function getAllApplications(): Promise<Application[]> {
  if (USE_MOCK) {
    const result = await mockApps.mockGetAllApplications();
    return result.items || [];
  }
  
  const response = await apiClient.get('/applications');
  return response.data.items || response.data || [];
}

// Lấy applications của company (cho recruiter)
export async function getCompanyApplications(companyId: string): Promise<Application[]> {
  if (USE_MOCK) {
    return mockApps.mockGetCompanyApplications(companyId);
  }
  
  const response = await apiClient.get(`/applications/company/${companyId}`);
  return response.data.items || response.data || [];
}

export async function withdrawApplication(applicationId: string, userId: string): Promise<void> {
  if (USE_MOCK) {
    return mockApps.mockWithdrawApplication(applicationId, userId);
  }
  
  await apiClient.delete(`/applications/${applicationId}`);
}

