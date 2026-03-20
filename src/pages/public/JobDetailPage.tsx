import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { AppLayout } from '@/components/layout/AppLayout';
import { useJobDetail } from '@/modules/jobs/hooks';
import { useApplyJob, useMyApplications } from '@/modules/applications/hooks';
import { useSaveJob, useUnsaveJob, useSavedJobs } from '@/modules/savedJobs/hooks';
import { useResumes } from '@/modules/resumes/hooks';
import { useCalculateJobMatch } from '@/modules/cv/hooks';
import { JobMatchResultCard } from '@/components/ai/JobMatchResultCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { MapPin, Clock, DollarSign, Building2, ArrowLeft, Bookmark, BookmarkCheck, Send, Briefcase, Target } from 'lucide-react';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { getJobTypeLabel } from '@/constants/jobEnums';
import { toast } from 'sonner';
import type { JobMatchResponse } from '@/services/ai.service';

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const userId = user?.userId ? String(user.userId) : '';
  const profileId = user?.profileId ?? undefined;
  const { openLoginModal } = useAuthModal();

  const { data: job, isLoading: jobLoading } = useJobDetail(id!);
  const { data: myApplications = [] } = useMyApplications(profileId, userId);
  const { data: savedJobs = [] } = useSavedJobs(profileId ? String(profileId) : '');
  const { data: resumes = [] } = useResumes(userId);

  const applyJob = useApplyJob();
  const saveJob = useSaveJob();
  const unsaveJob = useUnsaveJob();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [coverLetter, setCoverLetter] = useState('');
  const [matchResult, setMatchResult] = useState<JobMatchResponse | null>(null);
  const calculateMatch = useCalculateJobMatch();

  const hasApplied = myApplications.some(app => app.job_id === id);
  const isSaved = savedJobs.some(sj => String(sj.jobId) === id);
  const defaultResume = resumes.find(r => r.is_default);

  const isAvailable =
    job != null &&
    job.isActive === true &&
    job.isApproved === true &&
    job.isDeleted !== true &&
    job.isExpired !== true;

  const handleApply = async () => {
    if (!id || !userId) return;
    if (user?.profileId == null) {
      toast.warning('Vui lòng hoàn thiện hồ sơ trước khi ứng tuyển');
      return;
    }
    if (!selectedResumeId && !defaultResume) {
      toast.warning('Vui lòng tải CV lên trước hoặc chọn một CV');
      return;
    }

    try {
      await applyJob.mutateAsync({
        userId,
        jobId: id,
        resumeId: selectedResumeId || defaultResume?.id,
        coverLetter: coverLetter || undefined,
        profileId: user.profileId
      });
      setShowApplyModal(false);
      setCoverLetter('');
      toast.success('Ứng tuyển thành công!');
    } catch (error: any) {
      const msg = error?.message ?? '';
      if (msg.toLowerCase().includes('already applied')) {
        toast.error('Bạn đã ứng tuyển công việc này rồi');
      } else if (msg.toLowerCase().includes('not available')) {
        toast.error('Công việc không còn khả dụng');
      } else {
        toast.error(msg || 'Ứng tuyển thất bại');
      }
    }
  };

  const handleSaveJob = async () => {
    if (!id || !profileId) {
      if (!isAuthenticated) {
        toast.warning('Vui lòng đăng nhập để lưu việc làm');
        openLoginModal('job_seeker');
      } else {
        toast.warning('Vui lòng hoàn thiện hồ sơ trước khi lưu việc làm');
      }
      return;
    }
    
    try {
      if (isSaved) {
        await unsaveJob.mutateAsync({ profileId: String(profileId), jobId: id });
      } else {
        await saveJob.mutateAsync({ profileId: String(profileId), jobId: id });
      }
    } catch (error: any) {
      toast.error(error.message || 'Lưu việc làm thất bại');
    }
  };

  if (jobLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (!job) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">Không tìm thấy việc làm</p>
          <Link to="/jobs">
            <Button variant="outline" className="mt-4">
              Quay lại danh sách việc làm
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const salaryText = (() => {
    if (!job.salary_min && !job.salary_max) return 'Thỏa thuận';
    const min = job.salary_min ? job.salary_min / 1_000_000 : null;
    const max = job.salary_max ? job.salary_max / 1_000_000 : null;
    if (min && max) return `${min} - ${max} triệu`;
    if (min && !max) return `Từ ${min} triệu`;
    if (!min && max) return `Đến ${max} triệu`;
    return 'Thỏa thuận';
  })();

  const experienceText = (() => {
    if (!job.yearsOfExperience) return 'Không yêu cầu';
    switch (job.yearsOfExperience) {
      case '0':
        return 'Không yêu cầu';
      case '1':
        return 'Từ 1 năm';
      case '1-3':
        return '1 - 3 năm';
      case '3-5':
        return '3 - 5 năm';
      case '5+':
        return 'Từ 5 năm trở lên';
      default:
        return job.yearsOfExperience;
    }
  })();

  const deadlineInfo = (() => {
    const raw = job.deadline ?? job.expired_at;
    if (!raw) return null;
    const d = new Date(raw);
    const today = new Date();
    const diffMs = d.getTime() - today.getTime();
    const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const dateText = d.toLocaleDateString('vi-VN');
    return { dateText, diffDays };
  })();

  const shortLocation = (() => {
    if (!job.location) return 'Không xác định';
    const parts = job.location.split(',');
    const last = parts[parts.length - 1]?.trim();
    return last || job.location;
  })();

  return (
    <AppLayout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link to="/jobs">
            <Button variant="ghost" className="mb-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách việc làm
            </Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex-1 min-w-0">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2 break-words">
                        {job.title}
                      </h1>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Building2 className="h-5 w-5 mr-2" />
                        <Link
                          to={`/companies/${job.company_id}`}
                          className="hover:text-gray-900 font-medium truncate"
                        >
                          {job.company?.name}
                        </Link>
                      </div>
                      {job.location && (
                        <p className="text-sm text-gray-600">
                          {job.location}
                        </p>
                      )}
                    </div>
                    {job.company?.logo_url && (
                      <img
                        src={job.company.logo_url}
                        alt={job.company.name}
                        className="w-20 h-20 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                      />
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {job.job_type && (
                      <Badge variant="outline">{getJobTypeLabel(job.job_type)}</Badge>
                    )}
                    {job.location && (
                      <Badge variant="outline">{job.location}</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-emerald-50 rounded-xl px-4 py-3">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center text-emerald-600">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Hình thức</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {job.job_type ? getJobTypeLabel(job.job_type) : 'Không xác định'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center text-emerald-600">
                          <DollarSign className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Thu nhập</p>
                          <p className="text-sm font-semibold text-gray-900">{salaryText}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center text-emerald-600">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Địa điểm</p>
                          <p className="text-sm font-semibold text-emerald-700">
                            {shortLocation}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center text-emerald-600">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Kinh nghiệm</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {experienceText}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
                    {deadlineInfo && (
                      <p>
                        Hạn nộp hồ sơ:{' '}
                        <span className="font-medium">
                          {deadlineInfo.dateText}
                        </span>
                        {deadlineInfo.diffDays > 0 && (
                          <span className="text-emerald-600 font-medium">
                            {' '}({`Còn ${deadlineInfo.diffDays} ngày`})
                          </span>
                        )}
                      </p>
                    )}
                    {job.created_at && (
                      <p className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Đăng ngày {new Date(job.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Mô tả công việc
                  </h2>
                  <div className="prose prose-gray max-w-none whitespace-pre-line break-words [overflow-wrap:anywhere]">
                    {job.description}
                  </div>
                </CardContent>
              </Card>

              {job.requirements && (
                <Card>
                  <CardContent className="p-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Yêu cầu
                    </h2>
                    <div className="prose prose-gray max-w-none whitespace-pre-line break-words [overflow-wrap:anywhere]">
                      {job.requirements}
                    </div>
                  </CardContent>
                </Card>
              )}

              {job.benefits && (
                <Card>
                  <CardContent className="p-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Quyền lợi
                    </h2>
                    <div className="prose prose-gray max-w-none whitespace-pre-line break-words [overflow-wrap:anywhere]">
                      {job.benefits}
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    {!isAvailable ? (
                      <div className="text-center">
                        <p className="text-amber-700 font-medium mb-1">
                          Công việc không còn khả dụng
                        </p>
                        <p className="text-sm text-gray-600">
                          Công việc có thể đã hết hạn, bị xóa hoặc tạm ngưng nhận hồ sơ.
                        </p>
                      </div>
                    ) : isAuthenticated && user ? (
                      <>
                        {user.role === 'ROLE_JOBSEEKER' ? (
                          <>
                            {hasApplied ? (
                              <div className="text-center">
                                <p className="text-gray-700 mb-4">
                                  Bạn đã ứng tuyển cho công việc này
                                </p>
                                <Link to="/user/applications">
                                  <Button variant="outline" className="w-full">
                                    Xem đơn ứng tuyển của tôi
                                  </Button>
                                </Link>
                              </div>
                            ) : (
                              <>
                                <Button
                                  className="w-full"
                                  size="lg"
                                  onClick={() => setShowApplyModal(true)}
                                  disabled={!defaultResume && resumes.length === 0}
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Ứng tuyển ngay
                                </Button>
                                {!defaultResume && resumes.length === 0 && (
                                  <p className="text-xs text-gray-500 text-center">
                                    Vui lòng tải CV lên trước
                                  </p>
                                )}
                              </>
                            )}
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={handleSaveJob}
                              disabled={saveJob.isPending || unsaveJob.isPending}
                            >
                              {isSaved ? (
                                <>
                                  <BookmarkCheck className="h-4 w-4 mr-2" />
                                  Đã lưu
                                </>
                              ) : (
                                <>
                                  <Bookmark className="h-4 w-4 mr-2" />
                                  Lưu việc làm
                                </>
                              )}
                            </Button>

                            {profileId && (
                              <Button
                                variant="outline"
                                className="w-full gap-2"
                                onClick={async () => {
                                  try {
                                    const data = await calculateMatch.mutateAsync({
                                      jobId: Number(id),
                                      profileId: profileId,
                                    });
                                    setMatchResult(data);
                                  } catch {
                                    toast.error('Kiểm tra độ phù hợp thất bại');
                                  }
                                }}
                                disabled={calculateMatch.isPending}
                              >
                                <Target className="h-4 w-4" />
                                {calculateMatch.isPending ? 'Đang phân tích...' : 'Kiểm tra độ phù hợp'}
                              </Button>
                            )}
                          </>
                        ) : (
                          <div className="text-center">
                            <p className="text-gray-700 mb-4">
                              Chỉ người tìm việc mới có thể ứng tuyển
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-700 mb-4">
                          Đăng nhập để ứng tuyển công việc này
                        </p>
                        <Button
                          className="w-full"
                          size="lg"
                          onClick={() => openLoginModal('job_seeker')}
                        >
                          Đăng nhập để ứng tuyển
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {matchResult && (
                  <Card className="border-blue-200 bg-blue-50/30">
                    <CardContent className="p-6">
                      <JobMatchResultCard result={matchResult} compact />
                    </CardContent>
                  </Card>
                )}

                {/* Apply Modal */}
                {showApplyModal && (
                  <Card className="border-2">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Ứng tuyển công việc này</h3>

                      <div className="space-y-4">
                        {resumes.length > 0 && (
                          <div className="space-y-2">
                            <Label>Chọn CV</Label>
                            <Select
                              value={selectedResumeId}
                              onChange={(e) => setSelectedResumeId(e.target.value)}
                            >
                              <option value="">Sử dụng CV mặc định</option>
                              {resumes.map((resume) => (
                                <option key={resume.id} value={resume.id}>
                                  {resume.file_name} {resume.is_default && '(Mặc định)'}
                                </option>
                              ))}
                            </Select>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Thư giới thiệu (Tùy chọn)</Label>
                          <Textarea
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            rows={5}
                            placeholder="Hãy cho nhà tuyển dụng biết tại sao bạn phù hợp..."
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            className="flex-1"
                            onClick={handleApply}
                            disabled={applyJob.isPending}
                          >
                            {applyJob.isPending ? 'Đang gửi...' : 'Gửi đơn ứng tuyển'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowApplyModal(false);
                              setCoverLetter('');
                            }}
                          >
                            Hủy
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

