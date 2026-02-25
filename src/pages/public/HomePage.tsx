import { AppLayout } from '@/components/layout/AppLayout';
import { useAppSelector } from '@/app/hooks';
import { SearchBar } from '@/components/home/SearchBar';
import { BannerSlider } from '@/components/home/BannerSlider';
import { FeaturedCompaniesSection } from '@/components/home/FeaturedCompaniesSection';
import { CompanyCarousel } from '@/components/home/CompanyCarousel';
import { JobCarousel } from '@/components/home/JobCarousel';
import { AIFeaturesSection } from '@/components/home/AIFeaturesSection';

export function HomePage() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const userRole = user?.role || '';

  const isJobSeeker = isAuthenticated && userRole === 'ROLE_JOBSEEKER';

  return (
    <AppLayout>
      <BannerSlider />
      <FeaturedCompaniesSection />
      {isJobSeeker && (
        <section className="bg-gradient-to-b from-gray-50 to-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Tìm Công Việc Mơ Ước
                <span className="text-primary"> Ngay Hôm Nay</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Khám phá hàng nghìn cơ hội việc làm từ các công ty hàng đầu.
                Bước tiếp theo trong sự nghiệp của bạn bắt đầu từ đây.
              </p>
            </div>
            <SearchBar />
          </div>
        </section>
      )}
      <JobCarousel />
      <CompanyCarousel />
      <AIFeaturesSection />
    </AppLayout>
  );
}

