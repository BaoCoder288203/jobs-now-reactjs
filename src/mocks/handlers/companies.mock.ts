import type { Company, PaginatedResponse, PaginationParams } from '@/types';
import { mockCompanies } from '../data/companies.mock';
import { delay } from './auth.mock';
import { getSessionByToken } from '../data/sessions.mock';

export async function mockGetCompanies(params?: PaginationParams): Promise<PaginatedResponse<Company>> {
  await delay(400);
  
  let filtered = [...mockCompanies];
  
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    items: filtered.slice(startIndex, endIndex),
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
      hasNext: endIndex < filtered.length,
      hasPrev: page > 1
    }
  };
}

export async function mockGetCompanyDetail(companyId: string): Promise<Company> {
  await delay(300);
  
  const company = mockCompanies.find(c => c.id === companyId);
  
  if (!company) {
    throw new Error('Company not found');
  }
  
  return company;
}

// Thêm function mới: Lấy company của user hiện tại (mỗi recruiter chỉ có 1 company)
export async function mockGetMyCompany(): Promise<Company | null> {
  await delay(300);
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }
    
    // Lấy userId từ session (đáng tin cậy hơn parse token)
    const session = getSessionByToken(token);
    if (session && session.userId) {
      // Tìm company của user này
      const company = mockCompanies.find(c => c.owner_user_id === session.userId);
      return company || null;
    }
  } catch {
    // Nếu có lỗi, return null
  }
  
  return null;
}

// Tạo company mới cho recruiter hiện tại
export async function mockCreateMyCompany(formData: FormData): Promise<Company> {
  await delay(500);
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Unauthorized');
    }
    
    const session = getSessionByToken(token);
    if (!session || !session.userId) {
      throw new Error('Unauthorized');
    }
    
    // Parse company data from FormData
    const companyDataBlob = formData.get('company');
    if (!companyDataBlob || !(companyDataBlob instanceof Blob)) {
      throw new Error('Invalid company data');
    }
    
    const companyDataText = await companyDataBlob.text();
    const companyData = JSON.parse(companyDataText);
    
    // Check if user already has a company
    const existingCompany = mockCompanies.find(c => c.owner_user_id === session.userId);
    if (existingCompany) {
      throw new Error('User already has a company');
    }
    
    // Create new company
    const newCompany: Company = {
      id: `company-${Date.now()}`,
      name: companyData.name,
      description: companyData.description || '',
      website: companyData.website || undefined,
      company_size: companyData.company_size || undefined,
      address: companyData.address || undefined,
      industry_id: companyData.industry_id || undefined,
      owner_user_id: session.userId,
      create_job_count: 0,
      is_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Handle logo upload (simulate)
    const logoFile = formData.get('logoFile');
    if (logoFile && logoFile instanceof File) {
      // In real app, upload to server and get URL
      // For mock, create a data URL
      const logoDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            resolve(URL.createObjectURL(logoFile));
          }
        };
        reader.onerror = () => resolve(URL.createObjectURL(logoFile));
        reader.readAsDataURL(logoFile);
      });
      newCompany.logo_url = logoDataUrl;
    }
    
    mockCompanies.push(newCompany);
    return newCompany;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create company');
  }
}

// Cập nhật company của recruiter hiện tại
export async function mockUpdateMyCompany(formData: FormData): Promise<Company> {
  await delay(500);
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Unauthorized');
    }
    
    const session = getSessionByToken(token);
    if (!session || !session.userId) {
      throw new Error('Unauthorized');
    }
    
    // Find existing company
    const companyIndex = mockCompanies.findIndex(c => c.owner_user_id === session.userId);
    if (companyIndex === -1) {
      throw new Error('Company not found');
    }
    
    // Parse company data from FormData
    const companyDataBlob = formData.get('company');
    if (!companyDataBlob || !(companyDataBlob instanceof Blob)) {
      throw new Error('Invalid company data');
    }
    
    const companyDataText = await companyDataBlob.text();
    const companyData = JSON.parse(companyDataText);
    
    // Update company
    const existingCompany = mockCompanies[companyIndex];
    const updatedCompany: Company = {
      ...existingCompany,
      name: companyData.name || existingCompany.name,
      description: companyData.description || existingCompany.description,
      website: companyData.website !== undefined ? companyData.website : existingCompany.website,
      company_size: companyData.company_size !== undefined ? companyData.company_size : existingCompany.company_size,
      address: companyData.address !== undefined ? companyData.address : existingCompany.address,
      industry_id: companyData.industry_id !== undefined ? companyData.industry_id : existingCompany.industry_id,
      updated_at: new Date().toISOString(),
    };
    
    // Handle logo upload (simulate)
    const logoFile = formData.get('logoFile');
    if (logoFile && logoFile instanceof File) {
      // In real app, upload to server and get URL
      // For mock, create a data URL
      const logoDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            resolve(URL.createObjectURL(logoFile));
          }
        };
        reader.onerror = () => resolve(URL.createObjectURL(logoFile));
        reader.readAsDataURL(logoFile);
      });
      updatedCompany.logo_url = logoDataUrl;
    }
    
    mockCompanies[companyIndex] = updatedCompany;
    return updatedCompany;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update company');
  }
}

