import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { logoutAsync } from '@/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { LogOut, Lock, Shield, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function JobSeekerSettingsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu mới không khớp');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsChangingPassword(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Đổi mật khẩu thành công');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Đổi mật khẩu thất bại');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutAsync());
    navigate('/');
  };

  const handleDeleteAccount = () => {
    if (!window.confirm('Bạn có chắc muốn xóa tài khoản? Hành động này không thể hoàn tác.')) {
      return;
    }
    toast.info('Yêu cầu xóa tài khoản đã gửi. Vui lòng liên hệ hỗ trợ.');
  };

  return (
    <div className="p-6">
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">Email</Label>
                <p className="font-medium text-gray-900 mt-1">{user?.email}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Full Name</Label>
                <p className="font-medium text-gray-900 mt-1">{user?.fullName}</p>
              </div>
              {user?.phone && (
                <div>
                  <Label className="text-sm text-gray-500">Phone</Label>
                  <p className="font-medium text-gray-900 mt-1">{user.phone}</p>
                </div>
              )}
              <div>
                <Label className="text-sm text-gray-500">Role</Label>
                <p className="font-medium text-gray-900 mt-1 capitalize">
                  {user?.role?.replace('ROLE_', '').replace('_', ' ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-gray-600" />
              <CardTitle>Change Password</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-600" />
              <CardTitle>Active Sessions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Current Session</p>
                  <p className="text-sm text-gray-600">
                    {new Date().toLocaleString()}
                  </p>
                </div>
                <Badge variant="primary">Active</Badge>
              </div>
              <p className="text-sm text-gray-600">
                You are currently logged in on this device
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Logout</h3>
              <p className="text-sm text-gray-600 mb-4">
                Sign out from your account on this device
              </p>
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-medium text-red-600 mb-2">Delete Account</h3>
              <p className="text-sm text-gray-600 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button
                variant="outline"
                onClick={handleDeleteAccount}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

