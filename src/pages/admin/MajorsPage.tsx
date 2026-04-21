import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Layers, Edit2, Trash2 } from 'lucide-react';
import { getMajors, createMajor, updateMajor, deleteMajor, type MajorDTO } from '@/services/major.service';

export function AdminMajorsPage() {
  const [majors, setMajors] = useState<MajorDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const loadMajors = async () => {
    setLoading(true);
    try {
      const data = await getMajors();
      setMajors(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMajors().catch(() => setMajors([]));
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createMajor(newName);
    setNewName('');
    await loadMajors();
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
    await loadMajors();
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    await deleteMajor(id);
    await loadMajors();
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quản lý chuyên ngành (Major)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Tên chuyên ngành (ví dụ: Công nghệ thông tin, Cơ khí...)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <Button onClick={handleCreate} disabled={loading || !newName.trim()}>
                Thêm
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : majors.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Layers className="mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-600">Chưa có chuyên ngành nào</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {majors.map((m) => (
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
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

