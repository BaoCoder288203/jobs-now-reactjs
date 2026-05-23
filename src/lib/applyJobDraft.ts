import type { UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { plainTextToTipTapHtml, htmlToPlainText } from '@/lib/htmlUtils';
import type { JobDraftSuggestion } from '@/services/ai.service';
import type { JobCategoryDTO } from '@/services/category.service';
import type { MajorDTO } from '@/services/major.service';
import type { Skill } from '@/types';

export type ApplyJobDraftResult = {
  appliedFields: string[];
  unmatchedSkills: string[];
  unmatchedMajors: string[];
  categoryMatched: boolean;
};

/** Fields AI may overwrite when title changes */
const AI_OVERWRITE_FIELDS = new Set([
  'description',
  'requirements',
  'benefits',
  'location',
  'job_type',
  'yearsOfExperience',
  'educationLevel',
  'salary_type',
  'salary_currency',
  'salary_min',
  'salary_max',
  'applicationLanguage',
  'genderRequirement',
  'category_id',
  'jobSkills',
  'majorIds',
]);

function normalize(s: string) {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function matchByName<T>(name: string, items: T[], getLabel: (x: T) => string): T | undefined {
  const n = normalize(name);
  return items.find((item) => {
    const label = normalize(getLabel(item));
    return label === n || label.includes(n) || n.includes(label);
  });
}

function isEmptyField(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'number') return false;
  if (typeof value === 'string') return !htmlToPlainText(value).trim();
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export function applyJobDraftToForm<T extends Record<string, unknown>>(opts: {
  draft: JobDraftSuggestion;
  setValue: UseFormSetValue<T>;
  getValues: UseFormGetValues<T>;
  /** When true, overwrite AI-managed fields even if already filled (title changed) */
  overwriteAiFields: boolean;
  categories: JobCategoryDTO[];
  skills: Skill[];
  majors: MajorDTO[];
}): ApplyJobDraftResult {
  const { draft, setValue, getValues, overwriteAiFields, categories, skills, majors } = opts;
  const applied: string[] = [];
  const unmatchedSkills: string[] = [];
  const unmatchedMajors: string[] = [];

  const setIf = (name: keyof T & string, value: unknown, label: string) => {
    if (value == null || value === '') return;
    const cur = getValues(name as never);
    const isAiField = AI_OVERWRITE_FIELDS.has(name);
    if (!overwriteAiFields && isAiField && !isEmptyField(cur)) return;
    if (!overwriteAiFields && !isAiField && !isEmptyField(cur)) return;
    setValue(name as never, value as never, { shouldDirty: true, shouldValidate: false });
    applied.push(label);
  };

  if (draft.description) {
    setIf('description', plainTextToTipTapHtml(draft.description), 'description');
  }
  if (draft.requirements) {
    setIf('requirements', plainTextToTipTapHtml(draft.requirements), 'requirements');
  }
  if (draft.benefits) {
    setIf('benefits', plainTextToTipTapHtml(draft.benefits), 'benefits');
  }
  setIf('location', draft.location, 'location');
  setIf('job_type', draft.jobType, 'job_type');
  setIf('yearsOfExperience', draft.yearsOfExperience, 'yearsOfExperience');
  setIf('educationLevel', draft.educationLevel, 'educationLevel');
  setIf('salary_type', draft.salaryType, 'salary_type');
  setIf('salary_currency', draft.salaryCurrency, 'salary_currency');
  if (draft.salaryMin != null) setIf('salary_min', draft.salaryMin, 'salary_min');
  if (draft.salaryMax != null) setIf('salary_max', draft.salaryMax, 'salary_max');
  setIf('applicationLanguage', draft.applicationLanguage, 'applicationLanguage');
  setIf('genderRequirement', draft.genderRequirement, 'genderRequirement');

  let categoryMatched = false;
  const categoryName = draft.suggestedCategoryName;
  if (categoryName && (overwriteAiFields || isEmptyField(getValues('category_id' as never)))) {
    const cat = matchByName(categoryName, categories, (c) => c.categoryName ?? '');
    if (cat?.categoryId != null) {
      setValue('category_id' as never, Number(cat.categoryId) as never, { shouldDirty: true });
      applied.push('category');
      categoryMatched = true;
    }
  }

  const skillItems = draft.suggestedSkills?.length
    ? draft.suggestedSkills
  : (draft.suggestedSkillNames ?? []).map((name) => ({ name, level: '', isRequired: true }));

  const currentJobSkills = getValues('jobSkills' as never) as unknown as
    | { skillId: number }[]
    | undefined;

  if (skillItems.length && (overwriteAiFields || !currentJobSkills?.length)) {
    const rows: { skillId: number; isRequired: boolean; level: string }[] = [];
    const used = new Set<number>();
    for (const item of skillItems) {
      const rawName = typeof item === 'string' ? item : item.name;
      if (!rawName?.trim()) continue;
      const hit = matchByName(rawName, skills, (s) => s.name ?? '');
      const id = hit ? Number(hit.skillId) : 0;
      const level = typeof item === 'string' ? '' : (item.level ?? '');
      const isRequired = typeof item === 'string' ? true : (item.isRequired ?? true);
      if (id > 0 && !used.has(id)) {
        used.add(id);
        rows.push({ skillId: id, isRequired, level: level.trim() });
      } else if (!hit) {
        unmatchedSkills.push(rawName);
      }
    }
    if (rows.length) {
      setValue('jobSkills' as never, rows as never, { shouldDirty: true });
      applied.push('jobSkills');
    }
  }

  const majorNames = draft.suggestedMajorNames ?? [];
  const currentMajorIds = getValues('majorIds' as never) as unknown as number[] | undefined;

  if (majorNames.length && (overwriteAiFields || !currentMajorIds?.length)) {
    const ids: number[] = overwriteAiFields ? [] : [...(currentMajorIds ?? [])];
    for (const raw of majorNames) {
      const hit = matchByName(raw, majors, (m) => m.name ?? '');
      const id = hit?.majorId ?? 0;
      if (id > 0 && !ids.includes(id)) {
        ids.push(id);
      } else if (!hit || id === 0) {
        unmatchedMajors.push(raw);
      }
    }
    if (ids.length > 0 || overwriteAiFields) {
      setValue('majorIds' as never, ids as never, { shouldDirty: true });
      if (ids.length) applied.push('majorIds');
    }
  }

  return { appliedFields: applied, unmatchedSkills, unmatchedMajors, categoryMatched };
}
