import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as savedJobService from '@/services/savedJob.service';
import { jobKeys } from '../jobs/hooks';
import { toast } from 'sonner';

export const savedJobKeys = {
  all: ['savedJobs'] as const,
  lists: () => [...savedJobKeys.all, 'list'] as const,
  list: (profileId: string) => [...savedJobKeys.lists(), profileId] as const,
};

export function useSavedJobs(profileId: string) {
  return useQuery({
    queryKey: savedJobKeys.list(profileId),
    queryFn: () => savedJobService.getSavedJobs(profileId),
    enabled: !!profileId
  });
}

export function useSaveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ profileId, jobId }: { profileId: string; jobId: string }) =>
      savedJobService.saveJob(profileId, jobId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: savedJobKeys.list(variables.profileId) });
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(variables.jobId) });
      toast.success('Đã lưu việc làm thành công');
    }
  });
}

export function useUnsaveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ profileId, jobId }: { profileId: string; jobId: string }) =>
      savedJobService.unsaveJob(profileId, jobId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: savedJobKeys.list(variables.profileId) });
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(variables.jobId) });
      toast.success('Đã bỏ lưu việc làm');
    }
  });
}
