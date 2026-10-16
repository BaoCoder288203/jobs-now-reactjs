import type { Application } from '@/types';
import { USE_MOCK } from './api';
import * as mockApps from '@/mocks/handlers/applications.mock';
import { apiClient } from './api';

interface ApplicationDetailDTO {
  applicationId?: number;
  status?: string;
  interviewDetailsHtml?: string;
  appliedAt?: string;
  job?: { jobId?: number; title?: string; companyId?: number; companyName?: string; companyLogo?: string; location?: string; [k: string]: unknown };
  jobSeekerProfile?: { profileId?: number; userId?: number; fullName?: string; email?: string; avatarUrl?: string; [k: string]: unknown };
  resumeApplied?: {
    resumeId?: number;
    resumeName?: string;
    resumeUrl?: string;
    extractedText?: string;
    extracted_text?: string;
    [k: string]: unknown;
  };
  statusHistory?: { status?: string; time?: string }[];
}

function mapApplicationDetailToApplication(dto: ApplicationDetailDTO): Application {
  const job = dto.job;
  const profile = dto.jobSeekerProfile;
  const resume = dto.resumeApplied;
  return {
    id: String(dto.applicationId ?? ''),
    job_id: String(job?.jobId ?? ''),
    user_id: String(profile?.userId ?? ''),
    resume_id: String(resume?.resumeId ?? ''),
    status: (dto.status ?? 'PENDING').toLowerCase(),
    interview_details_html: dto.interviewDetailsHtml,
    created_at: dto.appliedAt ?? new Date().toISOString(),
    job: job
      ? {
          id: String(job.jobId ?? ''),
          company_id: String(job.companyId ?? ''),
          title: job.title ?? '',
          description: '',
          status: 'open',
          created_at: '',
          updated_at: '',
          company: (job.companyName != null || job.companyId != null)
            ? { id: String(job.companyId ?? ''), name: job.companyName ?? '', logo_url: job.companyLogo, owner_user_id: '', created_at: '', updated_at: '' }
            : undefined,
        }
      : undefined,
    user: profile
      ? { userId: profile.userId ?? 0, fullName: profile.fullName ?? '', email: profile.email ?? '', phone: null, role: '', avatar: null, profileId: profile.profileId ?? null, companyId: null, companyName: null }
      : undefined,
    resume: resume
      ? {
          resumeId: Number(resume.resumeId ?? 0),
          resumeName: resume.resumeName ?? '',
          resumeUrl: resume.resumeUrl ?? '',
          uploadedAt: '',
          id: String(resume.resumeId ?? ''),
          job_seeker_profile_id: '',
          file_url: resume.resumeUrl ?? '',
          file_name: resume.resumeName ?? '',
          is_default: false,
          created_at: '',
          extracted_text: resume.extracted_text ?? resume.extractedText ?? '',
        }
      : undefined,
  };
}

export async function applyJob(
  userId: string,
  jobId: string,
  resumeId?: string,
  coverLetter?: string,
  profileId?: number
): Promise<Application> {
  if (USE_MOCK) {
    return mockApps.mockApplyJob(userId, jobId, resumeId, coverLetter);
  }

  if (!profileId || !resumeId) throw new Error('Profile and resume required');
  await apiClient.post('/application/apply', {
    jobId: parseInt(jobId, 10),
    profileId,
    resumeId: parseInt(resumeId, 10),
  });
  return { id: '', job_id: jobId, user_id: userId, resume_id: resumeId ?? '', status: 'pending', created_at: new Date().toISOString() };
}

export async function getMyApplications(
  profileId: string | number | undefined,
  userIdForMock?: string
): Promise<Application[]> {
  if (USE_MOCK) {
    return mockApps.mockGetMyApplications(userIdForMock ?? String(profileId ?? ''));
  }

  if (!profileId) return [];
  const res = (await apiClient.get(`/application/jobseeker/${profileId}`)) as { data?: ApplicationDetailDTO[] };
  const list = (res.data ?? res) as ApplicationDetailDTO[] | ApplicationDetailDTO;
  const arr = Array.isArray(list) ? list : [list];
  return arr.map(mapApplicationDetailToApplication);
}

export async function getJobApplications(jobId: string): Promise<Application[]> {
  if (USE_MOCK) {
    return mockApps.mockGetJobApplications(jobId);
  }

  const res = (await apiClient.get(`/application/job/${jobId}`)) as { data?: { applicationId?: number; jobSeekerProfile?: unknown; appliedAt?: string; status?: string }[] };
  const list = (res.data ?? res) as unknown[];
  const arr = Array.isArray(list) ? list : [list];
  return arr.map((item: any) => ({
    id: String(item.applicationId ?? ''),
    job_id: jobId,
    user_id: String(item.jobSeekerProfile?.userId ?? ''),
    resume_id: '',
    status: (item.status ?? 'PENDING').toLowerCase(),
    created_at: item.appliedAt ?? new Date().toISOString(),
    user: item.jobSeekerProfile
      ? { userId: item.jobSeekerProfile.userId ?? 0, fullName: item.jobSeekerProfile.fullName ?? '', email: item.jobSeekerProfile.email ?? '', phone: null, role: '', avatar: null, profileId: item.jobSeekerProfile.profileId ?? null, companyId: null, companyName: null }
      : undefined,
  })) as Application[];
}

export async function updateApplicationStatus(
  applicationId: string,
  status: string,
  interviewDetailsHtml?: string
): Promise<Application> {
  if (USE_MOCK) {
    return mockApps.mockUpdateApplicationStatus(applicationId, status);
  }

  await apiClient.put(`/application/${applicationId}/status`, {
    status: status.toUpperCase(),
    ...(status.toLowerCase() === 'interviewing' && interviewDetailsHtml ?
      { interviewDetailsHtml }
    : {}),
  });
  return getApplicationDetail(applicationId);
}

export async function getApplicationDetail(applicationId: string): Promise<Application> {
  if (USE_MOCK) {
    return mockApps.mockGetApplicationDetail(applicationId);
  }

  const res = (await apiClient.get(`/application/${applicationId}`)) as { data?: ApplicationDetailDTO };
  const dto = (res.data ?? res) as ApplicationDetailDTO;
  return mapApplicationDetailToApplication(dto);
}

export async function getAllApplications(): Promise<Application[]> {
  if (USE_MOCK) {
    const result = await mockApps.mockGetAllApplications();
    return result.items || [];
  }

  return [];
}

export async function getCompanyApplications(companyId: string): Promise<Application[]> {
  if (USE_MOCK) {
    return mockApps.mockGetCompanyApplications(companyId);
  }

  const res = (await apiClient.get(`/application/company/${companyId}`)) as { data?: ApplicationDetailDTO[] };
  const list = (res.data ?? res) as ApplicationDetailDTO[] | ApplicationDetailDTO;
  const arr = Array.isArray(list) ? list : [list];
  return arr.map(mapApplicationDetailToApplication);
}

export async function withdrawApplication(applicationId: string, userId: string): Promise<void> {
  if (USE_MOCK) {
    return mockApps.mockWithdrawApplication(applicationId, userId);
  }

  await apiClient.delete(`/application/${applicationId}`);
}

export async function sendCustomEmail(
  applicationId: string,
  subject: string,
  bodyHtml: string
): Promise<void> {
  if (USE_MOCK) {
    console.log('Mock: Send custom email to application', applicationId, { subject, bodyHtml });
    return;
  }
  await apiClient.post(`/application/${applicationId}/send-email`, {
    subject,
    bodyHtml
  });
}

export async function syncApplicationsFromEmail(): Promise<string[]> {
  if (USE_MOCK) {
    return ["Nguyễn Văn A (Mock)"];
  }
  const res = (await apiClient.post('/application/sync-via-email')) as { data?: string[] };
  return (res.data ?? res) as string[];
}

export async function sendApplyEmail(jobId: string, email: String, fullName: String, subject?: string, body?: string, cvFile?: File, supportingFiles?: File[]): Promise<void> {
  if (USE_MOCK) {
    console.log("Mock: Sent apply email for job:", jobId);
    return;
  }
  const formData = new FormData();
  formData.append("jobId", jobId);
  formData.append("email", String(email));
  formData.append("fullName", String(fullName));
  if (subject) formData.append("subject", subject);
  if (body) formData.append("body", body);
  if (cvFile) {
    formData.append("cvFile", cvFile);
  }
  if (supportingFiles && supportingFiles.length > 0) {
    supportingFiles.forEach((file) => {
      formData.append("supportingFiles", file);
    });
  }
  await apiClient.post("/application/send-apply-email", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
}

export async function notifyVideoCallStarted(applicationId: string): Promise<void> {
  await apiClient.post(`/application/${applicationId}/video-call-notify`);
}
