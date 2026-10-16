import { useRef } from 'react';
import { useAppSelector } from '@/app/hooks';
import { useUploadResume } from '@/modules/resumes/hooks';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

export function CVUploadForm() {
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.userId ? String(user.userId) : '';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadResume();
  const isUploading = uploadMutation.isPending;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading) return;
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      toast.error('Chỉ chấp nhận file PDF');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file tối đa 5MB');
      return;
    }
    try {
      const result = await uploadMutation.mutateAsync({ userId, file });
      if (fileInputRef.current) fileInputRef.current.value = '';
      const parseStatus = (result as { parseStatus?: string })?.parseStatus;
      const sectionsSynced = (result as { sectionsSynced?: number })?.sectionsSynced;
      if (parseStatus === 'SUCCESS') {
        toast.success(
          sectionsSynced != null && sectionsSynced > 0
            ? `Đã nhập ${sectionsSynced} mục vào hồ sơ. Chỉnh sửa tại Quản lý CV.`
            : 'Đã tải lên và phân tích CV thành công'
        );
      } else if (parseStatus === 'PARTIAL') {
        toast.warning(
          sectionsSynced != null && sectionsSynced > 0
            ? `Đã nhập ${sectionsSynced} mục. Kiểm tra và bổ sung phần còn thiếu.`
            : 'CV đã tải lên nhưng một số mục chưa nhận diện đủ'
        );
      } else if (parseStatus === 'FAILED') {
        toast.warning('File đã lưu nhưng chưa phân tích được nội dung');
      } else {
        toast.success('Tải lên CV thành công');
      }
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? 'Tải lên thất bại');
    }
  };

  return (
    <div className="max-w-xl mx-auto border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <p className="text-gray-600 mb-4">Kéo thả file PDF hoặc click để chọn</p>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="gap-2 min-w-[200px]"
      >
        {isUploading ? (
          <>
            <LoadingSpinner size="sm" className="border-white/40 border-t-white" />
            Đang tải & phân tích...
          </>
        ) : (
          'Chọn file PDF'
        )}
      </Button>
      {isUploading ? (
        <p className="mt-4 text-sm text-gray-500">Đang xử lý file, vui lòng không đóng trang...</p>
      ) : null}
    </div>
  );
}
