import { useAppSelector } from '@/app/hooks';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { JobSeekerSidebar } from '@/components/layout/JobSeekerSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useJobs } from '@/modules/jobs/hooks';
import { useMyApplications } from '@/modules/applications/hooks';
import { useSavedJobs } from '@/modules/savedJobs/hooks';
import { useProfile } from '@/modules/profile/hooks';
import { JobCard } from '@/components/common/JobCard';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, Bookmark, TrendingUp, ArrowRight, User } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { Application } from '@/types';

export function JobSeekerDashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.id || '';

  const { data: recentJobs } = useJobs({ limit: 3 });
  const { data: applicationsData } = useMyApplications(userId);
  const { data: savedJobs } = useSavedJobs(userId);
  const { data: profile } = useProfile(userId);

  const stats = [
    {
      title: 'Đơn ứng tuyển',
      value: applicationsData?.length || 0,
      icon: Briefcase,
      link: '/job-seeker/applications',
      color: 'text-primary'
    },
    {
      title: 'Việc làm đã lưu',
      value: savedJobs?.length || 0,
      icon: Bookmark,
      link: '/job-seeker/saved-jobs',
      color: 'text-accent'
    },
    {
      title: 'CV của tôi',
      value: profile ? '1' : '0',
      icon: FileText,
      link: '/job-seeker/resumes',
      color: 'text-primary'
    }
  ];

  return (
    <DashboardLayout sidebar={<JobSeekerSidebar />}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Chào mừng trở lại, {user?.full_name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Đây là những gì đang diễn ra với tìm kiếm việc làm của bạn
          </p>
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
            <Link to="/job-seeker/applications">
              <Button variant="ghost" size="sm" className="gap-2">
                Xem tất cả
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {applicationsData && applicationsData.length > 0 ? (
              <div className="space-y-4">
                {applicationsData.slice(0, 3).map((application: Application) => (
                  <div
                    key={application.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {application.job?.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {application.job?.company?.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Ứng tuyển ngày {new Date(application.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="ml-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          application.status === 'approved'
                            ? 'bg-accent-light text-gray-900'
                            : application.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {application.status === 'approved' ? 'Đã duyệt' : application.status === 'rejected' ? 'Đã từ chối' : application.status === 'pending' ? 'Đang chờ' : application.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Chưa có đơn ứng tuyển nào</p>
                <Link to="/jobs">
                  <Button>Duyệt việc làm</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommended Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold">Việc làm đề xuất</CardTitle>
            <Link to="/jobs">
              <Button variant="ghost" size="sm" className="gap-2">
                Xem tất cả
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentJobs?.items && recentJobs.items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentJobs.items.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Hiện tại không có việc làm đề xuất</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

