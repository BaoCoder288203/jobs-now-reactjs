import type { Job, JobListParams, PaginatedResponse } from '@/types';
import { USE_MOCK } from './api';
import * as mockJobs from '@/mocks/handlers/jobs.mock';
import { apiClient } from './api';

interface JobDTO {
  jobId?: number;
  title?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  salaryMin?: number;
  salaryMax?: number;
  yearsOfExperience?: string;
  educationLevel?: string;
  jobType?: string;
  location?: string;
  postedAt?: string;
  deadline?: string;
  isActive?: boolean;
  companyId?: number;
  companyName?: string;
  companyLogo?: string;
  categoryId?: number;
  categoryName?: string;
}

function mapJobDTOToJob(dto: JobDTO): Job {
  return {
    id: String(dto.jobId ?? ''),
    company_id: String(dto.companyId ?? ''),
    title: dto.title ?? '',
    description: dto.description ?? '',
    requirements: dto.requirements,
    salary_min: dto.salaryMin,
    salary_max: dto.salaryMax,
    location: dto.location,
    job_type: dto.jobType,
    status: dto.isActive ? 'open' : 'closed',
    expired_at: dto.deadline,
    created_at: dto.postedAt ?? new Date().toISOString(),
    updated_at: dto.postedAt ?? new Date().toISOString(),
  };
}

export async function getJobs(params?: JobListParams): Promise<PaginatedResponse<Job>> {
  if (USE_MOCK) {
    return mockJobs.mockGetJobs(params);
  }

  if (params?.company_id) {
    const res = (await apiClient.get(`/job/company/${params.company_id}`)) as { data?: JobDTO[] };
    const list = (res.data ?? res) as JobDTO[] | JobDTO;
    const arr = Array.isArray(list) ? list : [list];
    const items = arr.map(mapJobDTOToJob);
    return {
      items,
      pagination: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        total: items.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  const keyword = params?.search;
  const categoryId = params?.category_id ? parseInt(params.category_id, 10) : undefined;
  const location = params?.location ? [params.location] : undefined;

  if (keyword || (location && location.length > 0) || categoryId != null) {
    const res = (await apiClient.get('/job/searchJobs', {
      params: { keyword, location, categoryId },
    })) as { data?: JobDTO[] };
    const list = (res.data ?? res) as JobDTO[] | JobDTO;
    const arr = Array.isArray(list) ? list : [list];
    const items = arr.map(mapJobDTOToJob);
    return {
      items,
      pagination: {
        page: 1,
        limit: items.length,
        total: items.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  const res = (await apiClient.get('/job')) as { data?: JobDTO[] };
  const list = (res.data ?? res) as JobDTO[] | JobDTO;
  const arr = Array.isArray(list) ? list : [list];
  const items = arr.map(mapJobDTOToJob);
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const start = (page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit),
      hasNext: start + limit < items.length,
      hasPrev: page > 1,
    },
  };
}

export async function getJobDetail(jobId: string): Promise<Job> {
  if (USE_MOCK) {
    return mockJobs.mockGetJobDetail(jobId);
  }

  const res = (await apiClient.get(`/job/${jobId}`)) as { data?: JobDTO };
  const dto = (res.data ?? res) as JobDTO;
  return mapJobDTOToJob(dto);
}

export async function createJob(data: Partial<Job>): Promise<Job> {
  if (USE_MOCK) {
    return mockJobs.mockCreateJob(data);
  }

  const deadline = data.expired_at
    ? new Date(data.expired_at).toISOString().slice(0, 10)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const body = {
    companyId: data.company_id ? parseInt(String(data.company_id), 10) : undefined,
    title: data.title,
    description: data.description,
    requirements: data.requirements ?? '',
    benefits: data.benefits ?? '',
    salaryMin: data.salary_min ?? 0,
    salaryMax: data.salary_max ?? 0,
    yearsOfExperience: '0',
    educationLevel: 'HIGH_SCHOOL',
    jobType: data.job_type ?? 'FULL_TIME',
    location: data.location ?? '',
    deadline,
    categoryId: data.category_id ? parseInt(String(data.category_id), 10) : null,
    jobSkills: [],
    majorIds: [],
  };
  await apiClient.post('/job/create', body);
  return { ...data, id: 'new', created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Job;
}

export async function updateJob(jobId: string, data: Partial<Job>): Promise<Job> {
  if (USE_MOCK) {
    return mockJobs.mockUpdateJob(jobId, data);
  }

  const deadline = data.expired_at
    ? new Date(data.expired_at).toISOString().slice(0, 10)
    : undefined;
  const body = {
    title: data.title,
    description: data.description,
    requirements: data.requirements ?? '',
    benefits: data.benefits ?? '',
    salaryMin: data.salary_min,
    salaryMax: data.salary_max,
    yearsOfExperience: '0',
    educationLevel: 'HIGH_SCHOOL',
    jobType: data.job_type ?? 'FULL_TIME',
    location: data.location ?? '',
    deadline,
    categoryId: data.category_id ? parseInt(String(data.category_id), 10) : null,
    jobSkills: [],
    majorIds: [],
  };
  await apiClient.put(`/job/${jobId}`, body);
  return getJobDetail(jobId);
}

export async function deleteJob(jobId: string): Promise<void> {
  if (USE_MOCK) {
    return mockJobs.mockDeleteJob(jobId);
  }

  await apiClient.delete(`/job/${jobId}`);
}

