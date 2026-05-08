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
import { normalizeCVTemplateKey, CV_TEMPLATE_OPTIONS } from '@/constants/cvTemplates';
import { Sparkles } from 'lucide-react';
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
    templateMode: 'auto',
    manualTemplate: CV_TEMPLATE_OPTIONS[0]?.key || 'cvhay-it-software',
  });
  const [cvData, setCvData] = useState<GenerateCVResponse | null>(null);

  const generateMutation = useGenerateCVWithAI();

  useEffect(() => {
    getIndustriesList().then(setIndustries).catch(() => { });
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
      avatarUrl: profile?.avatarUrl || user?.avatar || '',
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
        {cvData.suggestedTemplateKey && (
          <div className="relative overflow-hidden rounded-[20px] bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-6 p-5 transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group max-w-3xl mx-auto">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-50/80 via-purple-50/30 to-transparent rounded-bl-full pointer-events-none transition-opacity group-hover:opacity-100 opacity-60"></div>
            <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3">
               <Sparkles className="h-40 w-40 text-indigo-500/5 rotate-12" />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
              <div className="flex-shrink-0 relative">
                <div className="absolute -inset-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-[6px] opacity-30 animate-pulse"></div>
                <div className="relative w-[52px] h-[52px] rounded-xl bg-gradient-to-br from-white to-indigo-50 flex items-center justify-center border border-indigo-100/50 shadow-sm">
                  <Sparkles className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-1.5">
                  <h4 className="text-base font-bold text-gray-900 tracking-tight">Mẫu CV Đề Xuất Bởi AI</h4>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600 border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Tự động áp dụng
                  </span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
                  Dựa vào phân tích, hệ thống đã chọn sẵn bố cục tốt nhất cho vị trí <strong className="text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">{input.industry || input.targetJob}</strong>, giúp bạn ghi điểm tuyệt đối với nhà tuyển dụng và bộ lọc ATS.
                </p>
              </div>
            </div>
          </div>
        )}
        <CVPreview
          data={previewData}
          language={input.language as 'vi' | 'en'}
          templateKey={input.templateMode === 'manual' ? input.manualTemplate : normalizeCVTemplateKey(cvData.suggestedTemplateKey)}
          onDataChange={() => { }}
        />
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
    <div className="max-w-3xl mx-auto pb-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
        <div className="px-6 py-5 md:px-8 md:py-6 border-b border-gray-100 flex items-start sm:items-center gap-4 bg-gray-50/50">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-shrink-0 items-center justify-center border border-primary/20 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">Tạo CV Nhanh Bằng AI</h3>
              <p className="text-sm text-gray-500 mt-0.5">Nhập thông tin cơ bản để AI xây dựng hồ sơ chuyên nghiệp</p>
            </div>
        </div>
        
        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Ngành nghề</Label>
              <Input
                value={input.industry}
                onChange={(e) => setInput((p) => ({ ...p, industry: e.target.value }))}
                className="w-full h-11 rounded-lg bg-gray-50/50 focus:bg-white border-gray-200 transition-colors"
                placeholder="Ví dụ: Công nghệ thông tin"
                list="industry-options"
              />
              <datalist id="industry-options">
                {industries.map((i) => (
                  <option key={i.id} value={i.name}>{i.name}</option>
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Vị trí mong muốn <span className="text-rose-500">*</span></Label>
              <Input
                value={input.targetJob}
                onChange={(e) => setInput((p) => ({ ...p, targetJob: e.target.value }))}
                className="w-full h-11 rounded-lg bg-gray-50/50 focus:bg-white border-gray-200 transition-colors"
                placeholder="VD: Frontend Developer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 pt-2">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Ngôn ngữ CV</Label>
              <div className="flex gap-3 mt-1 cursor-pointer">
                {[{ value: 'vi', label: 'Tiếng Việt' }, { value: 'en', label: 'English' }].map((lang) => (
                  <div
                    key={lang.value}
                    onClick={() => setInput((p) => ({ ...p, language: lang.value }))}
                    className={`flex-1 flex items-center justify-center h-11 rounded-lg text-sm font-medium transition-all border ${
                      input.language === lang.value
                        ? 'border-primary bg-primary/5 text-primary shadow-sm'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {lang.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Chọn mẫu CV</Label>
              <div className="flex gap-3 mt-1 cursor-pointer">
                {[{ value: 'auto', label: 'AI Đề Xuất' }, { value: 'manual', label: 'Tự Chọn' }].map((mode) => (
                  <div
                    key={mode.value}
                    onClick={() => setInput((p) => ({ ...p, templateMode: mode.value }))}
                    className={`flex-1 flex items-center justify-center h-11 rounded-lg text-sm font-medium transition-all border ${
                      input.templateMode === mode.value
                        ? 'border-primary bg-primary/5 text-primary shadow-sm'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {mode.label}
                  </div>
                ))}
              </div>
              {input.templateMode === 'manual' && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                  <select
                    value={input.manualTemplate}
                    onChange={(e) => setInput((p) => ({ ...p, manualTemplate: e.target.value }))}
                    className="w-full h-11 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    {CV_TEMPLATE_OPTIONS.map((template) => (
                      <option key={template.key} value={template.key}>
                        {template.name} - {template.category}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label className="text-sm font-semibold text-gray-700">Thông tin bổ sung <span className="text-gray-400 font-normal">(tùy chọn)</span></Label>
            <textarea
              value={input.additionalInfo}
              onChange={(e) => setInput((p) => ({ ...p, additionalInfo: e.target.value }))}
              className="w-full border border-gray-200 bg-gray-50/50 focus:bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all px-4 py-3 min-h-[100px] text-sm resize-y"
              placeholder="Thêm mô tả ngắn về bản thân, kinh nghiệm nổi bật hoặc mục tiêu nghề nghiệp để AI có thể sáng tạo nội dung sát nhất với bạn..."
            />
          </div>
        </div>

        <div className="px-6 py-5 md:px-8 border-t border-gray-100 bg-gray-50/30">
          <Button 
            onClick={handleGenerate} 
            disabled={generateMutation.isPending} 
            className="w-full h-12 text-base font-bold shadow-sm gap-2 rounded-lg bg-primary hover:bg-primary/90 text-white"
          >
            <Sparkles className="h-5 w-5" />
            Tạo CV Với AI
          </Button>
        </div>
      </div>
    </div>
  );
}
