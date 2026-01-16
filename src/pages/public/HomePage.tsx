import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useJobs } from '@/modules/jobs/hooks';
import { JobCard } from '@/components/common/JobCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { TopCompaniesSection } from '@/components/home/TopCompaniesSection';
import { Search, ArrowRight, Briefcase } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';

export function HomePage() {
  const { data: jobsData, isLoading } = useJobs({ limit: 6 });
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <AppLayout>
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Tìm Công Việc Mơ Ước
              <span className="text-primary"> Ngay Hôm Nay</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Khám phá hàng nghìn cơ hội việc làm từ các công ty hàng đầu.
              Bước tiếp theo trong sự nghiệp của bạn bắt đầu từ đây.
            </p>

            {/* Action Buttons - Only show if authenticated */}
            {isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/jobs">
                  <Button size="lg" className="gap-2">
                    <Search className="h-5 w-5" />
                    Duyệt việc làm
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button size="lg" variant="outline" className="gap-2">
                    Đăng tin tuyển dụng
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Việc làm nổi bật
              </h2>
              <p className="text-gray-600">
                Cơ hội được chọn lọc từ các công ty hàng đầu
              </p>
            </div>
            <Link to="/jobs">
              <Button variant="ghost" className="gap-2">
                Xem tất cả
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : jobsData?.items && jobsData.items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobsData.items.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Hiện tại không có việc làm nào</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Top Companies Section */}
      <TopCompaniesSection />

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Sẵn sàng cho bước tiếp theo?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng nghìn người tìm việc và nhà tuyển dụng đang sử dụng JobsNow
            để tìm kiếm cơ hội và nhân tài.
          </p>
          <Link to="/auth/register">
            <Button size="lg">Bắt đầu ngay</Button>
          </Link>
        </div>
      </section>
    </AppLayout>
  );
}

