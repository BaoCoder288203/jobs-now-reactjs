import { User, LayoutDashboard, Briefcase, FileText, Bookmark, Settings, Bell, MessageCircle, Building2, UserCog } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { Navigate, NavLink, Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const commonItems = [
  { title: "Thông tin", icon: User, href: "info" },
  { title: "Thông báo", icon: Bell, href: "notifications" },
  { title: "Cài đặt", icon: Settings, href: "settings" },
];

const jobSeekerItems = [
  { title: "Tổng quan", icon: LayoutDashboard, href: "dashboard" },
  { title: "Hồ sơ nghề nghiệp", icon: UserCog, href: "profile" },
  { title: "Ứng tuyển", icon: Briefcase, href: "applications" },
  { title: "CV của tôi", icon: FileText, href: "resumes" },
  { title: "Việc làm đã lưu", icon: Bookmark, href: "saved-jobs" },
  { title: "Công ty theo dõi", icon: Building2, href: "followed-companies" },
];

export default function UserPage() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated || !user) return <Navigate to="/" replace />;

  const userRole = user?.role || '';
  const isJobSeeker = userRole === 'ROLE_JOBSEEKER';
  const navigationItems = isJobSeeker
    ? [...commonItems, ...jobSeekerItems]
    : commonItems;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 bg-gray-100 p-4">
        {/* Sidebar - luôn hiển thị */}
        <div
          className="hidden w-64 transform rounded-lg bg-white shadow-lg lg:block"
          style={{ height: "fit-content", maxHeight: "80vh" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <h1 className="text-xl font-semibold text-gray-800">
              Xin chào <span className="text-primary">{user.fullName.split(' ')[0]}</span>!
            </h1>
          </div>

          {/* Navigation */}
          <nav className="p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.title}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`
                    }
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-6">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
}

