import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCompanyDetail } from '@/modules/companies/hooks';
import { useJobs } from '@/modules/jobs/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Globe, Briefcase } from 'lucide-react';

export function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: company, isLoading } = useCompanyDetail(id!);
  const { data: jobsData, isLoading: jobsLoading } = useJobs({ company_id: id, limit: 100 });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (!company) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">Không tìm thấy công ty</p>
        </div>
      </AppLayout>
    );
  }

  // Filter jobs chỉ hiển thị jobs của company này (đảm bảo chắc chắn)
  const companyJobs = jobsData?.items?.filter(job => job.company_id === id) || [];
  const hasJobs = companyJobs.length > 0;

  return (
    <AppLayout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <Link to="/companies">
            <Button variant="ghost" className="mb-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách công ty
            </Button>
          </Link>

          {/* Grid Layout: Company info bên trái, Jobs list bên phải */}
          <div className={`grid grid-cols-1 gap-8 ${hasJobs ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
            {/* Company Info Section - Chiếm 2/3 khi có jobs, full width khi không có */}
            <div className={hasJobs ? 'lg:col-span-2' : 'lg:col-span-1'}>
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-start space-x-6 mb-6">
                    {company.logo_url && (
                      <img
                        src={company.logo_url}
                        alt={company.name}
                        className="w-24 h-24 rounded-xl object-cover border border-gray-200"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900">
                          {company.name}
                        </h1>
                      </div>
                      {company.description && (
                        <p className="text-gray-600 mb-4">
                          {company.description.replace(/<[^>]*>/g, '')}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {company.website && (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                          >
                            <Globe className="h-4 w-4" />
                            Trang web
                          </a>
                        )}
                        {company.company_size && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {company.company_size} nhân viên
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Jobs Section - Bên phải, chiếm 1/3 */}
            {hasJobs && (
              <div className="lg:col-span-1 h-[10px]">
                <div className="sticky top-24">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Vị trí đang tuyển{' '}
                        <span className="text-primary">{companyJobs.length} việc làm</span>
                      </h2>
                      
                      {jobsLoading ? (
                        <div className="flex justify-center py-8">
                          <LoadingSpinner />
                        </div>
                      ) : (
                        <ScrollArea className="h-[400px] pr-4">
                          <div className="space-y-4">
                            {companyJobs.map((job) => (
                              <div
                                key={job.id}
                                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white"
                                onClick={() => navigate(`/jobs/${job.id}`)}
                              >
                                <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                                  {job.title}
                                </h3>
                                <div className="space-y-2 text-sm text-gray-600">
                                  {job.location && (
                                    <p>
                                      <strong>Địa điểm:</strong> {job.location}
                                    </p>
                                  )}
                                  {(job.salary_min || job.salary_max) && (
                                    <p>
                                      <strong>Lương:</strong>{' '}
                                      {job.salary_min && job.salary_max
                                        ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} VNĐ`
                                        : job.salary_min
                                        ? `Từ ${job.salary_min.toLocaleString()} VNĐ`
                                        : `Đến ${job.salary_max?.toLocaleString()} VNĐ`}
                                    </p>
                                  )}
                                  {job.job_type && (
                                    <p>
                                      <strong>Loại hình:</strong>{' '}
                                      {job.job_type === 'full-time'
                                        ? 'Toàn thời gian'
                                        : job.job_type === 'part-time'
                                        ? 'Bán thời gian'
                                        : job.job_type === 'contract'
                                        ? 'Hợp đồng'
                                        : job.job_type === 'remote'
                                        ? 'Làm việc từ xa'
                                        : job.job_type}
                                    </p>
                                  )}
                                  {job.created_at && (
                                    <p>
                                      <strong>Đăng ngày:</strong>{' '}
                                      {new Date(job.created_at).toLocaleDateString('vi-VN')}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>

          {/* Empty state - Hiển thị khi không có jobs */}
          {!hasJobs && !jobsLoading && (
            <Card className="mt-8">
              <CardContent className="p-8 text-center">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Hiện tại không có vị trí nào đang tuyển</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

