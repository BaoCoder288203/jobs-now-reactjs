import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Layers, Edit2, Trash2 } from 'lucide-react';
import { createMajor, updateMajor, deleteMajor, type MajorDTO } from '@/services/major.service';
import { useIntersectionFetchNext } from '@/hooks/useIntersectionFetchNext';
import { adminCatalogKeys, useMajorsAdminInfinite } from '@/modules/admin-catalog/hooks';

export function AdminMajorsPage() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const majorsQuery = useMajorsAdminInfinite(10);

  const allLoaded = useMemo(
    () => majorsQuery.data?.pages.flatMap((p) => p.items) ?? [],
    [majorsQuery.data],
  );
  const totalFromServer = majorsQuery.data?.pages[0]?.totalCount ?? 0;

  const invalidateMajors = () => {
    void queryClient.invalidateQueries({ queryKey: [...adminCatalogKeys.all, 'majors'] });
  };

  const fetchNext = useCallback(() => {
    void majorsQuery.fetchNextPage();
  }, [majorsQuery.fetchNextPage]);

  const sentinelRef = useIntersectionFetchNext(
    fetchNext,
    Boolean(majorsQuery.hasNextPage && !majorsQuery.isFetchingNextPage),
  );

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createMajor(newName);
      setNewName('');
      invalidateMajors();
    } catch {
      // BE có thể trả lỗi validation
    }
  };

  const startEdit = (major: MajorDTO) => {
    if (!major.majorId) return;
    setEditingId(major.majorId);
    setEditingName(major.name ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleUpdate = async () => {
    if (editingId == null || !editingName.trim()) return;
    await updateMajor(editingId, editingName);
    setEditingId(null);
    setEditingName('');
    invalidateMajors();
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    await deleteMajor(id);
    invalidateMajors();
  };

  const isBootstrapping = majorsQuery.isPending && allLoaded.length === 0;

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl md:text-2xl">
              Quản lý chuyên ngành (Major)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Tên chuyên ngành (ví dụ: Công nghệ thông tin, Cơ khí...)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <Button onClick={handleCreate} disabled={isBootstrapping || !newName.trim()}>
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
                  <p className="text-gray-600">Chưa có chuyên ngành nào</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {allLoaded.map((m) => (
                    <Card key={m.majorId} className="transition-shadow hover:shadow-lg">
                      <CardContent className="p-4">
                        {editingId === m.majorId ? (
                          <div className="space-y-3">
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              placeholder="Tên chuyên ngành"
                            />
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
                                <h3 className="truncate font-semibold text-gray-900">{m.name}</h3>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="flex-1 gap-2"
                                onClick={() => startEdit(m)}
                              >
                                <Edit2 className="h-3 w-3" />
                                Sửa
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(m.majorId)}
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
                {majorsQuery.hasNextPage ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    {majorsQuery.isFetchingNextPage ? <LoadingSpinner size="sm" /> : null}
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
