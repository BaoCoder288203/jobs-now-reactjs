import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  Layers,
  Sparkles,
  MessageCircle,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/app/hooks';
import { logoutAsync } from '@/auth/authSlice';
import { useNavigate } from 'react-router-dom';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const menuItems: SidebarItem[] = [
  { title: 'Tổng quan', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Người dùng', href: '/admin/users', icon: Users },
  { title: 'Công ty', href: '/admin/companies', icon: Building2 },
  { title: 'Việc làm', href: '/admin/jobs', icon: Briefcase },
  { title: 'Ngành nghề', href: '/admin/industries', icon: Layers },
  { title: 'Kỹ năng', href: '/admin/skills', icon: Sparkles },
  { title: 'Hỗ trợ tin nhắn', href: '/admin/support', icon: MessageCircle },
];

export function AdminSidebar() {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutAsync());
    navigate('/');
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/logo/logo_header.png"
              alt="JobsNow Logo"
              className="h-8 w-auto"
            />
          </Link>
        </div>

        {/* User Profile Section */}
        {user && (
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                  <span className="text-sm font-medium text-gray-900">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.fullName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Quản trị viên
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-gray-900"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-gray-200 p-4">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </div>
    </aside>
  );
}

