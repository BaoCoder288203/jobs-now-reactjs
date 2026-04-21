import { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RecruiterSidebar } from '@/components/layout/RecruiterSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useJobs } from '@/modules/jobs/hooks';
import { useCompanyApplications } from '@/modules/applications/hooks';
import { useMyCompany } from '@/modules/companies/hooks';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, ArrowRight } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getJobTypeLabel } from '@/constants/jobEnums';
import { getJobStatusBadge } from '@/utils/jobStatus';
import { getApplicationStatusBadge } from '@/utils/applicationStatus';
import { getSubscriptionStatus, type CompanySubscriptionStatus } from '@/services/subscription-plan.service';
import type { DashboardPreset } from '@/types/employer-dashboard';
import { useEmployerDashboardMetrics } from '@/modules/employer-dashboard/hooks';
import { AnalyticsDateFilter, type AnalyticsDateFilterValue } from '@/components/employer/dashboard/AnalyticsDateFilter';
import { DashboardKpiGrid, type RecruiterTrendMetric } from '@/components/employer/dashboard/DashboardKpiGrid';
import { DashboardTrendChart } from '@/components/employer/dashboard/DashboardTrendChart';
import { TopJobsTableCard } from '@/components/employer/dashboard/TopJobsTableCard';
import { DashboardDonutChart } from '@/components/employer/dashboard/DashboardDonutChart';
import { DashboardRatingBarChart } from '@/components/employer/dashboard/DashboardRatingBarChart';

export function RecruiterDashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [subscriptionStatus, setSubscriptionStatus] = useState<CompanySubscriptionStatus | null>(null);
  const [filter, setFilter] = useState<AnalyticsDateFilterValue>({
    preset: 'month',
    comparePrevious: true,
  });
  const [selectedTrendMetrics, setSelectedTrendMetrics] = useState<RecruiterTrendMetric[]>([
    'applications',
    'followers',
  ]);

  // Lấy company của recruiter hiện tại
  const { data: company, isLoading: companyLoading } = useMyCompany();
  const companyId = company?.id;

  // Lấy jobs của company này
  const { data: companyJobsData, isLoading: jobsLoading } = useJobs({
    company_id: companyId,
    limit: 100
  });

  // Lấy applications của company này
  const { data: companyApplications = [], isLoading: applicationsLoading } = useCompanyApplications(companyId);

  // Filter jobs chỉ của company này (đảm bảo chắc chắn)
  const companyJobs = companyJobsData?.items?.filter(job => job.company_id === companyId) || [];
  const canLoadMetrics = filter.preset !== 'custom' || (!!filter.from && !!filter.to);
  const metricsQuery = useMemo(
    () => ({
      preset: filter.preset as DashboardPreset,
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
  } = useEmployerDashboardMetrics(metricsQuery, !!companyId && canLoadMetrics);

  const isLoading = companyLoading || jobsLoading || applicationsLoading;

  useEffect(() => {
    getSubscriptionStatus()
      .then((data) => setSubscriptionStatus(data || null))
      .catch(() => setSubscriptionStatus(null));
  }, []);

  const accountStatusLabel = (status?: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'Đang chờ thanh toán';
      case 'PAID_ACTIVE':
        return 'Gói trả phí đang hoạt động';
      case 'TRIAL_ACTIVE':
        return 'Dùng thử đang hoạt động';
      case 'EXPIRED':
        return 'Gói đã hết hạn';
      case 'TRIAL_EXPIRED':
        return 'Dùng thử đã hết hạn';
      default:
        return 'Không xác định';
    }
  };

  const mapStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Đang chờ',
      REVIEWING: 'Đang xem',
      SHORTLISTED: 'Vào shortlist',
      INTERVIEWING: 'Phỏng vấn',
      HIRED: 'Tuyển',
      REJECTED: 'Từ chối',
      DRAFT: 'Nháp',
      PENDING_REVIEW: 'Chờ duyệt',
      PUBLISHED: 'Đã đăng',
    };
    return labels[status] ?? status;
  };

  const toggleTrendMetric = (metric: RecruiterTrendMetric) => {
    setSelectedTrendMetrics((prev) => {
      if (prev.includes(metric)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== metric);
      }
      return [...prev, metric];
    });
  };

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
        <div className="text-center py-12">
          <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Bạn chưa có thông tin công ty</p>
          <p className="text-sm text-gray-500 mb-6">
            Vui lòng tạo thông tin công ty trước khi quản lý việc làm và đơn ứng tuyển
          </p>
          <Link to="/employer/company">
            <Button>Tạo thông tin công ty</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<RecruiterSidebar />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Chào mừng trở lại, {user?.fullName}!
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý tin tuyển dụng và đơn ứng tuyển của bạn
            </p>
          </div>
        </div>

        <AnalyticsDateFilter value={filter} onChange={setFilter} />

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
                  {(metricsErrorData as { message?: string })?.message ?? 'Không thể tải dữ liệu dashboard.'}
                </CardContent>
              </Card>
            )}

            {metrics && !metricsLoading && !metricsError && (
              <>
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
                  <div className="xl:col-span-2">
                    <DashboardKpiGrid
                      kpis={metrics.kpis}
                      selectedTrendMetrics={selectedTrendMetrics}
                      onToggleTrendMetric={toggleTrendMetric}
                    />
                  </div>
                  <div className="xl:col-span-3">
                    <DashboardTrendChart
                      trend={metrics.trend}
                      showComparison={filter.comparePrevious}
                      selectedMetrics={selectedTrendMetrics}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
                  <div className="xl:col-span-5">
                    <TopJobsTableCard data={metrics.topJobs} />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <DashboardDonutChart
                      title="Phễu ứng tuyển"
                      data={metrics.applicationPipeline.map((item) => ({
                        status: mapStatusLabel(item.status),
                        count: item.count,
                      }))}
                    />
                    <DashboardDonutChart
                      title="Trạng thái bài viết"
                      data={metrics.postStatus.map((item) => ({
                        status: mapStatusLabel(item.status),
                        count: item.count,
                      }))}
                    />
                </div>

                <DashboardRatingBarChart data={metrics.ratingDistribution} />
              </>
            )}
          </>
        )}

        {subscriptionStatus && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold">Trạng thái tài khoản</CardTitle>
              <Link to="/employer/pricing">
                <Button variant="outline" size="sm">Quản lý gói</Button>
              </Link>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-1">
              <p>Trạng thái: {accountStatusLabel(subscriptionStatus.accountStatus)}</p>
              <p>Gói hiện tại: {subscriptionStatus.currentPlanName || 'Chưa có gói trả phí'}</p>
              <p>Còn lại: {subscriptionStatus.remainingJobPosts} lượt đăng, {subscriptionStatus.remainingAiScans} AI scan</p>
              <p>AI CV Builder trial: {subscriptionStatus.remainingAiCvBuilderTrials ?? 0}</p>
              <p>Hết hạn: {subscriptionStatus.expiresAt ? new Date(subscriptionStatus.expiresAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
            </CardContent>
          </Card>
        )}

        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold">Đơn ứng tuyển gần đây</CardTitle>
            <Link to="/employer/applications">
              <Button variant="ghost" size="sm" className="gap-2">
                Xem tất cả
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {companyApplications && companyApplications.length > 0 ? (
              <div className="space-y-4">
                {companyApplications.slice(0, 5).map((application) => (
                  <div
                    key={application.id}
                    className="flex flex-col items-start justify-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors md:flex-row md:items-start md:justify-between"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {application.job?.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {application.user?.fullName} • {application.user?.email}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Ứng tuyển ngày {new Date(application.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="ml-0 mt-1 flex items-center gap-3 md:ml-4 md:mt-0">
                      {getApplicationStatusBadge(application.status)}
                      <Link to={`/employer/applications/${application.id}`}>
                        <Button variant="outline" size="sm">
                          Xem
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Chưa có đơn ứng tuyển nào</p>
                <Link to="/employer/jobs/create">
                  <Button>Đăng tin tuyển dụng đầu tiên</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold">Tin tuyển dụng đang hoạt động</CardTitle>
            <Link to="/employer/jobs">
              <Button variant="ghost" size="sm" className="gap-2">
                Xem tất cả
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {companyJobs && companyJobs.length > 0 ? (
              <div className="space-y-4">
                {companyJobs.slice(0, 5).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {job.location} • {getJobTypeLabel(job.job_type)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Đăng ngày {new Date(job.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="ml-4">
                      {getJobStatusBadge(job)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Chưa có việc làm đang hoạt động</p>
                <Link to="/employer/jobs/create">
                  <Button>Đăng tin tuyển dụng đầu tiên</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

