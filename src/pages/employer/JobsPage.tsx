import { useAppSelector } from '@/app/hooks';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RecruiterSidebar } from '@/components/layout/RecruiterSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useJobs, useDeleteJob } from '@/modules/jobs/hooks';
import { useMyCompany } from '@/modules/companies/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Plus, Edit2, Trash2, MapPin, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EmployerJobsPage() {
  // Lấy company của recruiter hiện tại
  const { data: company, isLoading: companyLoading } = useMyCompany();
  const companyId = company?.id;
  
  // Lấy jobs của company này
  const { data: jobsData, isLoading: jobsLoading } = useJobs({ 
    company_id: companyId, 
    limit: 100 
  });
  const deleteJob = useDeleteJob();

  // Filter jobs chỉ của company này (đảm bảo chắc chắn)
  const companyJobs = jobsData?.items?.filter(job => job.company_id === companyId) || [];
  
  const isLoading = companyLoading || jobsLoading;

  const handleDelete = async (jobId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa việc làm này?')) return;
    try {
      await deleteJob.mutateAsync(jobId);
    } catch (error) {
      console.error('Failed to delete job:', error);
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
          <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Bạn chưa có thông tin công ty</p>
          <p className="text-sm text-gray-500 mb-6">
            Vui lòng tạo thông tin công ty trước khi quản lý việc làm
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
            <h1 className="text-3xl font-bold text-gray-900">Tin tuyển dụng</h1>
            <p className="text-gray-600 mt-1">
              Quản lý tin tuyển dụng của bạn
            </p>
          </div>
          <Link to="/employer/jobs/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Đăng tin tuyển dụng
            </Button>
          </Link>
        </div>

        {companyJobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {companyJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Briefcase className="h-5 w-5 text-accent" />
                        <h3 className="text-xl font-semibold text-gray-900">
                          {job.title}
                        </h3>
                        <Badge variant="primary">
                          {job.status === 'open' ? 'Đang tuyển' : job.status === 'closed' ? 'Đã đóng' : job.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        {job.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Đăng ngày {new Date(job.created_at).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {job.job_type === 'full-time' ? 'Toàn thời gian' : job.job_type === 'part-time' ? 'Bán thời gian' : job.job_type === 'contract' ? 'Hợp đồng' : job.job_type === 'remote' ? 'Làm việc từ xa' : job.job_type}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2">
                        {job.description}
                      </p>
                    </div>

                    <div className="ml-6 flex flex-col gap-2">
                      <Link to={`/employer/jobs/${job.id}/edit`}>
                        <Button variant="outline" size="sm" className="gap-2 w-full">
                          <Edit2 className="h-4 w-4" />
                          Chỉnh sửa
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(job.id)}
                        disabled={deleteJob.isPending}
                        className="gap-2 w-full text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Xóa
                      </Button>
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
              <p className="text-gray-600 mb-4">Chưa có tin tuyển dụng nào</p>
              <Link to="/employer/jobs/create">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Đăng tin tuyển dụng đầu tiên
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

