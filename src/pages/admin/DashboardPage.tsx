import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminJobs } from '@/modules/jobs/hooks';
import { useAdminStats } from '@/modules/admin/hooks';
import { useCompanies } from '@/modules/companies/hooks';
import { useSkills } from '@/modules/skills/hooks';
import { Link } from 'react-router-dom';
import { Users, Building2, Briefcase, Sparkles, ArrowRight } from 'lucide-react';
import type { Job } from '@/types';

function getJobStatusBadge(job: Job) {
  if (job.isDeleted) return <Badge className="bg-gray-500 text-white">Đã xóa</Badge>;
  if (job.isExpired) return <Badge className="bg-amber-100 text-amber-800">Đã hết hạn</Badge>;
  if (job.isPending) return <Badge className="bg-blue-100 text-blue-800">Chờ duyệt</Badge>;
  if (job.isApproved) return <Badge className="bg-green-100 text-green-800">Đã duyệt</Badge>;
  return <Badge className="bg-red-100 text-red-800">Từ chối</Badge>;
}

export function AdminDashboardPage() {
  // const { user } = useAppSelector((state) => state.auth);

  const { data: adminJobs = [], isLoading: jobsLoading } = useAdminJobs();
  const { data: adminStats } = useAdminStats();
  const { data: companiesData } = useCompanies({ limit: 10 });
  const { data: skills = [] } = useSkills();

  const stats = [
    {
      title: 'Tổng người dùng',
      value: adminStats?.activeUsers ?? 0,
      icon: Users,
      link: '/admin/users',
      color: 'text-primary'
    },
    {
      title: 'Công ty',
      value: companiesData?.items?.length || 0,
      icon: Building2,
      link: '/admin/companies',
      color: 'text-accent'
    },
    {
      title: 'Việc làm',
      value: adminJobs.length,
      icon: Briefcase,
      link: '/admin/jobs',
      color: 'text-primary'
    },
    {
      title: 'Kỹ năng',
      value: skills.length,
      icon: Sparkles,
      link: '/admin/skills',
      color: 'text-accent'
    }
  ];

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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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
                    <div className="ml-4">
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

