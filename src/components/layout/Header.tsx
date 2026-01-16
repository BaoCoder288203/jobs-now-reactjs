import { Link } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { UserDropdown } from '@/components/common/UserDropdown';
import { RoleModeSelector } from '@/components/common/RoleModeSelector';
import { Bell } from 'lucide-react';

export function Header() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/logo/logo_header.png" 
            alt="JobsNow Logo" 
            className="h-8 w-20 h-20"
          />
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/jobs"
            className="text-sm font-medium text-gray-700 hover:text-accent transition-colors"
          >
            Việc làm
          </Link>
          <Link
            to="/companies"
            className="text-sm font-medium text-gray-700 hover:text-accent transition-colors"
          >
            Công ty
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {isAuthenticated && user ? (
            <>
              {/* Notification Bell */}
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5 text-gray-600" />
              </button>

              {/* User Dropdown */}
              <UserDropdown />
            </>
          ) : (
            <RoleModeSelector />
          )}
        </div>
      </div>
    </header>
  );
}

