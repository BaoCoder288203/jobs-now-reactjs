import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdminJobs } from '@/modules/jobs/hooks';
import { useAdminDashboardMetrics } from '@/modules/admin/hooks';
import { useCompanies } from '@/modules/companies/hooks';
import { Link } from 'react-router-dom';
import { Building2, Briefcase, ArrowRight } from 'lucide-react';
import { getJobStatusBadge } from '@/utils/jobStatus';
import {
  AdminAnalyticsDateFilter,
  type AdminAnalyticsDateFilterValue,
} from '@/components/admin/dashboard/AdminAnalyticsDateFilter';
import { AdminDashboardKpiGrid } from '@/components/admin/dashboard/AdminDashboardKpiGrid';
import { AdminDashboardTrendChart } from '@/components/admin/dashboard/AdminDashboardTrendChart';
import { AdminDashboardDonutChart } from '@/components/admin/dashboard/AdminDashboardDonutChart';
import { AdminTopPlansTableCard } from '@/components/admin/dashboard/AdminTopPlansTableCard';
import type { AdminDashboardPreset } from '@/types/admin-dashboard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function AdminDashboardPage() {
  const [filter, setFilter] = useState<AdminAnalyticsDateFilterValue>({
    preset: 'month',
    comparePrevious: true,
  });

  const { data: adminJobs = [], isLoading: jobsLoading } = useAdminJobs();
  const { data: companiesData } = useCompanies({ limit: 10 });
  const canLoadMetrics = filter.preset !== 'custom' || (!!filter.from && !!filter.to);
  const metricsQuery = useMemo(
    () => ({
      preset: filter.preset as AdminDashboardPreset,
      from: filter.from,
      to: filter.to,
      tz: 'Asia/Ho_Chi_Minh',
      comparePrevious: filter.comparePrevious,
    }),
    [filter],
  );
  const {
    data: metrics,
    isLoading: metricsLoading,
    isError: metricsError,
    error: metricsErrorData,
  } = useAdminDashboardMetrics(metricsQuery, canLoadMetrics);

  const statusLabel: Record<string, string> = {
    PENDING: 'Pending',
    PAID: 'Paid',
    FAILED: 'Failed',
    CANCELLED: 'Cancelled',
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Trang quản trị
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý người dùng, công ty và nội dung nền tảng
          </p>
        </div>

        <AdminAnalyticsDateFilter value={filter} onChange={setFilter} />

        {!canLoadMetrics && (
          <Card>
            <CardContent className="py-6 text-sm text-gray-600">
              Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc để xem dữ liệu theo tùy chọn.
            </CardContent>
          </Card>
        )}

        {canLoadMetrics && (
          <>
            {metricsLoading && (
              <Card>
                <CardContent className="flex justify-center py-12">
                  <LoadingSpinner />
                </CardContent>
              </Card>
            )}

            {metricsError && (
              <Card>
                <CardContent className="py-6 text-sm text-red-600">
                  {(metricsErrorData as { message?: string })?.message ?? 'Không thể tải dữ liệu dashboard admin.'}
                </CardContent>
              </Card>
            )}

            {metrics && !metricsLoading && !metricsError && (
              <>
                <AdminDashboardKpiGrid kpis={metrics.kpis} />

                <div className="grid grid-cols-1">
                  <div className="col-span-5">
                    <AdminDashboardTrendChart trend={metrics.trend} showComparison={filter.comparePrevious} />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <AdminDashboardDonutChart
                    title="Phân bổ trạng thái đơn hàng"
                    data={metrics.orderStatusDistribution.map((item) => ({
                      label: statusLabel[item.status] ?? item.status,
                      value: item.count,
                    }))}
                  />
                  <AdminDashboardDonutChart
                    title="Phân bổ theo scope"
                    data={metrics.scopeDistribution.map((item) => ({
                      label: item.scope,
                      value: item.orders,
                    }))}
                  />
                </div>
                <AdminTopPlansTableCard data={metrics.topPlans} />
              </>
            )}
          </>
        )}

        {/* Recent Companies */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold">Công ty gần đây</CardTitle>
            <Link to="/admin/companies">
              <Button variant="ghost" size="sm" className="gap-2">
                Xem tất cả
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {companiesData?.items && companiesData.items.length > 0 ? (
              <div className="space-y-4">
                {companiesData.items.slice(0, 5).map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {company.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {company.industries?.map((i) => i.name).join(', ') || company.industry?.name || '—'} • {company.address}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Tạo ngày {new Date(company.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="ml-4">
                      <Link to={`/admin/companies/${company.id}`}>
                        <Button variant="outline" size="sm">
                          Quản lý
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Chưa có công ty nào</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold">Tin tuyển dụng gần đây</CardTitle>
            <Link to="/admin/jobs">
              <Button variant="ghost" size="sm" className="gap-2">
                Xem tất cả
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <div className="text-center py-8 text-gray-500">Đang tải...</div>
            ) : adminJobs.length > 0 ? (
              <div className="space-y-4">
                {adminJobs.slice(0, 5).map((job) => (
                  <div
                    key={job.id}
                    className="flex flex-col items-start justify-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {job.company?.name} • {job.location}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Đăng ngày {new Date(job.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="ml-0 md:ml-4">
                      {getJobStatusBadge(job)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Chưa có việc làm nào</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

