const CV_AVATAR_PREFIX = 'cv-avatar:';

function buildAvatarKey(resumeId: number | string) {
  return `${CV_AVATAR_PREFIX}${String(resumeId)}`;
}

export function getStoredCVAvatar(resumeId?: number | string | null) {
  if (resumeId == null || resumeId === '') return null;
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(buildAvatarKey(resumeId));
}

function removeOtherStoredCvAvatars(keepKey: string) {
  if (typeof window === 'undefined') return;
  const keysToRemove: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key) continue;
    if (!key.startsWith(CV_AVATAR_PREFIX)) continue;
    if (key === keepKey) continue;
    keysToRemove.push(key);
  }
  for (const key of keysToRemove) {
    window.localStorage.removeItem(key);
  }
}

export function setStoredCVAvatar(resumeId: number | string, avatarDataUrl: string): boolean {
  if (typeof window === 'undefined') return false;
  const key = buildAvatarKey(resumeId);

  try {
    window.localStorage.setItem(key, avatarDataUrl);
    return true;
  } catch {
    removeOtherStoredCvAvatars(key);
    try {
      window.localStorage.setItem(key, avatarDataUrl);
      return true;
    } catch {
      return false;
    }
  }
}

export function removeStoredCVAvatar(resumeId?: number | string | null) {
  if (resumeId == null || resumeId === '') return;
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(buildAvatarKey(resumeId));
}
