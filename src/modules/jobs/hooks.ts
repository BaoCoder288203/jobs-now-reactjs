import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Job, JobListParams } from '@/types';
import * as jobService from '@/services/job.service';

export const jobKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobKeys.all, 'list'] as const,
  list: (params?: JobListParams) => [...jobKeys.lists(), params] as const,
  adminList: () => [...jobKeys.all, 'admin'] as const,
  adminListWithStatus: (status?: string) => [...jobKeys.adminList(), status ?? 'all'] as const,
  details: () => [...jobKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobKeys.details(), id] as const
};

export function useJobs(params?: JobListParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: jobKeys.list(params),
    queryFn: () => jobService.getJobs(params),
    enabled: options?.enabled !== false
  });
}

export function useJobDetail(jobId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: jobKeys.detail(jobId),
    queryFn: () => jobService.getJobDetail(jobId),
    enabled: options?.enabled !== false && !!jobId
  });
}

export function useRelatedJobs(jobId: string | undefined, limit = 8) {
  return useQuery({
    queryKey: [...jobKeys.details(), jobId ?? '', 'related', limit] as const,
    queryFn: () => jobService.getRelatedJobs(jobId!, limit),
    enabled: !!jobId
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

export function useAdminJobs(status?: string) {
  return useQuery({
    queryKey: jobKeys.adminListWithStatus(status),
    queryFn: () => jobService.getAdminJobs(status),
    enabled: true
  });
}

export function useApproveJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => jobService.approveJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.adminList() });
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    }
  });
}

export function useRejectJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, reason }: { jobId: string; reason: string }) =>
      jobService.rejectJob(jobId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.adminList() });
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    }
  });
}

export function useUnpublishJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => jobService.unpublishJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.adminList() });
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    }
  });
}

