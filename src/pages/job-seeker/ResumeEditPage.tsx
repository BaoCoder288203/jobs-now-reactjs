import { Link, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { Button } from '@/components/ui/button';
import { useSetDefaultResume } from '@/modules/resumes/hooks';
import { ArrowLeft } from 'lucide-react';
import { CVContentForm } from '@/components/cv-builder/CVContentForm';

export function ResumeEditPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const resumeId = searchParams.get('id') ?? undefined;
  const resumeName = (location.state as { resumeName?: string })?.resumeName as string | undefined;

  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.userId ? String(user.userId) : '';

  const setDefaultResume = useSetDefaultResume();
  const handleSetDefaultAndBack = () => {
    if (!resumeId || !userId) return;
    setDefaultResume.mutateAsync({ userId, resumeId }).then(() => navigate('..', { relative: 'path' }));
  };

  const header = (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <Link to=".." relative="path" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {resumeName ? `Chỉnh sửa nội dung: ${resumeName}` : 'Chỉnh sửa nội dung CV'}
        </h1>
      </div>
      {resumeId && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleSetDefaultAndBack}
          disabled={setDefaultResume.isPending}
        >
          {setDefaultResume.isPending ? 'Đang xử lý...' : 'Lưu và đặt làm CV mặc định'}
        </Button>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <CVContentForm
        userId={userId}
        header={header}
        resumeTitle={resumeName ?? 'CV của tôi'}
        resumeId={resumeId}
      />
    </div>
  );
}
