import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  Star,
  Layers,
  Sparkles,
  MessageCircle,
  LogOut,
  Newspaper
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
  { title: 'Duyệt đánh giá', href: '/admin/reviews', icon: Star },
  { title: 'Duyệt bài viết', href: '/admin/company-posts', icon: Newspaper },
  { title: 'Ngành', href: '/admin/industries', icon: Layers },
  { title: 'Nghề nghiệp', href: '/admin/categories', icon: Layers },
  { title: 'Chuyên ngành', href: '/admin/majors', icon: Layers },
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
    <aside className="fixed left-0 top-0 z-40 h-screen w-16 border-r border-gray-200 bg-white md:w-64">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-gray-200 px-2 md:justify-start md:px-6">
          <Link to="/" className="flex w-full items-center justify-center md:justify-start">
            <img
              src="/logo/logo_header.png"
              alt="JobsNow Logo"
              className="h-8 w-auto md:hidden"
            />
            <img
              src="/logo/logo_full.png"
              alt="JobsNow Logo Full"
              className="hidden h-8 w-auto md:block"
            />
          </Link>
        </div>

        {/* User Profile Section */}
        {user && (
          <div className="hidden border-b border-gray-200 px-6 py-4 md:block">
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
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4 md:px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center justify-center rounded-lg border px-2 py-2 text-sm font-medium transition-colors md:justify-start md:space-x-3 md:px-3",
                  isActive
                    ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-transparent text-gray-700 hover:border-gray-200 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-blue-600" : "text-gray-500")} />
                <span className={cn("hidden md:inline", isActive && "font-semibold")}>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-gray-200 p-2 md:p-4">
          <Button
            variant="ghost"
            className="w-full justify-center md:justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Đăng xuất</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}

