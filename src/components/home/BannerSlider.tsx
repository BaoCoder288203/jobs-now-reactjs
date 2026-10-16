import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import { useFeaturedBanners } from '@/modules/companies/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { Company } from '@/types';

const AUTOPLAY_INTERVAL_MS = 6000;

export function BannerSlider() {
  const { data: items = [], isLoading } = useFeaturedBanners(8);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const len = items.length;
  const go = useCallback((i: number) => {
    setIndex((prev) => (len <= 1 ? 0 : ((prev + i) % len + len) % len));
  }, [len]);

  useEffect(() => {
    if (len <= 1 || isPaused) return;
    const id = setInterval(() => go(1), AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [len, isPaused, go]);

  if (isLoading) {
    return (
      <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden">
        <section className="w-full bg-gray-100">
          <div className="w-full h-[min(42.86vw,560px)] min-h-[280px] flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </section>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden">
      <section
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        aria-label="Banner quảng bá công ty"
      >
        <div className="relative w-full min-w-0 h-[min(42.86vw,560px)] min-h-[280px]">
          {items.map((company: Company & { banner_url: string }, i: number) => (
            <SlideItem
              key={company.id}
              company={company}
              isActive={i === index}
            />
          ))}
        </div>

      {len > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/50 md:left-4"
            aria-label="Slide trước"
          >
            <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/50 md:right-4"
            aria-label="Slide sau"
          >
            <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
          </button>

          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2" role="tablist" aria-label="Chọn slide">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all md:h-2.5 ${
                  i === index
                    ? 'w-6 bg-white md:w-8'
                    : 'w-2 bg-white/60 hover:bg-white/80 md:w-2.5'
                }`}
              />
            ))}
          </div>
        </>
      )}
      </section>
    </div>
  );
}

function SlideItem({
  company,
  isActive,
}: {
  company: Company & { banner_url: string };
  isActive: boolean;
}) {
  return (
    <Link
      to={`/companies/${company.id}`}
      className={`absolute inset-0 block transition-opacity duration-500 ${
        isActive ? 'z-10 opacity-100' : 'z-0 opacity-0'
      }`}
    >
      <div className="relative h-full w-full bg-gray-900">
        <img
          src={company.banner_url}
          alt={`Banner ${company.name}`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
          aria-hidden
        />
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-4 bg-white/45 backdrop-blur-xl p-4 md:p-6 md:pb-8">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            {company.logo_url ? (
              <img
                src={company.logo_url}
                alt=""
                className="h-12 w-12 shrink-0 rounded-lg border border-gray-300/50 object-cover md:h-16 md:w-16"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gray-300/50 bg-white/30 md:h-16 md:w-16">
                <Building2 className="h-6 w-6 text-gray-600 md:h-8 md:w-8" />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-gray-900 md:text-xl">{company.name}</h2>
              {company.description && (
                <p className="mt-1 line-clamp-2 text-sm text-gray-700 md:line-clamp-1">
                  {company.description}
                </p>
              )}
            </div>
          </div>
          <span className="shrink-0 rounded-lg border border-gray-300/60 bg-white/40 px-3 py-2 text-sm font-medium text-gray-800 backdrop-blur-sm md:px-4">
            Xem công ty
          </span>
        </div>
      </div>
    </Link>
  );
}
