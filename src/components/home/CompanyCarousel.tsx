import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompanies } from '@/modules/companies/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CompanyTopCard } from '@/components/common/CompanyHomePageCard';

export function CompanyCarousel() {
  const { data: companiesData, isLoading } = useCompanies({ limit: 20 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const rawCompanies = companiesData?.items || [];
  const companies = [...rawCompanies].sort((a, b) => (b.priority_level ?? 0) - (a.priority_level ?? 0));
  const maxIndex = Math.max(0, companies.length - itemsPerView);

  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width >= 1536) {
        setItemsPerView(4);
        return;
      }
      if (width >= 1280) {
        setItemsPerView(3);
        return;
      }
      if (width >= 768) {
        setItemsPerView(2);
        return;
      }
      setItemsPerView(1);
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [currentIndex, maxIndex]);

  const scrollToIndex = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex(clampedIndex);
    
    if (scrollContainerRef.current) {
      const firstChild = scrollContainerRef.current.children[0] as HTMLElement | undefined;
      const itemWidth = firstChild?.getBoundingClientRect().width || 0;
      const gap = 24; // gap-6 = 24px
      const scrollPosition = clampedIndex * (itemWidth + gap);
      scrollContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  const handlePrev = () => {
    scrollToIndex(currentIndex - 1);
  };

  const handleNext = () => {
    scrollToIndex(currentIndex + 1);
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </section>
    );
  }

  if (companies.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Top công ty đang tuyển dụng
            </h2>
            <p className="text-gray-600">
              Khám phá những công ty hàng đầu với môi trường làm việc lý tưởng
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              className="rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-hidden scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {companies.map((company) => (
            <div
              key={company.id}
              className="flex-shrink-0 w-[300px] md:w-[360px] xl:w-[380px]"
            >
              <CompanyTopCard company={company} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
