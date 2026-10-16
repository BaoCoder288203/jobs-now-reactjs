import { Link } from 'react-router-dom';

export function ToolsPlaceholderPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Trang đang được xây dựng</h1>
      <p className="text-gray-600 mb-6">Công cụ này sẽ sớm có mặt.</p>
      <Link to="/" className="text-[#81d1f3] hover:text-[#5bb8e8] font-medium">
        ← Về trang chủ
      </Link>
    </div>
  );
}
