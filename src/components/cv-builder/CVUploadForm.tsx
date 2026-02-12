import { useRef } from 'react';
import { useAppSelector } from '@/app/hooks';
import { useUploadResume } from '@/modules/resumes/hooks';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

export function CVUploadForm() {
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.id ?? '';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadResume();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Chỉ chấp nhận file PDF');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước file tối đa 5MB');
      return;
    }
    try {
      await uploadMutation.mutateAsync({ userId, file });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      alert((err as Error)?.message ?? 'Tải lên thất bại');
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
      />
      <Button onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending}>
        Chọn file PDF
      </Button>
    </div>
  );
}
