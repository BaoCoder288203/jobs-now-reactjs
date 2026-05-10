function formatLocalYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Ngày lịch YYYY-MM-DD theo timezone local (để so sánh với input type="date"). */
export function toLocalDateKey(isoDateString: string): string {
  const d = new Date(isoDateString);
  if (Number.isNaN(d.getTime())) return '';
  return formatLocalYmd(d);
}

/** YYYY-MM-DD local từ giá trị ngày API (chuỗi ISO, epoch, mảng datetime Java, …). */
export function toLocalCalendarDateKey(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'number' && !Number.isNaN(value)) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '' : formatLocalYmd(d);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '';
    const normalized = trimmed.includes('T')
      ? trimmed
      : trimmed.replace(/^(\d{4}-\d{2}-\d{2})[ T](\d)/, '$1T$2');
    const d = new Date(normalized);
    return Number.isNaN(d.getTime()) ? '' : formatLocalYmd(d);
  }
  if (Array.isArray(value) && value.length >= 3) {
    const [y, mo, day, h = 0, min = 0, sec = 0, nano = 0] = value.map((n) => Number(n));
    const ms = typeof nano === 'number' ? Math.floor(nano / 1e6) : 0;
    const d = new Date(y, mo - 1, day, h, min, sec, ms);
    return Number.isNaN(d.getTime()) ? '' : formatLocalYmd(d);
  }
  return '';
}
