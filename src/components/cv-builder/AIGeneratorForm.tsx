import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotkey } from '@tanstack/react-hotkeys';
import { useAppSelector } from '@/app/hooks';
import { useGenerateCVWithAI, useCreateCV } from '@/modules/cv/hooks';
import { mockIndustries } from '@/mocks/data/industries.mock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CVPreview } from './CVPreview';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { ExtractedCVData } from '@/types';

export function AIGeneratorForm() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.userId ? String(user.userId) : '';
  const [step, setStep] = useState<'input' | 'loading' | 'preview'>('input');
  const [input, setInput] = useState({
    industry_id: '',
    target_position: '',
    years_experience: 0,
    additional_info: '',
  });
  const [cvData, setCvData] = useState<ExtractedCVData | null>(null);

  const generateMutation = useGenerateCVWithAI();
  const createMutation = useCreateCV();

  const handleGenerate = async () => {
    if (!input.industry_id || !input.target_position) return;
    setStep('loading');
    try {
      const data = await generateMutation.mutateAsync({ userId, input });
      setCvData(data);
      setStep('preview');
    } catch {
      setStep('input');
    }
  };

  const handleSave = async () => {
    if (!cvData) return;
    const resumeName = `CV_${input.target_position}_${Date.now()}.pdf`;
    await createMutation.mutateAsync({
      userId,
      cvData,
      resumeName,
      isAiGenerated: true,
    });
    navigate('/user/resumes');
  };

  const canSavePreview = step === 'preview' && !!cvData && !createMutation.isPending;
  useHotkey('Mod+S', (e) => {
    e.preventDefault();
    if (canSavePreview) handleSave();
  }, { enabled: canSavePreview });

  if (step === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">AI đang tạo CV cho bạn...</p>
      </div>
    );
  }

  if (step === 'preview' && cvData) {
    return (
      <div className="space-y-6">
        <CVPreview data={cvData} onDataChange={setCvData} />
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => setStep('input')}>
            Tạo lại
          </Button>
          <Button onClick={handleSave} disabled={createMutation.isPending}>
            Lưu CV
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div>
        <Label>Ngành nghề</Label>
        <select
          value={input.industry_id}
          onChange={(e) => setInput((p) => ({ ...p, industry_id: e.target.value }))}
          className="w-full mt-1 px-3 py-2 border rounded-lg"
        >
          <option value="">Chọn ngành nghề</option>
          {mockIndustries.map((i) => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </select>
      </div>
      <div>
        <Label>Vị trí mong muốn</Label>
        <Input
          value={input.target_position}
          onChange={(e) => setInput((p) => ({ ...p, target_position: e.target.value }))}
          placeholder="VD: Software Engineer"
        />
      </div>
      <div>
        <Label>Số năm kinh nghiệm</Label>
        <select
          value={input.years_experience}
          onChange={(e) => setInput((p) => ({ ...p, years_experience: +e.target.value }))}
          className="w-full mt-1 px-3 py-2 border rounded-lg"
        >
          {[0, 1, 2, 3, 5, 7, 10].map((n) => (
            <option key={n} value={n}>{n} năm</option>
          ))}
        </select>
      </div>
      <div>
        <Label>Thông tin bổ sung (tùy chọn)</Label>
        <textarea
          value={input.additional_info}
          onChange={(e) => setInput((p) => ({ ...p, additional_info: e.target.value }))}
          className="w-full mt-1 px-3 py-2 border rounded-lg min-h-[80px]"
          placeholder="Mô tả ngắn về bản thân, mục tiêu nghề nghiệp..."
        />
      </div>
      <Button onClick={handleGenerate} disabled={generateMutation.isPending} className="w-full">
        Tạo CV với AI
      </Button>
    </div>
  );
}
