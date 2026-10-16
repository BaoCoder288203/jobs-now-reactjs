export interface HandbookPost {
  postId: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImageUrl?: string | null;
  categoryKey: string;
  companyName: string;
  companyLogoUrl?: string | null;
  publishedAt?: string | null;
}

export interface HandbookPostDetail extends HandbookPost {
  content?: string | null;
}

export interface HandbookPage {
  items: HandbookPost[];
  totalCount: number;
  page: number;
  size: number;
  hasNext: boolean;
}

export type CompanyPostStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'TRASHED';

export interface CompanyPostMine {
  postId: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  featuredImageUrl?: string | null;
  categoryKey: string;
  status: CompanyPostStatus;
  rejectionNote?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CompanyPostMinePage {
  items: CompanyPostMine[];
  totalCount: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

export interface CompanyPostAdminItem {
  postId: number;
  companyId: number;
  companyName: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  categoryKey: string;
  createdAt?: string | null;
}

export interface CompanyPostAdminPage {
  items: CompanyPostAdminItem[];
  totalCount: number;
  page: number;
  limit: number;
  hasNext: boolean;
}
