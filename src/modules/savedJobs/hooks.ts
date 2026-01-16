import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SavedJob } from '@/types';
import * as savedJobService from '@/services/savedJob.service';
import { jobKeys } from '../jobs/hooks';

export const savedJobKeys = {
  all: ['savedJobs'] as const,
  lists: () => [...savedJobKeys.all, 'list'] as const,
  list: (userId: string) => [...savedJobKeys.lists(), userId] as const,
};

export function useSavedJobs(userId: string) {
  return useQuery({
    queryKey: savedJobKeys.list(userId),
    queryFn: () => savedJobService.getSavedJobs(userId),
    enabled: !!userId
  });
}

export function useSaveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, jobId }: { userId: string; jobId: string }) =>
      savedJobService.saveJob(userId, jobId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: savedJobKeys.list(variables.userId) });
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(variables.jobId) });
    }
  });
}

export function useUnsaveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, jobId }: { userId: string; jobId: string }) =>
      savedJobService.unsaveJob(userId, jobId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: savedJobKeys.list(variables.userId) });
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(variables.jobId) });
    }
  });
}

