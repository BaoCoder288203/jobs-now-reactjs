import type { JobSeekerProfile, ProfileSkill } from '@/types';
import { delay } from './auth.mock';
import { 
  getProfileByUserId,
  getSkillsByProfileId 
} from '../data/profiles.mock';
import { mockProfileSkills } from '../data/profiles.mock';
import { mockSkills } from '../data/skills.mock';

export async function mockGetProfile(userId: string): Promise<JobSeekerProfile> {
  await delay(400);
  
  const profile = getProfileByUserId(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  return profile;
}

export async function mockUpdateProfile(
  userId: string,
  data: Partial<JobSeekerProfile>
): Promise<JobSeekerProfile> {
  await delay(500);
  
  const profile = getProfileByUserId(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  Object.assign(profile, {
    ...data,
    updated_at: new Date().toISOString()
  });
  
  return profile;
}

export async function mockGetProfileSkills(userId: string): Promise<ProfileSkill[]> {
  await delay(300);
  
  const profile = getProfileByUserId(userId);
  if (!profile) {
    return [];
  }
  
  return getSkillsByProfileId(profile.id);
}

export async function mockAddProfileSkill(
  userId: string,
  skillId: string,
  level: string,
  skillTopic?: string
): Promise<ProfileSkill> {
  await delay(400);

  const profile = getProfileByUserId(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }

  const skill = mockSkills.find(s => s.skillId === skillId);
  if (!skill) {
    throw new Error('Skill not found');
  }

  const existingSkills = getSkillsByProfileId(profile.id);
  if (existingSkills.some(ps => ps.skill_id === skillId)) {
    throw new Error('Skill already added');
  }

  const numericId = mockSkills.findIndex(s => s.skillId === skillId) + 1;
  const newProfileSkill: ProfileSkill = {
    skillId: numericId,
    skillName: (skill as { name?: string }).name ?? skillId,
    skill_id: skillId,
    level,
    skillTopic: skillTopic ?? null,
    profile,
    skill,
  };

  (mockProfileSkills as ProfileSkill[]).push(newProfileSkill);

  return newProfileSkill;
}

export async function mockAddProfileSkillsWithTopic(
  userId: string,
  topic: string,
  skillIds: string[],
  level: string
): Promise<void> {
  for (const skillId of skillIds) {
    await mockAddProfileSkill(userId, skillId, level, topic);
  }
}

export async function mockRemoveProfileSkill(
  userId: string,
  skillId: string
): Promise<void> {
  await delay(300);
  
  const profile = getProfileByUserId(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  // Remove from mock data array
  const index = (mockProfileSkills as ProfileSkill[]).findIndex(
    ps => ps.job_seeker_profile_id === profile.id && ps.skill_id === skillId
  );
  
  if (index > -1) {
    (mockProfileSkills as ProfileSkill[]).splice(index, 1);
  }
}

