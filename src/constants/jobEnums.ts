function normalizeJobTypeKey(value: string | undefined): string {
  if (!value) return '';
  return value.toUpperCase().replace(/-/g, '_');
}

function normalizeEducationKey(value: string | undefined): string {
  if (!value) return '';
  return value.toUpperCase().replace(/-/g, '_');
}

export const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full time',
  PART_TIME: 'Part time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
};

export const EDUCATION_LEVEL_LABELS: Record<string, string> = {
  ANY: 'Any',
  HIGH_SCHOOL: 'High school',
  VOCATIONAL: 'Vocational',
  ASSOCIATE: 'Associate',
  BACHELOR: 'Bachelor',
  MASTER: 'Master',
  DOCTORATE: 'Doctorate',
  OTHER: 'Other',
};

export const JOB_TYPE_OPTIONS = [
  { value: 'full_time', label: JOB_TYPE_LABELS.FULL_TIME },
  { value: 'part_time', label: JOB_TYPE_LABELS.PART_TIME },
  { value: 'contract', label: JOB_TYPE_LABELS.CONTRACT },
  { value: 'internship', label: JOB_TYPE_LABELS.INTERNSHIP },
  { value: 'freelance', label: JOB_TYPE_LABELS.FREELANCE },
] as const;

export function getJobTypeLabel(value: string | undefined): string {
  const key = normalizeJobTypeKey(value);
  return (key && JOB_TYPE_LABELS[key]) || value || '';
}

export function getEducationLevelLabel(value: string | undefined): string {
  const key = normalizeEducationKey(value);
  return (key && EDUCATION_LEVEL_LABELS[key]) || value || '';
}
