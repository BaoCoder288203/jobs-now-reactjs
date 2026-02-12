import type { ExtractedCVData } from '@/types';
import { USE_MOCK } from './api';
import * as mockCv from '@/mocks/handlers/cv.mock';
import { apiClient } from './api';

export interface AIGenerateInput {
  industry_id: string;
  target_position: string;
  years_experience: number;
  additional_info?: string;
}

export async function generateCVWithAI(
  userId: string,
  input: AIGenerateInput
): Promise<ExtractedCVData> {
  if (USE_MOCK) {
    return mockCv.mockGenerateCVWithAI(userId, input);
  }
  const response = await apiClient.post('/cv/ai-generate', { user_id: userId, ...input });
  return response.data;
}

export async function createCV(
  userId: string,
  cvData: ExtractedCVData,
  resumeName: string,
  isAiGenerated: boolean
): Promise<{ file_url: string; resume_id: string }> {
  if (USE_MOCK) {
    return mockCv.mockCreateCV(userId, cvData, resumeName, isAiGenerated);
  }
  const response = await apiClient.post('/cv/create', {
    user_id: userId,
    cv_data: cvData,
    resume_name: resumeName,
    is_ai_generated: isAiGenerated,
  });
  return response.data;
}

export async function updateCV(
  resumeId: string,
  cvData: ExtractedCVData
): Promise<{ file_url: string }> {
  if (USE_MOCK) {
    return mockCv.mockUpdateCV(resumeId, cvData);
  }
  const response = await apiClient.put(`/cv/${resumeId}`, { cv_data: cvData });
  return response.data;
}
