import type { SavedJob } from '@/types';
import { mockJobs } from './jobs.mock';
import { mockUsers } from './users.mock';

export const mockSavedJobs: SavedJob[] = [
  {
    id: 'saved-1',
    user_id: 'user-2',
    job_id: 'job-3',
    created_at: '2024-02-01T10:00:00Z',
    user: mockUsers[1],
    job: mockJobs[2]
  },
  {
    id: 'saved-2',
    user_id: 'user-2',
    job_id: 'job-4',
    created_at: '2024-02-05T14:00:00Z',
    user: mockUsers[1],
    job: mockJobs[3]
  },
  {
    id: 'saved-3',
    user_id: 'user-3',
    job_id: 'job-1',
    created_at: '2024-02-10T09:00:00Z',
    user: mockUsers[2],
    job: mockJobs[0]
  }
];

export function getSavedJobsByProfileId(userId: string): SavedJob[] {
  return mockSavedJobs.filter(s => s.user_id === userId);
}

export function isJobSaved(userId: string, jobId: string): boolean {
  return mockSavedJobs.some(s => s.user_id === userId && s.job_id === jobId);
}
