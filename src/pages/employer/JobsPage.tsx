import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RecruiterSidebar } from '@/components/layout/RecruiterSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useJobs, useDeleteJob } from '@/modules/jobs/hooks';
import { useMyCompany } from '@/modules/companies/hooks';
import { useMatchedCandidates, useRecalculateForJob } from '@/modules/cv/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Briefcase, Plus, Edit2, Trash2, MapPin, Calendar, Users, AlertCircle, Target, RefreshCw, ChevronDown, ChevronUp, Zap, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getJobTypeLabel } from '@/constants/jobEnums';
import { getJobStatusBadge } from '@/utils/jobStatus';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { HotTagBadge } from '@/components/common/HotTagBadge';
import { BoostJobModal } from '@/components/common/BoostJobModal';
import { RichTextContent } from '@/components/ui/RichTextContent';
import { Input } from '@/components/ui/input';
import { toLocalDateKey } from '@/utils/dateFilter';

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
  const [jobToDelete, setJobToDelete] = useState<{ id: string; title: string } | null>(null);
  const [jobSearch, setJobSearch] = useState('');
  const [jobDateFrom, setJobDateFrom] = useState('');
  const [jobDateTo, setJobDateTo] = useState('');

  const companyJobs = jobsData?.items?.filter(job => job.company_id === companyId) || [];

  const filteredCompanyJobs = useMemo(() => {
    let list = companyJobs;
    const q = jobSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((job) => {
        const title = (job.title || '').toLowerCase();
        const loc = (job.location || '').toLowerCase();
        return title.includes(q) || loc.includes(q);
      });
    }
    if (jobDateFrom) {
      list = list.filter((job) => {
        const key = toLocalDateKey(job.created_at);
        return key >= jobDateFrom;
      });
    }
    if (jobDateTo) {
      list = list.filter((job) => {
        const key = toLocalDateKey(job.created_at);
        return key <= jobDateTo;
      });
    }
    return list;
  }, [companyJobs, jobSearch, jobDateFrom, jobDateTo]);

  const hasActiveJobFilters = Boolean(jobSearch.trim() || jobDateFrom || jobDateTo);

  const isLoading = companyLoading || jobsLoading;

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;
    try {
      await deleteJob.mutateAsync(jobToDelete.id);
      toast.success('Đã xóa việc làm thành công');
      setJobToDelete(null);
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
              Tin tuyển dụng
            </h1>
            <p className="mt-1 text-sm text-gray-600 sm:text-base">
              Quản lý tin tuyển dụng của bạn
            </p>
          </div>
          <Link to="/employer/jobs/create" className="w-full shrink-0 sm:w-auto">
            <Button className="w-full gap-2 sm:w-auto">
              <Plus className="h-4 w-4" />
              Đăng tin tuyển dụng
            </Button>
          </Link>
        </div>

        {companyJobs.length > 0 && (
          <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50/80 p-4">
            <div className="grid w-full min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
              <div className="min-w-0 sm:col-span-2 lg:col-span-2">
                <label htmlFor="employer-job-search" className="mb-1.5 block text-xs font-medium text-gray-600">
                  Tìm theo tên tin / địa điểm
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="employer-job-search"
                    type="search"
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    placeholder="Ví dụ: Developer, Hà Nội..."
                    className="h-9 pl-9"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="employer-job-from" className="mb-1.5 block text-xs font-medium text-gray-600">
                  Đăng từ ngày
                </label>
                <Input
                  id="employer-job-from"
                  type="date"
                  value={jobDateFrom}
                  onChange={(e) => setJobDateFrom(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end lg:flex-col">
                <div className="min-w-0 flex-1">
                  <label htmlFor="employer-job-to" className="mb-1.5 block text-xs font-medium text-gray-600">
                    Đến ngày
                  </label>
                  <Input
                    id="employer-job-to"
                    type="date"
                    value={jobDateTo}
                    onChange={(e) => setJobDateTo(e.target.value)}
                    className="h-9"
                  />
                </div>
                {hasActiveJobFilters && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 shrink-0 whitespace-nowrap"
                    onClick={() => {
                      setJobSearch('');
                      setJobDateFrom('');
                      setJobDateTo('');
                    }}
                  >
                    Xóa lọc
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {companyJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Chưa có tin tuyển dụng nào</p>
              <Link to="/employer/jobs/create" className="w-full sm:w-auto">
                <Button className="w-full gap-2 sm:w-auto">
                  <Plus className="h-4 w-4" />
                  Đăng tin tuyển dụng đầu tiên
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : filteredCompanyJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Search className="mb-3 h-10 w-10 text-gray-400" />
              <p className="text-center text-gray-600">Không có tin nào khớp bộ lọc</p>
              <p className="mt-1 text-center text-sm text-gray-500">Thử đổi từ khóa hoặc khoảng ngày đăng tin</p>
              {hasActiveJobFilters && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setJobSearch('');
                    setJobDateFrom('');
                    setJobDateTo('');
                  }}
                >
                  Xóa lọc
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredCompanyJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-start gap-2">
                        <Briefcase className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                        <div className="group relative min-w-0 flex-1">
                          <h3
                            title={job.title}
                            className="line-clamp-2 break-words text-lg font-semibold text-gray-900 md:text-xl"
                          >
                            {job.title}
                          </h3>
                          <div
                            role="tooltip"
                            className="pointer-events-none absolute left-0 top-full z-50 mt-1.5 max-w-[min(100vw-3rem,24rem)] whitespace-normal rounded-md border border-gray-200 bg-gray-900 px-2.5 py-1.5 text-left text-xs font-medium text-white shadow-lg opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                          >
                            {job.title}
                          </div>
                        </div>
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

                      <RichTextContent
                        html={job.description ?? ''}
                        className="text-sm text-gray-600 line-clamp-2 [&_p]:mb-1 [&_p:last-child]:mb-0"
                        emptyPlaceholder=""
                      />
                    </div>

                    <div className="flex w-full shrink-0 flex-col gap-2 md:ml-6 md:w-auto">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 w-full"
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
                        onClick={() => setJobToDelete({ id: job.id, title: job.title })}
                        disabled={deleteJob.isPending}
                        className="gap-2 w-full"
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
        )}
      </div>

      <BoostJobModal
        isOpen={boostModalJobInfo !== null}
        onClose={() => setBoostModalJobInfo(null)}
        jobId={boostModalJobInfo?.id || null}
        jobTitle={boostModalJobInfo?.title}
      />

      <Dialog open={jobToDelete !== null} onOpenChange={(open) => !open && setJobToDelete(null)}>
        <DialogContent className="max-w-md p-6" onClose={() => setJobToDelete(null)}>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa việc làm</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa việc làm <span className="font-semibold text-gray-900 border-b border-gray-300 pb-0.5">{jobToDelete?.title}</span> không?
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setJobToDelete(null)}
                disabled={deleteJob.isPending}
              >
                Hủy bỏ
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleConfirmDelete}
                disabled={deleteJob.isPending}
              >
                {deleteJob.isPending ? 'Đang xóa...' : 'Xóa việc làm'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
