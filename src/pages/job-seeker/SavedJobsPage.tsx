import { useAppSelector } from '@/app/hooks';
import { JobCard } from '@/components/common/JobCard';
import { useSavedJobs, useUnsaveJob } from '@/modules/savedJobs/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Bookmark, BookmarkX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function JobSeekerSavedJobsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const profileId = user?.profileId ? String(user.profileId) : '';

  const { data: savedJobs = [], isLoading } = useSavedJobs(profileId);
  const unsaveJob = useUnsaveJob();

  const handleUnsave = async (jobId: string) => {
    try {
      await unsaveJob.mutateAsync({ profileId, jobId });
    } catch (error) {
      console.error('Failed to unsave job:', error);
    }
  };

  const content = (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Saved Jobs</h1>
        <p className="text-gray-600 mt-1">
          Jobs you've bookmarked for later
        </p>
      </div>

      {savedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((savedJob) => {
            const jobData: any = {
              id: String(savedJob.jobId),
              title: savedJob.jobTitle,
              location: savedJob.location,
              salary_min: savedJob.salaryMin,
              salary_max: savedJob.salaryMax,
              salary_type: savedJob.salaryType,
              salary_currency: savedJob.salaryCurrency,
              job_type: savedJob.jobType,
              company: {
                name: savedJob.companyName,
                logo_url: savedJob.companyLogo
              }
            };

            return (
              <div key={savedJob.savedJobId} className="relative">
                <JobCard job={jobData} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleUnsave(String(savedJob.jobId));
                  }}
                  disabled={unsaveJob.isPending}
                  className="absolute top-2 right-2 gap-2 bg-white/80 hover:bg-white z-10"
                >
                  <BookmarkX className="h-4 w-4" />
                  Bỏ lưu
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bookmark className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No saved jobs yet</p>
            <p className="text-sm text-gray-500 mb-4">
              Save jobs you're interested in to apply later
            </p>
            <Button asChild>
              <a href="/jobs">Browse Jobs</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return <div className="p-6">{content}</div>;
}

