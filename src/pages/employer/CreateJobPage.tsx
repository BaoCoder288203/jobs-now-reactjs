import { useEffect, useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useJobDetail, useCreateJob, useUpdateJob } from '@/modules/jobs/hooks';
import { useMyCompany } from '@/modules/companies/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getJobCategories } from '@/services/category.service';
import type { JobCategoryDTO } from '@/services/category.service';
import { getAllSkills } from '@/services/skill.service';
import { getMajors } from '@/services/major.service';
import type { MajorDTO } from '@/services/major.service';
import type { Job, Skill } from '@/types';
import { ImageUploadSingle } from '@/components/ui/image-upload';
import { getEducationLevelLabel } from '@/constants/jobEnums';

const EDUCATION_LEVELS = ['ANY', 'HIGH_SCHOOL', 'VOCATIONAL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'DOCTORATE', 'OTHER'] as const;
const JOB_TYPES = ['full_time', 'part_time', 'contract', 'internship', 'freelance'] as const;
const YEARS_OPTIONS = ['0', '1', '2', '3', '1-3', '3-5', '5+'] as const;

const jobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  requirements: z.string().min(1, 'Requirements are required'),
  benefits: z.string().min(1, 'Benefits are required'),
  salary_min: z.number().min(0).optional(),
  salary_max: z.number().min(0).optional(),
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
});

type JobFormData = z.infer<typeof jobSchema>;

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
      job_type: 'full_time',
      status: 'closed',
      educationLevel: 'BACHELOR',
      yearsOfExperience: '0',
      deadline: defaultDeadline(),
      jobSkills: [],
      majorIds: [],
      thumbnail_url: '',
    },
  });

  useEffect(() => {
    getJobCategories().then(setCategories).catch(() => setCategories([]));
    getAllSkills().then(setSkills).catch(() => setSkills([]));
    getMajors().then(setMajorsOptions).catch(() => setMajorsOptions([]));
  }, []);

  useEffect(() => {
    if (isEditMode && job) {
      reset({
        title: job.title,
        description: job.description || '',
        requirements: job.requirements || '',
        benefits: job.benefits || '',
        salary_min: job.salary_min,
        salary_max: job.salary_max,
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
        thumbnail_url: job.thumbnail_url || '',
      });
    }
  }, [job, isEditMode, reset]);

  const onSubmit = async (data: JobFormData) => {
    try {
      const companyId = company?.id;
      if (!companyId) {
        console.error('No company found. Please create company first.');
        return;
      }

      const thumbnail_url = getValues('thumbnail_url');

      const payload = {
        ...data,
        company_id: companyId,
        category_id: data.category_id ?? undefined,
        jobSkills: data.jobSkills ?? [],
        majorIds: data.majorIds ?? [],
        expired_at: data.deadline,
        deadline: data.deadline,
        thumbnail_url: thumbnail_url || undefined,
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
    const firstSkillId = skills[0]?.skillId ? Number(skills[0].skillId) : 0;
    setValue('jobSkills', [...current, { skillId: firstSkillId, isRequired: true, level: '' }]);
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
          <h1 className="text-3xl font-bold text-gray-900">
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
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="e.g., Senior Software Engineer"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  rows={6}
                  placeholder="Describe the job role, responsibilities..."
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements *</Label>
                <Textarea
                  id="requirements"
                  {...register('requirements')}
                  rows={4}
                  placeholder="Required skills, qualifications, education..."
                  className={errors.requirements ? 'border-red-500' : ''}
                />
                {errors.requirements && <p className="text-sm text-red-600">{errors.requirements.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits">Benefits *</Label>
                <Textarea
                  id="benefits"
                  {...register('benefits')}
                  rows={3}
                  placeholder="Benefits, perks..."
                  className={errors.benefits ? 'border-red-500' : ''}
                />
                {errors.benefits && <p className="text-sm text-red-600">{errors.benefits.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary_min">Minimum Salary</Label>
                  <Input
                    id="salary_min"
                    type="number"
                    {...register('salary_min', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary_max">Maximum Salary</Label>
                  <Input
                    id="salary_max"
                    type="number"
                    {...register('salary_max', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    {...register('location')}
                    placeholder="e.g., Remote, Ho Chi Minh"
                    className={errors.location ? 'border-red-500' : ''}
                  />
                  {errors.location && <p className="text-sm text-red-600">{errors.location.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job_type">Job Type *</Label>
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
                  <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
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
                  <Label htmlFor="educationLevel">Education Level *</Label>
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

              <div className="space-y-3 border rounded-lg p-4">
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

                {jobSkills.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <div className="space-y-1">
                      <Label>Skill</Label>
                      <Select
                        value={String(item.skillId ?? '')}
                        onChange={(e) => updateJobSkillField(index, 'skillId', Number(e.target.value))}
                      >
                        <option value="">-- Select skill --</option>
                        {skills.map((s) => (
                          <option key={s.skillId} value={s.skillId}>
                            {s.name}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label>Required</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.isRequired ?? false}
                          onChange={(e) => updateJobSkillField(index, 'isRequired', e.target.checked)}
                        />
                        <span className="text-sm text-gray-700">
                          {item.isRequired ? 'Required' : 'Optional'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label>Level</Label>
                      <Input
                        placeholder="e.g., Junior, Senior, B2..."
                        value={item.level ?? ''}
                        onChange={(e) => updateJobSkillField(index, 'level', e.target.value)}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeJobSkill(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border rounded-lg p-4">
                <Label className="font-semibold">Majors</Label>
                <p className="text-xs text-gray-500">
                  Chọn ngành học phù hợp với yêu cầu học vấn ở trên (có thể chọn nhiều).
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {majorsOptions.map((m) => {
                    const selected = (watch('majorIds') ?? []).includes(m.majorId ?? 0);
                    return (
                      <label key={m.majorId} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(e) => {
                            const current = watch('majorIds') ?? [];
                            if (e.target.checked) {
                              if (!current.includes(m.majorId ?? 0)) {
                                setValue('majorIds', [...current, m.majorId ?? 0]);
                              }
                            } else {
                              setValue(
                                'majorIds',
                                current.filter((id) => id !== (m.majorId ?? 0)),
                              );
                            }
                          }}
                        />
                        <span>{m.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    {...register('deadline')}
                    className={errors.deadline ? 'border-red-500' : ''}
                  />
                  {errors.deadline && <p className="text-sm text-red-600">{errors.deadline.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category_id">Category</Label>
                  <Select
                    id="category_id"
                    value={watch('category_id') ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setValue('category_id', v === '' ? undefined : Number(v));
                    }}
                  >
                    <option value="">-- Select category --</option>
                    {categories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                    ))}
                  </Select>
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

              <ImageUploadSingle
                id="thumbnail"
                label="Job Thumbnail"
                value={watch('thumbnail_url')}
                onChange={(v) => setValue('thumbnail_url', v)}
                onClear={() => setValue('thumbnail_url', '')}
              />

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
