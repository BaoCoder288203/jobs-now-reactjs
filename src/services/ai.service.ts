import { apiClient } from './api';

export interface ImproveCVRequest {
  cvText?: string;
  resumeId?: number;
  language?: 'auto' | 'vi' | 'en';
}

export interface SectionFeedback {
  section: string;
  score: number;
  issues: string[];
  suggestions: string[];
}

export interface ImproveCVResponse {
  overallScore: number;
  overviewFeedback: string;
  sections: SectionFeedback[];
  missingKeywords: string[];
  extractedSkills: string[];
  improvedSummary: string;
  actionItems: string[];
}

export interface JobMatchRequest {
  jobId: number;
  profileId?: number;
  resumeId?: number;
}

export interface JobMatchResponse {
  overallScore: number;
  skillMatchScore: number;
  experienceMatchScore: number;
  educationMatchScore: number;
  ruleBasedScore: number;
  aiSemanticScore: number;
  aiFeedback: string;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  jobTitle: string;
  companyName: string;
}

export interface GenerateCVRequest {
  profileId?: number;
  fullName?: string;
  title?: string;
  targetJob?: string;
  industry?: string;
  additionalInfo?: string;
  skills?: string[];
  experiences?: { company: string; title: string; duration: string; bullets: string[] }[];
  educations?: { school: string; degree: string; major: string; duration: string }[];
  certifications?: string[];
  projects?: { name: string; description: string; duration: string }[];
  language?: string;
}

export interface GenerateCVExperience {
  company: string;
  title: string;
  duration: string;
  bullets: string[];
}

export interface GenerateCVEducation {
  school: string;
  degree: string;
  major: string;
  duration: string;
}

export interface GenerateCVProject {
  name: string;
  description: string;
  duration: string;
}

export interface GenerateCVResponse {
  summary: string;
  experiences: GenerateCVExperience[];
  educations: GenerateCVEducation[];
  skillsSection: string;
  certifications: string[];
  projects: GenerateCVProject[];
  suggestedTemplateKey?: string;
}

export interface JobMatchScoreDTO {
  id: number;
  profileId: number;
  profileName: string;
  profileTitle: string;
  jobId: number;
  jobTitle: string;
  companyName: string;
  overallScore: number;
  skillMatchScore: number;
  aiSemanticScore: number;
  calculatedAt: string;
}

export async function improveCVFromText(request: ImproveCVRequest): Promise<ImproveCVResponse> {
  const response = await apiClient.post('/api/ai/improve-cv', request);
  return response.data;
}

export async function improveCVFromFile(file: File, language: 'auto' | 'vi' | 'en' = 'auto'): Promise<ImproveCVResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);
  const response = await apiClient.post('/api/ai/improve-cv/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function generateCV(request: GenerateCVRequest): Promise<GenerateCVResponse> {
  const response = await apiClient.post('/api/ai/generate-cv', request);
  return response.data;
}

export async function calculateJobMatch(request: JobMatchRequest): Promise<JobMatchResponse> {
  const response = await apiClient.post('/api/ai/job-match', request);
  return response.data;
}

export async function getMyMatches(profileId: number): Promise<JobMatchScoreDTO[]> {
  const response = await apiClient.get(`/api/ai/job-match/my-matches/${profileId}`);
  return response.data;
}

export async function getMatchedCandidates(jobId: number): Promise<JobMatchScoreDTO[]> {
  const response = await apiClient.get(`/api/ai/job-match/candidates/${jobId}`);
  return response.data;
}

export async function recalculateForProfile(profileId: number): Promise<void> {
  await apiClient.post(`/api/ai/job-match/recalculate/profile/${profileId}`);
}

export async function recalculateForJob(jobId: number): Promise<void> {
  await apiClient.post(`/api/ai/job-match/recalculate/job/${jobId}`);
}

export interface SuggestJobDraftRequest {
  title: string;
  locale?: 'vi' | 'en';
  categoryNames?: string[];
  skillNames?: string[];
  majorNames?: string[];
}

export interface SuggestedSkillItem {
  name: string;
  level?: string;
  isRequired?: boolean;
}

export interface JobDraftSuggestion {
  description?: string;
  requirements?: string;
  benefits?: string;
  location?: string;
  jobType?: string;
  yearsOfExperience?: string;
  educationLevel?: string;
  salaryType?: string;
  salaryCurrency?: string;
  salaryMin?: number;
  salaryMax?: number;
  applicationLanguage?: string;
  genderRequirement?: string;
  suggestedCategoryName?: string;
  suggestedSkills?: SuggestedSkillItem[];
  /** @deprecated use suggestedSkills */
  suggestedSkillNames?: string[];
  suggestedMajorNames?: string[];
}

export async function suggestJobDraft(request: SuggestJobDraftRequest): Promise<JobDraftSuggestion> {
  const response = await apiClient.post('/api/ai/suggest-job-draft', request);
  return (response as { data?: JobDraftSuggestion }).data ?? (response as JobDraftSuggestion);
}
