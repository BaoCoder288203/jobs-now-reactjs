import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotkey } from '@tanstack/react-hotkeys';
import { useAppSelector } from '@/app/hooks';
import { useProfile, useProfileSkills } from '@/modules/profile/hooks';
import { useCreateCV, useUpdateCV } from '@/modules/cv/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CVPreview } from './CVPreview';
import type { ExtractedCVData } from '@/types';

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
  const userId = user?.id ?? '';
  const [cvData, setCvData] = useState<ExtractedCVData>(initialData ?? emptyCVData);
  const [showPreview, setShowPreview] = useState(false);

  const { data: profile } = useProfile(userId);
  const { data: profileSkills } = useProfileSkills(userId);
  const createMutation = useCreateCV();
  const updateMutation = useUpdateCV();

  useEffect(() => {
    if (profile && !initialData) {
      setCvData((prev) => ({
        ...prev,
        headline: profile.headline,
        summary: profile.summary,
        skills: profileSkills?.map((ps) => ({ name: ps.skill?.name ?? '', level: ps.level })) ?? prev.skills,
      }));
    }
  }, [profile, profileSkills, initialData]);

  const handleSave = async () => {
    if (isGuest) {
      alert('Đăng nhập để lưu CV');
      return;
    }
    if (editResumeId) {
      await updateMutation.mutateAsync({ resumeId: editResumeId, cvData });
    } else {
      const resumeName = `CV_${cvData.headline ?? 'Manual'}_${Date.now()}.pdf`;
      await createMutation.mutateAsync({
        userId,
        cvData,
        resumeName,
        isAiGenerated: false,
      });
    }
    navigate('/user/resumes');
  };

  const canSave = !isGuest && !createMutation.isPending && !updateMutation.isPending && showPreview;
  useHotkey('Mod+S', (e) => {
    e.preventDefault();
    if (canSave) handleSave();
  }, { enabled: canSave });

  return (
    <div className="space-y-8">
      {!showPreview ? (
        <>
          <div className="space-y-4 max-w-xl mx-auto">
            <div>
              <Label>Tiêu đề</Label>
              <Input
                value={cvData.headline ?? ''}
                onChange={(e) => setCvData((p) => ({ ...p, headline: e.target.value }))}
                placeholder="VD: Senior Software Developer"
              />
            </div>
            <div>
              <Label>Giới thiệu</Label>
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
            <Button onClick={handleSave} disabled={isGuest || createMutation.isPending || updateMutation.isPending}>
              {isGuest ? 'Đăng nhập để lưu' : editResumeId ? 'Cập nhật CV' : 'Lưu CV'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
