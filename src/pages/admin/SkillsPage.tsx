import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSkills, useCreateSkill, useUpdateSkill, useDeleteSkill } from '@/modules/skills/hooks';
import { toast } from 'sonner';
import { Sparkles, Search, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';

export function AdminSkillsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const { data: skills = [], isLoading } = useSkills();
  const createSkill = useCreateSkill();
  const updateSkill = useUpdateSkill();
  const deleteSkill = useDeleteSkill();

  const filteredSkills = skills.filter((skill) =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSkill = async () => {
    const name = newSkillName.trim();
    if (!name) return;
    try {
      await createSkill.mutateAsync(name);
      toast.success('Đã thêm kỹ năng');
      setNewSkillName('');
      setShowAddForm(false);
    } catch {
      toast.error('Thêm kỹ năng thất bại');
    }
  };

  const startEdit = (skillId: string, name: string) => {
    setEditingId(skillId);
    setEditingName(name);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingName.trim()) return;
    try {
      await updateSkill.mutateAsync({ skillId: editingId, skillName: editingName.trim() });
      toast.success('Đã cập nhật kỹ năng');
      setEditingId(null);
      setEditingName('');
    } catch {
      toast.error('Cập nhật thất bại');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleDelete = async (skillId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa kỹ năng này?')) return;
    try {
      await deleteSkill.mutateAsync(skillId);
      toast.success('Đã xóa kỹ năng');
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý kỹ năng</h1>
            <p className="text-gray-600 mt-1">Quản lý tất cả kỹ năng trên nền tảng</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm kỹ năng
          </Button>
        </div>

        {showAddForm && (
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Input
                  placeholder="Nhập tên kỹ năng..."
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                  className="flex-1"
                />
                <Button onClick={handleAddSkill} disabled={createSkill.isPending || !newSkillName.trim()}>
                  {createSkill.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Thêm'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewSkillName('');
                  }}
                >
                  Huỷ
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kỹ năng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSkills.map((skill) => (
              <Card key={skill.skillId} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  {editingId === skill.skillId ? (
                    <div className="space-y-2">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        placeholder="Tên kỹ năng"
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit} disabled={updateSkill.isPending || !editingName.trim()}>
                          {updateSkill.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Lưu'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          Huỷ
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-accent" />
                          <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => startEdit(skill.skillId, skill.name)}
                        >
                          <Edit2 className="h-3 w-3" />
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(skill.skillId)}
                          disabled={deleteSkill.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          {deleteSkill.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredSkills.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Sparkles className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">Không tìm thấy kỹ năng nào</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
