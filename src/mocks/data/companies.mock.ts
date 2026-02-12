import type { Company } from '@/types';
import { mockIndustries } from './industries.mock';

export const mockCompanies: Company[] = [
  {
    id: 'company-1',
    name: 'TechCorp Inc.',
    logo_url: 'https://stellar-signs.com/wp-content/uploads/2021/08/Depositphotos_13687440_s-2019.jpg',
    banner_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
    website: 'https://techcorp.com',
    description: 'Leading technology company specializing in software development and cloud solutions.',
    slogan: 'Innovation at Scale',
    category: 'Công nghệ thông tin',
    thumbnail_images: [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400'
    ],
    company_size: '500-1000',
    address: '123 Tech Street, San Francisco, CA',
    industry_id: 'industry-1',
    owner_user_id: 'user-4',
    create_job_count: 15,
    is_verified: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    industry: mockIndustries[0]
  },
  {
    id: 'company-2',
    name: 'StartupXYZ',
    logo_url: 'https://i.fbcd.co/products/resized/resized-750-500/logo-set-26-03-78a1ebac05279e80ffef88d7519750a7eb3a0b200bd81594f0bca5c64fa1bf97.jpg',
    banner_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80',
    website: 'https://startupxyz.com',
    description: 'Innovative startup in fintech space',
    slogan: 'Building the Future of Finance',
    category: 'Tài chính',
    thumbnail_images: [
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400'
    ],
    company_size: '10-50',
    address: '456 Startup Ave, New York, NY',
    industry_id: 'industry-2',
    owner_user_id: 'user-4',
    create_job_count: 5,
    is_verified: false,
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z',
    industry: mockIndustries[1]
  },
  {
    id: 'company-3',
    name: 'Enterprise Solutions Ltd.',
    logo_url: 'https://images-platform.99static.com//WnnxETQYaEVDQZxa1ZVZVZjtO-4=/317x274:817x774/fit-in/590x590/99designs-contests-attachments/67/67571/attachment_67571500',
    banner_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&q=80',
    website: 'https://enterprise.com',
    description: 'Enterprise software solutions for large organizations',
    slogan: 'Empowering Large Organizations',
    category: 'Dịch vụ doanh nghiệp',
    thumbnail_images: [
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400'
    ],
    company_size: '1000+',
    address: '789 Enterprise Blvd, London, UK',
    industry_id: 'industry-1',
    owner_user_id: 'user-4',
    create_job_count: 25,
    is_verified: true,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
    industry: mockIndustries[0]
  }
];
