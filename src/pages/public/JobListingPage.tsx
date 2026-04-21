import { useCallback, useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { JobCard } from '@/components/common/JobCard';
import { useJobs } from '@/modules/jobs/hooks';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { JobListParams } from '@/types';
import { Search } from 'lucide-react';
import { JOB_TYPE_OPTIONS } from '@/constants/jobEnums';
import { useSearchParams } from 'react-router-dom';

const CATEGORY_STORAGE_KEY = 'jobs:selectedCategories';

function getStoredCategories(): string[] {
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

export function JobListingPage() {
  const [filters, setFilters] = useState<JobListParams>({
    page: 1,
    limit: 12
  });
  const [searchInput, setSearchInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const applyStoredCategories = useCallback(() => {
    const storedCategories = getStoredCategories();
    setSelectedCategories(storedCategories);
    setFilters((prev) => ({
      ...prev,
      categories: storedCategories.length > 0 ? storedCategories : undefined,
      page: 1,
    }));
  }, []);

  useEffect(() => {
    const queryFromUrl = (searchParams.get('q') ?? searchParams.get('search') ?? '').trim();
    const locationFromUrl = (searchParams.get('location') ?? '').trim();
    const storedCategories = getStoredCategories();

    setSearchInput(queryFromUrl);
    setLocationInput(locationFromUrl);
    setSelectedCategories(storedCategories);

    setFilters((prev) => ({
      ...prev,
      categories: storedCategories.length > 0 ? storedCategories : undefined,
      search: queryFromUrl || undefined,
      location: locationFromUrl || undefined,
      page: 1,
    }));
  }, [searchParams]);

  useEffect(() => {
    const handleCategoryUpdate = () => applyStoredCategories();
    window.addEventListener('jobs-categories-updated', handleCategoryUpdate);
    return () => window.removeEventListener('jobs-categories-updated', handleCategoryUpdate);
  }, [applyStoredCategories]);

  const { data, isLoading, error } = useJobs(filters);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextSearch = searchInput.trim();
    const nextLocation = locationInput.trim();
    if (nextSearch.length === 1) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    if (nextSearch) {
      nextParams.set('q', nextSearch);
    } else {
      nextParams.delete('q');
      nextParams.delete('search');
    }
    if (nextLocation) {
      nextParams.set('location', nextLocation);
    } else {
      nextParams.delete('location');
    }
    setSearchParams(nextParams);

    setFilters((prev) => ({
      ...prev,
      search: nextSearch || undefined,
      location: nextLocation || undefined,
      page: 1
    }));
  };

  const handleFilterChange = (key: keyof JobListParams, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1
    }));
  };

  const handleRemoveCategory = (category: string) => {
    const nextCategories = selectedCategories.filter((item) => item !== category);
    if (nextCategories.length > 0) {
      window.localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(nextCategories));
    } else {
      window.localStorage.removeItem(CATEGORY_STORAGE_KEY);
    }
    applyStoredCategories();
  };

  const handleClearCategories = () => {
    window.localStorage.removeItem(CATEGORY_STORAGE_KEY);
    applyStoredCategories();
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        location: locationInput.trim() || undefined,
        page: 1,
      }));
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [locationInput]);

  return (
    <AppLayout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Tìm việc làm</h1>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    name="search"
                    placeholder="Tìm kiếm việc làm, công ty, kỹ năng..."
                    className="pl-10"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={searchInput.trim().length === 1}>Tìm kiếm</Button>
              </div>
              {searchInput.trim().length === 1 && (
                <p className="mt-2 text-xs text-gray-500">Vui lòng nhập tối thiểu 2 ký tự để tìm kiếm.</p>
              )}
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Loại hình công việc
                </label>
                <Select
                  value={filters.job_type || ''}
                  onChange={(e) => handleFilterChange('job_type', e.target.value || undefined)}
                >
                  <option value="">Tất cả</option>
                  {JOB_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Địa điểm
                </label>
                <Input
                  placeholder="Thành phố hoặc Quốc gia"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                />
              </div>
            </div>
          </div>

          {selectedCategories.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {selectedCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleRemoveCategory(category)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#81d1f3]/20 px-3 py-1 text-sm font-medium text-[#0284c7]"
                >
                  {category}
                  <span aria-hidden="true">x</span>
                </button>
              ))}
              <button
                type="button"
                onClick={handleClearCategories}
                className="ml-1 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Xóa tất cả
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Lỗi khi tải danh sách việc làm. Vui lòng thử lại.</p>
            </div>
          ) : data?.items && data.items.length > 0 ? (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Tìm thấy {data.pagination.total} việc làm
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.items.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {data.pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={!data.pagination.hasPrev}
                    onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
                  >
                    Trước
                  </Button>
                  <span className="flex items-center px-4 text-sm text-gray-600">
                    Trang {data.pagination.page} / {data.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={!data.pagination.hasNext}
                    onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-600">Không tìm thấy việc làm nào. Hãy thử điều chỉnh bộ lọc của bạn.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

