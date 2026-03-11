import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotkey } from '@tanstack/react-hotkeys';
import { useAppSelector } from '@/app/hooks';
import { useProfile, useProfileSkills, useUpdateProfile } from '@/modules/profile/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CVPreview } from './CVPreview';
import { CVContentForm } from './CVContentForm';
import { CVCreateForm } from './CVCreateForm';
import type { ExtractedCVData } from '@/types';
import { toast } from 'sonner';

const emptyCVData: ExtractedCVData = {
  work_experiences: [],
  educations: [],
  skills: [],
  projects: [],
  languages: [],
  certificates: [],
};

interface ManualCVFormProps {
  isGuest?: boolean;
  initialData?: ExtractedCVData;
  editResumeId?: string | null;
}

export function ManualCVForm({ isGuest, initialData, editResumeId }: ManualCVFormProps) {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.userId ? String(user.userId) : '';
  const [cvData, setCvData] = useState<ExtractedCVData>(initialData ?? emptyCVData);
  const [showPreview, setShowPreview] = useState(false);

  const { data: profile } = useProfile(userId);
  const { data: profileSkills } = useProfileSkills(userId);
  const updateProfile = useUpdateProfile();

  useEffect(() => {
    if (profile && !initialData) {
      setCvData((prev) => ({
        ...prev,
        headline: profile.title ?? profile.headline ?? prev.headline,
        summary: profile.bio ?? profile.summary ?? prev.summary,
        skills:
          profileSkills?.map((ps) => ({
            name: ps.skillName ?? (ps as { skill?: { name?: string } }).skill?.name ?? '',
            level: ps.level,
          })) ?? prev.skills,
      }));
    }
  }, [profile, profileSkills, initialData]);

  const handleSave = async () => {
    if (isGuest) {
      toast.info('Đăng nhập để lưu CV');
      return;
    }
    await updateProfile.mutateAsync({
      userId,
      data: {
        title: cvData.headline ?? '',
        bio: cvData.summary ?? '',
      },
    });
    navigate('/user/resumes');
  };

  const canSave = !isGuest && !updateProfile.isPending && showPreview;
  useHotkey('Mod+S', (e) => {
    e.preventDefault();
    if (canSave) handleSave();
  }, { enabled: canSave });

  if (!isGuest && userId) {
    if (editResumeId) {
      return (
        <div className="space-y-8 max-w-4xl mx-auto">
          <CVContentForm userId={userId} resumeId={editResumeId} />
        </div>
      );
    }
    // Create mode: chưa có resumeId → dùng CVCreateForm (save-all on submit)
    return <CVCreateForm userId={userId} />;
  }

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      {!showPreview ? (
        <>
          <div className="space-y-4">
            <div>
              <Label>Tiêu đề</Label>
              <Input
                value={cvData.headline ?? ''}
                onChange={(e) => setCvData((p) => ({ ...p, headline: e.target.value }))}
                placeholder="VD: Senior Software Developer"
              />
            </div>
            <div>
              <Label>Giới thiệu (Summary)</Label>
              <textarea
                value={cvData.summary ?? ''}
                onChange={(e) => setCvData((p) => ({ ...p, summary: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg min-h-[100px]"
                placeholder="Mô tả ngắn về bản thân..."
              />
            </div>
            <div>
              <Label>Kỹ năng (phân cách bằng dấu phẩy)</Label>
              <Input
                value={cvData.skills?.map((s) => s.name).join(', ') ?? ''}
                onChange={(e) =>
                  setCvData((p) => ({
                    ...p,
                    skills: e.target.value.split(',').map((n) => ({ name: n.trim(), level: undefined })).filter((s) => s.name),
                  }))
                }
                placeholder="React, TypeScript, Node.js"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setShowPreview(true)}>
              Xem trước
            </Button>
          </div>
        </>
      ) : (
        <>
          <CVPreview data={cvData} onDataChange={setCvData} />
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Quay lại chỉnh sửa
            </Button>
            <Button onClick={handleSave} disabled={isGuest || updateProfile.isPending}>
              {isGuest ? 'Đăng nhập để lưu' : updateProfile.isPending ? 'Đang lưu...' : editResumeId ? 'Cập nhật CV' : 'Lưu CV'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
