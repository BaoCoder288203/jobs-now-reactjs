import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logoutAsync } from '@/auth/authSlice';
import {
  Briefcase,
  Bell,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
  Settings,
  LayoutDashboard,
  FileText,
  Crown,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCandidateSubscriptionStatus } from '@/services/subscription-plan.service';
import type { User as AuthUser } from '@/types';

const MD_UP = '(min-width: 768px)';

function useIsMdUp(): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia(MD_UP).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(MD_UP);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    setMatches(mq.matches);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return matches;
}

interface UserDropdownMenuBodyProps {
  user: AuthUser;
  isVipUser: boolean;
  isJobSeeker: boolean;
  isRecruiter: boolean;
  canAccessRecruiter: boolean;
  canAccessAdmin: boolean;
  isJobMenuOpen: boolean;
  setIsJobMenuOpen: (next: boolean | ((v: boolean) => boolean)) => void;
  onCloseMenu: () => void;
  onLogoutClick: () => void;
}

function UserDropdownMenuBody({
  user,
  isVipUser,
  isJobSeeker,
  isRecruiter,
  canAccessRecruiter,
  canAccessAdmin,
  isJobMenuOpen,
  setIsJobMenuOpen,
  onCloseMenu,
  onLogoutClick,
}: UserDropdownMenuBodyProps) {
  const closeAndResetJobs = () => {
    setIsJobMenuOpen(false);
    onCloseMenu();
  };

  return (
    <div className="relative rounded-lg bg-white">
      {/* User Info Header */}
      <div className="mb-2 mx-2 flex items-center gap-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 p-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.fullName}
              className={cn(
                'h-12 w-12 rounded-full object-cover',
                isJobSeeker && isVipUser && 'ring-2 ring-amber-400 ring-offset-1'
              )}
            />
          ) : (
            <span className="text-lg font-semibold text-white">
              {user.fullName.split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-gray-900">{user.fullName}</p>
            {isJobSeeker && isVipUser && (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                VIP
              </span>
            )}
          </div>
          <p className="truncate text-xs text-gray-600">{user.email || ''}</p>
          <span className="mt-1 inline-block rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
            {user.role?.replace('ROLE_', '').replace('_', ' ') || 'User'}
          </span>
        </div>
      </div>

      <div className="mb-1 px-2">
        <p className="px-2 py-1 text-xs font-semibold uppercase text-gray-500">Tài khoản của tôi</p>
      </div>
      <div className="my-1 border-t border-gray-200" />

      <Link
        to="/user/info"
        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
        onClick={closeAndResetJobs}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
          <User className="h-4 w-4 text-gray-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">Thông tin người dùng</p>
        </div>
      </Link>

      {isJobSeeker && (
        <Link
          to="/user/dashboard"
          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
          onClick={closeAndResetJobs}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
            <LayoutDashboard className="h-4 w-4 text-gray-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900">Tổng quan</p>
          </div>
        </Link>
      )}

      {isJobSeeker && (
        <Link
          to="/user/pricing"
          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-cyan-50"
          onClick={closeAndResetJobs}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 shadow-sm shadow-cyan-500/30">
            <Crown className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent">
              Nâng cấp VIP
            </p>
          </div>
        </Link>
      )}

      {isJobSeeker && (
        <Link
          to="/user/resumes"
          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
          onClick={closeAndResetJobs}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
            <FileText className="h-4 w-4 text-gray-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900">CV của tôi</p>
          </div>
        </Link>
      )}

      {isJobSeeker && (
        <>
          <button
            type="button"
            onClick={() => setIsJobMenuOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <Briefcase className="h-4 w-4 text-gray-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">Quản lý việc làm</p>
              </div>
            </div>
            <ChevronRight
              className={cn('h-4 w-4 text-gray-400 transition-transform', isJobMenuOpen && 'rotate-90 transform')}
            />
          </button>

          {isJobMenuOpen && (
            <div className="bg-gray-50">
              <Link
                to="/user/applications"
                className="flex items-center gap-3 px-4 py-2.5 pl-12 transition-colors hover:bg-gray-100"
                onClick={closeAndResetJobs}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                <span className="text-sm text-gray-900">Việc làm đã ứng tuyển</span>
              </Link>
              <Link
                to="/user/saved-jobs"
                className="flex items-center gap-3 px-4 py-2.5 pl-12 transition-colors hover:bg-gray-100"
                onClick={closeAndResetJobs}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                <span className="text-sm text-gray-900">Việc làm đã lưu</span>
              </Link>
              <Link
                to="/user/saved-jobs"
                className="flex items-center gap-3 px-4 py-2.5 pl-12 transition-colors hover:bg-gray-100"
                onClick={closeAndResetJobs}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                <span className="text-sm text-gray-900">Việc làm chờ ứng tuyển</span>
              </Link>
            </div>
          )}
        </>
      )}

      <Link
        to="/user/notifications"
        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
        onClick={closeAndResetJobs}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
          <Bell className="h-4 w-4 text-gray-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">Thông báo</p>
        </div>
      </Link>

      {isJobSeeker && (
        <Link
          to="/user/chat"
          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
          onClick={closeAndResetJobs}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
            <MessageCircle className="h-4 w-4 text-gray-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900">Tin nhắn</p>
          </div>
        </Link>
      )}

      {(canAccessRecruiter || canAccessAdmin) && (
        <>
          <div className="my-1 border-t border-gray-200" />
          <div className="mb-1 px-2">
            <p className="px-2 py-1 text-xs font-semibold uppercase text-gray-500">Quản trị</p>
          </div>
        </>
      )}

      {isRecruiter && (
        <Link
          to="/employer/dashboard"
          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
          onClick={closeAndResetJobs}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900">Tuyển dụng</p>
          </div>
        </Link>
      )}

      {canAccessAdmin && (
        <Link
          to="/admin/dashboard"
          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
          onClick={closeAndResetJobs}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900">Quản trị</p>
          </div>
        </Link>
      )}

      <div className="my-1 border-t border-gray-200" />

      <div className="px-2">
        <Link
          to="/user/settings"
          className="flex items-center gap-3 rounded px-2 py-2 transition-colors hover:bg-gray-50"
          onClick={closeAndResetJobs}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
            <Settings className="h-4 w-4 text-gray-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900">Cài đặt</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={onLogoutClick}
          className="flex w-full items-center gap-3 rounded px-2 py-2 text-left transition-colors hover:bg-red-50"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100">
            <LogOut className="h-4 w-4 text-red-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-red-600">Đăng xuất</p>
          </div>
        </button>
      </div>
    </div>
  );
}

const MOBILE_SHEET_TRANSITION_MS = 300;

export function UserDropdown() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isMdUp = useIsMdUp();
  const [isOpen, setIsOpen] = useState(false);
  const [mobileSheetEntered, setMobileSheetEntered] = useState(false);
  const [isJobMenuOpen, setIsJobMenuOpen] = useState(false);
  const [isVipUser, setIsVipUser] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        scheduleCloseDropdown();
      }
    };

    if (isOpen && isMdUp) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMdUp]);

  const finalizeCloseMobile = useCallback(() => {
    setIsOpen(false);
    setIsJobMenuOpen(false);
    setMobileSheetEntered(false);
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  /** Đóng ngay desktop; mobile: animate trượt trái trước khi ẩn */
  const scheduleCloseDropdown = useCallback(() => {
    if (!isMdUp) {
      setMobileSheetEntered(false);
      if (closeTimerRef.current !== null) {
        clearTimeout(closeTimerRef.current);
      }
      closeTimerRef.current = setTimeout(() => {
        finalizeCloseMobile();
      }, MOBILE_SHEET_TRANSITION_MS);
      return;
    }
    finalizeCloseMobile();
    setMobileSheetEntered(false);
  }, [isMdUp, finalizeCloseMobile]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isMdUp && isOpen) {
      setMobileSheetEntered(false);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setMobileSheetEntered(true));
      });
      return () => cancelAnimationFrame(id);
    }
    if (!isOpen) {
      setMobileSheetEntered(false);
    }
  }, [isOpen, isMdUp]);

  useEffect(() => {
    if (!isMdUp && isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
    return undefined;
  }, [isMdUp, isOpen]);

  const handleLogout = async () => {
    import('@/services/websocket').then(({ disconnectWebSocket }) => {
      disconnectWebSocket();
    });
    await dispatch(logoutAsync());
    navigate('/');
    finalizeCloseMobile();
  };

  const userRole = user?.role || '';
  const isJobSeeker = userRole === 'ROLE_JOBSEEKER';
  const isRecruiter = userRole === 'ROLE_COMPANY';
  const isAdmin = userRole === 'ROLE_ADMIN';

  const canAccessRecruiter = isRecruiter || isAdmin;
  const canAccessAdmin = isAdmin;

  useEffect(() => {
    let mounted = true;
    if (!isJobSeeker || !user?.userId) {
      setIsVipUser(false);
      return undefined;
    }

    getCandidateSubscriptionStatus()
      .then((status) => {
        if (mounted) {
          setIsVipUser(Boolean(status.isProfileHighlighted));
        }
      })
      .catch(() => {
        if (mounted) {
          setIsVipUser(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [isJobSeeker, user?.userId]);

  if (!user) return null;

  const toggleOpen = () => {
    if (isOpen && isMdUp) {
      finalizeCloseMobile();
      return;
    }
    if (isOpen && !isMdUp) {
      scheduleCloseDropdown();
      return;
    }
    setIsJobMenuOpen(false);
    setIsOpen(true);
  };

  const mobilePortal =
    isOpen &&
    !isMdUp &&
    typeof document !== 'undefined' &&
    createPortal(
      <>
        <div
          className="fixed inset-0 z-[60] bg-black/50 md:hidden"
          aria-hidden="true"
          onClick={() => scheduleCloseDropdown()}
        />
        <div
          className={cn(
            'fixed left-0 top-16 z-[61] flex h-[calc(100vh-4rem)] w-[min(100%,20rem)] flex-col bg-white shadow-2xl will-change-transform transition-transform duration-300 ease-out md:hidden',
            mobileSheetEntered ? 'translate-x-0' : '-translate-x-full pointer-events-none'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-center border-b border-gray-200 px-2 py-2">
            <button
              type="button"
              onClick={() => scheduleCloseDropdown()}
              className="flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
              Quay lại
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pb-6 pt-2">
            <UserDropdownMenuBody
              user={user}
              isVipUser={isVipUser}
              isJobSeeker={isJobSeeker}
              isRecruiter={isRecruiter}
              canAccessRecruiter={canAccessRecruiter}
              canAccessAdmin={canAccessAdmin}
              isJobMenuOpen={isJobMenuOpen}
              setIsJobMenuOpen={setIsJobMenuOpen}
              onCloseMenu={scheduleCloseDropdown}
              onLogoutClick={() => {

                void handleLogout();
              }}
            />
          </div>
        </div>
      </>,
      document.body
    );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleOpen}
        onMouseEnter={() => {
          if (isMdUp) setIsOpen(true);
        }}
        aria-expanded={isOpen}
        className="flex w-full min-w-0 max-w-full items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100 md:w-auto"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.fullName}
            className={cn(
              'h-8 w-8 shrink-0 rounded-full object-cover',
              isJobSeeker && isVipUser && 'ring-2 ring-amber-400 ring-offset-1'
            )}
          />
        ) : (
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary',
              isJobSeeker && isVipUser && 'ring-2 ring-amber-400 ring-offset-1'
            )}
          >
            <span className="text-sm font-medium text-gray-900">{user.fullName.charAt(0).toUpperCase()}</span>
          </div>
        )}
        <span className="min-w-0 truncate text-left text-sm font-medium text-gray-900">
          {user.fullName.split(' ')[0]}
        </span>
        {isJobSeeker && isVipUser && (
          <span className="inline-flex shrink-0 items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 sm:px-2 sm:text-[10px]">
            VIP
          </span>
        )}
        <ChevronDown
          className={cn(
            'ml-auto h-4 w-4 shrink-0 text-gray-600 transition-transform',
            isOpen && 'rotate-180 transform'
          )}
        />
      </button>

      {mobilePortal}

      {isOpen && isMdUp && (
        <div
          className="absolute right-0 z-50 mt-2 w-72 rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
          onMouseLeave={() => {
            setIsOpen(false);
            setIsJobMenuOpen(false);
          }}
        >
          <div className="absolute -top-2 right-6 h-4 w-4 rotate-45 border-l border-t border-gray-200 bg-white" />

          <div className="relative rounded-lg bg-white">
            <UserDropdownMenuBody
              user={user}
              isVipUser={isVipUser}
              isJobSeeker={isJobSeeker}
              isRecruiter={isRecruiter}
              canAccessRecruiter={canAccessRecruiter}
              canAccessAdmin={canAccessAdmin}
              isJobMenuOpen={isJobMenuOpen}
              setIsJobMenuOpen={setIsJobMenuOpen}
              onCloseMenu={() => {
                setIsOpen(false);
                setIsJobMenuOpen(false);
              }}
              onLogoutClick={() => {

                void handleLogout();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
