import { Link } from 'react-router-dom';
import type { Job } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, DollarSign, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: Job;
  className?: string;
}

export function JobCard({ job, className }: JobCardProps) {
  const formatSalary = () => {
    if (!job.salary_min || !job.salary_max) return 'Mức lương không tiết lộ';
    return `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} VNĐ`;
  };

  const formatJobType = (type?: string) => {
    if (!type) return '';
    return type.replace('_', '-').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Link to={`/jobs/${job.id}`}>
      <Card className={cn("hover:shadow-lg transition-all duration-200 cursor-pointer h-full", className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {job.company?.logo_url && (
                <img
                  src={job.company.logo_url}
                  alt={job.company.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {job.title}
                </h3>
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="h-4 w-4 mr-1" />
                  {job.company?.name}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {job.job_type && (
              <Badge variant="outline">{formatJobType(job.job_type)}</Badge>
            )}
            {job.location && (
              <Badge variant="outline">{job.location}</Badge>
            )}
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            {job.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {job.location}
              </div>
            )}
            {(job.salary_min || job.salary_max) && (
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                {formatSalary()}
              </div>
            )}
            {job.created_at && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Đăng ngày {new Date(job.created_at).toLocaleDateString('vi-VN')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

