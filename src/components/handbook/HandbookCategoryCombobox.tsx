import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  HANDBOOK_CATEGORY_OPTIONS,
  type HandbookCategoryItem,
} from '@/constants/handbookCategories';
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  onChange: (categoryKey: string) => void;
  id?: string;
}

export function HandbookCategoryCombobox({ value, onChange, id = 'handbook-category' }: Props) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = HANDBOOK_CATEGORY_OPTIONS.find((c) => c.slug === value);

  const filtered = HANDBOOK_CATEGORY_OPTIONS.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.label ?? '').toLowerCase().includes(q) || (c.slug ?? '').toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  const pick = (c: HandbookCategoryItem) => {
    onChange(c.slug);
    setSearch('');
    setOpen(false);
  };

  return (
    <div className="space-y-2" ref={rootRef}>
      <Label htmlFor={id}>Chuyên mục</Label>
      <p className="text-xs text-gray-500">Gõ để tìm và chọn nhanh.</p>
      <div className="relative">
        <div
          className={cn(
            'flex min-h-11 w-full cursor-text flex-wrap items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm',
            'focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary'
          )}
          onClick={() => setOpen(true)}
        >
          {selected && (
            <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-sm font-medium text-gray-900">
              {selected.label}
            </span>
          )}
          <input
            id={id}
            type="text"
            placeholder={selected ? 'Đổi chuyên mục…' : 'Gõ để tìm chuyên mục…'}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className="min-w-[160px] flex-1 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-gray-400"
          />
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
        </div>
        {open && (
          <div className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
            {filtered.map((c) => {
              const isActive = c.slug === value;
              return (
                <button
                  key={c.slug}
                  type="button"
                  className={cn(
                    'w-full px-3 py-2.5 text-left text-sm hover:bg-gray-100',
                    isActive && 'bg-primary/10 font-medium'
                  )}
                  onClick={() => pick(c)}
                >
                  {c.label}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-gray-500">Không tìm thấy</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
