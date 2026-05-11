import { useCallback, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAdminCompaniesInfinite } from '@/modules/companies/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Building2, Search, Edit2, Trash2, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import type { Company } from '@/types';
import { useIntersectionFetchNext } from '@/hooks/useIntersectionFetchNext';

export function AdminCompaniesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const companiesQuery = useAdminCompaniesInfinite(10);

  const allLoaded = useMemo(
    () => companiesQuery.data?.pages.flatMap((p) => p.items) ?? [],
    [companiesQuery.data],
  );
  const totalFromServer = companiesQuery.data?.pages[0]?.pagination.total ?? 0;

  const filteredCompanies = useMemo(
    () =>
      allLoaded.filter(
        (company) =>
          company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.website?.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [allLoaded, searchTerm],
  );

  const fetchNext = useCallback(() => {
    void companiesQuery.fetchNextPage();
  }, [companiesQuery.fetchNextPage]);

  const sentinelRef = useIntersectionFetchNext(
    fetchNext,
    Boolean(companiesQuery.hasNextPage && !companiesQuery.isFetchingNextPage),
  );

  const handleDelete = async (companyId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa công ty này?')) return;
    console.log('Company deleted', companyId);
    toast.success('Đã xóa công ty');
  };

  const isLoading = companiesQuery.isPending;

  if (isLoading && allLoaded.length === 0) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />}>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">Company Management</h1>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company: Company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  {company.logo_url && (
                    <img
                      src={company.logo_url}
                      alt={company.name}
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{company.name}</h3>
                    {company.industry && (
                      <Badge variant="outline" className="text-xs">
                        {company.industries?.map((i) => i.name).join(', ') || company.industry?.name || '—'}
                      </Badge>
                    )}
                  </div>
                </div>

                {company.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{company.description}</p>
                )}

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  {company.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        {company.website}
                      </a>
                    </div>
                  )}
                  {company.company_size && <p>{company.company_size} employees</p>}
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <Link to={`/admin/companies/${company.id}`}>
                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(company.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {companiesQuery.hasNextPage ? (
          <div className="flex flex-col items-center gap-2 py-2">
            {companiesQuery.isFetchingNextPage ? <LoadingSpinner size="sm" /> : null}
            <div ref={sentinelRef} className="h-8 w-full" aria-hidden />
          </div>
        ) : null}

        {allLoaded.length === 0 && !isLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">No companies found</p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
