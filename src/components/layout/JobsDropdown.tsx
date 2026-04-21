import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIndustriesList } from '@/services/industry.service';
import { getJobCategoriesByIndustry, type JobCategoryDTO } from '@/services/category.service';
import type { Industry } from '@/types';

interface JobsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
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

export function JobsDropdown({ isOpen, onClose, anchorRef }: JobsDropdownProps) {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>('');
  const [categories, setCategories] = useState<JobCategoryDTO[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const count = selectedCategories.size;

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

  useEffect(() => {
    if (!isOpen) return;
    getIndustriesList()
      .then((list) => {
        setIndustries(list);
        setSelectedIndustryId((prev) => prev || list[0]?.id || '');
      })
      .catch(() => setIndustries([]));
  }, [isOpen]);

  useEffect(() => {
    if (!selectedIndustryId) return;
    getJobCategoriesByIndustry(Number(selectedIndustryId))
      .then((list) => setCategories(list))
      .catch(() => setCategories([]));
  }, [selectedIndustryId]);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedCategories(new Set(readStoredCategories()));
  }, [isOpen]);

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
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute left-0 top-full mt-0 z-[100] flex h-[420px] w-[min(90vw,720px)] flex-col rounded-lg border border-gray-200 bg-white shadow-xl"
    >
      <div className="flex min-h-0 flex-1">
        {/* Left: industries */}
        <div className="w-48 shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50/50 py-2">
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
              const active = selectedCategories.has(categoryName);
              return (
                <button
                  key={cat.categoryId ?? categoryName}
                  type="button"
                  onClick={() => toggleCategory(categoryName)}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    active
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
      <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 bg-gray-50/80">
        <button
          type="button"
          onClick={handleClear}
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Xóa hết ({count})
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-lg bg-[#81d1f3] px-4 py-2 text-sm font-medium text-white hover:bg-[#5bb8e8]"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}
