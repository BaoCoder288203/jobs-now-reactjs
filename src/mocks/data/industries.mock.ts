import type { Industry, JobCategory } from '@/types';

export const mockIndustries: Industry[] = [
  {
    id: 'industry-1',
    name: 'Technology',
    description: 'Technology and software development industry'
  },
  {
    id: 'industry-2',
    name: 'Finance',
    description: 'Financial services and banking industry'
  },
  {
    id: 'industry-3',
    name: 'Healthcare',
    description: 'Healthcare and medical services industry'
  },
  {
    id: 'industry-4',
    name: 'Education',
    description: 'Education and training services industry'
  },
  {
    id: 'industry-5',
    name: 'E-commerce',
    description: 'E-commerce and retail industry'
  }
];

export const mockJobCategories: JobCategory[] = [
  {
    id: 'category-1',
    name: 'Software Development',
    description: 'Software development and engineering roles'
  },
  {
    id: 'category-2',
    name: 'Web Development',
    description: 'Web development and frontend roles'
  },
  {
    id: 'category-3',
    name: 'Mobile Development',
    description: 'Mobile app development roles'
  },
  {
    id: 'category-4',
    name: 'Data Science',
    description: 'Data science and analytics roles'
  },
  {
    id: 'category-5',
    name: 'Financial Analysis',
    description: 'Financial analysis and consulting roles'
  },
  {
    id: 'category-6',
    name: 'Investment Banking',
    description: 'Investment banking and trading roles'
  }
];

export function getIndustries(): Industry[] {
  return mockIndustries;
}

export function getIndustryById(id: string): Industry | null {
  return mockIndustries.find(i => i.id === id) || null;
}

export function getJobCategories(): JobCategory[] {
  return mockJobCategories;
}

export function getJobCategoriesByIndustryId(industryId: string): JobCategory[] {
  return mockJobCategories;
}

export function getJobCategoryById(id: string): JobCategory | null {
  return mockJobCategories.find(c => c.id === id) || null;
}
