import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMyFollowedCompanies, useUnfollowCompany } from '@/modules/companies/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Building2, Users, MapPin, ExternalLink, HeartOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export function JobSeekerFollowedCompaniesPage() {
  const [page, setPage] = useState(0);
  const { data: pageData, isLoading } = useMyFollowedCompanies(page, 20);
  const unfollowMutation = useUnfollowCompany('');

  const companies = pageData?.content || [];

  const handleUnfollow = async (companyId: number, companyName: string) => {
    try {
      await unfollowMutation.mutateAsync(String(companyId));
      toast.success(`Đã bỏ theo dõi ${companyName}`);
    } catch (error) {
      toast.error('Lỗi khi bỏ theo dõi công ty. Vui lòng thử lại.');
    }
  };

  const content = (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Công ty đang theo dõi</h1>
        <p className="text-gray-600 mt-1">
          Quản lý các công ty mà bạn quan tâm và đang theo dõi
        </p>
      </div>

      {companies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {companies.map((company) => (
            <Card key={company.companyId} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl border border-gray-100 flex items-center justify-center bg-gray-50 p-2 overflow-hidden shrink-0">
                    {company.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt={company.companyName}
                        className="object-contain w-full h-full"
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/companies/${company.companyId}`}
                      className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-1"
                    >
                      {company.companyName}
                    </Link>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {company.followerCount || 0} người theo dõi
                      </div>
                      {company.address && (
                        <div className="flex items-center gap-1 line-clamp-1">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span className="line-clamp-1">{company.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Đã theo dõi từ {new Date(company.followedAt || '').toLocaleDateString('vi-VN')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                      onClick={() => handleUnfollow(company.companyId, company.companyName)}
                      disabled={unfollowMutation.isPending}
                    >
                      <HeartOff className="w-4 h-4" />
                      Bỏ theo dõi
                    </Button>
                    <Link to={`/companies/${company.companyId}`}>
                      <Button size="sm" className="gap-2">
                        Xem chi tiết
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa theo dõi công ty nào</h3>
            <p className="text-gray-600 mb-6 max-w-sm text-center">
              Khám phá và theo dõi các nhà tuyển dụng hàng đầu để cập nhật tin tức và việc làm mới nhất
            </p>
            <Link to="/companies">
              <Button>Tìm kiếm công ty</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {pageData && pageData.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
          >
            Trước
          </Button>
          <div className="flex items-center px-4 text-sm text-gray-600">
            Trang {page + 1} / {pageData.totalPages}
          </div>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page >= pageData.totalPages - 1}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return <div className="p-6">{content}</div>;
}
