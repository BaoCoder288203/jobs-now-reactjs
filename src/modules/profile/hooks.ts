import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { JobSeekerProfile } from '@/types';
import * as profileService from '@/services/profile.service';

export const profileKeys = {
  all: ['profile'] as const,
  detail: (userId: string) => [...profileKeys.all, userId] as const,
  skills: (userId: string) => [...profileKeys.detail(userId), 'skills'] as const,
};

export function useProfile(userId: string) {
  return useQuery({
    queryKey: profileKeys.detail(userId),
    queryFn: () => profileService.getProfile(userId),
    enabled: !!userId
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<JobSeekerProfile> }) =>
      profileService.updateProfile(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(variables.userId) });
    }
  });
}

export function useProfileSkills(userId: string) {
  return useQuery({
    queryKey: profileKeys.skills(userId),
    queryFn: () => profileService.getProfileSkills(userId),
    enabled: !!userId
  });
}

export function useAddProfileSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, skillId, level }: { userId: string; skillId: string; level: string }) =>
      profileService.addProfileSkill(userId, skillId, level),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.skills(variables.userId) });
    }
  });
}

export function useRemoveProfileSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, skillId }: { userId: string; skillId: string }) =>
      profileService.removeProfileSkill(userId, skillId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.skills(variables.userId) });
    }
  });
}

