/** First item "Tất cả" — hub index; `tat-ca` = full list with paging (Xem thêm). */
export const HANDBOOK_ALL_LIST_SLUG = 'tat-ca';

export interface HandbookCategoryItem {
  label: string;
  slug: string;
}

/** Horizontal scroll row (except "more" dropdown). */
export const HANDBOOK_SCROLL_CATEGORIES: HandbookCategoryItem[] = [
  { label: 'Tất cả', slug: '' },
  { label: 'Kể Câu Chuyện Nghề', slug: 'ke-cau-chuyen-nghe' },
  { label: 'Viết CV / Resume', slug: 'viet-cv-resume' },
  { label: 'Tư vấn nghề nghiệp', slug: 'tu-van-nghe-nghiep' },
  { label: 'Trước suy nghĩ về thay đổi công việc', slug: 'truoc-suy-nghi-thay-doi-cong-viec' },
  { label: 'Tin tức việc làm', slug: 'tin-tuc-viec-lam' },
  { label: 'Tìm việc', slug: 'tim-viec' },
  { label: 'TikTok Video', slug: 'tiktok-video' },
];

/** Fixed "..." dropdown — bottom of section 1. */
export const HANDBOOK_MORE_CATEGORIES: HandbookCategoryItem[] = [
  { label: 'Sự Nghiệp Thăng Tiến', slug: 'su-nghiep-thang-tien' },
  { label: 'Phỏng vấn việc làm', slug: 'phong-van-viec-lam' },
  { label: 'Mẫu đơn xin việc', slug: 'mau-don-xin-viec' },
  { label: 'Luật Lao động', slug: 'luat-lao-dong' },
  { label: 'Luật Doanh nghiệp', slug: 'luat-doanh-nghiep' },
  { label: 'Kiến thức kinh tế', slug: 'kien-thuc-kinh-te' },
  { label: 'Góc kỹ năng', slug: 'goc-ky-nang' },
  { label: 'Đổi nghề', slug: 'doi-nghe' },
  { label: 'Định hướng nghề nghiệp', slug: 'dinh-huong-nghe-nghiep' },
  { label: 'Biểu mẫu Hành chính nhân sự', slug: 'bieu-mau-hanh-chinh-nhan-su' },
  { label: 'Bài học thành công', slug: 'bai-hoc-thanh-cong' },
];

/** All slugs valid for `categoryKey` when creating a post (excludes empty “Tất cả”). */
export const HANDBOOK_CATEGORY_OPTIONS: HandbookCategoryItem[] = [
  ...HANDBOOK_SCROLL_CATEGORIES.filter((c) => c.slug !== ''),
  ...HANDBOOK_MORE_CATEGORIES,
];

export function getHandbookCategoryLabel(slug: string): string {
  if (slug === HANDBOOK_ALL_LIST_SLUG || slug === '') return 'Tất cả';
  const combined = [...HANDBOOK_SCROLL_CATEGORIES, ...HANDBOOK_MORE_CATEGORIES];
  return combined.find((c) => c.slug === slug)?.label ?? slug;
}
