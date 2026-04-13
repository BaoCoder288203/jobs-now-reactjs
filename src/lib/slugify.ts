export function slugify(input: string): string {
  if (input == null || input.trim() === '') {
    return '';
  }
  const normalized = input.trim().normalize('NFD');
  const noMarks = normalized.replace(/\p{M}/gu, '');
  const lower = noMarks.toLowerCase();
  let slug = lower.replace(/[^a-z0-9-]+/g, '-');
  slug = slug.replace(/-+/g, '-').replace(/^-|-$/g, '');
  return slug || '';
}
