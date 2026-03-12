import type { User } from './user.d';
import type { Skill } from './skill.d';

// CV section DTOs (match BE)
export interface WorkExperienceDTO {
  id: number;
  title: string;
  level: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  sortOrder: number | null;
}

export interface EducationDTO {
  id: number;
  title: string;
  educationLevel: string;
  majorId: number | null;
  majorName: string | null;
  startDate: string;
  endDate: string | null;
  description: string | null;
  sortOrder: number | null;
}

export interface ProjectDTO {
  id: number;
  title: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  sortOrder: number | null;
}

export interface CertificateDTO {
  id: number;
  title: string;
  issueDate: string;
  description: string | null;
  sortOrder: number | null;
}

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
  skills: { name: string; level?: string; topic?: string }[];
  projects?: { name: string; description?: string; technologies?: string[] }[];
  languages?: { name: string; proficiency: string }[];
  certificates?: { name: string; issuer: string; issue_date?: string }[];
}

export interface JobSeekerProfile {
  profileId: number;
  userId: number;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  title: string | null;
  bio: string | null;
  phone: string | null;
  address: string | null;
  dob: string | null;
  skills?: ProfileSkill[];
  resumes?: Resume[];
  // Legacy / mock fields (optional)
  id?: string;
  user_id?: string;
  headline?: string;
  summary?: string;
  current_position?: string;
  years_experience?: number;
  education_level?: string;
  date_of_birth?: string;
  gender?: string;
  created_at?: string;
  updated_at?: string;
  user?: User;
}

export interface Resume {
  resumeId: number;
  resumeName: string;
  resumeUrl: string;
  summary?: string | null;
  uploadedAt: string;
  id?: string;
  job_seeker_profile_id?: string;
  file_url?: string;
  file_name?: string;
  is_default?: boolean;
  created_at?: string;
  type?: 'UPLOADED' | 'CREATED';
  is_ai_generated?: boolean;
  extracted_text?: string;
  profile?: JobSeekerProfile;
}

export interface ProfileSkill {
  skillId: number;
  skillName: string;
  level?: string;
  yearsOfExperience?: number | null;
  id?: string;
  job_seeker_profile_id?: string;
  skill_id?: string;
  profile?: JobSeekerProfile;
  skill?: Skill;
}
