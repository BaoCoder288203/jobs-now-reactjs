import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TiptapEditor } from '@/components/ui/TiptapEditor';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  useProfileWithCV,
  useWorkExperiences,
  useCreateWorkExperience,
  useUpdateWorkExperience,
  useDeleteWorkExperience,
  useEducations,
  useCreateEducation,
  useUpdateEducation,
  useDeleteEducation,
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useCertificates,
  useCreateCertificate,
  useUpdateCertificate,
  useDeleteCertificate,
  useResumeSkills,
  useAddResumeSkill,
  useRemoveResumeSkill,
} from '@/modules/profile/profile-cv.hooks';
import { useUpdateResume, useResumes } from '@/modules/resumes/hooks';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { profileKeys } from '@/modules/profile/hooks';
import { toast } from 'sonner';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type {
  WorkExperienceDTO,
  EducationDTO,
  ProjectDTO,
  CertificateDTO,
} from '@/types';
import type * as profileCvService from '@/services/profile-cv.service';

type WorkExpUpdateBody = Parameters<typeof profileCvService.updateWorkExperience>[2];
type EduUpdateBody = Parameters<typeof profileCvService.updateEducation>[2];
type ProjectUpdateBody = Parameters<typeof profileCvService.updateProject>[2];
type CertUpdateBody = Parameters<typeof profileCvService.updateCertificate>[2];

const WORK_LEVELS = ['INTERN', 'FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD', 'OTHER'] as const;
const EDUCATION_LEVELS = ['HIGH_SCHOOL', 'VOCATIONAL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'DOCTORATE', 'OTHER'] as const;

function formatDate(d: string | null | undefined): string {
  if (!d) return '';
  return d.slice(0, 10);
}


export interface CVContentFormProps {
  userId: string;
  header?: React.ReactNode;
  /** Title resume (resume_name) - có thể chỉnh sửa khi có resumeId */
  resumeTitle?: string;
  /** Khi có resumeId thì đổi title sẽ gọi API cập nhật resume_name */
  resumeId?: string;
}

const parseResumeId = (resumeId: string | undefined): number | null => {
  if (resumeId == null || resumeId === '') return null;
  const n = Number(resumeId);
  return Number.isNaN(n) ? null : n;
};

export function CVContentForm({ userId, header, resumeTitle = '', resumeId }: CVContentFormProps) {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useProfileWithCV(userId);
  const numericResumeId = parseResumeId(resumeId);

  const [titleInput, setTitleInput] = useState(resumeTitle ?? '');
  useEffect(() => {
    setTitleInput(resumeTitle ?? '');
  }, [resumeTitle]);


  const { data: resumeSkills = [] } = useResumeSkills(numericResumeId);
  const addSkill = useAddResumeSkill(numericResumeId ?? 0);
  const removeSkill = useRemoveResumeSkill(numericResumeId ?? 0);

  const skillsList = useQuery({
    queryKey: ['skill', 'all'],
    queryFn: async () => {
      const res = await apiClient.get('/skill/all');
      const raw = res as unknown;
      return (raw as { data?: { skillId: number; skillName: string }[] })?.data ?? (raw as { skillId: number; skillName: string }[]) ?? [];
    },
  });

  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);
  const [highlightedSkillIndex, setHighlightedSkillIndex] = useState(0);
  const skillInputRef = useRef<HTMLInputElement>(null);

  const updateResume = useUpdateResume();
  const { data: resumeList = [] } = useResumes(userId);
  const currentResume = resumeList.find((r) => String(r.resumeId) === resumeId);
  const [summaryDraft, setSummaryDraft] = useState('');
  const summaryValue = summaryDraft !== '' ? summaryDraft : (currentResume?.summary ?? '');

  const { data: workExperiences = [] } = useWorkExperiences(numericResumeId);
  const createWE = useCreateWorkExperience(numericResumeId ?? 0);
  const updateWE = useUpdateWorkExperience(numericResumeId ?? 0);
  const deleteWE = useDeleteWorkExperience(numericResumeId ?? 0);

  const { data: educations = [] } = useEducations(numericResumeId);
  const createEdu = useCreateEducation(numericResumeId ?? 0);
  const updateEdu = useUpdateEducation(numericResumeId ?? 0);
  const deleteEdu = useDeleteEducation(numericResumeId ?? 0);

  const { data: projects = [] } = useProjects(numericResumeId);
  const createProj = useCreateProject(numericResumeId ?? 0);
  const updateProj = useUpdateProject(numericResumeId ?? 0);
  const deleteProj = useDeleteProject(numericResumeId ?? 0);

  const { data: certificates = [] } = useCertificates(numericResumeId);
  const createCert = useCreateCertificate(numericResumeId ?? 0);
  const updateCert = useUpdateCertificate(numericResumeId ?? 0);
  const deleteCert = useDeleteCertificate(numericResumeId ?? 0);

  const handleSave = async () => {
    try {
      if (!resumeId) return;
      const newTitle = titleInput?.trim() || 'CV của tôi';
      const patch: { resumeName?: string; summary?: string | null } = {};
      if (newTitle !== resumeTitle) patch.resumeName = newTitle;
      if (summaryDraft !== '') patch.summary = summaryValue;
      if (Object.keys(patch).length > 0) {
        await updateResume.mutateAsync({ resumeId, data: patch });
        if (summaryDraft !== '') setSummaryDraft('');
      }
      await queryClient.invalidateQueries({ queryKey: profileKeys.all });
      toast.success('Đã lưu thay đổi');
    } catch {
      toast.error('Lưu thất bại. Vui lòng thử lại.');
    }
  };

  const isSaving = updateResume.isPending;

  if (isLoading || !profile) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const skillOptions = Array.isArray(skillsList.data) ? skillsList.data : [];
  const skillOptionsNormalized = skillOptions.map((s: { skillId?: number; skillName?: string; name?: string }) => ({
    skillId: s.skillId ?? 0,
    skillName: (s.skillName ?? s.name ?? '').trim(),
  })).filter((s) => s.skillId && s.skillName);
  const addedSkillIds = resumeSkills.map((s) => s.skillId);
  const filteredSkillOptions = skillOptionsNormalized.filter(
    (s) =>
      !addedSkillIds.includes(s.skillId) &&
      s.skillName.toLowerCase().includes(skillSearchQuery.trim().toLowerCase())
  );
  const safeHighlightedIndex = Math.min(
    highlightedSkillIndex,
    Math.max(0, filteredSkillOptions.length - 1)
  );
  const handleSkillInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!skillDropdownOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedSkillIndex((i) => Math.min(i + 1, filteredSkillOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedSkillIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filteredSkillOptions[safeHighlightedIndex]) {
      e.preventDefault();
      addSkill.mutate({ skillId: filteredSkillOptions[safeHighlightedIndex].skillId, level: null });
      setSkillSearchQuery('');
      setHighlightedSkillIndex(0);
    } else if (e.key === 'Escape') {
      setSkillDropdownOpen(false);
      skillInputRef.current?.blur();
    }
  };

  return (
    <div className="space-y-8">
      {header}

      <div className="flex gap-8 items-start">
        {/* Cột trái ~20%: avatar + % hoàn thành + title resume
        <div className="w-[20%] min-w-[180px] shrink-0 space-y-4">
          <AvatarProgressCard
            avatarUrl={profile?.avatarUrl ?? null}
            fullName={profile?.fullName ?? ''}
            progressPercent={progressPercent}
          />
        </div> */}

        {/* Cột phải ~80%: form */}
        <div className="flex-1 min-w-0 space-y-6">
          <div className="space-y-1.5">
            <Label className="text-gray-700">Tên CV</Label>
            <Input
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="VD: CV Frontend 2024"
              className="font-medium break-words"
            />
          </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-primary-dark uppercase text-sm font-bold">SUMMARY</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label>Tóm tắt CV</Label>
          <TiptapEditor
            value={summaryValue}
            onChange={setSummaryDraft}
            placeholder="Giới thiệu ngắn về bản thân, kinh nghiệm, mục tiêu trong CV này..."
            minHeight="120px"
            className="min-h-[120px]"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary-dark uppercase text-sm font-bold">SKILLS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative max-w-md">
            <Input
              ref={skillInputRef}
              value={skillSearchQuery}
              onChange={(e) => {
                setSkillSearchQuery(e.target.value);
                setSkillDropdownOpen(true);
                setHighlightedSkillIndex(0);
              }}
              onFocus={() => setSkillDropdownOpen(true)}
              onBlur={() => setTimeout(() => setSkillDropdownOpen(false), 150)}
              onKeyDown={handleSkillInputKeyDown}
              placeholder="Tìm và thêm kỹ năng..."
              disabled={!numericResumeId || addSkill.isPending}
            />
            {skillDropdownOpen && numericResumeId && (
              <div
                className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg max-h-48 overflow-y-auto"
                role="listbox"
              >
                {filteredSkillOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">Không có kỹ năng phù hợp</div>
                ) : (
                  filteredSkillOptions.map((s, idx) => (
                    <div
                      key={s.skillId}
                      role="option"
                      aria-selected={idx === safeHighlightedIndex}
                      className={`cursor-pointer px-3 py-2 text-sm ${idx === safeHighlightedIndex ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        addSkill.mutate({ skillId: s.skillId, level: null });
                        setSkillSearchQuery('');
                        setHighlightedSkillIndex(0);
                      }}
                      onMouseEnter={() => setHighlightedSkillIndex(idx)}
                    >
                      {s.skillName}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          {resumeSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {resumeSkills.map((s) => (
                <span
                  key={s.skillId}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm"
                >
                  {s.skillName}
                  <button
                    type="button"
                    onClick={() => removeSkill.mutate(s.skillId)}
                    className="hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Chưa thêm kỹ năng. Tìm kiếm ở trên để thêm.</p>
          )}
        </CardContent>
      </Card>

      {!numericResumeId && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-amber-800">
              Để thêm <strong>Kinh nghiệm làm việc</strong>, <strong>Học vấn</strong>, <strong>Dự án</strong>, <strong>Chứng chỉ</strong> — hãy chọn một CV từ trang{' '}
              <Link to="/user/resumes" className="font-medium text-amber-700 underline hover:no-underline">
                Quản lý CV
              </Link>
              {' '}và mở &quot;Chỉnh sửa nội dung&quot;.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-primary-dark uppercase text-sm font-bold">WORK EXPERIENCE</CardTitle>
          <Button
            size="sm"
            onClick={() =>
              createWE.mutate({
                title: 'Công ty mới',
                level: 'FRESHER',
                startDate: new Date().toISOString().slice(0, 10),
                endDate: null,
                description: '',
                sortOrder: workExperiences.length,
              })
            }
            disabled={!numericResumeId || createWE.isPending}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {workExperiences.length === 0 && (
            <p className="text-gray-500 text-sm">Chưa có kinh nghiệm. Bấm + để thêm.</p>
          )}
          {workExperiences.map((we: WorkExperienceDTO) => (
            <WorkExperienceItem
              key={we.id}
              item={we}
              onUpdate={(body) => updateWE.mutate({ id: we.id, body })}
              onDelete={() => deleteWE.mutate(we.id)}
              isPending={updateWE.isPending || deleteWE.isPending}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-primary-dark uppercase text-sm font-bold">EDUCATION</CardTitle>
          <Button
            size="sm"
            onClick={() =>
              createEdu.mutate({
                title: 'Tên trường',
                educationLevel: 'BACHELOR',
                majorId: null,
                startDate: new Date().toISOString().slice(0, 10),
                endDate: null,
                description: '',
                sortOrder: educations.length,
              })
            }
            disabled={!numericResumeId || createEdu.isPending}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {educations.length === 0 && <p className="text-gray-500 text-sm">Chưa có học vấn. Bấm + để thêm.</p>}
          {educations.map((edu: EducationDTO) => (
            <EducationItem
              key={edu.id}
              item={edu}
              onUpdate={(body) => updateEdu.mutate({ id: edu.id, body })}
              onDelete={() => deleteEdu.mutate(edu.id)}
              isPending={updateEdu.isPending || deleteEdu.isPending}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-primary-dark uppercase text-sm font-bold">PROJECTS</CardTitle>
          <Button
            size="sm"
            onClick={() =>
              createProj.mutate({
                title: 'Tên dự án',
                startDate: new Date().toISOString().slice(0, 10),
                endDate: null,
                description: '',
                sortOrder: projects.length,
              })
            }
            disabled={!numericResumeId || createProj.isPending}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {projects.length === 0 && <p className="text-gray-500 text-sm">Chưa có dự án. Bấm + để thêm.</p>}
          {projects.map((p: ProjectDTO) => (
            <ProjectItem
              key={p.id}
              item={p}
              onUpdate={(body) => updateProj.mutate({ id: p.id, body })}
              onDelete={() => deleteProj.mutate(p.id)}
              isPending={updateProj.isPending || deleteProj.isPending}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-primary-dark uppercase text-sm font-bold">CERTIFICATE</CardTitle>
          <Button
            size="sm"
            onClick={() =>
              createCert.mutate({
                title: 'Tên chứng chỉ',
                issueDate: new Date().toISOString().slice(0, 10),
                description: '',
                sortOrder: certificates.length,
              })
            }
            disabled={!numericResumeId || createCert.isPending}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {certificates.length === 0 && <p className="text-gray-500 text-sm">Chưa có chứng chỉ. Bấm + để thêm.</p>}
          {certificates.map((c: CertificateDTO) => (
            <CertificateItem
              key={c.id}
              item={c}
              onUpdate={(body) => updateCert.mutate({ id: c.id, body })}
              onDelete={() => deleteCert.mutate(c.id)}
              isPending={updateCert.isPending || deleteCert.isPending}
            />
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </div>
        </div>
      </div>
    </div>
  );
}

function WorkExperienceItem({
  item,
  onUpdate,
  onDelete,
  isPending,
}: {
  item: WorkExperienceDTO;
  onUpdate: (body: WorkExpUpdateBody) => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState(item.title);
  const [level, setLevel] = useState(item.level);
  const [startDate, setStartDate] = useState(formatDate(item.startDate));
  const [endDate, setEndDate] = useState(formatDate(item.endDate));
  const [description, setDescription] = useState(item.description ?? '');
  const save = () => onUpdate({ title, level, startDate: startDate || '', endDate: endDate || null, description: description || null });
  return (
    <div className="flex gap-2 rounded-lg border p-4 bg-gray-50/50">
      <GripVertical className="h-5 w-5 text-gray-400 shrink-0 mt-1" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={save} className="font-medium" />
          <Button variant="ghost" size="icon" onClick={onDelete} disabled={isPending}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} onBlur={save} className="w-auto" />
          <span>-</span>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} onBlur={save} className="w-auto" />
          <select value={level} onChange={(e) => setLevel(e.target.value)} onBlur={save} className="border rounded px-2 py-1 text-sm">
            {WORK_LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <Textarea value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} onBlur={save} placeholder="Mô tả" rows={2} />
      </div>
    </div>
  );
}

function EducationItem({
  item,
  onUpdate,
  onDelete,
  isPending,
}: {
  item: EducationDTO;
  onUpdate: (body: EduUpdateBody) => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState(item.title);
  const [educationLevel, setEducationLevel] = useState(item.educationLevel);
  const [startDate, setStartDate] = useState(formatDate(item.startDate));
  const [endDate, setEndDate] = useState(formatDate(item.endDate));
  const [description, setDescription] = useState(item.description ?? '');
  const save = () =>
    onUpdate({ title, educationLevel, majorId: item.majorId, startDate: startDate || '', endDate: endDate || null, description: description || null });
  return (
    <div className="flex gap-2 rounded-lg border p-4 bg-gray-50/50">
      <GripVertical className="h-5 w-5 text-gray-400 shrink-0 mt-1" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={save} className="font-medium" placeholder="Tên trường" />
          <Button variant="ghost" size="icon" onClick={onDelete} disabled={isPending}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
        <p className="text-sm text-gray-600">Tốt nghiệp {educationLevel} {item.majorName ? `chuyên ngành ${item.majorName}` : ''}</p>
        <div className="flex flex-wrap gap-2 items-center">
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} onBlur={save} className="w-auto" />
          <span>-</span>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} onBlur={save} className="w-auto" placeholder="Present" />
          <select value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} onBlur={save} className="border rounded px-2 py-1 text-sm">
            {EDUCATION_LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <Textarea value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} onBlur={save} placeholder="Mô tả" rows={2} />
      </div>
    </div>
  );
}

function ProjectItem({
  item,
  onUpdate,
  onDelete,
  isPending,
}: {
  item: ProjectDTO;
  onUpdate: (body: ProjectUpdateBody) => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState(item.title);
  const [startDate, setStartDate] = useState(formatDate(item.startDate));
  const [endDate, setEndDate] = useState(formatDate(item.endDate));
  const [description, setDescription] = useState(item.description ?? '');
  const save = () => onUpdate({ title, startDate: startDate || '', endDate: endDate || null, description: description || null });
  return (
    <div className="flex gap-2 rounded-lg border p-4 bg-gray-50/50">
      <GripVertical className="h-5 w-5 text-gray-400 shrink-0 mt-1" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={save} className="font-medium" />
          <Button variant="ghost" size="icon" onClick={onDelete} disabled={isPending}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
        <div className="flex gap-2 items-center">
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} onBlur={save} className="w-auto" />
          <span>-</span>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} onBlur={save} className="w-auto" />
        </div>
        <Textarea value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} onBlur={save} placeholder="Mô tả" rows={2} />
      </div>
    </div>
  );
}

function CertificateItem({
  item,
  onUpdate,
  onDelete,
  isPending,
}: {
  item: CertificateDTO;
  onUpdate: (body: CertUpdateBody) => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState(item.title);
  const [issueDate, setIssueDate] = useState(formatDate(item.issueDate));
  const [description, setDescription] = useState(item.description ?? '');
  const save = () => onUpdate({ title, issueDate: issueDate || '', description: description || null });
  return (
    <div className="flex gap-2 rounded-lg border p-4 bg-gray-50/50">
      <GripVertical className="h-5 w-5 text-gray-400 shrink-0 mt-1" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={save} className="font-medium" />
          <Button variant="ghost" size="icon" onClick={onDelete} disabled={isPending}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
        <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} onBlur={save} className="w-auto text-primary-dark" />
        <Textarea value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} onBlur={save} placeholder="Mô tả" rows={2} />
      </div>
    </div>
  );
}
