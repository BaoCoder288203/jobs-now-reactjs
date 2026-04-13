import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { HANDBOOK_SCROLL_CATEGORIES, HANDBOOK_MORE_CATEGORIES } from '@/constants/handbookCategories';

export function HandbookCategoryNav() {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isAllHub = location.pathname === '/cam-nang-viec-lam' || location.pathname === '/cam-nang-viec-lam/';

  function isActiveScroll(slug: string) {
    if (slug === '') {
      return isAllHub;
    }
    return location.pathname === `/cam-nang-viec-lam/${slug}`;
  }

  function isActiveMore(slug: string) {
    return location.pathname === `/cam-nang-viec-lam/${slug}`;
  }

  const moreActive = HANDBOOK_MORE_CATEGORIES.some((c) => isActiveMore(c.slug));

  return (
    <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen border-b border-blue-900 bg-[#082a84]">
      <div className="mx-auto flex w-full max-w-6xl items-stretch px-4">
        <div
          className={cn(
            'min-w-0 flex-1 overflow-x-auto',
            '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
          )}
        >
          <div className="flex gap-2 py-3">
          {HANDBOOK_SCROLL_CATEGORIES.map((cat) => {
            const to =
              cat.slug === '' ? '/cam-nang-viec-lam' : `/cam-nang-viec-lam/${cat.slug}`;
            const active = isActiveScroll(cat.slug);
            return (
              <Link
                key={cat.label + cat.slug}
                to={to}
                className={cn(
                  'shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition',
                  active
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-white bg-white text-[#082a84] hover:bg-blue-50'
                )}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div
        ref={moreRef}
        className="relative ml-2 flex shrink-0 items-center"
      >
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-4 py-2 text-base font-semibold transition',
            moreActive
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-white bg-white text-[#082a84] hover:bg-blue-50',
          )}
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
        >
          <span className="text-xl leading-none">⋯</span>
          <ChevronDown className="h-5 w-5" />
        </button>
        {moreOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 max-h-80 w-72 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
            {HANDBOOK_MORE_CATEGORIES.map((cat) => {
              const active = isActiveMore(cat.slug);
              return (
                <Link
                  key={cat.slug}
                  to={`/cam-nang-viec-lam/${cat.slug}`}
                  className={cn(
                    'block px-4 py-2 text-sm transition',
                    active ? 'bg-emerald-50 font-semibold text-emerald-700' : 'text-gray-800 hover:bg-gray-50',
                  )}
                  onClick={() => setMoreOpen(false)}
                >
                  {cat.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
