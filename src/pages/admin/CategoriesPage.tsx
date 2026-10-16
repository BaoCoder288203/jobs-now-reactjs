import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  createJobCategory,
  updateJobCategory,
  deleteJobCategory,
  type JobCategoryDTO,
} from '@/services/category.service';
import { getIndustriesList } from '@/services/industry.service';
import type { Industry } from '@/types';
import { Layers, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useIntersectionFetchNext } from '@/hooks/useIntersectionFetchNext';
import { adminCatalogKeys, useJobCategoriesAdminInfinite } from '@/modules/admin-catalog/hooks';

export function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [newName, setNewName] = useState('');
  const [newIndustryId, setNewIndustryId] = useState<number | ''>('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingIndustryId, setEditingIndustryId] = useState<number | ''>('');

  const categoriesQuery = useJobCategoriesAdminInfinite(10);

  const allLoaded = useMemo(
    () => categoriesQuery.data?.pages.flatMap((p) => p.items) ?? [],
    [categoriesQuery.data],
  );
  const totalFromServer = categoriesQuery.data?.pages[0]?.totalCount ?? 0;

  const invalidateCategories = () => {
    void queryClient.invalidateQueries({ queryKey: [...adminCatalogKeys.all, 'job-categories'] });
  };

  useEffect(() => {
    void getIndustriesList().then(setIndustries).catch(() => setIndustries([]));
  }, []);

  const fetchNext = useCallback(() => {
    void categoriesQuery.fetchNextPage();
  }, [categoriesQuery.fetchNextPage]);

  const sentinelRef = useIntersectionFetchNext(
    fetchNext,
    Boolean(categoriesQuery.hasNextPage && !categoriesQuery.isFetchingNextPage),
  );

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error('Nhập tên nghề nghiệp');
      return;
    }
    if (newIndustryId === '') {
      toast.error('Chọn ngành');
      return;
    }
    try {
      await createJobCategory({ categoryName: newName.trim(), industryId: newIndustryId as number });
      setNewName('');
      setNewIndustryId('');
      invalidateCategories();
      toast.success('Đã thêm nghề nghiệp');
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Không thể thêm';
      toast.error(msg);
    }
  };

  const startEdit = (cat: JobCategoryDTO) => {
    if (cat.categoryId == null) return;
    setEditingId(cat.categoryId);
    setEditingName(cat.categoryName ?? '');
    setEditingIndustryId(cat.industryId ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingIndustryId('');
  };

  const handleUpdate = async () => {
    if (editingId == null || !editingName.trim()) return;
    try {
      await updateJobCategory({
        categoryId: editingId,
        categoryName: editingName.trim(),
        industryId: editingIndustryId === '' ? undefined : (editingIndustryId as number),
      });
      setEditingId(null);
      setEditingName('');
      setEditingIndustryId('');
      invalidateCategories();
      toast.success('Đã cập nhật');
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Không thể cập nhật';
      toast.error(msg);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    try {
      await deleteJobCategory(id);
      invalidateCategories();
      toast.success('Đã xóa');
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Không thể xóa';
      toast.error(msg);
    }
  };

  const isBootstrapping = categoriesQuery.isPending && allLoaded.length === 0;

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl md:text-2xl">
              Quản lý nghề nghiệp (Category)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 items-end">
              <div className="flex-1 min-w-[200px] space-y-1">
                <label className="text-sm font-medium text-gray-700">Tên nghề</label>
                <Input
                  placeholder="Ví dụ: Kỹ sư phần mềm, Marketing..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="w-48 space-y-1">
                <label className="text-sm font-medium text-gray-700">Ngành</label>
                <Select
                  value={newIndustryId === '' ? '' : String(newIndustryId)}
                  onChange={(e) => setNewIndustryId(e.target.value === '' ? '' : Number(e.target.value))}
                >
                  <option value="">-- Chọn ngành --</option>
                  {industries.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </Select>
              </div>
              <Button onClick={handleCreate} disabled={isBootstrapping || !newName.trim() || newIndustryId === ''}>
                Thêm
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Tổng {totalFromServer}
              {allLoaded.length < totalFromServer ? ` · đã tải ${allLoaded.length}` : ''}
            </p>
            {isBootstrapping ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : totalFromServer === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Layers className="mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-600">Chưa có nghề nghiệp nào</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {allLoaded.map((c) => (
                    <Card key={c.categoryId} className="transition-shadow hover:shadow-lg">
                      <CardContent className="p-4">
                        {editingId === c.categoryId ? (
                          <div className="space-y-3">
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              placeholder="Tên nghề nghiệp"
                            />
                            <Select
                              value={editingIndustryId === '' ? '' : String(editingIndustryId)}
                              onChange={(e) =>
                                setEditingIndustryId(e.target.value === '' ? '' : Number(e.target.value))
                              }
                            >
                              <option value="">-- Ngành --</option>
                              {industries.map((i) => (
                                <option key={i.id} value={i.id}>
                                  {i.name}
                                </option>
                              ))}
                            </Select>
                            <div className="flex gap-2">
                              <Button type="button" size="sm" onClick={handleUpdate} disabled={!editingName.trim()}>
                                Lưu
                              </Button>
                              <Button type="button" size="sm" variant="outline" onClick={cancelEdit}>
                                Hủy
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="mb-3 flex items-center justify-between">
                              <div className="min-w-0 flex items-center gap-2">
                                <Layers className="h-5 w-5 shrink-0 text-accent" />
                                <h3 className="truncate font-semibold text-gray-900">{c.categoryName}</h3>
                              </div>
                            </div>
                            <p className="mb-3 text-xs text-gray-500">{c.industryName || 'Chưa gán ngành'}</p>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="flex-1 gap-2"
                                onClick={() => startEdit(c)}
                              >
                                <Edit2 className="h-3 w-3" />
                                Sửa
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(c.categoryId)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {categoriesQuery.hasNextPage ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    {categoriesQuery.isFetchingNextPage ? <LoadingSpinner size="sm" /> : null}
                    <div ref={sentinelRef} className="h-8 w-full" aria-hidden />
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
