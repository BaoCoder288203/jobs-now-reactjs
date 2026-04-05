const CV_HEADLINE_PREFIX = 'cv-headline:';

function buildHeadlineKey(resumeId: number | string) {
  return `${CV_HEADLINE_PREFIX}${String(resumeId)}`;
}

function normalizeHeadline(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim();
}

export function getStoredCVHeadline(resumeId?: number | string | null): string {
  if (resumeId == null || resumeId === '') return '';
  if (typeof window === 'undefined') return '';

  const raw = window.localStorage.getItem(buildHeadlineKey(resumeId));
  return normalizeHeadline(raw);
}

export function setStoredCVHeadline(resumeId: number | string, headline: string): void {
  if (typeof window === 'undefined') return;

  const normalized = normalizeHeadline(headline);
  const key = buildHeadlineKey(resumeId);
  if (!normalized) {
    window.localStorage.removeItem(key);
    return;
  }

  window.localStorage.setItem(key, normalized);
}

export function removeStoredCVHeadline(resumeId?: number | string | null): void {
  if (resumeId == null || resumeId === '') return;
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(buildHeadlineKey(resumeId));
}