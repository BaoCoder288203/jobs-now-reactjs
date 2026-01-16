import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Application } from '@/types';
import * as applicationService from '@/services/application.service';
import { jobKeys } from '../jobs/hooks';

export const applicationKeys = {
  all: ['applications'] as const,
  my: () => [...applicationKeys.all, 'my'] as const,
  job: (jobId: string) => [...applicationKeys.all, 'job', jobId] as const,
  detail: (id: string) => [...applicationKeys.all, 'detail', id] as const
};

/**
 * Hook for Job Seeker: Get applications of a specific user
 * Returns: Application[]
 */
export function useMyApplications(userId: string) {
  return useQuery({
    queryKey: [...applicationKeys.my(), userId],
    queryFn: () => applicationService.getMyApplications(userId),
    enabled: !!userId
  });
}

/**
 * Hook for Employer/Admin: Get all applications
 * Returns: Application[]
 */
export function useAllApplications() {
  return useQuery({
    queryKey: [...applicationKeys.all, 'list'],
    queryFn: () => applicationService.getAllApplications(),
    enabled: true
  });
}

export function useJobApplications(jobId: string) {
  return useQuery({
    queryKey: applicationKeys.job(jobId),
    queryFn: () => applicationService.getJobApplications(jobId),
    enabled: !!jobId
  });
}

/**
 * Hook for Recruiter: Get applications of a company
 * Returns: Application[]
 */
export function useCompanyApplications(companyId?: string) {
  return useQuery({
    queryKey: [...applicationKeys.all, 'company', companyId],
    queryFn: () => applicationService.getCompanyApplications(companyId!),
    enabled: !!companyId
  });
}

export function useApplyJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      jobId,
      resumeId,
      coverLetter
    }: {
      userId: string;
      jobId: string;
      resumeId?: string;
      coverLetter?: string;
    }) => applicationService.applyJob(userId, jobId, resumeId, coverLetter),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.my() });
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(data.job_id) });
    }
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      status
    }: {
      applicationId: string;
      status: string;
    }) => applicationService.updateApplicationStatus(applicationId, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: applicationKeys.job(data.job_id) });
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
    }
  });
}

export function useApplicationDetail(applicationId: string) {
  return useQuery({
    queryKey: applicationKeys.detail(applicationId),
    queryFn: () => applicationService.getApplicationDetail(applicationId),
    enabled: !!applicationId
  });
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, userId }: { applicationId: string; userId: string }) =>
      applicationService.withdrawApplication(applicationId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.my() });
    }
  });
}

