import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { HandbookCategoryNav } from '@/components/handbook/HandbookCategoryNav';
import { HandbookPostCard } from '@/components/handbook/HandbookPostCard';
import { HandbookFeaturedCarousel } from '@/components/handbook/HandbookFeaturedCarousel';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { HANDBOOK_ALL_LIST_SLUG, getHandbookCategoryLabel } from '@/constants/handbookCategories';
import { useHandbookExplore, useHandbookFeatured } from '@/modules/handbook/hooks';

function formatDate(iso?: string | null) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('vi-VN');
  } catch {
    return '';
  }
}

export function HandbookHubPage() {
  const featured = useHandbookFeatured(12);
  const explore = useHandbookExplore(9);
  const featuredPosts = featured.data ?? [];
  const leadPost = featuredPosts[0];
  const featuredCarouselPosts = featuredPosts.slice(1);

  return (
    <AppLayout>
      <div className="bg-gray-50 pb-16">
        <div className="container mx-auto max-w-6xl px-4">
          <HandbookCategoryNav />
        </div>

        <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
          <div className="relative h-[220px] w-full overflow-hidden bg-[#0b2f94] md:h-[320px]">
            <img
              src="/images/cam-nang-viec-lam-banner.jpg"
              alt="Cẩm nang việc làm"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <img
              src="/images/text-banner-image.png"
              alt=""
              className="absolute left-4 top-4 z-[2] w-[58%] max-w-[700px] object-contain md:left-[8%] md:top-7"
            />
            <img
              src="/images/Gemini_Generated_Image_rf7fi0rf7fi0rf7f-removebg-preview.png"
              alt=""
              className="absolute bottom-0 right-[3%] z-[2] h-[95%] object-contain"
            />
          </div>
        </div>

        {featured.isLoading ? (
          <div className="container mx-auto max-w-6xl px-4">
            <div className="relative z-20 -mt-8 flex justify-center md:-mt-10">
              <div className="w-full rounded-sm bg-white py-10 shadow-lg">
                <LoadingSpinner />
              </div>
            </div>
          </div>
        ) : leadPost ? (
          <div className="container mx-auto max-w-6xl px-4">
            <div className="relative z-20 -mt-8 md:-mt-10">
              <Link
                to={`/cam-nang-viec-lam/bai-viet/${encodeURIComponent(leadPost.slug)}`}
                className="grid overflow-hidden rounded-sm border border-gray-200 bg-white shadow-lg transition hover:shadow-xl md:grid-cols-[48%_1fr]"
              >
                <div className="aspect-[16/10] w-full bg-gray-100">
                  {leadPost.featuredImageUrl ? (
                    <img src={leadPost.featuredImageUrl} alt={leadPost.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">Không có ảnh</div>
                  )}
                </div>
                <div className="p-5 md:p-7">
                  <p className="text-sm font-semibold text-blue-700">
                    {getHandbookCategoryLabel(leadPost.categoryKey)}
                  </p>
                  <h2 className="mt-2 line-clamp-2 text-3xl font-bold leading-tight text-gray-900">
                    {leadPost.title}
                  </h2>
                  {leadPost.excerpt ? (
                    <p className="mt-3 line-clamp-3 text-base text-gray-600">{leadPost.excerpt}</p>
                  ) : null}
                  <div className="mt-6 flex items-center gap-3">
                    {leadPost.companyLogoUrl ? (
                      <img
                        src={leadPost.companyLogoUrl}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
                        {leadPost.companyName?.charAt(0) ?? '?'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{leadPost.companyName}</p>
                      <p className="text-sm text-gray-500">Đăng ngày: {formatDate(leadPost.publishedAt) || '—'}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        ) : null}

        <div className="container mx-auto max-w-6xl px-4">
          <section className="mt-10">
            <div className="mb-4 flex items-center gap-3 border-l-4 border-primary pl-3">
              <h2 className="text-2xl font-bold text-gray-900">Tin nổi bật</h2>
            </div>
            {featured.isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : (
              <HandbookFeaturedCarousel posts={featuredCarouselPosts} />
            )}
          </section>

          <section className="mt-14">
            <div className="mb-6 flex flex-col gap-4 border-l-4 border-primary pl-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Cẩm nang việc làm</h2>
              <Link
                to={`/cam-nang-viec-lam/${HANDBOOK_ALL_LIST_SLUG}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary underline underline-offset-4 transition hover:text-primary/80"
              >
                Xem thêm
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {explore.isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {(explore.data ?? []).map((post) => (
                  <HandbookPostCard key={post.postId} post={post} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
