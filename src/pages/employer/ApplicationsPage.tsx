import { useMemo, useState } from 'react';
import { InterviewStatusModal } from '@/components/employer/InterviewStatusModal';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RecruiterSidebar } from '@/components/layout/RecruiterSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useCompanyApplications, useUpdateApplicationStatus } from '@/modules/applications/hooks';
import { useMyCompany } from '@/modules/companies/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Briefcase, Calendar, ChevronDown, ChevronUp, Download, Eye, FileText, Plus, User, Bot, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Application } from '@/types';
import AiHeadhunterChat from '@/components/AiHeadhunterChat';
import {
  APPLICATION_STATUS_OPTIONS,
  getApplicationStatusLabel,
  getApplicationStatusBadge,
} from '@/utils/applicationStatus';
import { toLocalDateKey } from '@/utils/dateFilter';

type ApplicationGroup = {
  groupKey: string;
  jobId: string;
  jobTitle: string;
  applications: Application[];
  total: number;
  latestAppliedAt: string;
  statusCounts: Record<string, number>;
};

export function EmployerApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [interviewApplicationId, setInterviewApplicationId] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiChatJobId, setAiChatJobId] = useState<number | undefined>(undefined);
  const [applicationSearch, setApplicationSearch] = useState('');
  const [applicationDateFrom, setApplicationDateFrom] = useState('');
  const [applicationDateTo, setApplicationDateTo] = useState('');

  const { data: company, isLoading: companyLoading } = useMyCompany();
  const companyId = company?.id;
  
  const { data: applicationsData = [], isLoading: applicationsLoading } = useCompanyApplications(companyId);
  const updateStatus = useUpdateApplicationStatus();
  
  const isLoading = companyLoading || applicationsLoading;

  const applications = useMemo(() => {
    let list = (applicationsData || []).filter((app) => {
      if (statusFilter === 'all') return true;
      return app.status === statusFilter;
    });

    const q = applicationSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((app) => {
        const jobTitle = (app.job?.title || '').toLowerCase();
        const name = (app.user?.fullName || '').toLowerCase();
        const email = (app.user?.email || '').toLowerCase();
        return jobTitle.includes(q) || name.includes(q) || email.includes(q);
      });
    }

    if (applicationDateFrom) {
      list = list.filter((app) => toLocalDateKey(app.created_at) >= applicationDateFrom);
    }
    if (applicationDateTo) {
      list = list.filter((app) => toLocalDateKey(app.created_at) <= applicationDateTo);
    }

    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [
    applicationsData,
    statusFilter,
    applicationSearch,
    applicationDateFrom,
    applicationDateTo,
  ]);

  const hasActiveApplicationFilters = Boolean(
    applicationSearch.trim() || applicationDateFrom || applicationDateTo
  );

  const groupedApplications = useMemo<ApplicationGroup[]>(() => {
    const groups = new Map<string, ApplicationGroup>();

    applications.forEach((application) => {
      const jobId = application.job?.id ?? application.job_id ?? 'unknown-job';
      const jobTitle = application.job?.title?.trim() || 'Tin tuyển dụng chưa đặt tên';
      const groupKey = `${jobId}-${jobTitle}`;

      if (!groups.has(groupKey)) {
        const initialStatusCounts: Record<string, number> = {};
        APPLICATION_STATUS_OPTIONS.forEach((option) => {
          initialStatusCounts[option.value] = 0;
        });

        groups.set(groupKey, {
          groupKey,
          jobId,
          jobTitle,
          applications: [],
          total: 0,
          latestAppliedAt: application.created_at,
          statusCounts: initialStatusCounts,
        });
      }

      const group = groups.get(groupKey);
      if (!group) return;

      group.applications.push(application);
      group.total += 1;

      const normalizedStatus = application.status?.toLowerCase() || 'pending';
      group.statusCounts[normalizedStatus] = (group.statusCounts[normalizedStatus] ?? 0) + 1;

      if (new Date(application.created_at).getTime() > new Date(group.latestAppliedAt).getTime()) {
        group.latestAppliedAt = application.created_at;
      }
    });

    return Array.from(groups.values()).sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      return new Date(b.latestAppliedAt).getTime() - new Date(a.latestAppliedAt).getTime();
    });
  }, [applications]);

  const overallStatusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    APPLICATION_STATUS_OPTIONS.forEach((option) => {
      counts[option.value] = 0;
    });

    applications.forEach((application) => {
      const normalizedStatus = application.status?.toLowerCase() || 'pending';
      counts[normalizedStatus] = (counts[normalizedStatus] ?? 0) + 1;
    });

    return counts;
  }, [applications]);

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupKey]: !(prev[groupKey] ?? false),
    }));
  };

  const handleStatusChange = async (
    applicationId: string,
    newStatus: string,
    interviewDetailsHtml?: string
  ) => {
    try {
      await updateStatus.mutateAsync({
        applicationId,
        status: newStatus,
        interviewDetailsHtml,
      });
      toast.success('Đã cập nhật trạng thái');
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const onRowStatusChange = (applicationId: string, newStatus: string) => {
    if (newStatus === 'interviewing') {
      setInterviewApplicationId(applicationId);
      setInterviewModalOpen(true);
      return;
    }
    void handleStatusChange(applicationId, newStatus);
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
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Bạn chưa có thông tin công ty</p>
          <p className="text-sm text-gray-500 mb-6">
            Vui lòng tạo thông tin công ty trước khi xem đơn ứng tuyển
          </p>
          <Link to="/employer/company">
            <Button>Tạo thông tin công ty</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const totalJobs = groupedApplications.length;
  const totalApplications = applications.length;

  return (
    <DashboardLayout sidebar={<RecruiterSidebar />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-col md:flex-row gap-4">
          <div className="w-full">
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">Đơn ứng tuyển</h1>
            <p className="text-gray-600 mt-1">
              Xem và quản lý đơn ứng tuyển
            </p>
          </div>

          <div className="grid w-full min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,11rem),1fr))] gap-2 justify-items-stretch">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 w-full min-w-0 px-3"
            >
              <option value="all">Tất cả trạng thái</option>
              {APPLICATION_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
            <Button 
              className="w-full gap-2 bg-sky-500 hover:bg-sky-600 text-white"
              onClick={() => {
                setAiChatJobId(undefined);
                setAiChatOpen(true);
              }}
            >
              <Bot className="h-4 w-4" />
              Lọc hồ sơ AI
            </Button>
            <Link to="/employer/jobs/create" className="min-w-0">
              <Button className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Tạo tin tuyển dụng
              </Button>
            </Link>
          </div>
        </div>

        {(applicationsData || []).length > 0 && (
          <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50/80 p-4">
            <div className="grid w-full min-w-0 gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
              <div className="min-w-0 lg:col-span-1">
                <label htmlFor="employer-app-search" className="mb-1.5 block text-xs font-medium text-gray-600">
                  Tìm theo tin tuyển dụng / tên ứng viên / email
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="employer-app-search"
                    type="search"
                    value={applicationSearch}
                    onChange={(e) => setApplicationSearch(e.target.value)}
                    placeholder="Ví dụ: Frontend, Nguyễn Văn..."
                    className="h-9 pl-9"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="employer-app-from" className="mb-1.5 block text-xs font-medium text-gray-600">
                  Ứng tuyển từ ngày
                </label>
                <Input
                  id="employer-app-from"
                  type="date"
                  value={applicationDateFrom}
                  onChange={(e) => setApplicationDateFrom(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end lg:flex-col">
                <div className="min-w-0 flex-1">
                  <label htmlFor="employer-app-to" className="mb-1.5 block text-xs font-medium text-gray-600">
                    Đến ngày
                  </label>
                  <Input
                    id="employer-app-to"
                    type="date"
                    value={applicationDateTo}
                    onChange={(e) => setApplicationDateTo(e.target.value)}
                    className="h-9"
                  />
                </div>
                {hasActiveApplicationFilters && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 shrink-0 whitespace-nowrap"
                    onClick={() => {
                      setApplicationSearch('');
                      setApplicationDateFrom('');
                      setApplicationDateTo('');
                    }}
                  >
                    Xóa lọc
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {totalApplications > 0 && (
          <Card>
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg bg-gray-50 px-4 py-3">
                    <p className="text-xs text-gray-500">Vị trí tuyển dụng</p>
                    <p className="text-xl font-semibold text-gray-900">{totalJobs}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 px-4 py-3">
                    <p className="text-xs text-gray-500">Tổng đơn</p>
                    <p className="text-xl font-semibold text-gray-900">{totalApplications}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 px-4 py-3">
                    <p className="text-xs text-gray-500">Phỏng vấn</p>
                    <p className="text-xl font-semibold text-gray-900">{overallStatusCounts.interviewing ?? 0}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 px-4 py-3">
                    <p className="text-xs text-gray-500">Đã tuyển</p>
                    <p className="text-xl font-semibold text-gray-900">{overallStatusCounts.hired ?? 0}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {APPLICATION_STATUS_OPTIONS.map((option) => {
                    const count = overallStatusCounts[option.value] ?? 0;
                    if (count === 0) return null;
                    return (
                      <span
                        key={option.value}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                      >
                        {option.label}: {count}
                      </span>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {groupedApplications.length > 0 ? (
          <div className="space-y-4">
            {groupedApplications.map((group) => {
              const isCollapsed = collapsedGroups[group.groupKey] ?? false;

              return (
                <Card key={group.groupKey} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="border-b bg-gray-50 px-5 py-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Briefcase className="h-5 w-5 text-accent" />
                            <h3 className="text-lg font-semibold text-gray-900">{group.jobTitle}</h3>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                              {group.total} đơn
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {APPLICATION_STATUS_OPTIONS.map((option) => {
                              const count = group.statusCounts[option.value] ?? 0;
                              if (count === 0) return null;
                              return (
                                <span
                                  key={option.value}
                                  className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700"
                                >
                                  {option.label}: {count}
                                </span>
                              );
                            })}
                          </div>

                          <p className="text-xs text-gray-500">
                            Đơn mới nhất: {new Date(group.latestAppliedAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2 text-sky-600 border-sky-200 hover:bg-sky-50"
                            onClick={() => {
                              setAiChatJobId(Number(group.jobId));
                              setAiChatOpen(true);
                            }}
                          >
                            <Bot className="h-4 w-4" />
                            Lọc bằng AI
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => toggleGroup(group.groupKey)}
                          >
                            {isCollapsed ? 'Mở danh sách' : 'Thu gọn'}
                            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {!isCollapsed && (
                      <div className="space-y-3 p-5">
                        {group.applications.map((application) => (
                          <div key={application.id} className="rounded-xl border border-gray-200 p-4">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <User className="h-4 w-4 text-gray-500" />
                                  <p className="font-semibold text-gray-900">
                                    {application.user?.fullName || 'Ứng viên chưa cập nhật tên'}
                                  </p>
                                  {getApplicationStatusBadge(application.status)}
                                </div>

                                {application.user?.email && (
                                  <p className="text-sm text-gray-600">{application.user.email}</p>
                                )}

                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                  <span className="inline-flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(application.created_at).toLocaleDateString('vi-VN')}
                                  </span>

                                  {application.resume && (
                                    <a
                                      href={application.resume.file_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-primary hover:underline"
                                    >
                                      <Download className="h-4 w-4" />
                                      Tải CV
                                    </a>
                                  )}
                                </div>

                                {application.cover_letter && (
                                  <p className="line-clamp-2 text-sm text-gray-600">
                                    {application.cover_letter}
                                  </p>
                                )}
                              </div>

                              <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
                                <Select
                                  value={application.status}
                                  onChange={(e) => {
                                    const newStatus = e.target.value;
                                    onRowStatusChange(application.id, newStatus);
                                  }}
                                  disabled={updateStatus.isPending}
                                  className="w-full sm:min-w-[220px]"
                                >
                                  {APPLICATION_STATUS_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                  ))}
                                </Select>

                                <Link to={`/employer/applications/${application.id}`} className="w-full sm:w-auto">
                                  <Button variant="outline" size="sm" className="w-full gap-2">
                                    <Eye className="h-4 w-4" />
                                    Xem chi tiết
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">Không tìm thấy đơn ứng tuyển</p>
              <p className="text-center text-sm text-gray-500 max-w-md">
                {(applicationsData || []).length === 0 ? (
                  <>Đơn ứng tuyển sẽ xuất hiện ở đây khi ứng viên ứng tuyển vào việc làm của bạn.</>
                ) : (
                  <>
                    {statusFilter !== 'all' && (
                      <>Không có đơn với trạng thái &quot;{getApplicationStatusLabel(statusFilter)}&quot;. </>
                    )}
                    {hasActiveApplicationFilters && (
                      <>Không có đơn khớp tìm kiếm hoặc khoảng ngày ứng tuyển. </>
                    )}
                    {statusFilter === 'all' && !hasActiveApplicationFilters && (
                      <>Không có đơn phù hợp.</>
                    )}
                  </>
                )}
              </p>
              {(hasActiveApplicationFilters || statusFilter !== 'all') &&
                (applicationsData || []).length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setStatusFilter('all');
                      setApplicationSearch('');
                      setApplicationDateFrom('');
                      setApplicationDateTo('');
                    }}
                  >
                    Xóa bộ lọc (trạng thái + tìm kiếm + ngày)
                  </Button>
                )}
            </CardContent>
          </Card>
        )}
      </div>

      <InterviewStatusModal
        open={interviewModalOpen}
        onOpenChange={(open) => {
          setInterviewModalOpen(open);
          if (!open) setInterviewApplicationId(null);
        }}
        isSubmitting={updateStatus.isPending}
        onConfirm={async (html) => {
          if (!interviewApplicationId) return;
          await handleStatusChange(interviewApplicationId, 'interviewing', html);
          setInterviewModalOpen(false);
          setInterviewApplicationId(null);
        }}
      />

      <AiHeadhunterChat 
        isOpen={aiChatOpen} 
        onClose={() => setAiChatOpen(false)} 
        defaultJobId={aiChatJobId} 
      />
    </DashboardLayout>
  );
}

