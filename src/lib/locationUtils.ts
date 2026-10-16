/** Nhãn khu vực ngắn cho card (Hà Nội / TP HCM) — heuristic từ chuỗi địa chỉ. */
export function formatRegionLabelFromLocation(location: string | undefined): string {
  if (!location?.trim()) return '—';
  const s = location.toLowerCase().replace(/\s+/g, ' ').trim();

  if (
    /hồ\s*chí\s*minh|tp\.?\s*hcm|tp\s*hcm|hcm\b|sài\s*gòn|sai\s*gon|ho\s*chi\s*minh/.test(s) ||
    s.includes('tp.hcm') ||
    s === 'hcm'
  ) {
    return 'TP HCM';
  }
  if (/hà\s*nội|ha\s*noi|ha\s*noi|hn\b/.test(s) || s.includes('hanoi')) {
    return 'Hà Nội';
  }

  const parts = location.split(',').map((p) => p.trim()).filter(Boolean);
  const last = parts[parts.length - 1];
  return last ?? location.trim();
}
