import type { ExtractedCVData } from '@/types';

export interface CVTemplateProps {
  data: ExtractedCVData;
  palette: {
    accent: string;
    accentSoft: string;
    title: string;
    text: string;
    muted: string;
    chipBg: string;
    chipBorder: string;
    sidebarBg: string;
    sidebarText: string;
  };
  l: {
    experience: string;
    education: string;
    skills: string;
    projects: string;
    certificates: string;
    languages: string;
    present: string;
    technology: string;
    downloadPdf: string;
    contact: string;
    summary: string;
  };
  avatarLoadFailed: boolean;
  setAvatarLoadFailed: (val: boolean) => void;
}

export function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '').trim();
  if (normalized.length !== 6) return null;
  const value = Number.parseInt(normalized, 16);
  if (Number.isNaN(value)) return null;
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number) {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function mixHex(colorA: string, colorB: string, ratio: number) {
  const a = hexToRgb(colorA);
  const b = hexToRgb(colorB);
  if (!a || !b) return colorA;
  const r = Math.round(a.r * (1 - ratio) + b.r * ratio);
  const g = Math.round(a.g * (1 - ratio) + b.g * ratio);
  const bl = Math.round(a.b * (1 - ratio) + b.b * ratio);
  return rgbToHex(r, g, bl);
}

const PLACEHOLDER_VALUES = new Set(['n/a', 'na', 'null', 'undefined', '-', '']);

export function normalizeText(value?: string) {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return '';
  return PLACEHOLDER_VALUES.has(trimmed.toLowerCase()) ? '' : trimmed;
}

export function getInitials(name: string) {
  const parts = name
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return 'CV';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

export function htmlToPlainText(value?: string) {
  const source = value ?? '';
  if (!source.trim()) return '';

  return source
    .replace(/<br\s*\/?>(\s*)/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function toBulletLines(value?: string) {
  const plain = htmlToPlainText(value);
  if (!plain) return [];

  return plain
    .split('\n')
    .flatMap((line) => line.split(/\s+[•\-–—]\s+/g))
    .map((line) => line.replace(/^(?:[•\-–—]\s*)+/, '').trim())
    .filter(Boolean);
}

export type CertificateLike = string | { name?: string; issuer?: string; issue_date?: string };

export function parseCertificate(cert: CertificateLike) {
  if (typeof cert === 'string') {
    const plain = htmlToPlainText(cert);
    const parts = plain.split(/\s+—\s+/g).map((part) => normalizeText(part)).filter(Boolean);
    if (parts.length >= 3) {
      return {
        name: parts[0] ?? '',
        issuer: parts.slice(1, -1).join(' — '),
        issueDate: parts[parts.length - 1] ?? '',
      };
    }
    return {
      name: parts[0] ?? plain,
      issuer: parts.slice(1).join(' — '),
      issueDate: '',
    };
  }

  return {
    name: normalizeText(cert.name),
    issuer: normalizeText(cert.issuer),
    issueDate: normalizeText(cert.issue_date),
  };
}

export function toTimeline(duration?: string, startDate?: string, endDate?: string, presentLabel = 'Present') {
  const normalizedDuration = normalizeText(duration);
  if (normalizedDuration) return normalizedDuration;

  const start = normalizeText(startDate);
  const end = normalizeText(endDate);
  if (!start && !end) return '';
  if (start && !end) return `${start} - ${presentLabel}`;
  if (!start && end) return end;
  return `${start} - ${end}`;
}

export function isMeaningfulCompany(value?: string) {
  const normalized = normalizeText(value).toLowerCase();
  if (!normalized) return false;
  return normalized !== 'internship' && normalized !== 'current position' && normalized !== 'present';
}
