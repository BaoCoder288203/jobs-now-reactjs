import { useAppSelector } from '@/app/hooks';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RecruiterSidebar } from '@/components/layout/RecruiterSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useJobs } from '@/modules/jobs/hooks';
import { useCompanyApplications } from '@/modules/applications/hooks';
import { useMyCompany } from '@/modules/companies/hooks';
import { Link } from 'react-router-dom';
import { Briefcase, Users, FileText, ArrowRight, Plus } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function RecruiterDashboardPage() {
  const { user } = useAppSelector((state) => state.auth);

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

  const isLoading = companyLoading || jobsLoading || applicationsLoading;

  const stats = [
    {
      title: 'Việc làm đang hoạt động',
      value: companyJobs.length,
      icon: Briefcase,
      link: '/employer/jobs',
      color: 'text-primary'
    },
    {
      title: 'Tổng đơn ứng tuyển',
      value: companyApplications.length,
      icon: FileText,
      link: '/employer/applications',
      color: 'text-accent'
    },
    {
      title: 'Ứng viên mới',
      value: companyApplications.filter(
        (app) => new Date(app.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      icon: Users,
      link: '/employer/applications',
      color: 'text-primary'
    }
  ];

  if (isLoading) {
    return (
      <DashboardLayout sidebar={<RecruiterSidebar />}>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  // Nếu recruiter chưa có company, hiển thị thông báo
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
          <Link to="/employer/jobs/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Đăng tin tuyển dụng
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} to={stat.link}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <p className="text-xs text-gray-500 mt-1">Xem tất cả →</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

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
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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
                    <div className="ml-4 flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${application.status === 'approved'
                          ? 'bg-accent-light text-gray-900'
                          : application.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-700'
                          }`}
                      >
                        {application.status === 'approved' ? 'Đã duyệt' : application.status === 'rejected' ? 'Đã từ chối' : application.status === 'pending' ? 'Đang chờ' : application.status}
                      </span>
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
                        {job.location} • {job.job_type}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Đăng ngày {new Date(job.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="ml-4">
                      <Link to={`/employer/jobs/${job.id}`}>
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

