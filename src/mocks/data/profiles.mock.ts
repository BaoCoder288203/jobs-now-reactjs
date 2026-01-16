import type { JobSeekerProfile, Resume, ProfileSkill } from '@/types';
import { mockUsers } from './users.mock';
import { mockSkills } from './skills.mock';

export const mockJobSeekerProfiles: JobSeekerProfile[] = [
  {
    id: 'profile-1',
    user_id: 'user-2',
    headline: 'Senior Software Developer',
    summary: 'Experienced software developer with 5 years in web development. Passionate about building scalable applications.',
    current_position: 'Senior Developer at TechCorp',
    years_experience: 5,
    education_level: 'Bachelor',
    date_of_birth: '1995-05-15',
    gender: 'male',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    user: mockUsers[1]
  },
  {
    id: 'profile-2',
    user_id: 'user-3',
    headline: 'Frontend Developer',
    summary: 'Frontend developer passionate about React and TypeScript. Love creating beautiful user interfaces.',
    current_position: 'Frontend Developer at StartupXYZ',
    years_experience: 3,
    education_level: 'Bachelor',
    date_of_birth: '1997-03-20',
    gender: 'female',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
    user: mockUsers[2]
  }
];

export const mockResumes: Resume[] = [
  {
    id: 'resume-1',
    job_seeker_profile_id: 'profile-1',
    file_url: '/resumes/user-2/john-doe-resume.pdf',
    file_name: 'john-doe-resume.pdf',
    is_default: true,
    created_at: '2024-01-15T00:00:00Z',
    profile: mockJobSeekerProfiles[0]
  },
  {
    id: 'resume-2',
    job_seeker_profile_id: 'profile-2',
    file_url: '/resumes/user-3/jane-smith-resume.pdf',
    file_name: 'jane-smith-resume.pdf',
    is_default: true,
    created_at: '2024-02-01T00:00:00Z',
    profile: mockJobSeekerProfiles[1]
  }
];

export const mockProfileSkills: ProfileSkill[] = [
  {
    id: 'profileskill-1',
    job_seeker_profile_id: 'profile-1',
    skill_id: 'skill-1',
    level: 'advanced',
    profile: mockJobSeekerProfiles[0],
    skill: mockSkills[0]
  },
  {
    id: 'profileskill-2',
    job_seeker_profile_id: 'profile-1',
    skill_id: 'skill-2',
    level: 'intermediate',
    profile: mockJobSeekerProfiles[0],
    skill: mockSkills[1]
  },
  {
    id: 'profileskill-3',
    job_seeker_profile_id: 'profile-2',
    skill_id: 'skill-1',
    level: 'intermediate',
    profile: mockJobSeekerProfiles[1],
    skill: mockSkills[0]
  },
  {
    id: 'profileskill-4',
    job_seeker_profile_id: 'profile-2',
    skill_id: 'skill-6',
    level: 'advanced',
    profile: mockJobSeekerProfiles[1],
    skill: mockSkills[5]
  }
];

export function getProfileByUserId(userId: string): JobSeekerProfile | null {
  return mockJobSeekerProfiles.find(p => p.user_id === userId) || null;
}

export function getResumesByProfileId(profileId: string): Resume[] {
  return mockResumes.filter(r => r.job_seeker_profile_id === profileId);
}

export function getPrimaryResumeByProfileId(profileId: string): Resume | null {
  return mockResumes.find(r => r.job_seeker_profile_id === profileId && r.is_default) || null;
}

export function getSkillsByProfileId(profileId: string): ProfileSkill[] {
  return mockProfileSkills.filter(ps => ps.job_seeker_profile_id === profileId);
}
