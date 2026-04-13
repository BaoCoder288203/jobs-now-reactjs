import { Link, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getHandbookCategoryLabel } from '@/constants/handbookCategories';
import { useHandbookDetail, useHandbookList } from '@/modules/handbook/hooks';
import { useJobs } from '@/modules/jobs/hooks';
import { RichTextContent } from '@/components/ui/RichTextContent';
import { HandbookPostCard } from '@/components/handbook/HandbookPostCard';
import { RelatedJobCard } from '@/components/jobs/RelatedJobCard';
import type { HandbookPost, HandbookPostDetail } from '@/types/handbook';
import type { Job } from '@/types';
import { cn } from '@/lib/utils';

function formatPostDate(iso?: string | null) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('vi-VN');
  } catch {
    return '';
  }
}

function HandbookSidebarPostItem({ post, className }: { post: HandbookPost; className?: string }) {
  const href = `/cam-nang-viec-lam/bai-viet/${encodeURIComponent(post.slug)}`;
  return (
    <Link
      to={href}
      className={cn(
        'group flex gap-3 rounded-lg border border-gray-100 bg-white p-2 shadow-sm transition hover:border-primary/30 hover:shadow',
        className,
      )}
    >
      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
        {post.featuredImageUrl ? (
          <img src={post.featuredImageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-gray-400">Ảnh</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 group-hover:text-primary">
          {post.title}
        </p>
        <p className="mt-1 text-xs text-gray-500">{formatPostDate(post.publishedAt)}</p>
      </div>
    </Link>
  );
}

function hotJobRank(job: Job): number {
  const tag = job.hotTag;
  let bonus = 0;
  if (tag === 'SUPER_HOT') bonus = 1000;
  else if (tag === 'HOT') bonus = 100;
  const score = (job.finalScore ?? 0) + (job.boostScore ?? 0) * 0.01;
  return bonus + score;
}

function pickHotJobs(jobs: Job[], limit: number): Job[] {
  return [...jobs].sort((a, b) => hotJobRank(b) - hotJobRank(a)).slice(0, limit);
}

function HandbookPostDetailBody({ post }: { post: HandbookPostDetail }) {
  const { data: latestPage } = useHandbookList(1, 12);
  const { data: sameCategoryPage } = useHandbookList(1, 16, post.categoryKey);
  const { data: mixedPage } = useHandbookList(1, 36);
  const { data: jobsPage } = useJobs({ limit: 40 });

  const latestFive = useMemo(() => {
    const items = latestPage?.items ?? [];
    return items.filter((p) => p.slug !== post.slug).slice(0, 5);
  }, [latestPage?.items, post.slug]);

  const sameCategoryFive = useMemo(() => {
    const items = sameCategoryPage?.items ?? [];
    return items.filter((p) => p.slug !== post.slug).slice(0, 5);
  }, [sameCategoryPage?.items, post.slug]);

  const otherCategoryFive = useMemo(() => {
    const items = mixedPage?.items ?? [];
    const ck = post.categoryKey;
    return items.filter((p) => p.slug !== post.slug && p.categoryKey !== ck).slice(0, 5);
  }, [mixedPage?.items, post.slug, post.categoryKey]);

  const hotJobsFive = useMemo(() => pickHotJobs(jobsPage?.items ?? [], 5), [jobsPage?.items]);

  const catLabel = getHandbookCategoryLabel(post.categoryKey);
  const date =
    post.publishedAt &&
    new Date(post.publishedAt).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });

  return (
    <article className="bg-white pb-16 pt-4">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)] lg:items-start lg:gap-8 xl:gap-10">
          <div className="min-w-0">
            <nav className="mb-6 text-sm text-gray-600">
              <Link to="/cam-nang-viec-lam" className="hover:text-primary">
                Cẩm nang việc làm
              </Link>
              <span className="mx-2">/</span>
              <Link
                to={`/cam-nang-viec-lam/${encodeURIComponent(post.categoryKey)}`}
                className="hover:text-primary"
              >
                {catLabel}
              </Link>
              <span className="mx-2">/</span>
              <span className="font-medium text-gray-900 line-clamp-1">{post.title}</span>
            </nav>

            {post.featuredImageUrl && (
              <div className="mb-8 overflow-hidden rounded-xl">
                <img src={post.featuredImageUrl} alt="" className="max-h-[420px] w-full object-cover" />
              </div>
            )}

            <p className="text-sm font-semibold uppercase text-primary">{catLabel}</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">{post.title}</h1>

            <div className="mt-6 flex items-center gap-3 border-b border-gray-100 pb-6">
              {post.companyLogoUrl ? (
                <img src={post.companyLogoUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-medium">
                  {post.companyName?.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{post.companyName}</p>
                {date && <p className="text-sm text-gray-500">Đăng ngày: {date}</p>}
              </div>
            </div>

            {post.excerpt && (
              <p className="mt-8 text-lg leading-relaxed text-gray-700">{post.excerpt}</p>
            )}

            {post.content &&
              (post.content.includes('<') ? (
                <RichTextContent html={post.content} className="mt-8 max-w-none" />
              ) : (
                <p className="mt-8 whitespace-pre-wrap text-gray-800">{post.content}</p>
              ))}
          </div>

          <aside className="flex min-w-0 flex-col gap-8 lg:sticky lg:top-24">
            <section aria-labelledby="hb-sidebar-latest">
              <h2 id="hb-sidebar-latest" className="text-base font-bold text-gray-900">
                Tin mới nhất
              </h2>
              <ul className="mt-4 flex flex-col gap-3">
                {latestFive.length === 0 ? (
                  <li className="text-sm text-gray-500">Chưa có tin khác.</li>
                ) : (
                  latestFive.map((p) => (
                    <li key={p.postId}>
                      <HandbookSidebarPostItem post={p} />
                    </li>
                  ))
                )}
              </ul>
            </section>

            <section aria-labelledby="hb-sidebar-hot-jobs">
              <h2 id="hb-sidebar-hot-jobs" className="text-base font-bold text-gray-900">
                Việc làm hot
              </h2>
              <ul className="mt-4 flex flex-col gap-3">
                {hotJobsFive.length === 0 ? (
                  <li className="text-sm text-gray-500">Đang cập nhật.</li>
                ) : (
                  hotJobsFive.map((job) => <RelatedJobCard key={job.id} job={job} />)
                )}
              </ul>
            </section>
          </aside>
        </div>
      </div>

      <section className="border-t border-gray-100 bg-gray-50/80" aria-labelledby="hb-related-same">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="grid gap-10 md:grid-cols-2 md:gap-8 lg:gap-12">
            <div className="min-w-0 text-left">
              <h2 id="hb-related-same" className="text-xl font-bold text-gray-900">
                Bài viết cùng chuyên mục
              </h2>
              <p className="mt-1 text-sm text-gray-600">{catLabel}</p>
              <div className="mt-6 flex flex-col gap-4">
                {sameCategoryFive.length === 0 ? (
                  <p className="text-sm text-gray-500">Chưa có bài khác trong chuyên mục này.</p>
                ) : (
                  sameCategoryFive.map((p) => <HandbookPostCard key={p.postId} post={p} />)
                )}
              </div>
            </div>

            <div className="min-w-0 text-left">
              <h2 className="text-xl font-bold text-gray-900">Bài viết khác chuyên mục</h2>
              <p className="mt-1 text-sm text-gray-600">Gợi ý thêm từ các chuyên mục khác</p>
              <div className="mt-6 flex flex-col gap-4">
                {otherCategoryFive.length === 0 ? (
                  <p className="text-sm text-gray-500">Chưa có gợi ý.</p>
                ) : (
                  otherCategoryFive.map((p) => <HandbookPostCard key={p.postId} post={p} />)
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}

export function HandbookPostDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { data: post, isLoading, isError } = useHandbookDetail(slug);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  if (isError || !post) {
    return (
      <AppLayout>
        <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="text-gray-600">Không tìm thấy bài viết.</p>
          <Link to="/cam-nang-viec-lam" className="mt-4 inline-block text-primary hover:underline">
            Về Cẩm nang việc làm
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <HandbookPostDetailBody post={post} />
    </AppLayout>
  );
}
