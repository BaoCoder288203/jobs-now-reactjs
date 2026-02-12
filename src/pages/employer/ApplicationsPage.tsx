import { useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RecruiterSidebar } from '@/components/layout/RecruiterSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useCompanyApplications, useUpdateApplicationStatus } from '@/modules/applications/hooks';
import { useMyCompany } from '@/modules/companies/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { FileText, User, Calendar, Download, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EmployerApplicationsPage() {
  // const { user } = useAppSelector((state) => state.auth);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Lấy company của recruiter hiện tại
  const { data: company, isLoading: companyLoading } = useMyCompany();
  const companyId = company?.id;
  
  // Lấy applications của company này
  const { data: applicationsData = [], isLoading: applicationsLoading } = useCompanyApplications(companyId);
  const updateStatus = useUpdateApplicationStatus();
  
  const isLoading = companyLoading || applicationsLoading;

  // Filter applications by status
  const applications = (applicationsData || []).filter(app => {
    if (statusFilter === 'all') return true;
    return app.status === statusFilter;
  });

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({
        applicationId,
        status: newStatus
      });
    } catch (error) {
      console.error('Failed to update status:', error);
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
  
  // Nếu recruiter chưa có company, hiển thị thông báo
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
            <option value="pending">Đang chờ</option>
            <option value="reviewing">Đang xem xét</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Đã từ chối</option>
          </Select>
        </div>

        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-accent" />
                        <h3 className="text-xl font-semibold text-gray-900">
                          {application.job?.title}
                        </h3>
                        <Badge
                          className={
                            application.status === 'approved'
                              ? 'bg-accent-light text-gray-900'
                              : application.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-700'
                          }
                        >
                          {application.status === 'approved' ? 'Đã duyệt' : application.status === 'rejected' ? 'Đã từ chối' : application.status === 'pending' ? 'Đang chờ' : application.status === 'reviewing' ? 'Đang xem xét' : application.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700 font-medium">
                            {application.user?.full_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {new Date(application.created_at).toLocaleDateString('vi-VN')}
                        </div>
                      </div>

                      {application.user?.email && (
                        <p className="text-sm text-gray-600 mb-3">
                          {application.user.email}
                        </p>
                      )}

                      {application.cover_letter && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Thư xin việc:
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {application.cover_letter}
                          </p>
                        </div>
                      )}

                      {application.resume && (
                        <div className="mt-3">
                          <a
                            href={application.resume.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <Download className="h-4 w-4" />
                            Tải CV
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="ml-6 flex flex-col gap-3 min-w-[200px]">
                      <Select
                        value={application.status}
                        onChange={(e) => {
                      const newStatus = e.target.value;
                      handleStatusChange(application.id, newStatus);
                    }}
                        disabled={updateStatus.isPending}
                        className="w-full"
                      >
                        <option value="pending">Đang chờ</option>
                        <option value="reviewing">Đang xem xét</option>
                        <option value="approved">Đã duyệt</option>
                        <option value="rejected">Đã từ chối</option>
                      </Select>

                      <Link to={`/employer/applications/${application.id}`}>
                        <Button variant="outline" size="sm" className="gap-2 w-full">
                          <Eye className="h-4 w-4" />
                          Xem chi tiết
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
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">Không tìm thấy đơn ứng tuyển</p>
              <p className="text-sm text-gray-500">
                {statusFilter !== 'all' 
                  ? `Không có đơn ứng tuyển với trạng thái "${statusFilter === 'pending' ? 'Đang chờ' : statusFilter === 'approved' ? 'Đã duyệt' : statusFilter === 'rejected' ? 'Đã từ chối' : statusFilter === 'reviewing' ? 'Đang xem xét' : statusFilter}"`
                  : 'Đơn ứng tuyển sẽ xuất hiện ở đây khi ứng viên ứng tuyển vào việc làm của bạn'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

