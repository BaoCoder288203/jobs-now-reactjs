import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logoutAsync } from '@/auth/authSlice';
import {
  Briefcase,
  Bell,
  LogOut,
  ChevronDown,
  ChevronRight,
  User,
  Shield,
  Settings,
  LayoutDashboard,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function UserDropdown() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isJobMenuOpen, setIsJobMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    import('@/services/websocket').then(({ disconnectWebSocket }) => {
      disconnectWebSocket();
    });
    await dispatch(logoutAsync());
    navigate('/');
    setIsOpen(false);
  };

  const userRole = user?.role || '';
  const isJobSeeker = userRole === 'ROLE_JOBSEEKER';
  const isRecruiter = userRole === 'ROLE_COMPANY';
  const isAdmin = userRole === 'ROLE_ADMIN';

  const canAccessRecruiter = isRecruiter || isAdmin;
  const canAccessAdmin = isAdmin;

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.fullName}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-sm font-medium text-gray-900">
              {user.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className="hidden sm:inline font-medium text-gray-900">
          {user.fullName.split(' ')[0]}
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 text-gray-600 transition-transform",
          isOpen && "transform rotate-180"
        )} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
          onMouseLeave={() => {
            setIsOpen(false);
          }}
        >
          {/* Triangle pointer */}
          <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>

          <div className="relative bg-white rounded-lg">
            {/* User Info Header - Tham khảo từ TalentBridge */}
            <div className="mb-2 flex items-center gap-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 p-3 mx-2">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold text-white">
                    {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900 text-sm">
                  {user.fullName}
                </p>
                <p className="truncate text-xs text-gray-600">
                  {user.email || ''}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded">
                  {user.role?.replace('ROLE_', '').replace('_', ' ') || 'User'}
                </span>
              </div>
            </div>

            <div className="px-2 mb-1">
              <p className="text-xs font-semibold text-gray-500 uppercase px-2 py-1">
                Tài khoản của tôi
              </p>
            </div>
            <div className="border-t border-gray-200 my-1"></div>

            {/* Thông tin người dùng - Link đến /user/info cho tất cả users */}
            <Link
              to="/user/info"
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm text-gray-900">
                  Thông tin người dùng
                </p>
              </div>
            </Link>

            {/* Tổng quan - Only for Job Seeker */}
            {isJobSeeker && (
              <Link
                to="/user/dashboard"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <LayoutDashboard className="h-4 w-4 text-gray-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900">Tổng quan</p>
                </div>
              </Link>
            )}

            {/* CV của tôi - Only for Job Seeker */}
            {isJobSeeker && (
              <Link
                to="/user/resumes"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <FileText className="h-4 w-4 text-gray-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900">CV của tôi</p>
                </div>
              </Link>
            )}

            {/* Quản lý việc làm - Only for Job Seeker */}
            {isJobSeeker && (
              <>
                <button
                  onClick={() => setIsJobMenuOpen(!isJobMenuOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                      <Briefcase className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900">Quản lý việc làm</p>
                    </div>
                  </div>
                  <ChevronRight className={cn(
                    "h-4 w-4 text-gray-400 transition-transform",
                    isJobMenuOpen && "transform rotate-90"
                  )} />
                </button>

                {/* Submenu items - expand/collapse trong menu */}
                {isJobMenuOpen && (
                  <div className="bg-gray-50">
                    <Link
                      to="/user/applications"
                      className="flex items-center gap-3 px-4 py-2.5 pl-12 hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        setIsOpen(false);
                        setIsJobMenuOpen(false);
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                      <span className="text-sm text-gray-900">Việc làm đã ứng tuyển</span>
                    </Link>
                    <Link
                      to="/user/saved-jobs"
                      className="flex items-center gap-3 px-4 py-2.5 pl-12 hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        setIsOpen(false);
                        setIsJobMenuOpen(false);
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                      <span className="text-sm text-gray-900">Việc làm đã lưu</span>
                    </Link>
                    <Link
                      to="/user/saved-jobs"
                      className="flex items-center gap-3 px-4 py-2.5 pl-12 hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        setIsOpen(false);
                        setIsJobMenuOpen(false);
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                      <span className="text-sm text-gray-900">Việc làm chờ ứng tuyển</span>
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Thông báo - link đến trang tổng hợp thông báo */}
            <Link
              to="/user/notifications"
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <Bell className="h-4 w-4 text-gray-600" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm text-gray-900">Thông báo</p>
              </div>
            </Link>

            {/* Divider trước phần quản trị */}
            {(canAccessRecruiter || canAccessAdmin) && (
              <>
                <div className="border-t border-gray-200 my-1"></div>
                <div className="px-2 mb-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase px-2 py-1">
                    Quản trị
                  </p>
                </div>
              </>
            )}

            {isRecruiter && (
              <Link
                to="/employer/dashboard"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500">
                  <Briefcase className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900">Tuyển dụng</p>
                </div>
              </Link>
            )}

            {/* Quản trị / Admin Dashboard - Chỉ hiển thị cho Admin */}
            {canAccessAdmin && (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900">Quản trị</p>
                </div>
              </Link>
            )}

            {/* Divider */}
            <div className="border-t border-gray-200 my-1"></div>

            {/* Cài đặt - Link đến /user/settings cho tất cả users */}
            <div className="px-2">
              <Link
                to="/user/settings"
                className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <Settings className="h-4 w-4 text-gray-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900">Cài đặt</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-2 py-2 hover:bg-red-50 rounded transition-colors text-left"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100">
                  <LogOut className="h-4 w-4 text-red-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-red-600">Đăng xuất</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


