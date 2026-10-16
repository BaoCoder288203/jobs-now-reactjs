export const SOCIAL_PLATFORM_OPTIONS = [
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'TWITTER', label: 'Twitter / X' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'TIKTOK', label: 'TikTok' },
  { value: 'ZALO', label: 'Zalo' },
  { value: 'GITHUB', label: 'GitHub' },
  { value: 'OTHER', label: 'Khác' },
] as const;

export type SocialPlatformValue = (typeof SOCIAL_PLATFORM_OPTIONS)[number]['value'];

export interface SocialLinkFormRow {
  platform: string;
  url: string;
  logo_url?: string;
}
