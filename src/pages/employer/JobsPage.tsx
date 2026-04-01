import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RecruiterSidebar } from '@/components/layout/RecruiterSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useJobs, useDeleteJob } from '@/modules/jobs/hooks';
import { useMyCompany } from '@/modules/companies/hooks';
import { useMatchedCandidates, useRecalculateForJob } from '@/modules/cv/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Briefcase, Plus, Edit2, Trash2, MapPin, Calendar, Users, AlertCircle, Target, RefreshCw, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getJobTypeLabel } from '@/constants/jobEnums';
import { getJobStatusBadge } from '@/utils/jobStatus';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { HotTagBadge } from '@/components/common/HotTagBadge';
import { BoostJobModal } from '@/components/common/BoostJobModal';

function MatchedCandidatesSection({ jobId }: { jobId: number }) {
  const { data: candidates, isLoading } = useMatchedCandidates(jobId);
  const recalculate = useRecalculateForJob();
  const queryClient = useQueryClient();

  const handleRecalculate = async () => {
    try {
      await recalculate.mutateAsync(jobId);
      queryClient.invalidateQueries({ queryKey: ['ai', 'candidates', jobId] });
      toast.success('Đã cập nhật');
    } catch {
      toast.error('Cập nhật thất bại');
    }
  };

  if (isLoading) return <p className="text-sm text-gray-500 py-2">Đang tải...</p>;

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <Target className="h-4 w-4 text-primary" />
          Top ứng viên phù hợp
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRecalculate}
          disabled={recalculate.isPending}
          className="gap-1 text-xs h-7 px-2"
        >
          <RefreshCw className={`h-3 w-3 ${recalculate.isPending ? 'animate-spin' : ''}`} />
          Tính lại
        </Button>
      </div>
      {candidates && candidates.length > 0 ? (
        <div className="space-y-2">
          {candidates.slice(0, 5).map((c) => {
            let scoreColor = 'text-red-600 bg-red-50';
            if (c.overallScore >= 80) scoreColor = 'text-green-700 bg-green-50';
            else if (c.overallScore >= 60) scoreColor = 'text-blue-700 bg-blue-50';
            else if (c.overallScore >= 40) scoreColor = 'text-yellow-700 bg-yellow-50';
            return (
              <div key={c.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{c.profileName}</p>
                  {c.profileTitle && (
                    <p className="text-xs text-gray-500 truncate">{c.profileTitle}</p>
                  )}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ml-3 ${scoreColor}`}>
                  {c.overallScore}%
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-3">Chưa có dữ liệu. Nhấn "Tính lại" để bắt đầu.</p>
      )}
    </div>
  );
}

export function EmployerJobsPage() {
  const { data: company, isLoading: companyLoading } = useMyCompany();
  const companyId = company?.id;

  const { data: jobsData, isLoading: jobsLoading } = useJobs({
    company_id: companyId,
    limit: 100
  });
  const deleteJob = useDeleteJob();
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [boostModalJobInfo, setBoostModalJobInfo] = useState<{ id: number; title: string } | null>(null);

  const companyJobs = jobsData?.items?.filter(job => job.company_id === companyId) || [];

  const isLoading = companyLoading || jobsLoading;

  const handleDelete = async (jobId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa việc làm này?')) return;
    try {
      await deleteJob.mutateAsync(jobId);
      toast.success('Đã xóa việc làm');
    } catch {
      toast.error('Xóa việc làm thất bại');
    }
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
            Vui lòng tạo thông tin công ty trước khi quản lý việc làm
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tin tuyển dụng</h1>
            <p className="text-gray-600 mt-1">
              Quản lý tin tuyển dụng của bạn
            </p>
          </div>
          <Link to="/employer/jobs/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Đăng tin tuyển dụng
            </Button>
          </Link>
        </div>

        {companyJobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {companyJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Briefcase className="h-5 w-5 text-accent" />
                        <h3 className="text-xl font-semibold text-gray-900">
                          {job.title}
                        </h3>
                        {getJobStatusBadge(job)}
                        <HotTagBadge tag={(job as any).hotTag} compact />
                      </div>

                      {!job.isActive && job.note && (
                        <div className="flex items-start gap-2 p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium">Lý do từ chối:</span> {job.note}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        {job.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Đăng ngày {new Date(job.created_at).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {getJobTypeLabel(job.job_type)}
                        </div>
                        {job.boostActive && job.activeBoostPlanType && (
                          <div className="flex items-center gap-1 text-amber-700 font-medium">
                            <Zap className="h-4 w-4" />
                            Boost {job.activeBoostPlanType} den {job.activeBoostEndAt ? new Date(job.activeBoostEndAt).toLocaleDateString('vi-VN') : 'N/A'}
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2">
                        {job.description}
                      </p>
                    </div>

                    <div className="ml-6 flex flex-col gap-2">
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="gap-2 w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                        onClick={() => setBoostModalJobInfo({ id: Number(job.id), title: job.title })}
                      >
                        <Zap className="h-4 w-4" />
                        Boost
                      </Button>
                      <Link to={`/employer/jobs/${job.id}/edit`}>
                        <Button variant="outline" size="sm" className="gap-2 w-full">
                          <Edit2 className="h-4 w-4" />
                          Chỉnh sửa
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                        className="gap-2 w-full"
                      >
                        <Target className="h-4 w-4" />
                        Ứng viên
                        {expandedJobId === job.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(job.id)}
                        disabled={deleteJob.isPending}
                        className="gap-2 w-full text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Xóa
                      </Button>
                    </div>
                  </div>

                  {expandedJobId === job.id && (
                    <MatchedCandidatesSection jobId={Number(job.id)} />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Chưa có tin tuyển dụng nào</p>
              <Link to="/employer/jobs/create">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Đăng tin tuyển dụng đầu tiên
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      <BoostJobModal
        isOpen={boostModalJobInfo !== null}
        onClose={() => setBoostModalJobInfo(null)}
        jobId={boostModalJobInfo?.id || null}
        jobTitle={boostModalJobInfo?.title}
      />
    </DashboardLayout>
  );
}
