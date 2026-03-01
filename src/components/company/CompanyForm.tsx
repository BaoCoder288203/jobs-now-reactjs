import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import * as industryService from '@/services/industry.service';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useDeleteLogo, useDeleteBanner, useDeleteCompanyImage } from '@/modules/companies/hooks';
import type { Company, CreateCompanyRequest } from '@/types';

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
    slogan: '',
    website: '',
    company_size: '',
    address: '',
    industry_ids: [],
  });
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [thumbnailFiles, setThumbnailFiles] = useState<File[]>([]);
  const [thumbnailPreviews, setThumbnailPreviews] = useState<string[]>([]);
  const [industries, setIndustries] = useState<{ id: string; name: string }[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [industrySearch, setIndustrySearch] = useState('');
  const [industryDropdownOpen, setIndustryDropdownOpen] = useState(false);

  const deleteLogoMutation = useDeleteLogo();
  const deleteBannerMutation = useDeleteBanner();
  const deleteImageMutation = useDeleteCompanyImage();

  const MAX_THUMBNAILS = 5;

  useEffect(() => {
    industryService.getIndustriesList().then((list) => setIndustries(list));
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        slogan: initialData.slogan || '',
        website: initialData.website || '',
        company_size: initialData.company_size || '',
        address: initialData.address || '',
        industry_ids: initialData.industry_ids ?? (initialData.industry_id ? [initialData.industry_id] : []),
      });
      setLogoPreview(initialData.logo_url || '');
      setBannerPreview(initialData.banner_url || '');
      setThumbnailPreviews([]);
      setDeletedImageIds([]);
    } else {
      setFormData({
        name: '',
        description: '',
        slogan: '',
        website: '',
        company_size: '',
        address: '',
        industry_ids: [],
      });
      setLogoPreview('');
      setBannerPreview('');
      setThumbnailPreviews([]);
      setDeletedImageIds([]);
    }
    setLogoFile(null);
    setBannerFile(null);
    setThumbnailFiles([]);
    setIndustrySearch('');
    setIndustryDropdownOpen(false);
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare FormData
    const data = new FormData();
    
    data.append(
      'company',
      new Blob([JSON.stringify(formData)], { type: 'application/json' }),
    );

    if (initialData?.id) {
      data.append('companyId', initialData.id);
    }

    // Append logo file if exists
    if (logoFile) {
      data.append('logoFile', logoFile);
    }
    if (bannerFile) {
      data.append('bannerFile', bannerFile);
    }
    thumbnailFiles.forEach((file) => {
      data.append('thumbnailFiles', file);
    });

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

  const selectedIds = formData.industry_ids ?? [];
  const industrySuggestions = industries.filter(
    (ind) =>
      !selectedIds.includes(ind.id) &&
      ind.name.toLowerCase().includes(industrySearch.trim().toLowerCase())
  );

  const handleIndustryToggle = (industryId: string) => {
    setFormData((prev) => {
      const ids = prev.industry_ids ?? [];
      const next = ids.includes(industryId)
        ? ids.filter((id) => id !== industryId)
        : [...ids, industryId];
      return { ...prev, industry_ids: next };
    });
  };

  const handleAddIndustry = (industryId: string) => {
    if (selectedIds.includes(industryId)) return;
    setFormData((prev) => ({
      ...prev,
      industry_ids: [...(prev.industry_ids ?? []), industryId],
    }));
    setIndustrySearch('');
    setIndustryDropdownOpen(false);
  };

  const handleIndustryInputBlur = () => {
    setTimeout(() => setIndustryDropdownOpen(false), 200);
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

  const handleDeleteLogo = async () => {
    if (!initialData?.id) return;
    try {
      await deleteLogoMutation.mutateAsync(initialData.id);
      setLogoFile(null);
      setLogoPreview('');
    } catch (err: unknown) {
      alert((err as { message?: string })?.message || 'Không thể xóa logo');
    }
  };

  const handleChangeBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setBannerPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteBanner = async () => {
    if (!initialData?.id) return;
    try {
      await deleteBannerMutation.mutateAsync(initialData.id);
      setBannerFile(null);
      setBannerPreview('');
    } catch (err: unknown) {
      alert((err as { message?: string })?.message || 'Không thể xóa banner');
    }
  };

  const handleChangeThumbnails = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const existingCount =
      (initialData?.images?.length ?? 0) - deletedImageIds.length + thumbnailFiles.length;
    const toAdd = files.slice(0, MAX_THUMBNAILS - existingCount);
    if (toAdd.length === 0) return;
    const newPreviews = await Promise.all(
      toAdd.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () =>
              resolve(typeof reader.result === 'string' ? reader.result : '');
            reader.readAsDataURL(file);
          })
      )
    );
    setThumbnailFiles((prev) => [...prev, ...toAdd]);
    setThumbnailPreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const removeThumbnail = async (index: number) => {
    const existingImages = (initialData?.images ?? []).filter(
      (img) => !deletedImageIds.includes(img.imageId)
    );
    const existingLen = existingImages.length;
    if (index < existingLen) {
      const img = existingImages[index];
      if (img?.imageId) {
        try {
          await deleteImageMutation.mutateAsync(img.imageId);
          setDeletedImageIds((prev) => [...prev, img.imageId]);
        } catch (err: unknown) {
          alert((err as { message?: string })?.message || 'Không thể xóa ảnh');
        }
      }
      return;
    }
    const fileIndex = index - existingLen;
    setThumbnailFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    setThumbnailPreviews((prev) => prev.filter((_, i) => i !== fileIndex));
  };

  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      slogan: '',
      website: '',
      company_size: '',
      address: '',
      industry_ids: [],
    });
    setLogoPreview('');
    setLogoFile(null);
    setBannerPreview('');
    setBannerFile(null);
    setThumbnailFiles([]);
    setThumbnailPreviews([]);
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

            {/* Slogan */}
            <div className="space-y-2">
              <Label htmlFor="slogan">Slogan / Khẩu hiệu</Label>
              <Input
                id="slogan"
                value={formData.slogan ?? ''}
                onChange={(e) => handleChange('slogan', e.target.value)}
                placeholder="VD: Nơi làm việc tốt nhất"
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

            {/* Industries: search input + dropdown + tags */}
            <div className="space-y-2">
              <Label>Ngành nghề</Label>
              {selectedIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedIds.map((id) => {
                    const ind = industries.find((i) => i.id === id);
                    return (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="pl-2 pr-1 py-1 text-sm font-normal gap-1"
                      >
                        {ind?.name ?? id}
                        <button
                          type="button"
                          onClick={() => handleIndustryToggle(id)}
                          className="rounded-full hover:bg-gray-300/80 p-0.5 leading-none"
                          aria-label={`Bỏ chọn ${ind?.name ?? id}`}
                        >
                          ×
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
              <div className="relative">
                <Input
                  type="text"
                  value={industrySearch}
                  onChange={(e) => {
                    setIndustrySearch(e.target.value);
                    setIndustryDropdownOpen(true);
                  }}
                  onFocus={() => setIndustryDropdownOpen(true)}
                  onBlur={handleIndustryInputBlur}
                  placeholder="Tìm và chọn ngành nghề..."
                  className="w-full"
                />
                {industryDropdownOpen && (
                  <div
                    className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-48 overflow-y-auto"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {industrySuggestions.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        {industrySearch.trim()
                          ? 'Không tìm thấy ngành phù hợp'
                          : 'Nhập để tìm ngành nghề'}
                      </div>
                    ) : (
                      industrySuggestions.map((ind) => (
                        <button
                          key={ind.id}
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                          onMouseDown={() => handleAddIndustry(ind.id)}
                        >
                          {ind.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
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
                <div className="mt-2 relative inline-block group">
                  <img
                    src={logoPreview}
                    alt="Xem trước logo"
                    className="h-24 w-24 rounded-lg border border-gray-200 object-cover"
                  />
                  {initialData && (
                    <button
                      type="button"
                      onClick={handleDeleteLogo}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      aria-label="Xóa logo"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Banner */}
            <div className="space-y-2">
              <Label htmlFor="banner">Banner công ty</Label>
              <Input
                id="banner"
                type="file"
                accept="image/*"
                onChange={handleChangeBanner}
              />
              {bannerPreview && (
                <div className="mt-2 relative inline-block group">
                  <img
                    src={bannerPreview}
                    alt="Xem trước banner"
                    className="w-full h-32 rounded-lg border border-gray-200 object-cover"
                  />
                  {initialData && (
                    <button
                      type="button"
                      onClick={handleDeleteBanner}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      aria-label="Xóa banner"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Thumbnail images */}
            <div className="space-y-2">
              <Label htmlFor="thumbnails">Ảnh thumbnail (tối đa {MAX_THUMBNAILS} ảnh)</Label>
              <Input
                id="thumbnails"
                type="file"
                accept="image/*"
                multiple
                onChange={handleChangeThumbnails}
                disabled={
                  (initialData?.images?.length ?? 0) - deletedImageIds.length + thumbnailFiles.length >= MAX_THUMBNAILS
                }
              />
              {(() => {
                const existingImages = (initialData?.images ?? []).filter(
                  (img) => !deletedImageIds.includes(img.imageId)
                );
                const allThumbnails = [
                  ...existingImages.map((img) => ({ src: img.imageUrl, type: 'existing' as const })),
                  ...thumbnailPreviews.map((src) => ({ src, type: 'new' as const })),
                ];
                if (allThumbnails.length === 0) return null;
                return (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {allThumbnails.map((item, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={item.src}
                          alt={`Thumbnail ${i + 1}`}
                          className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeThumbnail(i)}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          aria-label="Xóa ảnh"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
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

