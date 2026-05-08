import { apiClient } from './api';

export interface AiSearchRequest {
  query: string;
  topK?: number;
  jobId?: number;
}

export interface CandidateMatch {
  profileId: number;
  fullName: string;
  email: string;
  title: string;
  avatarUrl: string;
  skills: string[];
  experience: string;
  relevanceScore: number;
  matchReason: string;
}

export interface AiSearchResponse {
  answer: string;
  candidates: CandidateMatch[];
}

export const ragService = {
  searchCandidates: async (request: AiSearchRequest): Promise<AiSearchResponse> => {
    return apiClient.post('/api/ai/rag/search', request);
  },

  indexAllProfiles: async (): Promise<{ message: string }> => {
    return apiClient.post('/api/ai/rag/index/all');
  },

  indexProfile: async (profileId: number): Promise<{ message: string }> => {
    return apiClient.post(`/api/ai/rag/index/${profileId}`);
  },
};
