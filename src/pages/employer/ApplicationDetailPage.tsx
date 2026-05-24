import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RecruiterSidebar } from '@/components/layout/RecruiterSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useApplicationDetail, useUpdateApplicationStatus, useSendCustomEmail } from '@/modules/applications/hooks';
import { useCalculateJobMatch } from '@/modules/cv/hooks';
import { JobMatchResultCard } from '@/components/ai/JobMatchResultCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeft, Calendar, Download, Mail, Phone, MapPin, Target, Image, X } from 'lucide-react';
import { InterviewStatusModal } from '@/components/employer/InterviewStatusModal';
import { SendEmailModal } from '@/components/employer/SendEmailModal';
import { RichTextContent } from '@/components/ui/RichTextContent';
import { toast } from 'sonner';
import type { JobMatchResponse } from '@/services/ai.service';

export function EmployerApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const { data: application, isLoading } = useApplicationDetail(id || '');
  const updateStatus = useUpdateApplicationStatus();
  const sendEmail = useSendCustomEmail();
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
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">Chi tiết đơn ứng tuyển</h1>
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

                {application.resume ? (
                  <div className="pt-4 border-t border-gray-200">
                    <a
                      href={application.resume.file_url || `/cv/${application.user?.profileId}?resumeId=${application.resume.resumeId || application.resume.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      <Download className="h-4 w-4" />
                      {application.resume.file_url ? `Tải CV: ${application.resume.file_name}` : `Xem CV Online: ${application.resume.file_name || 'CV Tạo từ hệ thống'}`}
                    </a>
                  </div>
                ) : application.user?.profileId ? (
                  <div className="pt-4 border-t border-gray-200">
                    <a
                      href={`/cv/${application.user.profileId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      <Download className="h-4 w-4" />
                      Xem CV Online
                    </a>
                  </div>
                ) : null}
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

            {/* Supporting Certificates Button */}
            {application.resume?.extracted_text?.includes('TÀI LIỆU/CHỨNG CHỈ') && (
              <Button
                variant="outline"
                className="w-full mb-4 gap-2 border-sky-300 text-sky-700 hover:bg-sky-50"
                onClick={() => setCertModalOpen(true)}
              >
                <Image className="h-4 w-4" />
                Xem chứng chỉ & tài liệu đính kèm
              </Button>
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
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setEmailModalOpen(true)}
                  >
                    Gửi email
                  </Button>
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

      <SendEmailModal
        open={emailModalOpen}
        onOpenChange={setEmailModalOpen}
        isSubmitting={sendEmail.isPending}
        onConfirm={async (subject, html) => {
          if (!id) return;
          try {
            await sendEmail.mutateAsync({
              applicationId: id,
              subject,
              bodyHtml: html
            });
            toast.success('Đã gửi email thành công');
            setEmailModalOpen(false);
          } catch (error) {
            toast.error('Có lỗi xảy ra khi gửi email');
            console.error(error);
          }
        }}
      />

      {certModalOpen && application?.resume && (() => {
        const text = application.resume.extracted_text ?? '';
        const startIndex = text.indexOf('--- TÀI LIỆU/CHỨNG CHỈ');
        const content = startIndex !== -1 ? text.substring(startIndex) : text;
        const urlRegex = /(https?:\/\/[^\s]+?\.(?:jpg|jpeg|png|webp|gif))/gi;
        const urls = Array.from(content.matchAll(urlRegex), (m) => m[0]);
        return (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setCertModalOpen(false)}>
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Image className="h-5 w-5 text-emerald-600" />
                  Chứng chỉ & Tài liệu đính kèm ({urls.length} ảnh)
                </h3>
                <button onClick={() => setCertModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100 transition">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {urls.map((url, index) => (
                  <button
                    key={index}
                    className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 bg-gray-50 hover:shadow-lg transition group cursor-pointer"
                    onClick={() => setLightboxUrl(url)}
                  >
                    <img src={url} alt={`Chứng chỉ ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {lightboxUrl && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 cursor-pointer" onClick={() => setLightboxUrl(null)}>
          <button onClick={() => setLightboxUrl(null)} className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/40 transition">
            <X className="h-6 w-6 text-white" />
          </button>
          <img src={lightboxUrl} alt="Chứng chỉ phóng to" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </DashboardLayout>
  );
}

