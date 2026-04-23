import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RecruiterSidebar } from '@/components/layout/RecruiterSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useApplicationDetail, useUpdateApplicationStatus } from '@/modules/applications/hooks';
import { useCalculateJobMatch } from '@/modules/cv/hooks';
import { JobMatchResultCard } from '@/components/ai/JobMatchResultCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeft, Calendar, Download, Mail, Phone, MapPin, Target } from 'lucide-react';
import { InterviewStatusModal } from '@/components/employer/InterviewStatusModal';
import { RichTextContent } from '@/components/ui/RichTextContent';
import { toast } from 'sonner';
import type { JobMatchResponse } from '@/services/ai.service';

export function EmployerApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);

  const { data: application, isLoading } = useApplicationDetail(id || '');
  const updateStatus = useUpdateApplicationStatus();
  const calculateMatch = useCalculateJobMatch();
  const [matchResult, setMatchResult] = useState<JobMatchResponse | null>(null);

  const handleCheckMatch = async () => {
    if (!application) return;
    const jobId = Number(application.job_id);
    const profileId = application.user?.profileId ?? undefined;
    const resumeId = application.resume_id ? Number(application.resume_id) : undefined;
    if (!jobId || (!profileId && !resumeId)) {
      toast.error('Không đủ dữ liệu để kiểm tra');
      return;
    }
    try {
      const data = await calculateMatch.mutateAsync({ jobId, profileId: profileId ?? undefined, resumeId });
      setMatchResult(data);
    } catch {
      toast.error('Kiểm tra thất bại');
    }
  };

  const handleStatusChange = async (newStatus: string, interviewDetailsHtml?: string) => {
    if (!id) return;
    try {
      await updateStatus.mutateAsync({
        applicationId: id,
        status: newStatus,
        interviewDetailsHtml,
      });
      toast.success('Đã cập nhật trạng thái');
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const onSelectStatus = (newStatus: string) => {
    if (newStatus === 'interviewing') {
      setInterviewModalOpen(true);
      return;
    }
    void handleStatusChange(newStatus);
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

  if (!application) {
    return (
      <DashboardLayout sidebar={<RecruiterSidebar />}>
        <div className="text-center py-12">
          <p className="text-gray-600">Không tìm thấy đơn ứng tuyển</p>
          <Link to="/employer/applications">
            <Button variant="outline" className="mt-4">
              Quay lại
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<RecruiterSidebar />}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/employer/applications">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Chi tiết đơn ứng tuyển</h1>
            <p className="text-gray-600 mt-1">
              Xem xét đơn ứng tuyển cho vị trí {application.job?.title}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Information */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin việc làm</CardTitle>
              </CardHeader>
              <CardContent>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {application.job?.title}
                </h2>
                      <p className="text-gray-600 mb-4">
                        {application.job?.company?.name}
                      </p>
                {application.job?.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {application.job.location}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Candidate Information */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin ứng viên</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {application.user?.fullName}
                  </h3>
                  {application.user?.email && (
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Mail className="h-4 w-4" />
                      {application.user.email}
                    </div>
                  )}
                  {application.user?.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      {application.user.phone}
                    </div>
                  )}
                </div>

                {application.resume && (
                  <div className="pt-4 border-t border-gray-200">
                    <a
                      href={application.resume.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      <Download className="h-4 w-4" />
                      Tải CV: {application.resume.file_name}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cover Letter */}
            {application.cover_letter && (
              <Card>
                <CardHeader>
                  <CardTitle>Thư xin việc</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {application.cover_letter}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Interview Details */}
            {application.status === 'interviewing' && application.interview_details_html && (
              <Card>
                <CardHeader>
                  <CardTitle>Nội dung phỏng vấn đã gửi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <RichTextContent html={application.interview_details_html
                      .replace(/\{\{name\}\}/g, application.user?.fullName ?? 'Ứng viên')
                      .replace(/\{\{jobTitle\}\}/g, application.job?.title ?? '')
                      .replace(/\{\{companyName\}\}/g, application.job?.company?.name ?? '')
                    } />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Trạng thái đơn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Trạng thái hiện tại
                  </label>
                  <Select
                    value={application.status}
                    onChange={(e) => onSelectStatus(e.target.value)}
                    disabled={updateStatus.isPending}
                  >
                    <option value="pending">Đang chờ</option>
                    <option value="reviewing">Đang xem xét</option>
                    <option value="shortlisted">Đạt vòng hồ sơ</option>
                    <option value="interviewing">Phỏng vấn</option>
                    <option value="rejected">Đã từ chối</option>
                    <option value="hired">Đã tuyển</option>
                  </Select>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4" />
                      <span>Ngày ứng tuyển</span>
                    </div>
                    <p className="font-medium text-gray-900">
                      {new Date(application.created_at).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Thao tác nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to={`/jobs/${application.job_id}`}>
                  <Button variant="outline" className="w-full mb-2">
                    Xem tin tuyển dụng
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full mb-2 gap-2"
                  onClick={handleCheckMatch}
                  disabled={calculateMatch.isPending}
                >
                  <Target className="h-4 w-4" />
                  {calculateMatch.isPending ? 'Đang phân tích...' : 'Kiểm tra độ phù hợp AI'}
                </Button>
                {application.user?.email && (
                  <a href={`mailto:${application.user.email}`}>
                    <Button variant="outline" className="w-full">
                      Gửi email
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>

            {matchResult && (
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-base">Phân tích AI</CardTitle>
                </CardHeader>
                <CardContent>
                  <JobMatchResultCard result={matchResult} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <InterviewStatusModal
        open={interviewModalOpen}
        onOpenChange={setInterviewModalOpen}
        isSubmitting={updateStatus.isPending}
        onConfirm={async (html) => {
          await handleStatusChange('interviewing', html);
          setInterviewModalOpen(false);
        }}
      />
    </DashboardLayout>
  );
}

