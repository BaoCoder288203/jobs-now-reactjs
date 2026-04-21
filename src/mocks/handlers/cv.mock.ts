import type { ExtractedCVData, Resume } from '@/types';
import { delay } from './auth.mock';
import { getProfileByUserId, getSkillsByProfileId, mockResumes } from '../data/profiles.mock';

interface AIGenerateInput {
  industry_id: string;
  target_position: string;
  years_experience: number;
  additional_info?: string;
}

export async function mockGenerateCVWithAI(
  userId: string,
  input: AIGenerateInput
): Promise<ExtractedCVData> {
  await delay(1500);
  const profile = getProfileByUserId(userId);
  const skills = getSkillsByProfileId(profile?.id ?? '');

  return {
    headline: profile?.headline ?? `Ứng viên ${input.target_position}`,
    summary: profile?.summary ?? `Tôi có ${input.years_experience} năm kinh nghiệm trong lĩnh vực ${input.target_position}.`,
    work_experiences: [
      {
        company: 'Công ty mẫu',
        position: input.target_position,
        start_date: '2020-01',
        end_date: '2024-12',
        description: 'Mô tả công việc được AI tạo dựa trên thông tin đầu vào.',
      },
    ],
    educations: [
      {
        school: 'Đại học Công nghệ',
        major: 'Công nghệ thông tin',
        degree: 'Cử nhân',
        start_date: '2016',
        end_date: '2020',
      },
    ],
    skills: skills.map((ps) => ({ name: ps.skill?.name ?? '', level: ps.level })),
    projects: [],
    languages: [],
    certificates: [],
  };
}

export async function mockCreateCV(
  userId: string,
  cvData: ExtractedCVData,
  resumeName: string,
  isAiGenerated: boolean
): Promise<{ file_url: string; resume_id: string }> {
  await delay(800);
  const profile = getProfileByUserId(userId);
  if (!profile) throw new Error('Profile not found');

  const fileUrl = `/resumes/${userId}/${resumeName}`;
  const resumeIdStr = `resume-${Date.now()}`;
  const created_at = new Date().toISOString();
  const nextNumericId = Math.max(0, ...mockResumes.map((r) => r.resumeId)) + 1;
  const newResume: Resume = {
    resumeId: nextNumericId,
    resumeName,
    resumeUrl: fileUrl,
    uploadedAt: created_at,
    id: resumeIdStr,
    job_seeker_profile_id: profile.id,
    file_url: fileUrl,
    file_name: resumeName,
    is_default: mockResumes.length === 0,
    created_at,
    type: 'CREATED',
    is_ai_generated: isAiGenerated,
    extracted_text: JSON.stringify(cvData),
    profile,
  };
  mockResumes.push(newResume);

  return { file_url: fileUrl, resume_id: resumeIdStr };
}

export async function mockUpdateCV(
  resumeId: string,
  cvData: ExtractedCVData
): Promise<{ file_url: string }> {
  await delay(600);
  const resume = mockResumes.find((r) => r.id === resumeId);
  if (!resume) throw new Error('Resume not found');

  resume.extracted_text = JSON.stringify(cvData);
  resume.file_url = `/resumes/updated/${resumeId}.pdf`;

  return { file_url: resume.file_url };
}
