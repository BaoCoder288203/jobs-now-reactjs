import type { Company, PaginatedResponse, PaginationParams } from '@/types';
import { USE_MOCK } from './api';
import * as mockCompanies from '@/mocks/handlers/companies.mock';
import { apiClient } from './api';

export async function getCompanies(params?: PaginationParams): Promise<PaginatedResponse<Company>> {
  if (USE_MOCK) {
    return mockCompanies.mockGetCompanies(params);
  }
  
  const response = await apiClient.get('/companies', { params });
  return response.data;
}

export async function getCompanyDetail(companyId: string): Promise<Company> {
  if (USE_MOCK) {
    return mockCompanies.mockGetCompanyDetail(companyId);
  }
  
  const response = await apiClient.get(`/companies/${companyId}`);
  return response.data;
}

// Lấy company của user hiện tại (recruiter chỉ có 1 company)
export async function getMyCompany(): Promise<Company | null> {
  if (USE_MOCK) {
    return mockCompanies.mockGetMyCompany();
  }
  
  const response = await apiClient.get('/companies/me');
  return response.data;
}

// Tạo company mới cho recruiter hiện tại
export async function createMyCompany(formData: FormData): Promise<Company> {
  if (USE_MOCK) {
    return mockCompanies.mockCreateMyCompany(formData);
  }
  
  const response = await apiClient.post('/companies/me', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

// Cập nhật company của recruiter hiện tại
export async function updateMyCompany(formData: FormData): Promise<Company> {
  if (USE_MOCK) {
    return mockCompanies.mockUpdateMyCompany(formData);
  }
  
  const response = await apiClient.put('/companies/me', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

