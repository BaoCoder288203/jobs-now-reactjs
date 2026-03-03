import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useJobs, useDeleteJob } from '@/modules/jobs/hooks';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Briefcase, Search, Edit2, Trash2, Building2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getJobTypeLabel } from '@/constants/jobEnums';

export function AdminJobsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { data: jobsData, isLoading } = useJobs({ limit: 100 });
  const deleteJob = useDeleteJob();

  const jobs = jobsData?.items || [];
  
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      await deleteJob.mutateAsync(jobId);
    } catch (error) {
      alert('Failed to delete job');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />}>
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
            <p className="text-gray-600 mt-1">
              Manage all job postings in the platform
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        {job.title}
                      </h3>
                      <Badge variant="primary">
                        {job.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {job.company?.name}
                      </div>
                      {job.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </div>
                      )}
                      {job.job_type && (
                        <Badge variant="outline">{getJobTypeLabel(job.job_type)}</Badge>
                      )}
                    </div>

                    {job.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {job.description}
                      </p>
                    )}

                    <p className="text-xs text-gray-500">
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="ml-6 flex gap-2">
                    <Link to={`/admin/jobs/${job.id}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(job.id)}
                      disabled={deleteJob.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">No jobs found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

