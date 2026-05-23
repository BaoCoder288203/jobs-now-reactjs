import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as resumeService from '@/services/resume.service';

export const resumeKeys = {
  all: ['resumes'] as const,
  lists: () => [...resumeKeys.all, 'list'] as const,
  list: (userId: string) => [...resumeKeys.lists(), userId] as const,
};

export function useResumes(userId: string) {
  return useQuery({
    queryKey: resumeKeys.list(userId),
    queryFn: () => resumeService.getResumes(userId),
    enabled: !!userId
  });
}

export function useUploadResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) =>
      resumeService.uploadResumeWithMeta(userId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.list(variables.userId) });
    }
  });
}

export function useSetDefaultResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, resumeId }: { userId: string; resumeId: string }) =>
      resumeService.setDefaultResume(userId, resumeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.list(variables.userId) });
    }
  });
}

export function useUpdateResumeName() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resumeId, resumeName }: { resumeId: string; resumeName: string }) =>
      resumeService.updateResume(resumeId, { resumeName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.all });
    }
  });
}

export function useUpdateResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      resumeId,
      data,
    }: {
      resumeId: string;
      data: { resumeName?: string; summary?: string | null; templateKey?: string; extractedText?: string };
    }) => resumeService.updateResume(resumeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.all });
    }
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, resumeId }: { userId: string; resumeId: string }) =>
      resumeService.deleteResume(userId, resumeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.list(variables.userId) });
    }
  });
}

