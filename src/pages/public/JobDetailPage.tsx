import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { AppLayout } from '@/components/layout/AppLayout';
import { useJobDetail, useRelatedJobs, useJobs } from '@/modules/jobs/hooks';
import { useCompanyDetail } from '@/modules/companies/hooks';
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
import {
  MapPin,
  Clock,
  DollarSign,
  Building2,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Send,
  Briefcase,
  Target,
  Hash,
  GraduationCap,
  UserCircle,
  Users,
  LayoutGrid,
  Heart,
  Layers,
  Share2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Job } from '@/types';
import { useAuthModal } from '@/contexts/AuthModalContext';
import {
  getJobTypeLabelVi,
  getEducationLevelLabel,
  getApplicationLanguageLabel,
  getGenderRequirementLabel,
  SOCIAL_PLATFORM_LABELS_VI,
} from '@/constants/jobEnums';
import { toast } from 'sonner';
import { RichTextContent } from '@/components/ui/RichTextContent';
import { formatRegionLabelFromLocation } from '@/lib/locationUtils';
import facebookShareIcon from '@/assets/icons-socials/facebook.svg';
import linkedinShareIcon from '@/assets/icons-socials/linkedin.svg';
import type { JobMatchResponse } from '@/services/ai.service';
import { RelatedJobCard } from '@/components/jobs/RelatedJobCard';

function toAiMatchErrorMessage(rawMessage: string) {
  const message = rawMessage.toLowerCase();
  if (
    message.includes('no active candidate quota') ||
    message.includes('out of ai matching quota') ||
    message.includes('candidate subscription expired')
  ) {
    return 'Bạn chưa có lượt AI Matching khả dụng. Vui lòng vào trang Goi dich vu de mua hoac nang cap goi.';
  }
  return rawMessage;
}

function SummaryRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="h-9 w-9 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900 break-words">{value}</p>
      </div>
    </div>
  );
}

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const userId = user?.userId ? String(user.userId) : '';
  const profileId = user?.profileId ?? undefined;
  const { openLoginModal } = useAuthModal();

  const { data: job, isLoading: jobLoading } = useJobDetail(id!);
  const { data: companyDetail } = useCompanyDetail(job?.company_id ?? '');
  const { data: relatedPage } = useRelatedJobs(id);
  const { data: companyJobsPage } = useJobs(
    { company_id: job?.company_id, limit: 24 },
    { enabled: !!job?.company_id }
  );

  const { data: myApplications = [] } = useMyApplications(profileId, userId);
  const { data: savedJobs = [] } = useSavedJobs(profileId ? String(profileId) : '');
  const { data: resumes = [] } = useResumes(userId);

  const applyJob = useApplyJob();
  const saveJob = useSaveJob();
  const unsaveJob = useUnsaveJob();
  const calculateMatch = useCalculateJobMatch();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [coverLetter, setCoverLetter] = useState('');
  const [matchResult, setMatchResult] = useState<JobMatchResponse | null>(null);
  const companyJobsScrollRef = useRef<HTMLDivElement>(null);

  const hasApplied = myApplications.some((app) => app.job_id === id);
  const isSaved = savedJobs.some((sj) => String(sj.jobId) === id);
  const defaultResume = resumes.find((r) => r.is_default);

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
        profileId: user.profileId,
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

  const handleCompanyJobSave = async (e: React.MouseEvent, jobId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!profileId) {
      if (!isAuthenticated) {
        toast.warning('Vui lòng đăng nhập để lưu việc làm');
        openLoginModal('job_seeker');
      } else {
        toast.warning('Vui lòng hoàn thiện hồ sơ trước khi lưu việc làm');
      }
      return;
    }
    const saved = savedJobs.some((sj) => String(sj.jobId) === jobId);
    try {
      if (saved) {
        await unsaveJob.mutateAsync({ profileId: String(profileId), jobId });
      } else {
        await saveJob.mutateAsync({ profileId: String(profileId), jobId });
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Lưu việc làm thất bại';
      toast.error(msg);
    }
  };

  const scrollCompanyJobs = (direction: 'left' | 'right') => {
    const el = companyJobsScrollRef.current;
    if (!el) return;
    const step = Math.max(el.clientWidth * 0.85, 280);
    el.scrollBy({ left: direction === 'left' ? -step : step, behavior: 'smooth' });
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

  const contactName = job.contactPersonName || companyDetail?.name_user_contact;
  const contactAddress = job.companyAddress || companyDetail?.address || job.location;
  const contactTutorial = job.contactTutorial || companyDetail?.tutorial_apply;
  const socials = (companyDetail?.socials?.length ? companyDetail.socials : job.companySocials) ?? [];

  const skillsLine =
    job.jobSkills?.length ?
      job.jobSkills
        .map((js) => {
          const lv = js.level ? ` (${js.level})` : '';
          return `${js.skillName ?? ''}${lv}`.trim();
        })
        .filter(Boolean)
        .join(', ')
    : '—';

  const majorsLine = job.majors?.length ? job.majors.map((m) => m.name).filter(Boolean).join(', ') : '—';

  const ageLine =
    job.minAge != null || job.maxAge != null ?
      `${job.minAge ?? '—'} - ${job.maxAge ?? '—'}`
    : 'Không yêu cầu';

  const relatedJobs = (relatedPage ?? []).filter((j) => j.id !== job.id).slice(0, 8);
  const companyJobs =
    (companyJobsPage?.items ?? []).filter((j) => {
      if (j.id === job.id) return false;
      if (j.isDeleted === true) return false;
      if (j.isActive !== true || j.isApproved !== true) return false;
      if (j.isExpired === true) return false;
      return true;
    }).slice(0, 12) ?? [];

  const companyLogoSrc = (j: Job) =>
    j.company?.logo_url ?? companyDetail?.logo_url ?? job.company?.logo_url;
  const companyNameForJob = (j: Job) =>
    j.company?.name ?? companyDetail?.name ?? job.company?.name ?? '—';

  const jobPageUrl = `${window.location.origin}/jobs/${job.id}`;
  const facebookShareHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobPageUrl)}`;
  const linkedInShareHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobPageUrl)}`;

  const footerApplyDisabled = !defaultResume && resumes.length === 0;

  return (
    <AppLayout>
      <div className="bg-gray-50 min-h-screen pb-28 pt-8">
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
                      <h1 className="text-3xl font-bold text-gray-900 mb-2 break-words">{job.title}</h1>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Building2 className="h-5 w-5 mr-2" />
                        <Link
                          to={`/companies/${job.company_id}`}
                          className="hover:text-gray-900 font-medium truncate"
                        >
                          {job.company?.name}
                        </Link>
                      </div>
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
                    {job.job_type && <Badge variant="outline">{getJobTypeLabelVi(job.job_type)}</Badge>}
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
                            {job.job_type ? getJobTypeLabelVi(job.job_type) : 'Không xác định'}
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
                          <p className="text-sm font-semibold text-emerald-700">{shortLocation}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center text-emerald-600">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Kinh nghiệm</p>
                          <p className="text-sm font-semibold text-gray-900">{experienceText}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
                    {deadlineInfo && (
                      <p>
                        Hạn nộp hồ sơ:{' '}
                        <span className="font-medium">{deadlineInfo.dateText}</span>
                        {deadlineInfo.diffDays > 0 && (
                          <span className="text-emerald-600 font-medium">
                            {' '}
                            ({`Còn ${deadlineInfo.diffDays} ngày`})
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
                  <h2 className="text-xl font-semibold text-sky-700 mb-4">Mô tả công việc</h2>
                  <RichTextContent
                    html={job.description ?? ''}
                    className="prose prose-gray max-w-none break-words [overflow-wrap:anywhere]"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-8">
                  <h2 className="text-xl font-semibold text-sky-700 mb-4">Phúc lợi</h2>
                  <RichTextContent
                    html={job.benefits ?? ''}
                    className="prose prose-gray max-w-none break-words [overflow-wrap:anywhere]"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-8">
                  <h2 className="text-xl font-semibold text-sky-700 mb-4">
                    Kinh nghiệm / Kỹ năng chi tiết
                  </h2>
                  <RichTextContent
                    html={job.requirements ?? ''}
                    className="prose prose-gray max-w-none break-words [overflow-wrap:anywhere]"
                  />
                </CardContent>
              </Card>

              <Card className="border-sky-100">
                <CardContent className="p-8">
                  <h2 className="text-xl font-semibold text-sky-700 mb-4">Mô tả</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-sky-50/80 p-4 space-y-4">
                      <SummaryRow icon={Hash} label="Mã việc làm" value={job.id} />
                      <SummaryRow
                        icon={Briefcase}
                        label="Loại công việc"
                        value={job.job_type ? getJobTypeLabelVi(job.job_type) : '—'}
                      />
                      <SummaryRow icon={Layers} label="Kỹ năng & mức độ" value={skillsLine} />
                      <SummaryRow
                        icon={GraduationCap}
                        label="Học vấn"
                        value={getEducationLevelLabel(job.educationLevel)}
                      />
                    </div>
                    <div className="rounded-xl bg-sky-50/80 p-4 space-y-4">
                      <SummaryRow icon={Briefcase} label="Kinh nghiệm" value={experienceText} />
                      <SummaryRow
                        icon={Users}
                        label="Giới tính"
                        value={getGenderRequirementLabel(job.genderRequirement)}
                      />
                      <SummaryRow icon={UserCircle} label="Tuổi" value={ageLine} />
                      <SummaryRow
                        icon={LayoutGrid}
                        label="Ngành nghề"
                        value={majorsLine !== '—' ? majorsLine : job.categoryName ?? '—'}
                      />
                      <SummaryRow
                        icon={Heart}
                        label="Ngôn ngữ nhận hồ sơ"
                        value={getApplicationLanguageLabel(job.applicationLanguage)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {(contactName || contactAddress || contactTutorial || socials.length > 0) && (
                <Card>
                  <CardContent className="p-8">
                    <h2 className="text-xl font-semibold text-sky-700 mb-4">Thông tin liên hệ</h2>
                    <div className="rounded-xl bg-gray-100/80 p-6 space-y-4">
                      {contactName && (
                        <div className="flex gap-3">
                          <div className="h-7 w-7 rounded-full bg-pink-400 flex items-center justify-center text-white shrink-0">
                            <UserCircle className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Tên liên hệ</p>
                            <p className="font-semibold text-gray-900">{contactName}</p>
                          </div>
                        </div>
                      )}
                      {contactAddress && (
                        <div className="flex gap-3">
                          <div className="h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <p className="text-gray-900 pt-1">{contactAddress}</p>
                        </div>
                      )}
                      {contactTutorial && (
                        <div className="flex gap-3">
                          <div className="h-7 w-7 rounded-lg bg-amber-400 flex items-center justify-center text-white shrink-0">
                            <Briefcase className="h-5 w-5" />
                          </div>
                          <p className="text-gray-900 italic font-medium whitespace-pre-line">{contactTutorial}</p>
                        </div>
                      )}
                      {socials.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {socials.map((s) => (
                            <a
                              key={s.id}
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
                            >
                              {s.logoUrl ?
                                <img src={s.logoUrl} alt="" className="h-5 w-5 rounded object-cover" />
                              : null}
                              {SOCIAL_PLATFORM_LABELS_VI[s.platform] ?? s.platform}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {(companyDetail || job.company) && (
                <Card>
                  <CardContent className="p-8 space-y-4">
                    <h2 className="text-xl font-semibold text-sky-700">Về công ty</h2>
                    <div className="flex gap-4 items-start">
                      {(companyDetail?.logo_url || job.company?.logo_url) && (
                        <img
                          src={companyDetail?.logo_url || job.company?.logo_url}
                          alt=""
                          className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-lg text-gray-900">
                          {companyDetail?.name || job.company?.name}
                        </p>
                        {companyDetail?.website && (
                          <a
                            href={companyDetail.website.startsWith('http') ? companyDetail.website : `https://${companyDetail.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-sky-600 hover:underline"
                          >
                            {companyDetail.website}
                          </a>
                        )}
                        {companyDetail?.company_size && (
                          <p className="text-sm text-gray-600 mt-1">Quy mô: {companyDetail.company_size}</p>
                        )}
                      </div>
                    </div>
                    {companyDetail?.description && (
                      <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                        {companyDetail.description}
                      </p>
                    )}
                    {companyJobs.length > 0 && (
                      <div className="relative">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <p className="text-sm font-medium text-gray-700">Việc làm khác tại công ty</p>
                          {companyJobs.length > 1 && (
                            <div className="flex shrink-0 gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                aria-label="Trước"
                                onClick={() => scrollCompanyJobs('left')}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                aria-label="Sau"
                                onClick={() => scrollCompanyJobs('right')}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <div
                          ref={companyJobsScrollRef}
                          className="flex gap-3 overflow-x-auto scroll-smooth pb-2 -mx-1 px-1 scrollbar-thin snap-x snap-mandatory"
                        >
                          {companyJobs.map((j) => {
                            const saved = savedJobs.some((sj) => String(sj.jobId) === j.id);
                            const logo = companyLogoSrc(j);
                            const cname = companyNameForJob(j);
                            const region = formatRegionLabelFromLocation(j.location);
                            return (
                              <div
                                key={j.id}
                                className="flex-[0_0_100%] min-w-0 shrink-0 snap-start sm:flex-[0_0_calc(50%-6px)] sm:max-w-[calc(50%-6px)]"
                              >
                                <div className="relative h-full rounded-lg border border-gray-200 bg-white transition-shadow hover:border-sky-300 hover:shadow-sm">
                                  <button
                                    type="button"
                                    className="absolute right-2 top-2 z-10 rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                                    aria-label={saved ? 'Bỏ lưu' : 'Lưu việc làm'}
                                    onClick={(e) => handleCompanyJobSave(e, j.id)}
                                  >
                                    <Heart
                                      className={
                                        saved ? 'h-4 w-4 fill-red-500 text-red-500' : 'h-4 w-4 text-gray-400'
                                      }
                                    />
                                  </button>
                                  <Link
                                    to={`/jobs/${j.id}`}
                                    className="flex gap-3 p-3 pr-11 min-h-[5.5rem]"
                                  >
                                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-white flex items-center justify-center">
                                      {logo ? (
                                        <img
                                          src={logo}
                                          alt=""
                                          className="max-h-full max-w-full object-contain"
                                        />
                                      ) : (
                                        <Building2 className="h-7 w-7 text-gray-300" />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1 text-left">
                                      <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
                                        {j.title}
                                      </p>
                                      <p className="text-[11px] uppercase tracking-wide text-gray-500 mt-1 line-clamp-1">
                                        {cname}
                                      </p>
                                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{region}</p>
                                    </div>
                                  </Link>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-8">
                  <div className="flex flex-wrap items-center gap-4">
                    <h2 className="text-xl font-semibold text-sky-700 mb-2 flex items-center gap-2">
                      <Share2 className="h-5 w-5 shrink-0" />
                      Chia sẻ
                    </h2>
                    <a
                      href={facebookShareHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2 shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                      aria-label="Chia sẻ lên Facebook"
                    >
                      <img
                        src={facebookShareIcon}
                        alt=""
                        width={20}
                        height={20}
                        className="h-5 w-5 object-contain"
                      />
                    </a>
                    <a
                      href={linkedInShareHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2 shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                      aria-label="Chia sẻ lên LinkedIn"
                    >
                      <img
                        src={linkedinShareIcon}
                        alt=""
                        width={40}
                        height={40}
                        className="h-5 w-5 object-contain"
                      />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {profileId && (
                  <Card>
                    <CardContent className="p-6">
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={async () => {
                          try {
                            const resolvedResumeId = Number(
                              selectedResumeId || defaultResume?.id || (defaultResume as { resumeId?: number } | undefined)?.resumeId
                            );
                            const data = await calculateMatch.mutateAsync({
                              jobId: Number(id),
                              profileId,
                              ...(Number.isFinite(resolvedResumeId) && resolvedResumeId > 0
                                ? { resumeId: resolvedResumeId }
                                : {}),
                            });
                            setMatchResult(data);
                          } catch (error: unknown) {
                            const message =
                              error && typeof error === 'object' && 'message' in error
                                ? String((error as { message?: string }).message)
                                : '';
                            toast.error(toAiMatchErrorMessage(message) || 'Kiểm tra độ phù hợp thất bại');
                          }
                        }}
                        disabled={calculateMatch.isPending}
                      >
                        <Target className="h-4 w-4" />
                        {calculateMatch.isPending ? 'Đang phân tích...' : 'Kiểm tra độ phù hợp'}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {matchResult && (
                  <Card className="border-blue-200 bg-blue-50/30">
                    <CardContent className="p-6">
                      <JobMatchResultCard result={matchResult} compact />
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Việc làm liên quan</h3>
                    {relatedJobs.length === 0 ?
                      <p className="text-sm text-gray-500">Chưa có tin cùng ngành tuyển dụng.</p>
                    : <ul className="space-y-3">
                        {relatedJobs.map((j) => (
                          <RelatedJobCard key={j.id} job={j} />
                        ))}
                      </ul>
                    }
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed action bar */}
      <div className="sticky bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <div className="container mx-auto max-w-5xl px-4 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {(job.company?.logo_url || companyDetail?.logo_url) && (
              <img
                src={job.company?.logo_url || companyDetail?.logo_url}
                alt=""
                className="h-11 w-11 rounded-lg object-cover border border-gray-200 shrink-0 hidden sm:block"
              />
            )}
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate text-sm sm:text-base">{job.title}</p>
              <p className="text-xs text-gray-500 uppercase truncate">{job.company?.name}</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {!isAvailable ?
              <p className="text-sm text-amber-700 self-center">Tin không còn nhận hồ sơ</p>
            : !isAuthenticated ?
              <Button className="flex-1 sm:flex-initial" size="lg" onClick={() => openLoginModal('job_seeker')}>
                Đăng nhập để ứng tuyển
              </Button>
            : user?.role !== 'ROLE_JOBSEEKER' ?
              <span className="text-sm text-gray-600 self-center">Chỉ người tìm việc mới ứng tuyển được</span>
            : hasApplied ?
              <Link to="/user/applications" className="flex-1 sm:flex-initial">
                <Button variant="outline" className="w-full" size="lg">
                  Xem đơn ứng tuyển
                </Button>
              </Link>
            : <>
                <Button variant="outline" size="lg" className="gap-2" onClick={handleSaveJob}>
                  {isSaved ?
                    <>
                      <BookmarkCheck className="h-4 w-4" />
                      Đã lưu
                    </>
                  : <>
                      <Bookmark className="h-4 w-4" />
                      Lưu việc làm
                    </>
                  }
                </Button>
                <Button size="lg" className="gap-2 min-w-[160px]" onClick={() => setShowApplyModal(true)} disabled={footerApplyDisabled}>
                  <Send className="h-4 w-4" />
                  Ứng tuyển ngay
                </Button>
              </>
            }
          </div>
        </div>
      </div>

      {showApplyModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/40" role="dialog">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto border-2 shadow-xl">
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
                  <Button className="flex-1" onClick={handleApply} disabled={applyJob.isPending}>
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
        </div>
      )}
    </AppLayout>
  );
}
