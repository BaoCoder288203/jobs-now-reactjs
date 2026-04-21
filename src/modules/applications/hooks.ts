import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as applicationService from '@/services/application.service';
import { jobKeys } from '../jobs/hooks';

export const applicationKeys = {
  all: ['applications'] as const,
  my: () => [...applicationKeys.all, 'my'] as const,
  job: (jobId: string) => [...applicationKeys.all, 'job', jobId] as const,
  detail: (id: string) => [...applicationKeys.all, 'detail', id] as const
};

export function useMyApplications(profileId: string | number | undefined, userId?: string) {
  const effectiveKey = profileId ?? userId ?? '';
  return useQuery({
    queryKey: [...applicationKeys.my(), String(effectiveKey)],
    queryFn: () => applicationService.getMyApplications(profileId, userId),
    enabled: !!profileId || !!userId
  });
}

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
      coverLetter,
      profileId
    }: {
      userId: string;
      jobId: string;
      resumeId?: string;
      coverLetter?: string;
      profileId?: number;
    }) => applicationService.applyJob(userId, jobId, resumeId, coverLetter, profileId),
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
      status,
      interviewDetailsHtml,
    }: {
      applicationId: string;
      status: string;
      interviewDetailsHtml?: string;
    }) => applicationService.updateApplicationStatus(applicationId, status, interviewDetailsHtml),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: applicationKeys.job(data.job_id) });
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      queryClient.invalidateQueries({ queryKey: [...applicationKeys.all, 'company'] });
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

