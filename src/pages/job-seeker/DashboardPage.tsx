import { useAppSelector } from '@/app/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useJobs } from '@/modules/jobs/hooks';
import { useMyApplications } from '@/modules/applications/hooks';
import { useSavedJobs } from '@/modules/savedJobs/hooks';
import { useProfile } from '@/modules/profile/hooks';
import { useMyMatches, useRecalculateForProfile } from '@/modules/cv/hooks';
import { JobCard } from '@/components/common/JobCard';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, Bookmark, TrendingUp, ArrowRight, Sparkles, RefreshCw, Target } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Application } from '@/types';

function toAiMatchErrorMessage(rawMessage: string) {
  const message = rawMessage.toLowerCase();
  if (
    message.includes('no active candidate quota') ||
    message.includes('out of ai matching quota') ||
    message.includes('candidate subscription expired')
  ) {
    return 'Bạn chưa có lượt AI Matching khả dụng. Vui lòng vào trang Goi dich vu tai /user/pricing de mua hoac nang cap goi.';
  }
  return rawMessage;
}

export function JobSeekerDashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.userId ? String(user.userId) : '';
  const authProfileId = user?.profileId ?? undefined;

  const { data: recentJobs } = useJobs({ limit: 3 });
  const { data: profile } = useProfile(userId);
  const resolvedProfileId = profile?.profileId ?? authProfileId;
  const { data: applicationsData } = useMyApplications(resolvedProfileId, userId);
  const { data: savedJobs } = useSavedJobs(userId);
  const { data: myMatches, isLoading: matchesLoading } = useMyMatches(resolvedProfileId);
  const recalculate = useRecalculateForProfile();
  const queryClient = useQueryClient();

  const handleRecalculate = async () => {
    if (!resolvedProfileId) return;
    try {
      await recalculate.mutateAsync(resolvedProfileId);
      queryClient.invalidateQueries({ queryKey: ['ai', 'my-matches', resolvedProfileId] });
      toast.success('Đã cập nhật độ phù hợp');
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: string }).message)
          : '';
      toast.error(toAiMatchErrorMessage(message) || 'Cập nhật thất bại');
    }
  };

  const stats = [
    {
      title: 'Đơn ứng tuyển',
      value: applicationsData?.length || 0,
      icon: Briefcase,
      link: '/user/applications',
      color: 'text-primary'
    },
    {
      title: 'Việc làm đã lưu',
      value: savedJobs?.length || 0,
      icon: Bookmark,
      link: '/user/saved-jobs',
      color: 'text-accent'
    },
    {
      title: 'CV của tôi',
      value: profile ? '1' : '0',
      icon: FileText,
      link: '/user/resumes',
      color: 'text-primary'
    }
  ];

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Chào mừng trở lại, {user?.fullName}!
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
          <Link to="/user/applications">
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
                      className={`px-3 py-1 rounded-full text-xs font-medium ${application.status === 'approved'
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Việc làm phù hợp AI
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={handleRecalculate}
            disabled={recalculate.isPending || !resolvedProfileId}
          >
            <RefreshCw className={`h-4 w-4 ${recalculate.isPending ? 'animate-spin' : ''}`} />
            Cập nhật
          </Button>
        </CardHeader>
        <CardContent>
          {matchesLoading ? (
            <div className="text-center py-6 text-gray-500 text-sm">Đang tải...</div>
          ) : myMatches && myMatches.length > 0 ? (
            <div className="space-y-3">
              {myMatches.map((match) => {
                let scoreColor = 'text-red-600 bg-red-50';
                if (match.overallScore >= 80) scoreColor = 'text-green-700 bg-green-50';
                else if (match.overallScore >= 60) scoreColor = 'text-blue-700 bg-blue-50';
                else if (match.overallScore >= 40) scoreColor = 'text-yellow-700 bg-yellow-50';
                return (
                  <Link key={match.id} to={`/jobs/${match.jobId}`}>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Target className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{match.jobTitle}</h3>
                          <p className="text-sm text-gray-500 truncate">{match.companyName}</p>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${scoreColor}`}>
                          {match.overallScore}%
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Chưa có dữ liệu phù hợp</p>
              <p className="text-sm text-gray-500 mb-4">Nhấn "Cập nhật" để AI tính điểm phù hợp với các việc làm</p>
              <Button size="sm" onClick={handleRecalculate} disabled={recalculate.isPending || !resolvedProfileId}>
                {recalculate.isPending ? 'Đang tính...' : 'Tính ngay'}
              </Button>
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
  );

  return <div className="p-6">{content}</div>;
}

