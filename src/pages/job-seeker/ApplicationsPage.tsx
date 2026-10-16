import { useState, useEffect } from 'react';
import { useAppSelector } from '@/app/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMyApplications } from '@/modules/applications/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Calendar, MapPin, ExternalLink, ChevronDown, ChevronUp, Video, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Application } from '@/types';
import { RichTextContent } from '@/components/ui/RichTextContent';
import { connectWebSocket, subscribeToNotifications } from '@/services/websocket';

function replaceInterviewPlaceholders(
  html: string,
  application: Application
): string {
  const name = application.user?.fullName ?? 'Ứng viên';
  const jobTitle = application.job?.title ?? '';
  const companyName = application.job?.company?.name ?? '';
  return html
    .replace(/\{\{name\}\}/g, name)
    .replace(/\{\{jobTitle\}\}/g, jobTitle)
    .replace(/\{\{companyName\}\}/g, companyName);
}

function InterviewDetailsCollapsible({
  application,
}: {
  application: Application;
}) {
  const [open, setOpen] = useState(false);
  const [showCall, setShowCall] = useState(false);

  if (
    application.status !== 'interviewing' ||
    !application.interview_details_html
  )
    return null;

  const extractMeetingLink = (html: string | null | undefined): string | null => {
    if (!html) return null;
    const match = html.match(/href="([^"]+)"/);
    if (match) return match[1];
    if (html.includes('http')) {
      const rawMatch = html.match(/https?:\/\/[^\s<"']+/);
      if (rawMatch) return rawMatch[0];
    }
    return null;
  };

  const meetingLink = extractMeetingLink(application.interview_details_html);

  const processedHtml = replaceInterviewPlaceholders(
    application.interview_details_html,
    application
  );

  return (
    <>
      <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50/60 overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-sky-100/60 transition-colors"
        >
          <span className="text-sm font-semibold text-sky-800 flex items-center gap-1.5">
            📋 Lịch / thông tin phỏng vấn
            {meetingLink && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold animate-pulse">
                <Video className="w-2.5 h-2.5" /> ONLINE
              </span>
            )}
          </span>
          {open ? (
            <ChevronUp className="h-4 w-4 text-sky-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-sky-600" />
          )}
        </button>

        {open && (
          <div className="px-4 pb-4 border-t border-sky-200 space-y-4">
            <div className="prose prose-sm max-w-none text-gray-800 pt-3">
              <RichTextContent html={processedHtml} />
            </div>

            {meetingLink && (
              <button
                type="button"
                onClick={() => setShowCall(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 transition-all duration-200 group"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500 text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <Video className="w-4 h-4" />
                </div>
                <div className="text-left flex-1">
                  <h4 className="text-sm font-bold text-gray-800">Tham gia phỏng vấn trực tuyến</h4>
                  <p className="text-xs text-gray-500">Mở phòng gọi video bảo mật JobsNow</p>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Sẵn sàng
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Full-screen Video Call Overlay */}
      {showCall && meetingLink && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-gray-900 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border-b border-gray-700/50 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                <Video className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  Phòng Phỏng vấn JobsNow
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">
                  {application.job?.title} — {application.job?.company?.name}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCall(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all text-sm font-medium"
            >
              <X className="w-4 h-4" />
              Rời phòng
            </button>
          </div>
          <iframe
            src={`${meetingLink}#userInfo.displayName="${encodeURIComponent(
              application.user?.fullName || 'Ứng viên'
            )}"&config.startWithAudioMuted=true`}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="flex-1 w-full border-0"
          />
        </div>
      )}
    </>
  );
}

export function JobSeekerApplicationsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.userId ? String(user.userId) : '';
  const profileId = user?.profileId ?? undefined;

  const { data: applicationsData, isLoading } = useMyApplications(profileId, userId);

  const [activeCall, setActiveCall] = useState<{
    companyName: string;
    jobTitle: string;
    applicationId: string;
    meetingLink: string;
  } | null>(null);
  const [showCallOverlay, setShowCallOverlay] = useState(false);

  const applications = applicationsData || [];

  useEffect(() => {
    if (!userId || !applications.length) return;

    let sub: any = null;

    const setupWs = async () => {
      try {
        await connectWebSocket(userId);
        sub = subscribeToNotifications(Number(userId), (message: any) => {
          if (message && message.type === 'VIDEO_CALL') {
            const app = applications.find((a) => String(a.id) === String(message.applicationId));
            if (app) {
              const extractMeetingLink = (html: string | null | undefined): string | null => {
                if (!html) return null;
                const match = html.match(/href="([^"]+)"/);
                if (match) return match[1];
                if (html.includes('http')) {
                  const rawMatch = html.match(/https?:\/\/[^\s<"']+/);
                  if (rawMatch) return rawMatch[0];
                }
                return null;
              };
              const link = extractMeetingLink(app.interview_details_html);
              if (link) {
                setActiveCall({
                  companyName: message.senderName || app.job?.company?.name || 'Nhà tuyển dụng',
                  jobTitle: message.jobTitle || app.job?.title || 'Vị trí ứng tuyển',
                  applicationId: String(message.applicationId),
                  meetingLink: link,
                });
              }
            }
          }
        });
      } catch (err) {
        console.error('WebSocket connection failed:', err);
      }
    };

    setupWs();

    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, [userId, applications]);

  const getStatusBadge = (status: string) => {
    const normalized = (status ?? '').toUpperCase();
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: { label: 'Chờ xử lý', className: 'bg-gray-100 text-gray-700' },
      REVIEWING: { label: 'Đang xem xét', className: 'bg-blue-100 text-blue-800' },
      SHORTLISTED: { label: 'Đạt vòng hồ sơ', className: 'bg-green-100 text-green-800' },
      INTERVIEWING: { label: 'Phỏng vấn', className: 'bg-purple-100 text-purple-800' },
      REJECTED: { label: 'Từ chối', className: 'bg-red-100 text-red-800' },
      HIRED: { label: 'Đã tuyển', className: 'bg-emerald-600 text-white' },
    };
    const statusInfo = statusMap[normalized] || statusMap.PENDING;

    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
  };



  const content = (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Đơn ứng tuyển</h1>
        <p className="text-gray-600 mt-1">
          Theo dõi trạng thái các đơn ứng tuyển của bạn
        </p>
      </div>

      {applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((application: Application) => (
            <Card key={application.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <Link
                        to={`/jobs/${application.job_id}`}
                        className="text-xl font-semibold text-gray-900 hover:text-primary transition-colors"
                      >
                        {application.job?.title}
                      </Link>
                    </div>

                    <p className="text-gray-600 mb-3">
                      {application.job?.company?.name}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                      {application.job?.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {application.job.location}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Ứng tuyển ngày {new Date(application.created_at).toLocaleDateString('vi-VN')}
                      </div>
                    </div>

                    {application.cover_letter && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-1">Thư xin việc:</p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {application.cover_letter}
                        </p>
                      </div>
                    )}

                    <InterviewDetailsCollapsible application={application} />
                  </div>

                  <div className="ml-6 flex flex-col items-end gap-3">
                    {getStatusBadge(application.status)}
                    <Link to={`/jobs/${application.job_id}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        Xem việc làm
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Bạn chưa ứng tuyển công việc nào</p>
            <Link to="/jobs">
              <Button>Tìm việc làm</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {content}

      {/* Floating Incoming Call Invitation */}
      {activeCall && !showCallOverlay && (
        <div className="fixed bottom-6 right-6 z-[80] max-w-sm w-full bg-white rounded-2xl border-2 border-emerald-500 shadow-2xl p-5 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 shrink-0 relative">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
              <Video className="w-6 h-6 text-emerald-600 relative z-10" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                YÊU CẦU PHỎNG VẤN TRỰC TIẾP
              </span>
              <h4 className="text-sm font-bold text-gray-900 truncate">
                {activeCall.companyName}
              </h4>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                Vị trí: {activeCall.jobTitle}
              </p>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                Nhà tuyển dụng đã vào phòng phỏng vấn trực tuyến.
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button
              onClick={() => setActiveCall(null)}
              variant="outline"
              className="flex-1 text-xs"
            >
              Để sau
            </Button>
            <Button
              onClick={() => setShowCallOverlay(true)}
              className="flex-1 text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-semibold animate-pulse"
            >
              Tham gia ngay
            </Button>
          </div>
        </div>
      )}

      {/* Full-screen Call Overlay triggered from Invitation */}
      {showCallOverlay && activeCall && (
        <div className="fixed inset-0 z-[90] flex flex-col bg-gray-900 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border-b border-gray-700/50 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                <Video className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  Phòng Phỏng vấn JobsNow
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">
                  {activeCall.jobTitle} — {activeCall.companyName}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowCallOverlay(false);
                setActiveCall(null);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all text-sm font-medium"
            >
              <X className="w-4 h-4" />
              Rời phòng
            </button>
          </div>
          <iframe
            src={`${activeCall.meetingLink}#userInfo.displayName="${encodeURIComponent(
              user?.fullName || 'Ứng viên'
            )}"&config.startWithAudioMuted=true`}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="flex-1 w-full border-0"
          />
        </div>
      )}
    </div>
  );
}
