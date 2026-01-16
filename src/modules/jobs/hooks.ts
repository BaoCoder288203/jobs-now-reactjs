import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Job, JobListParams, PaginatedResponse } from '@/types';
import * as jobService from '@/services/job.service';

export const jobKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobKeys.all, 'list'] as const,
  list: (params?: JobListParams) => [...jobKeys.lists(), params] as const,
  details: () => [...jobKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobKeys.details(), id] as const
};

export function useJobs(params?: JobListParams) {
  return useQuery({
    queryKey: jobKeys.list(params),
    queryFn: () => jobService.getJobs(params),
    enabled: true
  });
}

export function useJobDetail(jobId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: jobKeys.detail(jobId),
    queryFn: () => jobService.getJobDetail(jobId),
    enabled: options?.enabled !== false && !!jobId
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Job>) => jobService.createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    }
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: Partial<Job> }) =>
      jobService.updateJob(jobId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(data.id) });
    }
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => jobService.deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    }
  });
}

