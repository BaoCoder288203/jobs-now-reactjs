import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCompanies } from '@/modules/companies/hooks';
import { CompanyCard } from '@/components/common/CompanyCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Building2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function CompanyListingPage() {
  const { data, isLoading } = useCompanies();
  const [searchQuery, setSearchQuery] = useState('');

  const companies = data?.items ?? [];
  const filteredCompanies =
    !searchQuery.trim()
      ? companies
      : companies.filter(
          (c) =>
            c.name?.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
            c.description?.toLowerCase().includes(searchQuery.trim().toLowerCase())
        );

  return (
    <AppLayout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Header theo UI ảnh: title + subtitle + search, không mascot */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Discover Companies</h1>
            <p className="text-gray-600 text-base mb-6">
              Explore company information and find the best workplace for you.
            </p>
            <div className="flex max-w-2xl rounded-lg overflow-hidden border-2 border-primary bg-white focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary-dark transition-colors">
              <div className="flex flex-1 items-center gap-2 pl-3 text-primary">
                <Search className="h-5 w-5 shrink-0" />
                <Input
                  type="search"
                  placeholder="Search for companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-11"
                />
              </div>
              <Button
                type="button"
                className="rounded-none bg-primary hover:bg-primary-dark text-white font-semibold px-6 h-11 shrink-0"
                onClick={() => setSearchQuery(searchQuery)}
              >
                Search
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredCompanies.length > 0 ? (
            <>
              <div className="mb-4 text-sm text-gray-600">
                {searchQuery.trim()
                  ? `Tìm thấy ${filteredCompanies.length} công ty`
                  : `Tìm thấy ${data?.pagination?.total ?? companies.length} công ty`}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompanies.map((company) => (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    jobCount={company.create_job_count ?? 0}
                  />
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

