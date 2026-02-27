import type { Company, PaginatedResponse, PaginationParams } from '@/types';
import { USE_MOCK } from './api';
import * as mockCompanies from '@/mocks/handlers/companies.mock';
import { apiClient } from './api';

interface CompanyDTO {
  companyId?: number;
  companyName?: string;
  logoUrl?: string;
  bannerUrl?: string;
  slogan?: string;
  website?: string;
  description?: string;
  address?: string;
  companySize?: string;
  industryId?: number;
  isVerified?: boolean;
  jobPostCount?: number;
  email?: string;
  phone?: string;
  images?: { imageId?: number; imageUrl?: string; type?: string }[];
}

function mapCompanyDTOToCompany(dto: CompanyDTO | null): Company | null {
  if (!dto || dto.companyId == null) return null;
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
    industry_id: dto.industryId != null ? String(dto.industryId) : undefined,
    is_verified: dto.isVerified ?? false,
    create_job_count: dto.jobPostCount,
    owner_user_id: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    thumbnail_images: dto.images?.map((img) => img.imageUrl).filter(Boolean) as string[] | undefined,
    images: dto.images?.filter((img) => img.imageId != null).map((img) => ({
      imageId: img.imageId!,
      imageUrl: img.imageUrl ?? '',
      type: img.type,
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

// Lấy company của user hiện tại (recruiter chỉ có 1 company)
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

// Tạo company mới cho recruiter hiện tại
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

