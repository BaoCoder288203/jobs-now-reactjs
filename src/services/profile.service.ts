import type { JobSeekerProfile, ProfileSkill } from '@/types';
import { USE_MOCK } from './api';
import * as mockProfile from '@/mocks/handlers/profile.mock';
import { apiClient } from './api';
import * as profileCvService from './profile-cv.service';

function unwrap<T>(res: unknown): T {
  const obj = res as { data?: T };
  return (obj?.data ?? res) as T;
}

/** Get profile by user id (BE: GET /profile/user/{userId}) */
export async function getProfile(userId: string): Promise<JobSeekerProfile> {
  if (USE_MOCK) {
    return mockProfile.mockGetProfile(userId);
  }
  const res = await apiClient.get(`/profile/user/${userId}`);
  return unwrap<JobSeekerProfile>(res);
}

/** Update profile (BE: PUT /profile/{profileId}). Pass profileId from profile.profileId. */
export async function updateProfile(
  profileIdOrUserId: string | number,
  data: Partial<JobSeekerProfile> & {
    fullName?: string;
    phone?: string;
    title?: string;
    bio?: string;
    address?: string;
    dob?: string;
  }
): Promise<JobSeekerProfile | void> {
  if (USE_MOCK) {
    return mockProfile.mockUpdateProfile(String(profileIdOrUserId), data);
  }
  const profileId = typeof profileIdOrUserId === 'number' ? profileIdOrUserId : undefined;
  const payload = {
    fullName: data.fullName ?? (data as { fullName?: string }).fullName,
    phone: data.phone ?? undefined,
    title: data.title ?? (data as { headline?: string }).headline ?? undefined,
    bio: data.bio ?? (data as { summary?: string }).summary ?? undefined,
    address: data.address ?? undefined,
    dob: data.dob ?? undefined,
  };
  if (profileId == null && typeof profileIdOrUserId === 'string') {
    const profile = await getProfile(profileIdOrUserId);
    if (profile?.profileId != null) {
      await profileCvService.updateProfile(profile.profileId, payload);
      return;
    }
  }
  if (profileId != null) {
    await profileCvService.updateProfile(profileId, payload);
  }
}

/** Get profile skills (from full profile when not mock; BE includes skills in profile) */
export async function getProfileSkills(userId: string): Promise<ProfileSkill[]> {
  if (USE_MOCK) {
    return mockProfile.mockGetProfileSkills(userId);
  }
  const profile = await getProfile(userId);
  return profile?.skills ?? [];
}

/** Add skill to profile (BE: PUT /profile/skills with full list) */
export async function addProfileSkill(
  userId: string,
  skillId: string,
  level: string
): Promise<ProfileSkill> {
  if (USE_MOCK) {
    return mockProfile.mockAddProfileSkill(userId, skillId, level);
  }
  const profile = await getProfile(userId);
  if (!profile?.profileId) throw new Error('Profile not found');
  const current = profile.skills ?? [];
  await apiClient.put(`/profile/skills`, {
    profileId: profile.profileId,
    skills: [
      ...current.map((s) => ({
        skillId: s.skillId,
        level: s.level,
        yearsOfExperience: s.yearsOfExperience ?? null,
      })),
      { skillId: Number(skillId), level, yearsOfExperience: null },
    ],
  });
  const updated = await getProfile(userId);
  const added = updated?.skills?.find((s) => String(s.skillId) === skillId);
  return added ?? { skillId: Number(skillId), skillName: '', level, yearsOfExperience: null };
}

/** Remove skill from profile (BE: PUT /profile/skills with updated list) */
export async function removeProfileSkill(userId: string, skillId: string): Promise<void> {
  if (USE_MOCK) {
    return mockProfile.mockRemoveProfileSkill(userId, skillId);
  }
  const profile = await getProfile(userId);
  if (!profile?.profileId) return;
  const current = profile.skills ?? [];
  const next = current.filter((s) => String(s.skillId) !== skillId);
  await apiClient.put(`/profile/skills`, {
    profileId: profile.profileId,
    skills: next.map((s) => ({
      skillId: s.skillId,
      level: s.level,
      yearsOfExperience: s.yearsOfExperience ?? null,
    })),
  });
}

