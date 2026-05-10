import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  getIndustriesList,
  createIndustry,
  updateIndustry,
  deleteIndustry
} from '@/services/industry.service';
import type { Industry } from '@/types';
import { Layers, Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';

export function AdminIndustriesPage() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIndustryName, setNewIndustryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const fetchIndustries = async () => {
    setIsLoading(true);
    try {
      const list = await getIndustriesList();
      setIndustries(list);
    } catch {
      setIndustries([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIndustries();
  }, []);

  const filteredIndustries = industries.filter((industry) =>
    industry.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddIndustry = async () => {
    if (!newIndustryName.trim()) return;
    try {
      await createIndustry(newIndustryName.trim());
      setNewIndustryName('');
      setShowAddForm(false);
      await fetchIndustries();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Không thể thêm ngành nghề';
      toast.error(msg);
    }
  };

  const handleStartEdit = (industry: Industry) => {
    setEditingId(industry.id);
    setEditName(industry.name);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    try {
      await updateIndustry(Number(editingId), editName.trim());
      setEditingId(null);
      setEditName('');
      await fetchIndustries();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Không thể cập nhật ngành nghề';
      toast.error(msg);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = async (industryId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa ngành nghề này?')) return;
    try {
      await deleteIndustry(Number(industryId));
      await fetchIndustries();
      toast.success('Đã xóa ngành nghề');
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Không thể xóa ngành nghề';
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />}>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">Quản lý ngành nghề</h1>
            <p className="text-gray-600 mt-1">
              Quản lý danh mục ngành nghề để employer chọn khi cập nhật thông tin công ty
            </p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm ngành nghề
          </Button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Input
                  placeholder="Nhập tên ngành nghề..."
                  value={newIndustryName}
                  onChange={(e) => setNewIndustryName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddIndustry()}
                  className="flex-1"
                />
                <Button onClick={handleAddIndustry}>Thêm</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewIndustryName('');
                  }}
                >
                  Hủy
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm ngành nghề..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Industries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredIndustries.map((industry) => (
            <Card key={industry.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {editingId === industry.id ? (
                  <div className="space-y-3">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                      placeholder="Tên ngành nghề"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit}>
                        Lưu
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        Hủy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-accent" />
                        <h3 className="font-semibold text-gray-900">{industry.name}</h3>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => handleStartEdit(industry)}
                      >
                        <Edit2 className="h-3 w-3" />
                        Sửa
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(industry.id)}
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

        {filteredIndustries.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Layers className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">Chưa có ngành nghề nào</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
