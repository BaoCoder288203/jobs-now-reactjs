import { useMutation, useQuery } from '@tanstack/react-query';
import * as aiService from '@/services/ai.service';
import type { GenerateCVRequest, ImproveCVRequest, JobMatchRequest } from '@/services/ai.service';

export function useGenerateCVWithAI() {
  return useMutation({
    mutationFn: (request: GenerateCVRequest) => aiService.generateCV(request),
  });
}

export function useImproveCVFromText() {
  return useMutation({
    mutationFn: (request: ImproveCVRequest) => aiService.improveCVFromText(request),
  });
}

export function useImproveCVFromFile() {
  return useMutation({
    mutationFn: ({ file, language }: { file: File; language?: 'auto' | 'vi' | 'en' }) =>
      aiService.improveCVFromFile(file, language ?? 'auto'),
  });
}

export function useCalculateJobMatch() {
  return useMutation({
    mutationFn: (request: JobMatchRequest) => aiService.calculateJobMatch(request),
  });
}

export function useMyMatches(profileId: number | undefined) {
  return useQuery({
    queryKey: ['ai', 'my-matches', profileId],
    queryFn: () => aiService.getMyMatches(profileId!),
    enabled: !!profileId,
  });
}

export function useMatchedCandidates(jobId: number | undefined) {
  return useQuery({
    queryKey: ['ai', 'candidates', jobId],
    queryFn: () => aiService.getMatchedCandidates(jobId!),
    enabled: !!jobId,
  });
}
