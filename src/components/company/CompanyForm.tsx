import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { Company, CreateCompanyRequest } from '@/types';
import { X } from 'lucide-react';

interface CompanyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData, id?: string) => Promise<void>;
  initialData?: Company | null;
  isLoading?: boolean;
}

export function CompanyForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading = false,
}: CompanyFormProps) {
  const [formData, setFormData] = useState<CreateCompanyRequest>({
    name: '',
    description: '',
    website: '',
    company_size: '',
    address: '',
    industry_id: '',
  });
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        website: initialData.website || '',
        company_size: initialData.company_size || '',
        address: initialData.address || '',
        industry_id: initialData.industry_id || '',
      });
      setLogoPreview(initialData.logo_url || '');
    } else {
      setFormData({
        name: '',
        description: '',
        website: '',
        company_size: '',
        address: '',
        industry_id: '',
      });
      setLogoPreview('');
    }
    setLogoFile(null);
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare FormData
    const data = new FormData();
    
    // Append company data as JSON string in Blob
    data.append(
      'company',
      new Blob([JSON.stringify(formData)], { type: 'application/json' }),
    );
    
    // Append logo file if exists
    if (logoFile) {
      data.append('logoFile', logoFile);
    }

    // Submit
    await onSubmit(data, initialData?.id);

    // Reset after submit for create mode only
    if (!initialData) {
      handleReset();
    }
  };

  const handleChange = (field: keyof CreateCompanyRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangeLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setLogoPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      website: '',
      company_size: '',
      address: '',
      industry_id: '',
    });
    setLogoPreview('');
    setLogoFile(null);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh]"
        showClose={true}
        onClose={handleClose}
      >
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              {initialData ? 'Chỉnh sửa thông tin công ty' : 'Tạo thông tin công ty'}
            </h2>
            <p className="text-center text-gray-600 mt-2">
              {initialData
                ? 'Cập nhật thông tin công ty của bạn'
                : 'Điền thông tin để tạo công ty mới'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên công ty <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                placeholder="Nhập tên công ty"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Mô tả <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required
                rows={6}
                placeholder="Nhập mô tả về công ty..."
              />
            </div>

            {/* Website and Company Size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_size">Quy mô công ty</Label>
                <Select
                  id="company_size"
                  value={formData.company_size}
                  onChange={(e) => handleChange('company_size', e.target.value)}
                >
                  <option value="">Chọn quy mô</option>
                  <option value="1-10">1-10 nhân viên</option>
                  <option value="11-50">11-50 nhân viên</option>
                  <option value="51-200">51-200 nhân viên</option>
                  <option value="201-500">201-500 nhân viên</option>
                  <option value="501-1000">501-1000 nhân viên</option>
                  <option value="1000+">1000+ nhân viên</option>
                </Select>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={3}
                placeholder="Nhập địa chỉ công ty"
              />
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <Label htmlFor="logo">Logo công ty</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleChangeLogo}
              />
              {logoPreview && (
                <div className="mt-2">
                  <img
                    src={logoPreview}
                    alt="Xem trước logo"
                    className="h-24 w-24 rounded-lg border border-gray-200 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={handleClose}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary-dark">
                {isLoading
                  ? 'Đang xử lý...'
                  : initialData
                  ? 'Lưu thay đổi'
                  : 'Tạo công ty'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

