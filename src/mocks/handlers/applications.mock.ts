import type { Application } from '@/types';
import { mockApplications, hasUserAppliedJob, getApplicationsByUserId, getApplicationsByJobId, getApplicationById } from '../data/applications.mock';
import { mockJobs } from '../data/jobs.mock';
import { getPrimaryResumeByProfileId, getProfileByUserId } from '../data/profiles.mock';
import { delay } from './auth.mock';
import { mockUsers } from '../data/users.mock';

export async function mockApplyJob(
  userId: string, 
  jobId: string, 
  resumeId?: string,
  coverLetter?: string
): Promise<Application> {
  await delay(700);
  
  const job = mockJobs.find(j => j.id === jobId);
  if (!job) {
    throw new Error('Job not found');
  }
  
  if (hasUserAppliedJob(userId, jobId)) {
    throw new Error('You have already applied for this job');
  }
  
  const profile = getProfileByUserId(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }
  const profileId = profile.id ?? String(profile.profileId);
  let resume = resumeId
    ? (getPrimaryResumeByProfileId(profileId) || null)
    : getPrimaryResumeByProfileId(profileId);
  if (!resume) {
    throw new Error('Please upload a resume first');
  }
  const rid = resume.id ?? String(resume.resumeId);
  const newApplication: Application = {
    id: `app-${Date.now()}`,
    job_id: jobId,
    user_id: userId,
    resume_id: rid,
    cover_letter: coverLetter,
    status: 'pending',
    created_at: new Date().toISOString(),
    job,
    user: mockUsers.find(u => u.id === userId),
    resume
  };
  
  mockApplications.push(newApplication);
  
  return newApplication;
}

export async function mockGetMyApplications(userId: string): Promise<Application[]> {
  await delay(400);
  return getApplicationsByUserId(userId);
}

export async function mockGetJobApplications(jobId: string): Promise<Application[]> {
  await delay(400);
  return getApplicationsByJobId(jobId);
}

export async function mockUpdateApplicationStatus(
  applicationId: string,
  status: string
): Promise<Application> {
  await delay(500);
  
  const application = getApplicationById(applicationId);
  
  if (!application) {
    throw new Error('Application not found');
  }
  
  application.status = status;
  
  return application;
}

export async function mockGetApplicationDetail(applicationId: string): Promise<Application> {
  await delay(400);
  
  const application = getApplicationById(applicationId);
  
  if (!application) {
    throw new Error('Application not found');
  }
  
  return application;
}

export async function mockGetAllApplications(): Promise<{ items: Application[] }> {
  await delay(400);
  return {
    items: mockApplications
  };
}

export async function mockGetCompanyApplications(companyId: string): Promise<Application[]> {
  await delay(400);
  
  // Lấy tất cả job IDs của company
  const companyJobIds = mockJobs.filter(job => job.company_id === companyId).map(job => job.id);
  
  // Lấy applications của các jobs đó
  const companyApplications = mockApplications.filter(app => companyJobIds.includes(app.job_id));
  
  return companyApplications;
}

export async function mockWithdrawApplication(applicationId: string, userId: string): Promise<void> {
  await delay(400);
  
  const application = getApplicationById(applicationId);
  
  if (!application) {
    throw new Error('Application not found');
  }
  
  if (application.status === 'rejected') {
    throw new Error('Application already rejected');
  }
  
  const oldStatus = application.status;
  application.status = 'rejected';
  
  if (!application.history) {
    application.history = [];
  }
  
  application.history.push({
    id: `history-${Date.now()}`,
    application_id: applicationId,
    old_status: oldStatus,
    new_status: 'rejected',
    changed_by: userId,
    changed_at: new Date().toISOString(),
    note: 'Application withdrawn by user',
    application
  });
}
