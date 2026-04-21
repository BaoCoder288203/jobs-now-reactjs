import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileKeys } from './hooks';
import * as profileCvService from '@/services/profile-cv.service';

export const profileCvKeys = {
  profile: (userId: string) => [...profileKeys.all, 'cv', userId] as const,
  workExperiences: (resumeId: number) => [...profileKeys.all, 'resume', resumeId, 'work-experiences'] as const,
  educations: (resumeId: number) => [...profileKeys.all, 'resume', resumeId, 'educations'] as const,
  projects: (resumeId: number) => [...profileKeys.all, 'resume', resumeId, 'projects'] as const,
  certificates: (resumeId: number) => [...profileKeys.all, 'resume', resumeId, 'certificates'] as const,
  skills: (resumeId: number) => [...profileKeys.all, 'resume', resumeId, 'skills'] as const,
};

export function useProfileWithCV(userId: string) {
  return useQuery({
    queryKey: profileCvKeys.profile(userId),
    queryFn: () => profileCvService.getProfileByUserId(userId),
    enabled: !!userId,
  });
}

export function useUpdateProfileBio(profileId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { bio?: string; title?: string; fullName?: string; phone?: string; address?: string; dob?: string }) =>
      profileCvService.updateProfile(profileId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

// Work Experiences (theo resumeId)
export function useWorkExperiences(resumeId: number | null) {
  return useQuery({
    queryKey: profileCvKeys.workExperiences(resumeId ?? 0),
    queryFn: () => profileCvService.getWorkExperiences(resumeId!),
    enabled: !!resumeId && resumeId > 0,
  });
}

export function useCreateWorkExperience(resumeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof profileCvService.createWorkExperience>[1]) =>
      profileCvService.createWorkExperience(resumeId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileCvKeys.workExperiences(resumeId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

export function useUpdateWorkExperience(resumeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Parameters<typeof profileCvService.updateWorkExperience>[2] }) =>
      profileCvService.updateWorkExperience(resumeId, id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileCvKeys.workExperiences(resumeId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

export function useDeleteWorkExperience(resumeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => profileCvService.deleteWorkExperience(resumeId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileCvKeys.workExperiences(resumeId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

// Educations (theo resumeId)
export function useEducations(resumeId: number | null) {
  return useQuery({
    queryKey: profileCvKeys.educations(resumeId ?? 0),
    queryFn: () => profileCvService.getEducations(resumeId!),
    enabled: !!resumeId && resumeId > 0,
  });
}

export function useCreateEducation(resumeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof profileCvService.createEducation>[1]) =>
      profileCvService.createEducation(resumeId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileCvKeys.educations(resumeId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

export function useUpdateEducation(resumeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Parameters<typeof profileCvService.updateEducation>[2] }) =>
      profileCvService.updateEducation(resumeId, id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileCvKeys.educations(resumeId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

export function useDeleteEducation(resumeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => profileCvService.deleteEducation(resumeId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileCvKeys.educations(resumeId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

// Projects (theo resumeId)
export function useProjects(resumeId: number | null) {
  return useQuery({
    queryKey: profileCvKeys.projects(resumeId ?? 0),
    queryFn: () => profileCvService.getProjects(resumeId!),
    enabled: !!resumeId && resumeId > 0,
  });
}

export function useCreateProject(resumeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof profileCvService.createProject>[1]) =>
      profileCvService.createProject(resumeId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileCvKeys.projects(resumeId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

export function useUpdateProject(resumeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Parameters<typeof profileCvService.updateProject>[2] }) =>
      profileCvService.updateProject(resumeId, id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileCvKeys.projects(resumeId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

export function useDeleteProject(resumeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => profileCvService.deleteProject(resumeId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileCvKeys.projects(resumeId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

// Certificates (theo resumeId)
export function useCertificates(resumeId: number | null) {
  return useQuery({
    queryKey: profileCvKeys.certificates(resumeId ?? 0),
    queryFn: () => profileCvService.getCertificates(resumeId!),
    enabled: !!resumeId && resumeId > 0,
  });
}

export function useCreateCertificate(resumeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof profileCvService.createCertificate>[1]) =>
      profileCvService.createCertificate(resumeId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileCvKeys.certificates(resumeId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

export function useUpdateCertificate(resumeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Parameters<typeof profileCvService.updateCertificate>[2] }) =>
      profileCvService.updateCertificate(resumeId, id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileCvKeys.certificates(resumeId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

export function useDeleteCertificate(resumeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => profileCvService.deleteCertificate(resumeId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileCvKeys.certificates(resumeId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

// Resume Skills
export function useResumeSkills(resumeId: number | null) {
  return useQuery({
    queryKey: profileCvKeys.skills(resumeId ?? 0),
    queryFn: () => profileCvService.getResumeSkills(resumeId!),
    enabled: !!resumeId && resumeId > 0,
  });
}

export function useAddResumeSkill(resumeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { skillId: number; level?: string | null }) =>
      profileCvService.addResumeSkill(resumeId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileCvKeys.skills(resumeId) });
    },
  });
}

export function useRemoveResumeSkill(resumeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (skillId: number) => profileCvService.removeResumeSkill(resumeId, skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileCvKeys.skills(resumeId) });
    },
  });
}
