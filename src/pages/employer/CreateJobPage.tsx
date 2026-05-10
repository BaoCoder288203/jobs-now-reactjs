import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RecruiterSidebar } from '@/components/layout/RecruiterSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { TiptapEditor } from '@/components/ui/TiptapEditor';
import { htmlToPlainText, escapeHtml, plainTextToTipTapHtml } from '@/lib/htmlUtils';
import { useJobDetail, useCreateJob, useUpdateJob } from '@/modules/jobs/hooks';
import { useMyCompany } from '@/modules/companies/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeft, AlertCircle, ChevronDown, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getJobCategories } from '@/services/category.service';
import type { JobCategoryDTO } from '@/services/category.service';
import { getAllSkills } from '@/services/skill.service';
import { getMajors } from '@/services/major.service';
import type { MajorDTO } from '@/services/major.service';
import type { Job, Skill } from '@/types';
import { ImageUploadSingle } from '@/components/ui/image-upload';
import { getEducationLevelLabel, buildEducationMajorLine } from '@/constants/jobEnums';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const EDUCATION_LEVELS = ['ANY', 'HIGH_SCHOOL', 'VOCATIONAL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'DOCTORATE', 'OTHER'] as const;

function sanitizeJobThumbnailUrl(url: string | undefined | null): string {
  const u = (url ?? '').trim();
  if (!u) return '';
  if (u.startsWith('data:')) return '';
  return u;
}
const JOB_TYPES = ['full_time', 'part_time', 'contract', 'internship', 'freelance'] as const;
const YEARS_OPTIONS = ['0', '1', '2', '3', '1-3', '3-5', '5+'] as const;
const APP_LANGS = ['VIETNAMESE', 'ENGLISH', 'JAPANESE', 'KOREAN', 'CHINESE', 'ANY'] as const;
const GENDERS = ['MALE', 'FEMALE', 'ANY'] as const;

const SALARY_TYPES = ['RANGE', 'NEGOTIABLE', 'COMPETITIVE'] as const;
const SALARY_CURRENCIES = ['VND', 'USD', 'EUR', 'JPY', 'SGD', 'KRW', 'OTHER'] as const;

const SALARY_TYPE_LABELS: Record<string, string> = {
  RANGE: 'Khoảng lương cụ thể',
  NEGOTIABLE: 'Thỏa thuận',
  COMPETITIVE: 'Cạnh tranh',
};

const SALARY_CURRENCY_LABELS: Record<string, string> = {
  VND: 'VNĐ',
  USD: 'USD',
  EUR: 'EUR',
  JPY: 'JPY',
  SGD: 'SGD',
  KRW: 'KRW',
  OTHER: 'Khác',
};

const EDU_MAJOR_TEMPLATE_RE = /^- Tốt nghiệp .+ trở lên chuyên ngành .+\.\s*$/;

function RequiredStar() {
  return <span className="text-red-500" aria-hidden>*</span>;
}

const jobSchema = z
  .object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z
    .string()
    .refine((s) => htmlToPlainText(s).length >= 50, 'Description must be at least 50 characters'),
  requirements: z
    .string()
    .refine((s) => htmlToPlainText(s).trim().length >= 1, 'Requirements are required'),
  benefits: z
    .string()
    .refine((s) => htmlToPlainText(s).trim().length >= 1, 'Benefits are required'),
  salary_type: z.enum(SALARY_TYPES).default('RANGE'),
  salary_currency: z.enum(SALARY_CURRENCIES).default('VND'),
  salary_min: z.number().min(0).or(z.nan()).optional(),
  salary_max: z.number().min(0).or(z.nan()).optional(),
  location: z.string().min(1, 'Location is required'),
  job_type: z.enum(JOB_TYPES),
  yearsOfExperience: z.string().min(1, 'Years of experience is required'),
  educationLevel: z.enum(EDUCATION_LEVELS),
  deadline: z.string().min(1, 'Deadline is required'),
  category_id: z.number().optional().nullable(),
  jobSkills: z.array(z.object({
    skillId: z.number(),
    isRequired: z.boolean().optional(),
    level: z.string().optional(),
  })).optional(),
  majorIds: z.array(z.number()).optional(),
  status: z.enum(['open', 'closed']),
  thumbnail_url: z.string().optional(),
  applicationLanguage: z.enum(APP_LANGS).optional(),
  genderRequirement: z.enum(GENDERS).optional(),
  minAge: z.string().optional(),
  maxAge: z.string().optional(),
})
  .superRefine((data, ctx) => {
    if (data.salary_type === 'RANGE') {
      const sMin = data.salary_min;
      const sMax = data.salary_max;
      if (typeof sMin === 'number' && !Number.isNaN(sMin) && typeof sMax === 'number' && !Number.isNaN(sMax) && sMin > sMax) {
        ctx.addIssue({ code: 'custom', path: ['salary_max'], message: 'Lương tối đa phải ≥ lương tối thiểu' });
      }
    }
    const min = data.minAge?.trim() ? parseInt(data.minAge, 10) : undefined;
    const max = data.maxAge?.trim() ? parseInt(data.maxAge, 10) : undefined;
    if (min != null && (Number.isNaN(min) || min < 16 || min > 99)) {
      ctx.addIssue({ code: 'custom', path: ['minAge'], message: 'Tuổi từ 16–99' });
    }
    if (max != null && (Number.isNaN(max) || max < 16 || max > 99)) {
      ctx.addIssue({ code: 'custom', path: ['maxAge'], message: 'Tuổi từ 16–99' });
    }
    if (min != null && max != null && !Number.isNaN(min) && !Number.isNaN(max) && min > max) {
      ctx.addIssue({ code: 'custom', path: ['maxAge'], message: 'Tuổi tối đa phải ≥ tuổi tối thiểu' });
    }
    const thumb = data.thumbnail_url?.trim();
    if (thumb?.startsWith('data:')) {
      ctx.addIssue({
        code: 'custom',
        path: ['thumbnail_url'],
        message: 'Ảnh thumbnail phải là URL từ server (tải ảnh lên lại, không dùng base64).',
      });
    }
    const js = data.jobSkills ?? [];
    const seenSkill = new Set<number>();
    js.forEach((row, i) => {
      if (!row.skillId || row.skillId <= 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['jobSkills', i, 'skillId'],
          message: 'Chọn kỹ năng',
        });
      } else if (seenSkill.has(row.skillId)) {
        ctx.addIssue({
          code: 'custom',
          path: ['jobSkills', i, 'skillId'],
          message: 'Kỹ năng bị trùng',
        });
      } else {
        seenSkill.add(row.skillId);
      }
    });
  });

type JobFormData = z.input<typeof jobSchema>;

function defaultDeadline() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

export function CreateJobPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: company } = useMyCompany();
  const isEditMode = !!id;

  const { data: job, isLoading: jobLoading } = useJobDetail(id || '', { enabled: isEditMode });
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const [categories, setCategories] = useState<JobCategoryDTO[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [majorsOptions, setMajorsOptions] = useState<MajorDTO[]>([]);
  const [majorSearch, setMajorSearch] = useState('');
  const [majorDropdownOpen, setMajorDropdownOpen] = useState(false);
  const majorDropdownRef = useRef<HTMLDivElement>(null);
  
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const [skillPickerOpenIndex, setSkillPickerOpenIndex] = useState<number | null>(null);
  const [skillPickerSearch, setSkillPickerSearch] = useState('');
  const skillPickerContainerRef = useRef<HTMLDivElement>(null);
  const legacyDataThumbnailToastShown = useRef<string | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const t = e.target as Node;
      if (majorDropdownRef.current && !majorDropdownRef.current.contains(t)) {
        setMajorDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(t)) {
        setCategoryDropdownOpen(false);
      }
      if (skillPickerContainerRef.current && !skillPickerContainerRef.current.contains(t)) {
        setSkillPickerOpenIndex(null);
        setSkillPickerSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
    getValues,
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      requirements: '',
      benefits: '',
      salary_type: 'RANGE',
      salary_currency: 'VND',
      location: '',
      job_type: 'full_time',
      status: 'closed',
      educationLevel: 'BACHELOR',
      yearsOfExperience: '0',
      deadline: defaultDeadline(),
      jobSkills: [],
      majorIds: [],
      thumbnail_url: '',
      applicationLanguage: 'ANY',
      genderRequirement: 'ANY',
      minAge: '',
      maxAge: '',
    },
  });

  useEffect(() => {
    getJobCategories().then(setCategories).catch(() => setCategories([]));
    getAllSkills().then(setSkills).catch(() => setSkills([]));
    getMajors().then(setMajorsOptions).catch(() => setMajorsOptions([]));
  }, []);

  useEffect(() => {
    if (isEditMode && job) {
      const hadLegacyDataThumbnail = (job.thumbnail_url ?? '').trim().startsWith('data:');
      reset({
        title: job.title,
        description: plainTextToTipTapHtml(job.description || ''),
        requirements: plainTextToTipTapHtml(job.requirements || ''),
        benefits: plainTextToTipTapHtml(job.benefits || ''),
        salary_type: (job.salary_type ?? 'RANGE') as JobFormData['salary_type'],
        salary_currency: (job.salary_currency ?? 'VND') as JobFormData['salary_currency'],
        salary_min: job.salary_type === 'RANGE' ? job.salary_min : undefined,
        salary_max: job.salary_type === 'RANGE' ? job.salary_max : undefined,
        location: job.location || '',
        job_type: (job.job_type?.toLowerCase() ?? 'full_time') as JobFormData['job_type'],
        yearsOfExperience: job.yearsOfExperience ?? '0',
        educationLevel: (job.educationLevel ?? 'BACHELOR') as JobFormData['educationLevel'],
        deadline: job.deadline ?? job.expired_at ?? defaultDeadline(),
        category_id: job.category_id != null ? Number(job.category_id) : undefined,
        jobSkills: job.jobSkills?.map((js) => ({
          skillId: Number(js.skill_id),
          isRequired: js.isRequired,
          level: js.level,
        })) ?? [],
        majorIds: job.majors?.map((m) => m.majorId) ?? [],
        status: job.status as 'open' | 'closed',
        thumbnail_url: sanitizeJobThumbnailUrl(job.thumbnail_url),
        applicationLanguage: (job.applicationLanguage as JobFormData['applicationLanguage']) ?? 'ANY',
        genderRequirement: (job.genderRequirement as JobFormData['genderRequirement']) ?? 'ANY',
        minAge: job.minAge != null ? String(job.minAge) : '',
        maxAge: job.maxAge != null ? String(job.maxAge) : '',
      });
      if (
        hadLegacyDataThumbnail &&
        id &&
        legacyDataThumbnailToastShown.current !== id
      ) {
        legacyDataThumbnailToastShown.current = id;
        toast.info('Thumbnail cũ (base64) đã bỏ. Vui lòng tải ảnh lên lại để dùng URL từ server.');
      }
    }
  }, [job, isEditMode, reset, id]);

  const educationLevel = watch('educationLevel');
  const majorIds = watch('majorIds') ?? [];

  useEffect(() => {
    const line = buildEducationMajorLine(educationLevel ?? 'BACHELOR', majorIds, majorsOptions);
    const lineHtml = `<p>${escapeHtml(line)}</p>`;
    const current = getValues('requirements') ?? '';
    const plain = htmlToPlainText(current);

    if (!plain.trim()) {
      setValue('requirements', lineHtml);
      return;
    }

    const firstParaMatch = current.match(/^<p[^>]*>[\s\S]*?<\/p>/);
    let firstLinePlain = '';
    let restAfterFirstPara = '';

    if (firstParaMatch) {
      firstLinePlain = htmlToPlainText(firstParaMatch[0]).split('\n')[0]?.trim() ?? '';
      restAfterFirstPara = current.slice(firstParaMatch.index! + firstParaMatch[0].length).trim();
    } else {
      const lines = plain.split('\n').map((l) => l.trim()).filter(Boolean);
      firstLinePlain = lines[0] ?? '';
      restAfterFirstPara = lines.slice(1).join('\n');
    }

    if (!EDU_MAJOR_TEMPLATE_RE.test(firstLinePlain)) {
      return;
    }

    if (restAfterFirstPara) {
      const restHtml = restAfterFirstPara.startsWith('<')
        ? restAfterFirstPara
        : plainTextToTipTapHtml(restAfterFirstPara);
      setValue('requirements', `${lineHtml}${restHtml}`);
    } else {
      setValue('requirements', lineHtml);
    }
  }, [educationLevel, majorIds, majorsOptions, setValue, getValues]);

  const onSubmit = async (data: JobFormData) => {
    try {
      const companyId = company?.id;
      if (!companyId) {
        console.error('No company found. Please create company first.');
        return;
      }

      const thumbnail_url = getValues('thumbnail_url');

      const minAge = data.minAge?.trim() ? parseInt(data.minAge, 10) : undefined;
      const maxAge = data.maxAge?.trim() ? parseInt(data.maxAge, 10) : undefined;

      const payload = {
        ...data,
        salary_type: data.salary_type,
        salary_currency: data.salary_currency,
        salary_min: typeof data.salary_min === 'number' && !Number.isNaN(data.salary_min) ? data.salary_min : undefined,
        salary_max: typeof data.salary_max === 'number' && !Number.isNaN(data.salary_max) ? data.salary_max : undefined,
        company_id: companyId,
        category_id: data.category_id ?? undefined,
        jobSkills: data.jobSkills ?? [],
        majorIds: data.majorIds ?? [],
        expired_at: data.deadline,
        deadline: data.deadline,
        thumbnail_url: thumbnail_url || undefined,
        applicationLanguage: data.applicationLanguage,
        genderRequirement: data.genderRequirement,
        minAge,
        maxAge,
      };

      if (isEditMode && id) {
        await updateJob.mutateAsync({ jobId: id, data: payload as unknown as Partial<Job> });
      } else {
        await createJob.mutateAsync(payload as unknown as Partial<Job>);
      }
      navigate('/employer/jobs');
    } catch (error) {
      console.error('Failed to save job:', error);
    }
  };

  const jobSkills = watch('jobSkills') ?? [];

  const addJobSkill = () => {
    const current = getValues('jobSkills') ?? [];
    const used = new Set(current.map((r) => r.skillId).filter((id) => id > 0));
    const nextSkill = skills.find((s) => !used.has(Number(s.skillId)));
    if (!nextSkill && skills.length > 0) {
      toast.warning('Đã thêm hết kỹ năng có trong danh sách');
      return;
    }
    setValue('jobSkills', [
      ...current,
      { skillId: nextSkill ? Number(nextSkill.skillId) : 0, isRequired: true, level: '' },
    ]);
    setSkillPickerOpenIndex(current.length);
    setSkillPickerSearch('');
  };

  const updateJobSkillField = (index: number, field: 'skillId' | 'isRequired' | 'level', value: unknown) => {
    const current = getValues('jobSkills') ?? [];
    const updated = [...current];
    updated[index] = { ...updated[index], [field]: value };
    setValue('jobSkills', updated);
  };

  const removeJobSkill = (index: number) => {
    const current = getValues('jobSkills') ?? [];
    const updated = current.filter((_, i) => i !== index);
    setValue('jobSkills', updated);
    if (skillPickerOpenIndex === index) {
      setSkillPickerOpenIndex(null);
      setSkillPickerSearch('');
    } else if (skillPickerOpenIndex !== null && skillPickerOpenIndex > index) {
      setSkillPickerOpenIndex(skillPickerOpenIndex - 1);
    }
  };

  if (jobLoading && isEditMode) {
    return (
      <DashboardLayout sidebar={<RecruiterSidebar />}>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isEditMode && !company) {
    return (
      <DashboardLayout sidebar={<RecruiterSidebar />}>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Vui lòng tạo thông tin công ty trước khi đăng tin tuyển dụng</p>
          <Link to="/employer/company">
            <Button>Tạo thông tin công ty</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<RecruiterSidebar />}>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Link to="/employer/jobs">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="min-w-0 text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
            {isEditMode ? 'Edit Job' : 'Create New Job'}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Information</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditMode && job?.note && (
              <div className="flex items-start gap-3 p-4 mb-6 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Tin này đã bị từ chối</p>
                  <p className="mb-1"><span className="font-medium">Lý do từ quản trị:</span> {job.note}</p>
                  <p className="text-red-700">Bạn có thể chỉnh sửa nội dung và gửi lại để được duyệt.</p>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Job Title <RequiredStar />
                </Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="e.g., Senior Software Engineer"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <RequiredStar />
                </Label>
                <TiptapEditor
                  value={watch('description') ?? ''}
                  onChange={(html) =>
                    setValue('description', html, { shouldValidate: true, shouldDirty: true })
                  }
                  placeholder="Describe the job role, responsibilities..."
                  minHeight="160px"
                  className={errors.description ? 'border-red-500 ring-2 ring-red-500/30' : ''}
                />
                {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">
                  Requirements <RequiredStar />
                </Label>
                <p className="text-xs text-gray-500">
                  Đoạn đầu (yêu cầu học vấn) tự động cập nhật theo Education Level và Majors bên dưới.
                </p>
                <TiptapEditor
                  value={watch('requirements') ?? ''}
                  onChange={(html) =>
                    setValue('requirements', html, { shouldValidate: true, shouldDirty: true })
                  }
                  placeholder="Required skills, qualifications, education..."
                  minHeight="140px"
                  className={errors.requirements ? 'border-red-500 ring-2 ring-red-500/30' : ''}
                />
                {errors.requirements && <p className="text-sm text-red-600">{errors.requirements.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits">
                  Benefits <RequiredStar />
                </Label>
                <TiptapEditor
                  value={watch('benefits') ?? ''}
                  onChange={(html) =>
                    setValue('benefits', html, { shouldValidate: true, shouldDirty: true })
                  }
                  placeholder="Benefits, perks..."
                  minHeight="120px"
                  className={errors.benefits ? 'border-red-500 ring-2 ring-red-500/30' : ''}
                />
                {errors.benefits && <p className="text-sm text-red-600">{errors.benefits.message}</p>}
              </div>

              <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
                <Label className="font-semibold">Mức lương <RequiredStar /></Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary_type">Loại lương</Label>
                    <Select
                      id="salary_type"
                      value={watch('salary_type') ?? 'RANGE'}
                      onChange={(e) => setValue('salary_type', e.target.value as JobFormData['salary_type'], { shouldValidate: true })}
                    >
                      {SALARY_TYPES.map((v) => (
                        <option key={v} value={v}>{SALARY_TYPE_LABELS[v]}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary_currency">Đơn vị tiền tệ</Label>
                    <Select
                      id="salary_currency"
                      value={watch('salary_currency') ?? 'VND'}
                      onChange={(e) => setValue('salary_currency', e.target.value as JobFormData['salary_currency'])}
                      disabled={watch('salary_type') !== 'RANGE'}
                    >
                      {SALARY_CURRENCIES.map((v) => (
                        <option key={v} value={v}>{SALARY_CURRENCY_LABELS[v]}</option>
                      ))}
                    </Select>
                  </div>
                </div>

                {watch('salary_type') === 'RANGE' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salary_min">Lương tối thiểu</Label>
                      <Input
                        id="salary_min"
                        type="number"
                        min={0}
                        {...register('salary_min', { valueAsNumber: true })}
                        placeholder={watch('salary_currency') === 'VND' ? 'VD: 5000000' : 'VD: 500'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary_max">Lương tối đa</Label>
                      <Input
                        id="salary_max"
                        type="number"
                        min={0}
                        {...register('salary_max', { valueAsNumber: true })}
                        placeholder={watch('salary_currency') === 'VND' ? 'VD: 10000000' : 'VD: 1000'}
                      />
                      {errors.salary_max && <p className="text-sm text-red-600">{errors.salary_max.message}</p>}
                    </div>
                  </div>
                )}

                {watch('salary_type') !== 'RANGE' && (
                  <p className="text-sm text-gray-500 italic">
                    {SALARY_TYPE_LABELS[watch('salary_type') ?? 'RANGE']} — không cần nhập mức lương cụ thể.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">
                    Location <RequiredStar />
                  </Label>
                  <Input
                    id="location"
                    {...register('location')}
                    placeholder="e.g., Remote, Ho Chi Minh"
                    className={errors.location ? 'border-red-500' : ''}
                  />
                  {errors.location && <p className="text-sm text-red-600">{errors.location.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job_type">
                    Job Type <RequiredStar />
                  </Label>
                  <Select
                    id="job_type"
                    value={watch('job_type')}
                    onChange={(e) => setValue('job_type', e.target.value as JobFormData['job_type'])}
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience">
                    Years of Experience <RequiredStar />
                  </Label>
                  <Select
                    id="yearsOfExperience"
                    value={watch('yearsOfExperience')}
                    onChange={(e) => setValue('yearsOfExperience', e.target.value)}
                  >
                    {YEARS_OPTIONS.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </Select>
                  {errors.yearsOfExperience && (
                    <p className="text-sm text-red-600">{errors.yearsOfExperience.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="educationLevel">
                    Education Level <RequiredStar />
                  </Label>
                  <Select
                    id="educationLevel"
                    value={watch('educationLevel')}
                    onChange={(e) => setValue('educationLevel', e.target.value as JobFormData['educationLevel'])}
                  >
                    {EDUCATION_LEVELS.map((v) => (
                      <option key={v} value={v}>{getEducationLevelLabel(v)}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="applicationLanguage">Ngôn ngữ nhận hồ sơ</Label>
                  <Select
                    id="applicationLanguage"
                    value={watch('applicationLanguage') ?? 'ANY'}
                    onChange={(e) =>
                      setValue('applicationLanguage', e.target.value as JobFormData['applicationLanguage'])
                    }
                  >
                    {APP_LANGS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genderRequirement">Giới tính</Label>
                  <Select
                    id="genderRequirement"
                    value={watch('genderRequirement') ?? 'ANY'}
                    onChange={(e) =>
                      setValue('genderRequirement', e.target.value as JobFormData['genderRequirement'])
                    }
                  >
                    {GENDERS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minAge">Tuổi tối thiểu (tuỳ chọn)</Label>
                  <Input
                    id="minAge"
                    type="number"
                    min={16}
                    max={99}
                    placeholder="VD: 22"
                    {...register('minAge')}
                    className={errors.minAge ? 'border-red-500' : ''}
                  />
                  {errors.minAge && <p className="text-sm text-red-600">{errors.minAge.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAge">Tuổi tối đa (tuỳ chọn)</Label>
                  <Input
                    id="maxAge"
                    type="number"
                    min={16}
                    max={99}
                    placeholder="VD: 45"
                    {...register('maxAge')}
                    className={errors.maxAge ? 'border-red-500' : ''}
                  />
                  {errors.maxAge && <p className="text-sm text-red-600">{errors.maxAge.message}</p>}
                </div>
              </div>

              <div className="space-y-3 border rounded-lg p-4" ref={skillPickerContainerRef}>
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">Required Skills</Label>
                  <Button type="button" size="sm" onClick={addJobSkill}>
                    + Add skill
                  </Button>
                </div>

                {jobSkills.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No skills added yet. Click &quot;Add skill&quot; to define required skills for this job.
                  </p>
                )}

                {jobSkills.map((item, index) => {
                  const usedElsewhere = new Set(
                    jobSkills
                      .map((row, i) => (i !== index ? row.skillId : 0))
                      .filter((id) => id > 0)
                  );
                  const skillOptions = skills.filter((s) => {
                    const sid = Number(s.skillId);
                    if (sid === item.skillId) return true;
                    return !usedElsewhere.has(sid);
                  });
                  const filteredSkillOptions = skillOptions.filter((s) =>
                    (s.name ?? '').toLowerCase().includes(skillPickerSearch.toLowerCase())
                  );
                  const selectedSkill = skills.find((s) => Number(s.skillId) === item.skillId);
                  return (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <div className="space-y-1 md:col-span-2 min-w-0">
                      <Label>Skill</Label>
                      <div className="relative">
                        <div
                          className="flex min-h-11 w-full flex-wrap items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent"
                          onClick={() => {
                            setSkillPickerOpenIndex(index);
                            if (skillPickerOpenIndex !== index) setSkillPickerSearch('');
                          }}
                        >
                          {selectedSkill && item.skillId > 0 ?
                            <Badge variant="outline" className="gap-1 pr-1 shrink-0">
                              {selectedSkill.name}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateJobSkillField(index, 'skillId', 0);
                                  setSkillPickerSearch('');
                                }}
                                className="rounded-full p-0.5 hover:bg-gray-200"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          : null}
                          <input
                            type="text"
                            placeholder="Gõ để tìm kỹ năng..."
                            value={skillPickerOpenIndex === index ? skillPickerSearch : ''}
                            onChange={(e) => {
                              setSkillPickerSearch(e.target.value);
                              setSkillPickerOpenIndex(index);
                            }}
                            onFocus={() => {
                              setSkillPickerOpenIndex(index);
                            }}
                            className="min-w-[120px] flex-1 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-gray-400"
                          />
                          <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
                        </div>
                        {skillPickerOpenIndex === index && (
                          <div className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                            {filteredSkillOptions.map((s) => {
                              const sid = Number(s.skillId);
                              const isActive = sid === item.skillId;
                              return (
                                <button
                                  key={s.skillId}
                                  type="button"
                                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                                    isActive ? 'bg-primary/10 font-medium' : ''
                                  }`}
                                  onClick={() => {
                                    updateJobSkillField(index, 'skillId', sid);
                                    setSkillPickerOpenIndex(null);
                                    setSkillPickerSearch('');
                                  }}
                                >
                                  {s.name}
                                </button>
                              );
                            })}
                            {filteredSkillOptions.length === 0 && (
                              <p className="px-3 py-4 text-center text-sm text-gray-500">
                                Không tìm thấy kỹ năng
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      {errors.jobSkills?.[index]?.skillId && (
                        <p className="text-sm text-red-600">{errors.jobSkills[index]?.skillId?.message}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-sm font-medium leading-none text-gray-700">Required</span>
                      <label className="flex h-11 cursor-pointer items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={item.isRequired ?? false}
                          onChange={(e) => updateJobSkillField(index, 'isRequired', e.target.checked)}
                          className="h-4 w-4 shrink-0 rounded border-gray-300 accent-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-700 select-none">
                          {item.isRequired ? 'Required' : 'Optional'}
                        </span>
                      </label>
                    </div>

                    <div className="space-y-1 md:col-span-1">
                      <Label>Level</Label>
                      <div className="flex gap-2 items-end">
                        <Input
                          className="min-w-0 flex-1"
                          placeholder="e.g., Junior, Senior, B2..."
                          value={item.level ?? ''}
                          onChange={(e) => updateJobSkillField(index, 'level', e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeJobSkill(index)}
                          aria-label="Xóa kỹ năng"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>

              <div className="space-y-3 border rounded-lg p-4" ref={majorDropdownRef}>
                <Label className="font-semibold">Majors</Label>
                <p className="text-xs text-gray-500">
                  Nhập để tìm và chọn ngành học phù hợp (có thể chọn nhiều).
                </p>
                <div className="relative">
                  <div
                    className="flex min-h-11 w-full flex-wrap items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent"
                    onClick={() => setMajorDropdownOpen(true)}
                  >
                    {(watch('majorIds') ?? []).map((id) => {
                      const m = majorsOptions.find((o) => o.majorId === id);
                      return m ? (
                        <Badge key={id} variant="outline" className="gap-1 pr-1">
                          {m.name}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const current = watch('majorIds') ?? [];
                              setValue('majorIds', current.filter((x) => x !== id));
                            }}
                            className="rounded-full p-0.5 hover:bg-gray-200"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                    <input
                      type="text"
                      placeholder="Gõ để tìm chuyên ngành..."
                      value={majorSearch}
                      onChange={(e) => setMajorSearch(e.target.value)}
                      onFocus={() => setMajorDropdownOpen(true)}
                      className="min-w-[180px] flex-1 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-gray-400"
                    />
                    <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
                  </div>
                  {majorDropdownOpen && (
                    <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                      {majorsOptions
                        .filter((m) =>
                          (m.name ?? '').toLowerCase().includes(majorSearch.toLowerCase())
                        )
                        .map((m) => {
                          const selected = (watch('majorIds') ?? []).includes(m.majorId ?? 0);
                          return (
                            <button
                              key={m.majorId}
                              type="button"
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                                selected ? 'bg-primary/10 font-medium' : ''
                              }`}
                              onClick={() => {
                                const current = watch('majorIds') ?? [];
                                if (selected) {
                                  setValue('majorIds', current.filter((id) => id !== (m.majorId ?? 0)));
                                } else {
                                  setValue('majorIds', [...current, m.majorId ?? 0]);
                                }
                              }}
                            >
                              {m.name}
                            </button>
                          );
                        })}
                      {majorsOptions.filter((m) =>
                        (m.name ?? '').toLowerCase().includes(majorSearch.toLowerCase())
                      ).length === 0 && (
                        <p className="px-3 py-4 text-center text-sm text-gray-500">
                          Không tìm thấy chuyên ngành
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">
                    Deadline <RequiredStar />
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    {...register('deadline')}
                    className={errors.deadline ? 'border-red-500' : ''}
                  />
                  {errors.deadline && <p className="text-sm text-red-600">{errors.deadline.message}</p>}
                </div>
                <div className="space-y-2" ref={categoryDropdownRef}>
                  <Label>Category</Label>
                  <p className="text-xs text-gray-500">
                    Nhập để tìm và chọn ngành nghề.
                  </p>
                  <div className="relative">
                    <div
                      className="flex min-h-11 w-full flex-wrap items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent"
                      onClick={() => setCategoryDropdownOpen(true)}
                    >
                      {(() => {
                        const cid = watch('category_id');
                        const cat = categories.find((c) => c.categoryId === cid);
                        return cat ? (
                          <Badge variant="outline" className="gap-1 pr-1">
                            {cat.categoryName}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setValue('category_id', undefined);
                              }}
                              className="rounded-full p-0.5 hover:bg-gray-200"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ) : null;
                      })()}
                      <input
                        type="text"
                        placeholder="Gõ để tìm ngành nghề..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        onFocus={() => setCategoryDropdownOpen(true)}
                        className="min-w-[150px] flex-1 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-gray-400"
                      />
                      <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
                    </div>
                    {categoryDropdownOpen && (
                      <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                        {categories
                          .filter((c) =>
                            (c.categoryName ?? '').toLowerCase().includes(categorySearch.toLowerCase())
                          )
                          .map((c) => {
                            const selected = watch('category_id') === c.categoryId;
                            return (
                              <button
                                key={c.categoryId}
                                type="button"
                                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                                  selected ? 'bg-primary/10 font-medium' : ''
                                }`}
                                onClick={() => {
                                  setValue('category_id', selected ? undefined : c.categoryId);
                                  setCategoryDropdownOpen(false);
                                  setCategorySearch('');
                                }}
                              >
                                {c.categoryName}
                              </button>
                            );
                          })}
                        {categories.filter((c) =>
                          (c.categoryName ?? '').toLowerCase().includes(categorySearch.toLowerCase())
                        ).length === 0 && (
                          <p className="px-3 py-4 text-center text-sm text-gray-500">
                            Không tìm thấy ngành nghề
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {isEditMode && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      id="status"
                      value={watch('status')}
                      onChange={(e) => setValue('status', e.target.value as 'open' | 'closed')}
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </Select>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <ImageUploadSingle
                  id="thumbnail"
                  label="Job Thumbnail"
                  value={watch('thumbnail_url')}
                  onChange={(v) => setValue('thumbnail_url', v, { shouldValidate: true })}
                  onClear={() => setValue('thumbnail_url', '', { shouldValidate: true })}
                />
                {errors.thumbnail_url && (
                  <p className="text-sm text-red-600">{errors.thumbnail_url.message}</p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || createJob.isPending || updateJob.isPending}
                  className="flex-1"
                >
                  {isSubmitting || createJob.isPending || updateJob.isPending ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </span>
                  ) : (
                    isEditMode ? 'Update Job' : 'Create Job'
                  )}
                </Button>
                <Link to="/employer/jobs">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
