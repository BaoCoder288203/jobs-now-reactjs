import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RecruiterSidebar } from '@/components/layout/RecruiterSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useApplicationDetail, useUpdateApplicationStatus } from '@/modules/applications/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeft, Calendar, Download, Mail, Phone, MapPin } from 'lucide-react';

export function EmployerApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  // const { user } = useAppSelector((state) => state.auth);
  
  const { data: application, isLoading } = useApplicationDetail(id || '');
  const updateStatus = useUpdateApplicationStatus();

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    try {
      await updateStatus.mutateAsync({
        applicationId: id,
        status: newStatus
      });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout sidebar={<RecruiterSidebar />}>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!application) {
    return (
      <DashboardLayout sidebar={<RecruiterSidebar />}>
        <div className="text-center py-12">
          <p className="text-gray-600">Application not found</p>
          <Link to="/employer/applications">
            <Button variant="outline" className="mt-4">
              Back to Applications
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<RecruiterSidebar />}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/employer/applications">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Application Details</h1>
            <p className="text-gray-600 mt-1">
              Review application for {application.job?.title}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Information */}
            <Card>
              <CardHeader>
                <CardTitle>Job Information</CardTitle>
              </CardHeader>
              <CardContent>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {application.job?.title}
                </h2>
                      <p className="text-gray-600 mb-4">
                        {application.job?.company?.name}
                      </p>
                {application.job?.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {application.job.location}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Candidate Information */}
            <Card>
              <CardHeader>
                <CardTitle>Candidate Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {application.user?.fullName}
                  </h3>
                  {application.user?.email && (
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Mail className="h-4 w-4" />
                      {application.user.email}
                    </div>
                  )}
                  {application.user?.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      {application.user.phone}
                    </div>
                  )}
                </div>

                {application.resume && (
                  <div className="pt-4 border-t border-gray-200">
                    <a
                      href={application.resume.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      <Download className="h-4 w-4" />
                      Download Resume: {application.resume.file_name}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cover Letter */}
            {application.cover_letter && (
              <Card>
                <CardHeader>
                  <CardTitle>Cover Letter</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {application.cover_letter}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Current Status
                  </label>
                  <Select
                    value={application.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updateStatus.isPending}
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </Select>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4" />
                      <span>Applied on</span>
                    </div>
                    <p className="font-medium text-gray-900">
                      {new Date(application.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to={`/jobs/${application.job_id}`}>
                  <Button variant="outline" className="w-full">
                    View Job Posting
                  </Button>
                </Link>
                {application.user?.email && (
                  <a href={`mailto:${application.user.email}`}>
                    <Button variant="outline" className="w-full">
                      Send Email
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

