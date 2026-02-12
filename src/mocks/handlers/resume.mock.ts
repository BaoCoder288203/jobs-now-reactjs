import type { Resume } from '@/types';
import { delay } from './auth.mock';
import { 
  mockResumes, 
  getResumesByProfileId,
} from '../data/profiles.mock';
import { getProfileByUserId } from '../data/profiles.mock';

export async function mockGetResumes(userId: string): Promise<Resume[]> {
  await delay(400);
  
  const profile = getProfileByUserId(userId);
  if (!profile) {
    return [];
  }
  
  return getResumesByProfileId(profile.id);
}

export async function mockUploadResume(
  userId: string,
  file: File
): Promise<Resume> {
  await delay(800);
  
  const profile = getProfileByUserId(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  // Validate file type
  if (file.type !== 'application/pdf') {
    throw new Error('Only PDF files are allowed');
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size must be less than 5MB');
  }
  
  // Create a mock file URL (in real app, this would be uploaded to cloud storage)
  const fileUrl = `/resumes/${userId}/${file.name}`;
  
  // Check if user already has a default resume
  const existingResumes = getResumesByProfileId(profile.id);
  const hasDefault = existingResumes.some(r => r.is_default);
  
  const newResume: Resume = {
    id: `resume-${Date.now()}`,
    job_seeker_profile_id: profile.id,
    file_url: fileUrl,
    file_name: file.name,
    is_default: !hasDefault, // First resume is default
    created_at: new Date().toISOString(),
    type: 'UPLOADED',
    is_ai_generated: false,
    extracted_text: JSON.stringify({
      headline: '',
      summary: `CV được trích xuất từ file ${file.name}`,
      work_experiences: [],
      educations: [],
      skills: [],
    }),
    profile
  };
  
  // In real app, this would be saved to database
  mockResumes.push(newResume);
  
  return newResume;
}

export async function mockSetDefaultResume(
  userId: string,
  resumeId: string
): Promise<Resume> {
  await delay(400);
  
  const profile = getProfileByUserId(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  const resumes = getResumesByProfileId(profile.id);
  
  // Remove default from all resumes
  resumes.forEach(r => {
    if (r.id === resumeId) {
      r.is_default = true;
    } else {
      r.is_default = false;
    }
  });
  
  const resume = resumes.find(r => r.id === resumeId);
  if (!resume) {
    throw new Error('Resume not found');
  }
  
  return resume;
}

export async function mockDeleteResume(
  userId: string,
  resumeId: string
): Promise<void> {
  await delay(400);
  
  const profile = getProfileByUserId(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  const resumes = getResumesByProfileId(profile.id);
  const resume = resumes.find(r => r.id === resumeId);
  
  if (!resume) {
    throw new Error('Resume not found');
  }
  
  if (resume.is_default && resumes.length > 1) {
    throw new Error('Cannot delete default resume. Please set another resume as default first.');
  }
  
  // In real app, this would delete from database
  const index = mockResumes.findIndex(r => r.id === resumeId);
  if (index > -1) {
    mockResumes.splice(index, 1);
  }
}

