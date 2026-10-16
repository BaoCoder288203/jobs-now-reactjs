import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { useCompanies } from '@/modules/companies/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function TopCompaniesSection() {
  const { data: companiesData, isLoading } = useCompanies({ limit: 5 });

  const companies = companiesData?.items || [];

  return (
    <section className="bg-white px-4 py-16">
      <div className="container mx-auto mb-10 max-w-7xl text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Top công ty đang tuyển dụng
        </h2>
        <p className="mt-2 text-gray-600">
          Khám phá những công ty hàng đầu với môi trường làm việc lý tưởng
        </p>
      </div>

      <div className="container mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {isLoading && (
          <div className="col-span-full flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {!isLoading && companies.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">Không tìm thấy công ty nào</p>
          </div>
        )}

        {!isLoading &&
          companies.length > 0 &&
          companies.map((company) => (
            <div
              key={company.id}
              className="rounded-xl border border-gray-200 p-5 text-center transition hover:shadow-md"
            >
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="mx-auto mb-3 h-16 w-16 object-contain"
                />
              ) : (
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <h3 className="mb-1 min-h-[100px] text-lg font-semibold text-gray-800">
                {company.name}
              </h3>

              <Link
                to={`/companies/${company.id}`}
                className="inline-block text-sm font-medium text-primary hover:underline"
              >
                Xem việc làm
              </Link>
            </div>
          ))}
      </div>
    </section>
  );
}

