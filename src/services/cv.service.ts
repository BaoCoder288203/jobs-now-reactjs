import { apiClient } from './api';
import type { GenerateCVRequest, GenerateCVResponse } from './ai.service';

export { type GenerateCVRequest, type GenerateCVResponse } from './ai.service';

export async function generateCVWithAI(request: GenerateCVRequest): Promise<GenerateCVResponse> {
  const response = await apiClient.post('/api/ai/generate-cv', request);
  return response.data;
}

export async function createCV(
  profileId: number,
  resumeName: string
): Promise<{ resumeId: number }> {
  const response = await apiClient.post(`/resume/init/${profileId}`, { resumeName });
  return response.data;
}

export async function updateCVSummary(
  resumeId: number,
  resumeName: string,
  summary: string
): Promise<void> {
  await apiClient.put(`/resume/${resumeId}`, { resumeName, summary });
}
