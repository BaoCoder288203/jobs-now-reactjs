import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const jobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  requirements: z.string().optional(),
  salary_min: z.number().min(0).optional(),
  salary_max: z.number().min(0).optional(),
  location: z.string().min(1, 'Location is required'),
  job_type: z.enum(['full_time', 'part_time', 'contract', 'internship']),
  experience_level: z.enum(['entry', 'mid', 'senior', 'executive']).optional(),
  industry_id: z.string().optional(),
  category_id: z.string().optional(),
  status: z.enum(['open', 'closed']),
  thumbnail_url: z.string().optional()
});

type JobFormData = z.infer<typeof jobSchema>;

export function CreateJobPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: company } = useMyCompany();
  const isEditMode = !!id;

  const { data: job, isLoading: jobLoading } = useJobDetail(id || '', { enabled: isEditMode });
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      job_type: 'full_time',
      status: 'open'
    }
  });

  useEffect(() => {
    if (isEditMode && job) {
      reset({
        title: job.title,
        description: job.description || '',
        requirements: job.requirements || '',
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        location: job.location || '',
        job_type: job.job_type as any,
        experience_level: job.experience_level as any,
        industry_id: job.industry_id || '',
        category_id: job.category_id || '',
        status: job.status as any,
        thumbnail_url: job.thumbnail_url || ''
      });
      setThumbnailPreview(job.thumbnail_url || '');
    } else {
      setThumbnailPreview('');
    }
  }, [job, isEditMode, reset]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setValue('thumbnail_url', reader.result);
          setThumbnailPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const onSubmit = async (data: JobFormData) => {
    try {
      const companyId = company?.id;
      if (!companyId) {
        console.error('No company found. Please create company first.');
        return;
      }

      if (isEditMode && id) {
        await updateJob.mutateAsync({
          jobId: id,
          data: {
            ...data,
            company_id: companyId
          }
        });
      } else {
        await createJob.mutateAsync({
          ...data,
          company_id: companyId
        });
      }
      
      navigate('/employer/jobs');
    } catch (error) {
      console.error('Failed to save job:', error);
    }
  };

  if (jobLoading) {
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="e.g., Senior Software Engineer"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  rows={6}
                  placeholder="Describe the job role, responsibilities, and what you're looking for..."
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  {...register('requirements')}
                  rows={4}
                  placeholder="Required skills, qualifications, education..."
                  className={errors.requirements ? 'border-red-500' : ''}
                />
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
                    placeholder="e.g., Remote, New York, NY"
                    className={errors.location ? 'border-red-500' : ''}
                  />
                  {errors.location && (
                    <p className="text-sm text-red-600">{errors.location.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job_type">Job Type *</Label>
                  <Select
                    id="job_type"
                    {...register('job_type')}
                    value={watch('job_type')}
                    onChange={(e) => setValue('job_type', e.target.value as any)}
                    className={errors.job_type ? 'border-red-500' : ''}
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </Select>
                  {errors.job_type && (
                    <p className="text-sm text-red-600">{errors.job_type.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience_level">Experience Level</Label>
                  <Select
                    id="experience_level"
                    {...register('experience_level')}
                    value={watch('experience_level') || ''}
                    onChange={(e) => setValue('experience_level', e.target.value as any)}
                  >
                    <option value="">Select level</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="executive">Executive</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    id="status"
                    {...register('status')}
                    value={watch('status')}
                    onChange={(e) => setValue('status', e.target.value as any)}
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Job Thumbnail</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                />
                {thumbnailPreview && (
                  <div className="mt-2">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="h-24 w-40 rounded-lg border border-gray-200 object-cover"
                    />
                  </div>
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

