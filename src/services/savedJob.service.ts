import type { SavedJob } from '@/types';
import { USE_MOCK } from './api';
import * as mockSavedJobs from '@/mocks/handlers/savedJobs.mock';
import { apiClient } from './api';

function unwrap<T>(res: unknown): T {
  const obj = res as { data?: T };
  return (obj?.data ?? res) as T;
}

interface SavedJobDTO {
  savedJobId?: number;
  jobId: number;
  jobTitle?: string;
  companyName?: string;
  companyLogo?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType?: string;
  savedAt?: string;
  isSaved?: boolean;
}

function mapSavedJobFromBE(dto: SavedJobDTO, userId: string): SavedJob {
  const jobIdStr = String(dto.jobId);
  const savedAt = dto.savedAt ?? new Date().toISOString();
  return {
    id: dto.savedJobId != null ? String(dto.savedJobId) : jobIdStr,
    user_id: userId,
    job_id: jobIdStr,
    created_at: savedAt,
    job: {
      id: jobIdStr,
      company_id: '',
      title: dto.jobTitle ?? '',
      description: '',
      created_at: savedAt,
      updated_at: savedAt,
      status: 'ACTIVE',
      company: dto.companyName
        ? {
            id: '',
            name: dto.companyName,
            logo_url: dto.companyLogo,
            owner_user_id: '',
            created_at: '',
            updated_at: '',
          }
        : undefined,
      salary_min: dto.salaryMin,
      salary_max: dto.salaryMax,
      location: dto.location,
      job_type: dto.jobType
    }
  };
}

async function getProfileId(userId: string): Promise<number | null> {
  const profileRes = await apiClient.get(`/profile/user/${userId}`);
  const profile = unwrap<{ profileId?: number }>(profileRes);
  return profile?.profileId ?? null;
}

export async function getSavedJobs(userId: string): Promise<SavedJob[]> {
  if (USE_MOCK) {
    return mockSavedJobs.mockGetSavedJobs(userId);
  }
  const profileId = await getProfileId(userId);
  if (profileId == null) return [];
  const res = await apiClient.get(`/savedJob/${profileId}`);
  const list = unwrap<SavedJobDTO[]>(res);
  if (!Array.isArray(list)) return [];
  return list.map((dto) => mapSavedJobFromBE(dto, userId));
}

export async function saveJob(userId: string, jobId: string): Promise<SavedJob> {
  if (USE_MOCK) {
    return mockSavedJobs.mockSaveJob(userId, jobId);
  }
  const profileId = await getProfileId(userId);
  if (profileId == null) throw new Error('Profile not found');
  const res = await apiClient.post(`/savedJob/${profileId}/job/${jobId}`);
  const dto = unwrap<SavedJobDTO>(res);
  return mapSavedJobFromBE(dto, userId);
}

export async function unsaveJob(userId: string, jobId: string): Promise<void> {
  if (USE_MOCK) {
    return mockSavedJobs.mockUnsaveJob(userId, jobId);
  }
  const profileId = await getProfileId(userId);
  if (profileId == null) return;
  await apiClient.delete(`/savedJob/${profileId}/job/${jobId}`);
}

