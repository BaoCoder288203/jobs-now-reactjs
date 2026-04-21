import { Crown, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

type HotTag = 'HOT' | 'SUPER_HOT' | 'NORMAL' | undefined | null;

interface HotTagBadgeProps {
  tag: HotTag;
  hasThumb?: boolean;
  compact?: boolean;
  className?: string;
}

export function HotTagBadge({ tag, hasThumb = false, compact = false, className }: HotTagBadgeProps) {
  if (!tag || tag === 'NORMAL') return null;

  const isSuper = tag === 'SUPER_HOT';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-semibold tracking-wide shadow-sm',
        compact ? 'gap-1 px-2.5 py-1 text-[11px]' : 'gap-1.5 px-3 py-1.5 text-xs',
        isSuper
          ? hasThumb
            ? 'border-amber-200/70 bg-gradient-to-r from-rose-500/95 via-orange-500/95 to-amber-400/95 text-white'
            : 'border-amber-200 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 text-white'
          : hasThumb
            ? 'border-orange-200/70 bg-gradient-to-r from-orange-500/95 to-amber-400/95 text-white'
            : 'border-orange-200 bg-gradient-to-r from-orange-500 to-amber-400 text-white',
        className
      )}
    >
      {isSuper ? <Crown className={cn(compact ? 'h-3 w-3' : 'h-3.5 w-3.5')} /> : <Flame className={cn(compact ? 'h-3 w-3' : 'h-3.5 w-3.5')} />}
      <span>{isSuper ? 'SUPER HOT' : 'HOT'}</span>
    </span>
  );
}
