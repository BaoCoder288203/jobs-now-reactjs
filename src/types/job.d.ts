import type { Company } from './company.d';
import type { Skill } from './skill.d';

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

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  requirements?: string;
  salary_min?: number;
  salary_max?: number;
  location?: string;
  job_type?: string; // full-time, part-time, remote
  experience_level?: string;
  industry_id?: string;
  category_id?: string;
  status: string; // open, closed
  expired_at?: string;
  created_at: string;
  updated_at: string;
  
  company?: Company;
  industry?: Industry;
  category?: JobCategory;
  skills?: JobSkill[];
}

export interface JobSkill {
  id: string;
  job_id: string;
  skill_id: string;
  
  job?: Job;
  skill?: Skill;
}

// Forward declaration
import type { User } from './user.d';

export interface SavedJob {
  id: string;
  user_id: string;
  job_id: string;
  created_at: string;
  
  user?: User;
  job?: Job;
}
