import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RecruiterSidebar } from '@/components/layout/RecruiterSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CalendarDays, UserPlus, Users } from 'lucide-react';
import { useCompanyFollowers, useMyCompany } from '@/modules/companies/hooks';

const PAGE_SIZE = 24;

export function EmployerFollowersPage() {
  const [page, setPage] = useState(0);
  const { data: company, isLoading: companyLoading } = useMyCompany();
  const { data: followersPage, isLoading: followersLoading } = useCompanyFollowers(company?.id, page, PAGE_SIZE);

  const isLoading = companyLoading || followersLoading;

  const totalFollowers = useMemo(() => {
    if (followersPage) return followersPage.totalElements;
    return company?.follower_count ?? 0;
  }, [company?.follower_count, followersPage]);

  const visibleFollowers = followersPage?.content?.length ?? 0;

  const hasPrev = page > 0;
  const hasNext = followersPage ? page + 1 < followersPage.totalPages : false;

  if (isLoading) {
    return (
      <DashboardLayout sidebar={<RecruiterSidebar />}>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!company) {
    return (
      <DashboardLayout sidebar={<RecruiterSidebar />}>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Bạn chưa có thông tin công ty.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<RecruiterSidebar />}>
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Người theo dõi công ty</h1>
            <p className="mt-1 text-gray-600">Danh sách ứng viên đã theo dõi công ty của bạn.</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-right">
            <p className="text-xs text-gray-500">Tổng người theo dõi</p>
            <p className="text-2xl font-semibold text-gray-900">{totalFollowers}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-gray-500">Đang hiển thị</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">{visibleFollowers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-gray-500">Trang hiện tại</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">{page + 1}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-gray-500">Tổng số trang</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">{Math.max(followersPage?.totalPages ?? 0, 1)}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="mb-5 flex items-center gap-2 text-gray-900">
              <UserPlus className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Danh sách người theo dõi</h2>
            </div>

            {!followersPage?.content?.length ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
                <Users className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                <p className="text-gray-600">Chưa có ai theo dõi công ty.</p>
              </div>
            ) : (
              <>
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {followersPage.content.map((f) => (
                    <li
                      key={f.userId}
                      className="rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 overflow-hidden rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center">
                          {f.avatarUrl ? (
                            <img src={f.avatarUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-lg font-semibold text-gray-500">
                              {(f.fullName ?? '?').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-semibold text-gray-900">{f.fullName ?? '—'}</p>
                          <p className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {f.followedAt ? new Date(f.followedAt).toLocaleDateString('vi-VN') : 'Chưa rõ ngày theo dõi'}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-gray-500">
                    Hiển thị trang {page + 1} / {Math.max(followersPage.totalPages, 1)}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={!hasPrev} onClick={() => setPage((prev) => prev - 1)}>
                      Trước
                    </Button>
                    <Button variant="outline" size="sm" disabled={!hasNext} onClick={() => setPage((prev) => prev + 1)}>
                      Sau
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}