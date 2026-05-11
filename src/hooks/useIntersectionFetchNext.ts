import { useEffect, useRef } from 'react';

/** Gọi `onIntersect` khi sentinel vào viewport (tải trang tiếp theo của infinite query). */
export function useIntersectionFetchNext(
  onIntersect: () => void,
  enabled: boolean,
  rootMargin = '160px',
) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!enabled) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onIntersect();
      },
      { rootMargin, threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled, onIntersect, rootMargin]);
  return sentinelRef;
}
