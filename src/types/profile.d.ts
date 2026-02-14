import type { User } from './user.d';
import type { Skill } from './skill.d';

// Cấu trúc JSON lưu trong extracted_text
export interface ExtractedCVData {
  headline?: string;
  summary?: string;
  work_experiences: {
    company: string;
    position: string;
    start_date?: string;
    end_date?: string;
    is_current?: boolean;
    description?: string;
  }[];
  educations: {
    school: string;
    major: string;
    degree: string;
    start_date?: string;
    end_date?: string;
  }[];
  skills: { name: string; level?: string }[];
  projects?: { name: string; description?: string; technologies?: string[] }[];
  languages?: { name: string; proficiency: string }[];
  certificates?: { name: string; issuer: string; issue_date?: string }[];
}

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
  type?: 'UPLOADED' | 'CREATED';
  is_ai_generated?: boolean;
  extracted_text?: string;
  
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
