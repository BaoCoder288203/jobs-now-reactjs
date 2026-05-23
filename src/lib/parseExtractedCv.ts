import type { ExtractedCVData } from '@/types';

export function isParsedCvJson(extractedText?: string | null): boolean {
  if (!extractedText) return false;
  const trimmed = extractedText.trim();
  if (!trimmed.startsWith('{')) return false;
  return (
    trimmed.includes('work_experiences') ||
    trimmed.includes('workExperiences') ||
    trimmed.includes('"educations"') ||
    trimmed.includes('"skills"')
  );
}

/** Normalize AI/BE JSON (snake or camel) into ExtractedCVData shape for templates. */
export function normalizeExtractedCvData(raw: Record<string, unknown>): ExtractedCVData {
  const workRaw = (raw.work_experiences ?? raw.workExperiences ?? []) as ExtractedCVData['work_experiences'];
  const eduRaw = (raw.educations ?? []) as ExtractedCVData['educations'];
  const skillsRaw = (raw.skills ?? []) as ExtractedCVData['skills'];
  const projectsRaw = (raw.projects ?? []) as ExtractedCVData['projects'];
  const languagesRaw = (raw.languages ?? []) as ExtractedCVData['languages'];
  const certsRaw = (raw.certificates ?? []) as ExtractedCVData['certificates'];

  return {
    avatarUrl: (raw.avatarUrl as string) ?? undefined,
    fullName: (raw.fullName as string) ?? undefined,
    title: (raw.title as string) ?? undefined,
    email: (raw.email as string) ?? undefined,
    phone: (raw.phone as string) ?? undefined,
    address: (raw.address as string) ?? undefined,
    headline: (raw.headline as string) ?? undefined,
    summary: (raw.summary as string) ?? undefined,
    suggestedTemplateKey: (raw.suggestedTemplateKey as string) ?? undefined,
    work_experiences: Array.isArray(workRaw) ? workRaw : [],
    educations: Array.isArray(eduRaw) ? eduRaw : [],
    skills: Array.isArray(skillsRaw) ? skillsRaw : [],
    projects: Array.isArray(projectsRaw) ? projectsRaw : [],
    languages: Array.isArray(languagesRaw) ? languagesRaw : [],
    certificates: Array.isArray(certsRaw) ? certsRaw : [],
  };
}

export function parseExtractedCvData(extractedText?: string | null): ExtractedCVData | null {
  if (!isParsedCvJson(extractedText)) return null;
  try {
    const raw = JSON.parse(extractedText!) as Record<string, unknown>;
    return normalizeExtractedCvData(raw);
  } catch {
    return null;
  }
}

export function serializeExtractedCvData(data: ExtractedCVData): string {
  return JSON.stringify(data);
}
