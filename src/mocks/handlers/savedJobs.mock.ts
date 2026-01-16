import type { SavedJob } from '@/types';
import { delay } from './auth.mock';
import { 
  mockSavedJobs, 
  getSavedJobsByProfileId,
  isJobSaved 
} from '../data/savedJobs.mock';
import { mockJobs } from '../data/jobs.mock';
import { mockUsers } from '../data/users.mock';

export async function mockGetSavedJobs(userId: string): Promise<SavedJob[]> {
  await delay(400);
  return getSavedJobsByProfileId(userId);
}

export async function mockSaveJob(
  userId: string,
  jobId: string
): Promise<SavedJob> {
  await delay(400);
  
  if (isJobSaved(userId, jobId)) {
    throw new Error('Job already saved');
  }
  
  const job = mockJobs.find(j => j.id === jobId);
  if (!job) {
    throw new Error('Job not found');
  }
  
  const newSavedJob: SavedJob = {
    id: `saved-${Date.now()}`,
    user_id: userId,
    job_id: jobId,
    created_at: new Date().toISOString(),
    user: mockUsers.find(u => u.id === userId),
    job
  };
  
  mockSavedJobs.push(newSavedJob);
  return newSavedJob;
}

export async function mockUnsaveJob(
  userId: string,
  jobId: string
): Promise<void> {
  await delay(300);
  
  const index = mockSavedJobs.findIndex(
    sj => sj.user_id === userId && sj.job_id === jobId
  );
  
  if (index === -1) {
    throw new Error('Saved job not found');
  }
  
  mockSavedJobs.splice(index, 1);
}

