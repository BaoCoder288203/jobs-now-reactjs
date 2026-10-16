import type { SavedJob } from '@/types';
import { delay } from './auth.mock';
import { 
  mockSavedJobs, 
  getSavedJobsByProfileId,
  isJobSaved 
} from '../data/savedJobs.mock';

export async function mockGetSavedJobs(profileId: string): Promise<SavedJob[]> {
  await delay(400);
  return getSavedJobsByProfileId(profileId);
}

export async function mockSaveJob(
  profileId: string,
  jobId: string
): Promise<SavedJob> {
  await delay(400);
  
  if (isJobSaved(profileId, jobId)) {
    throw new Error('Job already saved');
  }

  const numericJobId = Number(jobId);
  if (Number.isNaN(numericJobId)) {
    throw new Error('Invalid job id');
  }
  
  const maxId = mockSavedJobs.reduce((max, item) => Math.max(max, item.savedJobId), 0);
  const newSavedJob = {
    profileId,
    savedJobId: maxId + 1,
    jobId: numericJobId,
    jobTitle: `Job #${numericJobId}`,
    companyName: 'Mock Company',
    companyLogo: '',
    location: 'Remote',
    salaryMin: 0,
    salaryMax: 0,
    jobType: 'full_time',
    savedAt: new Date().toISOString(),
  };
  
  mockSavedJobs.push(newSavedJob);
  const { profileId: _profileId, ...savedJob } = newSavedJob;
  return savedJob;
}

export async function mockUnsaveJob(
  profileId: string,
  jobId: string
): Promise<void> {
  await delay(300);

  const numericJobId = Number(jobId);
  
  const index = mockSavedJobs.findIndex(
    (sj) => sj.profileId === profileId && sj.jobId === numericJobId
  );
  
  if (index === -1) {
    throw new Error('Saved job not found');
  }
  
  mockSavedJobs.splice(index, 1);
}

