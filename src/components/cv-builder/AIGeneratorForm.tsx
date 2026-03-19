import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { useGenerateCVWithAI } from '@/modules/cv/hooks';
import { useProfile } from '@/modules/profile/hooks';
import { getIndustriesList } from '@/services/industry.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CVPreview } from './CVPreview';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { GenerateCVResponse } from '@/services/ai.service';
import { toast } from 'sonner';

interface IndustryItem {
  id: string;
  name: string;
}

export function AIGeneratorForm() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const profileId = user?.profileId;
  const userId = user?.userId ? String(user.userId) : '';
  const { data: profile } = useProfile(userId);

  const [step, setStep] = useState<'input' | 'loading' | 'preview'>('input');
  const [industries, setIndustries] = useState<IndustryItem[]>([]);
  const [input, setInput] = useState({
    industry: '',
    targetJob: '',
    language: 'vi',
    additionalInfo: '',
  });
  const [cvData, setCvData] = useState<GenerateCVResponse | null>(null);

  const generateMutation = useGenerateCVWithAI();

  useEffect(() => {
    getIndustriesList().then(setIndustries).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!input.targetJob) {
      toast.error('Vui lòng nhập vị trí mong muốn');
      return;
    }
    setStep('loading');
    try {
      const data = await generateMutation.mutateAsync({
        profileId: profileId ?? undefined,
        targetJob: input.targetJob,
        industry: input.industry || undefined,
        additionalInfo: input.additionalInfo.trim() || undefined,
        language: input.language,
      });
      setCvData(data);
      setStep('preview');
    } catch {
      toast.error('Tạo CV thất bại. Vui lòng thử lại.');
      setStep('input');
    }
  };

  if (step === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">AI đang tạo CV cho bạn...</p>
      </div>
    );
  }

  if (step === 'preview' && cvData) {
    const previewData = {
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      address: profile?.address ?? '',
      title: input.targetJob,
      headline: input.targetJob,
      summary: cvData.summary,
      work_experiences: (cvData.experiences ?? []).map((e) => ({
        company: e.company,
        position: e.title,
        duration: e.duration,
        start_date: '',
        end_date: '',
        description: (e.bullets ?? []).join('\n'),
      })),
      educations: (cvData.educations ?? []).map((e) => ({
        school: e.school,
        major: e.major,
        degree: e.degree,
        duration: e.duration,
        start_date: '',
        end_date: '',
      })),
      skills: cvData.skillsSection
        ? cvData.skillsSection
            .split(/[;]/)
            .flatMap((group) => {
              const cleaned = group.replace(/^[^:]+:\s*/, '');
              return cleaned.split(',').map((s) => s.trim()).filter(Boolean);
            })
            .map((s) => ({ name: s, level: '' }))
        : [],
      projects: (cvData.projects ?? []).map((p) => ({
        name: p.name,
        description: p.description,
        duration: p.duration,
      })),
      languages: [],
      certificates: (cvData.certifications ?? []).map((c) => ({ name: c, issuer: '' })),
    };

    return (
      <div className="space-y-6">
        <CVPreview data={previewData} language={input.language as 'vi' | 'en'} onDataChange={() => {}} />
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => setStep('input')}>
            Tạo lại
          </Button>
          <Button onClick={() => navigate('/user/resumes')}>
            Quay về danh sách CV
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div>
        <Label>Ngành nghề</Label>
        <Input
          value={input.industry}
          onChange={(e) => setInput((p) => ({ ...p, industry: e.target.value }))}
          className="w-full mt-1"
          placeholder="Gõ để tìm nhanh ngành nghề"
          list="industry-options"
        />
        <datalist id="industry-options">
          {industries.map((i) => (
            <option key={i.id} value={i.name}>{i.name}</option>
          ))}
        </datalist>
      </div>
      <div>
        <Label>Vị trí mong muốn</Label>
        <Input
          value={input.targetJob}
          onChange={(e) => setInput((p) => ({ ...p, targetJob: e.target.value }))}
          placeholder="VD: Software Engineer"
        />
      </div>
      <div>
        <Label>Ngôn ngữ CV</Label>
        <select
          value={input.language}
          onChange={(e) => setInput((p) => ({ ...p, language: e.target.value }))}
          className="w-full mt-1 px-3 py-2 border rounded-lg"
        >
          <option value="vi">Tiếng Việt</option>
          <option value="en">English</option>
        </select>
      </div>
      <div>
        <Label>Thông tin bổ sung (tùy chọn)</Label>
        <textarea
          value={input.additionalInfo}
          onChange={(e) => setInput((p) => ({ ...p, additionalInfo: e.target.value }))}
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
