import { Link } from 'react-router-dom';
import { HandbookPostCard } from '@/components/handbook/HandbookPostCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { useHandbookFeatured } from '@/modules/handbook/hooks';

export function HandbookTeaserSection() {
  const { data, isLoading } = useHandbookFeatured(8);

  return (
    <section className="border-t border-gray-200 bg-white py-14">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Cẩm nang tìm việc</h2>
          <Button asChild variant="link" className="text-primary">
            <Link to="/cam-nang-viec-lam">Xem tất cả &gt;</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 lg:grid-cols-4 md:overflow-visible">
            {(data ?? []).slice(0, 8).map((post) => (
              <div key={post.postId} className="w-[280px] shrink-0 md:w-auto">
                <HandbookPostCard post={post} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
