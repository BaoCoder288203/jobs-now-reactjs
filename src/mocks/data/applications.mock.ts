import type { Application, ApplicationHistory } from '@/types';
import { mockJobs } from './jobs.mock';
import { mockResumes } from './profiles.mock';
import { mockUsers } from './users.mock';

const mockApplicationHistories: ApplicationHistory[] = [
  {
    id: 'history-1',
    application_id: 'app-1',
    old_status: 'pending',
    new_status: 'reviewed',
    changed_by: 'user-4',
    changed_at: '2024-02-05T10:00:00Z',
    note: 'Application under review'
  },
  {
    id: 'history-2',
    application_id: 'app-1',
    old_status: 'reviewed',
    new_status: 'accepted',
    changed_by: 'user-4',
    changed_at: '2024-02-06T14:30:00Z',
    note: 'Candidate shortlisted for interview'
  }
];

export const mockApplications: Application[] = [
  {
    id: 'app-1',
    job_id: 'job-1',
    user_id: 'user-2',
    resume_id: 'resume-1',
    cover_letter: 'I am very interested in this position...',
    status: 'accepted',
    created_at: '2024-02-01T09:00:00Z',
    job: mockJobs[0],
    user: mockUsers[1],
    resume: mockResumes[0],
    history: mockApplicationHistories
  },
  {
    id: 'app-2',
    job_id: 'job-2',
    user_id: 'user-2',
    resume_id: 'resume-1',
    cover_letter: 'I would love to join your team...',
    status: 'pending',
    created_at: '2024-02-10T11:00:00Z',
    job: mockJobs[1],
    user: mockUsers[1],
    resume: mockResumes[0]
  },
  {
    id: 'app-3',
    job_id: 'job-1',
    user_id: 'user-3',
    resume_id: 'resume-2',
    cover_letter: 'I am excited about this opportunity...',
    status: 'reviewed',
    created_at: '2024-02-12T08:00:00Z',
    job: mockJobs[0],
    user: mockUsers[2],
    resume: mockResumes[1]
  }
];

export function hasUserAppliedJob(userId: string, jobId: string): boolean {
  const userApplications = mockApplications.filter(
    app => app.user_id === userId && app.job_id === jobId && app.status !== 'rejected'
  );
  return userApplications.length > 0;
}

export function getApplicationsByUserId(userId: string): Application[] {
  return mockApplications.filter(app => app.user_id === userId);
}

export function getApplicationsByJobId(jobId: string): Application[] {
  return mockApplications.filter(app => app.job_id === jobId);
}

export function getApplicationById(applicationId: string): Application | null {
  return mockApplications.find(a => a.id === applicationId) || null;
}
