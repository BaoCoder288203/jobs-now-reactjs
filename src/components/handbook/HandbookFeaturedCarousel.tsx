import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HandbookPostCard } from './HandbookPostCard';
import type { HandbookPost } from '@/types/handbook';

interface Props {
  posts: HandbookPost[];
  isLoading?: boolean;
}

export function HandbookFeaturedCarousel({ posts, isLoading }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const delta = Math.min(el.clientWidth * 0.85, 400);
    el.scrollBy({ left: dir === 'left' ? -delta : delta, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-80 w-72 shrink-0 animate-pulse rounded-xl bg-gray-200" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return <p className="py-8 text-center text-gray-500">Chưa có bài nổi bật.</p>;
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="absolute left-1 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full border border-white/70 bg-gradient-to-b from-white to-slate-50 text-slate-700 shadow-[0_8px_24px_rgba(2,6,23,0.18)] transition-all hover:scale-105 hover:border-primary/30 hover:text-primary hover:shadow-[0_12px_36px_rgba(2,6,23,0.24)]"
        onClick={() => scroll('left')}
        aria-label="Trước"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-10 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {posts.map((post) => (
          <div key={post.postId} className="w-[85vw] shrink-0 snap-start sm:w-80 md:w-72">
            <HandbookPostCard post={post} />
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="absolute right-1 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full border border-white/70 bg-gradient-to-b from-white to-slate-50 text-slate-700 shadow-[0_8px_24px_rgba(2,6,23,0.18)] transition-all hover:scale-105 hover:border-primary/30 hover:text-primary hover:shadow-[0_12px_36px_rgba(2,6,23,0.24)]"
        onClick={() => scroll('right')}
        aria-label="Sau"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
