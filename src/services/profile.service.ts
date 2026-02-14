import type { JobSeekerProfile, ProfileSkill } from '@/types';
import { USE_MOCK } from './api';
import * as mockProfile from '@/mocks/handlers/profile.mock';
import { apiClient } from './api';

export async function getProfile(userId: string): Promise<JobSeekerProfile> {
  if (USE_MOCK) {
    return mockProfile.mockGetProfile(userId);
  }
  
  const response = await apiClient.get(`/profiles/${userId}`);
  return response.data;
}

export async function updateProfile(
  userId: string,
  data: Partial<JobSeekerProfile>
): Promise<JobSeekerProfile> {
  if (USE_MOCK) {
    return mockProfile.mockUpdateProfile(userId, data);
  }
  
  const response = await apiClient.put(`/profiles/${userId}`, data);
  return response.data;
}

export async function getProfileSkills(userId: string): Promise<ProfileSkill[]> {
  if (USE_MOCK) {
    return mockProfile.mockGetProfileSkills(userId);
  }
  
  const response = await apiClient.get(`/profiles/${userId}/skills`);
  return response.data;
}

export async function addProfileSkill(
  userId: string,
  skillId: string,
  level: string
): Promise<ProfileSkill> {
  if (USE_MOCK) {
    return mockProfile.mockAddProfileSkill(userId, skillId, level);
  }
  
  const response = await apiClient.post(`/profiles/${userId}/skills`, {
    skill_id: skillId,
    level
  });
  return response.data;
}

export async function removeProfileSkill(
  userId: string,
  skillId: string
): Promise<void> {
  if (USE_MOCK) {
    return mockProfile.mockRemoveProfileSkill(userId, skillId);
  }
  
  await apiClient.delete(`/profiles/skills/${skillId}`);
}

