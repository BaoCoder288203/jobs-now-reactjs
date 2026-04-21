import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  getJobCategories,
  createJobCategory,
  updateJobCategory,
  deleteJobCategory,
  type JobCategoryDTO
} from '@/services/category.service';
import { getIndustriesList } from '@/services/industry.service';
import type { Industry } from '@/types';
import { Layers, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<JobCategoryDTO[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIndustryId, setNewIndustryId] = useState<number | ''>('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingIndustryId, setEditingIndustryId] = useState<number | ''>('');

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getJobCategories();
      setCategories(data);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadIndustries = async () => {
    try {
      const list = await getIndustriesList();
      setIndustries(list);
    } catch {
      setIndustries([]);
    }
  };

  useEffect(() => {
    loadCategories();
    loadIndustries();
  }, []);

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
      await loadCategories();
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
        industryId: editingIndustryId === '' ? undefined : (editingIndustryId as number)
      });
      setEditingId(null);
      setEditingName('');
      setEditingIndustryId('');
      await loadCategories();
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
      await loadCategories();
      toast.success('Đã xóa');
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Không thể xóa';
      toast.error(msg);
    }
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quản lý nghề nghiệp (Category)</CardTitle>
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
              <Button onClick={handleCreate} disabled={loading || !newName.trim() || newIndustryId === ''}>
                Thêm
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : categories.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Layers className="mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-600">Chưa có nghề nghiệp nào</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categories.map((c) => (
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
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
