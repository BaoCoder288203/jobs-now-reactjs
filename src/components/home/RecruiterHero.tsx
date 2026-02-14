import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';

export function RecruiterHero() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handlePostJob = () => {
    if (user?.role?.name === 'recruiter' || user?.role?.name === 'employer') {
      navigate('/employer/jobs/create');
    }
  };

  return (
    <section className="relative bg-white py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Nơi gặp gỡ giữa doanh nghiệp và{' '}
              <span className="text-primary">10 triệu ứng viên chất lượng</span>
            </h1>
            <p className="text-xl text-gray-600">
              Tuyển người dễ dàng với JobsNow - Chúng tôi luôn có ứng viên phù hợp cho bạn
            </p>
            <Button
              onClick={handlePostJob}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg font-semibold group"
            >
              Đăng tin ngay!
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {/* Right: Image */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src="/images/recruiter-hero.png"
                alt="Recruiter"
                className="w-full h-auto rounded-lg shadow-2xl"
                onError={(e) => {
                  // Fallback nếu không có ảnh
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const placeholder = target.nextElementSibling as HTMLElement;
                  if (placeholder) placeholder.style.display = 'block';
                }}
              />
              <div
                className="hidden w-full h-96 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg shadow-2xl flex items-center justify-center"
                style={{ display: 'none' }}
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">👩‍💼</div>
                  <p className="text-gray-600">Recruiter Image</p>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
