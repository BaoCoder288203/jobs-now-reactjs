import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CVPreview } from './CVPreview';
import { Button } from '@/components/ui/button';
import { useUpdateResume } from '@/modules/resumes/hooks';
import { serializeExtractedCvData } from '@/lib/parseExtractedCv';
import { normalizeCVTemplateKey, type CVTemplateKey } from '@/constants/cvTemplates';
import type { ExtractedCVData } from '@/types';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

interface ParsedCVEditFormProps {
  resumeId: string;
  resumeName?: string;
  initialData: ExtractedCVData;
  templateKey?: string;
}

export function ParsedCVEditForm({
  resumeId,
  resumeName,
  initialData,
  templateKey,
}: ParsedCVEditFormProps) {
  const [cvData, setCvData] = useState<ExtractedCVData>(initialData);
  const updateResume = useUpdateResume();

  useEffect(() => {
    setCvData(initialData);
  }, [initialData]);

  const resolvedTemplate = normalizeCVTemplateKey(
    templateKey ?? initialData.suggestedTemplateKey ?? 'cvhay-industry-safety'
  ) as CVTemplateKey;

  const handleSave = async () => {
    try {
      await updateResume.mutateAsync({
        resumeId,
        data: {
          summary: cvData.summary ?? null,
          templateKey: resolvedTemplate,
          extractedText: serializeExtractedCvData(cvData),
        },
      });
      toast.success('Đã lưu CV');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Lưu CV thất bại');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/user/resumes" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-xl font-bold text-gray-900">
          Chỉnh sửa CV{resumeName ? `: ${resumeName}` : ''}
        </h2>
        <span className="text-sm text-gray-500">(từ file đã phân tích)</span>
      </div>
      <p className="text-sm text-gray-600">
        Chỉnh trực tiếp trên bản xem trước. Các mục kinh nghiệm, học vấn, kỹ năng… được lưu vào hồ sơ này.
      </p>
      <CVPreview
        data={cvData}
        onDataChange={setCvData}
        templateKey={resolvedTemplate}
        showDownloadButton
      />
      <div className="flex justify-center gap-3 pb-8">
        <Button variant="outline" asChild>
          <Link to="/user/resumes">Hủy</Link>
        </Button>
        <Button onClick={handleSave} disabled={updateResume.isPending}>
          {updateResume.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </div>
    </div>
  );
}
