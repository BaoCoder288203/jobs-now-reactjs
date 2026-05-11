import { useCallback, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  useAdminJobsInfinite,
  useDeleteJob,
  useApproveJob,
  useRejectJob,
  useUnpublishJob,
} from '@/modules/jobs/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Briefcase, Search, Trash2, Building2, MapPin, CheckCircle, XCircle, Eye } from 'lucide-react';
import { getJobTypeLabel } from '@/constants/jobEnums';
import { getJobStatusBadge } from '@/utils/jobStatus';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import type { Job } from '@/types';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useIntersectionFetchNext } from '@/hooks/useIntersectionFetchNext';
import { RichTextContent } from '@/components/ui/RichTextContent';

export function AdminJobsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rejectModal, setRejectModal] = useState<{ jobId: string; jobTitle: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const statusParam = statusFilter === 'all' ? undefined : statusFilter;
  const jobsQuery = useAdminJobsInfinite(statusParam, 10);
  const deleteJob = useDeleteJob();
  const approveJob = useApproveJob();
  const rejectJob = useRejectJob();
  const unpublishJob = useUnpublishJob();

  const allLoaded = useMemo(() => jobsQuery.data?.pages.flatMap((p) => p.items) ?? [], [jobsQuery.data]);
  const totalFromServer = jobsQuery.data?.pages[0]?.totalCount ?? 0;

  const filteredJobs = useMemo(
    () =>
      allLoaded.filter((job: Job) => {
        const matchesSearch =
          job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      }),
    [allLoaded, searchTerm],
  );

  const fetchNext = useCallback(() => {
    void jobsQuery.fetchNextPage();
  }, [jobsQuery.fetchNextPage]);

  const jobsSentinelRef = useIntersectionFetchNext(
    fetchNext,
    Boolean(jobsQuery.hasNextPage && !jobsQuery.isFetchingNextPage),
  );

  const handleDelete = async (jobId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa việc làm này?')) return;
    try {
      await deleteJob.mutateAsync(jobId);
      toast.success('Đã xóa việc làm');
    } catch (error) {
      toast.error('Xóa việc làm thất bại');
    }
  };

  const handleApprove = async (jobId: string) => {
    try {
      await approveJob.mutateAsync(jobId);
      toast.success('Đã duyệt việc làm');
    } catch (error: unknown) {
      toast.error((error as { message?: string })?.message ?? 'Duyệt thất bại');
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectModal?.jobId) return;
    try {
      await rejectJob.mutateAsync({ jobId: rejectModal.jobId, reason: rejectReason || 'Không đạt yêu cầu' });
      toast.success('Đã từ chối việc làm');
      setRejectModal(null);
      setRejectReason('');
    } catch (error: unknown) {
      toast.error((error as { message?: string })?.message ?? 'Từ chối thất bại');
    }
  };

  const handleUnpublish = async (jobId: string) => {
    try {
      await unpublishJob.mutateAsync(jobId);
      toast.success('Đã gỡ bài');
    } catch (error: unknown) {
      toast.error((error as { message?: string })?.message ?? 'Gỡ bài thất bại');
    }
  };

  const isRejected = (job: Job) =>
    !job.isDeleted && !job.isExpired && !job.isPending && !job.isApproved;

  const isLoading = jobsQuery.isPending;

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">Quản lý việc làm</h1>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm theo tên job hoặc công ty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Tất cả</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Đã từ chối</option>
              </select>
            </div>
          </CardContent>
        </Card>
        <p className="text-gray-600 mt-1">
          Tổng {totalFromServer}
          {allLoaded.length < totalFromServer ? ` · đã tải ${allLoaded.length}` : ''}
          {searchTerm.trim() ? ` · sau lọc: ${filteredJobs.length}` : ''}
        </p>
        {/* Jobs List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
        <div className="space-y-4">
          {filteredJobs.map((job: Job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 sm:gap-3 mb-2 flex-wrap">
                      <Briefcase className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 break-words">
                        {job.title}
                      </h3>
                      <div className="shrink-0">{getJobStatusBadge(job)}</div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1 min-w-0">
                        <Building2 className="h-4 w-4 shrink-0" />
                        <span className="truncate">{job.company?.name}</span>
                      </div>
                      {job.location && (
                        <div className="flex items-center gap-1 min-w-0">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </div>
                      )}
                      {job.job_type && (
                        <Badge variant="outline">{getJobTypeLabel(job.job_type)}</Badge>
                      )}
                    </div>

                    {job.description && (
                      <RichTextContent
                        html={job.description}
                        className="!text-[11px] sm:!text-xs text-gray-600 line-clamp-2 mb-2 [&_*]:!text-inherit"
                      />
                    )}

                    <p className="text-xs text-gray-500">
                      Đăng {job.created_at ? new Date(job.created_at).toLocaleDateString() : '—'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap md:ml-6 md:grid-cols-none md:justify-end">
                    {job.isPending && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 w-full sm:w-auto"
                          asChild
                        >
                          <Link to={`/jobs/${job.id}`}>
                            <Eye className="h-4 w-4" />
                            Xem
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          className="gap-1 bg-[#90D3B4] text-white hover:bg-[#90D3B4]/80 w-full sm:w-auto"
                          onClick={() => handleApprove(job.id)}
                          disabled={approveJob.isPending}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Duyệt
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-red-600 hover:text-red-700 w-full sm:w-auto"
                          onClick={() => setRejectModal({ jobId: job.id, jobTitle: job.title ?? '' })}
                          disabled={rejectJob.isPending}
                        >
                          <XCircle className="h-4 w-4" />
                          Từ chối
                        </Button>
                      </>
                    )}
                    {job.isApproved && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 w-full sm:w-auto"
                          asChild
                        >
                          <Link to={`/jobs/${job.id}`}>
                            <Eye className="h-4 w-4" />
                            Xem
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 w-full sm:w-auto"
                          onClick={() => handleUnpublish(job.id)}
                          disabled={unpublishJob.isPending}
                        >
                          Gỡ bài
                        </Button>
                      </>
                    )}
                    {isRejected(job) && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 w-full sm:w-auto"
                          asChild
                        >
                          <Link to={`/jobs/${job.id}`}>
                            <Eye className="h-4 w-4" />
                            Xem
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          className="gap-1 bg-[#90D3B4] text-white hover:bg-[#90D3B4]/80 w-full sm:w-auto"
                          onClick={() => handleApprove(job.id)}
                          disabled={approveJob.isPending}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Cho phép đăng lại
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(job.id)}
                      disabled={deleteJob.isPending}
                      className="text-red-600 hover:text-red-700 w-full sm:w-auto col-span-2 sm:col-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
        {jobsQuery.hasNextPage && !isLoading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            {jobsQuery.isFetchingNextPage ? <LoadingSpinner size="sm" /> : null}
            <div ref={jobsSentinelRef} className="h-8 w-full" aria-hidden />
          </div>
        ) : null}

        {!isLoading && allLoaded.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">Không có việc làm nào</p>
            </CardContent>
          </Card>
        ) : null}
        {!isLoading && allLoaded.length > 0 && filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">Không có tin khớp tìm kiếm</p>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Reject reason modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Từ chối việc làm</h3>
              <p className="text-sm text-gray-600 mb-4">
                {rejectModal.jobTitle}
              </p>
              <div className="space-y-2 mb-4">
                <Label>Lý do từ chối (tùy chọn)</Label>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="Nhập lý do từ chối..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectModal(null);
                    setRejectReason('');
                  }}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleRejectSubmit}
                  disabled={rejectJob.isPending}
                  className="text-white bg-red-500 hover:bg-red-700"
                >
                  {rejectJob.isPending ? 'Đang gửi...' : 'Từ chối'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
