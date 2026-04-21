import type { User } from './user.d';
import type { Industry } from './job.d';

export interface CompanyImage {
  imageId: number;
  imageUrl: string;
  type?: string;
}

export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  banner_url?: string;
  description?: string;
  slogan?: string;
  category?: string;
  thumbnail_images?: string[];
  images?: CompanyImage[];
  website?: string;
  company_size?: string;
  address?: string;
  name_user_contact?: string;
  tutorial_apply?: string;
  socials?: {
    id: number;
    platform: string;
    url: string;
    logoUrl?: string;
  }[];
  industry_id?: string;
  industry_ids?: string[];
  industries?: Industry[];
  owner_user_id: string;
  create_job_count?: number;
  is_verified?: boolean;
  follower_count?: number;
  created_at: string;
  updated_at: string;

  // Populated fields
  owner?: User;
  industry?: Industry;
}

export interface CreateCompanyRequest {
  name: string;
  description: string;
  slogan?: string;
  website?: string;
  company_size?: string;
  address?: string;
  industry_ids?: string[];
  name_user_contact?: string;
  tutorial_apply?: string;
  thumbnail_image_urls?: string[];
}
