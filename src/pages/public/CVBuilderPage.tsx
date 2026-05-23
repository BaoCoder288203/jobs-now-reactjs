import { Link, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { CVBuilderSection } from '@/components/cv-builder/CVBuilderSection';
import { useAppSelector } from '@/app/hooks';
import { useResumes } from '@/modules/resumes/hooks';
import { parseExtractedCvData } from '@/lib/parseExtractedCv';

export function CVBuilderPage() {
  const [searchParams] = useSearchParams();
  const editResumeId = searchParams.get('edit') ?? null;
  const { user } = useAppSelector((state) => state.auth);
  const { data: resumes } = useResumes(user?.userId ? String(user.userId) : '');
  const resumeToEdit = editResumeId
    ? resumes?.find((r) => String(r.id ?? r.resumeId) === editResumeId)
    : null;
  const initialCVData = parseExtractedCvData(resumeToEdit?.extracted_text) ?? undefined;

  return (
    <AppLayout>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-4">
          <Link to="/tools/tao-cv" className="text-primary hover:underline font-medium text-sm">
            ← Quay lại trang Tạo CV
          </Link>
        </div>
        <CVBuilderSection
          editResumeId={editResumeId}
          initialCVData={initialCVData}
          editResumeName={resumeToEdit?.resumeName ?? resumeToEdit?.file_name}
          editTemplateKey={resumeToEdit?.templateKey}
        />
      </div>
    </AppLayout>
  );
}
