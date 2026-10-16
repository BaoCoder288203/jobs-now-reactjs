import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as skillService from '@/services/skill.service';

export const skillKeys = {
  all: ['skills'] as const,
  list: () => [...skillKeys.all, 'list'] as const,
  adminInfinite: (limit: number) => [...skillKeys.all, 'admin-infinite', limit] as const,
};

export function useSkills() {
  return useQuery({
    queryKey: skillKeys.list(),
    queryFn: () => skillService.getAllSkills(),
  });
}

export function useSkillsAdminInfinite(limit = 10) {
  return useInfiniteQuery({
    queryKey: skillKeys.adminInfinite(limit),
    queryFn: ({ pageParam }) => skillService.getSkillsAdminPage(pageParam as number, limit),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });
}

export function useCreateSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (skillName: string) => skillService.createSkill(skillName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillKeys.all });
    },
  });
}

export function useUpdateSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, skillName }: { skillId: string; skillName: string }) =>
      skillService.updateSkill(skillId, skillName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillKeys.all });
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (skillId: string) => skillService.deleteSkill(skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillKeys.all });
    },
  });
}
