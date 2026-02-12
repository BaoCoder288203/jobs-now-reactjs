import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ExtractedCVData } from '@/types';
import type { AIGenerateInput } from '@/services/cv.service';
import * as cvService from '@/services/cv.service';
import { resumeKeys } from '@/modules/resumes/hooks';

export function useGenerateCVWithAI() {
  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: AIGenerateInput }) =>
      cvService.generateCVWithAI(userId, input),
  });
}

export function useCreateCV() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      cvData,
      resumeName,
      isAiGenerated,
    }: {
      userId: string;
      cvData: ExtractedCVData;
      resumeName: string;
      isAiGenerated: boolean;
    }) => cvService.createCV(userId, cvData, resumeName, isAiGenerated),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.list(variables.userId) });
    },
  });
}

export function useUpdateCV() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ resumeId, cvData }: { resumeId: string; cvData: ExtractedCVData }) =>
      cvService.updateCV(resumeId, cvData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeKeys.all });
    },
  });
}
