import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCompanyDetail } from '@/modules/companies/hooks';
import { useJobs } from '@/modules/jobs/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { JobCard } from '@/components/common/JobCard';
import { ArrowLeft, Globe, Briefcase, MapPin, Building2 } from 'lucide-react';

export function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
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

  const companyJobs = jobsData?.items?.filter((job) => job.company_id === id) || [];
  const hasImages = company.thumbnail_images && company.thumbnail_images.length > 0;

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* 1. Header */}
        <header className="relative">
          {company.banner_url ? (
            <div
              className="h-48 md:h-64 bg-cover bg-center"
              style={{ backgroundImage: `url(${company.banner_url})` }}
            />
          ) : (
            <div className="h-48 md:h-64 bg-gradient-to-r from-primary/20 to-primary/5" />
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-24 pointer-events-none" />
          <div className="container mx-auto px-4 max-w-5xl relative -mt-20 pb-6">
            <Link to="/companies" className="inline-block mb-4">
              <Button variant="ghost" size="sm" className="gap-2 text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </Link>
            <div className="flex flex-col sm:flex-row items-start gap-6 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              {company.logo_url && (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-24 h-24 rounded-xl object-cover border border-gray-200 shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {company.name}
                </h1>
                {company.slogan && (
                  <p className="text-primary font-medium mb-3">{company.slogan}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {company.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {company.address}
                    </span>
                  )}
                  {(company.industries?.length ? company.industries.map((i) => i.name).join(', ') : company.industry?.name) && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-4 w-4 shrink-0" />
                      {company.industries?.map((i) => i.name).join(', ') || company.industry?.name}
                    </span>
                  )}
                  {company.company_size && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4 shrink-0" />
                      {company.company_size} nhân viên
                    </span>
                  )}
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <Globe className="h-4 w-4 shrink-0" />
                      Trang web
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 max-w-5xl py-8 space-y-10">
          {/* 2. Company Overview */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Giới thiệu công ty</h2>
              <div className="prose prose-gray max-w-none text-gray-600">
                {company.description ? (
                  <p className="whitespace-pre-line">
                    {company.description.replace(/<[^>]*>/g, '')}
                  </p>
                ) : (
                  <p className="text-gray-500">Chưa có mô tả.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 3. Our People */}
          {hasImages && (
            <Card>
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Hình ảnh công ty</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {company.thumbnail_images!.map((url, index) => (
                    <div
                      key={index}
                      className="aspect-video rounded-lg overflow-hidden bg-gray-100"
                    >
                      <img
                        src={url}
                        alt={`${company.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 4. Job Openings */}
          <Card>
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Việc làm đang tuyển
                {companyJobs.length > 0 && (
                  <span className="text-primary font-normal ml-2">
                    ({companyJobs.length} vị trí)
                  </span>
                )}
              </h2>
              {jobsLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : companyJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {companyJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={{ ...job, company: job.company ?? company }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Hiện không có vị trí tuyển dụng.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
