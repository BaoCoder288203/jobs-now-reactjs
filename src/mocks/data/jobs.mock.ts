import type { Job } from '@/types';
import { mockCompanies } from './companies.mock';
import { mockJobCategories } from './industries.mock';
import { mockSkills } from './skills.mock';

export const mockJobs: Job[] = [
  {
    id: 'job-1',
    company_id: 'company-1',
    category_id: 'category-2',
    industry_id: 'industry-1',
    title: 'Senior Frontend Developer',
    description: 'We are looking for an experienced Frontend Developer to join our team. You will be responsible for building modern web applications using React and TypeScript.',
    requirements: '- 5+ years of experience in React/TypeScript\n- Strong knowledge of modern JavaScript\n- Experience with state management (Redux, Zustand)',
    salary_min: 120000,
    salary_max: 180000,
    experience_level: 'senior',
    job_type: 'full-time',
    location: 'San Francisco, CA',
    status: 'open',
    expired_at: '2024-12-31T23:59:59Z',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    company: mockCompanies[0],
    category: mockJobCategories[1],
    skills: [
      {
        id: 'jobskill-1',
        job_id: 'job-1',
        skill_id: 'skill-1',
        skill: mockSkills[0]
      },
      {
        id: 'jobskill-2',
        job_id: 'job-1',
        skill_id: 'skill-2',
        skill: mockSkills[1]
      },
      {
        id: 'jobskill-3',
        job_id: 'job-1',
        skill_id: 'skill-6',
        skill: mockSkills[5]
      }
    ]
  },
  {
    id: 'job-2',
    company_id: 'company-2',
    category_id: 'category-2',
    industry_id: 'industry-2',
    title: 'React Developer',
    description: 'Join our dynamic team as a React Developer. Work on exciting projects and grow your career with us.',
    salary_min: 90000,
    salary_max: 130000,
    experience_level: 'mid-level',
    job_type: 'full-time',
    location: 'New York, NY',
    status: 'open',
    expired_at: '2024-12-31T23:59:59Z',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
    company: mockCompanies[1],
    category: mockJobCategories[1],
    skills: [
      {
        id: 'jobskill-4',
        job_id: 'job-2',
        skill_id: 'skill-1',
        skill: mockSkills[0]
      }
    ]
  },
  {
    id: 'job-3',
    company_id: 'company-1',
    category_id: 'category-1',
    industry_id: 'industry-1',
    title: 'Full Stack Engineer',
    description: 'We need a Full Stack Engineer to work on our platform. You will work with React, Node.js, and cloud technologies.',
    salary_min: 140000,
    salary_max: 200000,
    experience_level: 'senior',
    job_type: 'full-time',
    location: 'San Francisco, CA',
    status: 'open',
    expired_at: '2024-12-31T23:59:59Z',
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
    company: mockCompanies[0],
    category: mockJobCategories[0],
    skills: [
      {
        id: 'jobskill-5',
        job_id: 'job-3',
        skill_id: 'skill-1',
        skill: mockSkills[0]
      },
      {
        id: 'jobskill-6',
        job_id: 'job-3',
        skill_id: 'skill-3',
        skill: mockSkills[2]
      }
    ]
  },
  {
    id: 'job-4',
    company_id: 'company-3',
    category_id: 'category-1',
    industry_id: 'industry-1',
    title: 'Backend Developer',
    description: 'Looking for a skilled Backend Developer with experience in Node.js and databases.',
    salary_min: 100000,
    salary_max: 150000,
    experience_level: 'mid-level',
    job_type: 'full-time',
    location: 'London, UK',
    status: 'open',
    expired_at: '2024-12-31T23:59:59Z',
    created_at: '2024-02-10T00:00:00Z',
    updated_at: '2024-02-10T00:00:00Z',
    company: mockCompanies[2],
    category: mockJobCategories[0],
    skills: [
      {
        id: 'jobskill-7',
        job_id: 'job-4',
        skill_id: 'skill-3',
        skill: mockSkills[2]
      }
    ]
  }
];
