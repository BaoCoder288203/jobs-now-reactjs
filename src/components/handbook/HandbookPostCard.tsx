import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getHandbookCategoryLabel } from '@/constants/handbookCategories';
import type { HandbookPost } from '@/types/handbook';

export interface HandbookPostCardProps {
  post: HandbookPost;
  className?: string;
}

function formatDate(iso?: string | null) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('vi-VN');
  } catch {
    return '';
  }
}

export function HandbookPostCard({ post, className }: HandbookPostCardProps) {
  const href = `/cam-nang-viec-lam/bai-viet/${encodeURIComponent(post.slug)}`;
  const catLabel = getHandbookCategoryLabel(post.categoryKey);

  return (
    <Link
      to={href}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-primary/40 hover:shadow-md',
        className
      )}
    >
      <div className="aspect-[16/10] w-full overflow-hidden bg-gray-100">
        {post.featuredImageUrl ? (
          <img
            src={post.featuredImageUrl}
            alt=""
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">Không có ảnh</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{catLabel}</p>
        <h3 className="mt-2 line-clamp-2 text-base font-bold text-gray-900 group-hover:text-primary">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-2 flex-1 text-sm text-gray-600">{post.excerpt}</p>
        )}
        <div className="mt-4 flex items-start gap-3 border-t border-gray-100 pt-3">
          {post.companyLogoUrl ? (
            <img
              src={post.companyLogoUrl}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
              {post.companyName?.charAt(0) ?? '?'}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">{post.companyName}</p>
            <p className="text-xs text-gray-500">Đăng ngày: {formatDate(post.publishedAt)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
