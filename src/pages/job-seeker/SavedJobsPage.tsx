import { useAppSelector } from '@/app/hooks';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { JobSeekerSidebar } from '@/components/layout/JobSeekerSidebar';
import { JobCard } from '@/components/common/JobCard';
import { useSavedJobs, useUnsaveJob } from '@/modules/savedJobs/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Bookmark, BookmarkX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function JobSeekerSavedJobsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.id || '';

  const { data: savedJobs = [], isLoading } = useSavedJobs(userId);
  const unsaveJob = useUnsaveJob();

  const handleUnsave = async (jobId: string) => {
    try {
      await unsaveJob.mutateAsync({ userId, jobId });
    } catch (error) {
      console.error('Failed to unsave job:', error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout sidebar={<JobSeekerSidebar />}>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<JobSeekerSidebar />}>
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
              if (!savedJob.job) return null;

              return (
                <div key={savedJob.id} className="relative">
                  <JobCard job={savedJob.job} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnsave(savedJob.job_id)}
                    disabled={unsaveJob.isPending}
                    className="absolute top-2 right-2 gap-2"
                  >
                    <BookmarkX className="h-4 w-4" />
                    Unsave
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
    </DashboardLayout>
  );
}

