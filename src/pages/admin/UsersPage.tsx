import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { Users, Search, Edit2, Mail } from 'lucide-react';
import { useAdminUsers, useUpdateAdminUser } from '@/modules/admin/hooks';
import type { AdminUserDTO } from '@/services/admin.service';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';

const ROLE_OPTIONS = [
  { value: 'ROLE_JOBSEEKER', label: 'Job seeker' },
  { value: 'ROLE_COMPANY', label: 'Recruiter / Company' },
  { value: 'ROLE_ADMIN', label: 'Admin' },
] as const;

export function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editUser, setEditUser] = useState<AdminUserDTO | null>(null);
  const [draftRole, setDraftRole] = useState('');
  const [draftStatus, setDraftStatus] = useState<'ACTIVE' | 'DISABLED'>('ACTIVE');

  const { data: users = [], isLoading, error } = useAdminUsers();
  const updateUserMutation = useUpdateAdminUser();

  useEffect(() => {
    if (editUser) {
      setDraftRole(editUser.roleName);
      setDraftStatus(editUser.status);
    }
  }, [editUser]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.fullName ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.status === 'ACTIVE') ||
      (statusFilter === 'inactive' && user.status === 'DISABLED');
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    return status === 'ACTIVE' ? (
      <Badge className="bg-accent-light text-gray-900">Hoạt động</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Vô hiệu hóa</Badge>
    );
  };

  const getRoleBadge = (roleName?: string) => {
    if (!roleName) return null;
    const colors: Record<string, string> = {
      ROLE_JOBSEEKER: 'bg-primary-light text-gray-900',
      ROLE_COMPANY: 'bg-accent-light text-gray-900',
      ROLE_ADMIN: 'bg-gray-100 text-gray-700',
    };
    const display = roleName.replace('_', ' ').replace('ROLE ', '');
    return (
      <Badge className={colors[roleName] ?? 'bg-gray-100 text-gray-700'}>
        {display}
      </Badge>
    );
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    try {
      await updateUserMutation.mutateAsync({
        userId: editUser.userId,
        body: {
          roleName: draftRole,
          status: draftStatus,
        },
      });
      toast.success('Đã cập nhật người dùng');
      setEditUser(null);
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Cập nhật thất bại';
      toast.error(msg);
    }
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage all users in the platform</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Vô hiệu hóa</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <p className="text-center text-red-600 py-8">
                Không tải được danh sách (cần đăng nhập Admin).
              </p>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.userId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                              <span className="text-sm font-medium text-gray-900">
                                {(user.fullName ?? '?').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.fullName ?? '—'}</p>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">{getRoleBadge(user.roleName)}</td>
                        <td className="py-4 px-4">{getStatusBadge(user.status)}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              type="button"
                              onClick={() => setEditUser(user)}
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No users found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent
          className="max-w-md"
          onClose={() => setEditUser(null)}
          showClose
        >
          <div className="p-6 pt-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Chỉnh sửa người dùng</h2>
            <p className="text-sm text-gray-500 mb-4 break-all">{editUser?.email}</p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-edit-role">Vai trò (role)</Label>
                <Select
                  id="admin-edit-role"
                  value={draftRole}
                  onChange={(e) => setDraftRole(e.target.value)}
                  className="w-full"
                >
                  {ROLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-edit-status">Trạng thái tài khoản</Label>
                <Select
                  id="admin-edit-status"
                  value={draftStatus}
                  onChange={(e) => setDraftStatus(e.target.value as 'ACTIVE' | 'DISABLED')}
                  className="w-full"
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="DISABLED">Vô hiệu hóa</option>
                </Select>
                <p className="text-xs text-gray-500">
                  Vô hiệu hóa: user không đăng nhập được (tách với xác thực email).
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => setEditUser(null)}>
                Hủy
              </Button>
              <Button
                type="button"
                onClick={handleSaveEdit}
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
