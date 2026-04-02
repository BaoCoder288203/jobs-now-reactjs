export type CVLanguageDraft = {
  name: string;
  proficiency: string;
};

const CV_LANGUAGE_PREFIX = 'cv-languages:';

function buildLanguageKey(resumeId: number | string) {
  return `${CV_LANGUAGE_PREFIX}${String(resumeId)}`;
}

function sanitizeLanguages(input: unknown): CVLanguageDraft[] {
  if (!Array.isArray(input)) return [];
  const normalized: CVLanguageDraft[] = [];
  for (const item of input) {
    if (!item || typeof item !== 'object') continue;
    const obj = item as { name?: unknown; proficiency?: unknown };
    const name = typeof obj.name === 'string' ? obj.name.trim() : '';
    if (!name) continue;
    const proficiency = typeof obj.proficiency === 'string' ? obj.proficiency.trim() : '';
    normalized.push({ name, proficiency });
  }
  return normalized;
}

export function getStoredCVLanguages(resumeId?: number | string | null): CVLanguageDraft[] {
  if (resumeId == null || resumeId === '') return [];
  if (typeof window === 'undefined') return [];

  const raw = window.localStorage.getItem(buildLanguageKey(resumeId));
  if (!raw) return [];

  try {
    return sanitizeLanguages(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function setStoredCVLanguages(resumeId: number | string, languages: CVLanguageDraft[]) {
  if (typeof window === 'undefined') return;
  const normalized = sanitizeLanguages(languages);
  window.localStorage.setItem(buildLanguageKey(resumeId), JSON.stringify(normalized));
}

export function removeStoredCVLanguages(resumeId?: number | string | null) {
  if (resumeId == null || resumeId === '') return;
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(buildLanguageKey(resumeId));
}
