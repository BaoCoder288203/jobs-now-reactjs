import type { User } from './user.d';
import type { Industry } from './job.d';

export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  description?: string;
  website?: string;
  company_size?: string;
  address?: string;
  industry_id?: string;
  owner_user_id: string;
  create_job_count?: number;
  is_verified?: boolean;
  created_at: string;
  updated_at: string;
  
  // Populated fields
  owner?: User;
  industry?: Industry;
}

export interface CreateCompanyRequest {
  name: string;
  description: string;
  website?: string;
  company_size?: string;
  address?: string;
  industry_id?: string;
}
