import type { User } from './user.d';
import type { Skill } from './skill.d';

export interface JobSeekerProfile {
  id: string;
  user_id: string;
  headline?: string;
  summary?: string;
  current_position?: string;
  years_experience?: number;
  education_level?: string;
  date_of_birth?: string;
  gender?: string;
  created_at: string;
  updated_at: string;
  
  user?: User;
  resumes?: Resume[];
  skills?: ProfileSkill[];
}

export interface Resume {
  id: string;
  job_seeker_profile_id: string;
  file_url: string;
  file_name: string;
  is_default: boolean;
  created_at: string;
  
  profile?: JobSeekerProfile;
}

export interface ProfileSkill {
  id: string;
  job_seeker_profile_id: string;
  skill_id: string;
  level?: string; // beginner, intermediate, advanced
  
  profile?: JobSeekerProfile;
  skill?: Skill;
}
