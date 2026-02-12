import { useAppSelector } from '@/app/hooks';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { CVFormTabs } from '@/components/cv-builder/CVFormTabs';
import { ManualCVForm } from '@/components/cv-builder/ManualCVForm';
import { Button } from '@/components/ui/button';
import type { ExtractedCVData } from '@/types';

interface CVBuilderSectionProps {
  editResumeId?: string | null;
  initialCVData?: ExtractedCVData;
}

export function CVBuilderSection({ editResumeId, initialCVData }: CVBuilderSectionProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { openLoginModal } = useAuthModal();

  if (isAuthenticated) {
    return (
      <section className="py-14 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            {editResumeId ? 'Chỉnh sửa CV' : 'Bắt đầu tạo CV của bạn'}
          </h2>
          <CVFormTabs editResumeId={editResumeId} initialCVData={initialCVData} />
        </div>
      </section>
    );
  }

  return (
    <section className="py-14 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Bắt đầu tạo CV của bạn
        </h2>
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-4">
            Đăng nhập để sử dụng tính năng tạo CV với AI và lưu CV
          </p>
          <Button onClick={() => openLoginModal('job_seeker')} className="mb-8">
            Đăng nhập
          </Button>
        </div>
        <ManualCVForm isGuest />
      </div>
    </section>
  );
}
