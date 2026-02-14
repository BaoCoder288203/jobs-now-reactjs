import { Link, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { CVBuilderSection } from '@/components/cv-builder/CVBuilderSection';
import { useAppSelector } from '@/app/hooks';
import { useResumes } from '@/modules/resumes/hooks';
import type { ExtractedCVData } from '@/types';

export function CVBuilderPage() {
  const [searchParams] = useSearchParams();
  const editResumeId = searchParams.get('edit') ?? null;
  const { user } = useAppSelector((state) => state.auth);
  const { data: resumes } = useResumes(user?.id ?? '');
  const resumeToEdit = editResumeId ? resumes?.find((r) => r.id === editResumeId) : null;
  const initialCVData = resumeToEdit?.extracted_text
    ? (JSON.parse(resumeToEdit.extracted_text) as ExtractedCVData)
    : undefined;

  return (
    <AppLayout>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-4">
          <Link to="/tools/tao-cv" className="text-primary hover:underline font-medium text-sm">
            ← Quay lại trang Tạo CV
          </Link>
        </div>
        <CVBuilderSection editResumeId={editResumeId} initialCVData={initialCVData} />
      </div>
    </AppLayout>
  );
}
