import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RecruiterSidebar } from '@/components/layout/RecruiterSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useMyCompany, useCreateMyCompany, useUpdateMyCompany, useAddCompanyImage, useDeleteCompanyImage } from '@/modules/companies/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CompanyForm } from '@/components/company/CompanyForm';
import { Building2, MapPin, Users, Globe, Image as ImageIcon, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getSubscriptionStatus, type CompanySubscriptionStatus } from '@/services/subscription-plan.service';

export function EmployerCompanyPage() {
  const { data: company, isLoading } = useMyCompany();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<CompanySubscriptionStatus | null>(null);
  
  const createCompany = useCreateMyCompany();
  const updateCompany = useUpdateMyCompany();
  const addCompanyImage = useAddCompanyImage();
  const deleteCompanyImage = useDeleteCompanyImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accountStatusLabel = (status?: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'Đang chờ thanh toán';
      case 'PAID_ACTIVE':
        return 'Gói trả phí đang hoạt động';
      case 'TRIAL_ACTIVE':
        return 'Dùng thử đang hoạt động';
      case 'EXPIRED':
        return 'Gói đã hết hạn';
      case 'TRIAL_EXPIRED':
        return 'Dùng thử đã hết hạn';
      default:
        return 'Không xác định';
    }
  };

  useEffect(() => {
    getSubscriptionStatus()
      .then((data) => setSubscriptionStatus(data || null))
      .catch(() => setSubscriptionStatus(null));
  }, []);

  const handleSubmit = async (formData: FormData, id?: string) => {
    try {
      if (id) {
        await updateCompany.mutateAsync(formData);
        toast.success('Cập nhật thông tin công ty thành công');
      } else {
        await createCompany.mutateAsync(formData);
        toast.success('Tạo công ty thành công');
      }
      setIsFormOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
      throw error;
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!company?.id) return;
    
    try {
      await addCompanyImage.mutateAsync({ companyId: company.id, imageFile: file, type: 'OTHER' });
      toast.success('Tải ảnh lên thành công');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      toast.error(error.message || 'Lỗi tải ảnh lên');
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      await deleteCompanyImage.mutateAsync(imageId);
      toast.success('Đã xóa ảnh thành công');
    } catch (error: any) {
      toast.error(error.message || 'Lỗi xóa ảnh');
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
              <h1 className="text-xl font-bold text-gray-800 sm:text-2xl md:text-3xl">
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">Thông tin công ty</h1>
            <Button onClick={() => setIsFormOpen(true)} className="w-full shrink-0 gap-2 sm:w-auto">
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

          {company && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-gray-500" />
                    <h2 className="text-xl font-bold text-gray-900">Thư viện hình ảnh</h2>
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleUploadImage}
                      disabled={addCompanyImage.isPending}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={addCompanyImage.isPending}
                      className="gap-2"
                    >
                      {addCompanyImage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      Tải ảnh lên
                    </Button>
                  </div>
                </div>
                
                {(!company.images || company.images.length === 0) ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    Công ty chưa có hình ảnh nào trong thư viện.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {company.images.map((img) => (
                      <div key={img.imageId} className="group relative rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-100">
                        <img src={img.imageUrl} alt="Company image" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button 
                            variant="destructive" 
                            size="icon"
                            onClick={() => handleDeleteImage(img.imageId)}
                            disabled={deleteCompanyImage.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {subscriptionStatus && (
            <Card>
              <CardContent className="p-6 space-y-2 text-sm text-gray-700">
                <div className="font-semibold text-gray-900">Trạng thái gói tài khoản</div>
                <p>Trạng thái: {accountStatusLabel(subscriptionStatus.accountStatus)}</p>
                <p>Gói hiện tại: {subscriptionStatus.currentPlanName || 'Chưa có gói trả phí'}</p>
                <p>Còn lại: {subscriptionStatus.remainingJobPosts} lượt đăng, {subscriptionStatus.remainingAiScans} AI scan</p>
                <p>AI CV Builder trial: {subscriptionStatus.remainingAiCvBuilderTrials ?? 0}</p>
                <p>Hết hạn: {subscriptionStatus.expiresAt ? new Date(subscriptionStatus.expiresAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
                <div>
                  <Link to="/employer/pricing" className="text-primary hover:underline">Quản lý và nâng cấp gói</Link>
                </div>
              </CardContent>
            </Card>
          )}
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

