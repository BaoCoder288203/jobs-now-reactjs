import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { AppLayout } from '@/components/layout/AppLayout';
import { useJobDetail } from '@/modules/jobs/hooks';
import { useApplyJob, useMyApplications } from '@/modules/applications/hooks';
import { useSaveJob, useUnsaveJob, useSavedJobs } from '@/modules/savedJobs/hooks';
import { useResumes } from '@/modules/resumes/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { MapPin, Clock, DollarSign, Building2, ArrowLeft, Bookmark, BookmarkCheck, Send } from 'lucide-react';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { getJobTypeLabel } from '@/constants/jobEnums';

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const userId = user?.userId ? String(user.userId) : '';
  const profileId = user?.profileId ?? undefined;
  const { openLoginModal } = useAuthModal();

  const { data: job, isLoading: jobLoading } = useJobDetail(id!);
  const { data: myApplications = [] } = useMyApplications(profileId, userId);
  const { data: savedJobs = [] } = useSavedJobs(userId);
  const { data: resumes = [] } = useResumes(userId);

  const applyJob = useApplyJob();
  const saveJob = useSaveJob();
  const unsaveJob = useUnsaveJob();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [coverLetter, setCoverLetter] = useState('');

  const hasApplied = myApplications.some(app => app.job_id === id);
  const isSaved = savedJobs.some(sj => sj.job_id === id);
  const defaultResume = resumes.find(r => r.is_default);

  const handleApply = async () => {
    if (!id || !userId) return;
    if (!selectedResumeId && !defaultResume) {
      alert('Vui lòng tải CV lên trước hoặc chọn một CV');
      return;
    }

    try {
      await applyJob.mutateAsync({
        userId,
        jobId: id,
        resumeId: selectedResumeId || defaultResume?.id,
        coverLetter: coverLetter || undefined,
        profileId: user?.profileId ?? undefined
      });
      setShowApplyModal(false);
      setCoverLetter('');
      alert('Ứng tuyển thành công!');
    } catch (error: any) {
      alert(error.message || 'Ứng tuyển thất bại');
    }
  };

  const handleSaveJob = async () => {
    if (!id || !userId) return;
    try {
      if (isSaved) {
        await unsaveJob.mutateAsync({ userId, jobId: id });
      } else {
        await saveJob.mutateAsync({ userId, jobId: id });
      }
    } catch (error: any) {
      alert(error.message || 'Lưu việc làm thất bại');
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
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {job.title}
                      </h1>
                      <div className="flex items-center text-gray-600 mb-4">
                        <Building2 className="h-5 w-5 mr-2" />
                        <Link
                          to={`/companies/${job.company_id}`}
                          className="hover:text-gray-900 font-medium"
                        >
                          {job.company?.name}
                        </Link>
                      </div>
                    </div>
                    {job.company?.logo_url && (
                      <img
                        src={job.company.logo_url}
                        alt={job.company.name}
                        className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                      />
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {job.job_type && (
                      <Badge variant="outline">{getJobTypeLabel(job.job_type)}</Badge>
                    )}
                    {job.location && (
                      <Badge variant="outline">{job.location}</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    {job.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {job.location}
                      </div>
                    )}
                    {(job.salary_min || job.salary_max) && (
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        {job.salary_min?.toLocaleString()} - {job.salary_max?.toLocaleString()} VNĐ
                      </div>
                    )}
                    {job.created_at && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Đăng ngày {new Date(job.created_at).toLocaleDateString('vi-VN')}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Mô tả công việc
                  </h2>
                  <div className="prose prose-gray max-w-none whitespace-pre-line">
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
                    <div className="prose prose-gray max-w-none whitespace-pre-line">
                      {job.requirements}
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    {isAuthenticated && user ? (
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

