import type { SavedJob } from '@/types';

export interface SavedJobMock extends SavedJob {
  profileId: string;
}

export const mockSavedJobs: SavedJobMock[] = [
  {
    profileId: '2',
    savedJobId: 1,
    jobId: 3,
    jobTitle: 'Senior Frontend Developer',
    companyName: 'Tech Corp',
    companyLogo: '',
    location: 'Ho Chi Minh City',
    salaryMin: 1500,
    salaryMax: 2500,
    jobType: 'full_time',
    savedAt: '2024-02-01T10:00:00Z',
  },
  {
    profileId: '2',
    savedJobId: 2,
    jobId: 4,
    jobTitle: 'Backend Engineer',
    companyName: 'FinTech Labs',
    companyLogo: '',
    location: 'Ha Noi',
    salaryMin: 1200,
    salaryMax: 2200,
    jobType: 'full_time',
    savedAt: '2024-02-05T14:00:00Z',
  },
  {
    profileId: '3',
    savedJobId: 3,
    jobId: 1,
    jobTitle: 'UI/UX Designer',
    companyName: 'Creative Studio',
    companyLogo: '',
    location: 'Da Nang',
    salaryMin: 900,
    salaryMax: 1600,
    jobType: 'part_time',
    savedAt: '2024-02-10T09:00:00Z',
  }
];

export function getSavedJobsByProfileId(profileId: string): SavedJob[] {
  return mockSavedJobs
    .filter((s) => s.profileId === profileId)
    .map(({ profileId: _profileId, ...saved }) => saved);
}

export function isJobSaved(profileId: string, jobId: string): boolean {
  const id = Number(jobId);
  return mockSavedJobs.some((s) => s.profileId === profileId && s.jobId === id);
}
