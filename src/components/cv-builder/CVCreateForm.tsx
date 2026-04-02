import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useProfileWithCV } from '@/modules/profile/profile-cv.hooks';
import { profileKeys } from '@/modules/profile/hooks';
import * as profileCvService from '@/services/profile-cv.service';
import { initResume } from '@/services/resume.service';
import { apiClient } from '@/services/api';
import { CVPreview } from './CVPreview';
import { CVTemplatePicker } from './CVTemplatePicker';
import { toast } from 'sonner';
import { Plus, Trash2, Upload, UserCircle2 } from 'lucide-react';
import type { ExtractedCVData } from '@/types';
import {
  DEFAULT_CV_TEMPLATE_KEY,
  getCVTemplateOptionByKey,
  normalizeCVTemplateKey,
  recommendCVTemplate,
  type CVTemplateKey,
} from '@/constants/cvTemplates';
import { setStoredCVLanguages } from '@/lib/cvLanguageStorage';
import { setStoredCVHeadline } from '@/lib/cvHeadlineStorage';

const WORK_LEVELS = ['INTERN', 'FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD', 'OTHER'] as const;
const EDUCATION_LEVELS = ['HIGH_SCHOOL', 'VOCATIONAL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'DOCTORATE', 'OTHER'] as const;
const SKILL_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
type SkillLevel = (typeof SKILL_LEVELS)[number];
const DEFAULT_SKILL_LEVEL: SkillLevel = 'BEGINNER';

type SelectedSkill = {
  skillId: number;
  level: SkillLevel;
};

type DraftWorkExp = {
  title: string;
  level: string;
  startDate: string;
  endDate: string;
  description: string;
};
type DraftEdu = {
  title: string;
  educationLevel: string;
  startDate: string;
  endDate: string;
  description: string;
};
type DraftProject = {
  title: string;
  startDate: string;
  endDate: string;
  description: string;
};
type DraftCert = {
  title: string;
  issueDate: string;
  description: string;
};

type DraftLanguage = {
  name: string;
  proficiency: string;
};

const emptyWE = (): DraftWorkExp => ({
  title: '',
  level: 'FRESHER',
  startDate: '',
  endDate: '',
  description: '',
});
const emptyEdu = (): DraftEdu => ({
  title: '',
  educationLevel: 'BACHELOR',
  startDate: '',
  endDate: '',
  description: '',
});
const emptyProject = (): DraftProject => ({
  title: '',
  startDate: '',
  endDate: '',
  description: '',
});
const emptyCert = (): DraftCert => ({
  title: '',
  issueDate: '',
  description: '',
});

const emptyLanguage = (): DraftLanguage => ({
  name: '',
  proficiency: '',
});

interface CVCreateFormProps {
  userId: string;
}

export function CVCreateForm({ userId }: CVCreateFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useProfileWithCV(userId);

  const [resumeName, setResumeName] = useState('CV của tôi');
  const [cvHeadline, setCvHeadline] = useState('');
  const [isHeadlineTouched, setIsHeadlineTouched] = useState(false);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<CVTemplateKey>(DEFAULT_CV_TEMPLATE_KEY);
  const [isTemplateManuallyPicked, setIsTemplateManuallyPicked] = useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [summary, setSummary] = useState('');
  const [workExps, setWorkExps] = useState<DraftWorkExp[]>([]);
  const [educations, setEducations] = useState<DraftEdu[]>([]);
  const [projects, setProjects] = useState<DraftProject[]>([]);
  const [certificates, setCertificates] = useState<DraftCert[]>([]);
  const [languages, setLanguages] = useState<DraftLanguage[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(true);
  const [downloadFlowOpen, setDownloadFlowOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Skill search state
  const [skillSearch, setSkillSearch] = useState('');
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const skillInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const { data: skillList = [] } = useQuery({
    queryKey: ['skill', 'all'],
    queryFn: async () => {
      const res = await apiClient.get('/skill/all');
      const raw = res as unknown;
      return (raw as { data?: { skillId: number; skillName: string }[] })?.data ?? (raw as { skillId: number; skillName: string }[]) ?? [];
    },
  });

  const skillOptions = (skillList as { skillId: number; skillName: string }[]).map((s) => ({
    skillId: s.skillId,
    skillName: s.skillName?.trim() ?? '',
  })).filter((s) => s.skillId && s.skillName);

  const filteredSkillOptions = skillOptions.filter(
    (s) =>
      !selectedSkills.some((item) => item.skillId === s.skillId) &&
      s.skillName.toLowerCase().includes(skillSearch.trim().toLowerCase())
  );
  const safeHighlightedIdx = Math.min(highlightedIdx, Math.max(0, filteredSkillOptions.length - 1));

  const recommendedTemplateKey = recommendCVTemplate({
    title: profile?.title,
    workExperienceCount: workExps.filter((item) => item.title.trim()).length,
  });

  useEffect(() => {
    if (!isTemplateManuallyPicked) {
      setSelectedTemplateKey(normalizeCVTemplateKey(recommendedTemplateKey));
    }
  }, [recommendedTemplateKey, isTemplateManuallyPicked]);

  useEffect(() => {
    if (!isHeadlineTouched && !cvHeadline.trim() && profile?.title?.trim()) {
      setCvHeadline(profile.title.trim());
    }
  }, [profile?.title, cvHeadline, isHeadlineTouched]);

  const handleTemplateChange = (templateKey: CVTemplateKey) => {
    setSelectedTemplateKey(normalizeCVTemplateKey(templateKey));
    setIsTemplateManuallyPicked(true);
  };

  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh hợp lệ.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setAvatarPreviewUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const selectedTemplateOption = getCVTemplateOptionByKey(selectedTemplateKey);

  const handleSelectSkill = (skillId: number) => {
    setSelectedSkills((prev) => [...prev, { skillId, level: DEFAULT_SKILL_LEVEL }]);
    setSkillSearch('');
    setHighlightedIdx(0);
  };
  const handleRemoveSkill = (skillId: number) => {
    setSelectedSkills((prev) => prev.filter((item) => item.skillId !== skillId));
  };
  const handleSkillLevelChange = (skillId: number, level: SkillLevel) => {
    setSelectedSkills((prev) =>
      prev.map((item) => (item.skillId === skillId ? { ...item, level } : item))
    );
  };
  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!skillDropdownOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIdx((i) => Math.min(i + 1, filteredSkillOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filteredSkillOptions[safeHighlightedIdx]) {
      e.preventDefault();
      handleSelectSkill(filteredSkillOptions[safeHighlightedIdx].skillId);
    } else if (e.key === 'Escape') {
      setSkillDropdownOpen(false);
      skillInputRef.current?.blur();
    }
  };

  const updateWE = (idx: number, field: keyof DraftWorkExp, value: string) => {
    setWorkExps((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };
  const updateEdu = (idx: number, field: keyof DraftEdu, value: string) => {
    setEducations((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };
  const updateProject = (idx: number, field: keyof DraftProject, value: string) => {
    setProjects((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };
  const updateCert = (idx: number, field: keyof DraftCert, value: string) => {
    setCertificates((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };
  const updateLanguage = (idx: number, field: keyof DraftLanguage, value: string) => {
    setLanguages((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const toDisplayDate = (dateValue: string) => {
    if (!dateValue) return '';
    const [year, month] = dateValue.split('-');
    if (!year || !month) return dateValue;
    return `${month}/${year}`;
  };

  const buildPreviewData = (): ExtractedCVData => {
    const preferredHeadline = cvHeadline.trim() || profile?.title?.trim() || '';
    const skillPreviewItems = selectedSkills.reduce<{ name: string; level: string }[]>((acc, item) => {
        const skillName = skillOptions.find((s) => s.skillId === item.skillId)?.skillName;
        if (skillName) {
          acc.push({ name: skillName, level: item.level });
        }
        return acc;
      }, []);

    return {
      avatarUrl: avatarPreviewUrl ?? undefined,
      fullName: profile?.fullName ?? '',
      email: profile?.email ?? '',
      phone: profile?.phone ?? '',
      address: profile?.address ?? '',
      title: preferredHeadline,
      headline: preferredHeadline || 'Curriculum Vitae',
      summary: summary.trim(),
      work_experiences: workExps
        .filter((we) => we.title.trim())
        .map((we) => ({
          company: '',
          position: we.title.trim(),
          start_date: toDisplayDate(we.startDate),
          end_date: toDisplayDate(we.endDate),
          description: we.description.trim(),
        })),
      educations: educations
        .filter((edu) => edu.title.trim())
        .map((edu) => ({
          school: edu.title.trim(),
          major: '',
          degree: edu.educationLevel,
          start_date: toDisplayDate(edu.startDate),
          end_date: toDisplayDate(edu.endDate),
        })),
      skills: skillPreviewItems,
      projects: projects
        .filter((proj) => proj.title.trim())
        .map((proj) => ({
          name: proj.title.trim(),
          description: proj.description.trim(),
          start_date: toDisplayDate(proj.startDate),
          end_date: toDisplayDate(proj.endDate),
          duration: [toDisplayDate(proj.startDate), toDisplayDate(proj.endDate)].filter(Boolean).join(' - '),
        })),
      languages: languages
        .filter((lang) => lang.name.trim())
        .map((lang) => ({
          name: lang.name.trim(),
          proficiency: lang.proficiency.trim(),
        })),
      certificates: certificates
        .filter((cert) => cert.title.trim())
        .map((cert) => ({
          name: cert.title.trim(),
          issuer: cert.description.trim(),
          issue_date: toDisplayDate(cert.issueDate),
        })),
    };
  };

  const saveCV = async (navigateAfterSave: boolean) => {
    if (!profile?.profileId) {
      toast.error('Không tìm thấy profile. Vui lòng thử lại.');
      return false;
    }
    if (!resumeName.trim()) {
      toast.error('Vui lòng nhập tên CV');
      return false;
    }
    setIsSaving(true);
    try {
      // 1. Tạo Resume → lấy resumeId
      const resume = await initResume(userId, resumeName.trim(), selectedTemplateKey);
      const resumeId = resume.resumeId;

      setStoredCVHeadline(resumeId, cvHeadline);

      // 2. Lưu summary vào resume
      if (summary.trim()) {
        const { updateResume } = await import('@/services/resume.service');
        await updateResume(String(resumeId), { summary: summary.trim() });
      }

      // 3. Work experiences
      for (let i = 0; i < workExps.length; i++) {
        const we = workExps[i];
        if (!we.title.trim()) continue;
        await profileCvService.createWorkExperience(resumeId, {
          title: we.title,
          level: we.level,
          startDate: we.startDate || new Date().toISOString().slice(0, 10),
          endDate: we.endDate || null,
          description: we.description || null,
          sortOrder: i,
        });
      }

      // 4. Educations
      for (let i = 0; i < educations.length; i++) {
        const edu = educations[i];
        if (!edu.title.trim()) continue;
        await profileCvService.createEducation(resumeId, {
          title: edu.title,
          educationLevel: edu.educationLevel,
          majorId: null,
          startDate: edu.startDate || new Date().toISOString().slice(0, 10),
          endDate: edu.endDate || null,
          description: edu.description || null,
          sortOrder: i,
        });
      }

      // 5. Projects
      for (let i = 0; i < projects.length; i++) {
        const proj = projects[i];
        if (!proj.title.trim()) continue;
        await profileCvService.createProject(resumeId, {
          title: proj.title,
          startDate: proj.startDate || new Date().toISOString().slice(0, 10),
          endDate: proj.endDate || null,
          description: proj.description || null,
          sortOrder: i,
        });
      }

      // 6. Certificates
      for (let i = 0; i < certificates.length; i++) {
        const cert = certificates[i];
        if (!cert.title.trim()) continue;
        await profileCvService.createCertificate(resumeId, {
          title: cert.title,
          issueDate: cert.issueDate || new Date().toISOString().slice(0, 10),
          description: cert.description || null,
          sortOrder: i,
        });
      }

      // 7. Skills
      for (const skill of selectedSkills) {
        await profileCvService.addResumeSkill(resumeId, {
          skillId: skill.skillId,
          level: skill.level,
        });
      }

      // 8. Languages (local-only by resumeId, not persisted to DB)
      setStoredCVLanguages(
        resumeId,
        languages
          .filter((lang) => lang.name.trim())
          .map((lang) => ({
            name: lang.name.trim(),
            proficiency: lang.proficiency.trim(),
          }))
      );

      // 9. Invalidate cache + redirect
      await queryClient.invalidateQueries({ queryKey: profileKeys.all });
      setHasSaved(true);
      toast.success('Tạo CV thành công!');
      if (navigateAfterSave) {
        navigate('/user/resumes');
      }
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra. Vui lòng thử lại.';
      toast.error(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    await saveCV(true);
  };

  const handleDownloadPdf = () => {
    if (hasSaved) {
      setPreviewOpen(true);
      return;
    }
    setDownloadFlowOpen(true);
  };

  const handleSaveThenDownload = async () => {
    const saved = await saveCV(false);
    if (!saved) return;
    setDownloadFlowOpen(false);
    setPreviewOpen(true);
  };

  if (isLoading || !profile) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Tên CV */}
      <Card>
        <CardContent className="pt-6 space-y-1.5">
          <Label>Tên CV</Label>
          <p className="text-sm text-gray-500">Đặt tên dễ nhận biết để quản lý nhiều phiên bản CV.</p>
          <Input
            value={resumeName}
            onChange={(e) => setResumeName(e.target.value)}
            placeholder="VD: CV Frontend 2025"
            className="font-medium"
          />
          <Label className="pt-3">Chức danh hiển thị trên CV</Label>
          <p className="text-sm text-gray-500">Bạn có thể nhập riêng cho CV này, không phụ thuộc chức danh trong hồ sơ tài khoản.</p>
          <Input
            value={cvHeadline}
            onChange={(e) => {
              setCvHeadline(e.target.value);
              setIsHeadlineTouched(true);
            }}
            placeholder="VD: Frontend Developer"
            className="font-medium"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary-dark uppercase text-sm font-bold">CV TEMPLATE</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-500">Nên chọn mẫu trước khi nhập nội dung để bố cục và phong cách nhất quán.</p>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs text-gray-500">Mẫu đang chọn</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{selectedTemplateOption.name}</p>
            <p className="text-sm text-gray-600 mt-1">{selectedTemplateOption.category}</p>
            <p className="text-sm text-gray-600">{selectedTemplateOption.description}</p>
            <p className="text-xs font-medium text-primary mt-2">
              Khi bấm Lưu CV, hệ thống sẽ lưu đúng template này vào hồ sơ CV.
            </p>
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={() => setTemplatePickerOpen(true)}>
              Chọn/Đổi mẫu CV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary-dark uppercase text-sm font-bold">PROFILE IMAGE</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center">
              {avatarPreviewUrl ? (
                <img src={avatarPreviewUrl} alt="Avatar preview" className="h-full w-full object-cover" />
              ) : (
                <UserCircle2 className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Ảnh này sẽ hiển thị trong phần hồ sơ bên trái của CV preview.</p>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFileChange}
              />
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => avatarInputRef.current?.click()}>
                  <Upload className="h-4 w-4" />
                  Tải ảnh lên
                </Button>
                {avatarPreviewUrl && (
                  <Button type="button" variant="ghost" onClick={() => setAvatarPreviewUrl(null)}>
                    Xóa ảnh
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary-dark uppercase text-sm font-bold">SUMMARY</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label>Tóm tắt CV</Label>
          <p className="text-sm text-gray-500">Viết 3-5 câu về kinh nghiệm nổi bật, thế mạnh và mục tiêu ứng tuyển của CV này.</p>
          <Textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Giới thiệu ngắn về bản thân, kinh nghiệm, mục tiêu trong CV này..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary-dark uppercase text-sm font-bold">SKILLS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-500">Tìm theo tên kỹ năng rồi chọn để thêm vào CV.</p>
          <p className="text-xs text-gray-500">Kỹ năng mới thêm sẽ mặc định ở mức BEGINNER, bạn có thể đổi level riêng cho từng kỹ năng bên dưới.</p>
          <div className="relative max-w-md">
            <Input
              ref={skillInputRef}
              value={skillSearch}
              onChange={(e) => { setSkillSearch(e.target.value); setSkillDropdownOpen(true); setHighlightedIdx(0); }}
              onFocus={() => setSkillDropdownOpen(true)}
              onBlur={() => setTimeout(() => setSkillDropdownOpen(false), 150)}
              onKeyDown={handleSkillKeyDown}
              placeholder="Tìm và thêm kỹ năng..."
            />
            {skillDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg max-h-48 overflow-y-auto">
                {filteredSkillOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">Không có kỹ năng phù hợp</div>
                ) : (
                  filteredSkillOptions.map((s, idx) => (
                    <div
                      key={s.skillId}
                      role="option"
                      aria-selected={idx === safeHighlightedIdx}
                      className={`cursor-pointer px-3 py-2 text-sm ${idx === safeHighlightedIdx ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'}`}
                      onMouseDown={(e) => { e.preventDefault(); handleSelectSkill(s.skillId); }}
                      onMouseEnter={() => setHighlightedIdx(idx)}
                    >
                      {s.skillName}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          {selectedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map((skill) => {
                const name = skillOptions.find((s) => s.skillId === skill.skillId)?.skillName ?? String(skill.skillId);
                return (
                  <span key={skill.skillId} className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm">
                    <span>{name}</span>
                    <select
                      value={skill.level}
                      onChange={(e) => handleSkillLevelChange(skill.skillId, e.target.value as SkillLevel)}
                      className="rounded border border-gray-300 bg-white px-2 py-0.5 text-xs"
                    >
                      {SKILL_LEVELS.map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => handleRemoveSkill(skill.skillId)} className="hover:text-red-600">×</button>
                  </span>
                );
              })}
            </div>
          )}
          {selectedSkills.length === 0 && (
            <p className="text-sm text-gray-500">Chưa có kỹ năng. Thêm kỹ năng trước, rồi chỉnh level riêng cho từng kỹ năng ở danh sách bên dưới.</p>
          )}
        </CardContent>
      </Card>

      {/* Work Experience */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-primary-dark uppercase text-sm font-bold">WORK EXPERIENCE</CardTitle>
          <Button size="sm" onClick={() => setWorkExps((p) => [...p, emptyWE()])}>
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">Ghi theo thứ tự mới nhất đến cũ hơn. Mỗi mục nên có vai trò và kết quả đạt được.</p>
          {workExps.length === 0 && <p className="text-sm text-gray-500">Chưa có kinh nghiệm. Bấm + để thêm.</p>}
          {workExps.map((we, idx) => (
            <div key={idx} className="rounded-lg border p-4 bg-gray-50/50 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <Input value={we.title} onChange={(e) => updateWE(idx, 'title', e.target.value)} placeholder="Tên công ty / vị trí" className="font-medium" />
                <Button variant="ghost" size="icon" onClick={() => setWorkExps((p) => p.filter((_, i) => i !== idx))}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <Input type="date" value={we.startDate} onChange={(e) => updateWE(idx, 'startDate', e.target.value)} className="w-auto" />
                <span>-</span>
                <Input type="date" value={we.endDate} onChange={(e) => updateWE(idx, 'endDate', e.target.value)} className="w-auto" />
                <select value={we.level} onChange={(e) => updateWE(idx, 'level', e.target.value)} className="border rounded px-2 py-1 text-sm">
                  {WORK_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <Textarea value={we.description} onChange={(e) => updateWE(idx, 'description', e.target.value)} placeholder="Mô tả công việc" rows={2} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-primary-dark uppercase text-sm font-bold">EDUCATION</CardTitle>
          <Button size="sm" onClick={() => setEducations((p) => [...p, emptyEdu()])}>
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">Thêm bậc học phù hợp với vị trí ứng tuyển, ưu tiên thông tin gần nhất.</p>
          {educations.length === 0 && <p className="text-sm text-gray-500">Chưa có học vấn. Bấm + để thêm.</p>}
          {educations.map((edu, idx) => (
            <div key={idx} className="rounded-lg border p-4 bg-gray-50/50 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <Input value={edu.title} onChange={(e) => updateEdu(idx, 'title', e.target.value)} placeholder="Tên trường" className="font-medium" />
                <Button variant="ghost" size="icon" onClick={() => setEducations((p) => p.filter((_, i) => i !== idx))}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <Input type="date" value={edu.startDate} onChange={(e) => updateEdu(idx, 'startDate', e.target.value)} className="w-auto" />
                <span>-</span>
                <Input type="date" value={edu.endDate} onChange={(e) => updateEdu(idx, 'endDate', e.target.value)} className="w-auto" />
                <select value={edu.educationLevel} onChange={(e) => updateEdu(idx, 'educationLevel', e.target.value)} className="border rounded px-2 py-1 text-sm">
                  {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <Textarea value={edu.description} onChange={(e) => updateEdu(idx, 'description', e.target.value)} placeholder="Mô tả" rows={2} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-primary-dark uppercase text-sm font-bold">PROJECTS</CardTitle>
          <Button size="sm" onClick={() => setProjects((p) => [...p, emptyProject()])}>
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">Chọn các dự án liên quan vị trí mục tiêu và mô tả ngắn vai trò của bạn.</p>
          {projects.length === 0 && <p className="text-sm text-gray-500">Chưa có dự án. Bấm + để thêm.</p>}
          {projects.map((proj, idx) => (
            <div key={idx} className="rounded-lg border p-4 bg-gray-50/50 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <Input value={proj.title} onChange={(e) => updateProject(idx, 'title', e.target.value)} placeholder="Tên dự án" className="font-medium" />
                <Button variant="ghost" size="icon" onClick={() => setProjects((p) => p.filter((_, i) => i !== idx))}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <div className="flex gap-2 items-center">
                <Input type="date" value={proj.startDate} onChange={(e) => updateProject(idx, 'startDate', e.target.value)} className="w-auto" />
                <span>-</span>
                <Input type="date" value={proj.endDate} onChange={(e) => updateProject(idx, 'endDate', e.target.value)} className="w-auto" />
              </div>
              <Textarea value={proj.description} onChange={(e) => updateProject(idx, 'description', e.target.value)} placeholder="Mô tả dự án" rows={2} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-primary-dark uppercase text-sm font-bold">CERTIFICATES</CardTitle>
          <Button size="sm" onClick={() => setCertificates((p) => [...p, emptyCert()])}>
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">Thêm chứng chỉ có giá trị cho vị trí ứng tuyển, kèm ngày cấp nếu có.</p>
          {certificates.length === 0 && <p className="text-sm text-gray-500">Chưa có chứng chỉ. Bấm + để thêm.</p>}
          {certificates.map((cert, idx) => (
            <div key={idx} className="rounded-lg border p-4 bg-gray-50/50 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <Input value={cert.title} onChange={(e) => updateCert(idx, 'title', e.target.value)} placeholder="Tên chứng chỉ" className="font-medium" />
                <Button variant="ghost" size="icon" onClick={() => setCertificates((p) => p.filter((_, i) => i !== idx))}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <Input type="date" value={cert.issueDate} onChange={(e) => updateCert(idx, 'issueDate', e.target.value)} className="w-auto" />
              <Textarea value={cert.description} onChange={(e) => updateCert(idx, 'description', e.target.value)} placeholder="Mô tả" rows={2} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-primary-dark uppercase text-sm font-bold">NGÔN NGỮ</CardTitle>
          <Button size="sm" onClick={() => setLanguages((p) => [...p, emptyLanguage()])}>
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {languages.length === 0 && <p className="text-sm text-gray-500">Chưa có ngôn ngữ. Bấm + để thêm.</p>}
          {languages.map((lang, idx) => (
            <div key={idx} className="rounded-lg border p-4 bg-gray-50/50 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <Input value={lang.name} onChange={(e) => updateLanguage(idx, 'name', e.target.value)} placeholder="Ngôn ngữ (VD: English)" className="font-medium" />
                <Button variant="ghost" size="icon" onClick={() => setLanguages((p) => p.filter((_, i) => i !== idx))}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <Input value={lang.proficiency} onChange={(e) => updateLanguage(idx, 'proficiency', e.target.value)} placeholder="Trình độ (VD: IELTS 6.5 / Intermediate)" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="space-y-2 pt-2 pb-8">
        <p className="text-sm text-gray-500">Lưu CV để cập nhật hồ sơ của bạn. Tải PDF để xuất bản CV hiện tại ra file.</p>
        <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate('/user/resumes')} disabled={isSaving}>
          Hủy
        </Button>
        <Button variant="outline" onClick={handleDownloadPdf} disabled={isSaving}>
          Tải PDF
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <span className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              Đang lưu...
            </span>
          ) : 'Lưu CV'}
        </Button>
        </div>
      </div>

      <Dialog open={downloadFlowOpen} onOpenChange={setDownloadFlowOpen}>
        <DialogContent className="max-w-md p-6" onClose={() => setDownloadFlowOpen(false)}>
          <h3 className="text-lg font-semibold text-gray-900">Tải CV dưới dạng PDF</h3>
          <p className="mt-2 text-sm text-gray-600">
            CV này chưa được lưu vào hệ thống. Bạn muốn lưu trước khi tải hay tải ngay mà không lưu?
          </p>
          <div className="mt-5 flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setDownloadFlowOpen(false); setPreviewOpen(true); }} disabled={isSaving}>
              Tải ngay không lưu
            </Button>
            <Button onClick={handleSaveThenDownload} disabled={isSaving}>
              {isSaving ? 'Đang lưu...' : 'Lưu rồi tải'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={templatePickerOpen} onOpenChange={setTemplatePickerOpen}>
        <DialogContent className="max-w-[96vw] p-4 lg:max-w-[1320px] lg:p-6" onClose={() => setTemplatePickerOpen(false)}>
          <CVTemplatePicker
            selectedTemplateKey={selectedTemplateKey}
            recommendedTemplateKey={recommendedTemplateKey}
            onChange={handleTemplateChange}
            onTemplateApplied={() => setTemplatePickerOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[95vw] p-4" onClose={() => setPreviewOpen(false)}>
          <CVPreview data={buildPreviewData()} templateKey={selectedTemplateKey} language="vi" onDataChange={() => {}} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
