import type { Company, PaginatedResponse, PaginationParams } from '@/types';
import { USE_MOCK } from './api';
import * as mockCompanies from '@/mocks/handlers/companies.mock';
import { apiClient } from './api';

interface IndustryDTO {
  industryId?: number;
  name?: string;
}

interface CompanyDTO {
  companyId?: number;
  ownerUserId?: number;
  companyName?: string;
  logoUrl?: string;
  bannerUrl?: string;
  slogan?: string;
  website?: string;
  description?: string;
  address?: string;
  companySize?: string;
  industryIds?: number[];
  industries?: IndustryDTO[];
  isVerified?: boolean;
  jobPostCount?: number;
  email?: string;
  phone?: string;
  images?: { imageId?: number; imageUrl?: string; type?: string }[];
  nameUserContact?: string;
  tutorialApply?: string;
  socials?: { id?: number; platform?: string; url?: string; logoUrl?: string }[];
}

function mapCompanyDTOToCompany(dto: CompanyDTO | null): Company | null {
  if (!dto || dto.companyId == null) return null;
  const industry_ids = dto.industryIds?.map((id) => String(id));
  const industries = dto.industries?.map((i) => ({
    id: String(i.industryId ?? ''),
    name: i.name ?? '',
  }));
  return {
    id: String(dto.companyId),
    name: dto.companyName ?? '',
    logo_url: dto.logoUrl,
    banner_url: dto.bannerUrl,
    slogan: dto.slogan,
    website: dto.website,
    description: dto.description,
    address: dto.address,
    company_size: dto.companySize,
    industry_id: industry_ids?.[0],
    industry_ids,
    industries,
    is_verified: dto.isVerified ?? false,
    create_job_count: dto.jobPostCount,
    owner_user_id: dto.ownerUserId != null ? String(dto.ownerUserId) : '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    thumbnail_images: dto.images?.map((img) => img.imageUrl).filter(Boolean) as string[] | undefined,
    images: dto.images?.filter((img) => img.imageId != null).map((img) => ({
      imageId: img.imageId!,
      imageUrl: img.imageUrl ?? '',
      type: img.type,
    })),
    name_user_contact: dto.nameUserContact,
    tutorial_apply: dto.tutorialApply,
    socials: dto.socials?.map((s) => ({
      id: s.id ?? 0,
      platform: s.platform ?? '',
      url: s.url ?? '',
      logoUrl: s.logoUrl,
    })),
  };
}

export async function getCompanies(params?: PaginationParams): Promise<PaginatedResponse<Company>> {
  if (USE_MOCK) {
    return mockCompanies.mockGetCompanies(params);
  }

  const response = (await apiClient.get('/company/all')) as { data?: CompanyDTO[] };
  const items = (response.data ?? response) as CompanyDTO[] | CompanyDTO;
  const listRaw = Array.isArray(items) ? items : [items];
  const list = listRaw.map(mapCompanyDTOToCompany).filter((c): c is Company => c != null);
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const start = (page - 1) * limit;
  return {
    items: list.slice(start, start + limit),
    pagination: {
      page,
      limit,
      total: list.length,
      totalPages: Math.ceil(list.length / limit),
      hasNext: start + limit < list.length,
      hasPrev: page > 1,
    },
  };
}

export async function getCompanyDetail(companyId: string): Promise<Company> {
  if (USE_MOCK) {
    return mockCompanies.mockGetCompanyDetail(companyId);
  }

  const response = (await apiClient.get(`/company/${companyId}`)) as { data?: CompanyDTO };
  const dto = (response.data ?? response) as CompanyDTO;
  const company = mapCompanyDTOToCompany(dto);
  if (!company) throw new Error('Company not found');
  return company;
}

export async function getMyCompany(): Promise<Company | null> {
  if (USE_MOCK) {
    return mockCompanies.mockGetMyCompany();
  }

  try {
    const response = (await apiClient.get('/company/me')) as { code?: number; data?: CompanyDTO };
    if (response.code === 404) return null;
    const dto = (response.data ?? response) as CompanyDTO;
    return mapCompanyDTOToCompany(dto);
  } catch (err: any) {
    if (err?.statusCode === 404) return null;
    throw err;
  }
}

export async function createMyCompany(formData: FormData): Promise<Company> {
  if (USE_MOCK) {
    return mockCompanies.mockCreateMyCompany(formData);
  }

  const response = (await apiClient.post('/company/me', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })) as { data?: CompanyDTO };
  const dto = (response.data ?? response) as CompanyDTO;
  const company = mapCompanyDTOToCompany(dto);
  if (!company) throw new Error('Failed to create company');
  return company;
}

export async function updateMyCompany(formData: FormData): Promise<Company> {
  if (USE_MOCK) {
    return mockCompanies.mockUpdateMyCompany(formData);
  }

  const companyId = formData.get('companyId');
  if (!companyId) throw new Error('Company ID is required for update');

  await apiClient.put(`/company/update/${companyId}`, formData);

  const company = await getMyCompany();
  if (!company) throw new Error('Failed to update company');
  return company;
}

export async function deleteLogo(companyId: string): Promise<void> {
  if (USE_MOCK) return;
  await apiClient.delete(`/company/${companyId}/logo`);
}

export async function deleteBanner(companyId: string): Promise<void> {
  if (USE_MOCK) return;
  await apiClient.delete(`/company/${companyId}/banner`);
}

export async function deleteCompanyImage(imageId: number): Promise<void> {
  if (USE_MOCK) return;
  await apiClient.delete(`/company/images/${imageId}`);
}

