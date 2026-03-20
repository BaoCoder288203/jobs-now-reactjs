import type { Company } from './company.d';
import type { Skill } from './skill.d';
import type { User } from './user.d';

export interface Industry {
  id: string;
  name: string;
  description?: string;
}

export interface JobCategory {
  id: string;
  name: string;
  description?: string;
}

export interface JobSkillItemRequest {
  skillId: number;
  isRequired?: boolean;
  level?: string;
}

export interface JobSkill {
  id: string;
  job_id: string;
  skill_id: string;
  skillName?: string;
  isRequired?: boolean;
  level?: string;
  job?: Job;
  skill?: Skill;
}

export interface Major {
  majorId: number;
  name: string;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  requirements?: string;
  benefits?: string;
  salary_min?: number;
  salary_max?: number;
  yearsOfExperience?: string;
  educationLevel?: string;
  job_type?: string;
  location?: string;
  expired_at?: string;
  deadline?: string;
  created_at: string;
  updated_at: string;
  status: string;
  thumbnail_url?: string;
  category_id?: string | number;
  categoryName?: string;
  jobSkills?: JobSkill[];
  majors?: Major[];

  isActive?: boolean;
  isApproved?: boolean;
  isPending?: boolean;
  isDeleted?: boolean;
  isExpired?: boolean;
  note?: string;

  applicationLanguage?: string;
  genderRequirement?: string;
  minAge?: number;
  maxAge?: number;

  contactPersonName?: string;
  contactTutorial?: string;
  companyAddress?: string;
  companySocials?: {
    id: number;
    platform: string;
    url: string;
    logoUrl?: string;
  }[];

  company?: Company;
  category?: JobCategory;
}

export interface SavedJob {
  savedJobId: number;
  jobId: number;
  jobTitle: string;
  companyName: string;
  companyLogo: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  jobType: string;
  savedAt: string;
  isSaved?: boolean;
}
