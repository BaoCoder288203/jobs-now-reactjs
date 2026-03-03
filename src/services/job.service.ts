import type { Job, JobListParams, PaginatedResponse } from '@/types';
import { USE_MOCK } from './api';
import * as mockJobs from '@/mocks/handlers/jobs.mock';
import { apiClient } from './api';

interface JobSkillDTOItem {
  skillId?: number;
  skillName?: string;
  isRequired?: boolean;
  level?: string;
}

interface MajorDTOItem {
  majorId?: number;
  name?: string;
}

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
  thumbnailUrl?: string;
  companyId?: number;
  companyName?: string;
  companyLogo?: string;
  categoryId?: number;
  categoryName?: string;
  jobSkills?: JobSkillDTOItem[];
  majors?: MajorDTOItem[];
}

function mapJobDTOToJob(dto: JobDTO): Job {
  return {
    id: String(dto.jobId ?? ''),
    company_id: String(dto.companyId ?? ''),
    title: dto.title ?? '',
    description: dto.description ?? '',
    requirements: dto.requirements,
    benefits: dto.benefits,
    salary_min: dto.salaryMin,
    salary_max: dto.salaryMax,
    yearsOfExperience: dto.yearsOfExperience,
    educationLevel: dto.educationLevel,
    location: dto.location,
    job_type: dto.jobType,
    status: dto.isActive ? 'open' : 'closed',
    expired_at: dto.deadline,
    deadline: dto.deadline,
    created_at: dto.postedAt ?? new Date().toISOString(),
    updated_at: dto.postedAt ?? new Date().toISOString(),
    thumbnail_url: dto.thumbnailUrl,
    category_id: dto.categoryId != null ? dto.categoryId : undefined,
    categoryName: dto.categoryName,
    jobSkills: dto.jobSkills?.map((js) => ({
      id: '',
      job_id: String(dto.jobId ?? ''),
      skill_id: String(js.skillId ?? ''),
      skillName: js.skillName,
      isRequired: js.isRequired,
      level: js.level,
    })),
    majors: dto.majors?.map((m) => ({ majorId: m.majorId ?? 0, name: m.name ?? '' })),
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

function toJobTypeBE(value: string | undefined): string {
  if (!value) return 'FULL_TIME';
  const upper = value.toUpperCase().replace('-', '_');
  if (upper === 'FREELANCE') return 'FREELANCE';
  return upper;
}

export async function createJob(data: Partial<Job>): Promise<Job> {
  if (USE_MOCK) {
    return mockJobs.mockCreateJob(data);
  }

  const deadline =
    data.deadline ?? data.expired_at
      ? new Date((data.deadline ?? data.expired_at) as string).toISOString().slice(0, 10)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const body = {
    companyId: data.company_id ? parseInt(String(data.company_id), 10) : undefined,
    title: data.title,
    description: data.description,
    requirements: data.requirements ?? '',
    benefits: data.benefits ?? '',
    salaryMin: data.salary_min ?? 0,
    salaryMax: data.salary_max ?? 0,
    yearsOfExperience: data.yearsOfExperience ?? '0',
    educationLevel: (data.educationLevel ?? 'OTHER').toUpperCase(),
    jobType: toJobTypeBE(data.job_type),
    location: data.location ?? '',
    deadline,
    categoryId: data.category_id != null ? parseInt(String(data.category_id), 10) : null,
    jobSkills: (data as { jobSkills?: { skillId: number; isRequired?: boolean; level?: string }[] }).jobSkills ?? [],
    majorIds: (data as { majorIds?: number[] }).majorIds ?? [],
    thumbnailUrl: data.thumbnail_url ?? undefined,
    isActive: data.status === 'open',
  };
  await apiClient.post('/job/create', body);
  return { ...data, id: 'new', created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Job;
}

export async function updateJob(jobId: string, data: Partial<Job>): Promise<Job> {
  if (USE_MOCK) {
    return mockJobs.mockUpdateJob(jobId, data);
  }

  const deadline =
    data.deadline ?? data.expired_at
      ? new Date((data.deadline ?? data.expired_at) as string).toISOString().slice(0, 10)
      : undefined;

  const body = {
    title: data.title,
    description: data.description,
    requirements: data.requirements ?? '',
    benefits: data.benefits ?? '',
    salaryMin: data.salary_min,
    salaryMax: data.salary_max,
    yearsOfExperience: data.yearsOfExperience ?? undefined,
    educationLevel: data.educationLevel?.toUpperCase(),
    jobType: data.job_type ? toJobTypeBE(data.job_type) : undefined,
    location: data.location ?? undefined,
    deadline,
    categoryId: data.category_id != null ? parseInt(String(data.category_id), 10) : undefined,
    jobSkills: (data as { jobSkills?: { skillId: number; isRequired?: boolean; level?: string }[] }).jobSkills,
    majorIds: (data as { majorIds?: number[] }).majorIds,
    isActive: data.status === 'open',
    thumbnailUrl: data.thumbnail_url ?? undefined,
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
