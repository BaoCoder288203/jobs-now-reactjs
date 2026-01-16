import { User, LockKeyhole } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { Navigate, NavLink, Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const navigationItems = [
  { title: "Thông tin", icon: User, href: "info" },
  { title: "Bảo mật", icon: LockKeyhole, href: "sessions" },
];

export default function UserPage() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated || !user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 bg-gray-100 p-4">
      {/* Sidebar */}
      <div
        className="hidden w-64 transform rounded-lg bg-white shadow-lg lg:block"
        style={{ height: "fit-content", maxHeight: "80vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h1 className="text-xl font-semibold text-gray-800">
            Xin chào <span className="text-primary">{user.full_name.split(' ')[0]}</span>!
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
                    `flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                      isActive
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

