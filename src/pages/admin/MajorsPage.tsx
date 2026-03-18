import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
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
      <div className="max-w-4xl mx-auto space-y-6">
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
            ) : (
              <div className="space-y-2">
                {majors.length === 0 ? (
                  <p className="text-sm text-gray-500">Chưa có chuyên ngành nào.</p>
                ) : (
                  majors.map((m) => (
                    <div
                      key={m.majorId}
                      className="flex items-center justify-between rounded border px-3 py-2 gap-3"
                    >
                      {editingId === m.majorId ? (
                        <div className="flex-1 flex gap-2">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleUpdate}
                            disabled={!editingName.trim()}
                          >
                            Lưu
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                          >
                            Hủy
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="flex-1">{m.name}</span>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(m)}
                            >
                              Sửa
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(m.majorId)}
                            >
                              Xóa
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

