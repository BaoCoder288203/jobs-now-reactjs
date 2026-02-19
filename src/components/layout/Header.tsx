import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { UserDropdown } from '@/components/common/UserDropdown';
import { NotificationDropdown } from '@/components/common/NotificationDropdown';
import { RoleModeSelector } from '@/components/common/RoleModeSelector';
import { JobsDropdown } from '@/components/layout/JobsDropdown';
import { ToolsDropdown } from '@/components/layout/ToolsDropdown';
import { Bell, Search, Phone, Menu, X, ChevronDown, Wrench } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useRef } from 'react';
import { useHotkey } from '@tanstack/react-hotkeys';
import { TOOLS_MENU } from '@/constants/toolsMenu';

const SCROLL_THRESHOLD = 60;

export function Header() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [jobsOpen, setJobsOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const jobsAnchorRef = useRef<HTMLButtonElement>(null);
  const toolsAnchorRef = useRef<HTMLButtonElement>(null);
  const jobsAnchorRefBottom = useRef<HTMLButtonElement>(null);
  const toolsAnchorRefBottom = useRef<HTMLButtonElement>(null);
  const notificationAnchorRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useHotkey('Mod+K', (e) => {
    e.preventDefault();
    searchInputRef.current?.focus();
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setJobsOpen(false);
    setToolsOpen(false);
  }, [scrolled]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/jobs?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 transition-[box-shadow] duration-300 ${
          scrolled ? 'shadow-sm' : ''
        }`}
      >
        <div
          className={`container mx-auto flex items-center justify-between gap-2 md:gap-4 px-4 transition-[height] duration-300 ${
            scrolled ? 'h-14' : 'h-16'
          }`}
        >
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>

          <Link to="/" className="flex items-center shrink-0">
            <img
              src="/logo/logo_full.png"
              alt="JobsNow Logo"
              className={`w-auto transition-all duration-300 ${scrolled ? 'h-9 md:h-10' : 'h-10 md:h-14'}`}
            />
          </Link>

          {!scrolled && (
            <nav className="hidden min-[1025px]:flex items-center gap-1 shrink-0">
              <div
                className="relative flex items-center"
                onMouseLeave={() => setJobsOpen(false)}
              >
                <button
                  ref={jobsAnchorRef}
                  type="button"
                  onClick={() => { setToolsOpen(false); setJobsOpen((v) => !v); }}
                  onMouseEnter={() => setJobsOpen(true)}
                  className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-[#0ea5e9]"
                >
                  Việc làm
                  <ChevronDown className="h-4 w-4" />
                </button>
                <JobsDropdown
                  isOpen={jobsOpen}
                  onClose={() => setJobsOpen(false)}
                  anchorRef={jobsAnchorRef}
                />
              </div>
              <Link
                to="/companies"
                onClick={() => { setJobsOpen(false); setToolsOpen(false); }}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-[#0ea5e9]"
              >
                Công ty
              </Link>
              <div
                className="relative flex items-center"
                onMouseLeave={() => setToolsOpen(false)}
              >
                <button
                  ref={toolsAnchorRef}
                  type="button"
                  onClick={() => { setJobsOpen(false); setToolsOpen((v) => !v); }}
                  onMouseEnter={() => setToolsOpen(true)}
                  className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-[#0ea5e9]"
                >
                  <Wrench className="h-4 w-4" />
                  Công cụ
                  <ChevronDown className="h-4 w-4" />
                </button>
                <ToolsDropdown
                  isOpen={toolsOpen}
                  onClose={() => setToolsOpen(false)}
                  anchorRef={toolsAnchorRef}
                />
              </div>
            </nav>
          )}

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl items-center relative">
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Vị trí tuyển dụng, công ty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full h-12 pr-12 rounded-full border-2 border-[#81d1f3] focus:border-[#5bb8e8] focus:ring-2 focus:ring-[#a8dcf6]/50 outline-none"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#81d1f3] hover:bg-[#5bb8e8] rounded-full transition-colors cursor-pointer z-10"
            >
              <Search className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Right Side - Desktop */}
          <div className="hidden md:flex items-center space-x-4 shrink-0">
            <a
              href="tel:0332916529"
              className={`hidden lg:flex items-center rounded-full hover:bg-gray-100 transition-colors ${
                scrolled ? 'gap-2' : 'p-2'
              }`}
              title="(0332) 916 529"
            >
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-primary-light shrink-0">
                <Phone className="h-5 w-5 text-primary-dark animate-phone-ring" />
              </div>
              {scrolled && (
                <span className="text-sm font-medium text-gray-900 hover:text-gray-700 whitespace-nowrap">
                  (0332) 916 529
                </span>
              )}
            </a>

            <div className="hidden lg:block w-px h-6 bg-gray-300 shrink-0" />

            {isAuthenticated && user ? (
              <>
                <div
                  className="relative flex items-center"
                  onMouseLeave={() => setNotificationOpen(false)}
                >
                  <button
                    ref={notificationAnchorRef}
                    type="button"
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Mở thông báo"
                    onMouseEnter={() => setNotificationOpen(true)}
                  >
                    <Bell className="h-5 w-5 text-gray-600" />
                  </button>
                  <NotificationDropdown
                    isOpen={notificationOpen}
                    onClose={() => setNotificationOpen(false)}
                    anchorRef={notificationAnchorRef}
                    userId={user.id}
                  />
                </div>
                <UserDropdown />
              </>
            ) : (
              <RoleModeSelector compact={!scrolled} />
            )}
          </div>
        </div>

        <div
          className={`hidden md:block border-t border-gray-200 bg-gray-100/90 transition-all duration-300 ease-out max-[1024px]:max-h-14 max-[1024px]:opacity-100 ${
            scrolled
              ? 'min-[1025px]:max-h-14 min-[1025px]:opacity-100 min-[1025px]:pointer-events-auto'
              : 'min-[1025px]:max-h-0 min-[1025px]:opacity-0 min-[1025px]:pointer-events-none'
          }`}
        >
          <nav className="container mx-auto flex h-14 items-center justify-center gap-1 px-4">
            <div
              className="relative flex items-center"
              onMouseLeave={() => setJobsOpen(false)}
            >
              <button
                ref={jobsAnchorRefBottom}
                type="button"
                onClick={() => { setToolsOpen(false); setJobsOpen((v) => !v); }}
                onMouseEnter={() => setJobsOpen(true)}
                className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 hover:text-[#0ea5e9]"
              >
                Việc làm
                <ChevronDown className="h-4 w-4" />
              </button>
              <JobsDropdown
                isOpen={scrolled && jobsOpen}
                onClose={() => setJobsOpen(false)}
                anchorRef={jobsAnchorRefBottom}
              />
            </div>
            <Link
              to="/companies"
              onClick={() => { setJobsOpen(false); setToolsOpen(false); }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 hover:text-[#0ea5e9]"
            >
              Công ty
            </Link>
            <div
              className="relative flex items-center"
              onMouseLeave={() => setToolsOpen(false)}
            >
              <button
                ref={toolsAnchorRefBottom}
                type="button"
                onClick={() => { setJobsOpen(false); setToolsOpen((v) => !v); }}
                onMouseEnter={() => setToolsOpen(true)}
                className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 hover:text-[#0ea5e9]"
              >
                <Wrench className="h-4 w-4" />
                Công cụ
                <ChevronDown className="h-4 w-4" />
              </button>
              <ToolsDropdown
                isOpen={scrolled && toolsOpen}
                onClose={() => setToolsOpen(false)}
                anchorRef={toolsAnchorRefBottom}
              />
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Sidebar: Việc làm, Công ty, Công cụ (sub-links) */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-80 bg-white shadow-xl md:hidden overflow-y-auto">
            <div className="flex flex-col h-full p-4 space-y-4">
              <div className="flex items-center relative">
                <Input
                  type="text"
                  placeholder="Vị trí tuyển dụng, công ty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full h-12 pr-12 rounded-full border-2 border-[#81d1f3] focus:border-[#5bb8e8] focus:ring-2 focus:ring-[#a8dcf6]/50 outline-none"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#81d1f3] hover:bg-[#5bb8e8] rounded-full transition-colors cursor-pointer z-10"
                >
                  <Search className="h-5 w-5 text-white" />
                </button>
              </div>

              <nav className="flex flex-col space-y-2">
                <Link
                  to="/jobs"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-[#81d1f3] rounded-lg transition-colors"
                >
                  Việc làm
                </Link>
                <Link
                  to="/companies"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-[#81d1f3] rounded-lg transition-colors"
                >
                  Công ty
                </Link>
                <div className="py-2">
                  <p className="px-4 pb-2 text-sm font-semibold text-gray-500">Công cụ</p>
                  <div className="flex flex-col">
                    {TOOLS_MENU.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="px-6 py-2.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-[#81d1f3] rounded-lg"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </nav>

              <div className="border-t border-gray-200 my-2" />

              <a
                href="tel:0332916529"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-primary-light">
                  <Phone className="h-5 w-5 text-primary-dark animate-phone-ring" />
                </div>
                <span>(0332) 916 529</span>
              </a>

              <div className="border-t border-gray-200 my-2" />

              <div className="mt-auto">
                {isAuthenticated && user ? (
                  <div className="space-y-2">
                    <Link
                      to="/user/notifications"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Bell className="h-5 w-5" />
                      <span>Thông báo</span>
                    </Link>
                    <UserDropdown />
                  </div>
                ) : (
                  <RoleModeSelector />
                )}
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
