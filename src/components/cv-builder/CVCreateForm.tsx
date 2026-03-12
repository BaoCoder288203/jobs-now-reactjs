import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useProfileWithCV } from '@/modules/profile/profile-cv.hooks';
import { profileKeys } from '@/modules/profile/hooks';
import * as profileCvService from '@/services/profile-cv.service';
import { initResume } from '@/services/resume.service';
import { apiClient } from '@/services/api';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

const WORK_LEVELS = ['INTERN', 'FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD', 'OTHER'] as const;
const EDUCATION_LEVELS = ['HIGH_SCHOOL', 'VOCATIONAL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'DOCTORATE', 'OTHER'] as const;

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

interface CVCreateFormProps {
  userId: string;
}

export function CVCreateForm({ userId }: CVCreateFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useProfileWithCV(userId);

  const [resumeName, setResumeName] = useState('CV của tôi');
  const [summary, setSummary] = useState('');
  const [workExps, setWorkExps] = useState<DraftWorkExp[]>([]);
  const [educations, setEducations] = useState<DraftEdu[]>([]);
  const [projects, setProjects] = useState<DraftProject[]>([]);
  const [certificates, setCertificates] = useState<DraftCert[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);

  const [isSaving, setIsSaving] = useState(false);

  // Skill search state
  const [skillSearch, setSkillSearch] = useState('');
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const skillInputRef = useRef<HTMLInputElement>(null);

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
      !selectedSkillIds.includes(s.skillId) &&
      s.skillName.toLowerCase().includes(skillSearch.trim().toLowerCase())
  );
  const safeHighlightedIdx = Math.min(highlightedIdx, Math.max(0, filteredSkillOptions.length - 1));

  const handleSelectSkill = (skillId: number) => {
    setSelectedSkillIds((prev) => [...prev, skillId]);
    setSkillSearch('');
    setHighlightedIdx(0);
  };
  const handleRemoveSkill = (skillId: number) => {
    setSelectedSkillIds((prev) => prev.filter((id) => id !== skillId));
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

  const handleSave = async () => {
    if (!profile?.profileId) {
      toast.error('Không tìm thấy profile. Vui lòng thử lại.');
      return;
    }
    if (!resumeName.trim()) {
      toast.error('Vui lòng nhập tên CV');
      return;
    }
    setIsSaving(true);
    try {
      // 1. Tạo Resume → lấy resumeId
      const resume = await initResume(userId, resumeName.trim());
      const resumeId = resume.resumeId;

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
      for (const skillId of selectedSkillIds) {
        await profileCvService.addResumeSkill(resumeId, { skillId, level: null });
      }

      // 8. Invalidate cache + redirect
      await queryClient.invalidateQueries({ queryKey: profileKeys.all });
      toast.success('Tạo CV thành công!');
      navigate('/user/resumes');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra. Vui lòng thử lại.';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
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
          <Input
            value={resumeName}
            onChange={(e) => setResumeName(e.target.value)}
            placeholder="VD: CV Frontend 2025"
            className="font-medium"
          />
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary-dark uppercase text-sm font-bold">SUMMARY</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label>Tóm tắt CV</Label>
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
          {selectedSkillIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedSkillIds.map((id) => {
                const name = skillOptions.find((s) => s.skillId === id)?.skillName ?? String(id);
                return (
                  <span key={id} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm">
                    {name}
                    <button type="button" onClick={() => handleRemoveSkill(id)} className="hover:text-red-600">×</button>
                  </span>
                );
              })}
            </div>
          )}
          {selectedSkillIds.length === 0 && (
            <p className="text-sm text-gray-500">Chưa có kỹ năng. Tìm kiếm ở trên để thêm.</p>
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

      {/* Certificates */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-primary-dark uppercase text-sm font-bold">CERTIFICATES</CardTitle>
          <Button size="sm" onClick={() => setCertificates((p) => [...p, emptyCert()])}>
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
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

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-2 pb-8">
        <Button variant="outline" onClick={() => navigate('/user/resumes')} disabled={isSaving}>
          Hủy
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
  );
}
