import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { getIndustriesList } from '@/services/industry.service';
import { getJobCategoriesByIndustry, type JobCategoryDTO } from '@/services/category.service';
import type { Industry } from '@/types';

interface JobsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}

export interface JobsFilterPanelProps {
  active: boolean;
  onClose: () => void;
  onApplied?: () => void;
  variant?: 'dropdown' | 'mobile';
  onBack?: () => void;
}

const CATEGORY_STORAGE_KEY = 'jobs:selectedCategories';

function readStoredCategories(): string[] {
  const raw = window.localStorage.getItem(CATEGORY_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => String(item).trim()).filter(Boolean);
  } catch {
    return [];
  }
}

export function JobsFilterPanel({
  active,
  onClose,
  onApplied,
  variant = 'dropdown',
  onBack,
}: JobsFilterPanelProps) {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>('');
  const [categories, setCategories] = useState<JobCategoryDTO[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const count = selectedCategories.size;

  useEffect(() => {
    if (!active) return;
    getIndustriesList()
      .then((list) => {
        setIndustries(list);
        setSelectedIndustryId((prev) => prev || list[0]?.id || '');
      })
      .catch(() => setIndustries([]));
  }, [active]);

  useEffect(() => {
    if (!selectedIndustryId) return;
    getJobCategoriesByIndustry(Number(selectedIndustryId))
      .then((list) => setCategories(list))
      .catch(() => setCategories([]));
  }, [selectedIndustryId]);

  useEffect(() => {
    if (!active) return;
    setSelectedCategories(new Set(readStoredCategories()));
  }, [active]);

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryName)) next.delete(categoryName);
      else next.add(categoryName);
      return next;
    });
  };

  const handleClear = () => setSelectedCategories(new Set());

  const handleApply = () => {
    const values = Array.from(selectedCategories);
    if (values.length > 0) {
      window.localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(values));
    } else {
      window.localStorage.removeItem(CATEGORY_STORAGE_KEY);
    }
    window.dispatchEvent(new Event('jobs-categories-updated'));
    navigate('/jobs');
    onClose();
    onApplied?.();
  };

  const isMobile = variant === 'mobile';

  return (
    <div
      className={
        isMobile
          ? 'flex h-full min-h-0 flex-1 flex-col bg-white'
          : 'flex h-[420px] w-[min(90vw,720px)] flex-col rounded-lg border border-gray-200 bg-white shadow-xl'
      }
    >
      {isMobile && onBack && (
        <div className="flex shrink-0 items-center border-b border-gray-200 px-2 py-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
            Quay lại
          </button>
        </div>
      )}

      <div className={`flex min-h-0 flex-1 ${isMobile ? 'flex-col sm:flex-row' : ''}`}>
        {/* Left: industries */}
        <div
          className={
            isMobile
              ? 'max-h-[40vh] shrink-0 overflow-y-auto border-b border-gray-200 bg-gray-50/50 py-2 sm:max-h-none sm:w-44 sm:border-b-0 sm:border-r'
              : 'w-48 shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50/50 py-2'
          }
        >
          {industries.map((ind) => (
            <button
              key={ind.id}
              type="button"
              onClick={() => setSelectedIndustryId(ind.id)}
              className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                selectedIndustryId === ind.id
                  ? 'bg-[#81d1f3]/20 text-[#0ea5e9]'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {ind.name}
            </button>
          ))}
        </div>
        {/* Right: categories */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const categoryName = (cat.categoryName ?? '').trim();
              if (!categoryName) return null;
              const isCategoryActive = selectedCategories.has(categoryName);
              return (
                <button
                  key={cat.categoryId ?? categoryName}
                  type="button"
                  onClick={() => toggleCategory(categoryName)}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    isCategoryActive
                      ? 'bg-[#81d1f3] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {categoryName}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-gray-200 bg-gray-50/80 px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={handleClear}
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Xóa hết ({count})
        </button>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:px-4"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-lg bg-[#81d1f3] px-3 py-2 text-sm font-medium text-white hover:bg-[#5bb8e8] sm:px-4"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}

export function JobsDropdown({ isOpen, onClose, anchorRef }: JobsDropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  return (
    <div ref={panelRef} className="absolute left-0 top-full z-[100] mt-0">
      <JobsFilterPanel active={isOpen} onClose={onClose} variant="dropdown" />
    </div>
  );
}
