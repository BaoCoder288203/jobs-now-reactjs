import { useMemo, useState } from 'react';
import { InterviewStatusModal } from '@/components/employer/InterviewStatusModal';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RecruiterSidebar } from '@/components/layout/RecruiterSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useCompanyApplications, useUpdateApplicationStatus } from '@/modules/applications/hooks';
import { useMyCompany } from '@/modules/companies/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Briefcase, Calendar, ChevronDown, ChevronUp, Download, Eye, FileText, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Application } from '@/types';
import {
  APPLICATION_STATUS_OPTIONS,
  getApplicationStatusLabel,
  getApplicationStatusBadge,
} from '@/utils/applicationStatus';

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

  const { data: company, isLoading: companyLoading } = useMyCompany();
  const companyId = company?.id;
  
  const { data: applicationsData = [], isLoading: applicationsLoading } = useCompanyApplications(companyId);
  const updateStatus = useUpdateApplicationStatus();
  
  const isLoading = companyLoading || applicationsLoading;

  const applications = useMemo(() => {
    return (applicationsData || [])
      .filter((app) => {
        if (statusFilter === 'all') return true;
        return app.status === statusFilter;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [applicationsData, statusFilter]);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Đơn ứng tuyển</h1>
            <p className="text-gray-600 mt-1">
              Xem và quản lý đơn ứng tuyển
            </p>
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-48"
          >
            <option value="all">Tất cả trạng thái</option>
            {APPLICATION_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </div>

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
              <p className="text-sm text-gray-500">
                {statusFilter !== 'all' 
                  ? `Không có đơn ứng tuyển với trạng thái "${getApplicationStatusLabel(statusFilter)}"`
                  : 'Đơn ứng tuyển sẽ xuất hiện ở đây khi ứng viên ứng tuyển vào việc làm của bạn'}
              </p>
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
    </DashboardLayout>
  );
}

