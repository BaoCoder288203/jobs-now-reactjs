import { AppLayout } from '@/components/layout/AppLayout';
import { useCompanies } from '@/modules/companies/hooks';
import { CompanyCard } from '@/components/common/CompanyCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Building2 } from 'lucide-react';

export function CompanyListingPage() {
  const { data, isLoading } = useCompanies();

  return (
    <AppLayout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Công ty</h1>
            <p className="text-gray-600">Khám phá các công ty hàng đầu và cơ hội việc làm của họ</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : data?.items && data.items.length > 0 ? (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Tìm thấy {data.pagination.total} công ty
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.items.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Không tìm thấy công ty nào</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

