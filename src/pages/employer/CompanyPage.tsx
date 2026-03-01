import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RecruiterSidebar } from '@/components/layout/RecruiterSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useMyCompany, useCreateMyCompany, useUpdateMyCompany } from '@/modules/companies/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CompanyForm } from '@/components/company/CompanyForm';
import { Building2, MapPin, Users, Globe } from 'lucide-react';
// TODO: Install sonner package for toast notifications

export function EmployerCompanyPage() {
  const { data: company, isLoading } = useMyCompany();
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const createCompany = useCreateMyCompany();
  const updateCompany = useUpdateMyCompany();

  const handleSubmit = async (formData: FormData, id?: string) => {
    try {
      if (id) {
        // Update existing company
        await updateCompany.mutateAsync(formData);
        alert('Cập nhật thông tin công ty thành công');
      } else {
        // Create new company
        await createCompany.mutateAsync(formData);
        alert('Tạo công ty thành công');
      }
      setIsFormOpen(false);
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra');
      throw error;
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

  if (!company && !isLoading) {
    return (
      <>
        <DashboardLayout sidebar={<RecruiterSidebar />}>
          <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-gray-50 via-white to-gray-100">
            <div className="flex flex-col items-center gap-4 rounded-xl border border-gray-200 bg-white/80 px-8 py-10 shadow-2xl">
              <Building2 className="h-12 w-12 text-gray-400" />
              <h1 className="text-2xl font-bold text-gray-800">
                Bạn chưa có công ty
              </h1>
              <p className="mb-2 text-center text-gray-500">
                Hãy tạo công ty để tiếp tục sử dụng các tính năng dành cho nhà
                tuyển dụng.
              </p>
              <Button
                className="rounded-lg bg-primary px-8 py-2 font-semibold text-black shadow transition hover:bg-primary-dark"
                onClick={() => setIsFormOpen(true)}
              >
                + Tạo công ty
              </Button>
              <Link to="/" className="text-sm text-gray-500 hover:underline">
                Quay về trang chủ
              </Link>
            </div>
          </div>
        </DashboardLayout>

        <CompanyForm
          initialData={null}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={handleSubmit}
          isLoading={createCompany.isPending}
        />
      </>
    );
  }

  return (
    <>
      <DashboardLayout sidebar={<RecruiterSidebar />}>
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Thông tin công ty</h1>
            <Button onClick={() => setIsFormOpen(true)} className="gap-2">
              <Building2 className="h-4 w-4" />
              Chỉnh sửa
            </Button>
          </div>

          <Card>
            <CardContent className="p-6 space-y-6">
              {company && (
                <>
                  <div className="flex items-start gap-4">
                    {company.logo_url && (
                      <img
                        src={company.logo_url}
                        alt={company.name}
                        className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                      />
                    )}
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        {company.name}
                      </h2>
                      {company.industry && (
                        <p className="text-gray-600">{company.industries?.map((i) => i.name).join(', ') || company.industry?.name || '—'}</p>
                      )}
                      {company.is_verified && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-accent/20 text-accent-dark rounded">
                          Đã xác minh
                        </span>
                      )}
                    </div>
                  </div>

                  {company.description && (
                    <div>
                      <Label className="text-sm text-gray-500 mb-2 block">Mô tả</Label>
                      <p className="text-gray-700 whitespace-pre-wrap">{company.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                    {company.website && (
                      <div className="flex items-start gap-3">
                        <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Website</p>
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {company.website}
                          </a>
                        </div>
                      </div>
                    )}

                    {company.company_size && (
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Quy mô công ty</p>
                          <p className="text-gray-900">{company.company_size} nhân viên</p>
                        </div>
                      </div>
                    )}

                    {company.address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Địa chỉ</p>
                          <p className="text-gray-900">{company.address}</p>
                        </div>
                      </div>
                    )}

                    {company.create_job_count !== undefined && (
                      <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Số việc làm đã tạo</p>
                          <p className="text-gray-900">{company.create_job_count}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>

      <CompanyForm
        initialData={company || null}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        isLoading={createCompany.isPending || updateCompany.isPending}
      />
    </>
  );
}

