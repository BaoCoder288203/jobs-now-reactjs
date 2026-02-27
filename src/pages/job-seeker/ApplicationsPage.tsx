import { useAppSelector } from '@/app/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMyApplications } from '@/modules/applications/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Application } from '@/types';

export function JobSeekerApplicationsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.userId ? String(user.userId) : '';
  const profileId = user?.profileId ?? undefined;

  const { data: applicationsData, isLoading } = useMyApplications(profileId, userId);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pending', className: 'bg-gray-100 text-gray-700' },
      approved: { label: 'Approved', className: 'bg-accent-light text-gray-900' },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
      reviewing: { label: 'Reviewing', className: 'bg-primary-light text-gray-900' }
    };

    const statusInfo = statusMap[status.toLowerCase()] || statusMap.pending;

    return (
      <Badge className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  };

  const applications = applicationsData || [];

  const content = (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600 mt-1">
          Track your job applications and their status
        </p>
      </div>

      {applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((application: Application) => (
            <Card key={application.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <Link
                        to={`/jobs/${application.job_id}`}
                        className="text-xl font-semibold text-gray-900 hover:text-primary transition-colors"
                      >
                        {application.job?.title}
                      </Link>
                    </div>

                    <p className="text-gray-600 mb-3">
                      {application.job?.company?.name}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                      {application.job?.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {application.job.location}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Applied on {new Date(application.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {application.cover_letter && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-1">Cover Letter:</p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {application.cover_letter}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="ml-6 flex flex-col items-end gap-3">
                    {getStatusBadge(application.status)}
                    <Link to={`/jobs/${application.job_id}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        View Job
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">You haven't applied to any jobs yet</p>
            <Link to="/jobs">
              <Button>Browse Jobs</Button>
            </Link>
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

