import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { HandbookCategoryNav } from '@/components/handbook/HandbookCategoryNav';
import { HandbookPostCard } from '@/components/handbook/HandbookPostCard';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { HANDBOOK_ALL_LIST_SLUG, getHandbookCategoryLabel } from '@/constants/handbookCategories';
import { useHandbookList } from '@/modules/handbook/hooks';
import { useState, useEffect } from 'react';

export function HandbookCategoryPage() {
  const { categorySlug = '' } = useParams<{ categorySlug: string }>();
  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    setPage(1);
  }, [categorySlug]);

  const categoryKey =
    categorySlug === HANDBOOK_ALL_LIST_SLUG || !categorySlug ? undefined : categorySlug;

  const { data, isLoading } = useHandbookList(page, pageSize, categoryKey);

  const label = getHandbookCategoryLabel(
    categorySlug === HANDBOOK_ALL_LIST_SLUG || !categorySlug ? '' : categorySlug
  );

  return (
    <AppLayout>
      <div className="bg-gray-50 pb-16 pt-3">
        <div className="container mx-auto max-w-6xl px-4">
          <nav className="mb-4 text-sm text-gray-600">
            <Link to="/cam-nang-viec-lam" className="hover:text-primary">
              Cẩm nang việc làm
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-gray-900">{label}</span>
          </nav>

          <HandbookCategoryNav />

          <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
            <div className="relative h-[220px] w-full overflow-hidden bg-[#0b2f94] md:h-[320px]">
              <img
                src="/images/cam-nang-viec-lam-banner.jpg"
                alt=""
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

          <section className="mt-10">
            <h1 className="mb-6 text-2xl font-bold text-gray-900">{label}</h1>
            {isLoading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {(data?.items ?? []).map((post) => (
                    <HandbookPostCard key={post.postId} post={post} />
                  ))}
                </div>
                {data && data.items.length === 0 && (
                  <p className="py-12 text-center text-gray-500">Chưa có bài trong mục này.</p>
                )}
                {data && data.totalCount > pageSize && (
                  <div className="mt-8 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Trước
                    </Button>
                    <span className="flex items-center px-3 text-sm text-gray-600">
                      Trang {page}
                    </span>
                    <Button
                      variant="outline"
                      disabled={!data.hasNext}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Sau
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
