import type { Job, JobListParams, PaginatedResponse } from '@/types';
import { mockJobs } from '../data/jobs.mock';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function mockGetJobs(params?: JobListParams): Promise<PaginatedResponse<Job>> {
  await delay(500);
  
  let filteredJobs = [...mockJobs];
  
  if (params?.search) {
    const search = params.search.toLowerCase();
    filteredJobs = filteredJobs.filter(
      job => 
        job.title.toLowerCase().includes(search) ||
        job.description?.toLowerCase().includes(search) ||
        job.company?.name.toLowerCase().includes(search)
    );
  }
  
  if (params?.job_type) {
    filteredJobs = filteredJobs.filter(job => job.job_type === params.job_type);
  }
  
  if (params?.location) {
    filteredJobs = filteredJobs.filter(
      job => job.location?.toLowerCase().includes(params.location!.toLowerCase())
    );
  }
  
  if (params?.company_id) {
    filteredJobs = filteredJobs.filter(job => job.company_id === params.company_id);
  }
  
  if (params?.category_id) {
    filteredJobs = filteredJobs.filter(job => job.category_id === params.category_id);
  }
  
  if (params?.industry_id) {
    filteredJobs = filteredJobs.filter(job => job.industry_id === params.industry_id);
  }
  
  if (params?.experience_level) {
    filteredJobs = filteredJobs.filter(job => job.experience_level === params.experience_level);
  }
  
  if (params?.min_salary) {
    filteredJobs = filteredJobs.filter(job => 
      job.salary_max && job.salary_max >= params.min_salary!
    );
  }
  
  if (params?.max_salary) {
    filteredJobs = filteredJobs.filter(job => 
      job.salary_min && job.salary_min <= params.max_salary!
    );
  }
  
  if (params?.status) {
    filteredJobs = filteredJobs.filter(job => job.status === params.status);
  }
  
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex);
  
  return {
    items: paginatedJobs,
    pagination: {
      page,
      limit,
      total: filteredJobs.length,
      totalPages: Math.ceil(filteredJobs.length / limit),
      hasNext: endIndex < filteredJobs.length,
      hasPrev: page > 1
    }
  };
}

export async function mockGetJobDetail(jobId: string): Promise<Job> {
  await delay(400);
  
  const job = mockJobs.find(j => j.id === jobId);
  
  if (!job) {
    throw new Error('Job not found');
  }
  
  return job;
}

export async function mockCreateJob(jobData: Partial<Job>): Promise<Job> {
  await delay(600);
  
  const newJob: Job = {
    id: `job-${Date.now()}`,
    company_id: jobData.company_id!,
    title: jobData.title!,
    description: jobData.description!,
    requirements: jobData.requirements,
    salary_min: jobData.salary_min,
    salary_max: jobData.salary_max,
    location: jobData.location,
    job_type: jobData.job_type,
    experience_level: jobData.experience_level,
    industry_id: jobData.industry_id,
    category_id: jobData.category_id,
    status: jobData.status || 'open',
    expired_at: jobData.expired_at,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  mockJobs.push(newJob);
  return newJob;
}

export async function mockUpdateJob(jobId: string, jobData: Partial<Job>): Promise<Job> {
  await delay(500);
  
  const job = mockJobs.find(j => j.id === jobId);
  
  if (!job) {
    throw new Error('Job not found');
  }
  
  Object.assign(job, {
    ...jobData,
    updated_at: new Date().toISOString()
  });
  
  return job;
}

export async function mockDeleteJob(jobId: string): Promise<void> {
  await delay(300);
  
  const index = mockJobs.findIndex(j => j.id === jobId);
  
  if (index === -1) {
    throw new Error('Job not found');
  }
  
  mockJobs.splice(index, 1);
}
