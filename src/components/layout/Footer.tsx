import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-800" style={{ backgroundColor: '#0d0d1f' }}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/logo/logo_header.png" 
                alt="JobsNow Logo" 
                className="h-8 w-20 h-20"
              />
            </Link>
            <p className="text-sm text-gray-300">
              Tìm công việc mơ ước của bạn hoặc tuyển dụng nhân tài tốt nhất.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Dành cho người tìm việc</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link to="/jobs" className="hover:text-white transition-colors">
                  Duyệt việc làm
                </Link>
              </li>
              <li>
                <Link to="/companies" className="hover:text-white transition-colors">
                  Công ty
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Dành cho nhà tuyển dụng</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link to="/auth/register" className="hover:text-white transition-colors">
                  Đăng tin tuyển dụng
                </Link>
              </li>
              <li>
                <Link to="/companies" className="hover:text-white transition-colors">
                  Tìm ứng viên
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Về chúng tôi</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-300">
          <p>&copy; {new Date().getFullYear()} JobsNow. Bảo lưu mọi quyền.</p>
        </div>
      </div>
    </footer>
  );
}

