import type {
  JobSeekerProfile,
  WorkExperienceDTO,
  EducationDTO,
  ProjectDTO,
  CertificateDTO,
} from '@/types';
import { apiClient } from './api';

/** Unwrap BE BaseResponse { code, message, data } */
function unwrap<T>(res: unknown): T {
  const obj = res as { data?: T };
  return (obj?.data ?? res) as T;
}

/** Get full profile by user id (includes workExperiences, educations, projects, certificates, skills, resumes) */
export async function getProfileByUserId(userId: string): Promise<JobSeekerProfile> {
  const res = await apiClient.get(`/profile/user/${userId}`);
  return unwrap<JobSeekerProfile>(res);
}

/** Get profile by profileId */
export async function getProfileByProfileId(profileId: number): Promise<JobSeekerProfile> {
  const res = await apiClient.get(`/profile/${profileId}`);
  return unwrap<JobSeekerProfile>(res);
}

/** Update profile (bio, title, fullName, phone, address, dob, socials) */
export async function updateProfile(
  profileId: number,
  data: {
    fullName?: string;
    phone?: string;
    title?: string;
    bio?: string;
    address?: string;
    dob?: string;
    socials?: { platform: string; url: string; logo_url?: string }[];
  }
): Promise<void> {
  await apiClient.put(`/profile/${profileId}`, data);
}

// ---------- Work Experiences (theo resume) ----------
export async function getWorkExperiences(resumeId: number): Promise<WorkExperienceDTO[]> {
  const res = await apiClient.get(`/resume/${resumeId}/work-experiences`);
  return unwrap<WorkExperienceDTO[]>(res);
}

export async function createWorkExperience(
  resumeId: number,
  body: {
    title: string;
    level: string;
    startDate: string;
    endDate?: string | null;
    description?: string | null;
    sortOrder?: number | null;
  }
): Promise<WorkExperienceDTO> {
  const res = await apiClient.post(`/resume/${resumeId}/work-experiences`, body);
  return unwrap<WorkExperienceDTO>(res);
}

export async function updateWorkExperience(
  resumeId: number,
  id: number,
  body: {
    title: string;
    level: string;
    startDate: string;
    endDate?: string | null;
    description?: string | null;
    sortOrder?: number | null;
  }
): Promise<WorkExperienceDTO> {
  const res = await apiClient.put(`/resume/${resumeId}/work-experiences/${id}`, body);
  return unwrap<WorkExperienceDTO>(res);
}

export async function deleteWorkExperience(resumeId: number, id: number): Promise<void> {
  await apiClient.delete(`/resume/${resumeId}/work-experiences/${id}`);
}

// ---------- Educations (theo resume) ----------
export async function getEducations(resumeId: number): Promise<EducationDTO[]> {
  const res = await apiClient.get(`/resume/${resumeId}/educations`);
  return unwrap<EducationDTO[]>(res);
}

export async function createEducation(
  resumeId: number,
  body: {
    title: string;
    educationLevel: string;
    majorId?: number | null;
    startDate: string;
    endDate?: string | null;
    description?: string | null;
    sortOrder?: number | null;
  }
): Promise<EducationDTO> {
  const res = await apiClient.post(`/resume/${resumeId}/educations`, body);
  return unwrap<EducationDTO>(res);
}

export async function updateEducation(
  resumeId: number,
  id: number,
  body: {
    title: string;
    educationLevel: string;
    majorId?: number | null;
    startDate: string;
    endDate?: string | null;
    description?: string | null;
    sortOrder?: number | null;
  }
): Promise<EducationDTO> {
  const res = await apiClient.put(`/resume/${resumeId}/educations/${id}`, body);
  return unwrap<EducationDTO>(res);
}

export async function deleteEducation(resumeId: number, id: number): Promise<void> {
  await apiClient.delete(`/resume/${resumeId}/educations/${id}`);
}

// ---------- Projects (theo resume) ----------
export async function getProjects(resumeId: number): Promise<ProjectDTO[]> {
  const res = await apiClient.get(`/resume/${resumeId}/projects`);
  return unwrap<ProjectDTO[]>(res);
}

export async function createProject(
  resumeId: number,
  body: {
    title: string;
    startDate: string;
    endDate?: string | null;
    description?: string | null;
    sortOrder?: number | null;
  }
): Promise<ProjectDTO> {
  const res = await apiClient.post(`/resume/${resumeId}/projects`, body);
  return unwrap<ProjectDTO>(res);
}

export async function updateProject(
  resumeId: number,
  id: number,
  body: {
    title: string;
    startDate: string;
    endDate?: string | null;
    description?: string | null;
    sortOrder?: number | null;
  }
): Promise<ProjectDTO> {
  const res = await apiClient.put(`/resume/${resumeId}/projects/${id}`, body);
  return unwrap<ProjectDTO>(res);
}

export async function deleteProject(resumeId: number, id: number): Promise<void> {
  await apiClient.delete(`/resume/${resumeId}/projects/${id}`);
}

// ---------- Certificates (theo resume) ----------
export async function getCertificates(resumeId: number): Promise<CertificateDTO[]> {
  const res = await apiClient.get(`/resume/${resumeId}/certificates`);
  return unwrap<CertificateDTO[]>(res);
}

export async function createCertificate(
  resumeId: number,
  body: {
    title: string;
    issueDate: string;
    description?: string | null;
    sortOrder?: number | null;
  }
): Promise<CertificateDTO> {
  const res = await apiClient.post(`/resume/${resumeId}/certificates`, body);
  return unwrap<CertificateDTO>(res);
}

export async function updateCertificate(
  resumeId: number,
  id: number,
  body: {
    title: string;
    issueDate: string;
    description?: string | null;
    sortOrder?: number | null;
  }
): Promise<CertificateDTO> {
  const res = await apiClient.put(`/resume/${resumeId}/certificates/${id}`, body);
  return unwrap<CertificateDTO>(res);
}

export async function deleteCertificate(resumeId: number, id: number): Promise<void> {
  await apiClient.delete(`/resume/${resumeId}/certificates/${id}`);
}

// ---------- Resume Skills ----------
export interface ResumeSkillDTO {
  skillId: number;
  skillName: string;
  level?: string | null;
}

export async function getResumeSkills(resumeId: number): Promise<ResumeSkillDTO[]> {
  const res = await apiClient.get(`/resume/${resumeId}/skills`);
  return unwrap<ResumeSkillDTO[]>(res);
}

export async function addResumeSkill(
  resumeId: number,
  body: { skillId: number; level?: string | null }
): Promise<ResumeSkillDTO> {
  const res = await apiClient.post(`/resume/${resumeId}/skills`, body);
  return unwrap<ResumeSkillDTO>(res);
}

export async function removeResumeSkill(resumeId: number, skillId: number): Promise<void> {
  await apiClient.delete(`/resume/${resumeId}/skills/${skillId}`);
}
